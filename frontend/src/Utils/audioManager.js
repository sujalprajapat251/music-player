import * as Tone from "tone";

class AudioManager {
  constructor() {
    this.audioContext = null;
    this.toneContext = null;
    this.qualitySettings = {
      High: { sampleRate: 48000, latencyHint: "interactive" },
      Medium: { sampleRate: 44100, latencyHint: "interactive" },
      Low: { sampleRate: 22050, latencyHint: "balanced" },
      "Extra Low": { sampleRate: 11025, latencyHint: "playback" },
    };
    this.currentQuality = "High";
    this.listeners = new Set();
    this.activeSynths = new Set();
    this.activePlayers = new Set();
  }

  initialize() {
    const settings = this.qualitySettings[this.currentQuality];
    this.audioContext = new (window.AudioContext || window.webkitAudioContext)({
      sampleRate: settings.sampleRate,
      latencyHint: settings.latencyHint,
    });

    Tone.setContext(this.audioContext);
    this.toneContext = Tone.context;

    console.log(
      `AudioManager initialized with ${settings.sampleRate}Hz sample rate`
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
      this.toneContext = Tone.context;

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

      this.activeSynths.forEach((synth) => {
        try {
          if (synth && typeof synth.dispose === "function") {
            synth.dispose();
          } else if (synth && typeof synth.stop === "function") {
            synth.stop();
          }
        } catch (error) {
          console.warn("Error stopping synth:", error);
        }
      });
      this.activeSynths.clear();

      this.activePlayers.forEach((player) => {
        try {
          if (player && typeof player.stop === "function") {
            player.stop();
          }
        } catch (error) {
          console.warn("Error stopping player:", error);
        }
      });
      this.activePlayers.clear();
    } catch (error) {
      console.warn("Error stopping audio:", error);
    }
  }

  registerSynth(synth) {
    if (synth) {
      this.activeSynths.add(synth);
    }
  }

  registerPlayer(player) {
    if (player) {
      this.activePlayers.add(player);
    }
  }

  unregisterSynth(synth) {
    this.activeSynths.delete(synth);
  }

  unregisterPlayer(player) {
    this.activePlayers.delete(player);
  }

  getAudioContext() {
    return this.audioContext;
  }

  getToneContext() {
    return this.toneContext;
  }

  getCurrentQuality() {
    return this.currentQuality;
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

const audioManager = new AudioManager();

export default audioManager;
