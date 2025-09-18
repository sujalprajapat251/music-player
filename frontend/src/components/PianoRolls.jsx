import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import * as Tone from 'tone';
import Soundfont from 'soundfont-player';
import { RxCursorArrow } from "react-icons/rx";
import { BsPencil } from "react-icons/bs";
import { RiDeleteBin6Line } from "react-icons/ri";
import { PitchDetector } from 'pitchy';
import { Rnd } from 'react-rnd';
import 'react-resizable/css/styles.css';
import * as d3 from 'd3';
import { useDispatch, useSelector } from 'react-redux';
import { selectGridSettings } from '../Redux/Slice/grid.slice';
import { setPlaying, setCurrentTime as setStudioCurrentTime, setPianoNotes, setPianoRecordingClip, setRecordingAudio, setDrumRecordedData, setDrumRecordingClip } from '../Redux/Slice/studio.slice';
import { selectStudioState } from '../Redux/rootReducer';
import { getGridDivisions, parseTimeSignature, getGridSpacingWithTimeSignature } from '../Utils/gridUtils';
import { getAudioContext, ensureAudioUnlocked } from '../Utils/audioContext';
import { drumMachineTypes, createSynthSound } from '../Utils/drumMachineUtils';
import { FaPaste, FaRegCopy } from 'react-icons/fa';
import { MdDelete } from "react-icons/md";
import { IoCutOutline } from 'react-icons/io5';
import audio from '../Images/piano-beats.mp3';


const generatePianoKeys = () => {
    // Preserve original labeling scheme used in the UI
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
    const studioIsPlaying = useSelector((state) => selectStudioState(state)?.isPlaying || false);
    const studioCurrentTime = useSelector((state) => selectStudioState(state)?.currentTime || 0);
    const studioBpm = useSelector((state) => selectStudioState(state)?.bpm ?? 120);
    const selectedInstrument = useSelector((state) => selectStudioState(state)?.selectedInstrument || 'acoustic_grand_piano');
    const [scrollLeft, setScrollLeft] = useState(0); // Horizontal scroll position
    const [isManualScrolling, setIsManualScrolling] = useState(false); // Track manual scrolling

    const pianoRecording = useSelector((state) => selectStudioState(state).pianoRecord);
    const pianoNotes = useSelector((state) => selectStudioState(state).pianoNotes || []);
    const drumRecordedData = useSelector((state) => selectStudioState(state)?.drumRecordedData || []);
    const pianoRecordingClip = useSelector((state) => selectStudioState(state).pianoRecordingClip);
    const drumRecordingClip = useSelector((state) => selectStudioState(state).drumRecordingClip);
    // console.log('pianoRecording ::: > ', pianoRecording)

    const baseWidth = 1000;  // Increased base width for more content
    const height = 600;
    const rowHeight = 30;
    // Match Timeline.jsx: use Redux audioDuration so ruler length stays in sync
    const audioDuration = useSelector((state) => selectStudioState(state)?.audioDuration || 150);
    const PIANO_KEYS_WIDTH = 96;

    // get data from redux
    const track = useSelector((state)=>selectStudioState(state).tracks)
    const tracks = useSelector((state)=>selectStudioState(state).tracks || [])
    const currentTrackId = useSelector((state)=>selectStudioState(state).currentTrackId)
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
    const DRUM_NOTE_DURATION = 0.15; // seconds - uniform drum note duration for consistent width

    // Bottom toolbar active tool state
    const [activeTool, setActiveTool] = useState('pencil');
    const [selectedNotes, setSelectedNotes] = useState(new Set()); // Track selected notes for multi-selection
    
    // Volume bar state
    const [volumeBarVisible, setVolumeBarVisible] = useState(false);
    const [draggingVolume, setDraggingVolume] = useState(false);
    const [volumeDragNoteIndex, setVolumeDragNoteIndex] = useState(null);

    // Tool functionality handlers
    const handleToolChange = (tool) => {
        setActiveTool(tool);
        
        // Clear selections when switching tools
        if (tool !== 'v') {
            setSelectedNotes(new Set());
            setSelectedNoteIndex(null);
        }
    };

    // Handle volume bar visibility when V tool is selected
    useEffect(() => {
        setVolumeBarVisible(activeTool === 'v');
    }, [activeTool]);

    // Handle volume bar drag
    // Handle volume bar drag
    const handleVolumeDrag = (noteIndex, e) => {
        if (activeTool !== 'v') return;
        
        e.preventDefault();
        e.stopPropagation();
        
        setDraggingVolume(true);
        setVolumeDragNoteIndex(noteIndex);
        
        const handleMouseMove = (e) => {
            if (!draggingVolume) return;
            
            // Get the note element to calculate relative position
            const noteElement = e.target.closest('.note-box');
            if (!noteElement) return;
            
            const noteRect = noteElement.getBoundingClientRect();
            const y = e.clientY - noteRect.top;
            const noteHeight = noteRect.height;
            
            // Calculate volume based on vertical position (0 = bottom, 1 = top)
            const volumePercent = Math.max(0, Math.min(1, 1 - (y / noteHeight)));
            
            // Update note velocity based on volume bar position
            const newVelocity = volumePercent;
            updateNote(noteIndex, { velocity: newVelocity }, { syncRedux: true });
        };
        
        const handleMouseUp = () => {
            setDraggingVolume(false);
            setVolumeDragNoteIndex(null);
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
        
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    };

    // Multi-note velocity drag in V mode (drag anywhere on the note)
    const velocityDragStateRef = useRef(null);
    const handleVelocityDragStart = (noteIndex, e) => {
        if (activeTool !== 'v') return;

        e.preventDefault();
        e.stopPropagation();

        // Which notes are affected: all selected, or just clicked note
        const affected = (selectedNotes && selectedNotes.size > 0)
            ? Array.from(selectedNotes)
            : [noteIndex];

        // Snapshot initial velocities
        const initial = {};
        affected.forEach(idx => {
            const v = Math.max(0, Math.min(1, (notes[idx]?.velocity ?? 0.8)));
            initial[idx] = v;
        });

        // Use note height for natural scaling (full note height ≈ full 0..1 change)
        const noteElement = e.target.closest('.note-box');
        const noteRect = noteElement?.getBoundingClientRect?.() || null;
        const noteHeight = Math.max(1, noteRect?.height || 24); // guard
        const startY = e.clientY;

        velocityDragStateRef.current = { affected, initial, startY, noteHeight };

        const onMove = (ev) => {
            const st = velocityDragStateRef.current;
            if (!st) return;
            const dy = st.startY - ev.clientY; // up = positive
            const delta = dy / st.noteHeight;  // proportion of note height

            // Apply to all affected notes
            const updated = [...notes];
            st.affected.forEach(idx => {
                const base = st.initial[idx] ?? 0.8;
                const next = Math.max(0, Math.min(1, base + delta));
                updated[idx] = { ...updated[idx], velocity: next };
            });
            // Sync so volume bars and Redux reflect live
            setNotes(updated);
            syncNotesToRedux(updated);
        };

        const onUp = () => {
            velocityDragStateRef.current = null;
            document.removeEventListener('mousemove', onMove);
            document.removeEventListener('mouseup', onUp);
        };

        document.addEventListener('mousemove', onMove);
        document.addEventListener('mouseup', onUp);
    };

    // Cursor tool - allows clicking and dragging notes without creating new ones
    const handleCursorToolClick = (e) => {
        if (activeTool !== 'cursor') return;
        
        // Check if preventDefault exists before calling it
        if (e && typeof e.preventDefault === 'function') {
            e.preventDefault();
        }
        if (e && typeof e.stopPropagation === 'function') {
            e.stopPropagation();
        }
        
        // Just move playhead to clicked position
        const rect = wrapperRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left + wrapperRef.current.scrollLeft;
        const rawTime = x / timelineWidthPerSecond;
        const gridSpacing = getGridSpacingWithTimeSignature(selectedGrid, selectedTime);
        const snappedTime = Math.max(0, Math.min(audioDuration, Math.round(rawTime / gridSpacing) * gridSpacing));
        
        dispatch(setStudioCurrentTime(snappedTime));
        try { Tone.Transport.seconds = snappedTime; } catch {}
        setLocalPlayheadTime(snappedTime);
    };

    // Pencil tool - creates new notes (default behavior)
    const handlePencilToolClick = (e) => {
        if (activeTool !== 'pencil') return;
        handleGridClick(e);
    };

    // Select tool (V) - allows multi-selection of notes
    const handleSelectToolClick = (e) => {
        if (activeTool !== 'v') return;
        
        // If clicking on empty space, clear selection
        if (!e.target.closest('.note-box')) {
            setSelectedNotes(new Set());
            setSelectedNoteIndex(null);
            return;
        }
    };

    // Trash tool - deletes notes on click
    const handleTrashToolClick = (e) => {
        if (activeTool !== 'trash') return;
        
        // Find the note that was clicked
        const noteElement = e.target.closest('.note-box');
        if (noteElement) {
            // Find the note index from the Rnd component
            const rndElement = noteElement.closest('[data-note-index]');
            if (rndElement) {
                const noteIndex = parseInt(rndElement.getAttribute('data-note-index'));
                if (!isNaN(noteIndex)) {
                    handleDeleteNote(noteIndex);
                }
            }
        }
    };

    // Enhanced delete function
    const handleDeleteNote = (noteIndex) => {
        if (noteIndex === null || noteIndex === undefined) return;
        
        const updatedNotes = notes.filter((_, idx) => idx !== noteIndex);
        setNotes(updatedNotes);
        syncNotesToRedux(updatedNotes);
        
        // Clear selection
        setSelectedNoteIndex(null);
        setSelectedNotes(new Set());
    };

    // Multi-select functionality
    const handleNoteSelection = (noteIndex, isMultiSelect = false) => {
        if (activeTool !== 'v') return;
        
        if (isMultiSelect) {
            setSelectedNotes(prev => {
                const newSelection = new Set(prev);
                if (newSelection.has(noteIndex)) {
                    newSelection.delete(noteIndex);
                } else {
                    newSelection.add(noteIndex);
                }
                return newSelection;
            });
        } else {
            setSelectedNotes(new Set([noteIndex]));
            setSelectedNoteIndex(noteIndex);
        }
    };

    // Delete selected notes
    const handleDeleteSelected = () => {
        if (selectedNotes.size === 0) return;
        
        const updatedNotes = notes.filter((_, idx) => !selectedNotes.has(idx));
        setNotes(updatedNotes);
        syncNotesToRedux(updatedNotes);
        
        setSelectedNotes(new Set());
        setSelectedNoteIndex(null);
    };

    // Keyboard shortcuts for tools
    useEffect(() => {
        const handleKeyDown = (e) => {
            // Only handle keyboard shortcuts when not in input fields
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
            
            // Tool shortcuts
            if (e.ctrlKey || e.metaKey) {
                switch (e.key) {
                    case '1':
                        e.preventDefault();
                        handleToolChange('cursor');
                        break;
                    case '2':
                        e.preventDefault();
                        handleToolChange('pencil');
                        break;
                    case '3':
                        e.preventDefault();
                        handleToolChange('v');
                        break;
                    case '4':
                        e.preventDefault();
                        handleToolChange('trash');
                        break;
                }
            }
            
            // Delete key for selected notes
            if ((e.key === 'Delete' || e.key === 'Backspace') && selectedNotes.size > 0) {
                e.preventDefault();
                handleDeleteSelected();
            }
            
            // Existing keyboard shortcuts
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
                        // Select all notes
                        if (activeTool === 'v') {
                            setSelectedNotes(new Set(notes.map((_, idx) => idx)));
                        }
                    }
                    break;
            }
        };
        
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedNoteIndex, clipboardNote, selectedNotes, activeTool, notes]);

        // Determine instrument by selected track
        const isDrumTrack = useMemo(() => {
            if (!selectedTrack) return false;
            const name = (selectedTrack.name || '').toLowerCase();
            return selectedTrack.type === 'drum' || name.includes('drum');
        }, [selectedTrack]);

    // Get track bounds for constraining notes
    const getTrackBounds = useCallback(() => {
        const trackObj = tracks?.find?.(t => t.id === currentTrackId);
        // Prefer corresponding clip type depending on track
        const persistedPiano = trackObj?.pianoClip || null;
        const persistedDrum = trackObj?.drumClip || null;
        const activePiano = (pianoRecordingClip && (pianoRecordingClip.trackId ?? null) === (currentTrackId ?? null)) ? pianoRecordingClip : persistedPiano;
        const activeDrum = (drumRecordingClip && (drumRecordingClip.trackId ?? null) === (currentTrackId ?? null)) ? drumRecordingClip : persistedDrum;
        const activeClip = isDrumTrack ? activeDrum : activePiano;
        if (activeClip && activeClip.start != null && activeClip.end != null) {
            return {
                start: activeClip.start,
                end: activeClip.end
            };
        }
        // Fallback: derive from notes if no clip
        if (notes.length > 0) {
            const minStart = Math.min(...notes.map(n => n.start));
            const maxEnd = Math.max(...notes.map(n => n.start + n.duration));
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
    }, [pianoRecordingClip, drumRecordingClip, currentTrackId, notes, tracks, isDrumTrack]);

    // For drum tracks, snap Y to 9 lanes (Q,W,E,A,S,D,Z,X,C)
    const clamp = (val, min, max) => Math.max(min, Math.min(max, val));
    const getDrumNoteIndexFromY = useCallback((yPx) => {
        const rawIndex = Math.floor(yPx / 30);
        return clamp(rawIndex, 0, 8);
    }, []);

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
                  
                  // Force immediate playhead position update
                  if (playheadRef.current) {
                      const scrollLeft = timelineContainerRef.current?.scrollLeft || 0;
                      playheadRef.current.style.transform = `translateX(${labelTime * timelineWidthPerSecond - scrollLeft}px)`;
                  }
                  
                  // Auto-scroll to keep playhead visible if needed
                  if (wrapperRef.current) {
                      const playheadX = labelTime * timelineWidthPerSecond;
                      const viewportLeft = wrapperRef.current.scrollLeft;
                      const viewportRight = viewportLeft + wrapperRef.current.clientWidth;
                      const edgePadding = 120;
                      
                      if (playheadX > viewportRight - edgePadding) {
                          wrapperRef.current.scrollLeft = Math.max(0, playheadX - wrapperRef.current.clientWidth + edgePadding);
                      } else if (playheadX < viewportLeft + edgePadding) {
                          wrapperRef.current.scrollLeft = Math.max(0, playheadX - edgePadding);
                      }
                  }
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
        
        // Account for piano keys width offset - ruler starts after piano keys
        const adjustedX = Math.max(0, x - PIANO_KEYS_WIDTH);
        const width = Math.max(audioDuration, 12) * timelineWidthPerSecond;
        
        // Calculate time based on adjusted position
        const rawTime = (adjustedX / width) * audioDuration;
        const gridSpacing = getGridSpacingWithTimeSignature(selectedGrid, selectedTime);
        const snappedTime = Math.max(0, Math.min(audioDuration, Math.round(rawTime / gridSpacing) * gridSpacing));
        return snappedTime;
    };
    const handleTimelineClick = (e) => {
        const snappedTime = computeSnappedTimeFromEvent(e);
        if (snappedTime === undefined) return;
        
        // Update Redux state
        dispatch(setStudioCurrentTime(snappedTime));
        
        // Update Tone.Transport
        try { 
            Tone.Transport.seconds = snappedTime; 
        } catch {}
        
        // Update local playhead time immediately
        setLocalPlayheadTime(snappedTime);
        
        // Force immediate playhead position update
        if (playheadRef.current) {
            const scrollLeft = timelineContainerRef.current?.scrollLeft || 0;
            playheadRef.current.style.transform = `translateX(${snappedTime * timelineWidthPerSecond - scrollLeft}px)`;
        }
        
        // Auto-scroll to keep playhead visible if needed
        if (wrapperRef.current) {
            const playheadX = snappedTime * timelineWidthPerSecond;
            const viewportLeft = wrapperRef.current.scrollLeft;
            const viewportRight = viewportLeft + wrapperRef.current.clientWidth;
            const edgePadding = 120;
            
            if (playheadX > viewportRight - edgePadding) {
                wrapperRef.current.scrollLeft = Math.max(0, playheadX - wrapperRef.current.clientWidth + edgePadding);
            } else if (playheadX < viewportLeft + edgePadding) {
                wrapperRef.current.scrollLeft = Math.max(0, playheadX - edgePadding);
            }
        }
        
        // Also sync the timeline header scroll position
        if (timelineContainerRef.current) {
            timelineContainerRef.current.scrollLeft = wrapperRef.current?.scrollLeft || 0;
        }
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
        
        // Force immediate playhead position update during scrubbing
        if (playheadRef.current) {
            const scrollLeft = timelineContainerRef.current?.scrollLeft || 0;
            playheadRef.current.style.transform = `translateX(${snappedTime * timelineWidthPerSecond - scrollLeft}px)`;
        }
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
    const mouseDownPosRef = useRef({ x: 0, y: 0 });
    const handleMouseDown = (e) => {
        mouseDownTime.current = Date.now();
        if (e && wrapperRef.current) {
            const rect = wrapperRef.current.getBoundingClientRect();
            mouseDownPosRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
        }
    };

    const handleMouseUp = (e) => {
        if (e.button !== 0) return; // only handle left-click
        // swallow clicks immediately after drag/resize (within 200ms)
        if (Date.now() - (lastInteractionTimeRef.current || 0) < 200) return;
        // 🛡️ Prevent adding new notes if context menu is open
       
        if (menuVisible || pasteMenu || selectedNoteIndex) return;

        const elapsed = Date.now() - mouseDownTime.current;
        // movement threshold to distinguish click vs drag
        let movedEnough = false;
        if (e && wrapperRef.current) {
            const rect = wrapperRef.current.getBoundingClientRect();
            const upPos = { x: e.clientX - rect.left, y: e.clientY - rect.top };
            const dx = Math.abs(upPos.x - mouseDownPosRef.current.x);
            const dy = Math.abs(upPos.y - mouseDownPosRef.current.y);
            movedEnough = dx > 3 || dy > 3;
        }
        if (elapsed < 200 && !movedEnough) {
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

    // Ensure playback uses a supported piano range (A0..C8) while labels stay the same
    const clampNoteToPlayable = useCallback((note) => {
        try {
            const midi = noteNameToMidi(note);
            const clamped = Math.max(21, Math.min(108, midi));
            return Tone.Frequency(clamped, 'midi').toNote();
        } catch {
            return note;
        }
    }, [noteNameToMidi]);

    
    // Deduplication guard to prevent multiple note creations from overlapping handlers
    const lastCreateRef = useRef({ time: 0, noteIndex: -1, start: -1 });

    const handleGridClick = (e) => {
        // Block note creation while dragging or resizing
        if (isDraggingRef.current || isResizingRef.current) return;
        if (menuVisible || selectedNoteIndex) return;
        if (pasteMenu) return;
        // Only respond to clicks on the grid background, not on notes
        if (e.target.closest && e.target.closest('.note-box')) return;

        // Tool-specific behavior
        switch (activeTool) {
            case 'cursor':
                handleCursorToolClick(e);
                return;
            case 'pencil':
                // Continue with existing note creation logic
                break;
            case 'v':
                handleSelectToolClick(e);
                return;
            case 'trash':
                handleTrashToolClick(e);
                return;
            default:
                break;
        }

        const currentTime = Date.now();
        if (currentTime - lastInteractionTimeRef.current < 300) {
            return; // Wait 300ms after drag/resize operations before allowing new note creation
        }
        
        // Allow note creation anywhere in the piano roll area, not just on SVG or red background
        // This enables clicking outside the red background region to create new notes
        const rect = wrapperRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left + wrapperRef.current.scrollLeft;
        const y = e.clientY - rect.top;
        
        // Use the exact same time calculation as Timeline.jsx
        const start = x / timelineWidthPerSecond;

        // For drum tracks, ignore clicks below the first 9 lanes entirely
        if (isDrumTrack) {
            const rawRow = Math.floor(y / 30);
            if (rawRow < 0 || rawRow > 8) return; // do not create any note
        }
        const noteIndex = isDrumTrack ? getDrumNoteIndexFromY(y) : Math.floor(y / 30);

        // Guard: ignore duplicate creations at the same lane and time within 250ms
        const now = Date.now();
        const last = lastCreateRef.current || { time: 0, noteIndex: -1, start: -1 };
        const isSameLane = last.noteIndex === noteIndex;
        const isSameStart = Math.abs((last.start || 0) - start) < 1e-3;
        if (isSameLane && isSameStart && (now - (last.time || 0)) < 250) {
            return;
        }
        lastCreateRef.current = { time: now, noteIndex, start };

        // Choose a sensible default duration for new notes:
        // If this track already has notes (e.g., from recording), match their typical size.
        const getTrackReferenceDuration = () => {
            try {
                const trackId = currentTrackId;
                const trackNotes = Array.isArray(pianoNotes)
                    ? pianoNotes.filter(n => (n?.trackId ?? null) === (trackId ?? null))
                    : [];
                if (trackNotes.length === 0) return 0.15; // fallback default

                // Compute median duration for stability (less sensitive to outliers)
                const durations = trackNotes
                    .map(n => Math.max(0.01, Number(n.duration) || 0.05))
                    .sort((a,b) => a - b);
                const mid = Math.floor(durations.length / 2);
                const median = durations.length % 2 ? durations[mid] : (durations[mid - 1] + durations[mid]) / 2;

                // Snap to grid subdivision to align visually with timeline grid
                const gridSpacing = getGridSpacingWithTimeSignature(selectedGrid, selectedTime);
                const snapped = Math.max(0.05, Math.round(median / gridSpacing) * gridSpacing);
                return snapped;
            } catch {
                return 0.15;
            }
        };

        let defaultDuration = getTrackReferenceDuration();
        if (isDrumTrack) {
            defaultDuration = DRUM_NOTE_DURATION;
        }
        
        // For drum tracks, restrict to first 9 keys (drum pads)
        const maxNoteIndex = isDrumTrack ? 8 : NOTES.length - 1;
        if (noteIndex >= 0 && noteIndex <= maxNoteIndex) {
            const note = NOTES[noteIndex];
            
            // Check if the click is within the current track bounds
            const trackBounds = getTrackBounds();
            const isWithinTrackBounds = start >= trackBounds.start && start <= trackBounds.end;
            
            // If outside track bounds, expand the track bounds to include the new note
            if (!isWithinTrackBounds && currentTrackId) {
                const currentNotes = Array.isArray(pianoNotes) ? pianoNotes : [];
                const trackNotes = currentNotes.filter(n => (n?.trackId ?? null) === currentTrackId);
                
                let newStart = trackBounds.start;
                let newEnd = trackBounds.end;
                
                if (start < trackBounds.start) {
                    newStart = start;
                } else if (start > trackBounds.end) {
                    newEnd = start + defaultDuration;
                }
                
                // Update the track bounds by updating the piano recording clip
                if (newStart !== trackBounds.start || newEnd !== trackBounds.end) {
                    const trackObj = tracks?.find?.(t => t.id === currentTrackId);
                    const currentClip = isDrumTrack ? (trackObj?.drumClip || null) : (trackObj?.pianoClip || null);
                    
                    if (currentClip) {
                        const payload = {
                            start: newStart,
                            end: newEnd,
                            color: currentClip.color,
                            trackId: currentTrackId
                        };
                        if (isDrumTrack) {
                            dispatch(setDrumRecordingClip(payload));
                        } else {
                            dispatch(setPianoRecordingClip(payload));
                        }
                    }
                }
            }
            
            // If no current track is selected, don't create notes
            if (!currentTrackId) {
                console.log('No current track selected, cannot create note');
                return;
            }
            
            // Play sound immediately for real-time feedback
            playNoteForTrack(note, defaultDuration);

            // Create note with real-time properties - ensure trackId is properly set
            const newNote = {
                note,
                start,
                duration: defaultDuration,
                velocity: 0.8, // Default velocity
                id: `note_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`, // Unique ID for real-time updates
                trackId: currentTrackId, // Ensure trackId is set to current track
                timestamp: Date.now(),
                ...(isDrumTrack ? { isUserDuration: false } : {})
            };

            if (isDrumTrack) {
                const padMapping = { 0: 'Q', 1: 'W', 2: 'E', 3: 'A', 4: 'S', 5: 'D', 6: 'Z', 7: 'X', 8: 'C' };
                const soundMapping = { 0: 'kick', 1: 'snare', 2: 'hihat', 3: 'openhat', 4: 'crash', 5: 'tom1', 6: 'tom2', 7: 'tom3', 8: 'perc' };
                
                newNote.padId = padMapping[noteIndex] || 'Q';
                newNote.drumSound = soundMapping[noteIndex] || 'kick';
                newNote.drumMachine = selectedDrumMachine?.name || 'default';
            }

            // Add note to local state with real-time updates
            setNotes(prev => {
                const updated = [...prev, newNote];
                // Use setTimeout to prevent synchronous Redux update during render
                setTimeout(() => syncNotesToRedux(updated), 0);
                return updated;
            });
            
            console.log('Note created successfully:', { note: newNote.note, start, trackId: newNote.trackId });
            
            // Clip sizing stays controlled by TimelineTrack
        }
    };

    // Drum instrument selection (default kit)
    const selectedDrumInstrument = useSelector((state) => selectStudioState(state)?.selectedDrumInstrument);
    const selectedDrumMachine = useMemo(() => {
        if (selectedDrumInstrument) {
            const found = drumMachineTypes.find(d => d.name === selectedDrumInstrument);
            if (found) return found;
        }
        return drumMachineTypes[0];
    }, [selectedDrumInstrument]);
    
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

        // Melodic instrument: start and keep a reference for key up (use clamped note)
        const playable = clampNoteToPlayable(note);
        const audioNode = pianoRef.current.play(playable);
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

    const getYFromNote = (note) => {
        if (isDrumTrack) {
            // For drum tracks, map notes back to their original drum pad positions (0-8)
            const noteIndex = NOTES.indexOf(note);
            // If the note is beyond the first 9 keys, clamp it to the drum range
            return Math.min(noteIndex, 8) * 30;
        }
        return NOTES.indexOf(note) * 30;
    };

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
    const isDraggingRef = useRef(false);
    const isResizingRef = useRef(false);
    const lastInteractionTimeRef = useRef(0); // drag/resize end timestamp
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
            duration: Math.max(0.05, newDuration) // Allow any duration, not just DRUM_NOTE_DURATION
        };
    
        // Update local state for real-time feedback, but don't sync to Redux yet
        // Redux sync will happen in onResizeStop for better performance
        updateNote(index, updatedNote, { syncRedux: false });
    };

    // Add this function after your existing helper functions
    const convertDrumHitsToPianoNotes = (drumHits, drumMachine) => {
        if (!Array.isArray(drumHits)) return [];
        
        // Map pad IDs to piano roll rows (NOTES array indices)
        const padToNoteMapping = {
            'Q': 0,   // Top row - kick
            'W': 1,   // Snare  
            'E': 2,   // Hi-hat
            'A': 3,   // Open hi-hat
            'S': 4,   // Crash
            'D': 5,   // Tom 1
            'Z': 6,   // Tom 2
            'X': 7,   // Tom 3
            'C': 8    // Percussion
        };
    
        return drumHits.map(hit => {
            const padId = hit.padId || 'Q';
            const noteIndex = padToNoteMapping[padId] || 0;
            const note = NOTES[noteIndex];
            
            return {
                note,
                start: hit.currentTime || 0,
                duration: (hit.isUserDuration ? (hit.decay || hit.duration) : null) || DRUM_NOTE_DURATION,
                velocity: 0.8,
                id: hit.id || `drum_note_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
                trackId: hit.trackId,
                timestamp: Date.now(),
                // Keep drum-specific properties
                padId: hit.padId,
                drumSound: hit.sound,
                drumMachine: hit.drumMachine
            };
        });
    };

    // Update your existing useEffect that loads notes from Redux
    useEffect(() => {
        if (!currentTrackId) {
            setNotes([]);
            return;
        }
        
        let localNotes = [];
        
        if (isDrumTrack) {
            // Convert drum hits to piano roll format
            const trackDrumHits = Array.isArray(drumRecordedData) 
                ? drumRecordedData.filter(hit => (hit.trackId ?? null) === (currentTrackId ?? null))
                : [];
            localNotes = convertDrumHitsToPianoNotes(trackDrumHits, selectedDrumMachine);
        } else {
            // Use existing piano notes logic
            const trackNotes = Array.isArray(pianoNotes) 
                ? pianoNotes.filter(note => (note.trackId ?? null) === (currentTrackId ?? null))
                : [];
            localNotes = trackNotes.map(note => ({
                note: note.note,
                start: note.startTime,
                duration: note.duration,
                velocity: note.velocity || 0.8,
                id: note.id,
                trackId: note.trackId,
                timestamp: Date.now()
            }));
        }
        
        // Only update if notes are actually different to prevent infinite renders
        setNotes(prevNotes => {
            // Quick length check first
            if (prevNotes.length !== localNotes.length) {
                return localNotes;
            }
            
            // Deep comparison only if lengths match
            if (localNotes.length === 0) return prevNotes;
            
            const hasChanged = prevNotes.some((prevNote, index) => {
                const localNote = localNotes[index];
                return !localNote || 
                       prevNote.id !== localNote.id || 
                       Math.abs((prevNote.start || 0) - (localNote.start || 0)) > 0.001 || 
                       Math.abs((prevNote.duration || 0) - (localNote.duration || 0)) > 0.001 ||
                       prevNote.note !== localNote.note;
            });
            
            if (hasChanged) {
                return localNotes;
            }
            
            return prevNotes;
        });
    // CRITICAL: Only depend on the data, not on functions to prevent infinite loops
    }, [pianoNotes, drumRecordedData, currentTrackId, isDrumTrack]);
    
    
    // Sync notes to Redux so Timeline shows red region + white mini boxes
    const syncNotesToRedux = useCallback((list) => {
        if (!currentTrackId || !Array.isArray(list)) return;
        try {
            // Only sync entries that belong to the current track
            const currentTrackNotes = list.filter(n => (n.trackId ?? null) === (currentTrackId ?? null));

            if (isDrumTrack) {
                // Convert piano roll notes back to drum hits
                const hits = currentTrackNotes.map((n) => {
                    // Use stored drum properties or derive from note position
                    const padMapping = { 0: 'Q', 1: 'W', 2: 'E', 3: 'A', 4: 'S', 5: 'D', 6: 'Z', 7: 'X', 8: 'C' };
                    const soundMapping = { 0: 'kick', 1: 'snare', 2: 'hihat', 3: 'openhat', 4: 'crash', 5: 'tom1', 6: 'tom2', 7: 'tom3', 8: 'perc' };
                
                    const noteIndex = NOTES.indexOf(n.note);
                    const padId = n.padId || padMapping[noteIndex] || 'Q';
                    const sound = n.drumSound || soundMapping[noteIndex] || 'kick';
                
                    return {
                        trackId: n.trackId,
                        currentTime: n.start || 0,
                        decay: n.duration || DRUM_NOTE_DURATION, // Use the actual note duration
                        duration: n.duration || DRUM_NOTE_DURATION, // Also store as duration for TimelineTrack
                        isUserDuration: n.isUserDuration === true,
                        padId: padId,
                        sound: sound,
                        drumMachine: n.drumMachine || selectedDrumMachine?.name || 'default',
                        id: n.id,
                        type: 'synth',
                        freq: 60
                    };
                });

                // Update drum data without affecting other tracks
                const existing = Array.isArray(drumRecordedData) ? drumRecordedData : [];
                const otherTracks = existing.filter(h => (h.trackId ?? null) !== (currentTrackId ?? null));
                const updated = [...otherTracks, ...hits];

                dispatch(setDrumRecordedData(updated));
            } else {
                // Melodic: map to piano notes for the timeline
                const mapped = currentTrackNotes.map(n => ({
                    note: n.note,
                    startTime: n.start,
                    duration: n.duration,
                    midiNumber: noteNameToMidi(n.note),
                    trackId: n.trackId,
                    id: n.id,
                    velocity: n.velocity || 0.8
                }));

                const currentReduxNotes = Array.isArray(pianoNotes) ? pianoNotes : [];
                const otherTrackNotes = currentReduxNotes.filter(n => (n.trackId ?? null) !== (currentTrackId ?? null));
                const updatedNotes = [...otherTrackNotes, ...mapped];
                dispatch(setPianoNotes(updatedNotes));
            }
        } catch {}
        // do nothing for clip sizing here
    }, [dispatch, noteNameToMidi, currentTrackId, pianoNotes, isDrumTrack, selectedDrumMachine, drumRecordedData]);
    
    // Clear local notes when track changes to prevent cross-contamination
    // useEffect(() => {
    //     setNotes([]);
    // }, [currentTrackId]);
    
    // Load/refresh local notes whenever Redux notes for this track change 
    // miss some notes (uncomment to solve)

    // useEffect(() => {
    //     if (!Array.isArray(pianoNotes) || !currentTrackId) return;
        
    //     // Only load notes that belong to the current track
    //     const trackNotes = pianoNotes.filter(note => (note.trackId ?? null) === (currentTrackId ?? null));
        
    //     const localNotes = trackNotes.map(note => ({
    //         note: note.note,
    //         start: note.startTime,
    //         duration: note.duration,
    //         velocity: note.velocity || 0.8,
    //         id: note.id,
    //         trackId: note.trackId,
    //         timestamp: Date.now()
    //     }));
        
    //     // Only update if the notes are actually different to avoid unnecessary re-renders
    //     setNotes(prevNotes => {
    //         if (prevNotes.length !== localNotes.length) return localNotes;
            
    //         // Check if any note has changed
    //         const hasChanged = prevNotes.some((prevNote, index) => {
    //             const localNote = localNotes[index];
    //             return !localNote || 
    //                    prevNote.id !== localNote.id || 
    //                    prevNote.start !== localNote.start || 
    //                    prevNote.duration !== localNote.duration ||
    //                    prevNote.note !== localNote.note;
    //         });
            
    //         return hasChanged ? localNotes : prevNotes;
    //     });
    // }, [pianoNotes, currentTrackId]);
    
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
        if (!selectedInstrument) return;

        Soundfont.instrument(audioContextRef.current, selectedInstrument, { destination: gainNodeRef.current })
            .then((p) => { 
                pianoRef.current = p;
            })
            .catch((error) => { 
                pianoRef.current = null;
            });
    }, [isDrumTrack, selectedInstrument]);



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
                const playable = clampNoteToPlayable(note);
                try { pianoRef.current.play(playable, undefined, { duration: Math.max(0.1, duration) }); } catch {}
            }
        } catch {}
    }, [isDrumTrack, noteNameToMidi, selectedDrumMachine, clampNoteToPlayable]);

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

    // Real-time visual shift of recording-sourced drum notes when the drum clip moves
    const prevDrumClipRef = useRef(null);
    useEffect(() => {
        if (!isDrumTrack || !currentTrackId) return;
        const clip = (drumRecordingClip && (drumRecordingClip.trackId ?? null) === (currentTrackId ?? null)) ? drumRecordingClip : null;
        const prev = prevDrumClipRef.current;
        prevDrumClipRef.current = clip ? { start: clip.start, end: clip.end } : null;
        if (!clip || !prev) return;
        const deltaStart = (clip.start || 0) - (prev.start || 0);
        const deltaEnd = (clip.end || 0) - (prev.end || 0);
        if (deltaStart === 0 && deltaEnd === 0) return;
        // Determine if user moved the whole clip (both edges shift equally) vs trimmed
        const EPS = 1e-4;
        const isMove = Math.abs(deltaStart - deltaEnd) < EPS && Math.abs(deltaStart) > EPS;
        if (!isMove) {
            // Trim: do NOT move notes. They will be hidden visually by the red region and timeline filtering.
            return;
        }
        const delta = deltaStart;
        // Movement: shift all notes for this drum track to keep visuals in sync while dragging
        setNotes(prevNotes => prevNotes.map(n => {
            if ((n.trackId ?? null) !== (currentTrackId ?? null)) return n;
            return { ...n, start: Math.max(0, (n.start || 0) + delta) };
        }));
    }, [isDrumTrack, currentTrackId, drumRecordingClip]);

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
            let noteIndex = Math.round(newY / 30);

            if (isDrumTrack) {
                if (noteIndex < 0 || noteIndex > 8) return;
                // optional: clamp again just to be sure
                noteIndex = Math.max(0, Math.min(8, noteIndex));
            }
            const note = NOTES[noteIndex];

            const pastedNote = {
                ...clipboardNote,
                start,
                note,
                ...(isDrumTrack ? (() => {
                    const padMapping = { 0: 'Q', 1: 'W', 2: 'E', 3: 'A', 4: 'S', 5: 'D', 6: 'Z', 7: 'X', 8: 'C' };
                    const soundMapping = { 0: 'kick', 1: 'snare', 2: 'hihat', 3: 'openhat', 4: 'crash', 5: 'tom1', 6: 'tom2', 7: 'tom3', 8: 'perc' };
                    return {
                        padId: padMapping[noteIndex] || 'Q',
                        drumSound: soundMapping[noteIndex] || 'kick',
                        drumMachine: selectedDrumMachine?.name || clipboardNote.drumMachine || 'default'
                    };
                })() : {}),
                trackId: currentTrackId || clipboardNote.trackId
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
    //const [notes1, setNotes1] = useState([]);
    // const handleFileChange = async (e) => {
    //     const file = e.target.files[0];
    //     if (!file) return;
    
    //     const audioBuffer = await decodeAudio(file);
    //     console.log("Decoded audio:", audioBuffer);
    
    //     const notes = detectNotes(audioBuffer);
    //     console.log("Detected Notes:", notes);
    // };
    
    // useEffect(() => {
    //     if (track[0]?.audioClips[0]?.url) {
    //         (async () => {
    //             const audioBuffer = await decodeAudio(track[0].audioClips[0].url);
    //             if (audioBuffer) {
    //                 const detected = detectNotes(audioBuffer);
    //                 if (detected && Array.isArray(detected)) {
    //                     syncNotesToRedux(detected);
    //                 }
    //             }
    //         })();
    //     }
    // }, [track, syncNotesToRedux]);

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
        <div className='relative'>
            <div className={`relative w-full h-[490px] bg-[#1e1e1e] text-white ${selectedNoteIndex || pasteMenu ? 'overflow-hidden' : 'overflow-y-auto overflow-x-hidden'}  pb-12`} onWheel={handleWheel}>
                <div
                    ref={timelineContainerRef}
                    className="fixed left-0 right-0 h-[80px] overflow-x-auto overflow-y-hidden z-[5] hover:bg-[#2a2a2a] transition-colors duration-150"
                    style={{ background: "#1F1F1F", cursor: 'pointer' }}
                    onClick={handleTimelineClick}
                    onMouseDown={onHeaderMouseDown}
                    onScroll={handleScroll}
                    onWheel={(e) => {
                        if (e.ctrlKey || e.metaKey) return;
                        const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
                        if (delta) {
                            e.preventDefault();
                            const next = Math.max(0, (timelineContainerRef.current?.scrollLeft || 0) + delta);
                            if (timelineContainerRef.current) timelineContainerRef.current.scrollLeft = next;
                            if (wrapperRef.current) wrapperRef.current.scrollLeft = next;
                        }
                    }}
                >
                    <div style={{ width: `${Math.max(audioDuration, 12) * timelineWidthPerSecond}px`, height: "100%", position: "relative", minWidth: "100%", transition: "width 0.2s ease-in-out"}}>
                        <svg ref={timelineHeaderRef} width="100%" height="100%" style={{ color: "white", width: "100%", transition: "width 0.2s ease-in-out"}}/>
                    </div>
                </div>

                <div
                    ref={playheadRef}
                    style={{ position: "fixed", top: "110px", left: `${PIANO_KEYS_WIDTH}px`, height: "100%", width: "2px", background: "#AD00FF", zIndex: 25, pointerEvents: "auto", cursor: "pointer", transform: `translateX(${localPlayheadTime * timelineWidthPerSecond - (timelineContainerRef.current?.scrollLeft || 0)}px)`, willChange: "transform"}}
                    onClick={(e) => {
                        const rect = playheadRef.current.getBoundingClientRect();
                        const x = e.clientX - rect.left + (timelineContainerRef.current?.scrollLeft || 0);
                        
                        const adjustedX = Math.max(0, x - PIANO_KEYS_WIDTH);
                        const width = Math.max(audioDuration, 12) * timelineWidthPerSecond;
                        const rawTime = (adjustedX / width) * audioDuration;
                        const gridSpacing = getGridSpacingWithTimeSignature(selectedGrid, selectedTime);
                        const snappedTime = Math.max(0, Math.min(audioDuration, Math.round(rawTime / gridSpacing) * gridSpacing));
                        
                        dispatch(setStudioCurrentTime(snappedTime));
                        try { Tone.Transport.seconds = snappedTime; } catch {}
                        setLocalPlayheadTime(snappedTime);
                        
                        if (playheadRef.current) {
                            const scrollLeft = timelineContainerRef.current?.scrollLeft || 0;
                            playheadRef.current.style.transform = `translateX(${snappedTime * timelineWidthPerSecond - scrollLeft}px)`;
                        }
                    }}
                >
                    <div style={{ position: "absolute", top: "0px", left: "-6px", width: "16px", height: "5px", borderLeft: "0px solid transparent", borderRight: "0px solid transparent", borderTop: "15px solid #AD00FF", borderRadius: "3px",}}/>
                </div>

                <div className="absolute left-0 top-[80px] w-24 h-[560px] bg-[#1a1a1a] border-r border-gray-700" style={{zIndex: 3}}>
                    {NOTES.map((note) => (
                        <button key={note} onMouseDown={() => handleKeyDown(note)} onMouseUp={() => handleKeyUp(note)} onMouseLeave={() => handleKeyUp(note)} className={`h-[30px] min-h-[30px] text-xs ${note.includes('#') ? 'bg-black text-white w-[50%]' : 'bg-white w-full'} border`}>
                            {note}
                        </button>
                    ))}
                </div>

                <div
                    ref={wrapperRef}
                    className={`absolute left-24 top-[80px] right-0 ${selectedNoteIndex || pasteMenu ? 'overflow-hidden' : ' overflow-x-auto overflow-y-auto'}`}
                    style={{ background: "#1e1e1e", zIndex: 2 }}
                    onScroll={handleScroll}
                    onMouseDown={handleMouseDown}
                    onMouseUp={(e) => {
                        if (e.button !== 0) return;
                        if (e.target.closest && e.target.closest('.note-box')) return;
                        handleMouseUp(e);
                    }}
                    onClick={(e) => {
                         if (e.target === wrapperRef.current || e.target.tagName === 'svg' || e.target.classList.contains('note-bg-div')) {
                             const rect = wrapperRef.current.getBoundingClientRect();
                             const x = e.clientX - rect.left + wrapperRef.current.scrollLeft;
                             
                             const rawTime = x / timelineWidthPerSecond;
                             const gridSpacing = getGridSpacingWithTimeSignature(selectedGrid, selectedTime);
                             const snappedTime = Math.max(0, Math.min(audioDuration, Math.round(rawTime / gridSpacing) * gridSpacing));
                             
                             dispatch(setStudioCurrentTime(snappedTime));
                             try { Tone.Transport.seconds = snappedTime; } catch {}
                             setLocalPlayheadTime(snappedTime);
                             
                             if (playheadRef.current) {
                                 const scrollLeft = wrapperRef.current.scrollLeft || 0;
                                 playheadRef.current.style.transform = `translateX(${snappedTime * timelineWidthPerSecond - scrollLeft}px)`;
                             }
                         }
                        
                        if (!e.target.closest('.note-box') && !e.target.classList.contains('note-bg-div')) {
                            console.log('Wrapper clicked, creating note...');
                            const syntheticEvent = {
                                ...e,
                                clientX: e.clientX,
                                clientY: e.clientY,
                                target: e.target
                            };
                            handleGridClick(syntheticEvent);
                        }
                     }}
                    onContextMenu={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        if (e.target.closest('.note-box')) return;
                        if (clipboardNote) {
                            const wrapperRect = wrapperRef.current.getBoundingClientRect();
                            setPasteMenu(true);
                            setSelectedNoteIndex(null);
                            setPosition({
                                x: e.clientX - wrapperRect.left,
                                y: e.clientY - wrapperRect.top,
                            });
                        }
                    }}

                >
                    <style>{`.pianoroll-playhead-transform{transform: translateX(${(typeof localPlayheadTime === 'number' ? localPlayheadTime : 0) * timelineWidthPerSecond}px);}`}</style>
                    <div className="pianoroll-playhead-transform" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, pointerEvents: 'none', zIndex: 24 }} />
                    <div style={{ position: 'absolute', left: 0, top: 0, width: '100%', height: '100%', zIndex: 1, pointerEvents: 'auto'}}
                        onClick={(e) => {
                            if (!e.target.closest('.note-box') && !e.target.classList.contains('note-bg-div')) {
                                console.log('Invisible overlay clicked, creating note...');
                                const syntheticEvent = {
                                    ...e,
                                    clientX: e.clientX,
                                    clientY: e.clientY,
                                    target: e.target
                                };
                                handleGridClick(syntheticEvent);
                            }
                        }}
                    />
                    
                    {(() => {
                        const trackObj = tracks?.find?.(t => t.id === currentTrackId);
                        const persistedPiano = trackObj?.pianoClip || null;
                        const persistedDrum = trackObj?.drumClip || null;
                        const activePiano = (pianoRecordingClip && (pianoRecordingClip.trackId ?? null) === (currentTrackId ?? null)) ? pianoRecordingClip : persistedPiano;
                        const activeDrum = (drumRecordingClip && (drumRecordingClip.trackId ?? null) === (currentTrackId ?? null)) ? drumRecordingClip : persistedDrum;
                        const activeClip = isDrumTrack ? activeDrum : activePiano;
                        if (activeClip && activeClip.start != null && activeClip.end != null) {
                            const left = (activeClip.start || 0) * timelineWidthPerSecond;
                            const width = Math.max(0, (activeClip.end - activeClip.start)) * timelineWidthPerSecond;
                            return (
                                <div className="note-bg-div border border-[#E44F65] " style={{ position: 'absolute', left: `${left}px`, top: 0, width: `${width}px`, height: '100%', background: 'rgba(255, 0, 0, 0.1)', zIndex: 2, opacity: 1, borderRadius: '5px', transition: "left 0.2s ease-in-out, width 0.2s ease-in-out"}}
                                    onMouseDown={handleMouseDown}
                                    onMouseUp={handleMouseUp}
                                />
                            );
                        }
                        if (notes.length > 0) {
                            const minStart = Math.min(...notes.map(n => n.start));
                            const maxEnd = Math.max(...notes.map(n => n.start + n.duration));
                            const left = minStart * timelineWidthPerSecond;
                            const width = (maxEnd - minStart) * timelineWidthPerSecond;
                            return (
                                <div className="note-bg-div border border-[#E44F65] "
                                    style={{ position: 'absolute', left: `${left}px`, top: 0, width: `${width}px`, height: '100%', background: 'rgba(255, 0, 0, 0.1)', zIndex: 2, opacity: 1, borderRadius: '5px', transition: "left 0.2s ease-in-out, width 0.2s ease-in-out"}}
                                    onMouseDown={handleMouseDown}
                                    onMouseUp={handleMouseUp}
                                />
                            );
                        }
                        return null;
                    })()}
                    {notes.map((n, i) => {
                        const trackBounds = getTrackBounds();
                        
                        if (n.start >= trackBounds.end || (n.start + n.duration) <= trackBounds.start) {
                            return null;
                        }
                        
                        const isSelected = selectedNotes.has(i) || selectedNoteIndex === i;
                        return (
                            <Rnd
                                key={i}
                                data-note-index={i}
                                size={{ width: n.duration * timelineWidthPerSecond > 15 ? n.duration * timelineWidthPerSecond : 15, height: 24 }}
                                position={{ x: n.start * timelineWidthPerSecond, y: getYFromNote(n.note) }}
                                bounds="parent"
                                enableResizing={activeTool === 'v' ? { 
                                    right: false,
                                    left: false,
                                    top: false,
                                    bottom: false,
                                    topRight: false,
                                    bottomRight: false,
                                    bottomLeft: false,
                                    topLeft: false
                                } : { 
                                    right: true,
                                    left: false,
                                    top: false,
                                    bottom: false,
                                    topRight: false,
                                    bottomRight: false,
                                    bottomLeft: false,
                                    topLeft: false
                                }}
                                dragAxis="both"
                                dragGrid={[1, 30]}
                                disableDragging={activeTool === 'v' || activeTool === "trash"}
                                style={{ willChange: 'transform', zIndex: 3 }}
                                onDragStart={() => { isDraggingRef.current = true; }}
                                onDrag={(e, d) => {
                                    const snappedY = Math.round(d.y / 30) * 30;
                                    let noteIndex = Math.round(d.y / 30);
                                    
                                    if (isDrumTrack) {
                                        noteIndex = Math.max(0, Math.min(8, noteIndex));
                                        d.y = noteIndex * 30;
                                    }
                                    
                                    const newNote = NOTES[noteIndex];
                                    const newStartTime = d.x / timelineWidthPerSecond;
                                    
                                    handleNoteDrag(i, newStartTime, newNote);
                                }}
                                onDragStop={(e, d) => {
                                    e.stopPropagation();
                                    isDraggingRef.current = false;
                                    lastInteractionTimeRef.current = Date.now();
                                    
                                    let noteIndex = Math.round(d.y / 30);
                                    
                                    if (isDrumTrack) {
                                        noteIndex = Math.max(0, Math.min(8, noteIndex));
                                        d.y = noteIndex * 30;
                                    }
                                    
                                    const newNote = NOTES[noteIndex];
                                    const newStartTime = d.x / timelineWidthPerSecond;
                                    
                                    const updates = { 
                                        start: newStartTime, 
                                        note: newNote,
                                        ...(isDrumTrack ? (() => {
                                            const padMapping = { 0: 'Q', 1: 'W', 2: 'E', 3: 'A', 4: 'S', 5: 'D', 6: 'Z', 7: 'X', 8: 'C' };
                                            const soundMapping = { 0: 'kick', 1: 'snare', 2: 'hihat', 3: 'openhat', 4: 'crash', 5: 'tom1', 6: 'tom2', 7: 'tom3', 8: 'perc' };
                                            return {
                                                padId: padMapping[noteIndex] || 'Q',
                                                drumSound: soundMapping[noteIndex] || 'kick',
                                                drumMachine: selectedDrumMachine?.name || n.drumMachine || 'default'
                                            };
                                        })() : {})
                                    };
                                    
                                    setNotes(prev => {
                                        const updated = [...prev];
                                        updated[i] = { ...updated[i], ...updates };
                                        syncNotesToRedux(updated);
                                        return updated;
                                    });
                                    
                                    if (dragCacheRef.current) {
                                        delete dragCacheRef.current[i];
                                    }
                                }}
                                
                                onResizeStart={() => { isResizingRef.current = true; }}
                                onResize={(e, direction, ref, delta, position) => {
                                    const newWidth = parseFloat(ref.style.width);
                                    const newDuration = Math.max(0.05, newWidth / timelineWidthPerSecond);
                                    handleNoteResize(i, newDuration);
                                }}
                                onResizeStop={(e, direction, ref, delta, position) => {
                                    e.stopPropagation();
                                    isResizingRef.current = false;
                                    lastInteractionTimeRef.current = Date.now();
                                    
                                    const newWidth = parseFloat(ref.style.width);
                                    const newDuration = Math.max(0.05, newWidth / timelineWidthPerSecond);
                                    const newStartTime = position.x / timelineWidthPerSecond;
                                    
                                    setNotes(prev => {
                                        const updated = [...prev];
                                        updated[i] = { 
                                            ...updated[i], 
                                            duration: newDuration,
                                            start: newStartTime,
                                            ...(isDrumTrack ? { isUserDuration: true } : {})
                                        };
                                        syncNotesToRedux(updated);
                                        return updated;
                                    });
                                    
                                    if (dragCacheRef.current) {
                                        delete dragCacheRef.current[i];
                                    }
                                }}
                            >
                            <div className={`note-box bg-red-500 rounded w-full h-full relative z-1 ${ isSelected ? 'border-[2px] border-white' : 'border' } transition-colors duration-75 hover:bg-red-400 cursor-grab active:cursor-grabbing`}
                                    onMouseDown={(e) => {
                                        // In V mode, dragging up/down anywhere on the note adjusts velocity
                                        if (activeTool === 'v') {
                                            handleVelocityDragStart(i, e);
                                        }
                                    }}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (activeTool === 'v') {
                                            handleNoteSelection(i, e.ctrlKey || e.metaKey);
                                        } else if (activeTool === 'trash') {
                                            handleDeleteNote(i);
                                        } else {
                                        playNoteForTrack(n.note, Math.max(0.1, n.duration || 0.2));
                                        }
                                    }}
                                    onContextMenu={(e) => {
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
                                    {/* Volume bar - only show when V tool is active */}
                                    {volumeBarVisible && (
                                        <div 
                                            className="absolute bottom-0 left-0 h-1 bg-white rounded-b cursor-pointer"
                                            style={{ 
                                                width: `${(n.velocity || 0.8) * 100}%`,
                                                minWidth: '2px'
                                            }}
                                            onMouseDown={(e) => handleVolumeDrag(i, e)}
                                            title={`Velocity: ${Math.round((n.velocity || 0.8) * 100)}%`}
                                        />
                                    )}
                                    
                                    {/* Volume percentage text - only show when V tool is active and note is selected */}
                                    {volumeBarVisible && isSelected && (
                                        <div className="absolute top-0 right-0 text-xs text-white bg-black bg-opacity-50 px-1 rounded">
                                            {Math.round((n.velocity || 0.8) * 100)}%
                                        </div>
                                    )}
                                    
                                    {(menuVisible && selectedNoteIndex === i) ? (
                                        <ul className="absolute bg-[#1F1F1F] text-black border border-[#1F1F1F] shadow rounded flex" style={{ top: '100%', right: 0, zIndex: 1000, listStyle: 'none', padding: '0px   ',}}>
                                            <li className="hover:bg-gray-200 hover:text-[#1F1F1F] cursor-pointer text-sm p-3 text-white" onClick={() => { handleCut() }}><IoCutOutline className='text-[16px]' /></li>
                                            <li className="hover:bg-gray-200 hover:text-[#1F1F1F] cursor-pointer text-sm p-3 text-white" onClick={() => { handleCopy() }}><FaRegCopy className='text-[16px]' /></li>
                                            <li className="hover:bg-gray-200 hover:text-[#1F1F1F] cursor-pointer text-sm p-3 text-white" onClick={() => { handleDelete() }}><MdDelete className='text-[16px]' /></li>
                                        </ul>
                                    ): null}
                                </div>
                            </Rnd>
                        );
                    })}

                    <svg ref={svgRef} style={{ width: `${Math.max(audioDuration, 12) * timelineWidthPerSecond}px`, height: "100%",transition: "width 0.2s ease-in-out"}}>
                        <g />
                    </svg>
                    {(pasteMenu && clipboardNote) ? (
                        <span className='bg-[#1F1F1F] text-white hover:bg-gray-200 hover:text-[#1F1F1F] absolute cursor-pointer text-sm p-3' ref={pasteMenuRef} style={{ top: position.y, left: position.x, zIndex: 9999, listStyle: 'none', padding: '4px', }}
                            onClick={(e) => {
                                e.stopPropagation();
                                handlePaste();
                            }}
                        >
                            <FaPaste className='text-[16px]' />
                        </span>
                    ) : null}
                </div>
            </div>

            {/* Bottom-centered toolbar */}
            <div className="absolute bottom-[100px] left-1/2 -translate-x-1/2 transform z-[10000]">
                <div className="flex items-center gap-2 bg-[#1F1F1F] text-white px-2 py-1 rounded-full shadow-md">
                    {/* Cursor */}
                    <button className={`p-2 rounded hover:bg-gray-700 transition ${activeTool === 'cursor' ? 'bg-gray-600' : ''}`} onClick={() => handleToolChange('cursor')} title="Cursor (Ctrl+1)">
                        <RxCursorArrow />
                    </button>
                    {/* Pencil */}
                    <button className={`p-2 rounded hover:bg-gray-700 transition ${activeTool === 'pencil' ? 'bg-gray-600' : ''}`} onClick={() => handleToolChange('pencil')} title="Pencil (Ctrl+2)">
                        <BsPencil />
                    </button>
                    {/* V letter */}
                    <button className={`p-2 rounded hover:bg-gray-700 transition font-bold ${activeTool === 'v' ? 'bg-gray-600' : ''}`} onClick={() => handleToolChange('v')} title="Select (Ctrl+3)">
                        V
                    </button>
                    {/* Trash */}
                    <button className={`p-2 rounded hover:bg-gray-700 transition ${activeTool === 'trash' ? 'bg-gray-600' : ''}`} onClick={() => handleToolChange('trash')} title="Delete (Ctrl+4)">
                        <RiDeleteBin6Line />
                    </button>
                </div>
            </div>
        </div>
        </>
    );
};

export default PianoRolls;