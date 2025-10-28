import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isSongSection: false, 
  showLoopLibrary: false,
  musicalTypingEnabled: true,
  showAddTrackModal: false,
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
    setShowAddTrackModal: (state, action) => {
      state.showAddTrackModal = Boolean(action.payload);
    },
  },
});

export const { setIsSongSection, setShowLoopLibrary, setMusicalTypingEnabled, setShowAddTrackModal } = uiSlice.actions;
export default uiSlice.reducer;
