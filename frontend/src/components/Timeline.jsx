import React, { useEffect, useRef, useState, useCallback } from "react";
import WaveSurfer from "wavesurfer.js";
import { Player, start } from "tone";
import * as d3 from "d3";
import { useSelector, useDispatch } from "react-redux";
import { addTrack, updateTrack } from "../Redux/Slice/studio.slice";
import { IMAGE_URL } from "../Utils/baseUrl";
import magnetIcon from "../Images/magnet.svg";
import settingIcon from "../Images/setting.svg";
import reverceIcon from "../Images/reverce.svg";
import fxIcon from "../Images/fx.svg";
import offce from "../Images/offce.svg";
import GridSetting from "./GridSetting";
import MusicOff from "./MusicOff";
import Moveable from "react-moveable";

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
  originalDuration,
  isSelected,
  onSelect
}) => {
  const waveformRef = useRef(null);
  const wavesurfer = useRef(null);
  const isInitialized = useRef(false);
  const trackRef = useRef(null);

  useEffect(() => {
    if (!waveformRef.current || !url || isInitialized.current) return;

    let isMounted = true;

    const initWaveSurfer = async () => {
      try {
        // Clean up existing instance
        if (wavesurfer.current) {
          wavesurfer.current.destroy();
          wavesurfer.current = null;
        }

        if (!isMounted) return;

        wavesurfer.current = WaveSurfer.create({
          container: waveformRef.current,
          waveColor: "#ffffff",
          progressColor: "#ffffff",
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
  }, [trackId, url]);

  // Update waveform view when trim values change
  useEffect(() => {
    if (wavesurfer.current && originalDuration && (trimStart > 0 || (trimEnd && trimEnd < originalDuration))) {
      const waveformContainer = waveformRef.current;
      if (waveformContainer) {
        const actualTrimEnd = trimEnd || originalDuration;
        const trimDuration = actualTrimEnd - trimStart;
        const trimStartRatio = trimStart / originalDuration;
        const trimDurationRatio = trimDuration / originalDuration;
        
        // Apply CSS transform to show only the trimmed portion
        const waveformElement = waveformContainer.querySelector('wave');
        if (waveformElement) {
          const translateX = -(trimStartRatio * 100);
          const scaleX = 1 / trimDurationRatio;
          waveformElement.style.transform = `translateX(${translateX}%) scaleX(${scaleX})`;
          waveformElement.style.transformOrigin = 'left center';
        }
      }
    }
  }, [trimStart, trimEnd, originalDuration]);

  // Get timeline width and duration from parent
  const timelineWidthPerSecond = 100;
  const left = startTime * timelineWidthPerSecond;
  const width = (duration || 1) * timelineWidthPerSecond;

  const handleClick = (e) => {
    e.stopPropagation();
    onSelect(trackId);
  };

  return (
    <div
      ref={trackRef}
      className={`timeline-track-${trackId}`}
      onClick={handleClick}
      style={{
        background: color,
        borderRadius: 8,
        marginBottom: 1,
        height: `${height}px`,
        display: "flex",
        alignItems: "center",
        position: "absolute",
        left: `${left}px`,
        width: `${width}px`,
        cursor: "move",
        border: isSelected ? "2px solid #AD00FF" : "1px solid transparent",
        boxSizing: "border-box",
      }}
    >
      <div
        ref={waveformRef}
        style={{
          width: "100%",
          height: "100%",
          position: "absolute",
          top: 0,
          left: 0,
          zIndex: 0,
          pointerEvents: "none",
        }}
      />
    </div>
  );
};

const Timeline = () => {
  const [players, setPlayers] = useState([]);
  const [waveSurfers, setWaveSurfers] = useState([]);
  const [audioDuration, setAudioDuration] = useState(150);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const svgRef = useRef(null);
  const timelineContainerRef = useRef(null);
  const playbackStartRef = useRef({ systemTime: 0, audioTime: 0 });
  const [showGridSetting, setShowGridSetting] = useState(false);
  const [showOffcanvas, setShowOffcanvas] = useState(false);
  const isDragging = useRef(false);
  const animationFrameId = useRef(null);
  const [selectedTrackId, setSelectedTrackId] = useState(null);
  const playingTracks = useRef(new Map()); // Track which tracks are currently playing

  // Grid settings state
  const [selectedGrid, setSelectedGrid] = useState("1/1");
  const [selectedTime, setSelectedTime] = useState("4/4");
  const [selectedRuler, setSelectedRuler] = useState("Beats");

  const dispatch = useDispatch();
  const tracks = useSelector((state) => state.studio?.tracks || []);
  const trackHeight = useSelector((state) => state.studio?.trackHeight || 100);

  const timelineWidthPerSecond = 100;

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

      // Store player with track metadata including trim information
      setPlayers((prev) => {
        const existingIndex = prev.findIndex(p => p.trackId === trackData.id);
        if (existingIndex !== -1) {
          // Replace existing player for this track
          const newPlayers = [...prev];
          newPlayers[existingIndex] = {
            player,
            trackId: trackData.id,
            startTime: trackData.startTime,
            duration: trackData.duration,
            trimStart: trackData.trimStart || 0,
            trimEnd: trackData.trimEnd || trackData.originalDuration,
            originalDuration: trackData.originalDuration || trackData.duration,
            audioBuffer // Store the original audio buffer for proper trimming
          };
          return newPlayers;
        } else {
          // Add new player
          return [...prev, {
            player,
            trackId: trackData.id,
            startTime: trackData.startTime,
            duration: trackData.duration,
            trimStart: trackData.trimStart || 0,
            trimEnd: trackData.trimEnd || trackData.originalDuration,
            originalDuration: trackData.originalDuration || trackData.duration,
            audioBuffer // Store the original audio buffer for proper trimming
          }];
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

  // Enhanced function to play trimmed audio
  const playTrimmedTrack = useCallback((playerObj, startOffset = 0) => {
    if (!playerObj?.player || !playerObj.audioBuffer) return;

    try {
      const { trimStart, trimEnd, originalDuration, trackId } = playerObj;
      const actualTrimEnd = trimEnd || originalDuration;
      
      // Calculate the actual playback parameters
      const trimmedDuration = actualTrimEnd - trimStart;
      const playbackStart = trimStart + startOffset;
      
      // Don't play if we're beyond the trimmed range
      if (playbackStart >= actualTrimEnd || startOffset >= trimmedDuration) {
        return;
      }
      
      // Calculate how long to play (don't exceed trim end)
      const remainingDuration = actualTrimEnd - playbackStart;
      
      // Stop any existing playback for this track
      if (playingTracks.current.has(trackId)) {
        const existingPlayer = playingTracks.current.get(trackId);
        if (existingPlayer && typeof existingPlayer.stop === 'function') {
          existingPlayer.stop();
        }
      }
      
      // Create a new player instance for this specific playback
      const trimmedPlayer = new Player(playerObj.audioBuffer).toDestination();
      playingTracks.current.set(trackId, trimmedPlayer);
      
      // Start playback from the correct position
      trimmedPlayer.start(undefined, playbackStart, remainingDuration);
      
      console.log(`Playing track ${trackId} from ${playbackStart.toFixed(2)}s for ${remainingDuration.toFixed(2)}s (trimmed: ${trimStart.toFixed(2)}s - ${actualTrimEnd.toFixed(2)}s)`);
      
      // Schedule stop to ensure it stops at trim end
      setTimeout(() => {
        if (trimmedPlayer && typeof trimmedPlayer.stop === 'function') {
          trimmedPlayer.stop();
          playingTracks.current.delete(trackId);
        }
      }, remainingDuration * 1000);
      
    } catch (error) {
      console.error(`Error playing trimmed track ${playerObj.trackId}:`, error);
    }
  }, []);

  // Enhanced function to stop all playing tracks
  const stopAllTracks = useCallback(() => {
    // Stop all tracks in playingTracks map
    playingTracks.current.forEach((player, trackId) => {
      if (player && typeof player.stop === 'function') {
        try {
          player.stop();
        } catch (error) {
          console.error(`Error stopping track ${trackId}:`, error);
        }
      }
    });
    playingTracks.current.clear();
    
    // Also stop original players as fallback
    players.forEach((playerObj) => {
      if (playerObj?.player && typeof playerObj.player.stop === 'function') {
        try {
          playerObj.player.stop();
        } catch (error) {
          // Silently ignore stop errors
        }
      }
    });
  }, [players]);

  const handlePlayPause = async () => {
    try {
      await start();

      if (isPlaying) {
        stopAllTracks();
        setIsPlaying(false);
      } else {
        setIsPlaying(true);
        
        players.forEach((playerObj) => {
          const trackStartTime = playerObj.startTime || 0;
          const trackDuration = playerObj.duration || 0;
          const trackEndTime = trackStartTime + trackDuration;

          if (currentTime >= trackStartTime && currentTime < trackEndTime) {
            // Calculate offset within the track
            const offsetInTrack = currentTime - trackStartTime;
            playTrimmedTrack(playerObj, offsetInTrack);
          } else if (currentTime < trackStartTime) {
            // If playhead is before track start, schedule the track to start later
            const delayTime = (trackStartTime - currentTime) * 1000;
            setTimeout(() => {
              if (isPlaying) {
                playTrimmedTrack(playerObj, 0);
              }
            }, delayTime);
          }
        });
        
        playbackStartRef.current = {
          systemTime: Date.now(),
          audioTime: currentTime,
        };
      }
    } catch (error) {
      console.error("Error during play/pause:", error);
    }
  };

  // Function to get grid divisions based on selected grid
  const getGridDivisions = (gridSize) => {
    switch (gridSize) {
      case "1/1":
        return 1;
      case "1/2":
        return 2;
      case "1/2 dotted":
        return 2;
      case "1/4":
        return 4;
      case "1/8":
        return 8;
      case "1/16":
        return 16;
      case "1/32":
        return 32;
      case "1/8 triplet":
        return 12;
      case "1/16 triplet":
        return 24;
      case "Automatic grid size":
        return 4;
      default:
        return 4;
    }
  };

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

    // Get grid settings
    const gridDivisions = getGridDivisions(selectedGrid);
    const gridSpacing = 1 / gridDivisions;
    const gridColor = "#FFFFFF";

    // Unified ruler: draw all ticks (main, half, quarter, grid) in one area
    for (let time = 0; time <= duration; time += gridSpacing) {
      const x = xScale(time);
      const isMainBeat = Math.abs(time - Math.round(time)) < 0.01;
      const isHalfBeat = Math.abs(time - Math.round(time * 2) / 2) < 0.01;
      const isQuarterBeat = Math.abs(time - Math.round(time * 4) / 4) < 0.01;
      const sec = Math.round(time);
      const isLabeled = sec % labelInterval === 0 && isMainBeat;

      // Determine tick height and style
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

  // Enhanced animation loop for playback with proper track management
  useEffect(() => {
    let localAnimationId = null;

    if (isPlaying) {
      const updateLoop = () => {
        if (!isPlaying) return;

        const elapsedTime = (Date.now() - playbackStartRef.current.systemTime) / 1000;
        const newTime = playbackStartRef.current.audioTime + elapsedTime;

        if (newTime >= audioDuration) {
          setIsPlaying(false);
          setCurrentTime(audioDuration);
          stopAllTracks();
        } else {
          setCurrentTime(newTime);

          // Check if any new tracks should start playing
          players.forEach((playerObj) => {
            const trackStartTime = playerObj.startTime || 0;
            const trackDuration = playerObj.duration || 0;
            const trackEndTime = trackStartTime + trackDuration;
            const trackId = playerObj.trackId;

            const previousTime = playbackStartRef.current.audioTime + (elapsedTime - 1 / 60);
            
            // Check if track should start playing now
            if (previousTime < trackStartTime && newTime >= trackStartTime && newTime < trackEndTime) {
              if (!playingTracks.current.has(trackId)) {
                playTrimmedTrack(playerObj, 0);
              }
            }
            
            // Check if track should stop (reached its end or trim end)
            if (newTime >= trackEndTime) {
              if (playingTracks.current.has(trackId)) {
                const player = playingTracks.current.get(trackId);
                if (player && typeof player.stop === 'function') {
                  player.stop();
                  playingTracks.current.delete(trackId);
                }
              }
            }
          });

          localAnimationId = requestAnimationFrame(updateLoop);
        }
      };

      localAnimationId = requestAnimationFrame(updateLoop);
    }

    return () => {
      if (localAnimationId) {
        cancelAnimationFrame(localAnimationId);
      }
    };
  }, [isPlaying, audioDuration, players, playTrimmedTrack, stopAllTracks]);

  // Render ruler when dependencies change
  useEffect(() => {
    renderRuler();
  }, [renderRuler]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopAllTracks();
      players.forEach((playerObj) => {
        if (playerObj.player && typeof playerObj.player.dispose === 'function') {
          playerObj.player.dispose();
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
    isDragging.current = true;
    movePlayhead(e);
  };

  const handleMouseMove = useCallback((e) => {
    if (!isDragging.current) return;
    movePlayhead(e);
  }, []);

  const handleMouseUp = useCallback(() => {
    isDragging.current = false;
  }, []);

  // Drag and drop handlers for timeline
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

    try {
      const data = e.dataTransfer.getData('text/plain');
      if (data) {
        const soundItem = JSON.parse(data);
        console.log('Dropped sound item:', soundItem);

        // Calculate drop position
        const rect = timelineContainerRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const width = rect.width;
        const duration = audioDuration;
        const dropTime = (x / width) * duration;

        // Get the audio file duration
        const url = `${IMAGE_URL}uploads/soundfile/${soundItem.soundfile}`;
        let audioDurationSec = null;
        try {
          const response = await fetch(url);
          const arrayBuffer = await response.arrayBuffer();
          const audioContext = new (window.AudioContext || window.webkitAudioContext)();
          const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
          audioDurationSec = audioBuffer.duration;
          console.log('Audio duration (seconds):', audioDurationSec);
        } catch (err) {
          console.error('Error fetching or decoding audio for duration:', err);
        }

        // Create new track with the dropped sound
        const newTrack = {
          id: Date.now(),
          name: soundItem.soundname || 'New Track',
          url: `${IMAGE_URL}uploads/soundfile/${soundItem.soundfile}`,
          color: '#FFB6C1',
          height: trackHeight,
          startTime: dropTime,
          duration: audioDurationSec,
          originalDuration: audioDurationSec,
          trimStart: 0,
          trimEnd: audioDurationSec,
          soundData: soundItem
        };

        // Add the new track to Redux store
        dispatch(addTrack(newTrack));

        console.log('New track created:', {
          trackId: newTrack.id,
          trackName: newTrack.name,
          soundUrl: newTrack.url,
          startTime: newTrack.startTime,
          formattedTime: `${Math.floor(dropTime / 60)}:${Math.floor(dropTime % 60).toString().padStart(2, '0')}`
        });
      }
    } catch (error) {
      console.error('Error processing dropped item:', error);
    }
  }, [audioDuration, dispatch, trackHeight]);

  const movePlayhead = (e) => {
    if (!timelineContainerRef.current) return;

    const svgRect = timelineContainerRef.current.getBoundingClientRect();
    const x = e.clientX - svgRect.left;
    const width = svgRect.width;
    const duration = audioDuration;

    if (width <= 0 || duration <= 0) return;

    let time = (x / width) * duration;
    time = Math.max(0, Math.min(duration, time));
    setCurrentTime(time);

    waveSurfers.forEach((ws) => {
      if (ws && typeof ws.seekTo === 'function' && typeof ws.getDuration === 'function') {
        const wsDuration = ws.getDuration();
        if (wsDuration > 0) {
          ws.seekTo(time / wsDuration);
        }
      }
    });

    if (isPlaying) {
      // Stop all current players
      stopAllTracks();

      // Restart players from new position with proper trimming
      players.forEach((playerObj) => {
        const trackStartTime = playerObj.startTime || 0;
        const trackDuration = playerObj.duration || 0;
        const trackEndTime = trackStartTime + trackDuration;

        if (time >= trackStartTime && time < trackEndTime) {
          const offsetInTrack = time - trackStartTime;
          playTrimmedTrack(playerObj, offsetInTrack);
        } else if (time < trackStartTime) {
          const delayTime = (trackStartTime - time) * 1000;
          setTimeout(() => {
            if (isPlaying) {
              playTrimmedTrack(playerObj, 0);
            }
          }, delayTime);
        }
      });

      playbackStartRef.current = {
        systemTime: Date.now(),
        audioTime: time,
      };
    }
  };

  const renderGridLines = () => {
    const gridLines = [];
    const width = timelineContainerRef.current?.clientWidth || 600;
    const duration = audioDuration;

    if (width <= 0 || duration <= 0) return gridLines;

    const xScale = d3.scaleLinear().domain([0, duration]).range([0, width]);
    const gridDivisions = getGridDivisions(selectedGrid);
    const gridSpacing = 1 / gridDivisions;

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
            top: "100px",
            width: `${lineWidth}px`,
            height: `calc(100% - 100px)`,
            background: lineColor,
            opacity: lineOpacity,
            zIndex: 0,
            pointerEvents: "none",
          }}
        />
      );
    }
    return gridLines;
  };

  const playheadPosition = audioDuration > 0 ? (currentTime / audioDuration) * 100 : 0;

  // Handle track selection
  const handleTrackSelect = useCallback((trackId) => {
    setSelectedTrackId(trackId);
  }, []);

  // Clear selection when clicking on timeline
  const handleTimelineClick = useCallback((e) => {
    if (e.target === timelineContainerRef.current || e.target.closest('.timeline-container')) {
      setSelectedTrackId(null);
    }
  }, []);

  const handleTrackMove = useCallback((trackId, newLeft) => {
    const newStartTime = Math.max(0, newLeft / timelineWidthPerSecond);

    // Update Redux store
    dispatch(updateTrack({
      id: trackId,
      updates: { startTime: newStartTime }
    }));

    // Update players array
    setPlayers(prev => prev.map(playerObj =>
      playerObj.trackId === trackId
        ? { ...playerObj, startTime: newStartTime }
        : playerObj
    ));

    console.log(`Track ${trackId} moved to position: ${newStartTime.toFixed(2)}s`);
  }, [dispatch, timelineWidthPerSecond]);

  const handleTrackResize = useCallback((trackId, newLeft, newWidth, isLeftHandle = false) => {
    const track = tracks.find(t => t.id === trackId);
    if (!track) return;

    const newStartTime = Math.max(0, newLeft / timelineWidthPerSecond);
    const newDuration = Math.max(0.1, newWidth / timelineWidthPerSecond);
    const originalDuration = track.originalDuration || track.duration;

    let trimStart = track.trimStart || 0;
    let trimEnd = track.trimEnd || originalDuration;

    if (isLeftHandle) {
      // Left handle resize - adjust trim start
      const timeDifference = newStartTime - track.startTime;
      trimStart = Math.max(0, Math.min(originalDuration, (track.trimStart || 0) + timeDifference));
      trimEnd = Math.min(originalDuration, trimStart + newDuration);
    } else {
      // Right handle resize - adjust trim end
      trimEnd = Math.min(originalDuration, trimStart + newDuration);
    }

    // Ensure trim values are valid
    if (trimStart >= trimEnd) {
      trimStart = Math.max(0, trimEnd - 0.1);
    }

    const updates = {
      startTime: newStartTime,
      duration: newDuration,
      trimStart,
      trimEnd
    };

    // Update Redux store
    dispatch(updateTrack({
      id: trackId,
      updates
    }));

    // Update players array
    setPlayers(prev => prev.map(playerObj =>
      playerObj.trackId === trackId
        ? { 
            ...playerObj, 
            startTime: newStartTime,
            duration: newDuration,
            trimStart,
            trimEnd
          }
        : playerObj
    ));

    console.log(`Track ${trackId} resized:`, {
      startTime: newStartTime.toFixed(2),
      duration: newDuration.toFixed(2),
      trimStart: trimStart.toFixed(2),
      trimEnd: trimEnd.toFixed(2)
    });
  }, [dispatch, timelineWidthPerSecond, tracks]);

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
        className="relative overflow-hidden timeline-container"
        onClick={handleTimelineClick}
      >
        <div
          style={{ width: "100%", overflowX: "auto" }}
          className="hide-scrollbar"
        >
          <div
            ref={timelineContainerRef}
            style={{ minWidth: `${Math.max(audioDuration, 12) * 100}px`, position: "relative", height: "100%" }}
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

            {/* Tracks */}
            <div
              style={{
                overflow: "auto",
                maxHeight: "calc(100vh - 300px)",
                position: "relative",
                minHeight: `${trackHeight * tracks.length}px`
              }}
            >
              {tracks.map((track, index) => (
                <div
                  key={track.id}
                  style={{
                    position: "relative",
                    marginBottom: "1px",
                    height: `${trackHeight}px`,
                  }}
                >
                  {/* Top horizontal line */}
                  <div
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      height: "1px",
                      background: "#FFFFFF1A",
                      zIndex: 0,
                    }}
                  />
                  {/* Bottom horizontal line */}
                  <div
                    style={{
                      position: "absolute",
                      bottom: 0,
                      left: 0,
                      width: "100%",
                      height: "1px",
                      background: "#FFFFFF1A",
                      zIndex: 0,
                    }}
                  />

                  <TimelineTrack
                    url={track.url}
                    color={track.color}
                    height={trackHeight}
                    trackId={track.id}
                    onReady={(ws) => handleReady(ws, track.url, track)}
                    startTime={track.startTime}
                    duration={track.duration}
                    trimStart={track.trimStart}
                    trimEnd={track.trimEnd}
                    originalDuration={track.originalDuration}
                    isSelected={selectedTrackId === track.id}
                    onSelect={handleTrackSelect}
                  />

                  {/* Moveable component for dragging and resizing */}
                  {selectedTrackId === track.id && (
                    <Moveable
                      target={`.timeline-track-${track.id}`}
                      draggable={true}
                      resizable={true}
                      throttleDrag={1}
                      throttleResize={1}
                      edgeDraggable={false}
                      startDragRotate={0}
                      throttleDragRotate={0}
                      scalable={false}
                      rotatable={false}
                      keepRatio={false}
                      origin={false}
                      padding={{ left: 0, top: 0, right: 0, bottom: 0 }}
                      renderDirections={["w", "e"]}
                      resizeOrigin="left top"
                      onResizeStart={(e) => {
                        console.log(`Started resizing track ${track.id}`);
                      }}
                      onResize={(e) => {
                        // Determine which handle is being dragged
                        const isLeftHandle = e.direction[0] < 0;
                        
                        // Calculate new dimensions
                        const newLeft = Math.max(0, e.drag.left);
                        const newWidth = Math.max(20, e.width);
                        
                        // Apply visual changes immediately
                        e.target.style.left = `${newLeft}px`;
                        e.target.style.width = `${newWidth}px`;
                        
                        // Calculate times for logging
                        const newStartTime = newLeft / timelineWidthPerSecond;
                        const newDuration = newWidth / timelineWidthPerSecond;
                        
                        console.log(`Resizing track ${track.id} - Left Handle: ${isLeftHandle}, Start: ${newStartTime.toFixed(2)}s, Duration: ${newDuration.toFixed(2)}s`);
                      }}
                      onResizeEnd={(e) => {
                        // Determine which handle was dragged
                        const isLeftHandle = e.lastEvent && e.lastEvent.direction[0] < 0;
                        
                        if (!e.lastEvent) return;
                        
                        // Get final dimensions
                        const newLeft = Math.max(0, e.lastEvent.drag.left);
                        const newWidth = Math.max(20, e.lastEvent.width);
                        
                        // Snap to grid if needed
                        const gridDivisions = getGridDivisions(selectedGrid);
                        const gridSpacing = 1 / gridDivisions;
                        
                        const newStartTime = newLeft / timelineWidthPerSecond;
                        const newDuration = newWidth / timelineWidthPerSecond;
                        
                        const snappedStartTime = Math.round(newStartTime / gridSpacing) * gridSpacing;
                        const snappedDuration = Math.max(gridSpacing, Math.round(newDuration / gridSpacing) * gridSpacing);
                        
                        const snappedLeft = snappedStartTime * timelineWidthPerSecond;
                        const snappedWidth = snappedDuration * timelineWidthPerSecond;
                        
                        // Apply final snapped position
                        e.target.style.left = `${snappedLeft}px`;
                        e.target.style.width = `${snappedWidth}px`;
                        
                        // Update track data with trim information
                        handleTrackResize(track.id, snappedLeft, snappedWidth, isLeftHandle);
                        
                        console.log(`Track ${track.id} resize completed - Left Handle: ${isLeftHandle}, Final Start: ${snappedStartTime.toFixed(2)}s, Final Duration: ${snappedDuration.toFixed(2)}s`);
                      }}
                      onDragStart={(e) => {
                        console.log(`Started dragging track ${track.id}`);
                      }}
                      onDrag={(e) => {
                        // Update position during drag (only horizontal movement)
                        const newLeft = Math.max(0, e.left);
                        e.target.style.left = `${newLeft}px`;
                        
                        // Calculate new start time for logging
                        const newStartTime = newLeft / timelineWidthPerSecond;
                        console.log(`Dragging track ${track.id} to position: ${newStartTime.toFixed(2)}s`);
                      }}
                      onDragEnd={(e) => {
                        // Final position update for drag
                        if (!e.lastEvent) return;
                        
                        const newLeft = Math.max(0, e.lastEvent.left);
                        const newStartTime = newLeft / timelineWidthPerSecond;
                        
                        // Snap to grid if needed
                        const gridDivisions = getGridDivisions(selectedGrid);
                        const gridSpacing = 1 / gridDivisions;
                        const snappedTime = Math.round(newStartTime / gridSpacing) * gridSpacing;
                        const snappedLeft = snappedTime * timelineWidthPerSecond;
                        
                        // Update the visual position
                        e.target.style.left = `${snappedLeft}px`;
                        
                        // Update the track data (position only, not trim)
                        handleTrackMove(track.id, snappedLeft);
                        
                        console.log(`Track ${track.id} moved to final position: ${snappedTime.toFixed(2)}s`);
                      }}
                      bounds={{
                        left: 0,
                        right: audioDuration * timelineWidthPerSecond - (track.duration * timelineWidthPerSecond),
                        top: 0,
                        bottom: 0
                      }}
                      dragArea={true}
                      style={{
                        border: "2px solid #AD00FF",
                        borderRadius: "8px",
                      }}
                    />
                  )}
                </div>
              ))}
            </div>

            {/* Playhead */}
            <div
              style={{
                position: "absolute",
                left: `${playheadPosition}%`,
                top: 0,
                height: "100%",
                width: "2px",
                pointerEvents: "none",
                zIndex: 100,
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

            {/* Grid lines */}
            {tracks.length > 0 && (
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  pointerEvents: "none",
                }}
              >
                {renderGridLines()}
              </div>
            )}

            {/* Snap guidelines (optional visual feedback) */}
            {selectedTrackId && (
              <div
                style={{
                  position: "absolute",
                  top: "100px",
                  left: 0,
                  width: "100%",
                  height: "calc(100% - 100px)",
                  pointerEvents: "none",
                  zIndex: 50,
                }}
              >
                {/* Add snap guidelines here if needed */}
              </div>
            )}
          </div>
        </div>

        {/* Controls */}
        <div
          style={{
            position: "fixed",
            bottom: "80px",
            left: "50%",
            transform: "translateX(-50%)",
          }}
        >
          <button
            onClick={handlePlayPause}
            style={{
              color: "white",
              background: "#333",
              border: "none",
              padding: "10px 20px",
              borderRadius: "6px",
              cursor: "pointer",
            }}
          >
            {isPlaying ? "⏸️ Pause" : "▶️ Play All"}
          </button>
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
                  onGridChange={setSelectedGrid}
                  onTimeChange={setSelectedTime}
                  onRulerChange={setSelectedRuler}
                />
              </div>
            )}
          </div>
          <div className="hover:bg-[#1F1F1F] w-[30px] h-[30px] flex items-center justify-center rounded-full">
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
    </>
  );
};

export default Timeline;