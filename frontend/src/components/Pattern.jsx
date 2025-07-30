import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Volume2 } from 'lucide-react';

const Pattern = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentBeat, setCurrentBeat] = useState(0);
  const [bpm, setBpm] = useState(120);
  const [patternLength, setPatternLength] = useState(32); // Dynamic pattern length
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

  // Expand pattern when clicking on last 16 beats
  const expandPatternIfNeeded = (beatIndex) => {
    const lastSectionStart = patternLength - 16;
    if (beatIndex >= lastSectionStart) {
      // Add 16 more beats
      const newPatternLength = patternLength + 16;
      setPatternLength(newPatternLength);
      setPatterns(prev => ({
        kick: [...prev.kick, ...new Array(16).fill(false)],
        snare: [...prev.snare, ...new Array(16).fill(false)],
        hihat: [...prev.hihat, ...new Array(16).fill(false)]
      }));
    }
  };

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
          const nextBeat = (prev + 1) % patternLength;

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
  }, [isPlaying, bpm, patterns, patternLength]);

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
    // Expand pattern if clicking on last 16 beats
    expandPatternIfNeeded(beatIndex);

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
      [instrument]: new Array(patternLength).fill(false)
    }));
  };

  const addTrack = () => {
    // Placeholder for adding new tracks
    console.log('Add track functionality');
  };

  // Reset to 32 beats
  const resetTo32Beats = () => {
    setIsPlaying(false);
    setCurrentBeat(0);
    setPatternLength(32);
    setPatterns({
      kick: new Array(32).fill(false),
      snare: new Array(32).fill(false),
      hihat: new Array(32).fill(false)
    });
  };

  // Calculate current section and beat display
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

            {/* Pattern Length Controls */}
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
              {/* Empty space to align with track labels */}
              <div className="w-32 flex-shrink-0"></div>

              {/* Beat dots aligned with grid */}
              <div className="flex gap-1">
                {Array.from({ length: patternLength }, (_, beatIndex) => (
                  <div
                    key={beatIndex}
                    className={`
                    w-8 h-3 flex items-center justify-center flex-shrink-0
                  `}
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
          <div className="space-y-2 ">
            <div className="flex flex-col gap-2 min-w-max">
              {Object.entries(patterns).map(([instrument, pattern]) => (
                <div key={instrument} className="flex items-center gap-2">
                  {/* Track Label */}
                  <div className="w-32 flex-shrink-0">
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
                  <div className="flex gap-1">
                    {pattern.slice(0, patternLength).map((isActive, beatIndex) => (
                      <button
                        key={beatIndex}
                        onClick={() => toggleBeat(instrument, beatIndex)}
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
                  + Add
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