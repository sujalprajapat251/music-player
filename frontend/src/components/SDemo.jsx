import React, { useState, useEffect, useRef } from "react";
import { Piano } from "lucide-react";
import * as Tone from "tone";

const SDemo = () => {
  // --- STATE MANAGEMENT ---
  const [isAudioReady, setIsAudioReady] = useState(false);
  const [isAudioStarted, setIsAudioStarted] = useState(false);

  const [activeChord, setActiveChord] = useState(null);
  const [activePatternKey, setActivePatternKey] = useState(null);

  const synths = useRef(null);
  const effects = useRef(null);

  // --- DATA (CHORDS & PATTERNS) ---
  const chordNotes = {
    Am: ["A2", "C4", "E4"],
    Bdim: ["B2", "D4", "F4"],
    C: ["C3", "E3", "G3", "C4"],
    Dm: ["D3", "F3", "A3", "D4"],
    E: ["E3", "G#3", "B3", "E4"],
    F: ["F3", "A3", "C4", "F4"],
    G: ["G3", "B3", "D4", "G4"],
    Am7: ["A2", "C3", "E3", "G3"],
  };

  const patternCategories = {
    basic: [
      { name: "Grand Piano", synthType: "piano" },
      { name: "Warm Stabs", synthType: "stabSynth" },
      { name: "Dreamy Arp", synthType: "arpSynth" },
      { name: "Fat Bass", synthType: "bassSynth" },
    ],
    stabs: [
      { name: "On Air", synthType: "piano" },
      { name: "Eight's", synthType: "stabSynth" },
      { name: "Soul Stabs", synthType: "arpSynth" },
      { name: "Simple Stabs", synthType: "bassSynth" },
      { name: "Latinesque", synthType: "piano" },
      { name: "Moderate Stabs", synthType: "stabSynth" },
    ],
    arpeggiated: [
      { name: "Layout", synthType: "arpSynth" },
      { name: "Storytime", synthType: "bassSynth" },
      { name: "Rising Arp", synthType: "piano" },
      { name: "Dreamer", synthType: "stabSynth" },
      { name: "Moving Arp", synthType: "arpSynth" },
      { name: "Quick Arp", synthType: "bassSynth" },
      { name: "Simple Stride", synthType: "piano" },
      { name: "Simple Rain", synthType: "stabSynth" },
    ],
    other: [
      { name: "Simple Slide", synthType: "arpSynth" },
      { name: "Simple Player", synthType: "bassSynth" },
      { name: "Alternating Stride", synthType: "piano" },
    ],
  };

  // --- AUDIO INITIALIZATION ---
  useEffect(() => {
    const initializeAudio = async () => {
      try {
        // --- Effects (with a new Chorus) ---
        const reverb = new Tone.Reverb({
          decay: 2.5,
          wet: 0.4,
          preDelay: 0.01,
        }).toDestination();
        const delay = new Tone.PingPongDelay({
          delayTime: "8n.",
          feedback: 0.3,
          wet: 0.25,
        }).toDestination();
        const chorus = new Tone.Chorus({
          frequency: 1.5,
          delayTime: 3.5,
          depth: 0.7,
          feedback: 0.1,
          wet: 0.3,
        }).toDestination();
        const compressor = new Tone.Compressor({
          threshold: -12,
          ratio: 6,
        }).toDestination();
        // Chain the chorus to the main effects bus for synths
        chorus.connect(delay);
        chorus.connect(reverb);
        effects.current = { reverb, compressor, delay, chorus };

        // --- Sampler for a realistic Piano sound (UPGRADED) ---
        const createPianoSampler = () => {
          return new Tone.Sampler({
            urls: {
              A0: "A0.mp3",
              C1: "C1.mp3",
              "D#1": "Ds1.mp3",
              "F#1": "Fs1.mp3",
              A1: "A1.mp3",
              C2: "C2.mp3",
              "D#2": "Ds2.mp3",
              "F#2": "Fs2.mp3",
              A2: "A2.mp3",
              C3: "C3.mp3",
              "D#3": "Ds3.mp3",
              "F#3": "Fs3.mp3",
              A3: "A3.mp3",
              C4: "C4.mp3",
              "D#4": "Ds4.mp3",
              "F#4": "Fs4.mp3",
              A4: "A4.mp3",
              C5: "C5.mp3",
              "D#5": "Ds5.mp3",
              "F#5": "Fs5.mp3",
              A5: "A5.mp3",
              C6: "C6.mp3",
            },
            baseUrl: "https://tonejs.github.io/audio/salamander/",
            release: 1,
            onload: () => {
              console.log("High-quality piano samples loaded.");
              setIsAudioReady(true);
            },
          }).chain(compressor, reverb, delay);
        };

        // --- A warmer, classic stab synth (ENHANCED) ---
        const createStabSynth = () => {
          return new Tone.PolySynth(Tone.Synth, {
            oscillator: { type: "fatsawtooth", count: 3, spread: 20 },
            envelope: {
              attack: 0.01,
              decay: 0.5,
              sustain: 0.2,
              release: 0.8,
              attackCurve: "exponential",
            },
            volume: -10,
          }).chain(effects.current.chorus, compressor);
        };

        // --- A dreamier, softer arp synth (ENHANCED) ---
        const createArpSynth = () => {
          return new Tone.PolySynth(Tone.FMSynth, {
            harmonicity: 1.5,
            modulationIndex: 1.2,
            oscillator: { type: "sine" },
            envelope: { attack: 0.05, decay: 0.3, sustain: 0.2, release: 1.2 },
            modulation: { type: "sine" },
            modulationEnvelope: {
              attack: 0.1,
              decay: 0.2,
              sustain: 0.1,
              release: 0.8,
            },
            volume: -10,
          }).chain(effects.current.chorus, compressor);
        };

        // --- A tighter, punchier bass synth ---
        const createBassSynth = () => {
          return new Tone.MonoSynth({
            oscillator: {
              type: "fmsquare",
              modulationType: "sawtooth",
              modulationIndex: 0.5,
              harmonicity: 1.01,
            },
            envelope: { attack: 0.01, decay: 0.3, sustain: 0.4, release: 0.8 },
            filterEnvelope: {
              attack: 0.01,
              decay: 0.2,
              sustain: 0.1,
              release: 0.8,
              baseFrequency: 300,
              octaves: 4,
            },
            volume: -8,
          }).chain(compressor, reverb);
        };

        synths.current = {
          piano: createPianoSampler(),
          stabSynth: createStabSynth(),
          arpSynth: createArpSynth(),
          bassSynth: createBassSynth(),
        };

        Tone.Transport.bpm.value = 120;
      } catch (error) {
        console.error("Audio initialization error:", error);
      }
    };

    initializeAudio();

    return () => {
      try {
        Tone.Transport.stop();
        Tone.Transport.cancel();
        if (synths.current) {
          Object.values(synths.current).forEach((synth) => synth?.dispose());
        }
        if (effects.current) {
          Object.values(effects.current).forEach((effect) => effect?.dispose());
        }
      } catch (e) {
        console.error("Cleanup error", e);
      }
    };
  }, []);

  const startAudioContext = async () => {
    if (Tone.context.state !== "running") {
      await Tone.start();
      console.log("Audio Context Started");
      setIsAudioStarted(true);
    }
  };

  const getCurrentSynthType = () => {
    if (!activePatternKey) return "piano";
    const [category, indexStr] = activePatternKey.split("-");
    const index = parseInt(indexStr, 10);
    const pattern = patternCategories[category]?.[index];
    return pattern?.synthType || "piano";
  };

  const stopAllSounds = () => {
    try {
      Tone.Transport.stop();
      if (synths.current) {
        Object.values(synths.current).forEach((synth) => {
          if (synth?.releaseAll) synth.releaseAll();
        });
      }
    } catch (error) {
      console.error("Error stopping sounds:", error);
    }
  };

  const handlePatternSelect = (key) => {
    if (activePatternKey === key) {
      setActivePatternKey(null);
    } else {
      setActivePatternKey(key);
    }
    setActiveChord(null);
  };

  const handleChordClick = async (chordName) => {
    if (!isAudioReady) {
      console.warn("Audio is not ready yet. Please wait.");
      return;
    }
    await startAudioContext();
    stopAllSounds();
    setActiveChord(chordName);

    const synthType = getCurrentSynthType();
    const currentSynth = synths.current[synthType];

    if (currentSynth) {
      const notes = chordNotes[chordName];
      const now = Tone.now();

      if (synthType === "bassSynth") {
        const rootNote = notes[0]?.replace(/\d/, "1");
        currentSynth.triggerAttackRelease(rootNote, "1n", now);
      } else {
        currentSynth.triggerAttackRelease(notes, "1n", now);
      }
    }
  };

  const getPatternDisplayName = () => {
    if (!activePatternKey) return null;
    const [category, indexStr] = activePatternKey.split("-");
    const index = parseInt(indexStr, 10);
    const pattern = patternCategories[category]?.[index];
    return pattern?.name || null;
  };

  return (
    <div className="bg-[#1F1F1F] p-4 font-sans flex flex-col gap-4 items-center min-h-screen">
      {/* Chords Section */}
      <div className="w-full max-w-4xl bg-[#2a2a2a] p-3 rounded-lg">
        <div className="flex items-center gap-2 mb-3">
          <Piano className="text-xl text-gray-300" />
          <p className="text-white text-lg font-bold">
            Chords (Click to Play)
            {activePatternKey && (
              <span className="text-blue-400 font-normal text-sm ml-2">
                - Using {getPatternDisplayName()} sound
              </span>
            )}
          </p>
        </div>
        <div className="grid grid-cols-4 gap-3">
          {Object.keys(chordNotes).map((name) => (
            <button
              key={name}
              onClick={() => handleChordClick(name)}
              disabled={!isAudioReady}
              className={`p-3 rounded-lg transition-all duration-200 relative ${
                activeChord === name
                  ? "bg-blue-500 text-white shadow-lg scale-105"
                  : "bg-[#383838] text-gray-300 hover:bg-[#4a4a4a]"
              } ${
                activePatternKey ? "border-2 border-blue-300" : ""
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <p className="text-lg font-semibold text-center">{name}</p>
              {activePatternKey && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-[#1F1F1F]"></div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Pattern Selection Section */}
      <div className="w-full max-w-4xl bg-[#2a2a2a] p-3 rounded-lg">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xl">🎵</span>
          <p className="text-white text-lg font-bold">
            Select a Sound Type (પેટર્નનો પ્રકાર પસંદ કરો)
          </p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {Object.entries(patternCategories).map(([category, patterns]) => (
            <div
              key={category}
              className="bg-[#1F1F1F] p-3 rounded-lg flex flex-col gap-2"
            >
              <p className="text-white font-semibold capitalize text-md mb-1">
                {category}
              </p>
              {patterns.map((item, index) => {
                const key = `${category}-${index}`;
                const isSelected = activePatternKey === key;
                return (
                  <button
                    key={key}
                    onClick={() => handlePatternSelect(key)}
                    disabled={!isAudioReady}
                    className={`w-full p-2 text-sm rounded-md border transition-all duration-200 relative ${
                      isSelected
                        ? "bg-white text-black font-semibold border-white shadow-lg"
                        : "text-gray-300 bg-transparent border-[#444] hover:border-gray-400 hover:bg-[#333]"
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {isSelected && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-[#1F1F1F]"></div>
                    )}
                    {item.name}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Status Section */}
      <div className="text-center p-2 text-xs h-16">
        {!isAudioReady && (
          <p className="text-yellow-400 animate-pulse">
            Loading Instruments... (Please wait)
          </p>
        )}
        {isAudioReady && !isAudioStarted && (
          <p className="text-gray-400">Click any chord to start audio</p>
        )}
        {isAudioReady && isAudioStarted && (
          <div className="space-y-1">
            {activeChord && (
              <p className="text-blue-400">
                Last played: {activeChord}
                {activePatternKey && ` with ${getPatternDisplayName()} sound`}
                {!activePatternKey && ` with Grand Piano sound`}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SDemo;
