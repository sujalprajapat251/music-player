// frontend/src/Utils/patternTimelineBridge.js
import { syncPatternBeat as reduxSyncPatternBeat, clearPatternClips as reduxClearPatternClips, syncWholePatternToTimeline as reduxSyncWholePatternToTimeline } from '../Redux/Slice/studio.slice';

// Maintain the same surface API so existing calls remain unchanged,
// but delegate to Redux thunks under the hood.

// Call this when a single cell is toggled
export function handleBeatToggleSync({
  dispatch,
  trackId,
  padId,
  beatIndex,
  bpm,
  isOn,
  clipColor = '#FFB6C1',
}) {
  if (!trackId) return;
  dispatch(reduxSyncPatternBeat({ trackId, padId, beatIndex, bpm, isOn, clipColor }));
}

// Optional helpers; keep existing signatures but forward to Redux thunks
export function clearPatternClips(dispatch, getState, trackId) {
  if (!trackId) return;
  dispatch(reduxClearPatternClips(trackId));
}

export function syncWholePatternToTimeline({
  dispatch,
  getState,
  trackId,
  patternTracks, // [{ padId, pattern: [bool,bool,...] }]
  bpm,
}) {
  if (!trackId || !Array.isArray(patternTracks)) return;
  dispatch(reduxSyncWholePatternToTimeline({ trackId, patternRows: patternTracks, bpm }));
}