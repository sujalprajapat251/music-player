import React, { useState, useRef, useEffect } from 'react';
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

    return keys.reverse(); // Higher notes on top
};

const NOTES = generatePianoKeys();
const GRID_UNIT = 15; // pixels per beat

const PianoRolls = () => {
    const [notes, setNotes] = useState([]);
    const [startTime, setStartTime] = useState(null);
    const [activeNotes, setActiveNotes] = useState({});
    const timelineRef = useRef();
    let mouseDownTime = useRef(0);

    const handleMouseDown = () => {
        mouseDownTime.current = Date.now();
    };

    const handleMouseUp = (e) => {
        const elapsed = Date.now() - mouseDownTime.current;
        if (elapsed < 200) { // Only register if it's a click (not a drag)
            handleGridClick(e);
        }
    };

    useEffect(() => {
        Tone.start();
        const now = Tone.now();
        setStartTime(now);
    }, []);

    const handleKeyDown = (note) => {
        if (activeNotes[note]) return;

        const synth = new Tone.Synth().toDestination();
        const time = Tone.now();
        synth.triggerAttack(note, time);

        setActiveNotes((prev) => ({
            ...prev,
            [note]: { synth, startTime: time },
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

    const getYFromNote = (note) => NOTES.indexOf(note) * 30;

    const updateNote = (index, updates) => {
        setNotes(prev => {
            const updated = [...prev];
            updated[index] = { ...updated[index], ...updates };
            return updated;
        });
    };

    const handleGridClick = (e) => {

        const rect = timelineRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const start = Math.floor(x / (GRID_UNIT * 2));
        const noteIndex = Math.floor(y / 30);

        if (noteIndex >= 0 && noteIndex < NOTES.length) {
            const note = NOTES[noteIndex];
            setNotes(prev => [
                ...prev,
                {
                    note,
                    start,
                    duration: 1, // default duration
                },
            ]);
        }
    };

    return (
        <div className="p-4 font-sans relative">
            <h2 className="text-xl mb-4">🎹 Piano Timeline</h2>

            <div className="bg-[#35353580]  h-[350px] overflow-y-auto">
                <div className="flex w-full ">

                    {/* Piano Keys */}
                    <div className="flex flex-col w-[10%] shrink-0 bg-white">
                        {NOTES.map((note) => (
                            <button
                                key={note}
                                onMouseDown={() => handleKeyDown(note)}
                                onMouseUp={() => handleKeyUp(note)}
                                onMouseLeave={() => handleKeyUp(note)}
                                className={`h-[30px] min-h-[30px] text-xs ${note.includes('#') ? 'bg-black text-white w-[50%]' : 'bg-white w-full'} border`}
                            >
                                {note}
                            </button>
                        ))}
                    </div>

                    {/* Timeline */}
                    <div
                        className="w-[90%] relative"
                        ref={timelineRef}
                        onMouseDown={handleMouseDown}
                        onMouseUp={handleMouseUp}
                    >
                        {/* Grid Lines */}
                        <div
                            className="absolute top-0 left-0 w-full"
                            style={{ height: `${NOTES.length * 30}px`, zIndex: 0 }}
                        >
                            {NOTES.map((note) => (
                                <div
                                    key={note}
                                    className="border-t border-gray-600 h-[30px] w-full"
                                    style={{ borderTopWidth: '1px' }}
                                />
                            ))}
                        </div>

                        {/* Draggable Notes */}
                        <div
                            style={{
                                height: `${NOTES.length * 30}px`,
                                position: 'relative',
                                zIndex: 10,
                            }}
                        >
                            {notes.map((n, i) => (
                                <Rnd
                                    key={i}
                                    size={{ width: n.duration * GRID_UNIT * 2, height: 24 }}
                                    position={{ x: n.start * GRID_UNIT * 2, y: getYFromNote(n.note) }}
                                    bounds="parent"
                                    enableResizing={{ right: true }}
                                    dragAxis="both"
                                    onDragStop={(e, d) => {
                                        const snappedY = Math.round(d.y / 30) * 30;
                                        const noteIndex = Math.round(snappedY / 30);
                                        const newNote = NOTES[noteIndex];

                                        updateNote(i, {
                                            start: d.x / (GRID_UNIT * 2),
                                            note: newNote,
                                        });

                                    }}
                                    onResizeStop={(e, direction, ref, delta, position) => {
                                        const newWidth = parseFloat(ref.style.width);
                                        updateNote(i, {
                                            duration: newWidth / (GRID_UNIT * 2),
                                            start: position.x / (GRID_UNIT * 2),
                                        });

                                    }}
                                >
                                    <div className="bg-red-500 rounded w-full h-full m-1" />
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