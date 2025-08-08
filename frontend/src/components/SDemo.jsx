import React, { useState, useEffect, useRef } from "react";
import { Piano } from "lucide-react";
import * as Tone from "tone";
import { GiPianoKeys } from "react-icons/gi";
import { HiMiniChevronUpDown } from "react-icons/hi2";
import Am from "../Images/am.svg";
import Bdmi from "../Images/bdmi.svg";
import C from "../Images/c.svg";
import Dm from "../Images/r.svg";
import E from "../Images/e.svg";
import F from "../Images/f.svg";
import G from "../Images/g.svg";
import Am7 from "../Images/am7.svg";
import { FaPlus } from "react-icons/fa";
import music from "../Images/playingsounds.svg";


const SDemo = () => {

  // ****************** Chords *****************
  const [isAudioReady, setIsAudioReady] = useState(false);
  const [isAudioStarted, setIsAudioStarted] = useState(false);
  const [activeChord, setActiveChord] = useState(null);
  const [activePatternKey, setActivePatternKey] = useState("basic-0");
  const [loadingStatus, setLoadingStatus] = useState("Initializing...");
  const [activeChords, setActiveChords] = useState(-1);
  const [pressedKeys, setPressedKeys] = useState(new Set());
  const [chordType, setChordType] = useState("Basic");
  const [toggle, setToggle] = useState(false);

  // === REFS FOR TONE.JS OBJECTS ===
  const synths = useRef(null);
  const effects = useRef(null);

  const keyImage = [
    { image: Am },
    { image: Bdmi },
    { image: C },
    { image: Dm },
    { image: E },
    { image: F },
    { image: G },
    { image: Am7 }
];


  // === COMPLETE CHORD DEFINITIONS ===
  const chordSets = {
    Basic: {
      Am: ["A3", "C4", "E4"],
      Bdim: ["B3", "D4", "F4"],
      C: ["C3", "E3", "G3", "C4"],
      Dm: ["D3", "F3", "A3", "D4"],
      E: ["E3", "G#3", "B3", "E4"],
      F: ["F3", "A3", "C4", "F4"],
      G: ["G3", "B3", "D4", "G4"],
      Am7: ["A3", "C4", "E4", "G4"],
    },
    
    EDM: {
      "G/C": ["C3", "G3", "B3", "D4"],
      Dm7: ["D3", "F3", "A3", "C4"],
      "Cmaj9/E": ["E3", "C4", "E4", "G4", "D5"],
      "C/F": ["F3", "C4", "E4", "G4"],
      "G(add11)": ["G3", "B3", "C4", "D4", "G4"],
      "Am7(add11)": ["A3", "C4", "D4", "E4", "G4"],
      "C(add9)": ["C3", "E3", "G3", "D4"],
      "G#dim": ["G#3", "B3", "D4", "F4"],
    },
    
    "Hip Hop": {
      Cmaj7: ["C3", "E3", "G3", "B3"],
      Dm7: ["D3", "F3", "A3", "C4"],
      Em7: ["E3", "G3", "B3", "D4"],
      Emaj7: ["E3", "G#3", "B3", "D#4"],
      "F/G": ["G3", "F4", "A4", "C5"],
      Am7: ["A3", "C4", "E4", "G4"],
      Gm7: ["G3", "Bb3", "D4", "F4"],
      C7: ["C3", "E3", "G3", "Bb3"],
    }
  };

  // === KEYBOARD MAPPINGS FOR ALL CHORD TYPES ===
  const keyboardMappings = {
    Basic: {
      'q': 'Am', 'Q': 'Am',
      'w': 'Bdim', 'W': 'Bdim',
      'e': 'C', 'E': 'C',
      'r': 'Dm', 'R': 'Dm',
      'a': 'E', 'A': 'E',
      's': 'F', 'S': 'F',
      'd': 'G', 'D': 'G',
      'f': 'Am7', 'F': 'Am7'
    },
    
    EDM: {
      'q': 'G/C', 'Q': 'G/C',
      'w': 'Dm7', 'W': 'Dm7',
      'e': 'Cmaj9/E', 'E': 'Cmaj9/E',
      'r': 'C/F', 'R': 'C/F',
      'a': 'G(add11)', 'A': 'G(add11)',
      's': 'Am7(add11)', 'S': 'Am7(add11)',
      'd': 'C(add9)', 'D': 'C(add9)',
      'f': 'G#dim', 'F': 'G#dim'
    },
    
    "Hip Hop": {
      'q': 'Cmaj7', 'Q': 'Cmaj7',
      'w': 'Dm7', 'W': 'Dm7',
      'e': 'Em7', 'E': 'Em7',
      'r': 'Emaj7', 'R': 'Emaj7',
      'a': 'F/G', 'A': 'F/G',
      's': 'Am7', 'S': 'Am7',
      'd': 'Gm7', 'D': 'Gm7',
      'f': 'C7', 'F': 'C7'
    }
  };

  // === PATTERN CATEGORIES ===
  const patternCategories = {
    basic: [
      { name: "Full Chord", synthType: "fullChord" },
      { name: "On One", synthType: "onOne" },
    ],
    stabs: [
      { name: "On Air", synthType: "onAir" },
      { name: "Eight's", synthType: "eights" },
      { name: "Soul Stabs", synthType: "soulStabs" },
      { name: "One and Three", synthType: "delayedStab" },
      { name: "Simple Stabs", synthType: "simpleStabs" },
      { name: "Latinesque", synthType: "latinesque" },
      { name: "All Four", synthType: "layeredStab"},
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

  // === HELPER FUNCTIONS ===
  const getCurrentChordNotes = () => {
    return chordSets[chordType] || chordSets.Basic;
  };

  const getCurrentKeyboardMap = () => {
    return keyboardMappings[chordType] || keyboardMappings.Basic;
  };

  const getKeyboardKey = (chordName) => {
    const currentKeyboardMap = getCurrentKeyboardMap();
    const keyEntry = Object.entries(currentKeyboardMap).find(([key, chord]) => chord === chordName);
    return keyEntry ? keyEntry[0].toUpperCase() : '';
  };

  const getCurrentSynthType = () => {
    if (!activePatternKey) return "fullChord";
    const [category, indexStr] = activePatternKey.split("-");
    const pattern = patternCategories[category]?.[parseInt(indexStr, 10)];
    return pattern?.synthType || "fullChord";
  };

  // === CHORD TYPE CHANGE HANDLER ===
  const handleChordTypeChange = (newChordType) => {
    setChordType(newChordType);
    setActiveChord(null);
    setActiveChords(-1);
    setPressedKeys(new Set());
    setToggle(false);
    console.log(`🎵 Switched to ${newChordType} chord set`);
  };

  // === AUDIO INITIALIZATION ===
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
  
        // === PROFESSIONAL SYNTH COLLECTION ===
       
        // 1. Acoustic Piano
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
  
        // 2. Electric Piano
        const electricPiano = new Tone.PolySynth(Tone.FMSynth, {
          harmonicity: 1.3,
          modulationIndex: 3.5,
          oscillator: { type: "sine" },
          envelope: {
            attack: 0.005,
            decay: 0.6,
            sustain: 0.4,
            release: 1.2
          },
          modulation: { type: "square" },
          modulationEnvelope: {
            attack: 0.01,
            decay: 0.3,
            sustain: 0.12,
            release: 0.8
          },
          volume: -4
        }).connect(chorus);
  
        // 3. Bright Stab
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
  
        // 4. Soul Stab
        const soulStab = new Tone.PolySynth(Tone.AMSynth, {
          harmonicity: 2.0,
          oscillator: { type: "sine" },
          envelope: {
            attack: 0.005,
            decay: 0.25,
            sustain: 0.3,
            release: 0.6
          },
          modulation: { type: "sine" },
          modulationEnvelope: {
            attack: 0.01,
            decay: 0.2,
            sustain: 0.2,
            release: 0.5
          },
          volume: -5
        }).connect(compressor);
  
        // 5. Pluck Synth
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
  
        // 6. Sharp Stab
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
  
        // 7. Latin Synth
        const latinSynth = new Tone.PolySynth(Tone.FMSynth, {
          harmonicity: 2.8,
          modulationIndex: 8,
          oscillator: { type: "sine" },
          envelope: {
            attack: 0.003,
            decay: 0.2,
            sustain: 0.2,
            release: 0.4
          },
          modulation: { type: "sawtooth" },
          modulationEnvelope: {
            attack: 0.005,
            decay: 0.15,
            sustain: 0.1,
            release: 0.3
          },
          volume: -6
        }).connect(delay);
  
        // 8. Moderate Stab
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

        // 9. Bell Synth
        const bellSynth = new Tone.PolySynth(Tone.FMSynth, {
          harmonicity: 3.2,
          modulationIndex: 12,
          oscillator: { type: "sine" },
          envelope: {
            attack: 0.01,
            decay: 0.8,
            sustain: 0.1,
            release: 1.5
          },
          modulation: { type: "sine" },
          modulationEnvelope: {
            attack: 0.01,
            decay: 0.4,
            sustain: 0.05,
            release: 1.0
          },
          volume: -7
        }).connect(reverb);
  
        // 10. Crystal Synth
        const crystalSynth = new Tone.PolySynth(Tone.FMSynth, {
          harmonicity: 2.5,
          modulationIndex: 6,
          oscillator: { type: "sine" },
          envelope: {
            attack: 0.01,
            decay: 0.3,
            sustain: 0.6,
            release: 0.8
          },
          modulation: { type: "triangle" },
          modulationEnvelope: {
            attack: 0.01,
            decay: 0.2,
            sustain: 0.4,
            release: 0.6
          },
          volume: -4
        }).connect(delay);
  
        // 11. Dreamy Pad
        const dreamyPad = new Tone.PolySynth(Tone.AMSynth, {
          harmonicity: 2.2,
          oscillator: { type: "sine" },
          envelope: {
            attack: 0.1,
            decay: 0.4,
            sustain: 0.7,
            release: 1.5
          },
          modulation: { type: "sine" },
          modulationEnvelope: {
            attack: 0.05,
            decay: 0.3,
            sustain: 0.4,
            release: 0.8
          },
          volume: -8
        }).connect(reverb);
  
        // 12. String Pad
        const stringPad = new Tone.PolySynth(Tone.Synth, {
          oscillator: {
            type: "sawtooth"
          },
          envelope: {
            attack: 0.05,
            decay: 0.3,
            sustain: 0.8,
            release: 1.0
          },
          volume: -6
        }).connect(reverb);
  
        // 13. Moving Arp
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
  
        // 14. Quick Arp
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
  
        // 15. Rain Synth
        const rainSynth = new Tone.PolySynth(Tone.AMSynth, {
          harmonicity: 1.8,
          oscillator: { type: "triangle" },
          envelope: {
            attack: 0.005,
            decay: 0.2,
            sustain: 0.4,
            release: 0.5
          },
          modulation: { type: "sine" },
          modulationEnvelope: {
            attack: 0.01,
            decay: 0.15,
            sustain: 0.3,
            release: 0.4
          },
          volume: -6
        }).connect(reverb);
  
        // 16. Bass Synth
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
  
        // 17. Organ Synth
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
  
        // 18. Slide Synth
        const slideSynth = new Tone.PolySynth(Tone.FMSynth, {
          harmonicity: 1.2,
          modulationIndex: 4,
          oscillator: { type: "triangle" },
          envelope: {
            attack: 0.02,
            decay: 0.25,
            sustain: 0.7,
            release: 0.6
          },
          modulation: { type: "sine" },
          modulationEnvelope: {
            attack: 0.02,
            decay: 0.2,
            sustain: 0.5,
            release: 0.5
          },
          volume: -4
        }).connect(chorus);
  
        // 19. Delayed Stab
        const delayedStab = new Tone.PolySynth(Tone.FMSynth, {
          harmonicity: 3.5,
          modulationIndex: 20,
          oscillator: { type: "sine" },
          envelope: {
            attack: 0.001,
            decay: 0.15,
            sustain: 0,
            release: 0.2
          },
          modulation: { type: "square" },
          modulationEnvelope: {
            attack: 0.001,
            decay: 0.08,
            sustain: 0,
            release: 0.1
          },
          volume: -6
        }).connect(delay);
  
        // 20. Layered Stab
        const layeredStab = new Tone.PolySynth(Tone.DuoSynth, {
          voice0: {
            oscillator: { type: "sawtooth" },
            envelope: {
              attack: 0.05,
              decay: 0.3,
              sustain: 0.5,
              release: 1.0
            }
          },
          voice1: {
            oscillator: { type: "sine" },
            detune: -10,
            envelope: {
              attack: 0.08,
              decay: 0.3,
              sustain: 0.5,
              release: 1.2
            }
          },
          harmonicity: 1.0,
          vibratoAmount: 0.15,
          vibratoRate: 3,
          volume: -7
        }).chain(chorus, reverb);
  
        // 21. Simple Player Synth
        const simplePlayerSynth = new Tone.PolySynth(Tone.DuoSynth, {
          voice0: {
            oscillator: { type: "sawtooth" },
            envelope: {
              attack: 0.01,
              decay: 0.3,
              sustain: 0.7,
              release: 1.0
            }
          },
          voice1: {
            oscillator: { type: "square" },
            detune: -7,
            envelope: {
              attack: 0.02,
              decay: 0.4,
              sustain: 0.6,
              release: 1.2
            }
          },
          harmonicity: 1.5,
          vibratoAmount: 0.1,
          vibratoRate: 4,
          volume: -3
        }).chain(compressor, reverb);
        
        // Store all synths
        synths.current = {
          acousticPiano,
          electricPiano,
          brightStab,
          soulStab,
          pluckSynth,
          delayedStab,
          sharpStab,
          latinSynth,
          layeredStab,
          moderateStab,
          bellSynth,
          crystalSynth,
          dreamyPad,
          stringPad,
          movingArp,
          quickArp,
          rainSynth,
          bassSynth,
          organSynth,
          slideSynth,
          simplePlayerSynth
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

  // === AUDIO FUNCTIONS ===
  const startAudioContext = async () => {
    if (Tone.context.state !== "running") {
      await Tone.start();
      setIsAudioStarted(true);
      console.log("🔊 Audio context started");
    }
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

  // === MAIN CHORD CLICK HANDLER ===
  const handleChordClick = async (chordName) => {
    if (!isAudioReady) return;
    await startAudioContext();
    setActiveChord(chordName);
  
    stopAllSounds();
  
    const synthType = getCurrentSynthType();
    const currentChordNotes = getCurrentChordNotes();
    const notes = currentChordNotes[chordName];
    const now = Tone.now();
  
    // SYNTH MAPPING
    const synthMap = {
      fullChord: "acousticPiano",     
      onOne: "electricPiano",         
      onAir: "brightStab",           
      eights: "pluckSynth",          
      soulStabs: "soulStab",         
      delayedStab: "delayedStab",    
      simpleStabs: "sharpStab",      
      latinesque: "latinSynth",      
      layeredStab: "layeredStab",    
      moderateStabs: "moderateStab", 
      layout: "bellSynth",           
      storytime: "crystalSynth",     
      risingArp: "dreamyPad",        
      dreamer: "stringPad",          
      movingArp: "movingArp",        
      quickArp: "quickArp",          
      simpleStride: "organSynth",    
      simpleRain: "rainSynth",       
      simpleSlide: "slideSynth",     
      simplePlayer: "simplePlayerSynth",
      alternatingStride: "bassSynth" 
    };
     
    const synthKey = synthMap[synthType] || "acousticPiano";
    const selectedSynth = synths.current?.[synthKey];
  
    console.log(`🎵 Playing ${synthType} -> ${synthKey} with ${chordType} chord: ${chordName}`);
  
    if (selectedSynth && notes) {
      try {
        // PLAYING PATTERNS
        if (synthType === "fullChord") {
          selectedSynth.triggerAttackRelease(notes, "1n", now);
        } else if (synthType === "onOne") {
          selectedSynth.triggerAttackRelease(notes, "4n", now);
        } else if (synthType === "onAir") {
          selectedSynth.triggerAttackRelease(notes, "8n", now);
        } else if (synthType === "eights") {
          notes.forEach((note, i) => {
            selectedSynth.triggerAttackRelease(note, "8n", now + i * 0.125);
          });
        } else if (synthType === "soulStabs") {
          notes.forEach((note, i) => {
            selectedSynth.triggerAttackRelease(note, "4n", now + i * 0.05);
          });
        } else if (synthType === "delayedStab") {
          notes.forEach((note, i) => {
            const timing = i % 2 === 0 ? 0 : 0.5;
            selectedSynth.triggerAttackRelease(note, "8n", now + timing);
          });
        } else if (synthType === "simpleStabs") {
          selectedSynth.triggerAttackRelease(notes, "8n", now);
        } else if (synthType === "latinesque") {
          notes.forEach((note, i) => {
            const timing = [0, 0.25, 0.75, 1.0][i % 4];
            selectedSynth.triggerAttackRelease(note, "16n", now + timing);
          });
        } else if (synthType === "layeredStab") {
          notes.forEach((note, i) => {
            const offset = i * 0.02;
            selectedSynth.triggerAttackRelease(note, "1n", now + offset);
          });
        } else if (synthType === "moderateStabs") {
          selectedSynth.triggerAttackRelease(notes, "4n", now);
        } else if (synthType === "layout") {
          notes.forEach((note, i) => {
            selectedSynth.triggerAttackRelease(note, "4n", now + i * 0.2);
          });
        } else if (synthType === "storytime") {
          notes.forEach((note, i) => {
            selectedSynth.triggerAttackRelease(note, "4n", now + i * 0.15);
          });
        } else if (synthType === "risingArp") {
          notes.forEach((note, i) => {
            selectedSynth.triggerAttackRelease(note, "8n", now + i * 0.1);
          });
        } else if (synthType === "dreamer") {
          notes.forEach((note, i) => {
            selectedSynth.triggerAttackRelease(note, "2n", now + i * 0.15);
          });
        } else if (synthType === "movingArp") {
          notes.forEach((note, i) => {
            selectedSynth.triggerAttackRelease(note, "16n", now + i * 0.06);
          });
        } else if (synthType === "quickArp") {
          notes.forEach((note, i) => {
            selectedSynth.triggerAttackRelease(note, "32n", now + i * 0.04);
          });
        } else if (synthType === "simpleStride") {
          notes.forEach((note, i) => {
            const timing = i % 2 === 0 ? 0 : 0.25;
            selectedSynth.triggerAttackRelease(note, "8n", now + timing);
          });
        } else if (synthType === "simpleRain") {
          notes.forEach((note, i) => {
            const delay = i * 0.08 + (Math.random() * 0.03);
            selectedSynth.triggerAttackRelease(note, "8n", now + delay);
          });
        } else if (synthType === "simpleSlide") {
          notes.forEach((note, i) => {
            selectedSynth.triggerAttackRelease(note, "4n", now + i * 0.06);
          });
        } else if (synthType === "simplePlayer") {
          selectedSynth.triggerAttackRelease(notes, "1n", now);
        } else if (synthType === "alternatingStride") {
          notes.forEach((note, i) => {
            selectedSynth.triggerAttackRelease(note, "4n", now + i * 0.12);
          });
        } else {
          selectedSynth.triggerAttackRelease(notes, "2n", now);
        }
       
        console.log(`✅ Successfully played ${synthKey} with ${synthType} pattern (${chordType})`);
       
      } catch (error) {
        console.error(`❌ Error playing ${synthKey}:`, error);
        if (synths.current.acousticPiano && synthKey !== "acousticPiano") {
          console.log("🔄 Falling back to acoustic piano");
          synths.current.acousticPiano.triggerAttackRelease(notes, "2n", now);
        }
      }
    } else {
      console.warn(`⚠️ Synth ${synthKey} not available or chord ${chordName} not found`);
      if (synths.current?.acousticPiano) {
        synths.current.acousticPiano.triggerAttackRelease(notes || ["C4", "E4", "G4"], "2n", now);
      }
    }
  };

  // === PATTERN SELECTION ===
  const getPatternDisplayName = () => {
    if (!activePatternKey) return null;
    const [category, indexStr] = activePatternKey.split("-");
    return patternCategories[category]?.[parseInt(indexStr, 10)]?.name || null;
  };

  const handlePatternSelect = (key) => {    
    setActivePatternKey((prev) => (prev === key ? null : key));
    setActiveChord(null);
  };

  // === KEYBOARD EVENT HANDLERS ===
  useEffect(() => {
    const handleKeyDown = (event) => {
      const currentKeyboardMap = getCurrentKeyboardMap();
      
      if (currentKeyboardMap[event.key]) {
        event.preventDefault();
      }

      if (pressedKeys.has(event.key)) {
        return;
      }

      const chordName = currentKeyboardMap[event.key];
      
      if (chordName && isAudioReady) {
        console.log(`🎹 Keyboard pressed: ${event.key} -> ${chordName} (${chordType})`);
        
        setPressedKeys(prev => new Set([...prev, event.key]));
        
        const currentChordNotes = getCurrentChordNotes();
        const chordIndex = Object.keys(currentChordNotes).indexOf(chordName);
        if (chordIndex !== -1) {
          setActiveChords(chordIndex);
        }
        
        handleChordClick(chordName);
      }
    };

    const handleKeyUp = (event) => {
      setPressedKeys(prev => {
        const newSet = new Set(prev);
        newSet.delete(event.key);
        return newSet;
      });
      
      const currentKeyboardMap = getCurrentKeyboardMap();
      if (currentKeyboardMap[event.key]) {
        setTimeout(() => {
          setActiveChords(-1);
          setActiveChord(null);
        }, 100);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isAudioReady, pressedKeys, chordType]);

  // === TEST FUNCTION ===
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
    <div className="bg-[#1F1F1F] max-h-[180px] sm:max-h-[235px] md600:max-h-[235px] md:max-h-[410px] overflow-auto xl:overflow-hidden">
      <div className="w-full flex items-center justify-center">
        <div className="bg-[#FFFFFF1A] items-center mt-1 px-1 py-1 md:mt-2 md:px-2 md:py-2 lg:px-3 rounded-lg">
          
          {/* === CHORD TYPE SELECTOR === */}
          <div className="relative flex gap-1 px-1 md:gap-2 md:px-2 lg:gap-3 items-center lg:px-3 cursor-pointer" onClick={() => setToggle(!toggle)}>
          <GiPianoKeys className='text-[10px] md600:text-[12px] md:txt-[16px] lg:text-[18px] 2xl:text-[20px]' />
            <p className="text-white text-[10px] md600:text-[12px] md:text-[14px] lg:text-[16px]">{chordType}</p>
            <HiMiniChevronUpDown className='text-[#FFFFFF99] text-[10px] md600:text-[12px] md:text-[14px] lg:text-[16px]' />
            
            {toggle && (
              <div className="absolute top-[25px] w-[170px] bg-[#1F1F1F] rounded-[5px] z-50">
                <div>
                  <p className="text-[#aeacb4] text-[14px] px-3 pt-3">Chord set:</p>
                  
                  {/* Basic Chords */}
                  <div className="flex mt-3 items-center hover:bg-[#FFFFFF1A] py-1 cursor-pointer" onClick={() => handleChordTypeChange("Basic")}>
                    {chordType === "Basic" ? (
                      <div className="text-[15px] ms-3">✓</div>
                    ) : (
                      <div className="text-[15px] ms-3 invisible">✓</div>
                    )}
                    <div className="ms-3 text-[15px] text-white">Basic</div>
                  </div>
                  
                  {/* EDM Chords */}
                  <div className="flex mt-1 items-center hover:bg-[#FFFFFF1A] py-1 cursor-pointer" onClick={() => handleChordTypeChange("EDM")}>
                    {chordType === "EDM" ? (
                      <div className="text-[15px] ms-3">✓</div>
                    ) : (
                      <div className="text-[15px] ms-3 invisible">✓</div>
                    )}
                    <div className="ms-3 text-[15px] text-white">EDM</div>
                  </div>
                  
                  {/* Hip Hop Chords */}
                  <div className="flex mt-1 items-center hover:bg-[#FFFFFF1A] py-1 cursor-pointer pb-3" onClick={() => handleChordTypeChange("Hip Hop")}>
                    {chordType === "Hip Hop" ? (
                      <div className="text-[15px] ms-3">✓</div>
                    ) : (
                      <div className="text-[15px] ms-3 invisible">✓</div>
                    )}
                    <div className="ms-3 text-[15px] text-white">Hip Hop</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* === CHORD BUTTONS === */}
          <div className="grid grid-cols-3 gap-1 md600:gap-1 mx-1 mt-1 md:grid-cols-4 md:gap-3 md:mx-2 md:mt-2 lg:gap-4 lg:mx-3 lg:mt-3">
            {Object.keys(getCurrentChordNotes()).map((name, index) => {
              const keyboardKey = getKeyboardKey(name);
              const isPressed = pressedKeys.has(keyboardKey.toLowerCase()) || pressedKeys.has(keyboardKey);
              return (
                <div 
                  key={name}
                  onClick={() => {handleChordClick(name); setActiveChords(index)}}
                  disabled={!isAudioReady} 
                  className={`bg-[#1F1F1F] cursor-pointer text-white w-[90px] md600:w-[110px] p-1 md600:px-2 md600:py-2 md:w-[120px] lg:w-[130px] rounded-md ${
                    activeChords === index ? 'border-[white] border-[1px]' : 'border-[#FFFFFF33] border-[1px]'
                  } ${isPressed ? 'bg-[#FFFFFF20]' : ''} hover:bg-[#FFFFFF10] transition-colors`}
                >
                  <p className="text-white text-[10px] md600:text-[12px] md:text-[14px] lg:text-[16px] text-center mb-1 font-medium">
                    {name}
                  </p>
                  <div className="flex justify-between items-center">
                     <img src={keyImage[index]?.image} alt="" className="w-2 h-2 md600:w-3 md600:h-3 lg:w-4 lg:h-4" />
                     <FaPlus className='text-[10px] md600:text-[12px] lg:text-[16px] text-[#FFFFFF99]' />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* === PLAYING SOUNDS SECTION === */}
      <div className="max-w-full md600:w-full flex items-center md600:justify-center my-3 lg:my-0 overflow-auto">
        <div className="bg-[#FFFFFF1A] items-center mt-1 px-1 md:mt-2 md:px-2 py-1 lg:px-3 lg:py-2 rounded-lg">
          <div className="flex gap-1 px-1 md:gap-2 md:px-2 lg:gap-3 items-center lg:px-3">
            <img src={music} alt="" className="w-2 h-2 md600:w-3 md600:h-3 lg:w-4 lg:h-4" />
            <p className="text-white text-[10px] md600:text-[12px] md:text-[14px] lg:text-[16px]">Playing Sounds</p>
          </div>
          
          <div className="flex">
            {Object.entries(patternCategories).map(([category, patterns], categoryIndex) => {
              const isWideCategory = categoryIndex === 1 || categoryIndex === 2;
              const containerClasses = isWideCategory 
                ? 'bg-[#1F1F1F] mx-1 mt-1 p-1 w-[315px] h-[120px] md600:w-[170px] md600:h-[155px] md:mx-2 lg:mx-3 md:mt-2 md:p-2 md:w-[200px] md:h-[180px] lg:w-[340px] lg:h-[150px]'
                : 'bg-[#1F1F1F] ms-1 mt-1 p-1 w-[110px] h-[120px] md600:w-[100px] md600:h-[155px] md:ms-2 md:mt-2 md:p-2 md:w-[110px] md:h-[180px] lg:ms-3 lg:w-[116px] lg:h-[150px]';

              return (
                <div key={category} className={containerClasses}>
                  <p className="text-[#FFFFFF99] text-[10px] md600:text-[12px] md:text-[14px] capitalize">
                    {category}
                  </p>
                  <div className={isWideCategory ? 'grid grid-cols-3 pt-1 md600:grid-cols-2 md:gap-1 lg:grid-cols-3 lg:gap-0 md:pt-1' : ''}>
                    {patterns.map((item, patternIndex) => {
                      const key = `${category}-${patternIndex}`;
                      const isSelected = activePatternKey === key;
                      return (
                        <div key={patternIndex}>
                          <button
                            onClick={() => handlePatternSelect(key)}
                            disabled={!isAudioReady}
                            className={`${
                              isSelected
                                ? "bg-white text-black"
                                : "text-[#FFFFFF] bg-transparent hover:bg-[#FFFFFF10]"
                            } border-[#FFFFFF1A] justify-center w-[100px] mt-1 h-[25px] lg:w-[100px] lg:h-[30px] md:mt-2 text-[8px] md600:text-[10px] rounded-md border transition-colors`}
                          >
                            {item.name}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* === STATUS AND TEST BUTTONS === */}
      <div className="text-center py-2">
        <div className="text-[#FFFFFF99] text-[10px] mb-2">
          Status: {loadingStatus} | Active: {chordType} | Pattern: {getPatternDisplayName() || "None"}
        </div>
        <button 
          onClick={testAllSynths}
          disabled={!isAudioReady}
          className="bg-[#FFFFFF1A] text-white px-3 py-1 rounded text-[10px] hover:bg-[#FFFFFF33] transition-colors"
        >
          Test All Synths
        </button>
      </div>
    </div>
  );
};

export default SDemo;