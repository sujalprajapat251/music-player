import * as Tone from "tone";

class AudioQualityManager {
  constructor() {
    this.currentQuality = "High";
    this.qualitySettings = {
      High: { sampleRate: 48000, latencyHint: "interactive" },
      Medium: { sampleRate: 44100, latencyHint: "interactive" },
      Low: { sampleRate: 22050, latencyHint: "balanced" },
      "Extra Low": { sampleRate: 11025, latencyHint: "playback" },
    };
    this.listeners = new Set();
    this.audioContext = null;
  }

  initialize() {
    const settings = this.qualitySettings[this.currentQuality];
    this.audioContext = new (window.AudioContext || window.webkitAudioContext)({
      sampleRate: settings.sampleRate,
      latencyHint: settings.latencyHint,
    });

    Tone.setContext(this.audioContext);

    console.log(
      `AudioQualityManager initialized with ${settings.sampleRate}Hz sample rate`
    );
  }

  async changeQuality(quality) {
    if (this.currentQuality === quality) return;

    const settings = this.qualitySettings[quality];
    if (!settings) {
      console.error(`Unknown quality setting: ${quality}`);
      return;
    }

    try {
      console.log(
        `Changing audio quality from ${this.currentQuality} to ${quality} (${settings.sampleRate}Hz)`
      );

      await this.stopAllAudio();

      if (this.audioContext) {
        await this.audioContext.close();
      }

      this.audioContext = new (window.AudioContext ||
        window.webkitAudioContext)({
        sampleRate: settings.sampleRate,
        latencyHint: settings.latencyHint,
      });

      Tone.setContext(this.audioContext);

      this.currentQuality = quality;

      if (this.audioContext.state === "suspended") {
        await this.audioContext.resume();
      }

      this.notifyListeners(quality, settings);

      console.log(`Audio quality successfully changed to ${quality}`);
    } catch (error) {
      console.error("Failed to change audio quality:", error);
      throw error;
    }
  }

  async stopAllAudio() {
    try {
      if (Tone.Transport.state === "started") {
        Tone.Transport.stop();
      }

      if (this.audioContext) {
        const destination = this.audioContext.destination;
      }
    } catch (error) {
      console.warn("Error stopping audio:", error);
    }
  }

  getAudioContext() {
    return this.audioContext;
  }

  getCurrentQuality() {
    return this.currentQuality;
  }

  getCurrentSampleRate() {
    return this.audioContext ? this.audioContext.sampleRate : 44100;
  }

  addListener(callback) {
    this.listeners.add(callback);
  }

  removeListener(callback) {
    this.listeners.delete(callback);
  }

  notifyListeners(quality, settings) {
    this.listeners.forEach((callback) => {
      try {
        callback(quality, settings);
      } catch (error) {
        console.error("Error in audio quality change listener:", error);
      }
    });
  }

  async resume() {
    if (this.audioContext && this.audioContext.state === "suspended") {
      await this.audioContext.resume();
    }
  }
}

const audioQualityManager = new AudioQualityManager();

export default audioQualityManager;
