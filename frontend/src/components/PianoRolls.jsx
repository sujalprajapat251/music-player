import React from 'react'
import { useState, useRef, useEffect } from 'react';
import * as Tone from 'tone';
import { Rnd } from 'react-rnd';
import 'react-resizable/css/styles.css';

const generatePianoKeys = () => {
    const keys = [];
    const notesInOctave = ['A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#'];
    let octave = 0;

    for (let i = 0; i < 88; i++) {
        const note = notesInOctave[i % 12];
        keys.push(`${note}${octave}`);
        if (note === 'G#') octave++;
    }

    return keys.reverse(); // So higher pitch is at top
};

const NOTES = generatePianoKeys();
const GRID_UNIT = 15; // pixels per beat

const PianoRolls = () => {
    const [notes, setNotes] = useState([]);
    const [startTime, setStartTime] = useState(null);
    const timelineRef = useRef();
    const [activeNotes, setActiveNotes] = useState({});

    const handleKeyDown = (note) => {
        if (activeNotes[note]) return;

        const synth = new Tone.Synth().toDestination();
        const startTime = Tone.now();
        synth.triggerAttack(note, startTime);

        setActiveNotes((prev) => ({
            ...prev,
            [note]: { synth, startTime },
        }));
    };

    const handleKeyUp = (note) => {
        const noteInfo = activeNotes[note];
        if (!noteInfo) return;

        const endTime = Tone.now();
        const duration = endTime - noteInfo.startTime;

        noteInfo.synth.triggerRelease(endTime);

        const noteObj = {
            note,
            start: noteInfo.startTime - startTime,
            duration,
        };

        setNotes((prev) => [...prev, noteObj]);

        setActiveNotes((prev) => {
            const copy = { ...prev };
            delete copy[note];
            return copy;
        });
    };

    useEffect(() => {
        Tone.start();
        const now = Tone.now();
        setStartTime(now);
    }, []);

    const getYFromNote = (note) => NOTES.indexOf(note) * 30;

    const updateNote = (index, updates) => {
        setNotes(prev => {
            const updated = [...prev];
            updated[index] = { ...updated[index], ...updates };
            return updated;
        });
    };

    return (
        <div className="p-4 font-sans relative">
            <h2 className="text-xl mb-4">🎹 Piano Timeline</h2>

            <div className='bg-[#35353580]'>
                <div className="flex w-full h-[350px] overflow-y-auto ">

                    {/* Piano Keys (left) */}
                    <div className="flex flex-col w-[10%]  shrink-0 bg-white">
                        {NOTES.map((note) => (
                            <button
                                key={note}
                                onMouseDown={() => handleKeyDown(note)}
                                onMouseUp={() => handleKeyUp(note)}
                                onMouseLeave={() => handleKeyUp(note)}
                                className={` h-[30px] min-h-[30px] text-xs  ${note.includes('#') ? 'bg-black text-white w-[50%]' : 'bg-white w-full'} border`}
                            >
                                {note}
                            </button>
                        ))}
                    </div>

                    <div
                        ref={timelineRef}
                        className="w-[90%]"
                    >
                        <div style={{ height: `${NOTES.length * 30}px`, position: 'relative' }}>
                            {notes.map((n, i) => (
                                <Rnd
                                    key={i}
                                    size={{ width: n.duration * GRID_UNIT * 2, height: 24 }}
                                    position={{ x: n.start * GRID_UNIT * 2, y: getYFromNote(n.note) }}
                                    bounds="parent"
                                    enableResizing={{ right: true }}
                                    onDragStop={(e, d) => updateNote(i, { start: d.x / (GRID_UNIT * 2) })}
                                    onResizeStop={(e, direction, ref, delta, position) => {
                                        const newWidth = parseFloat(ref.style.width);
                                        updateNote(i, {
                                            duration: newWidth / (GRID_UNIT * 2),
                                            start: position.x / (GRID_UNIT * 2),
                                        });
                                    }}
                                >
                                    <div className="bg-red-500 rounded w-full h-full" />
                                </Rnd>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PianoRolls;