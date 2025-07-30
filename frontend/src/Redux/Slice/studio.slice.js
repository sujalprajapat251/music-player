import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  tracks: [],
  trackHeight: 80, // Standard height for each track
  timelineSettings: {
    pixelsPerSecond: 50,
    maxDuration: 10,
  }
};

const studioSlice = createSlice({
  name: 'studio',
  initialState,
  reducers: {
    setTracks: (state, action) => {
      state.tracks = action.payload;
    },
    addTrack: (state, action) => {
      state.tracks.push(action.payload);
    },
    updateTrack: (state, action) => {
      const { id, updates } = action.payload;
      const trackIndex = state.tracks.findIndex(track => track.id === id);
      if (trackIndex !== -1) {
        state.tracks[trackIndex] = { ...state.tracks[trackIndex], ...updates };
      }
    },
    removeTrack: (state, action) => {
      state.tracks = state.tracks.filter(track => track.id !== action.payload);
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
  renameTrack
} = studioSlice.actions;

export default studioSlice.reducer;
