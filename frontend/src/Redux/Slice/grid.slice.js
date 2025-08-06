import { createSlice } from '@reduxjs/toolkit';
import { getGridDivisions, getGridSpacing, snapToGrid } from '../../Utils/gridUtils';

const initialState = {
  selectedGrid: "1/4",
  selectedTime: "4/4",
  selectedRuler: "Beats",
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
  },
});

// Export actions
export const { 
  setSelectedGrid, 
  setSelectedTime, 
  setSelectedRuler,
  updateGridSettings 
} = gridSlice.actions;

// Export selectors
export const selectGridSettings = (state) => ({
  selectedGrid: state.grid.selectedGrid,
  selectedTime: state.grid.selectedTime,
  selectedRuler: state.grid.selectedRuler,
});

export default gridSlice.reducer; 