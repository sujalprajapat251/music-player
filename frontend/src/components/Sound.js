import React, { useState, useEffect, useRef } from "react";
import * as Tone from "tone";

// Circular Knob Component
const CircularKnob = ({ value, min, max, step, onChange, label, unit = "" }) => {
    const [isDragging, setIsDragging] = useState(false);
    const knobRef = useRef(null);
    const startAngleRef = useRef(0);
    const startValueRef = useRef(0);

    // Convert value to angle (270 degrees range, starting from bottom-left)
    const valueToAngle = (val) => {
        const normalized = (val - min) / (max - min);
        return -135 + normalized * 270; // -135° to 135°
    };

    const angleToValue = (angle) => {
        // Normalize angle to 0-270 range
        let normalizedAngle = angle + 135;
        if (normalizedAngle < 0) normalizedAngle += 360;
        if (normalizedAngle > 270) normalizedAngle = 270;
        if (normalizedAngle < 0) normalizedAngle = 0;

        const normalized = normalizedAngle / 270;
        return min + normalized * (max - min);
    };

    const getAngleFromEvent = (event, rect) => {
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const x = event.clientX - centerX;
        const y = event.clientY - centerY;
        return Math.atan2(y, x) * (180 / Math.PI);
    };

    const handleMouseDown = (event) => {
        event.preventDefault();
        setIsDragging(true);
        const rect = knobRef.current.getBoundingClientRect();
        startAngleRef.current = getAngleFromEvent(event, rect);
        startValueRef.current = value;
    };

    const handleMouseMove = (event) => {
        if (!isDragging) return;

        const rect = knobRef.current.getBoundingClientRect();
        const currentAngle = getAngleFromEvent(event, rect);
        const angleDiff = currentAngle - startAngleRef.current;

        // Convert angle difference to value change
        const valueChange = (angleDiff / 270) * (max - min);
        let newValue = startValueRef.current + valueChange;

        // Clamp value
        newValue = Math.max(min, Math.min(max, newValue));

        // Apply step
        if (step) {
            newValue = Math.round(newValue / step) * step;
        }

        onChange(newValue);
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    useEffect(() => {
        if (isDragging) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
            return () => {
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
            };
        }
    }, [isDragging, value]);

    const currentAngle = valueToAngle(value);
    const displayValue = unit ? `${value.toFixed(1)}${unit}` : value.toFixed(2);

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            margin: '20px',
            userSelect: 'none'
        }}>
            {/* Knob Container */}
            <div
                ref={knobRef}
                onMouseDown={handleMouseDown}
                style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '50%',
                    background: 'linear-gradient(145deg, #2a2a2a, #1a1a1a)',
                    border: '2px solid #333',
                    position: 'relative',
                    cursor: 'pointer',
                    boxShadow: '0 4px 8px rgba(0,0,0,0.3), inset 0 2px 4px rgba(255,255,255,0.1)'
                }}
            >
                {/* Outer Ring */}
                <svg
                    width="80"
                    height="80"
                    style={{ position: 'absolute', top: 0, left: 0 }}
                >
                    {/* Background Arc */}
                    <path
                        d="M 15 65 A 25 25 0 1 1 65 65"
                        fill="none"
                        stroke="#333"
                        strokeWidth="3"
                        strokeLinecap="round"
                    />
                    {/* Progress Arc */}
                    <path
                        d="M 15 65 A 25 25 0 1 1 65 65"
                        fill="none"
                        stroke="#4CAF50"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeDasharray="106.8"
                        strokeDashoffset={106.8 - (106.8 * (value - min) / (max - min))}
                        style={{ transition: 'stroke-dashoffset 0.1s' }}
                    />
                </svg>

                {/* Knob Indicator */}
                <div
                    style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        width: '4px',
                        height: '25px',
                        background: '#fff',
                        borderRadius: '2px',
                        transformOrigin: '2px 2px',
                        transform: `translate(-2px, -2px) rotate(${currentAngle}deg)`,
                        transition: isDragging ? 'none' : 'transform 0.1s'
                    }}
                />

                {/* Center Dot */}
                <div
                    style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        width: '8px',
                        height: '8px',
                        background: '#fff',
                        borderRadius: '50%',
                        transform: 'translate(-4px, -4px)'
                    }}
                />
            </div>

            {/* Label */}
            <div style={{
                marginTop: '10px',
                textAlign: 'center',
                color: '#fff',
                fontSize: '14px'
            }}>
                <div style={{ fontWeight: 'bold' }}>{label}</div>
                <div style={{ fontSize: '12px', opacity: 0.8 }}>{displayValue}</div>
            </div>
        </div>
    );
};

export default function Sound() {
    const [player, setPlayer] = useState(null);
    const [autoPan, setAutoPan] = useState(null);
    const [rate, setRate] = useState(1);   // initial 1 Hz
    const [depth, setDepth] = useState(0.5); // initial 50%
    const [isPlaying, setIsPlaying] = useState(false);

    useEffect(() => {
        // Create a simple oscillator for demo since we can't load external files
        const pan = new Tone.AutoPanner(rate).toDestination();
        pan.depth.value = depth;
        pan.start();

        // Create a simple synth for demo
        const audioPlayer = new Tone.Player(require('../Audio/demo.mp3')).connect(pan);
        setPlayer(audioPlayer);

        setAutoPan(pan);
        // setPlayer(synth);

        return () => {
            audioPlayer.dispose();
            pan.dispose();
        };
    }, []);

    // Update rate live
    useEffect(() => {
        if (autoPan) autoPan.frequency.value = rate;
    }, [rate, autoPan]);

    // Update depth live
    useEffect(() => {
        if (autoPan) autoPan.depth.value = depth;
    }, [depth, autoPan]);

    const handlePlay = async () => {
        await Tone.start();
        if (player && !isPlaying) {
            player.start();
            setIsPlaying(true);
            
        }
    };

    const handleStop = () => {
        if (player && isPlaying) {
            player.stop();
            setIsPlaying(false);
        }
    };

    return (
        <div style={{
            padding: "20px",
            background: "#1a1a1a",
            color: "#fff",
            minHeight: "100vh",
            fontFamily: "Arial, sans-serif"
        }}>
            <div style={{
                background: "#2a2a2a",
                padding: "30px",
                borderRadius: "15px",
                maxWidth: "600px",
                margin: "0 auto",
                boxShadow: "0 8px 32px rgba(0,0,0,0.3)"
            }}>
                <h2 style={{
                    textAlign: "center",
                    marginBottom: "30px",
                    color: "#4CAF50",
                    fontSize: "24px"
                }}>
                    🎛 Auto Pan Effect
                </h2>

                {/* Auto Pan Header */}
                <div style={{
                    background: "#4CAF50",
                    color: "#000",
                    padding: "8px 16px",
                    borderRadius: "5px",
                    marginBottom: "20px",
                    textAlign: "center",
                    fontWeight: "bold"
                }}>
                    Auto Pan
                </div>

                {/* Knobs Container */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    gap: '40px',
                    marginBottom: '30px'
                }}>
                    <CircularKnob
                        value={rate}
                        min={0.5}
                        max={20}
                        step={0.5}
                        onChange={setRate}
                        label="Rate"
                        unit=" Hz"
                    />

                    <CircularKnob
                        value={depth}
                        min={0}
                        max={1}
                        step={0.01}
                        onChange={setDepth}
                        label="Depth"
                    />
                </div>

                {/* Control Buttons */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    gap: '15px'
                }}>
                    <button
                        onClick={handlePlay}
                        disabled={isPlaying}
                        style={{
                            padding: "12px 24px",
                            fontSize: "18px",
                            borderRadius: "10px",
                            background: isPlaying ? "#666" : "#4CAF50",
                            color: "white",
                            border: "none",
                            cursor: isPlaying ? "not-allowed" : "pointer",
                            transition: "all 0.3s"
                        }}
                    >
                        ▶ Play Demo
                    </button>

                    <button
                        onClick={handleStop}
                        disabled={!isPlaying}
                        style={{
                            padding: "12px 24px",
                            fontSize: "18px",
                            borderRadius: "10px",
                            background: !isPlaying ? "#666" : "#f44336",
                            color: "white",
                            border: "none",
                            cursor: !isPlaying ? "not-allowed" : "pointer",
                            transition: "all 0.3s"
                        }}
                    >
                        ⏹ Stop
                    </button>
                </div>

                <div style={{
                    marginTop: "20px",
                    textAlign: "center",
                    fontSize: "14px",
                    opacity: 0.7
                }}>
                    Demo plays a sine wave with auto-pan effect for 5 seconds
                </div>
            </div>
        </div>
    );
}