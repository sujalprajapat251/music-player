import React, { useEffect, useRef, useState } from "react";
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
const TimelineTrack = ({ url, onReady, color, height }) => {
  const waveformRef = useRef(null);
  const wavesurfer = useRef(null);

  useEffect(() => {
    if (!waveformRef.current) return;

    wavesurfer.current = WaveSurfer.create({
      container: waveformRef.current,
      waveColor: "#ffffff",
      progressColor: "#ffffff",
      height: height - 8, // Subtract padding to match sidebar
      barWidth: 2,
      responsive: true,
      minPxPerSec: 50,
      normalize: true,
    });

    wavesurfer.current.load(url);
    wavesurfer.current.on("ready", () => {
      onReady(wavesurfer.current);
    });

    return () => wavesurfer.current.destroy();
  }, [url, height]);

  return (
    <div
      style={{
        background: color,
        borderRadius: 8,
        marginBottom: 1,
        height: `${height}px`,
        display: "flex",
        alignItems: "center",
        position: "relative", // Add this
        overflow: "hidden", // Add this
      }}
    >
      <div
        ref={waveformRef}
        style={{
          width: "100%",
          height: "100%",
          position: "absolute", // Add this
          top: 0,
          left: 0,
          zIndex: 0, // Make sure waveform is above background
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

  const tracks = useSelector((state) => state.studio.tracks);
  const trackHeight = useSelector((state) => state.studio.trackHeight);

  const handleReady = (wavesurfer, url) => {
    fetch(url)
      .then((res) => res.arrayBuffer())
      .then((arrayBuffer) => {
        const audioContext = new (window.AudioContext ||
          window.webkitAudioContext)();
        return audioContext.decodeAudioData(arrayBuffer);
      })
      .then((audioBuffer) => {
        const player = new Player(audioBuffer).toDestination();
        setPlayers((prev) => [...prev, player]);
      });
  };

  const handlePlayPause = async () => {
    await start();

    if (isPlaying) {
      players.forEach((player) => player.stop());
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
      players.forEach((player) => {
        player.start(undefined, currentTime);
      });
      playbackStartRef.current = {
        systemTime: Date.now(),
        audioTime: currentTime,
      };
    }
  };

  const renderRuler = () => {
    const svg = d3.select(svgRef.current);
    const svgNode = svgRef.current;
    const width = svgNode ? svgNode.clientWidth : 600;
    const axisY = 80; // Ruler baseline
    const duration = audioDuration;

    svg.selectAll("*").remove();

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
  };

  useEffect(() => {
    let animationFrameId;

    if (isPlaying) {
      const updateLoop = () => {
        const elapsedTime =
          (Date.now() - playbackStartRef.current.systemTime) / 1000;
        const newTime = playbackStartRef.current.audioTime + elapsedTime;

        if (newTime >= audioDuration) {
          setIsPlaying(false);
          setCurrentTime(audioDuration);
          players.forEach((player) => {
            player.stop();
          });
        } else {
          setCurrentTime(newTime);
          animationFrameId = requestAnimationFrame(updateLoop);
        }
      };

      animationFrameId = requestAnimationFrame(updateLoop);
    }

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isPlaying, audioDuration, players]);

  useEffect(() => {
    renderRuler();
  }, [audioDuration, currentTime]);

  const isDragging = useRef(false);

  const handleMouseDown = (e) => {
    isDragging.current = true;
    movePlayhead(e);
  };

  const handleMouseMove = (e) => {
    if (!isDragging.current) return;
    movePlayhead(e);
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  const movePlayhead = (e) => {
    const svgRect = timelineContainerRef.current.getBoundingClientRect();
    const x = e.clientX - svgRect.left;
    const width = svgRect.width;
    const duration = audioDuration;
    let time = (x / width) * duration;
    time = Math.max(0, Math.min(duration, time));
    setCurrentTime(time);

    waveSurfers.forEach((ws) => {
      if (ws && ws.seekTo) {
        ws.seekTo(time / ws.getDuration());
      }
    });

    if (isPlaying) {
      players.forEach((player) => {
        if (player && player.stop && player.start) {
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
    const xScale = d3.scaleLinear().domain([0, duration]).range([0, width]);
    for (let sec = 0; sec <= duration; sec += 1) {
      const x = xScale(sec);
      gridLines.push(
        <div
          key={sec}
          style={{
            position: "absolute",
            left: `${x}px`,
            top: "100px", // below the header
            width: "1px",
            height: `calc(100% - 100px)`, // fill tracks area
            background: "#FFFFFF1A",
            zIndex: 0,
            pointerEvents: "none",
          }}
        />
      );
    }
    return gridLines;
  };

  return (
    <div
      style={{
        padding: "0",
        color: "white",
        background: "transparent",
        height: "100%",
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
          {tracks.map((track, idx) => (
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
                onReady={(ws) => {
                  handleReady(ws, track.url);
                  setWaveSurfers((prev) => [...prev, ws]);
                  const dur = ws.getDuration();
                  setAudioDuration((prev) => Math.max(prev, dur));
                }}
              />
            </div>
          ))}
        </div>

        {/* Playhead - absolutely positioned over both header and tracks */}
        <div
          style={{
            position: "absolute",
            left: `${(currentTime / audioDuration) * 100}%`,
            top: 0,
            height: "100%",
            width: "2px",
            pointerEvents: "none",
            zIndex: 100, // Make sure it's above everything
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
      <div className="flex gap-2 absolute top-[60px] right-[10px] -translate-x-1/2 bg-[#141414]">
        <div className="hover:bg-[#1F1F1F] w-[30px] h-[30px] flex items-center justify-center rounded-full">
          <img src={magnetIcon} alt="" />
        </div>
        <div
          className="hover:bg-[#1F1F1F] w-[30px] h-[30px] flex items-center justify-center rounded-full relative"
          onClick={() => setShowGridSetting((prev) => !prev)}
        >
          <img src={settingIcon} alt="" />
          {showGridSetting && (
            <div className="absolute top-full right-0 z-[50]">
              <GridSetting />
            </div>
          )}
        </div>
        <div className="hover:bg-[#1F1F1F] w-[30px] h-[30px] flex items-center justify-center rounded-full">
          <img src={reverceIcon} alt="" />
        </div>
      </div>
      <div className=" absolute top-[60px] right-[0] -translate-x-1/2 z-10">
        <div className="bg-[#FFFFFF] w-[40px] h-[40px] flex items-center justify-center rounded-full">
          <img src={offce} alt="" />
        </div>
        <div className="bg-[#1F1F1F] w-[40px] h-[40px] flex items-center justify-center rounded-full mt-2">
          <img src={fxIcon} alt="" />
        </div>
      </div>
    </div>
  );
};

export default Timeline;
