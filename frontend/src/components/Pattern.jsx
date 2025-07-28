import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Volume2 } from 'lucide-react';

const Pattern = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentBeat, setCurrentBeat] = useState(0);
  const [bpm, setBpm] = useState(120);
  const [patterns, setPatterns] = useState({
    kick: new Array(32).fill(false),
    snare: new Array(32).fill(false),
    hihat: new Array(32).fill(false)
  });
  const [followBeat, setFollowBeat] = useState(true);
  
  const intervalRef = useRef(null);
  const audioContextRef = useRef(null);

  // Initialize Web Audio API
  useEffect(() => {
    audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  // Create drum sounds using Web Audio API
  const createDrumSound = (type) => {
    if (!audioContextRef.current) return;
    
    const ctx = audioContextRef.current;
    const now = ctx.currentTime;
    
    if (type === 'kick') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.frequency.setValueAtTime(60, now);
      osc.frequency.exponentialRampToValueAtTime(0.01, now + 0.5);
      
      gain.gain.setValueAtTime(1, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start(now);
      osc.stop(now + 0.5);
    } else if (type === 'snare') {
      const noise = ctx.createBufferSource();
      const buffer = ctx.createBuffer(1, ctx.sampleRate * 0.2, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      
      for (let i = 0; i < data.length; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      
      noise.buffer = buffer;
      
      const filter = ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.value = 1000;
      
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
      
      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      
      noise.start(now);
    } else if (type === 'hihat') {
      const noise = ctx.createBufferSource();
      const buffer = ctx.createBuffer(1, ctx.sampleRate * 0.1, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      
      for (let i = 0; i < data.length; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      
      noise.buffer = buffer;
      
      const filter = ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.value = 8000;
      
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
      
      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      
      noise.start(now);
    }
  };

  // Playback logic
  useEffect(() => {
    if (isPlaying) {
      const beatDuration = (60 / bpm / 4) * 1000; // 16th note duration in ms
      
      intervalRef.current = setInterval(() => {
        setCurrentBeat(prev => {
          const nextBeat = (prev + 1) % 32;
          
          // Play sounds for active beats
          Object.keys(patterns).forEach(instrument => {
            if (patterns[instrument][nextBeat]) {
              createDrumSound(instrument);
            }
          });
          
          return nextBeat;
        });
      }, beatDuration);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying, bpm, patterns]);

  const togglePlay = () => {
    if (audioContextRef.current?.state === 'suspended') {
      audioContextRef.current.resume();
    }
    setIsPlaying(!isPlaying);
  };

  const stopAndReset = () => {
    setIsPlaying(false);
    setCurrentBeat(0);
  };

  const toggleBeat = (instrument, beatIndex) => {
    setPatterns(prev => ({
      ...prev,
      [instrument]: prev[instrument].map((beat, index) => 
        index === beatIndex ? !beat : beat
      )
    }));
  };

  const clearPattern = (instrument) => {
    setPatterns(prev => ({
      ...prev,
      [instrument]: new Array(32).fill(false)
    }));
  };

  const addTrack = () => {
    // Placeholder for adding new tracks
    console.log('Add track functionality');
  };

  return (
    <div className="bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 min-h-screen p-6 text-white">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Controls */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={togglePlay}
              className="bg-purple-600 hover:bg-purple-500 p-3 rounded-lg transition-colors flex items-center gap-2"
            >
              {isPlaying ? <Pause size={20} /> : <Play size={20} />}
              {isPlaying ? 'Pause' : 'Play'}
            </button>
            
            <button
              onClick={stopAndReset}
              className="bg-purple-600 hover:bg-purple-500 p-3 rounded-lg transition-colors flex items-center gap-2"
            >
              <RotateCcw size={20} />
              Stop
            </button>
            
            <div className="flex items-center gap-2">
              <label className="text-sm">BPM:</label>
              <input
                type="range"
                min="60"
                max="180"
                value={bpm}
                onChange={(e) => setBpm(parseInt(e.target.value))}
                className="w-20"
              />
              <span className="text-sm w-8">{bpm}</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setFollowBeat(!followBeat)}
              className={`p-2 rounded-lg transition-colors flex items-center gap-2 ${
                followBeat ? 'bg-purple-600' : 'bg-purple-800'
              }`}
            >
              <RotateCcw size={16} />
              Cycle
            </button>
            
            <button
              onClick={() => setFollowBeat(!followBeat)}
              className={`p-2 rounded-lg transition-colors flex items-center gap-2 ${
                followBeat ? 'bg-purple-600' : 'bg-purple-800'
              }`}
            >
              <Volume2 size={16} />
              Follow beat
            </button>
          </div>
        </div>

        {/* Beat Counter */}
        <div className="flex justify-center mb-6">
          <div className="flex gap-8">
            <div className="text-center">
              <div className="text-sm text-purple-300 mb-1">1</div>
              <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
            </div>
            <div className="text-center">
              <div className="text-sm text-purple-300 mb-1">2</div>
              <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
            </div>
          </div>
        </div>

        {/* Drum Grid */}
        <div className="space-y-2">
          {Object.entries(patterns).map(([instrument, pattern]) => (
            <div key={instrument} className="flex items-center gap-2">
              {/* Track Label */}
              <div className="w-32">
                <div className="bg-purple-700 border border-purple-600 rounded p-3 text-center capitalize font-medium flex justify-between items-center">
                  {instrument}
                  {instrument === 'hihat' && (
                    <span className="text-xs text-purple-300">(Closed)</span>
                  )}
                  <button
                    onClick={() => clearPattern(instrument)}
                    className="text-xs text-purple-300 hover:text-white"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* Beat Grid */}
              <div className="flex gap-1 flex-1">
                {pattern.map((isActive, beatIndex) => (
                  <button
                    key={beatIndex}
                    onClick={() => toggleBeat(instrument, beatIndex)}
                    className={`
                      w-8 h-8 border border-purple-600 rounded transition-all
                      ${isActive 
                        ? 'bg-purple-400 border-purple-300' 
                        : 'bg-purple-800 hover:bg-purple-700'
                      }
                      ${currentBeat === beatIndex && isPlaying 
                        ? 'ring-2 ring-yellow-400 ring-opacity-70' 
                        : ''
                      }
                      ${beatIndex % 4 === 0 ? 'border-l-2 border-l-purple-400' : ''}
                      ${beatIndex === 15 ? 'border-r-2 border-r-purple-400' : ''}
                    `}
                  />
                ))}
              </div>
            </div>
          ))}

          {/* Add Track Button */}
          <div className="flex items-center gap-2">
            <button
              onClick={addTrack}
              className="w-32 bg-purple-700 border border-purple-600 border-dashed rounded p-3 text-center text-purple-300 hover:text-white hover:bg-purple-600 transition-colors flex items-center justify-center gap-2"
            >
              + Add
            </button>
            <div className="w-2 h-2 bg-purple-400 rounded-full ml-2"></div>
          </div>
        </div>

        {/* Pattern Length Indicator */}
        <div className="mt-6 text-center text-sm text-purple-300">
          32 beats • {Math.ceil(32/4)} measures • Beat {currentBeat + 1}
        </div>
      </div>
    </div>
  );
};

export default Pattern;