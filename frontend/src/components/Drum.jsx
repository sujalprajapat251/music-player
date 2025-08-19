import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setDrumRecordedData, setDrumPlayback, setDrumPlaybackStartTime, addAudioClipToTrack, addTrack } from '../Redux/Slice/studio.slice';
import { removeEffect, updateEffectParameter, setShowEffectsLibrary, addEffect, toggleEffectsOffcanvas } from '../Redux/Slice/effects.slice';
import Pattern from '../components/Pattern';
import {
  drumMachineTypes,
  soundDescriptions,
  createSynthSound,
  createDrumData,
  getAudioContext
} from '../Utils/drumMachineUtils';
import { IoClose } from 'react-icons/io5';
import PianoRolls from './PianoRolls';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { GiPianoKeys } from 'react-icons/gi';
import { IoIosArrowDown } from 'react-icons/io';
import { ReactComponent as Tick } from "../Images/Tick.svg";
import { useTheme } from '../Utils/ThemeContext';

function polarToCartesian(cx, cy, r, angle) {
  const a = (angle - 90) * Math.PI / 180.0;
  return {
    x: cx + r * Math.cos(a),
    y: cy + r * Math.sin(a)
  };
}

// Helper to describe arc path
function describeArc(cx, cy, r, startAngle, endAngle) {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
  return [
    "M", start.x, start.y,
    "A", r, r, 0, largeArcFlag, 0, end.x, end.y
  ].join(" ");
}

function Knob({ label = "Bite", min = -135, max = 135, defaultAngle, onChange }) {
  const [angle, setAngle] = useState(defaultAngle ?? min);
  const knobRef = useRef(null);
  const dragging = useRef(false);
  const lastY = useRef(0);


  // Tailwind-consistent responsive sizes
  const getResponsiveSize = () => {
    if (typeof window !== 'undefined') {
      if (window.innerWidth >= 1440) return 56; // 2xl
      if (window.innerWidth >= 1280) return 52; // xl  
      if (window.innerWidth >= 1024) return 48; // lg
      if (window.innerWidth >= 768) return 44;  // md
      if (window.innerWidth >= 640) return 40;  // sm
      return 30; // xs (mobile)
    }
    return 56;
  };

  const [size, setSize] = useState(getResponsiveSize());

  useEffect(() => {
    const handleResize = () => setSize(getResponsiveSize());
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);


  // Tailwind-consistent responsive sizes
  const getResponsiveStroke = () => {
    if (typeof window !== 'undefined') {
      if (window.innerWidth >= 768) return 3;  // md
      // if (window.innerWidth >= 640) return 40;  // sm
      return 2; // xs (mobile)
    }
    return 56;
  };

  const [stroke, setStroke] = useState(getResponsiveStroke());

  useEffect(() => {
    const handleResizeStroke = () => setStroke(getResponsiveStroke());
    window.addEventListener('resize', handleResizeStroke);
    return () => window.removeEventListener('resize', handleResizeStroke);
  }, []);

  // Update angle when defaultAngle prop changes
  useEffect(() => {
    if (defaultAngle !== undefined) {
      setAngle(defaultAngle);
    }
  }, [defaultAngle]);


  const radius = (size - stroke) / 2;
  const center = size / 2;
  const onMouseDown = (e) => {
    dragging.current = true;
    lastY.current = e.clientY;
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  };

  const onMouseMove = (e) => {
    if (!dragging.current) return;
    const deltaY = lastY.current - e.clientY; // up is negative, down is positive
    lastY.current = e.clientY;
    setAngle((prev) => {
      let next = prev + deltaY * 1.5; // adjust sensitivity as needed
      next = Math.max(min, Math.min(max, next));

      // Call onChange callback if provided
      if (onChange) {
        onChange(next);
      }

      return next;
    });
  };

  const onMouseUp = () => {
    dragging.current = false;
    document.removeEventListener("mousemove", onMouseMove);
    document.removeEventListener("mouseup", onMouseUp);
  };

  const arcStart = min; // -135
  const valueAngle = angle; // current angle
  const fgArc = describeArc(center, center, radius, arcStart, valueAngle);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        // marginTop: 40,
      }}
    >
      <div
        ref={knobRef}
        style={{
          width: size,
          height: size,
          position: "relative",
          cursor: "pointer",
        }}
        onMouseDown={onMouseDown}
      >
        <svg width={size} height={size}>
          {/* Full background circle */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            stroke="#444"
            strokeWidth={stroke}
            fill="#1F1F1F"
          />
          {/* Colored arc (top half, up to value) */}
          <path
            d={fgArc}
            stroke="#bbb"
            strokeWidth={stroke}
            fill="#1F1F1F"
            strokeLinecap="round"
          />
        </svg>
        {/* Indicator line */}
        <div
          className={`absolute top-1.5 left-1/2 w-0.5 h-2 md600:h-3 lg:h-4 bg-gray-400 rounded-sm -translate-x-1/2 origin-bottom`}
          style={{
            transform: `translateX(-50%) rotate(${angle}deg)`,
          }}
        />
      </div>
      <div className='text-[8px] md600:text-[10px] md:text-[12px] 2xl:text-[14px] mt-1 items-center text-[#aaa]'
        style={{
          fontFamily: "sans-serif"
        }}
      >
        {label}
      </div>
    </div>
  );
}

const menu = [
  { id: 'Off', label: 'Off' },
  { id: '1/1', label: '1/1' },
  { id: '1/2', label: '1/2' },
  { id: '1/2 dotted', label: '1/2 dotted' },
  { id: '1/4', label: '1/4' },
  { id: '1/8', label: '1/8' },
  { id: '1/16', label: '1/16' },
  { id: '1/32', label: '1/32' },
  { id: '1/8 triplet', label: '1/8 triplet' },
  { id: '1/16 triplet', label: '1/16 triplet' },
];


const DrumPadMachine = ({ onClose }) => {
  const [isIconDropdownOpen, setIsIconDropdownOpen] = useState(false);
  const [isOpen2, setIsOpen2] = useState(false);
  const menuDropdownRef = useRef(null);
  const [selectedMenuitems, setSelectedMenuitems] = useState('Off');
  const [isSavePresetDropdownOpen, setIsSavePresetDropdownOpen] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isProcessingDrop, setIsProcessingDrop] = useState(false);
  const [effectsSearchTerm, setEffectsSearchTerm] = useState('');
  const [selectedEffectCategory, setSelectedEffectCategory] = useState(null);

  const [currentType, setCurrentType] = useState(0);
  const [activePads, setActivePads] = useState(new Set());
  const [showOffcanvas3, setShowOffcanvas3] = useState(true);
  const [displayDescription, setDisplayDescription] = useState('Press a key or click a pad!');
  const [volume, setVolume] = useState(0.7);
  const [pan, setPan] = useState(0);
  const [reverb, setReverb] = useState(0.2);
  // const [isRecording, setIsRecording] = useState(false);
  const [sequence, setSequence] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedPad, setSelectedPad] = useState(null);
  const [padEffects, setPadEffects] = useState({});
  const [activeView, setActiveView] = useState('Instruments'); // 'instrument', 'patterns', 'piano', 'effects'
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
  const { activeEffects, showEffectsLibrary, effectsLibrary, showEffectsOffcanvas } = useSelector((state) => state.effects);
  // console.log("activeEffects", activeEffects, "showEffectsLibrary", showEffectsLibrary,);

  const currentTypeData = drumMachineTypes[currentType];
  // console.log('currentTypeData', currentTypeData);
  // Get the currently selected drum machine
  const selectedDrumMachine = drumMachineTypes[currentType];

  const handleMenuItemSelect = (qualityId, qualityLabel) => {
    setSelectedMenuitems(qualityLabel);
    setIsOpen2(false)
  };


  const handlePadPress = (pad, timestamp) => {
    if (isRecording) {
      const drumData = createDrumData(pad, selectedDrumMachine, timestamp || currentTime);
      const updatedData = [...drumRecordedData, drumData];
      dispatch(setDrumRecordedData(updatedData));
    }
    playSound(pad);
  };


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
      // Add a small delay to ensure Timeline has rendered the data
      const processTimeout = setTimeout(() => {
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

            // Only clear drum data after successful track creation
            setTimeout(() => {
              dispatch(setDrumRecordedData([]));
            }, 500); // Give Timeline time to display
          }
        }).catch((error) => {
          // console.error('Error creating continuous drum audio blob:', error);
        });
      }, 200); // Small delay to ensure Timeline renders first

      return () => clearTimeout(processTimeout);
    }
  }, [isRecording, drumRecordedData, currentTrackId, selectedDrumMachine]);

  // Function to create continuous audio blob from all drum recordings
  const createContinuousDrumAudioBlob = async (allDrumData) => {
    try {
      const audioContext = getAudioContext(audioContextRef);
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


  // const soundDescriptions = {
  //   kick: "Kick Drum (Low-end punch)",
  //   snare: "Snare Drum (Sharp attack)",
  //   hihat: "Closed Hi-Hat (Short & tight)",
  //   openhat: "Open Hi-Hat (Sizzly)",
  //   clap: "Clap (Snappy)",
  //   rimshot: "Rimshot (Sharp side-stick)",
  //   perc1: "Percussion Hit (General)",
  //   perc2: "Metallic Perc (Ping)",
  //   bass: "808 Bass (Low rumble)",
  //   tom: "Tom Drum (Mid-punch)",
  //   crash: "Crash Cymbal (Washy)",
  //   ride: "Ride Cymbal (Sustained)",
  //   cowbell: "Cowbell (Metal click)",
  //   shaker: "Shaker (Rhythmic noise)",
  //   woodblock: "Wood Block (Thock)",
  //   conga: "Conga (Hand drum)",
  //   bongo: "Bongo (High-pitched hand drum)",
  //   vocal: "Vocal FX (Chops or shout)",
  //   fx1: "Effect Hit (Sweep / Boom)",
  //   fx2: "Reverse FX (Whoosh / Delay tail)",
  //   snap: "Finger Snap",
  //   laser: "Laser Shot FX",
  //   glitch: "Glitch FX",
  //   vinyl: "Vinyl Scratch",
  //   rise: "Riser FX",
  //   drop: "Drop Impact"
  // };



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
    const audioContext = getAudioContext(audioContextRef);

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
  }, []);

  // Play sound with effects
  const playSound = useCallback((pad) => {
    try {
      const audioContext = getAudioContext(audioContextRef);

      if (audioContext.state === 'suspended') {
        audioContext.resume();
      }

      const padEffect = padEffects[pad.id] || {};
      const effectiveVolume = padEffect.volume !== undefined ? padEffect.volume : volume;
      const effectivePan = padEffect.pan !== undefined ? padEffect.pan : pan;
      const effectiveReverb = padEffect.reverb !== undefined ? padEffect.reverb : reverb;
      const currentTypeEffects = drumMachineTypes[currentType].effects;

      // Create synthetic sound using shared function
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
  }, [volume, pan, reverb, soundDescriptions, drumMachineTypes, currentType, isRecording, padEffects, createReverbBuffer, applyTypeEffects]);

  const [pressedKeys, setPressedKeys] = useState(new Set());

  // Keyboard handling
  // useEffect(() => {
  //   const handleKeyDown = (e) => {
  //     e.preventDefault();
  //     const key = e.key.toUpperCase();
  //     const keyToPadMap = {
  //       'Q': 'Q', 'W': 'W', 'E': 'E', 'R': 'R',
  //       'A': 'A', 'S': 'S', 'F': 'F', 'Z': 'Z',
  //       'X': 'X', 'C': 'C', 'D': 'D'
  //     };

  //     if (keyToPadMap.hasOwnProperty(key) && !pressedKeys.has(key)) {
  //       setPressedKeys(prev => new Set([...prev, key]));
  //       handlePadPress(currentTypeData.pads[keyToPadMap[key]]);
  //     }
  //   };

  //   const handleKeyUp = (e) => {
  //     const key = e.key.toUpperCase();
  //     setPressedKeys(prev => {
  //       const newSet = new Set(prev);
  //       newSet.delete(key);
  //       return newSet;
  //     });
  //   };

  //   window.addEventListener('keydown', handleKeyDown);
  //   window.addEventListener('keyup', handleKeyUp);

  //   return () => {
  //     window.removeEventListener('keydown', handleKeyDown);
  //     window.removeEventListener('keyup', handleKeyUp);
  //   };
  // }, [currentTypeData, pressedKeys]);



  // Replace your existing keyboard handling useEffect with this improved version:

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Do not intercept typing inside inputs/contenteditable elements
      const target = e.target;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
        return;
      }
      const key = e.key.toUpperCase();
      const keyToPadMap = {
        'Q': currentTypeData.pads[0],
        'W': currentTypeData.pads[1],
        'E': currentTypeData.pads[2],
        'R': currentTypeData.pads[3],
        'A': currentTypeData.pads[4],
        'S': currentTypeData.pads[5],
        'F': currentTypeData.pads[6],
        'Z': currentTypeData.pads[7],
        'X': currentTypeData.pads[8],
        'C': currentTypeData.pads[9],
        'D': currentTypeData.pads[10],
      };

      if (keyToPadMap.hasOwnProperty(key) && !pressedKeys.has(key)) {
        // Prevent default only for handled musical keys
        e.preventDefault();
        setPressedKeys(prev => new Set([...prev, key]));
        handlePadPress(keyToPadMap[key]); // Call handlePadPress with the corresponding pad
      }
    };

    const handleKeyUp = (e) => {
      // Do not intercept typing inside inputs/contenteditable elements
      const target = e.target;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
        return;
      }
      const key = e.key.toUpperCase();
      setPressedKeys(prev => {
        const newSet = new Set(prev);
        newSet.delete(key);
        return newSet;
      });
    };

    // Add event listeners to document instead of window for better focus handling
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
    };
  }, [currentTypeData, pressedKeys, handlePadPress]); // Add handlePadPress to dependencies



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

  // Function to create audio blob for drum hit
  const createDrumAudioBlob = async (pad) => {
    try {
      const audioContext = getAudioContext(audioContextRef);
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

  const styles = {
    pressed: {
      transform: 'scale(0.95)',
      transition: 'transform 0.1s ease-in-out'
    },
    pressedRings: {
      borderColor: 'rgb(107 114 128 / 0.8)',
      transition: 'border-color 0.1s ease-in-out'
    },
    pressedButton: {
      transform: 'scale(0.95)',
      boxShadow: '0 10px 15px -3px rgb(255 255 255 / 0.2)',
      transition: 'all 0.1s ease-in-out'
    }
  };

  const handleAddEffectFromLibrary = (effect) => {
    console.log('handleAddEffectFromLibrary called with:', effect);

    // Prevent duplicate additions during drag operations
    if (isProcessingDrop) {
      console.log('Already processing a drop, skipping duplicate');
      return;
    }

    setIsProcessingDrop(true);
    dispatch(addEffect(effect));
    dispatch(setShowEffectsLibrary(false));
    setEffectsSearchTerm('');
    setSelectedEffectCategory(null);

    // Reset the flag after a short delay
    setTimeout(() => {
      setIsProcessingDrop(false);
    }, 100);
  };

  const handlePlusButtonClick = () => {
    dispatch(toggleEffectsOffcanvas());
  };

  return (
    <>
      {showOffcanvas3 === true && (
        <>
          <div className="fixed z-0 w-full h-full  transition-transform  left-0 right-0 translate-y-full bottom-[390px] sm:bottom-[390px] md600:bottom-[450px]  lg:bottom-[530px] xl:bottom-[545px] 2xl:bottom-[563px] 3xl:bottom-[610px]"
            tabIndex="-1"
            aria-labelledby="drawer-swipe-label"
            onDragOver={(e) => {
              e.preventDefault(); e.dataTransfer.dropEffect = 'copy';
              if (activeView === 'Effects') {
                setIsDragOver(true);
              }
            }}
            onDragLeave={(e) => {
              if (!e.currentTarget.contains(e.relatedTarget)) {
                setIsDragOver(false);
              }
            }}
            onDrop={(e) => {
              e.preventDefault(); setIsDragOver(false);
              if (activeView === 'Effects') {
                try {
                  const effectData = JSON.parse(e.dataTransfer.getData('application/json'));
                  handleAddEffectFromLibrary(effectData);
                } catch (error) {
                  console.error('Error parsing dropped effect data:', error);
                }
              }
            }}>
            {/* Static Navbar with Tabs */}
            <div className="  border-b border-[#FFFFFF1A] h-full">
              <div className=" bg-[#1F1F1F] flex items-center px-1 md600:px-2 md600:pt-2 lg:px-3 lg:pt-3">
                {/* Close Button */}
                <div>
                  <IoClose className='text-[10px] sm:text-[12px] md600:text-[14px] md:text-[16px] lg:text-[18px] 2xl:text-[20px] text-[#FFFFFF99] cursor-pointer justify-start' onClick={() => {
                    setShowOffcanvas3(false);
                    onClose && onClose();
                  }} />
                </div>
              </div>
              {/* Tabs */}
              <div className=" bg-[#1F1F1F] flex space-x-2 sm:space-x-3 px-1 md600:space-x-4  md600:px-2 lg:space-x-6 2xl:space-x-8 justify-center  lg:px-3 pb-4">
                {['Instruments', 'Patterns', 'Piano Roll', 'Effects'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveView(tab)}
                    className={`text-[8px] md600:text-[10px] md:text-[12px]  lg:text-[14px] 2xl:text-[16px] font-medium transition-colors ${activeView === tab
                      ? 'text-white border-b-2 border-white '
                      : 'text-gray-400 hover:text-white'
                      }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Instrument Selector and Audio Knobs - Only show when Instruments tab is active */}
              <div className=''>
                {activeView === 'Instruments' && (
                  <>
                    <div className=" bg-[#1F1F1F] flex items-center justify-center pt-1 pb-1 md600:px-2 md600:pt-2 md600:pb-1 gap-2 sm:gap-2  md600:gap-12 md:gap-16 lg:pt-4 lg:pb-2 lg:px-3 lg:gap-20 2xl:pt-5 2xl:pb-3 2xl:px-3 2xl:gap-24">
                      {/* Instrument Selector */}
                      <div className="bg-[#353535] p-1 md600:p-2 lg:p-3 rounded-lg">
                        <div className="flex items-center justify-between">
                          <button
                            onClick={() => setCurrentType((prev) => (prev - 1 + drumMachineTypes.length) % drumMachineTypes.length)}
                            className="text-gray-400 hover:text-white transition-colors  md600:p-2"
                          >
                            <FaChevronLeft className='text-[8px] md600:text-[10px] md:text-[12px]  lg:text-[14px] 2xl:text-[16px]' />
                          </button>

                          <div className="flex items-center gap-1 md600:gap-2 px-1 md600:px-2 md:gap-3 w-[100px] sm:w-[150px] md600:w-[170px] md:w-[172px] lg:gap-4 lg:px-3 lg:w-[230px] 2xl:gap-5 flex-1 justify-center 2xl:px-4 2xl:w-[250px]">
                            <div className="text-white">
                              <GiPianoKeys className='text-[10px] sm:text-[12px] md600:text-[14px] md:txt-[16px] lg:text-[18px] 2xl:text-[20px]' />
                            </div>
                            <div className="">
                              <div className="text-white fw-bolder text-[10px] sm:text-[12px] md600:text-[14px] md:txt-[16px] lg:text-[18px] 2xl:text-[16px]">
                                {currentTypeData.name}
                              </div>
                              <div className="text-gray-400 text-[8px] sm:text-[10px] md600:text-[12px] lg:text-[14px] max-w-20 sm:max-w-32 truncate">
                                {currentTypeData.description}
                              </div>
                            </div>
                          </div>

                          <button
                            onClick={() => setCurrentType((prev) => (prev + 1) % drumMachineTypes.length)}
                            className="text-gray-400 hover:text-white transition-colors lg:p-2"
                          >
                            <FaChevronRight className='text-[8px] md600:text-[10px] md:text-[12px] lg:text-[14px] 2xl:text-[16px] text-[#FFFFFF99]' />
                          </button>
                        </div>
                      </div>

                      {/* Audio Effect Knobs */}
                      <div className="flex space-x-1 md600:space-x-2 lg:space-x-4 2xl:space-x-6">
                        {/* Reverb Knob */}
                        <div className="flex flex-col items-center">
                          <Knob label="Reverb" min={-135} max={135} defaultAngle={reverb} onChange={(value) => setReverb(value)} />
                        </div>

                        {/* Pan Knob */}
                        <div className="flex flex-col items-center">
                          <Knob label="Pan" min={-135} max={135} defaultAngle={pan} onChange={(value) => setPan(value)} />
                        </div>

                        {/* Volume Knob */}
                        <div className="flex flex-col items-center">
                          <Knob label="Volume" min={-135} max={135} defaultAngle={volume} onChange={(value) => setVolume(value)} />
                        </div>
                      </div>

                      <div className='items-center '>
                        <div className='border rounded-lg border-[#FFFFFF1A]'>
                          <p className="text-[#FFFFFF] text-center  text-[8px] md600:text-[10px] md:text-[12px] lg:text-[14px] px-2 md600:px-3 md:px-4 lg:px-5 2xl:px-6 py-1">Save Preset</p>
                        </div>
                        <p className="text-white text-center text-[8px] sm:text-[10px]  px-2 md600:px-3 md:px-4 lg:px-4 py-1 mt-1 lg:mt-2">Auto-quantize</p>
                        <div className="border  border-[#FFFFFF1A] mt-1 px-1 sm:px-2 md:px-3 lg:px-4 xl:px-5 2xl:px-6" onClick={() => { setIsIconDropdownOpen(!isIconDropdownOpen); setIsOpen2(!isOpen2) }}>
                          <div className="relative flex gap-1 sm:gap-2 md:gap-3" ref={menuDropdownRef}>
                            <div className="items-center rounded-full " >
                              <span className="text-[#14141499] dark:text-[#FFFFFF99] text-[8px] sm:text-[10px] md600:text-[12px] lg:text-[14px]">{selectedMenuitems}</span>
                            </div>
                            <IoIosArrowDown className={`text-[#14141499] dark:text-[#FFFFFF99] transition-transform my-auto ms-auto  duration-300 ${isIconDropdownOpen ? 'rotate-180' : 'rotate-0'}`}
                            />

                            {isOpen2 && (
                              <div className="absolute top-[27px] left-[5px] sm:left-[20px] md600:left-[30px] md:left-[40px]  transform -translate-x-1/2 w-32 md600:w-44 lg:w-44 bg-primary-light dark:bg-primary-dark rounded-lg shadow-2xl px-1 z-50">
                                <div>
                                  {menu.map((option) => (
                                    <div
                                      key={option.id}
                                      className="flex items-center justify-between px-3 lg:px-4 py-1 3xl:py-2 text-secondary-light dark:text-secondary-dark cursor-pointer hover:bg-[#E5E5E5] dark:hover:bg-[#262529]"
                                      onClick={() => handleMenuItemSelect(option.id, option.label)}
                                    >
                                      <div className="flex items-center gap-2 md600:gap-3">
                                        {/* Show tick only for selected option */}
                                        <div className="w-3 h-3 md600:w-4 md600:h-4 lg:w-5 lg:h-5 flex items-center justify-center">
                                          {selectedMenuitems === option.label && (
                                            <Tick className='w-3 h-3 md600:w-4 md600:h-4 lg:w-5 lg:h-5 text-secondary-light dark:text-secondary-dark' />
                                          )}
                                        </div>
                                        <div className="flex flex-col">
                                          <span className='text-secondary-light dark:text-secondary-dark text-[10px] md600:text-[12px] lg:text-[14px]'>
                                            {option.label}
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Drum Pad Area */}
                    <div className="flex-1 flex items-center justify-center 3xl:p-4 relative bg-black">
                      {/* Scrollable wrapper for small screens */}
                      <div className="w-full h-full md:h-auto justify-center overflow-auto md:overflow-auto">
                        <div
                          className="md:p-6 xl:p-8 rounded-2xl relative w-[800px] h-[800px] md:w-full md:h-[400px]"
                        >
                          <div
                            className="absolute left-[34%] top-[6%] sm:left-[32%] sm:top-[6%] md600:left-[28%] md600:top-[7%] md:left-[32%] md:top-[12%] lg:left-[20%] lg:top-[12%] xl:left-[25%] xl:top-[15%] 2xl:left-[23%] 2xl:top-[15%] 3xl:left-[30%] 3xl:top-[16%] cursor-pointer z-20"
                            style={pressedKeys.has('Q') ? styles.pressed : {}}
                            onClick={() => handlePadPress(currentTypeData.pads[0])}
                          >
                            <div className="relative flex items-center justify-center group">
                              <div
                                className="absolute w-24 h-24 md600:w-28 md600:h-28 lg:w-32 lg:h-32 3xl:w-40 3xl:h-40 rounded-full border border-[#606060] transition-all duration-300 group-hover:border-gray-500/60 group-active:border-gray-400/70 bg-[#3D3B3A]"

                                style={pressedKeys.has('Q') ? styles.pressedRings : {}}
                              ></div>
                              <div
                                className="absolute w-16 h-16 md600:w-20 md600:h-20 lg:w-24 lg:h-24 3xl:w-32 3xl:h-32 rounded-full border border-[#606060] transition-all duration-300 group-hover:border-gray-500/65 group-active:border-gray-400/75 bg-[#3D3B3A]"
                                style={pressedKeys.has('Q') ? styles.pressedRings : {}}
                              ></div>
                              <div
                                className="absolute w-10 h-10 md600:w-12 md600:h-12 lg:w-16 lg:h-16 3xl:w-20 3xl:h-20 rounded-full border border-[#606060] transition-all duration-300 group-hover:border-gray-500/70 group-active:border-gray-400/80 bg-[#3D3B3A]"
                                style={pressedKeys.has('Q') ? styles.pressedRings : {}}
                              ></div>
                              <div
                                className="relative w-4 h-4 lg:w-8 lg:h-8 bg-white rounded-full flex items-center justify-center text-black font-semibold text-sm transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-white/20 group-active:scale-95"
                                style={pressedKeys.has('Q') ? styles.pressedButton : {}}
                              >
                                Q
                              </div>
                            </div>
                          </div>

                          {/* Snare - Medium-large disk */}
                          <div
                            className="absolute left-[44%] top-[8%] sm:left-[42%] sm:top-[8%] md600:left-[41%] md600:top-[10%] md:left-[45%] md:top-[16%] lg:left-[30%] lg:top-[18%] xl:left-[34%] xl:top-[20%] 2xl:left-[31%] 2xl:top-[20%] 3xl:left-[37%] 3xl:top-[25%] cursor-pointer z-10"

                            style={pressedKeys.has('W') ? styles.pressedButton : {}}
                            onClick={() => handlePadPress(currentTypeData.pads[1])}
                          >
                            <div className="relative flex items-center justify-center group">
                              <div className="absolute w-24 h-24 md600:w-28 md600:h-28 lg:w-32 lg:h-32 3xl:w-40 3xl:h-40 rounded-full border  border-[#606060] transition-all duration-300 group-hover:border-gray-500/50 group-active:border-gray-400/70 bg-[#3D3B3A]" style={pressedKeys.has('W') ? styles.pressedButton : {}} ></div>
                              <div className="absolute w-20 h-20 md600:w-24 md600:h-24 lg:w-28 lg:h-28 3xl:w-36 3xl:h-36 rounded-full border  border-[#606060] transition-all duration-300 group-hover:border-gray-500/55 group-active:border-gray-400/75 bg-[#3D3B3A]" style={pressedKeys.has('W') ? styles.pressedButton : {}} ></div>
                              <div className="absolute w-10 h-10 md600:w-12 md600:h-12 lg:w-16 lg:h-16 3xl:w-20 3xl:h-20 rounded-full border border-[#606060] transition-all duration-300 group-hover:border-gray-500/60 group-active:border-gray-400/80 bg-[#3D3B3A]" style={pressedKeys.has('W') ? styles.pressedButton : {}} ></div>
                              <div className="relative w-4 h-4 lg:w-8 lg:h-8 bg-white rounded-full flex items-center justify-center text-black font-semibold text-sm transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-white/20 group-active:scale-95" style={pressedKeys.has('W') ? styles.pressedButton : {}} >
                                W
                              </div>
                            </div>
                          </div>

                          {/* Hi-hat - Small disk */}
                          <div
                            className="absolute right-[43%] top-[8%] sm:right-[45%] sm:top-[8%] md600:right-[43%] md600:top-[10%] md:right-[39%] md:top-[17%] lg:right-[55%] lg:top-[18%] xl:right-[55%] xl:top-[20%] 2xl:right-[59%] 2xl:top-[20%] 3xl:right-[53.5%] 3xl:top-[25%] cursor-pointer z-20"

                            style={pressedKeys.has('E') ? styles.pressedButton : {}}
                            onClick={() => handlePadPress(currentTypeData.pads[2])}
                          >
                            <div className="relative  flex items-center justify-center group">
                              <div className="absolute w-24 h-24 md600:w-28 md600:h-28 lg:w-32 lg:h-32 3xl:w-40 3xl:h-40 rounded-full border  border-[#606060] transition-all duration-300 group-hover:border-gray-500/50 group-active:border-gray-400/70 bg-[#3D3B3A]" style={pressedKeys.has('E') ? styles.pressedButton : {}} ></div>
                              <div className="absolute w-20 h-20 md600:w-24 md600:h-24 lg:w-28 lg:h-28 3xl:w-36 3xl:h-36 rounded-full border  border-[#606060] transition-all duration-300 group-hover:border-gray-500/55 group-active:border-gray-400/75 bg-[#3D3B3A]" style={pressedKeys.has('E') ? styles.pressedButton : {}} ></div>
                              <div className="absolute w-10 h-10 md600:w-12 md600:h-12 lg:w-16 lg:h-16 3xl:w-16 3xl:h-16 rounded-full border border-[#606060] transition-all duration-300 group-hover:border-gray-500/60 group-active:border-gray-400/80 bg-[#3D3B3A]" style={pressedKeys.has('E') ? styles.pressedButton : {}} ></div>
                              <div className="relative w-4 h-4 lg:w-8 lg:h-8 bg-white rounded-full flex items-center justify-center text-black font-semibold text-sm transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-white/20 group-active:scale-95" style={pressedKeys.has('E') ? styles.pressedButton : {}} >
                                E
                              </div>
                            </div>
                          </div>

                          {/* Clap - Medium disk */}
                          <div
                            className="absolute left-[49%] top-[19%] sm:left-[47%] sm:top-[19%] md600:left-[48%] md600:top-[22%] md:left-[52%] md:top-[37%] lg:left-[36%] lg:top-[48%] xl:left-[38%] xl:top-[50%] 2xl:left-[35%] 2xl:top-[50%] 3xl:left-[41%] 3xl:top-[58%] cursor-pointer z-0"
                            style={pressedKeys.has('R') ? styles.pressedButton : {}}
                            onClick={() => handlePadPress(currentTypeData.pads[3])}
                          >
                            <div className="relative  flex items-center justify-center group">
                              <div className="absolute w-40 h-40 md600:w-44 md600:h-44 lg:w-48 lg:h-48 3xl:w-52 3xl:h-52 rounded-full border border-[#606060] transition-all duration-300 group-hover:border-gray-500/50 group-active:border-gray-400/70 bg-[#3D3B3A]" style={pressedKeys.has('R') ? styles.pressedButton : {}}></div>
                              <div className="absolute w-16 h-16 md600:w-20 md600:h-20 lg:w-24 lg:h-24 3xl:w-28 3xl:h-28 rounded-full border border-[#606060] transition-all duration-300 group-hover:border-gray-500/60 group-active:border-gray-400/80 bg-[#3D3B3A]" style={pressedKeys.has('R') ? styles.pressedButton : {}}></div>
                              <div className="relative w-4 h-4 lg:w-8 lg:h-8 3xl:w-8 3xl:h-8 bg-white rounded-full flex items-center justify-center text-black font-semibold text-sm transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-white/20 group-active:scale-95" style={pressedKeys.has('R') ? styles.pressedButton : {}}>
                                R
                              </div>
                            </div>
                          </div>

                          <div
                            className="absolute left-[24%] top-[13%] sm:left-[22%] sm:top-[13%] md600:left-[18%] md600:top-[17%] md:left-[22%] md:top-[30%] lg:left-[9.7%] lg:top-[30%] xl:left-[16.7%] xl:top-[33%] 2xl:left-[15.7%] 2xl:top-[32%] 3xl:left-[24.7%] 3xl:top-[44%] cursor-pointer z-30"
                            style={pressedKeys.has('A') ? styles.pressedButton : {}}
                            onClick={() => handlePadPress(currentTypeData.pads[4])}
                          >
                            <div className="relative flex items-center justify-center group ">
                              <div className="absolute w-28 h-28 md600:w-32 md600:h-32 lg:w-36 lg:h-36 3xl:w-40 3xl:h-40 rounded-full border border-[#606060] transition-all duration-300 group-hover:border-gray-500/60 group-active:border-gray-400/80 bg-[#3D3B3A]" style={pressedKeys.has('A') ? styles.pressedButton : {}}></div>
                              <div className="absolute w-20 h-20 md600:w-24 md600:h-24 lg:w-28 lg:h-28 3xl:w-32 3xl:h-32 rounded-full border  border-[#606060] transition-all duration-300 group-hover:border-gray-500/65 group-active:border-gray-400/85 bg-[#3D3B3A]" style={pressedKeys.has('A') ? styles.pressedButton : {}}></div>
                              <div className="absolute w-12 h-12 md600:w-16 md600:h-16 lg:w-20 lg:h-20 3xl:w-20 3xl:h-20 rounded-full border  border-[#606060] transition-all duration-300 group-hover:border-gray-500/70 group-active:border-gray-400/90 bg-[#3D3B3A]" style={pressedKeys.has('A') ? styles.pressedButton : {}}></div>
                              <div className="relative w-4 h-4 lg:w-8 lg:h-8 bg-white rounded-full flex items-center justify-center text-black font-semibold text-sm transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-white/20 group-active:scale-95" style={pressedKeys.has('A') ? styles.pressedButton : {}}>
                                A
                              </div>
                            </div>
                          </div>

                          <div
                            className="absolute left-[35%] top-[17%] sm:left-[33%] sm:top-[17%] md600:left-[31%] md600:top-[19%] md:left-[35%] md:top-[38%] lg:left-[21%] lg:top-[43.5%] xl:left-[26%] xl:top-[44.5%] 2xl:left-[24%] 2xl:top-[45.5%] 3xl:left-[32%] 3xl:top-[53%] cursor-pointer z-10"
                            style={pressedKeys.has('S') ? styles.pressedButton : {}}
                            onClick={() => handlePadPress(currentTypeData.pads[5])}
                          >
                            <div className="relative flex items-center justify-center group">
                              <div className="absolute w-32 h-32 md600:w-36 md600:h-36 lg:w-44 lg:h-44 3xl:w-48 3xl:h-48 rounded-full border  border-[#606060] transition-all duration-300 group-hover:border-gray-500/50 group-active:border-gray-400/70 bg-[#3D3B3A]" style={pressedKeys.has('S') ? styles.pressedButton : {}}></div>
                              <div className="absolute w-28 h-28 md600:w-32 md600:h-32 lg:w-40 lg:h-40 3xl:w-44 3xl:h-44 rounded-full border  border-[#606060] transition-all duration-300 group-hover:border-gray-500/55 group-active:border-gray-400/75 bg-[#3D3B3A]" style={pressedKeys.has('S') ? styles.pressedButton : {}}></div>
                              <div className="absolute w-10 h-10 md600:w-12 md600:h-12 lg:w-16 lg:h-16 3xl:w-20 3xl:h-20 rounded-full border border-[#606060] transition-all duration-300 group-hover:border-gray-500/60 group-active:border-gray-400/80 bg-[#3D3B3A]" style={pressedKeys.has('S') ? styles.pressedButton : {}}></div>
                              <div className="relative w-4 h-4 lg:w-8 lg:h-8 3xl:w-8 3xl:h-8 bg-white rounded-full flex items-center justify-center text-black font-semibold text-sm transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-white/20 group-active:scale-95" style={pressedKeys.has('S') ? styles.pressedButton : {}}>
                                S
                              </div>
                            </div>
                          </div>

                          <div
                            className="absolute right-[35%] top-[18%] sm:right-[37%] sm:top-[18%] md600:right-[33%] md600:top-[19%] md:right-[29%] md:top-[38.5%] lg:right-[46%] lg:top-[42.5%] xl:right-[48%] xl:top-[44.5%] 2xl:right-[52%] 2xl:top-[45.5%] 3xl:right-[48%] 3xl:top-[55.5%] cursor-pointer z-20"
                            style={pressedKeys.has('F') ? styles.pressedButton : {}}
                            onClick={() => handlePadPress(currentTypeData.pads[6])}
                          >
                            <div className="relative  flex items-center justify-center group">
                              <div className="absolute w-32 h-32 md600:w-36 md600:h-36 lg:w-44 lg:h-44 3xl:w-48 3xl:h-48 rounded-full border  border-[#606060] transition-all duration-300 group-hover:border-gray-500/50 group-active:border-gray-400/70 bg-[#3D3B3A]" style={pressedKeys.has('F') ? styles.pressedButton : {}}></div>
                              <div className="absolute w-28 h-28 md600:w-32 md600:h-32 lg:w-40 lg:h-40 3xl:w-44 3xl:h-44 rounded-full border  border-[#606060] transition-all duration-300 group-hover:border-gray-500/55 group-active:border-gray-400/75 bg-[#3D3B3A]" style={pressedKeys.has('F') ? styles.pressedButton : {}}></div>
                              <div className="absolute w-10 h-10 md600:w-12 md600:h-12 lg:w-16 lg:h-16 3xl:w-20 3xl:h-20 rounded-full border border-[#606060] transition-all duration-300 group-hover:border-gray-500/60 group-active:border-gray-400/80 bg-[#3D3B3A]" style={pressedKeys.has('F') ? styles.pressedButton : {}}></div>
                              <div className="relative w-4 h-4 lg:w-8 lg:h-8  bg-white rounded-full flex items-center justify-center text-black font-semibold text-sm transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-white/20 group-active:scale-95" style={pressedKeys.has('F') ? styles.pressedButton : {}}>
                                F
                              </div>
                            </div>
                          </div>

                          <div
                            className="absolute right-[33%] top-[6%] sm:right-[35%] sm:top-[6%] md600:right-[32%] md600:top-[7%] md:right-[28%] md:top-[12%] lg:right-[45%] lg:top-[12%] xl:right-[47%] xl:top-[14%] 2xl:right-[52%] 2xl:top-[14%] 3xl:right-[47%] 3xl:top-[17%] cursor-pointer z-20"
                            style={pressedKeys.has('Z') ? styles.pressedButton : {}}
                            onClick={() => handlePadPress(currentTypeData.pads[7])}
                          >
                            <div className="relative  flex items-center justify-center group">
                              <div className="absolute w-24 h-24 md600:w-28 md600:h-28 lg:w-32 lg:h-32 3xl:w-40 3xl:h-40 rounded-full border  border-[#606060] transition-all duration-300 group-hover:border-gray-500/50 group-active:border-gray-400/70 bg-[#3D3B3A]" style={pressedKeys.has('Z') ? styles.pressedButton : {}}></div>
                              <div className="absolute w-16 h-16 md600:w-20 md600:h-20 lg:w-24 lg:h-24 3xl:w-32 3xl:h-32 rounded-full border  border-[#606060] transition-all duration-300 group-hover:border-gray-500/55 group-active:border-gray-400/75 bg-[#3D3B3A]" style={pressedKeys.has('Z') ? styles.pressedButton : {}}></div>
                              <div className="absolute w-10 h-10 md600:w-12 md600:h-12 lg:w-16 lg:h-16 3xl:w-16 3xl:h-16 rounded-full border border-[#606060] transition-all duration-300 group-hover:border-gray-500/60 group-active:border-gray-400/80 bg-[#3D3B3A]" style={pressedKeys.has('Z') ? styles.pressedButton : {}}></div>
                              <div className="relative w-4 h-4 lg:w-8 lg:h-8 bg-white rounded-full flex items-center justify-center text-black font-semibold text-sm transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-white/20 group-active:scale-95" style={pressedKeys.has('Z') ? styles.pressedButton : {}}>
                                Z
                              </div>
                            </div>
                          </div>

                          <div
                            className="absolute  md600:right-[16%] md600:top-[20%] md:right-[12%] md:top-[20%] lg:right-[12%] lg:top-[20%] xl:right-[20%] xl:top-[22%] 2xl:right-[20%] 2xl:top-[20%] 3xl:right-[25%] 3xl:top-[25%] cursor-pointer z-20 hidden lg:block"
                            onClick={() => handlePadPress(currentTypeData.pads[8])}
                            style={pressedKeys.has('X') ? styles.pressedButton : {}}
                          >
                            <div className="relative  flex items-center justify-center group">
                              <div className="absolute md600:w-20 md600:h-20 lg:w-24 lg:h-24  rounded-full border  border-[#606060] transition-all duration-300 group-hover:border-gray-500/55 group-active:border-gray-400/75 bg-[#3D3B3A]" style={pressedKeys.has('X') ? styles.pressedButton : {}}></div>
                              <div className="absolute md600:w-12 md600:h-12 lg:w-16 lg:h-16  rounded-full border border-[#606060] transition-all duration-300 group-hover:border-gray-500/60 group-active:border-gray-400/80 bg-[#3D3B3A]" style={pressedKeys.has('X') ? styles.pressedButton : {}}></div>
                              <div className="relative md600:w-4 md600:h-4 lg:w-8 lg:h-8 bg-white rounded-full flex items-center justify-center text-black font-semibold text-sm transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-white/20 group-active:scale-95" style={pressedKeys.has('X') ? styles.pressedButton : {}}>
                                X
                              </div>
                            </div>
                          </div>

                          <div
                            className="absolute md600:right-[16%] md600:top-[50.5%] md:right-[12%] md:top-[50.5%] lg:right-[12%] lg:top-[50.5%] xl:right-[20%] xl:top-[52%] 2xl:right-[20%] 2xl:top-[52%] 3xl:right-[25%] 3xl:top-[55%] cursor-pointer z-20 hidden lg:block"
                            onClick={() => handlePadPress(currentTypeData.pads[9])}
                            style={pressedKeys.has('C') ? styles.pressedButton : {}}
                          >
                            <div className="relative  flex items-center justify-center group">
                              <div className="absolute md600:w-20 md600:h-20 lg:w-24 lg:h-24 rounded-full border  border-[#606060] transition-all duration-300 group-hover:border-gray-500/55 group-active:border-gray-400/75 bg-[#3D3B3A]" style={pressedKeys.has('C') ? styles.pressedButton : {}}></div>
                              <div className="absolute md600:w-12 md600:h-12 lg:w-16 lg:h-16 rounded-full border border-[#606060] transition-all duration-300 group-hover:border-gray-500/60 group-active:border-gray-400/80 bg-[#3D3B3A]" style={pressedKeys.has('C') ? styles.pressedButton : {}}></div>
                              <div className="relative md600:w-4 md600:h-4 lg:w-8 lg:h-8 bg-white rounded-full flex items-center justify-center text-black font-semibold text-sm transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-white/20 group-active:scale-95" style={pressedKeys.has('C') ? styles.pressedButton : {}}>
                                C
                              </div>
                            </div>
                          </div>

                          <div
                            className="absolute right-[24%] top-[13%] sm:right-[26%] sm:top-[13%] md600:right-[21%] md600:top-[17%] md:right-[17%] md:top-[30%] lg:right-[35%] lg:top-[25.5%] xl:right-[39%] xl:top-[30%] 2xl:right-[45%] 2xl:top-[30%] 3xl:right-[42%] 3xl:top-[38%] cursor-pointer z-30"
                            onClick={() => handlePadPress(currentTypeData.pads[10])}
                            style={pressedKeys.has('D') ? styles.pressedButton : {}}
                          >
                            <div className="relative flex items-center justify-center group ">
                              <div className="absolute w-28 h-28 md600:w-32 md600:h-32 lg:w-36 lg:h-36 3xl:w-40 3xl:h-40 rounded-full border border-[#606060] transition-all duration-300 group-hover:border-gray-500/60 group-active:border-gray-400/80 bg-[#3D3B3A]" style={pressedKeys.has('D') ? styles.pressedButton : {}}></div>
                              <div className="absolute w-20 h-20 md600:w-24 md600:h-24 lg:w-28 lg:h-28 3xl:w-32 3xl:h-32 rounded-full border border-[#606060] transition-all duration-300 group-hover:border-gray-500/65 group-active:border-gray-400/85 bg-[#3D3B3A]" style={pressedKeys.has('D') ? styles.pressedButton : {}}></div>
                              <div className="absolute w-12 h-12 md600:w-16 md600:h-16 lg:w-20 lg:h-20 3xl:w-24 3xl:h-24 rounded-full border border-[#606060] transition-all duration-300 group-hover:border-gray-500/70 group-active:border-gray-400/90 bg-[#3D3B3A]" style={pressedKeys.has('D') ? styles.pressedButton : {}}></div>
                              <div className="relative w-4 h-4 lg:w-8 lg:h-8 bg-white rounded-full flex items-center justify-center text-black font-semibold text-sm transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-white/20 group-active:scale-95" style={pressedKeys.has('D') ? styles.pressedButton : {}}>
                                D
                              </div>
                            </div>
                          </div>

                          {/* Add more pads with different positions and sizes */}
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {activeView === 'Patterns' && (
                  <Pattern />
                )}

                {activeView === 'Piano Roll' && (
                  <PianoRolls />
                )}

                {activeView === 'Effects' && (
                  <div className={`w-full overflow-x-auto transition-all duration-200 ${isDragOver ? 'bg-[#409C9F] bg-opacity-10' : ''}`}
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.dataTransfer.dropEffect = 'copy';
                      setIsDragOver(true);
                      console.log('Drag over Effects tab');
                    }}
                    onDragLeave={(e) => {
                      if (!e.currentTarget.contains(e.relatedTarget)) {
                        setIsDragOver(false);
                        console.log('Drag leave Effects tab');
                      }
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setIsDragOver(false);
                      console.log('Drop on Effects tab');
                      try {
                        const effectData = JSON.parse(e.dataTransfer.getData('application/json'));
                        console.log('Dropped effect data:', effectData);
                        handleAddEffectFromLibrary(effectData);
                      } catch (error) {
                        console.error('Error parsing dropped effect data:', error);
                      }
                    }}
                  >
                    <div className="flex items-center justify-center p-16 sm:p-11 md600:p-14 md:p-3 lg:p-10 3xl:p-16 min-w-max bg-black">
                      <div className="flex gap-2 sm:gap-4 min-w-max">
                        {activeEffects.map((effect) => (
                          <div key={effect.instanceId} className="w-[150px] h-[180px]  sm:w-[190px] sm:h-[234px] md600:w-[220px] md600:h-[250px] md:w-[230px] md:h-[320px] lg:w-[240px] lg:h-[337px] xl:w-[240px] xl:h-[345px] 2xl:w-[256px] 2xl:h-[364px] bg-[#1a1a1a] rounded-xl overflow-hidden shadow-lg text-white flex flex-col shrink-0">
                            <div className="flex-1 w-full flex items-center justify-center">
                              {effect.component ? (
                                <div className="w-full h-full flex items-center justify-center">
                                  {React.createElement(effect.component)}
                                </div>
                              ) : (
                                <div className="flex items-center justify-center h-full">
                                  <p className="text-gray-400 text-sm">No component available</p>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                        {activeEffects.length < effectsLibrary?.length && (
                          <div className="w-[150px] h-[180px]  sm:w-[190px] sm:h-[234px] md600:w-[220px] md600:h-[250px] md:w-[230px] md:h-[320px] lg:w-[240px] lg:h-[337px] xl:w-[240px] xl:h-[345px] 2xl:w-[256px] 2xl:h-[364px] bg-[#1a1a1a] rounded-xl flex flex-col items-center justify-center text-white cursor-pointer hover:bg-[#2a2a2a] transition-colors shrink-0 border-2 border-dashed border-gray-600"
                            onClick={handlePlusButtonClick}
                            onDragOver={(e) => {
                              e.preventDefault();
                              e.dataTransfer.dropEffect = 'copy';
                              e.currentTarget.style.borderColor = '#409C9F';
                              e.currentTarget.style.backgroundColor = '#2a2a2a';
                            }}
                            onDragLeave={(e) => {
                              e.currentTarget.style.borderColor = '#6B7280';
                              e.currentTarget.style.backgroundColor = '#1a1a1a';
                            }}
                            onDrop={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              e.currentTarget.style.borderColor = '#6B7280';
                              e.currentTarget.style.backgroundColor = '#1a1a1a';
                              try {
                                const effectData = JSON.parse(e.dataTransfer.getData('application/json'));
                                handleAddEffectFromLibrary(effectData);
                              } catch (error) {
                                console.error('Error parsing dropped effect data:', error);
                              }
                            }}
                          >
                            <div className="w-14 h-14 bg-white text-black rounded-full flex items-center justify-center text-2xl font-bold mb-4">+</div>
                            <p className="text-center text-sm leading-snug">Drop effects here or<br />select from library</p>
                          </div>
                        )}
                        {Array.from({ length: 4 - activeEffects.length - 1 }, (_, index) => (
                          <div key={index} className="w-[150px] h-[180px]  sm:w-[190px] sm:h-[234px] md600:w-[220px] md600:h-[250px] md:w-[230px] md:h-[320px] lg:w-[240px] lg:h-[337px] xl:w-[240px] xl:h-[345px] 2xl:w-[256px] 2xl:h-[364px] bg-[#1a1a1a] rounded-xl shrink-0 border-2 border-dashed border-gray-600"
                            onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'copy'; e.currentTarget.style.borderColor = '#409C9F'; e.currentTarget.style.backgroundColor = '#2a2a2a'; }}
                            onDragLeave={(e) => { e.currentTarget.style.borderColor = '#4B5563'; e.currentTarget.style.backgroundColor = '#1a1a1a'; }}
                            onDrop={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              e.currentTarget.style.borderColor = '#4B5563';
                              e.currentTarget.style.backgroundColor = '#1a1a1a';
                              try {
                                const effectData = JSON.parse(e.dataTransfer.getData('application/json'));
                                handleAddEffectFromLibrary(effectData);
                              } catch (error) {
                                console.error('Error parsing dropped effect data:', error);
                              }
                            }}
                          ></div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}</>
  );
};

export default DrumPadMachine;