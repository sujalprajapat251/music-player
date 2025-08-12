import { createSlice } from '@reduxjs/toolkit';
import { getGridDivisions, getGridSpacing, snapToGrid } from '../../Utils/gridUtils';

const initialState = {
  selectedGrid: "1/1",
  selectedTime: "3/4",
  selectedRuler: "Beats",
  zoomLevel: 1, 
};

const gridSlice = createSlice({
  name: 'grid',
  initialState,
  reducers: {
    setSelectedGrid: (state, action) => {
      state.selectedGrid = action.payload;
    },
    setSelectedTime: (state, action) => {
      state.selectedTime = action.payload;
    },
    setSelectedRuler: (state, action) => {
      state.selectedRuler = action.payload;
    },
    updateGridSettings: (state, action) => {
      const { grid, time, ruler } = action.payload;
      if (grid !== undefined) state.selectedGrid = grid;
      if (time !== undefined) state.selectedTime = time;
      if (ruler !== undefined) state.selectedRuler = ruler;
    },
    // Modified zoom actions to change timeline width
    zoomIn: (state) => {
      state.zoomLevel = Math.min(state.zoomLevel + 0.25, 7);
    },
    zoomOut: (state) => {
      state.zoomLevel = Math.max(state.zoomLevel - 0.25, 0.25); 
    },
    setZoomLevel: (state, action) => {
      state.zoomLevel = Math.max(0.25, Math.min(7, action.payload)); 
    },
    resetZoom: (state) => {
      state.zoomLevel = 1; 
    },
  },
});

// Export actions
export const { 
  setSelectedGrid, 
  setSelectedTime, 
  setSelectedRuler,
  updateGridSettings,
  zoomIn,
  zoomOut,
  setZoomLevel,
  resetZoom
} = gridSlice.actions;

// Export selectors
export const selectGridSettings = (state) => ({
  selectedGrid: state.grid.selectedGrid,
  selectedTime: state.grid.selectedTime,
  selectedRuler: state.grid.selectedRuler,
  zoomLevel: state.grid.zoomLevel,
});

export default gridSlice.reducer; 