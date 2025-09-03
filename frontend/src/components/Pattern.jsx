import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, RotateCcw, Volume2, ChevronDown, Plus, Mic } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { setDrumRecordedData, addAudioClipToTrack, setDrumRecordingClip, removeAudioClip } from '../Redux/Slice/studio.slice';
import { selectStudioState } from '../Redux/rootReducer';
import {
  drumMachineTypes,
  createSynthSound,
  createDrumData,
  getAudioContext
} from '../Utils/drumMachineUtils';
// import { handleBeatToggleSync } from '../Utils/patternTimelineBridge';

const Pattern = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentBeat, setCurrentBeat] = useState(0);
  const [bpm, setBpm] = useState(120);
  const [patternLength, setPatternLength] = useState(48);
  const [currentDrumMachine, setCurrentDrumMachine] = useState(0);
  const [tracks, setTracks] = useState([
    { id: 'kick', name: 'Kick', pattern: new Array(48).fill(false), padId: 'Q' },
    { id: 'snare', name: 'Snare', pattern: new Array(48).fill(false), padId: 'W' },
    { id: 'hihat', name: 'Hihat', pattern: new Array(48).fill(false), padId: 'E' },
  ]);
  const [followBeat, setFollowBeat] = useState(true);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [nextTrackId, setNextTrackId] = useState(4);
  const [isRecordingPattern, setIsRecordingPattern] = useState(false);
  const [patternRecordedData, setPatternRecordedData] = useState([]);

  const audioContextRef = useRef(null);
  const dropdownRef = useRef(null);
  const dispatch = useDispatch();
  const selectedTrackId = useSelector((state) => selectStudioState(state)?.currentTrackId);

  // Get all tracks from Redux store
  const allTracks = useSelector((state) => selectStudioState(state)?.tracks || []);

  // Available instrument options based on drum machine pads
  const getInstrumentOptions = () => {
    const selectedMachine = drumMachineTypes[currentDrumMachine];
    return selectedMachine.pads.map(pad => ({
      name: pad.sound.charAt(0).toUpperCase() + pad.sound.slice(1),
      padId: pad.id,
      ...pad
    }));
  };

  const drumRecordedData = useSelector((state) => selectStudioState(state)?.drumRecordedData || []);
  const drumRecordingClip = useSelector((state) => selectStudioState(state)?.drumRecordingClip || null);
  // console.log("drumRecordingClip0", drumRecordingClip);
  // console.log("drumRecordedData", drumRecordedData);
  const currentTime = useSelector((state) => selectStudioState(state)?.currentTime || 0);
  const currentTrackId = useSelector((state) => selectStudioState(state)?.currentTrackId || null);
  const isRecording = useSelector((state) => selectStudioState(state)?.isRecording || false);

  // Function to convert recorded drum timing to beat positions
  const convertRecordedDataToPattern = useCallback((recordedData, targetBpm = bpm, targetPatternLength = patternLength) => {
    if (!recordedData || recordedData.length === 0) return;

    // Group hits by pad
    const hitsByPad = {};
    for (const hit of recordedData) {
      const padId = hit.padId;
      if (!padId) continue;
      if (!hitsByPad[padId]) hitsByPad[padId] = [];
      hitsByPad[padId].push(hit);
    }

    // Determine required length from currentTime fields (aligned with Pattern grid)
    const maxTime = Math.max(...recordedData.map(h => (h.currentTime || 0) + (h.decay || 0)));
    const requiredBeats = Math.max(targetPatternLength, Math.ceil(Math.max(1, Math.round(maxTime * 16)) / 16) * 16);

    // Build patterns per pad using currentTime -> beat index
    if (requiredBeats !== targetPatternLength) setPatternLength(requiredBeats);
    setTracks(prevTracks => prevTracks.map(track => {
      const padHits = hitsByPad[track.padId];
      const newPattern = new Array(requiredBeats).fill(false);
      if (padHits && padHits.length) {
        for (const hit of padHits) {
          const idx = Math.round((hit.currentTime || 0) * 16);
          if (idx >= 0 && idx < requiredBeats) newPattern[idx] = true;
        }
      } else {
        // expand existing pattern if needed
        for (let i = 0; i < Math.min(track.pattern.length, requiredBeats); i++) newPattern[i] = track.pattern[i];
      }
      return { ...track, pattern: newPattern };
    }));
  }, []);

  // NEW FUNCTION: Convert track data to pattern
  const convertTrackDataToPattern = useCallback((selectedTrack) => {
    if (!selectedTrack?.audioClips) return;

    // Get all drum data from all audio clips in the track
    const allDrumHits = selectedTrack.audioClips.flatMap(clip => {
      return clip.drumData || [];
    });

    if (allDrumHits.length === 0) return;

    console.log("Processing drum hits from track:", allDrumHits);

    // Sort hits by timestamp
    const sortedHits = allDrumHits.sort((a, b) => a.timestamp - b.timestamp);
    const firstHit = sortedHits[0];
    const lastHit = sortedHits[sortedHits.length - 1];

    const beatDurationMs = (60 / bpm) * 1000;
    const sixteenthNoteMs = beatDurationMs / 4;

    // Calculate total required pattern length
    const totalDurationMs = lastHit.timestamp - firstHit.timestamp;
    const requiredBeats = Math.ceil(totalDurationMs / sixteenthNoteMs);

    // Round up to the nearest multiple of 16 to ensure complete sections
    const newPatternLength = Math.max(48, Math.ceil(requiredBeats / 16) * 16);

    // Update pattern length if needed
    if (newPatternLength > patternLength) {
      setPatternLength(newPatternLength);
    }

    // Group hits by pad ID
    const hitsByPad = {};
    sortedHits.forEach(hit => {
      if (!hitsByPad[hit.padId]) {
        hitsByPad[hit.padId] = [];
      }
      hitsByPad[hit.padId].push(hit);
    });

    // Create new tracks based on unique pad IDs from the recorded data
    const newTracks = Object.entries(hitsByPad).map(([padId, hits]) => {
      // Initialize pattern with the new length
      const pattern = new Array(newPatternLength).fill(false);

      hits.forEach(hit => {
        const timeOffsetMs = hit.timestamp - firstHit.timestamp;
        const beatPosition = Math.round(timeOffsetMs / sixteenthNoteMs);

        // Ensure we're within the pattern length
        if (beatPosition >= 0 && beatPosition < newPatternLength) {
          pattern[beatPosition] = true;
        }
      });

      const firstHitOfType = hits[0];
      return {
        id: padId,
        name: firstHitOfType.sound.charAt(0).toUpperCase() + firstHitOfType.sound.slice(1),
        pattern,
        padId,
        drumType: firstHitOfType.type,
        freq: firstHitOfType.freq,
        decay: firstHitOfType.decay
      };
    });

    console.log("Generated pattern tracks:", newTracks);
    setTracks(newTracks);
  }, [bpm]);

  // Effect to watch for selected track changes and auto-convert
  const selectedTrackRef = useRef();
  useEffect(() => {
    if (selectedTrackId && selectedTrackId !== selectedTrackRef.current) {
      selectedTrackRef.current = selectedTrackId;
      const selectedTrack = allTracks.find(track => track.id === selectedTrackId);
      if (selectedTrack?.audioClips && selectedTrack.audioClips.length > 0) {
        console.log("Selected track has audio clips, converting to pattern:", selectedTrack);
        convertTrackDataToPattern(selectedTrack);
      }
    }
  }, [selectedTrackId, allTracks, convertTrackDataToPattern]);

  // Effect to automatically apply recorded data once when recording stops (edge-detected)
  const prevIsRecordingRef = useRef(isRecording);
  useEffect(() => {
    const wasRecording = prevIsRecordingRef.current;
    if (wasRecording && !isRecording && drumRecordedData.length > 0) {
      convertRecordedDataToPattern(drumRecordedData);
    }
    prevIsRecordingRef.current = isRecording;
  }, [isRecording, convertRecordedDataToPattern, drumRecordedData.length]);

  // Play drum sound using the same logic as Drum.jsx
  const playDrumSound = useCallback((trackData) => {
    try {
      const audioContext = getAudioContext(audioContextRef);

      if (audioContext.state === 'suspended') {
        audioContext.resume();
      }

      const selectedMachine = drumMachineTypes[currentDrumMachine];
      let padData;

      // Handle different input types
      if (typeof trackData === 'string') {
        // If it's a string (padId), find the pad in current drum machine
        padData = selectedMachine.pads.find(p => p.id === trackData);
      } else if (trackData && trackData.padId) {
        // If it's a track object with stored pad data, use that data or find from machine
        if (trackData.freq && trackData.decay && trackData.drumType) {
          // Use stored drum data from the track
          padData = {
            id: trackData.padId,
            sound: trackData.name.toLowerCase(),
            freq: trackData.freq,
            decay: trackData.decay,
            type: trackData.drumType
          };
        } else {
          // Fallback to drum machine pad
          padData = selectedMachine.pads.find(p => p.id === trackData.padId);
        }
      } else {
        // Direct pad object
        padData = trackData;
      }

      // Fallback if no pad found
      if (!padData) {
        console.warn('No pad data found, using default kick');
        padData = selectedMachine.pads.find(p => p.type === 'kick') || selectedMachine.pads[0];
      }

      // Create synthetic sound
      const synthSource = createSynthSound(padData, audioContext);

      // Connect to destination
      synthSource.connect(audioContext.destination);

      // Record pattern data if recording
      if (isRecordingPattern) {
        const drumData = createDrumData(padData, selectedMachine, currentTime);
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
  const expandPatternIfNeeded = useCallback((beatIndex) => {
    const lastSectionStart = patternLength - 16;
    if (beatIndex >= lastSectionStart) {
      const newPatternLength = patternLength + 16;
      setPatternLength(newPatternLength);
      setTracks(prev => prev.map(track => ({
        ...track,
        pattern: [...track.pattern, ...new Array(16).fill(false)]
      })));
    }
  }, [patternLength]);

  // Playback logic
  useEffect(() => {
    let intervalId = null;
    
    if (isPlaying) {
      const beatDuration = (60 / bpm / 4) * 1000;
      
      intervalId = setInterval(() => {
        setCurrentBeat(prev => {
          const nextBeat = (prev + 1) % patternLength;
          
          tracks.forEach(track => {
            if (track.pattern[nextBeat]) {
              playDrumSound(track);
            }
          });
          
          return nextBeat;
        });
      }, beatDuration);
    }
  
    // Cleanup function - this will run when component unmounts or dependencies change
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isPlaying, bpm, tracks, patternLength, playDrumSound]);

  const togglePlay = () => {
    if (audioContextRef.current?.state === 'suspended') {
      audioContextRef.current.resume();
    }
    setIsPlaying(!isPlaying);
  };
  
  // Update stopAndReset function
  const stopAndReset = () => {
    setIsPlaying(false);
    setCurrentBeat(0);
  };

  const toggleBeat = useCallback((trackId, beatIndex) => {
    if (!selectedTrackId) {
      console.warn('No track selected');
      return;
    }

    expandPatternIfNeeded(beatIndex);

    setTracks(prevTracks => {
      return prevTracks.map(track => {
        if (track.id === trackId) {
          const newPattern = [...track.pattern];
          const nextIsOn = !newPattern[beatIndex];
          newPattern[beatIndex] = nextIsOn;

          // Calculate section index (0 for 0s-1s, 1 for 1s-2s, etc.)
          const sectionIndex = Math.floor(beatIndex / 16);
          const beatInSection = beatIndex % 16;
          const sectionStartTime = sectionIndex;
          const beatTimeInSection = beatInSection / 16;
          const exactTimePosition = sectionStartTime + beatTimeInSection;

          const kit = drumMachineTypes[currentDrumMachine] || {};
          const pad = (kit.pads || []).find(p => p.id === track.padId);
          const meta = pad ? { sound: pad.sound, type: pad.type, freq: pad.freq, decay: pad.decay, drumMachine: kit.name } : { sound: track.name?.toLowerCase?.() || 'perc', type: 'perc', freq: 1000, decay: 0.2, drumMachine: kit.name || 'Pattern' };

          if (nextIsOn) {
            // Create drum hit data
            const drumHit = {
              id: `pattern_${track.padId}_${beatIndex}_${Date.now()}`,
              padId: track.padId,
              currentTime: exactTimePosition,
              timestamp: Date.now(),
              trackId: selectedTrackId,
              ...meta,
            };

            // Merge with existing drum recorded data
            const updatedData = [...drumRecordedData, drumHit];
            dispatch(setDrumRecordedData(updatedData));
            
            // Update drum recording clip bounds
            const notesForThisTrack = updatedData.filter(n => n.trackId === selectedTrackId);
            if (notesForThisTrack.length > 0) {
              const minStart = Math.min(...notesForThisTrack.map(n => n.currentTime || 0));
              const maxEnd = Math.max(...notesForThisTrack.map(n => (n.currentTime || 0) + (n.decay || 0.2)));
              const trackColor = (allTracks.find(t => t.id === selectedTrackId)?.color) || '#FF8014';
              const drumClip = { 
                start: minStart, 
                end: maxEnd, 
                color: trackColor, 
                trackId: selectedTrackId,
                type: 'drum',
                name: `Drum Recording (${notesForThisTrack.length} hits)`,
                duration: maxEnd - minStart,
                startTime: minStart,
                trimStart: 0,
                trimEnd: maxEnd - minStart,
                id: `drum_recording_${Date.now()}`,
                drumData: notesForThisTrack
              };
              dispatch(setDrumRecordingClip(drumClip));
            }
          } else {
            // Remove this specific drum hit from the recorded data
            const remaining = drumRecordedData.filter(hit => 
              !(hit.padId === track.padId && Math.abs((hit.currentTime || 0) - exactTimePosition) < 0.001 && hit.trackId === selectedTrackId)
            );
            
            dispatch(setDrumRecordedData(remaining));
            
            // Update drum recording clip bounds
            const notesForThisTrack = remaining.filter(n => n.trackId === selectedTrackId);
            if (notesForThisTrack.length > 0) {
              const minStart = Math.min(...notesForThisTrack.map(n => n.currentTime || 0));
              const maxEnd = Math.max(...notesForThisTrack.map(n => (n.currentTime || 0) + (n.decay || 0.2)));
              const trackColor = (allTracks.find(t => t.id === selectedTrackId)?.color) || '#FF8014';
              const drumClip = { 
                start: minStart, 
                end: maxEnd, 
                color: trackColor, 
                trackId: selectedTrackId,
                type: 'drum',
                name: `Drum Recording (${notesForThisTrack.length} hits)`,
                duration: maxEnd - minStart,
                startTime: minStart,
                trimStart: 0,
                trimEnd: maxEnd - minStart,
                id: `drum_recording_${Date.now()}`,
                drumData: notesForThisTrack
              };
              dispatch(setDrumRecordingClip(drumClip));
            } else {
              // Clear drum recording clip if no hits remain
              dispatch(setDrumRecordingClip(null));
            }
          }

          return { ...track, pattern: newPattern };
        }
        return track;
      });
    });
  }, [selectedTrackId, currentDrumMachine, dispatch, expandPatternIfNeeded, drumRecordedData, allTracks]);

  // Helper function to update drumRecordingClip
  const updateDrumRecordingClip = useCallback((drumData, trackId) => {
    if (!drumData || drumData.length === 0) {
      dispatch(setDrumRecordingClip(null));
      return;
    }

    // Filter data for the specific track
    const notesForTrack = drumData.filter(n => n.trackId === trackId);

    if (notesForTrack.length === 0) {
      dispatch(setDrumRecordingClip(null));
      return;
    }

    // Calculate new bounds
    const minStart = Math.min(...notesForTrack.map(n => n.currentTime || 0));
    const maxEnd = Math.max(...notesForTrack.map(n => (n.currentTime || 0) + (n.decay || 0.2)));

    // Get track color
    const trackColor = (allTracks.find(t => t.id === trackId)?.color) || '#FF8014';

    // Update drumRecordingClip
    dispatch(setDrumRecordingClip({
      start: minStart,
      end: maxEnd,
      color: trackColor,
      trackId: trackId,
      type: 'drum'
    }));
  }, [dispatch, allTracks]);

  const removeTrack = (trackId) => {
    setTracks(prev => prev.filter(track => track.id !== trackId));
    setActiveDropdown(null);
  };

  const addTrack = (trackId) => {
    // Find first unused instrument name
    const usedNames = tracks.map(track => track.name);
    const unusedName = getInstrumentOptions().find(option => !usedNames.includes(option.name)) || getInstrumentOptions()[0];

    const newTrack = {
      id: trackId,
      name: unusedName.name,
      padId: unusedName.padId,
      pattern: new Array(patternLength).fill(false)
    };
    setTracks(prev => [...prev, newTrack]);
  };

  // Get available instruments for a specific track (excluding already used ones including current)
  const getAvailableInstruments = (currentTrackId) => {
    const usedNames = tracks.map(track => track.name);
    return getInstrumentOptions().filter(option => !usedNames.includes(option.name));
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

  // NEW FUNCTION: Apply selected track data to pattern
  const applySelectedTrackData = () => {
    if (selectedTrackId) {
      const selectedTrack = allTracks.find(track => track.id === selectedTrackId);
      if (selectedTrack) {
        convertTrackDataToPattern(selectedTrack);
      }
    }
  };

  const hasAvailableInstruments = () => {
    const usedNames = tracks.map(track => track.name);
    return getInstrumentOptions().some(option => !usedNames.includes(option.name));
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
            </div>

            <div className="flex items-center gap-4">
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

          {/* Beat Indicator Dots */}
          <div className="mt-6 max-h-[300px] overflow-auto">
            <div className="flex">
              {/* Fixed Labels Column */}
              <div className="w-32 flex-shrink-0 z-10 bg-black">
                {/* Empty spacer for beat dots alignment */}
                <div className="h-3 mb-2"></div>

                {/* Empty spacer for section numbers alignment */}
                <div className="h-6 mb-4"></div>

                {/* Fixed Track Labels */}
                <div className="space-y-5">
                  {tracks.map((track) => (
                    <div key={track.id} className="relative" ref={activeDropdown === track.id ? dropdownRef : null}>
                      <div className="bg-[#1F1F1F] rounded p-3 text-center font-medium flex justify-between items-center h-10">
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
                        <div className="absolute top-full left-0 w-full mt-1 dark:bg-primary-dark border border-gray-600 rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto">
                          {getAvailableInstruments(track.id).map((option) => (
                            <button
                              key={option.padId}
                              onClick={() => handleInstrumentNameChange(track.id, option.name, option.padId)}
                              className="w-full text-left px-3 py-2 text-sm hover:bg-[#303030] transition-colors border-b border-gray-700 last:border-b-0 text-white"
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
                  ))}

                  {/* Add Track Button */}
                  {hasAvailableInstruments() && (
                    <button
                      onClick={() => addTrack(tracks.length + 1)}
                      className="w-full bg-[#1F1F1F] border-dashed rounded p-3 text-center text-white hover:bg-[#474747] transition-colors flex items-center justify-center gap-2"
                    >
                      <Plus size={16} />
                      Add Track
                    </button>
                  )}
                </div>
              </div>

              {/* Scrollable Content */}
              <div className="overflow-x-auto flex-1">
                <div className="min-w-max">
                  {/* Beat Indicator Dots */}
                  <div className="flex items-center gap-2 h-3 mb-2">
                    <div className="flex gap-1">
                      {Array.from({ length: Math.ceil(patternLength / 16) }, (_, sectionIndex) => (
                        <div key={sectionIndex} className="flex gap-1 mx-2">
                          {Array.from({ length: 16 }, (_, beatIndexInSection) => {
                            const beatIndex = sectionIndex * 16 + beatIndexInSection;
                            if (beatIndex >= patternLength) return null;

                            return (
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
                ${beatIndex % 4 === 0 ? 'bg-white' : ''}
                ${beatIndex % 16 === 0 && beatIndex > 0 ? 'ring-1 ring-purple-200' : ''}
              `}></div>
                              </div>
                            );
                          })}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Section Numbers */}
                  <div className="flex items-center gap-2 h-6 mb-4">
                    <div className="flex gap-1">
                      {Array.from({ length: Math.ceil(patternLength / 16) }, (_, sectionIndex) => (
                        <div key={sectionIndex} className="flex justify-center items-center mx-2" style={{ width: `${16 * 36}px` }}>
                          <div className="text-center text-xs text-white font-medium">
                            Section {sectionIndex}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Beat Grids */}
                  <div className="space-y-5">
                    {tracks.map((track) => (
                      <div key={track.id} className="flex items-center gap-2 h-10">
                        <div className="flex gap-1">
                          {Array.from({ length: Math.ceil(patternLength / 16) }, (_, sectionIndex) => (
                            <div key={sectionIndex} className="flex gap-1 mx-2">
                              {track.pattern.slice(sectionIndex * 16, (sectionIndex + 1) * 16).map((isActive, beatIndexInSection) => {
                                const beatIndex = sectionIndex * 16 + beatIndexInSection;
                                return (
                                  <button
                                    key={beatIndex}
                                    onClick={() => toggleBeat(track.id, beatIndex)}
                                    className={`
                    w-8 h-8 border border-[#949292] rounded transition-all flex-shrink-0
                    ${isActive
                                        ? 'bg-[#ffffff] border-purple-300'
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
                                );
                              })}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
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