import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  soundQuality: "High", // 'High', 'Medium', 'Low', 'Extra Low'
  sampleRate: 44100,
  latencyHint: "interactive",
  // Global knobs shared across pages (Drum, Pattern, etc.)
  reverb: 0.2,
  pan: 0,
  volume: 0.7,
  currentDrumTypeIndex: 0,
  audioContextSettings: {
    high: { sampleRate: 48000, latencyHint: "interactive" },
    medium: { sampleRate: 44100, latencyHint: "interactive" },
    low: { sampleRate: 22050, latencyHint: "balanced" },
    extralow: { sampleRate: 11025, latencyHint: "playback" },
  },
};

const audioSettingsSlice = createSlice({
  name: "audioSettings",
  initialState,
  reducers: {
    setSoundQuality: (state, action) => {
      const quality = action.payload;
      state.soundQuality = quality;

      const qualityKey = quality.toLowerCase().replace(" ", "");
      const settings = state.audioContextSettings[qualityKey];
      if (settings) {
        state.sampleRate = settings.sampleRate;
        state.latencyHint = settings.latencyHint;
      }
    },
    setSampleRate: (state, action) => {
      state.sampleRate = action.payload;
    },
    setLatencyHint: (state, action) => {
      state.latencyHint = action.payload;
    },
    setGlobalReverb: (state, action) => {
      state.reverb = action.payload;
    },
    setGlobalPan: (state, action) => {
      state.pan = action.payload;
    },
    setGlobalVolume: (state, action) => {
      state.volume = action.payload;
    },
    setGlobalDrumTypeIndex: (state, action) => {
      state.currentDrumTypeIndex = action.payload;
    },
  },
});

export const { setSoundQuality, setSampleRate, setLatencyHint, setGlobalReverb, setGlobalPan, setGlobalVolume, setGlobalDrumTypeIndex } =
  audioSettingsSlice.actions;
export default audioSettingsSlice.reducer;
