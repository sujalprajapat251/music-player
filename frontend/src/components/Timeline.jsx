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

    for (let sec = 0; sec <= duration; sec++) {
      const x = xScale(sec);
      const isLabeled = sec % labelInterval === 0;

      // Ticks
      svg
        .append("line")
        .attr("x1", x)
        .attr("y1", axisY)
        .attr("x2", x)
        .attr("y2", axisY - (isLabeled ? 20 : 10))
        .attr("stroke", "white")
        .attr("stroke-width", 1);

      // Labels
      if (isLabeled) {
        const minutes = Math.floor(sec / 60);
        const seconds = Math.floor(sec % 60);
        const label = `${minutes}:${seconds.toString().padStart(2, "0")}`;
        svg
          .append("text")
          .attr("x", x + 4)
          .attr("y", axisY - 5)
          .attr("fill", "white")
          .attr("font-size", 12)
          .attr("text-anchor", "start")
          .text(label);
      }
    }

    // Baseline
    svg
      .append("line")
      .attr("x1", 0)
      .attr("y1", axisY)
      .attr("x2", width)
      .attr("y2", axisY)
      .attr("stroke", "white")
      .attr("stroke-width", 1);
  }, [audioDuration]);

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
    
    for (let sec = 0; sec <= duration; sec += 1) {
      const x = xScale(sec);
      gridLines.push(
        <div
          key={sec}
          style={{
            position: "absolute",
            left: `${x}px`,
            top: "100px",
            width: "1px",
            height: `calc(100% - 100px)`,
            background: "#FFFFFF1A",
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
                <GridSetting />
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