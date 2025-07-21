import React, { useState, useEffect, useRef } from 'react';

const descriptions = {
    Q: 'Chant: Hey!', W: 'Clap', E: 'Crash',
    A: 'Closed hi-hat', S: 'Open hi-hat', D: 'Percussion',
    Z: 'Snare', X: 'Kick one', C: 'Kick two'
};

const Drum = () => {
    const [displayDescription, setDisplayDescription] = useState('Press a key or click a pad!');
    const [volume, setVolume] = useState(0.7);
    const [isRecording, setIsRecording] = useState(false);
    const [sequence, setSequence] = useState([]);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentKit, setCurrentKit] = useState('Standard');
    const audioRefs = useRef({});

    // Available drum kits with different sound configurations
    const kits = {
        'Standard': { 
            name: 'Standard Kit', 
            color: 'bg-gray-800',
            sounds: {
                'Q': { freq: 80, type: 'sine', duration: 0.3, filter: 160 },
                'W': { freq: 200, type: 'square', duration: 0.1, filter: 400 },
                'E': { freq: 300, type: 'sawtooth', duration: 0.5, filter: 600 },
                'A': { freq: 800, type: 'square', duration: 0.05, filter: 1600 },
                'S': { freq: 600, type: 'square', duration: 0.15, filter: 1200 },
                'D': { freq: 150, type: 'triangle', duration: 0.2, filter: 300 },
                'Z': { freq: 120, type: 'square', duration: 0.1, filter: 240 },
                'X': { freq: 60, type: 'sine', duration: 0.2, filter: 120 },
                'C': { freq: 50, type: 'sine', duration: 0.25, filter: 100 }
            }
        },
        'Electronic': { 
            name: 'Electronic Kit', 
            color: 'bg-purple-800',
            sounds: {
                'Q': { freq: 110, type: 'sawtooth', duration: 0.4, filter: 220 },
                'W': { freq: 400, type: 'square', duration: 0.08, filter: 800 },
                'E': { freq: 500, type: 'sawtooth', duration: 0.6, filter: 1000 },
                'A': { freq: 1200, type: 'square', duration: 0.03, filter: 2400 },
                'S': { freq: 900, type: 'square', duration: 0.12, filter: 1800 },
                'D': { freq: 250, type: 'sawtooth', duration: 0.15, filter: 500 },
                'Z': { freq: 180, type: 'sawtooth', duration: 0.08, filter: 360 },
                'X': { freq: 45, type: 'square', duration: 0.3, filter: 90 },
                'C': { freq: 35, type: 'square', duration: 0.35, filter: 70 }
            }
        },
        'Vintage': { 
            name: 'Vintage Kit', 
            color: 'bg-amber-800',
            sounds: {
                'Q': { freq: 90, type: 'triangle', duration: 0.35, filter: 180 },
                'W': { freq: 150, type: 'triangle', duration: 0.12, filter: 300 },
                'E': { freq: 250, type: 'triangle', duration: 0.7, filter: 500 },
                'A': { freq: 600, type: 'triangle', duration: 0.06, filter: 1200 },
                'S': { freq: 450, type: 'triangle', duration: 0.18, filter: 900 },
                'D': { freq: 120, type: 'sine', duration: 0.25, filter: 240 },
                'Z': { freq: 100, type: 'triangle', duration: 0.12, filter: 200 },
                'X': { freq: 70, type: 'triangle', duration: 0.25, filter: 140 },
                'C': { freq: 55, type: 'triangle', duration: 0.3, filter: 110 }
            }
        }
    };

    const createAudioContext = () => {
        if (!audioRefs.current.audioContext) {
            audioRefs.current.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
        return audioRefs.current.audioContext;
    };

    const playSound = (key) => {
        const button = document.getElementById(`pad-${key}`);
        if (!button) return;

        try {
            const audioContext = createAudioContext();
            
            // Resume audio context if suspended
            if (audioContext.state === 'suspended') {
                audioContext.resume();
            }

            // Get sound configuration for current kit
            const soundConfig = kits[currentKit].sounds[key];
            if (!soundConfig) return;

            // Create audio nodes
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            const filter = audioContext.createBiquadFilter();

            // Connect nodes
            oscillator.connect(filter);
            filter.connect(gainNode);
            gainNode.connect(audioContext.destination);

            // Configure oscillator
            oscillator.frequency.setValueAtTime(soundConfig.freq, audioContext.currentTime);
            oscillator.type = soundConfig.type;
            
            // Configure filter
            filter.frequency.setValueAtTime(soundConfig.filter, audioContext.currentTime);
            filter.Q.setValueAtTime(1, audioContext.currentTime);

            // Configure gain (volume envelope)
            gainNode.gain.setValueAtTime(0, audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(volume, audioContext.currentTime + 0.01);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + soundConfig.duration);

            // Start and stop oscillator
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + soundConfig.duration);

            // Visual feedback with kit-specific colors
            const kitColor = currentKit === 'Electronic' ? '#9333ea' : 
                           currentKit === 'Vintage' ? '#f59e0b' : '#6b7280';
            
            button.style.transform = 'scale(0.95)';
            button.style.backgroundColor = kitColor;
            button.style.boxShadow = `0 0 20px ${kitColor}`;
            
            setTimeout(() => {
                button.style.transform = 'scale(1)';
                button.style.backgroundColor = '';
                button.style.boxShadow = '';
            }, 100);

            setDisplayDescription(`${descriptions[key]} - ${kits[currentKit].name}`);

            // Add to sequence if recording
            if (isRecording) {
                setSequence(prev => [...prev, { key, time: Date.now(), kit: currentKit }]);
            }

        } catch (error) {
            console.error('Error playing sound:', error);
            setDisplayDescription('Audio not available');
        }
    };

    const initKeyboard = () => {
        const handleKeyDown = (event) => {
            const keyMap = {
                81: 'Q', 87: 'W', 69: 'E',
                65: 'A', 83: 'S', 68: 'D',
                90: 'Z', 88: 'X', 67: 'C'
            };
            
            if (keyMap[event.keyCode]) {
                event.preventDefault();
                playSound(keyMap[event.keyCode]);
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    };

    const toggleRecording = () => {
        if (isRecording) {
            setIsRecording(false);
            setDisplayDescription('Recording stopped');
        } else {
            setSequence([]);
            setIsRecording(true);
            setDisplayDescription('Recording started...');
        }
    };
    
    const playSequence = async () => {
        if (sequence.length === 0) return;
        
        setIsPlaying(true);
        setDisplayDescription('Playing sequence...');
        
        const startTime = sequence[0].time;
        const originalKit = currentKit;
        
        for (let i = 0; i < sequence.length; i++) {
            const note = sequence[i];
            const delay = note.time - startTime;
            
            setTimeout(() => {
                // Switch to the kit that was used when recording this note
                if (note.kit && note.kit !== currentKit) {
                    setCurrentKit(note.kit);
                }
                
                playSound(note.key);
                
                if (i === sequence.length - 1) {
                    setIsPlaying(false);
                    setDisplayDescription('Sequence finished');
                    // Restore original kit
                    setCurrentKit(originalKit);
                }
            }, delay / 4); // Speed up playback
        }
    };

    const clearSequence = () => {
        setSequence([]);
        setDisplayDescription('Sequence cleared');
    };

    useEffect(() => {
        const cleanup = initKeyboard();
        return cleanup;
    }, []);

    const drumPads = [
        ['Q', 'W', 'E'],
        ['A', 'S', 'D'],
        ['Z', 'X', 'C']
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 p-8">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-white mb-2">🥁 Drum Machine</h1>
                    <p className="text-gray-300">Click the pads or use your keyboard to play</p>
                </div>

                {/* Kit Selector */}
                <div className="flex justify-center mb-6">
                    <div className="bg-black/30 rounded-lg p-4 backdrop-blur-sm">
                        <label className="text-white font-semibold mb-2 block">Drum Kit:</label>
                        <select 
                            value={currentKit} 
                            onChange={(e) => setCurrentKit(e.target.value)}
                            className="bg-gray-800 text-white px-4 py-2 rounded border border-gray-600 focus:border-purple-500"
                        >
                            {Object.entries(kits).map(([key, kit]) => (
                                <option key={key} value={key}>{kit.name}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Current Kit Info */}
                <div className="text-center mb-4">
                    <div className="bg-black/20 rounded-lg p-3 backdrop-blur-sm inline-block">
                        <p className="text-white font-semibold">
                            Active Kit: <span className="text-purple-400">{kits[currentKit].name}</span>
                        </p>
                        <p className="text-gray-300 text-sm">
                            {currentKit === 'Standard' && 'Classic acoustic drum sounds'}
                            {currentKit === 'Electronic' && 'Synthetic electronic beats'}
                            {currentKit === 'Vintage' && 'Warm analog-style sounds'}
                        </p>
                    </div>
                </div>

                {/* Drum Pads */}
                <div className="grid grid-cols-3 gap-4 mb-8 max-w-md mx-auto">
                    {drumPads.map((row, rowIndex) => (
                        row.map((key) => (
                            <button
                                key={key}
                                id={`pad-${key}`}
                                className={`
                                    w-24 h-24 ${kits[currentKit].color} text-white font-bold text-xl
                                    rounded-lg border-2 border-gray-600 hover:border-purple-500
                                    transition-all duration-75 ease-out
                                    hover:scale-105 active:scale-95
                                    shadow-lg hover:shadow-purple-500/50
                                    backdrop-blur-sm
                                `}
                                onClick={() => playSound(key)}
                            >
                                {key}
                            </button>
                        ))
                    ))}
                </div>

                {/* Display */}
                <div className="text-center mb-8">
                    <div className="bg-black/50 rounded-lg p-4 backdrop-blur-sm inline-block min-w-64">
                        <p className="text-2xl font-mono text-green-400">{displayDescription}</p>
                    </div>
                </div>

                {/* Controls */}
                <div className="bg-black/30 rounded-lg p-6 backdrop-blur-sm">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Volume Control */}
                        <div className="space-y-2">
                            <label className="text-white font-semibold">Volume: {Math.round(volume * 100)}%</label>
                            <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.1"
                                value={volume}
                                onChange={(e) => setVolume(parseFloat(e.target.value))}
                                className="w-full accent-purple-500"
                            />
                        </div>

                        {/* Recording Controls */}
                        <div className="space-y-2">
                            <label className="text-white font-semibold">Recording</label>
                            <div className="flex gap-2">
                                <button
                                    onClick={toggleRecording}
                                    className={`px-4 py-2 rounded font-semibold transition-colors ${
                                        isRecording 
                                            ? 'bg-red-600 hover:bg-red-700 text-white' 
                                            : 'bg-green-600 hover:bg-green-700 text-white'
                                    }`}
                                >
                                    {isRecording ? '⏹️ Stop' : '🔴 Record'}
                                </button>
                                <button
                                    onClick={clearSequence}
                                    className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded font-semibold transition-colors"
                                    disabled={sequence.length === 0}
                                >
                                    🗑️ Clear
                                </button>
                            </div>
                        </div>

                        {/* Playback Controls */}
                        <div className="space-y-2">
                            <label className="text-white font-semibold">Playback</label>
                            <div className="flex gap-2">
                                <button
                                    onClick={playSequence}
                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-semibold transition-colors"
                                    disabled={sequence.length === 0 || isPlaying}
                                >
                                    {isPlaying ? '⏸️ Playing...' : '▶️ Play'}
                                </button>
                                <span className="text-white text-sm py-2">
                                    {sequence.length} beats
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Kit Characteristics */}
                <div className="mt-8">
                    <div className="bg-black/20 rounded-lg p-4 backdrop-blur-sm">
                        <h3 className="text-white font-semibold mb-3">Kit Characteristics:</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div className="bg-gray-800/50 p-3 rounded">
                                <h4 className="text-gray-300 font-semibold">Standard Kit</h4>
                                <p className="text-gray-400">Classic acoustic drum sounds with natural frequencies and sine/square waves</p>
                            </div>
                            <div className="bg-purple-800/50 p-3 rounded">
                                <h4 className="text-purple-300 font-semibold">Electronic Kit</h4>
                                <p className="text-purple-400">Synthetic electronic beats with higher frequencies and sawtooth waves</p>
                            </div>
                            <div className="bg-amber-800/50 p-3 rounded">
                                <h4 className="text-amber-300 font-semibold">Vintage Kit</h4>
                                <p className="text-amber-400">Warm analog-style sounds with triangle waves and mellow tones</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Instructions */}
                <div className="mt-6 text-center">
                    <div className="bg-black/20 rounded-lg p-4 backdrop-blur-sm">
                        <h3 className="text-white font-semibold mb-2">How to Play:</h3>
                        <p className="text-gray-300 text-sm">
                            Use keyboard keys Q-W-E, A-S-D, Z-X-C or click the pads to play sounds.
                            Switch between drum kits to hear different sound characteristics.
                            Record sequences with kit changes and play them back.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Drum;