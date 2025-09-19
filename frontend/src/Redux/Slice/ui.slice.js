import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isSongSection: false, 
  showLoopLibrary: false,
  musicalTypingEnabled: true,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setIsSongSection: (state, action) => {
      state.isSongSection = action.payload;
    },
    setShowLoopLibrary: (state, action) => {
      state.showLoopLibrary = Boolean(action.payload);
    },
    setMusicalTypingEnabled: (state, action) => {
      state.musicalTypingEnabled = Boolean(action.payload);
    },
  },
});

export const { setIsSongSection, setShowLoopLibrary, setMusicalTypingEnabled } = uiSlice.actions;
export default uiSlice.reducer;
