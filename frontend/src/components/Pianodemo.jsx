import React, { useRef, useEffect, useState } from 'react'
import { Piano, KeyboardShortcuts, MidiNumbers } from 'react-piano';
import 'react-piano/dist/styles.css';
import Soundfont from 'soundfont-player';

const INSTRUMENTS = [
  'acoustic_grand_piano','Flopp', 'whistle', 'fx_1_rain', 'fx_2_soundtrack', 'fx_3_crystal', 'fx_4_atmosphere', 'fx_5_brightness', 'fx_6_goblins', 'fx_7_echoes', 'fx_8_scifi', 'glockenspiel', 'guitar_fret_noise', 'guitar_harmonics', 'gunshot', 'harmonica', 'harpsichord', 'helicopter', 'honkytonk_piano', 'kalimba', 'koto'

];

const Pianodemo = () => {
    const audioContextRef = useRef(null);
    const pianoRef = useRef(null);
    const activeAudioNodes = useRef({});
    const [selectedInstrument, setSelectedInstrument] = useState('acoustic_grand_piano');

    useEffect(() => {
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
        Soundfont.instrument(audioContextRef.current, selectedInstrument).then((piano) => {
            pianoRef.current = piano;
        });
        return () => {
            audioContextRef.current && audioContextRef.current.close();
        };
    }, [selectedInstrument]);

    const firstNote = MidiNumbers.fromNote('c3');
    const lastNote = MidiNumbers.fromNote('f5');
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

    return (
        <>
            <div>
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
            />
        </>
    )
}

export default Pianodemo
