import React, { useEffect, useRef, useState, useCallback } from "react";
import WaveSurfer from "wavesurfer.js";
import { Player, start } from "tone";
import * as d3 from "d3";
import { useSelector } from "react-redux";
import magnetIcon from "../Images/magnet.svg";
import settingIcon from "../Images/setting.svg";
import reverceIcon from "../Images/reverce.svg";
import fxIcon from "../Images/fx.svg";
import offce from "../Images/offce.svg";
import GridSetting from "./GridSetting";
import MusicOff from "./MusicOff";

const TimelineTrack = ({ url, onReady, color, height, trackId }) => {
  const waveformRef = useRef(null);
  const wavesurfer = useRef(null);
  const isInitialized = useRef(false);

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
  }, [trackId]); // Only depend on trackId, not on url, height, or onReady

  return (
    <div
      style={{
        background: color,
        borderRadius: 8,
        marginBottom: 1,
        height: `${height}px`,
        display: "flex",
        alignItems: "center",
        position: "relative",
        overflow: "hidden",
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
        }}
      />
    </div>
  );
};

const Timeline = () => {
  const [players, setPlayers] = useState([]);
  const [waveSurfers, setWaveSurfers] = useState([]);
  const [audioDuration, setAudioDuration] = useState(10);
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

  const tracks = useSelector((state) => state.studio?.tracks || []);
  const trackHeight = useSelector((state) => state.studio?.trackHeight || 100);

  const handleReady = useCallback(async (wavesurfer, url) => {
    if (!url) return;
    
    let isCancelled = false;
    
    try {
      const controller = new AbortController();
      
      // Set up cleanup function
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
        // Check if player already exists to prevent duplicates
        if (prev.find(p => p === player)) return prev;
        return [...prev, player];
      });
      
      setWaveSurfers((prev) => {
        // Check if wavesurfer already exists to prevent duplicates
        if (prev.find(ws => ws === wavesurfer)) return prev;
        return [...prev, wavesurfer];
      });
      
      const duration = wavesurfer.getDuration();
      if (duration > 0 && !isCancelled) {
        setAudioDuration((prev) => Math.max(prev, duration));
      }
    } catch (error) {
      if (error.name === 'AbortError' || isCancelled) {
        return; // Silently ignore abort errors
      }
      console.error("Error loading audio:", error);
    }
  }, []);

  const handlePlayPause = async () => {
    try {
      await start();

      if (isPlaying) {
        players.forEach((player) => {
          if (player && typeof player.stop === 'function') {
            player.stop();
          }
        });
        setIsPlaying(false);
      } else {
        setIsPlaying(true);
        players.forEach((player) => {
          if (player && typeof player.start === 'function') {
            player.start(undefined, currentTime);
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
        return 1; // 1 grid line per second
      case "1/2":
        return 2; // 2 grid lines per second
      case "1/2 dotted":
        return 2; // 2 grid lines per second (dotted)
      case "1/4":
        return 4; // 4 grid lines per second
      case "1/8":
        return 8; // 8 grid lines per second
      case "1/16":
        return 16; // 16 grid lines per second
      case "1/32":
        return 32; // 32 grid lines per second
      case "1/8 triplet":
        return 12; // 12 grid lines per second (triplet)
      case "1/16 triplet":
        return 24; // 24 grid lines per second (triplet)
      case "Automatic grid size":
        return 4; // Default to 1/4
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
    const labelInterval = 2;

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
      let tickHeight = 4; // Default small tick
      let strokeWidth = 0.5;
      let opacity = 0.6;

      if (isMainBeat) {
        tickHeight = 20; // Tallest for main beats (whole notes)
        strokeWidth = 1.5;
        opacity = 1;
      } else if (isHalfBeat) {
        tickHeight = 14; // Medium for half beats
        strokeWidth = 1;
        opacity = 0.8;
      } else if (isQuarterBeat) {
        tickHeight = 10; // Slightly larger for quarter beats
        strokeWidth = 0.8;
        opacity = 0.7;
      }

      // Draw tick from axisY downwards
      svg
        .append("line")
        .attr("x1", x)
        .attr("y1", axisY)
        .attr("x2", x)
        .attr("y2", axisY - tickHeight)
        .attr("stroke", gridColor)
        .attr("stroke-width", strokeWidth)
        .attr("opacity", opacity);

      // Draw label if main beat and label interval
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

    // Main baseline
    svg
      .append("line")
      .attr("x1", 0)
      .attr("y1", axisY)
      .attr("x2", width)
      .attr("y2", axisY)
      .attr("stroke", "white")
      .attr("stroke-width", 1);
  }, [audioDuration, selectedGrid]);

  // Animation loop for playback with proper cleanup
  useEffect(() => {
    let localAnimationId = null;

    if (isPlaying) {
      const updateLoop = () => {
        if (!isPlaying) return; // Double check if still playing
        
        const elapsedTime =
          (Date.now() - playbackStartRef.current.systemTime) / 1000;
        const newTime = playbackStartRef.current.audioTime + elapsedTime;

        if (newTime >= audioDuration) {
          setIsPlaying(false);
          setCurrentTime(audioDuration);
          players.forEach((player) => {
            if (player && typeof player.stop === 'function') {
              try {
                player.stop();
              } catch (error) {
                // Silently ignore stop errors
              }
            }
          });
        } else {
          setCurrentTime(newTime);
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
  }, [isPlaying, audioDuration]); // Removed players dependency to prevent infinite loops

  // Render ruler when dependencies change
  useEffect(() => {
    renderRuler();
  }, [renderRuler]);

  // Cleanup on unmount
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
      players.forEach((player) => {
        if (player && typeof player.stop === 'function' && typeof player.start === 'function') {
          player.stop();
          player.start(undefined, time);
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
    
    // Generate grid lines for the entire timeline area
    for (let time = 0; time <= duration; time += gridSpacing) {
      const x = xScale(time);
      const isMainBeat = Math.abs(time - Math.round(time)) < 0.01;
      const isHalfBeat = Math.abs(time - Math.round(time * 2) / 2) < 0.01;
      const isQuarterBeat = Math.abs(time - Math.round(time * 4) / 4) < 0.01;
      
      // Determine line style based on musical importance
      let lineColor = "#FFFFFF1A"; // Default light grid
      let lineWidth = 1;
      let lineOpacity = 0.3;
      
      if (isMainBeat) {
        lineColor = "#FFFFFF40"; // Brighter for main beats
        lineWidth = 1.5;
        lineOpacity = 0.6;
      } else if (isHalfBeat) {
        lineColor = "#FFFFFF30"; // Medium for half beats
        lineWidth = 1.2;
        lineOpacity = 0.4;
      } else if (isQuarterBeat) {
        lineColor = "#FFFFFF25"; // Slightly brighter for quarter beats
        lineWidth = 1;
        lineOpacity = 0.35;
      }
      
      gridLines.push(
        <div
          key={`grid-${time}`}
          style={{
            position: "absolute",
            left: `${x}px`,
            top: "100px", // Start from below the ruler
            width: `${lineWidth}px`,
            height: `calc(100% - 100px)`, // Extend to bottom
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

  // New function to render grid indicators in the main timeline area
  // const renderTimelineGridIndicators = () => {
  //   const width = timelineContainerRef.current?.clientWidth || 600;
  //   const duration = audioDuration;
    
  //   if (width <= 0 || duration <= 0) return null;
    
  //   const xScale = d3.scaleLinear().domain([0, duration]).range([0, width]);
  //   const gridDivisions = getGridDivisions(selectedGrid);
  //   const gridSpacing = 1 / gridDivisions;
    
  //   // Create SVG for grid indicators
  //   const indicators = [];
    
  //   for (let time = 0; time <= duration; time += gridSpacing) {
  //     const x = xScale(time);
  //     const isMainBeat = Math.abs(time - Math.round(time)) < 0.01;
  //     const isHalfBeat = Math.abs(time - Math.round(time * 2) / 2) < 0.01;
  //     const isQuarterBeat = Math.abs(time - Math.round(time * 4) / 4) < 0.01;
      
  //     // Determine indicator height based on musical importance
  //     let indicatorHeight = 4; // Default small indicator
  //     let strokeWidth = 0.5;
  //     let opacity = 0.6;
      
  //     if (isMainBeat) {
  //       indicatorHeight = 12; // Tallest for main beats
  //       strokeWidth = 1.5;
  //       opacity = 1;
  //     } else if (isHalfBeat) {
  //       indicatorHeight = 8; // Medium for half beats
  //       strokeWidth = 1;
  //       opacity = 0.8;
  //     } else if (isQuarterBeat) {
  //       indicatorHeight = 6; // Slightly larger for quarter beats
  //       strokeWidth = 0.8;
  //       opacity = 0.7;
  //     }
      
  //     indicators.push(
  //       <line
  //         key={`indicator-${time}`}
  //         x1={x}
  //         y1={100} // Start from below ruler
  //         x2={x}
  //         y2={100 - indicatorHeight} // Extend upward
  //         stroke="#FFFFFF"
  //         strokeWidth={strokeWidth}
  //         opacity={opacity}
  //       />
  //     );
  //   }
    
  //   return (
  //     <svg
  //       width="100%"
  //       height="100%"
  //       style={{
  //         position: "absolute",
  //         top: 0,
  //         left: 0,
  //         pointerEvents: "none",
  //         zIndex: 1,
  //       }}
  //     >
  //       {indicators}
  //     </svg>
  //   );
  // };

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
        className="relative"
      >
        <div
          ref={timelineContainerRef}
          style={{ position: "relative", height: "100%" }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
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
          <div style={{ overflow: "auto", maxHeight: "calc(100vh - 300px)" }}>
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
                  onReady={(ws) => handleReady(ws, track.url)}
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