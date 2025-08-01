import React, { useEffect, useRef } from 'react';
import * as Tone from 'tone';

const chords = [
  { name: 'C', notes: ['C4', 'E4', 'G4'], key: 'Q' },
  { name: 'Dm', notes: ['D4', 'F4', 'A4'], key: 'W' },
  { name: 'Em', notes: ['E4', 'G4', 'B4'], key: 'E' },
  { name: 'F', notes: ['F4', 'A4', 'C5'], key: 'R' },
  { name: 'G', notes: ['G3', 'B3', 'D4'], key: 'A' },
  { name: 'Am', notes: ['A3', 'C4', 'E4'], key: 'S' },
  { name: 'Bdim', notes: ['B3', 'D4', 'F4'], key: 'D' },
  { name: 'C7', notes: ['C4', 'E4', 'G4', 'Bb4'], key: 'F' },
];

function ChordPlayer() {
  const synthRef = useRef(null);

  useEffect(() => {
    // Setup synth
    synthRef.current = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'triangle' },
      envelope: {
        attack: 0.01,
        decay: 0.1,
        sustain: 0.3,
        release: 1,
      },
      volume: -10,
    }).toDestination();

    // Optional: Keyboard trigger
    const handleKeyPress = (e) => {
      const chord = chords.find(c => c.key.toLowerCase() === e.key.toLowerCase());
      if (chord) {
        playChord(chord.notes);
      }
    };
    window.addEventListener('keydown', handleKeyPress);

    return () => {
      synthRef.current?.dispose();
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, []);

  const playChord = (notes) => {
    if (synthRef.current) {
      synthRef.current.triggerAttackRelease(notes, '1n'); // Longer duration
    }
  };

  return (
    <div className="grid grid-cols-4 gap-4 p-4 bg-neutral-900 text-white rounded-lg">
      {chords.map((chord, index) => (
        <button
          key={index}
          className="bg-neutral-800 hover:bg-neutral-700 px-4 py-6 rounded-lg shadow text-lg font-bold relative"
          onClick={() => playChord(chord.notes)}
        >
          {chord.name}
          <span className="absolute bottom-1 right-2 text-xs text-gray-400">
            {chord.key}
          </span>
        </button>
      ))}
    </div>
  );
}

export default ChordPlayer;
