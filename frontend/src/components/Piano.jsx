import React, { useRef, useEffect, useState } from 'react'
import { Piano, KeyboardShortcuts, MidiNumbers } from 'react-piano';
import 'react-piano/dist/styles.css';
import Soundfont from 'soundfont-player';
import { IoClose } from "react-icons/io5";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { GiPianoKeys } from "react-icons/gi";

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

    // SVG circle parameters
    const size = 56;
    const stroke = 4;
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
                    style={{
                        position: "absolute",
                        top: 6,
                        left: "50%",
                        width: 3,
                        height: 16,
                        background: "#aaa",
                        borderRadius: 3,
                        transform: `translateX(-50%) rotate(${angle}deg)`,
                        transformOrigin: "bottom center",
                    }}
                />
            </div>
            <div
                style={{
                    color: "#aaa",
                    fontSize: 14,
                    marginTop: 4,
                    fontFamily: "sans-serif",
                    alignItems: "center"
                }}
            >
                {label}
            </div>
        </div>
    );
}



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

const Pianodemo = () => {

    const [showOffcanvas, setShowOffcanvas] = useState(false);
    const [currentInstrumentIndex, setCurrentInstrumentIndex] = useState(0);
    const [activeTab, setActiveTab] = useState('Instruments');
    const [activePianoSection, setActivePianoSection] = useState(0); // 0: Low, 1: Middle, 2: High

    const audioContextRef = useRef(null);
    const pianoRef = useRef(null);
    const activeAudioNodes = useRef({});
    const selectedInstrument = INSTRUMENTS[currentInstrumentIndex].id;

    useEffect(() => {
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
        Soundfont.instrument(audioContextRef.current, selectedInstrument).then((piano) => {
            pianoRef.current = piano;
        });
        return () => {
            audioContextRef.current && audioContextRef.current.close();
        };
    }, [selectedInstrument]);

    const firstNote = MidiNumbers.fromNote('C0');
    const lastNote = MidiNumbers.fromNote('C5');
    const keyboardShortcuts = KeyboardShortcuts.create({
        firstNote: firstNote,
        lastNote: lastNote,
        keyboardConfig: KeyboardShortcuts.HOME_ROW,
    });

    const playNote = (midiNumber) => {
        if (pianoRef.current) {
            const audioNode = pianoRef.current.play(midiNumber);
            activeAudioNodes.current[midiNumber] = audioNode;
        }
    };

    const stopNote = (midiNumber) => {
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

    return (
        <>
            <button className='p-2 bg-white text-black' onClick={() => setShowOffcanvas(prev => !prev)}>
                on/off
            </button>
            {showOffcanvas === true && (
                <>
                    <div class="fixed z-40 w-full h-full bg-[#1F1F1F] transition-transform  left-0 right-0 translate-y-full bottom-[480px]" tabindex="-1" aria-labelledby="drawer-swipe-label">
                        {/* Static Navbar with Tabs */}
                        <div className="bg-[#2A2A2A] p-3 border-b border-[#FFFFFF1A]">
                            <div className="flex items-center">
                                {/* Close Button */}
                                <div>
                                    <IoClose className='text-[20px] text-[#FFFFFF99] cursor-pointer justify-start' onClick={() => setShowOffcanvas(false)} />
                                </div>



                                {/* Save Preset Button
                                    <button className="bg-[#353535] text-white px-4 py-2 rounded text-sm">
                                        Save Preset
                                    </button> */}
                            </div>

                            <div></div>
                            {/* Tabs */}
                            <div className="flex space-x-8 justify-center">
                                {['Instruments', 'Chords', 'Piano Roll', 'Effects'].map((tab) => (
                                    <button
                                        key={tab}
                                        onClick={() => setActiveTab(tab)}
                                        className={`text-sm font-medium transition-colors ${activeTab === tab
                                            ? 'text-white border-b-2 border-white pb-1'
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
                                        <div className="flex items-center justify-center py-5 gap-24">
                                            {/* Instrument Selector */}
                                            <div className="bg-[#353535] p-3 rounded-lg">
                                                <div className="flex items-center justify-between">
                                                    <button
                                                        onClick={prevInstrument}
                                                        className="text-gray-400 hover:text-white transition-colors p-2"
                                                    >
                                                        <FaChevronLeft className='text-[16px]' />
                                                    </button>

                                                    <div className="flex items-center gap-5 flex-1 justify-center px-4 w-[250px]">
                                                        <div className="text-white">
                                                            <GiPianoKeys className='text-[20px]' />
                                                        </div>
                                                        <div className="">
                                                            <div className="text-white fw-bolder text-[16px]">
                                                                {INSTRUMENTS[currentInstrumentIndex].name}
                                                            </div>
                                                            <div className="text-gray-400 text-[14px]">
                                                                {INSTRUMENTS[currentInstrumentIndex].category}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <button
                                                        onClick={nextInstrument}
                                                        className="text-gray-400 hover:text-white transition-colors p-2"
                                                    >
                                                        <FaChevronRight className='text-[16px] text-[#FFFFFF99]' />
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Audio Effect Knobs */}
                                            <div className="flex space-x-6">
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
                                        <div className="w-full h-[400px] md:h-[500px] lg:h-[250px] pt-3">
                                            {/* Piano Navigation Buttons */}
                                                <div className="flex gap-5 items-center justify-between">
                                                    <div className='flex gap-5 items-center'>
                                                        <div className='border rounded-3xl border-[#FFFFFF1A]'>
                                                            <p className="text-[#FFFFFF99] text-[12px] px-6 py-1">Sustain</p>
                                                        </div>
                                                        <div className="flex items-center justify-between">
                                                            <button
                                                                onClick={() => setActivePianoSection(prev => prev > 0 ? prev - 1 : prev)}
                                                                className={`transition-colors text-white p-2 ${activePianoSection === 0 ? ' cursor-not-allowed' : ' hover:text-white'}`}
                                                                disabled={activePianoSection === 0}
                                                            >
                                                                <FaChevronLeft className='text-[16px]' />
                                                            </button>

                                                            <div className="items-center justify-center px-4 w-[100px]">

                                                                <div className="">
                                                                    <div className="text-white items-center fw-bolder text-[16px]">
                                                                        {activePianoSection === 0 ? 'Octaves' : activePianoSection === 1 ? 'Octaves' : 'Octaves'}
                                                                    </div>

                                                                </div>
                                                            </div>

                                                            <button
                                                                onClick={() => setActivePianoSection(prev => prev < 2 ? prev + 1 : prev)}
                                                                className={`transition-colors p-2 ${activePianoSection === 2 ? 'text-gray-600 cursor-not-allowed' : 'text-gray-400 hover:text-white'}`}
                                                                disabled={activePianoSection === 2}
                                                            >
                                                                <FaChevronRight className='text-[16px]' />
                                                            </button>
                                                        </div>
                                                        <div className='border rounded-3xl border-[#FFFFFF1A]'>
                                                            <p className="text-[#FFFFFF99] text-[12px] px-6 py-1">Auto Chords</p>
                                                        </div>
                                                    </div>
                                                    <div className='border rounded-3xl border-[#FFFFFF1A] ms-auto'>
                                                        <p className="text-[#FFFFFF99] text-[12px] px-6 py-1">Save Preset</p>
                                                    </div>
                                            </div>
                                            {/* Piano Container */}
                                            <div className="w-full h-[400px] md:h-[500px] lg:h-[250px] overflow-x-auto pt-3 ">
                                                <div className="w-full h-full flex items-center justify-center">

                                                    {activePianoSection === 0 && (
                                                        <Piano
                                                            noteRange={{ first: MidiNumbers.fromNote('C0'), last: MidiNumbers.fromNote('B2') }}
                                                            playNote={playNote}
                                                            stopNote={stopNote}
                                                            //  width={800}
                                                            keyboardShortcuts={keyboardShortcuts}
                                                        />
                                                    )}
                                                    {activePianoSection === 1 && (
                                                        <Piano
                                                            noteRange={{ first: MidiNumbers.fromNote('C3'), last: MidiNumbers.fromNote('B5') }}
                                                            playNote={playNote}
                                                            stopNote={stopNote}
                                                            //  width={800}
                                                            keyboardShortcuts={keyboardShortcuts}
                                                        />
                                                    )}
                                                    {activePianoSection === 2 && (
                                                        <Piano
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
                                    </>
                                )}

                                {activeTab === 'Chords' && (
                                    <div className="w-full h-[400px] md:h-[500px] lg:h-[250px] flex items-center justify-center">
                                        <div className="text-center">
                                            <h3 className="text-white text-xl font-semibold mb-4">Chords Tab</h3>
                                            <p className="text-gray-400">Chord selection and management will be here</p>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'Piano Roll' && (
                                    <div className="w-full h-[400px] md:h-[500px] lg:h-[250px] flex items-center justify-center">
                                        <div className="text-center">
                                            <h3 className="text-white text-xl font-semibold mb-4">Piano Roll Tab</h3>
                                            <p className="text-gray-400">Piano roll editor will be here</p>
                                        </div>
                                    </div>
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
            )
            }
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
