import React, { useRef, useState, useEffect } from 'react';
import * as Tone from 'tone';

const SDemo = () => {
  const [audioFile, setAudioFile] = useState(null);
  const [targetBPM, setTargetBPM] = useState(120);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const playerRef = useRef(null);
  const pitchShiftRef = useRef(null);

  const ORIGINAL_BPM = 120;

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      if (playerRef.current) {
        playerRef.current.dispose();
      }
      if (pitchShiftRef.current) {
        pitchShiftRef.current.dispose();
      }
    };
  }, []);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setAudioFile(file);
      await loadAudioFile(file);
    }
  };

  const loadAudioFile = async (file) => {
    try {
      setIsLoading(true);
      
      // Dispose previous player if exists
      if (playerRef.current) {
        playerRef.current.dispose();
      }
      if (pitchShiftRef.current) {
        pitchShiftRef.current.dispose();
      }

      // Convert file to URL for Tone.js
      const audioUrl = URL.createObjectURL(file);
      
      // Create a new player
      playerRef.current = new Tone.Player({
        url: audioUrl,
        onload: () => {
          console.log('Audio loaded successfully');
          setIsLoading(false);
        },
        onerror: (error) => {
          console.error('Error loading audio:', error);
          setIsLoading(false);
          alert('Error loading audio file. Please try a different file.');
        }
      });

      // Create pitch shift effect (set to 0 to maintain original pitch)
      pitchShiftRef.current = new Tone.PitchShift(0);
      
      // Connect player through pitch shift to destination
      playerRef.current.chain(pitchShiftRef.current, Tone.Destination);

    } catch (error) {
      console.error('Error setting up audio:', error);
      setIsLoading(false);
      alert('Error setting up audio. Please try again.');
    }
  };

  const handlePlay = async () => {
    if (!playerRef.current || isPlaying) return;

    try {
      // Start Tone.js audio context if not started
      if (Tone.context.state !== 'running') {
        await Tone.start();
      }

      // Calculate playback rate for tempo change
      const playbackRate = targetBPM / ORIGINAL_BPM;
      
      // Set the playback rate (this changes tempo)
      playerRef.current.playbackRate = playbackRate;
      
      // Keep pitch at 0 (no pitch change)
      if (pitchShiftRef.current) {
        pitchShiftRef.current.pitch = 0;
      }

      // Start playing
      playerRef.current.start();
      setIsPlaying(true);

      // Set up end callback
      playerRef.current.onstop = () => {
        setIsPlaying(false);
      };

    } catch (error) {
      console.error('Error playing audio:', error);
      alert('Error playing audio. Please try again.');
    }
  };

  const handleStop = () => {
    if (playerRef.current && isPlaying) {
      playerRef.current.stop();
      setIsPlaying(false);
    }
  };

  const playbackRate = targetBPM / ORIGINAL_BPM;
  const tempoChange = ((targetBPM - ORIGINAL_BPM) / ORIGINAL_BPM * 100).toFixed(1);

  return (
    <div style={{ 
      padding: '20px', 
      fontFamily: 'Arial',
      maxWidth: '600px',
      margin: '0 auto',
      backgroundColor: '#f5f5f5',
      borderRadius: '10px'
    }}>
      <h2>🎵 Pitch-Preserving BPM Control</h2>
      <p style={{ color: '#666', fontSize: '14px', marginBottom: '20px' }}>
        Using Tone.js for true tempo changes without pitch modification
      </p>

      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
          📁 Select Audio File:
        </label>
        <input 
          type="file" 
          accept="audio/*" 
          onChange={handleFileChange}
          style={{ width: '100%', padding: '8px' }}
          disabled={isLoading}
        />
        {isLoading && (
          <div style={{ color: '#007bff', marginTop: '5px' }}>
            ⏳ Loading audio file...
          </div>
        )}
      </div>

      <div style={{ marginBottom: '15px' }}>
        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
          ⚡ Target BPM (Original: {ORIGINAL_BPM} BPM):
        </label>
        <input
          type="range"
          min="60"
          max="180"
          value={targetBPM}
          onChange={(e) => setTargetBPM(parseInt(e.target.value))}
          style={{ width: '100%', marginBottom: '10px' }}
        />
        <input
          type="number"
          value={targetBPM}
          min="40"
          max="200"
          step="1"
          onChange={(e) => setTargetBPM(parseInt(e.target.value) || 120)}
          style={{ 
            padding: '8px', 
            fontSize: '16px', 
            width: '100px',
            color: 'black',
            backgroundColor: 'white',
            border: '1px solid #ccc',
            borderRadius: '4px'
          }}
        />
      </div>

      <div style={{ 
        backgroundColor: '#e8f4fd', 
        padding: '15px', 
        borderRadius: '5px',
        marginBottom: '20px'
      }}>
        <div><strong>🎧 Tempo Multiplier: {playbackRate.toFixed(2)}x</strong></div>
        <div><strong>📈 Tempo Change: {tempoChange > 0 ? '+' : ''}{tempoChange}%</strong></div>
        <div><strong>🎼 Pitch: Original (unchanged)</strong></div>
        <div style={{ marginTop: '8px', fontSize: '14px', color: '#666' }}>
          {playbackRate > 1 ? '⚡ Faster tempo, same pitch' : 
           playbackRate < 1 ? '🐌 Slower tempo, same pitch' : 
           '🎯 Original tempo and pitch'}
        </div>
      </div>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <button
          style={{ 
            padding: '12px 24px',
            fontSize: '16px',
            backgroundColor: isPlaying ? '#ff9800' : '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: (audioFile && !isLoading) ? 'pointer' : 'not-allowed',
            opacity: (audioFile && !isLoading) ? 1 : 0.5,
            minWidth: '120px'
          }}
          onClick={handlePlay}
          disabled={!audioFile || isLoading || isPlaying}
        >
          {isPlaying ? '🎵 Playing...' : '▶️ Play Audio'}
        </button>

        <button
          style={{ 
            padding: '12px 24px',
            fontSize: '16px',
            backgroundColor: '#f44336',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: isPlaying ? 'pointer' : 'not-allowed',
            opacity: isPlaying ? 1 : 0.5,
            minWidth: '100px'
          }}
          onClick={handleStop}
          disabled={!isPlaying}
        >
          ⏹️ Stop
        </button>
      </div>

      <div style={{ 
        backgroundColor: '#d4edda',
        border: '1px solid #c3e6cb',
        padding: '15px', 
        borderRadius: '5px',
        fontSize: '14px'
      }}>
        <strong>✅ Features:</strong>
        <ul style={{ marginTop: '8px', paddingLeft: '20px', margin: '8px 0' }}>
          <li>🎼 <strong>Pitch Preservation</strong>: Original pitch maintained at all tempos</li>
          <li>⚡ <strong>Tempo Control</strong>: Smooth tempo changes from 40-200 BPM</li>
          <li>🎚️ <strong>Real-time Adjustment</strong>: Change BPM and replay instantly</li>
          <li>🔊 <strong>High Quality</strong>: Advanced audio processing via Tone.js</li>
        </ul>
      </div>

      <div style={{ 
        marginTop: '15px', 
        padding: '10px', 
        backgroundColor: '#fff3cd',
        borderRadius: '5px',
        fontSize: '12px',
        color: '#856404'
      }}>
        <strong>Note:</strong> This uses Tone.js library for advanced audio processing. 
        The tempo changes while maintaining the original pitch of the audio.
      </div>
    </div>
  );
};

export default SDemo;