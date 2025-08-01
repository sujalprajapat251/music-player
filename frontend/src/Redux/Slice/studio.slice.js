import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  tracks: [],
  trackHeight: 80, // Standard height for each track
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
  currentTrackId: ''
};

const studioSlice = createSlice({
  name: 'studio',
  initialState,
  reducers: {
    setTracks: (state, action) => {
      state.tracks = action.payload;
    },
    addTrack: (state, action) => {
      // Ensure new tracks have frozen property
      const track = { ...action.payload, frozen: false };
      state.tracks.push(track);
    },
    updateTrack: (state, action) => {
      const { id, updates } = action.payload;
      const trackIndex = state.tracks.findIndex(track => track.id === id);
      if (trackIndex !== -1) {
        state.tracks[trackIndex] = { ...state.tracks[trackIndex], ...updates };
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
      const track = state.tracks.find(t => t.id === trackId);
      if (track) {
        track.startTime = newStartTime;
      }
    },
    renameTrack: (state, action) => {
      const { id, newName } = action.payload;
      const track = state.tracks.find(track => track.id === id);
      if (track) {
        track.name = newName;
      }
    },
    freezeTrack: (state, action) => {
      const trackId = action.payload;
      const track = state.tracks.find(track => track.id === trackId);
      if (track) {
        track.frozen = !track.frozen; // Toggle freeze state
        
        // If freezing, store current effects state
        if (track.frozen) {
          state.frozenTrackData[trackId] = {
            effects: state.trackEffects[trackId] || {},
            frozenAt: Date.now(),
            originalTrackData: { ...track }
          };
        } else {
          // If unfreezing, restore effects state
          const frozenData = state.frozenTrackData[trackId];
          if (frozenData) {
            state.trackEffects[trackId] = frozenData.effects;
          }
        }
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
          frozen: false // Reset frozen state for the copy
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
        // Update track with audio data
        track.url = audioData.url;
        track.name = audioData.name || track.name;
        track.duration = audioData.duration;
        track.trimStart = audioData.trimStart || 0;
        track.trimEnd = audioData.duration || audioData.trimEnd;
        track.soundData = audioData.soundData || null;
      }
    },
    setRecordingAudio: (state, action) => {
      state.pianoRecord = action.payload;
    },
    setRecording: (state, action) => {
      state.isRecording = action.payload;
    },
    setTrackType: (state, action) => {
      state.newtrackType = action.payload;
    },
    setCurrentTrackId: (state, action) => {
      state.currentTrackId = action.payload;
    },
    exportTrack: (state, action) => {
      // This is just a placeholder action for tracking export events
      // The actual export logic will be handled in the component
      return state;
    }
  },
});

export const { 
  setTracks, 
  addTrack, 
  updateTrack, 
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
  setTrackType,
  setCurrentTrackId
} = studioSlice.actions;

export default studioSlice.reducer;
