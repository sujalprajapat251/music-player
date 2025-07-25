import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  tracks: [
    {
      id: 1,
      name: 'Demo Track',
      url: require('../../Audio/simple1.mp3'), // adjust path if needed
      color: '#FFB6C1',
      height: 80, // Fixed height for track alignment
    },
    {
      id: 2,
      name: 'Demo Track 2',
      url: require('../../Audio/simple1.mp3'), // adjust path if needed
      color: '#FFB6C1',
      height: 80, // Fixed height for track alignment
    }
  ],
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
    }
  },
});

export const { 
  setTracks, 
  addTrack, 
  updateTrack, 
  removeTrack, 
  setTrackHeight,
  updateTimelineSettings 
} = studioSlice.actions;

export default studioSlice.reducer;
