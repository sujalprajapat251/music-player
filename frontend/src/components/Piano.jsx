import React, { useRef, useState } from "react";
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

// Helper to convert polar to cartesian
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

function Knob({ label = "Bite", min = -135, max = 135 }) {
  const [angle, setAngle] = useState(min);
  const knobRef = useRef(null);
  const dragging = useRef(false);
  const lastY = useRef(0);

  // SVG circle parameters
  const size = 120;
  const stroke = 8;
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
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: 40 }}>
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
            fill="#222"
          />
          {/* Colored arc (top half, up to value) */}
          <path
            d={fgArc}
            stroke="#bbb"
            strokeWidth={stroke}
            fill="none"
            strokeLinecap="round"
          />
        </svg>
        {/* Indicator line */}
        <div
          style={{
            position: "absolute",
            top: 12,
            left: "50%",
            width: 6,
            height: 32,
            background: "#aaa",
            borderRadius: 3,
            transform: `translateX(-50%) rotate(${angle}deg)`,
            transformOrigin: "bottom center",
          }}
        />
      </div>
      <div style={{ color: "#aaa", fontSize: 32, marginTop: 16, fontFamily: "sans-serif" }}>{label}</div>
    </div>
  );
}

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
    <>
      <h2>React Piano with Sound 🎹</h2>
      <Piano
        noteRange={{ first: firstNote, last: lastNote }}
        playNote={playNote}
        stopNote={stopNote}
        width={600}
        keyboardShortcuts={keyboardShortcuts}
      />

      {/* Knob UI */}
      <Knob />


    </>
  );
}

export default MyPiano; 