import * as Tone from "tone";
import audioEffectsPlayer from "./AudioEffectsPlayer";

class AudioEffectsController {
  constructor() {
    this.activeEffects = new Map();
    this.effectInstances = new Map();
    this.demoTimeouts = new Map();

    this.effectParameters = {
      "Classic Dist": {
        defaultParams: { distortion: 0.8, tone: 0.5, lowCut: 200 },
        paramRanges: {
          distortion: { min: 0, max: 1 },
          tone: { min: 0, max: 1 },
          lowCut: { min: 50, max: 1000 },
        },
      },
      Fuzz: {
        defaultParams: { grain: 0.7, bite: 0.5, lowCut: 0.8 },
        paramRanges: {
          grain: { min: 0, max: 1 },
          bite: { min: 0, max: 1 },
          lowCut: { min: 0, max: 1 },
        },
      },
      Overdrive: {
        defaultParams: { drive: 0.6, tone: 0.5, level: 0.8 },
        paramRanges: {
          drive: { min: 0, max: 1 },
          tone: { min: 0, max: 1 },
          level: { min: 0, max: 1 },
        },
      },
      Chorus: {
        defaultParams: { rate: 1.5, depth: 0.3, frequency: 2.5 },
        paramRanges: {
          rate: { min: 0.1, max: 10 },
          depth: { min: 0, max: 1 },
          frequency: { min: 0.5, max: 10 },
        },
      },
      Flanger: {
        defaultParams: { rate: 0.5, depth: 0.7, frequency: 0.5 },
        paramRanges: {
          rate: { min: 0.1, max: 5 },
          depth: { min: 0, max: 1 },
          frequency: { min: 0.1, max: 2 },
        },
      },
      Phaser: {
        defaultParams: { frequency: 0.5, octaves: 3, stages: 10, Q: 10 },
        paramRanges: {
          frequency: { min: 0.1, max: 2 },
          octaves: { min: 1, max: 8 },
          stages: { min: 2, max: 16 },
          Q: { min: 1, max: 30 },
        },
      },
      "Auto Pan": {
        defaultParams: { rate: 1, depth: 0.5, oscFrequency: 1 },
        paramRanges: {
          rate: { min: 0.1, max: 10 },
          depth: { min: 0, max: 1 },
          oscFrequency: { min: 0.1, max: 5 },
        },
      },
      "Auto-Wah": {
        defaultParams: { frequency: 50, Q: 6, cutoff: 1000 },
        paramRanges: {
          frequency: { min: 10, max: 200 },
          Q: { min: 1, max: 30 },
          cutoff: { min: 200, max: 4000 },
        },
      },
      Rotary: {
        defaultParams: { speed: 0.5, depth: 0.8, frequency: 0.5 },
        paramRanges: {
          speed: { min: 0.1, max: 5 },
          depth: { min: 0, max: 1 },
          frequency: { min: 0.1, max: 2 },
        },
      },
      "Stereo Chorus": {
        defaultParams: { rate: 1.5, depth: 0.3, frequency: 2.5 },
        paramRanges: {
          rate: { min: 0.1, max: 10 },
          depth: { min: 0, max: 1 },
          frequency: { min: 0.5, max: 10 },
        },
      },
      "Tape Wobble": {
        defaultParams: { rate: 0.2, depth: 0.4, frequency: 0.3 },
        paramRanges: {
          rate: { min: 0.05, max: 2 },
          depth: { min: 0, max: 1 },
          frequency: { min: 0.1, max: 1 },
        },
      },
      Clipper: {
        defaultParams: { threshold: 0.7, ratio: 4, mix: 0.8 },
        paramRanges: {
          threshold: { min: 0.1, max: 1 },
          ratio: { min: 1, max: 20 },
          mix: { min: 0, max: 1 },
        },
      },
      Crusher: {
        defaultParams: { bits: 8, rate: 22050, mix: 0.8 },
        paramRanges: {
          bits: { min: 1, max: 16 },
          rate: { min: 1000, max: 44100 },
          mix: { min: 0, max: 1 },
        },
      },
      "Juicy Distrotion": {
        defaultParams: { drive: 0.8, tone: 0.5, mix: 0.8 },
        paramRanges: {
          drive: { min: 0, max: 1 },
          tone: { min: 0, max: 1 },
          mix: { min: 0, max: 1 },
        },
      },
    };
  }

  getEffectParameters(effectName) {
    return this.effectParameters[effectName] || null;
  }

  startEffect(effectName, instanceId) {
    try {
      let effectInstance = null;
      const params = this.effectParameters[effectName];

      if (!params) {
        console.warn(`No parameters defined for effect: ${effectName}`);
        return;
      }

      switch (effectName) {
        case "Classic Dist":
          effectInstance = new Tone.Distortion(params.defaultParams.distortion);
          break;
        case "Fuzz":
          effectInstance = new Tone.Distortion(params.defaultParams.grain);
          break;
        case "Overdrive":
          effectInstance = new Tone.Distortion(params.defaultParams.drive);
          break;
        case "Chorus":
          effectInstance = new Tone.Chorus(
            params.defaultParams.frequency,
            params.defaultParams.rate,
            params.defaultParams.depth
          );
          break;
        case "Flanger":
          effectInstance = new Tone.Chorus(
            params.defaultParams.frequency,
            params.defaultParams.rate,
            params.defaultParams.depth
          );
          break;
        case "Phaser":
          effectInstance = new Tone.Phaser({
            frequency: params.defaultParams.frequency,
            octaves: params.defaultParams.octaves,
            stages: params.defaultParams.stages,
            Q: params.defaultParams.Q,
          });
          break;
        case "Auto Pan":
          effectInstance = new Tone.AutoPanner(params.defaultParams.rate);
          break;
        case "Auto-Wah":
          effectInstance = new Tone.AutoWah(
            params.defaultParams.frequency,
            params.defaultParams.Q,
            params.defaultParams.cutoff
          );
          break;
        case "Rotary":
          effectInstance = new Tone.Tremolo(
            params.defaultParams.speed,
            params.defaultParams.depth
          );
          break;
        case "Stereo Chorus":
          effectInstance = new Tone.Chorus(
            params.defaultParams.frequency,
            params.defaultParams.rate,
            params.defaultParams.depth
          );
          break;
        case "Tape Wobble":
          effectInstance = new Tone.Vibrato(
            params.defaultParams.rate,
            params.defaultParams.depth
          );
          break;
        case "Clipper":
          effectInstance = new Tone.Compressor(
            -params.defaultParams.threshold * 60,
            params.defaultParams.ratio
          );
          break;
        case "Crusher":
          effectInstance = new Tone.BitCrusher(params.defaultParams.bits);
          break;
        case "Juicy Distrotion":
          effectInstance = new Tone.Distortion(params.defaultParams.drive);
          break;
        default:
          console.warn(`Unknown effect: ${effectName}`);
          return;
      }

      if (effectInstance) {
        effectInstance.toDestination();
        this.effectInstances.set(instanceId, effectInstance);
        this.activeEffects.set(instanceId, {
          name: effectName,
          instance: effectInstance,
        });
        console.log(
          `Started effect: ${effectName} with instance ID: ${instanceId}`
        );
      }
    } catch (error) {
      console.error(`Error starting effect ${effectName}:`, error);
    }
  }

  stopEffect(instanceId) {
    try {
      const effect = this.activeEffects.get(instanceId);
      if (effect && effect.instance) {
        effect.instance.dispose();
        this.activeEffects.delete(instanceId);
        this.effectInstances.delete(instanceId);
        console.log(`Stopped effect with instance ID: ${instanceId}`);
      }

      const timeout = this.demoTimeouts.get(instanceId);
      if (timeout) {
        clearTimeout(timeout);
        this.demoTimeouts.delete(instanceId);
      }
    } catch (error) {
      console.error(
        `Error stopping effect with instance ID ${instanceId}:`,
        error
      );
    }
  }

  updateEffectParameter(instanceId, paramName, value) {
    try {
      const effect = this.activeEffects.get(instanceId);
      if (!effect || !effect.instance) {
        console.warn(`No active effect found for instance ID: ${instanceId}`);
        return;
      }

      const effectInstance = effect.instance;

      switch (paramName) {
        case "distortion":
        case "drive":
        case "fuzz":
        case "grain":
          if (effectInstance.distortion !== undefined) {
            effectInstance.distortion = value;
          }
          break;
        case "frequency":
        case "oscFrequency":
        case "bite":
          if (effectInstance.frequency !== undefined) {
            effectInstance.frequency.value = value;
          } else if (effectInstance.bite !== undefined) {
            effectInstance.bite.value = value;
          }
          break;
        case "rate":
        case "speed":
          if (effectInstance.rate !== undefined) {
            effectInstance.rate.value = value;
          } else if (effectInstance.frequency !== undefined) {
            effectInstance.frequency.value = value;
          }
          break;
        case "depth":
          if (effectInstance.depth !== undefined) {
            effectInstance.depth.value = value;
          } else if (effectInstance.wet !== undefined) {
            effectInstance.wet.value = value;
          }
          break;
        case "octaves":
          if (effectInstance.octaves !== undefined) {
            effectInstance.octaves = Math.round(value);
          }
          break;
        case "stages":
          if (effectInstance.stages !== undefined) {
            effectInstance.stages = Math.round(value);
          }
          break;
        case "Q":
          if (effectInstance.Q !== undefined) {
            effectInstance.Q.value = value;
          }
          break;
        case "bits":
          if (effectInstance.bits !== undefined) {
            effectInstance.bits = Math.round(value);
          }
          break;
        case "cutoff":
        case "lowCut":
          if (effectInstance.baseFrequency !== undefined) {
            effectInstance.baseFrequency = value;
          } else if (effectInstance.frequency !== undefined) {
            effectInstance.frequency.value = value;
          } else if (effectInstance.lowCut !== undefined) {
            effectInstance.lowCut.value = value;
          }
          break;
        case "threshold":
          if (effectInstance.threshold !== undefined) {
            effectInstance.threshold.value = -value * 60;
          }
          break;
        case "ratio":
          if (effectInstance.ratio !== undefined) {
            effectInstance.ratio.value = value;
          }
          break;
        case "mix":
          if (effectInstance.wet !== undefined) {
            effectInstance.wet.value = value;
          }
          break;
        default:
          console.warn(
            `Unknown parameter: ${paramName} for effect instance: ${instanceId}`
          );
      }

      console.log(
        `Updated parameter ${paramName} to ${value} for effect instance: ${instanceId}`
      );
    } catch (error) {
      console.error(
        `Error updating parameter ${paramName} for instance ${instanceId}:`,
        error
      );
    }
  }

  playEffectDemo(effectName, duration = 4000) {
    const demoId = `demo_${Date.now()}`;

    audioEffectsPlayer
      .playEffect(effectName)
      .then(() => {
        const timeout = setTimeout(() => {
          audioEffectsPlayer.stopEffect();
          this.demoTimeouts.delete(demoId);
        }, duration);

        this.demoTimeouts.set(demoId, timeout);
      })
      .catch((error) => {
        console.error("Error playing effect demo:", error);
      });

    return demoId;
  }

  dispose() {
    this.activeEffects.forEach((effect, instanceId) => {
      this.stopEffect(instanceId);
    });

    this.demoTimeouts.forEach((timeout) => clearTimeout(timeout));
    this.demoTimeouts.clear();

    this.activeEffects.clear();
    this.effectInstances.clear();
  }
}

const audioEffectsController = new AudioEffectsController();
export default audioEffectsController;
