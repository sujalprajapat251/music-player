import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  soundQuality: "High", // 'High', 'Medium', 'Low', 'Extra Low'
  sampleRate: 44100,
  latencyHint: "interactive",
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
  },
});

export const { setSoundQuality, setSampleRate, setLatencyHint } =
  audioSettingsSlice.actions;
export default audioSettingsSlice.reducer;
