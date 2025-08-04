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

function Knob({ label = "Bite", min = -135, max = 135, defaultAngle }) {
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


const Pianodemo = () => {
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

    // const audioContextRef = useRef(null);
    const pianoRef = useRef(null);
    const activeAudioNodes = useRef({});
    const selectedInstrument = INSTRUMENTS[currentInstrumentIndex].id;

    const getIsRecording = useSelector((state) => state.studio.isRecording);

    useEffect(() => {
        if (getIsRecording) {
            hendleRecord();      // start recording
        } else {
            hendleStopRecord();  // stop recording
        }
    }, [getIsRecording]);


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
    const keyboardShortcuts = KeyboardShortcuts.create({
        firstNote: firstNote,
        lastNote: lastNote,
        keyboardConfig: KeyboardShortcuts.HOME_ROW,
    });



    const [recordedNotes, setRecordedNotes] = useState([]);

    const audioContextRef = useRef(null);
    const mediaRecorderRef = useRef(null);
    const recordedChunksRef = useRef([]);
    const destinationRef = useRef(null);

    useEffect(() => {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const destination = audioContext.createMediaStreamDestination();
        const gainNode = audioContext.createGain(); // controls volume, optional

        gainNode.connect(audioContext.destination);      // to speakers
        gainNode.connect(destination);                   // to MediaRecorder

        audioContextRef.current = audioContext;
        destinationRef.current = destination;

        Soundfont.instrument(audioContext, selectedInstrument, {
            destination: gainNode, // sends to both speakers and recording
        }).then((piano) => {
            pianoRef.current = piano;
        });

        return () => {
            audioContext && audioContext.close();
        };
    }, [selectedInstrument]);



    const playNote = (midiNumber) => {
        setRecordedNotes((prevNotes) => [
            ...prevNotes,
            { midiNumber, time: Date.now(), type: 'play' },
        ]);
        if (pianoRef.current) {
            const audioNode = pianoRef.current.play(midiNumber);
            // audioNode.connect(destination.current);
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
                                    <IoClose className='text-[10px] sm:text-[12px] md600:text-[14px] md:text-[16px] lg:text-[18px] 2xl:text-[20px] text-[#FFFFFF99] cursor-pointer justify-start' onClick={() => setShowOffcanvas1(false)} />
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
                                                    <Knob label="Reverb" min={-135} max={135} defaultAngle={-90} />
                                                </div>

                                                {/* Pan Knob */}
                                                <div className="flex flex-col items-center">
                                                    <Knob label="Pan" min={-135} max={135} defaultAngle={0} />
                                                </div>

                                                {/* Volume Knob */}
                                                <div className="flex flex-col items-center">
                                                    <Knob label="Volume" min={-135} max={135} defaultAngle={90} />
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
                                                            onClick={() => setActivePianoSection(prev => prev > 0 ? prev - 1 : prev)}
                                                            className={`transition-colors text-white p-1 lg:p-2 ${activePianoSection === 0 ? ' cursor-not-allowed' : ' hover:text-white'}`}
                                                            disabled={activePianoSection === 0}
                                                        >
                                                            <FaChevronLeft className='text-[8px] md600:text-[10px] md:text-[12px] lg:text-[14px] 2xl:text-[16px]' />
                                                        </button>

                                                        <div className="items-center justify-center px-1 md600:px-2  lg:px-3 2xl:px-4 w-[50px]  md600:w-[60px] lg:w-[80px] 2xl:w-[100px]">

                                                            <div className="">
                                                                <div className="text-white items-center fw-bolder text-[8px] md600:text-[10px] md:text-[12px] lg:text-[14px] 2xl:text-[16px]">
                                                                    {activePianoSection === 0 ? 'Octaves' : activePianoSection === 1 ? 'Octaves' : 'Octaves'}
                                                                </div>

                                                            </div>
                                                        </div>

                                                        <button
                                                            onClick={() => setActivePianoSection(prev => prev < 2 ? prev + 1 : prev)}
                                                            className={`transition-colors p-1 lg:p-2 ${activePianoSection === 2 ? 'text-gray-600 cursor-not-allowed' : 'text-gray-400 hover:text-white'}`}
                                                            disabled={activePianoSection === 2}
                                                        >
                                                            <FaChevronRight className='text-[8px] md600:text-[10px] md:text-[12px] lg:text-[14px] 2xl:text-[16px]' />
                                                        </button>
                                                    </div>
                                                    <div className='border rounded-3xl border-[#FFFFFF1A]' onClick={() => setAutoChords(prev => !prev)} >
                                                        <p className={`${autoChords === true ? 'bg-white text-black rounded-3xl' : 'text-[#FFFFFF99] bg-[1F1F1F]'} text-[8px] md600:text-[10px] lg:text-[12px] px-1 sm:px-2 md600:px-3 md:px-4 lg:px-5 2xl:px-6 py-1`}>Auto Chords</p>
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
                                                    <div className="w-full h-full flex items-center justify-center">

                                                        {activePianoSection === 0 && (
                                                            <Piano
                                                                // audioContext={audioContext.current}
                                                                noteRange={{ first: MidiNumbers.fromNote('C0'), last: MidiNumbers.fromNote('B2') }}
                                                                playNote={playNote}
                                                                stopNote={stopNote}
                                                                //  width={800}
                                                                keyboardShortcuts={keyboardShortcuts}
                                                            />
                                                        )}
                                                        {activePianoSection === 1 && (
                                                            <Piano
                                                                // audioContext={audioContext.current}
                                                                noteRange={{ first: MidiNumbers.fromNote('C3'), last: MidiNumbers.fromNote('B5') }}
                                                                playNote={playNote}
                                                                stopNote={stopNote}
                                                                //  width={800}
                                                                keyboardShortcuts={keyboardShortcuts}
                                                            />
                                                        )}
                                                        {activePianoSection === 2 && (
                                                            <Piano
                                                                // audioContext={audioContext.current}
                                                                noteRange={{ first: MidiNumbers.fromNote('C5'), last: MidiNumbers.fromNote('C8') }}
                                                                playNote={playNote}
                                                                stopNote={stopNote}
                                                                //  width={800}
                                                                keyboardShortcuts={keyboardShortcuts}
                                                            />
                                                        )}
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
                                                        {BasicData.map((item, index) => (
                                                            <div key={index} className="bg-[#1F1F1F] text-white w-[90px] md600:w-[110px] p-1 md600:p-2 md:w-[120px] lg:w-[130px]">
                                                                <p className='text-white text-[10px] md600:text-[12px] md:text-[14px] lg:text-[16px] text-center mb-1'>{item.name}</p>
                                                                <div className="flex justify-between">
                                                                    <img src={item.image} alt="" className="w-2 h-2 md600:w-3 md600:h-3 lg:w-4 lg:h-4" />
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
                                                        <div className='bg-[#1F1F1F] ms-1 mt-1 p-1 w-[110px] h-[120px] md600:w-[100px] md600:h-[155px] md:ms-2 md:mt-2 md:p-2 md:w-[110px] md:h-[180px] lg:ms-3 lg:w-[116px] lg:h-[150px]'>
                                                            <p className='text-[#FFFFFF99] text-[10px] md600:text-[12px] md:text-[14px] '>Basic</p>

                                                            {BasicData1.map((item, index) => (
                                                                <div key={index} className="">
                                                                    <button
                                                                        className={`${isButtonSelected('basic', index) ? "bg-white text-black" : "text-[#FFFFFF] bg-transparent"} justify-center  w-[100px] mt-1  h-[25px] lg:w-[100px] lg:h-[30px]  md:mt-2 text-[8px] md600:text-[10px] rounded-md border border-[#FFFFFF1A]`}
                                                                        onClick={() => toggleButton('basic', index)}
                                                                    >
                                                                        {item.name}
                                                                    </button>
                                                                </div>
                                                            ))}
                                                        </div>
                                                        <div className='bg-[#1F1F1F] mx-1 mt-1 p-1 w-[315px] h-[120px] md600:w-[170px] md600:h-[155px] md:mx-2 lg:mx-3 md:mt-2 md:p-2 md:w-[200px] md:h-[180px] lg:w-[340px] lg:h-[150px]'>
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
                                                        </div>
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
