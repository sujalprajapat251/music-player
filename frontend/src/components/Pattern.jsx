import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, RotateCcw, Volume2, ChevronDown, Plus, Mic } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { setDrumRecordedData, addAudioClipToTrack } from '../Redux/Slice/studio.slice';
import {
  drumMachineTypes,
  createSynthSound,
  createDrumData,
  getAudioContext
} from '../Utils/drumMachineUtils';

const Pattern = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentBeat, setCurrentBeat] = useState(0);
  const [bpm, setBpm] = useState(120);
  const [patternLength, setPatternLength] = useState(32);
  const [currentDrumMachine, setCurrentDrumMachine] = useState(0); // Track current drum machine
  const [tracks, setTracks] = useState([
    { id: 'kick', name: 'Kick', pattern: new Array(32).fill(false), padId: 'Q' },
    { id: 'snare', name: 'Snare', pattern: new Array(32).fill(false), padId: 'W' },
    { id: 'hihat', name: 'Hihat (Closed)', pattern: new Array(32).fill(false), padId: 'E' }
  ]);
  const [followBeat, setFollowBeat] = useState(true);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [nextTrackId, setNextTrackId] = useState(4);
  const [isRecordingPattern, setIsRecordingPattern] = useState(false);
  const [patternRecordedData, setPatternRecordedData] = useState([]);

  const intervalRef = useRef(null);
  const audioContextRef = useRef(null);
  const dropdownRef = useRef(null);
  const dispatch = useDispatch();

  // Available instrument options based on drum machine pads
  const getInstrumentOptions = () => {
    const selectedMachine = drumMachineTypes[currentDrumMachine];
    return selectedMachine.pads.map(pad => ({
      name: pad.sound.charAt(0).toUpperCase() + pad.sound.slice(1),
      padId: pad.id,
      ...pad
    }));
  };

  const drumRecordedData = useSelector((state) => state.studio?.drumRecordedData || []);
  const currentTime = useSelector((state) => state.studio?.currentTime || 0);
  const currentTrackId = useSelector((state) => state.studio?.currentTrackId || null);
  const isRecording = useSelector((state) => state.studio?.isRecording || false);

  // Function to convert recorded drum timing to beat positions
  const convertRecordedDataToPattern = useCallback((recordedData, targetBpm = bpm, targetPatternLength = patternLength) => {
    if (!recordedData || recordedData.length === 0) return;

    // Calculate beat duration in milliseconds
    const beatDurationMs = (60 / targetBpm) * 1000; // Duration of one beat in ms
    const sixteenthNoteMs = beatDurationMs / 4; // Duration of a 16th note in ms

    // Find the first and last recorded hit to determine the time range
    const firstHit = recordedData[0];
    const lastHit = recordedData[recordedData.length - 1];
    const totalDurationMs = lastHit.timestamp - firstHit.timestamp;

    // Create a map to group hits by pad type
    const hitsByPad = {};

    recordedData.forEach(hit => {
      if (!hitsByPad[hit.padId]) {
        hitsByPad[hit.padId] = [];
      }
      hitsByPad[hit.padId].push(hit);
    });

    // Convert each pad's hits to beat positions
    const newTracks = tracks.map(track => {
      const padHits = hitsByPad[track.padId];
      if (!padHits) return track;

      const newPattern = new Array(targetPatternLength).fill(false);

      padHits.forEach(hit => {
        // Calculate time offset from first hit
        const timeOffsetMs = hit.timestamp - firstHit.timestamp;

        // Convert to beat position (assuming 16th note grid)
        const beatPosition = Math.round(timeOffsetMs / sixteenthNoteMs);  

        // Ensure we don't exceed pattern length
        if (beatPosition >= 0 && beatPosition < targetPatternLength) {
          newPattern[beatPosition] = true;
        }
      });

      return {
        ...track,
        pattern: newPattern
      };
    });

    console.log("newTracks",newTracks)

    setTracks(newTracks);

    // Update pattern length if needed
    const requiredBeats = Math.ceil(totalDurationMs / sixteenthNoteMs);
    if (requiredBeats > targetPatternLength) {
      setPatternLength(requiredBeats);
    }
  }, [tracks, bpm, patternLength]);

  // Effect to automatically apply recorded data when recording stops
  useEffect(() => {
    if (!isRecording && drumRecordedData.length > 0) {
      // Auto-apply recorded data to pattern
      convertRecordedDataToPattern(drumRecordedData);
    }
  }, [isRecording, drumRecordedData]);

  // Play drum sound using the same logic as Drum.jsx
  const playDrumSound = useCallback((pad) => {
    try { 
      const audioContext = getAudioContext(audioContextRef);

      if (audioContext.state === 'suspended') {
        audioContext.resume();
      }

      const selectedMachine = drumMachineTypes[currentDrumMachine];
      const currentTypeEffects = selectedMachine.effects;

      // Create synthetic sound
      const synthSource = createSynthSound(pad, audioContext);

      // Connect to destination
      synthSource.connect(audioContext.destination);

      // Record pattern data if recording
      if (isRecordingPattern) {
        const drumData = createDrumData(pad, selectedMachine, currentTime);
        setPatternRecordedData(prev => [...prev, drumData]);
      }
    } catch (error) {
      console.error('Error playing drum sound:', error);
    }
  }, [currentDrumMachine, currentTime, isRecordingPattern]);

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

  // Playback logic
  useEffect(() => {
    if (isPlaying) {
      const beatDuration = (60 / bpm / 4) * 1000;

      intervalRef.current = setInterval(() => {
        setCurrentBeat(prev => {
          const nextBeat = (prev + 1) % patternLength;

          tracks.forEach(track => {
            if (track.pattern[nextBeat]) {
              playDrumSound(track.padId);
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
  }, [isPlaying, bpm, tracks, patternLength, playDrumSound]);

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
    const unusedName = getInstrumentOptions().find(option => !usedNames.includes(option.name)) || getInstrumentOptions()[0];

    const newTrack = {
      id: `track_${nextTrackId}`,
      name: unusedName.name,
      padId: unusedName.padId,
      pattern: new Array(patternLength).fill(false)
    };
    setTracks(prev => [...prev, newTrack]);
    setNextTrackId(prev => prev + 1);
  };

  // Get available instruments for a specific track (excluding already used ones including current)
  const getAvailableInstruments = (currentTrackId) => {
    const usedNames = tracks.map(track => track.name);
    return getInstrumentOptions().filter(option => !usedNames.includes(option.name));
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

  const handleInstrumentNameChange = (trackId, newName, newPadId) => {
    setTracks(prev => prev.map(track =>
      track.id === trackId
        ? { ...track, name: newName, padId: newPadId }
        : track
    ));
    setActiveDropdown(null);
  };

  const toggleDropdown = (trackId) => {
    setActiveDropdown(activeDropdown === trackId ? null : trackId);
  };

  const getCurrentSection = () => Math.floor(currentBeat / 16) + 1;
  const getCurrentBeatInSection = () => (currentBeat % 16) + 1;

  // Function to manually apply recorded data
  const applyRecordedData = () => {
    if (drumRecordedData.length > 0) {
      convertRecordedDataToPattern(drumRecordedData);
    }
  };

  // Function to clear pattern
  const clearPattern = () => {
    setTracks(prev => prev.map(track => ({
      ...track,
      pattern: new Array(patternLength).fill(false)
    })));
  };

  return (
    <>
      <div className="bg-black min-h-screen p-6 text-white">
        <div className="m-5 mx-auto">

          {/* Header Controls */}
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-4">
              <button
                onClick={togglePlay}
                className="bg-[#1F1F1F] p-3 rounded-lg transition-colors flex items-center gap-2"
              >
                {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                {isPlaying ? 'Pause' : 'Play'}
              </button>

              <button
                onClick={stopAndReset}
                className="bg-[#1F1F1F] p-3 rounded-lg transition-colors flex items-center gap-2"
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
                    className="bg-[#1F1F1F] px-2 py-1 rounded text-xs transition-colors"
                  >
                    Reset to 32
                  </button>
                )}
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Recording Status */}
              {isRecording && (
                <div className="flex items-center gap-2 bg-red-600 px-3 py-2 rounded-lg">
                  <div className="w-2 h-2 bg-[#474747] rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium">Recording...</span>
                </div>
              )}

              {/* Apply Recorded Data Button */}
              {drumRecordedData.length > 0 && !isRecording && (
                <button
                  onClick={applyRecordedData}
                  className="bg-green-600 hover:bg-green-500 p-3 rounded-lg transition-colors flex items-center gap-2"
                  title={`Apply ${drumRecordedData.length} recorded drum hits to pattern`}
                >
                  <Mic size={16} />
                  Apply Recording ({drumRecordedData.length} hits)
                </button>
              )}

              {/* Clear Pattern Button */}
              <button
                onClick={clearPattern}
                className="bg-red-600 hover:bg-red-500 p-3 rounded-lg transition-colors flex items-center gap-2"
              >
                <RotateCcw size={16} />
                Clear Pattern
              </button>

              <button
                onClick={() => setFollowBeat(!followBeat)}
                className={`p-2 rounded-lg transition-colors flex items-center gap-2 ${followBeat ? 'bg-[#474747]' : 'bg-[#1F1F1F]'
                  }`}
              >
                <RotateCcw size={16} />
                Cycle
              </button>

              <button
                onClick={() => setFollowBeat(!followBeat)}
                className={`p-2 rounded-lg transition-colors flex items-center gap-2 ${followBeat ? 'bg-[#474747]' : 'bg-[#1F1F1F]'
                  }`}
              >
                <Volume2 size={16} />
                Follow beat
              </button>
            </div>
          </div>

          {/* Recording Info */}
          {drumRecordedData.length > 0 && (
            <div className="mb-4 p-3 bg-purple-800/50 rounded-lg border border-purple-600/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="text-sm text-purple-200">
                    📊 Recorded Data: {drumRecordedData.length} drum hits
                  </span>
                  <span className="text-sm text-purple-300">
                    Duration: {drumRecordedData.length > 1
                      ? `${((drumRecordedData[drumRecordedData.length - 1].timestamp - drumRecordedData[0].timestamp) / 1000).toFixed(2)}s`
                      : '0s'
                    }
                  </span>
                  <span className="text-sm text-purple-300">
                    BPM: {bpm}
                  </span>
                </div>
                <div className="text-xs text-purple-400">
                  Pattern will auto-fill when recording stops, or click "Apply Recording" to manually apply
                </div>
              </div>
            </div>
          )}

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
                          : 'bg-[#474747]'
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
                      <div className="w-32 text-center items-center text-xs text-purple-300 font-medium">
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
                      <div className="bg-[#1F1F1F] rounded p-3 text-center font-medium flex justify-between items-center">
                        <button
                          onClick={() => toggleDropdown(track.id)}
                          className="flex items-center gap-1 text-white transition-colors flex-1 text-left"
                        >
                          <span className="text-sm">{track.name}</span>
                          <ChevronDown
                            size={14}
                            className={`transition-transform ${activeDropdown === track.id ? 'rotate-180' : ''}`}
                          />
                        </button>
                        <button
                          onClick={() => removeTrack(track.id)}
                          className="text-xs text-white hover:text-red-400 ml-2 transition-colors"
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
                              key={option.padId}
                              onClick={() => handleInstrumentNameChange(track.id, option.name, option.padId)}
                              className="w-full text-left px-3 py-2 text-sm hover:bg-gray-700 transition-colors border-b border-gray-700 last:border-b-0 text-gray-300"
                            >
                              {option.name}
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
                        w-8 h-8 border border-[#949292] rounded transition-all flex-shrink-0

                        ${isActive
                              ? 'bg-[#474747] border-purple-300'
                              : 'bg-[#1F1F1F] hover:bg-[#474747]'
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
                    className="w-32 bg-[#1F1F1F] border-dashed rounded p-3 text-center text-white hover:bg-[#474747] transition-colors flex items-center justify-center gap-2 flex-shrink-0"
                  >
                    <Plus size={16} />
                    Add Track
                  </button>
                  <div className="w-2 h-2 bg-[#474747] rounded-full ml-2"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Pattern;