import { createSlice } from '@reduxjs/toolkit';
import { getNextTrackColor, resetColorIndex } from '../../Utils/colorUtils';

const initialState = {
  tracks: [],
  trackHeight: 70, // Standard height for each track
  timelineSettings: {
    pixelsPerSecond: 50,
    maxDuration: 10,
  },
  // Track effects and plugins state
  trackEffects: {}, // Store effects for each track
  frozenTrackData: {}, // Store processed audio data for frozen tracks
  pianoRecord: [],
  pianoNotes: [], // <-- Add this line for piano roll note data
  pianoRecordingClip: null, // transient info for background of last recording
  isRecording: false,
  newtrackType: '',
  currentTrackId: null,
  soloTrackId: null,
  sidebarScrollOffset: 0,
  // Section labels state
  sectionLabels: [],
  // Audio playback state
  isPlaying: false,
  currentTime: 0,
  audioDuration: 500,
  masterVolume: 80, // Master volume control
  recordedData: [], // New state for recorded data
  masterVolume: 80 ,// Master volume control
  bpm: 120,   
  drumRecordedData: [], // Store drum pad recordings
  isPlayingDrumRecording: false, // Track if playing back drum recording
  drumPlaybackStartTime: null, // Track when drum playback started
  // TimelineTrack specific state
  selectedClipId: null,
  selectedTrackId: null,
  // Key and Scale Selection state
  selectedKey: null,
  selectedScale: null,
  highlightedPianoKeys: [], // Array of MIDI note numbers to highlight
  selectedSound: 'Click',
};

const studioSlice = createSlice({
  name: 'studio',
  initialState,
  reducers: {
    setTracks: (state, action) => {
      state.tracks = action.payload;
    },
    addTrack: (state, action) => {
      // Ensure new tracks have frozen property, audioClips array, and a unique color
      const track = { 
        ...action.payload, 
        frozen: false, 
        muted: false,
        volume: action.payload.volume || 80, // Set individual track volume (default 80)
        color: action.payload.color || getNextTrackColor(), // Assign unique color
        audioClips: action.payload.audioClips || [] // Array to hold multiple audio clips
      };
      state.tracks.push(track);
    },
    updateTrack: (state, action) => {
      const { id, updates } = action.payload;
      const trackIndex = state.tracks.findIndex(track => track.id === id);
      if (trackIndex !== -1) {
        state.tracks[trackIndex] = { ...state.tracks[trackIndex], ...updates };
      }
    },
    // New action to add audio clip to existing track
    addAudioClipToTrack: (state, action) => {
      const { trackId, audioClip } = action.payload;
      const trackIndex = state.tracks.findIndex(track => track.id == trackId); // Use == for type coercion
      if (trackIndex !== -1) {
        if (!state.tracks[trackIndex].audioClips) {
          state.tracks[trackIndex].audioClips = [];
        }
        const newClip = {
          id: Date.now() + Math.random(), // Unique ID for the clip
          color: audioClip.color || state.tracks[trackIndex].color || '#FFB6C1', // Use track's color as fallback
          ...audioClip
        };
        state.tracks[trackIndex].audioClips.push(newClip);
      }
    },
    // New action to update specific audio clip in a track
    updateAudioClip: (state, action) => {
      const { trackId, clipId, updates } = action.payload;
      const trackIndex = state.tracks.findIndex(track => track.id === trackId);
      if (trackIndex !== -1 && state.tracks[trackIndex].audioClips) {
        const clipIndex = state.tracks[trackIndex].audioClips.findIndex(clip => clip.id === clipId);
        if (clipIndex !== -1) {
          state.tracks[trackIndex].audioClips[clipIndex] = {
            ...state.tracks[trackIndex].audioClips[clipIndex],
            ...updates
          };
        }
      }
    },
    // New action to remove audio clip from track
    removeAudioClip: (state, action) => {
      const { trackId, clipId } = action.payload;
      const trackIndex = state.tracks.findIndex(track => track.id === trackId);
      if (trackIndex !== -1 && state.tracks[trackIndex].audioClips) {
        state.tracks[trackIndex].audioClips = state.tracks[trackIndex].audioClips.filter(
          clip => clip.id !== clipId
        );
      }
    },
    removeTrack: (state, action) => {
      const trackId = action.payload;
      state.tracks = state.tracks.filter(track => track.id !== trackId);
      // Clean up related data
      delete state.trackEffects[trackId];
      delete state.frozenTrackData[trackId];
    },
    setTrackHeight: (state, action) => {
      state.trackHeight = action.payload;
      // Update all existing tracks
      state.tracks.forEach(track => {
        track.height = action.payload;
      });
    },
    updateTimelineSettings: (state, action) => {
      state.timelineSettings = { ...state.timelineSettings, ...action.payload };
    },
    updateTrackStartTime: (state, action) => {
      const { trackId, newStartTime } = action.payload;
      const trackIndex = state.tracks.findIndex(track => track.id === trackId);
      if (trackIndex !== -1) {
        state.tracks[trackIndex].startTime = newStartTime;
      }
    },
    renameTrack: (state, action) => {
      const { trackId, newName } = action.payload;
      const trackIndex = state.tracks.findIndex(track => track.id === trackId);
      if (trackIndex !== -1) {
        state.tracks[trackIndex].name = newName;
      }
    },
    freezeTrack: (state, action) => {
      const trackId = action.payload;
      const trackIndex = state.tracks.findIndex(track => track.id === trackId);
      if (trackIndex !== -1) {
        state.tracks[trackIndex].frozen = !state.tracks[trackIndex].frozen;
      }
    },
    duplicateTrack: (state, action) => {
      const trackId = action.payload;
      const originalTrack = state.tracks.find(track => track.id === trackId);
      if (originalTrack) {
        // Create a new track with a unique ID and "Copy" suffix
        const duplicatedTrack = {
          ...originalTrack,
          id: Date.now().toString(), // Generate unique ID
          name: `${originalTrack.name}`,
          startTime: originalTrack.startTime || 0,
          frozen: false, // Reset frozen state for the copy
          color: getNextTrackColor(), // Assign new unique color
          audioClips: originalTrack.audioClips ? [...originalTrack.audioClips] : [] // Copy audio clips
        };
        
        // Add the duplicated track to the tracks array
        state.tracks.push(duplicatedTrack);
        
        // Copy effects if they exist
        if (state.trackEffects[trackId]) {
          state.trackEffects[duplicatedTrack.id] = { ...state.trackEffects[trackId] };
        }
      }
    },
    updateTrackAudio: (state, action) => {
      const { trackId, audioData } = action.payload;
      const track = state.tracks.find(track => track.id === trackId);
      if (track) {
        // Update track with audio data - now adds to audioClips array
        if (!track.audioClips) {
          track.audioClips = [];
        }
        
        const newClip = {
          id: Date.now() + Math.random(),
          url: audioData.url,
          name: audioData.name || 'New Clip',
          duration: audioData.duration,
          trimStart: audioData.trimStart || 0,
          trimEnd: audioData.duration || audioData.trimEnd,
          soundData: audioData.soundData || null,
          color: audioData.color || track.color || '#FFB6C1', // Use track's color as fallback
          startTime: audioData.startTime || 0,
          frozen: audioData.frozen || false
        };
        
        track.audioClips.push(newClip);
      }
    },
    setRecordingAudio: (state, action) => {
      state.pianoRecord = action.payload;
    },
    setRecording: (state, action) => {
      state.isRecording = action.payload;
    },
    setRecordedData: (state, action) => {
      state.recordedData = action.payload;
    },
    setTrackType: (state, action) => {
      state.newtrackType = action.payload;
    },
    setCurrentTrackId: (state, action) => {
      state.currentTrackId = action.payload;
    },
    toggleMuteTrack: (state, action) => {
      const trackId = action.payload;
      const track = state.tracks.find(track => track.id === trackId);
      if (track) {
        track.muted = !track.muted;
      }
    },
    setSoloTrackId: (state, action) => {
      state.soloTrackId = action.payload;
    },
    exportTrack: (state, action) => {
      // This is just a placeholder action for tracking export events
      // The actual export logic will be handled in the component
      return state;
    },
    setSidebarScrollOffset: (state, action) => {
      state.sidebarScrollOffset = action.payload;
    },
    // Section labels actions
    addSectionLabel: (state, action) => {
      const newSection = {
        id: Date.now() + Math.random(), // Ensure unique ID
        startTime: 0,
        endTime: 10,
        position: 0,
        width: 100,
        name: 'New Section',
        ...action.payload
      };
      state.sectionLabels.push(newSection);
    },
    updateSectionLabel: (state, action) => {
      const { id, updates } = action.payload;
      const sectionIndex = state.sectionLabels.findIndex(section => section.id === id);
      if (sectionIndex !== -1) {
        state.sectionLabels[sectionIndex] = { ...state.sectionLabels[sectionIndex], ...updates };
      }
    },
    removeSectionLabel: (state, action) => {
      const sectionId = action.payload;
      state.sectionLabels = state.sectionLabels.filter(section => section.id !== sectionId);
    },
    setSectionLabels: (state, action) => {
      state.sectionLabels = action.payload;
    },
    // New action for resizing section labels
    resizeSectionLabel: (state, action) => {
      const { sectionId, newWidth, newStartTime, newEndTime, newPosition } = action.payload;
      const sectionIndex = state.sectionLabels.findIndex(section => section.id === sectionId);
      if (sectionIndex !== -1) {
        const section = state.sectionLabels[sectionIndex];
        section.width = newWidth;
        section.startTime = newStartTime;
        section.endTime = newEndTime;
        section.position = newPosition || (newStartTime / state.audioDuration) * 100;
      }
    },
    // New action for moving section labels
    moveSectionLabel: (state, action) => {
      const { sectionId, newStartTime, newEndTime, newPosition } = action.payload;
      const sectionIndex = state.sectionLabels.findIndex(section => section.id === sectionId);
      if (sectionIndex !== -1) {
        const section = state.sectionLabels[sectionIndex];
        const duration = section.endTime - section.startTime;
        section.startTime = newStartTime;
        section.endTime = newEndTime || (newStartTime + duration);
        section.position = newPosition || (newStartTime / state.audioDuration) * 100;
      }
    },
    // Audio playback actions
    setPlaying: (state, action) => {
      state.isPlaying = action.payload;
    },
    setCurrentTime: (state, action) => {
      state.currentTime = action.payload;
    },
    setAudioDuration: (state, action) => {
      state.audioDuration = action.payload;
    },
    togglePlayPause: (state) => {
      state.isPlaying = !state.isPlaying;
    },
    resetTrackColors: (state) => {
      // Reset the color index to start from the beginning
      resetColorIndex();
    },
    // Volume management actions
    setMasterVolume: (state, action) => {
      state.masterVolume = action.payload;
    },
    setBPM: (state, action) => {
      state.bpm = action.payload;
    },
    setTrackVolume: (state, action) => {
      const { trackId, volume } = action.payload;
      const trackIndex = state.tracks.findIndex(track => track.id === trackId);
      if (trackIndex !== -1) {
        state.tracks[trackIndex].volume = Math.max(0, Math.min(100, volume));
      }
    },
    setDrumRecordedData: (state, action) => {
      state.drumRecordedData = action.payload;
    },
    setDrumPlayback: (state, action) => {
      state.isPlayingDrumRecording = action.payload;
    },
    setDrumPlaybackStartTime: (state, action) => {
      state.drumPlaybackStartTime = action.payload;
    },
    // TimelineTrack specific actions
    setSelectedClip: (state, action) => {
      state.selectedClipId = action.payload;
    },
    setSelectedTrack: (state, action) => {
      state.selectedTrackId = action.payload;
    },
    updateClipPosition: (state, action) => {
      const { trackId, clipId, startTime } = action.payload;
      const trackIndex = state.tracks.findIndex(track => track.id === trackId);
      if (trackIndex !== -1 && state.tracks[trackIndex].audioClips) {
        const clipIndex = state.tracks[trackIndex].audioClips.findIndex(clip => clip.id === clipId);
        if (clipIndex !== -1) {
          state.tracks[trackIndex].audioClips[clipIndex].startTime = startTime;
        }
      }
    },
    updateClipTrim: (state, action) => {
      const { trackId, clipId, trimStart, trimEnd, newStartTime } = action.payload;
      const trackIndex = state.tracks.findIndex(track => track.id === trackId);
      if (trackIndex !== -1 && state.tracks[trackIndex].audioClips) {
        const clipIndex = state.tracks[trackIndex].audioClips.findIndex(clip => clip.id === clipId);
        if (clipIndex !== -1) {
          const clip = state.tracks[trackIndex].audioClips[clipIndex];
          if (trimStart !== undefined) clip.trimStart = trimStart;
          if (trimEnd !== undefined) clip.trimEnd = trimEnd;
          if (newStartTime !== undefined) clip.startTime = newStartTime;
        }
      }
    },
    addPianoNote: (state, action) => {
      state.pianoNotes.push(action.payload);
    },
    setPianoNotes: (state, action) => {
      state.pianoNotes = action.payload;
    },
    clearPianoNotes: (state) => {
      state.pianoNotes = [];
    },
    setPianoRecordingClip: (state, action) => {
      state.pianoRecordingClip = action.payload; // {start, end, color}
    },
    
    // Key and Scale Selection actions
    setSelectedKey: (state, action) => {
      state.selectedKey = action.payload;
    },
    
    setSelectedScale: (state, action) => {
      state.selectedScale = action.payload;
    },
    
    setHighlightedPianoKeys: (state, action) => {
      state.highlightedPianoKeys = action.payload;
    },
    
    clearKeyScaleSelection: (state) => {
      state.selectedKey = null;
      state.selectedScale = null;
      state.highlightedPianoKeys = [];
    },
    setMetronomeSound(state, action) {
      state.selectedSound = action.payload;
    },
  },
});

export const { 
  setTracks, 
  addTrack, 
  updateTrack, 
  addAudioClipToTrack,
  updateAudioClip,
  removeAudioClip,
  removeTrack, 
  setTrackHeight,
  updateTimelineSettings,
  updateTrackStartTime,
  renameTrack,
  freezeTrack,
  duplicateTrack,
  updateTrackAudio,
  exportTrack,
  setRecordingAudio,
  setRecording,
  setRecordedData,
  setTrackType,
  setCurrentTrackId,
  toggleMuteTrack,
  setSoloTrackId,
  setSidebarScrollOffset,
  addSectionLabel,
  updateSectionLabel,
  removeSectionLabel,
  setSectionLabels,
  resizeSectionLabel,
  moveSectionLabel,
  setPlaying,
  setCurrentTime,
  setAudioDuration,
  togglePlayPause,
  resetTrackColors,
  setMasterVolume,
  setBPM,
  setTrackVolume,
  setDrumRecordedData,
  setDrumPlayback,
  setDrumPlaybackStartTime,
  setSelectedClip,
  setSelectedTrack,
  updateClipPosition,
  updateClipTrim,
  addPianoNote, // <-- Export new actions
  setPianoNotes,
  clearPianoNotes,
  setPianoRecordingClip,
  setSelectedKey,
  setSelectedScale,
  setHighlightedPianoKeys,
  clearKeyScaleSelection,
  setMetronomeSound
} = studioSlice.actions;

export default studioSlice.reducer;
