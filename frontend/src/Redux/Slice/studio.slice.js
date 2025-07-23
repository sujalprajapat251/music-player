import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  tracks: [
    {
      id: 1,
      name: 'Demo Track',
      url: require('../../Audio/simple1.mp3'), // adjust path if needed
      color: '#FFB6C1',
    },
  ],
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
  },
});

export const { setTracks, addTrack } = studioSlice.actions;
export default studioSlice.reducer;
