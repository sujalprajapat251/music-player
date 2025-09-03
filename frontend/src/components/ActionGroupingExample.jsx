// frontend/src/components/ActionGroupingExample.jsx
import React from 'react';
import { useDispatch } from 'react-redux';
import { useUndoRedo } from '../hooks/useUndoRedo';
import { 
  createTrackWithDefaults, 
  deleteTrackWithCleanup,
  addAudioClipWithMetadata,
  recordPianoSequence,
  recordDrumSequence,
  updateTrackWithHistory
} from '../Redux/Slice/studio.slice';
import { addTrack, setCurrentTrackId, setTrackType } from '../Redux/Slice/studio.slice';

const ActionGroupingExample = () => {
  const dispatch = useDispatch();
  const { 
    undo, 
    redo, 
    redoMultiple,
    redoAll,
    canUndo, 
    canRedo, 
    getHistoryInfo,
    groupActions,
    createActionBatch 
  } = useUndoRedo();

  const handleCreateTrackGrouped = () => {
    // This will create a track with all default properties as one group
    dispatch(createTrackWithDefaults({
      id: Date.now(),
      name: 'Grouped Track',
      type: 'audio',
      color: '#FF5733'
    }));
  };

  const handleCreateTrackManual = () => {
    // Manual grouping example
    const newTrack = {
      id: Date.now(),
      name: 'Manual Track',
      type: 'piano',
      color: '#33FF57'
    };

    const groupedActions = groupActions([
      addTrack(newTrack),
      setCurrentTrackId(newTrack.id),
      setTrackType(newTrack.type)
    ]);

    dispatch(groupedActions);
  };

  const handleCreateTrackBatch = () => {
    // Named batch example
    const newTrack = {
      id: Date.now(),
      name: 'Batch Track',
      type: 'drum',
      color: '#3357FF'
    };

    const trackCreationBatch = createActionBatch([
      addTrack(newTrack),
      setCurrentTrackId(newTrack.id),
      setTrackType(newTrack.type)
    ], 'track-creation-batch');

    dispatch(trackCreationBatch);
  };

  const handleDeleteTrack = (trackId) => {
    // This will delete the track and handle cleanup as one group
    dispatch(deleteTrackWithCleanup(trackId));
  };

  const handleAddAudioClip = (trackId) => {
    // This will add an audio clip and update track metadata as one group
    const audioClip = {
      name: 'Sample Audio',
      url: 'sample-url',
      duration: 30,
      color: '#FFD700'
    };

    dispatch(addAudioClipWithMetadata(trackId, audioClip));
  };

  const handleRecordPiano = (trackId) => {
    // This will record piano notes and update track as one group
    const notes = [
      { note: 'C4', startTime: 0, duration: 1 },
      { note: 'E4', startTime: 1, duration: 1 },
      { note: 'G4', startTime: 2, duration: 1 }
    ];

    const recordingClip = {
      startTime: 0,
      duration: 3,
      trackId: trackId
    };

    dispatch(recordPianoSequence(trackId, notes, recordingClip));
  };

  const handleRecordDrums = (trackId) => {
    // This will record drum data and update track as one group
    const drumData = [
      { pad: 'kick', time: 0, velocity: 0.8 },
      { pad: 'snare', time: 0.5, velocity: 0.7 },
      { pad: 'hihat', time: 1, velocity: 0.6 }
    ];

    const recordingClip = {
      startTime: 0,
      duration: 2,
      trackId: trackId
    };

    dispatch(recordDrumSequence(trackId, drumData, recordingClip));
  };

  const handleUpdateTrack = (trackId) => {
    // This will update track with history as one group
    dispatch(updateTrackWithHistory(trackId, {
      name: 'Updated Track Name',
      volume: 85
    }));
  };

  const historyInfo = getHistoryInfo();

  return (
    <div className="p-6 bg-gray-100 dark:bg-gray-800 rounded-lg">
      <h2 className="text-2xl font-bold mb-4">Action Grouping Examples</h2>
      
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">History Info:</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>Past Actions: {historyInfo.pastCount}</div>
          <div>Future Actions: {historyInfo.futureCount}</div>
          <div>Total History: {historyInfo.totalHistory}</div>
          <div>Max History Size: {historyInfo.maxHistorySize}</div>
          <div>Can Undo: {historyInfo.undoAvailable ? 'Yes' : 'No'}</div>
          <div>Can Redo: {historyInfo.redoAvailable ? 'Yes' : 'No'}</div>
          <div>History Balanced: {historyInfo.isHistoryBalanced ? 'Yes' : 'No'}</div>
          <div>Last Action: {historyInfo.lastAction || 'None'}</div>
          <div>Last Action Time: {historyInfo.lastActionTime ? new Date(historyInfo.lastActionTime).toLocaleTimeString() : 'None'}</div>
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Track Operations:</h3>
        <div className="grid grid-cols-2 gap-2 mb-4">
          <button 
            onClick={handleCreateTrackGrouped}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Create Track (Grouped)
          </button>
          <button 
            onClick={handleCreateTrackManual}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            Create Track (Manual Group)
          </button>
          <button 
            onClick={handleCreateTrackBatch}
            className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
          >
            Create Track (Named Batch)
          </button>
          <button 
            onClick={() => handleDeleteTrack(Date.now())}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Delete Track (With Cleanup)
          </button>
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Audio Operations:</h3>
        <div className="grid grid-cols-2 gap-2 mb-4">
          <button 
            onClick={() => handleAddAudioClip(Date.now())}
            className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600"
          >
            Add Audio Clip (Grouped)
          </button>
          <button 
            onClick={() => handleRecordPiano(Date.now())}
            className="bg-pink-500 text-white px-4 py-2 rounded hover:bg-pink-600"
          >
            Record Piano (Grouped)
          </button>
          <button 
            onClick={() => handleRecordDrums(Date.now())}
            className="bg-indigo-500 text-white px-4 py-2 rounded hover:bg-indigo-600"
          >
            Record Drums (Grouped)
          </button>
          <button 
            onClick={() => handleUpdateTrack(Date.now())}
            className="bg-teal-500 text-white px-4 py-2 rounded hover:bg-teal-600"
          >
            Update Track (With History)
          </button>
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Undo/Redo Controls:</h3>
        <div className="flex gap-4 mb-4">
          <button 
            onClick={undo}
            disabled={!canUndo}
            className="bg-gray-500 text-white px-6 py-2 rounded hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Undo
          </button>
          <button 
            onClick={redo}
            disabled={!canRedo}
            className="bg-gray-500 text-white px-6 py-2 rounded hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Redo
          </button>
          <button 
            onClick={redoAll}
            disabled={!canRedo}
            className="bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Redo All
          </button>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => redoMultiple(5)}
            disabled={!canRedo}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            Redo 5 Steps
          </button>
          <button 
            onClick={() => redoMultiple(10)}
            disabled={!canRedo}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            Redo 10 Steps
          </button>
        </div>
      </div>

      <div className="text-sm text-gray-600 dark:text-gray-400">
        <p><strong>Note:</strong> Each button demonstrates a different way to group actions.</p>
        <p><strong>Grouped:</strong> Uses pre-built action creators that group related actions.</p>
        <p><strong>Manual Group:</strong> Manually groups actions using the groupActions function.</p>
        <p><strong>Named Batch:</strong> Creates a named batch of actions for better tracking.</p>
        <p><strong>Limit:</strong> Both undo and redo have the same limit of {historyInfo.maxHistorySize} actions.</p>
      </div>
    </div>
  );
};

export default ActionGroupingExample;