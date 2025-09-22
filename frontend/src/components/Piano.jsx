import React, { useRef, useEffect, useState } from 'react'
import { Piano, KeyboardShortcuts, MidiNumbers } from 'react-piano';
import 'react-piano/dist/styles.css';
import Soundfont from 'soundfont-player';
import { useSelector, useDispatch } from "react-redux";
import { IoClose } from "react-icons/io5";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { GiPianoKeys } from "react-icons/gi";
import { HiMiniChevronUpDown } from "react-icons/hi2";
import Am from "../Images/am.svg";
import Bdmi from "../Images/bdmi.svg";
import C from "../Images/c.svg";
import Dm from "../Images/r.svg";
import E from "../Images/e.svg";
import F from "../Images/f.svg";
import G from "../Images/g.svg";
import Am7 from "../Images/am7.svg";
import { FaPlus, FaStop } from "react-icons/fa6";
import music from "../Images/playingsounds.svg";
import BottomToolbar from './Layout/BottomToolbar';
import { addPianoNote, setRecordingAudio, setPianoNotes, setPianoRecordingClip, setSelectedInstrument, updateTrack } from '../Redux/Slice/studio.slice';
import PianoRolls from './PianoRolls';
import * as Tone from "tone";
import Effects2 from './Effects2';
import { removeEffect, updateEffectParameter, setShowEffectsLibrary, addEffect, toggleEffectsOffcanvas, setShowEffectsTwo } from '../Redux/Slice/effects.slice';
import { selectStudioState } from '../Redux/rootReducer';
import PricingModel from './PricingModel';

function polarToCartesian(cx, cy, r, angle) {
  const a = (angle - 90) * Math.PI / 180.0;
  return {
    x: cx + r * Math.cos(a),
    y: cy + r * Math.sin(a)
  };
}

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

  const getResponsiveSize = () => {
    if (typeof window !== 'undefined') {
      if (window.innerWidth >= 1440) return 56;
      if (window.innerWidth >= 1280) return 52;
      if (window.innerWidth >= 1024) return 48;
      if (window.innerWidth >= 768) return 44;
      if (window.innerWidth >= 640) return 40;
      return 30;
    }
    return 56;
  };

  const [size, setSize] = useState(getResponsiveSize());

  useEffect(() => {
    const handleResize = () => setSize(getResponsiveSize());
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);


  const getResponsiveStroke = () => {
    if (typeof window !== 'undefined') {
      if (window.innerWidth >= 768) return 3;
      // if (window.innerWidth >= 640) return 40;
      return 2;
    }
    return 56;
  };

  const [stroke, setStroke] = useState(getResponsiveStroke());

  useEffect(() => {
    const handleResizeStroke = () => setStroke(getResponsiveStroke());
    window.addEventListener('resize', handleResizeStroke);
    return () => window.removeEventListener('resize', handleResizeStroke);
  }, []);

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
    const deltaY = lastY.current - e.clientY;
    lastY.current = e.clientY;
    setAngle((prev) => {
      let next = prev + deltaY * 1.5;
      next = Math.max(min, Math.min(max, next));

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

  const arcStart = min;
  const valueAngle = angle;
  const fgArc = describeArc(center, center, radius, arcStart, valueAngle);

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", }}>
      <div ref={knobRef} style={{ width: size, height: size, position: "relative", cursor: "pointer", }} onMouseDown={onMouseDown}>
        <svg width={size} height={size}>
          <circle cx={center} cy={center} r={radius} stroke="#444" strokeWidth={stroke} fill="#1F1F1F" />
          <path d={fgArc} stroke="#bbb" strokeWidth={stroke} fill="#1F1F1F" strokeLinecap="round" />
        </svg>
        <div className={`absolute top-1.5 left-1/2 w-0.5 h-2 md600:h-3 lg:h-4 bg-gray-400 rounded-sm -translate-x-1/2 origin-bottom`} style={{ transform: `translateX(-50%) rotate(${angle}deg)`, }} />
      </div>
      <div className='text-[8px] md600:text-[10px] md:text-[12px] 2xl:text-[14px] mt-1 items-center text-[#aaa]' style={{ fontFamily: "sans-serif" }}>{label}</div>
    </div>
  );
}

const RangeSlider = ({ min = 0, max = 100, step = 1, initialValue = 0, label = "Strum", unit = "s", onChange = () => { }, className = "" }) => {
  const [value, setValue] = useState(initialValue);

  const handleChange = (e) => {
    const newValue = Number(e.target.value);
    setValue(newValue);
    onChange(newValue);
  };

  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div className={`w-full ${className}`}>
      <div className="flex justify-between items-center">
        <label className="text-[8px] md600:text-[10px] md:text-[12px] lg:text-[14px] text-[#FFFFFF]">{label}</label>
        <span className="text-[10px] md600:text-[12px] md:text-[14px] text-[#FFFFFF99] outline-none focus:outline-none">{value}{unit}</span>
      </div>

      <div className="relative">
        <input type="range" min={min} max={max} step={step} value={value} onChange={handleChange} className="w-full h-1 bg-[#444] rounded-lg appearance-none cursor-pointer slider"
          style={{ background: `linear-gradient(to right, #bbb 0%, #bbb ${percentage}%, #444 ${percentage}%, #444 100%)` }} />
      </div>
      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 12px;
          height: 12px;
          background: #bbb;
          border: 2px solid white;
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
          transition: all 0.15s ease;
        }
        
        .slider::-webkit-slider-thumb:hover {
          background: #ccc;
          transform: scale(1.1);
        }
        
        .slider::-moz-range-thumb {
          width: 16px;
          height: 16px;
          background: #bbb;
          border: 2px solid white;
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
          transition: all 0.15s ease;
        }
        
        .slider::-moz-range-thumb:hover {
          background: #ccc;
          transform: scale(1.1);
        }
      `}</style>
    </div>
  );
};


const INSTRUMENTS = [
  { id: 'acoustic_grand_piano', name: 'Piano', category: 'Jazz Chord Memos' },
  // { id: 'Flopp', name: 'Floppy Disk', category: 'Retro Sounds' },
  { id: 'whistle', name: 'Whistle', category: 'Effects' },
  { id: 'fx_1_rain', name: 'Rain', category: 'Atmospheric' },
  // { id: 'fx_2_soundtrack', name: 'Soundtrack', category: 'Cinematic' },
  { id: 'fx_3_crystal', name: 'Crystal', category: 'Ambient' },
  { id: 'fx_4_atmosphere', name: 'Atmosphere', category: 'Ambient' },
  { id: 'fx_5_brightness', name: 'Brightness', category: 'Effects' },
  { id: 'fx_6_goblins', name: 'Goblins', category: 'Fantasy' },
  { id: 'fx_7_echoes', name: 'Echoes', category: 'Reverb' },
  { id: 'fx_8_scifi', name: 'Sci-Fi', category: 'Futuristic' },
  { id: 'glockenspiel', name: 'Glockenspiel', category: 'Percussion' },
  { id: 'guitar_fret_noise', name: 'Guitar Fret', category: 'String' },
  { id: 'guitar_harmonics', name: 'Guitar Harmonics', category: 'String' },
  { id: 'gunshot', name: 'Gunshot', category: 'Effects' },
  { id: 'harmonica', name: 'Harmonica', category: 'Wind' },
  { id: 'harpsichord', name: 'Harpsichord', category: 'Baroque' },
  // { id: 'helicopter', name: 'Helicopter', category: 'Effects' },
  { id: 'honkytonk_piano', name: 'Honky Tonk', category: 'Piano' },
  { id: 'kalimba', name: 'Kalimba', category: 'African' },
  { id: 'koto', name: 'Koto', category: 'Japanese' }
];

const BasicData = [
  { name: "Am", image: Am },
  { name: "Bdmi", image: Bdmi },
  { name: "C", image: C },
  { name: "Dm", image: Dm },
  { name: "E", image: E },
  { name: "F", image: F },
  { name: "G", image: G },
  { name: "Am7", image: Am7 }
];

const BasicData1 = [
  { name: "Full Chord" },
  { name: "On One" },
];

const Stabs = [
  { name: "On Air" },
  { name: "Eight's" },
  { name: "Soul Stabs" },
  { name: "One and Three" },
  { name: "Simple Stabs" },
  { name: "Latinesque" },
  { name: "All Four" },
  { name: "Moderate Stabs" },
]

const Arpeggiated = [
  { name: "Layout" },
  { name: "Storytime" },
  { name: "Rising Arp" },
  { name: "Dreamer" },
  { name: "Moving Arp" },
  { name: "Quick Arp" },
  { name: "Simple Stride" },
  { name: "Simple Rain" }
]

const other = [
  { name: "Simple Slide" },
  { name: "Simple Player" },
  { name: "Alternating Stride" }
];

const Pianodemo = ({ onClose }) => {
  const dispatch = useDispatch();
  const [showOffcanvas1, setShowOffcanvas1] = useState(true);
  const [autoChords, setAutoChords] = useState(false);
  const [selectedButtons, setSelectedButtons] = useState({ basic: null, stabs: null, arpeggiated: null, other: null });
  const [currentInstrumentIndex, setCurrentInstrumentIndex] = useState(0);
  const [activeTab, setActiveTab] = useState('Instruments');
  const [activePianoSection, setActivePianoSection] = useState(0);
  const [strumValue, setStrumValue] = useState(0);
  const [volume, setVolume] = useState(90);
  const [reverb, setReverb] = useState(-90);
  const [pan, setPan] = useState(0);
  const [isDragOver, setIsDragOver] = useState(false);
  const pianoSectionsRef = useRef(null);

  // Get the selected instrument from Redux
  
  const selectedInstrumentFromRedux = useSelector((state) => selectStudioState(state)?.selectedInstrument || 'acoustic_grand_piano');
  useEffect(() => {
    const index = INSTRUMENTS.findIndex(inst => inst.id === selectedInstrumentFromRedux);
    if (index !== -1) {
      setCurrentInstrumentIndex(index);
    }
  }, []);

  useEffect(() => {
    const containerEl = pianoSectionsRef.current;
    if (!containerEl) return;

    const handleWheelForOctaves = (event) => {
      const isHorizontal = Math.abs(event.deltaX) > Math.abs(event.deltaY);
      if (event.shiftKey) {
        event.preventDefault();
        const delta = isHorizontal ? event.deltaX : event.deltaY;
        setActivePianoSection((prev) => {
          if (delta > 0) return Math.min(prev + 1, 2);
          if (delta < 0) return Math.max(prev - 1, 0);
          return prev;
        });
        return;
      }

      // Block accidental horizontal scrolling entirely
      if (isHorizontal) {
        event.preventDefault();
      }
    };

    containerEl.addEventListener('wheel', handleWheelForOctaves, { passive: false });
    return () => {
      containerEl.removeEventListener('wheel', handleWheelForOctaves);
    };
  }, []);

  // const audioContextRef = useRef(null);
  const panNodeRef = useRef(null);
  const pianoRef = useRef(null);
  const reverbGainNodeRef = useRef(null);
  const dryGainNodeRef = useRef(null);
  const convolverNodeRef = useRef(null);
  const activeAudioNodes = useRef({});
  const recordAnchorRef = useRef({ systemMs: 0, playheadSec: 0 });
  // Lock instrument for the duration of a recording session
  const recordingInstrumentRef = useRef(null);
  const selectedInstrument = INSTRUMENTS[currentInstrumentIndex].id;

  // Update Redux when local instrument changes
  useEffect(() => {
    if (selectedInstrument !== selectedInstrumentFromRedux) {
      dispatch(setSelectedInstrument(selectedInstrument));
    }
  }, [selectedInstrument, selectedInstrumentFromRedux, dispatch]);

  const getIsRecording = useSelector((state) => selectStudioState(state).isRecording);
  const currentTrackId = useSelector((state) => selectStudioState(state).currentTrackId);
  const currentTrack = useSelector((state) => (selectStudioState(state).tracks || []).find(t => t.id === currentTrackId));
  const studioCurrentTime = useSelector((state) => selectStudioState(state).currentTime || 0);
  const existingPianoNotes = useSelector((state) => selectStudioState(state).pianoNotes || []);
  const tracks = useSelector((state) => selectStudioState(state).tracks || []);


  const getActiveTabs = useSelector((state) => state.effects.activeTabs);

    // Sync the track's nametype with the selected instrument's display name unless user renamed (locked)
    useEffect(() => {
      const instrumentName = INSTRUMENTS.find(inst => inst.id === selectedInstrument)?.name || 'Piano';
      if (currentTrackId && !currentTrack?.nametypeLocked) {
        dispatch(updateTrack({ id: currentTrackId, updates: { nametype: instrumentName } }));
      }
    }, [selectedInstrument, currentTrack?.nametypeLocked, dispatch]);

  useEffect(() => {
    if (getActiveTabs) {
      setActiveTab(getActiveTabs);
    }
  }, [getActiveTabs]);

  const pianoNotesRef = useRef([]);
  useEffect(() => { pianoNotesRef.current = existingPianoNotes || []; }, [existingPianoNotes]);

  const createImpulseResponse = (audioContext, duration, decay, reverse = false) => {
    const length = audioContext.sampleRate * duration;
    const impulse = audioContext.createBuffer(2, length, audioContext.sampleRate);
    const left = impulse.getChannelData(0);
    const right = impulse.getChannelData(1);

    for (let i = 0; i < length; i++) {
      const n = reverse ? length - i : i;
      left[i] = (Math.random() * 2 - 1) * Math.pow(1 - n / length, decay);
      right[i] = (Math.random() * 2 - 1) * Math.pow(1 - n / length, decay);
    }
    return impulse;
  };

  useEffect(() => {
    if (getIsRecording) {
      recordAnchorRef.current = { systemMs: Date.now(), playheadSec: studioCurrentTime };
      // Capture the instrument at recording start so the whole take uses one instrument
      recordingInstrumentRef.current = selectedInstrument;
      hendleRecord();
    } else {
      hendleStopRecord();
      recordingInstrumentRef.current = null;
    }
  }, [getIsRecording, studioCurrentTime]);

  const getRecordingTime = () => {
    if (getIsRecording && recordAnchorRef.current.systemMs) {
      const elapsed = (Date.now() - recordAnchorRef.current.systemMs) / 1000;
      return recordAnchorRef.current.playheadSec + Math.max(0, elapsed);
    }
    return studioCurrentTime;
  };

  useEffect(() => {
    if (gainNodeRef.current) {
      const volumeValue = (volume + 135) / 270;
      gainNodeRef.current.gain.value = volumeValue;
    }
  }, [volume]);

  useEffect(() => {
    if (audioContextRef.current) {
      const reverbValue = (reverb + 135) / 270;
    }
  }, [reverb]);

  useEffect(() => {
    if (audioContextRef.current) {
      const panValue = (pan + 135) / 270 * 2 - 1;
    }
  }, [pan]);

  const firstNote = MidiNumbers.fromNote('C0');
  const lastNote = MidiNumbers.fromNote('C5');

  const getKeyboardShortcutsForSection = (sectionIndex) => {
    const section = pianoSections[sectionIndex];
    return KeyboardShortcuts.create({
      firstNote: section.first,
      lastNote: section.last,
      keyboardConfig: [
        { natural: 'z', flat: 's', sharp: 's' },
        { natural: 'x', flat: 'd', sharp: 'd' },
        { natural: 'c', flat: 'f', sharp: 'f' },
        { natural: 'v', flat: 'g', sharp: 'g' },
        { natural: 'b', flat: 'h', sharp: 'h' },
        { natural: 'n', flat: 'j', sharp: 'j' },
        { natural: 'm', flat: 'k', sharp: 'k' },
        { natural: ',', flat: 'l', sharp: 'l' },
        { natural: '.', flat: ';', sharp: ';' },

        { natural: 'q', flat: '1', sharp: '1' },
        { natural: 'w', flat: '2', sharp: '2' },
        { natural: 'e', flat: '3', sharp: '3' },
        { natural: 'r', flat: '4', sharp: '4' },
        { natural: 't', flat: '5', sharp: '5' },
        { natural: 'y', flat: '6', sharp: '6' },
        { natural: 'u', flat: '7', sharp: '7' },

        { natural: 'i', flat: '8', sharp: '8' },
        { natural: 'o', flat: '9', sharp: '9' },
        { natural: 'p', flat: '0', sharp: '0' },
      ],
    });
  };

  const pianoSections = [
    { first: MidiNumbers.fromNote('C0'), last: MidiNumbers.fromNote('B2') },
    { first: MidiNumbers.fromNote('C3'), last: MidiNumbers.fromNote('B5') },
    { first: MidiNumbers.fromNote('C5'), last: MidiNumbers.fromNote('C8') }
  ];

  const [recordedNotes, setRecordedNotes] = useState([]);

  const audioContextRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);
  const destinationRef = useRef(null);
  const gainNodeRef = useRef(null);

  useEffect(() => {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const destination = audioContext.createMediaStreamDestination();
    const gainNode = audioContext.createGain();
    const panNode = audioContext.createStereoPanner();
    const dryGainNode = audioContext.createGain();
    const reverbGainNode = audioContext.createGain();
    const convolverNode = audioContext.createConvolver();

    const impulseResponse = createImpulseResponse(audioContext, 2.5, 2);
    convolverNode.buffer = impulseResponse;

    gainNode.connect(dryGainNode);
    gainNode.connect(reverbGainNode);
    reverbGainNode.connect(convolverNode);

    dryGainNode.connect(panNode);
    convolverNode.connect(panNode);

    panNode.connect(audioContext.destination);
    panNode.connect(destination);

    audioContextRef.current = audioContext;
    destinationRef.current = destination;
    gainNodeRef.current = gainNode;
    panNodeRef.current = panNode;
    reverbGainNodeRef.current = reverbGainNode;
    dryGainNodeRef.current = dryGainNode;
    convolverNodeRef.current = convolverNode;

    Soundfont.instrument(audioContext, selectedInstrument, {
      destination: gainNode,
    }).then((piano) => {
      pianoRef.current = piano;
      // console.log("Piano instrument loaded successfully");
    }).catch((error) => {
      console.error("Error loading piano instrument:", error);
    });

    return () => {
      audioContext && audioContext.close();
    };
  }, [selectedInstrument]);

  useEffect(() => {
    if (reverbGainNodeRef.current && dryGainNodeRef.current && convolverNodeRef.current && audioContextRef.current) {
      const reverbAmount = (reverb + 135) / 270;

      const wetLevel = reverbAmount * 0.6;
      reverbGainNodeRef.current.gain.setValueAtTime(wetLevel, audioContextRef.current.currentTime);

      const dryLevel = Math.max(0.3, 1 - (reverbAmount * 0.4));
      dryGainNodeRef.current.gain.setValueAtTime(dryLevel, audioContextRef.current.currentTime);

      if (reverbAmount > 0.1) {
        const roomSize = 1 + (reverbAmount * 3);
        const decay = 1.5 + (reverbAmount * 2);

        const newImpulse = createImpulseResponse(audioContextRef.current, roomSize, decay);
        convolverNodeRef.current.buffer = newImpulse;
      }

      // console.log(`Reverb: ${reverb} -> Wet: ${wetLevel.toFixed(2)}, Dry: ${dryLevel.toFixed(2)}`);
    }
  }, [reverb]);

  useEffect(() => {
    if (panNodeRef.current) {
      const panValue = pan / 135;
      const clampedPanValue = Math.max(-1, Math.min(1, panValue));
      panNodeRef.current.pan.value = clampedPanValue;
      // console.log(`Pan value: ${pan} -> Stereo pan: ${clampedPanValue}`);
    }
  }, [pan]);



  const playNote = (midiNumber) => {
    // Many soundfonts don't support notes below A0 (MIDI 21).
    // Clamp to a safe, supported range for playback so low-octave keys still work.
    const effectiveMidi = Math.max(21, midiNumber);
    const noteName = Tone.Frequency(effectiveMidi, "midi").toNote();
    const currentTime = getRecordingTime();

    // Ensure audio context is resumed (required for audio to work)
    if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }

    // Only push notes to timeline state when recording is active
    if (getIsRecording) {
      const newEvent = {
        note: noteName,
        startTime: currentTime,
        duration: 0.05,
        midiNumber: effectiveMidi,
        trackId: currentTrackId || null,
        instrumentId: recordingInstrumentRef.current || selectedInstrument,
        id: `${midiNumber}-${Date.now()}-${Math.random()}`
      };
      const updated = [...(pianoNotesRef.current || []), newEvent];
      dispatch(setPianoNotes(updated));


      const notesForThisTrack = (updated || []).filter(n => n.trackId === (currentTrackId || null));
      if (notesForThisTrack.length > 0) {
        const minStart = Math.min(...notesForThisTrack.map(n => n.startTime));
        const maxEnd = Math.max(...notesForThisTrack.map(n => n.startTime + (n.duration || 0.05)));
        const trackColor = (tracks.find(t => t.id === currentTrackId)?.color);
        dispatch(setPianoRecordingClip({
          start: minStart,
          end: maxEnd,
          color: trackColor,
          trackId: currentTrackId || null,
          type: 'piano',
          name: `Piano Recording (${notesForThisTrack.length} notes)`,
          duration: maxEnd - minStart,
          startTime: minStart,
          trimStart: 0,
          trimEnd: maxEnd - minStart,
          id: `piano_recording_${Date.now()}`,
          pianoData: notesForThisTrack
        }));
      }
      pianoNotesRef.current = updated;
    }

    setRecordedNotes((prevNotes) => [
      ...prevNotes,
      { midiNumber, time: Date.now(), type: 'play' },
    ]);
    if (pianoRef.current) {
      const audioNode = pianoRef.current.play(effectiveMidi);
      activeAudioNodes.current[midiNumber] = audioNode;
    }
  };

  const stopNote = (midiNumber) => {
    setRecordedNotes((prevNotes) => [
      ...prevNotes,
      { midiNumber, time: Date.now(), type: 'stop' },
    ]);
    if (activeAudioNodes.current[midiNumber]) {
      activeAudioNodes.current[midiNumber].stop();
      delete activeAudioNodes.current[midiNumber];
    }
  };

  const nextInstrument = () => {
    const newIndex = currentInstrumentIndex === INSTRUMENTS.length - 1 ? 0 : currentInstrumentIndex + 1;
    setCurrentInstrumentIndex(newIndex);
    // Dispatch the selected instrument to Redux so PianoRolls can sync
    const newInstrument = INSTRUMENTS[newIndex].id;
    dispatch(setSelectedInstrument(newInstrument));
  };

  const prevInstrument = () => {
    const newIndex = currentInstrumentIndex === 0 ? INSTRUMENTS.length - 1 : currentInstrumentIndex - 1;
    setCurrentInstrumentIndex(newIndex);
    // Dispatch the selected instrument to Redux so PianoRolls can sync
    const newInstrument = INSTRUMENTS[newIndex].id;
    dispatch(setSelectedInstrument(newInstrument));
  };

  useEffect(() => {
    if (getIsRecording) return;
    if (!Array.isArray(existingPianoNotes) || existingPianoNotes.length === 0) return;

    const needsUpdate = existingPianoNotes.some(
      (n) => (n.trackId === (currentTrackId || null)) && n.instrumentId !== selectedInstrument
    );
    if (!needsUpdate) return;

    const updated = existingPianoNotes.map((n) =>
      n.trackId === (currentTrackId || null) ? { ...n, instrumentId: selectedInstrument } : n
    );
    dispatch(setPianoNotes(updated));
  }, [selectedInstrument, existingPianoNotes, currentTrackId, getIsRecording, dispatch]);


  const toggleButton = (section, index) => {
    setSelectedButtons(prev => ({
      ...prev,
      [section]: prev[section] === index ? null : index
    }));
  };

  const isButtonSelected = (section, index) => {
    return selectedButtons[section] === index;
  };

  const [isRecording, setIsRecording] = useState(false);

  const hendleRecord = () => {
    const stream = destinationRef.current?.stream;
    if (!stream) {
      console.error("No audio stream available for recording");
      return;
    }

    if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }

    recordedChunksRef.current = [];
    const mediaRecorder = new MediaRecorder(stream, {
      mimeType: 'audio/webm;codecs=opus'
    });
    mediaRecorderRef.current = mediaRecorder;

    mediaRecorder.onstop = () => {
      const blob = new Blob(recordedChunksRef.current, { type: 'audio/webm' });
      dispatch(setRecordingAudio(blob));
    };

    mediaRecorder.onerror = (event) => {
      console.error("MediaRecorder error:", event);
    };

    mediaRecorder.start(1000);
    setIsRecording(true);
  };

  const hendleStopRecord = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      // console.log("Recording stopped");
    } else {
      // console.log("No active recording to stop");
    }
    setIsRecording(false);
  };


  // ****************** Chords *****************

  const highlightedPianoKeys = useSelector((state) => selectStudioState(state).highlightedPianoKeys || []);

  const debugPlayNote = (midiNumber) => {
    playNote(midiNumber);
  };

  const debugStopNote = (midiNumber) => {
    stopNote(midiNumber);
  };

  const SimplePiano = ({ noteRange, playNote, stopNote, keyboardShortcuts, sectionIndex }) => {
    const pianoRef = useRef(null);
    const isMouseDown = useRef(false);
    const lastPlayedNote = useRef(null);
    const mouseMoveHandler = useRef(null);

    const highlightKeys = () => {
      if (!pianoRef.current || highlightedPianoKeys.length === 0) return;

      const allKeys = pianoRef.current.querySelectorAll('.ReactPiano__Key--natural, .ReactPiano__Key--accidental');
      allKeys.forEach(key => key.classList.remove('highlighted'));

      let highlightedCount = 0;
      highlightedPianoKeys.forEach(midiNumber => {
        if (midiNumber >= noteRange.first && midiNumber <= noteRange.last) {
          const keyIndex = midiNumber - noteRange.first;
          const keyElement = allKeys[keyIndex];
          if (keyElement) {
            keyElement.classList.add('highlighted');
            highlightedCount++;
          }
        }
      });
    };

    // Function to get MIDI number from mouse position
    const getMidiNumberFromPosition = (clientX) => {
      if (!pianoRef.current) return null;

      const rect = pianoRef.current.getBoundingClientRect();
      const relativeX = clientX - rect.left;
      const pianoWidth = rect.width;

      // Calculate which key the mouse is over based on position
      const keyWidth = pianoWidth / (noteRange.last - noteRange.first + 1);
      const keyIndex = Math.floor(relativeX / keyWidth);
      const midiNumber = noteRange.first + keyIndex;

      // Ensure the MIDI number is within the valid range
      if (midiNumber >= noteRange.first && midiNumber <= noteRange.last) {
        return midiNumber;
      }
      return null;
    };

    // Function to handle mouse movement for continuous play
    const handleMouseMove = (e) => {
      if (!isMouseDown.current) return;

      const midiNumber = getMidiNumberFromPosition(e.clientX);
      if (midiNumber && midiNumber !== lastPlayedNote.current) {
        // Stop the previous note if it's different
        if (lastPlayedNote.current !== null) {
          stopNote(lastPlayedNote.current);
        }

        // Play the new note
        playNote(midiNumber);
        lastPlayedNote.current = midiNumber;
      }
    };

    // Debounced mouse move handler to prevent too many rapid note changes
    const debouncedMouseMove = useRef(null);
    const handleMouseMoveDebounced = (e) => {
      if (debouncedMouseMove.current) {
        clearTimeout(debouncedMouseMove.current);
      }
      debouncedMouseMove.current = setTimeout(() => {
        handleMouseMove(e);
      }, 10); // 10ms delay for smooth transitions
    };

    // Function to handle mouse down with smooth detection
    const handleMouseDown = (e) => {
      e.preventDefault(); // Prevent text selection
      isMouseDown.current = true;
      const midiNumber = getMidiNumberFromPosition(e.clientX);
      if (midiNumber) {
        playNote(midiNumber);
        lastPlayedNote.current = midiNumber;
      }

      // Add mouse move listener for continuous play
      if (!mouseMoveHandler.current) {
        mouseMoveHandler.current = handleMouseMoveDebounced;
        document.addEventListener('mousemove', mouseMoveHandler.current);
      }
    };

    // Function to handle mouse up
    const handleMouseUp = () => {
      isMouseDown.current = false;
      if (lastPlayedNote.current !== null) {
        stopNote(lastPlayedNote.current);
        lastPlayedNote.current = null;
      }

      // Remove mouse move listener
      if (mouseMoveHandler.current) {
        document.removeEventListener('mousemove', mouseMoveHandler.current);
        mouseMoveHandler.current = null;
      }
    };

    // Function to handle mouse leave
    const handleMouseLeave = () => {
      if (isMouseDown.current) {
        handleMouseUp();
      }
    };

    // Touch event handlers for mobile support
    const handleTouchStart = (e) => {
      e.preventDefault();
      if (e.touches.length > 0) {
        const touch = e.touches[0];
        isMouseDown.current = true;
        const midiNumber = getMidiNumberFromPosition(touch.clientX);
        if (midiNumber) {
          playNote(midiNumber);
          lastPlayedNote.current = midiNumber;
        }
      }
    };

    const handleTouchMove = (e) => {
      e.preventDefault();
      if (isMouseDown.current && e.touches.length > 0) {
        const touch = e.touches[0];
        const midiNumber = getMidiNumberFromPosition(touch.clientX);
        if (midiNumber && midiNumber !== lastPlayedNote.current) {
          if (lastPlayedNote.current !== null) {
            stopNote(lastPlayedNote.current);
          }
          playNote(midiNumber);
          lastPlayedNote.current = midiNumber;
        }
      }
    };

    const handleTouchEnd = () => {
      handleMouseUp();
    };

    // Global mouse up handler to catch mouse release outside piano
    useEffect(() => {
      const handleGlobalMouseUp = () => {
        if (isMouseDown.current) {
          handleMouseUp();
        }
      };

      document.addEventListener('mouseup', handleGlobalMouseUp);
      return () => {
        document.removeEventListener('mouseup', handleGlobalMouseUp);
      };
    }, []);

    useEffect(() => {
      const timer = setTimeout(highlightKeys, 100);
      return () => clearTimeout(timer);
    }, [highlightedPianoKeys, noteRange]);

    // Cleanup mouse event listeners on unmount
    useEffect(() => {
      return () => {
        if (mouseMoveHandler.current) {
          document.removeEventListener('mousemove', mouseMoveHandler.current);
        }
        if (debouncedMouseMove.current) {
          clearTimeout(debouncedMouseMove.current);
        }
      };
    }, []);

    const handleLocalWheel = (e) => {
      e.preventDefault();
      e.stopPropagation();
    };

    useEffect(() => {
      const el = pianoRef.current;
      if (!el) return;
      const blockWheel = (e) => {
        e.preventDefault();
        e.stopPropagation();
      };
      el.addEventListener('wheel', blockWheel, { passive: false, capture: true });
      return () => {
        el.removeEventListener('wheel', blockWheel, { capture: true });
      };
    }, []);

    const musicalTypingEnabled = useSelector((state) => state.ui?.musicalTypingEnabled !== false);

    return (
      <div
        className="relative h-[93%] overscroll-none"
        ref={pianoRef}
        onWheel={handleLocalWheel}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{ userSelect: 'none', touchAction: 'none' }}
      >
        <Piano noteRange={noteRange} playNote={playNote} stopNote={stopNote} keyboardShortcuts={keyboardShortcuts} />
        {!musicalTypingEnabled && (
          <style jsx>{`
            .ReactPiano__NoteLabel--natural,
            .ReactPiano__NoteLabel--accidental {
              display: none !important;
            }
          `}</style>
        )}
        <style jsx>{`
                    .ReactPiano__Keyboard{
                      background-color: #c7c7c7;
                    }

                    .ReactPiano__Key--natural,
                    .ReactPiano__Key--accidental {
                        transition: all 0.3s ease;
                    }

                    .ReactPiano__Key--natural:hover {
                        background-color: #cececf !important;
                    }
                    
                    .ReactPiano__Key--natural.highlighted {
                        border-bottom: 7px solid #36075f !important;
                    }

                    .ReactPiano__Key--accidental.highlighted {
                        border-bottom: 7px solid #8b5cf6 !important;
                    }
                    
                    /* Visual feedback for active playing */
                    .ReactPiano__Key--natural:active,
                    .ReactPiano__Key--accidental:active {
                        transform: scale(0.98);
                        transition: transform 0.1s ease;
                    }
                `}</style>
      </div>
    );
  };

  // ****************** Chords *****************
  const [isAudioReady, setIsAudioReady] = useState(false);
  const [isAudioStarted, setIsAudioStarted] = useState(false);
  const [activeChord, setActiveChord] = useState(null);
  const [activePatternKey, setActivePatternKey] = useState("basic-0");
  const [loadingStatus, setLoadingStatus] = useState("Initializing...");
  const [activeChords, setActiveChords] = useState(-1);
  const [pressedKeys, setPressedKeys] = useState(new Set());
  const [chordType, setChordType] = useState("Basic");
  const [toggle, setToggle] = useState(false);
  const [pricingModalOpen, setPricingModalOpen] = useState(false);

  const [isProcessingDrop, setIsProcessingDrop] = useState(false);
  const [effectsSearchTerm, setEffectsSearchTerm] = useState('');
  const [selectedEffectCategory, setSelectedEffectCategory] = useState(null);


  const { activeEffects, showEffectsLibrary, effectsLibrary, showEffectsOffcanvas, showEffectsTwo } = useSelector((state) => state.effects);

  const getTrackType = useSelector((state) => state.studio.newtrackType);
  // console.log(getTrackType);

  // === REFS FOR TONE.JS OBJECTS ===
  const synths = useRef(null);
  const effects = useRef(null);

  const keyImage = [
    { image: Am },
    { image: Bdmi },
    { image: C },
    { image: Dm },
    { image: E },
    { image: F },
    { image: G },
    { image: Am7 }
  ];

  // === COMPLETE CHORD DEFINITIONS ===
  const chordSets = {
    Basic: {
      Am: ["A3", "C4", "E4"],
      Bdim: ["B3", "D4", "F4"],
      C: ["C3", "E3", "G3", "C4"],
      Dm: ["D3", "F3", "A3", "D4"],
      E: ["E3", "G#3", "B3", "E4"],
      F: ["F3", "A3", "C4", "F4"],
      G: ["G3", "B3", "D4", "G4"],
      Am7: ["A3", "C4", "E4", "G4"],
    },

    EDM: {
      "G/C": ["C3", "G3", "B3", "D4"],
      Dm7: ["D3", "F3", "A3", "C4"],
      "Cmaj9/E": ["E3", "C4", "E4", "G4", "D5"],
      "C/F": ["F3", "C4", "E4", "G4"],
      "G(add11)": ["G3", "B3", "C4", "D4", "G4"],
      "Am7(add11)": ["A3", "C4", "D4", "E4", "G4"],
      "C(add9)": ["C3", "E3", "G3", "D4"],
      "G#dim": ["G#3", "B3", "D4", "F4"],
    },

    "Hip Hop": {
      Cmaj7: ["C3", "E3", "G3", "B3"],
      Dm7: ["D3", "F3", "A3", "C4"],
      Em7: ["E3", "G3", "B3", "D4"],
      Emaj7: ["E3", "G#3", "B3", "D#4"],
      "F/G": ["G3", "F4", "A4", "C5"],
      Am7: ["A3", "C4", "E4", "G4"],
      Gm7: ["G3", "Bb3", "D4", "F4"],
      C7: ["C3", "E3", "G3", "Bb3"],
    }
  };

  // === KEYBOARD MAPPINGS FOR ALL CHORD TYPES ===
  const keyboardMappings = {
    Basic: {
      'q': 'Am', 'Q': 'Am',
      'w': 'Bdim', 'W': 'Bdim',
      'e': 'C', 'E': 'C',
      'r': 'Dm', 'R': 'Dm',
      'a': 'E', 'A': 'E',
      's': 'F', 'S': 'F',
      'd': 'G', 'D': 'G',
      'f': 'Am7', 'F': 'Am7'
    },

    EDM: {
      'q': 'G/C', 'Q': 'G/C',
      'w': 'Dm7', 'W': 'Dm7',
      'e': 'Cmaj9/E', 'E': 'Cmaj9/E',
      'r': 'C/F', 'R': 'C/F',
      'a': 'G(add11)', 'A': 'G(add11)',
      's': 'Am7(add11)', 'S': 'Am7(add11)',
      'd': 'C(add9)', 'D': 'C(add9)',
      'f': 'G#dim', 'F': 'G#dim'
    },

    "Hip Hop": {
      'q': 'Cmaj7', 'Q': 'Cmaj7',
      'w': 'Dm7', 'W': 'Dm7',
      'e': 'Em7', 'E': 'Em7',
      'r': 'Emaj7', 'R': 'Emaj7',
      'a': 'F/G', 'A': 'F/G',
      's': 'Am7', 'S': 'Am7',
      'd': 'Gm7', 'D': 'Gm7',
      'f': 'C7', 'F': 'C7'
    }
  };

  // === PATTERN CATEGORIES ===
  const patternCategories = {
    basic: [
      { name: "Full Chord", synthType: "fullChord" },
      { name: "On One", synthType: "onOne" },
    ],
    stabs: [
      { name: "On Air", synthType: "onAir" },
      { name: "Eight's", synthType: "eights" },
      { name: "Soul Stabs", synthType: "soulStabs" },
      { name: "One and Three", synthType: "delayedStab" },
      { name: "Simple Stabs", synthType: "simpleStabs" },
      { name: "Latinesque", synthType: "latinesque" },
      { name: "All Four", synthType: "layeredStab" },
      { name: "Moderate Stabs", synthType: "moderateStabs" },
    ],
    arpeggiated: [
      { name: "Layout", synthType: "layout" },
      { name: "Storytime", synthType: "storytime" },
      { name: "Rising Arp", synthType: "risingArp" },
      { name: "Dreamer", synthType: "dreamer" },
      { name: "Moving Arp", synthType: "movingArp" },
      { name: "Quick Arp", synthType: "quickArp" },
      { name: "Simple Stride", synthType: "simpleStride" },
      { name: "Simple Rain", synthType: "simpleRain" },
    ],
    other: [
      { name: "Simple Slide", synthType: "simpleSlide" },
      { name: "Simple Player", synthType: "simplePlayer" },
      { name: "Alternating Stride", synthType: "alternatingStride" },
    ],
  };

  // === HELPER FUNCTIONS ===
  const getCurrentChordNotes = () => {
    return chordSets[chordType] || chordSets.Basic;
  };

  const getCurrentKeyboardMap = () => {
    return keyboardMappings[chordType] || keyboardMappings.Basic;
  };

  const getKeyboardKey = (chordName) => {
    const currentKeyboardMap = getCurrentKeyboardMap();
    const keyEntry = Object.entries(currentKeyboardMap).find(([key, chord]) => chord === chordName);
    return keyEntry ? keyEntry[0].toUpperCase() : '';
  };

  const getCurrentSynthType = () => {
    if (!activePatternKey) return "fullChord";
    const [category, indexStr] = activePatternKey.split("-");
    const pattern = patternCategories[category]?.[parseInt(indexStr, 10)];
    return pattern?.synthType || "fullChord";
  };

  // === CHORD TYPE CHANGE HANDLER ===
  const handleChordTypeChange = (newChordType) => {
    setChordType(newChordType);
    setActiveChord(null);
    setActiveChords(-1);
    setPressedKeys(new Set());
    setToggle(false);
    console.log(`🎵 Switched to ${newChordType} chord set`);
  };

  // === AUDIO INITIALIZATION ===
  useEffect(() => {
    const initializeAudio = async () => {
      try {
        setLoadingStatus("Creating audio destination...");

        // Set master volume
        Tone.Destination.volume.value = -3;

        setLoadingStatus("Creating effects chain...");

        // Enhanced effects chain for professional sound
        const mainGain = new Tone.Gain(0.8).toDestination();

        const compressor = new Tone.Compressor({
          threshold: -12,
          ratio: 3,
          attack: 0.003,
          release: 0.1
        }).connect(mainGain);

        const reverb = new Tone.Reverb({
          decay: 2.0,
          wet: 0.25
        }).connect(mainGain);

        const delay = new Tone.FeedbackDelay({
          delayTime: "8n",
          feedback: 0.18,
          wet: 0.12
        }).connect(mainGain);

        // Additional chorus effect for warmth
        const chorus = new Tone.Chorus({
          frequency: 0.5,
          delayTime: 3.5,
          depth: 0.7,
          wet: 0.15
        }).connect(mainGain);

        effects.current = {
          mainGain,
          compressor,
          reverb,
          delay,
          chorus
        };

        setLoadingStatus("Creating professional synthesizers...");

        // === PROFESSIONAL SYNTH COLLECTION ===

        // 1. Acoustic Piano
        const acousticPiano = new Tone.PolySynth(Tone.Synth, {
          oscillator: {
            type: "triangle",
            harmonicity: 1.2
          },
          envelope: {
            attack: 0.02,
            decay: 0.4,
            sustain: 0.6,
            release: 1.8
          },
          volume: -6
        }).connect(compressor);

        // 2. Electric Piano
        const electricPiano = new Tone.PolySynth(Tone.FMSynth, {
          harmonicity: 1.3,
          modulationIndex: 3.5,
          oscillator: { type: "sine" },
          envelope: {
            attack: 0.005,
            decay: 0.6,
            sustain: 0.4,
            release: 1.2
          },
          modulation: { type: "square" },
          modulationEnvelope: {
            attack: 0.01,
            decay: 0.3,
            sustain: 0.12,
            release: 0.8
          },
          volume: -4
        }).connect(chorus);

        // 3. Bright Stab
        const brightStab = new Tone.PolySynth(Tone.Synth, {
          oscillator: {
            type: "sawtooth",
          },
          envelope: {
            attack: 0.001,
            decay: 0.25,
            sustain: 0.08,
            release: 0.4
          },
          volume: -8
        }).connect(compressor);

        // 4. Soul Stab
        const soulStab = new Tone.PolySynth(Tone.AMSynth, {
          harmonicity: 2.0,
          oscillator: { type: "sine" },
          envelope: {
            attack: 0.005,
            decay: 0.25,
            sustain: 0.3,
            release: 0.6
          },
          modulation: { type: "sine" },
          modulationEnvelope: {
            attack: 0.01,
            decay: 0.2,
            sustain: 0.2,
            release: 0.5
          },
          volume: -5
        }).connect(compressor);

        // 5. Pluck Synth
        const pluckSynth = new Tone.PolySynth(Tone.Synth, {
          oscillator: { type: "triangle" },
          envelope: {
            attack: 0.001,
            decay: 0.12,
            sustain: 0.02,
            release: 0.25
          },
          volume: -6
        }).connect(delay);

        // 6. Sharp Stab
        const sharpStab = new Tone.PolySynth(Tone.Synth, {
          oscillator: { type: "square" },
          envelope: {
            attack: 0.001,
            decay: 0.18,
            sustain: 0.05,
            release: 0.3
          },
          volume: -9
        }).connect(compressor);

        // 7. Latin Synth
        const latinSynth = new Tone.PolySynth(Tone.FMSynth, {
          harmonicity: 2.8,
          modulationIndex: 8,
          oscillator: { type: "sine" },
          envelope: {
            attack: 0.003,
            decay: 0.2,
            sustain: 0.2,
            release: 0.4
          },
          modulation: { type: "sawtooth" },
          modulationEnvelope: {
            attack: 0.005,
            decay: 0.15,
            sustain: 0.1,
            release: 0.3
          },
          volume: -6
        }).connect(delay);

        // 8. Moderate Stab
        const moderateStab = new Tone.PolySynth(Tone.Synth, {
          oscillator: {
            type: "sawtooth"
          },
          envelope: {
            attack: 0.01,
            decay: 0.3,
            sustain: 0.2,
            release: 0.5
          },
          volume: -7
        }).connect(compressor);

        // 9. Bell Synth
        const bellSynth = new Tone.PolySynth(Tone.FMSynth, {
          harmonicity: 3.2,
          modulationIndex: 12,
          oscillator: { type: "sine" },
          envelope: {
            attack: 0.01,
            decay: 0.8,
            sustain: 0.1,
            release: 1.5
          },
          modulation: { type: "sine" },
          modulationEnvelope: {
            attack: 0.01,
            decay: 0.4,
            sustain: 0.05,
            release: 1.0
          },
          volume: -7
        }).connect(reverb);

        // 10. Crystal Synth
        const crystalSynth = new Tone.PolySynth(Tone.FMSynth, {
          harmonicity: 2.5,
          modulationIndex: 6,
          oscillator: { type: "sine" },
          envelope: {
            attack: 0.01,
            decay: 0.3,
            sustain: 0.6,
            release: 0.8
          },
          modulation: { type: "triangle" },
          modulationEnvelope: {
            attack: 0.01,
            decay: 0.2,
            sustain: 0.4,
            release: 0.6
          },
          volume: -4
        }).connect(delay);

        // 11. Dreamy Pad
        const dreamyPad = new Tone.PolySynth(Tone.AMSynth, {
          harmonicity: 2.2,
          oscillator: { type: "sine" },
          envelope: {
            attack: 0.1,
            decay: 0.4,
            sustain: 0.7,
            release: 1.5
          },
          modulation: { type: "sine" },
          modulationEnvelope: {
            attack: 0.05,
            decay: 0.3,
            sustain: 0.4,
            release: 0.8
          },
          volume: -8
        }).connect(reverb);

        // 12. String Pad
        const stringPad = new Tone.PolySynth(Tone.Synth, {
          oscillator: {
            type: "sawtooth"
          },
          envelope: {
            attack: 0.05,
            decay: 0.3,
            sustain: 0.8,
            release: 1.0
          },
          volume: -6
        }).connect(reverb);

        // 13. Moving Arp
        const movingArp = new Tone.PolySynth(Tone.Synth, {
          oscillator: { type: "triangle" },
          envelope: {
            attack: 0.005,
            decay: 0.15,
            sustain: 0.1,
            release: 0.3
          },
          volume: -6
        }).connect(delay);

        // 14. Quick Arp
        const quickArp = new Tone.PolySynth(Tone.FMSynth, {
          harmonicity: 4,
          modulationIndex: 8,
          oscillator: { type: "sine" },
          envelope: {
            attack: 0.001,
            decay: 0.08,
            sustain: 0.05,
            release: 0.2
          },
          modulation: { type: "square" },
          modulationEnvelope: {
            attack: 0.001,
            decay: 0.05,
            sustain: 0.02,
            release: 0.15
          },
          volume: -7
        }).connect(delay);

        // 15. Rain Synth
        const rainSynth = new Tone.PolySynth(Tone.AMSynth, {
          harmonicity: 1.8,
          oscillator: { type: "triangle" },
          envelope: {
            attack: 0.005,
            decay: 0.2,
            sustain: 0.4,
            release: 0.5
          },
          modulation: { type: "sine" },
          modulationEnvelope: {
            attack: 0.01,
            decay: 0.15,
            sustain: 0.3,
            release: 0.4
          },
          volume: -6
        }).connect(reverb);

        // 16. Bass Synth
        const bassSynth = new Tone.MonoSynth({
          oscillator: { type: "sawtooth" },
          envelope: {
            attack: 0.01,
            decay: 0.35,
            sustain: 0.7,
            release: 1.2
          },
          filterEnvelope: {
            attack: 0.02,
            decay: 0.25,
            sustain: 0.4,
            release: 1.0,
            baseFrequency: 180,
            octaves: 5
          },
          volume: -1
        }).connect(compressor);

        // 17. Organ Synth
        const organSynth = new Tone.PolySynth(Tone.Synth, {
          oscillator: { type: "square" },
          envelope: {
            attack: 0.008,
            decay: 0.1,
            sustain: 0.85,
            release: 0.4
          },
          volume: -6
        }).connect(chorus);

        // 18. Slide Synth
        const slideSynth = new Tone.PolySynth(Tone.FMSynth, {
          harmonicity: 1.2,
          modulationIndex: 4,
          oscillator: { type: "triangle" },
          envelope: {
            attack: 0.02,
            decay: 0.25,
            sustain: 0.7,
            release: 0.6
          },
          modulation: { type: "sine" },
          modulationEnvelope: {
            attack: 0.02,
            decay: 0.2,
            sustain: 0.5,
            release: 0.5
          },
          volume: -4
        }).connect(chorus);

        // 19. Delayed Stab
        const delayedStab = new Tone.PolySynth(Tone.FMSynth, {
          harmonicity: 3.5,
          modulationIndex: 20,
          oscillator: { type: "sine" },
          envelope: {
            attack: 0.001,
            decay: 0.15,
            sustain: 0,
            release: 0.2
          },
          modulation: { type: "square" },
          modulationEnvelope: {
            attack: 0.001,
            decay: 0.08,
            sustain: 0,
            release: 0.1
          },
          volume: -6
        }).connect(delay);

        // 20. Layered Stab
        const layeredStab = new Tone.PolySynth(Tone.DuoSynth, {
          voice0: {
            oscillator: { type: "sawtooth" },
            envelope: {
              attack: 0.05,
              decay: 0.3,
              sustain: 0.5,
              release: 1.0
            }
          },
          voice1: {
            oscillator: { type: "sine" },
            detune: -10,
            envelope: {
              attack: 0.08,
              decay: 0.3,
              sustain: 0.5,
              release: 1.2
            }
          },
          harmonicity: 1.0,
          vibratoAmount: 0.15,
          vibratoRate: 3,
          volume: -7
        }).chain(chorus, reverb);

        const simplePlayerSynth = new Tone.PolySynth(Tone.DuoSynth, {
          voice0: {
            oscillator: { type: "sawtooth" },
            envelope: {
              attack: 0.01,
              decay: 0.3,
              sustain: 0.7,
              release: 1.0
            }
          },
          voice1: {
            oscillator: { type: "square" },
            detune: -7,
            envelope: {
              attack: 0.02,
              decay: 0.4,
              sustain: 0.6,
              release: 1.2
            }
          },
          harmonicity: 1.5,
          vibratoAmount: 0.1,
          vibratoRate: 4,
          volume: -3
        }).chain(compressor, reverb);

        synths.current = {
          acousticPiano,
          electricPiano,
          brightStab,
          soulStab,
          pluckSynth,
          delayedStab,
          sharpStab,
          latinSynth,
          layeredStab,
          moderateStab,
          bellSynth,
          crystalSynth,
          dreamyPad,
          stringPad,
          movingArp,
          quickArp,
          rainSynth,
          bassSynth,
          organSynth,
          slideSynth,
          simplePlayerSynth
        };

        // console.log("✅ Created", Object.keys(synths.current).length, "professional synths");

        Tone.Transport.bpm.value = 120;

        setLoadingStatus("Ready!");
        setIsAudioReady(true);

      } catch (error) {
        console.error("❌ Audio initialization error:", error);
        setLoadingStatus("Error loading - using fallback");
        setIsAudioReady(true);
      }
    };

    initializeAudio();

    return () => {
      if (synths.current) {
        Object.values(synths.current).forEach((s) => s?.dispose());
      }
      if (effects.current) {
        Object.values(effects.current).forEach((e) => e?.dispose());
      }
    };
  }, []);

  const startAudioContext = async () => {
    if (Tone.context.state !== "running") {
      await Tone.start();
      setIsAudioStarted(true);
      console.log("🔊 Audio context started");
    }
  };

  const stopAllSounds = () => {
    if (synths.current) {
      Object.values(synths.current).forEach((synth) => {
        try {
          if (synth?.releaseAll) {
            synth.releaseAll();
          }
        } catch (e) {
          console.warn("Error stopping synth:", e);
        }
      });
    }
    setActiveChord(null);
  };

  const handleChordClick = async (chordName) => {
    if (!isAudioReady) return;
    await startAudioContext();
    setActiveChord(chordName);

    stopAllSounds();

    const synthType = getCurrentSynthType();
    const currentChordNotes = getCurrentChordNotes();
    const notes = currentChordNotes[chordName];
    const now = Tone.now();

    const synthMapByChordType = {
      Basic: {
        fullChord: "acousticPiano",
        onOne: "electricPiano",
        onAir: "brightStab",
        eights: "pluckSynth",
        soulStabs: "soulStab",
        delayedStab: "delayedStab",
        simpleStabs: "sharpStab",
        latinesque: "latinSynth",
        layeredStab: "layeredStab",
        moderateStabs: "moderateStab",
        layout: "bellSynth",
        storytime: "crystalSynth",
        risingArp: "dreamyPad",
        dreamer: "stringPad",
        movingArp: "movingArp",
        quickArp: "quickArp",
        simpleStride: "organSynth",
        simpleRain: "rainSynth",
        simpleSlide: "slideSynth",
        simplePlayer: "simplePlayerSynth",
        alternatingStride: "bassSynth",
      },
      EDM: {
        fullChord: "layeredStab",
        onOne: "brightStab",
        onAir: "sharpStab",
        eights: "quickArp",
        soulStabs: "soulStab",
        delayedStab: "delayedStab",
        simpleStabs: "moderateStab",
        latinesque: "latinSynth",
        layeredStab: "layeredStab",
        moderateStabs: "layeredStab",
        layout: "crystalSynth",
        storytime: "bellSynth",
        risingArp: "quickArp",
        dreamer: "dreamyPad",
        movingArp: "movingArp",
        quickArp: "quickArp",
        simpleStride: "bassSynth",
        simpleRain: "crystalSynth",
        simpleSlide: "slideSynth",
        simplePlayer: "simplePlayerSynth",
        alternatingStride: "bassSynth",
      },
      "Hip Hop": {
        fullChord: "electricPiano",
        onOne: "organSynth",
        onAir: "soulStab",
        eights: "pluckSynth",
        soulStabs: "soulStab",
        delayedStab: "delayedStab",
        simpleStabs: "sharpStab",
        latinesque: "latinSynth",
        layeredStab: "layeredStab",
        moderateStabs: "moderateStab",
        layout: "bellSynth",
        storytime: "crystalSynth",
        risingArp: "dreamyPad",
        dreamer: "stringPad",
        movingArp: "movingArp",
        quickArp: "quickArp",
        simpleStride: "organSynth",
        simpleRain: "rainSynth",
        simpleSlide: "slideSynth",
        simplePlayer: "simplePlayerSynth",
        alternatingStride: "bassSynth",
      },
    };

    const synthKey =
      synthMapByChordType[chordType]?.[synthType] ||
      synthMapByChordType.Basic[synthType] ||
      "acousticPiano";
    const selectedSynth = synths.current?.[synthKey];

    console.log(`🎵 Playing ${synthType} -> ${synthKey} with ${chordType} chord: ${chordName}`);

    if (selectedSynth && notes) {
      try {
        if (synthType === "fullChord") {
          selectedSynth.triggerAttackRelease(notes, "1n", now);
        } else if (synthType === "onOne") {
          selectedSynth.triggerAttackRelease(notes, "4n", now);
        } else if (synthType === "onAir") {
          selectedSynth.triggerAttackRelease(notes, "8n", now);
        } else if (synthType === "eights") {
          notes.forEach((note, i) => {
            selectedSynth.triggerAttackRelease(note, "8n", now + i * 0.125);
          });
        } else if (synthType === "soulStabs") {
          notes.forEach((note, i) => {
            selectedSynth.triggerAttackRelease(note, "4n", now + i * 0.05);
          });
        } else if (synthType === "delayedStab") {
          notes.forEach((note, i) => {
            const timing = i % 2 === 0 ? 0 : 0.5;
            selectedSynth.triggerAttackRelease(note, "8n", now + timing);
          });
        } else if (synthType === "simpleStabs") {
          selectedSynth.triggerAttackRelease(notes, "8n", now);
        } else if (synthType === "latinesque") {
          notes.forEach((note, i) => {
            const timing = [0, 0.25, 0.75, 1.0][i % 4];
            selectedSynth.triggerAttackRelease(note, "16n", now + timing);
          });
        } else if (synthType === "layeredStab") {
          notes.forEach((note, i) => {
            const offset = i * 0.02;
            selectedSynth.triggerAttackRelease(note, "1n", now + offset);
          });
        } else if (synthType === "moderateStabs") {
          selectedSynth.triggerAttackRelease(notes, "4n", now);
        } else if (synthType === "layout") {
          notes.forEach((note, i) => {
            selectedSynth.triggerAttackRelease(note, "4n", now + i * 0.2);
          });
        } else if (synthType === "storytime") {
          notes.forEach((note, i) => {
            selectedSynth.triggerAttackRelease(note, "4n", now + i * 0.15);
          });
        } else if (synthType === "risingArp") {
          notes.forEach((note, i) => {
            selectedSynth.triggerAttackRelease(note, "8n", now + i * 0.1);
          });
        } else if (synthType === "dreamer") {
          notes.forEach((note, i) => {
            selectedSynth.triggerAttackRelease(note, "2n", now + i * 0.15);
          });
        } else if (synthType === "movingArp") {
          notes.forEach((note, i) => {
            selectedSynth.triggerAttackRelease(note, "16n", now + i * 0.06);
          });
        } else if (synthType === "quickArp") {
          notes.forEach((note, i) => {
            selectedSynth.triggerAttackRelease(note, "32n", now + i * 0.04);
          });
        } else if (synthType === "simpleStride") {
          notes.forEach((note, i) => {
            const timing = i % 2 === 0 ? 0 : 0.25;
            selectedSynth.triggerAttackRelease(note, "8n", now + timing);
          });
        } else if (synthType === "simpleRain") {
          notes.forEach((note, i) => {
            const delay = i * 0.08 + (Math.random() * 0.03);
            selectedSynth.triggerAttackRelease(note, "8n", now + delay);
          });
        } else if (synthType === "simpleSlide") {
          notes.forEach((note, i) => {
            selectedSynth.triggerAttackRelease(note, "4n", now + i * 0.06);
          });
        } else if (synthType === "simplePlayer") {
          selectedSynth.triggerAttackRelease(notes, "1n", now);
        } else if (synthType === "alternatingStride") {
          notes.forEach((note, i) => {
            selectedSynth.triggerAttackRelease(note, "4n", now + i * 0.12);
          });
        } else {
          selectedSynth.triggerAttackRelease(notes, "2n", now);
        }

        console.log(`✅ Successfully played ${synthKey} with ${synthType} pattern (${chordType})`);

      } catch (error) {
        console.error(`❌ Error playing ${synthKey}:`, error);
        if (synths.current.acousticPiano && synthKey !== "acousticPiano") {
          console.log("🔄 Falling back to acoustic piano");
          synths.current.acousticPiano.triggerAttackRelease(notes, "2n", now);
        }
      }
    } else {
      console.warn(`⚠️ Synth ${synthKey} not available or chord ${chordName} not found`);
      if (synths.current?.acousticPiano) {
        synths.current.acousticPiano.triggerAttackRelease(notes || ["C4", "E4", "G4"], "2n", now);
      }
    }
  };

  const getPatternDisplayName = () => {
    if (!activePatternKey) return null;
    const [category, indexStr] = activePatternKey.split("-");
    return patternCategories[category]?.[parseInt(indexStr, 10)]?.name || null;
  };

  const handlePatternSelect = (key) => {
    setActivePatternKey((prev) => (prev === key ? null : key));
    setActiveChord(null);
  };

  useEffect(() => {
    const handleKeyDown = (event) => {
      const target = event.target;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
        return;
      }
      const currentKeyboardMap = getCurrentKeyboardMap();

      if (currentKeyboardMap[event.key]) {
        event.preventDefault();
      }

      if (pressedKeys.has(event.key)) {
        return;
      }

      const chordName = currentKeyboardMap[event.key];

      if (chordName && isAudioReady) {
        console.log(`🎹 Keyboard pressed: ${event.key} -> ${chordName} (${chordType})`);

        setPressedKeys(prev => new Set([...prev, event.key]));

        const currentChordNotes = getCurrentChordNotes();
        const chordIndex = Object.keys(currentChordNotes).indexOf(chordName);
        if (chordIndex !== -1) {
          setActiveChords(chordIndex);
        }

        handleChordClick(chordName);
      }
    };

    const handleKeyUp = (event) => {
      const target = event.target;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
        return;
      }
      setPressedKeys(prev => {
        const newSet = new Set(prev);
        newSet.delete(event.key);
        return newSet;
      });

      const currentKeyboardMap = getCurrentKeyboardMap();
      if (currentKeyboardMap[event.key]) {
        setTimeout(() => {
          setActiveChords(-1);
          setActiveChord(null);
        }, 100);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isAudioReady, pressedKeys, chordType]);

  const testAllSynths = async () => {
    if (!isAudioReady) return;
    await startAudioContext();

    console.log("🧪 Testing all professional synths...");
    const testNotes = ["C4", "E4", "G4"];

    Object.entries(synths.current).forEach(([name, synth], index) => {
      setTimeout(() => {
        try {
          if (synth && synth.triggerAttackRelease) {
            if (name === "bassSynth") {
              synth.triggerAttackRelease("C3", "4n", Tone.now());
            } else {
              synth.triggerAttackRelease(testNotes, "4n", Tone.now());
            }
            console.log(`✅ ${name} - Professional sound working`);
          } else {
            console.log(`❌ ${name} - Not available`);
          }
        } catch (e) {
          console.log(`❌ ${name} - Error:`, e);
        }
      }, index * 800);
    });
  };



  const handleAddEffectFromLibrary = (effect) => {
    console.log('handleAddEffectFromLibrary called with:', effect);

    if (isProcessingDrop) {
      console.log('Already processing a drop, skipping duplicate');
      return;
    }

    setIsProcessingDrop(true);
    dispatch(addEffect(effect));
    dispatch(setShowEffectsLibrary(false));
    setEffectsSearchTerm('');
    setSelectedEffectCategory(null);

    setTimeout(() => {
      setIsProcessingDrop(false);
    }, 100);
  };

  const handlePlusButtonClick = () => {
    dispatch(toggleEffectsOffcanvas());
  };

  return (
    <>
      {showOffcanvas1 === true && (
        <>
          <div className="fixed z-[10] w-full h-full transition-transform left-0 right-0 translate-y-full bottom-[210px] sm:bottom-[260px] md600:bottom-[275px] md:bottom-[450px] lg:bottom-[455px] xl:bottom-[465px] 2xl:bottom-[516px]" tabIndex="-1" aria-labelledby="drawer-swipe-label">
            <div className="border-b border-gray-300 dark:border-[#FFFFFF1A] h-full">
              <div className="bg-white dark:bg-[#1F1F1F] flex items-center px-1 md600:px-2 md600:pt-2 lg:px-3 lg:pt-3">
                <div>
                  <IoClose className="text-[10px] sm:text-[12px] md600:text-[14px] md:text-[16px] lg:text-[18px] 2xl:text-[20px] text-gray-600 dark:text-[#FFFFFF99] cursor-pointer" onClick={() => {
                    setShowOffcanvas1(false);
                    onClose && onClose();
                  }} />
                </div>
              </div>
              <div className="bg-white dark:bg-[#1F1F1F] flex space-x-2 sm:space-x-3 px-1 md600:space-x-4 md600:px-2 lg:space-x-6 2xl:space-x-8 justify-center lg:px-3">
                {['Instruments', 'Chords', 'Piano Roll', 'Effects']
                  .filter(tab => {
                    // Hide "Chords" if getTrackType is "bass" or "808"
                    if (
                      tab === 'Chords' &&
                      (getTrackType === 'Bass & 808' || getTrackType === 'bass' || getTrackType === '808')
                    ) {
                      return false;
                    }
                    return true;
                  })
                  .map((tab) => (
                    <button key={tab} onClick={() => setActiveTab(tab)}
                    className={`text-[8px] md600:text-[10px] md:text-[12px] lg:text-[14px] 2xl:text-[16px] font-medium transition-colors ${
                      activeTab === tab
                      ? "text-black dark:text-white border-b-2 border-black dark:border-white"
                      : "text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white"
                      }`}>
                      {tab}
                    </button>
                  ))}
              </div>

              <div className=''>
                {activeTab === 'Instruments' && (
                  <>
                    <div className="bg-white dark:bg-[#1F1F1F] flex items-center justify-center pt-1 pb-1 px-2 md600:px-2 md600:pt-2 md600:pb-1 sm:gap-6 md600:gap-12 md:gap-16 lg:pt-4 lg:pb-2 lg:px-3 lg:gap-20 2xl:pt-5 2xl:pb-3 2xl:px-3 2xl:gap-24">
                      <div className="bg-gray-200 dark:bg-[#353535] p-1 md600:p-2 lg:p-3 rounded-lg">
                        <div className="flex items-center justify-between">
                          <button onClick={prevInstrument} className="text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors p-1 md600:p-2">
                            <FaChevronLeft className="text-[8px] md600:text-[10px] md:text-[12px] lg:text-[14px] 2xl:text-[16px]" />
                          </button>

                          <div className="flex items-center gap-1 md600:gap-2 px-1 md600:px-2 md:gap-3 w-[100px] sm:w-[150px] md600:w-[170px] md:w-[172px] lg:gap-4 lg:px-3 lg:w-[230px] 2xl:gap-5 flex-1 justify-center 2xl:px-4 2xl:w-[250px]">
                            <div className="text-black dark:text-white">
                              <GiPianoKeys className="text-[10px] sm:text-[12px] md600:text-[14px] lg:text-[18px] 2xl:text-[20px]" />
                            </div>
                            <div className="">
                              <div className="text-black dark:text-white font-bold text-[10px] sm:text-[12px] md600:text-[14px] lg:text-[18px] 2xl:text-[16px]">
                                {INSTRUMENTS[currentInstrumentIndex].name}
                              </div>
                              <div className="text-gray-600 dark:text-gray-400 text-[8px] sm:text-[10px] md600:text-[12px] lg:text-[14px]">
                                {INSTRUMENTS[currentInstrumentIndex].category}
                              </div>
                            </div>
                          </div>

                          <button onClick={nextInstrument} className="text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors p-1 lg:p-2">
                            <FaChevronRight className="text-[8px] md600:text-[10px] md:text-[12px] lg:text-[14px] 2xl:text-[16px]" />
                          </button>
                        </div>
                      </div>

                      <div className="flex space-x-1 md600:space-x-2 lg:space-x-4 2xl:space-x-6">
                        <div className="flex flex-col items-center">
                          <Knob label="Reverb" min={-135} max={135} defaultAngle={reverb} onChange={(value) => setReverb(value)} />
                        </div>

                        <div className="flex flex-col items-center">
                          <Knob label="Pan" min={-135} max={135} defaultAngle={pan} onChange={(value) => setPan(value)} />
                        </div>

                        <div className="flex flex-col items-center">
                          <Knob label="Volume" min={-135} max={135} defaultAngle={volume} onChange={(value) => setVolume(value)} />
                        </div>
                      </div>
                    </div>

                    <div className="w-full h-[400px] md:h-[500px] lg:h-[250px]">
                      <div className="bg-primary-light dark:bg-primary-dark flex gap-1 md600:gap-2 md:gap-3 pb-1 lg:gap-4 lg:pb-2 2xl:gap-5 items-center justify-between 2xl:pb-3">
                        <div className="flex gap-1 sm:gap-2 md600:gap-3 lg:gap-4 2xl:gap-5 items-center ms-1 md600:ms-2 lg:ms-3">
                          <div className="border rounded-3xl border-secondary-light/10 dark:border-secondary-dark/10">
                            <p className="text-secondary-light/60 dark:text-secondary-dark/60 text-[8px] md600:text-[10px] lg:text-[12px] px-1 sm:px-2 md600:px-3 md:px-4 lg:px-5 2xl:px-6 py-1">Sustain</p>
                          </div>
                          <div className="flex items-center justify-between ">
                            <button onClick={() => setActivePianoSection(prev => Math.max(prev - 1, 0))} disabled={activePianoSection === 0}
                              className={`transition-colors p-1 lg:p-2 ${
                                activePianoSection === 0
                                  ? "text-gray-400 cursor-not-allowed"
                                  : "text-secondary-light dark:text-secondary-dark hover:text-secondary-dark dark:hover:text-secondary-light"
                              }`}
                            >
                              <FaChevronLeft className="text-[8px] md600:text-[10px] md:text-[12px] lg:text-[14px] 2xl:text-[16px]" />
                            </button>

                            <div className="px-1 md600:px-2 lg:px-3 2xl:px-4 w-[50px] md600:w-[60px] lg:w-[80px] 2xl:w-[100px]">
                              <div className="text-secondary-light dark:text-secondary-dark text-center fw-bolder text-[8px] md600:text-[10px] md:text-[12px] lg:text-[14px] 2xl:text-[16px]">Octaves</div>
                            </div>

                            <button onClick={() => setActivePianoSection(prev => Math.min(prev + 1, 2))} disabled={activePianoSection === 2}
                              className={`transition-colors p-1 lg:p-2 ${
                                activePianoSection === 2
                                  ? "text-gray-400 cursor-not-allowed"
                                  : "text-secondary-light dark:text-secondary-dark hover:text-secondary-dark dark:hover:text-secondary-light"
                              }`}
                            >
                              <FaChevronRight className="text-[8px] md600:text-[10px] md:text-[12px] lg:text-[14px] 2xl:text-[16px]" />
                            </button>
                          </div>
                          <div className="border rounded-lg border-secondary-light/10 dark:border-secondary-dark/10 ms-auto me-1 md600:me-2 lg:me-3">
                            <p className="text-secondary-light dark:text-secondary-dark text-[8px] md600:text-[10px] md:text-[12px] lg:text-[14px] px-2 md600:px-3 md:px-4 lg:px-5 2xl:px-6 py-1">Save Preset</p>
                          </div>
                        </div>
                        <div className="border rounded-lg border-secondary-light/10 dark:border-secondary-dark/10 ms-auto me-1 md600:me-2 lg:me-3">
                          <p className="text-secondary-light dark:text-secondary-dark text-[8px] md600:text-[10px] md:text-[12px] lg:text-[14px] px-2 md600:px-3 md:px-4 lg:px-5 2xl:px-6 py-1">Save Preset</p>
                        </div>
                      </div>

                      <div className="flex gap-1 md600:gap-2 lg:gap-3 bg-primary-light dark:bg-primary-dark">
                        {autoChords === true &&
                          <div className="w-[30%] sm:w-[40%] md600:w-[25%] md:w-[30%] lg:w-[20%] xl:w-[18%] bg-primary-light dark:bg-primary-dark md600:ms-2 md600:mt-2 lg:ms-3 lg:mt-3 mb-1">
                            <div className="w-full text-secondary-light dark:text-secondary-dark p-1 md600:p-2 lg:p-3">
                              <div className="flex justify-between items-center">
                                <p className="text-secondary-light dark:text-secondary-dark text-[8px] md600:text-[10px] md:text-[12px] lg:text-[14px] 2xl:text-[16px]">Auto Chord</p>
                                <IoClose className="text-[8px] sm:text-[10px] md600:text-[12px] md:text-[16px] lg:text-[20px] 2xl:text-[24px] text-secondary-light/60 dark:text-secondary-dark/60 cursor-pointer" onClick={() => setAutoChords(false)} />
                              </div>
                              <p className="text-secondary-light/60 dark:text-secondary-dark/60 text-[8px] md:text-[10px] lg:text-[12px] 2xl:text-[14px] truncate">Play full chords with a single key</p>
                              <div className="flex justify-between gap-1 lg:gap-2 pt-1 md600:pt-2 lg:pt-4 2xl:gap-3 2xl:pt-5">
                                <button className="text-secondary-light dark:text-secondary-dark border border-secondary-light/10 dark:border-secondary-dark/10 text-[8px] md600:text-[10px] lg:text-[12px] py-1 px-1 md600:px-2 lg:px-4 2xl:px-5 rounded-md hover:bg-secondary-light/10 dark:hover:bg-secondary-dark/10">Triad</button>
                                <button className="text-secondary-light dark:text-secondary-dark border border-secondary-light/10 dark:border-secondary-dark/10 text-[8px] md600:text-[10px] lg:text-[12px] py-1 px-1 md600:px-2 lg:px-4 2xl:px-5 rounded-md hover:bg-secondary-light/10 dark:hover:bg-secondary-dark/10">7th</button>
                                <button className="text-secondary-light dark:text-secondary-dark border border-secondary-light/10 dark:border-secondary-dark/10 text-[8px] md600:text-[10px] lg:text-[12px] py-1 px-1 md600:px-2 lg:px-4 2xl:px-5 rounded-md hover:bg-secondary-light/10 dark:hover:bg-secondary-dark/10">Add9</button>
                              </div>
                              {/* Range Slider - Added here after the chord buttons */}
                              <div className=" pt-1 md600:pt-2 lg:pt-3">
                                <RangeSlider min={0} max={10} step={0.1} initialValue={0} label="Strum" unit="s" onChange={setStrumValue} />
                              </div>
                            </div>
                          </div>
                        }
                        <div ref={pianoSectionsRef} className="w-full h-[105px] sm:h-[150px] md600:h-[140px] md:h-[290px] lg:h-[250px] overflow-x-hidden pt-1 md600:pt-2 lg:pt-3 overscroll-none ">
                          <div className="w-full h-full">
                            <div className="flex transition-transform duration-300 ease-in-out h-full" style={{ transform: `translateX(-${activePianoSection * 100}%)` }}>
                              {pianoSections.map((section, index) => (
                                <div key={index} className="w-full flex-shrink-0">
                                  <SimplePiano noteRange={{ first: section.first, last: section.last }} playNote={debugPlayNote} stopNote={debugStopNote} keyboardShortcuts={index === activePianoSection ? getKeyboardShortcutsForSection(index) : []} sectionIndex={index} />
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {getTrackType !== "Bass & 808" && activeTab === 'Chords' && (
                  <>
                    <div className="bg-primary-light dark:bg-primary-dark max-h-[180px] sm:max-h-[235px] md600:max-h-[235px] md:max-h-[410px] overflow-auto xl:overflow-hidden">
                      <div className="w-full flex items-center justify-center">
                        <div className="bg-secondary-light/10 dark:bg-secondary-dark/10 items-center mt-1 px-1 py-1 md:mt-2 md:px-2 md:py-2 lg:px-3 rounded-lg">

                          {/* === CHORD TYPE SELECTOR === */}
                          <div className="relative flex gap-1 px-1 md:gap-2 md:px-2 lg:gap-3 items-center lg:px-3 cursor-pointer" onClick={() => setToggle(!toggle)}>
                            <GiPianoKeys className="text-[10px] md600:text-[12px] md:text-[16px] lg:text-[18px] 2xl:text-[20px] text-secondary-light dark:text-secondary-dark" />
                            <p className="text-secondary-light dark:text-secondary-dark text-[10px] md600:text-[12px] md:text-[14px] lg:text-[16px]">{chordType}</p>
                            <HiMiniChevronUpDown className="text-secondary-light/60 dark:text-secondary-dark/60 text-[10px] md600:text-[12px] md:text-[14px] lg:text-[16px]" />

                            {toggle && (
                              <div className="absolute top-[25px] w-[170px] bg-primary-light dark:bg-primary-dark rounded-[5px] z-50">
                                <div>
                                  <p className="text-secondary-light/60 dark:text-secondary-dark/60 text-[14px] px-3 pt-3">Chord set:</p>

                                  {/* Basic Chords */}
                                  <div className="flex mt-3 items-center hover:bg-secondary-light/10 dark:hover:bg-secondary-dark/10 py-1 cursor-pointer" onClick={() => handleChordTypeChange("Basic")}>
                                    {chordType === "Basic" ? (
                                      <div className="text-[15px] ms-3">✓</div>
                                    ) : (
                                      <div className="text-[15px] ms-3 invisible">✓</div>
                                    )}
                                    <div className="ms-3 text-[15px] text-secondary-light dark:text-secondary-dark">Basic</div>
                                  </div>

                                  {/* EDM Chords */}
                                  <div className="flex mt-1 items-center hover:bg-secondary-light/10 dark:hover:bg-secondary-dark/10 py-1 cursor-pointer" onClick={() => handleChordTypeChange("EDM")}>
                                    {chordType === "EDM" ? (
                                      <div className="text-[15px] ms-3">✓</div>
                                    ) : (
                                      <div className="text-[15px] ms-3 invisible">✓</div>
                                    )}
                                    <div className="ms-3 text-[15px] text-secondary-light dark:text-secondary-dark">EDM</div>
                                  </div>

                                  {/* Hip Hop Chords */}
                                  <div className="flex mt-1 items-center hover:bg-secondary-light/10 dark:hover:bg-secondary-dark/10 py-1 cursor-pointer pb-3" onClick={() => handleChordTypeChange("Hip Hop")}>
                                    {chordType === "Hip Hop" ? (
                                      <div className="text-[15px] ms-3">✓</div>
                                    ) : (
                                      <div className="text-[15px] ms-3 invisible">✓</div>
                                    )}
                                    <div className="ms-3 text-[15px] text-secondary-light dark:text-secondary-dark">Hip Hop</div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* === CHORD BUTTONS === */}
                          <div className="grid grid-cols-3 gap-1 md600:gap-1 mx-1 mt-1 md:grid-cols-4 md:gap-3 md:mx-2 md:mt-2 lg:gap-4 lg:mx-3 lg:mt-3">
                            {Object.keys(getCurrentChordNotes()).map((name, index) => {
                              const keyboardKey = getKeyboardKey(name);
                              const isPressed = pressedKeys.has(keyboardKey.toLowerCase()) || pressedKeys.has(keyboardKey);
                              return (
                                <div
                                  key={name}
                                  onClick={() => { handleChordClick(name); setActiveChords(index) }}
                                  disabled={!isAudioReady}
                                  className={`cursor-pointer text-secondary-light dark:text-secondary-dark w-[90px] md600:w-[110px] p-1 md600:px-2 md600:py-2 md:w-[120px] lg:w-[130px] rounded-md border ${
                                    activeChords === index
                                      ? "border-secondary-light dark:border-secondary-dark"
                                      : "border-secondary-light/20 dark:border-secondary-dark/20"
                                  } ${
                                    isPressed
                                      ? "bg-secondary-light/20 dark:bg-secondary-dark/20"
                                      : "bg-primary-light dark:bg-primary-dark hover:bg-secondary-light/10 dark:hover:bg-secondary-dark/10"
                                  } transition-colors`}
                                >
                                  <p className="text-secondary-light dark:text-secondary-dark text-[10px] md600:text-[12px] md:text-[14px] lg:text-[16px] text-center mb-1 font-medium">
                                    {name}
                                  </p>
                                  <div className="flex justify-between items-center">
                                    <img src={keyImage[index]?.image} alt="" className="w-2 h-2 md600:w-3 md600:h-3 lg:w-4 lg:h-4" />
                                    <FaPlus onClick={() => setPricingModalOpen(true)} className="text-[10px] md600:text-[12px] lg:text-[16px] text-secondary-light/60 dark:text-secondary-dark/60" />
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>

                      {/* === PLAYING SOUNDS SECTION === */}
                      <div className="max-w-full md600:w-full flex items-center md600:justify-center my-3 lg:my-0 overflow-auto">
                        <div className="bg-secondary-light/10 dark:bg-secondary-dark/10 items-center mt-1 px-1 md:mt-2 md:px-2 py-1 lg:px-3 lg:py-2 rounded-lg">
                          <div className="flex gap-1 px-1 md:gap-2 md:px-2 lg:gap-3 items-center lg:px-3">
                            <img src={music} alt="" className="w-2 h-2 md600:w-3 md600:h-3 lg:w-4 lg:h-4" />
                            <p className="text-secondary-light dark:text-secondary-dark text-[10px] md600:text-[12px] md:text-[14px] lg:text-[16px]">Playing Sounds</p>
                          </div>

                          <div className="flex">
                            {Object.entries(patternCategories).map(([category, patterns], categoryIndex) => {
                              const isWideCategory = categoryIndex === 1 || categoryIndex === 2;
                              const containerClasses = isWideCategory
                                ? "bg-primary-light dark:bg-primary-dark mx-1 mt-1 p-1 w-[315px] h-[120px] md600:w-[170px] md600:h-[155px] md:mx-2 lg:mx-3 md:mt-2 md:p-2 md:w-[200px] md:h-[180px] lg:w-[340px] lg:h-[150px]"
                                : "bg-primary-light dark:bg-primary-dark ms-1 mt-1 p-1 w-[110px] h-[120px] md600:w-[100px] md600:h-[155px] md:ms-2 md:mt-2 md:p-2 md:w-[110px] md:h-[180px] lg:ms-3 lg:w-[116px] lg:h-[150px]";

                              return (
                                <div key={category} className={containerClasses}>
                                  <p className="text-secondary-light/60 dark:text-secondary-dark/60 text-[10px] md600:text-[12px] md:text-[14px] capitalize">
                                    {category}
                                  </p>
                                  <div className={ isWideCategory ? "grid grid-cols-3 pt-1 md600:grid-cols-2 md:gap-1 lg:grid-cols-3 lg:gap-0 md:pt-1" : "" }>
                                    {patterns.map((item, patternIndex) => {
                                      const key = `${category}-${patternIndex}`;
                                      const isSelected = activePatternKey === key;
                                      return (
                                        <div key={patternIndex}>
                                          <button
                                            onClick={() => handlePatternSelect(key)}
                                            disabled={!isAudioReady}
                                            className={`border justify-center w-[100px] mt-1 h-[25px] lg:w-[100px] lg:h-[30px] md:mt-2 text-[8px] md600:text-[10px] rounded-md transition-colors ${
                                              isSelected
                                                ? "bg-secondary-dark text-primary-dark dark:bg-secondary-light dark:text-primary-light"
                                                : "bg-transparent text-secondary-light dark:text-secondary-dark hover:bg-secondary-light/10 dark:hover:bg-secondary-dark/10 border-secondary-light/10 dark:border-secondary-dark/10"
                                            }`}
                                          >
                                            {item.name}
                                          </button>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>

                      {/* === STATUS AND TEST BUTTONS === */}
                      <div className="text-center py-2">
                        <div className="text-secondary-light/60 dark:text-secondary-dark/60 text-[10px] mb-2">
                          Status: {loadingStatus} | Active: {chordType} | Pattern: {getPatternDisplayName() || "None"}
                        </div>
                        <button onClick={testAllSynths} disabled={!isAudioReady} className="bg-secondary-light/10 dark:bg-secondary-dark/10 text-secondary-light dark:text-secondary-dark px-3 py-1 rounded text-[10px] hover:bg-secondary-light/20 dark:hover:bg-secondary-dark/20 transition-colors">Test All Synths</button>
                      </div>
                    </div>
                  </>
                )}

                {activeTab === 'Piano Roll' && (
                  <PianoRolls />
                )}

                {activeTab === 'Effects' && (
                  <div className={`w-full overflow-x-auto transition-all duration-200 ${
                    isDragOver ? "bg-[#409C9F] bg-opacity-10" : ""
                    }`}
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
                    <div className="flex items-center justify-center p-2 sm:p-4 min-w-max bg-white dark:bg-[#1f1f1f]">
                      <div className="flex gap-2 sm:gap-4 min-w-max">
                        {activeEffects.map((effect) => (
                          <div key={effect.instanceId} className="w-[150px] h-[180px] sm:w-[190px] sm:h-[234px] md600:w-[220px] md600:h-[250px] md:w-[230px] md:h-[320px] lg:w-[240px] lg:h-[337px] xl:w-[240px] xl:h-[345px] 2xl:w-[256px] 2xl:h-[364px] bg-gray-200 dark:bg-[#1a1a1a] rounded-xl overflow-hidden shadow-lg text-black dark:text-white flex flex-col shrink-0">
                            <div className="flex-1 w-full flex items-center justify-center">
                              {effect.component ? (
                                <div className="w-full h-full flex items-center justify-center">
                                  {React.createElement(effect.component)}
                                </div>
                              ) : (
                                <div className="flex items-center justify-center h-full">
                                  <p className="text-gray-500 dark:text-gray-400 text-sm">No component available</p>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                        {activeEffects.length < effectsLibrary?.length && (
                          <div className="w-[150px] h-[180px] sm:w-[190px] sm:h-[234px] md600:w-[220px] md600:h-[250px] md:w-[230px] md:h-[320px] lg:w-[240px] lg:h-[337px] xl:w-[240px] xl:h-[345px] 2xl:w-[256px] 2xl:h-[364px] bg-gray-100 dark:bg-[#1a1a1a] rounded-xl flex flex-col items-center justify-center text-black dark:text-white cursor-pointer hover:bg-gray-200 dark:hover:bg-[#2a2a2a] transition-colors shrink-0 border-2 border-dashed border-gray-400 dark:border-gray-600"
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
                            <div className="w-14 h-14 bg-black dark:bg-white text-white dark:text-black rounded-full flex items-center justify-center text-2xl font-bold mb-4">+</div>
                            <p className="text-center text-sm leading-snug">Drop effects here or<br />select from library</p>
                          </div>
                        )}
                        {Array.from({ length: 4 - activeEffects.length - 1 }, (_, index) => (
                          <div key={index} className="
                          w-[150px] h-[180px] sm:w-[190px] sm:h-[234px] md600:w-[220px] md600:h-[250px]
                          md:w-[230px] md:h-[320px] lg:w-[240px] lg:h-[337px] xl:w-[240px] xl:h-[345px] 
                          2xl:w-[256px] 2xl:h-[364px]
                          rounded-xl shrink-0 border-2 border-dashed
                          bg-primary-light dark:bg-primary-dark 
                          border-gray-300 dark:border-gray-600
                          transition-colors
                        "
                        onDragOver={(e) => {
                          e.preventDefault();
                          e.dataTransfer.dropEffect = "copy";
                          e.currentTarget.style.borderColor = "#409C9F";
                          e.currentTarget.style.backgroundColor =
                            document.documentElement.classList.contains("dark")
                              ? "#2a2a2a"
                              : "#f3f4f6"; // light gray for light mode
                        }}
                        onDragLeave={(e) => {
                          e.currentTarget.style.borderColor =
                            document.documentElement.classList.contains("dark")
                              ? "#4B5563"
                              : "#D1D5DB"; // gray-300 for light
                          e.currentTarget.style.backgroundColor =
                            document.documentElement.classList.contains("dark")
                              ? "#1a1a1a"
                              : "#ffffff";
                        }}
                        onDrop={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          e.currentTarget.style.borderColor =
                            document.documentElement.classList.contains("dark")
                              ? "#4B5563"
                              : "#D1D5DB";
                          e.currentTarget.style.backgroundColor =
                            document.documentElement.classList.contains("dark")
                              ? "#1a1a1a"
                              : "#ffffff";
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

          {/* Pricing Modal */}
          <PricingModel pricingModalOpen={pricingModalOpen} setPricingModalOpen={setPricingModalOpen} />
        </>
      )}
    </>
  )
}

export default Pianodemo