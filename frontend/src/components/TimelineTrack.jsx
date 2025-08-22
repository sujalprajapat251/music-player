import React, { useEffect, useRef, useState, useCallback } from "react";
import WaveSurfer from "wavesurfer.js";
import { Rnd } from "react-rnd";
import reverceIcon from "../Images/reverce.svg";
import { useSelector } from 'react-redux';

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
  color,
}) => {
  const waveformRef = useRef(null);
  const wavesurfer = useRef(null);
  const isInitialized = useRef(false);
  const [isDraggingTrim, setIsDraggingTrim] = useState(null);

  // Convert time to pixels using the current scale
  const toPx = (seconds, scale) => Math.round(seconds * scale * 100) / 100;

  // Calculate clip dimensions based on current scale
  const clipDuration = clip.duration || 1;
  const trimStart = clip.trimStart || 0;
  const trimEnd = clip.trimEnd || clipDuration;
  const startTime = clip.startTime || 0;

  // Calculate positions and widths using absolute pixel values
  const fullWidth = toPx(clipDuration, timelineWidthPerSecond);
  const visibleWidth = toPx(Math.max(0, trimEnd - trimStart), timelineWidthPerSecond);
  const rndX = toPx(startTime, timelineWidthPerSecond);
  const trimOffsetX = toPx(trimStart, timelineWidthPerSecond);

  useEffect(() => {
    if (!waveformRef.current || !clip.url || isInitialized.current) return;

    let isMounted = true;
    let readyHandler = null;
    let errorHandler = null;

    const initWaveSurfer = async () => {
      try {
        if (wavesurfer.current) {
          try {
            wavesurfer.current.destroy();
          } catch (e) {
            if (!(e && e.name === 'AbortError')) {
              console.warn('WaveSurfer destroy failed:', e);
            }
          }
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
          minPxPerSec: timelineWidthPerSecond, // Use current scale
          normalize: true,
        });

        if (!isMounted) return;

        readyHandler = () => {
          if (isMounted && onReady && wavesurfer.current) {
            onReady(wavesurfer.current, { ...clip, trackId });
          }
        };

        errorHandler = (error) => {
          if (isMounted) {
            console.error("WaveSurfer error:", error);
          }
        };

        // Bind listeners
        if (wavesurfer.current && typeof wavesurfer.current.on === 'function') {
          wavesurfer.current.on("ready", readyHandler);
          wavesurfer.current.on("error", errorHandler);
        }

        // Load audio with guard; ignore abort errors if unmounted mid-load
        try {
          if (isMounted && wavesurfer.current) {
            wavesurfer.current.load(clip.url);
          }
        } catch (e) {
          if (!(e && (e.name === 'AbortError' || String(e).includes('aborted')))) {
            console.warn('WaveSurfer load failed:', e);
          }
        }
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
      
      // Clean up listeners first
      if (wavesurfer.current) {
        try {
          if (readyHandler) wavesurfer.current.un('ready', readyHandler);
          if (errorHandler) wavesurfer.current.un('error', errorHandler);
        } catch (e) {
          // Ignore unsubscription errors
        }
      }
      
      // Then destroy
      if (wavesurfer.current) {
        try {
          wavesurfer.current.destroy();
        } catch (error) {
          // Silently ignore cleanup errors
        }
        wavesurfer.current = null;
      }
    };
  }, [clip.id, frozen, clip.url, timelineWidthPerSecond]);

  // Keep WaveSurfer zoom in sync with timeline scale
  useEffect(() => {
    if (wavesurfer.current) {
      const pxPerSec = Math.max(1, timelineWidthPerSecond);
      try {
        if (wavesurfer.current.params) {
          wavesurfer.current.params.minPxPerSec = pxPerSec;
        }
        if (typeof wavesurfer.current.zoom === 'function') {
          wavesurfer.current.zoom(pxPerSec);
        }
        if (typeof wavesurfer.current.drawBuffer === 'function') {
          wavesurfer.current.drawBuffer();
        }
      } catch (e) {
        // Ignore zoom errors
      }
    }
  }, [timelineWidthPerSecond]);

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

  return (
    <Rnd
      key={`${clip.id}-${timelineWidthPerSecond}`} // Force re-render on zoom
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
        background: color || "transparent",
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
        boxSizing: 'border-box', // Ensure borders don't affect size
      }}
    >
      {/* Waveform with clip-path to show only trimmed portion */}
      {(() => {
        const shouldRender = clip.url && clip.duration > 0;
        return shouldRender;
      })() && (
          <>
            <div
              ref={waveformRef}
              style={{
                width: `${fullWidth}px`,
                height: "100%",
                position: "absolute",
                top: 0,
                left: `-${trimOffsetX}px`,
                zIndex: 1,
                clipPath: `inset(0 ${(1 - (trimEnd / clipDuration)) * 100}% 0 ${(trimStart / clipDuration) * 100}%)`,
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
              trackWidth={fullWidth}
              trimStart={clip.trimStart || 0}
              trimEnd={trimEnd}
              gridSpacing={gridSpacing}
            />

            <ResizableTrimHandle
              type="end"
              position={trimEnd}
              onResize={handleTrimResize}
              isDragging={isDraggingTrim === 'end'}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              trackDuration={clip.duration}
              trackWidth={fullWidth}
              trimStart={clip.trimStart || 0}
              trimEnd={trimEnd}
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

const NOTE_HEIGHT = 8; // px per note row
const MIDI_MIN = 21; // A0
const MIDI_MAX = 108; // C8

function midiToY(midi) {
  // 88-key piano: A0 (21) at bottom, C8 (108) at top
  return (MIDI_MAX - midi) * NOTE_HEIGHT;
}

// Main TimelineTrack Component
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
  color
}) => {
  // Get piano notes from Redux
  const pianoNotes = useSelector((state) => state.studio.pianoNotes);
  const pianoRecordingClip = useSelector((state) => state.studio.pianoRecordingClip);
  // Only show piano roll for 'Keys' tracks or if track.name === 'Keys'
  const isPianoTrack = track.type === 'Keys' || track.name === 'Keys';

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: height,
        background: "transparent",
      }}
    >
      {/* Background for last recording region */}
      {isPianoTrack && pianoRecordingClip && pianoRecordingClip.start != null && pianoRecordingClip.end != null && (
        <div
          style={{
            position: 'absolute',
            left: (pianoRecordingClip.start * timelineWidthPerSecond),
            top: 0,
            width: Math.max(0, (pianoRecordingClip.end - pianoRecordingClip.start)) * timelineWidthPerSecond,
            height: height,
            background: 'red', // translucent
            border: `1px solid ${(pianoRecordingClip.color || '#AD00FF')}55`,
            borderRadius: 6,
            zIndex: 4,
            pointerEvents: 'none'
          }}
        />
      )}
      {/* Render piano roll if this is a piano track and there are notes */}
      {isPianoTrack && pianoNotes && pianoNotes.length > 0 && (
        <div style={{ position: 'absolute', left: 0, top: 0, width: '100%', height: '100%', zIndex: 5, pointerEvents: 'none' }}>
          {pianoNotes.map((note, idx) => {
            // Only show notes in MIDI range
            if (note.midiNumber < MIDI_MIN || note.midiNumber > MIDI_MAX) return null;
            return (
              <div
                key={idx}
                style={{
                  position: 'absolute',
                  left: `${(note.startTime || 0) * timelineWidthPerSecond}px`,
                  top: midiToY(note.midiNumber) % height,
                  width: `${(note.duration || 0.2) * timelineWidthPerSecond}px`,
                  height: `${NOTE_HEIGHT}px`,
                  background: '#FFFFFF',
                  borderRadius: 2,
                  opacity: 0.95,
                  zIndex: 20,
                  pointerEvents: 'none',
                  boxShadow: '0 0 1px rgba(255,255,255,0.9)'
                }}
                title={`Note: ${note.note} (MIDI ${note.midiNumber})`}
              />
            );
          })}
        </div>
      )}
      {/* Render each audio clip in the track */}
      {track.audioClips && track.audioClips.map((clip) => {
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
            color={color}
          />
        );
      })}
    </div>
  );
};

export default TimelineTrack;
