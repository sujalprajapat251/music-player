import React from "react";
import { Piano, KeyboardShortcuts, MidiNumbers } from "react-piano";
import "react-piano/dist/styles.css";
import * as Tone from "tone";

// Define note range
const firstNote = MidiNumbers.fromNote("c3");
const lastNote = MidiNumbers.fromNote("f4");

// Define keyboard shortcuts
const keyboardShortcuts = KeyboardShortcuts.create({
  firstNote,
  lastNote,
  keyboardConfig: KeyboardShortcuts.HOME_ROW,
});

function MyPiano() {
  // Single synth for all notes
  const synth = React.useRef(new Tone.Synth().toDestination());

  // Play note
  const playNote = (midiNumber) => {
    const note = MidiNumbers.getAttributes(midiNumber).note; // "C3", "D#4", etc.
    synth.current.triggerAttack(note);
  };

  // Stop note
  const stopNote = () => {
    synth.current.triggerRelease();
  };

  return (
    <div>
      <h2>React Piano with Sound 🎹</h2>
      <Piano
        noteRange={{ first: firstNote, last: lastNote }}
        playNote={playNote}
        stopNote={stopNote}
        width={600}
        keyboardShortcuts={keyboardShortcuts}
      />
    </div>
  );
}

export default MyPiano;