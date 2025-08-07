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
import { setRecordingAudio } from '../Redux/Slice/studio.slice';
import PianoRolls from './PianoRolls';
import * as Tone from "tone";


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


// Range Slider Component
const RangeSlider = ({
    min = 0,
    max = 100,
    step = 1,
    initialValue = 0,
    label = "Strum",
    unit = "s",
    onChange = () => { },
    className = ""
}) => {
    const [value, setValue] = useState(initialValue);

    const handleChange = (e) => {
        const newValue = Number(e.target.value);
        setValue(newValue);
        onChange(newValue);
    };

    const percentage = ((value - min) / (max - min)) * 100;

    return (
        <div className={`w-full ${className}`}>
            {/* Label and Value Display */}
            <div className="flex justify-between items-center">
                <label className="text-[8px] md600:text-[10px] md:text-[12px] lg:text-[14px] text-[#FFFFFF]">
                    {label}
                </label>
                <span className="text-[10px] md600:text-[12px] md:text-[14px] text-[#FFFFFF99] outline-none focus:outline-none">
                    {value}{unit}
                </span>
            </div>

            {/* Slider Container */}
            <div className="relative">
                {/* Custom styled range input */}
                <input
                    type="range"
                    min={min}
                    max={max}
                    step={step}
                    value={value}
                    onChange={handleChange}
                    className="w-full h-1 bg-[#444] rounded-lg appearance-none cursor-pointer slider"
                    style={{
                        background: `linear-gradient(to right, #bbb 0%, #bbb ${percentage}%, #444 ${percentage}%, #444 100%)`
                    }}
                />
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

const patternCategories = {
    basic: [
      { name: "Full Chord", synthType: "fullChord" },
      { name: "On One", synthType: "onOne" },
    ],
    stabs: [
      { name: "On Air", synthType: "onAir" },
      { name: "Eight's", synthType: "eights" },
      { name: "Soul Stabs", synthType: "soulStabs" },
      { name: "Simple Stabs", synthType: "simpleStabs" },
      { name: "Latinesque", synthType: "latinesque" },
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
    const [selectedButtons, setSelectedButtons] = useState({
        basic: null,
        stabs: null,
        arpeggiated: null,
        other: null
    });
    const [currentInstrumentIndex, setCurrentInstrumentIndex] = useState(0);
    const [activeTab, setActiveTab] = useState('Instruments');
    const [activePianoSection, setActivePianoSection] = useState(0); // 0: Low, 1: Middle, 2: High
    const [strumValue, setStrumValue] = useState(0);
    const [volume, setVolume] = useState(90); // Add volume state
    const [reverb, setReverb] = useState(-90); // Add reverb state
    const [pan, setPan] = useState(0); // Add pan state

    // const audioContextRef = useRef(null);
    const panNodeRef = useRef(null);
    const pianoRef = useRef(null);
    const reverbGainNodeRef = useRef(null);
    const dryGainNodeRef = useRef(null);
    const convolverNodeRef = useRef(null);
    const activeAudioNodes = useRef({});
    const selectedInstrument = INSTRUMENTS[currentInstrumentIndex].id;

    const getIsRecording = useSelector((state) => state.studio.isRecording);

    // / Add this function to create reverb impulse response (add before the Pianodemo component)
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
            hendleRecord();      // start recording
        } else {
            hendleStopRecord();  // stop recording
        }
    }, [getIsRecording]);

    // Update volume when knob changes
    useEffect(() => {
        if (gainNodeRef.current) {
            const volumeValue = (volume + 135) / 270; // Convert from -135 to 135 range to 0-1
            gainNodeRef.current.gain.value = volumeValue;
        }
    }, [volume]);

    // Update reverb when knob changes
    useEffect(() => {
        if (audioContextRef.current) {
            const reverbValue = (reverb + 135) / 270; // Convert from -135 to 135 range to 0-1
            // You can add reverb effect implementation here
        }
    }, [reverb]);

    // Update pan when knob changes
    useEffect(() => {
        if (audioContextRef.current) {
            const panValue = (pan + 135) / 270 * 2 - 1; // Convert from -135 to 135 range to -1 to 1
            // You can add pan effect implementation here
        }
    }, [pan]);


    // useEffect(() => {
    //     audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    //     Soundfont.instrument(audioContextRef.current, selectedInstrument).then((piano) => {
    //         pianoRef.current = piano;
    //     });
    //     return () => {
    //         audioContextRef.current && audioContextRef.current.close();
    //     };
    // }, [selectedInstrument]);

    const firstNote = MidiNumbers.fromNote('C0');
    const lastNote = MidiNumbers.fromNote('C5');
    // const keyboardShortcuts = KeyboardShortcuts.create({
    //     firstNote: firstNote,
    //     lastNote: lastNote,
    //     keyboardConfig: [
    //         // First Octave (Lower Keys)
    //         { natural: 'z', flat: 's', sharp: 's' },
    //         { natural: 'x', flat: 'd', sharp: 'd' },
    //         { natural: 'c', flat: 'f', sharp: 'f' },
    //         { natural: 'v', flat: 'g', sharp: 'g' },
    //         { natural: 'b', flat: 'h', sharp: 'h' },
    //         { natural: 'n', flat: 'j', sharp: 'j' },
    //         { natural: 'm', flat: 'k', sharp: 'k' },

    //         { natural: ',', flat: 'l', sharp: 'l' },
    //         { natural: '.', flat: ';', sharp: ';' },

    //         // Second Octave (Middle Keys)
    //         { natural: 'q', flat: '1', sharp: '1' },
    //         { natural: 'w', flat: '2', sharp: '2' },
    //         { natural: 'e', flat: '3', sharp: '3' },
    //         { natural: 'r', flat: '4', sharp: '4' },
    //         { natural: 't', flat: '5', sharp: '5' },
    //         { natural: 'y', flat: '6', sharp: '6' },
    //         { natural: 'u', flat: '7', sharp: '7' },

    //         // Third Octave (Higher Keys)
    //         { natural: 'i', flat: '8', sharp: '8' },
    //         { natural: 'o', flat: '9', sharp: '9' },
    //         { natural: 'p', flat: '0', sharp: '0' },
    //     ],
    // });

    const getKeyboardShortcutsForSection = (sectionIndex) => {
        const section = pianoSections[sectionIndex];
        return KeyboardShortcuts.create({
            firstNote: section.first,
            lastNote: section.last,
            keyboardConfig: [
                // First Octave (Lower Keys)
                { natural: 'z', flat: 's', sharp: 's' },
                { natural: 'x', flat: 'd', sharp: 'd' },
                { natural: 'c', flat: 'f', sharp: 'f' },
                { natural: 'v', flat: 'g', sharp: 'g' },
                { natural: 'b', flat: 'h', sharp: 'h' },
                { natural: 'n', flat: 'j', sharp: 'j' },
                { natural: 'm', flat: 'k', sharp: 'k' },
                { natural: ',', flat: 'l', sharp: 'l' },
                { natural: '.', flat: ';', sharp: ';' },

                // Second Octave (Middle Keys)
                { natural: 'q', flat: '1', sharp: '1' },
                { natural: 'w', flat: '2', sharp: '2' },
                { natural: 'e', flat: '3', sharp: '3' },
                { natural: 'r', flat: '4', sharp: '4' },
                { natural: 't', flat: '5', sharp: '5' },
                { natural: 'y', flat: '6', sharp: '6' },
                { natural: 'u', flat: '7', sharp: '7' },

                // Third Octave (Higher Keys)
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
    const gainNodeRef = useRef(null); // Add gain node ref

    useEffect(() => {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const destination = audioContext.createMediaStreamDestination();

        // Create audio nodes
        const gainNode = audioContext.createGain(); // Main volume control
        const panNode = audioContext.createStereoPanner(); // Pan control
        const dryGainNode = audioContext.createGain(); // Dry signal control
        const reverbGainNode = audioContext.createGain(); // Wet signal control
        const convolverNode = audioContext.createConvolver(); // Reverb effect

        // Create impulse response for reverb
        const impulseResponse = createImpulseResponse(audioContext, 2.5, 2);
        convolverNode.buffer = impulseResponse;

        // Set up audio routing:
        // Piano -> gainNode (volume) -> split to dry and wet paths
        // Dry path: dryGainNode -> panNode -> speakers/recording
        // Wet path: reverbGainNode -> convolverNode -> panNode -> speakers/recording
        gainNode.connect(dryGainNode);
        gainNode.connect(reverbGainNode);
        reverbGainNode.connect(convolverNode);

        dryGainNode.connect(panNode);
        convolverNode.connect(panNode);

        panNode.connect(audioContext.destination);
        panNode.connect(destination);

        // Store references
        audioContextRef.current = audioContext;
        destinationRef.current = destination;
        gainNodeRef.current = gainNode;
        panNodeRef.current = panNode;
        reverbGainNodeRef.current = reverbGainNode;
        dryGainNodeRef.current = dryGainNode;
        convolverNodeRef.current = convolverNode;

        // Load instrument and connect to our gain node
        Soundfont.instrument(audioContext, selectedInstrument, {
            destination: gainNode, // Connect instrument to our audio chain
        }).then((piano) => {
            pianoRef.current = piano;
        });

        return () => {
            audioContext && audioContext.close();
        };
    }, [selectedInstrument]);

    useEffect(() => {
        if (reverbGainNodeRef.current && dryGainNodeRef.current && convolverNodeRef.current && audioContextRef.current) {
            // Convert reverb knob value (-135 to 135) to reverb parameters
            const reverbAmount = (reverb + 135) / 270; // Convert to 0-1 range

            // Set reverb wet signal level (0 to 0.6 for natural sound)
            const wetLevel = reverbAmount * 0.6;
            reverbGainNodeRef.current.gain.setValueAtTime(wetLevel, audioContextRef.current.currentTime);

            // Set dry signal level (inverse relationship for natural mixing)
            const dryLevel = Math.max(0.3, 1 - (reverbAmount * 0.4));
            dryGainNodeRef.current.gain.setValueAtTime(dryLevel, audioContextRef.current.currentTime);

            // Create new impulse response based on reverb amount for different room characteristics
            if (reverbAmount > 0.1) {
                // Adjust room size and decay based on reverb amount
                const roomSize = 1 + (reverbAmount * 3); // 1 to 4 seconds
                const decay = 1.5 + (reverbAmount * 2); // 1.5 to 3.5 decay factor

                const newImpulse = createImpulseResponse(audioContextRef.current, roomSize, decay);
                convolverNodeRef.current.buffer = newImpulse;
            }

            console.log(`Reverb: ${reverb} -> Wet: ${wetLevel.toFixed(2)}, Dry: ${dryLevel.toFixed(2)}`);
        }
    }, [reverb]);


    // Update your pan useEffect
    useEffect(() => {
        if (panNodeRef.current) {
            // Convert from -135 to 135 range to -1 to 1
            const panValue = pan / 135; // This gives us -1 to 1 range

            // Clamp the value to ensure it stays within valid range
            const clampedPanValue = Math.max(-1, Math.min(1, panValue));

            panNodeRef.current.pan.value = clampedPanValue;

            console.log(`Pan value: ${pan} -> Stereo pan: ${clampedPanValue}`);
            // When panValue is:
            // -1: Full left channel
            // 0: Center (both channels equally)
            // 1: Full right channel
        }
    }, [pan]);



    const playNote = (midiNumber) => {
        setRecordedNotes((prevNotes) => [
            ...prevNotes,
            { midiNumber, time: Date.now(), type: 'play' },
        ]);
        if (pianoRef.current) {
            const audioNode = pianoRef.current.play(midiNumber);
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
        setCurrentInstrumentIndex((prev) =>
            prev === INSTRUMENTS.length - 1 ? 0 : prev + 1
        );
    };

    const prevInstrument = () => {
        setCurrentInstrumentIndex((prev) =>
            prev === 0 ? INSTRUMENTS.length - 1 : prev - 1
        );
    };


    // Function to select button (only one per section)
    const toggleButton = (section, index) => {
        setSelectedButtons(prev => ({
            ...prev,
            [section]: prev[section] === index ? null : index
        }));
    };

    // Function to check if button is selected
    const isButtonSelected = (section, index) => {
        return selectedButtons[section] === index;
    };

    const [isRecording, setIsRecording] = useState(false);

    const hendleRecord = () => {
        const stream = destinationRef.current?.stream;
        if (!stream) return;

        recordedChunksRef.current = [];
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;

        mediaRecorder.ondataavailable = (e) => {
            if (e.data.size > 0) recordedChunksRef.current.push(e.data);
        };

        mediaRecorder.onstop = () => {
            const blob = new Blob(recordedChunksRef.current, { type: 'audio/webm' });

            console.log("blob :::: > ", blob);
            dispatch(setRecordingAudio(blob));
            // const url = URL.createObjectURL(blob);
            // const a = document.createElement('a');
            // a.href = url;
            // a.download = 'piano_recording.webm';
            // a.click();
            // URL.revokeObjectURL(url);
        };

        mediaRecorder.start();
        setIsRecording(true);
    };

    const hendleStopRecord = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            mediaRecorderRef.current.stop();
        }
        setIsRecording(false);
    };


    // ****************** Chords *****************

     // --- STATE MANAGEMENT ---
  const [isAudioReady, setIsAudioReady] = useState(false);
  const [isAudioStarted, setIsAudioStarted] = useState(false);
  const [activeChord, setActiveChord] = useState(null);
  const [activePatternKey, setActivePatternKey] = useState("basic-0");
  const [loadingStatus, setLoadingStatus] = useState("Initializing...");
  const [activeChords, setActiveChords] = useState(-1)

  // --- REFS FOR TONE.JS OBJECTS ---
  const synths = useRef(null);
  const effects = useRef(null);

  const chordNotes = {
    Am: ["A3", "C4", "E4"],
    Bdim: ["B3", "D4", "F4"], 
    C: ["C3", "E3", "G3", "C4"],
    Dm: ["D3", "F3", "A3", "D4"],
    E: ["E3", "G#3", "B3", "E4"],
    F: ["F3", "A3", "C4", "F4"],
    G: ["G3", "B3", "D4", "G4"],
    Am7: ["A3", "C4", "E4", "G4"],
  };

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
      { name: "All Four", synthType: "layeredStab"},
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

        // PROFESSIONAL SYNTH COLLECTION - ALL PROPERLY DEFINED
        
        // === BASIC SOUNDS ===
        
        // 1. Acoustic Piano (Rich harmonics)
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

        // 2. Electric Piano (Classic Fender Rhodes style)
        const electricPiano = new Tone.PolySynth(Tone.FMSynth, {
          harmonicity: 1.2,
          modulationIndex: 2.5,
          oscillator: { type: "sine" },
          envelope: { 
            attack: 0.008, 
            decay: 0.8, 
            sustain: 0.4, 
            release: 1.5 
          },
          modulation: { type: "square" },
          modulationEnvelope: { 
            attack: 0.02, 
            decay: 0.4, 
            sustain: 0.12, 
            release: 1.0 
          },
          volume: -5
        }).connect(chorus);

        // === STAB SOUNDS ===

        // 3. Bright Stab (Sharp and cutting)
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

        // 4. Soul Stab (Warm and punchy)
        const soulStab = new Tone.PolySynth(Tone.AMSynth, {
          harmonicity: 1.8,
          oscillator: { type: "sine" },
          envelope: { 
            attack: 0.01, 
            decay: 0.4, 
            sustain: 0.25, 
            release: 0.9 
          },
          modulation: { type: "sine" },
          modulationEnvelope: { 
            attack: 0.02, 
            decay: 0.3, 
            sustain: 0.18, 
            release: 0.7 
          },
          volume: -6
        }).connect(compressor);

        // 5. Pluck Synth (Quick attack)
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

        // 6. Sharp Stab (Very percussive)
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

        // 7. Latin Synth (Percussive with filter sweep)
        const latinSynth = new Tone.PolySynth(Tone.FMSynth, {
          harmonicity: 2.5,
          modulationIndex: 6,
          oscillator: { type: "sine" },
          envelope: { 
            attack: 0.005, 
            decay: 0.3, 
            sustain: 0.15, 
            release: 0.6 
          },
          modulation: { type: "sawtooth" },
          modulationEnvelope: { 
            attack: 0.01, 
            decay: 0.25, 
            sustain: 0.08, 
            release: 0.5 
          },
          volume: -7
        }).connect(delay);

        // 8. Moderate Stab (Balanced attack)
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

        // === ARPEGGIATED SOUNDS ===

        // 9. Bell Synth (Metallic and shimmering)
        const bellSynth = new Tone.PolySynth(Tone.FMSynth, {
          harmonicity: 3.2,
          modulationIndex: 18,
          oscillator: { type: "sine" },
          envelope: { 
            attack: 0.001, 
            decay: 1.2, 
            sustain: 0.08, 
            release: 2.5 
          },
          modulation: { type: "sine" },
          modulationEnvelope: { 
            attack: 0.001, 
            decay: 0.6, 
            sustain: 0.02, 
            release: 1.8 
          },
          volume: -10
        }).connect(reverb);

        // 10. Crystal Synth (Bright and sparkly)
        const crystalSynth = new Tone.PolySynth(Tone.FMSynth, {
          harmonicity: 8.5,
          modulationIndex: 3,
          oscillator: { type: "sine" },
          envelope: { 
            attack: 0.001, 
            decay: 0.9, 
            sustain: 0.15, 
            release: 1.8 
          },
          modulation: { type: "sine" },
          modulationEnvelope: { 
            attack: 0.001, 
            decay: 0.4, 
            sustain: 0.08, 
            release: 1.2 
          },
          volume: -8
        }).connect(delay);

        // 11. Dreamy Pad (Soft and atmospheric)
        const dreamyPad = new Tone.PolySynth(Tone.AMSynth, {
          harmonicity: 2.2,
          oscillator: { type: "sine" },
          envelope: { 
            attack: 0.8, 
            decay: 1.0, 
            sustain: 0.7, 
            release: 3.0 
          },
          modulation: { type: "sine" },
          modulationEnvelope: { 
            attack: 0.5, 
            decay: 0.7, 
            sustain: 0.4, 
            release: 2.0 
          },
          volume: -12
        }).connect(reverb);

        // 12. String Pad (Warm strings)
        const stringPad = new Tone.PolySynth(Tone.Synth, {
          oscillator: { 
            type: "sawtooth"
          },
          envelope: { 
            attack: 1.2, 
            decay: 0.6, 
            sustain: 0.8, 
            release: 3.5 
          },
          volume: -10
        }).connect(reverb);

        // 13. Moving Arp (Quick and bouncy)
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

        // 14. Quick Arp (Very fast attack)
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

        // 15. Rain Synth (Soft droplets)
        const rainSynth = new Tone.PolySynth(Tone.Synth, {
          oscillator: { type: "sine" },
          envelope: { 
            attack: 0.001, 
            decay: 0.4, 
            sustain: 0.05, 
            release: 0.8 
          },
          volume: -9
        }).connect(reverb);

        // === OTHER SOUNDS ===

        // 16. Bass Synth (Deep and powerful)
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

        // 17. Organ Synth (Classic drawbar organ)
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

        // 18. Slide Synth (Smooth portamento)
        const slideSynth = new Tone.PolySynth(Tone.AMSynth, {
          harmonicity: 1.5,
          oscillator: { type: "sine" },
          envelope: { 
            attack: 0.05, 
            decay: 0.4, 
            sustain: 0.6, 
            release: 1.0 
          },
          modulation: { type: "sine" },
          modulationEnvelope: { 
            attack: 0.1, 
            decay: 0.3, 
            sustain: 0.4, 
            release: 0.8 
          },
          volume: -6
        }).connect(chorus);

        // 19. Delayed Stab (Sharp & Rhythmic)
// 19. Delayed Stab (Sharp, Metallic & Rhythmic)
const delayedStab = new Tone.PolySynth(Tone.FMSynth, {
    harmonicity: 3.5,
    modulationIndex: 15,
    oscillator: { type: "sine" },
    envelope: {
      attack: 0.001, // Ekdam fast attack
      decay: 0.1,    // Khubaj jhadpi decay
      sustain: 0,    // Sustain nathi, jethi "pluck" jevo avaj aave
      release: 0.1   // Short release
    },
    modulation: { type: "square" },
    modulationEnvelope: {
      attack: 0.001,
      decay: 0.05,
      sustain: 0,
      release: 0.05
    },
    volume: -8
}).connect(delay); // Main focus - aa avaj delay mate j che
          
        // 20. Layered Stab (All Four)
// 20. Layered Stab (Soft, Wide & Atmospheric)
const layeredStab = new Tone.PolySynth(Tone.DuoSynth, {
    voice0: {
      oscillator: { type: "sawtooth" },
      envelope: {
        attack: 0.4,   // Dhimo attack, jethi avaj dhire thi sharu thay
        decay: 0.3,
        sustain: 0.5,
        release: 1.5   // Lambo release, jethi avaj dhire dhire band thay
      }
    },
    voice1: {
      oscillator: { type: "sine" }, // Sawtooth ni jagyae Sine wave for softness
      detune: -10, // Thodu detune karvathi avaj vadhare "rich" lage
      envelope: {
        attack: 0.5,  // Thodo vadhare dhimo attack
        decay: 0.3,
        sustain: 0.5,
        release: 1.8  // Vadhare lambo release
      }
    },
    harmonicity: 1.0,
    vibratoAmount: 0.2,
    vibratoRate: 2, // Dhimi vibrato
    volume: -9
}).chain(chorus, reverb); // Main focus - chorus ane reverb thi mota space no anubhav
          

        // Store all synths with clear mapping
        synths.current = {
          // Basic patterns
          acousticPiano,
          electricPiano,
          
          // Stab patterns  
          brightStab,
          soulStab,
          pluckSynth,
          delayedStab,
          sharpStab,
          latinSynth,
          layeredStab,
          moderateStab,
          
          // Arpeggiated patterns
          bellSynth,
          crystalSynth,
          dreamyPad,
          stringPad,
          movingArp,
          quickArp,
          rainSynth,
          
          // Other patterns
          bassSynth,
          organSynth,
          slideSynth,
        };

        console.log("✅ Created", Object.keys(synths.current).length, "professional synths");

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

  const getCurrentSynthType = () => {
    if (!activePatternKey) return "fullChord";
    const [category, indexStr] = activePatternKey.split("-");
    const pattern = patternCategories[category]?.[parseInt(indexStr, 10)];
    return pattern?.synthType || "fullChord";
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

    // Stop all currently playing sounds
    stopAllSounds();

    const synthType = getCurrentSynthType();
    const notes = chordNotes[chordName];
    const now = Tone.now();

    // ENHANCED SYNTH MAPPING - Each pattern gets unique professional sound
    const synthMap = {
      // Basic - Rich piano sounds
      fullChord: "acousticPiano",     // Rich acoustic piano
      onOne: "electricPiano",         // Classic electric piano
      
      // Stabs - Professional stab sounds
      onAir: "brightStab",           // Sharp sawtooth stab
      eights: "pluckSynth",          // Quick plucked sound
      soulStabs: "soulStab",         // Warm soul stab
      oneAndThree: "delayedStab",       // ← maps to "One and Three"
      simpleStabs: "sharpStab",      // Percussive stab
      latinesque: "latinSynth",      // Latin-style synth
      moderateStabs: "moderateStab", // Balanced stab
      allFour: "layeredStab",  
      oneAndThree: "delayedStab",       // ← maps to "One and Three"
      
      // Arpeggiated - Varied textures with character
      layout: "crystalSynth",        // Bright crystal sound
      storytime: "dreamyPad",        // Soft dreamy pad
      risingArp: "bellSynth",        // Metallic bell
      dreamer: "stringPad",          // Warm string pad
      movingArp: "movingArp",        // Bouncy arp
      quickArp: "quickArp",          // Fast attack arp
      simpleStride: "electricPiano", // Classic stride piano
      simpleRain: "rainSynth",       // Soft rain drops
      
      // Other - Special character sounds
      simpleSlide: "slideSynth",     // Smooth slide synth
      simplePlayer: "organSynth",    // Classic organ
      alternatingStride: "bassSynth", // Deep bass
    };

    const synthKey = synthMap[synthType] || "acousticPiano";
    const selectedSynth = synths.current?.[synthKey];

    console.log(`🎵 Playing ${synthType} -> ${synthKey}`);

    if (selectedSynth && notes) {
      try {
        // Special playing patterns for different types
        if (synthType === "alternatingStride") {
          // Bass: Play notes in sequence
          notes.forEach((note, i) => {
            selectedSynth.triggerAttackRelease(note, "4n", now + i * 0.12);
          });
        } else if (synthType === "simpleSlide") {
          // Slide: Smooth note transitions
          notes.forEach((note, i) => {
            selectedSynth.triggerAttackRelease(note, "8n", now + i * 0.08);
          });
        } else if (synthType === "risingArp") {
          // Rising arp: Notes go up in sequence
          notes.forEach((note, i) => {
            selectedSynth.triggerAttackRelease(note, "8n", now + i * 0.1);
          });
        } else if (synthType === "simpleRain") {
          // Rain: Random-ish timing
          notes.forEach((note, i) => {
            const delay = i * 0.15 + (Math.random() * 0.05);
            selectedSynth.triggerAttackRelease(note, "4n", now + delay);
          });
        } else if (synthType === "quickArp" || synthType === "movingArp") {
          // Quick arps: Fast succession
          notes.forEach((note, i) => {
            selectedSynth.triggerAttackRelease(note, "16n", now + i * 0.06);
          });
        } else if (synthType === "eights") {
          // Eighth note pattern
          notes.forEach((note, i) => {
            selectedSynth.triggerAttackRelease(note, "8n", now + i * 0.125);
          });
        } else if (synthType === "layout") {
          // Layout: Spread notes across time
          notes.forEach((note, i) => {
            selectedSynth.triggerAttackRelease(note, "4n", now + i * 0.2);
          });
        } else if (synthType === "storytime") {
          // Dreamy storytelling pattern
          notes.forEach((note, i) => {
            selectedSynth.triggerAttackRelease(note, "2n", now + i * 0.3);
          });
        } else {
          // Standard chord
          selectedSynth.triggerAttackRelease(notes, "2n", now);
        }
        
        console.log(`✅ Successfully played ${synthKey}`);
        
      } catch (error) {
        console.error(`❌ Error playing ${synthKey}:`, error);
        // Fallback to acoustic piano
        if (synths.current.acousticPiano && synthKey !== "acousticPiano") {
          console.log("🔄 Falling back to acoustic piano");
          synths.current.acousticPiano.triggerAttackRelease(notes, "2n", now);
        }
      }
    } else {
      console.warn(`⚠️ Synth ${synthKey} not available`);
      // Fallback to acoustic piano
      if (synths.current?.acousticPiano) {
        synths.current.acousticPiano.triggerAttackRelease(notes, "2n", now);
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

  // Test all synths function
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


    return (
        <>
            {/* <button className='p-2 bg-white text-black' onClick={() => setShowOffcanvas1(prev => !prev)}>
                on/off
            </button> */}
            {showOffcanvas1 === true && (
                <>
                    <div className="fixed z-40 w-full h-full  transition-transform  left-0 right-0 translate-y-full bottom-[210px] sm:bottom-[260px] md600:bottom-[275px] md:bottom-[450px]  lg:bottom-[455px] xl:bottom-[465px] 2xl:bottom-[516px]" tabIndex="-1" aria-labelledby="drawer-swipe-label">
                        {/* Static Navbar with Tabs */}
                        <div className="  border-b border-[#FFFFFF1A] h-full">
                            <div className=" bg-[#1F1F1F] flex items-center px-1 md600:px-2 md600:pt-2 lg:px-3 lg:pt-3">
                                {/* Close Button */}
                                <div>
                                    <IoClose className='text-[10px] sm:text-[12px] md600:text-[14px] md:text-[16px] lg:text-[18px] 2xl:text-[20px] text-[#FFFFFF99] cursor-pointer justify-start' onClick={() => {
                                        setShowOffcanvas1(false);
                                        onClose && onClose();
                                    }} />
                                </div>
                            </div>
                            {/* Tabs */}
                            <div className=" bg-[#1F1F1F] flex space-x-2 sm:space-x-3 px-1 md600:space-x-4  md600:px-2 lg:space-x-6 2xl:space-x-8 justify-center  lg:px-3">
                                {['Instruments', 'Chords', 'Piano Roll', 'Effects'].map((tab) => (
                                    <button
                                        key={tab}
                                        onClick={() => setActiveTab(tab)}
                                        className={`text-[8px] md600:text-[10px] md:text-[12px]  lg:text-[14px] 2xl:text-[16px] font-medium transition-colors ${activeTab === tab
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
                                {activeTab === 'Instruments' && (
                                    <>
                                        <div className=" bg-[#1F1F1F] flex items-center justify-center pt-1 pb-1 px-2 md600:px-2 md600:pt-2 md600:pb-1 sm:gap-6 md600:gap-12 md:gap-16 lg:pt-4 lg:pb-2 lg:px-3 lg:gap-20 2xl:pt-5 2xl:pb-3 2xl:px-3 2xl:gap-24">
                                            {/* Instrument Selector */}
                                            <div className="bg-[#353535] p-1 md600:p-2 lg:p-3 rounded-lg">
                                                <div className="flex items-center justify-between">
                                                    <button
                                                        onClick={prevInstrument}
                                                        className="text-gray-400 hover:text-white transition-colors p-1 md600:p-2"
                                                    >
                                                        <FaChevronLeft className='text-[8px] md600:text-[10px] md:text-[12px]  lg:text-[14px] 2xl:text-[16px]' />
                                                    </button>

                                                    <div className="flex items-center gap-1 md600:gap-2 px-1 md600:px-2 md:gap-3 w-[100px] sm:w-[150px] md600:w-[170px] md:w-[172px] lg:gap-4 lg:px-3 lg:w-[230px] 2xl:gap-5 flex-1 justify-center 2xl:px-4 2xl:w-[250px]">
                                                        <div className="text-white">
                                                            <GiPianoKeys className='text-[10px] sm:text-[12px] md600:text-[14px] md:txt-[16px] lg:text-[18px] 2xl:text-[20px]' />
                                                        </div>
                                                        <div className="">
                                                            <div className="text-white fw-bolder text-[10px] sm:text-[12px] md600:text-[14px] md:txt-[16px] lg:text-[18px] 2xl:text-[16px]">
                                                                {INSTRUMENTS[currentInstrumentIndex].name}
                                                            </div>
                                                            <div className="text-gray-400 text-[8px] sm:text-[10px] md600:text-[12px] lg:text-[14px]">
                                                                {INSTRUMENTS[currentInstrumentIndex].category}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <button
                                                        onClick={nextInstrument}
                                                        className="text-gray-400 hover:text-white transition-colors p-1 lg:p-2"
                                                    >
                                                        <FaChevronRight className='text-[8px] md600:text-[10px] md:text-[12px] lg:text-[14px] 2xl:text-[16px] text-[#FFFFFF99]' />
                                                    </button>
                                                </div>
                                            </div>

                                            {/* {isRecording ? (<button onClick={hendleStopRecord} className="cursor-pointer">
                                                <FaStop />
                                            </button>
                                            ) :
                                                (<button onClick={hendleRecord} className="cursor-pointer">
                                                    <div className="flex gap-1 sm:gap-2 items-center rounded-2xl bg-[#1414141A] dark:bg-[#1F1F1F] py-[1px] px-2 md:py-[4px] md:px-2 lg:py-[6px] lg:px-3">
                                                        <p className="rounded-full p-[3px] sm:p-[3px] lg:p-2 bg-[#FF6767]"></p>
                                                        <p className="text-secondary-light dark:text-secondary-dark text-[10px] md:text-[12px]">Rec</p>
                                                    </div>
                                                </button>)
                                            } */}


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
                                        </div>





                                        {/* Full-Width Piano with Navigation */}
                                        <div className="w-full h-[400px] md:h-[500px] lg:h-[250px]">
                                            {/* Piano Navigation Buttons */}

                                            <div className="bg-[#1F1F1F] flex gap-1 md600:gap-2 md:gap-3 pb-1  lg:gap-4 lg:pb-2 2xl:gap-5 items-center justify-between 2xl:pb-3">
                                                <div className='flex gap-1 sm:gap-2 md600:gap-3 lg:gap-4  2xl:gap-5 items-center ms-1 md600:ms-2 lg:ms-3'>
                                                    <div className='border rounded-3xl border-[#FFFFFF1A]'>
                                                        <p className="text-[#FFFFFF99] text-[8px] md600:text-[10px] lg:text-[12px] px-1 sm:px-2 md600:px-3 md:px-4 lg:px-5 2xl:px-6 py-1">Sustain</p>
                                                    </div>
                                                    <div className="flex items-center justify-between ">
                                                        <button
                                                            onClick={() => setActivePianoSection(prev => Math.max(prev - 1, 0))}
                                                            disabled={activePianoSection === 0}
                                                            className={`transition-colors p-1 lg:p-2 ${activePianoSection === 0 ? 'text-gray-600 cursor-not-allowed' : 'text-gray-400 hover:text-white'
                                                                }`}
                                                        >
                                                            <FaChevronLeft className="text-[8px] md600:text-[10px] md:text-[12px] lg:text-[14px] 2xl:text-[16px]" />
                                                        </button>

                                                        <div className="px-1 md600:px-2 lg:px-3 2xl:px-4 w-[50px] md600:w-[60px] lg:w-[80px] 2xl:w-[100px]">
                                                            <div className="text-white text-center fw-bolder text-[8px] md600:text-[10px] md:text-[12px] lg:text-[14px] 2xl:text-[16px]">
                                                                Octaves
                                                            </div>
                                                        </div>

                                                        <button
                                                            onClick={() => setActivePianoSection(prev => Math.min(prev + 1, 2))}
                                                            disabled={activePianoSection === 2}
                                                            className={`transition-colors p-1 lg:p-2 ${activePianoSection === 2 ? 'text-gray-600 cursor-not-allowed' : 'text-gray-400 hover:text-white'
                                                                }`}
                                                        >
                                                            <FaChevronRight className="text-[8px] md600:text-[10px] md:text-[12px] lg:text-[14px] 2xl:text-[16px]" />
                                                        </button>
                                                    </div>
                                                    <div className='border rounded-lg border-[#FFFFFF1A] ms-auto me-1 md600:me-2 lg:me-3'>
                                                        <p className="text-[#FFFFFF] text-[8px] md600:text-[10px] md:text-[12px] lg:text-[14px] px-2 md600:px-3 md:px-4 lg:px-5 2xl:px-6 py-1">Save Preset</p>
                                                    </div>
                                                </div>
                                                <div className='border rounded-lg border-[#FFFFFF1A] ms-auto me-1 md600:me-2 lg:me-3'>
                                                    <p className="text-[#FFFFFF] text-[8px] md600:text-[10px] md:text-[12px] lg:text-[14px] px-2 md600:px-3 md:px-4 lg:px-5 2xl:px-6 py-1">Save Preset</p>
                                                </div>
                                            </div>
                                            {/* Piano Container */}


                                            <div className="flex gap-1 md600:gap-2 lg:gap-3 bg-[#141414]">
                                                {autoChords === true &&
                                                    <div className="w-[30%] sm:w-[40%] md600:w-[25%] md:w-[30%] lg:w-[20%] xl:w-[18%] bg-[#1F1F1F] md600:ms-2 md600:mt-2 lg:ms-3 lg:mt-3 mb-1">
                                                        <div className="w-full text-white p-1 md600:p-2 lg:p-3">
                                                            <div className="flex justify-between items-center">
                                                                <p className="text-white text-[8px] md600:text-[10px] md:text-[12px] lg:text-[14px] 2xl:text-[16px]">Auto Chord</p>
                                                                <IoClose className='text-[8px] sm:text-[10px] md600:text-[12px] md:text-[16px] lg:text-[20px] 2xl:text-[24px] text-[#FFFFFF99]' onClick={() => setAutoChords(false)} />
                                                            </div>
                                                            <p className="text-[#FFFFFF99] text-[8px] md:text-[10px] lg:text-[12px] 2xl:text-[14px] text-nowrap truncate ">Play full chords with a single key</p>
                                                            <div className="flex justify-between gap-1 lg:gap-2 pt-1 md600:pt-2 lg:pt-4 2xl:gap-3 2xl:pt-5">
                                                                <button className="text-white border border-[#FFFFFF1A] text-[8px] md600:text-[10px] lg:text-[12px] py-1 px-1 md600:px-2 lg:px-4 2xl:px-5 rounded-md">
                                                                    Triad
                                                                </button>
                                                                <button className="text-white border border-[#FFFFFF1A] text-[8px] md600:text-[10px] lg:text-[12px] py-1 px-1 md600:px-2 lg:px-4 2xl:px-5 rounded-md">
                                                                    7th
                                                                </button>
                                                                <button className="text-white border border-[#FFFFFF1A] text-[8px] md600:text-[10px] lg:text-[12px] py-1  px-1 md600:px-2 lg:px-4 2xl:px-5 rounded-md">
                                                                    Add9
                                                                </button>
                                                            </div>
                                                            {/* Range Slider - Added here after the chord buttons */}
                                                            <div className=" pt-1 md600:pt-2 lg:pt-3">
                                                                <RangeSlider
                                                                    min={0}
                                                                    max={10}
                                                                    step={0.1}
                                                                    initialValue={0}
                                                                    label="Strum"
                                                                    unit="s"
                                                                    onChange={setStrumValue}
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                }
                                                <div className="w-full h-[105px] sm:h-[150px] md600:h-[140px] md:h-[290px] lg:h-[250px] overflow-x-auto pt-1 md600:pt-2 lg:pt-3 ">
                                                    <div className="w-full h-full">
                                                        <div
                                                            className="flex transition-transform duration-300 ease-in-out h-full"
                                                            style={{ transform: `translateX(-${activePianoSection * 100}%)` }}
                                                        >
                                                            {pianoSections.map((section, index) => (
                                                                <div key={index} className="w-full flex-shrink-0">
                                                                    <Piano
                                                                        noteRange={{ first: section.first, last: section.last }}
                                                                        playNote={playNote}
                                                                        stopNote={stopNote}
                                                                        keyboardShortcuts={index === activePianoSection ? getKeyboardShortcutsForSection(index) : []}
                                                                    />
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                )}

                                {activeTab === 'Chords' && (
                                    <>
                                        <div className=" bg-[#1F1F1F] max-h-[180px] sm:max-h-[235px] md600:max-h-[235px] md:max-h-[410px]  overflow-auto xl:overflow-hidden ">
                                            <div className="w-full flex items-center justify-center">
                                                <div className="bg-[#FFFFFF1A] items-center mt-1 px-1 py-1 md:mt-2 md:px-2 md:py-2 lg:px-3 rounded-lg">
                                                    <div className=" flex gap-1 px-1 md:gap-2 md:px-2 lg:gap-3 items-center lg:px-3">
                                                        <GiPianoKeys className='text-[10px] md600:text-[12px] md:txt-[16px] lg:text-[18px] 2xl:text-[20px]' />
                                                        <p className='text-white text-[10px] md600:text-[12px] md:text-[14px] lg:text-[16px]'>Basic</p>
                                                        <HiMiniChevronUpDown className='text-[#FFFFFF99] text-[10px] md600:text-[12px] md:text-[14px] lg:text-[16px]' />
                                                    </div>
                                                    <div className="grid grid-cols-3 gap-1 md600:gap-2 mx-1 mt-1 md:grid-cols-4 md:gap-3 md:mx-2 md:mt-2 lg:gap-4 lg:mx-3 lg:mt-3">
                                                        {Object.keys(chordNotes).map((name , index) => (
                                                            <div key={name}
                                                            onClick={() => {handleChordClick(name); setActiveChords(index)}}
                                                            disabled={!isAudioReady} className={`bg-[#1F1F1F] cursor-pointer text-white w-[90px] md600:w-[110px] p-1 md600:p-2 md:w-[120px] lg:w-[130px] ${activeChords === index  ? 'border-[white] border-[1px]' : 'border-[#1F1F1F] border-[1px]'}`}>
                                                                <p className='text-white text-[10px] md600:text-[12px] md:text-[14px] lg:text-[16px] text-center mb-1'>{name}</p>
                                                                <div className="flex justify-between">
                                                                    <img src={BasicData[index]?.image} alt="" className="w-2 h-2 md600:w-3 md600:h-3 lg:w-4 lg:h-4" />
                                                                    <FaPlus className='text-[10px] md600:text-[12px] lg:text-[16px] text-[#FFFFFF99]' />
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="max-w-full md600:w-full flex items-center md600:justify-center my-3 lg:my-0 overflow-auto ">
                                                <div className="bg-[#FFFFFF1A] items-center mt-1 px-1  md:mt-2 md:px-2 py-1 lg:px-3 lg:py-2  rounded-lg">
                                                    <div className=" flex gap-1 px-1 md:gap-2 md:px-2 lg:gap-3 items-center lg:px-3">
                                                        <img src={music} alt="" className="w-2 h-2 md600:w-3 md600:h-3 lg:w-4 lg:h-4" />
                                                        <p className='text-white text-[10px] md600:text-[12px] md:text-[14px] lg:text-[16px]'>Playing Sounds</p>
                                                    </div>
                                                    <div className="flex">
                                                        {Object.entries(patternCategories).map(([category, patterns], index)=>{
                                                            console.log("Hello HI" , index);
                                                            
                                                            return (
                                                                <div className={` ${index === 0 || index === 3 ? 'bg-[#1F1F1F] ms-1 mt-1 p-1 w-[110px] h-[120px] md600:w-[100px] md600:h-[155px] md:ms-2 md:mt-2 md:p-2 md:w-[110px] md:h-[180px] lg:ms-3 lg:w-[116px] lg:h-[150px]' : ''} ${index === 1 || index === 2 ? 'bg-[#1F1F1F] mx-1 mt-1 p-1 w-[315px] h-[120px] md600:w-[170px] md600:h-[155px] md:mx-2 lg:mx-3 md:mt-2 md:p-2 md:w-[200px] md:h-[180px] lg:w-[340px] lg:h-[150px]' : ''}`}>
                                                                   <p className='text-[#FFFFFF99] text-[10px] md600:text-[12px] md:text-[14px] '>{category}</p>
                                                                   <div className={`${index === 1 || index === 2 ? 'grid grid-cols-3 pt-1 md600:grid-cols-2  md:gap-1 lg:grid-cols-3 lg:gap-0  md:pt-1' : ''}`}>
                                                                      {patterns.map((item, index) =>{
                                                                           const key = `${category}-${index}`;
                                                                           const isSelected = activePatternKey === key;
                                                                          return (
                                                                            <div key={index} className="">
                                                                               <button
                                                                                 key={key}
                                                                                 onClick={() => handlePatternSelect(key)}
                                                                                 disabled={!isAudioReady}
                                                                                //    className={`${isButtonSelected('basic', index) ? "bg-white text-black" : "text-[#FFFFFF] bg-transparent"} justify-center  w-[100px] mt-1  h-[25px] lg:w-[100px] lg:h-[30px]  md:mt-2 text-[8px] md600:text-[10px] rounded-md border border-[#FFFFFF1A]`}
                                                                                className={`${
                                                                                    isSelected
                                                                                      ? "bg-white text-black"
                                                                                      : "text-[#FFFFFF] bg-transparent"} border-[#FFFFFF1A] justify-center  w-[100px] mt-1  h-[25px] lg:w-[100px] lg:h-[30px]  md:mt-2 text-[8px] md600:text-[10px] rounded-md border "}`}
                                                                                 //  onClick={() => toggleButton('basic', index)}
                                                                               >
                                                                                   {item.name}
                                                                               </button>
                                                                            </div>
                                                                          )
                                                                      })}
                                                                   </div>
                                                                 </div>
                                                            )
                                                        })}
                                                        {/* <div className='bg-[#1F1F1F] mx-1 mt-1 p-1 w-[315px] h-[120px] md600:w-[170px] md600:h-[155px] md:mx-2 lg:mx-3 md:mt-2 md:p-2 md:w-[200px] md:h-[180px] lg:w-[340px] lg:h-[150px]'>
                                                            <p className='text-[#FFFFFF99] text-[8px] sm:text-[10px] md600:text-[12px] md:text-[14px]'>Stabs</p>
                                                            <div className="grid grid-cols-3 pt-1 md600:grid-cols-2 gap-1 md:gap-2 lg:grid-cols-3 lg:gap-3  md:pt-2">
                                                                {Stabs.map((item, index) => (
                                                                    <div key={index} className="">
                                                                        <button
                                                                            className={`${isButtonSelected('stabs', index) ? "bg-white text-black" : "text-[#FFFFFF] bg-transparent"} justify-center w-[100px] h-[25px] md600:w-[80px] md:w-[90px]  md600:h-[25px] lg:w-[100px] lg:h-[30px]  text-[8px] md600:text-[10px] rounded-md border border-[#FFFFFF1A]`}
                                                                            onClick={() => toggleButton('stabs', index)}
                                                                        >
                                                                            {item.name}
                                                                        </button>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                        <div className='bg-[#1F1F1F] mt-1 p-1 w-[315px] h-[120px] md600:w-[170px] md600:h-[155px]  md:mt-2 md:p-2 md:w-[200px] md:h-[180px] lg:w-[340px] lg:h-[150px]'>
                                                            <p className='text-[#FFFFFF99] text-[8px] sm:text-[10px] md600:text-[12px] md:text-[14px]'>Arpeggiated</p>
                                                            <div className="grid grid-cols-3  md600:grid-cols-2 gap-1 md:gap-2 lg:grid-cols-3 lg:gap-3 pt-1  md:pt-2">
                                                                {Arpeggiated.map((item, index) => (
                                                                    <div key={index} className=" flex">
                                                                        <button
                                                                            className={`${isButtonSelected('arpeggiated', index) ? "bg-white text-black" : "text-[#FFFFFF] bg-transparent"} justify-center  w-[100px] h-[25px] md600:w-[80px] md:w-[90px] mt-1 lg:mt-0  md600:h-[25px] lg:w-[100px] lg:h-[30px] text-[8px] md600:text-[10px] rounded-md border border-[#FFFFFF1A]`}
                                                                            onClick={() => toggleButton('arpeggiated', index)}
                                                                        >
                                                                            {item.name}
                                                                        </button>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                        <div className='bg-[#1F1F1F] mt-1 mx-1 p-1 md:mx-2 lg:mx-3 md:mt-2 md:p-2 w-[110px] h-[120px] md600:w-[100px] md600:h-[155px]  md:w-[110px] md:h-[180px] lg:ms-3 lg:w-[116px] lg:h-[150px]'>
                                                            <p className='text-[#FFFFFF99] text-[8px] sm:text-[10px] md600:text-[12px] md:text-[14px]'>other</p>
                                                            {other.map((item, index) => (
                                                                <div key={index} className="">
                                                                    <button
                                                                        className={`${isButtonSelected('other', index) ? "bg-white text-black" : "text-[#FFFFFF] bg-transparent"} mt-1 md:mt-2 justify-center w-[100px] h-[25px] md600:w-[90px] md600:h-[25px] lg:w-[100px] lg:h-[30px] text-[8px] md600:text-[10px] rounded-md border border-[#FFFFFF1A]`}
                                                                        onClick={() => toggleButton('other', index)}
                                                                    >
                                                                        {item.name}
                                                                    </button>
                                                                </div>
                                                            ))}
                                                        </div> */}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                )}

                                {activeTab === 'Piano Roll' && (
                                    <PianoRolls />
                                )}

                                {activeTab === 'Effects' && (
                                    <div className="w-full h-[400px] md:h-[500px] lg:h-[250px] flex items-center justify-center">
                                        <div className="text-center">
                                            <h3 className="text-white text-xl font-semibold mb-4">Effects Tab</h3>
                                            <p className="text-gray-400">Audio effects and processing will be here</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </>
            )}
            {/* <div>
                <label>Instrument: </label>
                <select
                    value={selectedInstrument}
                    onChange={e => setSelectedInstrument(e.target.value)}
                >
                    {INSTRUMENTS.map(inst => (
                        <option key={inst} value={inst}>{inst}</option>
                    ))}
                </select>
            </div>
            <Piano
                noteRange={{ first: firstNote, last: lastNote }}
                playNote={playNote}
                stopNote={stopNote}
                width={1000}
                keyboardShortcuts={keyboardShortcuts}
            /> */}
        </>
    )
}

export default Pianodemo
