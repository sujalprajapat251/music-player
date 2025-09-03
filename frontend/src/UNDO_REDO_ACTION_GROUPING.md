# Undo/Redo Action Grouping System

This document explains how the new action grouping system works in the music player application.

## Overview

The action grouping system allows related Redux actions to be treated as a single unit for undo/redo operations. This means when you undo, all related actions are undone together, and when you redo, they're all redone together.

## How It Works

### 1. Automatic Grouping

The system automatically groups actions based on:
- **Action Type**: Similar actions are grouped together
- **Track ID**: Actions affecting the same track are grouped
- **Time Window**: Actions happening within 500ms are grouped
- **Custom Grouping**: Manual grouping using action creators

### 2. Grouping Rules

```javascript
// Track Creation
'studio/addTrack' → Groups with track ID

// Track Deletion  
'studio/removeTrack' → Groups with track ID

// Audio Clip Operations
'studio/addAudioClipToTrack' → Groups by track ID
'studio/removeAudioClip' → Groups by track ID
'studio/updateAudioClip' → Groups by track ID

// Recording Operations
'studio/setPianoNotes' → Groups by track ID
'studio/setPianoRecordingClip' → Groups by track ID
'studio/setDrumRecordedData' → Groups by track ID
'studio/setDrumRecordingClip' → Groups by track ID

// Track Updates
'studio/updateTrack' → Groups by track ID
'studio/renameTrack' → Groups by track ID
'studio/freezeTrack' → Groups by track ID
'studio/duplicateTrack' → Groups by track ID

// Volume Changes
'studio/setTrackVolume' → Groups by track ID
'studio/setMasterVolume' → Groups by track ID
'studio/toggleMuteTrack' → Groups by track ID

// BPM Changes
'studio/setBPM' → Groups by time
```

## Usage Examples

### 1. Using Grouped Action Creators

```javascript
import { createTrackWithDefaults, deleteTrackWithCleanup } from '../Redux/Slice/studio.slice';

// Create a track with all default properties
dispatch(createTrackWithDefaults({
  id: Date.now(),
  name: 'My Track',
  type: 'audio',
  color: '#FF0000'
}));

// Delete a track with cleanup
dispatch(deleteTrackWithCleanup(trackId));
```

### 2. Manual Action Grouping

```javascript
import { useUndoRedo } from '../hooks/useUndoRedo';
import { addTrack, setCurrentTrackId, setTrackType } from '../Redux/Slice/studio.slice';

const { groupActions, createActionBatch } = useUndoRedo();

// Group multiple actions manually
const groupedActions = groupActions([
  addTrack(newTrack),
  setCurrentTrackId(newTrack.id),
  setTrackType('audio')
]);

dispatch(groupedActions);

// Or create a named batch
const trackCreationBatch = createActionBatch([
  addTrack(newTrack),
  setCurrentTrackId(newTrack.id),
  setTrackType('audio')
], 'track-creation');

dispatch(trackCreationBatch);
```

### 3. Using the Enhanced Hook

```javascript
import { useUndoRedo } from '../hooks/useUndoRedo';

const { 
  undo, 
  redo, 
  canUndo, 
  canRedo, 
  getHistoryInfo,
  presentState 
} = useUndoRedo();

// Get history information
const historyInfo = getHistoryInfo();
console.log('Past actions:', historyInfo.pastCount);
console.log('Future actions:', historyInfo.futureCount);
console.log('Last action:', historyInfo.lastAction);

// Perform undo/redo
if (canUndo) {
  undo(); // Undoes the entire group
}

if (canRedo) {
  redo(); // Redoes the entire group
}
```

## Benefits

1. **Logical Grouping**: Related actions are undone/redone together
2. **Better UX**: Users don't have to undo multiple times for one logical operation
3. **Consistent State**: Prevents partial undo states that could break the application
4. **Performance**: Reduces the number of undo/redo steps needed

## Examples of Grouped Operations

### Track Creation
When you create a track, these actions are grouped:
- `addTrack` - Creates the track
- `setCurrentTrackId` - Sets it as the current track
- `setTrackType` - Sets the track type

**Result**: One undo operation removes the entire track creation.

### Audio Recording
When you record audio, these actions are grouped:
- `setPianoNotes` - Sets the recorded notes
- `setPianoRecordingClip` - Sets the recording clip
- `updateTrack` - Updates track metadata

**Result**: One undo operation removes the entire recording.

### Track Deletion
When you delete a track, these actions are grouped:
- `removeTrack` - Removes the track
- `setCurrentTrackId` - Updates current track selection

**Result**: One undo operation restores the entire track deletion.

## Configuration

The grouping is configured in `frontend/src/Redux/rootReducer.js`:

```javascript
studio: undoable(studioReducer, {
    limit: 20, // Limit undo history to 20 actions
    filter: (action) => {
        // Only track certain actions for undo/redo
        const undoableActions = [
            'studio/addTrack',
            'studio/removeTrack',
            // ... more actions
        ];
        return undoableActions.includes(action.type);
    },
    groupBy: (action, currentState, previousHistory) => {
        // Custom grouping logic
        // Returns group ID or null for no grouping
    }
})
```

## Best Practices

1. **Use Grouped Action Creators**: Prefer `createTrackWithDefaults` over individual actions
2. **Group Related Operations**: Always group actions that are part of one logical operation
3. **Test Undo/Redo**: Always test that undo/redo works as expected for new features
4. **Consider User Intent**: Group actions based on what the user expects to undo/redo

## Troubleshooting

### Issue: Actions not grouping properly
**Solution**: Check that the action types are included in the `undoableActions` array in `rootReducer.js`

### Issue: Undo/redo not working
**Solution**: Ensure you're using `selectStudioState` to access the current state in components

### Issue: Too many undo steps
**Solution**: Adjust the `groupBy` function to group more actions together
