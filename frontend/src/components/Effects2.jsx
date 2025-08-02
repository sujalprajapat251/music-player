import React, { useRef, useEffect, useState } from 'react'
import 'react-piano/dist/styles.css';
import { IoClose } from "react-icons/io5";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { GiPianoKeys } from "react-icons/gi";
import { MdOutlinePause } from "react-icons/md";
import { FaPlay } from "react-icons/fa6";
import { IoSearch } from 'react-icons/io5';
import drum from "../Images/drum.svg";
import Bhopu from "../Images/Bhopu.svg";
import piano from "../Images/piano.svg";
import Drumkit from "../Images/Drumgroup.svg";
import { useTheme } from '../Utils/ThemeContext';
import { useDispatch, useSelector } from 'react-redux';
import { removeEffect, updateEffectParameter, setShowEffectsLibrary, addEffect } from '../Redux/Slice/effects.slice';

// Import effect images
import Bitcrushar from "../Images/Bitcrushar.svg";
import ClassicDist from "../Images/ClassicDist.svg";
import Clipper from "../Images/Clipper.svg";
import Crusher from "../Images/Crusher.svg";
import Fuzz from "../Images/Fuzz.svg";
import JuicyDistrotion from "../Images/Juicy Distrotion.svg";
import Overdrive from "../Images/Overdrive.svg";
import AutoPan from "../Images/Auto Pan.svg";
import AutoWah from "../Images/Auto-Wah.svg";
import Chorus from "../Images/Chorus.svg";
import Flanger from "../Images/Flanger.svg";
import InstantSidechain from "../Images/Instant Sidechain.svg";
import Phaser from "../Images/Phaser.svg";
import PitchShifter from "../Images/PitchShifter.svg";
import Rotary from "../Images/Rotary.svg";
import RotaryPro from "../Images/Rotary Pro.svg";
import StereoChorus from "../Images/Stereo Chorus.svg";
import TapeWobble from "../Images/Tape Wobble.svg";

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
            if (window.innerWidth >= 425) return 36;  // sm
            return 26; // xs (mobile)
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
                <label className="text-[8px] md600:text-[10px] md:text-[12px] lg:text-[14px] text-[#FFFFFF]">{label}</label>
                <span className="text-[10px] md600:text-[12px] md:text-[14px] text-[#FFFFFF99] outline-none focus:outline-none">{value}{unit}</span>
            </div>

            {/* Slider Container */}
            <div className="relative">
                {/* Custom styled range input */}
                <input type="range" min={min} max={max} step={step} value={value} onChange={handleChange} className="w-full h-1 bg-[#444] rounded-lg appearance-none cursor-pointer slider"
                    style={{ background: `linear-gradient(to right, #bbb 0%, #bbb ${percentage}%, #444 ${percentage}%, #444 100%)`}}/>
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

const kick = [
    { id: 1, name: "Toronto R&B" },
    { id: 2, name: "Perth Psych Rock" },
    { id: 3, name: "Classic House" },
    { id: 4, name: "Malibu Surf" },
    { id: 5, name: "Reggaeton Shake" },
    { id: 6, name: "Toronto R&B" },
    { id: 7, name: "Malibu Surf" },
    { id: 8, name: "Reggaeton Shake" }
]
const snare = [
    { id: 1, name: "Toronto" },
    { id: 2, name: "Perth Psych Rock" },
    { id: 3, name: "Classic House" },
    { id: 4, name: "Malibu Surf" },
    { id: 5, name: "Reggaeton Shake" },
    { id: 6, name: "Toronto R&B" },
    { id: 7, name: "Malibu Surf" },
    { id: 8, name: "Reggaeton Shake" }
]
const hihat = [
    { id: 1, name: "R&B" },
    { id: 2, name: "Perth Psych Rock" },
    { id: 3, name: "Classic House" },
    { id: 4, name: "Malibu Surf" },
    { id: 5, name: "Reggaeton Shake" },
    { id: 6, name: "Toronto R&B" },
    { id: 7, name: "Malibu Surf" },
    { id: 8, name: "Reggaeton Shake" }
]

const toop = [
    { id: 1, name: "R&B" },
    { id: 2, name: "Perth Psych Rock" },
    { id: 3, name: "Classic House" },
    { id: 4, name: "Malibu Surf" },
    { id: 5, name: "Reggaeton Shake" },
    { id: 6, name: "Toronto R&B" },
    { id: 7, name: "Malibu Surf" },
    { id: 8, name: "Reggaeton Shake" }
]

const effects = [
    { id: 1, name: "Toronto R&B" },
    { id: 2, name: "Perth Psych Rock" },
    { id: 3, name: "Classic House" },
    { id: 4, name: "Malibu Surf" },
    { id: 5, name: "Reggaeton Shake" },
    { id: 6, name: "Toronto R&B" },
    { id: 7, name: "Malibu Surf" },
    { id: 8, name: "Reggaeton Shake" }
];



const Effects2 = () => {

    const { isDark } = useTheme();
    const dispatch = useDispatch();

    const [volume, setVolume] = useState(25);
    const [volume1, setVolume1] = useState(50);
    const [volume2, setVolume2] = useState(75);

    const [showOffcanvas, setShowOffcanvas] = useState(false);
    const [currentInstrumentIndex, setCurrentInstrumentIndex] = useState(0);
    const [activeTab, setActiveTab] = useState('Instruments');
    const [playingEffectId, setPlayingEffectId] = useState(null);

    // Get effects state from Redux
    const { activeEffects, showEffectsLibrary, effectsLibrary } = useSelector((state) => state.effects);
    console.log("activeEffects",activeEffects, "showEffectsLibrary", showEffectsLibrary, );
    

    // Local state for effects library
    const [effectsSearchTerm, setEffectsSearchTerm] = useState('');
    const [selectedEffectCategory, setSelectedEffectCategory] = useState(null);

    // Separate state for each instrument type
    const [kickIndex, setKickIndex] = useState(0);
    const [snareIndex, setSnareIndex] = useState(0);
    const [hihatIndex, setHihatIndex] = useState(0);
    const [toopIndex, setToopIndex] = useState(0);

    const [toggles, setToggles] = useState(Array(4).fill(false));
    const [humanizeToggle, setHumanizeToggle] = useState(false);

    const handleToggle = (idx) => {
        setToggles(prev => prev.map((val, i) => i === idx ? !val : val));
    };

    const handleHumanizeToggle = () => {
        setHumanizeToggle(prev => !prev);
    };

    // Separate navigation functions for each instrument
    const nextKick = () => {
        setKickIndex((prev) => prev === kick.length - 1 ? 0 : prev + 1);
    };

    const prevKick = () => {
        setKickIndex((prev) => prev === 0 ? kick.length - 1 : prev - 1);
    };

    const nextSnare = () => {
        setSnareIndex((prev) => prev === kick.length - 1 ? 0 : prev + 1);
    };

    const prevSnare = () => {
        setSnareIndex((prev) => prev === 0 ? kick.length - 1 : prev - 1);
    };

    const nextHihat = () => {
        setHihatIndex((prev) => prev === kick.length - 1 ? 0 : prev + 1);
    };

    const prevHihat = () => {
        setHihatIndex((prev) => prev === 0 ? kick.length - 1 : prev - 1);
    };

    const nextToop = () => {
        setToopIndex((prev) => prev === kick.length - 1 ? 0 : prev + 1);
    };

    const prevToop = () => {
        setToopIndex((prev) => prev === 0 ? kick.length - 1 : prev - 1);
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

    const handleEffectPlayPause = (effectId) => {
        if (playingEffectId === effectId) {
            setPlayingEffectId(null);
        } else {
            setPlayingEffectId(effectId);
        }
    };

    // New functions for effects management
    const handleRemoveEffect = (instanceId) => {
        dispatch(removeEffect(instanceId));
    };

    const handleEffectsSearchChange = (e) => {
        setEffectsSearchTerm(e.target.value);
        if (selectedEffectCategory && !e.target.value.toLowerCase().includes(selectedEffectCategory.toLowerCase())) {
            setSelectedEffectCategory(null);
        }
    };

    const handleEffectCategoryClick = (categoryName) => {
        if (selectedEffectCategory === categoryName) {
            setSelectedEffectCategory(null);
            setEffectsSearchTerm('');
        } else {
            setSelectedEffectCategory(categoryName);
            setEffectsSearchTerm(categoryName);
        }
    };

    const handleAddEffectFromLibrary = (effect) => {
        dispatch(addEffect(effect));
        dispatch(setShowEffectsLibrary(false));
        setEffectsSearchTerm('');
        setSelectedEffectCategory(null);
    };

    // Filter effects based on search and category
    const filteredEffects = effectsLibrary.filter(effect => {
        const matchesSearch = effect.name.toLowerCase().includes(effectsSearchTerm.toLowerCase());
        const matchesCategory = !selectedEffectCategory || effect.category === selectedEffectCategory;
        return matchesSearch && matchesCategory;
    });

    // Get unique categories
    const categories = [...new Set(effectsLibrary.map(effect => effect.category))];

    // Instrument configuration for dynamic rendering
    const instrumentConfigs = [
        {
            id: 'kick',
            name: 'Kick',
            image: drum,
            currentIndex: kickIndex,
            nextFunction: nextKick,
            prevFunction: prevKick,
            data: kick
        },
        {
            id: 'snare',
            name: 'Snare',
            image: Bhopu,
            currentIndex: snareIndex,
            nextFunction: nextSnare,
            prevFunction: prevSnare,
            data: snare
        },
        {
            id: 'hihat',
            name: 'Hi-Hat',
            image: piano,
            currentIndex: hihatIndex,
            nextFunction: nextHihat,
            prevFunction: prevHihat,
            data: hihat
        },
        {
            id: 'toop',
            name: 'Toop',
            image: Drumkit,
            currentIndex: toopIndex,
            nextFunction: nextToop,
            prevFunction: prevToop,
            data: toop
        }
    ];

    return (
    <>
    <button className='p-2 bg-white text-black' onClick={() => setShowOffcanvas(prev => !prev)}>on/off</button>
    {showOffcanvas === true && (
        <>
        <div class="fixed z-40 w-full h-full  transition-transform  left-0 right-0 translate-y-full bottom-[210px] sm:bottom-[337px] md600:bottom-[363px] md:bottom-[450px]  lg:bottom-[483px] xl:bottom-[492px] 2xl:bottom-[516px]" tabindex="-1" aria-labelledby="drawer-swipe-label">
            {/* Static Navbar with Tabs */}
            <div className="  border-b border-[#FFFFFF1A] h-full">
                <div className=" bg-[#1F1F1F] flex items-center px-1md600:px-2 md600:pt-2 lg:px-3 lg:pt-3">
                    {/* Close Button */}
                    <div>
                        <IoClose className='text-[10px] sm:text-[12px] md600:text-[14px] md:text-[16px] lg:text-[18px] 2xl:text-[20px] text-[#FFFFFF99] cursor-pointer justify-start' onClick={() => setShowOffcanvas(false)} />
                    </div>
                </div>
                {/* Tabs */}
                <div className=" bg-[#1F1F1F] flex space-x-2 pb-3 sm:space-x-3 px-1 md600:space-x-4  md600:px-2 lg:space-x-6 2xl:space-x-8 justify-center  lg:px-3">
                    {['Instruments', 'Effects'].map((tab) => (
                        <button key={tab} onClick={() => setActiveTab(tab)} className={`text-[8px] md600:text-[10px] md:text-[12px]  lg:text-[14px] 2xl:text-[16px] font-medium transition-colors ${activeTab === tab ? 'text-white border-b-2 border-white ' : 'text-gray-400 hover:text-white'}`}>
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Instrument Selector and Audio Knobs - Only show when Instruments tab is active */}
                <div className=''>
                    {activeTab === 'Instruments' && (
                        <>
                        <div className=" bg-[#1F1F1F] flex items-center justify-center pt-1 pb-1 px-2 md600:px-2 md600:pt-2 md600:pb-1 gap-10 md600:gap-12 md:gap-16 lg:pt-4 lg:pb-2 lg:px-3 lg:gap-20 2xl:pt-5 2xl:pb-3 2xl:px-3 2xl:gap-24">
                            {/* Instrument Selector */}
                            <div className="bg-[#353535] p-1 md600:p-2 lg:p-3 rounded-lg">
                                <div className="flex items-center justify-between">
                                    <button onClick={prevInstrument} className="text-gray-400 hover:text-white transition-colors p-1 md600:p-2">
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
                                    <button onClick={nextInstrument} className="text-gray-400 hover:text-white transition-colors p-1 lg:p-2">
                                        <FaChevronRight className='text-[8px] md600:text-[10px] md:text-[12px] lg:text-[14px] 2xl:text-[16px] text-[#FFFFFF99]' />
                                    </button>
                                </div>
                            </div>

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
                            <div className="py-1 lg:py-2 sm:px-3 md:px-4 xl:px-5 border border-[#FFFFFF1A] rounded-md">
                                <p className="text-white sm:text-[12px] lg:text-[14px]">Save Preset</p>
                            </div>
                        </div>
                        <div className='bg-[#141414] sm:py-3 md:py-4 lg:py-5 max-w-full md600:w-full md600:justify-center flex items-center overflow-auto'>
                            <div className="flex sm:gap-3 md:gap-4 lg:gap-5 justify-center">
                                <div className=" sm:pe-3 md:pe-4 lg:pe-5 border-r border-[#FFFFFF99] sm:max-h-[200px] md:max-h-[247px] lg:max-h-[245px] xl:max-h-[252px] overflow-auto scroll">
                                    {effects?.map((effect) => (
                                        <div key={effect?.id} className="flex sm:gap-3 md:gap-4 lg:gap-5 mb-1 md:mb-2 sm:ps-3 md:ps-4 lg:ps-5 py-1 md:py-2 rounded-md w-[138px] md600:w-[138px] md:w-[176px] lg:w-[230px] bg-[#FFFFFF1A] hover:bg-[#FFFFFF4D]">
                                            <button onClick={() => handleEffectPlayPause(effect?.id)} className='flex justify-center p-1 md:p-2 bg-[#FFFFFF1A] rounded-full items-center'>
                                                {playingEffectId === effect?.id ?
                                                    <MdOutlinePause className='text-black sm:text-[10px] md:text-[12px] lg:text-[10px] xl:text-[12px]' /> :
                                                    <FaPlay className='text-black sm:text-[10px] md:text-[12px] lg:text-[10px] xl:text-[12px]' />
                                                }
                                            </button>
                                            <p className="text-white sm:text-[10px] md:text-[12px] lg:text-[14px] content-center">{effect?.name}</p>
                                            <nbsp></nbsp>
                                        </div>
                                    ))}
                                </div>
                                <div className=" sm:pe-2 lg:pe-3  my-auto">
                                    {instrumentConfigs.map((instrument, index) => (
                                        <>
                                            <div key={instrument.id} className="flex sm:gap-3 md:gap-4 lg:gap-5 content justify-center items-center sm:mb-2 lg:mb-3">
                                                <div className="p-1 md:p-2 rounded-full bg-[#FFFFFF1A]">
                                                    <img src={instrument?.image} alt="" className="sm:w-3 sm:h-3 lg:w-4 lg:h-4 content-center self-center" />
                                                </div>
                                                <div className="flex items-center sm:w-[136px] md:w-[155px] lg:w-[230px] justify-between bg-[#353535] p-1 sm:p-2 lg:p-2 rounded-lg md:my-1">
                                                    <button onClick={instrument.prevFunction} className="text-gray-400 hover:text-white transition-colors p-1">
                                                        <FaChevronLeft className='sm:text-[10px] md:text-[12px] lg:text-[14px] text-[#FFFFFF99]' />
                                                    </button>
                                                    <div className="">
                                                        <div className="text-white fw-bolder sm:text-[10px] md:text-[12px] lg:text-[14px] ">{instrument.data[instrument.currentIndex].name}</div>
                                                    </div>
                                                    <button onClick={instrument.nextFunction} className="text-gray-400 hover:text-white transition-colors p-1">
                                                        <FaChevronRight className='sm:text-[10px] md:text-[12px] lg:text-[14px] text-[#FFFFFF99]' />
                                                    </button>
                                                </div>
                                                <div>
                                                    <div className="flex  items-center justify-center sm:gap-4 md:gap-6 lg:gap-8">
                                                        <div className="flex items-center sm:gap-2 md:gap-3 lg:gap-4">

                                                            {/* Toggle Switch */}
                                                            <div onClick={() => handleToggle(index)} className={`relative w-8 h-4 rounded-full cursor-pointer transition-colors duration-300 ${toggles[index] ? 'bg-white' : 'bg-[#FFFFFF1A]'}`}>
                                                                {/* Toggle Circle */}
                                                                <div className={`absolute top-0.5 w-3 h-3  rounded-full transition-transform duration-300 ${toggles[index] ? 'translate-x-4 bg-black' : 'translate-x-1 bg-white'}`}/>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <p className="text-white text-[10px] md:text-[12px] lg:text-[14px] mt-1 md:mt-2">HalfTime</p>
                                                </div>
                                            </div>
                                        </>
                                    ))}
                                </div >
                                <div className="ps-1 md:ps-2 lg:ps-3 border-l border-[#FFFFFF99]">
                                    <div className="flex sm:gap-2 sm:mt-4 md:gap-4 md:mt-6 lg:gap-5 lg:mt-7 items-center">
                                        <p className="text-white sm:text-[10px] md:text-[12px] lg:text-[14px]">Complexity</p>
                                        <div className=" sm:w-28  md:w-32 lg:w-40 2xl:w-48  pb-1 ">
                                            <input type="range" min="0" max="100" value={volume} onChange={(e) => setVolume(e.target.value)} className="w-full h-1 lg:h-2 bg-[#2B2B2B]  rounded-lg appearance-none cursor-pointer slider outline-none focus:outline-none"
                                                style={{ background: isDark ? `linear-gradient(to right, #ffffff 0%, #ffffff ${volume}%, #2B2B2B ${volume}%, #2B2B2B 100%)` : `linear-gradient(to right, #141414 0%, #141414 ${volume}%, #1414141A ${volume}%, #1414141A 100%)`}}/>
                                        </div>
                                    </div>
                                    <div className="flex sm:gap-3 sm:mt-4 md:gap-6 md:mt-6 lg:gap-7  lg:mt-7 items-center">
                                        <p className="text-white sm:text-[10px] md:text-[12px] lg:text-[14px]">Loudness</p>
                                        <div className="sm:w-28 md:w-32 lg:w-40 2xl:w-48  pb-1 ">
                                            <input type="range" min="0" max="100" value={volume1} onChange={(e) => setVolume1(e.target.value)} className="w-full h-1 lg:h-2 bg-[#2B2B2B]  rounded-lg appearance-none cursor-pointer slider outline-none focus:outline-none"
                                                style={{ background: isDark ? `linear-gradient(to right, #ffffff 0%, #ffffff ${volume1}%, #2B2B2B ${volume1}%, #2B2B2B 100%)` : `linear-gradient(to right, #141414 0%, #141414 ${volume1}%, #1414141A ${volume1}%, #1414141A 100%)`}}/>
                                        </div>
                                    </div>
                                    <div className="flex sm:gap-9 md:gap-14 md:mt-6 lg:gap-16 sm:mt-4 lg:mt-7 items-center">
                                        <p className="text-white sm:text-[12px] md:text-[12px] lg:text-[14px]">Fills</p>
                                        <div className="sm:w-28 md:w-32 lg:w-40 2xl:w-48  pb-1 ">
                                            <input type="range" min="0" max="100" value={volume2} onChange={(e) => setVolume2(e.target.value)} className="w-full h-1 lg:h-2 bg-[#2B2B2B]  rounded-lg appearance-none cursor-pointer slider outline-none focus:outline-none"
                                                style={{
                                                    background: isDark ? `linear-gradient(to right, #ffffff 0%, #ffffff ${volume2}%, #2B2B2B ${volume2}%, #2B2B2B 100%)` : `linear-gradient(to right, #141414 0%, #141414 ${volume2}%, #1414141A ${volume2}%, #1414141A 100%)`}}/>
                                        </div>
                                    </div>
                                    <div className="flex sm:gap-1 sm:mt-4 md:gap-4 md:mt-6 lg:gap-5 lg:mt-7 items-center">
                                        <p className="text-white sm:text-[10px] md:text-[12px] lg:text-[14px]">Humanize</p>
                                        <div className="flex  items-center justify-center md:gap-6 lg:gap-8">
                                            <div className="flex items-center gap-4">

                                                {/* Toggle Switch */}
                                                <div onClick={handleHumanizeToggle} className={`relative w-8 h-4 rounded-full cursor-pointer transition-colors duration-300 ${humanizeToggle ? 'bg-white' : 'bg-[#FFFFFF1A]'}`}>
                                                    {/* Toggle Circle */}
                                                    <div className={`absolute top-0.5 w-3 h-3  rounded-full transition-transform duration-300 ${humanizeToggle ? 'translate-x-4 bg-black' : 'translate-x-1 bg-white'}`}/>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        </>
                    )}

                    {activeTab === 'Effects' && (
                        <div className="w-full overflow-x-auto">
                        <div className="flex items-center p-4 min-w-max bg-black">
                          <div className="flex gap-4 min-w-max">
                            {activeEffects.map((effect) => (
                              <div key={effect.instanceId} className="w-64 sm:w-56 md:w-64 h-[342px] bg-[#1a1a1a] rounded-xl overflow-hidden shadow-lg text-white flex flex-col shrink-0">
                                <div className="flex items-center justify-between px-4 py-3" style={{ backgroundColor: effect.color }}>
                                  <button className="text-white text-lg">🔌</button>
                                  <h2 className="text-sm font-medium text-center flex-1">{effect.name}</h2>
                                  <button className="text-white text-lg hover:text-red-400 transition-colors" onClick={() => handleRemoveEffect(effect.instanceId)}>✖</button>
                                </div>
                                {effect.image && (
                                  <div className="flex-1 w-full flex items-center justify-center">
                                    <img src={effect.image} alt={effect.name} className="w-full h-full object-cover"/>
                                  </div>
                                )}
                              </div>
                            ))}
                            {activeEffects.length < effectsLibrary?.length && (
                              <div className="w-64 sm:w-56 md:w-64 h-[342px] bg-[#1a1a1a] rounded-xl flex flex-col items-center justify-center text-white cursor-pointer hover:bg-[#2a2a2a] transition-colors shrink-0">
                                <div className="w-14 h-14 bg-white text-black rounded-full flex items-center justify-center text-2xl font-bold mb-4">+</div>
                                <p className="text-center text-sm leading-snug">Select from the<br />effects library</p>
                              </div>
                            )}
                            {Array.from({ length: 3 - activeEffects.length - 1 }, (_, index) => (
                              <div key={index} className="w-64 sm:w-56 md:w-64 h-[342px] bg-[#1a1a1a] rounded-xl shrink-0"></div>
                            ))}
                          </div>
                        </div>
                      </div>                      
                    )}
                </div>
            </div>
        </div>
        </>
    )}

    {/* Effects Library Modal */}
    {showEffectsLibrary && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-[#1a1a1a] rounded-lg w-full max-w-4xl max-h-[80vh] overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-[#FFFFFF1A]">
                    <h2 className="text-white text-lg font-medium">Effects Library</h2>
                    <button className="text-white text-xl hover:text-gray-400 transition-colors"onClick={() => dispatch(setShowEffectsLibrary(false))}>✖</button>
                </div>

                {/* Search and Categories */}
                <div className="p-4 border-b border-[#FFFFFF1A]">
                    <div className="relative mb-4">
                        <IoSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input type="text" placeholder="Search effects..." className="w-full bg-[#2a2a2a] border border-[#FFFFFF1A] text-white placeholder-gray-400 rounded-md pl-10 pr-4 py-2 outline-none focus:border-white transition-colors"value={effectsSearchTerm}onChange={handleEffectsSearchChange}/>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {categories.map((category) => {
                            const isSelected = selectedEffectCategory === category;
                            return (
                                <button key={category} className={`px-3 py-1 rounded-md text-xs transition-colors ${ isSelected ? 'bg-white text-black' : 'bg-[#2a2a2a] text-white hover:bg-[#3a3a3a]'}`} onClick={() => handleEffectCategoryClick(category)}>{category}</button>
                            );
                        })}
                    </div>
                </div>

                {/* Effects Grid */}
                <div className="p-4 overflow-y-auto max-h-[60vh]">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {filteredEffects.map((effect) => (
                            <div key={effect.id}className="bg-[#2a2a2a] rounded-lg p-4 cursor-pointer hover:bg-[#3a3a3a] transition-colors" onClick={() => handleAddEffectFromLibrary(effect)}>
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <span className="text-white text-sm font-medium">{effect.name}</span>
                                    </div>
                                    {effect.subscription && (
                                        <span className="text-xs bg-yellow-500 text-black px-2 py-1 rounded">PRO</span>
                                    )}
                                </div>
                                <div className="text-gray-400 text-xs">{effect.category}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )}
    </>
    )
}

export default Effects2
