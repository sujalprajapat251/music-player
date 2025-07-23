import React, { useEffect, useRef, useState } from "react";
import WaveSurfer from "wavesurfer.js";
import { Player, start } from "tone";
import * as d3 from "d3";
import { useSelector } from 'react-redux';
import { setTracks, addTrack } from '../Redux/Slice/studio.slice';

const TimelineTrack = ({ url, onReady, color }) => {
  const waveformRef = useRef(null);
  const wavesurfer = useRef(null);

  useEffect(() => {
    if (!waveformRef.current) return;

    wavesurfer.current = WaveSurfer.create({
      container: waveformRef.current,
      waveColor: "#ffffff",
      progressColor: "#ffffff",
      height: 80,
      barWidth: 2,
      responsive: true,
      minPxPerSec: 50, // fixed value
    });

    wavesurfer.current.load(url);
    wavesurfer.current.on("ready", () => {
      onReady(wavesurfer.current);
    });

    return () => wavesurfer.current.destroy();
  }, [url]);

  return (
    <div ref={waveformRef} style={{ background: color, borderRadius: 8, marginBottom: 8 }} />
  );
};

const Timeline = () => {
  const [players, setPlayers] = useState([]);
  const [waveSurfers, setWaveSurfers] = useState([]);
  const [audioDuration, setAudioDuration] = useState(10); // default, will update after load
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const svgRef = useRef(null);
  const timelineContainerRef = useRef(null);
  const playbackStartRef = useRef({ systemTime: 0, audioTime: 0 });

  const tracks = useSelector((state) => state.studio.tracks);

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
      // Pause
      players.forEach((player) => player.stop());
      setIsPlaying(false);
    } else {
      // Play
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
    const axisY = 60; // Move baseline lower
    const duration = audioDuration;

    svg.selectAll("*").remove();

    // Draw ticks and labels
    const xScale = d3.scaleLinear().domain([0, duration]).range([0, width]);
    const labelInterval = 2; // Show label every 2 seconds (adjust as needed)
    for (let sec = 0; sec <= duration; sec++) {
      const x = xScale(sec);
      const isLabeled = sec % labelInterval === 0;

      // Ticks go upward from the baseline
      svg
        .append("line")
        .attr("x1", x)
        .attr("y1", axisY)
        .attr("x2", x)
        .attr("y2", axisY - (isLabeled ? 20 : 10))
        .attr("stroke", "white")
        .attr("stroke-width", 1);

      // Labels above the baseline, centered
      if (isLabeled) {
        const minutes = Math.floor(sec / 60);
        const seconds = Math.floor(sec % 60);
        const label = `${minutes}:${seconds.toString().padStart(2, "0")}`;
        svg
          .append("text")
          .attr("x", x + 4) // 4px right of the tick for spacing
          .attr("y", axisY - 5) // just above the baseline, inside the box
          .attr("fill", "white")
          .attr("font-size", 14)
          .attr("text-anchor", "start") // left-aligned
          .text(label);
      }
    }

    // Draw horizontal baseline at the bottom
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
    time = Math.max(0, Math.min(duration, time)); // Clamp to [0, duration]
    setCurrentTime(time);

    // Seek all wavesurfer instances
    waveSurfers.forEach(ws => {
      if (ws && ws.seekTo) {
        ws.seekTo(time / ws.getDuration());
      }
    });

    // If audio is playing, start playback from new position
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

  return (
    <div style={{ padding: "20px", color: "white", background: "transparent" }}>
      <h2 style={{ color: "white" }}>🎵 Music Timeline Demo</h2>
      <div
        ref={timelineContainerRef}
        style={{ position: "relative", cursor: "pointer" }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <svg
          ref={svgRef}
          width="100%"
          height={100}
          style={{ color: "white", width: "100%" }}
        ></svg>

        {tracks.map((track) => (
          <TimelineTrack
            key={track.id}
            url={track.url}
            color={track.color}
            onReady={(ws) => {
              handleReady(ws, track.url);
              setWaveSurfers((prev) => [...prev, ws]);
              const dur = ws.getDuration();
              setAudioDuration((prev) => Math.max(prev, dur));
            }}
          />
        ))}

        {/* Playhead Element */}
        <div
          style={{
            position: "absolute",
            left: `${(currentTime / audioDuration) * 100}%`,
            top: 40,
            bottom: 0,
            width: "2px",
            pointerEvents: "none",
            zIndex: 10,
          }}
        >
          {/* Handle */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: "-8px",
              width: "18px",
              height: "18px",
              background: "#AD00FF",
              borderRadius: "3px",
              border: "1px solid #fff",
            }}
          ></div>
          {/* Line */}
          <div
            style={{
              position: "absolute",
              top: "18px",
              left: 0,
              bottom: 0,
              width: "2px",
              background: "#AD00FF",
            }}
          ></div>
        </div>
      </div>
      <button
        onClick={handlePlayPause}
        style={{
          marginTop: "20px",
          color: "white",
          background: "#333",
          border: "none",
          padding: "10px 20px",
          borderRadius: "6px",
        }}
      >
        {isPlaying ? "⏸️ Pause" : "▶️ Play All"}
      </button>
    </div>
  );
};

export default Timeline;
