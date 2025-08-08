import { createSlice } from '@reduxjs/toolkit';
import { getNextTrackColor, resetColorIndex } from '../../Utils/colorUtils';

const initialState = {
  tracks: [],
  trackHeight: 70, // Standard height for each track
  timelineSettings: {
    pixelsPerSecond: 50,
    maxDuration: 10,
  },
  // Track effects and plugins state
  trackEffects: {}, // Store effects for each track
  frozenTrackData: {}, // Store processed audio data for frozen tracks
  pianoRecord: [],
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
  masterVolume: 80 ,// Master volume control
  bpm: 120,   
};

const studioSlice = createSlice({
  name: 'studio',
  initialState,
  reducers: {
    setTracks: (state, action) => {
      state.tracks = action.payload;
    },
    addTrack: (state, action) => {
      console.log('addTrack action:', action.payload);
      // Ensure new tracks have frozen property, audioClips array, and a unique color
      const track = { 
        ...action.payload, 
        frozen: false, 
        muted: false,
        volume: action.payload.volume || 80, // Set individual track volume (default 80)
        color: action.payload.color || getNextTrackColor(), // Assign unique color
        audioClips: action.payload.audioClips || [] // Array to hold multiple audio clips
      };
      console.log('Adding track to state:', track);
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
      console.log('addAudioClipToTrack action:', action.payload);
      const { trackId, audioClip } = action.payload;
      console.log('Current tracks:', state.tracks.map(t => ({ id: t.id, type: typeof t.id })));
      console.log('Looking for trackId:', trackId, 'type:', typeof trackId);
      const trackIndex = state.tracks.findIndex(track => track.id == trackId); // Use == for type coercion
      console.log('Found track index:', trackIndex, 'for trackId:', trackId);
      if (trackIndex !== -1) {
        if (!state.tracks[trackIndex].audioClips) {
          state.tracks[trackIndex].audioClips = [];
        }
        const newClip = {
          id: Date.now() + Math.random(), // Unique ID for the clip
          color: audioClip.color || state.tracks[trackIndex].color || '#FFB6C1', // Use track's color as fallback
          ...audioClip
        };
        console.log('Adding clip to track:', newClip);
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
      state.tracks = state.tracks.filter(track => track.id !== trackId);
      // Clean up related data
      delete state.trackEffects[trackId];
      delete state.frozenTrackData[trackId];
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
        id: Date.now(),
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
  setPlaying,
  setCurrentTime,
  setAudioDuration,
  togglePlayPause,
  resetTrackColors,
  setMasterVolume,
  setBPM,
  setTrackVolume,
} = studioSlice.actions;

export default studioSlice.reducer;
