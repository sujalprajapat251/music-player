import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setDrumRecordedData, setDrumPlayback, setDrumPlaybackStartTime, addAudioClipToTrack, addTrack } from '../Redux/Slice/studio.slice';


const drumMachineTypes = [
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

const DrumPadMachine = () => {
  const [currentType, setCurrentType] = useState(0);
  const [activePads, setActivePads] = useState(new Set());
  const [displayDescription, setDisplayDescription] = useState('Press a key or click a pad!');
  const [volume, setVolume] = useState(0.7);
  const [pan, setPan] = useState(0);
  const [reverb, setReverb] = useState(0.2);
  // const [isRecording, setIsRecording] = useState(false);
  const [sequence, setSequence] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedPad, setSelectedPad] = useState(null);
  const [padEffects, setPadEffects] = useState({});
  const audioContextRef = useRef(null);
  const reverbBufferRef = useRef(null);
  const dispatch = useDispatch();
  const isRecording = useSelector((state) => state.studio?.isRecording || false);
  const drumRecordedData = useSelector((state) => state.studio?.drumRecordedData || []);
  const currentTime = useSelector((state) => state.studio?.currentTime || 0);
  const isPlayingDrumRecording = useSelector((state) => state.studio?.isPlayingDrumRecording || false);
  const drumPlaybackStartTime = useSelector((state) => state.studio?.drumPlaybackStartTime || null);
  const tracks = useSelector((state) => state.studio?.tracks || []);
  const currentTrackId = useSelector((state) => state.studio?.currentTrackId || null);

  // Get the currently selected drum machine
  const selectedDrumMachine = drumMachineTypes[currentType];

  // Clear drum recorded data when recording starts
  useEffect(() => {
    if (isRecording) {
      // Clear any existing drum recorded data when starting a new recording
      if (drumRecordedData.length > 0) {
        dispatch(setDrumRecordedData([]));
      }
    }
  }, [isRecording, dispatch]);

  // Remove the automatic drum track creation - we'll use the selected track instead

  // Drum playback functionality
  useEffect(() => {
    if (isPlayingDrumRecording && drumPlaybackStartTime && drumRecordedData.length > 0) {
      const playbackInterval = setInterval(() => {
        const currentPlaybackTime = Date.now() - drumPlaybackStartTime;

        // Find drum hits that should be played at this time
        drumRecordedData.forEach((drumHit) => {
          const timeDiff = Math.abs(currentPlaybackTime - drumHit.timestamp);

          // Play the drum hit if it's within 50ms of the current playback time
          if (timeDiff < 50) {
            // Find the pad that was hit
            const pad = selectedDrumMachine.pads.find(p => p.id === drumHit.padId);
            if (pad) {
              playSound(pad);
              // console.log(`Playing back: ${drumHit.padId} - ${drumHit.sound} at ${currentPlaybackTime}ms`);
            }
          }
        });

        // Stop playback if we've reached the end
        const maxTimestamp = Math.max(...drumRecordedData.map(d => d.timestamp));
        if (currentPlaybackTime > maxTimestamp + 1000) { // Add 1 second buffer
          dispatch(setDrumPlayback(false));
          dispatch(setDrumPlaybackStartTime(null));
        }
      }, 10); // Check every 10ms for smooth playback

      return () => clearInterval(playbackInterval);
    }
  }, [isPlayingDrumRecording, drumPlaybackStartTime, drumRecordedData, selectedDrumMachine, dispatch]);

  // Handle drum playback button click
  const handleDrumPlayback = () => {
    if (drumRecordedData.length > 0) {
      if (isPlayingDrumRecording) {
        // Stop drum playback
        dispatch(setDrumPlayback(false));
        dispatch(setDrumPlaybackStartTime(null));
      } else {
        // Start drum playback
        dispatch(setDrumPlayback(true));
        dispatch(setDrumPlaybackStartTime(Date.now()));
      }
    }
  };

  // Create continuous drum recording when recording stops
  useEffect(() => {
    if (!isRecording && drumRecordedData.length > 0 && currentTrackId) {
      // Create a single continuous audio blob from all recorded drum data
      createContinuousDrumAudioBlob(drumRecordedData).then((audioBlob) => {
        if (audioBlob) {
          // Calculate the total duration based on the last drum hit
          const lastDrumHit = drumRecordedData[drumRecordedData.length - 1];
          const firstDrumHit = drumRecordedData[0];
          const totalDuration = (lastDrumHit.timestamp - firstDrumHit.timestamp) / 1000 + lastDrumHit.decay * 2;

          // Create a single timeline clip for all drum recordings
          const drumClip = {
            id: `drum_recording_${Date.now()}`,
            name: `Drum Recording (${drumRecordedData.length} hits)`,
            type: 'drum',
            startTime: firstDrumHit.currentTime,
            duration: totalDuration,
            color: selectedDrumMachine.color,
            drumData: drumRecordedData, // Store all drum data
            url: URL.createObjectURL(audioBlob), // Create URL from blob
            trimStart: 0,
            trimEnd: totalDuration,
            soundData: {
              padId: 'MULTI',
              sound: 'drum_recording',
              freq: 0,
              decay: totalDuration,
              type: 'drum_recording',
              drumMachine: selectedDrumMachine.name,
              effects: selectedDrumMachine.effects,
              totalHits: drumRecordedData.length
            }
          };

          // Add to the currently selected track
          dispatch(addAudioClipToTrack({
            trackId: currentTrackId,
            audioClip: drumClip
          }));

          // console.log('Created continuous drum recording in track:', currentTrackId, drumClip);
        }
      }).catch((error) => {
        // console.error('Error creating continuous drum audio blob:', error);
      });
    }
  }, [isRecording, drumRecordedData, currentTrackId, selectedDrumMachine]);

  // Function to create continuous audio blob from all drum recordings
  const createContinuousDrumAudioBlob = async (allDrumData) => {
    try {
      const audioContext = getAudioContext();
      const sampleRate = audioContext.sampleRate;

      // Calculate total duration
      const firstHit = allDrumData[0];
      const lastHit = allDrumData[allDrumData.length - 1];
      const totalDuration = (lastHit.timestamp - firstHit.timestamp) / 1000 + lastHit.decay * 2;
      const bufferLength = Math.floor(sampleRate * totalDuration);

      // Create audio buffer
      const audioBuffer = audioContext.createBuffer(1, bufferLength, sampleRate);
      const channelData = audioBuffer.getChannelData(0);

      // Process each drum hit
      allDrumData.forEach((drumHit) => {
        const startTime = (drumHit.timestamp - firstHit.timestamp) / 1000;
        const startSample = Math.floor(startTime * sampleRate);
        const duration = drumHit.decay * 2;
        const numSamples = Math.floor(duration * sampleRate);

        // Generate drum sound for this hit
        for (let i = 0; i < numSamples && startSample + i < bufferLength; i++) {
          const t = i / sampleRate;
          const decay = Math.exp(-t / drumHit.decay);
          let sample = 0;

          // Generate sound based on drum type
          switch (drumHit.type) {
            case 'kick':
              const frequency = drumHit.freq * Math.exp(-t * 10);
              sample = Math.sin(2 * Math.PI * frequency * t) * decay * 0.3;
              break;
            case 'snare':
              sample = (Math.random() * 2 - 1) * decay * 0.2;
              break;
            case 'hihat':
              const noise = (Math.random() * 2 - 1) * 0.1;
              sample = noise * decay;
              break;
            default:
              sample = Math.sin(2 * Math.PI * drumHit.freq * t) * decay * 0.2;
          }

          // Add to the channel data at the correct position
          if (startSample + i < bufferLength) {
            channelData[startSample + i] += sample;
          }
        }
      });

      // Convert to WAV format
      const wavBuffer = await audioBufferToWav(audioBuffer);
      const blob = new Blob([wavBuffer], { type: 'audio/wav' });

      return blob;
    } catch (error) {
      // console.error('Error creating continuous drum audio:', error);
      return null;
    }
  };

  // Define different drum machine types with synthetic sound parameters


  // const soundDescriptions = {
  //   kick: 'Kick Drum',
  //   snare: 'Snare Drum', 
  //   hihat: 'Hi-Hat Closed',
  //   openhat: 'Hi-Hat Open',
  //   clap: 'Hand Clap',
  //   perc1: 'Percussion',
  //   bass: 'Bass Drum',
  //   tom: 'Tom Drum',
  //   crash: 'Crash Cymbal',
  //   ride: 'Ride Cymbal',
  //   cowbell: 'Cowbell',
  //   shaker: 'Shaker',
  //   woodblock: 'Wood Block',
  //   vocal: 'Vocal Sample',
  //   fx1: 'Sound FX 1',
  //   fx2: 'Sound FX 2'
  // };

  // Initialize Web Audio API


  const soundDescriptions = {
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



  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    return audioContextRef.current;
  }, []);

  // Create reverb impulse response
  const createReverbBuffer = useCallback(() => {
    if (reverbBufferRef.current) return reverbBufferRef.current;

    const audioContext = getAudioContext();
    const length = audioContext.sampleRate * 2;
    const buffer = audioContext.createBuffer(2, length, audioContext.sampleRate);

    for (let channel = 0; channel < 2; channel++) {
      const channelData = buffer.getChannelData(channel);
      for (let i = 0; i < length; i++) {
        const decay = Math.pow(1 - i / length, 2);
        channelData[i] = (Math.random() * 2 - 1) * decay;
      }
    }

    reverbBufferRef.current = buffer;
    return buffer;
  }, [getAudioContext]);

  // Synthetic sound generators
  const createSynthSound = useCallback((pad, audioContext) => {
    const currentTime = audioContext.currentTime;
    const { freq, decay, type } = pad;

    switch (type) {
      case 'kick': {
        // Kick drum - low frequency oscillator with pitch envelope
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
        // Snare drum - noise + tone
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
        // Hi-hat - filtered white noise
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
        // Hand clap - multiple quick noise bursts
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
        // Tom drum - pitched oscillator with envelope
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
        // Cymbal - complex noise with metallic resonance
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
        // Cowbell - metallic tone
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
        // Generic percussion
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
  }, []);

  // Apply drum machine type effects to audio
  const applyTypeEffects = useCallback((audioNode, typeEffects) => {
    const audioContext = getAudioContext();

    // Create EQ for bass boost
    const lowShelf = audioContext.createBiquadFilter();
    lowShelf.type = 'lowshelf';
    lowShelf.frequency.setValueAtTime(200, audioContext.currentTime);
    lowShelf.gain.setValueAtTime((typeEffects.bassBoost - 1) * 10, audioContext.currentTime);

    // Create compressor
    const compressor = audioContext.createDynamicsCompressor();
    compressor.threshold.setValueAtTime(-24, audioContext.currentTime);
    compressor.knee.setValueAtTime(30, audioContext.currentTime);
    compressor.ratio.setValueAtTime(12, audioContext.currentTime);
    compressor.attack.setValueAtTime(0.003, audioContext.currentTime);
    compressor.release.setValueAtTime(0.25, audioContext.currentTime);

    // Create waveshaper for saturation
    const waveshaper = audioContext.createWaveShaper();
    const samples = 44100;
    const curve = new Float32Array(samples);
    const deg = Math.PI / 180;
    for (let i = 0; i < samples; i++) {
      const x = (i * 2) / samples - 1;
      curve[i] = (3 + typeEffects.saturation) * x * 20 * deg / (Math.PI + typeEffects.saturation * Math.abs(x));
    }
    waveshaper.curve = curve;
    waveshaper.oversample = '4x';

    // Connect effects chain
    audioNode.connect(lowShelf);
    lowShelf.connect(compressor);
    compressor.connect(waveshaper);

    return waveshaper;
  }, [getAudioContext]);

  // Play sound with effects
  const playSound = useCallback((pad) => {
    try {
      const audioContext = getAudioContext();

      if (audioContext.state === 'suspended') {
        audioContext.resume();
      }

      const padEffect = padEffects[pad.id] || {};
      const effectiveVolume = padEffect.volume !== undefined ? padEffect.volume : volume;
      const effectivePan = padEffect.pan !== undefined ? padEffect.pan : pan;
      const effectiveReverb = padEffect.reverb !== undefined ? padEffect.reverb : reverb;
      const currentTypeEffects = drumMachineTypes[currentType].effects;

      // Create synthetic sound
      const synthSource = createSynthSound(pad, audioContext);

      // Create audio nodes
      const gainNode = audioContext.createGain();
      const panNode = audioContext.createStereoPanner();
      const dryGainNode = audioContext.createGain();
      const wetGainNode = audioContext.createGain();
      const convolver = audioContext.createConvolver();

      // Set up reverb
      convolver.buffer = createReverbBuffer();

      // Set up gain (volume)
      gainNode.gain.setValueAtTime(effectiveVolume, audioContext.currentTime);

      // Set up pan
      panNode.pan.setValueAtTime(effectivePan, audioContext.currentTime);

      // Set up reverb mix
      dryGainNode.gain.setValueAtTime(1 - effectiveReverb, audioContext.currentTime);
      wetGainNode.gain.setValueAtTime(effectiveReverb, audioContext.currentTime);

      // Apply drum machine type effects
      const effectsOutput = applyTypeEffects(synthSource, currentTypeEffects);

      // Connect nodes with type effects
      effectsOutput.connect(gainNode);
      gainNode.connect(panNode);

      // Dry path
      panNode.connect(dryGainNode);
      dryGainNode.connect(audioContext.destination);

      // Wet path (reverb)
      panNode.connect(convolver);
      convolver.connect(wetGainNode);
      wetGainNode.connect(audioContext.destination);

      // Visual feedback
      setActivePads(prev => new Set([...prev, pad.id]));
      setTimeout(() => {
        setActivePads(prev => {
          const newSet = new Set(prev);
          newSet.delete(pad.id);
          return newSet;
        });
      }, 200);

      const effectsText = padEffect.volume !== undefined || padEffect.pan !== undefined || padEffect.reverb !== undefined
        ? ' (Custom)' : '';
      const soundName = soundDescriptions[pad.sound] || 'Drum Sound';
      setDisplayDescription(`${soundName} - ${drumMachineTypes[currentType].name}${effectsText}`);

      if (isRecording) {
        setSequence(prev => [...prev, {
          key: pad.id,
          time: Date.now(),
          type: currentType,
          effects: { ...padEffect }
        }]);
      }
    } catch (error) {
      // console.error('Error playing sound:', error);
      setDisplayDescription('Audio not available');
    }
  }, [getAudioContext, volume, pan, reverb, soundDescriptions, drumMachineTypes, currentType, isRecording, padEffects, createReverbBuffer, applyTypeEffects, createSynthSound]);

  // Keyboard handling
  useEffect(() => {
    const handleKeyDown = (event) => {
      const keyMap = {
        81: 'Q', 49: '1', 51: '3', 71: 'G', 69: 'E', 56: '8',
        68: 'D', 65: 'A', 85: 'U', 88: 'X', 84: 'T', 55: '7',
        89: 'Y', 72: 'H', 74: 'J', 75: 'K', 57: '9'
      };

      if (keyMap[event.keyCode]) {
        event.preventDefault();
        const currentPads = drumMachineTypes[currentType].pads;
        const pad = currentPads.find(p => p.id === keyMap[event.keyCode]);
        if (pad) {
          playSound(pad);
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [currentType, drumMachineTypes, playSound]);


  const currentTypeData = drumMachineTypes[currentType];

  // Clean Pad Button Component
  const PadButton = ({ pad, index, isActive, onClick }) => {
    const soundName = soundDescriptions[pad.sound] || 'Drum Sound';
    const hasCustomEffects = padEffects[pad.id];

    return (
      <button
        className={`w-24 h-24 rounded-xl border-2 flex flex-col items-center justify-center font-bold transition-all duration-200 transform group relative ${isActive
          ? 'border-white bg-gradient-to-br from-white to-gray-200 text-gray-900 scale-105 shadow-2xl'
          : selectedPad === pad.id
            ? 'border-yellow-400 bg-gradient-to-br from-yellow-700/40 to-yellow-800/60 text-white hover:border-yellow-300 hover:scale-102 shadow-lg backdrop-blur-sm'
            : 'border-purple-300/60 bg-gradient-to-br from-gray-700/80 to-gray-800/90 text-white hover:border-purple-400 hover:bg-gradient-to-br hover:from-purple-700/40 hover:to-purple-800/60 hover:scale-102 shadow-lg backdrop-blur-sm'
          }`}
        style={{
          boxShadow: isActive
            ? `0 0 25px ${currentTypeData.color}, 0 0 50px ${currentTypeData.color}44, 0 8px 32px rgba(0,0,0,0.4)`
            : selectedPad === pad.id
              ? '0 0 15px #fbbf24, 0 4px 20px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)'
              : '0 4px 20px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)'
        }}
        onClick={onClick}
        onDoubleClick={() => setSelectedPad(selectedPad === pad.id ? null : pad.id)}
        onMouseDown={(e) => e.preventDefault()}
        title={`${soundName} (${pad.label}) - Synthetic Audio Ready ${selectedPad === pad.id ? '(Selected for editing)' : '(Double-click to edit effects)'}`}
      >
        <div className={`text-2xl font-black ${isActive ? 'text-gray-800' : selectedPad === pad.id ? 'text-yellow-200' : 'text-white group-hover:text-purple-200'}`}>
          {pad.label}
        </div>
        <div className={`text-xs font-medium mt-1 ${isActive ? 'text-gray-600' : selectedPad === pad.id ? 'text-yellow-300' : 'text-gray-300 group-hover:text-purple-300'} truncate max-w-20 text-center leading-tight`}>
          {soundName.split(' ')[0]}
        </div>

        {/* Synthetic audio indicator */}
        <div className="absolute -top-1 -right-1">
          <div className="w-3 h-3 bg-cyan-400 rounded-full" title="Synthetic Audio"></div>
        </div>

        {/* Custom effects indicator */}
        {hasCustomEffects && (
          <div className="absolute -top-1 -left-1">
            <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
          </div>
        )}

        {/* Pulse animation when active */}
        {isActive && (
          <div
            className="absolute inset-0 rounded-xl animate-ping opacity-75"
            style={{
              border: `2px solid ${currentTypeData.color}`,
              backgroundColor: `${currentTypeData.color}22`
            }}
          />
        )}
      </button>
    );
  };

  // When a pad is pressed, record it
  const handlePadPress = (pad) => {
    if (isRecording) {
      const drumData = {
        timestamp: Date.now(),
        currentTime: currentTime, // Use Redux currentTime
        padId: pad.id,
        sound: pad.sound,
        freq: pad.freq,
        decay: pad.decay,
        type: pad.type,
        drumMachine: selectedDrumMachine.name, // Current drum machine
        effects: selectedDrumMachine.effects
      };

      const updatedData = [...drumRecordedData, drumData];
      dispatch(setDrumRecordedData(updatedData));

      // Only create timeline clip if a track is selected
      if (currentTrackId) {
        // Store drum data for later processing when recording stops
        // We'll create the audio blob when recording stops
        // console.log('Drum data recorded:', drumData);
      } else {
        // console.log('No track selected. Drum data recorded but not added to timeline.');
      }
    }

    // Your existing pad play logic here
    playSound(pad);
  };

  // Function to create audio blob for drum hit
  const createDrumAudioBlob = async (pad) => {
    try {
      const audioContext = getAudioContext();
      const sampleRate = audioContext.sampleRate;
      const duration = pad.decay * 2; // Duration in seconds
      const bufferLength = Math.floor(sampleRate * duration);

      // Create audio buffer
      const audioBuffer = audioContext.createBuffer(1, bufferLength, sampleRate);
      const channelData = audioBuffer.getChannelData(0);

      // Generate drum sound based on type
      switch (pad.type) {
        case 'kick':
          // Kick drum: low frequency sine wave with decay
          for (let i = 0; i < bufferLength; i++) {
            const t = i / sampleRate;
            const decay = Math.exp(-t / pad.decay);
            const frequency = pad.freq * Math.exp(-t * 10);
            channelData[i] = Math.sin(2 * Math.PI * frequency * t) * decay * 0.3;
          }
          break;

        case 'snare':
          // Snare: noise with decay
          for (let i = 0; i < bufferLength; i++) {
            const t = i / sampleRate;
            const decay = Math.exp(-t / pad.decay);
            channelData[i] = (Math.random() * 2 - 1) * decay * 0.2;
          }
          break;

        case 'hihat':
          // Hi-hat: high frequency noise with short decay
          for (let i = 0; i < bufferLength; i++) {
            const t = i / sampleRate;
            const decay = Math.exp(-t / pad.decay);
            const noise = (Math.random() * 2 - 1) * 0.1;
            channelData[i] = noise * decay;
          }
          break;

        default:
          // Default: simple sine wave
          for (let i = 0; i < bufferLength; i++) {
            const t = i / sampleRate;
            const decay = Math.exp(-t / pad.decay);
            channelData[i] = Math.sin(2 * Math.PI * pad.freq * t) * decay * 0.2;
          }
      }

      // Convert to WAV format
      const wavBuffer = await audioBufferToWav(audioBuffer);
      const blob = new Blob([wavBuffer], { type: 'audio/wav' });

      return blob;
    } catch (error) {
      // console.error('Error creating drum audio:', error);
      return null;
    }
  };

  // Helper function to convert AudioBuffer to WAV
  const audioBufferToWav = async (buffer) => {
    const length = buffer.length;
    const numberOfChannels = buffer.numberOfChannels;
    const sampleRate = buffer.sampleRate;
    const arrayBuffer = new ArrayBuffer(44 + length * numberOfChannels * 2);
    const view = new DataView(arrayBuffer);

    // WAV header
    const writeString = (offset, string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };

    writeString(0, 'RIFF');
    view.setUint32(4, 36 + length * numberOfChannels * 2, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, numberOfChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * numberOfChannels * 2, true);
    view.setUint16(32, numberOfChannels * 2, true);
    view.setUint16(34, 16, true);
    writeString(36, 'data');
    view.setUint32(40, length * numberOfChannels * 2, true);

    // Write audio data
    let offset = 44;
    for (let i = 0; i < length; i++) {
      for (let channel = 0; channel < numberOfChannels; channel++) {
        const sample = Math.max(-1, Math.min(1, buffer.getChannelData(channel)[i]));
        view.setInt16(offset, sample * 0x7FFF, true);
        offset += 2;
      }
    }

    return arrayBuffer;
  };

  return (
    <div className="w-full bg-gray-900 text-white">
      {/* Top Navigation */}
      <div className="flex justify-center items-center py-4 border-b border-gray-700">
        <div className="flex space-x-8">
          <button className="text-purple-400 border-b-2 border-purple-400 pb-1">
            Instrument
          </button>
          <button className="text-gray-400 hover:text-white">Patterns</button>
          <button className="text-gray-400 hover:text-white">Piano Roll</button>
          <button className="text-purple-400 font-semibold">Effects</button>
        </div>
      </div>

      {/* Type Selector */}
      <div className="flex justify-center items-center px-8 py-4">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setCurrentType((prev) => (prev - 1 + drumMachineTypes.length) % drumMachineTypes.length)}
            className="text-gray-400 hover:text-white text-xl"
          >
            ←
          </button>
          <div className="text-center">
            <div className="text-2xl" style={{ color: currentTypeData.color }}>{currentTypeData.icon}</div>
            <div className="text-white font-medium">{currentTypeData.name}</div>
            <div className="text-xs text-gray-400 max-w-32 truncate">{currentTypeData.description}</div>
          </div>
          <button
            onClick={() => setCurrentType((prev) => (prev + 1) % drumMachineTypes.length)}
            className="text-gray-400 hover:text-white text-xl"
          >
            →
          </button>
        </div>
      </div>

      {/* Display */}
      <div className="text-center py-2">
        <div className="bg-black/50 rounded-lg p-3 backdrop-blur-sm inline-block min-w-96">
          <p className="text-xl font-mono text-green-400">{displayDescription}</p>
          {selectedPad && (
            <p className="text-sm text-yellow-400 mt-1">
              Editing pad {selectedPad} - Double-click another pad or same pad to change selection
            </p>
          )}
        </div>
      </div>

      {/* Playback Controls */}
      {drumRecordedData.length > 0 && (
        <div className="text-center py-2">
          <button
            onClick={handleDrumPlayback}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${isPlayingDrumRecording
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-green-600 hover:bg-green-700 text-white'
              }`}
          >
            {isPlayingDrumRecording ? '⏹️ Stop Playback' : '▶️ Play Recording'}
          </button>
          <p className="text-xs text-gray-400 mt-1">
            {drumRecordedData.length} drum hits recorded
          </p>
        </div>
      )}

      {/* Track Selection Notification */}
      {isRecording && (
        <div className="text-center py-2">
          {currentTrackId ? (
            <div className="bg-green-600 text-white px-4 py-2 rounded-lg">
              <p className="text-sm font-medium">Recording to: {tracks.find(t => t.id === currentTrackId)?.name || 'Unknown Track'}</p>
              <p className="text-xs opacity-80">Click drum pads to record to timeline</p>
            </div>
          ) : (
            <div className="bg-yellow-600 text-white px-4 py-2 rounded-lg">
              <p className="text-sm font-medium">⚠️ No track selected</p>
              <p className="text-xs opacity-80">Select a track in the timeline to record drum data</p>
            </div>
          )}
        </div>
      )}

      {/* Drum Pad Area */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div
          className="p-8 rounded-2xl"
          style={{
            background: `linear-gradient(135deg, ${currentTypeData.color}22 0%, ${currentTypeData.color}44 50%, ${currentTypeData.color}33 100%)`,
            backdropFilter: 'blur(10px)',
            border: `1px solid ${currentTypeData.color}44`
          }}
        >
          {/* 3x3 Grid Layout - First 9 pads */}
          <div className="grid grid-cols-3 gap-6 mb-8">
            {currentTypeData.pads.slice(0, 9).map((pad, index) => (
              <PadButton
                key={pad.id}
                pad={pad}
                index={index}
                isActive={activePads.has(pad.id)}
                onClick={() => handlePadPress(pad)}
              />
            ))}

            <div className="relative w-80 h-80 flex items-center justify-center group cursor-pointer">
              {/* Outermost ring - very thin */}
              <div className="absolute w-80 h-80 rounded-full border border-gray-600/30 transition-all duration-300 group-hover:border-gray-500/50 group-active:border-gray-400/70"></div>

              {/* Second ring */}
              <div className="absolute w-64 h-64 rounded-full border border-gray-600/35 transition-all duration-300 group-hover:border-gray-500/55 group-active:border-gray-400/75"></div>

              {/* Third ring */}
              <div className="absolute w-48 h-48 rounded-full border border-gray-600/40 transition-all duration-300 group-hover:border-gray-500/60 group-active:border-gray-400/80"></div>

              {/* Fourth ring */}
              <div className="absolute w-32 h-32 rounded-full border border-gray-600/45 transition-all duration-300 group-hover:border-gray-500/65 group-active:border-gray-400/85"></div>

              {/* Inner ring */}
              <div className="absolute w-20 h-20 rounded-full border border-gray-600/50 transition-all duration-300 group-hover:border-gray-500/70 group-active:border-gray-400/90"></div>

              {/* Center circle with number */}
              <div className="relative w-8 h-8 bg-white rounded-full flex items-center justify-center text-black font-semibold text-sm transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-white/20 group-active:scale-95">
                1
              </div>

              {/* Subtle hover glow effect */}
              <div className="absolute inset-0 rounded-full bg-gradient-radial from-white/0 via-white/0 to-transparent transition-all duration-500 group-hover:from-white/3 group-hover:via-white/1"></div>
            </div>
          </div>

          {/* Additional pads row */}
          {currentTypeData.pads.length > 9 && (
            <div className="grid grid-cols-4 gap-4 justify-items-center">
              {currentTypeData.pads.slice(9).map((pad, index) => (
                <PadButton
                  key={pad.id}
                  pad={pad}
                  index={index + 9}
                  isActive={activePads.has(pad.id)}
                  onClick={() => handlePadPress(pad)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

    </div>
  );
};

export default DrumPadMachine;