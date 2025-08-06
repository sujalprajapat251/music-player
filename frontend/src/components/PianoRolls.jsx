import React, { useState, useRef, useEffect, useCallback } from 'react';
import * as Tone from 'tone';
import { Rnd } from 'react-rnd';
import 'react-resizable/css/styles.css';
import * as d3 from 'd3';
import { useSelector } from 'react-redux';
import { selectGridSettings } from '../Redux/Slice/grid.slice';
import { getGridDivisions } from '../Utils/gridUtils';

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
    const [scale, setScale] = useState(1); // Zoom scale
    const [currentTime, setCurrentTime] = useState(25); // Current playhead position
    const [scrollLeft, setScrollLeft] = useState(0); // Horizontal scroll position

    const baseWidth = 2000;  // Increased base width for more content
    const height = 600;
    const rowHeight = 20;
    const audioDuration = 150; // Default duration in seconds
    const pixelsPerSecond = 50; // Increased spacing between seconds

    // Get grid settings from Redux
    const { selectedGrid } = useSelector(selectGridSettings);

    const renderRuler = useCallback(() => {
        if (!timelineHeaderRef.current) return;

        const svg = d3.select(timelineHeaderRef.current);
        const svgNode = timelineHeaderRef.current;
        const width = Math.max(svgNode.clientWidth || 600, baseWidth * scale);
        const axisY = 50; // Center of the header
        const duration = audioDuration;

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
                    .text(sec.toString());
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
        const height = 560;

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
    const playheadPosition = (currentTime / audioDuration) * (baseWidth * scale);

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

    return (
       <>
       
       <div 
            className="relative w-full h-[640px] bg-[#1e1e1e] text-white"
            onWheel={handleWheel}
        >
            {/* Control Icons - Right Side */}
            <div className="absolute top-2 right-2 z-30 flex gap-2">
                <div className="w-8 h-8 bg-gray-700 hover:bg-gray-600 rounded-full flex items-center justify-center cursor-pointer">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                        <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z"/>
                    </svg>
                </div>
                <div className="w-8 h-8 bg-gray-700 hover:bg-gray-600 rounded-full flex items-center justify-center cursor-pointer">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                        <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z"/>
                    </svg>
                </div>
            </div>

            {/* Timeline Header Container with Horizontal Scroll */}
            <div 
                ref={timelineContainerRef}
                className="absolute top-0 left-16 right-0 h-[80px] overflow-x-auto overflow-y-hidden"
                style={{ background: "#2a2a2a" }}
                onClick={handleTimelineClick}
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
                style={{
                    position: "absolute",
                    left: `${playheadPosition}px`,
                    top: 0,
                    height: "640px",
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
                {NOTES.slice(0, 28).map((note, index) => (
                    <div
                        key={note}
                        style={{
                            height: `${560 / 28}px`,
                            borderBottom: "1px solid #333",
                            background: note.includes('#') ? "#333" : "#444",
                            display: "flex",
                            alignItems: "center",
                            paddingLeft: "8px",
                            fontSize: "10px",
                            color: "#ccc"
                        }}
                    >
                        {note}
                    </div>
                ))}
            </div>

            {/* Scrollable Piano Roll Grid */}
            <div
                ref={wrapperRef}
                className="absolute left-16 top-[80px] right-0 h-[560px] overflow-x-auto overflow-y-hidden"
                style={{ background: "#1e1e1e" }}
                onScroll={handleScroll}
            >
                <svg ref={svgRef} style={{ width: `${baseWidth * scale}px`, height: "100%" }}>
                    <g />
                </svg>
            </div>
        </div>
       
       </>
    );
};

export default PianoRolls;