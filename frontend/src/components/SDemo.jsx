import React, { useState, useEffect, useRef } from "react";
import { Piano } from "lucide-react";
import * as Tone from "tone";

const SDemo = () => {
  // --- STATE MANAGEMENT ---
  const [isAudioReady, setIsAudioReady] = useState(false);
  const [isAudioStarted, setIsAudioStarted] = useState(false);
  const [activeChord, setActiveChord] = useState(null);
  const [activePatternKey, setActivePatternKey] = useState(null);
  const [loadingStatus, setLoadingStatus] = useState("Initializing...");

  // --- REFS FOR TONE.JS OBJECTS ---
  const synths = useRef(null);
  const effects = useRef(null);

  const chordNotes = {
    Am: ["A3", "C4", "E4"],
    Bdim: ["B3", "D4", "F4"], 
    C: ["C3", "E3", "G3", "C4"],
    Dm: ["D3", "F3", "A3", "D4"],
    E: ["E3", "G#3", "B3", "E4"],
    F: ["F3", "A3", "C4", "F4"],
    G: ["G3", "B3", "D4", "G4"],
    Am7: ["A3", "C4", "E4", "G4"],
  };

  const patternCategories = {
    basic: [
      { name: "Full Chord", synthType: "fullChord" },
      { name: "On One", synthType: "onOne" },
    ],
    stabs: [
      { name: "On Air", synthType: "onAir" },
      { name: "Eight's", synthType: "eights" },
      { name: "Soul Stabs", synthType: "soulStabs" },
      { name: "Simple Stabs", synthType: "simpleStabs" },
      { name: "Latinesque", synthType: "latinesque" },
      { name: "Moderate Stabs", synthType: "moderateStabs" },
    ],
    arpeggiated: [
      { name: "Layout", synthType: "layout" },
      { name: "Storytime", synthType: "storytime" },
      { name: "Rising Arp", synthType: "risingArp" },
      { name: "Dreamer", synthType: "dreamer" },
      { name: "Moving Arp", synthType: "movingArp" },
      { name: "Quick Arp", synthType: "quickArp" },
      { name: "Simple Stride", synthType: "simpleStride" },
      { name: "Simple Rain", synthType: "simpleRain" },
    ],
    other: [
      { name: "Simple Slide", synthType: "simpleSlide" },
      { name: "Simple Player", synthType: "simplePlayer" },
      { name: "Alternating Stride", synthType: "alternatingStride" },
    ],
  };

  useEffect(() => {
    const initializeAudio = async () => {
      try {
        setLoadingStatus("Creating audio destination...");
        
        // Set master volume
        Tone.Destination.volume.value = -3;
        
        setLoadingStatus("Creating effects chain...");
        
        // Enhanced effects chain for professional sound
        const mainGain = new Tone.Gain(0.8).toDestination();
        
        const compressor = new Tone.Compressor({
          threshold: -12,
          ratio: 3,
          attack: 0.003,
          release: 0.1
        }).connect(mainGain);
        
        const reverb = new Tone.Reverb({
          decay: 2.0,
          wet: 0.25
        }).connect(mainGain);
        
        const delay = new Tone.FeedbackDelay({
          delayTime: "8n",
          feedback: 0.18,
          wet: 0.12
        }).connect(mainGain);

        // Additional chorus effect for warmth
        const chorus = new Tone.Chorus({
          frequency: 0.5,
          delayTime: 3.5,
          depth: 0.7,
          wet: 0.15
        }).connect(mainGain);
        
        effects.current = { 
          mainGain, 
          compressor, 
          reverb, 
          delay,
          chorus 
        };

        setLoadingStatus("Creating professional synthesizers...");

        // PROFESSIONAL SYNTH COLLECTION - ALL PROPERLY DEFINED
        
        // === BASIC SOUNDS ===
        
        // 1. Acoustic Piano (Rich harmonics)
        const acousticPiano = new Tone.PolySynth(Tone.Synth, {
          oscillator: { 
            type: "triangle",
            harmonicity: 1.2
          },
          envelope: { 
            attack: 0.02, 
            decay: 0.4, 
            sustain: 0.6, 
            release: 1.8 
          },
          volume: -6
        }).connect(compressor);

        // 2. Electric Piano (Classic Fender Rhodes style)
        const electricPiano = new Tone.PolySynth(Tone.FMSynth, {
          harmonicity: 1.2,
          modulationIndex: 2.5,
          oscillator: { type: "sine" },
          envelope: { 
            attack: 0.008, 
            decay: 0.8, 
            sustain: 0.4, 
            release: 1.5 
          },
          modulation: { type: "square" },
          modulationEnvelope: { 
            attack: 0.02, 
            decay: 0.4, 
            sustain: 0.12, 
            release: 1.0 
          },
          volume: -5
        }).connect(chorus);

        // === STAB SOUNDS ===

        // 3. Bright Stab (Sharp and cutting)
        const brightStab = new Tone.PolySynth(Tone.Synth, {
          oscillator: { 
            type: "sawtooth",
          },
          envelope: { 
            attack: 0.001, 
            decay: 0.25, 
            sustain: 0.08, 
            release: 0.4 
          },
          volume: -8
        }).connect(compressor);

        // 4. Soul Stab (Warm and punchy)
        const soulStab = new Tone.PolySynth(Tone.AMSynth, {
          harmonicity: 1.8,
          oscillator: { type: "sine" },
          envelope: { 
            attack: 0.01, 
            decay: 0.4, 
            sustain: 0.25, 
            release: 0.9 
          },
          modulation: { type: "sine" },
          modulationEnvelope: { 
            attack: 0.02, 
            decay: 0.3, 
            sustain: 0.18, 
            release: 0.7 
          },
          volume: -6
        }).connect(compressor);

        // 5. Pluck Synth (Quick attack)
        const pluckSynth = new Tone.PolySynth(Tone.Synth, {
          oscillator: { type: "triangle" },
          envelope: { 
            attack: 0.001, 
            decay: 0.12, 
            sustain: 0.02, 
            release: 0.25 
          },
          volume: -6
        }).connect(delay);

        // 6. Sharp Stab (Very percussive)
        const sharpStab = new Tone.PolySynth(Tone.Synth, {
          oscillator: { type: "square" },
          envelope: { 
            attack: 0.001, 
            decay: 0.18, 
            sustain: 0.05, 
            release: 0.3 
          },
          volume: -9
        }).connect(compressor);

        // 7. Latin Synth (Percussive with filter sweep)
        const latinSynth = new Tone.PolySynth(Tone.FMSynth, {
          harmonicity: 2.5,
          modulationIndex: 6,
          oscillator: { type: "sine" },
          envelope: { 
            attack: 0.005, 
            decay: 0.3, 
            sustain: 0.15, 
            release: 0.6 
          },
          modulation: { type: "sawtooth" },
          modulationEnvelope: { 
            attack: 0.01, 
            decay: 0.25, 
            sustain: 0.08, 
            release: 0.5 
          },
          volume: -7
        }).connect(delay);

        // 8. Moderate Stab (Balanced attack)
        const moderateStab = new Tone.PolySynth(Tone.Synth, {
          oscillator: { 
            type: "sawtooth"
          },
          envelope: { 
            attack: 0.01, 
            decay: 0.3, 
            sustain: 0.2, 
            release: 0.5 
          },
          volume: -7
        }).connect(compressor);

        // === ARPEGGIATED SOUNDS ===

        // 9. Bell Synth (Metallic and shimmering)
        const bellSynth = new Tone.PolySynth(Tone.FMSynth, {
          harmonicity: 3.2,
          modulationIndex: 18,
          oscillator: { type: "sine" },
          envelope: { 
            attack: 0.001, 
            decay: 1.2, 
            sustain: 0.08, 
            release: 2.5 
          },
          modulation: { type: "sine" },
          modulationEnvelope: { 
            attack: 0.001, 
            decay: 0.6, 
            sustain: 0.02, 
            release: 1.8 
          },
          volume: -10
        }).connect(reverb);

        // 10. Crystal Synth (Bright and sparkly)
        const crystalSynth = new Tone.PolySynth(Tone.FMSynth, {
          harmonicity: 8.5,
          modulationIndex: 3,
          oscillator: { type: "sine" },
          envelope: { 
            attack: 0.001, 
            decay: 0.9, 
            sustain: 0.15, 
            release: 1.8 
          },
          modulation: { type: "sine" },
          modulationEnvelope: { 
            attack: 0.001, 
            decay: 0.4, 
            sustain: 0.08, 
            release: 1.2 
          },
          volume: -8
        }).connect(delay);

        // 11. Dreamy Pad (Soft and atmospheric)
        const dreamyPad = new Tone.PolySynth(Tone.AMSynth, {
          harmonicity: 2.2,
          oscillator: { type: "sine" },
          envelope: { 
            attack: 0.8, 
            decay: 1.0, 
            sustain: 0.7, 
            release: 3.0 
          },
          modulation: { type: "sine" },
          modulationEnvelope: { 
            attack: 0.5, 
            decay: 0.7, 
            sustain: 0.4, 
            release: 2.0 
          },
          volume: -12
        }).connect(reverb);

        // 12. String Pad (Warm strings)
        const stringPad = new Tone.PolySynth(Tone.Synth, {
          oscillator: { 
            type: "sawtooth"
          },
          envelope: { 
            attack: 1.2, 
            decay: 0.6, 
            sustain: 0.8, 
            release: 3.5 
          },
          volume: -10
        }).connect(reverb);

        // 13. Moving Arp (Quick and bouncy)
        const movingArp = new Tone.PolySynth(Tone.Synth, {
          oscillator: { type: "triangle" },
          envelope: { 
            attack: 0.005, 
            decay: 0.15, 
            sustain: 0.1, 
            release: 0.3 
          },
          volume: -6
        }).connect(delay);

        // 14. Quick Arp (Very fast attack)
        const quickArp = new Tone.PolySynth(Tone.FMSynth, {
          harmonicity: 4,
          modulationIndex: 8,
          oscillator: { type: "sine" },
          envelope: { 
            attack: 0.001, 
            decay: 0.08, 
            sustain: 0.05, 
            release: 0.2 
          },
          modulation: { type: "square" },
          modulationEnvelope: { 
            attack: 0.001, 
            decay: 0.05, 
            sustain: 0.02, 
            release: 0.15 
          },
          volume: -7
        }).connect(delay);

        // 15. Rain Synth (Soft droplets)
        const rainSynth = new Tone.PolySynth(Tone.Synth, {
          oscillator: { type: "sine" },
          envelope: { 
            attack: 0.001, 
            decay: 0.4, 
            sustain: 0.05, 
            release: 0.8 
          },
          volume: -9
        }).connect(reverb);

        // === OTHER SOUNDS ===

        // 16. Bass Synth (Deep and powerful)
        const bassSynth = new Tone.MonoSynth({
          oscillator: { type: "sawtooth" },
          envelope: { 
            attack: 0.01, 
            decay: 0.35, 
            sustain: 0.7, 
            release: 1.2 
          },
          filterEnvelope: { 
            attack: 0.02, 
            decay: 0.25, 
            sustain: 0.4, 
            release: 1.0, 
            baseFrequency: 180, 
            octaves: 5 
          },
          volume: -1
        }).connect(compressor);

        // 17. Organ Synth (Classic drawbar organ)
        const organSynth = new Tone.PolySynth(Tone.Synth, {
          oscillator: { type: "square" },
          envelope: { 
            attack: 0.008, 
            decay: 0.1, 
            sustain: 0.85, 
            release: 0.4 
          },
          volume: -6
        }).connect(chorus);

        // 18. Slide Synth (Smooth portamento)
        const slideSynth = new Tone.PolySynth(Tone.AMSynth, {
          harmonicity: 1.5,
          oscillator: { type: "sine" },
          envelope: { 
            attack: 0.05, 
            decay: 0.4, 
            sustain: 0.6, 
            release: 1.0 
          },
          modulation: { type: "sine" },
          modulationEnvelope: { 
            attack: 0.1, 
            decay: 0.3, 
            sustain: 0.4, 
            release: 0.8 
          },
          volume: -6
        }).connect(chorus);

        // Store all synths with clear mapping
        synths.current = {
          // Basic patterns
          acousticPiano,
          electricPiano,
          
          // Stab patterns  
          brightStab,
          soulStab,
          pluckSynth,
          sharpStab,
          latinSynth,
          moderateStab,
          
          // Arpeggiated patterns
          bellSynth,
          crystalSynth,
          dreamyPad,
          stringPad,
          movingArp,
          quickArp,
          rainSynth,
          
          // Other patterns
          bassSynth,
          organSynth,
          slideSynth,
        };

        console.log("✅ Created", Object.keys(synths.current).length, "professional synths");

        Tone.Transport.bpm.value = 120;
        
        setLoadingStatus("Ready!");
        setIsAudioReady(true);

      } catch (error) {
        console.error("❌ Audio initialization error:", error);
        setLoadingStatus("Error loading - using fallback");
        setIsAudioReady(true);
      }
    };

    initializeAudio();

    return () => {
      if (synths.current) {
        Object.values(synths.current).forEach((s) => s?.dispose());
      }
      if (effects.current) {
        Object.values(effects.current).forEach((e) => e?.dispose());
      }
    };
  }, []);

  const startAudioContext = async () => {
    if (Tone.context.state !== "running") {
      await Tone.start();
      setIsAudioStarted(true);
      console.log("🔊 Audio context started");
    }
  };

  const getCurrentSynthType = () => {
    if (!activePatternKey) return "fullChord";
    const [category, indexStr] = activePatternKey.split("-");
    const pattern = patternCategories[category]?.[parseInt(indexStr, 10)];
    return pattern?.synthType || "fullChord";
  };

  const stopAllSounds = () => {
    if (synths.current) {
      Object.values(synths.current).forEach((synth) => {
        try {
          if (synth?.releaseAll) {
            synth.releaseAll();
          }
        } catch (e) {
          console.warn("Error stopping synth:", e);
        }
      });
    }
    setActiveChord(null);
  };

  const handleChordClick = async (chordName) => {
    if (!isAudioReady) return;
    await startAudioContext();
    setActiveChord(chordName);

    // Stop all currently playing sounds
    stopAllSounds();

    const synthType = getCurrentSynthType();
    const notes = chordNotes[chordName];
    const now = Tone.now();

    // ENHANCED SYNTH MAPPING - Each pattern gets unique professional sound
    const synthMap = {
      // Basic - Rich piano sounds
      fullChord: "acousticPiano",     // Rich acoustic piano
      onOne: "electricPiano",         // Classic electric piano
      
      // Stabs - Professional stab sounds
      onAir: "brightStab",           // Sharp sawtooth stab
      eights: "pluckSynth",          // Quick plucked sound
      soulStabs: "soulStab",         // Warm soul stab
      simpleStabs: "sharpStab",      // Percussive stab
      latinesque: "latinSynth",      // Latin-style synth
      moderateStabs: "moderateStab", // Balanced stab
      
      // Arpeggiated - Varied textures with character
      layout: "crystalSynth",        // Bright crystal sound
      storytime: "dreamyPad",        // Soft dreamy pad
      risingArp: "bellSynth",        // Metallic bell
      dreamer: "stringPad",          // Warm string pad
      movingArp: "movingArp",        // Bouncy arp
      quickArp: "quickArp",          // Fast attack arp
      simpleStride: "electricPiano", // Classic stride piano
      simpleRain: "rainSynth",       // Soft rain drops
      
      // Other - Special character sounds
      simpleSlide: "slideSynth",     // Smooth slide synth
      simplePlayer: "organSynth",    // Classic organ
      alternatingStride: "bassSynth", // Deep bass
    };

    const synthKey = synthMap[synthType] || "acousticPiano";
    const selectedSynth = synths.current?.[synthKey];

    console.log(`🎵 Playing ${synthType} -> ${synthKey}`);

    if (selectedSynth && notes) {
      try {
        // Special playing patterns for different types
        if (synthType === "alternatingStride") {
          // Bass: Play notes in sequence
          notes.forEach((note, i) => {
            selectedSynth.triggerAttackRelease(note, "4n", now + i * 0.12);
          });
        } else if (synthType === "simpleSlide") {
          // Slide: Smooth note transitions
          notes.forEach((note, i) => {
            selectedSynth.triggerAttackRelease(note, "8n", now + i * 0.08);
          });
        } else if (synthType === "risingArp") {
          // Rising arp: Notes go up in sequence
          notes.forEach((note, i) => {
            selectedSynth.triggerAttackRelease(note, "8n", now + i * 0.1);
          });
        } else if (synthType === "simpleRain") {
          // Rain: Random-ish timing
          notes.forEach((note, i) => {
            const delay = i * 0.15 + (Math.random() * 0.05);
            selectedSynth.triggerAttackRelease(note, "4n", now + delay);
          });
        } else if (synthType === "quickArp" || synthType === "movingArp") {
          // Quick arps: Fast succession
          notes.forEach((note, i) => {
            selectedSynth.triggerAttackRelease(note, "16n", now + i * 0.06);
          });
        } else if (synthType === "eights") {
          // Eighth note pattern
          notes.forEach((note, i) => {
            selectedSynth.triggerAttackRelease(note, "8n", now + i * 0.125);
          });
        } else if (synthType === "layout") {
          // Layout: Spread notes across time
          notes.forEach((note, i) => {
            selectedSynth.triggerAttackRelease(note, "4n", now + i * 0.2);
          });
        } else if (synthType === "storytime") {
          // Dreamy storytelling pattern
          notes.forEach((note, i) => {
            selectedSynth.triggerAttackRelease(note, "2n", now + i * 0.3);
          });
        } else {
          // Standard chord
          selectedSynth.triggerAttackRelease(notes, "2n", now);
        }
        
        console.log(`✅ Successfully played ${synthKey}`);
        
      } catch (error) {
        console.error(`❌ Error playing ${synthKey}:`, error);
        // Fallback to acoustic piano
        if (synths.current.acousticPiano && synthKey !== "acousticPiano") {
          console.log("🔄 Falling back to acoustic piano");
          synths.current.acousticPiano.triggerAttackRelease(notes, "2n", now);
        }
      }
    } else {
      console.warn(`⚠️ Synth ${synthKey} not available`);
      // Fallback to acoustic piano
      if (synths.current?.acousticPiano) {
        synths.current.acousticPiano.triggerAttackRelease(notes, "2n", now);
      }
    }
  };

  const getPatternDisplayName = () => {
    if (!activePatternKey) return null;
    const [category, indexStr] = activePatternKey.split("-");
    return patternCategories[category]?.[parseInt(indexStr, 10)]?.name || null;
  };

  const handlePatternSelect = (key) => {
    setActivePatternKey((prev) => (prev === key ? null : key));
    setActiveChord(null);
  };

  // Test all synths function
  const testAllSynths = async () => {
    if (!isAudioReady) return;
    await startAudioContext();
    
    console.log("🧪 Testing all professional synths...");
    const testNotes = ["C4", "E4", "G4"];
    
    Object.entries(synths.current).forEach(([name, synth], index) => {
      setTimeout(() => {
        try {
          if (synth && synth.triggerAttackRelease) {
            if (name === "bassSynth") {
              synth.triggerAttackRelease("C3", "4n", Tone.now());
            } else {
              synth.triggerAttackRelease(testNotes, "4n", Tone.now());
            }
            console.log(`✅ ${name} - Professional sound working`);
          } else {
            console.log(`❌ ${name} - Not available`);
          }
        } catch (e) {
          console.log(`❌ ${name} - Error:`, e);
        }
      }, index * 800);
    });
  };

  return (
    <div className="bg-gradient-to-br from-gray-900 to-black p-6 font-sans flex flex-col gap-6 items-center min-h-screen">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-2">🎹 Professional Chord Player</h1>
        <p className="text-gray-400">પ્રોફેશનલ સાઉન્ડ સિલેક્ટ કરો અને કોર્ડ વગાડો</p>
      </div>

      {/* Status Section */}
      <div className="text-center p-4">
        {!isAudioReady && (
          <div className="flex items-center justify-center gap-3 text-yellow-400 bg-yellow-900 bg-opacity-30 px-6 py-3 rounded-lg">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-yellow-400"></div>
            <p className="text-lg">{loadingStatus}</p>
          </div>
        )}
        {isAudioReady && !isAudioStarted && (
          <div className="text-green-400 bg-green-900 bg-opacity-30 px-6 py-3 rounded-lg">
            <p className="text-lg">✅ Professional sounds loaded! કોઈ પણ chord પર click કરો 🎵</p>
          </div>
        )}
        {isAudioReady && isAudioStarted && activeChord && (
          <div className="text-blue-400 bg-blue-900 bg-opacity-30 px-6 py-3 rounded-lg">
            <p className="text-lg font-semibold">
              🎼 Playing: {activeChord}
              {activePatternKey && ` (${getPatternDisplayName()})`}
            </p>
          </div>
        )}
      </div>

      {/* Chords Section */}
      <div className="w-full max-w-4xl bg-gray-800 p-6 rounded-xl shadow-xl">
        <div className="flex items-center gap-3 mb-6">
          <Piano className="text-2xl text-blue-400" />
          <p className="text-white text-xl font-bold">
            Chords
            {activePatternKey && (
              <span className="text-blue-400 font-normal text-sm ml-2">
                - Using {getPatternDisplayName()} sound
              </span>
            )}
          </p>
        </div>
        <div className="grid grid-cols-4 gap-4">
          {Object.keys(chordNotes).map((name) => (
            <button
              key={name}
              onClick={() => handleChordClick(name)}
              disabled={!isAudioReady}
              className={`p-4 rounded-lg transition-all duration-200 font-semibold text-lg ${
                activeChord === name
                  ? "bg-gradient-to-r from-green-500 to-blue-500 text-white shadow-lg scale-105 ring-2 ring-green-300"
                  : "bg-gray-700 text-gray-200 hover:bg-gray-600 hover:scale-105"
              } ${
                activePatternKey ? "border-2 border-blue-300" : ""
              } disabled:opacity-50 disabled:cursor-not-allowed shadow-md`}
            >
              {name}
            </button>
          ))}
        </div>
      </div>

      {/* Pattern Selection Section */}
      <div className="w-full max-w-6xl bg-gray-800 p-6 rounded-xl shadow-xl">
        <div className="flex items-center gap-3 mb-6">
          <span className="text-2xl">🎵</span>
          <p className="text-white text-xl font-bold">Professional Sound Type સિલેક્ટ કરો</p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {Object.entries(patternCategories).map(([category, patterns]) => (
            <div key={category} className="bg-gray-900 p-4 rounded-lg">
              <p className="text-white font-semibold capitalize text-lg mb-4 text-center border-b border-gray-600 pb-2">
                {category}
              </p>
              <div className="space-y-2">
                {patterns.map((item, index) => {
                  const key = `${category}-${index}`;
                  const isSelected = activePatternKey === key;
                  return (
                    <button
                      key={key}
                      onClick={() => handlePatternSelect(key)}
                      disabled={!isAudioReady}
                      className={`w-full p-3 rounded-lg transition-all duration-200 text-left ${
                        isSelected
                          ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg ring-2 ring-blue-300"
                          : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {item.name}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Controls */}
      <div className="flex gap-4">
        <button
          onClick={stopAllSounds}
          disabled={!isAudioReady}
          className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
        >
          🛑 Stop All
        </button>
        <button
          onClick={testAllSynths}
          disabled={!isAudioReady}
          className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
        >
          🧪 Test Professional Sounds
        </button>
      </div>

      {/* Sound Info Display */}
      <div className="w-full max-w-4xl bg-gray-800 p-4 rounded-lg">
        <div className="text-center">
          <p className="text-gray-300 text-sm">
            🎼 Total Professional Sounds: <span className="text-blue-400 font-bold">18</span> | 
            🎹 Basic: <span className="text-green-400">2</span> | 
            ⚡ Stabs: <span className="text-red-400">6</span> | 
            🌊 Arpeggiated: <span className="text-purple-400">8</span> | 
            🎵 Other: <span className="text-yellow-400">2</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SDemo;