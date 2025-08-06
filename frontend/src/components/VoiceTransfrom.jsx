import React, { useRef, useState } from 'react';

export default function VoiceTransform() {
  const [audioUrl, setAudioUrl] = useState(null);
  const [selectedTransform, setSelectedTransform] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const audioBufferRef = useRef(null);
  const audioContextRef = useRef(null);
  const sourceRef = useRef(null);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    setAudioUrl(url);

    try {
      const arrayBuffer = await fetch(url).then(res => res.arrayBuffer());
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const buffer = await audioContext.decodeAudioData(arrayBuffer);
      audioBufferRef.current = buffer;
      audioContextRef.current = audioContext;
    } catch (error) {
      console.error('Error loading audio file:', error);
    }
  };

  const applyTransform = (buffer, pitchRatio, tempoRatio) => {
    const sampleRate = buffer.sampleRate;
    const numChannels = buffer.numberOfChannels;
    const originalLength = buffer.length;
    
    // Calculate new length based on tempo
    const newLength = Math.floor(originalLength / tempoRatio);
    
    const transformedBuffer = audioContextRef.current.createBuffer(
      numChannels,
      newLength,
      sampleRate
    );

    for (let channel = 0; channel < numChannels; channel++) {
      const originalData = buffer.getChannelData(channel);
      const transformedData = transformedBuffer.getChannelData(channel);
      
      // Simple linear interpolation for pitch and tempo
      for (let i = 0; i < newLength; i++) {
        const originalIndex = i * tempoRatio;
        const pitchIndex = originalIndex * pitchRatio;
        
        if (pitchIndex < originalLength - 1) {
          const index1 = Math.floor(pitchIndex);
          const index2 = Math.min(index1 + 1, originalLength - 1);
          const fraction = pitchIndex - index1;
          
          transformedData[i] = originalData[index1] * (1 - fraction) + originalData[index2] * fraction;
        } else {
          transformedData[i] = 0;
        }
      }
    }

    return transformedBuffer;
  };

  const handlePlay = async () => {
    if (!audioBufferRef.current || !selectedTransform || !audioContextRef.current) return;

    // Stop any currently playing audio
    if (sourceRef.current) {
      sourceRef.current.stop();
    }

    try {
      const originalBuffer = audioBufferRef.current;
      let pitchRatio = 1.0;
      let tempoRatio = 1.0;

      // Transform mapping
      switch (selectedTransform) {
        case '+fifth':
          pitchRatio = Math.pow(2, 7 / 12); break;
        case '+1octave':
          pitchRatio = 2.0; break;
        case '+2octave':
          pitchRatio = 4.0; break;
        case '-fourth':
          pitchRatio = Math.pow(2, -5 / 12); break;
        case '-1octave':
          pitchRatio = 0.5; break;
        case '-2octave':
          pitchRatio = 0.25; break;
        case 'darker':
          pitchRatio = 0.9; tempoRatio = 0.9; break;
        case 'verydark':
          pitchRatio = 0.8; tempoRatio = 0.8; break;
        case 'brighter':
          pitchRatio = 1.1; tempoRatio = 1.1; break;
        case 'verybright':
          pitchRatio = 1.3; tempoRatio = 1.3; break;
        case 'baby':
          pitchRatio = 1.8; tempoRatio = 1.2; break;    
        case 'robot':
          pitchRatio = 1.0; tempoRatio = 1.0; break;
        case 'alien':
          pitchRatio = 0.6; tempoRatio = 0.9; break;
        default:
          pitchRatio = 1.0; tempoRatio = 1.0;
      }

      // Apply transform
      const transformedBuffer = applyTransform(originalBuffer, pitchRatio, tempoRatio);

      // Resume audio context if suspended
      if (audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume();
      }

      // Create and play the transformed audio
      const source = audioContextRef.current.createBufferSource();
      source.buffer = transformedBuffer;
      source.connect(audioContextRef.current.destination);
      
      source.onended = () => {
        setIsPlaying(false);
        sourceRef.current = null;
      };

      sourceRef.current = source;
      source.start(0);
      setIsPlaying(true);

    } catch (error) {
      console.error('Error playing transformed audio:', error);
    }
  };

  const handleStop = () => {
    if (sourceRef.current) {
      sourceRef.current.stop();
      sourceRef.current = null;
    }
    setIsPlaying(false);
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>🎙 Voice Transform (Fixed Version)</h2>

      <input type="file" accept="audio/*" onChange={handleFileChange} />
      <br /><br />

      <select
        value={selectedTransform}
        onChange={(e) => setSelectedTransform(e.target.value)}
      >
        <option value="">-- Select Voice Transform --</option>
        <optgroup label="Pitch Shifts">
          <option value="+fifth">+ Fifth</option>
          <option value="+1octave">+1 Octave</option>
          <option value="+2octave">+2 Octaves</option>
          <option value="-fourth">- Fourth</option>
          <option value="-1octave">-1 Octave</option>
          <option value="-2octave">-2 Octaves</option>
        </optgroup>
        <optgroup label="Character">
          <option value="darker">A little darker</option>
          <option value="verydark">Very dark</option>
          <option value="brighter">A little brighter</option>
          <option value="verybright">Very bright</option>
          <option value="baby">Baby</option>
          <option value="robot">Robot</option>
          <option value="alien">Alien</option>
        </optgroup>
      </select>

      <br /><br />
      <div style={{ display: 'flex', gap: '10px' }}>
        <button 
          onClick={handlePlay} 
          disabled={!audioUrl || !selectedTransform}
          style={{ 
            padding: '10px 20px', 
            backgroundColor: (!audioUrl || !selectedTransform) ? '#ccc' : '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: (!audioUrl || !selectedTransform) ? 'not-allowed' : 'pointer'
          }}
        >
          {isPlaying ? 'Playing...' : '▶ Play with Transform'}
        </button>
        
        {isPlaying && (
          <button 
            onClick={handleStop}
            style={{ 
              padding: '10px 20px', 
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            ⏹ Stop
          </button>
        )}
      </div>

      {audioUrl && (
        <div style={{ marginTop: '10px', color: '#28a745' }}>
          ✓ Audio file loaded successfully
        </div>
      )}
      
      {selectedTransform && (
        <div style={{ marginTop: '5px', color: '#28a745' }}>
          ✓ Transform selected: {selectedTransform}
        </div>
      )}
    </div>
  );
}
