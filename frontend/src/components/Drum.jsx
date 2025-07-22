import React, { useState, useRef, useCallback, useEffect } from 'react';

const DrumPadMachine = () => {
  const [currentMachine, setCurrentMachine] = useState(0);
  const [activePads, setActivePads] = useState(new Set());
  const [displayDescription, setDisplayDescription] = useState('Press a key or click a pad!');
  const [volume, setVolume] = useState(0.7);
  const [pan, setPan] = useState(0); // -1 to 1 (left to right)
  const [reverb, setReverb] = useState(0.2); // 0 to 1 (dry to wet)
  const [isRecording, setIsRecording] = useState(false);
  const [sequence, setSequence] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioBuffers, setAudioBuffers] = useState({});
  const [loadingStatus, setLoadingStatus] = useState({});
  const [selectedPad, setSelectedPad] = useState(null); // For individual pad effects
  const [padEffects, setPadEffects] = useState({}); // Store effects for each pad
  const audioContextRef = useRef(null);
  const reverbBufferRef = useRef(null);

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

  // Create reverb impulse response
  const createReverbBuffer = useCallback(() => {
    if (reverbBufferRef.current) return reverbBufferRef.current;
    
    const audioContext = getAudioContext();
    const length = audioContext.sampleRate * 2; // 2 second reverb
    const buffer = audioContext.createBuffer(2, length, audioContext.sampleRate);
    
    for (let channel = 0; channel < 2; channel++) {
      const channelData = buffer.getChannelData(channel);
      for (let i = 0; i < length; i++) {
        const decay = Math.pow(1 - i / length, 2);
        channelData[i] = (Math.random() * 2 - 1) * decay;
      }
    }
    
    reverbBufferRef.current = buffer;
    return buffer;
  }, [getAudioContext]);

  const machines = [
    {
      name: "Trap Kit",
      type:"Machine",
      color: '#7c3aed',
      pads: [
        { id: 'Q', label: 'Q', audioUrl: '/Audio/Tasty/q.mp3' },
        { id: '1', label: '1', audioUrl: '/Audio/Tasty/1.mp3' },
        { id: 'E', label: 'E', audioUrl: '/Audio/Tasty/e.mp3' },
        { id: '8', label: '8', audioUrl: '/Audio/Tasty/8.mp3' },
        { id: 'D', label: 'D', audioUrl: '/Audio/Tasty/d.mp3' },
        { id: 'O', label: 'O', audioUrl: '/Audio/Tasty/o.mp3' },
        { id: 'A', label: 'A', audioUrl: '/Audio/Tasty/a.mp3' },
        { id: 'U', label: 'U', audioUrl: '/Audio/Tasty/u.mp3' },
        { id: 'X', label: 'X', audioUrl: '/Audio/Tasty/x.mp3' },
        { id: 'T', label: 'T', audioUrl: '/Audio/Tasty/t.mp3' },
        { id: 'J', label: 'J', audioUrl: '/Audio/Tasty/j.mp3' },
      ]
    }
  ];

  // Load audio from URL
  const loadAudioFromUrl = useCallback(async (audioUrl, padId, machineIndex) => {
    try {
      const bufferKey = `${machineIndex}-${padId}`;
      setLoadingStatus(prev => ({
        ...prev,
        [bufferKey]: 'loading'
      }));

      const audioContext = getAudioContext();
      const response = await fetch(audioUrl);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      
      setAudioBuffers(prev => ({
        ...prev,
        [bufferKey]: audioBuffer
      }));
      
      setLoadingStatus(prev => ({
        ...prev,
        [bufferKey]: 'loaded'
      }));
      
      return audioBuffer;
    } catch (error) {
      console.error('Error loading audio from URL:', error);
      const bufferKey = `${machineIndex}-${padId}`;
      setLoadingStatus(prev => ({
        ...prev,
        [bufferKey]: 'error'
      }));
      return null;
    }
  }, [getAudioContext]);

  // Play sound with effects
  const playSound = useCallback((pad) => {
    try {
      const audioContext = getAudioContext();
      
      // Resume context if suspended
      if (audioContext.state === 'suspended') {
        audioContext.resume();
      }

      const bufferKey = `${currentMachine}-${pad.id}`;
      const audioBuffer = audioBuffers[bufferKey];

      if (audioBuffer) {
        // Get pad-specific effects or use global settings
        const padEffect = padEffects[pad.id] || {};
        const effectiveVolume = padEffect.volume !== undefined ? padEffect.volume : volume;
        const effectivePan = padEffect.pan !== undefined ? padEffect.pan : pan;
        const effectiveReverb = padEffect.reverb !== undefined ? padEffect.reverb : reverb;

        // Create audio nodes
        const source = audioContext.createBufferSource();
        const gainNode = audioContext.createGain();
        const panNode = audioContext.createStereoPanner();
        const dryGainNode = audioContext.createGain();
        const wetGainNode = audioContext.createGain();
        const convolver = audioContext.createConvolver();

        // Set up reverb
        convolver.buffer = createReverbBuffer();
        
        // Set up source
        source.buffer = audioBuffer;
        
        // Set up gain (volume)
        gainNode.gain.setValueAtTime(effectiveVolume, audioContext.currentTime);
        
        // Set up pan (-1 = left, 1 = right)
        panNode.pan.setValueAtTime(effectivePan, audioContext.currentTime);
        
        // Set up reverb mix
        dryGainNode.gain.setValueAtTime(1 - effectiveReverb, audioContext.currentTime);
        wetGainNode.gain.setValueAtTime(effectiveReverb, audioContext.currentTime);

        // Connect nodes: Source -> Gain -> Pan -> Split to Dry/Wet
        source.connect(gainNode);
        gainNode.connect(panNode);
        
        // Dry path
        panNode.connect(dryGainNode);
        dryGainNode.connect(audioContext.destination);
        
        // Wet path (reverb)
        panNode.connect(convolver);
        convolver.connect(wetGainNode);
        wetGainNode.connect(audioContext.destination);

        source.start(audioContext.currentTime);

        // Visual feedback
        setActivePads(prev => new Set([...prev, pad.id]));
        setTimeout(() => {
          setActivePads(prev => {
            const newSet = new Set(prev);
            newSet.delete(pad.id);
            return newSet;
          });
        }, 200);

        const effectsText = padEffect.volume !== undefined || padEffect.pan !== undefined || padEffect.reverb !== undefined 
          ? ' (Custom)' : '';
        setDisplayDescription(`${descriptions[pad.id] || 'Drum Pad'} - ${machines[currentMachine].name}${effectsText}`);

        if (isRecording) {
          setSequence(prev => [...prev, { 
            key: pad.id, 
            time: Date.now(), 
            machine: currentMachine,
            effects: { ...padEffect }
          }]);
        }
      } else {
        setDisplayDescription(`${descriptions[pad.id] || 'Drum Pad'} - Loading audio...`);
      }
    } catch (error) {
      console.error('Error playing sound:', error);
      setDisplayDescription('Audio not available');
    }
  }, [getAudioContext, volume, pan, reverb, descriptions, machines, currentMachine, isRecording, audioBuffers, padEffects, createReverbBuffer]);

  // Load initial audio files on component mount and machine change
  useEffect(() => {
    const currentMachineData = machines[currentMachine];
    
    currentMachineData.pads.forEach((pad) => {
      if (pad.audioUrl) {
        const bufferKey = `${currentMachine}-${pad.id}`;
        if (!audioBuffers[bufferKey] && !loadingStatus[bufferKey]) {
          loadAudioFromUrl(pad.audioUrl, pad.id, currentMachine);
        }
      }
    });
  }, [currentMachine, machines, loadAudioFromUrl, audioBuffers, loadingStatus]);

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

        // Temporarily apply recorded effects
        if (note.effects) {
          setPadEffects(prev => ({
            ...prev,
            [note.key]: note.effects
          }));
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

  // Update pad-specific effects
  const updatePadEffect = (padId, effectType, value) => {
    setPadEffects(prev => ({
      ...prev,
      [padId]: {
        ...prev[padId],
        [effectType]: value
      }
    }));
  };

  // Clear pad-specific effects
  const clearPadEffects = (padId) => {
    setPadEffects(prev => {
      const newEffects = { ...prev };
      delete newEffects[padId];
      return newEffects;
    });
  };

  const currentMachineData = machines[currentMachine];

  // Clean Pad Button Component
  const PadButton = ({ pad, index, isActive, onClick }) => {
    const description = descriptions[pad.id] || 'Drum Pad';
    const bufferKey = `${currentMachine}-${pad.id}`;
    const hasAudioFile = audioBuffers[bufferKey];
    const loadingState = loadingStatus[bufferKey];
    const hasCustomEffects = padEffects[pad.id];
    
    return (
      <button
        className={`w-24 h-24 rounded-xl border-2 flex flex-col items-center justify-center font-bold transition-all duration-200 transform group relative ${
          isActive 
            ? 'border-white bg-gradient-to-br from-white to-gray-200 text-gray-900 scale-105 shadow-2xl' 
            : selectedPad === pad.id
            ? 'border-yellow-400 bg-gradient-to-br from-yellow-700/40 to-yellow-800/60 text-white hover:border-yellow-300 hover:scale-102 shadow-lg backdrop-blur-sm'
            : 'border-purple-300/60 bg-gradient-to-br from-gray-700/80 to-gray-800/90 text-white hover:border-purple-400 hover:bg-gradient-to-br hover:from-purple-700/40 hover:to-purple-800/60 hover:scale-102 shadow-lg backdrop-blur-sm'
        }`}
        style={{
          boxShadow: isActive 
            ? `0 0 25px ${currentMachineData.color}, 0 0 50px ${currentMachineData.color}44, 0 8px 32px rgba(0,0,0,0.4)` 
            : selectedPad === pad.id
            ? '0 0 15px #fbbf24, 0 4px 20px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)'
            : '0 4px 20px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)'
        }}
        onClick={onClick}
        onDoubleClick={() => setSelectedPad(selectedPad === pad.id ? null : pad.id)}
        onMouseDown={(e) => e.preventDefault()}
        title={`${description} - ${hasAudioFile ? 'Audio Loaded' : loadingState === 'loading' ? 'Loading...' : 'No Audio'} ${selectedPad === pad.id ? '(Selected for editing)' : '(Double-click to edit effects)'}`}
      >
        <div className={`text-2xl font-black ${isActive ? 'text-gray-800' : selectedPad === pad.id ? 'text-yellow-200' : 'text-white group-hover:text-purple-200'}`}>
          {pad.label}
        </div>
        <div className={`text-xs font-medium mt-1 ${isActive ? 'text-gray-600' : selectedPad === pad.id ? 'text-yellow-300' : 'text-gray-300 group-hover:text-purple-300'} truncate max-w-20 text-center leading-tight`}>
          {description.split(':')[0].split(' ')[0]}
        </div>
        
        {/* Audio status indicator */}
        <div className="absolute -top-1 -right-1">
          {loadingState === 'loading' && (
            <div className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></div>
          )}
          {loadingState === 'loaded' && (
            <div className="w-3 h-3 bg-green-400 rounded-full"></div>
          )}
          {loadingState === 'error' && (
            <div className="w-3 h-3 bg-red-400 rounded-full"></div>
          )}
          {!loadingState && (
            <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
          )}
        </div>

        {/* Custom effects indicator */}
        {hasCustomEffects && (
          <div className="absolute -top-1 -left-1">
            <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
          </div>
        )}

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
          <button className="text-purple-400 font-semibold">Effects</button>
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
            <div className="text-white font-medium">{currentMachineData.type}</div>
            <div className="text-white text-sm font-medium">{currentMachineData.name}</div>
          </div>
          <button 
            onClick={() => setCurrentMachine((prev) => (prev + 1) % machines.length)}
            className="text-gray-400 hover:text-white text-xl"
          >
            →
          </button>
        </div>
      </div>

      {/* Display */}
      <div className="text-center py-2">
        <div className="bg-black/50 rounded-lg p-3 backdrop-blur-sm inline-block min-w-96">
          <p className="text-xl font-mono text-green-400">{displayDescription}</p>
          {selectedPad && (
            <p className="text-sm text-yellow-400 mt-1">
              Editing pad {selectedPad} - Double-click another pad or same pad to change selection
            </p>
          )}
        </div>
      </div>

      {/* Drum Pad Area */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div 
          className="p-8 rounded-2xl"
          style={{
            background: `linear-gradient(135deg, ${currentMachineData.color}22 0%, ${currentMachineData.color}44 50%, ${currentMachineData.color}33 100%)`,
            backdropFilter: 'blur(10px)',
            border: `1px solid ${currentMachineData.color}44`
          }}
        >
          {/* 3x3 Grid Layout - First 9 pads */}
          <div className="grid grid-cols-3 gap-6 mb-8">
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

          {/* Additional pads row */}
          {currentMachineData.pads.length > 9 && (
            <div className="grid grid-cols-4 gap-4 justify-items-center">
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
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 max-w-7xl mx-auto">
          {/* Global Effects Controls */}
          <div className="space-y-3 ">
            <label className="text-white font-semibold text-sm">Global Effects</label>
            <div className="flex">
            {/* Volume Control */}
            <div className="space-y-1">
              <label className="text-gray-300 text-xs">Volume: {Math.round(volume * 100)}%</label>
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

            {/* Pan Control */}
            <div className="space-y-1">
              <label className="text-gray-300 text-xs">Pan: {pan === 0 ? 'Center' : pan < 0 ? `${Math.abs(Math.round(pan * 100))}% Left` : `${Math.round(pan * 100)}% Right`}</label>
              <input
                type="range"
                min="-1"
                max="1"
                step="0.1"
                value={pan}
                onChange={(e) => setPan(parseFloat(e.target.value))}
                className="w-full accent-blue-500"
              />
            </div>

            {/* Reverb Control */}
            <div className="space-y-1">
              <label className="text-gray-300 text-xs">Reverb: {Math.round(reverb * 100)}%</label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={reverb}
                onChange={(e) => setReverb(parseFloat(e.target.value))}
                className="w-full accent-green-500"
              />
            </div>
            </div>
          </div>

          {/* Individual Pad Effects */}
          {selectedPad && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-white font-semibold text-sm">Pad {selectedPad} Effects</label>
                <button
                  onClick={() => clearPadEffects(selectedPad)}
                  className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs"
                >
                  Reset
                </button>
              </div>
              
              {/* Pad Volume */}
              <div className="space-y-1">
                <label className="text-gray-300 text-xs">
                  Volume: {padEffects[selectedPad]?.volume !== undefined ? Math.round(padEffects[selectedPad].volume * 100) + '%' : 'Global'}
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={padEffects[selectedPad]?.volume ?? volume}
                  onChange={(e) => updatePadEffect(selectedPad, 'volume', parseFloat(e.target.value))}
                  className="w-full accent-purple-500"
                />
              </div>

              {/* Pad Pan */}
              <div className="space-y-1">
                <label className="text-gray-300 text-xs">
                  Pan: {padEffects[selectedPad]?.pan !== undefined 
                    ? padEffects[selectedPad].pan === 0 ? 'Center' 
                      : padEffects[selectedPad].pan < 0 
                        ? `${Math.abs(Math.round(padEffects[selectedPad].pan * 100))}% Left`
                        : `${Math.round(padEffects[selectedPad].pan * 100)}% Right`
                    : 'Global'}
                </label>
                <input
                  type="range"
                  min="-1"
                  max="1"
                  step="0.1"
                  value={padEffects[selectedPad]?.pan ?? pan}
                  onChange={(e) => updatePadEffect(selectedPad, 'pan', parseFloat(e.target.value))}
                  className="w-full accent-blue-500"
                />
              </div>

              {/* Pad Reverb */}
              <div className="space-y-1">
                <label className="text-gray-300 text-xs">
                  Reverb: {padEffects[selectedPad]?.reverb !== undefined ? Math.round(padEffects[selectedPad].reverb * 100) + '%' : 'Global'}
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={padEffects[selectedPad]?.reverb ?? reverb}
                  onChange={(e) => updatePadEffect(selectedPad, 'reverb', parseFloat(e.target.value))}
                  className="w-full accent-green-500"
                />
              </div>
            </div>
          )}

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
        </div>
      </div>

      {/* Instructions */}
      <div className="text-center text-gray-400 text-xs py-2 border-t border-gray-700">
        Click pads or use keyboard • Double-click pads to edit individual effects • 🟢 Loaded | 🟡 Loading | 🔴 Error | ⚫ No Audio | 🔵 Custom Effects
      </div>
    </div>
  );
};

export default DrumPadMachine;