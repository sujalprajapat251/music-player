import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isSongSection: false, 
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setIsSongSection: (state, action) => {
      state.isSongSection = action.payload;
    },
  },
});

export const { setIsSongSection } = uiSlice.actions;
export default uiSlice.reducer;
