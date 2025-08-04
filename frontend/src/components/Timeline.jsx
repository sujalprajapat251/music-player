import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";
import WaveSurfer from "wavesurfer.js";
import { Player, start } from "tone";
import * as d3 from "d3";
import { useSelector, useDispatch } from "react-redux";
import { addTrack, updateTrack, setPlaying, setCurrentTime, setAudioDuration } from "../Redux/Slice/studio.slice";
import { selectGridSettings, setSelectedGrid, setSelectedTime, setSelectedRuler } from "../Redux/Slice/grid.slice";
import { getGridDivisions, getGridSpacing, snapToGrid } from "../Utils/gridUtils";
import { IMAGE_URL } from "../Utils/baseUrl";
import magnetIcon from "../Images/magnet.svg";
import settingIcon from "../Images/setting.svg";
import reverceIcon from "../Images/reverce.svg";
import fxIcon from "../Images/fx.svg";
import offce from "../Images/offce.svg";
import GridSetting from "./GridSetting";
import MusicOff from "./MusicOff";
import { Rnd } from "react-rnd";
import rightSize from '../Images/right-size.svg'
import LeftSize from '../Images/left-size.svg'
import WaveMenu from "./WaveMenu";
import MySection from "./MySection";

// Custom Resizable Trim Handle Component
const ResizableTrimHandle = ({ 
  type, // 'start' or 'end'
  position, 
  onResize, 
  isDragging, 
  onDragStart, 
  onDragEnd,
  trackDuration,
  trackWidth,
  trimStart,
  trimEnd,
  gridSpacing = 0.25 // Default to 1/4 beat grid
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const dragStartRef = useRef({ startX: 0, startPosition: 0 });

  // Grid snapping function
  const snapToGrid = useCallback((time) => {
    if (!gridSpacing || gridSpacing <= 0) return time;
    
    const gridPosition = Math.round(time / gridSpacing) * gridSpacing;
    return Math.max(0, Math.min(trackDuration, gridPosition));
  }, [gridSpacing, trackDuration]);

  const handleMouseDown = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    
    dragStartRef.current = {
      startX: e.clientX,
      startPosition: position
    };
    
    onDragStart(type);
    
    const handleMouseMove = (moveEvent) => {
      const deltaX = moveEvent.clientX - dragStartRef.current.startX;
      const deltaTime = (deltaX / trackWidth) * trackDuration;
      const rawPosition = Math.max(0, Math.min(trackDuration, dragStartRef.current.startPosition + deltaTime));
      
      // Snap to grid
      const snappedPosition = snapToGrid(rawPosition);
      
      onResize(type, snappedPosition);
    };
    
    const handleMouseUp = () => {
      onDragEnd();
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [position, onResize, onDragStart, onDragEnd, type, trackDuration, trackWidth, snapToGrid]);

  // Calculate position relative to the visible track portion
  const actualTrimEnd = trimEnd || trackDuration;
  
  let handlePosition;
  if (type === 'start') {
    handlePosition = '0%';
  } else {
    handlePosition = '100%';
  }

  return (
    <div
      style={{
        position: "absolute",
        left: type === 'start' ? handlePosition : 'auto',
        right: type === 'end' ? '0%' : 'auto',
        top: 0,
        width: "24px",
        height: "100%",
        cursor: "ew-resize",
        zIndex: 15,
        transform: "translateX(-12px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
      onMouseDown={handleMouseDown}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Invisible expanded hit area */}
      <div
        style={{
          position: "absolute",
          width: "32px",
          height: "100%",
          left: "0px",
          top: 0,
        }}
      />
      
      {/* Red background container */}
      <div
        style={{
          width: "24px",
          height: "100%",
          background: "transparent",
          // borderRadius: "6px",
          // border: `2px solid ${isDragging || isHovered ? "#FFFFFF" : "#FF0000"}`,
          // boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
          transition: isDragging ? "none" : "all 0.2s ease",
          // transform: isDragging || isHovered ? "scale(1.05)" : "scale(1)",
          position: "relative",
          display: "flex",
          alignItems: "end",
          justifyContent: "end",
        }}
      >
        {/* Chevron icon in bracket */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#000000 ",
            fontSize: "14px",
            fontWeight: "bold",
            fontFamily: "monospace",
            position:"absolute",
            left:"14px",
            bottom:"0px"
          }}
        >
          {type === 'start' ? '[>' : '<]'}
        </div>
      </div>
    
    </div>
  );
};

const TimelineTrack = ({ 
  url, 
  onReady, 
  color, 
  height, 
  trackId, 
  startTime = 0, 
  duration, 
  trimStart = 0, 
  trimEnd = null, 
  onTrimChange,
  onPositionChange,
  timelineWidthPerSecond = 100,
  frozen = false,
  gridSpacing = 0.25,
  onContextMenu
}) => {
  const waveformRef = useRef(null);
  const wavesurfer = useRef(null);
  const isInitialized = useRef(false);
  const [isDraggingTrim, setIsDraggingTrim] = useState(null);

  useEffect(() => {
    if (!waveformRef.current || !url || isInitialized.current) return;

    let isMounted = true;

    const initWaveSurfer = async () => {
      try {
        if (wavesurfer.current) {
          wavesurfer.current.destroy();
          wavesurfer.current = null;
        }

        if (!isMounted) return;

        wavesurfer.current = WaveSurfer.create({
          container: waveformRef.current,
          waveColor: frozen ? "#666666" : "#ffffff", // Dimmed color for frozen tracks
          progressColor: frozen ? "#999999" : "#ffffff", // Dimmed progress for frozen tracks
          height: height - 8,
          barWidth: 2,
          responsive: true,
          minPxPerSec: 50,
          normalize: true,
        });

        if (!isMounted) return;

        const readyHandler = () => {
          if (isMounted && onReady && wavesurfer.current) {
            onReady(wavesurfer.current);
          }
        };

        const errorHandler = (error) => {
          if (isMounted) {
            console.error("WaveSurfer error:", error);
          }
        };

        wavesurfer.current.on("ready", readyHandler);
        wavesurfer.current.on("error", errorHandler);

        wavesurfer.current.load(url);
        isInitialized.current = true;

      } catch (error) {
        if (isMounted) {
          console.error("Failed to create WaveSurfer instance:", error);
        }
      }
    };

    initWaveSurfer();

    return () => {
      isMounted = false;
      isInitialized.current = false;
      if (wavesurfer.current) {
        try {
          wavesurfer.current.destroy();
        } catch (error) {
          // Silently ignore cleanup errors
        }
        wavesurfer.current = null;
      }
    };
  }, [trackId, frozen]);

  const handleTrimResize = useCallback((type, newPosition) => {
    // Disable trimming for frozen tracks
    if (frozen) return;
    
    if (!onTrimChange || !duration) return;
    
    const currentTrimStart = trimStart || 0;
    const currentTrimEnd = trimEnd || duration;
    
    // Grid snapping function for trim
    const snapToGrid = (time) => {
      if (!gridSpacing || gridSpacing <= 0) return time;
      const gridPosition = Math.round(time / gridSpacing) * gridSpacing;
      return Math.max(0, Math.min(duration, gridPosition));
    };
    
    if (type === 'start') {
      const snappedPosition = snapToGrid(newPosition);
      const newTrimStart = Math.max(0, Math.min(snappedPosition, currentTrimEnd - gridSpacing));
      // Calculate how much the trim start moved
      const trimStartDelta = newTrimStart - currentTrimStart;
      
      // Move the track position by the same amount (so left trim moves the track)
      const newStartTime = startTime + trimStartDelta;
      
      onTrimChange({ 
        trimStart: newTrimStart, 
        trimEnd: currentTrimEnd,
        newStartTime: Math.max(0, newStartTime) // Also update position
      });
    } else if (type === 'end') {
      const snappedPosition = snapToGrid(newPosition);
      const newTrimEnd = Math.max(currentTrimStart + gridSpacing, Math.min(snappedPosition, duration));
      onTrimChange({ trimStart: currentTrimStart, trimEnd: newTrimEnd });
    }
  }, [trimStart, trimEnd, duration, startTime, onTrimChange, gridSpacing, frozen]);

  const handleDragStart = useCallback((type) => {
    // Disable dragging for frozen tracks
    if (frozen) return;
    setIsDraggingTrim(type);
  }, [frozen]);

  const handleDragEnd = useCallback(() => {
    setIsDraggingTrim(null);
  }, []);

  // Handle drag (position change) with grid snapping
  const handleDragStop = useCallback((e, d) => {
    const rawStartTime = Math.max(0, d.x / timelineWidthPerSecond);
    
    // Grid snapping for track position
    const snapToGrid = (time) => {
      if (!gridSpacing || gridSpacing <= 0) return time;
      const gridPosition = Math.round(time / gridSpacing) * gridSpacing;
      return Math.max(0, gridPosition);
    };
    
    const snappedStartTime = snapToGrid(rawStartTime);
    
    if (onPositionChange) {
      onPositionChange(trackId, snappedStartTime);
    }
  }, [trackId, onPositionChange, timelineWidthPerSecond, gridSpacing]);

  const width = (duration || 1) * timelineWidthPerSecond;
  const actualTrimEnd = trimEnd || duration;
  
  // Calculate the visible width and position based on trim
  const visibleWidth = ((actualTrimEnd - trimStart) / duration) * width;
  const rndX = startTime * timelineWidthPerSecond;

  return (
    <Rnd
      size={{ 
        width: visibleWidth, 
        height: height 
      }}
      position={{ 
        x: rndX, 
        y: 0 
      }}
      onDragStop={handleDragStop}
      enableResizing={false} // Disable resizing, use only custom trim handles
      dragAxis="x"
      bounds="parent"
      style={{
        background: color,
        borderRadius: '8px',
        border: isDraggingTrim ? "2px solid #AD00FF" : "1px solid rgba(255,255,255,0.1)",
        boxShadow: isDraggingTrim ? "0 4px 20px rgba(173,0,255,0.3)" : "none",
        transition: isDraggingTrim ? "none" : "all 0.2s ease",
        overflow: "hidden",
        zIndex: 10,
      }}
    >
      {/* Waveform with clip-path to show only trimmed portion */}
      <div
        ref={waveformRef}
        style={{
          width: `${width}px`,
          height: "100%",
          position: "absolute",
          top: 0,
          left: `-${(trimStart / duration) * width}px`,
          zIndex: 1,
          clipPath: `inset(0 ${(1 - (actualTrimEnd / duration)) * 100}% 0 ${(trimStart / duration) * 100}%)`,
        }}
        onContextMenu={onContextMenu}
      />

      {/* Trim Handles using ResizableTrimHandle */}
      <ResizableTrimHandle
        type="start"
        position={trimStart}
        onResize={handleTrimResize}
        isDragging={isDraggingTrim === 'start'}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        trackDuration={duration}
        trackWidth={width}
        trimStart={trimStart}
        trimEnd={actualTrimEnd}
        gridSpacing={gridSpacing} // Pass grid spacing to the handle
      />
      
      <ResizableTrimHandle
        type="end"
        position={actualTrimEnd}
        onResize={handleTrimResize}
        isDragging={isDraggingTrim === 'end'}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        trackDuration={duration}
        trackWidth={width}
        trimStart={trimStart}
        trimEnd={actualTrimEnd}
        gridSpacing={gridSpacing} // Pass grid spacing to the handle
      />

    
    </Rnd>
  );
};

// Loop Bar Component
const LoopBar = ({ 
  audioDuration, 
  loopStart, 
  loopEnd, 
  onLoopChange, 
  timelineWidthPerSecond,
  gridSpacing = 0.25,
  currentTime,
  isLoopEnabled = false
}) => {
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
      onLoopChange(snappedTime, loopEnd);
    } else if (type === 'end') {
      setIsDraggingEnd(true);
      const snappedTime = snapToGrid(time);
      onLoopChange(loopStart, snappedTime);
    } else if (type === 'loop') {
      setIsDraggingLoop(true);
    }
    
    const handleMouseMove = (moveEvent) => {
      const deltaX = moveEvent.clientX - dragStartRef.current.startX;
      const deltaTime = (deltaX / width) * duration;
      
      if (type === 'start') {
        const newStart = Math.max(0, Math.min(loopEnd - gridSpacing, dragStartRef.current.startLoopStart + deltaTime));
        const snappedStart = snapToGrid(newStart);
        onLoopChange(snappedStart, loopEnd);
      } else if (type === 'end') {
        const newEnd = Math.max(loopStart + gridSpacing, Math.min(duration, dragStartRef.current.startLoopEnd + deltaTime));
        const snappedEnd = snapToGrid(newEnd);
        onLoopChange(loopStart, snappedEnd);
      } else if (type === 'loop') {
        const loopWidth = loopEnd - loopStart;
        const newStart = Math.max(0, Math.min(duration - loopWidth, dragStartRef.current.startLoopStart + deltaTime));
        const snappedStart = snapToGrid(newStart);
        const snappedEnd = Math.min(duration, snappedStart + loopWidth);
        onLoopChange(snappedStart, snappedEnd);
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
  }, [loopStart, loopEnd, audioDuration, onLoopChange, snapToGrid, gridSpacing]);

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
        zIndex: 5,
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
          background: "#141414",
          borderRadius: "2px",
          border: "1px solid #444",
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
          transition: "all 0.2s ease"
        }}
        onMouseDown={(e) => handleMouseDown(e, 'loop')}
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

const Timeline = () => {
  const [players, setPlayers] = useState([]);
  const [waveSurfers, setWaveSurfers] = useState([]);
  const [loopStart, setLoopStart] = useState(0);
  const [loopEnd, setLoopEnd] = useState(10);
  const [isLoopEnabled, setIsLoopEnabled] = useState(false);
  const [localCurrentTime, setLocalCurrentTime] = useState(0);
  const svgRef = useRef(null);
  const timelineContainerRef = useRef(null);
  const playbackStartRef = useRef({ systemTime: 0, audioTime: 0 });
  const lastReduxUpdateRef = useRef(0);
  const lastPlayerUpdateRef = useRef(0);
  const [showGridSetting, setShowGridSetting] = useState(false);
  const [showOffcanvas, setShowOffcanvas] = useState(false);
  const isDragging = useRef(false);
  const animationFrameId = useRef(null);
  
  // Context menu state
  const [contextMenu, setContextMenu] = useState({
    isOpen: false,
    position: { x: 0, y: 0 },
    trackId: null
  });



  const dispatch = useDispatch();
  const tracks = useSelector((state) => state.studio?.tracks || []);
  const trackHeight = useSelector((state) => state.studio?.trackHeight || 100);
  const sidebarScrollOffset = useSelector((state) => state.studio?.sidebarScrollOffset || 0);
  const soloTrackId = useSelector((state) => state.studio.soloTrackId);
  const timelineWidthPerSecond = 100;
  
  // Get audio state from Redux
  const isPlaying = useSelector((state) => state.studio?.isPlaying || false);
  const currentTime = useSelector((state) => state.studio?.currentTime || 0);
  const audioDuration = useSelector((state) => state.studio?.audioDuration || 150);
  
  // Grid settings from Redux
  const { selectedGrid, selectedTime, selectedRuler } = useSelector(selectGridSettings);



// Mute functionality
 
useEffect(() => {
  players.forEach(playerObj => {
    const track = tracks.find(t => t.id === playerObj.trackId);
    const isMuted = soloTrackId
      ? soloTrackId !== track.id
      : track.muted;
    if (playerObj.player && track) {
      playerObj.player.volume.value = isMuted ? -Infinity : 0;
    }
  });
}, [tracks, players, soloTrackId]);
  // Loop change handler
  const handleLoopChange = useCallback((newStart, newEnd) => {
    const gridSpacing = getGridSpacing(selectedGrid);
    const snapToGrid = (time) => {
      if (!gridSpacing || gridSpacing <= 0) return time;
      const gridPosition = Math.round(time / gridSpacing) * gridSpacing;
      return Math.max(0, Math.min(audioDuration, gridPosition));
    };
    
    const snappedStart = snapToGrid(newStart);
    const snappedEnd = snapToGrid(Math.max(snappedStart + gridSpacing, newEnd));
    
    setLoopStart(snappedStart);
    setLoopEnd(snappedEnd);
  }, [audioDuration, selectedGrid]);

  // Handle track position changes (drag) with grid snapping
  const handleTrackPositionChange = useCallback((trackId, newStartTime) => {
    // Grid snapping for track position
    const gridSpacing = getGridSpacing(selectedGrid);
    const snapToGrid = (time) => {
      if (!gridSpacing || gridSpacing <= 0) return time;
      const gridPosition = Math.round(time / gridSpacing) * gridSpacing;
      return Math.max(0, gridPosition);
    };
    
    const snappedStartTime = snapToGrid(newStartTime);
    
    dispatch(updateTrack({ 
      id: trackId, 
      updates: { startTime: snappedStartTime } 
    }));

    // Update the corresponding player
    setPlayers((prev) => {
      return prev.map(playerObj => {
        if (playerObj.trackId === trackId) {
          return {
            ...playerObj,
            startTime: snappedStartTime
          };
        }
        return playerObj;
      });
    });
  }, [dispatch, selectedGrid]);

  // Updated trim change handler to support position changes from left trim
  const handleTrimChange = useCallback((trackId, trimData) => {
    // Validate trim data
    const { trimStart, trimEnd, newStartTime } = trimData;
    const track = tracks.find(t => t.id === trackId);
    
    if (!track || !track.duration) return;
    
    // Grid snapping for validation
    const gridSpacing = getGridSpacing(selectedGrid);
    const snapToGrid = (time) => {
      if (!gridSpacing || gridSpacing <= 0) return time;
      const gridPosition = Math.round(time / gridSpacing) * gridSpacing;
      return Math.max(0, Math.min(track.duration, gridPosition));
    };
    
    const validatedTrimStart = snapToGrid(Math.max(0, Math.min(trimStart, track.duration - gridSpacing)));
    const validatedTrimEnd = snapToGrid(Math.max(validatedTrimStart + gridSpacing, Math.min(trimEnd, track.duration)));
    
    // Prepare updates object
    const updates = { 
      trimStart: validatedTrimStart, 
      trimEnd: validatedTrimEnd 
    };
    
    // If newStartTime is provided (from left trim), update the position too
    if (newStartTime !== undefined) {
      const snappedStartTime = snapToGrid(Math.max(0, newStartTime));
      updates.startTime = snappedStartTime;
    }
    
    dispatch(updateTrack({ 
      id: trackId, 
      updates: updates
    }));

    // Update the corresponding player with new trim data and position
    setPlayers((prev) => {
      return prev.map(playerObj => {
        if (playerObj.trackId === trackId) {
          const updatedPlayer = {
            ...playerObj,
            trimStart: validatedTrimStart,
            trimEnd: validatedTrimEnd
          };
          
          // Update startTime if provided
          if (newStartTime !== undefined) {
            updatedPlayer.startTime = snapToGrid(Math.max(0, newStartTime));
          }
          
          return updatedPlayer;
        }
        return playerObj;
      });
    });
  }, [dispatch, tracks, selectedGrid]);

  const handleReady = useCallback(async (wavesurfer, url, trackData) => {
    if (!url) return;
    
    let isCancelled = false;
    
    try {
      const controller = new AbortController();
      
      const cleanup = () => {
        isCancelled = true;
        controller.abort();
      };
      
      const response = await fetch(url, { 
        signal: controller.signal 
      });
      
      if (isCancelled) return;
      
      if (!response.ok) {
        throw new Error(`Failed to fetch audio: ${response.statusText}`);
      }
      
      const arrayBuffer = await response.arrayBuffer();
      
      if (isCancelled) return;
      
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      
      if (isCancelled) return;
      
      const player = new Player(audioBuffer).toDestination();
      
      // Get the actual duration from the track data or audio buffer
      const trackDuration = trackData.duration || audioBuffer.duration;
      const trimStart = trackData.trimStart || 0;
      const trimEnd = trackData.trimEnd || trackDuration;
      
      setPlayers((prev) => {
        const existingIndex = prev.findIndex(p => p.trackId === trackData.id);
        const playerData = { 
          player, 
          trackId: trackData.id, 
          startTime: trackData.startTime || 0,
          duration: trackDuration,
          trimStart: trimStart,
          trimEnd: trimEnd,
          originalDuration: audioBuffer.duration
        };
        
        if (existingIndex !== -1) {
          const newPlayers = [...prev];
          newPlayers[existingIndex] = playerData;
          return newPlayers;
        } else {
          return [...prev, playerData];
        }
      });
      
      setWaveSurfers((prev) => {
        if (prev.find(ws => ws === wavesurfer)) return prev;
        return [...prev, wavesurfer];
      });
      
      const duration = wavesurfer.getDuration();
      if (duration > 0 && !isCancelled) {
        setAudioDuration((prev) => Math.max(prev, duration));
      }
    } catch (error) {
      if (error.name === 'AbortError' || isCancelled) {
        return;
      }
      console.error("Error loading audio:", error);
    }
  }, []);

  // Fixed playback logic to respect trim boundaries
  const handlePlayPause = async () => {
    try {
      await start();

      if (isPlaying) {
        // Stop all players
        players.forEach((playerObj) => {
          if (playerObj?.player && typeof playerObj.player.stop === 'function') {
            try {
              playerObj.player.stop();
            } catch (error) {
              console.log("Stop error (can be ignored):", error);
            }
          }
        });
        dispatch(setPlaying(false));
      } else {
        dispatch(setPlaying(true));
        playbackStartRef.current = {
          systemTime: Date.now(),
          audioTime: currentTime,
        };

        // Start players that should be playing at current time
        players.forEach((playerObj) => {
          if (playerObj?.player && typeof playerObj.player.start === 'function') {
            const trackStartTime = playerObj.startTime || 0;
            const trimStart = playerObj.trimStart || 0;
            const trimEnd = playerObj.trimEnd || playerObj.duration;
            
            // Calculate timeline positions for trimmed audio
            const trimmedTrackStart = trackStartTime;
            const trimmedTrackEnd = trackStartTime + (trimEnd - trimStart);
            
            // Only start if current time is within the trimmed region
            if (currentTime >= trimmedTrackStart && currentTime < trimmedTrackEnd) {
              const offsetInTrimmedRegion = currentTime - trimmedTrackStart;
              const startOffsetInOriginalAudio = trimStart + offsetInTrimmedRegion;
              const remainingTrimmedDuration = (trimEnd - trimStart) - offsetInTrimmedRegion;
              
              if (remainingTrimmedDuration > 0) {
                try {
                  playerObj.player.start(undefined, startOffsetInOriginalAudio, remainingTrimmedDuration);
                } catch (error) {
                  console.log("Start error:", error);
                }
              }
            }
          }
        });
      }
    } catch (error) {
      console.error("Error during play/pause:", error);
    }
  };

  // Fixed seek logic to respect trim boundaries
  const movePlayhead = (e) => {
    if (!timelineContainerRef.current) return;

    const svgRect = timelineContainerRef.current.getBoundingClientRect();
    const x = e.clientX - svgRect.left;
    const width = svgRect.width;
    const duration = audioDuration;
    
    if (width <= 0 || duration <= 0) return;
    
    let rawTime = (x / width) * duration;
    rawTime = Math.max(0, Math.min(duration, rawTime));
    
    // Grid snapping for playhead
    const gridSpacing = getGridSpacing(selectedGrid);
    const snapToGrid = (time) => {
      if (!gridSpacing || gridSpacing <= 0) return time;
      const gridPosition = Math.round(time / gridSpacing) * gridSpacing;
      return Math.max(0, Math.min(duration, gridPosition));
    };
    
    const time = snapToGrid(rawTime);
    dispatch(setCurrentTime(time));

    // Update wavesurfer visual progress
    waveSurfers.forEach((ws) => {
      if (ws && typeof ws.seekTo === 'function' && typeof ws.getDuration === 'function') {
        const wsDuration = ws.getDuration();
        if (wsDuration > 0) {
          ws.seekTo(time / wsDuration);
        }
      }
    });

    if (isPlaying) {
      // Stop all currently playing tracks
      players.forEach((playerObj) => {
        if (playerObj?.player && typeof playerObj.player.stop === 'function') {
          try {
            playerObj.player.stop();
          } catch (error) {
            console.log("Stop during seek error (can be ignored):", error);
          }
        }
      });
      
      // Restart tracks that should be playing at the new position
      players.forEach((playerObj) => {
        if (playerObj?.player && typeof playerObj.player.start === 'function') {
          const trackStartTime = playerObj.startTime || 0;
          const trimStart = playerObj.trimStart || 0;
          const trimEnd = playerObj.trimEnd || playerObj.duration;
          
          const trimmedTrackStart = trackStartTime;
          const trimmedTrackEnd = trackStartTime + (trimEnd - trimStart);
          
          // Only start if seeking to within the trimmed region
          if (time >= trimmedTrackStart && time < trimmedTrackEnd) {
            const offsetInTrimmedRegion = time - trimmedTrackStart;
            const startOffsetInOriginalAudio = trimStart + offsetInTrimmedRegion;
            const remainingTrimmedDuration = (trimEnd - trimStart) - offsetInTrimmedRegion;
            
            if (remainingTrimmedDuration > 0) {
              try {
                playerObj.player.start(undefined, startOffsetInOriginalAudio, remainingTrimmedDuration);
              } catch (error) {
                console.log("Start during seek error:", error);
              }
            }
          }
        }
      });
      
      playbackStartRef.current = {
        systemTime: Date.now(),
        audioTime: time,
      };
    }
  };

  // Fixed animation loop to respect trim boundaries and looping
  useEffect(() => {
    let localAnimationId = null;

    if (isPlaying) {
      const updateLoop = () => {
        if (!isPlaying) return;
        
        const elapsedTime = (Date.now() - playbackStartRef.current.systemTime) / 1000;
        let newTime = playbackStartRef.current.audioTime + elapsedTime;

        // Handle looping
        if (isLoopEnabled && newTime >= loopEnd) {
          newTime = loopStart;
          playbackStartRef.current = {
            systemTime: Date.now(),
            audioTime: loopStart,
          };
          
          // Stop all players and restart them at loop start
          players.forEach((playerObj) => {
            if (playerObj?.player && typeof playerObj.player.stop === 'function') {
              try {
                playerObj.player.stop();
              } catch (error) {
                // Silently ignore stop errors
              }
            }
          });
          
          // Restart players that should be playing at loop start
          players.forEach((playerObj) => {
            if (playerObj?.player && typeof playerObj.player.start === 'function') {
              const trackStartTime = playerObj.startTime || 0;
              const trimStart = playerObj.trimStart || 0;
              const trimEnd = playerObj.trimEnd || playerObj.duration;
              
              const trimmedTrackStart = trackStartTime;
              const trimmedTrackEnd = trackStartTime + (trimEnd - trimStart);
              
              if (loopStart >= trimmedTrackStart && loopStart < trimmedTrackEnd) {
                const offsetInTrimmedRegion = loopStart - trimmedTrackStart;
                const startOffsetInOriginalAudio = trimStart + offsetInTrimmedRegion;
                const remainingTrimmedDuration = (trimEnd - trimStart) - offsetInTrimmedRegion;
                
                if (remainingTrimmedDuration > 0) {
                  try {
                    playerObj.player.start(undefined, startOffsetInOriginalAudio, remainingTrimmedDuration);
                  } catch (error) {
                    console.log("Track start error during loop:", error);
                  }
                }
              }
            }
          });
        } else if (!isLoopEnabled && newTime >= audioDuration) {
          dispatch(setPlaying(false));
          dispatch(setCurrentTime(audioDuration));
          players.forEach((playerObj) => {
            if (playerObj?.player && typeof playerObj.player.stop === 'function') {
              try {
                playerObj.player.stop();
              } catch (error) {
                // Silently ignore stop errors
              }
            }
          });
          return;
        }

        // Update local state for smooth animation
        setLocalCurrentTime(newTime);
        
        // Throttle Redux updates to improve performance (update every 60ms instead of every frame)
        const reduxUpdateTime = Date.now();
        if (!lastReduxUpdateRef.current || reduxUpdateTime - lastReduxUpdateRef.current > 60) {
          dispatch(setCurrentTime(newTime));
          lastReduxUpdateRef.current = reduxUpdateTime;
        }
        
        // Update each player based on trim boundaries (throttled to improve performance)
        const playerUpdateTime = Date.now();
        if (!lastPlayerUpdateRef.current || playerUpdateTime - lastPlayerUpdateRef.current > 100) {
          players.forEach((playerObj) => {
            if (playerObj?.player) {
              const trackStartTime = playerObj.startTime || 0;
              const trimStart = playerObj.trimStart || 0;
              const trimEnd = playerObj.trimEnd || playerObj.duration;
              
              const trimmedTrackStart = trackStartTime;
              const trimmedTrackEnd = trackStartTime + (trimEnd - trimStart);
              
              // Stop track if playhead moves beyond the trimmed end
              if (newTime >= trimmedTrackEnd && playerObj.player.state === 'started') {
                try {
                  playerObj.player.stop();
                } catch (error) {
                  // Silently ignore stop errors
                }
              }
              
              // Start track if playhead enters the trimmed region
              const previousTime = playbackStartRef.current.audioTime + ((elapsedTime - 1/60));
              if (previousTime < trimmedTrackStart && 
                  newTime >= trimmedTrackStart && 
                  newTime < trimmedTrackEnd &&
                  playerObj.player.state !== 'started') {
                try {
                  const offsetInTrimmedRegion = newTime - trimmedTrackStart;
                  const startOffsetInOriginalAudio = trimStart + offsetInTrimmedRegion;
                  const remainingTrimmedDuration = (trimEnd - trimStart) - offsetInTrimmedRegion;
                  
                  if (remainingTrimmedDuration > 0) {
                    playerObj.player.start(undefined, startOffsetInOriginalAudio, remainingTrimmedDuration);
                  }
                } catch (error) {
                  console.log("Track start error during animation:", error);
                }
              }
            }
          });
          lastPlayerUpdateRef.current = playerUpdateTime;
        }
        
        localAnimationId = requestAnimationFrame(updateLoop);
      };

      localAnimationId = requestAnimationFrame(updateLoop);
    }

    return () => {
      if (localAnimationId) {
        cancelAnimationFrame(localAnimationId);
      }
    };
  }, [isPlaying, audioDuration, players, isLoopEnabled, loopStart, loopEnd]);



  const renderRuler = useCallback(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    const svgNode = svgRef.current;
    const width = svgNode.clientWidth || 600;
    const axisY = 80;
    const duration = audioDuration;

    svg.selectAll("*").remove();

    if (width <= 0 || duration <= 0) return;

    const xScale = d3.scaleLinear().domain([0, duration]).range([0, width]);
    const labelInterval = 1;

    const gridDivisions = getGridDivisions(selectedGrid);
    const gridSpacing = 1 / gridDivisions;
    const gridColor = "#FFFFFF";

    for (let time = 0; time <= duration; time += gridSpacing) {
      const x = xScale(time);
      const isMainBeat = Math.abs(time - Math.round(time)) < 0.01;
      const isHalfBeat = Math.abs(time - Math.round(time * 2) / 2) < 0.01;
      const isQuarterBeat = Math.abs(time - Math.round(time * 4) / 4) < 0.01;
      const sec = Math.round(time);
      const isLabeled = sec % labelInterval === 0 && isMainBeat;

      let tickHeight = 4;
      let strokeWidth = 0.5;
      let opacity = 0.6;

      if (isMainBeat) {
        tickHeight = 20;
        strokeWidth = 1.5;
        opacity = 1;
      } else if (isHalfBeat) {
        tickHeight = 14;
        strokeWidth = 1;
        opacity = 0.8;
      } else if (isQuarterBeat) {
        tickHeight = 10;
        strokeWidth = 0.8;
        opacity = 0.7;
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
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        const label = `${minutes}:${seconds.toString().padStart(2, "0")}`;
        svg
          .append("text")
          .attr("x", x + 4)
          .attr("y", axisY - tickHeight - 5)
          .attr("fill", "white")
          .attr("font-size", 12)
          .attr("text-anchor", "start")
          .text(label);
      }
    }

    svg
      .append("line")
      .attr("x1", 0)
      .attr("y1", axisY)
      .attr("x2", width)
      .attr("y2", axisY)
      .attr("stroke", "white")
      .attr("stroke-width", 1);
  }, [audioDuration, selectedGrid]);

  useEffect(() => {
    renderRuler();
  }, [renderRuler, audioDuration, selectedGrid]);

  // Sync local state with Redux state
  useEffect(() => {
    setLocalCurrentTime(currentTime);
  }, [currentTime]);

  // Handle Redux play/pause state changes
  useEffect(() => {
    const handleReduxPlayPause = async () => {
      try {
        await start();
        
        if (isPlaying) {
          // Start playback animation
          playbackStartRef.current = {
            systemTime: Date.now(),
            audioTime: currentTime,
          };

          // Start players that should be playing at current time
          players.forEach((playerObj) => {
            if (playerObj?.player && typeof playerObj.player.start === 'function') {
              const trackStartTime = playerObj.startTime || 0;
              const trimStart = playerObj.trimStart || 0;
              const trimEnd = playerObj.trimEnd || playerObj.duration;
              
              // Calculate timeline positions for trimmed audio
              const trimmedTrackStart = trackStartTime;
              const trimmedTrackEnd = trackStartTime + (trimEnd - trimStart);
              
              // Only start if current time is within the trimmed region
              if (currentTime >= trimmedTrackStart && currentTime < trimmedTrackEnd) {
                const offsetInTrimmedRegion = currentTime - trimmedTrackStart;
                const startOffsetInOriginalAudio = trimStart + offsetInTrimmedRegion;
                const remainingTrimmedDuration = (trimEnd - trimStart) - offsetInTrimmedRegion;
                
                if (remainingTrimmedDuration > 0) {
                  try {
                    playerObj.player.start(undefined, startOffsetInOriginalAudio, remainingTrimmedDuration);
                  } catch (error) {
                    console.log("Start error:", error);
                  }
                }
              }
            }
          });
        } else {
          // Stop all players
          players.forEach((playerObj) => {
            if (playerObj?.player && typeof playerObj.player.stop === 'function') {
              try {
                playerObj.player.stop();
              } catch (error) {
                console.log("Stop error (can be ignored):", error);
              }
            }
          });
        }
      } catch (error) {
        console.error("Error handling Redux play/pause:", error);
      }
    };

    handleReduxPlayPause();
  }, [isPlaying, currentTime, players]);  

  // Update loop end when audio duration changes
  useEffect(() => {
    if (audioDuration > 0) {
      if (loopEnd > audioDuration) {
        setLoopEnd(audioDuration);
      } else if (loopEnd === 10 && audioDuration > 10) {
        // Initialize loop end to a reasonable value when audio loads
        setLoopEnd(Math.min(30, audioDuration));
      }
    }
  }, [audioDuration, loopEnd]);

  useEffect(() => {
    return () => {
      players.forEach((player) => {
        if (player && typeof player.dispose === 'function') {
          player.dispose();
        }
      });
      waveSurfers.forEach((ws) => {
        if (ws && typeof ws.destroy === 'function') {
          ws.destroy();
        }
      });
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, []);

  const handleMouseDown = (e) => {
    // Only handle playhead movement if not clicking on a track
    const isTrackElement = e.target.closest('[data-rnd]');
    if (!isTrackElement) {
      isDragging.current = true;
      movePlayhead(e);
    }
  };

  const handleMouseMove = useCallback((e) => {
    if (!isDragging.current) return;
    movePlayhead(e);
  }, []);

  const handleMouseUp = useCallback(() => {
    isDragging.current = false;
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log('Drop event triggered');
    console.log('DataTransfer types:', e.dataTransfer.types);
    
    try {
      const data = e.dataTransfer.getData('text/plain');
      console.log('Dropped data:', data);
      
      if (data) {
        const soundItem = JSON.parse(data);
        console.log('Parsed sound item:', soundItem);
        
        if (!soundItem.soundfile) {
          console.error('No soundfile found in dropped item');
          return;
        }
        
        const rect = timelineContainerRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const width = rect.width;
        const duration = audioDuration;
        const rawDropTime = (x / width) * duration;
        
        console.log('Drop coordinates:', { x, width, duration, rawDropTime });
        
        // Grid snapping for drop position
        const gridSpacing = getGridSpacing(selectedGrid);
        const snapToGrid = (time) => {
          if (!gridSpacing || gridSpacing <= 0) return time;
          const gridPosition = Math.round(time / gridSpacing) * gridSpacing;
          return Math.max(0, gridPosition);
        };
        
        const dropTime = snapToGrid(rawDropTime);
        console.log('Snapped drop time:', dropTime);
        
        const url = `${IMAGE_URL}uploads/soundfile/${soundItem.soundfile}`;
        let audioDurationSec = null;
        try {
          const response = await fetch(url);
          const arrayBuffer = await response.arrayBuffer();
          const audioContext = new (window.AudioContext || window.webkitAudioContext)();
          const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
          audioDurationSec = audioBuffer.duration;
          console.log('Audio duration:', audioDurationSec);
        } catch (err) {
          console.error('Error fetching or decoding audio for duration:', err);
          // Use a default duration if we can't get the actual duration
          audioDurationSec = 5; // 5 seconds default
        }
        
        const newTrack = {
          id: Date.now(),
          name: soundItem.soundname || 'New Track',
          url: `${IMAGE_URL}uploads/soundfile/${soundItem.soundfile}`,
          color: '#FFB6C1',
          height: trackHeight,
          startTime: dropTime,
          duration: audioDurationSec,
          trimStart: 0,
          trimEnd: audioDurationSec,
          soundData: soundItem
        };
        
        console.log('Creating new track:', newTrack);
        dispatch(addTrack(newTrack));
      } else {
        console.log('No data found in drop event');
      }
    } catch (error) {
      console.error('Error processing dropped item:', error);
    }
  }, [audioDuration, dispatch, trackHeight, selectedGrid]);

  // Context menu handlers
  const handleContextMenu = useCallback((e, trackId) => {
    e.preventDefault();
    e.stopPropagation();
    
    setContextMenu({
      isOpen: true,
      position: { x: e.clientX, y: e.clientY },
      trackId: trackId
    });
  }, []);

  const handleContextMenuClose = useCallback(() => {
    setContextMenu({
      isOpen: false,
      position: { x: 0, y: 0 },
      trackId: null
    });
  }, []);

  const handleContextMenuAction = useCallback((action) => {
    const { trackId } = contextMenu;
    if (!trackId) return;

    const track = tracks.find(t => t.id === trackId);
    if (!track) return;

    switch (action) {
      case 'cut':
        // Implement cut functionality
        console.log('Cut track:', trackId);
        break;
      case 'copy':
        // Implement copy functionality
        console.log('Copy track:', trackId);
        break;
      case 'paste':
        // Implement paste functionality
        console.log('Paste track');
        break;
      case 'delete':
        // Implement delete functionality
        console.log('Delete track:', trackId);
        break;
      case 'editName':
        // Implement edit name functionality
        console.log('Edit name for track:', trackId);
        break;
      case 'splitRegion':
        // Implement split region functionality
        console.log('Split region for track:', trackId);
        break;
      case 'muteRegion':
        // Implement mute region functionality
        console.log('Mute region for track:', trackId);
        break;
      case 'changePitch':
        // Implement change pitch functionality
        console.log('Change pitch for track:', trackId);
        break;
      case 'vocalCleanup':
        // Implement vocal cleanup functionality
        console.log('Vocal cleanup for track:', trackId);
        break;
      case 'vocalTuner':
        // Implement vocal tuner functionality
        console.log('Vocal tuner for track:', trackId);
        break;
      case 'voiceTransform':
        // Implement voice transform functionality
        console.log('Voice transform for track:', trackId);
        break;
      case 'reverse':
        // Implement reverse functionality
        console.log('Reverse track:', trackId);
        break;
      case 'effects':
        // Implement effects functionality
        console.log('Effects for track:', trackId);
        break;
      case 'matchProjectKey':
        // Implement match project key functionality
        console.log('Match project key for track:', trackId);
        break;
      case 'addToLoopLibrary':
        // Implement add to loop library functionality
        console.log('Add to loop library for track:', trackId);
        break;
      case 'openInSampler':
        // Implement open in sampler functionality
        console.log('Open in sampler for track:', trackId);
        break;
      default:
        console.log('Unknown action:', action);
    }
  }, [contextMenu, tracks]);

  const renderGridLines = () => {
    const gridLines = [];
    const width = timelineContainerRef.current?.clientWidth || 600;
    const duration = audioDuration;
    
    if (width <= 0 || duration <= 0) return gridLines;
    
    const xScale = d3.scaleLinear().domain([0, duration]).range([0, width]);
    const gridDivisions = getGridDivisions(selectedGrid);
    const gridSpacing = 1 / gridDivisions;
    
    // Calculate the total height of all tracks
    const totalTracksHeight = tracks.length > 0 ? trackHeight * tracks.length : 0;
    
    for (let time = 0; time <= duration; time += gridSpacing) {
      const x = xScale(time);
      const isMainBeat = Math.abs(time - Math.round(time)) < 0.01;
      const isHalfBeat = Math.abs(time - Math.round(time * 2) / 2) < 0.01;
      const isQuarterBeat = Math.abs(time - Math.round(time * 4) / 4) < 0.01;
      
      let lineColor = "#FFFFFF1A";
      let lineWidth = 1;
      let lineOpacity = 0.3;
      
      if (isMainBeat) {
        lineColor = "#FFFFFF40";
        lineWidth = 1.5;
        lineOpacity = 0.6;
      } else if (isHalfBeat) {
        lineColor = "#FFFFFF30";
        lineWidth = 1.2;
        lineOpacity = 0.4;
      } else if (isQuarterBeat) {
        lineColor = "#FFFFFF25";
        lineWidth = 1;
        lineOpacity = 0.35;
      }
      
      gridLines.push(
        <div
          key={`grid-${time}`}
          style={{
            position: "absolute",
            left: `${x}px`,
            top: "0px", // Start from the top of tracks container
            width: `${lineWidth}px`,
            height: `${totalTracksHeight}px`, // Extend through all tracks
            background: lineColor,
            opacity: lineOpacity,
            zIndex: 1,
            pointerEvents: "none",
          }}
        />
      );
    }
    return gridLines;
  };
  

  // Calculate playhead position in pixels for smoother animation
  const playheadPosition = useMemo(() => {
    return localCurrentTime * timelineWidthPerSecond;
  }, [localCurrentTime, timelineWidthPerSecond]);

  return (
    <>
        <div
        style={{
          padding: "0",
          color: "white",
          background: "transparent",
          height: "100%",
          marginRight: showOffcanvas ? "23vw" : 0,
        }}
        className="relative overflow-hidden"
      >
        <div
          style={{ width: "100%", overflowX: "auto" }}
          className="hide-scrollbar"
        >
          <div
            ref={timelineContainerRef}
            style={{ 
              minWidth: `${Math.max(audioDuration, 12) * timelineWidthPerSecond}px`, 
              position: "relative", 
              height: "100%" 
            }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {/* Timeline Header */}
            <div style={{ height: "100px", borderBottom: "1px solid #1414141A" }}>
              <svg
                ref={svgRef}
                width="100%"
                height="100%"
                style={{ color: "white", width: "100%" }}
              />
            </div>

            {/* Loop Bar - positioned right below timeline header */}
            <LoopBar
              audioDuration={audioDuration}
              loopStart={loopStart}
              loopEnd={loopEnd}
              onLoopChange={handleLoopChange}
              timelineWidthPerSecond={timelineWidthPerSecond}
              gridSpacing={getGridSpacing(selectedGrid)}
              currentTime={currentTime}
              isLoopEnabled={isLoopEnabled}
            />

            {/* My Section - positioned below loop bar */}
            <MySection
              timelineContainerRef={timelineContainerRef}
              audioDuration={audioDuration}
              selectedGrid={selectedGrid}
            />

            {/* Tracks Container - adjusted top margin to account for loop bar and my section */}
            <div
              style={{
                overflow: "visible",
                position: "relative",
                minHeight: tracks.length > 0 ? `${trackHeight * tracks.length}px` : "0px",
                height: tracks.length > 0 ? `${trackHeight * tracks.length}px` : "0px",
                marginTop: "40px",
              }}
            >
              {/* Track lanes with separators - only show when there are tracks */}
              {tracks.length > 0 && Array.from({ length: tracks.length }).map((_, index) => (
                <div
                  key={`lane-${index}`}
                  style={{
                    position: "absolute",
                    top: `${(index * trackHeight) - sidebarScrollOffset}px`,
                    left: 0,
                    width: "100%",
                    height: `${trackHeight}px`,
                    borderTop: "1px solid #FFFFFF1A",
                    borderBottom: "1px solid #FFFFFF1A",
                    zIndex: 0,
                  }}
                />
              ))}

              {/* Tracks */}
              {tracks.map((track, index) => (
                <div
                  key={track.id}
                  style={{
                    position: "absolute",
                    top: `${(index * trackHeight) - sidebarScrollOffset}px`,
                    left: 0,
                    width: "100%",
                    height: `${trackHeight}px`,
                    zIndex: 0,
                    opacity: (soloTrackId ? soloTrackId !== track.id : track.muted) ? 0.5 : 1,
                    pointerEvents: "auto",
                  }}
                >
                  <TimelineTrack
                    key={track.id}
                    url={track.url}
                    color={track.color}
                    height={trackHeight}
                    trackId={track.id}
                    onReady={(ws) => handleReady(ws, track.url, track)}
                    startTime={track.startTime}
                    duration={track.duration}
                    trimStart={track.trimStart || 0}
                    trimEnd={track.trimEnd || track.duration}
                    onTrimChange={(trimData) => handleTrimChange(track.id, trimData)}
                    onPositionChange={handleTrackPositionChange}
                    timelineWidthPerSecond={timelineWidthPerSecond}
                    frozen={track.frozen}
                    gridSpacing={getGridSpacing(selectedGrid)}
                    onContextMenu={(e) => handleContextMenu(e, track.id)}
                  />
                </div>
              ))}
            </div>

            {/* Playhead - adjusted to account for loop bar */}
            <div
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                height: "100%",
                width: "2px",
                pointerEvents: "none",
                zIndex: 10,
                transform: `translateX(${playheadPosition}px)`,
                willChange: "transform",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: "60px",
                  left: "-8px",
                  width: "18px",
                  height: "18px",
                  background: "#AD00FF",
                  borderRadius: "3px",
                  border: "1px solid #fff",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  top: "78px",
                  left: 0,
                  bottom: 0,
                  width: "2px",
                  background: "#AD00FF",
                }}
              />
            </div>

            {/* Grid lines - only show when there are tracks */}
            {tracks.length > 0 && (
              <div
                style={{
                  position: "absolute",
                  top: `${140 - sidebarScrollOffset}px`, // Adjusted for loop bar and scroll offset
                  left: 0,
                  width: "100%",
                  height: `${trackHeight * tracks.length}px`,
                  pointerEvents: "none",
                }}
              >
                {renderGridLines()}
              </div>
            )}
          </div>
        </div>



        {/* Top right controls */}
        <div className="flex gap-2 absolute top-[60px] right-[10px] -translate-x-1/2 bg-[#141414]">
          <div className="hover:bg-[#1F1F1F] w-[30px] h-[30px] flex items-center justify-center rounded-full">
            <img src={magnetIcon} alt="Magnet" />
          </div>
          <div
            className="hover:bg-[#1F1F1F] w-[30px] h-[30px] flex items-center justify-center rounded-full relative"
            onClick={() => setShowGridSetting((prev) => !prev)}
          >
            <img src={settingIcon} alt="Settings" />
            {showGridSetting && (
              <div className="absolute top-full right-0 z-[50]">
                <GridSetting 
                  selectedGrid={selectedGrid}
                  selectedTime={selectedTime}
                  selectedRuler={selectedRuler}
                  onGridChange={(grid) => dispatch(setSelectedGrid(grid))}
                  onTimeChange={(time) => dispatch(setSelectedTime(time))}
                  onRulerChange={(ruler) => dispatch(setSelectedRuler(ruler))}
                />
              </div>
            )}
          </div>
          <div className="hover:bg-[#1F1F1F] w-[30px] h-[30px] flex items-center justify-center rounded-full"   onClick={() => setIsLoopEnabled(!isLoopEnabled)}>
            <img src={reverceIcon} alt="Reverse" />
          </div>
        </div>

        {/* Right side controls */}
        <div className="absolute top-[60px] right-[0] -translate-x-1/2 z-10">
          <div
            className="bg-[#FFFFFF] w-[40px] h-[40px] flex items-center justify-center rounded-full cursor-pointer"
            onClick={() => setShowOffcanvas((prev) => !prev)}
          >
            <img src={offce} alt="Off canvas" />
          </div>
          <div className="bg-[#1F1F1F] w-[40px] h-[40px] flex items-center justify-center rounded-full mt-2">
            <img src={fxIcon} alt="Effects" />
          </div>
        </div>
      
      </div>

      <MusicOff showOffcanvas={showOffcanvas} setShowOffcanvas={setShowOffcanvas} />
      
      {/* Context Menu */}
      <WaveMenu
        isOpen={contextMenu.isOpen}
        position={contextMenu.position}
        onClose={handleContextMenuClose}
        onAction={handleContextMenuAction}
      />
    </>
  );
};

export default Timeline;