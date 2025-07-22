import React, { useEffect, useRef, useState } from 'react';
import WaveSurfer from 'wavesurfer.js';
import { Player, start } from 'tone';
import * as d3 from 'd3';

const TimelineTrack = ({ url, onReady, zoom }) => {
  const waveformRef = useRef(null);
  const wavesurfer = useRef(null);

  useEffect(() => {
    if (!waveformRef.current) return;

    wavesurfer.current = WaveSurfer.create({
      container: waveformRef.current,
      waveColor: '#999',
      progressColor: '#555',
      height: 80,
      barWidth: 2,
      responsive: true,
      minPxPerSec: zoom
    });

    wavesurfer.current.load(url);
    wavesurfer.current.on('ready', () => {
      onReady(wavesurfer.current);
    });

    return () => wavesurfer.current.destroy();
  }, [url, zoom]);

  return <div ref={waveformRef} />;
};

const Timeline = () => {
  const [players, setPlayers] = useState([]);
  const [waveSurfers, setWaveSurfers] = useState([]);
  const [zoom, setZoom] = useState(50); // default zoom level
  const [audioDuration, setAudioDuration] = useState(10); // default, will update after load
  const svgRef = useRef(null);

  const tracks = [
    // { id: 1, url: require('../Audio/simple1.mp3') },
    { id: 2, url: require('../Audio/simple2.mp3') },
  ];

  const handleReady = (wavesurfer, url) => {
    fetch(url)
      .then(res => res.arrayBuffer())
      .then(arrayBuffer => {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        return audioContext.decodeAudioData(arrayBuffer);
      })
      .then(audioBuffer => {
        const player = new Player(audioBuffer).toDestination();
        setPlayers(prev => [...prev, player]);
      });
  };

  const handlePlay = async () => {
    await start();
    players.forEach((player) => {
      player.start();
    });
  };

  const handleRulerClick = (event) => {
    const svgRect = svgRef.current.getBoundingClientRect();
    const x = event.clientX - svgRect.left;
    const width = svgRect.width;
    const duration = audioDuration;
    const time = (x / width) * duration;

    waveSurfers.forEach(ws => {
      if (ws && ws.seekTo) {
        ws.seekTo(time / ws.getDuration());
      }
    });
  };

  const renderRuler = (zoomLevel) => {
    const svg = d3.select(svgRef.current);
    const svgNode = svgRef.current;
    const width = svgNode ? svgNode.clientWidth : 600;
    const axisY = 35;
    const duration = audioDuration;

    let tickInterval;
    if (zoomLevel > 100) tickInterval = 0.1; // Show milliseconds
    else if (zoomLevel > 50) tickInterval = 0.5;
    else tickInterval = 1; // Show seconds

    const xScale = d3.scaleLinear().domain([0, duration]).range([0, width]);
    const axis = d3.axisBottom(xScale)
      .ticks(duration / tickInterval)
      .tickFormat((d) => tickInterval < 1 ? `${(d * 1000).toFixed(0)}ms` : `${d}s`);

    svg.selectAll('*').remove();
    svg.append('g')
      .attr('transform', `translate(0, ${axisY})`)
      .call(axis)
      .selectAll('text')
      .attr('fill', 'white');

    svg.selectAll('path, line')
      .attr('stroke', 'white');
  };

  useEffect(() => {
    renderRuler(zoom);
  }, [zoom, audioDuration]);

  return (
    <div style={{ padding: '20px', color: 'white', background: 'transparent' }}>
      <h2 style={{ color: 'white' }}>🎵 Music Timeline Demo</h2>
      <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
        <button onClick={() => setZoom(zoom + 20)} style={{ background: '#444', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px' }}>🔍 Zoom In</button>
        <button onClick={() => setZoom(zoom > 20 ? zoom - 20 : zoom)} style={{ background: '#444', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px' }}>🔎 Zoom Out</button>
      </div>
      <svg
        ref={svgRef}
        width="100%"
        height={100}
        style={{ color: 'white', cursor: 'pointer', width: '100%' }}
        onClick={handleRulerClick}
      ></svg>
      {tracks.map((track) => (
        <TimelineTrack
          key={track.id}
          url={track.url}
          zoom={zoom}
          onReady={(ws) => {
            handleReady(ws, track.url);
            setWaveSurfers(prev => [...prev, ws]);
            // Update duration if this track is longer
            const dur = ws.getDuration();
            setAudioDuration(prev => Math.max(prev, dur));
          }}
        />
      ))}
      <button onClick={handlePlay} style={{ marginTop: '20px', color: 'white', background: '#333', border: 'none', padding: '10px 20px', borderRadius: '6px' }}>
        ▶️ Play All
      </button>
    </div>
  );
};

export default Timeline;
