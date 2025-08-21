// frontend/src/Utils/patternTimelineBridge.js
import { syncPatternBeat as reduxSyncPatternBeat, clearPatternClips as reduxClearPatternClips, syncWholePatternToTimeline as reduxSyncWholePatternToTimeline } from '../Redux/Slice/studio.slice';

// Force each 16-step section to map to exactly 1 second by using a fixed BPM.
// With BPM=240: one 16th-note = 60/240/4 = 1/16 s, 16 steps = 1 s.
const FIXED_SECTION_BPM = 240;

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
  // Override BPM to keep each section (16 steps) = 1 second on the timeline
  dispatch(reduxSyncPatternBeat({ trackId, padId, beatIndex, bpm: FIXED_SECTION_BPM, isOn, clipColor }));
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
  // Use fixed BPM so every 16-step block becomes exactly 1s when rendered
  dispatch(reduxSyncWholePatternToTimeline({ trackId, patternRows: patternTracks, bpm: FIXED_SECTION_BPM }));
}