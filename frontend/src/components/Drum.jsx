import React, { useState, useRef, useCallback, useEffect } from 'react';

const DrumPadMachine = () => {
  const [currentMachine, setCurrentMachine] = useState(0);
  const [activePads, setActivePads] = useState(new Set());
  const [displayDescription, setDisplayDescription] = useState('Press a key or click a pad!');
  const [volume, setVolume] = useState(0.7);
  const [isRecording, setIsRecording] = useState(false);
  const [sequence, setSequence] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioContextRef = useRef(null);

  const descriptions = {
    Q: 'Chant: Hey!', '1': 'Clap', '3': 'Crash',
    G: 'Closed hi-hat', E: 'Open hi-hat', '8': 'Percussion',
    D: 'Snare', A: 'Kick one', U: 'Kick two',
    X: 'Tom', T: 'Ride', '7': 'Cymbal',
    Y: 'Clap', H: 'Shaker', J: 'Cowbell', K: 'Wood block'
  };

  // Initialize Web Audio API
  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    return audioContextRef.current;
  }, []);

  const machines = [
    {
      name: "Machines Two",
      color: '#6b21a8',
      pads: [
        { id: 'Q', label: 'Q', freq: 80, type: 'sine', duration: 0.3, filter: 160 },
        { id: '1', label: '1', freq: 200, type: 'square', duration: 0.1, filter: 400 },
        { id: '3', label: '3', freq: 300, type: 'sawtooth', duration: 0.5, filter: 600 },
        { id: 'G', label: 'G', freq: 800, type: 'square', duration: 0.05, filter: 1600 },
        { id: 'E', label: 'E', freq: 600, type: 'square', duration: 0.15, filter: 1200 },
        { id: '8', label: '8', freq: 150, type: 'triangle', duration: 0.2, filter: 300 },
        { id: 'D', label: 'D', freq: 120, type: 'square', duration: 0.1, filter: 240 },
        { id: 'A', label: 'A', freq: 60, type: 'sine', duration: 0.2, filter: 120 },
        { id: 'U', label: 'U', freq: 50, type: 'sine', duration: 0.25, filter: 100 },
        { id: 'X', label: 'X', freq: 90, type: 'triangle', duration: 0.15, filter: 180 },
        { id: 'T', label: 'T', freq: 250, type: 'sawtooth', duration: 0.4, filter: 500 },
        { id: '7', label: '7', freq: 400, type: 'sawtooth', duration: 0.6, filter: 800 },
        { id: 'Y', label: 'Y', freq: 180, type: 'square', duration: 0.08, filter: 360 },
        { id: 'H', label: 'H', freq: 1000, type: 'square', duration: 0.03, filter: 2000 },
        { id: 'J', label: 'J', freq: 300, type: 'triangle', duration: 0.12, filter: 600 },
        { id: 'K', label: 'K', freq: 220, type: 'triangle', duration: 0.1, filter: 440 }
      ]
    },
    {
      name: "Machines Angio",
      color: '#7c3aed',
      pads: [
        { id: 'Q', label: 'Q', freq: 110, type: 'sawtooth', duration: 0.4, filter: 220 },
        { id: '1', label: '1', freq: 400, type: 'square', duration: 0.08, filter: 800 },
        { id: '3', label: '3', freq: 500, type: 'sawtooth', duration: 0.6, filter: 1000 },
        { id: 'G', label: 'G', freq: 1200, type: 'square', duration: 0.03, filter: 2400 },
        { id: 'E', label: 'E', freq: 900, type: 'square', duration: 0.12, filter: 1800 },
        { id: '8', label: '8', freq: 800, type: 'sawtooth', duration: 0.15, filter: 5000 },
        { id: 'D', label: 'D', freq: 180, type: 'sawtooth', duration: 0.08, filter: 360 },
        { id: 'A', label: 'A', freq: 45, type: 'square', duration: 0.3, filter: 90 },
        { id: 'U', label: 'U', freq: 35, type: 'square', duration: 0.35, filter: 70 },
        { id: 'X', label: 'X', freq: 160, type: 'sawtooth', duration: 0.2, filter: 320 },
        { id: 'T', label: 'T', freq: 380, type: 'sawtooth', duration: 0.5, filter: 760 },
        { id: '7', label: '7', freq: 600, type: 'sawtooth', duration: 0.7, filter: 1200 },
        { id: 'Y', label: 'Y', freq: 280, type: 'square', duration: 0.06, filter: 560 },
        { id: 'H', label: 'H', freq: 1400, type: 'square', duration: 0.02, filter: 2800 },
        { id: 'J', label: 'J', freq: 450, type: 'triangle', duration: 0.1, filter: 900 },
        { id: 'K', label: 'K', freq: 320, type: 'triangle', duration: 0.08, filter: 640 }
      ]
    },
    {
      name: "Machines Bass",
      color: '#f59e0b',
      pads: [
        { id: 'Q', label: 'Q', freq: 90, type: 'triangle', duration: 0.35, filter: 180 },
        { id: '1', label: '1', freq: 150, type: 'triangle', duration: 0.12, filter: 300 },
        { id: '3', label: '3', freq: 250, type: 'triangle', duration: 0.7, filter: 500 },
        { id: 'G', label: 'G', freq: 600, type: 'triangle', duration: 0.06, filter: 1200 },
        { id: 'E', label: 'E', freq: 450, type: 'triangle', duration: 0.18, filter: 900 },
        { id: '8', label: '8', freq: 120, type: 'sine', duration: 0.25, filter: 240 },
        { id: 'D', label: 'D', freq: 100, type: 'triangle', duration: 0.12, filter: 200 },
        { id: 'A', label: 'A', freq: 70, type: 'triangle', duration: 0.25, filter: 140 },
        { id: 'U', label: 'U', freq: 55, type: 'triangle', duration: 0.3, filter: 110 },
        { id: 'X', label: 'X', freq: 80, type: 'sine', duration: 0.18, filter: 160 },
        { id: 'T', label: 'T', freq: 200, type: 'triangle', duration: 0.35, filter: 400 },
        { id: '7', label: '7', freq: 350, type: 'triangle', duration: 0.5, filter: 700 },
        { id: 'Y', label: 'Y', freq: 140, type: 'triangle', duration: 0.1, filter: 280 },
        { id: 'H', label: 'H', freq: 700, type: 'triangle', duration: 0.04, filter: 1400 },
        { id: 'J', label: 'J', freq: 260, type: 'sine', duration: 0.15, filter: 520 },
        { id: 'K', label: 'K', freq: 190, type: 'sine', duration: 0.12, filter: 380 }
      ]
    }
  ];

  const playSound = useCallback((pad) => {
    try {
      const audioContext = getAudioContext();
      
      // Resume context if suspended
      if (audioContext.state === 'suspended') {
        audioContext.resume();
      }

      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      const filter = audioContext.createBiquadFilter();

      oscillator.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.setValueAtTime(pad.freq, audioContext.currentTime);
      oscillator.type = pad.type;

      filter.frequency.setValueAtTime(pad.filter, audioContext.currentTime);
      filter.Q.setValueAtTime(1, audioContext.currentTime);

      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(volume, audioContext.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + pad.duration);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + pad.duration);

      // Visual feedback
      setActivePads(prev => new Set([...prev, pad.id]));
      setTimeout(() => {
        setActivePads(prev => {
          const newSet = new Set(prev);
          newSet.delete(pad.id);
          return newSet;
        });
      }, 200);

      setDisplayDescription(`${descriptions[pad.id] || 'Drum Pad'} - ${machines[currentMachine].name}`);

      if (isRecording) {
        setSequence(prev => [...prev, { key: pad.id, time: Date.now(), machine: currentMachine }]);
      }
    } catch (error) {
      console.error('Error playing sound:', error);
      setDisplayDescription('Audio not available');
    }
  }, [getAudioContext, volume, descriptions, machines, currentMachine, isRecording]);

  // Keyboard handling
  useEffect(() => {
    const handleKeyDown = (event) => {
      const keyMap = {
        81: 'Q', 49: '1', 51: '3', 71: 'G', 69: 'E', 56: '8',
        68: 'D', 65: 'A', 85: 'U', 88: 'X', 84: 'T', 55: '7',
        89: 'Y', 72: 'H', 74: 'J', 75: 'K'
      };    

      if (keyMap[event.keyCode]) {
        event.preventDefault();
        const currentPads = machines[currentMachine].pads;
        const pad = currentPads.find(p => p.id === keyMap[event.keyCode]);
        if (pad) {
          playSound(pad);
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [currentMachine, machines, playSound]);

  const toggleRecording = () => {
    if (isRecording) {
      setIsRecording(false);
      setDisplayDescription('Recording stopped');
    } else {
      setSequence([]);
      setIsRecording(true);
      setDisplayDescription('Recording started...');
    }
  };

  const playSequence = async () => {
    if (sequence.length === 0) return;

    setIsPlaying(true);
    setDisplayDescription('Playing sequence...');

    const startTime = sequence[0].time;
    const originalMachine = currentMachine;

    for (let i = 0; i < sequence.length; i++) {
      const note = sequence[i];
      const delay = note.time - startTime;

      setTimeout(() => {
        if (note.machine !== undefined && note.machine !== currentMachine) {
          setCurrentMachine(note.machine);
        }

        const currentPads = machines[note.machine || currentMachine].pads;
        const pad = currentPads.find(p => p.id === note.key);
        if (pad) {
          playSound(pad);
        }

        if (i === sequence.length - 1) {
          setIsPlaying(false);
          setDisplayDescription('Sequence finished');
          setCurrentMachine(originalMachine);
        }
      }, delay / 4);
    }
  };

  const clearSequence = () => {
    setSequence([]);
    setDisplayDescription('Sequence cleared');
  };

  const currentMachineData = machines[currentMachine];

  // Enhanced Pad Button Component for Grid Layout
  const PadButton = ({ pad, index, isActive, onClick }) => {
    const description = descriptions[pad.id] || 'Drum Pad';
    
    return (
      <button
        className={`w-24 h-24 rounded-xl border-2 flex flex-col items-center justify-center font-bold transition-all duration-200 transform group ${
          isActive 
            ? 'border-white bg-gradient-to-br from-white to-gray-200 text-gray-900 scale-105 shadow-2xl' 
            : 'border-purple-300/60 bg-gradient-to-br from-gray-700/80 to-gray-800/90 text-white hover:border-purple-400 hover:bg-gradient-to-br hover:from-purple-700/40 hover:to-purple-800/60 hover:scale-102 shadow-lg backdrop-blur-sm'
        }`}
        style={{
          boxShadow: isActive 
            ? `0 0 25px ${currentMachineData.color}, 0 0 50px ${currentMachineData.color}44, 0 8px 32px rgba(0,0,0,0.4)` 
            : '0 4px 20px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)'
        }}
        onClick={onClick}
        onMouseDown={(e) => e.preventDefault()}
        title={description}
      >
        <div className={`text-3xl font-black ${isActive ? 'text-gray-800' : 'text-white group-hover:text-purple-200'}`}>
          {pad.label}
        </div>
        <div className={`text-xs font-medium mt-1 ${isActive ? 'text-gray-600' : 'text-gray-300 group-hover:text-purple-300'} truncate max-w-20 text-center leading-tight`}>
          {description.split(':')[0].split(' ')[0]}
        </div>
        
        {/* Pulse animation when active */}
        {isActive && (
          <div 
            className="absolute inset-0 rounded-xl animate-ping opacity-75"
            style={{
              border: `2px solid ${currentMachineData.color}`,
              backgroundColor: `${currentMachineData.color}22`
            }}
          />
        )}
        
        {/* Subtle inner highlight */}
        <div className={`absolute inset-0.5 rounded-lg ${
          isActive 
            ? 'bg-gradient-to-br from-white/20 to-transparent' 
            : 'bg-gradient-to-br from-white/5 to-transparent group-hover:from-white/10'
        }`} />
      </button>
    );
  };

  return (
    <div className="w-full h-screen bg-gray-900 text-white overflow-hidden">
      {/* Top Navigation */}
      <div className="flex justify-center items-center py-4 border-b border-gray-700">
        <div className="flex space-x-8">
          <button className="text-purple-400 border-b-2 border-purple-400 pb-1">
            Instrument
          </button>
          <button className="text-gray-400 hover:text-white">Patterns</button>
          <button className="text-gray-400 hover:text-white">Piano Roll</button>
          <button className="text-gray-400 hover:text-white">Effects</button>
        </div>
      </div>

      {/* Machine Selector and Controls */}
      <div className="flex justify-between items-center px-8 py-4">
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => setCurrentMachine((prev) => (prev - 1 + machines.length) % machines.length)}
            className="text-gray-400 hover:text-white text-xl"
          >
            ←
          </button>
          <div className="text-center">
            <div className="text-sm text-gray-400">⚙️</div>
            <div className="text-white font-medium">{currentMachineData.name}</div>
          </div>
          <button 
            onClick={() => setCurrentMachine((prev) => (prev + 1) % machines.length)}
            className="text-gray-400 hover:text-white text-xl"
          >
            →
          </button>
        </div>

        <div className="flex items-center space-x-6">
          <div className="text-center">
            <div className="w-12 h-12 rounded-full border border-gray-600 flex items-center justify-center">
              <div className="w-2 h-6 bg-gray-600 rounded"></div>
            </div>
            <div className="text-xs text-gray-400 mt-1">Reverb</div>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 rounded-full border border-gray-600 flex items-center justify-center">
              <div className="w-2 h-6 bg-gray-600 rounded"></div>
            </div>
            <div className="text-xs text-gray-400 mt-1">Pan</div>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 rounded-full border border-purple-400 flex items-center justify-center relative">
              <div 
                className="w-2 bg-purple-400 rounded"
                style={{ height: `${volume * 24}px` }}
              ></div>
            </div>
            <div className="text-xs text-gray-400 mt-1">Volume</div>
          </div>
          <button className="px-4 py-2 border border-gray-600 rounded text-sm hover:bg-gray-800">
            Save Preset...
          </button>
          <div className="text-right">
            <div className="text-xs text-gray-400">Auto-quantize</div>
            <select className="bg-gray-800 border border-gray-600 rounded px-2 py-1 text-sm">
              <option>Off</option>
              <option>1/4</option>
              <option>1/8</option>
              <option>1/16</option>
            </select>
          </div>
        </div>
      </div>

      {/* Display */}
      <div className="text-center py-4">
        <div className="bg-black/50 rounded-lg p-3 backdrop-blur-sm inline-block min-w-96">
          <p className="text-xl font-mono text-green-400">{displayDescription}</p>
        </div>
      </div>

      {/* Enhanced Drum Pad Area - Grid Layout */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div 
          className="p-8 rounded-2xl"
          style={{
            background: `linear-gradient(135deg, ${currentMachineData.color}22 0%, ${currentMachineData.color}44 50%, ${currentMachineData.color}33 100%)`,
            backdropFilter: 'blur(10px)',
            border: `1px solid ${currentMachineData.color}44`
          }}
        >
          {/* 3x3 Grid Layout - First 9 pads */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            {currentMachineData.pads.slice(0, 9).map((pad, index) => (
              <PadButton
                key={pad.id}
                pad={pad}
                index={index}
                isActive={activePads.has(pad.id)}
                onClick={() => playSound(pad)}
              />
            ))}
          </div>

          {/* Additional pads row if more than 9 pads */}
          {currentMachineData.pads.length > 9 && (
            <div className="grid grid-cols-4 gap-3 justify-items-center">
              {currentMachineData.pads.slice(9).map((pad, index) => (
                <PadButton
                  key={pad.id}
                  pad={pad}
                  index={index + 9}
                  isActive={activePads.has(pad.id)}
                  onClick={() => playSound(pad)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="bg-gray-800/95 backdrop-blur-sm p-4 border-t border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 max-w-6xl mx-auto">
          {/* Volume Control */}
          <div className="space-y-2">
            <label className="text-white font-semibold text-sm">Volume: {Math.round(volume * 100)}%</label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="w-full accent-purple-500"
            />
          </div>

          {/* Recording Controls */}
          <div className="space-y-2">
            <label className="text-white font-semibold text-sm">Recording</label>
            <div className="flex gap-2">
              <button
                onClick={toggleRecording}
                className={`px-3 py-1 rounded text-sm font-semibold transition-colors ${
                  isRecording
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'bg-green-600 hover:bg-green-700 text-white'
                }`}
              >
                {isRecording ? '⏹️ Stop' : '🔴 Rec'}
              </button>
              <button
                onClick={clearSequence}
                className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded text-sm font-semibold transition-colors disabled:opacity-50"
                disabled={sequence.length === 0}
              >
                🗑️ Clear
              </button>
            </div>
          </div>

          {/* Playback Controls */}
          <div className="space-y-2">
            <label className="text-white font-semibold text-sm">Playback</label>
            <div className="flex gap-2 items-center">
              <button
                onClick={playSequence}
                className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-semibold transition-colors disabled:opacity-50"
                disabled={sequence.length === 0 || isPlaying}
              >
                {isPlaying ? '⏸️ Playing...' : '▶️ Play'}
              </button>
              <span className="text-white text-xs">
                {sequence.length} beats
              </span>
            </div>
          </div>

          {/* Machine Info */}
          <div className="space-y-2">
            <label className="text-white font-semibold text-sm">Kit Info</label>
            <div className="text-xs text-gray-300">
              <div style={{ color: currentMachineData.color }}>● {currentMachineData.name}</div>
              <div>{currentMachineData.pads.length} pads</div>
            </div>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="text-center text-gray-400 text-xs py-2 border-t border-gray-700">
        Click pads or use keyboard (Q,1,3,G,E,8,D,A,U,X,T,7,Y,H,J,K) • Switch machines with ← → • Record sequences with machine changes
      </div>
    </div>
  );
};

export default DrumPadMachine;