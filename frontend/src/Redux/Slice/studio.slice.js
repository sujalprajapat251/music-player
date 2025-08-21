import { createSlice } from '@reduxjs/toolkit';
import { getNextTrackColor, resetColorIndex } from '../../Utils/colorUtils';
import { drumMachineTypes } from '../../Utils/drumMachineUtils';
import WavEncoder from 'wav-encoder';
const initialState = {
  tracks: [],
  trackHeight: 70, // Standard height for each track
  timelineSettings: {
    pixelsPerSecond: 50,
    maxDuration: 10,
  },
  patternDrumPlayback: {}, // Track which pattern drum clips are playing
  patternDrumEvents: {},
  // Track effects and plugins state
  trackEffects: {}, // Store effects for each track
  frozenTrackData: {}, // Store processed audio data for frozen tracks
  pianoRecord: [],
  pianoNotes: [], // <-- Add this line for piano roll note data
  pianoRecordingClip: null, // transient info for background of last recording
  isRecording: false,
  newtrackType: '',
  currentTrackId: null,
  soloTrackId: null,
  sidebarScrollOffset: 0,
  // Section labels state
  sectionLabels: [],
  // Audio playback state
  isPlaying: false,
  currentTime: 0,
  audioDuration: 500,
  masterVolume: 80, // Master volume control
  recordedData: [], // New state for recorded data
  masterVolume: 80,// Master volume control
  bpm: 120,
  drumDataProcessed: false,
  drumRecordedData: [], // Store drum pad recordings
  isPlayingDrumRecording: false, // Track if playing back drum recording
  drumPlaybackStartTime: null, // Track when drum playback started
  // TimelineTrack specific state
  selectedClipId: null,
  selectedTrackId: null,
  // Key and Scale Selection state
  selectedKey: null,
  selectedScale: null,
  highlightedPianoKeys: [], // Array of MIDI note numbers to highlight
  selectedSound: 'Click',
};

const studioSlice = createSlice({
  name: 'studio',
  initialState,
  reducers: {
    setTracks: (state, action) => {
      state.tracks = action.payload;
      console.log('all trackid', action.payload);
    },
    addTrack: (state, action) => {
      // Ensure new tracks have frozen property, audioClips array, and a unique color
      const track = {
        ...action.payload,
        frozen: false,
        muted: false,
        volume: action.payload.volume || 80, // Set individual track volume (default 80)
        color: action.payload.color || getNextTrackColor(), // Assign unique color
        audioClips: action.payload.audioClips || [] // Array to hold multiple audio clips
      };
      state.tracks.push(track);
    },
    updateTrack: (state, action) => {
      const { id, updates } = action.payload;
      const trackIndex = state.tracks.findIndex(track => track.id === id);
      if (trackIndex !== -1) {
        state.tracks[trackIndex] = { ...state.tracks[trackIndex], ...updates };
      }
    },
    // New action to add audio clip to existing track
    addAudioClipToTrack: (state, action) => {
      console.log("-------------------------------audio", action.payload)
      const { trackId, audioClip } = action.payload;
      const trackIndex = state.tracks.findIndex(track => track.id == trackId); // Use == for type coercion
      if (trackIndex !== -1) {
        if (!state.tracks[trackIndex].audioClips) {
          state.tracks[trackIndex].audioClips = [];
        }
        const newClip = {
          id: Date.now() + Math.random(), // Unique ID for the clip
          color: audioClip.color || state.tracks[trackIndex].color || '#FFB6C1', // Use track's color as fallback
          ...audioClip
        };
        state.tracks[trackIndex].audioClips.push(newClip);
      }
    },
    // New action to update specific audio clip in a track
    updateAudioClip: (state, action) => {
      const { trackId, clipId, updates } = action.payload;
      const trackIndex = state.tracks.findIndex(track => track.id === trackId);
      if (trackIndex !== -1 && state.tracks[trackIndex].audioClips) {
        const clipIndex = state.tracks[trackIndex].audioClips.findIndex(clip => clip.id === clipId);
        if (clipIndex !== -1) {
          state.tracks[trackIndex].audioClips[clipIndex] = {
            ...state.tracks[trackIndex].audioClips[clipIndex],
            ...updates
          };
        }
      }
    },
    // New action to remove audio clip from track
    removeAudioClip: (state, action) => {
      const { trackId, clipId } = action.payload;
      const trackIndex = state.tracks.findIndex(track => track.id === trackId);
      if (trackIndex !== -1 && state.tracks[trackIndex].audioClips) {
        state.tracks[trackIndex].audioClips = state.tracks[trackIndex].audioClips.filter(
          clip => clip.id !== clipId
        );
      }
    },
    removeTrack: (state, action) => {
      const trackId = action.payload;
      // Find the track first to ensure it exists
      const trackIndex = state.tracks.findIndex(track => track.id === trackId);
      if (trackIndex !== -1) {
        // Remove the track
        state.tracks.splice(trackIndex, 1);
        // Clean up related data
        delete state.trackEffects[trackId];
        delete state.frozenTrackData[trackId];
      }
    },
    setTrackHeight: (state, action) => {
      state.trackHeight = action.payload;
      // Update all existing tracks
      state.tracks.forEach(track => {
        track.height = action.payload;
      });
    },
    updateTimelineSettings: (state, action) => {
      state.timelineSettings = { ...state.timelineSettings, ...action.payload };
    },
    updateTrackStartTime: (state, action) => {
      const { trackId, newStartTime } = action.payload;
      const trackIndex = state.tracks.findIndex(track => track.id === trackId);
      if (trackIndex !== -1) {
        state.tracks[trackIndex].startTime = newStartTime;
      }
    },
    renameTrack: (state, action) => {
      const { trackId, newName } = action.payload;
      const trackIndex = state.tracks.findIndex(track => track.id === trackId);
      if (trackIndex !== -1) {
        state.tracks[trackIndex].name = newName;
      }
    },
    freezeTrack: (state, action) => {
      const trackId = action.payload;
      const trackIndex = state.tracks.findIndex(track => track.id === trackId);
      if (trackIndex !== -1) {
        state.tracks[trackIndex].frozen = !state.tracks[trackIndex].frozen;
      }
    },
    duplicateTrack: (state, action) => {
      const trackId = action.payload;
      const originalTrack = state.tracks.find(track => track.id === trackId);
      if (originalTrack) {
        // Create a new track with a unique ID and "Copy" suffix
        const duplicatedTrack = {
          ...originalTrack,
          id: Date.now().toString(), // Generate unique ID
          name: `${originalTrack.name}`,
          startTime: originalTrack.startTime || 0,
          frozen: false, // Reset frozen state for the copy
          color: getNextTrackColor(), // Assign new unique color
          audioClips: originalTrack.audioClips ? [...originalTrack.audioClips] : [] // Copy audio clips
        };

        // Add the duplicated track to the tracks array
        state.tracks.push(duplicatedTrack);

        // Copy effects if they exist
        if (state.trackEffects[trackId]) {
          state.trackEffects[duplicatedTrack.id] = { ...state.trackEffects[trackId] };
        }
      }
    },
    updateTrackAudio: (state, action) => {
      const { trackId, audioData } = action.payload;
      const track = state.tracks.find(track => track.id === trackId);
      if (track) {
        // Update track with audio data - now adds to audioClips array
        if (!track.audioClips) {
          track.audioClips = [];
        }

        const newClip = {
          id: Date.now() + Math.random(),
          url: audioData.url,
          name: audioData.name || 'New Clip',
          duration: audioData.duration,
          trimStart: audioData.trimStart || 0,
          trimEnd: audioData.duration || audioData.trimEnd,
          soundData: audioData.soundData || null,
          color: audioData.color || track.color || '#FFB6C1', // Use track's color as fallback
          startTime: audioData.startTime || 0,
          frozen: audioData.frozen || false
        };

        track.audioClips.push(newClip);
      }
    },
    setRecordingAudio: (state, action) => {
      state.pianoRecord = action.payload;
    },
    setRecording: (state, action) => {
      state.isRecording = action.payload;
    },
    setRecordedData: (state, action) => {
      state.recordedData = action.payload;
    },
    setTrackType: (state, action) => {
      state.newtrackType = action.payload;
    },
    setCurrentTrackId: (state, action) => {
      state.currentTrackId = action.payload;
      console.log('jsdbfjkasdjfjsdfjasdfkadfbhjksjhkshkfkj', action.payload);
    },
    toggleMuteTrack: (state, action) => {
      const trackId = action.payload;
      const track = state.tracks.find(track => track.id === trackId);
      if (track) {
        track.muted = !track.muted;
      }
    },
    setSoloTrackId: (state, action) => {
      state.soloTrackId = action.payload;
    },
    exportTrack: (state, action) => {
      // This is just a placeholder action for tracking export events
      // The actual export logic will be handled in the component
      return state;
    },
    setSidebarScrollOffset: (state, action) => {
      state.sidebarScrollOffset = action.payload;
    },
    // Section labels actions
    addSectionLabel: (state, action) => {
      const newSection = {
        id: Date.now() + Math.random(), // Ensure unique ID
        startTime: 0,
        endTime: 10,
        position: 0,
        width: 100,
        name: 'New Section',
        ...action.payload
      };
      state.sectionLabels.push(newSection);
    },
    updateSectionLabel: (state, action) => {
      const { id, updates } = action.payload;
      const sectionIndex = state.sectionLabels.findIndex(section => section.id === id);
      if (sectionIndex !== -1) {
        state.sectionLabels[sectionIndex] = { ...state.sectionLabels[sectionIndex], ...updates };
      }
    },
    removeSectionLabel: (state, action) => {
      const sectionId = action.payload;
      state.sectionLabels = state.sectionLabels.filter(section => section.id !== sectionId);
    },
    setSectionLabels: (state, action) => {
      state.sectionLabels = action.payload;
    },
    // New action for resizing section labels
    resizeSectionLabel: (state, action) => {
      const { sectionId, newWidth, newStartTime, newEndTime, newPosition } = action.payload;
      const sectionIndex = state.sectionLabels.findIndex(section => section.id === sectionId);
      if (sectionIndex !== -1) {
        const section = state.sectionLabels[sectionIndex];
        section.width = newWidth;
        section.startTime = newStartTime;
        section.endTime = newEndTime;
        section.position = newPosition || (newStartTime / state.audioDuration) * 100;
      }
    },
    // New action for moving section labels
    moveSectionLabel: (state, action) => {
      const { sectionId, newStartTime, newEndTime, newPosition } = action.payload;
      const sectionIndex = state.sectionLabels.findIndex(section => section.id === sectionId);
      if (sectionIndex !== -1) {
        const section = state.sectionLabels[sectionIndex];
        const duration = section.endTime - section.startTime;
        section.startTime = newStartTime;
        section.endTime = newEndTime || (newStartTime + duration);
        section.position = newPosition || (newStartTime / state.audioDuration) * 100;
      }
    },
    // Audio playback actions
    setPlaying: (state, action) => {
      state.isPlaying = action.payload;
    },
    setCurrentTime: (state, action) => {
      state.currentTime = action.payload;
    },
    setAudioDuration: (state, action) => {
      state.audioDuration = action.payload;
    },
    togglePlayPause: (state) => {
      state.isPlaying = !state.isPlaying;
    },
    resetTrackColors: (state) => {
      // Reset the color index to start from the beginning
      resetColorIndex();
    },
    // Volume management actions
    setMasterVolume: (state, action) => {
      state.masterVolume = action.payload;
    },
    setBPM: (state, action) => {
      state.bpm = action.payload;
    },
    setTrackVolume: (state, action) => {
      const { trackId, volume } = action.payload;
      const trackIndex = state.tracks.findIndex(track => track.id === trackId);
      if (trackIndex !== -1) {
        state.tracks[trackIndex].volume = Math.max(0, Math.min(100, volume));
      }
    },
    setDrumRecordedData: (state, action) => {
      console.log("=====================", action.payload)
      state.drumRecordedData = action.payload;
    },
    setDrumPlayback: (state, action) => {
      state.isPlayingDrumRecording = action.payload;
    },
    setDrumPlaybackStartTime: (state, action) => {
      state.drumPlaybackStartTime = action.payload;
    },
    setDrumDataProcessed: (state, action) => {
      state.drumDataProcessed = action.payload;
    },
    // TimelineTrack specific actions
    setSelectedClip: (state, action) => {
      state.selectedClipId = action.payload;
    },
    setSelectedTrack: (state, action) => {
      state.selectedTrackId = action.payload;
    },
    updateClipPosition: (state, action) => {
      const { trackId, clipId, startTime } = action.payload;
      const trackIndex = state.tracks.findIndex(track => track.id === trackId);
      if (trackIndex !== -1 && state.tracks[trackIndex].audioClips) {
        const clipIndex = state.tracks[trackIndex].audioClips.findIndex(clip => clip.id === clipId);
        if (clipIndex !== -1) {
          state.tracks[trackIndex].audioClips[clipIndex].startTime = startTime;
        }
      }
    },
    updateClipTrim: (state, action) => {
      const { trackId, clipId, trimStart, trimEnd, newStartTime } = action.payload;
      const trackIndex = state.tracks.findIndex(track => track.id === trackId);
      if (trackIndex !== -1 && state.tracks[trackIndex].audioClips) {
        const clipIndex = state.tracks[trackIndex].audioClips.findIndex(clip => clip.id === clipId);
        if (clipIndex !== -1) {
          const clip = state.tracks[trackIndex].audioClips[clipIndex];
          if (trimStart !== undefined) clip.trimStart = trimStart;
          if (trimEnd !== undefined) clip.trimEnd = trimEnd;
          if (newStartTime !== undefined) clip.startTime = newStartTime;
        }
      }
    },
    addPianoNote: (state, action) => {
      state.pianoNotes.push(action.payload);
    },
    setPianoNotes: (state, action) => {
      state.pianoNotes = action.payload;
    },
    clearPianoNotes: (state) => {
      state.pianoNotes = [];
    },
    setPianoRecordingClip: (state, action) => {
      state.pianoRecordingClip = action.payload; // {start, end, color}
    },

    // Key and Scale Selection actions
    setSelectedKey: (state, action) => {
      state.selectedKey = action.payload;
    },

    setSelectedScale: (state, action) => {
      state.selectedScale = action.payload;
    },

    setHighlightedPianoKeys: (state, action) => {
      state.highlightedPianoKeys = action.payload;
    },

    clearKeyScaleSelection: (state) => {
      state.selectedKey = null;
      state.selectedScale = null;
      state.highlightedPianoKeys = [];
    },
    setMetronomeSound(state, action) {
      state.selectedSound = action.payload;
    },
    // Add these new actions after your existing actions
    setPatternDrumPlayback: (state, action) => {
      const { trackId, clipId, isPlaying: isDrumPlaying } = action.payload;
      if (!state.patternDrumPlayback) {
        state.patternDrumPlayback = {};
      }
      if (!state.patternDrumPlayback[trackId]) {
        state.patternDrumPlayback[trackId] = {};
      }
      state.patternDrumPlayback[trackId][clipId] = isDrumPlaying;
    },

    setPatternDrumEvents: (state, action) => {
      const { trackId, clipId, drumEvents } = action.payload;
      if (!state.patternDrumEvents) {
        state.patternDrumEvents = {};
      }
      if (!state.patternDrumEvents[trackId]) {
        state.patternDrumEvents[trackId] = {};
      }
      state.patternDrumEvents[trackId][clipId] = drumEvents;
    },

  },
});

export const {
  setTracks,
  addTrack,
  updateTrack,
  addAudioClipToTrack,
  updateAudioClip,
  removeAudioClip,
  removeTrack,
  setTrackHeight,
  updateTimelineSettings,
  updateTrackStartTime,
  renameTrack,
  freezeTrack,
  duplicateTrack,
  updateTrackAudio,
  exportTrack,
  setRecordingAudio,
  setRecording,
  setRecordedData,
  setTrackType,
  setCurrentTrackId,
  toggleMuteTrack,
  setSoloTrackId,
  setSidebarScrollOffset,
  addSectionLabel,
  updateSectionLabel,
  removeSectionLabel,
  setSectionLabels,
  resizeSectionLabel,
  moveSectionLabel,
  setPlaying,
  setCurrentTime,
  setAudioDuration,
  togglePlayPause,
  resetTrackColors,
  setMasterVolume,
  setBPM,
  setTrackVolume,
  drumDataProcessed,
  setDrumRecordedData,
  setDrumPlayback,
  setDrumPlaybackStartTime,
  setSelectedClip,
  setSelectedTrack,
  updateClipPosition,
  updateClipTrim,
  addPianoNote, // <-- Export new actions
  setPianoNotes,
  clearPianoNotes,
  setPianoRecordingClip,
  setSelectedKey,
  setSelectedScale,
  setHighlightedPianoKeys,
  clearKeyScaleSelection,
  setMetronomeSound,
  setPatternDrumPlayback,
  setPatternDrumEvents,
} = studioSlice.actions;

export default studioSlice.reducer;

// === Pattern → Timeline sync via Redux thunks (centralized in Redux) ===
// These thunks enable real-time placement/removal of tiny clips on the selected
// track when a 16th-note beat is toggled in the Pattern grid, without touching Timeline.

const PATTERN_SAMPLE_MAP = {
  Q: '/Audio/kick_1.mp3',
  W: '/Audio/snare.mp3',
  E: '/Audio/hat_closed.mp3',
};

const SOUND_SAMPLE_MAP = {
  Q: '/Audio/kick_1.mp3',
  W: '/Audio/snare.mp3',
  E: '/Audio/hat_closed.mp3',
};

const getSampleUrlForPadFromRedux = (padId) => {
  if (PATTERN_SAMPLE_MAP[padId]) return PATTERN_SAMPLE_MAP[padId];
  // Try to resolve by sound name using shared drum machine definitions
  try {
    for (const kit of drumMachineTypes || []) {
      const pad = kit?.pads?.find(p => p.id === padId);
      if (pad) {
        const url = SOUND_SAMPLE_MAP[pad.sound];
        return url || '/Audio/perc.mp3';
      }
    }
  } catch (_) { }
  return '/Audio/perc.mp3';
};
const beatIndexToSecondsFromRedux = (beatIndex, bpm) => beatIndex * (60 / bpm / 4);

export const syncPatternBeat = ({ trackId, padId, beatIndex, bpm, isOn, clipColor = '#FFB6C1' }) => async (dispatch, getState) => {
  if (trackId === undefined || trackId === null) return;

  const eps = 1e-6;
  const cellDuration = 60 / bpm / 4; // one 16th-note
  const sectionIndex = Math.floor(beatIndex / 16);
  const slotIndex = beatIndex % 16;
  const blockStart = sectionIndex * 16 * cellDuration;
  const blockDuration = 16 * cellDuration;
  const slotStart = blockStart + slotIndex * cellDuration;

  // Resolve pad meta (for playback)
  const resolvePadMeta = (id) => {
    try {
      for (const kit of drumMachineTypes || []) {
        const pad = kit?.pads?.find(p => p.id === id);
        if (pad) {
          const { sound, type, freq, decay } = pad;
          return { sound, type, freq, decay, drumMachine: kit.name };
        }
      }
    } catch (_) { }
    return { sound: 'perc', type: 'perc', freq: 1000, decay: 0.2 };
  };

  const state = getState();
  const track = state.studio?.tracks?.find(t => t.id == trackId);
  const clips = (track?.audioClips || []).filter(c => c?.fromPattern === true);

  // Find the single container for this 16-beat section
  const isContainer = (c) =>
    c?.blockIndex === sectionIndex &&
    Math.abs((c?.startTime ?? -1) - blockStart) < eps &&
    Math.abs((c?.duration ?? 0) - blockDuration) < eps;

  const container = clips.find(isContainer);

  if (isOn) {
    if (container) {
      const byPad = { ...(container.onBeatsByPad || {}) };
      const seq = Array.isArray(container.drumSequence) ? [...container.drumSequence] : [];

      // migrate legacy onBeats if present
      if (Array.isArray(container.onBeats)) {
        const legacyPad = container.padId || 'LEGACY';
        const migrated = new Set([...(byPad[legacyPad] || []), ...container.onBeats]);
        byPad[legacyPad] = Array.from(migrated);
      }

      // upsert event at this slot
      const meta = resolvePadMeta(padId);
      const idx = seq.findIndex(ev => Math.abs((ev?.currentTime ?? -1) - slotStart) < eps);
      const event = { currentTime: slotStart, padId, ...meta };
      if (idx >= 0) {
        seq[idx] = event; // overwrite slot
      } else {
        seq.push(event);
      }

      const set = new Set(byPad[padId] || []);
      set.add(beatIndex);
      byPad[padId] = Array.from(set);

      dispatch(updateAudioClip({
        trackId,
        clipId: container.id,
        updates: {
          drumSequence: seq,
          onBeatsByPad: byPad,
          blockIndex: sectionIndex,
          blockSize: 16
        }
      }));

      // Regenerate waveform for this section
      await regenWaveForSection(dispatch, getState, { trackId, sectionIndex, blockStart, blockDuration });
      return;
    }

    // Create the single section container (no waveform yet)
    const meta = resolvePadMeta(padId);
    const audioClip = {
      name: `Section ${sectionIndex + 1}`,
      color: clipColor,
      startTime: blockStart,
      duration: blockDuration,
      trimStart: 0,
      trimEnd: blockDuration,
      type: 'drum',
      fromPattern: true,
      blockIndex: sectionIndex,
      blockSize: 16,
      onBeatsByPad: { [padId]: [beatIndex] },
      drumSequence: [
        { currentTime: slotStart, padId, ...meta }
      ],
    };
    dispatch(addAudioClipToTrack({ trackId, audioClip }));

    // Regenerate waveform for this section (find container by section fields)
    await regenWaveForSection(dispatch, getState, { trackId, sectionIndex, blockStart, blockDuration });
    return;
  }

  // Turning OFF: remove only this slot; drop container if empty
  if (!container) return;

  const byPad = { ...(container.onBeatsByPad || {}) };
  const seq = Array.isArray(container.drumSequence) ? [...container.drumSequence] : [];
  const newSeq = seq.filter(ev => !(Math.abs((ev?.currentTime ?? -1) - slotStart) < eps && (ev?.padId ?? padId) === padId));

  if (byPad[padId]) {
    const set = new Set(byPad[padId]);
    set.delete(beatIndex);
    if (set.size === 0) delete byPad[padId];
    else byPad[padId] = Array.from(set);
  } else if (Array.isArray(container.onBeats)) {
    // Legacy cleanup
    const nextLegacy = container.onBeats.filter(b => b !== beatIndex);
    if (nextLegacy.length === 0 && Object.keys(byPad).length === 0 && newSeq.length === 0) {
      dispatch(removeAudioClip({ trackId, clipId: container.id }));
      return;
    }
    dispatch(updateAudioClip({ trackId, clipId: container.id, updates: { onBeats: nextLegacy, drumSequence: newSeq } }));
    await regenWaveForSection(dispatch, getState, { trackId, sectionIndex, blockStart, blockDuration });
    return;
  }

  if (Object.keys(byPad).length === 0 && newSeq.length === 0) {
    dispatch(removeAudioClip({ trackId, clipId: container.id }));
  } else {
    dispatch(updateAudioClip({ trackId, clipId: container.id, updates: { onBeatsByPad: byPad, drumSequence: newSeq } }));
    await regenWaveForSection(dispatch, getState, { trackId, sectionIndex, blockStart, blockDuration });
  }
};

export const clearPatternClips = (trackId) => (dispatch, getState) => {
  const state = getState();
  const track = state.studio?.tracks?.find(t => t.id == trackId);
  if (!track?.audioClips) return;
  track.audioClips
    .filter(c => c?.fromPattern === true)
    .forEach(c => dispatch(removeAudioClip({ trackId, clipId: c.id })));
};

export const syncWholePatternToTimeline = ({ trackId, patternRows, bpm }) => (dispatch) => {
  if (!trackId || !Array.isArray(patternRows)) return;
  dispatch(clearPatternClips(trackId));
  patternRows.forEach(row => {
    const { padId, pattern } = row || {};
    if (!padId || !Array.isArray(pattern)) return;
    pattern.forEach((isOn, beatIndex) => {
      if (!isOn) return;
      dispatch(syncPatternBeat({ trackId, padId, beatIndex, bpm, isOn: true }));
    });
  });
};

async function buildPatternWav({ drumSequence = [], blockStart = 0, blockDuration = 1 }) {
  try {
    const sampleRate = 44100;
    const length = Math.max(1, Math.floor(blockDuration * sampleRate));
    const ch = new Float32Array(length);

    // Process each drum hit with actual drum sounds from drumMachineUtils
    for (const ev of drumSequence) {
      const tRel = Math.max(0, (ev.currentTime - blockStart));
      const idx = Math.floor(tRel * sampleRate);

      if (idx >= 0 && idx < length) {
        // Create drum sound using the drum machine utilities
        const drumSound = await createDrumSoundFromPattern(ev, sampleRate, length - idx);

        // Mix the drum sound into the output buffer
        for (let n = 0; n < drumSound.length && (idx + n) < length; n++) {
          ch[idx + n] += drumSound[n] * 0.8; // Prevent clipping
        }
      }
    }

    // Soft limit to avoid clipping
    for (let i = 0; i < length; i++) {
      ch[i] = Math.max(-1, Math.min(1, Math.tanh(ch[i])));
    }

    const wavBuffer = await WavEncoder.encode({
      sampleRate,
      channelData: [ch]
    });
    const blob = new Blob([wavBuffer], { type: 'audio/wav' });
    const url = URL.createObjectURL(blob);
    return { url };
  } catch (e) {
    console.warn('Pattern WAV build failed:', e);
    return { url: null };
  }
}



async function createDrumSoundFromPattern(drumEvent, sampleRate, maxLength) {
  const { padId, type, freq, decay } = drumEvent;

  // Find the drum machine pad data from drumMachineUtils
  let padData = null;
  for (const kit of drumMachineTypes) {
    const pad = kit.pads.find(p => p.id === padId);
    if (pad) {
      padData = pad;
      break;
    }
  }

  if (!padData) {
    // Fallback to synthetic sound
    return createSyntheticDrumSound(type, freq, decay, sampleRate, maxLength);
  }

  // Try to load actual drum sample first
  try {
    const sampleUrl = await getDrumSampleUrl(padData);
    if (sampleUrl) {
      return await loadAndProcessDrumSample(sampleUrl, sampleRate, maxLength, decay);
    }
  } catch (e) {
    console.warn('Failed to load drum sample, falling back to synthetic:', e);
  }

  // Fallback to enhanced synthetic sound using drumMachineUtils parameters
  return createEnhancedSyntheticDrumSound(padData, sampleRate, maxLength);
}



// Function to get drum sample URL based on pad data from drumMachineUtils
async function getDrumSampleUrl(padData) {
  // Map drum types to sample files in your public/Audio folder
  const sampleMap = {
    'kick': '/Audio/kick_1.mp3',
    'snare': '/Audio/snare.mp3',
    'hihat': '/Audio/hat_closed.mp3',
    'openhat': '/Audio/hat_open.mp3',
    'clap': '/Audio/clap.mp3',
    'crash': '/Audio/crash.mp3',
    'ride': '/Audio/ride.mp3',
    'tom': '/Audio/tom.mp3',
    'cowbell': '/Audio/cowbell.mp3',
    'perc': '/Audio/perc.mp3',
    'perc1': '/Audio/perc.mp3',
    'bass': '/Audio/kick_1.mp3' // Use kick for bass
  };

  return sampleMap[padData.type] || sampleMap[padData.sound] || null;
}


// Function to load and process drum samples
async function loadAndProcessDrumSample(sampleUrl, sampleRate, maxLength, decay) {
  try {
    const response = await fetch(sampleUrl);
    const arrayBuffer = await response.arrayBuffer();
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

    // Get the first channel data
    const originalData = audioBuffer.getChannelData(0);
    const originalLength = originalData.length;

    // Calculate target length based on decay from drumMachineUtils
    const targetLength = Math.min(maxLength, Math.floor(decay * sampleRate));

    // Create output buffer
    const output = new Float32Array(targetLength);

    // Copy and apply decay envelope
    for (let i = 0; i < targetLength; i++) {
      if (i < originalLength) {
        const decayEnvelope = Math.exp(-i / (decay * sampleRate));
        output[i] = originalData[i] * decayEnvelope;
      } else {
        output[i] = 0;
      }
    }

    return output;
  } catch (e) {
    console.warn('Failed to load drum sample:', e);
    return new Float32Array(maxLength).fill(0);
  }
}


// Enhanced synthetic drum sound generation using drumMachineUtils parameters
function createEnhancedSyntheticDrumSound(padData, sampleRate, maxLength) {
  const { type, freq, decay } = padData;
  const output = new Float32Array(maxLength);
  const decaySamples = Math.floor(decay * sampleRate);

  switch (type) {
    case 'kick': {
      for (let i = 0; i < decaySamples && i < maxLength; i++) {
        const t = i / sampleRate;
        const envelope = Math.exp(-t / decay);
        const freqSweep = freq * Math.exp(-t * 2);
        output[i] = Math.sin(2 * Math.PI * freqSweep * t) * envelope * 0.8;
      }
      break;
    }

    case 'snare': {
      for (let i = 0; i < decaySamples && i < maxLength; i++) {
        const t = i / sampleRate;
        const envelope = Math.exp(-t / decay);
        const noise = (Math.random() * 2 - 1) * 0.5;
        const tone = Math.sin(2 * Math.PI * freq * t) * 0.3;
        output[i] = (noise + tone) * envelope * 0.6;
      }
      break;
    }

    case 'hihat': {
      for (let i = 0; i < decaySamples && i < maxLength; i++) {
        const t = i / sampleRate;
        const envelope = Math.exp(-t / decay);
        const noise = (Math.random() * 2 - 1) * 0.4;
        output[i] = noise * envelope * 0.5;
      }
      break;
    }

    case 'openhat': {
      for (let i = 0; i < decaySamples && i < maxLength; i++) {
        const t = i / sampleRate;
        const envelope = Math.exp(-t / decay);
        const noise = (Math.random() * 2 - 1) * 0.3;
        const ring = Math.sin(2 * Math.PI * freq * t) * 0.2;
        output[i] = (noise + ring) * envelope * 0.4;
      }
      break;
    }

    case 'clap': {
      for (let i = 0; i < decaySamples && i < maxLength; i++) {
        const t = i / sampleRate;
        const envelope = Math.exp(-t / decay);
        const noise = (Math.random() * 2 - 1) * 0.4;
        output[i] = noise * envelope * 0.5;
      }
      break;
    }

    case 'cowbell': {
      for (let i = 0; i < decaySamples && i < maxLength; i++) {
        const t = i / sampleRate;
        const envelope = Math.exp(-t / decay);
        const fundamental = Math.sin(2 * Math.PI * freq * t);
        const harmonic = Math.sin(2 * Math.PI * freq * 1.5 * t);
        output[i] = (fundamental + harmonic * 0.5) * envelope * 0.4;
      }
      break;
    }

    case 'tom': {
      for (let i = 0; i < decaySamples && i < maxLength; i++) {
        const t = i / sampleRate;
        const envelope = Math.exp(-t / decay);
        const freqSweep = freq * Math.exp(-t * 1.5);
        output[i] = Math.sin(2 * Math.PI * freqSweep * t) * envelope * 0.6;
      }
      break;
    }

    case 'crash':
    case 'ride': {
      for (let i = 0; i < decaySamples && i < maxLength; i++) {
        const t = i / sampleRate;
        const envelope = Math.exp(-t / decay);
        const noise = (Math.random() * 2 - 1) * 0.3;
        const ring1 = Math.sin(2 * Math.PI * freq * t);
        const ring2 = Math.sin(2 * Math.PI * freq * 1.5 * t);
        output[i] = (noise + ring1 * 0.4 + ring2 * 0.2) * envelope * 0.4;
      }
      break;
    }

    default: {
      for (let i = 0; i < decaySamples && i < maxLength; i++) {
        const t = i / sampleRate;
        const envelope = Math.exp(-t / decay);
        output[i] = Math.sin(2 * Math.PI * freq * t) * envelope * 0.4;
      }
    }
  }

  return output;
}


// Keep the original synthetic function as fallback
function createSyntheticDrumSound(type, freq, decay, sampleRate, maxLength) {
  const output = new Float32Array(maxLength);
  const decaySamples = Math.floor(decay * sampleRate);

  for (let i = 0; i < decaySamples && i < maxLength; i++) {
    const t = i / sampleRate;
    const envelope = Math.exp(-t / decay);
    const sample = Math.sin(2 * Math.PI * freq * t) * envelope * 0.8;
    output[i] = sample;
  }

  return output;
}



// Ensure the pattern container clip (single section) has an up-to-date waveform URL
async function regenWaveForSection(dispatch, getState, { trackId, sectionIndex, blockStart, blockDuration }) {
  const state = getState();
  const track = state.studio?.tracks?.find(t => t.id == trackId);
  if (!track?.audioClips) return;

  const eps = 1e-6;
  const container = track.audioClips.find(c =>
    c?.fromPattern === true &&
    c?.blockIndex === sectionIndex &&
    Math.abs((c?.startTime ?? -1) - blockStart) < eps &&
    Math.abs((c?.duration ?? 0) - blockDuration) < eps
  );
  if (!container) return;
  const drumSequence = Array.isArray(container.drumSequence) ? container.drumSequence : [];
  if (drumSequence.length === 0) {
    // If empty, remove url to avoid drawing waveform
    dispatch(updateAudioClip({
      trackId,
      clipId: container.id,
      updates: { url: null }
    }));
    return;
  }
  const { url } = await buildPatternWav({ drumSequence, blockStart, blockDuration });
  if (url) {
    dispatch(updateAudioClip({
      trackId,
      clipId: container.id,
      updates: {
        url,
        duration: blockDuration,
        trimStart: 0,
        trimEnd: blockDuration
      }
    }));
  }
}


// ... existing code ...

// Add this new thunk after your existing thunks
export const triggerPatternDrumPlayback = ({ trackId, clipId, currentTime }) => async (dispatch, getState) => {
  const state = getState();
  const track = state.studio?.tracks?.find(t => t.id === trackId);
  if (!track?.audioClips) return;

  const clip = track.audioClips.find(c => c.id === clipId);
  if (!clip || !clip.fromPattern || !clip.drumSequence) return;

  // Check if this clip should be playing at current time
  const clipStart = clip.startTime || 0;
  const clipEnd = clipStart + (clip.duration || 0);

  if (currentTime >= clipStart && currentTime <= clipEnd) {
    // Find drum events that should trigger at this time
    const drumEvents = clip.drumSequence.filter(event => {
      const eventTime = clipStart + (event.currentTime - (clip.startTime || 0));
      const tolerance = 0.05; // 50ms tolerance
      return Math.abs(currentTime - eventTime) <= tolerance;
    });

    if (drumEvents.length > 0) {
      // Mark this clip as playing drums
      dispatch(setPatternDrumPlayback({ trackId, clipId, isPlaying: true }));

      // Store the drum events for this time
      dispatch(setPatternDrumEvents({ trackId, clipId, drumEvents }));

      // Schedule to stop playing after a short delay
      setTimeout(() => {
        dispatch(setPatternDrumPlayback({ trackId, clipId, isPlaying: false }));
      }, 100);
    }
  }
};

// ... existing code ...