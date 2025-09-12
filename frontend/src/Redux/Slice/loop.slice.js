import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  loopStart: 0,
  loopEnd: 6, // Default 6 seconds
  isLoopEnabled: false,
  audioDuration: 0,
};

const loopSlice = createSlice({
  name: 'loop',
  initialState,
  reducers: {
    setLoopStart: (state, action) => {
      state.loopStart = Math.max(0, action.payload);
    },
    setLoopEnd: (state, action) => {
      state.loopEnd = Math.max(state.loopStart + 0.25, action.payload); // Default minimum spacing
    },
    setLoopRange: (state, action) => {
      const { start, end } = action.payload;
      state.loopStart = Math.max(0, start);
      state.loopEnd = Math.max(state.loopStart + 0.25, end); // Default minimum spacing
    },
    toggleLoopEnabled: (state) => {
      state.isLoopEnabled = !state.isLoopEnabled;
    },
    setLoopEnabled: (state, action) => {
      state.isLoopEnabled = action.payload;
    },

    setAudioDuration: (state, action) => {
      state.audioDuration = action.payload;
      // Adjust loop end if it exceeds new duration
      if (state.loopEnd > action.payload) {
        state.loopEnd = action.payload;
      }
    },
    resetLoop: (state) => {
      state.loopStart = 0;
      state.loopEnd = Math.min(6, state.audioDuration);
      state.isLoopEnabled = false;
    },
  },
});

// Export actions
export const { 
  setLoopStart, 
  setLoopEnd, 
  setLoopRange,
  toggleLoopEnabled, 
  setLoopEnabled,
  setAudioDuration,
  resetLoop
} = loopSlice.actions;

// Export selectors
export const selectLoopSettings = (state) => ({
  loopStart: state.loop.loopStart,
  loopEnd: state.loop.loopEnd,
  isLoopEnabled: state.loop.isLoopEnabled,
  audioDuration: state.loop.audioDuration,
});

export const selectLoopStart = (state) => state.loop.loopStart;
export const selectLoopEnd = (state) => state.loop.loopEnd;
export const selectIsLoopEnabled = (state) => state.loop.isLoopEnabled;
export const selectAudioDuration = (state) => state.loop.audioDuration;

export default loopSlice.reducer;
