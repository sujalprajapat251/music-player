import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";
import WaveSurfer from "wavesurfer.js";
import { Player, start } from "tone";
import * as d3 from "d3";
import { useSelector, useDispatch } from "react-redux";
import { addTrack, addAudioClipToTrack, updateAudioClip, removeAudioClip, setPlaying, setCurrentTime, setAudioDuration, toggleMuteTrack } from "../Redux/Slice/studio.slice";
import { selectGridSettings, setSelectedGrid, setSelectedTime, setSelectedRuler, setBPM } from "../Redux/Slice/grid.slice";
import { getGridSpacingWithTimeSignature, parseTimeSignature } from "../Utils/gridUtils";
import { IMAGE_URL } from "../Utils/baseUrl";
import { getNextTrackColor } from "../Utils/colorUtils";
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
import TimelineActionBoxes from "./TimelineActionBoxes";
import AddNewTrackModel from "./AddNewTrackModel";
import Piano from "./Piano";
import WavEncoder from 'wav-encoder';
import Drum from './Drum';

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
          transition: isDragging ? "none" : "all 0.2s ease",
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
            position: "absolute",
            left: "14px",
            bottom: "0px"
          }}
        >
          {type === 'start' ? '[>' : '<]'}
        </div>
      </div>

    </div>
  );
};

// Individual Audio Clip Component
const AudioClip = ({
  clip,
  onReady,
  height,
  trackId,
  onTrimChange,
  onPositionChange,
  onContextMenu,
  onSelect,
  isSelected = false,
  timelineWidthPerSecond = 100,
  frozen = false,
  gridSpacing = 0.25,
}) => {
  console.log('AudioClip render:', { clip, trackId });
  const waveformRef = useRef(null);
  const wavesurfer = useRef(null);
  const isInitialized = useRef(false);
  const [isDraggingTrim, setIsDraggingTrim] = useState(null);

  useEffect(() => {
    if (!waveformRef.current || !clip.url || isInitialized.current) return;

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
          waveColor: frozen ? "#666666" : "#ffffff",
          progressColor: frozen ? "#999999" : "#ffffff",
          height: height - 8,
          barWidth: 2,
          responsive: true,
          minPxPerSec: 50,
          normalize: true,
        });

        if (!isMounted) return;

        const readyHandler = () => {
          if (isMounted && onReady && wavesurfer.current) {
            onReady(wavesurfer.current, { ...clip, trackId });
          }
        };

        const errorHandler = (error) => {
          if (isMounted) {
            console.error("WaveSurfer error:", error);
          }
        };

        wavesurfer.current.on("ready", readyHandler);
        wavesurfer.current.on("error", errorHandler);

        wavesurfer.current.load(clip.url);
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
  }, [clip.id, frozen, clip.url]);

  const handleTrimResize = useCallback((type, newPosition) => {
    if (frozen) return;

    if (!onTrimChange || !clip.duration) return;

    const currentTrimStart = clip.trimStart || 0;
    const currentTrimEnd = clip.trimEnd || clip.duration;

    const snapToGrid = (time) => {
      if (!gridSpacing || gridSpacing <= 0) return time;
      const gridPosition = Math.round(time / gridSpacing) * gridSpacing;
      return Math.max(0, Math.min(clip.duration, gridPosition));
    };

    if (type === 'start') {
      const snappedPosition = snapToGrid(newPosition);
      const newTrimStart = Math.max(0, Math.min(snappedPosition, currentTrimEnd - gridSpacing));
      const trimStartDelta = newTrimStart - currentTrimStart;
      const newStartTime = clip.startTime + trimStartDelta;

      onTrimChange(clip.id, {
        trimStart: newTrimStart,
        trimEnd: currentTrimEnd,
        newStartTime: Math.max(0, newStartTime)
      });
    } else if (type === 'end') {
      const snappedPosition = snapToGrid(newPosition);
      const newTrimEnd = Math.max(currentTrimStart + gridSpacing, Math.min(snappedPosition, clip.duration));
      onTrimChange(clip.id, { trimStart: currentTrimStart, trimEnd: newTrimEnd });
    }
  }, [clip, onTrimChange, gridSpacing, frozen]);

  const handleDragStart = useCallback((type) => {
    if (frozen) return;
    setIsDraggingTrim(type);
  }, [frozen]);

  const handleDragEnd = useCallback(() => {
    setIsDraggingTrim(null);
  }, []);

  const handleDragStop = useCallback((e, d) => {
    const rawStartTime = Math.max(0, d.x / timelineWidthPerSecond);

    const snapToGrid = (time) => {
      if (!gridSpacing || gridSpacing <= 0) return time;
      const gridPosition = Math.round(time / gridSpacing) * gridSpacing;
      return Math.max(0, gridPosition);
    };

    const snappedStartTime = snapToGrid(rawStartTime);

    if (onPositionChange) {
      onPositionChange(clip.id, snappedStartTime);
    }
  }, [clip.id, onPositionChange, timelineWidthPerSecond, gridSpacing]);

  console.log('AudioClip render details:', {
    clipUrl: clip.url,
    clipDuration: clip.duration,
    clipTrimStart: clip.trimStart,
    clipTrimEnd: clip.trimEnd,
    clipStartTime: clip.startTime
  });

  const width = (clip.duration || 1) * timelineWidthPerSecond;
  const actualTrimEnd = clip.trimEnd || clip.duration;
  const visibleWidth = ((actualTrimEnd - (clip.trimStart || 0)) / clip.duration) * width;
  const rndX = (clip.startTime || 0) * timelineWidthPerSecond;

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
      enableResizing={false}
      dragAxis="x"
      bounds="parent"
      onClick={(e) => {
        e.stopPropagation();
        onSelect && onSelect(clip);
      }}
      onContextMenu={(e) => onContextMenu && onContextMenu(e, trackId, clip.id)}
      style={{
        background: clip.color || "transparent",
        borderRadius: '8px',
        border: isSelected
          ? "2px solid #AD00FF"
          : isDraggingTrim
            ? "2px solid #AD00FF"
            : "1px solid rgba(255,255,255,0.1)",
        boxShadow: isSelected || isDraggingTrim
          ? "0 4px 20px rgba(173,0,255,0.3)"
          : "none",
        transition: isDraggingTrim ? "none" : "all 0.2s ease",
        overflow: "hidden",
        zIndex: 10,
        position: "relative",
      }}
    >
      {/* Waveform with clip-path to show only trimmed portion */}
      {(() => {
        const shouldRender = clip.url && clip.duration > 0;
        console.log('Waveform render condition:', {
          shouldRender,
          hasUrl: !!clip.url,
          duration: clip.duration,
          condition: `${!!clip.url} && ${clip.duration} > 0`
        });
        return shouldRender;
      })() && (
          <>
            <div
              ref={waveformRef}
              style={{
                width: `${width}px`,
                height: "100%",
                position: "absolute",
                top: 0,
                left: `-${((clip.trimStart || 0) / clip.duration) * width}px`,
                zIndex: 1,
                clipPath: `inset(0 ${(1 - (actualTrimEnd / clip.duration)) * 100}% 0 ${((clip.trimStart || 0) / clip.duration) * 100}%)`,
              }}
            />

            {/* Trim Handles */}
            <ResizableTrimHandle
              type="start"
              position={clip.trimStart || 0}
              onResize={handleTrimResize}
              isDragging={isDraggingTrim === 'start'}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              trackDuration={clip.duration}
              trackWidth={width}
              trimStart={clip.trimStart || 0}
              trimEnd={actualTrimEnd}
              gridSpacing={gridSpacing}
            />

            <ResizableTrimHandle
              type="end"
              position={actualTrimEnd}
              onResize={handleTrimResize}
              isDragging={isDraggingTrim === 'end'}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              trackDuration={clip.duration}
              trackWidth={width}
              trimStart={clip.trimStart || 0}
              trimEnd={actualTrimEnd}
              gridSpacing={gridSpacing}
            />

            {/* Remove button */}
            <div
              style={{
                position: "absolute",
                top: "2px",
                right: "2px",
                width: "16px",
                height: "16px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                zIndex: 20,
              }}
            >
              <img src={reverceIcon} alt="" />
            </div>
          </>
        )}
    </Rnd>
  );
};

const TimelineTrack = ({
  track,
  onReady,
  height,
  trackId,
  onTrimChange,
  onPositionChange,
  onRemoveClip,
  onContextMenu,
  onSelect,
  selectedClipId,
  timelineWidthPerSecond = 100,
  frozen = false,
  gridSpacing = 0.25,
}) => {
  console.log('TimelineTrack render:', { trackId, audioClips: track.audioClips, track });

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: height,
        background: "transparent",
      }}
    >
      {/* Render each audio clip in the track */}
      {track.audioClips && track.audioClips.map((clip) => {
        console.log('Rendering clip:', clip);
        return (
          <AudioClip
            key={clip.id}
            clip={clip}
            onReady={onReady}
            height={height}
            trackId={trackId}
            onTrimChange={onTrimChange}
            onPositionChange={onPositionChange}
            onRemoveClip={onRemoveClip}
            timelineWidthPerSecond={timelineWidthPerSecond}
            frozen={frozen}
            gridSpacing={gridSpacing}
            onContextMenu={onContextMenu}
            onSelect={onSelect}
            isSelected={selectedClipId === clip.id}
          />
        );
      })}
    </div>
  );
};

// Loop Bar Component
const LoopBar = ({
  audioDuration,
  loopStart,
  loopEnd,
  onLoopChange,
  gridSpacing = 0.25,
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
        zIndex: 25,
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
  const [clipboard, setClipboard] = useState(null);
  const [selectedTrackId, setSelectedTrackId] = useState(null);
  const [selectedClipId, setSelectedClipId] = useState(null);
  const [showAddTrackModal, setShowAddTrackModal] = useState(false);
  const fileInputRef = useRef(null);
  const [showPiano, setShowPiano] = useState(false);

  // Context menu state
  const [contextMenu, setContextMenu] = useState({
    isOpen: false,
    position: { x: 0, y: 0 },
    trackId: null,
    clipId: null
  });



  const dispatch = useDispatch();
  const tracks = useSelector((state) => state.studio?.tracks || []);
  const trackHeight = useSelector((state) => state.studio?.trackHeight || 100);

  // Debug: Log tracks state
  console.log('Current tracks state:', tracks);
  const sidebarScrollOffset = useSelector((state) => state.studio?.sidebarScrollOffset || 0);
  const soloTrackId = useSelector((state) => state.studio.soloTrackId);
  const sectionLabels = useSelector((state) => state.studio?.sectionLabels || []);
  console.log("sectionLabels", sectionLabels);

  const timelineWidthPerSecond = 100;

  // Get audio state from Redux
  const isPlaying = useSelector((state) => state.studio?.isPlaying || false);
  const currentTime = useSelector((state) => state.studio?.currentTime || 0);
  const audioDuration = useSelector((state) => state.studio?.audioDuration || 150);

  // Grid settings from Redux
  const { selectedGrid, selectedTime, selectedRuler } = useSelector(selectGridSettings);

  // Add masterVolume selector after other selectors
  const masterVolume = useSelector((state) => state.studio?.masterVolume ?? 80);



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

  // After the mute functionality useEffect (line ~758), add a new useEffect for masterVolume
  useEffect(() => {
    // Convert masterVolume (0-100) to dB: 0 = -60dB, 100 = 0dB
    const volumeDb = (masterVolume - 100) * 0.6;
    players.forEach(playerObj => {
      if (playerObj.player && typeof playerObj.player.volume === 'object') {
        playerObj.player.volume.value = volumeDb;
      }
    });
  }, [masterVolume, players]);

  // Loop change handler
  const handleLoopChange = useCallback((newStart, newEnd) => {
    const gridSpacing = getGridSpacingWithTimeSignature(selectedGrid, selectedTime);
    const snapToGrid = (time) => {
      if (!gridSpacing || gridSpacing <= 0) return time;
      const gridPosition = Math.round(time / gridSpacing) * gridSpacing;
      return Math.max(0, Math.min(audioDuration, gridPosition));
    };

    const snappedStart = snapToGrid(newStart);
    const snappedEnd = snapToGrid(Math.max(snappedStart + gridSpacing, newEnd));

    setLoopStart(snappedStart);
    setLoopEnd(snappedEnd);
  }, [audioDuration, selectedGrid, selectedTime]);

  // Handle clip position changes (drag) with grid snapping
  const handleTrackPositionChange = useCallback((trackId, clipId, newStartTime) => {
    // Grid snapping for clip position
    const gridSpacing = getGridSpacingWithTimeSignature(selectedGrid, selectedTime);
    const snapToGrid = (time) => {
      if (!gridSpacing || gridSpacing <= 0) return time;
      const gridPosition = Math.round(time / gridSpacing) * gridSpacing;
      return Math.max(0, gridPosition);
    };

    const snappedStartTime = snapToGrid(newStartTime);

    dispatch(updateAudioClip({
      trackId: trackId,
      clipId: clipId,
      updates: { startTime: snappedStartTime }
    }));

    // Update the corresponding player
    setPlayers((prev) => {
      return prev.map(playerObj => {
        if (playerObj.trackId === trackId && playerObj.clipId === clipId) {
          return {
            ...playerObj,
            startTime: snappedStartTime
          };
        }
        return playerObj;
      });
    });
  }, [dispatch, selectedGrid, selectedTime]);

  // Updated trim change handler to support position changes from left trim
  const handleTrimChange = useCallback((trackId, clipId, trimData) => {
    // Validate trim data
    const { trimStart, trimEnd, newStartTime } = trimData;
    const track = tracks.find(t => t.id === trackId);
    const clip = track?.audioClips?.find(c => c.id === clipId);

    if (!track || !clip || !clip.duration) return;

    // Grid snapping for validation
    const gridSpacing = getGridSpacingWithTimeSignature(selectedGrid, selectedTime);
    const snapToGrid = (time) => {
      if (!gridSpacing || gridSpacing <= 0) return time;
      const gridPosition = Math.round(time / gridSpacing) * gridSpacing;
      return Math.max(0, Math.min(clip.duration, gridPosition));
    };

    const validatedTrimStart = snapToGrid(Math.max(0, Math.min(trimStart, clip.duration - gridSpacing)));
    const validatedTrimEnd = snapToGrid(Math.max(validatedTrimStart + gridSpacing, Math.min(trimEnd, clip.duration)));

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

    dispatch(updateAudioClip({
      trackId: trackId,
      clipId: clipId,
      updates: updates
    }));

    // Update the corresponding player with new trim data and position
    setPlayers((prev) => {
      return prev.map(playerObj => {
        if (playerObj.trackId === trackId && playerObj.clipId === clipId) {
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
  }, [dispatch, tracks, selectedGrid, selectedTime]);

  const handleReady = useCallback(async (wavesurfer, clip) => {
    if (!clip || !clip.url) return;

    let isCancelled = false;

    try {
      const controller = new AbortController();

      const response = await fetch(clip.url, {
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
      // Set player volume to masterVolume
      const volumeDb = (masterVolume - 100) * 0.6;
      player.volume.value = volumeDb;

      // Get the actual duration from the clip data or audio buffer
      const clipDuration = clip.duration || audioBuffer.duration;
      const trimStart = clip.trimStart || 0;
      const trimEnd = clip.trimEnd || clipDuration;

      setPlayers((prev) => {
        const existingIndex = prev.findIndex(p => p.trackId === clip.trackId && p.clipId === clip.id);
        const playerData = {
          player,
          trackId: clip.trackId,
          clipId: clip.id,
          startTime: clip.startTime || 0,
          duration: clipDuration,
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
  }, [masterVolume, tracks, trackHeight]);

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
            const clipStartTime = playerObj.startTime || 0;
            const trimStart = playerObj.trimStart || 0;
            const trimEnd = playerObj.trimEnd || playerObj.duration;

            // Calculate timeline positions for trimmed audio
            const trimmedClipStart = clipStartTime;
            const trimmedClipEnd = clipStartTime + (trimEnd - trimStart);

            // Only start if current time is within the trimmed region
            if (currentTime >= trimmedClipStart && currentTime < trimmedClipEnd) {
              const offsetInTrimmedRegion = currentTime - trimmedClipStart;
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
    const gridSpacing = getGridSpacingWithTimeSignature(selectedGrid, selectedTime);
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

      // Restart clips that should be playing at the new position
      players.forEach((playerObj) => {
        if (playerObj?.player && typeof playerObj.player.start === 'function') {
          const clipStartTime = playerObj.startTime || 0;
          const trimStart = playerObj.trimStart || 0;
          const trimEnd = playerObj.trimEnd || playerObj.duration;

          const trimmedClipStart = clipStartTime;
          const trimmedClipEnd = clipStartTime + (trimEnd - trimStart);

          // Only start if seeking to within the trimmed region
          if (time >= trimmedClipStart && time < trimmedClipEnd) {
            const offsetInTrimmedRegion = time - trimmedClipStart;
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

          // Restart clips that should be playing at loop start
          players.forEach((playerObj) => {
            if (playerObj?.player && typeof playerObj.player.start === 'function') {
              const clipStartTime = playerObj.startTime || 0;
              const trimStart = playerObj.trimStart || 0;
              const trimEnd = playerObj.trimEnd || playerObj.duration;

              const trimmedClipStart = clipStartTime;
              const trimmedClipEnd = clipStartTime + (trimEnd - trimStart);

              if (loopStart >= trimmedClipStart && loopStart < trimmedClipEnd) {
                const offsetInTrimmedRegion = loopStart - trimmedClipStart;
                const startOffsetInOriginalAudio = trimStart + offsetInTrimmedRegion;
                const remainingTrimmedDuration = (trimEnd - trimStart) - offsetInTrimmedRegion;

                if (remainingTrimmedDuration > 0) {
                  try {
                    playerObj.player.start(undefined, startOffsetInOriginalAudio, remainingTrimmedDuration);
                  } catch (error) {
                    console.log("Clip start error during loop:", error);
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

        // Update each clip based on trim boundaries (throttled to improve performance)
        const playerUpdateTime = Date.now();
        if (!lastPlayerUpdateRef.current || playerUpdateTime - lastPlayerUpdateRef.current > 100) {
          players.forEach((playerObj) => {
            if (playerObj?.player) {
              const clipStartTime = playerObj.startTime || 0;
              const trimStart = playerObj.trimStart || 0;
              const trimEnd = playerObj.trimEnd || playerObj.duration;

              const trimmedClipStart = clipStartTime;
              const trimmedClipEnd = clipStartTime + (trimEnd - trimStart);

              // Stop clip if playhead moves beyond the trimmed end
              if (newTime >= trimmedClipEnd && playerObj.player.state === 'started') {
                try {
                  playerObj.player.stop();
                } catch (error) {
                  // Silently ignore stop errors
                }
              }

              // Start clip if playhead enters the trimmed region
              const previousTime = playbackStartRef.current.audioTime + ((elapsedTime - 1 / 60));
              if (previousTime < trimmedClipStart &&
                newTime >= trimmedClipStart &&
                newTime < trimmedClipEnd &&
                playerObj.player.state !== 'started') {
                try {
                  const offsetInTrimmedRegion = newTime - trimmedClipStart;
                  const startOffsetInOriginalAudio = trimStart + offsetInTrimmedRegion;
                  const remainingTrimmedDuration = (trimEnd - trimStart) - offsetInTrimmedRegion;

                  if (remainingTrimmedDuration > 0) {
                    playerObj.player.start(undefined, startOffsetInOriginalAudio, remainingTrimmedDuration);
                  }
                } catch (error) {
                  console.log("Clip start error during animation:", error);
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

    // Use time signature-aware grid spacing
    const gridSpacing = getGridSpacingWithTimeSignature(selectedGrid, selectedTime);
    const gridColor = "#FFFFFF";

    // Calculate label interval based on ruler type
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

    // Create a set to track which labels have been added to avoid duplicates
    const addedLabels = new Set();

    for (let time = 0; time <= duration; time += gridSpacing) {
      const x = xScale(time);

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
          svg
            .append("text")
            .attr("x", x + 4)
            .attr("y", axisY - tickHeight - 5)
            .attr("fill", "white")
            .attr("font-size", 12)
            .attr("text-anchor", "start")
            .text(label);
          addedLabels.add(label);
        }
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
  }, [audioDuration, selectedGrid, selectedTime, selectedRuler]);

  useEffect(() => {
    renderRuler();
  }, [renderRuler, audioDuration, selectedGrid, selectedTime, selectedRuler]);

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

          // Start clips that should be playing at current time
          players.forEach((playerObj) => {
            if (playerObj?.player && typeof playerObj.player.start === 'function') {
              const clipStartTime = playerObj.startTime || 0;
              const trimStart = playerObj.trimStart || 0;
              const trimEnd = playerObj.trimEnd || playerObj.duration;

              // Calculate timeline positions for trimmed audio
              const trimmedClipStart = clipStartTime;
              const trimmedClipEnd = clipStartTime + (trimEnd - trimStart);

              // Only start if current time is within the trimmed region
              if (currentTime >= trimmedClipStart && currentTime < trimmedClipEnd) {
                const offsetInTrimmedRegion = currentTime - trimmedClipStart;
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

    console.log('=== DROP EVENT TRIGGERED ===');
    console.log('DataTransfer types:', e.dataTransfer.types);
    console.log('DataTransfer items:', e.dataTransfer.items);
    console.log('DataTransfer files:', e.dataTransfer.files);

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
        const gridSpacing = getGridSpacingWithTimeSignature(selectedGrid, selectedTime);
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

        // Check if we're dropping on an existing track or creating a new one
        const trackElement = e.target.closest('[data-track-id]');
        const trackId = trackElement ? trackElement.getAttribute('data-track-id') : null;

        console.log('Drop detection:', {
          trackElement: !!trackElement,
          trackId,
          target: e.target,
          currentTarget: e.currentTarget,
          targetClasses: e.target.className,
          targetTagName: e.target.tagName
        });

        // If we're dropping on the timeline container itself (not on a track), create a new track
        const isDroppingOnTimeline = e.target === timelineContainerRef.current ||
          e.target.closest('[ref="timelineContainerRef"]') ||
          e.target.classList.contains('timeline-container') ||
          !trackId; // If no trackId is found, we're dropping on the timeline

        if (trackId) {
          // Add clip to existing track
          const track = tracks.find(t => t.id == trackId);
          const newClip = {
            id: Date.now() + Math.random(),
            name: soundItem.soundname || 'New Clip',
            url: `${IMAGE_URL}uploads/soundfile/${soundItem.soundfile}`,
            color: track?.color || '#FFB6C1', // Use track's color or fallback to pink
            startTime: dropTime,
            duration: audioDurationSec,
            trimStart: 0,
            trimEnd: audioDurationSec,
            soundData: soundItem
          };

          console.log('Adding clip to existing track:', trackId, newClip);
          dispatch(addAudioClipToTrack({
            trackId: trackId,
            audioClip: newClip
          }));
        } else if (isDroppingOnTimeline) {
          // Create new track with this clip when dropping on timeline
          const trackColor = getNextTrackColor(); // Get a unique color for the new track
          const newClip = {
            id: Date.now() + Math.random(),
            name: soundItem.soundname || 'New Clip',
            url: `${IMAGE_URL}uploads/soundfile/${soundItem.soundfile}`,
            color: trackColor, // Use the track's color
            startTime: dropTime,
            duration: audioDurationSec,
            trimStart: 0,
            trimEnd: audioDurationSec,
            soundData: soundItem
          };

          const newTrack = {
            id: Date.now() + Math.random(), // Ensure unique ID
            name: soundItem.soundname || 'New Track',
            color: trackColor, // Set the track color
            audioClips: [newClip]
          };

          console.log('Creating new track:', newTrack);
          dispatch(addTrack(newTrack));
        } else {
          console.log('Drop not on timeline or track, ignoring');
        }
      } else {
        console.log('No data found in drop event');
      }
    } catch (error) {
      console.error('Error processing dropped item:', error);
    }
  }, [audioDuration, dispatch, trackHeight, selectedGrid, selectedTime]);

  // Context menu handlers
  const handleContextMenu = useCallback((e, trackId, clipId = null) => {
    e.preventDefault();
    e.stopPropagation();

    setContextMenu({
      isOpen: true,
      position: { x: e.clientX, y: e.clientY },
      trackId: trackId,
      clipId: clipId
    });
  }, []);

  const handleContextMenuClose = useCallback(() => {
    setContextMenu({
      isOpen: false,
      position: { x: 0, y: 0 },
      trackId: null,
      clipId: null
    });
  }, []);

  const handleContextMenuAction = useCallback((action, overrideTrackId, overrideClipId) => {
    const trackId = overrideTrackId ?? contextMenu.trackId;
    const clipId = overrideClipId ?? contextMenu.clipId;

    if (!trackId) return;

    const track = tracks.find(t => t.id === trackId);
    if (!track) return;

    // Always find the clip if clipId is provided
    const clip = clipId ? track.audioClips?.find(c => c.id === clipId) : undefined;

    // Clip-level actions (cut/copy/delete always operate on the selected clip)
    if (clipId && clip) {
      switch (action) {
        case 'cut':
          setClipboard({ type: 'clip', clip: { ...clip }, trackId });
          dispatch(removeAudioClip({ trackId, clipId }));
          break;
        case 'copy':
          setClipboard({ type: 'clip', clip: { ...clip }, trackId });
          break;
        case 'paste':
          if (clipboard && clipboard.type === 'clip' && clipboard.clip) {
            const newClip = {
              ...clipboard.clip,
              id: Date.now() + Math.random(),
              startTime: (clip.startTime || 0) + 1 // Offset to avoid overlap
            };
            dispatch(addAudioClipToTrack({ trackId, audioClip: newClip }));
          }
          break;
        case 'delete':
          dispatch(removeAudioClip({ trackId, clipId }));
          break;
        default:
          
          break;
      }
      return;
    }

    // Track-level actions (paste works even if no clip is selected)
    switch (action) {
      case 'paste':
        if (clipboard && clipboard.type === 'clip' && clipboard.clip) {
          let newStartTime = 0;
          if (track.audioClips && track.audioClips.length > 0) {
            // Paste after the last clip in the track
            const lastClip = track.audioClips[track.audioClips.length - 1];
            newStartTime = (lastClip.startTime || 0) + (lastClip.duration || 1);
          }
          // If the track is empty, newStartTime remains 0
          const newClip = {
            ...clipboard.clip,
            id: Date.now() + Math.random(),
            startTime: newStartTime
          };
          dispatch(addAudioClipToTrack({ trackId, audioClip: newClip }));
        }
        break;
      case 'delete':
        dispatch(removeAudioClip({ trackId, clipId }));
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
        dispatch(toggleMuteTrack(trackId));
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
        (async () => {
          if (!track.audioClips || track.audioClips.length === 0) return;

          // Reverse the first clip in the track
          const clip = track.audioClips[0];
          if (!clip || !clip.url) return;

          const response = await fetch(clip.url);
          const arrayBuffer = await response.arrayBuffer();
          const audioContext = new (window.AudioContext || window.webkitAudioContext)();
          const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

          for (let i = 0; i < audioBuffer.numberOfChannels; i++) {
            const channelData = audioBuffer.getChannelData(i);
            channelData.reverse();
          }

          const wavData = await WavEncoder.encode({
            sampleRate: audioBuffer.sampleRate,
            channelData: Array.from({ length: audioBuffer.numberOfChannels }, (_, i) => audioBuffer.getChannelData(i))
          });
          const blob = new Blob([wavData], { type: 'audio/wav' });
          const reversedUrl = URL.createObjectURL(blob);

          dispatch(updateAudioClip({
            trackId: trackId,
            clipId: clip.id,
            updates: { url: reversedUrl, reversed: true }
          }));
        })();
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
  }, [contextMenu, tracks, clipboard, dispatch, currentTime]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!selectedTrackId) return;

      if (e.ctrlKey && e.key === 'x') {
        e.preventDefault();
        handleContextMenuAction('cut', selectedTrackId, selectedClipId);
      } else if (e.ctrlKey && e.key === 'c') {
        e.preventDefault();
        handleContextMenuAction('copy', selectedTrackId, selectedClipId);
      } else if (e.ctrlKey && e.key === 'v') {
        e.preventDefault();
        handleContextMenuAction('paste', selectedTrackId, selectedClipId);
      } else if (e.key === 'Backspace') {
        e.preventDefault();
        handleContextMenuAction('delete', selectedTrackId, selectedClipId);
      }
      else if (e.ctrlKey && e.key === 'm') {
        e.preventDefault();
        handleContextMenuAction('muteRegion', selectedTrackId, selectedClipId);
      }
      // Add more shortcuts as needed
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedTrackId, selectedClipId, handleContextMenuAction]);

  const renderGridLines = () => {
    const gridLines = [];
    const width = timelineContainerRef.current?.clientWidth || 600;
    const duration = audioDuration;

    if (width <= 0 || duration <= 0) return gridLines;

    const xScale = d3.scaleLinear().domain([0, duration]).range([0, width]);
    const gridSpacing = getGridSpacingWithTimeSignature(selectedGrid, selectedTime);

    // Calculate the total height of all tracks
    const totalTracksHeight = tracks.length > 0 ? trackHeight * tracks.length : 0;

    for (let time = 0; time <= duration; time += gridSpacing) {
      const x = xScale(time);

      // Determine line importance based on time signature
      const secondsPerBeat = 0.5; // Fixed at 120 BPM equivalent
      const { beats } = parseTimeSignature(selectedTime);
      const secondsPerBar = secondsPerBeat * beats;

      const isBarStart = Math.abs(time % secondsPerBar) < 0.01;
      const isMainBeat = Math.abs(time % secondsPerBeat) < 0.01;
      const isHalfBeat = Math.abs(time % (secondsPerBeat / 2)) < 0.01;
      const isQuarterBeat = Math.abs(time % (secondsPerBeat / 4)) < 0.01;

      let lineColor = "#FFFFFF1A";
      let lineWidth = 1;
      let lineOpacity = 0.3;

      if (isBarStart) {
        lineColor = "#FFFFFF50";
        lineWidth = 2;
        lineOpacity = 0.8;
      } else if (isMainBeat) {
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

  // Handler for TimelineActionBoxes
  const handleAction = (action) => {
    if (action === "Browse loops") {
      setShowOffcanvas((prev) => !prev);
    } else if (action === "Add new track") {
      setShowAddTrackModal(true);
    } else if (action === "Import file") {
      fileInputRef.current && fileInputRef.current.click();
    } else if (action === "Play the synth") {
      setShowPiano(true);
    }
    // Add more actions as needed
  };

  // useEffect(() => {
  //   const handleGlobalClick = (e) => {
  //     // Clear selection if clicking outside of tracks and clips
  //     const isTrackClick = e.target.closest('[data-track-id]');
  //     const isClipClick = e.target.closest('[data-rnd]');

  //     if (!isTrackClick && !isClipClick) {
  //       setSelectedTrackId(null);
  //       setSelectedClipId(null);
  //     }
  //   };

  //   document.addEventListener('click', handleGlobalClick);
  //   return () => document.removeEventListener('click', handleGlobalClick);
  // }, []);

  
  const handleDrumRecordingComplete = async (blob) => {
    const url = URL.createObjectURL(blob);
    let audioDurationSec = null;
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const arrayBuffer = await blob.arrayBuffer();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      audioDurationSec = audioBuffer.duration;
    } catch (err) {
      console.error('Error decoding drum audio:', err);
    }

    const newTrack = {
      id: Date.now(),
      name: 'Drum Recording',
      url,
      color: '#FFD700',
      height: 100, // or your default
      startTime: 0,
      duration: audioDurationSec,
      trimStart: 0,
      trimEnd: audioDurationSec,
      soundData: { type: 'drum' }
    };

    dispatch(addTrack(newTrack));
  };

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
            className="timeline-container"
            style={{
              minWidth: `${Math.max(audioDuration, 12) * timelineWidthPerSecond}px`,
              position: "relative",
              height: "100vh",
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
            <div style={{ height: "100px", borderBottom: "1px solid #1414141A", position: "relative", top: 0, zIndex: 20, background: "#141414" }}>
              <svg
                ref={svgRef}
                width="100%"
                height="100%"
                style={{ color: "white", width: "100%", background: "#141414" }}
              />
            </div>

            {/* Loop Bar - positioned right below timeline header */}
            <LoopBar
              audioDuration={audioDuration}
              loopStart={loopStart}
              loopEnd={loopEnd}
              onLoopChange={handleLoopChange}
              timelineWidthPerSecond={timelineWidthPerSecond}
              gridSpacing={getGridSpacingWithTimeSignature(selectedGrid, selectedTime)}
              currentTime={currentTime}
              isLoopEnabled={isLoopEnabled}
            />

            {/* My Section - positioned below loop bar */}
            <MySection
              timelineContainerRef={timelineContainerRef}
              audioDuration={audioDuration}
              selectedGrid={selectedGrid}
            />

            {/* Section Labels - display all saved section labels */}
            {sectionLabels.map((section) => (
              <div
                key={section.id}
                style={{
                  position: "absolute",
                  top: "120px", // Position below MySection label (75px + 35px + 10px gap)
                  left: `${section.position}%`,
                  width: "100px",
                  height: "25px",
                  background: "linear-gradient(90deg, #FF8C00 0%, #FF6B35 100%)",
                  borderRadius: "4px",
                  padding: "3px 10px 0 10px",
                  color: "white",
                  fontSize: "12px",
                  fontWeight: "600",
                  border: "1px solid #FF6B35",
                  textAlign: "center",
                  transform: "translateX(-50%)",
                  zIndex: 8,
                  pointerEvents: "none",
                  boxShadow: "0 2px 8px rgba(255, 140, 0, 0.4)",
                  animation: "sectionLabelAppear 0.3s ease-out",
                }}
              >
                {section.name}
              </div>
            ))}

            <style>
              {`
                @keyframes sectionLabelAppear {
                  from {
                    opacity: 0;
                    transform: translateX(-50%) scale(0.8);
                  }
                  to {
                    opacity: 1;
                    transform: translateX(-50%) scale(1);
                  }
                }
              `}
            </style>

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
              {tracks.map((track, index) => {
                console.log('Rendering track:', { track, index });
                return (
                  <div
                    key={track.id}
                    data-track-id={track.id}
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
                    onClick={(e) => {
                      // Only clear clip selection if clicking on the track background, not on a clip
                      if (e.target === e.currentTarget) {
                        setSelectedClipId(null);
                        setSelectedTrackId(track.id);
                      }
                    }}
                    tabIndex={0}
                    onFocus={() => setSelectedTrackId(track.id)}
                    onContextMenu={(e) => handleContextMenu(e, track.id)}
                  >
                    <TimelineTrack
                      key={track.id}
                      track={track}
                      trackId={track.id}
                      height={trackHeight}
                      onReady={handleReady}
                      onTrimChange={(clipId, trimData) => handleTrimChange(track.id, clipId, trimData)}
                      onPositionChange={(clipId, newStartTime) => handleTrackPositionChange(track.id, clipId, newStartTime)}
                      onRemoveClip={(clipId) => dispatch(removeAudioClip({
                        trackId: track.id,
                        clipId: clipId
                      }))}
                      timelineWidthPerSecond={timelineWidthPerSecond}
                      frozen={track.frozen}
                      gridSpacing={getGridSpacingWithTimeSignature(selectedGrid, selectedTime)}
                      onContextMenu={handleContextMenu}
                      onSelect={(clip) => setSelectedClipId(clip.id)}
                      selectedClipId={selectedClipId}
                    />
                  </div>
                );
              })}
            </div>
            {/* Show action boxes when there are no tracks */}
            {tracks.length === 0 && (
              <TimelineActionBoxes onAction={handleAction} />
            )}

            {/* Playhead - adjusted to account for loop bar */}
            <div
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                height: "100%",
                width: "2px",
                pointerEvents: "none",
                zIndex: 26,
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
        <div className="flex gap-2 absolute top-[60px] right-[10px] -translate-x-1/2 bg-[#141414] z-30">
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
          <div className="hover:bg-[#1F1F1F] w-[30px] h-[30px] flex items-center justify-center rounded-full" onClick={() => setIsLoopEnabled(!isLoopEnabled)}>
            <img src={reverceIcon} alt="Reverse" />
          </div>
        </div>

        {/* Right side controls */}
        <div className="absolute top-[60px] right-[0] -translate-x-1/2 z-30">
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

      <Drum onDrumRecordingComplete={handleDrumRecordingComplete} />

      {/* Add Track Modal */}
      {showAddTrackModal && (
        <AddNewTrackModel onClose={() => setShowAddTrackModal(false)} />
      )}
      {/* Hidden file input for import */}
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: "none" }}
        onChange={(e) => {
          const file = e.target.files[0];
          if (file) {
            // handle file here
            console.log("Selected file:", file);
          }
        }}
      />
      <MusicOff showOffcanvas={showOffcanvas} setShowOffcanvas={setShowOffcanvas} />

      {/* Context Menu */}
      <WaveMenu
        isOpen={contextMenu.isOpen}
        position={contextMenu.position}
        onClose={handleContextMenuClose}
        onAction={handleContextMenuAction}
      />

      {/* Piano Component */}
      {showPiano && (
        <Piano onClose={() => setShowPiano(false)} />
      )}
    </>
  );
};

export default Timeline;