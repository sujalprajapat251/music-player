import React, { useState, useEffect, useCallback } from "react";
import { getGridSpacing } from "../Utils/gridUtils";

const MySection = ({ timelineContainerRef, audioDuration, selectedGrid }) => {
  const [cursorPosition, setCursorPosition] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ x: 0, y: 0 });

  // Grid snapping function
  const snapToGrid = (time) => {
    const gridSpacing = getGridSpacing(selectedGrid);
    if (!gridSpacing || gridSpacing <= 0) return time;
    const gridPosition = Math.round(time / gridSpacing) * gridSpacing;
    return Math.max(0, Math.min(audioDuration, gridPosition));
  };

  // Handle mouse movement over the timeline
  const handleMouseMove = useCallback((e) => {
    if (!timelineContainerRef?.current) return;

    const rect = timelineContainerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const width = rect.width;
    
    if (width <= 0 || audioDuration <= 0) return;
    
    // Calculate time position based on cursor
    let rawTime = (x / width) * audioDuration;
    rawTime = Math.max(0, Math.min(audioDuration, rawTime));
    
    // Snap to grid
    const snappedTime = snapToGrid(rawTime);
    
    // Calculate percentage position
    const percentage = (snappedTime / audioDuration) * 100;
    
    setCursorPosition(percentage);
    setIsVisible(true);
  }, [timelineContainerRef, audioDuration, selectedGrid]);

  // Handle mouse leave
  const handleMouseLeave = useCallback(() => {
    setIsVisible(false);
  }, []);

  // Add event listeners
  useEffect(() => {
    const container = timelineContainerRef?.current;
    if (!container) return;

    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [handleMouseMove, handleMouseLeave]);

  // Close dropdown on outside click
  useEffect(() => {
    if (!dropdownOpen) return;
    const handleClick = (e) => setDropdownOpen(false);
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [dropdownOpen]);

  // Calculate dropdown position relative to viewport
  const handleDropdownToggle = useCallback((e) => {
    e.stopPropagation();
    
    if (!timelineContainerRef?.current) return;
    
    const rect = timelineContainerRef.current.getBoundingClientRect();
    const timelineWidth = rect.width;
    const cursorX = (cursorPosition / 100) * timelineWidth;
    
    // Calculate absolute position relative to viewport
    const absoluteX = rect.left + cursorX;
    const absoluteY = rect.top + 110; // Position below the "My Section" label
    
    setDropdownPosition({ x: absoluteX, y: absoluteY });
    setDropdownOpen((open) => !open);
  }, [cursorPosition, timelineContainerRef]);

  const sectionOptions = [
    "Intro", "Verse", "Chorus", "Pre Chorus", "Bridge", "Outro",
    "Interlude", "Solo", "Hook", "Breakdown", "Drop", "Build Up", "Custom Name"
  ];

  return (
    <>
      <div
        style={{
          position: "absolute",
          top: "75px", // Position below the loop bar
          left: 0,
          width: "100%",
          height: "20px",
          background: "transparent",
          zIndex: 5,
          pointerEvents: "none", // Don't interfere with other interactions
        }}
      >
        {/* My Section Label - follows cursor */}
        <div
          style={{
            position: "absolute",
            top: "35px",
            left: `${cursorPosition}%`,
            width: "100px",
            height: "25px",
            background: "#2A2A2A",
            borderRadius: "4px",
            padding: "3px 10px 0 10px",
            color: "white",
            fontSize: "12px",
            fontWeight: "500",
            border: "1px solid #444",
            textAlign: "center",
            transform: "translateX(-50%)", // Center the label on cursor
            transition: "opacity 0.2s ease",
            cursor: "pointer",
            zIndex: 10,
            pointerEvents: "auto", // Make it clickable
          }}
          onClick={handleDropdownToggle}
        >
          My Section
        </div>
      </div>

      {/* Dropdown rendered outside timeline container */}
      {dropdownOpen && (
        <div
          style={{
            position: "fixed",
            top: `${dropdownPosition.y}px`,
            left: `${dropdownPosition.x}px`,
            transform: "translateX(-50%)",
            background: "#23232A",
            borderRadius: "6px",
            boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
            border: "1px solid #444",
            minWidth: "200px",
            zIndex: 9999, // Very high z-index to ensure it's on top
            color: "white",
            padding: "6px 0",
          }}
        >
          {sectionOptions.map((item, idx) => (
            <div
              key={item}
              style={{
                padding: "8px 20px",
                cursor: "pointer",
                background: idx === 12 ? "#23232A" : "none",
                borderTop: idx === 12 ? "1px solid #333" : "none",
                transition: "background-color 0.2s ease",
              }}
              onClick={() => {
                // handle selection here
                setDropdownOpen(false);
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = "#3A3A3A";
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = "transparent";
              }}
              onMouseDown={e => e.preventDefault()}
            >
              {item}
            </div>
          ))}
        </div>
      )}
    </>
  );
};

export default MySection; 