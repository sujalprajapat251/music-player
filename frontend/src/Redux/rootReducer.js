
import { combineReducers } from "redux";
import undoable from 'redux-undo';
import alertSlice from "./Slice/alert.slice";
import authSlice from "./Slice/auth.slice";
import userSlice from "./Slice/user.slice";
import soundSlice from "./Slice/sound.slice";
import musicSlice from "./Slice/music.slice";
import folderSlice from "./Slice/folder.slice";
import contactSlice from "./Slice/contact.slice";
import faqsSlice from './Slice/faqs.slice'
import termsSlice from './Slice/terms.slice';
import studioReducer from './Slice/studio.slice';
import subscribeReducer from './Slice/subscribe.slice';
import categoryReducer from './Slice/category.slice';
import patternReducer from './Slice/pattern.slice';
import effectsReducer from './Slice/effects.slice';
import gridReducer from './Slice/grid.slice';
import loopReducer from './Slice/loop.slice';
import uiReducer from './Slice/ui.slice';
import audioSettingsReducer from './Slice/audioSettings.slice';
import undoRedoReducer from './Slice/undoRedo.slice';

// Create a selector that handles the redux-undo state structure
export const selectStudioState = (state) => {
    // console.log('sdjhkfbjkzdhfjlkzbhjofgbhasdfjkfg', state);
  // If redux-undo has wrapped the state, access the present state
  if (state.studio && state.studio.present !== undefined) {
    return state.studio.present;
  }
  // Otherwise, return the state directly
  return state.studio;
  
};
// Convenience selector: tracks now include pianoNotes/pianoClip
export const selectTracks = (state) => (selectStudioState(state)?.tracks || []);
export const rootReducer = combineReducers({
    alert: alertSlice,
    auth: authSlice,
    user: userSlice,
    sound:soundSlice,
    music:musicSlice,
    folder:folderSlice,
    contact: contactSlice,
    faqs: faqsSlice,
    terms: termsSlice,
    studio: undoable(studioReducer, {
        limit: 50, // Limit undo history to 50 actions (increased from 20)
        filter: (action) => {
            // Only track certain actions for undo/redo
            const undoableActions = [
                'studio/addTrack',
                'studio/removeTrack',
                'studio/addAudioClipToTrack',
                'studio/removeAudioClip',
                'studio/updateAudioClip',
                'studio/setPianoNotes',
                'studio/setDrumRecordedData',
                'studio/setPianoRecordingClip',
                'studio/setDrumRecordingClip',
                'studio/setTrackVolume',
                'studio/toggleMuteTrack',
                'studio/updateTrackAudio',
                'studio/setCurrentTrackId',
                'studio/setTrackType',
                'studio/setBPM',
                'studio/setMasterVolume',
                'studio/updateTrack',
                'studio/renameTrack',
                'studio/freezeTrack',
                'studio/duplicateTrack',
                'studio/setTrackVolume',
                'studio/setMasterVolume'
            ];
            return undoableActions.includes(action.type);
        },
        groupBy: (action, currentState, previousHistory) => {
            // Group actions by their type and related properties
            const actionType = action.type;
            const now = Date.now();
            
            // Group track creation actions together
            if (actionType === 'studio/addTrack') {
                return `track-creation-${action.payload.id || now}`;
            }
            
            // Group track deletion actions together
            if (actionType === 'studio/removeTrack') {
                return `track-deletion-${action.payload || now}`;
            }
            
            // Group audio clip operations by track
            if (actionType === 'studio/addAudioClipToTrack' || 
                actionType === 'studio/removeAudioClip' || 
                actionType === 'studio/updateAudioClip') {
                return `audio-clip-${action.payload.trackId || 'unknown'}`;
            }
            
            // Group piano recording actions together
            if (actionType === 'studio/setPianoNotes' || 
                actionType === 'studio/setPianoRecordingClip') {
                return `piano-recording-${action.payload?.trackId || now}`;
            }
            
            // Group drum recording actions together
            if (actionType === 'studio/setDrumRecordedData' || 
                actionType === 'studio/setDrumRecordingClip') {
                return `drum-recording-${action.payload?.trackId || now}`;
            }
            
            // Group track updates together
            if (actionType === 'studio/updateTrack' || 
                actionType === 'studio/renameTrack' || 
                actionType === 'studio/freezeTrack' || 
                actionType === 'studio/duplicateTrack') {
                return `track-update-${action.payload?.id || action.payload || now}`;
            }
            
            // Group volume changes together
            if (actionType === 'studio/setTrackVolume' || 
                actionType === 'studio/setMasterVolume' || 
                actionType === 'studio/toggleMuteTrack') {
                return `volume-change-${action.payload?.trackId || 'master'}`;
            }
            
            // Group BPM changes together
            if (actionType === 'studio/setBPM') {
                return `bpm-change-${now}`;
            }
            
            // Don't group actions by time window to preserve redo history
            // This ensures that each action can be individually undone/redone
            
            // Default: each action is its own group
            return null;
        }
    }),
    subscribe: subscribeReducer,
    category: categoryReducer,
    pattern:patternReducer,
    effects: effectsReducer,
    grid: gridReducer,
    loop: loopReducer,
    ui: uiReducer,
    audioSettings: audioSettingsReducer,
    undoRedo: undoRedoReducer,
});