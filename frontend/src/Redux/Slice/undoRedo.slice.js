import { createSlice } from '@reduxjs/toolkit';

const undoRedoSlice = createSlice({
  name: 'undoRedo',
  initialState: {
    canUndo: false,
    canRedo: false,
    historyLength: 0,
    futureLength: 0
  },
  reducers: {
    updateUndoRedoState: (state, action) => {
      const { canUndo, canRedo, historyLength, futureLength } = action.payload;
      state.canUndo = canUndo;
      state.canRedo = canRedo;
      state.historyLength = historyLength;
      state.futureLength = futureLength;
    }
  }
});

export const { updateUndoRedoState } = undoRedoSlice.actions;
export default undoRedoSlice.reducer;
