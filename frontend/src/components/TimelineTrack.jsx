import React, { useEffect, useRef, useState, useCallback } from "react";
import WaveSurfer from "wavesurfer.js";
import { Rnd } from "react-rnd";
import reverceIcon from "../Images/reverce.svg";
import { useSelector, useDispatch } from 'react-redux';
import { setPianoNotes, setPianoRecordingClip } from '../Redux/Slice/studio.slice';

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
        background:  color || "transparent",
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
  const dispatch = useDispatch();
  // Get piano notes from Redux
  const pianoNotes = useSelector((state) => state.studio.pianoNotes);
  const pianoRecordingClip = useSelector((state) => state.studio.pianoRecordingClip);

  const currentTrackId = useSelector((state) => state.studio.currentTrackId);
  // Consider multiple naming variations to detect the piano track
  const typeName = (track?.type || '').toString().toLowerCase();
  const displayName = (track?.name || '').toString().toLowerCase();
  const isPianoTrack = typeName === 'keys' || displayName === 'keys' || displayName.includes('piano') || displayName.includes('key');

  // Derive per-track piano data
  const trackPianoNotes = Array.isArray(pianoNotes) ? pianoNotes.filter(n => (n?.trackId ?? null) === trackId) : [];
  const trackPianoClip = (pianoRecordingClip && (pianoRecordingClip.trackId ?? null) === trackId) ? pianoRecordingClip : null;

  // Derive a passive clip from this track's notes if there is no active clip
  const passiveClip = (!trackPianoClip && trackPianoNotes.length > 0)
    ? (() => {
        const start = Math.min(...trackPianoNotes.map(n => n.startTime || 0));
        const end = Math.max(...trackPianoNotes.map(n => (n.startTime || 0) + (n.duration || 0.05)));
        if (Number.isFinite(start) && Number.isFinite(end) && end > start) {
          return { start, end, color: '#E44F65', trackId };
        }
        return null;
      })()
    : null;
  const displayClip = trackPianoClip || passiveClip;

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: height,
        background: "transparent",
      }}
    >
      {/* Background for last recording region with resizable handles */}
      {isPianoTrack && displayClip && displayClip.start != null && displayClip.end != null && (
        <div
          style={{
            position: 'absolute',
            left: displayClip.start * timelineWidthPerSecond,
            top: 0,
            width: Math.max(0, (displayClip.end - displayClip.start)) * timelineWidthPerSecond,
            height: height,
            zIndex: 6,
          }}
        >
          {/* Main recording region */}
          <div
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              width: '100%',
              height: '100%',
              background: displayClip.color,
              border: `1px solid ${(displayClip.color || '#E44F65')}55`,
              borderRadius: 6,
              cursor: 'grab'
            }}
            title="Drag to move recorded piano notes. Use left/right handles to resize the recording region."
            onMouseDown={(e) => {
              // If this track doesn't currently own an active clip,
              // promote the passive displayClip to an active, editable clip first
              if (!trackPianoClip && displayClip) {
                dispatch(setPianoRecordingClip({
                  start: displayClip.start,
                  end: displayClip.end,
                  color: displayClip.color,
                  trackId: trackId
                }));
                return; // next interaction will allow dragging
              }

              if (!trackPianoClip) return;
              // Handle dragging the entire clip
              const startX = e.clientX;
              const startLeft = trackPianoClip.start * timelineWidthPerSecond;

              const handleMouseMove = (moveEvent) => {
                const deltaX = moveEvent.clientX - startX;
                const deltaTime = deltaX / timelineWidthPerSecond;
                const newStart = Math.max(0, startLeft / timelineWidthPerSecond + deltaTime);
                const duration = trackPianoClip.end - trackPianoClip.start;
                const newEnd = newStart + duration;

                // Shift only this track's notes by the same delta
                const delta = newStart - trackPianoClip.start;
                const shifted = (pianoNotes || []).map(n => {
                  if ((n?.trackId ?? null) !== trackId) return n;
                  return { ...n, startTime: Math.max(0, (n.startTime || 0) + delta) };
                });
                dispatch(setPianoNotes(shifted));

                const newClip = {
                  ...trackPianoClip,
                  start: newStart,
                  end: newEnd,
                  trackId: trackId
                };
                dispatch(setPianoRecordingClip(newClip));
              };

              const handleMouseUp = () => {
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
              };

              document.addEventListener('mousemove', handleMouseMove);
              document.addEventListener('mouseup', handleMouseUp);
            }}
          />

          {/* Left resize handle (active clip only) */}
          {trackPianoClip && (
          <ResizableTrimHandle
            type="start"
            position={0}
            onResize={(type, newStart) => {
              const duration = trackPianoClip.end - trackPianoClip.start;
              const newEnd = trackPianoClip.start + duration;

              // Keep all piano notes in their original positions
              // Only update the clip boundaries
              const newClip = {
                ...trackPianoClip,
                start: trackPianoClip.start + newStart,
                end: newEnd,
                trackId: trackId
              };
              dispatch(setPianoRecordingClip(newClip));
            }}
            isDragging={false}
            onDragStart={() => {}}
            onDragEnd={() => {}}
            trackDuration={trackPianoClip.end - trackPianoClip.start}
            trackWidth={Math.max(0, (trackPianoClip.end - trackPianoClip.start)) * timelineWidthPerSecond}
            trimEnd={trackPianoClip.end - trackPianoClip.start}
            gridSpacing={0.25}
          />)}

          {/* Visual indicator for trim handles */}
          <div
            style={{
              position: 'absolute',
              left: '0px',
              top: '0px',
              width: '100%',
              height: '100%',
              pointerEvents: 'none',
              zIndex: 7,
            }}
          >
            <div
              style={{
                position: 'absolute',
                left: '0px',
                top: '0px',
                width: '24px',
                height: '100%',
                background: 'rgba(255, 255, 255, 0.1)',
                borderLeft: '2px solid rgba(255, 255, 255, 0.3)',
                pointerEvents: 'none',
              }}
            />
            <div
              style={{
                position: 'absolute',
                right: '0px',
                top: '0px',
                width: '24px',
                height: '100%',
                background: 'rgba(255, 255, 255, 0.1)',
                borderRight: '2px solid rgba(255, 255, 255, 0.3)',
                pointerEvents: 'none',
              }}
            />
          </div>

          {/* Right resize handle (active clip only) */}
          {trackPianoClip && (
            <ResizableTrimHandle
              type="end"
              position={trackPianoClip.end - trackPianoClip.start}
              onResize={(type, newEnd) => {
                // Keep all piano notes in their original positions
                // Only update the clip boundaries
                const newClip = {
                  ...trackPianoClip,
                  end: trackPianoClip.start + newEnd,
                  trackId: trackId
                };
                dispatch(setPianoRecordingClip(newClip));
              }}
              isDragging={false}
              onDragStart={() => {}}
              onDragEnd={() => {}}
              trackDuration={trackPianoClip.end - trackPianoClip.start}
              trackWidth={Math.max(0, (trackPianoClip.end - trackPianoClip.start)) * timelineWidthPerSecond}
              trimEnd={trackPianoClip.end - trackPianoClip.start}
              gridSpacing={0.25}
            />
          )}
        </div>
      )}
             {/* Render piano roll if this is a piano track and there are notes */}
       {isPianoTrack && trackPianoNotes && trackPianoNotes.length > 0 && (
         <div style={{ position: 'absolute', left: 0, top: 0, width: '100%', height: '100%', zIndex: 9, pointerEvents: 'none' }}>
           {trackPianoNotes.map((note, idx) => {
             if (note.midiNumber < MIDI_MIN || note.midiNumber > MIDI_MAX) return null;
             
             // Only show notes that are within the recording clip boundaries
             const noteStartTime = note.startTime || 0;
             const noteEndTime = noteStartTime + (note.duration || 0.05);
             
             if (trackPianoClip && trackPianoClip.start != null && trackPianoClip.end != null) {
               // Check if note is within the recording clip
               if (noteStartTime < trackPianoClip.start || noteEndTime > trackPianoClip.end) {
                 return null; // Don't render notes outside the clip
               }
             }
             
             const dotSize = 8; // slightly larger for visibility
             const topY = (midiToY(note.midiNumber) % height) + Math.max(0, (NOTE_HEIGHT - dotSize) / 2);
             const leftX = (note.startTime || 0) * timelineWidthPerSecond;
             return (
               <div
                 key={idx}
                 style={{
                   position: 'absolute',
                   left: `${leftX}px`,
                   top: `${topY}px`,
                   width: `${dotSize}px`,
                   height: `2px`,
                   background: '#FFFFFF',
                   borderRadius: '2px',
                   opacity: 0.95,
                   zIndex: 20,
                   pointerEvents: 'none',
                   boxShadow: '0 0 2px rgba(255,255,255,0.9)',
                   transform: 'translateZ(0)'
                 }}
                 title={`Note: ${note.note || ''} (MIDI ${note.midiNumber})`}
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
