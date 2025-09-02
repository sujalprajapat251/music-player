
# Undo/Redo Functionality

This project now includes comprehensive undo/redo functionality using the `redux-undo` package.

## Features

- **Undo/Redo Actions**: Track and reverse changes to tracks, audio clips, piano notes, drum recordings, and more
- **Keyboard Shortcuts**: 
  - `Ctrl+Z` (or `Cmd+Z` on Mac) for Undo
  - `Ctrl+Y` or `Ctrl+Shift+Z` (or `Cmd+Y`/`Cmd+Shift+Z` on Mac) for Redo
- **Visual Indicators**: 
  - Undo/Redo buttons show step counts
  - Buttons are disabled when no actions are available
  - Toast notifications confirm actions
- **Smart Filtering**: Only tracks meaningful actions, not every state change

## Implementation Details

### 1. Redux Store Setup
- The `studio` slice is wrapped with `redux-undo` in `rootReducer.js`
- Configurable action filtering to only track important changes
- History limit of 20 actions to prevent memory issues

### 2. Tracked Actions
The following actions are tracked for undo/redo:
- `addTrack` / `removeTrack`
- `addAudioClipToTrack` / `removeAudioClip` / `updateAudioClip`
- `setPianoNotes` / `setDrumRecordedData`
- `setPianoRecordingClip` / `setDrumRecordingClip`
- `setTrackVolume` / `toggleMuteTrack`
- `updateTrackAudio`
- `setCurrentTrackId` / `setTrackType`
- `setBPM` / `setMasterVolume`

### 3. Components
- **TopHeader**: Contains the undo/redo buttons with visual feedback
- **useUndoRedo Hook**: Custom hook providing undo/redo functionality
- **undoRedo Slice**: Manages undo/redo state and UI indicators

### 4. User Interface
- **Undo Button**: Left-pointing arrow (←) with step count badge
- **Redo Button**: Right-pointing arrow (→) with step count badge
- **Visual States**: 
  - Active: Gray with hover effects
  - Disabled: Dark gray, non-clickable
  - Step Count: Purple badge showing available steps

## Usage

### For Users
1. **Click the arrows** in the top header to undo/redo actions
2. **Use keyboard shortcuts** for quick access
3. **Watch for visual feedback** - buttons show available steps
4. **Check tooltips** for detailed information

### For Developers
1. **Import the hook**: `import { useUndoRedo } from '../hooks/useUndoRedo'`
2. **Use in components**: `const { undo, redo, canUndo, canRedo } = useUndoRedo()`
3. **Add new actions**: Update the filter array in `rootReducer.js`

## Configuration

### History Limit
Change the limit in `rootReducer.js`:
```javascript
studio: undoable(studioReducer, {
    limit: 20, // Adjust this number
    // ... other options
})
```

### Action Filtering
Modify the `undoableActions` array to track different actions:
```javascript
const undoableActions = [
    'studio/addTrack',
    'studio/removeTrack',
    // Add or remove actions as needed
];
```

## Technical Notes

- **Performance**: History is limited to prevent memory bloat
- **State Structure**: Redux-undo adds `past`, `present`, and `future` arrays
- **Action Filtering**: Only meaningful actions are tracked, not every state change
- **Memory Management**: Old history entries are automatically removed when limit is exceeded

## Troubleshooting

### Common Issues
1. **Actions not being tracked**: Check if the action type is in the `undoableActions` array
2. **Memory issues**: Reduce the history limit
3. **State not updating**: Ensure the component is connected to Redux store

### Debug Mode
Enable debug logging by uncommenting console.log statements in `useUndoRedo.js`

## Future Enhancements

- **Grouped Actions**: Combine related actions into single undo steps
- **Custom Merge Functions**: Smart merging of similar actions
- **Persistent History**: Save undo history to localStorage
- **Action Labels**: Human-readable names for undo/redo actions
