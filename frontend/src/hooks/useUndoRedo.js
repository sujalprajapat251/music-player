// import { useDispatch, useSelector } from 'react-redux';
// import { ActionCreators } from 'redux-undo';
// import { updateUndoRedoState } from '../Redux/Slice/undoRedo.slice';
// import { selectStudioState } from '../Redux/rootReducer';

// export const useUndoRedo = () => {
//   const dispatch = useDispatch();

//   // Get the studio state which includes undo/redo information
//   const studioState = useSelector((state) => state.studio);
  
//   // Get the present state (current state)
//   const presentState = useSelector((state) => selectStudioState(state));
  
//   // Get undo/redo state
//   const undoRedoState = useSelector((state) => state.undoRedo);

//   const canUndo = studioState?.past && studioState.past.length > 0;
//   const canRedo = studioState?.future && studioState.future.length > 0;

//   const undo = () => {
//     if (canUndo) {
//       dispatch(ActionCreators.undo());
//       dispatch(updateUndoRedoState({ 
//         lastAction: 'undo', 
//         timestamp: Date.now() 
//       }));
//     }
//   };

//   const redo = () => {
//     if (canRedo) {
//       dispatch(ActionCreators.redo());
//       dispatch(updateUndoRedoState({ 
//         lastAction: 'redo', 
//         timestamp: Date.now() 
//       }));
//     }
//   };

//   const clearHistory = () => {
//     dispatch(ActionCreators.clearHistory());
//     dispatch(updateUndoRedoState({ 
//       lastAction: 'clear', 
//       timestamp: Date.now() 
//     }));
//   };

//   // Get history information
//   const getHistoryInfo = () => {
//     return {
//       pastCount: studioState?.past?.length || 0,
//       futureCount: studioState?.future?.length || 0,
//       canUndo,
//       canRedo,
//       lastAction: undoRedoState?.lastAction,
//       lastActionTime: undoRedoState?.timestamp,
//       maxHistorySize: 50 // This should match the limit in rootReducer.js
//     };
//   };

//   // Group multiple actions together
//   const groupActions = (actionGroup) => {
//     return (dispatch) => {
//       const groupId = `manual-group-${Date.now()}`;
      
//       // Dispatch all actions in the group with the same group ID
//       actionGroup.forEach((action, index) => {
//         const actionWithGroup = {
//           ...action,
//           meta: {
//             ...action.meta,
//             groupId,
//             groupIndex: index,
//             isGrouped: true
//           }
//         };
//         dispatch(actionWithGroup);
//       });
//     };
//   };

//   // Create a batch of related actions
//   const createActionBatch = (actions, batchName = 'batch') => {
//     return groupActions(actions.map(action => ({
//       ...action,
//       meta: {
//         ...action.meta,
//         batchName,
//         timestamp: Date.now()
//       }
//     })));
//   };

//   return {
//     undo,
//     redo,
//     clearHistory,
//     canUndo,
//     canRedo,
//     getHistoryInfo,
//     groupActions,
//     createActionBatch,
//     presentState
//   };
// };

// // Export the selector for use in other components
// export { selectStudioState };




// frontend/src/hooks/useUndoRedo.js
import { useDispatch, useSelector } from 'react-redux';
import { ActionCreators } from 'redux-undo';
import { updateUndoRedoState } from '../Redux/Slice/undoRedo.slice';
import { selectStudioState } from '../Redux/rootReducer';

export const useUndoRedo = () => {
  const dispatch = useDispatch();

  // Get the studio state which includes undo/redo information
  const studioState = useSelector((state) => state.studio);
  
  // Get the present state (current state)
  const presentState = useSelector((state) => selectStudioState(state));
  
  // Get undo/redo state
  const undoRedoState = useSelector((state) => state.undoRedo);

  const canUndo = studioState?.past && studioState.past.length > 0;
  const canRedo = studioState?.future && studioState.future.length > 0;

  const undo = () => {
    if (canUndo) {
      dispatch(ActionCreators.undo());
      dispatch(updateUndoRedoState({ 
        lastAction: 'undo', 
        timestamp: Date.now() 
      }));
    }
  };

  const redo = () => {
    if (canRedo) {
      dispatch(ActionCreators.redo());
      dispatch(updateUndoRedoState({ 
        lastAction: 'redo', 
        timestamp: Date.now() 
      }));
    }
  };

  // Enhanced redo that can redo multiple steps
  const redoMultiple = (steps = 1) => {
    if (canRedo && steps > 0) {
      const availableSteps = Math.min(steps, studioState?.future?.length || 0);
      for (let i = 0; i < availableSteps; i++) {
        dispatch(ActionCreators.redo());
      }
      dispatch(updateUndoRedoState({ 
        lastAction: 'redo-multiple', 
        timestamp: Date.now(),
        stepsRedone: availableSteps
      }));
    }
  };

  // Redo all available steps
  const redoAll = () => {
    const availableSteps = studioState?.future?.length || 0;
    if (availableSteps > 0) {
      redoMultiple(availableSteps);
    }
  };

  const clearHistory = () => {
    dispatch(ActionCreators.clearHistory());
    dispatch(updateUndoRedoState({ 
      lastAction: 'clear', 
      timestamp: Date.now() 
    }));
  };

  // Get history information
  const getHistoryInfo = () => {
    const pastCount = studioState?.past?.length || 0;
    const futureCount = studioState?.future?.length || 0;
    
    return {
      pastCount,
      futureCount,
      totalHistory: pastCount + futureCount,
      canUndo,
      canRedo,
      lastAction: undoRedoState?.lastAction,
      lastActionTime: undoRedoState?.timestamp,
      maxHistorySize: 50, // This should match the limit in rootReducer.js
      isHistoryBalanced: Math.abs(pastCount - futureCount) <= 1,
      redoAvailable: futureCount > 0,
      undoAvailable: pastCount > 0
    };
  };

  // Group multiple actions together
  const groupActions = (actionGroup) => {
    return (dispatch) => {
      const groupId = `manual-group-${Date.now()}`;
      
      // Dispatch all actions in the group with the same group ID
      actionGroup.forEach((action, index) => {
        const actionWithGroup = {
          ...action,
          meta: {
            ...action.meta,
            groupId,
            groupIndex: index,
            isGrouped: true
          }
        };
        dispatch(actionWithGroup);
      });
    };
  };

  // Create a batch of related actions
  const createActionBatch = (actions, batchName = 'batch') => {
    return groupActions(actions.map(action => ({
      ...action,
      meta: {
        ...action.meta,
        batchName,
        timestamp: Date.now()
      }
    })));
  };

  return {
    undo,
    redo,
    redoMultiple,
    redoAll,
    clearHistory,
    canUndo,
    canRedo,
    getHistoryInfo,
    groupActions,
    createActionBatch,
    presentState
  };
};

// Export the selector for use in other components
export { selectStudioState };