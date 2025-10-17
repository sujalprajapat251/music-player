import React, { useState, useRef, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { 
  selectLoopSettings, 
  setLoopRange, 
  setLoopStart, 
  setLoopEnd, 
  toggleLoopEnabled
} from "../Redux/Slice/loop.slice";
import { selectGridSettings } from "../Redux/Slice/grid.slice";
import { getGridSpacingWithTimeSignature } from "../Utils/gridUtils";
import rightSize from '../Images/right-size.svg';
import LeftSize from '../Images/left-size.svg';
import reverceIcon from '../Images/reverce.svg';
import { useTheme } from "../Utils/ThemeContext";

const LoopBar = () => {
  const dispatch = useDispatch();
  const { isDark, setIsDark } = useTheme();
  const { 
    loopStart, 
    loopEnd, 
    isLoopEnabled, 
    audioDuration 
  } = useSelector(selectLoopSettings);
  const { selectedGrid, selectedTime } = useSelector(selectGridSettings);
  
  // Calculate grid spacing from grid settings
  const gridSpacing = getGridSpacingWithTimeSignature(selectedGrid, selectedTime);

  const [isDraggingStart, setIsDraggingStart] = useState(false);
  const [isDraggingEnd, setIsDraggingEnd] = useState(false);
  const [isDraggingLoop, setIsDraggingLoop] = useState(false);
  const dragStartRef = useRef({ startX: 0, startLoopStart: 0, startLoopEnd: 0 });

  // Grid snapping function
  const snapToGrid = useCallback((time) => {
    if (!gridSpacing || gridSpacing <= 0) return time;
    const gridPosition = Math.round(time / gridSpacing) * gridSpacing;
    return Math.max(0, Math.min(audioDuration, gridPosition));
  }, [gridSpacing, audioDuration]);

  const handleLoopChange = useCallback((start, end) => {
    dispatch(setLoopRange({ start, end }));
  }, [dispatch]);

  const handleMouseDown = useCallback((e, type) => {
    e.preventDefault();
    e.stopPropagation();

    const rect = e.currentTarget.closest('.loop-bar-container').getBoundingClientRect();
    const x = e.clientX - rect.left;
    const width = rect.width;
    const duration = audioDuration;

    if (width <= 0 || duration <= 0) return;

    const rawTime = (x / width) * duration;
    const time = Math.max(0, Math.min(duration, rawTime));

    dragStartRef.current = {
      startX: e.clientX,
      startLoopStart: loopStart,
      startLoopEnd: loopEnd
    };

    if (type === 'start') {
      setIsDraggingStart(true);
      const snappedTime = snapToGrid(time);
      handleLoopChange(snappedTime, loopEnd);
    } else if (type === 'end') {
      setIsDraggingEnd(true);
      const snappedTime = snapToGrid(time);
      handleLoopChange(loopStart, snappedTime);
    } else if (type === 'loop') {
      setIsDraggingLoop(true);
    }

    const handleMouseMove = (moveEvent) => {
      const deltaX = moveEvent.clientX - dragStartRef.current.startX;
      const deltaTime = (deltaX / width) * duration;

      if (type === 'start') {
        const newStart = Math.max(0, Math.min(loopEnd - gridSpacing, dragStartRef.current.startLoopStart + deltaTime));
        const snappedStart = snapToGrid(newStart);
        handleLoopChange(snappedStart, loopEnd);
      } else if (type === 'end') {
        const newEnd = Math.max(loopStart + gridSpacing, Math.min(duration, dragStartRef.current.startLoopEnd + deltaTime));
        const snappedEnd = snapToGrid(newEnd);
        handleLoopChange(loopStart, snappedEnd);
      } else if (type === 'loop') {
        const loopWidth = loopEnd - loopStart;
        const newStart = Math.max(0, Math.min(duration - loopWidth, dragStartRef.current.startLoopStart + deltaTime));
        const snappedStart = snapToGrid(newStart);
        const snappedEnd = Math.min(duration, snappedStart + loopWidth);
        handleLoopChange(snappedStart, snappedEnd);
      }
    };

    const handleMouseUp = () => {
      setIsDraggingStart(false);
      setIsDraggingEnd(false);
      setIsDraggingLoop(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [loopStart, loopEnd, audioDuration, handleLoopChange, snapToGrid, gridSpacing]);

  const startPosition = (loopStart / audioDuration) * 100;
  const endPosition = (loopEnd / audioDuration) * 100;
  const loopWidth = endPosition - startPosition;

  return (
    <div
      className="loop-bar-container"
      style={{
        position: "absolute",
        top: "80px", // Position right below the timeline ruler
        left: 0,
        width: "100%",
        height: "30px",
        background: "transparent",
        zIndex: 0,
        pointerEvents: "auto"
      }}
    >
      {/* Loop Bar Background Track */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: "8px",
          width: "100%",
          height: "17px",
          background: isDark ? "#141414" : "#f5f5f5",
          borderRadius: "2px",
          border: `1px solid ${isDark ? "#444" : "#c5c3c3"}`,
          cursor: "pointer"
        }}
        onMouseDown={(e) => handleMouseDown(e, 'loop')}
      />

      {/* Loop Region */}
      <div
        style={{
          position: "absolute",
          left: `${startPosition}%`,
          top: "8px",
          width: `${loopWidth}%`,
          height: "18px",
          background: isLoopEnabled
            ? "linear-gradient(90deg, #FF8C00 0%, #FF6B35 100%)"
            : "linear-gradient(90deg, #FF8C00AA 0%, #FF6B35AA 100%)",
          borderRadius: "4px",
          border: `2px solid ${isLoopEnabled ? "#FF8C00" : "#FF8C0080"}`,
          cursor: "move",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: isLoopEnabled
            ? "0 2px 8px rgba(255, 140, 0, 0.4)"
            : "0 1px 4px rgba(255, 140, 0, 0.2)",
          // transition: "all 0.2s ease"
        }}
        onMouseDown={(e) => handleMouseDown(e, 'loop')}
        onClick={(e) => { e.stopPropagation(); dispatch(toggleLoopEnabled()); }}
      >
        {/* Loop Start Handle */}
        <div
          style={{
            position: "absolute",
            left: "0px",
            top: "-4px",
            width: "12px",
            height: "22px",
            cursor: "ew-resize",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          onMouseDown={(e) => handleMouseDown(e, 'start')}
        >
          <img src={LeftSize} alt="" />
        </div>

        {/* Loop End Handle */}
        <div
          style={{
            position: "absolute",
            right: "0px",
            top: "-4px",
            width: "12px",
            height: "22px",
            cursor: "ew-resize",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          onMouseDown={(e) => handleMouseDown(e, 'end')}
        >
          <img src={rightSize} alt="" />
        </div>

        {/* Loop Icon */}
        <div
          style={{
            color: "white",
            fontSize: "10px",
            fontWeight: "bold",
            textShadow: "0 1px 2px rgba(0,0,0,0.5)"
          }}
        >
          <img src={reverceIcon} alt="" />
        </div>
      </div>
    </div>
  );
};

export default LoopBar;
