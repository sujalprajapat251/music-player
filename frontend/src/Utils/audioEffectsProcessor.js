// Audio Effects Processor for real-time audio processing
export class AudioEffectsProcessor {
  constructor(audioContext) {
    this.audioContext = audioContext;
    this.effectsChain = new Map(); // Map of effect instanceId to audio nodes
    
    // Create master gain boost for all effects
    this.masterGain = this.audioContext.createGain();
    this.masterGain.gain.setValueAtTime(3.0, this.audioContext.currentTime); // 3x boost for all effects
  }

  // Create Classic Distortion effect chain
  createClassicDistortion(parameters = {}) {
    const { dist = 0.5, tone = 0.5, lowCut = 0.5 } = parameters;

    // Create audio nodes
    const inputGain = this.audioContext.createGain();
    inputGain.gain.setValueAtTime(2.0, this.audioContext.currentTime); // Pre-amplify input signal
    const distortionGain = this.audioContext.createGain();
    const outputGain = this.audioContext.createGain();
    outputGain.gain.setValueAtTime(1.5, this.audioContext.currentTime); // Boost output signal

    // Create waveshaper for extreme distortion
    const waveshaper = this.audioContext.createWaveShaper();
    const curve = this.createDistortionCurve(dist * 1600); // 4x more aggressive
    waveshaper.curve = curve;
    waveshaper.oversample = "4x";

    // Create high-shelf filter for extreme tone control
    const toneFilter = this.audioContext.createBiquadFilter();
    toneFilter.type = "highshelf";
    toneFilter.frequency.setValueAtTime(1500, this.audioContext.currentTime); // Lower frequency for more dramatic effect
    toneFilter.gain.setValueAtTime((tone - 0.5) * 100, this.audioContext.currentTime); // -50dB to +50dB range

    // Create high-pass filter for extreme low cut
    const lowCutFilter = this.audioContext.createBiquadFilter();
    lowCutFilter.type = "highpass";
    const lowCutFreq = 20 + (lowCut * 3980); // 20Hz to 4000Hz range
    lowCutFilter.frequency.setValueAtTime(lowCutFreq, this.audioContext.currentTime);
    lowCutFilter.Q.setValueAtTime(2.8, this.audioContext.currentTime); // Much sharper resonance

    // Set extreme gain levels
    distortionGain.gain.setValueAtTime(3.0, this.audioContext.currentTime); // 3x boost
    outputGain.gain.setValueAtTime(0.9, this.audioContext.currentTime); // Higher output

    // Connect the chain
    inputGain.connect(lowCutFilter);
    lowCutFilter.connect(waveshaper);
    waveshaper.connect(toneFilter);
    toneFilter.connect(distortionGain);
    distortionGain.connect(outputGain);

    return {
      input: inputGain,
      output: outputGain,
      updateParameters: (newParams) => {
        const { dist: newDist, tone: newTone, lowCut: newLowCut } = newParams;
        
        // Update with extreme settings
        const newCurve = this.createDistortionCurve(newDist * 1600);
        waveshaper.curve = newCurve;
        toneFilter.gain.setValueAtTime((newTone - 0.5) * 100, this.audioContext.currentTime);
        const newLowCutFreq = 20 + (newLowCut * 3980);
        lowCutFilter.frequency.setValueAtTime(newLowCutFreq, this.audioContext.currentTime);
      }
    };
  }

  // Create extreme distortion curve
  createDistortionCurve(amount) {
    const samples = 44100;
    const curve = new Float32Array(samples);

    for (let i = 0; i < samples; i++) {
      const x = (i * 2) / samples - 1;
      const distortion = Math.max(1, amount * 200); // 2x more aggressive
      curve[i] = Math.tanh(x * distortion) * 3.0; // 3x output gain
    }
    return curve;
  }

  // Create Clipper effect chain
  createClipper(parameters = {}) {
    const { threshold = 0.5, ratio = 0.5, mix = 0.5 } = parameters;

    // Create audio nodes
    const inputGain = this.audioContext.createGain();
    inputGain.gain.setValueAtTime(3.0, this.audioContext.currentTime); // Pre-amplify input signal
    const clipperGain = this.audioContext.createGain();
    clipperGain.gain.setValueAtTime(2.5, this.audioContext.currentTime); // Boost clipper signal
    const outputGain = this.audioContext.createGain();
    outputGain.gain.setValueAtTime(2.0, this.audioContext.currentTime); // Boost output signal

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
    const { grain = 0.5, bite = 0.5, lowCut = 0.5 } = parameters;

    // Create audio nodes
    const inputGain = this.audioContext.createGain();
    inputGain.gain.setValueAtTime(2.0, this.audioContext.currentTime); // Pre-amplify input signal
    const fuzzGain = this.audioContext.createGain();
    fuzzGain.gain.setValueAtTime(1.5, this.audioContext.currentTime); // Moderate fuzz signal boost
    const outputGain = this.audioContext.createGain();
    outputGain.gain.setValueAtTime(1.8, this.audioContext.currentTime); // Output signal boost

    // Create main fuzz distortion waveshaper
    const fuzzWaveshaper = this.audioContext.createWaveShaper();
    const fuzzCurve = this.createFuzzCurve(grain);
    fuzzWaveshaper.curve = fuzzCurve;
    fuzzWaveshaper.oversample = "4x";

    // Create bite (high-frequency emphasis) filter
    const biteFilter = this.audioContext.createBiquadFilter();
    biteFilter.type = "highshelf";
    biteFilter.frequency.setValueAtTime(2000, this.audioContext.currentTime); // 2kHz shelf frequency
    const biteGain = -12 + (bite * 24); // -12dB to +12dB range
    biteFilter.gain.setValueAtTime(biteGain, this.audioContext.currentTime);
    biteFilter.Q.setValueAtTime(0.7, this.audioContext.currentTime);

    // Create low cut filter
    const lowCutFilter = this.audioContext.createBiquadFilter();
    lowCutFilter.type = "highpass";
    const lowCutFreq = 20 + (lowCut * 480); // 20Hz to 500Hz range
    lowCutFilter.frequency.setValueAtTime(lowCutFreq, this.audioContext.currentTime);
    lowCutFilter.Q.setValueAtTime(1.2, this.audioContext.currentTime);

    // Create additional harmonics generator for more aggressive fuzz
    const harmonicsGain = this.audioContext.createGain();
    harmonicsGain.gain.setValueAtTime(0.3 + (grain * 0.4), this.audioContext.currentTime); // Varies with grain

    // Connect the chain: Input -> Low Cut -> Fuzz -> Bite -> Harmonics -> Output
    inputGain.connect(lowCutFilter);
    lowCutFilter.connect(fuzzWaveshaper);
    fuzzWaveshaper.connect(biteFilter);
    biteFilter.connect(harmonicsGain);
    harmonicsGain.connect(fuzzGain);
    fuzzGain.connect(outputGain);

    return {
      input: inputGain,
      output: outputGain,
      updateParameters: (newParams) => {
        const { grain: newGrain, bite: newBite, lowCut: newLowCut } = newParams;

        // Update fuzz waveshaper curve based on grain
        const newFuzzCurve = this.createFuzzCurve(newGrain);
        fuzzWaveshaper.curve = newFuzzCurve;

        // Update bite (high-frequency emphasis)
        const newBiteGain = -12 + (newBite * 24); // -12dB to +12dB range
        biteFilter.gain.setValueAtTime(newBiteGain, this.audioContext.currentTime);

        // Update low cut filter frequency
        const newLowCutFreq = 20 + (newLowCut * 480); // 20Hz to 500Hz range
        lowCutFilter.frequency.setValueAtTime(newLowCutFreq, this.audioContext.currentTime);

        // Update harmonics gain based on grain amount
        const newHarmonicsGain = 0.3 + (newGrain * 0.4);
        harmonicsGain.gain.setValueAtTime(newHarmonicsGain, this.audioContext.currentTime);

        // Update fuzz signal gain based on grain for more dynamic response
        const newFuzzSignalGain = 1.2 + (newGrain * 0.6);
        fuzzGain.gain.setValueAtTime(newFuzzSignalGain, this.audioContext.currentTime);
      }
    };
  }

  // Create Juicy Distortion effect chain
  createJuicyDistortion(parameters = {}) {
    const { dist = 0.5, volume = 0.5, tone = 0.5, lowCut = 0.5, mix = 0.5 } = parameters;

    // Create audio nodes
    const inputGain = this.audioContext.createGain();
    inputGain.gain.setValueAtTime(2.5, this.audioContext.currentTime); // Pre-amplify input signal
    const distortionGain = this.audioContext.createGain();
    distortionGain.gain.setValueAtTime(2.0, this.audioContext.currentTime); // Boost distortion signal
    const outputGain = this.audioContext.createGain();
    outputGain.gain.setValueAtTime(2.0, this.audioContext.currentTime); // Boost output signal

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

  // Create fuzz curve - Enhanced for better grain control
  createFuzzCurve(grain) {
    const samples = 44100;
    const curve = new Float32Array(samples);
    // Use grain to control both drive and saturation characteristics
    const driveValue = Math.max(2, grain * 80); // More dynamic range
    const saturation = 0.6 + (grain * 0.4); // Variable saturation

    for (let i = 0; i < samples; i++) {
      const x = (i * 2) / samples - 1;
      
      // Multi-stage distortion for more complex harmonics
      let y = Math.tanh(x * driveValue) * saturation;
      
      // Add asymmetric clipping for more character
      if (y > 0.7) {
        y = 0.7 + (y - 0.7) * 0.3;
      } else if (y < -0.6) {
        y = -0.6 + (y + 0.6) * 0.4;
      }
      
      // Apply soft knee compression for smoother transitions
      const threshold = 0.8;
      const ratio = 3;
      if (Math.abs(y) > threshold) {
        const excess = Math.abs(y) - threshold;
        const compressedExcess = excess / ratio;
        y = Math.sign(y) * (threshold + compressedExcess);
      }
      
      curve[i] = y;
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

  // Create Chorus effect chain
  createChorus(parameters = {}) {
    const { rate = 0.5, depth = 0.5, mix = 0.8 } = parameters;
  
    const inputGain = this.audioContext.createGain();
    const outputGain = this.audioContext.createGain();
    const wetGain = this.audioContext.createGain();
    const dryGain = this.audioContext.createGain();
  
    // Create delay lines for chorus effect
    const delayTime = 0.02; // 20ms base delay
    const delayNode = this.audioContext.createDelay(0.1);
    delayNode.delayTime.setValueAtTime(delayTime, this.audioContext.currentTime);
  
    // Create LFO for modulation
    const lfo = this.audioContext.createOscillator();
    const lfoGain = this.audioContext.createGain();
    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(rate * 2, this.audioContext.currentTime);
    lfoGain.gain.setValueAtTime(depth * 0.005, this.audioContext.currentTime);
  
    // Connect LFO to delay modulation
    lfo.connect(lfoGain);
    lfoGain.connect(delayNode.delayTime);
    lfo.start();
  
    // Set mix levels
    dryGain.gain.setValueAtTime(1 - mix, this.audioContext.currentTime);
    wetGain.gain.setValueAtTime(mix, this.audioContext.currentTime);
  
    // Connect the chain
    inputGain.connect(dryGain);
    inputGain.connect(delayNode);
    delayNode.connect(wetGain);
    dryGain.connect(outputGain);
    wetGain.connect(outputGain);
  
    return {
      input: inputGain,
      output: outputGain,
      updateParameters: (newParams) => {
        const { rate: newRate, depth: newDepth, mix: newMix } = newParams;
        lfo.frequency.setValueAtTime(newRate * 2, this.audioContext.currentTime);
        lfoGain.gain.setValueAtTime(newDepth * 0.005, this.audioContext.currentTime);
        dryGain.gain.setValueAtTime(1 - newMix, this.audioContext.currentTime);
        wetGain.gain.setValueAtTime(newMix, this.audioContext.currentTime);
      }
    };
  }
  
  // Create Flanger effect chain
  createFlanger(parameters = {}) {
    const { rate = 0.5, depth = 0.5, mix = 0.8 } = parameters;
  
    const inputGain = this.audioContext.createGain();
    const outputGain = this.audioContext.createGain();
    const wetGain = this.audioContext.createGain();
    const dryGain = this.audioContext.createGain();
    const feedbackGain = this.audioContext.createGain();
  
    // Create delay for flanger effect (shorter than chorus)
    const delayNode = this.audioContext.createDelay(0.02);
    delayNode.delayTime.setValueAtTime(0.005, this.audioContext.currentTime);
  
    // Create LFO for modulation
    const lfo = this.audioContext.createOscillator();
    const lfoGain = this.audioContext.createGain();
    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(rate, this.audioContext.currentTime);
    lfoGain.gain.setValueAtTime(depth * 0.003, this.audioContext.currentTime);
  
    // Feedback for characteristic flanger sound
    feedbackGain.gain.setValueAtTime(0.7, this.audioContext.currentTime);
  
    // Connect LFO and feedback
    lfo.connect(lfoGain);
    lfoGain.connect(delayNode.delayTime);
    delayNode.connect(feedbackGain);
    feedbackGain.connect(delayNode);
    lfo.start();
  
    // Set mix levels
    dryGain.gain.setValueAtTime(1 - mix, this.audioContext.currentTime);
    wetGain.gain.setValueAtTime(mix, this.audioContext.currentTime);
  
    // Connect the chain
    inputGain.connect(dryGain);
    inputGain.connect(delayNode);
    delayNode.connect(wetGain);
    dryGain.connect(outputGain);
    wetGain.connect(outputGain);
  
    return {
      input: inputGain,
      output: outputGain,
      updateParameters: (newParams) => {
        const { rate: newRate, depth: newDepth, mix: newMix } = newParams;
        lfo.frequency.setValueAtTime(newRate, this.audioContext.currentTime);
        lfoGain.gain.setValueAtTime(newDepth * 0.003, this.audioContext.currentTime);
        dryGain.gain.setValueAtTime(1 - newMix, this.audioContext.currentTime);
        wetGain.gain.setValueAtTime(newMix, this.audioContext.currentTime);
      }
    };
  }
  
  // Create Phaser effect chain
  createPhaser(parameters = {}) {
    const { rate = 0.5, depth = 0.5, mix = 0.8 } = parameters;
  
    const inputGain = this.audioContext.createGain();
    const outputGain = this.audioContext.createGain();
    const wetGain = this.audioContext.createGain();
    const dryGain = this.audioContext.createGain();
  
    // Create multiple all-pass filters for phasing
    const allPassFilters = [];
    const numStages = 6;
    
    for (let i = 0; i < numStages; i++) {
      const filter = this.audioContext.createBiquadFilter();
      filter.type = 'allpass';
      filter.frequency.setValueAtTime(200 + i * 300, this.audioContext.currentTime);
      filter.Q.setValueAtTime(10, this.audioContext.currentTime);
      allPassFilters.push(filter);
    }
  
    // Create LFO for modulation
    const lfo = this.audioContext.createOscillator();
    const lfoGain = this.audioContext.createGain();
    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(rate, this.audioContext.currentTime);
    lfoGain.gain.setValueAtTime(depth * 1000, this.audioContext.currentTime);
  
    // Connect LFO to all filters
    lfo.connect(lfoGain);
    allPassFilters.forEach(filter => {
      lfoGain.connect(filter.frequency);
    });
    lfo.start();
  
    // Chain the all-pass filters
    let currentNode = inputGain;
    allPassFilters.forEach(filter => {
      currentNode.connect(filter);
      currentNode = filter;
    });
  
    // Set mix levels
    dryGain.gain.setValueAtTime(1 - mix, this.audioContext.currentTime);
    wetGain.gain.setValueAtTime(mix, this.audioContext.currentTime);
  
    // Connect the chain
    inputGain.connect(dryGain);
    currentNode.connect(wetGain);
    dryGain.connect(outputGain);
    wetGain.connect(outputGain);
  
    return {
      input: inputGain,
      output: outputGain,
      updateParameters: (newParams) => {
        const { rate: newRate, depth: newDepth, mix: newMix } = newParams;
        lfo.frequency.setValueAtTime(newRate, this.audioContext.currentTime);
        lfoGain.gain.setValueAtTime(newDepth * 1000, this.audioContext.currentTime);
        dryGain.gain.setValueAtTime(1 - newMix, this.audioContext.currentTime);
        wetGain.gain.setValueAtTime(newMix, this.audioContext.currentTime);
      }
    };
  }
  
  // Create Auto Pan effect chain
  createAutoPan(parameters = {}) {
    const { rate = 0.5, depth = 0.5 } = parameters;
  
    const inputGain = this.audioContext.createGain();
    const outputGain = this.audioContext.createGain();
    const leftGain = this.audioContext.createGain();
    const rightGain = this.audioContext.createGain();
    const splitter = this.audioContext.createChannelSplitter(2);
    const merger = this.audioContext.createChannelMerger(2);
  
    // Create LFO for panning
    const lfo = this.audioContext.createOscillator();
    const lfoGain = this.audioContext.createGain();
    const lfoOffset = this.audioContext.createGain();
    
    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(rate, this.audioContext.currentTime);
    lfoGain.gain.setValueAtTime(depth * 0.5, this.audioContext.currentTime);
    lfoOffset.gain.setValueAtTime(0.5, this.audioContext.currentTime);
  
    // Connect LFO to panning
    lfo.connect(lfoGain);
    lfoGain.connect(lfoOffset);
    lfoOffset.connect(leftGain.gain);
    
    // Invert for right channel
    const inverter = this.audioContext.createGain();
    inverter.gain.setValueAtTime(-1, this.audioContext.currentTime);
    lfoGain.connect(inverter);
    inverter.connect(rightGain.gain);
    
    lfo.start();
  
    // Connect the chain
    inputGain.connect(splitter);
    splitter.connect(leftGain, 0);
    splitter.connect(rightGain, 1);
    leftGain.connect(merger, 0, 0);
    rightGain.connect(merger, 0, 1);
    merger.connect(outputGain);
  
    return {
      input: inputGain,
      output: outputGain,
      updateParameters: (newParams) => {
        const { rate: newRate, depth: newDepth } = newParams;
        lfo.frequency.setValueAtTime(newRate, this.audioContext.currentTime);
        lfoGain.gain.setValueAtTime(newDepth * 0.5, this.audioContext.currentTime);
      }
    };
  }
  
  // Create Overdrive effect chain
  createOverdrive(parameters = {}) {
    const { dist = 0.5, tone = 0.5, lowCut = 0.5 } = parameters;

    const inputGain = this.audioContext.createGain();
    inputGain.gain.setValueAtTime(2.5, this.audioContext.currentTime); // Pre-amplify input signal
    const outputGain = this.audioContext.createGain();
    outputGain.gain.setValueAtTime(2.0, this.audioContext.currentTime); // Boost output signal
    const preGain = this.audioContext.createGain();
    preGain.gain.setValueAtTime(3.0, this.audioContext.currentTime); // Boost pre-gain signal
  
    // Create waveshaper for overdrive (softer than distortion)
    const waveshaper = this.audioContext.createWaveShaper();
    const curve = this.createOverdriveCurve(dist);
    waveshaper.curve = curve;
    waveshaper.oversample = '2x';
  
    // Create tone control
    const toneFilter = this.audioContext.createBiquadFilter();
    toneFilter.type = 'highshelf';
    toneFilter.frequency.setValueAtTime(2000, this.audioContext.currentTime);
    toneFilter.gain.setValueAtTime((tone - 0.5) * 20, this.audioContext.currentTime);
  
    // Create low cut filter
    const lowCutFilter = this.audioContext.createBiquadFilter();
    lowCutFilter.type = 'highpass';
    const lowCutFreq = 50 + (lowCut * 500);
    lowCutFilter.frequency.setValueAtTime(lowCutFreq, this.audioContext.currentTime);
  
    // Set gain levels
    preGain.gain.setValueAtTime(1 + dist, this.audioContext.currentTime);
    outputGain.gain.setValueAtTime(0.7, this.audioContext.currentTime);
  
    // Connect the chain
    inputGain.connect(preGain);
    preGain.connect(lowCutFilter);
    lowCutFilter.connect(waveshaper);
    waveshaper.connect(toneFilter);
    toneFilter.connect(outputGain);
  
    return {
      input: inputGain,
      output: outputGain,
      updateParameters: (newParams) => {
        const { dist: newDist, tone: newTone, lowCut: newLowCut } = newParams;
        const newCurve = this.createOverdriveCurve(newDist);
        waveshaper.curve = newCurve;
        preGain.gain.setValueAtTime(1 + newDist, this.audioContext.currentTime);
        toneFilter.gain.setValueAtTime((newTone - 0.5) * 20, this.audioContext.currentTime);
        const newLowCutFreq = 50 + (newLowCut * 500);
        lowCutFilter.frequency.setValueAtTime(newLowCutFreq, this.audioContext.currentTime);
      }
    };
  }
  
  // Create Auto-Wah effect chain
  createAutoWah(parameters = {}) {
    const { rate = 0.5, mix = 0.8 } = parameters;
  
    const inputGain = this.audioContext.createGain();
    const outputGain = this.audioContext.createGain();
    const wetGain = this.audioContext.createGain();
    const dryGain = this.audioContext.createGain();
  
    // Create wah filter
    const wahFilter = this.audioContext.createBiquadFilter();
    wahFilter.type = 'bandpass';
    wahFilter.Q.setValueAtTime(15, this.audioContext.currentTime);
  
    // Create LFO for wah modulation
    const lfo = this.audioContext.createOscillator();
    const lfoGain = this.audioContext.createGain();
    const lfoOffset = this.audioContext.createGain();
    
    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(rate, this.audioContext.currentTime);
    lfoGain.gain.setValueAtTime(1500, this.audioContext.currentTime);
    lfoOffset.gain.setValueAtTime(800, this.audioContext.currentTime);
  
    // Connect LFO to filter frequency
    lfo.connect(lfoGain);
    lfoGain.connect(lfoOffset);
    lfoOffset.connect(wahFilter.frequency);
    lfo.start();
  
    // Set mix levels
    dryGain.gain.setValueAtTime(1 - mix, this.audioContext.currentTime);
    wetGain.gain.setValueAtTime(mix, this.audioContext.currentTime);
  
    // Connect the chain
    inputGain.connect(dryGain);
    inputGain.connect(wahFilter);
    wahFilter.connect(wetGain);
    dryGain.connect(outputGain);
    wetGain.connect(outputGain);
  
    return {
      input: inputGain,
      output: outputGain,
      updateParameters: (newParams) => {
        const { rate: newRate, mix: newMix } = newParams;
        lfo.frequency.setValueAtTime(newRate, this.audioContext.currentTime);
        dryGain.gain.setValueAtTime(1 - newMix, this.audioContext.currentTime);
        wetGain.gain.setValueAtTime(newMix, this.audioContext.currentTime);
      }
    };
  }
  
  // Create Rotary effect chain
  createRotary(parameters = {}) {
    const { rate = 0.5 } = parameters;
  
    const inputGain = this.audioContext.createGain();
    const outputGain = this.audioContext.createGain();
    const splitter = this.audioContext.createChannelSplitter(2);
    const merger = this.audioContext.createChannelMerger(2);
  
    // Create doppler effect with delay and modulation
    const delayL = this.audioContext.createDelay(0.1);
    const delayR = this.audioContext.createDelay(0.1);
    
    // Create LFOs for rotary modulation
    const lfoL = this.audioContext.createOscillator();
    const lfoR = this.audioContext.createOscillator();
    const lfoGainL = this.audioContext.createGain();
    const lfoGainR = this.audioContext.createGain();
    
    lfoL.type = 'sine';
    lfoR.type = 'sine';
    lfoL.frequency.setValueAtTime(rate * 2, this.audioContext.currentTime);
    lfoR.frequency.setValueAtTime(rate * 2, this.audioContext.currentTime);
    
    // Phase offset for stereo effect
    const phaseOffset = Math.PI / 2;
    lfoGainL.gain.setValueAtTime(0.01, this.audioContext.currentTime);
    lfoGainR.gain.setValueAtTime(0.01, this.audioContext.currentTime);
  
    // Connect LFOs to delays
    lfoL.connect(lfoGainL);
    lfoR.connect(lfoGainR);
    lfoGainL.connect(delayL.delayTime);
    lfoGainR.connect(delayR.delayTime);
    
    lfoL.start();
    lfoR.start(this.audioContext.currentTime + phaseOffset);
  
    // Connect the chain
    inputGain.connect(splitter);
    splitter.connect(delayL, 0);
    splitter.connect(delayR, 1);
    delayL.connect(merger, 0, 0);
    delayR.connect(merger, 0, 1);
    merger.connect(outputGain);
  
    return {
      input: inputGain,
      output: outputGain,
      updateParameters: (newParams) => {
        const { rate: newRate } = newParams;
        lfoL.frequency.setValueAtTime(newRate * 2, this.audioContext.currentTime);
        lfoR.frequency.setValueAtTime(newRate * 2, this.audioContext.currentTime);
      }
    };
  }
  
  // Create Stereo Chorus effect chain
  createStereoChorus(parameters = {}) {
    const { rate = 0.5, depth = 0.5, mix = 0.8 } = parameters;
  
    const inputGain = this.audioContext.createGain();
    const outputGain = this.audioContext.createGain();
    const splitter = this.audioContext.createChannelSplitter(2);
    const merger = this.audioContext.createChannelMerger(2);
    const wetGain = this.audioContext.createGain();
    const dryGain = this.audioContext.createGain();
  
    // Create separate delays for left and right channels
    const delayL = this.audioContext.createDelay(0.1);
    const delayR = this.audioContext.createDelay(0.1);
    
    // Create LFOs with phase offset for stereo width
    const lfoL = this.audioContext.createOscillator();
    const lfoR = this.audioContext.createOscillator();
    const lfoGainL = this.audioContext.createGain();
    const lfoGainR = this.audioContext.createGain();
    
    lfoL.type = 'sine';
    lfoR.type = 'sine';
    lfoL.frequency.setValueAtTime(rate, this.audioContext.currentTime);
    lfoR.frequency.setValueAtTime(rate * 1.1, this.audioContext.currentTime); // Slightly different rate
    
    lfoGainL.gain.setValueAtTime(depth * 0.005, this.audioContext.currentTime);
    lfoGainR.gain.setValueAtTime(depth * 0.005, this.audioContext.currentTime);
  
    // Connect LFOs to delays
    lfoL.connect(lfoGainL);
    lfoR.connect(lfoGainR);
    lfoGainL.connect(delayL.delayTime);
    lfoGainR.connect(delayR.delayTime);
    
    lfoL.start();
    lfoR.start(this.audioContext.currentTime + Math.PI / 4); // Phase offset
  
    // Set mix levels
    dryGain.gain.setValueAtTime(1 - mix, this.audioContext.currentTime);
    wetGain.gain.setValueAtTime(mix, this.audioContext.currentTime);
  
    // Connect the chain
    inputGain.connect(dryGain);
    inputGain.connect(splitter);
    splitter.connect(delayL, 0);
    splitter.connect(delayR, 1);
    delayL.connect(merger, 0, 0);
    delayR.connect(merger, 0, 1);
    merger.connect(wetGain);
    dryGain.connect(outputGain);
    wetGain.connect(outputGain);
  
    return {
      input: inputGain,
      output: outputGain,
      updateParameters: (newParams) => {
        const { rate: newRate, depth: newDepth, mix: newMix } = newParams;
        lfoL.frequency.setValueAtTime(newRate, this.audioContext.currentTime);
        lfoR.frequency.setValueAtTime(newRate * 1.1, this.audioContext.currentTime);
        lfoGainL.gain.setValueAtTime(newDepth * 0.005, this.audioContext.currentTime);
        lfoGainR.gain.setValueAtTime(newDepth * 0.005, this.audioContext.currentTime);
        dryGain.gain.setValueAtTime(1 - newMix, this.audioContext.currentTime);
        wetGain.gain.setValueAtTime(newMix, this.audioContext.currentTime);
      }
    };
  }
  
  // Create Tape Wobble effect chain
  createTapeWobble(parameters = {}) {
    const { flutterRate = 0.3, flutterDepth = 0.4, wowRate = 0.1, wowDepth = 0.3 } = parameters;
  
    const inputGain = this.audioContext.createGain();
    const outputGain = this.audioContext.createGain();
    const delayNode = this.audioContext.createDelay(0.1);
    
    // Create flutter LFO (high frequency modulation)
    const flutterLfo = this.audioContext.createOscillator();
    const flutterGain = this.audioContext.createGain();
    flutterLfo.type = 'sine';
    flutterLfo.frequency.setValueAtTime(flutterRate * 10, this.audioContext.currentTime);
    flutterGain.gain.setValueAtTime(flutterDepth * 0.002, this.audioContext.currentTime);
    
    // Create wow LFO (low frequency modulation)
    const wowLfo = this.audioContext.createOscillator();
    const wowGain = this.audioContext.createGain();
    wowLfo.type = 'sine';
    wowLfo.frequency.setValueAtTime(wowRate, this.audioContext.currentTime);
    wowGain.gain.setValueAtTime(wowDepth * 0.01, this.audioContext.currentTime);
    
    // Combine flutter and wow
    const combiner = this.audioContext.createGain();
    combiner.gain.setValueAtTime(0.02, this.audioContext.currentTime); // Base delay time
    
    flutterLfo.connect(flutterGain);
    wowLfo.connect(wowGain);
    flutterGain.connect(combiner);
    wowGain.connect(combiner);
    combiner.connect(delayNode.delayTime);
    
    flutterLfo.start();
    wowLfo.start();

    // Add some filtering for tape character
    const tapeFilter = this.audioContext.createBiquadFilter();
    tapeFilter.type = 'lowpass';
    tapeFilter.frequency.setValueAtTime(8000, this.audioContext.currentTime);
    tapeFilter.Q.setValueAtTime(0.7, this.audioContext.currentTime);

    // Connect the chain
    inputGain.connect(delayNode);
    delayNode.connect(tapeFilter);
    tapeFilter.connect(outputGain);

    return {
      input: inputGain,
      output: outputGain,
      updateParameters: (newParams) => {
        const { flutterRate: newFlutterRate, flutterDepth: newFlutterDepth, wowRate: newWowRate, wowDepth: newWowDepth } = newParams;
        flutterLfo.frequency.setValueAtTime(newFlutterRate * 10, this.audioContext.currentTime);
        flutterGain.gain.setValueAtTime(newFlutterDepth * 0.002, this.audioContext.currentTime);
        wowLfo.frequency.setValueAtTime(newWowRate, this.audioContext.currentTime);
        wowGain.gain.setValueAtTime(newWowDepth * 0.01, this.audioContext.currentTime);
      }
    };
  }

  // Create overdrive curve (softer than distortion)
  createOverdriveCurve(drive) {
    const samples = 44100;
    const curve = new Float32Array(samples);
    const driveValue = Math.max(1, drive * 10);

    for (let i = 0; i < samples; i++) {
      const x = (i * 2) / samples - 1;
      curve[i] = Math.tanh(x * driveValue) * 0.8;
    }

    return curve;
  }

  // Update the applyEffect method to include all new effects
  applyEffect(audioSource, effectType, parameters, effectInstanceId) {
    let effectChain;

    switch (effectType) {
      case "Classic Dist":
        effectChain = this.createClassicDistortion(parameters);
        break;
      case "Chorus":
        effectChain = this.createChorus(parameters);
        break;
      case "Flanger":
        effectChain = this.createFlanger(parameters);
        break;
      case "Phaser":
        effectChain = this.createPhaser(parameters);
        break;
      case "Auto Pan":
        effectChain = this.createAutoPan(parameters);
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
      case "Overdrive":
        effectChain = this.createOverdrive(parameters);
        break;
      case "Auto-Wah":
        effectChain = this.createAutoWah(parameters);
        break;
      case "Rotary":
        effectChain = this.createRotary(parameters);
        break;
      case "Stereo Chorus":
        effectChain = this.createStereoChorus(parameters);
        break;
      case "Tape Wobble":
        effectChain = this.createTapeWobble(parameters);
        break;
      default:
        return audioSource; // No effect applied
    }

    // Store the effect chain
    this.effectsChain.set(effectInstanceId, effectChain);

    // Connect audio source through the effect chain
    audioSource.disconnect();
    audioSource.connect(effectChain.input);
    
    // Connect effect output to master gain boost instead of returning directly
    effectChain.output.disconnect();
    effectChain.output.connect(this.masterGain);

    return this.masterGain;
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
      // Make sure master gain is disconnected from this effect
      try {
        effectChain.output.disconnect(this.masterGain);
      } catch (e) {
        // Already disconnected, ignore
      }
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
