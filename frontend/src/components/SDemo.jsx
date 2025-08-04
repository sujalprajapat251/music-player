import React, { useState, useEffect, useRef } from 'react';
import { Piano } from 'lucide-react';
import * as Tone from 'tone';

const SDemo = () => {
  // --- STATE MANAGEMENT ---
  const [isAudioReady, setIsAudioReady] = useState(false);
  const [isAudioStarted, setIsAudioStarted] = useState(false);
  
  const [activeChord, setActiveChord] = useState('Am');
  const [activePatternKey, setActivePatternKey] = useState(null);

  const synths = useRef(null);
  const loop = useRef(null);
  const effects = useRef(null);

  // --- DATA (CHORDS & PATTERNS) ---
  const chordNotes = {
    'Am': ['A0', 'A2', 'A3', 'C4', 'E4'],
    'Bdim': ['B3', 'D4', 'F4', 'B4'],
    'C': ['C3', 'E3', 'G3', 'C4'],
    'Dm': ['D3', 'F3', 'A3', 'D4'],
    'E': ['E3', 'G#3', 'B3', 'E4'],
    'F': ['F3', 'A3', 'C4', 'F4'],
    'G': ['G3', 'B3', 'D4', 'G4'],
    'Am7': ['A3', 'C4', 'E4', 'G4']
  };

  const patternCategories = {
    basic: [
      { name: 'Full Chord' }, { name: 'On One' },
      { name: 'One and Three' }, { name: 'All Four' }
    ],
    stabs: [
      { name: 'On Air' }, { name: "Eight's" }, { name: 'Soul Stabs' },
      { name: 'Simple Stabs' }, { name: 'Latinesque' }, { name: 'Moderate Stabs' }
    ],
    arpeggiated: [
      { name: 'Layout' }, { name: 'Storytime' }, { name: 'Rising Arp' },
      { name: 'Dreamer' }, { name: 'Moving Arp' }, { name: 'Quick Arp' },
      { name: 'Simple Stride' }, { name: 'Simple Rain' }
    ],
    other: [
      { name: 'Simple Slide' }, { name: 'Simple Player' }, { name: 'Alternating Stride' }
    ]
  };

  // --- AUDIO INITIALIZATION (No changes here) ---
  useEffect(() => {
    const initializeAudio = async () => {
      try {
        const reverb = new Tone.Reverb({ decay: 3, wet: 0.4, preDelay: 0.01 }).toDestination();
        const delay = new Tone.PingPongDelay({ delayTime: "8n", feedback: 0.2, wet: 0.1 }).toDestination();
        const compressor = new Tone.Compressor({ threshold: -18, ratio: 8, attack: 0.001, release: 0.2 }).toDestination();
        effects.current = { reverb, compressor, delay };

        const createPianoSynth = () => new Tone.PolySynth(Tone.FMSynth, { harmonicity: 3.01, modulationIndex: 14, oscillator: { type: 'sine' }, envelope: { attack: 0.001, decay: 0.3, sustain: 0.1, release: 1.5, }, modulation: { type: 'square' }, modulationEnvelope: { attack: 0.002, decay: 0.2, sustain: 0, release: 0.2, }, volume: -10 }).chain(compressor, delay, reverb);
        const createStabSynth = () => new Tone.PolySynth(Tone.FMSynth, { harmonicity: 2, modulationIndex: 3, oscillator: { type: 'square' }, envelope: { attack: 0.001, decay: 0.2, sustain: 0.1, release: 0.3 }, modulation: { type: 'sine' }, modulationEnvelope: { attack: 0.002, decay: 0.3, sustain: 0, release: 0.2 }, volume: -12 }).chain(compressor, reverb);
        const createArpSynth = () => new Tone.PolySynth(Tone.AMSynth, { harmonicity: 1.5, oscillator: { type: 'fmsine' }, envelope: { attack: 0.02, decay: 0.3, sustain: 0.2, release: 0.8 }, modulation: { type: 'square' }, modulationEnvelope: { attack: 0.01, decay: 0.2, sustain: 0.1, release: 0.3 }, volume: -10 }).chain(compressor, delay, reverb);
        const createBassSynth = () => new Tone.MonoSynth({ oscillator: { type: 'fatsawtooth', count: 3, spread: 40 }, envelope: { attack: 0.02, decay: 0.4, sustain: 0.6, release: 1.2 }, filterEnvelope: { attack: 0.01, decay: 0.2, sustain: 0.3, release: 0.8, baseFrequency: 300, octaves: 3, exponent: 2 }, volume: -6 }).chain(compressor, reverb);

        synths.current = {
          piano: createPianoSynth(),
          stabSynth: createStabSynth(),
          arpSynth: createArpSynth(),
          bassSynth: createBassSynth()
        };
        Tone.Transport.bpm.value = 120;
        setIsAudioReady(true);
      } catch (error) {
        console.error("Audio initialization error:", error);
      }
    };
    initializeAudio();
    return () => {
        try {
            Tone.Transport.stop();
            Tone.Transport.cancel();
            if (loop.current) loop.current.dispose();
            if (synths.current) Object.values(synths.current).forEach(synth => synth?.dispose());
            if (effects.current) Object.values(effects.current).forEach(effect => effect?.dispose());
        } catch (e) { console.error("Cleanup error", e); }
    };
  }, []);

  const startAudioContext = async () => {
    if (Tone.context.state !== 'running') {
      await Tone.start();
      setIsAudioStarted(true);
    }
  };
  
  const generatePatternData = (patternKey, notes) => {
    console.log("Hello " , patternKey , notes);
    
    const [category, indexStr] = patternKey.split('-');
    const index = parseInt(indexStr, 10);
    const root = notes[0], third = notes[1], fifth = notes[2] || notes[1], seventh = notes[3] || notes[2];
    
    switch (category) {
      case 'basic':
        switch(index) {
          case 0: return { measure: '1m', synth: 'piano', volume: 0.8, data: [{ time: '0:0', note: notes, duration: '1n', velocity: 0.9 }] };
          case 1: return { measure: '1m', synth: 'piano', volume: 0.8, data: [{ time: '0:0', note: root, duration: '2n', velocity: 0.8 }] };
          case 2: return { measure: '1m', synth: 'piano', volume: 0.8, data: [{ time: '0:0', note: root, duration: '2n', velocity: 0.8 }, { time: '0:2', note: fifth, duration: '2n', velocity: 0.7 }] };
          case 3: return { measure: '1m', synth: 'piano', volume: 0.8, data: notes.map((n, i) => ({ time: `0:${i}`, note: n, duration: '4n', velocity: 0.8 - (i * 0.1) })) };
          default: return {};
        }
      case 'stabs':
        switch(index) {
          case 0: return { measure: '1m', synth: 'stabSynth', volume: 0.6, data: [{ time: '0:0:2', note: [root, third, fifth], duration: '8n', velocity: 0.7 }, { time: '0:2:2', note: [root, third, fifth], duration: '8n', velocity: 0.6 }] };
          case 1: return { measure: '1m', synth: 'stabSynth', volume: 0.7, data: [{ time: '0:0', note: [root, fifth], duration: '8n', velocity: 0.8 }, { time: '0:0:2', note: [third, seventh], duration: '8n', velocity: 0.7 }, { time: '0:1', note: [root, fifth], duration: '8n', velocity: 0.7 }, { time: '0:1:2', note: [third, seventh], duration: '8n', velocity: 0.6 }, { time: '0:2', note: [root, fifth], duration: '8n', velocity: 0.7 }, { time: '0:2:2', note: [third, seventh], duration: '8n', velocity: 0.6 }, { time: '0:3', note: [root, fifth], duration: '8n', velocity: 0.6 }, { time: '0:3:2', note: [third, seventh], duration: '8n', velocity: 0.5 }] };
          case 2: return { measure: '1m', synth: 'stabSynth', volume: 0.8, data: [{ time: '0:0:2', note: notes, duration: '16n', velocity: 0.9 }, { time: '0:1:2', note: notes, duration: '16n', velocity: 0.8 }, { time: '0:2:2', note: notes, duration: '16n', velocity: 0.7 }, { time: '0:3:2', note: notes, duration: '16n', velocity: 0.6 }] };
          default: return {};
        }
      case 'arpeggiated':
         switch(index) {
          case 6: return { measure: '1m', synth: 'arpSynth', volume: 0.7, data: [{ time: '0:0', note: root, duration: '4n', velocity: 0.8 }, { time: '0:1', note: [third, fifth], duration: '8n', velocity: 0.6 }, { time: '0:2', note: root, duration: '4n', velocity: 0.7 }, { time: '0:3', note: [third, fifth], duration: '8n', velocity: 0.5 }] };
          case 7: return { measure: '1m', synth: 'arpSynth', volume: 0.6, data: [...notes].reverse().map((n, i) => ({ time: `0:${i}:2`, note: n, duration: '8n', velocity: 0.8 - (i * 0.15) })) };
          default: return {};
         }
      case 'other':
         const bassRoot = root.replace(/\d/, '2');
         const bassFifth = fifth.replace(/\d/, '2');
         switch(index) {
           case 0: return { measure: '1m', synth: 'bassSynth', volume: 0.8, data: [{ time: '0:0', note: bassRoot, duration: '4n', velocity: 0.9 }, { time: '0:1:2', note: bassFifth, duration: '8n', velocity: 0.7 }, { time: '0:2:2', note: bassRoot, duration: '4n', velocity: 0.8 }, { time: '0:3:2', note: bassFifth, duration: '8n', velocity: 0.6 }] };
           default: return {};
         }
      default:
        return {};
    }
  };

  const startOrUpdateLoop = (patternKey, chordName) => {
    if (!isAudioReady || !synths.current) return;
    try {
      if (loop.current) {
        loop.current.stop();
        loop.current.dispose();
      }
  
      const currentNotes = chordNotes[chordName];
      const patternData = generatePatternData(patternKey, currentNotes);
      if (!patternData.data?.length || !patternData.synth) return;
  
      const synthToUse = synths.current[patternData.synth];
      if (patternData.volume) synthToUse.volume.value = Tone.gainToDb(patternData.volume);
  
      loop.current = new Tone.Part((time, value) => {
        synthToUse.triggerAttackRelease(value.note, value.duration, time, value.velocity);
      }, patternData.data).start(0);
  
      loop.current.loop = true;
      loop.current.loopEnd = patternData.measure;
  
      if (Tone.Transport.state !== 'started') {
        Tone.Transport.start();
      }
    } catch (error) {
      console.error("Error in startOrUpdateLoop:", error);
    }
  };
  

  // --- EVENT HANDLERS (Major changes here) ---
  const handlePatternSelect = async (key) => {
    if (activePatternKey === key) {
      // Deselect pattern & stop music
      setActivePatternKey(null);
      if (loop.current) {
        loop.current.stop();
        loop.current.dispose();
        loop.current = null;
      }
      Tone.Transport.stop();
    } else {
      // Set new pattern key (but don't play sound yet)
      setActivePatternKey(key);
      // Stop any currently playing loop
      if (loop.current) {
        loop.current.stop();
        loop.current.dispose();
        loop.current = null;
      }
      Tone.Transport.stop();
    }
    Tone.Transport.stop();

  };
  

  const handleChordClick = async (chordName) => {
    setActiveChord(chordName);
    await startAudioContext();
  
    // If pattern is selected, generate and play loop
    if (activePatternKey) {
      startOrUpdateLoop(activePatternKey, chordName);
    } else {
      // Otherwise, just trigger plain chord sound
      synths.current.piano.triggerAttackRelease(chordNotes[chordName], "1n", Tone.now());
    }
  };
  
  

  return (
    <div className="bg-[#1F1F1F] p-4 font-sans flex flex-col gap-4 items-center min-h-screen">
      {/* Chords Section (The Main Trigger) */}
      <div className="w-full max-w-4xl bg-[#2a2a2a] p-3 rounded-lg">
        <div className="flex items-center gap-2 mb-3">
          <Piano className='text-xl text-gray-300' />
          <p className='text-white text-lg font-bold'>Chords (Click to Play)</p>
        </div>
        <div className="grid grid-cols-4 gap-3">
          {Object.keys(chordNotes).map((name) => (
            <button
              key={name}
              onClick={() => handleChordClick(name)}
              className={`p-3 rounded-lg transition-all duration-200 ${
                activeChord === name && Tone.Transport.state === 'started' ? 'bg-blue-500 text-white shadow-lg scale-105' : 'bg-[#383838] text-gray-300 hover:bg-[#4a4a4a]'
              }`}
            >
              <p className='text-lg font-semibold text-center'>{name}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Playing Sounds Section (Selector Only) */}
      <div className="w-full max-w-4xl bg-[#2a2a2a] p-3 rounded-lg">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xl">🎵</span>
          <p className='text-white text-lg font-bold'>Select a Pattern</p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {Object.entries(patternCategories).map(([category, patterns]) => (
            <div key={category} className="bg-[#1F1F1F] p-3 rounded-lg flex flex-col gap-2">
              <p className='text-white font-semibold capitalize text-md mb-1'>{category}</p>
              {patterns.map((item, index) => {
                const key = `${category}-${index}`;
                const isSelected = activePatternKey === key;
                return (
                  <button
                    key={key}
                    onClick={() => handlePatternSelect(key)}
                    className={`w-full p-2 text-sm rounded-md border transition-all duration-200 relative ${
                      isSelected ? "bg-white text-black font-semibold border-white shadow-lg" : "text-gray-300 bg-transparent border-[#444] hover:border-gray-400 hover:bg-[#333]"
                    }`}
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
      <div className="text-center p-2 text-xs">
          {!isAudioReady && <p className="text-yellow-400 animate-pulse">Loading Instruments...</p>}
          {isAudioReady && !isAudioStarted && <p className="text-gray-400">Click any button to start audio</p>}
          {isAudioReady && isAudioStarted && (
              <div className="space-y-1">
                  {activePatternKey ? (
                      <p className="text-green-400">Pattern '{activePatternKey.replace('-', ' - ')}' selected. Click a chord to play.</p>
                  ) : (
                      <p className="text-yellow-400">Please select a pattern first.</p>
                  )}
                  {Tone.Transport.state === 'started' && activePatternKey &&
                    <p className="text-blue-400 animate-pulse">Playing chord: {activeChord}</p>
                  }
              </div>
          )}
      </div>
    </div>
  );
};

export default SDemo;