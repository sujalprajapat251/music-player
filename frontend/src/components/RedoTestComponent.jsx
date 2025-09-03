import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useUndoRedo } from '../hooks/useUndoRedo';
import { createTrackWithDefaults } from '../Redux/Slice/studio.slice';

const RedoTestComponent = () => {
  const dispatch = useDispatch();
  const { 
    undo, 
    redo, 
    redoMultiple,
    redoAll,
    canUndo, 
    canRedo, 
    getHistoryInfo 
  } = useUndoRedo();
  
  const [testStep, setTestStep] = useState(0);

  const historyInfo = getHistoryInfo();

  const createTestTrack = () => {
    dispatch(createTrackWithDefaults({
      id: Date.now() + testStep,
      name: `Test Track ${testStep + 1}`,
      type: 'audio',
      color: `#${Math.floor(Math.random()*16777215).toString(16)}`
    }));
    setTestStep(prev => prev + 1);
  };

  const undoMultiple = (steps) => {
    for (let i = 0; i < steps; i++) {
      if (canUndo) {
        undo();
      }
    }
  };

  return (
    <div className="p-6 bg-blue-50 dark:bg-blue-900 rounded-lg">
      <h2 className="text-2xl font-bold mb-4">Redo Test Component</h2>
      
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Current History:</h3>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div className="bg-white dark:bg-gray-800 p-3 rounded">
            <div className="font-bold">Past: {historyInfo.pastCount}</div>
            <div className="text-gray-600">Undo Available</div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-3 rounded">
            <div className="font-bold">Future: {historyInfo.futureCount}</div>
            <div className="text-gray-600">Redo Available</div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-3 rounded">
            <div className="font-bold">Total: {historyInfo.totalHistory}</div>
            <div className="text-gray-600">History Size</div>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Create Test Actions:</h3>
        <div className="flex gap-2 mb-4">
          <button 
            onClick={createTestTrack}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            Create Track {testStep + 1}
          </button>
          <button 
            onClick={() => {
              for (let i = 0; i < 5; i++) {
                createTestTrack();
              }
            }}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Create 5 Tracks
          </button>
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Undo Operations:</h3>
        <div className="flex gap-2 mb-4">
          <button 
            onClick={undo}
            disabled={!canUndo}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 disabled:opacity-50"
          >
            Undo 1 Step
          </button>
          <button 
            onClick={() => undoMultiple(5)}
            disabled={!canUndo}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 disabled:opacity-50"
          >
            Undo 5 Steps
          </button>
          <button 
            onClick={() => undoMultiple(10)}
            disabled={!canUndo}
            className="bg-red-700 text-white px-4 py-2 rounded hover:bg-red-800 disabled:opacity-50"
          >
            Undo 10 Steps
          </button>
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Redo Operations:</h3>
        <div className="flex gap-2 mb-4">
          <button 
            onClick={redo}
            disabled={!canRedo}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
          >
            Redo 1 Step
          </button>
          <button 
            onClick={() => redoMultiple(5)}
            disabled={!canRedo}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            Redo 5 Steps
          </button>
          <button 
            onClick={() => redoMultiple(10)}
            disabled={!canRedo}
            className="bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-800 disabled:opacity-50"
          >
            Redo 10 Steps
          </button>
          <button 
            onClick={redoAll}
            disabled={!canRedo}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50"
          >
            Redo All ({historyInfo.futureCount})
          </button>
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Test Instructions:</h3>
        <div className="text-sm text-gray-700 dark:text-gray-300 space-y-2">
          <p>1. <strong>Create tracks</strong> - Click "Create Track" or "Create 5 Tracks" to add actions</p>
          <p>2. <strong>Undo multiple steps</strong> - Use "Undo 5 Steps" or "Undo 10 Steps" to go back</p>
          <p>3. <strong>Test redo</strong> - Use "Redo 5 Steps", "Redo 10 Steps", or "Redo All" to restore</p>
          <p>4. <strong>Verify</strong> - Check that you can redo all the steps you undid</p>
        </div>
      </div>

      <div className="text-sm text-gray-600 dark:text-gray-400">
        <p><strong>Expected Behavior:</strong> After undoing multiple steps, you should be able to redo all of them in the correct order.</p>
        <p><strong>History Balance:</strong> {historyInfo.isHistoryBalanced ? '✅ Balanced' : '❌ Unbalanced'}</p>
      </div>
    </div>
  );
};

export default RedoTestComponent;
