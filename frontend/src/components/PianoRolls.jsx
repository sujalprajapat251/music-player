import React, { useState, useRef, useEffect, useCallback } from 'react';
import * as Tone from 'tone';
import { Rnd } from 'react-rnd';
import 'react-resizable/css/styles.css';
import * as d3 from 'd3';
import { useSelector } from 'react-redux';
import { selectGridSettings } from '../Redux/Slice/grid.slice';
import { getGridDivisions } from '../Utils/gridUtils';
import { FaPaste, FaRegCopy } from 'react-icons/fa';
import { MdDelete } from "react-icons/md";
import { IoCutOutline } from 'react-icons/io5';
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
    const svgRef = useRef();
    const wrapperRef = useRef();
    const timelineHeaderRef = useRef();
    const timelineContainerRef = useRef();
    const [scale, setScale] = useState(8); // Zoom scale
    const [currentTime, setCurrentTime] = useState(25); // Current playhead position
    const [scrollLeft, setScrollLeft] = useState(0); // Horizontal scroll position

    const baseWidth = 1000;  // Increased base width for more content
    const height = 600;
    const rowHeight = 30;
    const audioDuration = 1 * 60; // Default duration in seconds
    const pixelsPerSecond = 50; // Increased spacing between seconds

    // get data from redux
    const track = useSelector((state)=>state.studio.tracks)
    console.log('track',track);
    // Get grid settings from Redux
    const { selectedGrid } = useSelector(selectGridSettings);

    const renderRuler = useCallback(() => {
        if (!timelineHeaderRef.current) return;

        const svg = d3.select(timelineHeaderRef.current);
        const svgNode = timelineHeaderRef.current;
        if (scale <= 2) {
            setScale(2);
        }
        const minWidth = scale <= 2 ? baseWidth * 2 : baseWidth * scale;
        const width = Math.max(svgNode.clientWidth || 600, minWidth);
        const axisY = 50; // Center of the header
        const duration = audioDuration;
        console.log("scale", scale, minWidth, width)
        svg.selectAll("*").remove();

        if (width <= 0 || duration <= 0) return;

        // Use shared X position function
        const xForTime = (t) => getXForTime(t, duration, width);
        const labelInterval = 2; // Show every 2 seconds (odd numbers like 1, 3, 5...)

        const gridDivisions = getGridDivisions(selectedGrid);
        const gridSpacing = 1 / gridDivisions;
        const gridColor = "#FFFFFF";

        // Draw the main ruler line
        svg
            .append("line")
            .attr("x1", 0)
            .attr("y1", axisY)
            .attr("x2", width)
            .attr("y2", axisY)
            .attr("stroke", gridColor)
            .attr("stroke-width", 1);

        // Draw tick marks and labels
        for (let time = 0; time <= duration; time += gridSpacing) {
            const x = xForTime(time);
            const isMainBeat = Math.abs(time - Math.round(time)) < 0.01;
            const isHalfBeat = Math.abs(time - Math.round(time * 2) / 2) < 0.01;
            const isQuarterBeat = Math.abs(time - Math.round(time * 4) / 4) < 0.01;
            const sec = Math.round(time);
            const isLabeled = sec % labelInterval === 1 && isMainBeat; // Show odd numbers

            let tickHeight = 4;
            let strokeWidth = 0.5;
            let opacity = 0.6;

            if (isMainBeat) {
                tickHeight = 12;
                strokeWidth = 1;
                opacity = 1;
            } else if (isHalfBeat) {
                tickHeight = 8;
                strokeWidth = 0.8;
                opacity = 0.8;
            } else if (isQuarterBeat) {
                tickHeight = 6;
                strokeWidth = 0.6;
                opacity = 0.7;
            }

            // Draw tick mark
            svg
                .append("line")
                .attr("x1", x)
                .attr("y1", axisY)
                .attr("x2", x)
                .attr("y2", axisY + tickHeight)
                .attr("stroke", gridColor)
                .attr("stroke-width", strokeWidth)
                .attr("opacity", opacity);

            // Draw labels for odd numbers
            if (isLabeled) {
                svg
                    .append("text")
                    .attr("x", x)
                    .attr("y", axisY - 8)
                    .attr("fill", "white")
                    .attr("font-size", 11)
                    .attr("text-anchor", "middle")
                    .attr("font-family", "Arial, sans-serif")
                    .text(sec.toString() + 's');
            }
        }
    }, [audioDuration, selectedGrid, scale, baseWidth]);

    useEffect(() => {
        renderRuler();
    }, [renderRuler, audioDuration, selectedGrid, scale]);

    const drawGrid = (zoomScale) => {
        const svg = d3.select(svgRef.current);
        const group = svg.select('g');
        group.selectAll('*').remove();

        const width = baseWidth * zoomScale;
        const height = NOTES.length * 30;

        svg.attr('width', width).attr('height', height);

        // Get grid divisions from Redux to match timeline
        const gridDivisions = getGridDivisions(selectedGrid);
        const gridSpacing = 1 / gridDivisions;
        const duration = audioDuration;
        // Use shared X position function
        const xForTime = (t) => getXForTime(t, duration, width);

        // Vertical lines - aligned with timeline tick marks
        for (let time = 0; time <= duration; time += gridSpacing) {
            const x = xForTime(time);
            const isMainBeat = Math.abs(time - Math.round(time)) < 0.01;
            const isHalfBeat = Math.abs(time - Math.round(time * 2) / 2) < 0.01;
            const isQuarterBeat = Math.abs(time - Math.round(time * 4) / 4) < 0.01;

            let strokeColor = '#ffffff15';
            let strokeWidth = 1;

            if (isMainBeat) {
                strokeColor = '#ffffff44';
                strokeWidth = 1.5;
            } else if (isHalfBeat) {
                strokeColor = '#ffffff30';
                strokeWidth = 1.2;
            } else if (isQuarterBeat) {
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
    };

    useEffect(() => {
        drawGrid(scale);
    }, [scale, selectedGrid]);

    const handleZoomIn = () => {
        setScale((prev) => Math.min(prev + 0.25, 8));
    };

    const handleZoomOut = () => {
        setScale((prev) => Math.max(prev - 0.25, 0.5));
    };

    // Handle horizontal scroll
    const handleScroll = (e) => {
        const scrollLeft = e.target.scrollLeft;
        setScrollLeft(scrollLeft);

        // Sync timeline header scroll with grid scroll
        if (timelineContainerRef.current) {
            timelineContainerRef.current.scrollLeft = scrollLeft;
        }
    };

    // Handle Ctrl + scroll wheel for zoom
    const handleWheel = (e) => {
        if (e.ctrlKey) {
            e.preventDefault(); // Prevent default browser zoom

            if (e.deltaY < 0) {
                // Scroll up - zoom in
                handleZoomIn();
            } else {
                // Scroll down - zoom out
                handleZoomOut();
            }
        }
    };

    // Calculate playhead position


    const handleTimelineClick = (e) => {
        if (!timelineHeaderRef.current) return;
        const rect = timelineHeaderRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const width = Math.max(rect.width, baseWidth * scale);
        const rawTime = (x / width) * audioDuration;

        // Snap to nearest grid division
        const gridDivisions = getGridDivisions(selectedGrid);
        const gridSpacing = 1 / gridDivisions;
        const snappedTime = Math.round(rawTime / gridSpacing) * gridSpacing;

        setCurrentTime(snappedTime);
    };

    // timeline handling over

    // piano key handling start

    const [notes, setNotes] = useState([]);
    const [startTime, setStartTime] = useState(null);
    const [activeNotes, setActiveNotes] = useState({});
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
    // --- update handleGridClick to play sound and add note at correct position ---
    const handleGridClick = (e) => {
        if (menuVisible || selectedNoteIndex) return;
        if (pasteMenu) return;
        // Only respond to clicks on the grid background, not on notes
        if (e.target.tagName !== 'svg' && !e.target.classList.contains('bg-red-500') && !e.target.classList.contains('note-bg-div')) return;
        const rect = svgRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const start = x / (GRID_UNIT * 2 * scale);
        const noteIndex = Math.floor(y / 30);
        // Remove restriction: allow adding anywhere
        if (noteIndex >= 0 && noteIndex < NOTES.length) {
            const note = NOTES[noteIndex];
            // Play the note sound
            const synth = new Tone.Synth().toDestination();
            synth.triggerAttackRelease(note, '8n');
            setNotes(prev => [
                ...prev,
                {
                    note,
                    start,
                    duration: 0.1, // default duration
                },
            ]);
        }
    };
    const handleKeyDown = (note) => {
        if (activeNotes[note]) return;

        const synth = new Tone.Synth().toDestination();
        const time = Tone.now();
        synth.triggerAttack(note, time);

        setActiveNotes((prev) => ({
            ...prev,
            [note]: { synth, startTime: time },
        }));
    };

    const handleKeyUp = (note) => {
        const noteInfo = activeNotes[note];
        if (!noteInfo) return;

        const endTime = Tone.now();
        const duration = endTime - noteInfo.startTime;
        noteInfo.synth.triggerRelease(endTime);

        const noteObj = {
            note,
            start: noteInfo.startTime - startTime,
            duration,
        };

        setNotes((prev) => [...prev, noteObj]);

        setActiveNotes((prev) => {
            const copy = { ...prev };
            delete copy[note];
            return copy;
        });
    };

    const getYFromNote = (note) => NOTES.indexOf(note) * 30;

    const updateNote = (index, updates) => {
        setNotes(prev => {
            const updated = [...prev];
            updated[index] = { ...updated[index], ...updates };
            return updated;
        });
    };
    // piano key handling over


    // playing time line
    const [isPlaying, setIsPlaying] = useState(false);

    const synthRef = useRef(null);
    const [playheadPosition, setPlayheadPosition] = useState(0); // in seconds
    const playheadRef = useRef(null);
    const animationRef = useRef(null);
    useEffect(() => {
        if (wrapperRef.current) {
            wrapperRef.current.scrollLeft = playheadPosition * scale - 100; // 100px padding
        }
    }, [playheadPosition]);

    const startPlayheadAnimation = () => {
        const update = () => {
            const currentTime = Tone.Transport.seconds;
            setPlayheadPosition(currentTime);
            animationRef.current = requestAnimationFrame(update);
        };
        animationRef.current = requestAnimationFrame(update);
    };

    const stopPlayheadAnimation = () => {
        cancelAnimationFrame(animationRef.current);
    };
    const handlePlayPause = async () => {
        if (!synthRef.current) {
            synthRef.current = new Tone.PolySynth().toDestination();
        }

        await Tone.start();

        if (!isPlaying) {
            // ⬇️ Only schedule notes if Transport is NOT already running
            if (Tone.Transport.state !== "started") {
                notes.forEach(n => {
                    Tone.Transport.schedule((time) => {
                        synthRef.current.triggerAttackRelease(n.note, n.duration, time);
                    }, n.start);
                });
            }

            Tone.Transport.start(); // ⬅️ Resumes from current position
            setIsPlaying(true);
            startPlayheadAnimation();
        } else {
            Tone.Transport.pause(); // ⬅️ Pauses without resetting
            setIsPlaying(false);
            stopPlayheadAnimation();
        }
    };



    // right click menu handler 
    const menuRef = useRef(null);
    const [selectedNoteIndex, setSelectedNoteIndex] = useState(null);
    console.log('selectedNoteIndex', selectedNoteIndex)
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
    const [clipboardNote, setClipboardNote] = useState(null);
    const pasteMenuRef = useRef(null);
    const [position, setPosition] = useState({ x: 0, y: 0 });

    const [pasteMenu, setPasteMenu] = useState(false);
    const handleDelete = () => {
        if (selectedNoteIndex !== null) {
            const updatedNotes = notes.filter((_, idx) => idx !== selectedNoteIndex);
            setNotes(updatedNotes);
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
            const start = newX / (GRID_UNIT * 2 * scale);

            // Convert Y to note index
            const noteIndex = Math.round(newY / 30);
            const note = NOTES[noteIndex];

            const pastedNote = {
                ...clipboardNote,
                start,
                note,
            };

            setNotes((prev) => [...prev, pastedNote]);

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



    // --- ZOOM CONTROLS ---
    // Add visible zoom in/out buttons
    const ZoomControls = () => (
        <div className="absolute top-2 left-2 z-30 flex gap-2">
            <button
                className="w-8 h-8 bg-gray-700 hover:bg-gray-600 rounded-full flex items-center justify-center cursor-pointer text-xl"
                onClick={handleZoomOut}
                aria-label="Zoom Out"
            >
                -
            </button>
            <button
                className="w-8 h-8 bg-gray-700 hover:bg-gray-600 rounded-full flex items-center justify-center cursor-pointer text-xl"
                onClick={handleZoomIn}
                aria-label="Zoom In"
            >
                +
            </button>
        </div>
    );

    return (
        <>
            {/* Zoom Controls */}
            <ZoomControls />
            <button
                className="absolute right-4 top-2 z-50 bg-green-500 text-white px-4 py-2 rounded"
                onClick={handlePlayPause}
            >
                {isPlaying ? "Pause" : "Play"}
            </button>
            <div
                className={`relative w-full h-[450px] bg-[#1e1e1e] text-white ${selectedNoteIndex || pasteMenu ? 'overflow-hidden' : 'overflow-y-auto overflow-x-hidden'}  `}
                onWheel={handleWheel}
            >
                {/* Control Icons - Right Side */}


                {/* Timeline Header Container with Horizontal Scroll */}
                <div
                    ref={timelineContainerRef}
                    className="sticky bg-[#1F1F1F] ms-[64px] left-16 right- mt-[20px] h-[60px] overflow-x-auto overflow-y-hidden z-[2]"
                    style={{ background: "#2a2a2a" }}
                    onClick={handleTimelineClick}
                    onScroll={handleScroll}
                >
                    <div style={{
                        width: `${baseWidth * scale}px`,
                        height: "100%",
                        position: "relative",
                        minWidth: "100%"
                    }}>
                        <svg
                            ref={timelineHeaderRef}
                            width="100%"
                            height="100%"
                            style={{ color: "white", width: "100%", background: "#2a2a2a" }}
                        />
                    </div>
                </div>

                {/* Purple Playhead - spans full timeline and grid */}
                <div
                    ref={playheadRef}  // Add this line
                    style={{
                        position: "sticky",
                        left: `${playheadPosition * GRID_UNIT * 2 * scale}px`,
                        top: 0,
                        marginLeft: '64px',
                        height: "100%",
                        width: "2px",
                        background: "#AD00FF",
                        zIndex: 25,
                        pointerEvents: "none",
                    }}
                >
                    {/* Purple triangle at top */}
                    <div
                        style={{
                            position: "absolute",
                            top: "0px",
                            left: "-4px",
                            width: "0",
                            height: "0",
                            borderLeft: "5px solid transparent",
                            borderRight: "5px solid transparent",
                            borderTop: "8px solid #AD00FF",
                        }}
                    />
                </div>

                {/* Piano Keys Column */}
                <div className="absolute left-0 top-[80px] w-16 h-[560px] bg-[#1a1a1a] border-r border-gray-700 z-10">
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
                    className={`absolute left-16 top-[80px] right-0 ${selectedNoteIndex || pasteMenu ? 'overflow-hidden' : ' overflow-x-auto overflow-y-auto'}`}
                    style={{ background: "#1e1e1e" }}
                    onScroll={handleScroll}
                    onMouseDown={handleMouseDown}
                    onMouseUp={handleMouseUp}
                    onContextMenu={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        if (clipboardNote) {
                            // if (e.target.closest('.note-box')) return;
                            const wrapperRect = wrapperRef.current.getBoundingClientRect();
                            setPasteMenu(true);
                            setSelectedNoteIndex(null);
                            setPosition({
                                x: e.clientX - wrapperRect.left,
                                y: e.clientY - wrapperRect.top,
                            });
                            console.log('iscalled')
                        }
                    }}

                >
                    {/* White background for all notes */}
                    {notes.length > 0 && (() => {
                        const minStart = Math.min(...notes.map(n => n.start));
                        const maxEnd = Math.max(...notes.map(n => n.start + n.duration)) + 0.1;
                        const left = minStart * GRID_UNIT * 2 * scale;
                        const width = (maxEnd - minStart) * GRID_UNIT * 2 * scale;
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
                                    borderRadius: '5px'
                                }}
                                onMouseDown={handleMouseDown}
                                onMouseUp={handleMouseUp}
                            />
                        );
                    })()}
                    {notes.map((n, i) => {
                        return (
                            <Rnd
                                key={i}
                                size={{ width: n.duration * GRID_UNIT * 2 * scale, height: 24 }}
                                position={{ x: n.start * GRID_UNIT * 2 * scale, y: getYFromNote(n.note) }}
                                bounds="parent"
                                enableResizing={{ right: true }}
                                dragAxis="both"
                                onDragStop={(e, d) => {
                                    const snappedY = Math.round(d.y / 30) * 30;
                                    const noteIndex = Math.round(snappedY / 30);
                                    const newNote = NOTES[noteIndex];
                                    updateNote(i, {
                                        start: d.x / (GRID_UNIT * 2 * scale),
                                        note: newNote,
                                    });
                                }}
                                onResizeStop={(e, direction, ref, delta, position) => {
                                    const newWidth = parseFloat(ref.style.width);
                                    updateNote(i, {
                                        duration: newWidth / (GRID_UNIT * 2 * scale),
                                        start: position.x / (GRID_UNIT * 2 * scale),
                                    });
                                }}
                            >
                                <div
                                    className={`bg-red-500 rounded w-full h-full m-1 relative z-1 ${selectedNoteIndex === i ? 'border-[2px]' : 'border'}`}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        e.preventDefault();
                                        e.nativeEvent.stopImmediatePropagation(); 
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
                                            <li className="hover:bg-gray-200 hover:text-[#1F1F1F] cursor-pointer text-sm p-1 text-white" onClick={() => { handleCut() }}><IoCutOutline /></li>
                                            <li className="hover:bg-gray-200 hover:text-[#1F1F1F] cursor-pointer text-sm p-1 text-white" onClick={() => { handleCopy() }}><FaRegCopy /></li>
                                            <li className="hover:bg-gray-200 hover:text-[#1F1F1F] cursor-pointer text-sm p-1 text-white" onClick={() => { handleDelete() }}><MdDelete /></li>
                                        </ul>
                                    ): null}
                                </div>
                            </Rnd>
                        );
                    })}

                    <svg ref={svgRef} style={{ width: `${baseWidth * scale}px`, height: "100%" }}>
                        <g />
                    </svg>
                    {console.log('consition', pasteMenu && !menuVisible && clipboardNote, pasteMenu, menuVisible, clipboardNote)}
                    {(pasteMenu && clipboardNote) ? (
                        <span
                            className='bg-[#1F1F1F] text-white hover:bg-gray-200 hover:text-[#1F1F1F] absolute cursor-pointer text-sm p-1'
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
                            <FaPaste />
                        </span>
                    ) : null}
                </div>
            </div >

        </>
    );
};

export default PianoRolls;