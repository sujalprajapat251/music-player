import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import * as Tone from 'tone';
import Soundfont from 'soundfont-player';
import { PitchDetector } from 'pitchy';
import { Rnd } from 'react-rnd';
import 'react-resizable/css/styles.css';
import * as d3 from 'd3';
import { useDispatch, useSelector } from 'react-redux';
import { selectGridSettings } from '../Redux/Slice/grid.slice';
import { setPlaying, setCurrentTime as setStudioCurrentTime, setPianoNotes, setPianoRecordingClip, setRecordingAudio } from '../Redux/Slice/studio.slice';
import { getGridDivisions, parseTimeSignature, getGridSpacingWithTimeSignature } from '../Utils/gridUtils';
import { getAudioContext, ensureAudioUnlocked } from '../Utils/audioContext';
import { drumMachineTypes, createSynthSound } from '../Utils/drumMachineUtils';
import { FaPaste, FaRegCopy } from 'react-icons/fa';
import { MdDelete } from "react-icons/md";
import { IoCutOutline } from 'react-icons/io5';
import audio from '../Images/piano-beats.mp3'
const generatePianoKeys = () => {
    const keys = [];
    const notesInOctave = ['A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#'];
    let octave = 0;

    for (let i = 0; i < 88; i++) {
        const note = notesInOctave[i % 12];
        keys.push(`${note}${octave}`);
        if (note === 'G#') octave++;
    }

    return keys.reverse(); // Higher notes on top
};

const NOTES = generatePianoKeys();
const GRID_UNIT = 15; // pixels per beat

const getXForTime = (time, duration, width) => {
    // Returns the X position for a given time, matching the timeline's xScale
    return (time / duration) * width;
};

const PianoRolls = () => {
    const dispatch = useDispatch();
    const svgRef = useRef();
    const wrapperRef = useRef();
    const timelineHeaderRef = useRef();
    const timelineContainerRef = useRef();
    
    // Get zoom level from Redux to match Timeline.jsx
    const { zoomLevel } = useSelector(selectGridSettings);
    
    // Use the exact same calculation as Timeline.jsx
    const baseTimelineWidthPerSecond = 100; // Base width per second (same as Timeline.jsx)
    const timelineWidthPerSecond = baseTimelineWidthPerSecond * zoomLevel; // Apply zoom level
    
    // Sync time and play state with Redux studio slice
    const studioIsPlaying = useSelector((state) => state.studio?.isPlaying || false);
    const studioCurrentTime = useSelector((state) => state.studio?.currentTime || 0);
    const studioBpm = useSelector((state) => state.studio?.bpm ?? 120);
    const [scrollLeft, setScrollLeft] = useState(0); // Horizontal scroll position
    const [isManualScrolling, setIsManualScrolling] = useState(false); // Track manual scrolling

    const pianoRecording = useSelector((state) => state.studio.pianoRecord);
    const pianoNotes = useSelector((state) => state.studio.pianoNotes || []);
    const pianoRecordingClip = useSelector((state) => state.studio.pianoRecordingClip);
    // console.log('pianoRecording ::: > ', pianoRecording)

    const baseWidth = 1000;  // Increased base width for more content
    const height = 600;
    const rowHeight = 30;
    // Match Timeline.jsx: use Redux audioDuration so ruler length stays in sync
    const audioDuration = useSelector((state) => state.studio?.audioDuration || 150);
    const PIANO_KEYS_WIDTH = 96;

    // get data from redux
    const track = useSelector((state)=>state.studio.tracks)
    const tracks = useSelector((state)=>state.studio.tracks || [])
    const currentTrackId = useSelector((state)=>state.studio.currentTrackId)
    const selectedTrack = useMemo(()=>tracks.find(t=>t.id===currentTrackId),[tracks,currentTrackId])
    // console.log('track',audio);
    // Get grid settings from Redux
    const { selectedGrid, selectedTime, selectedRuler } = useSelector(selectGridSettings);

    // piano key handling start
    const [notes, setNotes] = useState([]);
    const [startTime, setStartTime] = useState(null);
    const [activeNotes, setActiveNotes] = useState({});
    const [selectedNoteIndex, setSelectedNoteIndex] = useState(null);
    const [clipboardNote, setClipboardNote] = useState(null);

    // Get track bounds for constraining notes
    const getTrackBounds = useCallback(() => {
        const activeClip = (pianoRecordingClip && (pianoRecordingClip.trackId ?? null) === (currentTrackId ?? null)) ? pianoRecordingClip : null;
        if (activeClip && activeClip.start != null && activeClip.end != null) {
            return {
                start: activeClip.start,
                end: activeClip.end
            };
        }
        // Fallback: derive from notes if no active clip
        if (notes.length > 0) {
            const minStart = Math.min(...notes.map(n => n.start));
            const maxEnd = Math.max(...notes.map(n => n.start + n.duration)) + 0.1;
            return {
                start: minStart,
                end: maxEnd
            };
        }
        // Default bounds if no notes
        return {
            start: 0,
            end: 8 // Default 8 seconds
        };
    }, [pianoRecordingClip, currentTrackId, notes]);

    const renderRuler = useCallback(() => {
        if (!timelineHeaderRef.current) return;
    
        const svg = d3.select(timelineHeaderRef.current);
        
        // Use the exact same width calculation as Timeline.jsx
        const width = Math.max(audioDuration, 12) * timelineWidthPerSecond;
        const axisY = 80; // Center of the header
        const duration = audioDuration;
        // console.log("scale", scale, minWidth, width)
        svg.selectAll("*").remove();
    
        if (width <= 0 || duration <= 0) return;
    
        // Use shared X position function
        const xForTime = d3.scaleLinear().domain([0, duration]).range([0, width]);
        
        // Use the exact same grid spacing calculation as Timeline.jsx
        const gridSpacing = getGridSpacingWithTimeSignature(selectedGrid, selectedTime);
        const gridColor = "#FFFFFF";

        let labelInterval;
        if (selectedRuler === "Beats") {
            // For beats ruler, show labels every bar
            const { beats } = parseTimeSignature(selectedTime);
            const secondsPerBeat = 0.5; // Fixed at 120 BPM equivalent
            labelInterval = beats * secondsPerBeat;
        } else {
            // For time ruler, show labels every second
            labelInterval = 1;
        }
    
        // Draw the main ruler line (offset by piano keys width)
        svg
            .append("line")
            .attr("x1", PIANO_KEYS_WIDTH)
            .attr("y1", axisY)
            .attr("x2", width + PIANO_KEYS_WIDTH)
            .attr("y2", axisY)
            .attr("stroke", gridColor)
            .attr("stroke-width", 1);
        const addedLabels = new Set();
        // Draw tick marks and labels (offset by piano keys width)
        for (let time = 0; time <= duration; time += gridSpacing) {
            const x = xForTime(time) + PIANO_KEYS_WIDTH;
      
            // Determine tick importance based on time signature
            const secondsPerBeat = 0.5; // Fixed at 120 BPM equivalent
            const { beats } = parseTimeSignature(selectedTime);
            const secondsPerBar = secondsPerBeat * beats;
      
            const isMainBeat = Math.abs(time % secondsPerBeat) < 0.01;
            const isBarStart = Math.abs(time % secondsPerBar) < 0.01;
            const isHalfBeat = Math.abs(time % (secondsPerBeat / 2)) < 0.01;
            const isQuarterBeat = Math.abs(time % (secondsPerBeat / 4)) < 0.01;
      
            // Improved label logic to prevent duplicates
            let isLabeled = false;
            if (selectedRuler === "Beats") {
              isLabeled = isBarStart;
            } else {
              // For time ruler, only show labels at whole seconds
              const roundedTime = Math.round(time);
              isLabeled = Math.abs(time - roundedTime) < 0.01 && roundedTime % Math.max(1, Math.round(labelInterval)) === 0;
            }
      
            let tickHeight = 4;
            let strokeWidth = 0.5;
            let opacity = 0.6;
      
            if (isBarStart) {
              tickHeight = 20;
              strokeWidth = 1.5;
              opacity = 1;
            } else if (isMainBeat) {
              tickHeight = 16;
              strokeWidth = 1.2;
              opacity = 0.9;
            } else if (isHalfBeat) {
              tickHeight = 12;
              strokeWidth = 1;
              opacity = 0.7;
            } else if (isQuarterBeat) {
              tickHeight = 8;
              strokeWidth = 0.8;
              opacity = 0.6;
            }
      
            svg
              .append("line")
              .attr("x1", x)
              .attr("y1", axisY)
              .attr("x2", x)
              .attr("y2", axisY - tickHeight)
              .attr("stroke", gridColor)
              .attr("stroke-width", strokeWidth)
              .attr("opacity", opacity);
      
            if (isLabeled) {
              let label;
              if (selectedRuler === "Beats") {
                // Show musical notation (bars:beats)
                const barNumber = Math.floor(time / secondsPerBar) + 1;
                label = `${barNumber}`;
              } else {
                // Show time notation (minutes:seconds)
                const minutes = Math.floor(time / 60);
                const seconds = Math.floor(time % 60);
                label = `${minutes}:${seconds.toString().padStart(2, "0")}`;
              }
      
              // Only add label if it hasn't been added before
              if (!addedLabels.has(label)) {
                // Add clickable area for the grid number
                const textElement = svg
                  .append("text")
                  .attr("x", x + 4)
                  .attr("y", axisY - tickHeight - 5)
                  .attr("fill", "white")
                  .attr("font-size", 12)
                  .attr("text-anchor", "start")
                  .attr("cursor", "pointer")
                  .attr("class", "grid-number-label")
                  .text(label);
                
                // Add click event to the text element
                textElement.on("click", function() {
                  // Calculate the time position for this label
                  const labelTime = time;
                  
                  // Move playhead to this position
                  dispatch(setStudioCurrentTime(labelTime));
                  try { Tone.Transport.seconds = labelTime; } catch {}
                  setLocalPlayheadTime(labelTime);
                });
                
                addedLabels.add(label);
              }
            }
          }
    }, [audioDuration, selectedGrid, selectedTime, selectedRuler, timelineWidthPerSecond]);

    useEffect(() => {
        renderRuler();
        // Ensure header starts aligned with grid on mount/update
        const startLeft = wrapperRef.current?.scrollLeft || 0;
        if (timelineContainerRef.current) timelineContainerRef.current.scrollLeft = startLeft;
    }, [renderRuler, audioDuration, selectedGrid, timelineWidthPerSecond]);

    const drawGrid = useCallback(() => {
        const svg = d3.select(svgRef.current);
        const group = svg.select('g');
        group.selectAll('*').remove();

        const width = Math.max(audioDuration, 12) * timelineWidthPerSecond;
        const height = NOTES.length * 30;

        svg.attr('width', width).attr('height', height);

        // Get grid divisions from Redux to match timeline
        const gridSpacing = getGridSpacingWithTimeSignature(selectedGrid, selectedTime);
        const duration = audioDuration;
        
        // Use shared X position function
        const xForTime = (t) => getXForTime(t, duration, width);

        // Vertical lines - aligned with timeline tick marks
        for (let time = 0; time <= duration; time += gridSpacing) {
            const x = xForTime(time);
            
            // Use the exact same beat detection logic as Timeline.jsx
            const secondsPerBeat = 0.5; // Fixed at 120 BPM equivalent
            const { beats } = parseTimeSignature(selectedTime);
            const secondsPerBar = secondsPerBeat * beats;
            
            const timeInBar = time % secondsPerBar;
            const timeInBeat = time % secondsPerBeat;
            
            const tolerance = gridSpacing * 0.001; // Same tolerance as Timeline.jsx
            const isBarStart = timeInBar < tolerance;
            const isMainBeat = !isBarStart && timeInBeat < tolerance;
            const isSubdivision = !isBarStart && !isMainBeat;

            let strokeColor = '#ffffff15';
            let strokeWidth = 1;

            if (isBarStart) {
                strokeColor = '#ffffff44';
                strokeWidth = 1.5;
            } else if (isMainBeat) {
                strokeColor = '#ffffff30';
                strokeWidth = 1.2;
            } else if (isSubdivision) {
                strokeColor = '#ffffff20';
                strokeWidth = 1;
            }

            group.append('line')
                .attr('x1', x)
                .attr('y1', 0)
                .attr('x2', x)
                .attr('y2', height)
                .attr('stroke', strokeColor)
                .attr('stroke-width', strokeWidth);
        }

        // Horizontal lines for piano keys
        for (let y = 0; y <= height; y += rowHeight) {
            group.append('line')
                .attr('x1', 0)
                .attr('y1', y)
                .attr('x2', width)
                .attr('y2', y)
                .attr('stroke', '#ffffff10')
                .attr('stroke-width', 1);
        }

        // Time labels at bottom - only for main beats
        for (let time = 0; time <= duration; time += 1) {
            const x = xForTime(time);
            const isMainBeat = Math.abs(time - Math.round(time)) < 0.01;

            if (isMainBeat) {
                group.append('text')
                    .text(Math.round(time).toString())
                    .attr('x', x)
                    .attr('y', height - 5)
                    .attr('fill', '#fff')
                    .attr('font-size', 10)
                    .attr('text-anchor', 'middle');
            }
        }
    }, [audioDuration, selectedGrid, selectedTime, timelineWidthPerSecond]);

    useEffect(() => {
        drawGrid();
    }, [drawGrid, selectedGrid, timelineWidthPerSecond]);



    // Handle horizontal scroll
    const handleScroll = (e) => {
        const scrollLeft = e.target.scrollLeft;
        setScrollLeft(scrollLeft);

        // Bidirectional sync: keep header and grid in lockstep
        if (timelineContainerRef.current && e.target !== timelineContainerRef.current) {
            timelineContainerRef.current.scrollLeft = scrollLeft;
        }
        if (wrapperRef.current && e.target !== wrapperRef.current) {
            wrapperRef.current.scrollLeft = scrollLeft;
        }
        
        // Force re-render of playhead to update its position after scroll
        // This ensures the playhead stays visually aligned with the timeline
        if (playheadRef.current) {
            playheadRef.current.style.transform = `translateX(${localPlayheadTime * timelineWidthPerSecond - scrollLeft}px)`;
        }
    };

    // Handle Ctrl + scroll wheel for zoom
    const handleWheel = (e) => {
        if (e.ctrlKey || e.metaKey) {
            e.preventDefault(); // Prevent default browser zoom

            if (e.deltaY < 0) {
                // Scroll up - zoom in
                // This will be handled by Timeline.jsx
            } else {
                // Scroll down - zoom out
                // This will be handled by Timeline.jsx
            }
        }
    };

    // Calculate playhead position - use the same calculation as Timeline.jsx
    const computeSnappedTimeFromEvent = (e) => {
        if (!timelineHeaderRef.current) return;
        const rect = timelineHeaderRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const width = Math.max(audioDuration, 12) * timelineWidthPerSecond;
        const rawTime = (x / width) * audioDuration;
        const gridSpacing = getGridSpacingWithTimeSignature(selectedGrid, selectedTime);
        const snappedTime = Math.max(0, Math.min(audioDuration, Math.round(rawTime / gridSpacing) * gridSpacing));
        return snappedTime;
    };
    const handleTimelineClick = (e) => {
        const snappedTime = computeSnappedTimeFromEvent(e);
        if (snappedTime === undefined) return;
        dispatch(setStudioCurrentTime(snappedTime));
        try { Tone.Transport.seconds = snappedTime; } catch {}
        setLocalPlayheadTime(snappedTime);
    };

    // Scrubbing support (click-and-drag on header)
    const isScrubbingRef = useRef(false);
    const wasPlayingRef = useRef(false);
    const lastScrubDispatchRef = useRef(0);

    const updateScrub = (e, force = false) => {
        const snappedTime = computeSnappedTimeFromEvent(e);
        if (snappedTime === undefined) return;
        const now = Date.now();
        if (force || now - lastScrubDispatchRef.current > 80) {
            lastScrubDispatchRef.current = now;
            dispatch(setStudioCurrentTime(snappedTime));
        }
        try { Tone.Transport.seconds = snappedTime; } catch {}
        setLocalPlayheadTime(snappedTime);
    };

    const onHeaderMouseDown = (e) => {
        if (!timelineHeaderRef.current) return;
        isScrubbingRef.current = true;
        wasPlayingRef.current = studioIsPlaying;
        if (wasPlayingRef.current) {
            dispatch(setPlaying(false));
            try { Tone.Transport.pause(); } catch {}
        }
        updateScrub(e, true);
        window.addEventListener('mousemove', onHeaderMouseMove);
        window.addEventListener('mouseup', onHeaderMouseUp);
        e.preventDefault();
    };

    const onHeaderMouseMove = (e) => {
        if (!isScrubbingRef.current) return;
        updateScrub(e);
    };

    const onHeaderMouseUp = (e) => {
        if (!isScrubbingRef.current) return;
        updateScrub(e, true);
        isScrubbingRef.current = false;
        window.removeEventListener('mousemove', onHeaderMouseMove);
        window.removeEventListener('mouseup', onHeaderMouseUp);
        if (wasPlayingRef.current) {
            try { Tone.Transport.start(); } catch {}
            dispatch(setPlaying(true));
        }
    };

    let mouseDownTime = useRef(0);
    const handleMouseDown = () => {
        mouseDownTime.current = Date.now();
    };

    const handleMouseUp = (e) => {
        if (e.button !== 0) return; // only handle left-click

        // 🛡️ Prevent adding new notes if context menu is open
       
        if (menuVisible || pasteMenu || selectedNoteIndex) return;

        const elapsed = Date.now() - mouseDownTime.current;
        if (elapsed < 200) {
            handleGridClick(e);
        }
    };

    // Note helpers (must be defined before any hook that uses them)
    const noteNames = useMemo(() => ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'], []);
    const noteNameToMidi = useCallback((note) => {
        if (!note || typeof note !== 'string') return 60;
        const match = note.match(/^([A-G])(#?)(-?\d+)$/i);
        if (!match) return 60;
        const [, letter, sharp, octaveStr] = match;
        const letterUp = letter.toUpperCase();
        const idxBase = noteNames.indexOf(letterUp + (sharp ? '#' : ''));
        const octave = parseInt(octaveStr, 10);
        if (idxBase < 0 || isNaN(octave)) return 60;
        return (octave + 1) * 12 + idxBase;
    }, [noteNames]);

    
    const handleGridClick = (e) => {
        if (menuVisible || selectedNoteIndex) return;
        if (pasteMenu) return;
        // Only respond to clicks on the grid background, not on notes
        if (e.target.closest && e.target.closest('.note-box')) return;
        if (e.target.tagName !== 'svg' && !e.target.classList.contains('note-bg-div')) return;
        const rect = svgRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // Use the exact same time calculation as Timeline.jsx
        const start = x / timelineWidthPerSecond;
        const noteIndex = Math.floor(y / 30);
        
        // Remove restriction: allow adding anywhere in the piano roll
        if (noteIndex >= 0 && noteIndex < NOTES.length) {
            const note = NOTES[noteIndex];
            
            // Play sound immediately for real-time feedback
            playNoteForTrack(note, 0.2);

            // Create note with real-time properties
            const newNote = {
                note,
                start,
                duration: 0.2, // Default duration
                velocity: 0.8, // Default velocity
                id: `note_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`, // Unique ID for real-time updates
                trackId: currentTrackId || null,
                timestamp: Date.now()
            };
            
            // Add note to local state with real-time updates
            setNotes(prev => {
                const updated = [...prev, newNote];
                syncNotesToRedux(updated);
                return updated;
            });
            
            // Dispatch to Redux for real-time timeline updates
            const mappedNote = {
                note: newNote.note,
                startTime: newNote.start,
                duration: newNote.duration,
                midiNumber: noteNameToMidi(newNote.note),
                trackId: newNote.trackId,
                id: newNote.id,
                velocity: newNote.velocity
            };
            
            // Get current notes from Redux and add the new note
            const currentReduxNotes = Array.isArray(pianoNotes) ? pianoNotes : [];
            const updatedNotes = [...currentReduxNotes, mappedNote];
            dispatch(setPianoNotes(updatedNotes));
            
            // Clip sizing stays controlled by TimelineTrack
        }
    };
    
    // No updateRecordingClip here; TimelineTrack manages the clip bounds
    const handleKeyDown = (note) => {
        if (activeNotes[note]) return;

        const ctx = audioContextRef.current || getAudioContext();
        audioContextRef.current = ctx;

        // For drum tracks or when melodic instrument not loaded, just trigger once
        if (isDrumTrack || !pianoRef.current) {
            playNoteForTrack(note, 0.2);
            return;
        }

        // Melodic instrument: start and keep a reference for key up
        const audioNode = pianoRef.current.play(note);
        activeAudioNodes.current[note] = audioNode;

        const time = (typeof Tone.now === 'function') ? Tone.now() : ctx.currentTime;
        setActiveNotes((prev) => ({
            ...prev,
            [note]: { startTime: time },
        }));
    };

    const handleKeyUp = (note) => {
        const noteInfo = activeNotes[note];
        if (!noteInfo) return;

        if (activeAudioNodes.current[note]) {
            try { activeAudioNodes.current[note].stop(); } catch {}
            delete activeAudioNodes.current[note];
        }

        // Do not add preview notes to the roll on key release
        setActiveNotes((prev) => {
            const copy = { ...prev };
            delete copy[note];
            return copy;
        });
    };

    const getYFromNote = (note) => NOTES.indexOf(note) * 30;

    const updateNote = (index, updates, { syncRedux = false } = {}) => {
        setNotes(prev => {
            const updated = [...prev];
            updated[index] = { ...updated[index], ...updates };
            if (syncRedux) {
                syncNotesToRedux(updated);
            }
            return updated;
        });
    };
    
    // Real-time note drag handler (fast, follows cursor, avoids Redux during drag)
    const lastDragNoteRef = useRef({});
    const dragCacheRef = useRef({});
    const handleNoteDrag = (index, newStart, newNote) => {
        // Update every frame so the note stays under the cursor
        dragCacheRef.current[index] = { start: newStart, note: newNote };
        const updatedNote = {
            ...notes[index],
            start: newStart,
            note: newNote
        };
        // Update local state only for smooth UI; sync to Redux onDragStop
        updateNote(index, updatedNote, { syncRedux: false });

        // Play note only when vertical lane (pitch) changes
        if (lastDragNoteRef.current[index] !== newNote) {
            lastDragNoteRef.current[index] = newNote;
            playNoteForTrack(newNote, 0.08);
        }
    };

    // Real-time note resize handler
    const handleNoteResize = (index, newDuration) => {
        const updatedNote = {
            ...notes[index],
            duration: Math.max(0.05, newDuration) // Minimum duration
        };

        updateNote(index, updatedNote, { syncRedux: false });
    };

    
    // Sync notes to Redux so Timeline shows red region + white mini boxes
    const syncNotesToRedux = useCallback((list) => {
        try {
            const mapped = list.map(n => ({
                note: n.note,
                startTime: n.start,
                duration: n.duration,
                midiNumber: noteNameToMidi(n.note),
                trackId: n.trackId || currentTrackId,
                id: n.id,
                velocity: n.velocity || 0.8
            }));
            dispatch(setPianoNotes(mapped));
        } catch {}
        // do nothing for clip sizing here
    }, [dispatch, noteNameToMidi, currentTrackId]);
    
    // Sync notes when track changes
    useEffect(() => {
        if (notes.length > 0) {
            syncNotesToRedux(notes);
        }
    }, [currentTrackId, syncNotesToRedux]);
    
    // Load/refresh local notes whenever Redux notes for this track change
    useEffect(() => {
        if (!Array.isArray(pianoNotes)) return;
        const trackNotes = pianoNotes.filter(note => (note.trackId ?? null) === (currentTrackId ?? null));
        const localNotes = trackNotes.map(note => ({
            note: note.note,
            start: note.startTime,
            duration: note.duration,
            velocity: note.velocity || 0.8,
            id: note.id,
            trackId: note.trackId,
            timestamp: Date.now()
        }));
        setNotes(localNotes);
    }, [pianoNotes, currentTrackId]);
    
    // piano key handling over


    // playing time line
    const synthRef = useRef(null);
    const pianoRef = useRef(null);
    const audioContextRef = useRef(null);
    const gainNodeRef = useRef(null);
    const panNodeRef = useRef(null);
    const activeAudioNodes = useRef({});
    const notesScheduledRef = useRef(false);
    const playheadRef = useRef(null);
    const rAFRef = useRef(null);
    const [localPlayheadTime, setLocalPlayheadTime] = useState(0);
    const playbackStartRef = useRef({ systemTime: 0, audioTime: 0 });

    // Determine instrument by selected track
    const isDrumTrack = useMemo(() => {
        if (!selectedTrack) return false;
        const name = (selectedTrack.name || '').toLowerCase();
        return selectedTrack.type === 'drum' || name.includes('drum');
    }, [selectedTrack]);

    const targetInstrumentId = useMemo(() => {
        if (!selectedTrack) return 'acoustic_grand_piano';
        const name = (selectedTrack.name || '').toLowerCase();
        if (selectedTrack.type === 'drum' || name.includes('drum')) return null; // handled via drum synth
        if (name.includes('key')) return 'acoustic_grand_piano';
        if (name.includes('bass')) return 'synth_bass_1';
        if (name.includes('guitar/bass amp')) return 'overdriven_guitar';
        if (name.includes('guitar')) return 'electric_guitar_jazz';
        if (name.includes('synth')) return 'lead_1_square';
        if (name.includes('orchestral')) return 'string_ensemble_1';
        if (name.includes('voice') || name.includes('mic')) return 'voice_oohs';
        return 'acoustic_grand_piano';
    }, [selectedTrack]);

    // Build simple audio chain and load base context
    useEffect(() => {
        try {
            const ctx = getAudioContext();
            audioContextRef.current = ctx;

            const gainNode = ctx.createGain();
            const panNode = ctx.createStereoPanner();

            gainNode.connect(panNode);
            panNode.connect(ctx.destination);

            gainNodeRef.current = gainNode;
            panNodeRef.current = panNode;
        } catch {}
    }, []);

    // Load or switch melodic instrument when not a drum track
    useEffect(() => {
        if (!audioContextRef.current) return;
        if (isDrumTrack) {
            pianoRef.current = null; // ensure we don't accidentally use melodic instrument
            return;
        }
        if (!targetInstrumentId) return;
        Soundfont.instrument(audioContextRef.current, targetInstrumentId, { destination: gainNodeRef.current })
            .then((p) => { pianoRef.current = p; })
            .catch(() => { pianoRef.current = null; });
    }, [isDrumTrack, targetInstrumentId]);

    // Drum instrument selection (default kit)
    const selectedDrumMachine = useMemo(() => drumMachineTypes[0], []);

    // Unified play helper
    const playNoteForTrack = useCallback((note, duration = 0.2) => {
        try {
            const ctx = audioContextRef.current || getAudioContext();
            audioContextRef.current = ctx;
            if (isDrumTrack) {
                const midi = noteNameToMidi(note);
                const pads = selectedDrumMachine.pads;
                const pad = pads[midi % pads.length];
                const src = createSynthSound(pad, ctx);
                if (gainNodeRef.current) src.connect(gainNodeRef.current); else src.connect(ctx.destination);
            } else if (pianoRef.current) {
                try { pianoRef.current.play(note, undefined, { duration: Math.max(0.1, duration) }); } catch {}
            }
        } catch {}
    }, [isDrumTrack, noteNameToMidi, selectedDrumMachine]);

    // Smooth local playhead driven by Tone when playing
    useEffect(() => {
        let rafId = null;
        const tempoRatio = (studioBpm ?? 120) / 120;

        if (studioIsPlaying) {
            playbackStartRef.current = {
                systemTime: Date.now(),
                audioTime: studioCurrentTime,
            };

            const loop = () => {
                const elapsed = (Date.now() - playbackStartRef.current.systemTime) / 1000;
                let t = playbackStartRef.current.audioTime + elapsed * tempoRatio;
                // Loop awareness to match Timeline behavior
                try {
                    const loopState = (window.__reduxStore__ && window.__reduxStore__.getState && window.__reduxStore__.getState().loop) || {};
                    const { isLoopEnabled, loopStart, loopEnd } = loopState;
                    if (isLoopEnabled && typeof loopStart === 'number' && typeof loopEnd === 'number' && loopEnd > loopStart) {
                        if (t >= loopEnd) {
                            playbackStartRef.current = {
                                systemTime: Date.now(),
                                audioTime: loopStart,
                            };
                            t = loopStart;
                        }
                    }
                } catch {}
                setLocalPlayheadTime(t);
                rafId = requestAnimationFrame(loop);
            };
            rafId = requestAnimationFrame(loop);
        } else {
            setLocalPlayheadTime(studioCurrentTime);
        }

        return () => {
            if (rafId) cancelAnimationFrame(rafId);
        };
    }, [studioIsPlaying, studioCurrentTime, studioBpm]);

    // When seeking during playback, re-anchor the local animation baseline
    useEffect(() => {
        if (studioIsPlaying) {
            playbackStartRef.current = {
                systemTime: Date.now(),
                audioTime: studioCurrentTime,
            };
        }
    }, [studioCurrentTime, studioIsPlaying]);
    
    // When paused, snap local playhead to Redux time (kept for certainty)
    useEffect(() => {
        if (!studioIsPlaying) {
            setLocalPlayheadTime(studioCurrentTime);
        }
    }, [studioIsPlaying, studioCurrentTime]);
    
    // Update playhead position whenever localPlayheadTime or scrollLeft changes
    useEffect(() => {
        if (playheadRef.current && timelineContainerRef.current) {
            const scrollLeft = timelineContainerRef.current.scrollLeft || 0;
            playheadRef.current.style.transform = `translateX(${localPlayheadTime * timelineWidthPerSecond - scrollLeft}px)`;
        }
    }, [localPlayheadTime, scrollLeft, timelineWidthPerSecond]);
    // Auto-scroll the grid to follow the playhead
    useEffect(() => {
        const wrapper = wrapperRef.current;
        if (!wrapper) return;
        
        // Only auto-scroll when playing, not when manually scrolled
        if (!studioIsPlaying) return;
        
        const px = localPlayheadTime * timelineWidthPerSecond;
        const viewportLeft = wrapper.scrollLeft;
        const viewportRight = viewportLeft + wrapper.clientWidth;
        const edgePadding = 120; // pixels
        if (px > viewportRight - edgePadding) {
            wrapper.scrollLeft = Math.max(0, px - wrapper.clientWidth + edgePadding);
        } else if (px < viewportLeft + edgePadding) {
            wrapper.scrollLeft = Math.max(0, px - edgePadding);
        }
    }, [localPlayheadTime, timelineWidthPerSecond, studioIsPlaying]);

    // Keep Tone.Transport position in sync with Redux time
    useEffect(() => {
        try { Tone.Transport.seconds = studioCurrentTime; } catch {}
    }, [studioCurrentTime]);

    // Keep Tone.Transport BPM in sync with Redux BPM
    useEffect(() => {
        try { Tone.Transport.bpm.value = studioBpm; } catch {}
    }, [studioBpm]);

    // React to global play/pause and start or pause Tone.Transport accordingly
    useEffect(() => {
        (async () => {
            try {
                await ensureAudioUnlocked();
                await Tone.start();
                if (studioIsPlaying) {
                    // Clear previous schedules to avoid duplicates/overlaps
                    try { Tone.Transport.cancel(0); } catch {}
                    notes.forEach(n => {
                        Tone.Transport.schedule(() => {
                            playNoteForTrack(n.note, n.duration);
                        }, n.start);
                    });
                    try { Tone.Transport.seconds = studioCurrentTime; } catch {}
                    if (Tone.Transport.state !== 'started') {
                        Tone.Transport.start();
                    }
                } else {
                    Tone.Transport.pause();
                }
            } catch {}
        })();
    }, [studioIsPlaying, notes, studioCurrentTime]);
    
    // Keyboard shortcuts for real-time note creation and editing
    useEffect(() => {
        const handleKeyDown = (e) => {
            // Only handle keyboard shortcuts when not in input fields
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
            
            switch (e.key) {
                case 'Delete':
                case 'Backspace':
                    if (selectedNoteIndex !== null) {
                        e.preventDefault();
                        handleDelete();
                    }
                    break;
                case 'c':
                    if (e.ctrlKey || e.metaKey) {
                        e.preventDefault();
                        if (selectedNoteIndex !== null) {
                            handleCopy();
                        }
                    }
                    break;
                case 'v':
                    if (e.ctrlKey || e.metaKey) {
                        e.preventDefault();
                        if (clipboardNote) {
                            handlePaste();
                        }
                    }
                    break;
                case 'x':
                    if (e.ctrlKey || e.metaKey) {
                        e.preventDefault();
                        if (selectedNoteIndex !== null) {
                            handleCut();
                        }
                    }
                    break;
                case 'z':
                    if (e.ctrlKey || e.metaKey) {
                        e.preventDefault();
                        // TODO: Implement undo functionality
                    }
                    break;
                case 'a':
                    if (e.ctrlKey || e.metaKey) {
                        e.preventDefault();
                        // TODO: Implement select all functionality
                    }
                    break;
            }
        };
        
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedNoteIndex, clipboardNote]);

    // If notes change, allow re-scheduling on next play
    useEffect(() => {
        notesScheduledRef.current = false;
    }, [notes]);

    // right click menu handler 
    const menuRef = useRef(null);

    // console.log('selectedNoteIndex', selectedNoteIndex)
    const [menuVisible, setMenuVisible] = useState(false);
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setMenuVisible(false);
                setSelectedNoteIndex(null);
                pasteMenu(false);
            }
        };
        window.addEventListener("mousedown", handleClickOutside);
        return () => window.removeEventListener("mousedown", handleClickOutside);
    }, []);



    // note copy cut and paste functionlity
    
    const pasteMenuRef = useRef(null);
    const [position, setPosition] = useState({ x: 0, y: 0 });

    const [pasteMenu, setPasteMenu] = useState(false);
    const handleDelete = () => {
        if (selectedNoteIndex !== null) {
            const updatedNotes = notes.filter((_, idx) => idx !== selectedNoteIndex);
            setNotes(updatedNotes);
            syncNotesToRedux(updatedNotes);
            setTimeout(() => {
                setMenuVisible(false);
                setSelectedNoteIndex(null);
            }, 0);
        }
    };

    const handleCopy = () => {
        if (selectedNoteIndex !== null) {
            setClipboardNote({ ...notes[selectedNoteIndex] });
            setTimeout(() => {
                setMenuVisible(false);
                setSelectedNoteIndex(null);
            }, 0);
        }
    };

    const handleCut = () => {
        if (selectedNoteIndex !== null) {
            setClipboardNote({ ...notes[selectedNoteIndex] });
            handleDelete();
        }
    };

    const handlePaste = () => {
        if (clipboardNote && wrapperRef.current) {
            const newX = position.x;
            const newY = position.y;

            // Convert X to start time
            const start = newX / timelineWidthPerSecond;

            // Convert Y to note index
            const noteIndex = Math.round(newY / 30);
            const note = NOTES[noteIndex];

            const pastedNote = {
                ...clipboardNote,
                start,
                note,
            };

            setNotes((prev) => {
                const updated = [...prev, pastedNote];
                syncNotesToRedux(updated);
                return updated;
            });

            // Reset state
            setPasteMenu(false);
            setMenuVisible(false);
        }
    };
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (pasteMenuRef.current && !pasteMenuRef.current.contains(e.target)) {
                setPasteMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);


    // audio detection code 
    const [notes1, setNotes1] = useState([]);
    // const handleFileChange = async (e) => {
    //     const file = e.target.files[0];
    //     if (!file) return;
    
    //     const audioBuffer = await decodeAudio(file);
    //     console.log("Decoded audio:", audioBuffer);
    
    //     const notes = detectNotes(audioBuffer);
    //     console.log("Detected Notes:", notes);
    // };
    
    useEffect(() => {
        if (track[0]?.audioClips[0]?.url) {
            (async () => {
                const audioBuffer = await decodeAudio(track[0].audioClips[0].url);
                if (audioBuffer) {
                    const detected = detectNotes(audioBuffer);
                    if (detected && Array.isArray(detected)) {
                        syncNotesToRedux(detected);
                    }
                }
            })();
        }
    }, [track, syncNotesToRedux]);

    const decodeAudio = async (fileOrUrl) => {
        let arrayBuffer;
    
        if (fileOrUrl instanceof File || fileOrUrl instanceof Blob) {
            arrayBuffer = await fileOrUrl.arrayBuffer();
        }
        // 🔥 Fix: handle raw URL string
        else if (typeof fileOrUrl === 'string') {
            const res = await fetch(fileOrUrl);
            const blob = await res.blob();
            arrayBuffer = await blob.arrayBuffer();
        } else if (typeof fileOrUrl === 'object' && fileOrUrl.url) {
            const res = await fetch(fileOrUrl.url);
            const blob = await res.blob();
            arrayBuffer = await blob.arrayBuffer();
        } else {
            console.warn("Unsupported audio input:", fileOrUrl);
            return;
        }
    
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        return await audioCtx.decodeAudioData(arrayBuffer);
    };

    const detectNotes = (audioBuffer) => {        
        const audioData = audioBuffer.getChannelData(0); // mono
        const sampleRate = audioBuffer.sampleRate;
        const frameSize = 2048;
        const hopSize = 512;
    
        const detector = PitchDetector.forFloat32Array(frameSize);
    
        const results = [];
        let currentNote = null;
        let noteStart = null;
    
        for (let i = 0; i + frameSize < audioData.length; i += hopSize) {
            const frame = audioData.slice(i, i + frameSize);
            const [pitch, clarity] = detector.findPitch(frame, sampleRate);
            const time = i / sampleRate;

            if (clarity > 0.95 && pitch > 50 && pitch < 2000) {
                const note = pitchToNote(pitch);

                if (currentNote === note) {
                    continue;
                } else {
                    // finish previous note if exists
                    if (currentNote && noteStart !== null) {
                        const duration = time - noteStart;
                        results.push({
                            note: currentNote,
                            start: parseFloat(noteStart.toFixed(2)),
                            duration: parseFloat(duration.toFixed(2)),
                        });
                    }

                    // start new note
                    currentNote = note;
                    noteStart = time;
                }
            } else {
                if (currentNote && noteStart !== null) {
                    const duration = time - noteStart;
                    results.push({
                        note: currentNote,
                        start: parseFloat(noteStart.toFixed(2)),
                        duration: parseFloat(duration.toFixed(2)),
                    });
                    currentNote = null;
                    noteStart = null;
                }
            }
        }

        // console.log('results',results);
        if (currentNote && noteStart !== null) {
            const endTime = audioData.length / sampleRate;
            const duration = endTime - noteStart;
            results.push({
                note: currentNote,
                start: parseFloat(noteStart.toFixed(2)),
                duration: parseFloat(duration.toFixed(2)),
            });
        }

        setNotes(results);
        return results;
    };

    const pitchToNote = (freq) => {
        const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
        const midi = Math.round(69 + 12 * Math.log2(freq / 440));
        const name = noteNames[midi % 12];
        const octave = Math.floor(midi / 12) - 1;
        return `${name}${octave}`;
    };


    return (
        <>
            {/* Zoom Controls */}
            <div
                className={`relative w-full h-[490px] bg-[#1e1e1e] text-white ${selectedNoteIndex || pasteMenu ? 'overflow-hidden' : 'overflow-y-auto overflow-x-hidden'}  `}
                onWheel={handleWheel}
            >
                {/* Control Icons - Right Side */}


                {/* Timeline Header Container with Horizontal Scroll */}
                <div
                    ref={timelineContainerRef}
                    className="fixed left-0 right-0 h-[80px] overflow-x-auto overflow-y-hidden z-[2]"
                    style={{ background: "#1F1F1F" }}
                    onClick={handleTimelineClick}
                    onMouseDown={onHeaderMouseDown}
                    onScroll={handleScroll}
                    onWheel={(e) => {
                        // Smooth horizontal scrolling on header (trackpads and mouse wheels)
                        if (e.ctrlKey || e.metaKey) return; // let zoom handler handle this
                        const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
                        if (delta) {
                            e.preventDefault();
                            const next = Math.max(0, (timelineContainerRef.current?.scrollLeft || 0) + delta);
                            if (timelineContainerRef.current) timelineContainerRef.current.scrollLeft = next;
                            if (wrapperRef.current) wrapperRef.current.scrollLeft = next;
                        }
                    }}
                >
                    <div style={{
                        width: `${Math.max(audioDuration, 12) * timelineWidthPerSecond}px`,
                        height: "100%",
                        position: "relative",
                        minWidth: "100%",
                        transition: "width 0.2s ease-in-out"
                    }}>
                        <svg
                            ref={timelineHeaderRef}
                            width="100%"
                            height="100%"
                            style={{ 
                                color: "white", 
                                width: "100%", 
                                transition: "width 0.2s ease-in-out"
                            }}
                        />
                    </div>
                </div>

                {/* Purple Playhead - spans full timeline and grid */}
                <div
                    ref={playheadRef}
                    style={{
                        position: "fixed",
                        top: "110px",
                        left: `${PIANO_KEYS_WIDTH}px`,
                        height: "100%",
                        width: "2px",
                        background: "#AD00FF",
                        zIndex: 25,
                        pointerEvents: "auto",
                        cursor: "pointer",
                        transform: `translateX(${localPlayheadTime * timelineWidthPerSecond - (timelineContainerRef.current?.scrollLeft || 0)}px)`,
                        willChange: "transform"
                    }}
                    onClick={(e) => {
                        // Calculate the time position based on click location
                        const rect = playheadRef.current.getBoundingClientRect();
                        const x = e.clientX - rect.left + (timelineContainerRef.current?.scrollLeft || 0);
                        const width = Math.max(audioDuration, 12) * timelineWidthPerSecond;
                        const rawTime = (x / width) * audioDuration;
                        const gridSpacing = getGridSpacingWithTimeSignature(selectedGrid, selectedTime);
                        const snappedTime = Math.max(0, Math.min(audioDuration, Math.round(rawTime / gridSpacing) * gridSpacing));
                        
                        // Dispatch the same action that Timeline uses
                        dispatch(setStudioCurrentTime(snappedTime));
                        try { Tone.Transport.seconds = snappedTime; } catch {}
                        setLocalPlayheadTime(snappedTime);
                    }}
                >
                    {/* Purple triangle at top */}
                    <div
                        style={{
                            position: "absolute",
                            top: "0px",
                            left: "-6px",
                            width: "16px",
                            height: "5px",
                            borderLeft: "0px solid transparent",
                            borderRight: "0px solid transparent",
                            borderTop: "15px solid #AD00FF",
                            borderRadius: "3px",
                        }}
                    />
                </div>

                {/* Piano Keys Column */}
                <div className="absolute left-0 top-[80px] w-24 h-[560px] bg-[#1a1a1a] border-r border-gray-700" style={{zIndex: 3}}>
                    {NOTES.map((note) => (
                        <button
                            key={note}
                            onMouseDown={() => handleKeyDown(note)}
                            onMouseUp={() => handleKeyUp(note)}
                            onMouseLeave={() => handleKeyUp(note)}
                            className={`h-[30px] min-h-[30px] text-xs ${note.includes('#') ? 'bg-black text-white w-[50%]' : 'bg-white w-full'} border`}
                        >
                            {note}
                        </button>
                    ))}
                </div>

                {/* Scrollable Piano Roll Grid */}
                <div
                    ref={wrapperRef}
                    className={`absolute left-24 top-[80px] right-0 ${selectedNoteIndex || pasteMenu ? 'overflow-hidden' : ' overflow-x-auto overflow-y-auto'}`}
                    style={{ background: "#1e1e1e", zIndex: 2 }}
                    onScroll={handleScroll}
                    onMouseDown={handleMouseDown}
                    onMouseUp={(e) => {
                        if (e.button !== 0) return; // only left click
                        // Do not create a new note when clicking on an existing note
                        if (e.target.closest && e.target.closest('.note-box')) return;
                        handleMouseUp(e);
                    }}
                                         onClick={(e) => {
                         // Handle clicks on the grid background to move playhead
                         if (e.target === wrapperRef.current || e.target.tagName === 'svg' || e.target.classList.contains('note-bg-div')) {
                             const rect = wrapperRef.current.getBoundingClientRect();
                             const x = e.clientX - rect.left + wrapperRef.current.scrollLeft;
                             
                             // Calculate time directly from x position without width scaling
                             const rawTime = x / timelineWidthPerSecond;
                             const gridSpacing = getGridSpacingWithTimeSignature(selectedGrid, selectedTime);
                             const snappedTime = Math.max(0, Math.min(audioDuration, Math.round(rawTime / gridSpacing) * gridSpacing));
                             
                             // Sync playhead with timeline
                             dispatch(setStudioCurrentTime(snappedTime));
                             try { Tone.Transport.seconds = snappedTime; } catch {}
                             setLocalPlayheadTime(snappedTime);
                         }
                     }}
                    onContextMenu={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        // if right-clicking on a note box, let that handler manage
                        if (e.target.closest('.note-box')) return;
                        if (clipboardNote) {
                            const wrapperRect = wrapperRef.current.getBoundingClientRect();
                            setPasteMenu(true);
                            setSelectedNoteIndex(null);
                            setPosition({
                                x: e.clientX - wrapperRect.left,
                                y: e.clientY - wrapperRect.top,
                            });
                            // console.log('iscalled')
                        }
                    }}

                >
                    {/* Transform the playhead for smooth movement without reflow */}
                    <style>{`.pianoroll-playhead-transform{transform: translateX(${(typeof localPlayheadTime === 'number' ? localPlayheadTime : 0) * timelineWidthPerSecond}px);}`}</style>
                    <div className="pianoroll-playhead-transform" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, pointerEvents: 'none', zIndex: 24 }} />
                    {/* Red background region - mirrors TimelineTrack clip when available */}
                    {(() => {
                        const activeClip = (pianoRecordingClip && (pianoRecordingClip.trackId ?? null) === (currentTrackId ?? null)) ? pianoRecordingClip : null;
                        if (activeClip && activeClip.start != null && activeClip.end != null) {
                            const left = (activeClip.start || 0) * timelineWidthPerSecond;
                            const width = Math.max(0, (activeClip.end - activeClip.start)) * timelineWidthPerSecond;
                            return (
                                <div
                                    className="note-bg-div border border-[#E44F65] "
                                    style={{
                                        position: 'absolute',
                                        left: `${left}px`,
                                        top: 0,
                                        width: `${width}px`,
                                        height: '100%',
                                        background: 'rgba(255, 0, 0, 0.1)',
                                        zIndex: 0,
                                        opacity: 1,
                                        borderRadius: '5px',
                                        transition: "left 0.2s ease-in-out, width 0.2s ease-in-out"
                                    }}
                                    onMouseDown={handleMouseDown}
                                    onMouseUp={handleMouseUp}
                                />
                            );
                        }
                        // Fallback: derive region from local notes if no active clip
                        if (notes.length > 0) {
                            const minStart = Math.min(...notes.map(n => n.start));
                            const maxEnd = Math.max(...notes.map(n => n.start + n.duration)) + 0.1;
                            const left = minStart * timelineWidthPerSecond;
                            const width = (maxEnd - minStart) * timelineWidthPerSecond;
                            return (
                                <div
                                    className="note-bg-div border border-[#E44F65] "
                                    style={{
                                        position: 'absolute',
                                        left: `${left}px`,
                                        top: 0,
                                        width: `${width}px`,
                                        height: '100%',
                                        background: 'rgba(255, 0, 0, 0.1)',
                                        zIndex: 0,
                                        opacity: 1,
                                        borderRadius: '5px',
                                        transition: "left 0.2s ease-in-out, width 0.2s ease-in-out" // Smooth transition for zoom
                                    }}
                                    onMouseDown={handleMouseDown}
                                    onMouseUp={handleMouseUp}
                                />
                            );
                        }
                        return null;
                    })()}
                    {/* {console.log('notes',notes)} */}
                    {notes.map((n, i) => {
                        const trackBounds = getTrackBounds();
                        
                        // Skip notes that are completely outside track bounds
                        if (n.start >= trackBounds.end || (n.start + n.duration) <= trackBounds.start) {
                            return null;
                        }
                        
                        return (
                            <Rnd
                                key={i}
                                size={{ width: n.duration * timelineWidthPerSecond > 15 ? n.duration * timelineWidthPerSecond : 15, height: 24 }}
                                position={{ x: n.start * timelineWidthPerSecond, y: getYFromNote(n.note) }}
                                bounds="parent"
                                enableResizing={{ right: true }}
                                dragAxis="both"
                                dragGrid={[1, 30]}
                                style={{ willChange: 'transform' }}
                                onDrag={(e, d) => {
                                    // Real-time drag feedback
                                    const snappedY = Math.round(d.y / 30) * 30;
                                    const noteIndex = Math.round(d.y / 30);
                                    const newNote = NOTES[noteIndex];
                                    
                                    // Use the same time calculation as Timeline.jsx
                                    const newStartTime = d.x / timelineWidthPerSecond;
                                    
                                    // Update note in real-time during drag
                                    handleNoteDrag(i, newStartTime, newNote);
                                }}
                                onDragStop={(e, d) => {
                                    const snappedY = Math.round(d.y / 30) * 30;
                                    const noteIndex = Math.round(d.y / 30);
                                    const newNote = NOTES[noteIndex];
                                    
                                    // Use the same time calculation as Timeline.jsx
                                    const newStartTime = d.x / timelineWidthPerSecond;
                                    const updates = { start: newStartTime, note: newNote };
                                    setNotes(prev => {
                                        const updated = [...prev];
                                        updated[i] = { ...updated[i], ...updates };
                                        syncNotesToRedux(updated);
                                        return updated;
                                    });
                                    // clear drag cache for this note
                                    if (dragCacheRef.current) {
                                        delete dragCacheRef.current[i];
                                    }
                                }}
                                onResize={(e, direction, ref, delta, position) => {
                                    // Real-time resize feedback
                                    const newWidth = parseFloat(ref.style.width);
                                    const newDuration = newWidth / timelineWidthPerSecond;
                                    
                                    // Update note in real-time during resize
                                    handleNoteResize(i, newDuration);
                                }}
                                onResizeStop={(e, direction, ref, delta, position) => {
                                    const newWidth = parseFloat(ref.style.width);
                                    
                                    // Use the same time calculation as Timeline.jsx
                                    const newDuration = newWidth / timelineWidthPerSecond;
                                    const newStartTime = position.x / timelineWidthPerSecond;
                                    setNotes(prev => {
                                        const updated = [...prev];
                                        updated[i] = { ...updated[i], duration: newDuration, start: newStartTime };
                                        syncNotesToRedux(updated);
                                        return updated;
                                    });
                                    // clear drag cache for this note
                                    if (dragCacheRef.current) {
                                        delete dragCacheRef.current[i];
                                    }
                                }}
                            >
                                <div
                                    className={`note-box bg-red-500 rounded w-full h-full relative z-1 ${selectedNoteIndex === i ? 'border-[2px] border-yellow-400' : 'border'} transition-colors duration-75 hover:bg-red-400 cursor-grab active:cursor-grabbing`}
                                    onClick={(e) => {
                                        // Left click: just play the note
                                        e.stopPropagation();
                                        playNoteForTrack(n.note, Math.max(0.1, n.duration || 0.2));
                                    }}
                                    onContextMenu={(e) => {
                                        // Right click: open the note context menu
                                        e.preventDefault();
                                        e.stopPropagation();
                                        const wrapperRect = wrapperRef.current.getBoundingClientRect();
                                        setSelectedNoteIndex(i);
                                        setMenuVisible(true);
                                        setPosition({
                                            x: e.clientX - wrapperRect.left,
                                            y: e.clientY - wrapperRect.top,
                                        });
                                    }}
                                >
                                    {(menuVisible && selectedNoteIndex === i) ? (
                                        <ul
                                            className="absolute bg-[#1F1F1F] text-black border border-[#1F1F1F] shadow rounded flex"
                                            style={{
                                                top: '100%',
                                                right: 0,
                                                zIndex: 1000,
                                                listStyle: 'none',
                                                padding: '0px   ',
                                            }}
                                        >
                                            <li className="hover:bg-gray-200 hover:text-[#1F1F1F] cursor-pointer text-sm p-3 text-white" onClick={() => { handleCut() }}><IoCutOutline className='text-[16px]' /></li>
                                            <li className="hover:bg-gray-200 hover:text-[#1F1F1F] cursor-pointer text-sm p-3 text-white" onClick={() => { handleCopy() }}><FaRegCopy className='text-[16px]' /></li>
                                            <li className="hover:bg-gray-200 hover:text-[#1F1F1F] cursor-pointer text-sm p-3 text-white" onClick={() => { handleDelete() }}><MdDelete className='text-[16px]' /></li>
                                        </ul>
                                    ): null}
                                </div>
                            </Rnd>
                        );
                    })}

                    <svg ref={svgRef} style={{ 
                        width: `${Math.max(audioDuration, 12) * timelineWidthPerSecond}px`, 
                        height: "100%",
                        transition: "width 0.2s ease-in-out" // Smooth transition for zoom like Timeline.jsx
                    }}>
                        <g />
                    </svg>
                    {/* {console.log('consition', pasteMenu && !menuVisible && clipboardNote, pasteMenu, menuVisible, clipboardNote)} */}
                    {(pasteMenu && clipboardNote) ? (
                        <span
                            className='bg-[#1F1F1F] text-white hover:bg-gray-200 hover:text-[#1F1F1F] absolute cursor-pointer text-sm p-3'
                            ref={pasteMenuRef}
                            style={{
                                top: position.y,
                                left: position.x,
                                zIndex: 9999,
                                listStyle: 'none',
                                padding: '4px',
                            }}
                            onClick={(e) => {
                                e.stopPropagation();
                                handlePaste();
                            }}
                        >
                            <FaPaste className='text-[16px]' />
                        </span>
                    ) : null}
                </div>
            </div >

        </>
    );
};

export default PianoRolls;