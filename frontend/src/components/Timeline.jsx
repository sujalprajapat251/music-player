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

// Custom Resizable Trim Handle Component
const ResizableTrimHandle = ({ 
  type, // 'start' or 'end'
  position, 
  onResize, 
  isDragging, 
  onDragStart, 
  onDragEnd,
  trackDuration,
  trackWidth 
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const dragStartRef = useRef({ startX: 0, startPosition: 0 });

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
      const newPosition = Math.max(0, Math.min(trackDuration, dragStartRef.current.startPosition + deltaTime));
      
      onResize(type, newPosition);
    };
    
    const handleMouseUp = () => {
      onDragEnd();
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [position, onResize, onDragStart, onDragEnd, type, trackDuration, trackWidth]);

  return (
    <div
      style={{
        position: "absolute",
        left: type === 'start' ? `${(position / trackDuration) * 100}%` : 'auto',
        right: type === 'end' ? `${100 - (position / trackDuration) * 100}%` : 'auto',
        top: 0,
        width: "12px",
        height: "100%",
        cursor: "ew-resize",
        zIndex: 15,
        transform: "translateX(-6px)",
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
          width: "20px",
          height: "100%",
          left: "-4px",
          top: 0,
        }}
      />
      
      {/* Visible handle */}
      <div
        style={{
          width: "8px",
          height: "80%",
          background: isDragging || isHovered ? "#AD00FF" : "#fff",
          borderRadius: "4px",
          border: `2px solid ${isDragging || isHovered ? "#fff" : "#AD00FF"}`,
          boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
          transition: isDragging ? "none" : "all 0.2s ease",
          transform: isDragging || isHovered ? "scale(1.1)" : "scale(1)",
          position: "relative",
        }}
      >
        {/* Grip lines */}
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -50%)",
            width: "2px",
            height: "50%",
            background: isDragging || isHovered ? "#fff" : "#AD00FF",
            borderRadius: "1px",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -50%)",
            width: "2px",
            height: "25%",
            background: isDragging || isHovered ? "#fff" : "#AD00FF",
            borderRadius: "1px",
            marginLeft: "-3px",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -50%)",
            width: "2px",
            height: "25%",
            background: isDragging || isHovered ? "#fff" : "#AD00FF",
            borderRadius: "1px",
            marginLeft: "3px",
          }}
        />
      </div>
      
      {/* Tooltip */}
      {(isHovered || isDragging) && (
        <div
          style={{
            position: "absolute",
            top: "-35px",
            left: "50%",
            transform: "translateX(-50%)",
            background: "rgba(0,0,0,0.8)",
            color: "white",
            padding: "4px 8px",
            borderRadius: "4px",
            fontSize: "11px",
            whiteSpace: "nowrap",
            pointerEvents: "none",
            zIndex: 20,
          }}
        >
          {type === 'start' ? 'Start' : 'End'}: {position.toFixed(2)}s
        </div>
      )}
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
  onTrimChange 
}) => {
  const waveformRef = useRef(null);
  const wavesurfer = useRef(null);
  const isInitialized = useRef(false);
  const [isDraggingTrim, setIsDraggingTrim] = useState(null);
  const trackRef = useRef(null);

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
  }, [trackId]);

  const handleTrimResize = useCallback((type, newPosition) => {
    if (!onTrimChange || !duration) return;
    
    const currentTrimStart = trimStart || 0;
    const currentTrimEnd = trimEnd || duration;
    
    if (type === 'start') {
      const newTrimStart = Math.max(0, Math.min(newPosition, currentTrimEnd - 0.1));
      onTrimChange({ trimStart: newTrimStart, trimEnd: currentTrimEnd });
    } else if (type === 'end') {
      const newTrimEnd = Math.max(currentTrimStart + 0.1, Math.min(newPosition, duration));
      onTrimChange({ trimStart: currentTrimStart, trimEnd: newTrimEnd });
    }
  }, [trimStart, trimEnd, duration, onTrimChange]);

  const handleDragStart = useCallback((type) => {
    setIsDraggingTrim(type);
  }, []);

  const handleDragEnd = useCallback(() => {
    setIsDraggingTrim(null);
  }, []);

  const timelineWidthPerSecond = 100;
  const left = startTime * timelineWidthPerSecond;
  const width = (duration || 1) * timelineWidthPerSecond;
  
  const actualTrimEnd = trimEnd || duration;
  const trimStartPercent = (trimStart / duration) * 100;
  const trimEndPercent = (actualTrimEnd / duration) * 100;

  return (
    <div
      ref={trackRef}
      data-track-container
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
        overflow: "hidden",
        border: isDraggingTrim ? "2px solid #AD00FF" : "1px solid rgba(255,255,255,0.1)",
        boxShadow: isDraggingTrim ? "0 4px 20px rgba(173,0,255,0.3)" : "none",
        transition: isDraggingTrim ? "none" : "all 0.2s ease",
      }}
    >
      {/* Waveform */}
      <div
        ref={waveformRef}
        style={{
          width: "100%",
          height: "100%",
          position: "absolute",
          top: 0,
          left: 0,
          zIndex: 1,
        }}
      />

      {/* Left trim overlay (dimmed area) */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: `${trimStartPercent}%`,
          height: "100%",
          background: "rgba(0, 0, 0, 0.7)",
          zIndex: 5,
          pointerEvents: "none",
          borderRight: trimStartPercent > 0 ? "2px solid rgba(173,0,255,0.5)" : "none",
        }}
      />

      {/* Right trim overlay (dimmed area) */}
      <div
        style={{
          position: "absolute",
          right: 0,
          top: 0,
          width: `${100 - trimEndPercent}%`,
          height: "100%",
          background: "rgba(0, 0, 0, 0.7)",
          zIndex: 5,
          pointerEvents: "none",
          borderLeft: trimEndPercent < 100 ? "2px solid rgba(173,0,255,0.5)" : "none",
        }}
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
      />

      {/* Track name/info overlay */}
      <div
        style={{
          position: "absolute",
          left: `${Math.max(trimStartPercent + 2, 5)}%`,
          top: "50%",
          transform: "translateY(-50%)",
          color: "white",
          fontSize: "12px",
          fontWeight: "500",
          zIndex: 10,
          pointerEvents: "none",
          textShadow: "1px 1px 2px rgba(0,0,0,0.8)",
          background: "rgba(0,0,0,0.3)",
          padding: "2px 6px",
          borderRadius: "3px",
        }}
      >
        Track {trackId}
      </div>

      {/* Trim indicators */}
      {(trimStart > 0 || actualTrimEnd < duration) && (
        <div
          style={{
            position: "absolute",
            right: "8px",
            top: "8px",
            background: "rgba(173,0,255,0.8)",
            color: "white",
            fontSize: "10px",
            padding: "2px 4px",
            borderRadius: "2px",
            zIndex: 10,
            pointerEvents: "none",
          }}
        >
          ✂️ Trimmed
        </div>
      )}
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

  // Grid settings state
  const [selectedGrid, setSelectedGrid] = useState("1/1");
  const [selectedTime, setSelectedTime] = useState("4/4");
  const [selectedRuler, setSelectedRuler] = useState("Beats");

  const dispatch = useDispatch();
  const tracks = useSelector((state) => state.studio?.tracks || []);
  const trackHeight = useSelector((state) => state.studio?.trackHeight || 100);

  // Handle trim changes with validation
  const handleTrimChange = useCallback((trackId, trimData) => {
    // Validate trim data
    const { trimStart, trimEnd } = trimData;
    const track = tracks.find(t => t.id === trackId);
    
    if (!track || !track.duration) return;
    
    const validatedTrimStart = Math.max(0, Math.min(trimStart, track.duration - 0.1));
    const validatedTrimEnd = Math.max(validatedTrimStart + 0.1, Math.min(trimEnd, track.duration));
    
    dispatch(updateTrack({ 
      id: trackId, 
      updates: { 
        trimStart: validatedTrimStart, 
        trimEnd: validatedTrimEnd 
      } 
    }));
  }, [dispatch, tracks]);

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
      
      setPlayers((prev) => {
        const existingIndex = prev.findIndex(p => p.trackId === trackData.id);
        if (existingIndex !== -1) {
          const newPlayers = [...prev];
          newPlayers[existingIndex] = { 
            player, 
            trackId: trackData.id, 
            startTime: trackData.startTime,
            duration: trackData.duration,
            trimStart: trackData.trimStart || 0,
            trimEnd: trackData.trimEnd || trackData.duration
          };
          return newPlayers;
        } else {
          return [...prev, { 
            player, 
            trackId: trackData.id, 
            startTime: trackData.startTime,
            duration: trackData.duration,
            trimStart: trackData.trimStart || 0,
            trimEnd: trackData.trimEnd || trackData.duration
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

  const handlePlayPause = async () => {
    try {
      await start();
  
      if (isPlaying) {
        players.forEach((playerObj) => {
          if (playerObj?.player && typeof playerObj.player.stop === 'function') {
            playerObj.player.stop();
          }
        });
        setIsPlaying(false);
      } else {
        setIsPlaying(true);
        players.forEach((playerObj) => {
          if (playerObj?.player && typeof playerObj.player.start === 'function') {
            const trackStartTime = playerObj.startTime || 0;
            const trackDuration = playerObj.duration || 0;
            const trimStart = playerObj.trimStart || 0;
            const trimEnd = playerObj.trimEnd || trackDuration;
            const trimmedDuration = trimEnd - trimStart;
            
            const actualTrackStart = trackStartTime + trimStart;
            const actualTrackEnd = trackStartTime + trimEnd;
            
            if (currentTime >= actualTrackStart && currentTime < actualTrackEnd) {
              const offsetInTrack = currentTime - actualTrackStart + trimStart;
              const remainingDuration = trimEnd - offsetInTrack;
              
              playerObj.player.start(undefined, offsetInTrack, remainingDuration);
            } else if (currentTime < actualTrackStart) {
              const delayTime = actualTrackStart - currentTime;
              setTimeout(() => {
                if (isPlaying) {
                  playerObj.player.start(undefined, trimStart, trimmedDuration);
                }
              }, delayTime * 1000);
            }
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
      players.forEach((playerObj) => {
        if (playerObj?.player && typeof playerObj.player.stop === 'function') {
          playerObj.player.stop();
        }
      });
      
      players.forEach((playerObj) => {
        if (playerObj?.player && typeof playerObj.player.start === 'function') {
          const trackStartTime = playerObj.startTime || 0;
          const trackDuration = playerObj.duration || 0;
          const trimStart = playerObj.trimStart || 0;
          const trimEnd = playerObj.trimEnd || trackDuration;
          
          const actualTrackStart = trackStartTime + trimStart;
          const actualTrackEnd = trackStartTime + trimEnd;
          
          if (time >= actualTrackStart && time < actualTrackEnd) {
            const offsetInTrack = time - actualTrackStart + trimStart;
            const remainingDuration = trimEnd - offsetInTrack;
            playerObj.player.start(undefined, offsetInTrack, remainingDuration);
          } else if (time < actualTrackStart) {
            const delayTime = actualTrackStart - time;
            setTimeout(() => {
              if (isPlaying) {
                playerObj.player.start(undefined, trimStart, trimEnd - trimStart);
              }
            }, delayTime * 1000);
          }
        }
      });
      
      playbackStartRef.current = {
        systemTime: Date.now(),
        audioTime: time,
      };
    }
  };

  // Animation loop updated to handle trimmed playback
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
          players.forEach((playerObj) => {
            if (playerObj?.player && typeof playerObj.player.stop === 'function') {
              try {
                playerObj.player.stop();
              } catch (error) {
                // Silently ignore stop errors
              }
            }
          });
        } else {
          setCurrentTime(newTime);
          
          players.forEach((playerObj) => {
            if (playerObj?.player) {
              const trackStartTime = playerObj.startTime || 0;
              const trackDuration = playerObj.duration || 0;
              const trimStart = playerObj.trimStart || 0;
              const trimEnd = playerObj.trimEnd || trackDuration;
              
              const actualTrackStart = trackStartTime + trimStart;
              const actualTrackEnd = trackStartTime + trimEnd;
              
              if (newTime >= actualTrackEnd && playerObj.player.state === 'started') {
                try {
                  playerObj.player.stop();
                } catch (error) {
                  // Silently ignore stop errors
                }
              }
              
              const previousTime = playbackStartRef.current.audioTime + (elapsedTime - 1/60);
              if (previousTime < actualTrackStart && newTime >= actualTrackStart && newTime < actualTrackEnd) {
                try {
                  const trimmedDuration = trimEnd - trimStart;
                  playerObj.player.start(undefined, trimStart, trimmedDuration);
                } catch (error) {
                  console.log("Track already playing or error starting:", error);
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
  }, [isPlaying, audioDuration, players]);

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
  }, [renderRuler]);

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
        
        const rect = timelineContainerRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const width = rect.width;
        const duration = audioDuration;
        const dropTime = (x / width) * duration;
        
        const url = `${IMAGE_URL}uploads/soundfile/${soundItem.soundfile}`;
        let audioDurationSec = null;
        try {
          const response = await fetch(url);
          const arrayBuffer = await response.arrayBuffer();
          const audioContext = new (window.AudioContext || window.webkitAudioContext)();
          const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
          audioDurationSec = audioBuffer.duration;
        } catch (err) {
          console.error('Error fetching or decoding audio for duration:', err);
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
        
        dispatch(addTrack(newTrack));
      }
    } catch (error) {
      console.error('Error processing dropped item:', error);
    }
  }, [audioDuration, dispatch, trackHeight]);

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
              {tracks.map((track) => (
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
                    trimStart={track.trimStart || 0}
                    trimEnd={track.trimEnd || track.duration}
                    onTrimChange={(trimData) => handleTrimChange(track.id, trimData)}
                  />
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
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "14px",
              fontWeight: "500",
              transition: "all 0.2s ease",
              boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
            }}
            onMouseEnter={(e) => {
              e.target.style.background = "#444";
              e.target.style.transform = "translateY(-1px)";
            }}
            onMouseLeave={(e) => {
              e.target.style.background = "#333";
              e.target.style.transform = "translateY(0)";
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

        {/* Trim Instructions Overlay */}
        {tracks.some(track => track.trimStart > 0 || (track.trimEnd && track.trimEnd < track.duration)) && (
          <div
            style={{
              position: "fixed",
              top: "120px",
              right: "20px",
              background: "rgba(0,0,0,0.8)",
              color: "white",
              padding: "12px 16px",
              borderRadius: "8px",
              fontSize: "12px",
              maxWidth: "200px",
              zIndex: 50,
              border: "1px solid rgba(173,0,255,0.3)",
            }}
          >
            <div style={{ fontWeight: "bold", marginBottom: "4px" }}>✂️ Trim Active</div>
            <div>Drag the handles on track edges to adjust trim points</div>
          </div>
        )}
      </div>

      <MusicOff showOffcanvas={showOffcanvas} setShowOffcanvas={setShowOffcanvas} />
    </>
  );
};

export default Timeline;