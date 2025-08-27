import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";
import WaveSurfer from "wavesurfer.js";
import { Rnd } from "react-rnd";
import reverceIcon from "../Images/reverce.svg";
import { useSelector, useDispatch } from 'react-redux';
import { setPianoNotes, setPianoRecordingClip, setDrumRecordedData, setDrumRecordingClip } from '../Redux/Slice/studio.slice';
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

const BeatClip = ({
  clip,
  height,
  trackId,
  onPositionChange,
  onContextMenu,
  onSelect,
  isSelected = false,
  timelineWidthPerSecond = 100,
  gridSpacing = 0.25,
  color,
  bpm = 120, // Assuming a default BPM
}) => {
  const toPx = (seconds, scale) => Math.round(seconds * scale * 100) / 100;

  const clipDuration = (clip.trimEnd || clip.duration) - (clip.trimStart || 0);
  const startTime = clip.startTime || 0;

  const visibleWidth = toPx(clipDuration > 0 ? clipDuration : 1, timelineWidthPerSecond);
  const rndX = toPx(startTime, timelineWidthPerSecond);

  const rawEvents = (clip && (clip.drumSequence || clip.events)) || [];

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

  // Always render exactly 16 steps and sort rows by preferred pad order
  const patternData = useMemo(() => {
    const FIXED_STEPS = 16;
    if (!clip.drumSequence || clip.drumSequence.length === 0) {
      return { tracks: [], patternLength: FIXED_STEPS };
    }

    // Preferred order to match Pattern (extend if you have more pads)
    const PAD_ORDER = ['Q', 'W', 'E', 'A', 'S', 'D', 'Z', 'X', 'C'];

    // Group events by pad
    const hitsByPad = {};
    for (const hit of clip.drumSequence) {
      const padId = hit.padId || hit.id || 'PAD';
      if (!hitsByPad[padId]) hitsByPad[padId] = [];
      hitsByPad[padId].push(hit);
    }

    // Stable vertical order
    const padIds = Object.keys(hitsByPad);
    const orderedPadIds = padIds.sort((a, b) => {
      const ia = PAD_ORDER.indexOf(a);
      const ib = PAD_ORDER.indexOf(b);
      const na = ia === -1 ? Number.MAX_SAFE_INTEGER : ia;
      const nb = ib === -1 ? Number.MAX_SAFE_INTEGER : ib;
      if (na !== nb) return na - nb;
      return a.localeCompare(b);
    });

    // Map absolute event times to fixed 16 buckets within this container
    const sectionStart = startTime;
    const sectionDuration = Math.max(1e-6, clipDuration > 0 ? clipDuration : 1);

    const tracks = orderedPadIds.map((padId) => {
      const buckets = new Array(FIXED_STEPS).fill(false);
      const hits = hitsByPad[padId];

      for (const hit of hits) {
        const rel = (hit.currentTime - sectionStart) / sectionDuration; // [0,1)
        if (rel < 0 || rel >= 1) continue;
        const idx = Math.floor(rel * FIXED_STEPS + 1e-6);
        if (idx >= 0 && idx < FIXED_STEPS) {
          buckets[idx] = true;
        }
      }

      const firstHit = hits[0] || {};
      const name = firstHit.sound
        ? firstHit.sound.charAt(0).toUpperCase() + firstHit.sound.slice(1)
        : padId;

      return { id: padId, name, pattern: buckets };
    });

    return { tracks, patternLength: FIXED_STEPS };
  }, [clip.drumSequence, startTime, clipDuration]);

  const { tracks } = patternData;

  // NEW: Count duplicates per cell (per padId and 16th bucket) using the same mapping as above
  const countsByPad = useMemo(() => {
    const map = new Map();
    const sectionStart = startTime;
    const sectionDuration = Math.max(1e-6, clipDuration > 0 ? clipDuration : 1);
    for (const hit of rawEvents) {
      const padId = hit?.padId || hit?.id || 'PAD';
      if (!map.has(padId)) map.set(padId, Array(16).fill(0));
      const rel = (hit.currentTime - sectionStart) / sectionDuration;
      if (rel < 0 || rel >= 1) continue;
      const idx = Math.floor(rel * 16 + 1e-6);
      if (idx >= 0 && idx < 16) {
        map.get(padId)[idx] += 1;
      }
    }
    return map;
  }, [rawEvents, startTime, clipDuration]);

  // NEW: small badge for stacked hits (only shows when count > 1)
  const badgeStyle = {
    position: 'absolute',
    top: 2,
    right: 2,
    minWidth: 14,
    height: 14,
    padding: '0 3px',
    borderRadius: 8,
    background: 'rgba(0,0,0,0.7)',
    color: '#fff',
    fontSize: 10,
    lineHeight: '14px',
    textAlign: 'center',
    pointerEvents: 'none',
    userSelect: 'none',
  };

  return (
    <Rnd
      key={`${clip.id}-${timelineWidthPerSecond}`}
      size={{
        width: visibleWidth,
        height: height,
      }}
      position={{
        x: rndX,
        y: 0,
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
        background: color || 'rgba(50, 50, 50, 0.5)',
        borderRadius: '8px',
        border: isSelected ? "2px solid #AD00FF" : "1px solid rgba(255,255,255,0.1)",
        boxShadow: isSelected ? "0 4px 20px rgba(173,0,255,0.3)" : "none",
        overflow: 'hidden',
        zIndex: 10,
        position: 'relative',
        boxSizing: 'border-box',
      }}
    >
      {tracks.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%' }}>
          {tracks.map((track) => {
            const rowCounts = countsByPad.get(track.id) || Array(16).fill(0);
            return (
              <div key={track.id} style={{ display: 'flex', flex: 1 }}>
                {track.pattern.map((isActive, beatIndex) => {
                  const count = rowCounts[beatIndex] || 0;
                  return (
                    <div
                      key={beatIndex}
                      style={{
                        flex: 1, // 16 equal horizontal parts
                        borderRight: '1px solid rgba(255, 255, 255, 0.05)',
                        borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                        boxSizing: 'border-box',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: 'relative', // allow overlay badge
                      }}
                    >
                      {isActive && (
                        <div
                          style={{
                            width: '80%',
                            height: '2px', // dash
                            backgroundColor: '#FFFFFF',
                            borderRadius: '1px',
                          }}
                        />
                      )}
                      {count > 1 && <span style={badgeStyle}>{count}</span>}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      )}
    </Rnd>
  );
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
  // Get piano notes from Redux
  const pianoNotes = useSelector((state) => state.studio.pianoNotes);
  const pianoRecordingClip = useSelector((state) => state.studio.pianoRecordingClip);
  const bpm = useSelector((state) => state.studio.bpm || 120);

  // Get drum recording data from Redux
  const drumRecordedData = useSelector((state) => state.studio.drumRecordedData);
  const drumRecordingClip = useSelector((state) => state.studio.drumRecordingClip);

  // console.log("==================data==================", drumRecordedData);
  // console.log("==================clip==================", drumRecordingClip);

  const currentTrackId = useSelector((state) => state.studio.currentTrackId);
  // Consider multiple naming variations to detect the piano track
  const typeName = (track?.type || '').toString().toLowerCase();
  const displayName = (track?.name || '').toString().toLowerCase();
  const isPianoTrack = typeName === 'keys' || displayName === 'keys' || displayName.includes('piano') || displayName.includes('key');
  const isDrumTrack = typeName === 'drum' || displayName === 'drum' || displayName.includes('drum') || displayName.includes('percussion');

  // Derive per-track piano data
  const trackPianoNotes = Array.isArray(pianoNotes) ? pianoNotes.filter(n => (n?.trackId ?? null) === trackId) : [];
  const trackPianoClip = (pianoRecordingClip && (pianoRecordingClip.trackId ?? null) === trackId) ? pianoRecordingClip : null;

  // Derive per-track drum data
  const trackDrumNotes = Array.isArray(drumRecordedData) ? drumRecordedData.filter(n => (n?.trackId ?? null) === trackId) : [];
  const trackDrumClip = (drumRecordingClip && (drumRecordingClip.trackId ?? null) === trackId) ? drumRecordingClip : null;

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

  const passiveDrumClip = (!trackDrumClip && trackDrumNotes.length > 0)
    ? (() => {
      const start = Math.min(...trackDrumNotes.map(n => n.currentTime || 0));
      const end = Math.max(...trackDrumNotes.map(n => (n.currentTime || 0) + (n.decay || 0.2)));
      if (Number.isFinite(start) && Number.isFinite(end) && end > start) {
        return { start, end, color: '#FF8014', trackId };
      }
      return null;
    })()
    : null;

  const displayClip = trackPianoClip || passiveClip;
  const displayDrumClip = trackDrumClip || passiveDrumClip;

  // Add state for dragging trim handles
  const [isDraggingTrim, setIsDraggingTrim] = useState(null);

  // Implement handleTrimResize for piano recording clip
  const handlePianoTrimResize = useCallback((type, newPosition) => {
    if (frozen) return;
    if (!trackPianoClip) return;

    const currentStart = trackPianoClip.start;
    const currentEnd = trackPianoClip.end;
    const duration = currentEnd - currentStart;

    const snapToGrid = (time) => {
      if (!gridSpacing || gridSpacing <= 0) return time;
      const gridPosition = Math.round(time / gridSpacing) * gridSpacing;
      return Math.max(0, gridPosition);
    };

    if (type === 'start') {
      // newPosition is relative to the clip, convert to absolute time
      const absoluteNewStart = currentEnd - newPosition;
      const snappedPosition = snapToGrid(absoluteNewStart);
      const newStart = Math.max(0, Math.min(snappedPosition, currentEnd - gridSpacing));

      // Update the piano recording clip
      const newClip = {
        ...trackPianoClip,
        start: newStart,
        end: currentEnd,
        trackId: trackId
      };
      dispatch(setPianoRecordingClip(newClip));

      // Optionally filter out notes that are now outside the clip boundaries
      const currentNotes = Array.isArray(pianoNotes) ? pianoNotes : [];
      const filteredNotes = currentNotes.map(note => {
        if ((note?.trackId ?? null) !== trackId) return note;
        const noteStartTime = note.startTime || 0;
        const noteEndTime = noteStartTime + (note.duration || 0.05);

        // Keep notes that are still within bounds, or adjust their timing
        if (noteStartTime < newStart) {
          // Note starts before new clip start - could trim or remove
          return note; // Keep as is for now
        }
        return note;
      });
      dispatch(setPianoNotes(filteredNotes));

    } else if (type === 'end') {
      // newPosition is relative to the clip, convert to absolute time
      const absoluteNewEnd = currentStart + newPosition;
      const snappedPosition = snapToGrid(absoluteNewEnd);
      const newEnd = Math.max(currentStart + gridSpacing, Math.min(snappedPosition, duration)); // Fixed: use duration instead of clip.duration

      // Update the piano recording clip
      const newClip = {
        ...trackPianoClip,
        start: currentStart,
        end: newEnd,
        trackId: trackId
      };
      dispatch(setPianoRecordingClip(newClip));

      // Optionally filter out notes that are now outside the clip boundaries
      const currentNotes = Array.isArray(pianoNotes) ? pianoNotes : [];
      const filteredNotes = currentNotes.map(note => {
        if ((note?.trackId ?? null) !== trackId) return note;
        const noteStartTime = note.startTime || 0;
        const noteEndTime = noteStartTime + (note.duration || 0.05);

        // Keep notes that are still within bounds
        if (noteEndTime > newEnd) {
          // Note extends past new clip end - could trim or remove
          return note; // Keep as is for now
        }
        return note;
      });
      dispatch(setPianoNotes(filteredNotes));
    }
  }, [trackPianoClip, pianoNotes, dispatch, trackId, gridSpacing, frozen]);

  const handlePianoDragStart = useCallback((type) => {
    if (frozen) return;
    setIsDraggingTrim(type);
  }, [frozen]);

  const handlePianoDragEnd = useCallback(() => {
    setIsDraggingTrim(null);
  }, []);

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
            background: 'red', // translucent
            border: `1px solid ${(pianoRecordingClip?.color || '#AD00FF')}55`,
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
              background: displayClip.color,
              border: `1px solid ${(displayClip.color || '#E44F65')}55`,
              borderRadius: 6,
              cursor: 'grab',
              pointerEvents: 'auto'
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
            background: 'red', // translucent
            border: `1px solid ${(displayDrumClip.color || '#AD00FF')}55`,
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
              background: displayDrumClip.color,
              border: `1px solid ${(displayDrumClip.color || '#E44F65')}55`,
              borderRadius: 6,
              cursor: 'grab',
              pointerEvents: 'auto'
            }}
            title="Drag to move recorded drum notes. Use left/right handles to resize the recording region."
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

            // Only show notes that are within the recording clip boundaries
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

      {/* Render drum hits if this is a drum track and there are notes */}
      {isDrumTrack && trackDrumNotes && trackDrumNotes.length > 0 && (
        <div style={{ position: 'absolute', left: 0, top: 0, width: '100%', height: '100%', zIndex: 9, pointerEvents: 'none' }}>
          {trackDrumNotes.map((drumHit, idx) => {
            // Only show drum hits that are within the recording clip boundaries
            const hitStartTime = drumHit.currentTime || 0;
            const hitEndTime = hitStartTime + (drumHit.decay || 0.2);

            if (trackDrumClip && trackDrumClip.start != null && trackDrumClip.end != null) {
              // Check if hit is within the recording clip
              if (hitStartTime < trackDrumClip.start || hitEndTime > trackDrumClip.end) {
                return null; // Don't render hits outside the clip
              }
            }

            const dotSize = 12; // larger for drum hits
            const topY = Math.max(0, (height - dotSize) / 2); // Center vertically
            const leftX = (hitStartTime || 0) * timelineWidthPerSecond;

            // Get drum machine color for this hit
            const drumColor = drumHit.drumMachine ?
              (() => {
                // Find the drum machine color from drumMachineTypes
                const machine = drumMachineTypes.find(dm => dm.name === drumHit.drumMachine);
                return machine ? machine.color : '#FF8014';
              })() : '#FF8014';

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
                title={`${drumHit.sound || 'Drum'} - ${drumHit.drumMachine || 'Unknown'} - ${hitStartTime.toFixed(2)}s`}
              />
            );
          })}
        </div>
      )}
      {/* Render each audio clip in the track */}
      {track.audioClips && track.audioClips.map((clip) => {
        const isBeatClip = clip.drumSequence && clip.drumSequence.length > 0;
        if (isBeatClip) {
          return (
            <BeatClip
              key={clip.id}
              clip={clip}
              height={height}
              trackId={trackId}
              onPositionChange={onPositionChange}
              timelineWidthPerSecond={timelineWidthPerSecond}
              gridSpacing={gridSpacing}
              onContextMenu={onContextMenu}
              onSelect={onSelect}
              isSelected={selectedClipId === clip.id}
              color={color}
              bpm={bpm}
            />
          );
        }
        // return (
        //   <AudioClip
        //     key={clip.id}
        //     clip={clip}
        //     onReady={onReady}
        //     height={height}
        //     trackId={trackId}
        //     onTrimChange={onTrimChange}
        //     onPositionChange={onPositionChange}
        //     onRemoveClip={onRemoveClip}
        //     timelineWidthPerSecond={timelineWidthPerSecond}
        //     frozen={frozen}
        //     gridSpacing={gridSpacing}
        //     onContextMenu={onContextMenu}
        //     onSelect={onSelect}
        //     isSelected={selectedClipId === clip.id}
        //     color={color}
        //   />
        // );
      })}
    </div>
  );
};

export default TimelineTrack;