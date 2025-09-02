// Custom middleware to ensure proper undo/redo history
export const undoRedoMiddleware = store => next => action => {
  const result = next(action);
  
  // Track undo/redo actions for debugging
  if (action.type === '@@redux-undo/UNDO' || action.type === '@@redux-undo/REDO') {
    const state = store.getState();
    const studioState = state.studio;
    
    console.log('Undo/Redo Action:', {
      type: action.type,
      pastCount: studioState?.past?.length || 0,
      futureCount: studioState?.future?.length || 0,
      canUndo: studioState?.past && studioState.past.length > 0,
      canRedo: studioState?.future && studioState.future.length > 0
    });
  }
  
  return result;
};

// Helper function to check if redo history is being preserved
export const checkRedoHistory = (state) => {
  const studioState = state.studio;
  const pastCount = studioState?.past?.length || 0;
  const futureCount = studioState?.future?.length || 0;
  
  return {
    pastCount,
    futureCount,
    totalHistory: pastCount + futureCount,
    canUndo: pastCount > 0,
    canRedo: futureCount > 0,
    isHistoryBalanced: Math.abs(pastCount - futureCount) <= 1
  };
};
