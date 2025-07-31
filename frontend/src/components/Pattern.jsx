import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Volume2, ChevronDown, Plus } from 'lucide-react';

const Pattern = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentBeat, setCurrentBeat] = useState(0);
  const [bpm, setBpm] = useState(120);
  const [patternLength, setPatternLength] = useState(32);
  const [tracks, setTracks] = useState([
    { id: 'kick', name: 'Kick', pattern: new Array(32).fill(false) },
    { id: 'snare', name: 'Snare', pattern: new Array(32).fill(false) },
    { id: 'hihat', name: 'Hihat (Closed)', pattern: new Array(32).fill(false) }
  ]);
  const [followBeat, setFollowBeat] = useState(true);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [nextTrackId, setNextTrackId] = useState(4); 

  const intervalRef = useRef(null);
  const audioContextRef = useRef(null);
  const dropdownRef = useRef(null);
              
  // Available instrument options
  const instrumentOptions = [
    'Kick', 'Snare', 'Snare 2', 'Rimshot',
    'Hihat (Closed)', 'Hihat (Open)', 'Hihat (Pedal)',
    'Crash', 'Crash 2', 'Crash 3', 'Ride', 'Ride (Bell)',
    'High Tom', 'High Tom 2', 'Mid Tom', 'Mid Tom 2', 'Low Tom', 'Low Tom 2'
  ];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setActiveDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Initialize Web Audio API
  useEffect(() => {
    audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  // Expand pattern when clicking on last 16 beats
  const expandPatternIfNeeded = (beatIndex) => {
    const lastSectionStart = patternLength - 16;
    if (beatIndex >= lastSectionStart) {
      const newPatternLength = patternLength + 16;
      setPatternLength(newPatternLength);
      setTracks(prev => prev.map(track => ({
        ...track,
        pattern: [...track.pattern, ...new Array(16).fill(false)]
      })));
    }
  };

  // Create drum sounds using Web Audio API
  const createDrumSound = (instrumentName) => {
    if (!audioContextRef.current) return;

    const ctx = audioContextRef.current;
    const now = ctx.currentTime;

    // Map instrument names to sound types
    const getSoundType = (name) => {
      if (name.toLowerCase().includes('kick')) return 'kick';
      if (name.toLowerCase().includes('snare') || name.toLowerCase().includes('rimshot')) return 'snare';
      if (name.toLowerCase().includes('hihat') || name.toLowerCase().includes('crash') || name.toLowerCase().includes('ride')) return 'hihat';
      if (name.toLowerCase().includes('tom')) return 'tom';
      return 'hihat'; // default
    };

    const soundType = getSoundType(instrumentName);

    if (soundType === 'kick') {
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
    } else if (soundType === 'snare') {
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
    } else if (soundType === 'tom') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      let freq = 200;
      if (instrumentName.toLowerCase().includes('high')) freq = 300;
      if (instrumentName.toLowerCase().includes('low')) freq = 100;

      osc.frequency.setValueAtTime(freq, now);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.5, now + 0.3);

      gain.gain.setValueAtTime(0.5, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.3);
    } else { // hihat/crash/ride
      const noise = ctx.createBufferSource();
      const buffer = ctx.createBuffer(1, ctx.sampleRate * 0.1, ctx.sampleRate);
      const data = buffer.getChannelData(0);

      for (let i = 0; i < data.length; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.value = instrumentName.toLowerCase().includes('crash') ? 4000 : 8000;

      const gain = ctx.createGain();
      const gainValue = instrumentName.toLowerCase().includes('crash') ? 0.3 : 0.2;
      const duration = instrumentName.toLowerCase().includes('crash') ? 0.3 : 0.1;
      
      gain.gain.setValueAtTime(gainValue, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + duration);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      noise.start(now);
    }
  };

  // Playback logic
  useEffect(() => {
    if (isPlaying) {
      const beatDuration = (60 / bpm / 4) * 1000;

      intervalRef.current = setInterval(() => {
        setCurrentBeat(prev => {
          const nextBeat = (prev + 1) % patternLength;

          tracks.forEach(track => {
            if (track.pattern[nextBeat]) {
              createDrumSound(track.name);
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
  }, [isPlaying, bpm, tracks, patternLength]);

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

  const toggleBeat = (trackId, beatIndex) => {
    expandPatternIfNeeded(beatIndex);

    setTracks(prev => prev.map(track => 
      track.id === trackId 
        ? {
            ...track,
            pattern: track.pattern.map((beat, index) =>
              index === beatIndex ? !beat : beat
            )
          }
        : track
    ));
  };

  const removeTrack = (trackId) => {
    setTracks(prev => prev.filter(track => track.id !== trackId));
    setActiveDropdown(null);
  };

  const addTrack = () => {
    // Find first unused instrument name
    const usedNames = tracks.map(track => track.name);
    const unusedName = instrumentOptions.find(option => !usedNames.includes(option)) || instrumentOptions[0];
    
    const newTrack = {
      id: `track_${nextTrackId}`,
      name: unusedName,
      pattern: new Array(patternLength).fill(false)
    };
    setTracks(prev => [...prev, newTrack]);
    setNextTrackId(prev => prev + 1);
  };

  // Get available instruments for a specific track (excluding already used ones including current)
  const getAvailableInstruments = (currentTrackId) => {
    const usedNames = tracks.map(track => track.name);
    return instrumentOptions.filter(option => !usedNames.includes(option));
  };

  const resetTo32Beats = () => {
    setIsPlaying(false);
    setCurrentBeat(0);
    setPatternLength(32);
    setTracks(prev => prev.map(track => ({
      ...track,
      pattern: new Array(32).fill(false)
    })));
  };

  const handleInstrumentNameChange = (trackId, newName) => {
    setTracks(prev => prev.map(track =>
      track.id === trackId
        ? { ...track, name: newName }
        : track
    ));
    setActiveDropdown(null);
  };

  const toggleDropdown = (trackId) => {
    setActiveDropdown(activeDropdown === trackId ? null : trackId);
  };

  const getCurrentSection = () => Math.floor(currentBeat / 16) + 1;
  const getCurrentBeatInSection = () => (currentBeat % 16) + 1;

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

            <div className="flex items-center gap-2">
              <span className="text-sm">Length: {patternLength}</span>
              {patternLength > 32 && (
                <button
                  onClick={resetTo32Beats}
                  className="bg-purple-700 hover:bg-purple-600 px-2 py-1 rounded text-xs transition-colors"
                >
                  Reset to 32
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setFollowBeat(!followBeat)}
              className={`p-2 rounded-lg transition-colors flex items-center gap-2 ${followBeat ? 'bg-purple-600' : 'bg-purple-800'
                }`}
            >
              <RotateCcw size={16} />
              Cycle
            </button>

            <button
              onClick={() => setFollowBeat(!followBeat)}
              className={`p-2 rounded-lg transition-colors flex items-center gap-2 ${followBeat ? 'bg-purple-600' : 'bg-purple-800'
                }`}
            >
              <Volume2 size={16} />
              Follow beat
            </button>
          </div>
        </div>

        {/* Beat Indicator Dots */}
        <div className='overflow-x-auto'>
          <div className="mt-6">
            <div className="flex items-center gap-2 min-w-max">
              <div className="w-32 flex-shrink-0"></div>

              <div className="flex gap-1">
                {Array.from({ length: patternLength }, (_, beatIndex) => (
                  <div
                    key={beatIndex}
                    className={`w-8 h-3 flex items-center justify-center flex-shrink-0`}
                  >
                    <div className={`
                    w-2 h-2 rounded-full transition-all duration-150
                    ${currentBeat === beatIndex && isPlaying
                        ? 'bg-yellow-400 ring-2 ring-yellow-300 ring-opacity-50 scale-125'
                        : 'bg-purple-500'
                      }
                    ${beatIndex % 4 === 0 ? 'bg-purple-300' : ''}
                    ${beatIndex % 16 === 0 && beatIndex > 0 ? 'ring-1 ring-purple-200' : ''}
                  `}></div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Section Numbers */}
          <div className="mt-2 mb-4">
            <div className="flex items-center gap-2 min-w-max">
              <div className="w-32 flex-shrink-0"></div>
              <div className="flex gap-1">
                {Array.from({ length: Math.ceil(patternLength / 16) }, (_, sectionIndex) => (
                  <div key={sectionIndex} className="flex">
                    <div className="w-32 text-center text-xs text-purple-300 font-medium">
                      Section {sectionIndex + 1}
                    </div>
                    {sectionIndex < Math.ceil(patternLength / 16) - 1 && (
                      <div className="w-96"></div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Drum Grid */}
          <div className="space-y-2">
            <div className="flex flex-col gap-2 min-w-max">
              {tracks.map((track) => (
                <div key={track.id} className="flex items-center gap-2">
                  {/* Track Label with Dropdown */}
                  <div className="w-32 flex-shrink-0 relative" ref={activeDropdown === track.id ? dropdownRef : null}>
                    <div className="bg-purple-700 border border-purple-600 rounded p-3 text-center font-medium flex justify-between items-center">
                      <button
                        onClick={() => toggleDropdown(track.id)}
                        className="flex items-center gap-1 hover:text-purple-200 transition-colors flex-1 text-left"
                      >
                        <span className="text-sm">{track.name}</span>
                        <ChevronDown 
                          size={14} 
                          className={`transition-transform ${activeDropdown === track.id ? 'rotate-180' : ''}`} 
                        />
                      </button>
                      <button
                        onClick={() => removeTrack(track.id)}
                        className="text-xs text-purple-300 hover:text-red-400 ml-2 transition-colors"
                        title="Remove track"
                      >
                        ✕
                      </button>
                    </div>

                    {/* Dropdown Menu */}
                    {activeDropdown === track.id && (
                      <div className="absolute top-full left-0 w-full mt-1 bg-gray-800 border border-gray-600 rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto">
                        {getAvailableInstruments(track.id).map((option) => (
                          <button
                            key={option}
                            onClick={() => handleInstrumentNameChange(track.id, option)}
                            className="w-full text-left px-3 py-2 text-sm hover:bg-gray-700 transition-colors border-b border-gray-700 last:border-b-0 text-gray-300"
                          >
                            {option}
                          </button>
                        ))}
                        {getAvailableInstruments(track.id).length === 0 && (
                          <div className="px-3 py-2 text-sm text-gray-500 italic">
                            No unused instruments available
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Beat Grid */}
                  <div className="flex gap-1">
                    {track.pattern.slice(0, patternLength).map((isActive, beatIndex) => (
                      <button
                        key={beatIndex}
                        onClick={() => toggleBeat(track.id, beatIndex)}
                        className={`
                        w-8 h-8 border border-purple-600 rounded transition-all flex-shrink-0
                        ${isActive
                            ? 'bg-purple-400 border-purple-300'
                            : 'bg-purple-800 hover:bg-purple-700'
                          }
                        ${currentBeat === beatIndex && isPlaying
                            ? 'ring-2 ring-yellow-400 ring-opacity-70'
                            : ''
                          }
                        ${beatIndex % 4 === 0 ? 'border-l-2 border-l-purple-400' : ''}
                        ${beatIndex % 16 === 15 ? 'border-r-2 border-r-purple-400' : ''}
                        ${beatIndex >= (patternLength - 16) ? 'ring-1 ring-orange-400 ring-opacity-50' : ''}
                      `}
                        title={beatIndex >= (patternLength - 16) ? `Click to expand to ${patternLength + 16} beats` : ''}
                      />
                    ))}
                  </div>
                </div>
              ))}

              {/* Add Track Button */}
              <div className="flex items-center gap-2">
                <button
                  onClick={addTrack}
                  className="w-32 bg-purple-700 border border-purple-600 border-dashed rounded p-3 text-center text-purple-300 hover:text-white hover:bg-purple-600 transition-colors flex items-center justify-center gap-2 flex-shrink-0"
                >
                  <Plus size={16} />
                  Add Track
                </button>
                <div className="w-2 h-2 bg-purple-400 rounded-full ml-2"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Pattern Length Indicator */}
        <div className="mt-6 text-center text-sm text-purple-300">
          {patternLength} beats • Section {getCurrentSection()} • Beat {getCurrentBeatInSection()}/16
          <span className="text-orange-300 ml-2">
            • Click last 16 beats (beats {patternLength - 15}-{patternLength}) to add 16 more beats
          </span>
        </div>
      </div>
    </div>
  );
};

export default Pattern;