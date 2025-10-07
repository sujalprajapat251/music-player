import React, { useState, useEffect, useRef } from 'react';
import { AudioEffectsProcessor } from '../Utils/audioEffectsProcessor';

/**
 * Demo component to test the Fuzz effect with Grain, Bite, and Low Cut parameters
 * This demonstrates how changing parameters affects the sound characteristics
 */
const FuzzEffectDemo = () => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [parameters, setParameters] = useState({
        grain: 0.5,  // Fuzz intensity
        bite: 0.5,   // High-frequency emphasis  
        lowCut: 0.5  // Low-frequency cut
    });
    
    const audioContextRef = useRef(null);
    const effectsProcessorRef = useRef(null);
    const oscillatorRef = useRef(null);
    const effectChainRef = useRef(null);

    useEffect(() => {
        // Initialize audio context and effects processor
        if (!audioContextRef.current) {
            audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
            effectsProcessorRef.current = new AudioEffectsProcessor(audioContextRef.current);
        }

        return () => {
            if (oscillatorRef.current) {
                try {
                    oscillatorRef.current.stop();
                } catch (e) {
                    // Oscillator may already be stopped
                }
            }
            if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
                audioContextRef.current.close();
            }
        };
    }, []);

    const startDemo = async () => {
        if (!audioContextRef.current || !effectsProcessorRef.current) return;

        try {
            // Resume audio context if suspended
            if (audioContextRef.current.state === 'suspended') {
                await audioContextRef.current.resume();
            }

            // Create oscillator for demo tone
            const oscillator = audioContextRef.current.createOscillator();
            oscillator.type = 'sawtooth'; // Rich harmonic content for better fuzz demo
            oscillator.frequency.setValueAtTime(220, audioContextRef.current.currentTime); // A3 note

            // Create and apply Fuzz effect
            const effectChain = effectsProcessorRef.current.createFuzz(parameters);
            
            // Connect: Oscillator -> Fuzz Effect -> Destination
            oscillator.connect(effectChain.input);
            effectChain.output.connect(audioContextRef.current.destination);

            // Start oscillator
            oscillator.start();
            
            // Store references
            oscillatorRef.current = oscillator;
            effectChainRef.current = effectChain;
            
            setIsPlaying(true);

            // Auto-stop after 3 seconds
            setTimeout(() => {
                stopDemo();
            }, 3000);

        } catch (error) {
            console.error('Error starting demo:', error);
        }
    };

    const stopDemo = () => {
        if (oscillatorRef.current) {
            try {
                oscillatorRef.current.stop();
                oscillatorRef.current = null;
            } catch (e) {
                // Oscillator may already be stopped
            }
        }
        setIsPlaying(false);
    };

    const handleParameterChange = (paramName, value) => {
        const newParameters = {
            ...parameters,
            [paramName]: value
        };
        setParameters(newParameters);

        // Update effect in real-time if playing
        if (effectChainRef.current && effectChainRef.current.updateParameters) {
            effectChainRef.current.updateParameters(newParameters);
        }
    };

    return (
        <div className="p-6 bg-gray-900 text-white rounded-lg">
            <h2 className="text-2xl font-bold mb-4">Fuzz Effect Demo</h2>
            <p className="text-gray-300 mb-6">
                Test how Grain, Bite, and Low Cut parameters affect the fuzz sound.
                Click play to hear a sawtooth wave with the current fuzz settings.
            </p>

            {/* Fuzz Controls */}
            <div className="space-y-4 mb-6">
                {/* Grain Control */}
                <div>
                    <label className="block text-sm font-medium mb-2">
                        Grain (Fuzz Intensity): {(parameters.grain * 100).toFixed(0)}%
                    </label>
                    <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={parameters.grain}
                        onChange={(e) => handleParameterChange('grain', parseFloat(e.target.value))}
                        className="w-full"
                    />
                    <p className="text-xs text-gray-400 mt-1">
                        Controls the amount of fuzz distortion. Higher values = more aggressive fuzz.
                    </p>
                </div>

                {/* Bite Control */}
                <div>
                    <label className="block text-sm font-medium mb-2">
                        Bite (High-Freq Emphasis): {(parameters.bite * 100).toFixed(0)}%
                    </label>
                    <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={parameters.bite}
                        onChange={(e) => handleParameterChange('bite', parseFloat(e.target.value))}
                        className="w-full"
                    />
                    <p className="text-xs text-gray-400 mt-1">
                        Emphasizes high frequencies. Higher values = brighter, more cutting sound.
                    </p>
                </div>

                {/* Low Cut Control */}
                <div>
                    <label className="block text-sm font-medium mb-2">
                        Low Cut (High-pass Filter): {(parameters.lowCut * 100).toFixed(0)}%
                    </label>
                    <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={parameters.lowCut}
                        onChange={(e) => handleParameterChange('lowCut', parseFloat(e.target.value))}
                        className="w-full"
                    />
                    <p className="text-xs text-gray-400 mt-1">
                        Cuts low frequencies. Higher values = tighter, less muddy sound.
                    </p>
                </div>
            </div>

            {/* Play Controls */}
            <div className="flex gap-4">
                <button
                    onClick={isPlaying ? stopDemo : startDemo}
                    disabled={!audioContextRef.current}
                    className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                        isPlaying 
                            ? 'bg-red-600 hover:bg-red-700' 
                            : 'bg-blue-600 hover:bg-blue-700'
                    } disabled:bg-gray-600 disabled:cursor-not-allowed`}
                >
                    {isPlaying ? 'Stop Demo' : 'Play Demo (3s)'}
                </button>

                <button
                    onClick={() => {
                        setParameters({ grain: 0.5, bite: 0.5, lowCut: 0.5 });
                        if (effectChainRef.current && effectChainRef.current.updateParameters) {
                            effectChainRef.current.updateParameters({ grain: 0.5, bite: 0.5, lowCut: 0.5 });
                        }
                    }}
                    className="px-6 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg font-medium transition-colors"
                >
                    Reset to Default
                </button>
            </div>

            {/* Parameter Summary */}
            <div className="mt-6 p-4 bg-gray-800 rounded-lg">
                <h3 className="font-medium mb-2">Current Settings:</h3>
                <div className="text-sm text-gray-300 space-y-1">
                    <div>• Grain: {(parameters.grain * 100).toFixed(1)}% (fuzz amount)</div>
                    <div>• Bite: {(parameters.bite * 100).toFixed(1)}% (high-freq boost)</div>
                    <div>• Low Cut: {(parameters.lowCut * 100).toFixed(1)}% (low-freq cut)</div>
                </div>
            </div>
        </div>
    );
};

export default FuzzEffectDemo;