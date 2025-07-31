import React, { useRef, useEffect, useState } from 'react'
import 'react-piano/dist/styles.css';
import { IoClose } from "react-icons/io5";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { GiPianoKeys } from "react-icons/gi";
import { MdOutlinePause } from "react-icons/md";
import { FaPlay } from "react-icons/fa6";
import drum from "../Images/drum.svg";

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

    const [showOffcanvas, setShowOffcanvas] = useState(false);
    const [currentInstrumentIndex, setCurrentInstrumentIndex] = useState(0);
    const [activeTab, setActiveTab] = useState('Instruments');
    const [playingEffectId, setPlayingEffectId] = useState(null);

    // Separate state for each instrument type
    const [kickIndex, setKickIndex] = useState(0);
    const [snareIndex, setSnareIndex] = useState(0);
    const [hihatIndex, setHihatIndex] = useState(0);
    const [toopIndex, setToopIndex] = useState(0);


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

    // Instrument configuration for dynamic rendering
    const instrumentConfigs = [
        {
            id: 'kick',
            name: 'Kick',
            currentIndex: kickIndex,
            nextFunction: nextKick,
            prevFunction: prevKick,
            data: kick
        },
        {
            id: 'snare',
            name: 'Snare',
            currentIndex: snareIndex,
            nextFunction: nextSnare,
            prevFunction: prevSnare,
            data: snare
        },
        {
            id: 'hihat',
            name: 'Hi-Hat',
            currentIndex: hihatIndex,
            nextFunction: nextHihat,
            prevFunction: prevHihat,
            data: hihat
        },
        {
            id: 'toop',
            name: 'Toop',
            currentIndex: toopIndex,
            nextFunction: nextToop,
            prevFunction: prevToop,
            data: toop
        }
    ];

    return (
        <>
            <button className='p-2 bg-white text-black' onClick={() => setShowOffcanvas(prev => !prev)}>
                on/off
            </button>
            {showOffcanvas === true && (
                <>
                    <div class="fixed z-40 w-full h-full  transition-transform  left-0 right-0 translate-y-full bottom-[210px] sm:bottom-[260px] md600:bottom-[275px] md:bottom-[450px]  lg:bottom-[455px] xl:bottom-[465px] 2xl:bottom-[516px]" tabindex="-1" aria-labelledby="drawer-swipe-label">
                        {/* Static Navbar with Tabs */}
                        <div className="  border-b border-[#FFFFFF1A] h-full">
                            <div className=" bg-[#1F1F1F] flex items-center px-1 md600:px-2 md600:pt-2 lg:px-3 lg:pt-3">
                                {/* Close Button */}
                                <div>
                                    <IoClose className='text-[10px] sm:text-[12px] md600:text-[14px] md:text-[16px] lg:text-[18px] 2xl:text-[20px] text-[#FFFFFF99] cursor-pointer justify-start' onClick={() => setShowOffcanvas(false)} />
                                </div>
                            </div>
                            {/* Tabs */}
                            <div className=" bg-[#1F1F1F] flex space-x-2 sm:space-x-3 px-1 md600:space-x-4  md600:px-2 lg:space-x-6 2xl:space-x-8 justify-center  lg:px-3">
                                {['Instruments', 'Effects'].map((tab) => (
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
                                        <div className=" bg-[#1F1F1F] flex items-center justify-center pt-1 pb-1 px-2 md600:px-2 md600:pt-2 md600:pb-1 gap-10 md600:gap-12 md:gap-16 lg:pt-4 lg:pb-2 lg:px-3 lg:gap-20 2xl:pt-5 2xl:pb-3 2xl:px-3 2xl:gap-24">
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

                                            <div className="py-2 px-5 border border-[#FFFFFF1A] rounded-md">
                                                <p className="text-white">Save Preset</p>
                                            </div>
                                        </div>

                                        <div className='bg-[#141414] py-5'>
                                            <div className="flex gap-5 justify-center">
                                                <div className=" pe-5 border-r border-[#FFFFFF99] max-h-[252px] overflow-auto">
                                                    {effects?.map((effect) => (
                                                        <div key={effect?.id} className="flex gap-5 mb-2 ps-5 py-2 rounded-md w-[230px] bg-[#FFFFFF1A] hover:bg-[#FFFFFF4D]">
                                                            <button
                                                                onClick={() => handleEffectPlayPause(effect?.id)}
                                                                className='flex justify-center p-2 bg-[#FFFFFF1A] rounded-full items-center'
                                                            >
                                                                {playingEffectId === effect?.id ?
                                                                    <MdOutlinePause className='text-black text-[12px] lg:text-[10px] xl:text-[12px]' /> :
                                                                    <FaPlay className='text-black text-[12px] lg:text-[10px] xl:text-[12px]' />
                                                                }
                                                            </button>
                                                            <p className="text-white text-[14px] content-center">{effect?.name}</p>
                                                            <nbsp></nbsp>
                                                        </div>
                                                    ))}
                                                </div>
                                                <div className=" pe-3  my-auto">
                                                    {instrumentConfigs.map((instrument) => (
                                                        <div key={instrument.id} className="flex gap-5 content justify-center items-center mb-2">
                                                            <div className="p-2 rounded-full bg-[#FFFFFF1A]">
                                                                <img src={drum} alt="" className="w-4 h-4 content-center self-center" />
                                                            </div>
                                                            <div className="flex items-center w-[230px] justify-between bg-[#353535] p-1 md600:p-2 lg:p-2 rounded-lg my-1">
                                                                <button
                                                                    onClick={instrument.prevFunction}
                                                                    className="text-gray-400 hover:text-white transition-colors p-1"
                                                                >
                                                                    <FaChevronLeft className='text-[14px text-[#FFFFFF99]]' />
                                                                </button>
                                                                <div className="">
                                                                    <div className="text-white fw-bolder text-[14px] ">
                                                                        {instrument.data[instrument.currentIndex].name}
                                                                    </div>
                                                                </div>
                                                                <button
                                                                    onClick={instrument.nextFunction}
                                                                    className="text-gray-400 hover:text-white transition-colors p-1"
                                                                >
                                                                    <FaChevronRight className='text-[14px] text-[#FFFFFF99]' />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                                <div className=" pe-3 border-l border-r border-[#FFFFFF99]">
                                                    sdg
                                                </div>
                                            </div>
                                        </div>
                                    </>
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
        </>
    )
}

export default Effects2
