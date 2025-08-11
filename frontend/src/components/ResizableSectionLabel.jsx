import React, { useState, useRef, useCallback } from "react";
import { useSelector } from "react-redux";
import { selectGridSettings } from "../Redux/Slice/grid.slice";
import { getGridSpacing } from "../Utils/gridUtils";
import rightSize from '../Images/right-size.svg';
import LeftSize from '../Images/left-size.svg';

const ResizableSectionLabel = ({ section, audioDuration, selectedGrid, timelineContainerRef, onResize, onContextMenu }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(null); // 'start' or 'end'
  const dragStartRef = useRef({ startX: 0, startPosition: 0, startWidth: 0 });
  const { selectedTime } = useSelector(selectGridSettings);

  // Grid snapping function - fixed to use proper grid utility
  const snapToGrid = useCallback((time) => {
    // Use the same grid utility as MySection component
    const gridSpacing = getGridSpacing(selectedGrid);
    if (!gridSpacing || gridSpacing <= 0) return time;
    const gridPosition = Math.round(time / gridSpacing) * gridSpacing;
    return Math.max(0, Math.min(audioDuration, gridPosition));
  }, [selectedGrid, audioDuration]);

  const handleMouseDown = useCallback((e, type) => {
    e.preventDefault();
    e.stopPropagation();

    const timelineContainer = timelineContainerRef.current;
    if (!timelineContainer) return;

    const rect = timelineContainer.getBoundingClientRect();
    const timelineWidth = rect.width;

    if (type === 'drag') {
      setIsDragging(true);
      dragStartRef.current = {
        startX: e.clientX,
        startPosition: section.startTime || 0,
        startWidth: section.width || 100,
        timelineWidth: timelineWidth
      };
    } else if (type === 'resize-start' || type === 'resize-end') {
      setIsResizing(type);
      dragStartRef.current = {
        startX: e.clientX,
        startPosition: section.startTime || 0,
        startWidth: section.width || 100,
        timelineWidth: timelineWidth
      };
    }

    const handleMouseMove = (moveEvent) => {
      const deltaX = moveEvent.clientX - dragStartRef.current.startX;
      const pixelsPerSecond = dragStartRef.current.timelineWidth / audioDuration;
      const deltaTime = deltaX / pixelsPerSecond;

      if (isDragging || type === 'drag') {
        // Handle dragging (moving the entire section)
        const sectionDuration = section.endTime - section.startTime;
        const newStartTime = Math.max(0, Math.min(audioDuration - sectionDuration, 
          dragStartRef.current.startPosition + deltaTime));
        const snappedStartTime = snapToGrid(newStartTime);
        const newEndTime = Math.min(audioDuration, snappedStartTime + sectionDuration);
        
        // Calculate new width and position
        const newWidth = ((newEndTime - snappedStartTime) / audioDuration) * dragStartRef.current.timelineWidth;
        const newPosition = (snappedStartTime / audioDuration) * 100;
        
        onResize(section.id, newWidth, snappedStartTime, newEndTime, newPosition);
      } else if (isResizing || type.startsWith('resize')) {
        // Handle resizing
        if (isResizing === 'resize-start' || type === 'resize-start') {
          const newStartTime = Math.max(0, Math.min(section.endTime - 0.1, 
            dragStartRef.current.startPosition + deltaTime));
          const snappedStartTime = snapToGrid(newStartTime);
          const newWidth = ((section.endTime - snappedStartTime) / audioDuration) * dragStartRef.current.timelineWidth;
          const newPosition = (snappedStartTime / audioDuration) * 100;
          
          onResize(section.id, newWidth, snappedStartTime, section.endTime, newPosition);
        } else if (isResizing === 'resize-end' || type === 'resize-end') {
          const newEndTime = Math.max(section.startTime + 0.1, Math.min(audioDuration, 
            section.endTime + deltaTime));
          const snappedEndTime = snapToGrid(newEndTime);
          const newWidth = ((snappedEndTime - section.startTime) / audioDuration) * dragStartRef.current.timelineWidth;
          
          onResize(section.id, newWidth, section.startTime, snappedEndTime, section.position);
        }
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(null);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [section, audioDuration, onResize, snapToGrid, isDragging, isResizing]);

  // Calculate position based on startTime instead of stored position
  const sectionPosition = ((section.startTime || 0) / audioDuration) * 100;
  const sectionWidth = section.width || 100;

  return (
    <div
      style={{
        position: "absolute",
        top: "110px",
        left: `${sectionPosition}%`,
        width: `${sectionWidth}px`,
        height: "25px",
        background: "#2A2A2A",
        borderRadius: "4px",
        padding: "3px 4px 0 4px",
        color: "white",
        fontSize: "12px",
        fontWeight: "600",
        border: "1px solid #444",
        textAlign: "center",
        transform: "translateX(-50%)",
        zIndex: 8,
        cursor: isDragging ? "grabbing" : "grab",
        animation: "sectionLabelAppear 0.3s ease-out",
        userSelect: "none",
      }}
      onMouseDown={(e) => handleMouseDown(e, 'drag')}
      onContextMenu={(e) => onContextMenu && onContextMenu(e, section.id)}
    >
      <div className="flex justify-between items-center h-full">
        {/* Left resize handle */}
        <div
          style={{
            width: "12px",
            height: "100%",
            cursor: "ew-resize",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          onMouseDown={(e) => handleMouseDown(e, 'resize-start')}
        >
          <img src={LeftSize} alt="" />
        </div>
        
        {/* Section name */}
        <span style={{ flex: 1, textAlign: "center" }}>{section.name}</span>
        
        {/* Right resize handle */}
        <div
          style={{
            width: "12px",
            height: "100%",
            cursor: "ew-resize",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          onMouseDown={(e) => handleMouseDown(e, 'resize-end')}
        >
          <img src={rightSize} alt="" />
        </div>
      </div>
    </div>
  );
};

export default ResizableSectionLabel;
