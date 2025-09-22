import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";
import WaveSurfer from "wavesurfer.js";
import { Rnd } from "react-rnd";
import reverceIcon from "../Images/reverce.svg";
import { useSelector, useDispatch } from 'react-redux';
import { setPianoNotes, setPianoRecordingClip, setDrumRecordedData, setDrumRecordingClip, setGuitarNotes, setGuitarRecordingClip, setCurrentTrackId } from '../Redux/Slice/studio.slice';
import { setSelectedTrackId } from '../Redux/Slice/effects.slice';
import { selectStudioState } from '../Redux/rootReducer';
import { drumMachineTypes } from '../Utils/drumMachineUtils';

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
            const maybePromise = wavesurfer.current.load(clip.url);
            if (maybePromise && typeof maybePromise.catch === 'function') {
              maybePromise.catch((e) => {
                const name = e?.name || '';
                const msg = e?.message || String(e || '');
                if (name === 'AbortError' || /abort/i.test(msg)) return;
                try { console.warn('WaveSurfer load error:', e); } catch (_) {}
              });
            }
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

// Utility function to filter notes/hits based on trimmed boundaries
// This ensures that only notes/hits within the trimmed region are played
const filterByTrimBoundaries = (items, trimStart, trimEnd, getTimeKey = 'startTime', getDurationKey = 'duration') => {
  if (!trimStart && !trimEnd) return items;

  return items.filter(item => {
    const startTime = item[getTimeKey] || 0;
    const duration = item[getDurationKey] || 0.05;
    const endTime = startTime + duration;

    // Only include items that overlap with the trimmed region
    return startTime < trimEnd && endTime > trimStart;
  });
};

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
  const { selectedTrackId } = useSelector((state) => state.effects);
  const isTrackSelected = selectedTrackId === trackId;

  // Handle track selection for effects and sidebar
  const handleTrackSelect = useCallback(() => {
    dispatch(setSelectedTrackId(trackId));
    dispatch(setCurrentTrackId(trackId));
  }, [dispatch, trackId]);

  // Get piano notes from Redux
  const pianoNotes = useSelector((state) => selectStudioState(state).pianoNotes);
  const pianoRecordingClip = useSelector((state) => selectStudioState(state).pianoRecordingClip);
  const bpm = useSelector((state) => selectStudioState(state).bpm || 120);

  // console.log("..........................nots", pianoNotes)
  // console.log("..........................clip", pianoRecordingClip)

  // Get drum recording data from Redux
  const drumRecordedData = useSelector((state) => selectStudioState(state).drumRecordedData);
  const drumRecordingClip = useSelector((state) => selectStudioState(state).drumRecordingClip);
  const tracks = useSelector((state) => selectStudioState(state).tracks || []);
  // console.log("tracks-------------------------", tracks)


  const currentTrackId = useSelector((state) => selectStudioState(state).currentTrackId);
  const typeName = (track?.type || '').toString().toLowerCase();
  const displayName = (track?.name || '').toString().toLowerCase();
  // Treat guitar like a keys/piano track for timeline visualization
  const isPianoTrack = (
    typeName === 'keys' ||
    typeName === 'guitar' ||
    typeName === 'orchestral' ||
    typeName === 'synth' ||
    displayName === 'keys' ||
    displayName === 'guitar' ||
    displayName === 'orchestral' ||
    displayName === 'synth' ||
    displayName.includes('piano') ||
    displayName.includes('key') ||
    displayName.includes('guitar') ||
    displayName.includes('orchestral') ||
    displayName.includes('synth')
  );
  const isDrumTrack = typeName === 'drum' || displayName === 'drum' || displayName.includes('drum') || displayName.includes('percussion');

  // the clip persisted on the track so switching tracks does not reset length
  const activeClipForThisTrack = (pianoRecordingClip && (pianoRecordingClip.trackId ?? null) === trackId) ? pianoRecordingClip : null;

  const persistedTrackClip = useMemo(() => {
    const track = tracks?.find?.(t => t.id === trackId);
    return track?.pianoClip || null;
  }, [tracks, trackId]);
  const trackPianoClip = activeClipForThisTrack || persistedTrackClip;
  const trackDrumClip = (() => {
    // Prefer active clip for this track
    if (drumRecordingClip && (drumRecordingClip.trackId ?? null) === trackId) return drumRecordingClip;
    // Otherwise fall back to persisted per-track clip
    const t = tracks?.find?.(tr => tr.id === trackId);
    return t?.drumClip || null;
  })();

  // Derive per-track piano data with trimming applied
  const trackPianoNotes = useMemo(() => {
    const notes = Array.isArray(pianoNotes) ? pianoNotes.filter(n => (n?.trackId ?? null) === trackId) : [];

    if (trackPianoClip && trackPianoClip.start != null && trackPianoClip.end != null) {
      return filterByTrimBoundaries(notes, trackPianoClip.start, trackPianoClip.end, 'startTime', 'duration');
    }

    return notes;
  }, [pianoNotes, trackId, trackPianoClip]);

  // console.log("trackPianoNotes z::: > ", trackPianoNotes)

  // Derive per-track drum data with trimming applied
  const trackDrumNotes = useMemo(() => {
    const notes = Array.isArray(drumRecordedData) ? drumRecordedData.filter(n => (n?.trackId ?? null) === trackId) : [];

    if (trackDrumClip && trackDrumClip.start != null && trackDrumClip.end != null) {
      return filterByTrimBoundaries(notes, trackDrumClip.start, trackDrumClip.end, 'currentTime', 'decay');
    }

    return notes;
  }, [drumRecordedData, trackId, trackDrumClip]);

  // Derive a passive clip from this track's notes if there is no active clip
  const passiveClip = (!trackPianoClip && trackPianoNotes.length > 0)
    ? (() => {
      const start = Math.min(...trackPianoNotes.map(n => n.startTime || 0));
      const end = Math.max(...trackPianoNotes.map(n => (n.startTime || 0) + (n.duration || 0.05)));
      if (Number.isFinite(start) && Number.isFinite(end) && end > start) {
        return { start, end, color: trackPianoClip?.color, trackId };
      }
      return null;
    })()
    : null;

  const passiveDrumClip = (!trackDrumClip && trackDrumNotes.length > 0)
    ? (() => {
      const start = Math.min(...trackDrumNotes.map(n => n.currentTime || 0));
      const end = Math.max(...trackDrumNotes.map(n => (n.currentTime || 0) + (n.decay || 0.2)));
      if (Number.isFinite(start) && Number.isFinite(end) && end > start) {
        return { start, end, color: trackDrumClip?.color, trackId };
      }
      return null;
    })()
    : null;

  const displayClip = trackPianoClip || passiveClip;
  const displayDrumClip = trackDrumClip || passiveDrumClip;

  // Add state for dragging trim handles
  const [isDraggingTrim, setIsDraggingTrim] = useState(null);

  return (
    <div
      className={`timeline-track ${isTrackSelected ? 'selected-for-effects' : ''}`}
      onClick={handleTrackSelect}
      style={{  
        position: "relative",
        width: "100%",
        height: height,
        background: "transparent",
        // border: isTrackSelected ? '2px solid #8F7CFD' : '1px solid transparent',
        borderRadius: '4px',
        padding: '2px'
      }}
    >
      {/* Track selection indicator */}
      {isTrackSelected && (
        <div className="absolute top-0 right-0 bg-[#8F7CFD] text-white text-xs px-2 py-1 rounded-bl-md">
          Effects Active
        </div>
      )}

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
            background: 'transparent',
            border: `1px solid ${((color || pianoRecordingClip?.color || displayClip.color))}`,
            borderRadius: 6,
            pointerEvents: 'none'
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
              background: (color || displayClip.color),
              border: `1px solid ${((color || displayClip.color))}`,
              borderRadius: 6,
              cursor: 'grab',
              pointerEvents: 'auto'
            }}
            title="Drag to move recorded guitar notes. Use left/right handles to resize the recording region."
            onContextMenu={(e) => onContextMenu && onContextMenu(e, trackId, 'piano-recording')}
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

              e.preventDefault();
              e.stopPropagation();

              // Handle dragging the entire clip
              const startX = e.clientX;
              const initialStart = trackPianoClip.start;

              const handleMouseMove = (moveEvent) => {
                const deltaX = moveEvent.clientX - startX;
                const deltaTime = deltaX / timelineWidthPerSecond;
                const newStart = Math.max(0, initialStart + deltaTime);
                const duration = trackPianoClip.end - trackPianoClip.start;
                const newEnd = newStart + duration;

                // Shift only this track's notes by the same delta
                const delta = newStart - trackPianoClip.start;
                const currentNotes = Array.isArray(pianoNotes) ? pianoNotes : [];
                const shifted = currentNotes.map(n => {
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
            <div
              style={{
                position: "absolute",
                left: "12px",
                top: "19px",
                width: "24px",
                height: "100%",
                cursor: "ew-resize",
                zIndex: 15,
                transform: "translateX(-12px)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                pointerEvents: 'auto'
              }}
              onMouseDown={(e) => {
                if (frozen) return;

                e.preventDefault();
                e.stopPropagation();

                setIsDraggingTrim('start');

                const startX = e.clientX;
                const initialStart = trackPianoClip.start;
                const clipEnd = trackPianoClip.end;

                const handleMouseMove = (moveEvent) => {
                  const deltaX = moveEvent.clientX - startX;
                  const deltaTime = deltaX / timelineWidthPerSecond;
                  let newStart = initialStart + deltaTime;

                  // Snap to grid
                  if (gridSpacing && gridSpacing > 0) {
                    newStart = Math.round(newStart / gridSpacing) * gridSpacing;
                  }

                  // Ensure start doesn't go past end
                  newStart = Math.max(0, Math.min(newStart, clipEnd - (gridSpacing || 0.25)));

                  const newClip = {
                    ...trackPianoClip,
                    start: newStart,
                    end: clipEnd,
                    trackId: trackId
                  };
                  dispatch(setPianoRecordingClip(newClip));
                };

                const handleMouseUp = () => {
                  setIsDraggingTrim(null);
                  document.removeEventListener('mousemove', handleMouseMove);
                  document.removeEventListener('mouseup', handleMouseUp);
                };

                document.addEventListener('mousemove', handleMouseMove);
                document.addEventListener('mouseup', handleMouseUp);
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#FFFFFF",
                  fontSize: "14px",
                  fontWeight: "bold",
                  fontFamily: "monospace",
                }}
              >
                [&gt;
              </div>
            </div>
          )}

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
            <div
              style={{
                position: "absolute",
                right: "12px",
                top: '19px',
                width: "24px",
                height: "100%",
                cursor: "ew-resize",
                zIndex: 15,
                transform: "translateX(12px)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                pointerEvents: 'auto'
              }}
              onMouseDown={(e) => {
                if (frozen) return;

                e.preventDefault();
                e.stopPropagation();

                setIsDraggingTrim('end');

                const startX = e.clientX;
                const clipStart = trackPianoClip.start;
                const initialEnd = trackPianoClip.end;

                const handleMouseMove = (moveEvent) => {
                  const deltaX = moveEvent.clientX - startX;
                  const deltaTime = deltaX / timelineWidthPerSecond;
                  let newEnd = initialEnd + deltaTime;

                  // Snap to grid
                  if (gridSpacing && gridSpacing > 0) {
                    newEnd = Math.round(newEnd / gridSpacing) * gridSpacing;
                  }

                  // Ensure end doesn't go before start
                  newEnd = Math.max(clipStart + (gridSpacing || 0.25), newEnd);

                  const newClip = {
                    ...trackPianoClip,
                    start: clipStart,
                    end: newEnd,
                    trackId: trackId
                  };
                  dispatch(setPianoRecordingClip(newClip));
                };

                const handleMouseUp = () => {
                  setIsDraggingTrim(null);
                  document.removeEventListener('mousemove', handleMouseMove);
                  document.removeEventListener('mouseup', handleMouseUp);
                };

                document.addEventListener('mousemove', handleMouseMove);
                document.addEventListener('mouseup', handleMouseUp);
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#FFFFFF",
                  fontSize: "14px",
                  fontWeight: "bold",
                  fontFamily: "monospace",
                }}
              >
                &lt;]
              </div>
            </div>
          )}
        </div>
      )}

      {isDrumTrack && displayDrumClip && displayDrumClip.start != null && displayDrumClip.end != null && (
        <div
          style={{
            position: 'absolute',
            left: displayDrumClip.start * timelineWidthPerSecond,
            top: 0,
            width: Math.max(0, (displayDrumClip.end - displayDrumClip.start)) * timelineWidthPerSecond,
            height: height,
            zIndex: 6,
            background: 'transparent',
            border: `1px solid ${(color || displayDrumClip.color)}`,
            borderRadius: 6,
            pointerEvents: 'none'
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
              background: (color || displayDrumClip.color),
              border: `1px solid ${(color || displayDrumClip.color)}`,
              borderRadius: 6,
              cursor: 'grab',
              pointerEvents: 'auto'
            }}
            title="Drag to move recorded drum notes. Use left/right handles to resize the recording region."
            onContextMenu={(e) => onContextMenu && onContextMenu(e, trackId, 'drum-recording')}
            onMouseDown={(e) => {
              // If this track doesn't currently own an active clip,
              // promote the passive displayClip to an active, editable clip first
              if (!trackDrumClip && displayDrumClip) {
                dispatch(setDrumRecordingClip({
                  start: displayDrumClip.start,
                  end: displayDrumClip.end,
                  color: displayDrumClip.color,
                  trackId: trackId
                }));
                return; // next interaction will allow dragging
              }

              if (!trackDrumClip) return;

              e.preventDefault();
              e.stopPropagation();

              // Handle dragging the entire clip
              const startX = e.clientX;
              const initialStart = trackDrumClip.start;

              const handleMouseMove = (moveEvent) => {
                const deltaX = moveEvent.clientX - startX;
                const deltaTime = deltaX / timelineWidthPerSecond;
                const newStart = Math.max(0, initialStart + deltaTime);
                const duration = trackDrumClip.end - trackDrumClip.start;
                const newEnd = newStart + duration;

                // Shift only this track's notes by the same delta
                const delta = newStart - trackDrumClip.start;
                const currentDrumData = Array.isArray(drumRecordedData) ? drumRecordedData : [];
                const shifted = currentDrumData.map(n => {
                  if ((n?.trackId ?? null) !== trackId) return n;
                  return { ...n, currentTime: Math.max(0, (n.currentTime || 0) + delta) };
                });
                dispatch(setDrumRecordedData(shifted));

                const newClip = {
                  ...trackDrumClip,
                  start: newStart,
                  end: newEnd,
                  trackId: trackId
                };
                dispatch(setDrumRecordingClip(newClip));
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
          {trackDrumClip && (
            <div
              style={{
                position: "absolute",
                left: "12px",
                top: "19px",
                width: "24px",
                height: "100%",
                cursor: "ew-resize",
                zIndex: 15,
                transform: "translateX(-12px)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                pointerEvents: 'auto'
              }}
              onMouseDown={(e) => {
                if (frozen) return;

                e.preventDefault();
                e.stopPropagation();

                setIsDraggingTrim('start');

                const startX = e.clientX;
                const initialStart = trackDrumClip.start;
                const clipEnd = trackDrumClip.end;

                const handleMouseMove = (moveEvent) => {
                  const deltaX = moveEvent.clientX - startX;
                  const deltaTime = deltaX / timelineWidthPerSecond;
                  let newStart = initialStart + deltaTime;

                  // Snap to grid
                  if (gridSpacing && gridSpacing > 0) {
                    newStart = Math.round(newStart / gridSpacing) * gridSpacing;
                  }

                  // Ensure start doesn't go past end
                  newStart = Math.max(0, Math.min(newStart, clipEnd - (gridSpacing || 0.25)));

                  const newClip = {
                    ...trackDrumClip,
                    start: newStart,
                    end: clipEnd,
                    trackId: trackId
                  };
                  dispatch(setDrumRecordingClip(newClip));
                };

                const handleMouseUp = () => {
                  setIsDraggingTrim(null);
                  document.removeEventListener('mousemove', handleMouseMove);
                  document.removeEventListener('mouseup', handleMouseUp);
                };

                document.addEventListener('mousemove', handleMouseMove);
                document.addEventListener('mouseup', handleMouseUp);
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#FFFFFF",
                  fontSize: "14px",
                  fontWeight: "bold",
                  fontFamily: "monospace",
                }}
              >
                [&gt;
              </div>
            </div>
          )}

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
          {trackDrumClip && (
            <div
              style={{
                position: "absolute",
                right: "12px",
                top: '19px',
                width: "24px",
                height: "100%",
                cursor: "ew-resize",
                zIndex: 15,
                transform: "translateX(12px)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                pointerEvents: 'auto'
              }}
              onMouseDown={(e) => {
                if (frozen) return;

                e.preventDefault();
                e.stopPropagation();

                setIsDraggingTrim('end');

                const startX = e.clientX;
                const clipStart = trackDrumClip.start;
                const initialEnd = trackDrumClip.end;

                const handleMouseMove = (moveEvent) => {
                  const deltaX = moveEvent.clientX - startX;
                  const deltaTime = deltaX / timelineWidthPerSecond;
                  let newEnd = initialEnd + deltaTime;

                  // Snap to grid
                  if (gridSpacing && gridSpacing > 0) {
                    newEnd = Math.round(newEnd / gridSpacing) * gridSpacing;
                  }

                  // Ensure end doesn't go before start
                  newEnd = Math.max(clipStart + (gridSpacing || 0.25), newEnd);

                  const newClip = {
                    ...trackDrumClip,
                    start: clipStart,
                    end: newEnd,
                    trackId: trackId
                  };
                  dispatch(setDrumRecordingClip(newClip));
                };

                const handleMouseUp = () => {
                  setIsDraggingTrim(null);
                  document.removeEventListener('mousemove', handleMouseMove);
                  document.removeEventListener('mouseup', handleMouseUp);
                };

                document.addEventListener('mousemove', handleMouseMove);
                document.addEventListener('mouseup', handleMouseUp);
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#FFFFFF",
                  fontSize: "14px",
                  fontWeight: "bold",
                  fontFamily: "monospace",
                }}
              >
                &lt;]
              </div>
            </div>
          )}
        </div>
      )}

      {/* Render piano roll if this is a piano track and there are notes */}
      {isPianoTrack && trackPianoNotes && trackPianoNotes.length > 0 && (
        <div style={{ position: 'absolute', left: 0, top: 0, width: '100%', height: '100%', zIndex: 9, pointerEvents: 'none' }}>
          {trackPianoNotes.map((note, idx) => {
            if (note.midiNumber < MIDI_MIN || note.midiNumber > MIDI_MAX) return null;

            // Always show notes, even if they fall outside an active clip
            const noteStartTime = note.startTime || 0;
            const noteEndTime = noteStartTime + (note.duration || 0.05);

            if (trackPianoClip && trackPianoClip.start != null && trackPianoClip.end != null) {
              // Check if note is within the recording clip
              if (noteStartTime < trackPianoClip.start || noteEndTime > trackPianoClip.end) {
                return null; // Don't render notes outside the clip
              }
            }
            const minPixelWidth = 6; // ensure visibility
            const heightPx = 2; // thin bar
            const durationPx = Math.max(minPixelWidth, (note.duration || 0.05) * timelineWidthPerSecond);
            const topY = (midiToY(note.midiNumber) % height) + Math.max(0, (NOTE_HEIGHT - heightPx) / 2);
            const leftX = (note.startTime || 0) * timelineWidthPerSecond;
            return (
              <div
                key={idx}
                style={{
                  position: 'absolute',
                  left: `${leftX}px`,
                  top: `${topY}px`,
                  width: `${durationPx}px`,
                  height: `${heightPx}px`,
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

      {/* Render drum hits in type-wise manner if this is a drum track and there are notes */}
      {isDrumTrack && trackDrumNotes && trackDrumNotes.length > 0 && (
        <div style={{ position: 'absolute', left: 0, top: 0, width: '100%', height: '100%', zIndex: 9, pointerEvents: 'none' }}>
          {/* Drum Type Labels */}
          {(() => {
            // Group drum hits by pad ID to determine which types are present
            const hitsByPad = {};
            trackDrumNotes.forEach((drumHit) => {
              const padId = drumHit.padId || 'unknown';
              if (!hitsByPad[padId]) {
                hitsByPad[padId] = [];
              }
              hitsByPad[padId].push(drumHit);
            });

            // Get drum types in preferred order
            const PAD_ORDER = ['Q', 'W', 'E', 'A', 'S', 'D', 'Z', 'X', 'C'];
            const orderedPadIds = Object.keys(hitsByPad).sort((a, b) => {
              const ia = PAD_ORDER.indexOf(a);
              const ib = PAD_ORDER.indexOf(b);
              const na = ia === -1 ? Number.MAX_SAFE_INTEGER : ia;
              const nb = ib === -1 ? Number.MAX_SAFE_INTEGER : ib;
              if (na !== nb) return na - nb;
              return a.localeCompare(b);
            });

            const rowHeight = Math.max(2, Math.floor(height / orderedPadIds.length));
            const rowSpacing = 1;

            return orderedPadIds.map((padId, rowIndex) => {
              const hits = hitsByPad[padId];
              const firstHit = hits[0];
              const topY = rowIndex * (rowHeight + rowSpacing);

              return (
                <div
                  key={`label-${padId}`}
                  style={{
                    position: 'absolute',
                    left: '-60px',
                    top: `${topY}px`,
                    width: '55px',
                    height: `${rowHeight}px`,
                    color: '#FFFFFF',
                    fontSize: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    paddingRight: '5px',
                    pointerEvents: 'none',
                    zIndex: 21,
                    fontFamily: 'monospace',
                    opacity: 0.8
                  }}
                  title={`${firstHit?.sound || 'Drum'} (${padId})`}
                >
                  {firstHit?.sound ? firstHit.sound.charAt(0).toUpperCase() + firstHit.sound.slice(1) : padId}
                </div>
              );
            });
          })()}
          {(() => {
            // Group drum hits by pad ID (drum type)
            const hitsByPad = {};
            trackDrumNotes.forEach((drumHit, idx) => {
              const padId = drumHit.padId || 'unknown';
              if (!hitsByPad[padId]) {
                hitsByPad[padId] = [];
              }
              hitsByPad[padId].push({ ...drumHit, originalIndex: idx });
            });

            // Get drum types in preferred order
            const PAD_ORDER = ['Q', 'W', 'E', 'A', 'S', 'D', 'Z', 'X', 'C'];
            const orderedPadIds = Object.keys(hitsByPad).sort((a, b) => {
              const ia = PAD_ORDER.indexOf(a);
              const ib = PAD_ORDER.indexOf(b);
              const na = ia === -1 ? Number.MAX_SAFE_INTEGER : ia;
              const nb = ib === -1 ? Number.MAX_SAFE_INTEGER : ib;
              if (na !== nb) return na - nb;
              return a.localeCompare(b);
            });

            // Calculate row height and spacing
            const rowHeight = Math.max(2, Math.floor(height / orderedPadIds.length));
            const rowSpacing = 1;

            return orderedPadIds.map((padId, rowIndex) => {
              const hits = hitsByPad[padId];
              const topY = rowIndex * (rowHeight + rowSpacing);

              return hits.map((drumHit) => {
                const hitStartTime = drumHit.currentTime || 0;
                const hitEndTime = hitStartTime + (drumHit.decay || 0.2);

                // Check if hit is within the recording clip - only hide if completely outside
                if (trackDrumClip && trackDrumClip.start != null && trackDrumClip.end != null) {
                  // Only hide if the hit is completely outside the clip boundaries
                  if (hitEndTime <= trackDrumClip.start || hitStartTime >= trackDrumClip.end) {
                    return null; // Don't render hits completely outside the clip
                  }
                }

                const minPixelWidth = 6;
                const leftX = (hitStartTime || 0) * timelineWidthPerSecond;
                let hitWidth = Math.max(minPixelWidth, (drumHit.duration || 0.05) * timelineWidthPerSecond);

                // Get drum machine color for this hit
                const drumColor = drumHit.drumMachine ?
                  (() => {
                    // Find the drum machine color from drumMachineTypes
                    const machine = drumMachineTypes.find(dm => dm.name === drumHit.drumMachine);
                    return machine ? machine.color : '#FF8014';
                  })() : '#FF8014';

                return (
                  <div
                    key={`${padId}-${drumHit.originalIndex}`}
                    style={{
                      position: 'absolute',
                      left: `${leftX}px`,
                      top: `${topY}px`,
                      width: `${hitWidth}px`,
                      height: `2px`,
                      background: '#FFFFFF',
                      borderRadius: '1px',
                      opacity: 0.95,
                      zIndex: 20,
                      pointerEvents: 'none',
                      boxShadow: '0 0 2px rgba(255,255,255,0.9)',
                      transform: 'translateZ(0)'
                    }}
                    title={`${drumHit.sound || 'Drum'} (${padId}) - ${drumHit.drumMachine || 'Unknown'} - ${hitStartTime.toFixed(2)}s`}
                  />
                );
              });
            });
          })()}

          {/* Grid Overlay for Beat Divisions */}
        </div>
      )}

      {/* Render each audio clip in the track */}
      {track.audioClips && track.audioClips.map((clip) => {
        const isBeatClip = clip.drumSequence && clip.drumSequence.length > 0;
        if (isBeatClip) {
          // Render drum clips directly in TimelineTrack
          const clipDuration = (clip.trimEnd || clip.duration) - (clip.trimStart || 0);
          const startTime = clip.startTime || 0;
          const visibleWidth = Math.round((clipDuration > 0 ? clipDuration : 1) * timelineWidthPerSecond * 100) / 100;
          const rndX = Math.round(startTime * timelineWidthPerSecond * 100) / 100;

          // Group drum hits by pad ID
          const hitsByPad = {};
          (clip.drumSequence || []).forEach(hit => {
            const padId = hit.padId || 'unknown';
            if (!hitsByPad[padId]) {
              hitsByPad[padId] = [];
            }
            hitsByPad[padId].push(hit);
          });

          // Get drum types in preferred order
          const PAD_ORDER = ['Q', 'W', 'E', 'A', 'S', 'D', 'Z', 'X', 'C'];
          const orderedPadIds = Object.keys(hitsByPad).sort((a, b) => {
            const ia = PAD_ORDER.indexOf(a);
            const ib = PAD_ORDER.indexOf(b);
            const na = ia === -1 ? Number.MAX_SAFE_INTEGER : ia;
            const nb = ib === -1 ? Number.MAX_SAFE_INTEGER : ib;
            if (na !== nb) return na - nb;
            return a.localeCompare(b);
          });

          const rowHeight = Math.max(2, Math.floor(height / orderedPadIds.length));
          const rowSpacing = 1;

          return (
            <Rnd
              key={clip.id}
              size={{
                width: visibleWidth,
                height: height,
              }}
              position={{
                x: rndX,
                y: 0,
              }}
              onDragStop={(e, d) => {
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
              }}
              enableResizing={false}
              dragAxis="x"
              bounds="parent"
              onClick={(e) => {
                e.stopPropagation();
                onSelect && onSelect(clip);
              }}
              onContextMenu={(e) => onContextMenu && onContextMenu(e, trackId, clip.id)}
              style={{
                background: color || 'rgba(50, 50, 50, 0.5)',
                borderRadius: '8px',
                border: selectedClipId === clip.id ? "2px solid #AD00FF" : "1px solid rgba(255,255,255,0.1)",
                boxShadow: selectedClipId === clip.id ? "0 4px 20px rgba(173,0,255,0.3)" : "none",
                overflow: 'hidden',
                zIndex: 10,
                position: 'relative',
                boxSizing: 'border-box',
              }}
            >
              {/* Drum clip content */}
              <div style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%' }}>
                {orderedPadIds.map((padId, rowIndex) => {
                  const hits = hitsByPad[padId];
                  const firstHit = hits[0];
                  const topY = rowIndex * (rowHeight + rowSpacing);

                  return (
                    <div key={padId} style={{
                      display: 'flex',
                      flex: 1,
                      position: 'relative',
                      borderBottom: rowIndex < orderedPadIds.length - 1 ? '1px solid rgba(255,255,255,0.1)' : 'none'
                    }}>
                      {/* Drum type label */}
                      <div
                        style={{
                          position: 'absolute',
                          left: '-60px',
                          top: '0px',
                          width: '55px',
                          height: '100%',
                          color: '#FFFFFF',
                          fontSize: '10px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'flex-end',
                          paddingRight: '5px',
                          pointerEvents: 'none',
                          zIndex: 21,
                          fontFamily: 'monospace',
                          opacity: 0.8
                        }}
                        title={`${firstHit?.sound || 'Drum'} (${padId})`}
                      >
                        {firstHit?.sound ? firstHit.sound.charAt(0).toUpperCase() + firstHit.sound.slice(1) : padId}
                      </div>

                      {/* Drum hits visualization */}
                      {hits.map((drumHit, hitIndex) => {
                        const hitStartTime = drumHit.currentTime || 0;
                        const hitEndTime = hitStartTime + (drumHit.decay || 0.2);
                        const leftX = (hitStartTime - startTime) * timelineWidthPerSecond;

                        return (
                          <div
                            key={`${padId}-${hitIndex}`}
                            style={{
                              position: 'absolute',
                              left: `${leftX}px`,
                              top: '0px',
                              width: '5px',
                              height: '100%',
                              background: '#FFFFFF',
                              borderRadius: '1px',
                              opacity: 0.95,
                              zIndex: 20,
                              pointerEvents: 'none',
                              boxShadow: '0 0 2px rgba(255,255,255,0.9)',
                              transform: 'translateZ(0)'
                            }}
                            title={`${drumHit.sound || 'Drum'} (${padId}) - ${drumHit.drumMachine || 'Unknown'} - ${hitStartTime.toFixed(2)}s`}
                          />
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </Rnd>
          );
        }
        // Only show waveform for musicoff type

        // console.log("clip z::: > =========================",clip)
        // if (clip.musicoff) {
        //   return (
        //     <AudioClip
        //       key={clip.id}
        //       clip={clip}
        //       onReady={onReady}
        //       height={height}
        //       trackId={trackId}
        //       onTrimChange={onTrimChange}
        //       onPositionChange={onPositionChange}
        //       onRemoveClip={onRemoveClip}
        //       timelineWidthPerSecond={timelineWidthPerSecond}
        //       frozen={frozen}
        //       gridSpacing={gridSpacing}
        //       onContextMenu={onContextMenu}
        //       onSelect={onSelect}
        //       isSelected={selectedClipId === clip.id}
        //       color={color}
        //     />
        //   );
        // }

        // tracks.map((track) => {
          // console.log("track z::: > =========================", track)
          if (track?.type === 'audio' || track?.type === 'Voice & Mic') {
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
            }
          // });

      })}

    </div>
  );
};

export default TimelineTrack;