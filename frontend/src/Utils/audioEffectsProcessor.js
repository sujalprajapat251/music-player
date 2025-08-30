// Audio Effects Processor for real-time audio processing
export class AudioEffectsProcessor {
  constructor(audioContext) {
    this.audioContext = audioContext;
    this.effectsChain = new Map(); // Map of effect instanceId to audio nodes
  }

  // Create Classic Distortion effect chain
  createClassicDistortion(parameters = {}) {
    const { mix = 0.5, amount = 0.5, makeup = 0.5 } = parameters;

    // Create audio nodes
    const inputGain = this.audioContext.createGain();
    const distortionGain = this.audioContext.createGain();
    const makeupGain = this.audioContext.createGain();
    const outputGain = this.audioContext.createGain();

    // Create waveshaper for distortion
    const waveshaper = this.audioContext.createWaveShaper();
    const curve = this.createDistortionCurve(amount);
    waveshaper.curve = curve;
    waveshaper.oversample = "4x";

    // Create filter for tone control (frequency control)
    const toneFilter = this.audioContext.createBiquadFilter();
    toneFilter.type = "lowpass";
    // Map amount parameter to frequency range (200Hz to 10kHz)
    const frequency = 200 + (amount * 9800);
    toneFilter.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
    toneFilter.Q.setValueAtTime(1, this.audioContext.currentTime);

    // Create makeup gain
    makeupGain.gain.setValueAtTime(1 + (makeup * 2), this.audioContext.currentTime);

    // Set mix levels
    inputGain.gain.setValueAtTime(1 - mix, this.audioContext.currentTime); // Dry signal
    distortionGain.gain.setValueAtTime(mix, this.audioContext.currentTime); // Wet signal

    // Connect the chain
    inputGain.connect(outputGain); // Dry path
    inputGain.connect(toneFilter); // Wet path
    toneFilter.connect(waveshaper);
    waveshaper.connect(distortionGain);
    distortionGain.connect(makeupGain);
    makeupGain.connect(outputGain);

    return {
      input: inputGain,
      output: outputGain,
      updateParameters: (newParams) => {
        const { mix: newMix, amount: newAmount, makeup: newMakeup } = newParams;

        // Update waveshaper curve
        const newCurve = this.createDistortionCurve(newAmount);
        waveshaper.curve = newCurve;

        // Update tone filter frequency (this is the key change!)
        const newFrequency = 200 + (newAmount * 9800);
        toneFilter.frequency.setValueAtTime(newFrequency, this.audioContext.currentTime);

        // Update gains
        inputGain.gain.setValueAtTime(1 - newMix, this.audioContext.currentTime);
        distortionGain.gain.setValueAtTime(newMix, this.audioContext.currentTime);
        makeupGain.gain.setValueAtTime(1 + (newMakeup * 2), this.audioContext.currentTime);
      }
    };
  }

  // Create Clipper effect chain
  createClipper(parameters = {}) {
    const { threshold = 0.5, ratio = 0.5, mix = 0.5 } = parameters;

    // Create audio nodes
    const inputGain = this.audioContext.createGain();
    const clipperGain = this.audioContext.createGain();
    const outputGain = this.audioContext.createGain();

    // Create waveshaper for hard clipping
    const waveshaper = this.audioContext.createWaveShaper();
    const curve = this.createClipperCurve(threshold, ratio);
    waveshaper.curve = curve;
    waveshaper.oversample = "4x";

    // Set mix levels
    inputGain.gain.setValueAtTime(1 - mix, this.audioContext.currentTime); // Dry signal
    clipperGain.gain.setValueAtTime(mix, this.audioContext.currentTime); // Wet signal

    // Connect the chain
    inputGain.connect(outputGain); // Dry path
    inputGain.connect(waveshaper); // Wet path
    waveshaper.connect(clipperGain);
    clipperGain.connect(outputGain);

    return {
      input: inputGain,
      output: outputGain,
      updateParameters: (newParams) => {
        const { threshold: newThreshold, ratio: newRatio, mix: newMix } = newParams;

        // Update waveshaper curve
        const newCurve = this.createClipperCurve(newThreshold, newRatio);
        waveshaper.curve = newCurve;

        // Update gains
        inputGain.gain.setValueAtTime(1 - newMix, this.audioContext.currentTime);
        clipperGain.gain.setValueAtTime(newMix, this.audioContext.currentTime);
      }
    };
  }

  // Create Crusher effect chain
  createCrusher(parameters = {}) {
    const { amount = 0.5, sampleRate = 0.5, mix = 0.5 } = parameters;

    // Create audio nodes
    const inputGain = this.audioContext.createGain();
    const crusherGain = this.audioContext.createGain();
    const outputGain = this.audioContext.createGain();

    // Create bit crusher effect
    const bitCrusher = this.createBitCrusher(amount, sampleRate);

    // Set mix levels
    inputGain.gain.setValueAtTime(1 - mix, this.audioContext.currentTime); // Dry signal
    crusherGain.gain.setValueAtTime(mix, this.audioContext.currentTime); // Wet signal

    // Connect the chain
    inputGain.connect(outputGain); // Dry path
    inputGain.connect(bitCrusher); // Wet path
    bitCrusher.connect(crusherGain);
    crusherGain.connect(outputGain);

    return {
      input: inputGain,
      output: outputGain,
      updateParameters: (newParams) => {
        const { amount: newAmount, sampleRate: newSampleRate, mix: newMix } = newParams;

        // Update bit crusher parameters
        bitCrusher.updateParameters(newAmount, newSampleRate);

        // Update gains
        inputGain.gain.setValueAtTime(1 - newMix, this.audioContext.currentTime);
        crusherGain.gain.setValueAtTime(newMix, this.audioContext.currentTime);
      }
    };
  }

  // Create Fuzz effect chain
  createFuzz(parameters = {}) {
    const { drive = 0.5, tone = 0.5, mix = 0.5 } = parameters;

    // Create audio nodes
    const inputGain = this.audioContext.createGain();
    const fuzzGain = this.audioContext.createGain();
    const outputGain = this.audioContext.createGain();

    // Create fuzz distortion
    const waveshaper = this.audioContext.createWaveShaper();
    const curve = this.createFuzzCurve(drive);
    waveshaper.curve = curve;
    waveshaper.oversample = "4x";

    // Create tone filter
    const toneFilter = this.audioContext.createBiquadFilter();
    toneFilter.type = "lowpass";
    const frequency = 200 + (tone * 9800);
    toneFilter.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
    toneFilter.Q.setValueAtTime(1, this.audioContext.currentTime);

    // Set mix levels
    inputGain.gain.setValueAtTime(1 - mix, this.audioContext.currentTime); // Dry signal
    fuzzGain.gain.setValueAtTime(mix, this.audioContext.currentTime); // Wet signal

    // Connect the chain
    inputGain.connect(outputGain); // Dry path
    inputGain.connect(waveshaper); // Wet path
    waveshaper.connect(toneFilter);
    toneFilter.connect(fuzzGain);
    fuzzGain.connect(outputGain);

    return {
      input: inputGain,
      output: outputGain,
      updateParameters: (newParams) => {
        const { drive: newDrive, tone: newTone, mix: newMix } = newParams;

        // Update waveshaper curve
        const newCurve = this.createFuzzCurve(newDrive);
        waveshaper.curve = newCurve;

        // Update tone filter frequency
        const newFrequency = 200 + (newTone * 9800);
        toneFilter.frequency.setValueAtTime(newFrequency, this.audioContext.currentTime);

        // Update gains
        inputGain.gain.setValueAtTime(1 - newMix, this.audioContext.currentTime);
        fuzzGain.gain.setValueAtTime(newMix, this.audioContext.currentTime);
      }
    };
  }

  // Create Juicy Distortion effect chain
  createJuicyDistortion(parameters = {}) {
    const { dist = 0.5, volume = 0.5, tone = 0.5, lowCut = 0.5, mix = 0.5 } = parameters;

    // Create audio nodes
    const inputGain = this.audioContext.createGain();
    const distortionGain = this.audioContext.createGain();
    const outputGain = this.audioContext.createGain();

    // Create distortion waveshaper
    const waveshaper = this.audioContext.createWaveShaper();
    const curve = this.createJuicyDistortionCurve(dist);
    waveshaper.curve = curve;
    waveshaper.oversample = "4x";

    // Create low cut filter
    const lowCutFilter = this.audioContext.createBiquadFilter();
    lowCutFilter.type = "highpass";
    const lowCutFreq = 20 + (lowCut * 200);
    lowCutFilter.frequency.setValueAtTime(lowCutFreq, this.audioContext.currentTime);
    lowCutFilter.Q.setValueAtTime(1, this.audioContext.currentTime);

    // Create tone filter
    const toneFilter = this.audioContext.createBiquadFilter();
    toneFilter.type = "lowpass";
    const frequency = 200 + (tone * 9800);
    toneFilter.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
    toneFilter.Q.setValueAtTime(1, this.audioContext.currentTime);

    // Create volume control
    const volumeGain = this.audioContext.createGain();
    volumeGain.gain.setValueAtTime(volume * 2, this.audioContext.currentTime);

    // Set mix levels
    inputGain.gain.setValueAtTime(1 - mix, this.audioContext.currentTime); // Dry signal
    distortionGain.gain.setValueAtTime(mix, this.audioContext.currentTime); // Wet signal

    // Connect the chain
    inputGain.connect(outputGain); // Dry path
    inputGain.connect(lowCutFilter); // Wet path
    lowCutFilter.connect(waveshaper);
    waveshaper.connect(toneFilter);
    toneFilter.connect(volumeGain);
    volumeGain.connect(distortionGain);
    distortionGain.connect(outputGain);

    return {
      input: inputGain,
      output: outputGain,
      updateParameters: (newParams) => {
        const { dist: newDist, volume: newVolume, tone: newTone, lowCut: newLowCut, mix: newMix } = newParams;

        // Update waveshaper curve
        const newCurve = this.createJuicyDistortionCurve(newDist);
        waveshaper.curve = newCurve;

        // Update low cut filter frequency
        const newLowCutFreq = 20 + (newLowCut * 200);
        lowCutFilter.frequency.setValueAtTime(newLowCutFreq, this.audioContext.currentTime);

        // Update tone filter frequency
        const newFrequency = 200 + (newTone * 9800);
        toneFilter.frequency.setValueAtTime(newFrequency, this.audioContext.currentTime);

        // Update volume
        volumeGain.gain.setValueAtTime(newVolume * 2, this.audioContext.currentTime);

        // Update gains
        inputGain.gain.setValueAtTime(1 - newMix, this.audioContext.currentTime);
        distortionGain.gain.setValueAtTime(newMix, this.audioContext.currentTime);
      }
    };
  }

  // Create clipper curve
  createClipperCurve(threshold, ratio) {
    const samples = 44100;
    const curve = new Float32Array(samples);
    const thresholdValue = threshold * 0.8;
    const ratioValue = 1 + (ratio * 10);

    for (let i = 0; i < samples; i++) {
      const x = (i * 2) / samples - 1;
      if (Math.abs(x) > thresholdValue) {
        curve[i] = Math.sign(x) * (thresholdValue + (Math.abs(x) - thresholdValue) / ratioValue);
      } else {
        curve[i] = x;
      }
    }

    return curve;
  }

  // Create bit crusher
  createBitCrusher(amount, sampleRate) {
    let lastSample = 0;
    let sampleCounter = 0;
    const sampleRateReduction = Math.max(1, Math.floor((1 - sampleRate) * 100));
    const bitDepth = Math.max(1, Math.floor((1 - amount) * 16));

    const scriptProcessor = this.audioContext.createScriptProcessor(4096, 1, 1);
    
    scriptProcessor.onaudioprocess = (event) => {
      const input = event.inputBuffer.getChannelData(0);
      const output = event.outputBuffer.getChannelData(0);

      for (let i = 0; i < input.length; i++) {
        sampleCounter++;
        
        if (sampleCounter >= sampleRateReduction) {
          lastSample = input[i];
          sampleCounter = 0;
        }

        // Bit reduction
        const maxValue = Math.pow(2, bitDepth - 1);
        const quantized = Math.round(lastSample * maxValue) / maxValue;
        output[i] = quantized;
      }
    };

    return {
      connect: (destination) => scriptProcessor.connect(destination),
      updateParameters: (newAmount, newSampleRate) => {
        const newSampleRateReduction = Math.max(1, Math.floor((1 - newSampleRate) * 100));
        const newBitDepth = Math.max(1, Math.floor((1 - newAmount) * 16));
        
        sampleRateReduction = newSampleRateReduction;
        bitDepth = newBitDepth;
      }
    };
  }

  // Create fuzz curve
  createFuzzCurve(drive) {
    const samples = 44100;
    const curve = new Float32Array(samples);
    const driveValue = Math.max(1, drive * 50);

    for (let i = 0; i < samples; i++) {
      const x = (i * 2) / samples - 1;
      curve[i] = Math.tanh(x * driveValue);
    }

    return curve;
  }

  // Create juicy distortion curve
  createJuicyDistortionCurve(dist) {
    const samples = 44100;
    const curve = new Float32Array(samples);
    const distValue = Math.max(1, dist * 30);

    for (let i = 0; i < samples; i++) {
      const x = (i * 2) / samples - 1;
      curve[i] = Math.sign(x) * (1 - Math.exp(-Math.abs(x) * distValue));
    }

    return curve;
  }

  // Create distortion curve based on amount
  createDistortionCurve(amount) {
    const samples = 44100;
    const curve = new Float32Array(samples);
    const deg = Math.PI / 180;

    for (let i = 0; i < samples; i++) {
      const x = (i * 2) / samples - 1;
      const distortion = Math.max(1, amount * 20);
      curve[i] =
        ((3 + distortion) * x * 20 * deg) /
        (Math.PI + distortion * Math.abs(x));
    }

    return curve;
  }

  // Apply effect to an audio source
  applyEffect(audioSource, effectType, parameters, effectInstanceId) {
    let effectChain;

    switch (effectType) {
      case "Classic Dist":
        effectChain = this.createClassicDistortion(parameters);
        break;
      case "Clipper":
        effectChain = this.createClipper(parameters);
        break;
      case "Crusher":
        effectChain = this.createCrusher(parameters);
        break;
      case "Fuzz":
        effectChain = this.createFuzz(parameters);
        break;
      case "Juicy Distrotion":
        effectChain = this.createJuicyDistortion(parameters);
        break;
      default:
        return audioSource; // No effect applied
    }

    // Store the effect chain
    this.effectsChain.set(effectInstanceId, effectChain);

    // Connect audio source through the effect chain
    audioSource.disconnect();
    audioSource.connect(effectChain.input);

    return effectChain.output;
  }

  // Update effect parameters
  updateEffectParameters(effectInstanceId, parameters) {
    const effectChain = this.effectsChain.get(effectInstanceId);
    if (effectChain && effectChain.updateParameters) {
      effectChain.updateParameters(parameters);
    }
  }

  // Remove effect
  removeEffect(effectInstanceId) {
    const effectChain = this.effectsChain.get(effectInstanceId);
    if (effectChain) {
      // Disconnect and clean up
      effectChain.input.disconnect();
      effectChain.output.disconnect();
      this.effectsChain.delete(effectInstanceId);
    }
  }

  // Convert knob angle to parameter value
  angleToParameter(angle, min = -135, max = 135) {
    const normalized = (angle - min) / (max - min);
    return Math.max(0, Math.min(1, normalized));
  }
}

// Global instance
let globalEffectsProcessor = null;

export const getEffectsProcessor = (audioContext) => {
  if (!globalEffectsProcessor) {
    globalEffectsProcessor = new AudioEffectsProcessor(audioContext);
  }
  return globalEffectsProcessor;
};
