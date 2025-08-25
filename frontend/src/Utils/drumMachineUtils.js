// Shared drum machine types and sound generation utilities
// Used by both Drum.jsx and Pattern.jsx components

export const drumMachineTypes = [
  {
    name: "Classic 808",
    icon: "🥁",
    color: '#7c3aed',
    description: "Classic analog drum machine sounds",
    effects: {
      bassBoost: 1.2,
      compression: 0.8,
      saturation: 0.3
    },
    pads: [
      { id: 'Q', sound: 'kick', freq: 50, decay: 0.7, type: 'kick' },
      { id: 'W', sound: 'snare', freq: 200, decay: 0.3, type: 'snare' },
      { id: 'E', sound: 'hihat', freq: 8000, decay: 0.05, type: 'hihat' },
      { id: 'R', sound: 'openhat', freq: 8000, decay: 0.3, type: 'openhat' },
      { id: 'A', sound: 'clap', freq: 1000, decay: 0.2, type: 'clap' },
      { id: 'S', sound: 'cowbell', freq: 600, decay: 0.5, type: 'cowbell' },
      { id: 'D', sound: 'bass', freq: 40, decay: 1.0, type: 'bass' },
      { id: 'F', sound: 'perc1', freq: 1000, decay: 0.2, type: 'perc1' },
      { id: 'Z', sound: 'tom', freq: 150, decay: 0.5, type: 'tom' },
      { id: 'X', sound: 'ride', freq: 3000, decay: 0.7, type: 'ride' },
      { id: 'C', sound: 'crash', freq: 5000, decay: 1.5, type: 'crash' }
    ]
  },
  {
    name: "Vintage 909",
    icon: "🎛️",
    color: '#dc2626',
    description: "House and techno drum machine",
    effects: {
      bassBoost: 1.0,
      compression: 0.6,
      saturation: 0.2
    },
    pads: [
      { id: 'Q', sound: 'kick', freq: 60, decay: 0.5, type: 'kick' },
      { id: 'W', sound: 'snare', freq: 250, decay: 0.2, type: 'snare' },
      { id: 'E', sound: 'hihat', freq: 10000, decay: 0.03, type: 'hihat' },
      { id: 'R', sound: 'openhat', freq: 10000, decay: 0.3, type: 'openhat' },
      { id: 'A', sound: 'clap', freq: 1200, decay: 0.1, type: 'clap' },
      { id: 'S', sound: 'rimshot', freq: 3000, decay: 0.05, type: 'rimshot' },
      { id: 'D', sound: 'perc2', freq: 1500, decay: 0.1, type: 'perc2' },
      { id: 'F', sound: 'tom', freq: 180, decay: 0.3, type: 'tom' },
      { id: 'Z', sound: 'crash', freq: 6000, decay: 2.0, type: 'crash' },
      { id: 'X', sound: 'ride', freq: 4000, decay: 1.2, type: 'ride' },
      { id: 'C', sound: 'fx1', freq: 2000, decay: 0.6, type: 'fx1' }
    ]
  },
  {
    name: "Modern Trap",
    icon: "💎",
    color: '#059669',
    description: "Contemporary trap and hip-hop sounds",
    effects: {
      bassBoost: 1.5,
      compression: 1.2,
      saturation: 0.5
    },
    pads: [
      { id: 'Q', sound: 'kick', freq: 45, decay: 0.8, type: 'kick' },
      { id: 'W', sound: 'snare', freq: 180, decay: 0.3, type: 'snare' },
      { id: 'E', sound: 'hihat', freq: 12000, decay: 0.02, type: 'hihat' },
      { id: 'R', sound: 'openhat', freq: 11000, decay: 0.15, type: 'openhat' },
      { id: 'A', sound: 'clap', freq: 800, decay: 0.25, type: 'clap' },
      { id: 'S', sound: 'snap', freq: 700, decay: 0.2, type: 'snap' },
      { id: 'D', sound: 'bass', freq: 35, decay: 1.2, type: 'bass' },
      { id: 'F', sound: 'vocal', freq: 440, decay: 0.4, type: 'vocal' },
      { id: 'Z', sound: 'tom', freq: 140, decay: 0.3, type: 'tom' },
      { id: 'X', sound: 'fx1', freq: 2000, decay: 1.0, type: 'fx1' },
      { id: 'C', sound: 'fx2', freq: 1000, decay: 1.5, type: 'fx2' }
    ]
  },
  {
    name: "Acoustic Kit",
    icon: "🪘",
    color: '#d97706',
    description: "Natural acoustic drum sounds",
    effects: {
      bassBoost: 0.9,
      compression: 0.4,
      saturation: 0.1
    },
    pads: [
      { id: 'Q', sound: 'kick', freq: 65, decay: 0.7, type: 'kick' },
      { id: 'W', sound: 'snare', freq: 220, decay: 0.2, type: 'snare' },
      { id: 'E', sound: 'hihat', freq: 9000, decay: 0.04, type: 'hihat' },
      { id: 'R', sound: 'openhat', freq: 8500, decay: 0.35, type: 'openhat' },
      { id: 'A', sound: 'clap', freq: 1000, decay: 0.2, type: 'clap' },
      { id: 'S', sound: 'woodblock', freq: 1500, decay: 0.1, type: 'woodblock' },
      { id: 'D', sound: 'conga', freq: 700, decay: 0.3, type: 'conga' },
      { id: 'F', sound: 'bongo', freq: 1200, decay: 0.2, type: 'bongo' },
      { id: 'Z', sound: 'tom', freq: 160, decay: 0.45, type: 'tom' },
      { id: 'X', sound: 'ride', freq: 4200, decay: 1.2, type: 'ride' },
      { id: 'C', sound: 'shaker', freq: 8000, decay: 0.1, type: 'shaker' }
    ]
  },
  {
    name: "Electro Pop",
    icon: "⚡",
    color: '#c2410c',
    description: "Electronic pop and synth sounds",
    effects: {
      bassBoost: 1.1,
      compression: 0.9,
      saturation: 0.6
    },
    pads: [
      { id: 'Q', sound: 'kick', freq: 50, decay: 0.5, type: 'kick' },
      { id: 'W', sound: 'snare', freq: 250, decay: 0.15, type: 'snare' },
      { id: 'E', sound: 'hihat', freq: 14000, decay: 0.02, type: 'hihat' },
      { id: 'R', sound: 'openhat', freq: 13000, decay: 0.25, type: 'openhat' },
      { id: 'A', sound: 'clap', freq: 900, decay: 0.15, type: 'clap' },
      { id: 'S', sound: 'vocal', freq: 500, decay: 0.3, type: 'vocal' },
      { id: 'D', sound: 'perc2', freq: 1800, decay: 0.1, type: 'perc2' },
      { id: 'F', sound: 'laser', freq: 2200, decay: 0.2, type: 'laser' },
      { id: 'Z', sound: 'crash', freq: 6000, decay: 1.6, type: 'crash' },
      { id: 'X', sound: 'fx1', freq: 2500, decay: 1.0, type: 'fx1' },
      { id: 'C', sound: 'rise', freq: 5000, decay: 2.0, type: 'rise' }
    ]
  },
  {
    name: "Lo-Fi Vinyl",
    icon: "📀",
    color: '#7c2d12',
    description: "Vintage vinyl-sampled drums",
    effects: {
      bassBoost: 0.8,
      compression: 0.5,
      saturation: 0.4
    },
    pads: [
      { id: 'Q', sound: 'kick', freq: 55, decay: 0.6, type: 'kick' },
      { id: 'W', sound: 'snare', freq: 190, decay: 0.25, type: 'snare' },
      { id: 'E', sound: 'hihat', freq: 6000, decay: 0.05, type: 'hihat' },
      { id: 'R', sound: 'openhat', freq: 5500, decay: 0.4, type: 'openhat' },
      { id: 'A', sound: 'clap', freq: 700, decay: 0.2, type: 'clap' },
      { id: 'S', sound: 'vinyl', freq: 2000, decay: 0.6, type: 'vinyl' },
      { id: 'D', sound: 'glitch', freq: 1800, decay: 0.3, type: 'glitch' },
      { id: 'F', sound: 'fx2', freq: 1000, decay: 1.5, type: 'fx2' },
      { id: 'Z', sound: 'tom', freq: 130, decay: 0.5, type: 'tom' },
      { id: 'X', sound: 'shaker', freq: 5000, decay: 0.1, type: 'shaker' },
      { id: 'C', sound: 'drop', freq: 800, decay: 2.0, type: 'drop' }
    ]
  }
];

// Sound descriptions for UI display
export const soundDescriptions = {
  kick: "Kick Drum (Low-end punch)",
  snare: "Snare Drum (Sharp attack)",
  hihat: "Closed Hi-Hat (Short & tight)",
  openhat: "Open Hi-Hat (Sizzly)",
  clap: "Clap (Snappy)",
  rimshot: "Rimshot (Sharp side-stick)",
  perc1: "Percussion Hit (General)",
  perc2: "Metallic Perc (Ping)",
  bass: "808 Bass (Low rumble)",
  tom: "Tom Drum (Mid-punch)",
  crash: "Crash Cymbal (Washy)",
  ride: "Ride Cymbal (Sustained)",
  cowbell: "Cowbell (Metal click)",
  shaker: "Shaker (Rhythmic noise)",
  woodblock: "Wood Block (Thock)",
  conga: "Conga (Hand drum)",
  bongo: "Bongo (High-pitched hand drum)",
  vocal: "Vocal FX (Chops or shout)",
  fx1: "Effect Hit (Sweep / Boom)",
  fx2: "Reverse FX (Whoosh / Delay tail)",
  snap: "Finger Snap",
  laser: "Laser Shot FX",
  glitch: "Glitch FX",
  vinyl: "Vinyl Scratch",
  rise: "Riser FX",
  drop: "Drop Impact"
};

// Synthetic sound generators (same as Drum.jsx)
export const createSynthSound = (pad, audioContext) => {
  const currentTime = audioContext.currentTime;
  const { freq, decay, type } = pad;

  switch (type) {
    case 'kick': {
      const oscillator = audioContext.createOscillator();
      const gain = audioContext.createGain();
      const filter = audioContext.createBiquadFilter();

      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(freq, currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(freq * 0.1, currentTime + 0.1);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(100, currentTime);

      gain.gain.setValueAtTime(1, currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, currentTime + decay);

      oscillator.connect(filter);
      filter.connect(gain);

      oscillator.start(currentTime);
      oscillator.stop(currentTime + decay + 0.1);

      return gain;
    }

    case 'snare': {
      const noiseBuffer = audioContext.createBuffer(1, audioContext.sampleRate * 0.1, audioContext.sampleRate);
      const data = noiseBuffer.getChannelData(0);
      for (let i = 0; i < data.length; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = audioContext.createBufferSource();
      const oscillator = audioContext.createOscillator();
      const gain = audioContext.createGain();
      const filter = audioContext.createBiquadFilter();
      const merger = audioContext.createChannelMerger(2);

      noise.buffer = noiseBuffer;
      oscillator.type = 'triangle';
      oscillator.frequency.setValueAtTime(freq, currentTime);

      filter.type = 'highpass';
      filter.frequency.setValueAtTime(1000, currentTime);

      gain.gain.setValueAtTime(0.8, currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, currentTime + decay);

      noise.connect(filter);
      oscillator.connect(merger, 0, 0);
      filter.connect(merger, 0, 1);
      merger.connect(gain);

      noise.start(currentTime);
      oscillator.start(currentTime);
      noise.stop(currentTime + decay);
      oscillator.stop(currentTime + decay);

      return gain;
    }

    case 'hihat': {
      const noiseBuffer = audioContext.createBuffer(1, audioContext.sampleRate * 0.1, audioContext.sampleRate);
      const data = noiseBuffer.getChannelData(0);
      for (let i = 0; i < data.length; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = audioContext.createBufferSource();
      const gain = audioContext.createGain();
      const filter = audioContext.createBiquadFilter();

      noise.buffer = noiseBuffer;

      filter.type = 'highpass';
      filter.frequency.setValueAtTime(freq, currentTime);
      filter.Q.setValueAtTime(30, currentTime);

      gain.gain.setValueAtTime(0.3, currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, currentTime + decay);

      noise.connect(filter);
      filter.connect(gain);

      noise.start(currentTime);
      noise.stop(currentTime + decay + 0.1);

      return gain;
    }

    case 'clap': {
      const gain = audioContext.createGain();
      gain.gain.setValueAtTime(0, currentTime);

      const clapTimes = [0, 0.01, 0.02, 0.03];
      clapTimes.forEach((time, index) => {
        const noiseBuffer = audioContext.createBuffer(1, audioContext.sampleRate * 0.05, audioContext.sampleRate);
        const data = noiseBuffer.getChannelData(0);
        for (let i = 0; i < data.length; i++) {
          data[i] = Math.random() * 2 - 1;
        }

        const noise = audioContext.createBufferSource();
        const clapGain = audioContext.createGain();
        const filter = audioContext.createBiquadFilter();

        noise.buffer = noiseBuffer;

        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(freq, currentTime);
        filter.Q.setValueAtTime(5, currentTime);

        clapGain.gain.setValueAtTime(0.2, currentTime + time);
        clapGain.gain.exponentialRampToValueAtTime(0.001, currentTime + time + 0.05);

        noise.connect(filter);
        filter.connect(clapGain);
        clapGain.connect(gain);

        noise.start(currentTime + time);
        noise.stop(currentTime + time + 0.05);
      });

      return gain;
    }

    case 'tom': {
      const oscillator = audioContext.createOscillator();
      const gain = audioContext.createGain();

      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(freq, currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(freq * 0.5, currentTime + decay);

      gain.gain.setValueAtTime(0.8, currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, currentTime + decay);

      oscillator.connect(gain);

      oscillator.start(currentTime);
      oscillator.stop(currentTime + decay + 0.1);

      return gain;
    }

    case 'crash':
    case 'ride': {
      const noiseBuffer = audioContext.createBuffer(1, audioContext.sampleRate * 0.1, audioContext.sampleRate);
      const data = noiseBuffer.getChannelData(0);
      for (let i = 0; i < data.length; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = audioContext.createBufferSource();
      const gain = audioContext.createGain();
      const filter1 = audioContext.createBiquadFilter();
      const filter2 = audioContext.createBiquadFilter();

      noise.buffer = noiseBuffer;

      filter1.type = 'bandpass';
      filter1.frequency.setValueAtTime(freq, currentTime);
      filter1.Q.setValueAtTime(2, currentTime);

      filter2.type = 'bandpass';
      filter2.frequency.setValueAtTime(freq * 1.5, currentTime);
      filter2.Q.setValueAtTime(3, currentTime);

      gain.gain.setValueAtTime(type === 'crash' ? 0.4 : 0.2, currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, currentTime + decay);

      noise.connect(filter1);
      filter1.connect(filter2);
      filter2.connect(gain);

      noise.start(currentTime);
      noise.stop(currentTime + decay + 0.1);

      return gain;
    }

    case 'cowbell': {
      const oscillator1 = audioContext.createOscillator();
      const oscillator2 = audioContext.createOscillator();
      const gain = audioContext.createGain();
      const merger = audioContext.createChannelMerger(2);

      oscillator1.type = 'square';
      oscillator1.frequency.setValueAtTime(freq, currentTime);

      oscillator2.type = 'square';
      oscillator2.frequency.setValueAtTime(freq * 1.5, currentTime);

      gain.gain.setValueAtTime(0.3, currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, currentTime + decay);

      oscillator1.connect(merger, 0, 0);
      oscillator2.connect(merger, 0, 1);
      merger.connect(gain);

      oscillator1.start(currentTime);
      oscillator2.start(currentTime);
      oscillator1.stop(currentTime + decay);
      oscillator2.stop(currentTime + decay);

      return gain;
    }

    default: {
      const oscillator = audioContext.createOscillator();
      const gain = audioContext.createGain();
      const filter = audioContext.createBiquadFilter();

      oscillator.type = 'sawtooth';
      oscillator.frequency.setValueAtTime(freq, currentTime);

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(freq, currentTime);
      filter.Q.setValueAtTime(10, currentTime);

      gain.gain.setValueAtTime(0.3, currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, currentTime + decay);

      oscillator.connect(filter);
      filter.connect(gain);

      oscillator.start(currentTime);
      oscillator.stop(currentTime + decay + 0.1);

      return gain;
    }
  }
};

// Helper function to create drum data in the same format as Drum.jsx
export const createDrumData = (pad, drumMachine, currentTime = 0, trackId = null) => {
  return {
    timestamp: Date.now(),
    currentTime: currentTime,
    padId: pad.id,
    sound: pad.sound,
    freq: pad.freq,
    decay: pad.decay,
    type: pad.type,
    drumMachine: drumMachine.name,
    effects: drumMachine.effects,
    trackId: trackId,
  };
};

// Helper function to get audio context
export const getAudioContext = (audioContextRef) => {
  if (!audioContextRef.current) {
    audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
  }
  return audioContextRef.current;
}; 