import React, { useState, useEffect, useRef } from "react";
import tunerPath from "../Images/tuner-path.png";
import { IoMdClose } from "react-icons/io";

const TunerPopup = ({ onClose }) => {
    const [isListening, setIsListening] = useState(false);
    const [currentNote, setCurrentNote] = useState("__");
    const [pitchStatus, setPitchStatus] = useState("Start Playing");

    const [frequency, setFrequency] = useState(0);
    const [cents, setCents] = useState(0);

    const audioContextRef = useRef(null);
    const analyserRef = useRef(null);
    const microphoneRef = useRef(null);
    const animationFrameRef = useRef(null);

    // Note frequencies for standard tuning (A4 = 440Hz)
    const noteFrequencies = {
        'C': [16.35, 32.70, 65.41, 130.81, 261.63, 523.25, 1046.50, 2093.00],
        'C#': [17.32, 34.65, 69.30, 138.59, 277.18, 554.37, 1108.73, 2217.46],
        'D': [18.35, 36.71, 73.42, 146.83, 293.66, 587.33, 1174.66, 2349.32],
        'D#': [19.45, 38.89, 77.78, 155.56, 311.13, 622.25, 1244.51, 2489.02],
        'E': [20.60, 41.20, 82.41, 164.81, 329.63, 659.25, 1318.51, 2637.02],
        'F': [21.83, 43.65, 87.31, 174.61, 349.23, 698.46, 1396.91, 2793.83],
        'F#': [23.12, 46.25, 92.50, 185.00, 369.99, 739.99, 1479.98, 2959.96],
        'G': [24.50, 49.00, 98.00, 196.00, 392.00, 783.99, 1567.98, 3135.96],
        'G#': [25.96, 51.91, 103.83, 207.65, 415.30, 830.61, 1661.22, 3322.44],
        'A': [27.50, 55.00, 110.00, 220.00, 440.00, 880.00, 1760.00, 3520.00],
        'A#': [29.14, 58.27, 116.54, 233.08, 466.16, 932.33, 1864.66, 3729.31],
        'B': [30.87, 61.74, 123.47, 246.94, 493.88, 987.77, 1975.53, 3951.07]
    };

    // Autocorrelation-based pitch detection
    const detectPitch = (buffer) => {
        const sampleRate = audioContextRef.current.sampleRate;
        const minPeriod = Math.floor(sampleRate / 800); // ~55Hz (A1)
        const maxPeriod = Math.floor(sampleRate / 50);  // ~800Hz (G5)

        let bestPeriod = 0;
        let bestCorrelation = 0;

        // Calculate RMS to check if there's enough signal
        let rms = 0;
        for (let i = 0; i < buffer.length; i++) {
            rms += buffer[i] * buffer[i];
        }
        rms = Math.sqrt(rms / buffer.length);

        // If signal is too weak, return 0
        if (rms < 0.01) return 0;

        for (let period = minPeriod; period < maxPeriod; period++) {
            let correlation = 0;
            for (let i = 0; i < buffer.length - period; i++) {
                correlation += buffer[i] * buffer[i + period];
            }

            if (correlation > bestCorrelation) {
                bestCorrelation = correlation;
                bestPeriod = period;
            }
        }

        if (bestPeriod > 0 && bestCorrelation > 0.3) {
            return sampleRate / bestPeriod;
        }
        return 0;
    };

    // Find closest note and calculate cents deviation
    const findClosestNote = (frequency) => {
        if (frequency < 20 || frequency > 2000) return { note: "--", octave: "", cents: 0 };

        let closestNote = "";
        let closestOctave = 0;
        let minDifference = Infinity;

        Object.entries(noteFrequencies).forEach(([note, freqs]) => {
            freqs.forEach((freq, octave) => {
                const difference = Math.abs(frequency - freq);
                if (difference < minDifference) {
                    minDifference = difference;
                    closestNote = note;
                    closestOctave = octave;
                }
            });
        });

        const targetFreq = noteFrequencies[closestNote][closestOctave];
        const cents = 1200 * Math.log2(frequency / targetFreq);

        return { note: closestNote, octave: closestOctave, cents: cents };
    };

    // Update tuner display
    const updateTunerDisplay = (frequency) => {
        if (frequency < 20) {
            setCurrentNote("__");
            setPitchStatus("Start Playing");
            setCents(0);
            return;
        }

        const { note, octave, cents } = findClosestNote(frequency);
        setCurrentNote(`${note}${octave}`);
        setFrequency(frequency);
        setCents(cents);

        // Determine pitch status with tighter tolerances like Soundtrap
        if (Math.abs(cents) < 8) {
            setPitchStatus("Perfect");
        } else if (cents < 0) {
            setPitchStatus("Low");
        } else {
            setPitchStatus("High");
        }
    };

    // Start audio analysis
    const startListening = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: false,
                    autoGainControl: false,
                    noiseSuppression: false,
                    latency: 0
                }
            });
            audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
            analyserRef.current = audioContextRef.current.createAnalyser();
            microphoneRef.current = audioContextRef.current.createMediaStreamSource(stream);

            analyserRef.current.fftSize = 4096;
            analyserRef.current.smoothingTimeConstant = 0.3;

            microphoneRef.current.connect(analyserRef.current);

            setIsListening(true);
            analyzeAudio();
        } catch (error) {
            console.error('Error accessing microphone:', error);
            alert('Could not access microphone. Please check permissions.');
        }
    };

    // Stop audio analysis
    const stopListening = () => {
        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
        }
        if (microphoneRef.current) {
            microphoneRef.current.disconnect();
        }
        if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
            audioContextRef.current.close();
        }
        setIsListening(false);
        setCurrentNote("__");
        setPitchStatus("Start Playing");
        setCents(0);
        setFrequency(0);
    };

    // Analyze audio data
    const analyzeAudio = () => {
        if (!analyserRef.current) return;

        const bufferLength = analyserRef.current.fftSize;
        const dataArray = new Float32Array(bufferLength);
        analyserRef.current.getFloatTimeDomainData(dataArray);

        const detectedFreq = detectPitch(dataArray);
        updateTunerDisplay(detectedFreq);

        animationFrameRef.current = requestAnimationFrame(analyzeAudio);
    };

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            stopListening();
        };
    }, []);

    const getStatusColor = () => {
        switch (pitchStatus) {
            case 'Perfect': return 'text-green-400';
            case 'Low': return 'text-orange-400';
            case 'High': return 'text-red-400';
            default: return 'text-gray-400';
        }
    };

    // Calculate indicator position based on cents (-50 to +50 cents range)
    const getIndicatorPosition = () => {
        const clampedCents = Math.max(-50, Math.min(50, cents));
        const percentage = ((clampedCents + 50) / 100) * 100;
        return percentage;
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
            <div className="bg-[#525056] rounded-lg shadow-lg p-6 w-full max-w-md">
                {/* Close Button */}
                <div className="text-end">
                    <button onClick={onClose} className="">
                        <IoMdClose className="h-8 w-8" />
                    </button>
                </div>

                {/* Title */}
                <h2 className="text-center text-2xl font-semibold mb-6 text-white">
                    Tuner
                </h2>
                {/* Tuner Visualization - Similar to Soundtrap */}
                <div className="mb-8">
                    {/* Background bars */}
                    <div className="relative h-20 rounded-lg overflow-hidden mb-4">
                        {/* Grid lines */}
                        <div className="absolute inset-0 flex">
                            <img src={tunerPath} alt="Tuner Path" className="w-full h-full" />
                        </div>

                        {/* Active indicator */}
                        {frequency > 0 && (
                            <>
                                {pitchStatus === "Perfect" ? (
                                    /* Green line for perfect pitch */
                                    <div className="absolute left-1/2 top-2 bottom-2 w-1 bg-green-500 transform -translate-x-0.5 rounded-full shadow-lg" />
                                ) : (
                                    /* Orange/Red bar for off-pitch */
                                    <div
                                        className={`absolute top-2 bottom-2 w-2 rounded-full shadow-lg transform -translate-x-1 transition-all duration-150 ${pitchStatus === "Low" ? 'bg-orange-500' : 'bg-red-500'
                                            }`}
                                        style={{ left: `${getIndicatorPosition()}%` }}
                                    />
                                )}
                            </>
                        )}
                    </div>
                </div>

                {/* Status */}
                <div className="text-center mb-4">
                    <p className={`text-lg font-semibold text-white ${getStatusColor()}`}>
                        {pitchStatus}
                    </p>
                </div>

                {/* Note Display */}
                <div className="text-center mb-6">
                    <p className="text-[50px] font-bold text-orange-400 mb-2">
                        {currentNote}
                    </p>
                </div>

                {/* Control Button */}
                <div className="text-center">
                    {!isListening ? (
                        <button
                            onClick={startListening}
                            className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-lg font-semibold transition-colors shadow-lg"
                        >
                            Start Tuning
                        </button>
                    ) : (
                        <button
                            onClick={stopListening}
                            className="bg-red-500 hover:bg-red-600 text-white px-8 py-3 rounded-lg font-semibold transition-colors shadow-lg"
                        >
                            Stop Tuning
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TunerPopup;