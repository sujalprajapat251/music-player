import { createSlice } from '@reduxjs/toolkit';
import { getNextTrackColor, resetColorIndex } from '../../Utils/colorUtils';
import { drumMachineTypes } from '../../Utils/drumMachineUtils';
import WavEncoder from 'wav-encoder';
import { selectStudioState } from '../rootReducer';
import { setAlert } from './alert.slice';

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
  bpm: 120,
  drumDataProcessed: false,
  drumRecordedData: [], // Store drum pad recordings
  isPlayingDrumRecording: false, // Track if playing back drum recording
  drumPlaybackStartTime: null, // Track when drum playback started
  drumRecordingClip: null, // transient info for background of last drum recording
  // TimelineTrack specific state
  selectedClipId: null,
  selectedTrackId: null,
  // Key and Scale Selection state
  selectedKey: null,
  selectedScale: null,
  highlightedPianoKeys: [], // Array of MIDI note numbers to highlight
  selectedSound: 'Click',
  soundQuality: 'High', // Add this line
  selectedInstrument: 'acoustic_grand_piano', // Default instrument for piano
  // Store drum kit by name to match drumMachineTypes entries
  selectedDrumInstrument: 'Classic 808',
  trackDeleted: null,
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
      console.log(">>>>>>>>>>>>>>>>>>>>>>>>", action.payload)
      // Ensure new tracks have frozen property, audioClips array, and a unique color
      const track = {
        ...action.payload,
        frozen: false,
        muted: false,
        volume: action.payload.volume || 80, // Set individual track volume (default 80)
        color: action.payload.color || getNextTrackColor(), // Assign unique color
        audioClips: action.payload.audioClips || [], // Array to hold multiple audio clips
        pianoNotes: Array.isArray(action.payload.pianoNotes) ? action.payload.pianoNotes : [],
        pianoClip: action.payload.pianoClip || null,
        nametype: action.payload.nametype || (action.payload.type === 'Keys' ? 'Piano' : action.payload.name),
        nametypeLocked: !!action.payload.nametypeLocked
      };
      state.tracks.push(track);
      console.log('tracktracktracktrack', track);
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

        state.pianoNotes = (state.pianoNotes || []).filter(n => n?.trackId != trackId);
        state.guitarNotes = (state.guitarNotes || []).filter(n => n?.trackId != trackId);
        state.drumRecordedData = (state.drumRecordedData || []).filter(n => n?.trackId != trackId);

        if (state.pianoRecordingClip?.trackId == trackId) {
          state.pianoRecordingClip = null;
        }
        if (state.guitarRecordingClip?.trackId == trackId) {
          state.guitarRecordingClip = null;
        }
        if (state.drumRecordingClip?.trackId == trackId) {
          state.drumRecordingClip = null;
        }

        // Set flag to indicate track was deleted for audio cleanup
        state.trackDeleted = { trackId, timestamp: Date.now() };
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
      console.log("delelellele",action.payload)
      const trackIndex = state.tracks.findIndex(track => track.id === trackId);
      if (trackIndex !== -1) {
        state.tracks[trackIndex].nametype = newName;
        state.tracks[trackIndex].nametypeLocked = true;
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
      console.log('pianoRecordpianoRecordpianoRecord', action.payload);
    },
    setTrackType: (state, action) => {
      state.newtrackType = action.payload;
    },
    setCurrentTrackId: (state, action) => {
      state.currentTrackId = action.payload;
      // console.log('jsdbfjkasdjfjsdfjasdfkadfbhjksjhkshkfkj', action.payload);
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
      // This action is handled by the thunk, just return state
      return state;
    },
    setSidebarScrollOffset: (state, action) => {
      state.sidebarScrollOffset = action.payload;
    },
    addSectionLabel: (state, action) => {
      const newSection = {
        id: Date.now() + Math.random(),
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
      resetColorIndex();
    },
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
      // console.log("=====================", action.payload)
      state.drumRecordedData = action.payload;
    },
    updateDrumRecordedData: (state, action) => {
      // Update drum recorded data with shifted times
      const { delta } = action.payload;
      state.drumRecordedData = state.drumRecordedData.map(hit => ({
        ...hit,
        currentTime: Math.max(0, (hit.currentTime || 0) + delta)
      }));
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
      console.log("action.payload :: > ", action.payload)
      state.pianoNotes.push(action.payload);
      const t = state.tracks.find(tr => tr.id == action.payload?.trackId);
      if (t) {
        if (!Array.isArray(t.pianoNotes)) t.pianoNotes = [];
        t.pianoNotes.push(action.payload);
      }
    },
    setPianoNotes: (state, action) => {
      // Global storage
      state.pianoNotes = action.payload || [];
      // Rebuild per-track mirrors
      state.tracks.forEach(t => { t.pianoNotes = []; });
      state.pianoNotes.forEach(note => {
        const tr = state.tracks.find(t => t.id == note?.trackId);
        if (tr) {
          if (!Array.isArray(tr.pianoNotes)) tr.pianoNotes = [];
          tr.pianoNotes.push(note);
        }
      });
    },
    setSelectedInstrument: (state, action) => {
      state.selectedInstrument = action.payload;
    },
    setSelectedDrumInstrument: (state, action) => {
      state.selectedDrumInstrument = action.payload;
    },
    clearPianoNotes: (state) => {
      state.pianoNotes = [];
      // Also clear per-track mirrors
      state.tracks.forEach(t => { t.pianoNotes = []; });
    },
    setPianoRecordingClip: (state, action) => {
      console.log(">>>>>>>>>>>>>>>>>>>>>>>>PianoRecordingClip", action.payload);
      // Persist the active piano clip globally (for editing) and also store
      // a per-track copy so the clip bounds remain when switching tracks
      // action.payload expected: { start, end, color, trackId }
      state.pianoRecordingClip = action.payload;

      const payload = action.payload || {};
      const trackId = payload.trackId;
      if (trackId !== undefined && trackId !== null) {
        const idx = state.tracks.findIndex(t => t.id == trackId);
        if (idx !== -1) {
          const { start, end, color } = payload;
          state.tracks[idx].pianoClip = { start, end, color, trackId };
        }
      }
    },
    setDrumRecordingClip: (state, action) => {
      console.log("reduxclip", action.payload)
      state.drumRecordingClip = action.payload; // {start, end, color, trackId}
    },
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
    setSoundQuality(state, action) {
      state.soundQuality = action.payload;
    },
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
    addBeatToPatternContainer: (state, action) => {
      const { trackId, containerId, beat, isOn } = action.payload;
      const track = state.present.tracks.find((t) => t.id === trackId);
      if (!track?.audioClips) return;

      let container = track.audioClips.find((clip) => clip.id === containerId);

      if (isOn) {
        if (!container) {
          container = {
            id: containerId,
            name: `Pattern ${track.audioClips.length + 1}`,
            type: 'pattern',
            start: beat.currentTime,
            end: beat.currentTime + 1, // Assuming a default length for a single beat container
            drumSequence: [],
            onBeatsByPad: {},
            fromPattern: true,
          };
          track.audioClips.push(container);
        }

        // Update or add the drum event in drumSequence
        const existingEventIndex = container.drumSequence.findIndex(
          (event) => event.currentTime === beat.currentTime && event.padId === beat.padId
        );

        if (existingEventIndex !== -1) {
          container.drumSequence[existingEventIndex] = beat;
        } else {
          container.drumSequence.push(beat);
        }

        // Update onBeatsByPad
        if (!container.onBeatsByPad[beat.padId]) {
          container.onBeatsByPad[beat.padId] = [];
        }
        const existing = container.onBeatsByPad[beat.padId];
        if (!existing.includes(beat.beatIndex)) {
          existing.push(beat.beatIndex);
        }

        // Sort drumSequence by currentTime to maintain order
        container.drumSequence.sort((a, b) => a.currentTime - b.currentTime);

      } else {
        if (container) {
          // Remove from drumSequence
          container.drumSequence = container.drumSequence.filter(
            (event) => !(event.currentTime === beat.currentTime && event.padId === beat.padId)
          );

          // Remove from onBeatsByPad
          if (container.onBeatsByPad[beat.padId]) {
            container.onBeatsByPad[beat.padId] = container.onBeatsByPad[beat.padId].filter(
              (index) => index !== beat.beatIndex
            );
            if (container.onBeatsByPad[beat.padId].length === 0) {
              delete container.onBeatsByPad[beat.padId];
            }
          }

          // If container becomes empty, remove it
          if (container.drumSequence.length === 0 && Object.keys(container.onBeatsByPad).length === 0) {
            track.audioClips = track.audioClips.filter((clip) => clip.id !== containerId);
          }
        }
      }
    },
    moveTrackUp: (state, action) => {
      const trackId = action.payload;
      const index = state.tracks.findIndex(t => t.id === trackId);
      if (index !== -1 && index > 0) {
        const tmp = state.tracks[index - 1];
        state.tracks[index - 1] = state.tracks[index];
        state.tracks[index] = tmp;
      }
    },
    moveTrackDown: (state, action) => {
      const trackId = action.payload;
      const index = state.tracks.findIndex(t => t.id === trackId);
      if (index !== -1 && index < state.tracks.length - 1) {
        const tmp = state.tracks[index + 1];
        state.tracks[index + 1] = state.tracks[index];
        state.tracks[index] = tmp;
      }
    },
    reorderTracks: (state, action) => {
      const { fromIndex, toIndex } = action.payload;
      if (fromIndex === toIndex) return;
      if (fromIndex < 0 || toIndex < 0) return;
      if (fromIndex >= state.tracks.length || toIndex > state.tracks.length) return;
      const [moved] = state.tracks.splice(fromIndex, 1);
      state.tracks.splice(toIndex, 0, moved);
    },
    clearTrackDeleted: (state) => {
      state.trackDeleted = null;
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
  updateDrumRecordedData,
  setDrumPlayback,
  setDrumPlaybackStartTime,
  setSelectedClip,
  setSelectedTrack,
  updateClipPosition,
  updateClipTrim,
  addPianoNote, // <-- Export new actions
  setPianoNotes,
  setSelectedInstrument,
  setSelectedDrumInstrument,
  clearPianoNotes,
  setPianoRecordingClip,
  setDrumRecordingClip,
  setSelectedKey,
  setSelectedScale,
  setHighlightedPianoKeys,
  clearKeyScaleSelection,
  setMetronomeSound,
  setSoundQuality,
  setPatternDrumPlayback,
  setPatternDrumEvents,
  moveTrackUp,
  moveTrackDown,
  reorderTracks,
  clearTrackDeleted,
} = studioSlice.actions;

export default studioSlice.reducer;

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

export const syncPatternBeat = ({ trackId, padId, beatIndex, bpm, isOn, clipColor = '#FFB6C1', selectedRuler, sectionStartTime, sectionEndTime }) => async (dispatch, getState) => {
  if (trackId === undefined || trackId === null) return;

  // Calculate section and position
  const sectionIndex = Math.floor(beatIndex / 16);
  const beatInSection = beatIndex % 16;

  let blockStart, blockDuration, slotStart;
  if (selectedRuler === "Time") {
    blockStart = sectionIndex * 1.0;
    blockDuration = 1.0;
    slotStart = blockStart + (beatInSection / 16) * 1.0;
  } else {
    blockStart = sectionIndex * 1.0;
    blockDuration = 1.0;
    slotStart = blockStart + (beatInSection / 16) * 1.0;
  }

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

  // Find existing container for this section
  const container = clips.find(c =>
    c?.fromPattern === true &&
    c?.blockIndex === sectionIndex &&
    Math.abs(c?.startTime - blockStart) < 0.001
  );

  if (isOn) {
    if (container) {
      // Update existing container
      const seq = Array.isArray(container.drumSequence) ? [...container.drumSequence] : [];

      // Add or update this beat
      const meta = resolvePadMeta(padId);
      const event = {
        currentTime: slotStart,
        padId,
        ...meta,
        beatIndex: beatIndex,
        beatInSection: beatInSection
      };

      // Remove existing event at this beat position
      const existingIndex = seq.findIndex(ev =>
        Math.abs(ev.currentTime - slotStart) < 0.001 && ev.padId === padId
      );

      if (existingIndex >= 0) {
        seq[existingIndex] = event;
      } else {
        seq.push(event);
      }

      // Update beat tracking
      const src = container.onBeatsByPad || {};
      const byPad = Object.keys(src).reduce((acc, key) => {
        acc[key] = Array.isArray(src[key]) ? [...src[key]] : [];
        return acc;
      }, {});

      // Immutable add
      const existing = byPad[padId] || [];
      if (!existing.includes(beatIndex)) {
        byPad[padId] = [...existing, beatIndex];
      }

      dispatch(updateAudioClip({
        trackId,
        clipId: container.id,
        updates: {
          drumSequence: seq,
          onBeatsByPad: byPad,
          startTime: blockStart,
          duration: blockDuration,
          trimStart: 0,
          trimEnd: blockDuration,
          ruler: selectedRuler,
          bpm: bpm,
          musicalBeat: selectedRuler === "Beats" ? (sectionIndex % 4) + 1 : null
        }
      }));

      // Regenerate waveform
      await regenWaveForSection(dispatch, getState, {
        trackId,
        sectionIndex,
        blockStart,
        blockDuration
      });
    } else {
      // Create new container for this section
      const meta = resolvePadMeta(padId);
      const audioClip = {
        name: selectedRuler === "Beats" ? `Beat ${(sectionIndex % 4) + 1}` : `Pattern Section ${sectionIndex + 1}`,
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
        ruler: selectedRuler,
        bpm: bpm,
        musicalBeat: selectedRuler === "Beats" ? (sectionIndex % 4) + 1 : null,
        drumSequence: [{
          currentTime: slotStart,
          padId,
          ...meta,
          beatIndex: beatIndex,
          beatInSection: beatInSection
        }],
      };

      dispatch(addAudioClipToTrack({ trackId, audioClip }));

      // Regenerate waveform
      await regenWaveForSection(dispatch, getState, {
        trackId,
        sectionIndex,
        blockStart,
        blockDuration
      });
    }
  } else {
    // Turning OFF: remove this beat
    if (!container) return;

    const seq = Array.isArray(container.drumSequence) ? [...container.drumSequence] : [];

    // Remove this beat
    const newSeq = seq.filter(ev =>
      !(Math.abs(ev.currentTime - slotStart) < 0.001 && ev.padId === padId)
    );

    const src = container.onBeatsByPad || {};
    const byPad = Object.keys(src).reduce((acc, key) => {
      acc[key] = Array.isArray(src[key]) ? [...src[key]] : [];
      return acc;
    }, {});

    // Immutable remove
    if (byPad[padId]) {
      const next = byPad[padId].filter(b => b !== beatIndex);
      if (next.length === 0) delete byPad[padId];
      else byPad[padId] = next;
    }

    if (Object.keys(byPad).length === 0 && newSeq.length === 0) {
      // Remove empty container
      dispatch(removeAudioClip({ trackId, clipId: container.id }));
    } else {
      // Update container
      dispatch(updateAudioClip({
        trackId,
        clipId: container.id,
        updates: {
          drumSequence: newSeq,
          onBeatsByPad: byPad
        }
      }));

      // Regenerate waveform
      await regenWaveForSection(dispatch, getState, {
        trackId,
        sectionIndex,
        blockStart,
        blockDuration
      });
    }
  }
};

// Function to sync recorded drum data to timeline clips
export const syncRecordedDrumDataToTimeline = ({ trackId, drumRecordedData, bpm = 120, clipColor = '#FF8014' }) => async (dispatch, getState) => {
  if (!trackId || !Array.isArray(drumRecordedData) || drumRecordedData.length === 0) return;

  const state = getState();
  const selectedRuler = state.grid?.selectedRuler || "Time";
  const track = state.studio?.tracks?.find(t => t.id == trackId);

  if (!track) return;

  // Clear existing pattern clips for this track
  dispatch(clearPatternClips(trackId));

  // Group recorded data by pad type
  const dataByPad = {};
  drumRecordedData.forEach(hit => {
    const padId = hit.padId || 'unknown';
    if (!dataByPad[padId]) {
      dataByPad[padId] = [];
    }
    dataByPad[padId].push(hit);
  });

  // Process each pad type
  Object.entries(dataByPad).forEach(([padId, hits]) => {
    // Sort hits by time
    hits.sort((a, b) => (a.currentTime || 0) - (b.currentTime || 0));

    // Group hits into sections (16 beats per section)
    const sections = {};
    hits.forEach(hit => {
      const time = hit.currentTime || 0;
      const sectionIndex = Math.floor(time / 1.0); // 1 second per section
      const beatInSection = Math.floor((time % 1.0) * 16); // 16 beats per second

      if (!sections[sectionIndex]) {
        sections[sectionIndex] = {
          startTime: sectionIndex * 1.0,
          duration: 1.0,
          hits: [],
          beatsByPad: {}
        };
      }

      sections[sectionIndex].hits.push({
        ...hit,
        beatIndex: sectionIndex * 16 + beatInSection,
        beatInSection: beatInSection
      });

      if (!sections[sectionIndex].beatsByPad[padId]) {
        sections[sectionIndex].beatsByPad[padId] = [];
      }
      sections[sectionIndex].beatsByPad[padId].push(sectionIndex * 16 + beatInSection);
    });

    // Create timeline clips for each section
    Object.entries(sections).forEach(([sectionIndex, sectionData]) => {
      if (sectionData.hits.length === 0) return;

      const audioClip = {
        name: `Recorded ${padId} - Section ${parseInt(sectionIndex) + 1}`,
        color: clipColor,
        startTime: sectionData.startTime,
        duration: sectionData.duration,
        trimStart: 0,
        trimEnd: sectionData.duration,
        type: 'drum',
        fromPattern: true,
        fromRecording: true, // Mark as from recording
        blockIndex: parseInt(sectionIndex),
        blockSize: 16,
        onBeatsByPad: sectionData.beatsByPad,
        ruler: selectedRuler,
        bpm: bpm,
        drumSequence: sectionData.hits.map(hit => ({
          currentTime: hit.currentTime - sectionData.startTime, // Relative to section start
          padId: hit.padId,
          sound: hit.sound,
          type: hit.type,
          freq: hit.freq,
          decay: hit.decay,
          drumMachine: hit.drumMachine,
          beatIndex: hit.beatIndex,
          beatInSection: hit.beatInSection,
          originalTime: hit.currentTime // Keep original absolute time
        }))
      };

      dispatch(addAudioClipToTrack({ trackId, audioClip }));
    });
  });
};

// Function to sync recorded piano data to timeline clips
export const syncRecordedPianoDataToTimeline = ({ trackId, pianoNotes, bpm = 120, clipColor = '#4CAF50' }) => async (dispatch, getState) => {
  if (!trackId || !Array.isArray(pianoNotes) || pianoNotes.length === 0) return;

  const state = getState();
  const track = state.studio?.tracks?.find(t => t.id == trackId);

  if (!track) return;

  // Clear existing piano clips for this track
  const existingPianoClips = track.audioClips?.filter(c => c.type === 'piano' && c.fromRecording) || [];
  existingPianoClips.forEach(clip => {
    dispatch(removeAudioClip({ trackId, clipId: clip.id }));
  });

  // Group notes by time sections
  const notesBySection = {};
  pianoNotes.forEach(note => {
    const startTime = note.startTime || 0;
    const endTime = startTime + (note.duration || 0.5);
    const sectionIndex = Math.floor(startTime / 2.0); // 2 seconds per section

    if (!notesBySection[sectionIndex]) {
      notesBySection[sectionIndex] = {
        startTime: sectionIndex * 2.0,
        duration: 2.0,
        notes: []
      };
    }

    notesBySection[sectionIndex].notes.push({
      ...note,
      relativeStartTime: startTime - (sectionIndex * 2.0)
    });
  });

  // Create timeline clips for each section
  Object.entries(notesBySection).forEach(([sectionIndex, sectionData]) => {
    if (sectionData.notes.length === 0) return;

    const audioClip = {
      name: `Recorded Piano - Section ${parseInt(sectionIndex) + 1}`,
      color: clipColor,
      startTime: sectionData.startTime,
      duration: sectionData.duration,
      trimStart: 0,
      trimEnd: sectionData.duration,
      type: 'piano',
      fromPattern: false,
      fromRecording: true,
      blockIndex: parseInt(sectionIndex),
      blockSize: 2,
      pianoSequence: sectionData.notes.map(note => ({
        midiNumber: note.midiNumber,
        note: note.note,
        startTime: note.relativeStartTime,
        duration: note.duration,
        velocity: note.velocity || 0.8,
        originalTime: note.startTime
      }))
    };

    dispatch(addAudioClipToTrack({ trackId, audioClip }));
  });
};

export const clearPatternClips = (trackId) => (dispatch, getState) => {
  const state = getState();
  const track = state.studio?.tracks?.find(t => t.id == trackId);
  if (!track?.audioClips) return;
  track.audioClips
    .filter(c => c?.fromPattern === true)
    .forEach(c => dispatch(removeAudioClip({ trackId, clipId: c.id })));
};

export const syncWholePatternToTimeline = ({ trackId, patternRows, bpm }) => (dispatch, getState) => {
  if (!trackId || !Array.isArray(patternRows)) return;

  // Get the current ruler setting
  const state = getState();
  const selectedRuler = state.grid?.selectedRuler || "Time";

  // Clear existing pattern clips
  dispatch(clearPatternClips(trackId));

  // Process each pattern row
  patternRows.forEach(row => {
    const { padId, pattern } = row || {};
    if (!padId || !Array.isArray(pattern)) return;

    pattern.forEach((isOn, beatIndex) => {
      if (!isOn) return;

      // Calculate timing based on ruler
      const sectionIndex = Math.floor(beatIndex / 16);

      let sectionStartTime, sectionEndTime;
      if (selectedRuler === "Time") {
        sectionStartTime = sectionIndex * 1.0;
        sectionEndTime = (sectionIndex + 1) * 1.0;
      } else {
        sectionStartTime = sectionIndex * 1.0;
        sectionEndTime = (sectionIndex + 1) * 1.0;
      }

      dispatch(syncPatternBeat({
        trackId,
        padId,
        beatIndex,
        bpm,
        isOn: true,
        selectedRuler,
        sectionStartTime,
        sectionEndTime
      }));
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

// Create track with all default properties as one group
export const createTrackWithDefaults = (trackData) => (dispatch) => {
  const trackId = trackData.id || Date.now();

  // Create a batch of actions that will be grouped together
  const actions = [
    addTrack({
      ...trackData,
      id: trackId,
      frozen: false,
      muted: false,
      volume: trackData.volume || 80,
      color: trackData.color || getNextTrackColor(),
      audioClips: trackData.audioClips || []
    }),
    setCurrentTrackId(trackId),
    setTrackType(trackData.type || 'audio')
  ];

  // Dispatch all actions in sequence
  actions.forEach(action => dispatch(action));
};

// Delete track with cleanup as one group
export const deleteTrackWithCleanup = (trackId) => (dispatch, getState) => {
  const state = getState();
  const studioState = selectStudioState(state);
  const track = studioState.tracks.find(t => t.id === trackId);

  if (!track) return;

  // Create a batch of cleanup actions
  const actions = [
    removeTrack(trackId)
  ];

  // If this was the current track, clear the current track ID
  if (studioState.currentTrackId === trackId) {
    const remainingTracks = studioState.tracks.filter(t => t.id !== trackId);
    if (remainingTracks.length > 0) {
      actions.push(setCurrentTrackId(remainingTracks[0].id));
    } else {
      actions.push(setCurrentTrackId(null));
    }
  }

  // Dispatch all actions in sequence
  actions.forEach(action => dispatch(action));
};

// Add audio clip with metadata as one group
export const addAudioClipWithMetadata = (trackId, audioClip) => (dispatch) => {
  const clipId = Date.now() + Math.random();

  const actions = [
    addAudioClipToTrack({
      trackId,
      audioClip: {
        ...audioClip,
        id: clipId,
        addedAt: Date.now()
      }
    }),
    updateTrack({
      id: trackId,
      updates: {
        lastModified: Date.now()
      }
    })
  ];

  actions.forEach(action => dispatch(action));
};

// Record piano sequence as one group
export const recordPianoSequence = (trackId, notes, recordingClip) => (dispatch) => {
  const actions = [
    setPianoNotes(notes),
    setPianoRecordingClip(recordingClip),
    updateTrack({
      id: trackId,
      updates: {
        lastModified: Date.now(),
        hasPianoData: true
      }
    })
  ];

  actions.forEach(action => dispatch(action));
};

// Record drum sequence as one group
export const recordDrumSequence = (trackId, drumData, recordingClip) => (dispatch) => {
  const actions = [
    setDrumRecordedData(drumData),
    setDrumRecordingClip(recordingClip),
    updateTrack({
      id: trackId,
      updates: {
        lastModified: Date.now(),
        hasDrumData: true
      }
    })
  ];

  actions.forEach(action => dispatch(action));
};

// Update track with history as one group
export const updateTrackWithHistory = (trackId, updates) => (dispatch) => {
  const actions = [
    updateTrack({
      id: trackId,
      updates: {
        ...updates,
        lastModified: Date.now()
      }
    })
  ];

  actions.forEach(action => dispatch(action));
};

// Export track with audio data
export const exportTrackAudio = (trackId, exportType = 'with_effects', clipId = null) => async (dispatch, getState) => {

  const state = getState();
  const studioState = selectStudioState(state);
  const track = studioState?.tracks?.find(t => t.id == trackId);

  if (!track) {
    console.error('Track not found for export');
    return { success: false, error: 'Track not found' };
  }

  try {
    // Check if track has audio clips with blob URLs
    const audioClips = track.audioClips || [];

    const clipsWithAudio = audioClips.filter(clip => clip.url && clip.url.startsWith('blob:'));

    if (clipsWithAudio.length === 0) {
      console.error('No audio data to export for this track');
      return { success: false, error: 'No audio data found' };
    }

    // If specific clip ID is provided, use that clip, otherwise use the first one
    let audioClip;
    if (clipId) {
      audioClip = clipsWithAudio.find(clip => clip.id === clipId);
      if (!audioClip) {
        console.error('Specified audio clip not found');
        return { success: false, error: 'Specified audio clip not found' };
      }
    } else {
      audioClip = clipsWithAudio[0];
    }


    // Fetch the audio data from blob URL
    const response = await fetch(audioClip.url);
    if (!response.ok) {
      throw new Error(`Failed to fetch audio data: ${response.statusText}`);
    }

    const audioBlob = await response.blob();

    // Decode, trim, and re-encode using trimStart/trimEnd from the clip
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const arrayBuffer = await audioBlob.arrayBuffer();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

    const clipTrimStart = Math.max(0, Number(audioClip.trimStart ?? 0));
    const clipTrimEnd = Math.min(
      Number(audioClip.trimEnd ?? audioBuffer.duration),
      audioBuffer.duration
    );
    const startSample = Math.floor(clipTrimStart * audioBuffer.sampleRate);
    const endSample = Math.max(startSample + 1, Math.floor(clipTrimEnd * audioBuffer.sampleRate));
    const length = Math.max(0, endSample - startSample);

    const channelData = [];
    for (let ch = 0; ch < audioBuffer.numberOfChannels; ch++) {
      const src = audioBuffer.getChannelData(ch);
      const out = new Float32Array(length);
      for (let i = 0; i < length; i++) {
        out[i] = src[startSample + i] || 0;
      }
      channelData.push(out);
    }

    const wavBuffer = await WavEncoder.encode({
      sampleRate: audioBuffer.sampleRate,
      channelData
    });
    const exportBlob = new Blob([wavBuffer], { type: 'audio/wav' });

    // Create download link
    const downloadUrl = URL.createObjectURL(exportBlob);
    const link = document.createElement('a');
    link.href = downloadUrl;

    // Set filename based on track name, clip name, and export type
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const trackName = track.name || 'track';
    const clipName = audioClip.name ? `_${audioClip.name.replace(/[^a-zA-Z0-9]/g, '_')}` : '';
    const filename = exportType === 'with_effects'
      ? `${trackName}${clipName}_${timestamp}_with_effects.wav`
      : `${trackName}${clipName}_${timestamp}_no_effects.wav`;

    link.download = filename;

    // Trigger download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Clean up
    URL.revokeObjectURL(downloadUrl);

    // Dispatch export action for tracking
    dispatch(exportTrack({
      trackId,
      exportType,
      filename,
      timestamp: Date.now(),
      audioClipId: audioClip.id,
      trackName: track.name,
      clipName: audioClip.name
    }));



    return {
      success: true,
      filename,
      trackName: track.name,
      clipName: audioClip.name
    };

  } catch (error) {
    console.error('Error exporting track:', error);
    return {
      success: false,
      error: error.message
    };
  } finally {
    console.log('=== EXPORT THUNK DEBUG END ===');
  }
};

// Export all audio clips from a track as separate files
export const exportAllTrackClips = (trackId, exportType = 'with_effects') => async (dispatch, getState) => {
  const state = getState();
  const track = state.studio?.tracks?.find(t => t.id === trackId);

  if (!track) {
    console.error('Track not found for export');
    return;
  }

  const audioClips = track.audioClips || [];
  const clipsWithAudio = audioClips.filter(clip => clip.url && clip.url.startsWith('blob:'));

  if (clipsWithAudio.length === 0) {
    console.error('No audio data to export for this track');
    return;
  }

  const results = [];

  for (const clip of clipsWithAudio) {
    try {
      const result = await dispatch(exportTrackAudio(trackId, exportType, clip.id));
      results.push(result);
    } catch (error) {
      console.error(`Error exporting clip ${clip.id}:`, error);
      results.push({ success: false, error: error.message, clipId: clip.id });
    }
  }

  return results;
};
