import React, { useState, useEffect } from 'react';
import { GiPianoKeys } from 'react-icons/gi';
import { HiMiniChevronUpDown } from 'react-icons/hi2';
import { FaPlus } from 'react-icons/fa';
import * as Tone from 'tone';

const SDemo = () => {
  const [selectedButtons, setSelectedButtons] = useState({});
  const [synth, setSynth] = useState(null);
  const [drumSynth, setDrumSynth] = useState(null);
  const [arpSynth, setArpSynth] = useState(null);
  const [bassSynth, setBassSynth] = useState(null);
  const [isAudioStarted, setIsAudioStarted] = useState(false);

  // Initialize Tone.js with multiple synths for different sounds
  useEffect(() => {
    // Create effects
    const reverb = new Tone.Reverb({
      decay: 2,
      wet: 0.3
    }).toDestination();

    const compressor = new Tone.Compressor({
      threshold: -24,
      ratio: 8,
      attack: 0.003,
      release: 0.1
    });

    // Main piano synth for chords
    const polySynth = new Tone.PolySynth(Tone.Synth, {
      oscillator: {
        type: 'fatsawtooth',
        partials: [1, 0.5, 0.3, 0.25, 0.2, 0.15, 0.1, 0.05]
      },
      envelope: {
        attack: 0.005,
        decay: 0.3,
        sustain: 0.4,
        release: 1.2,
        attackCurve: 'exponential',
        releaseCurve: 'exponential'
      }
    });

    // Drum/Percussion synth for stabs
    const drumSynth = new Tone.MembraneSynth({
      pitchDecay: 0.05,
      octaves: 10,
      oscillator: { type: 'sine' },
      envelope: { attack: 0.001, decay: 0.4, sustain: 0.01, release: 1.4 }
    });

    // Arpeggiator synth - bright and bell-like
    const arpSynth = new Tone.PolySynth(Tone.FMSynth, {
      harmonicity: 3,
      modulationIndex: 10,
      detune: 0,
      oscillator: { type: 'sine' },
      envelope: { attack: 0.01, decay: 0.01, sustain: 1, release: 0.5 },
      modulation: { type: 'square' },
      modulationEnvelope: { attack: 0.5, decay: 0, sustain: 1, release: 0.5 }
    });

    // Bass synth for other category
    const bassSynth = new Tone.MonoSynth({
      oscillator: { type: 'square' },
      envelope: { attack: 0.1, decay: 0.3, sustain: 0.9, release: 0.8 },
      filter: { Q: 6, type: 'lowpass', rolloff: -24 },
      filterEnvelope: { attack: 0.6, decay: 0.2, sustain: 0.5, release: 2, baseFrequency: 200, octaves: 7, exponent: 2 }
    });

    // Connect effects chain
    polySynth.chain(compressor, reverb);
    drumSynth.chain(compressor, reverb);
    arpSynth.chain(compressor, reverb);
    bassSynth.chain(compressor, reverb);
    
    setSynth(polySynth);
    setDrumSynth(drumSynth);
    setArpSynth(arpSynth);
    setBassSynth(bassSynth);

    return () => {
      polySynth.dispose();
      drumSynth.dispose();
      arpSynth.dispose();
      bassSynth.dispose();
      compressor.dispose();
      reverb.dispose();
    };
  }, []);

  const startAudio = async () => {
    if (Tone.context.state !== 'running') {
      await Tone.start();
      // Set better audio context settings
      Tone.context.lookAhead = 0.05;
      Tone.context.latencyHint = 'interactive';
      setIsAudioStarted(true);
    }
  };

  // Better chord definitions with proper voicing
  const chordNotes = {
    'Am': ['A2', 'C3', 'E3', 'A3'],
    'Bdmi': ['B2', 'D3', 'F3', 'B3'],
    'C': ['C3', 'E3', 'G3', 'C4'],
    'Dm': ['D3', 'F3', 'A3', 'D4'],
    'E': ['E2', 'G#2', 'B2', 'E3'],
    'F': ['F2', 'A2', 'C3', 'F3'],
    'G': ['G2', 'B2', 'D3', 'G3'],
    'Am7': ['A2', 'C3', 'E3', 'G3', 'A3']
  };

  const BasicData = [
    { name: 'Am', image: '⚪' },
    { name: 'Bdmi', image: '⚪' },
    { name: 'C', image: '⚪' },
    { name: 'Dm', image: '⚪' },
    { name: 'E', image: '⚪' },
    { name: 'F', image: '⚪' },
    { name: 'G', image: '⚪' },
    { name: 'Am7', image: '⚪' }
  ];

  const BasicData1 = [
    { name: 'Full Chord' },
    { name: 'On One' },
    { name: 'One and Three' },
    { name: 'All Four' }
  ];

  const Stabs = [
    { name: 'On Air' },
    { name: "Eight's" },
    { name: 'Soul Stabs' },
    { name: 'Simple Stabs' },
    { name: 'Latinesque' },
    { name: 'Moderate Stabs' }
  ];

  const Arpeggiated = [
    { name: 'Layout' },
    { name: 'Storytime' },
    { name: 'Rising Arp' },
    { name: 'Dreamer' },
    { name: 'Moving Arp' },
    { name: 'Quick Arp' },
    { name: 'Simple Stride' },
    { name: 'Simple Rain' }
  ];

  const other = [
    { name: 'Simple Slide' },
    { name: 'Simple Player' },
    { name: 'Alternating Stride' }
  ];

  const isButtonSelected = (category, index) => {
    return selectedButtons[`${category}-${index}`] || false;
  };

  const toggleButton = async (category, index) => {
    await startAudio();
    
    const key = `${category}-${index}`;
    setSelectedButtons(prev => ({
      ...prev,
      [key]: !prev[key]
    }));

    // Play different sounds based on category
    const playButtonSound = () => {
      switch(category) {
        case 'basic':
          // Piano-style chord sounds for basic
          if (synth) {
            const basicChords = [
              ['C4', 'E4', 'G4'], // Full Chord
              ['C4'], // On One
              ['C4', 'G4'], // One and Three
              ['C4', 'E4', 'G4', 'C5'] // All Four
            ];
            const chord = basicChords[index] || ['C4'];
            synth.triggerAttackRelease(chord, '8n', undefined, 0.6);
          }
          break;
          
        case 'stabs':
          // Percussive/drum sounds for stabs
          if (drumSynth) {
            const stabNotes = ['C2', 'D2', 'E2', 'F2', 'G2', 'A2'];
            const note = stabNotes[index] || 'C2';
            drumSynth.triggerAttackRelease(note, '16n', undefined);
            
            // Add some high-hat style sound
            if (synth) {
              synth.triggerAttackRelease('C6', '32n', undefined, 0.1);
            }
          }
          break;
          
        case 'arpeggiated':
          // Bell-like arpeggiated sounds
          if (arpSynth) {
            const arpPatterns = [
              ['C4', 'E4', 'G4', 'C5'], // Layout
              ['C4', 'D4', 'E4', 'F4'], // Storytime
              ['C4', 'F4', 'A4', 'C5'], // Rising Arp
              ['A3', 'C4', 'E4', 'A4'], // Dreamer
              ['G3', 'B3', 'D4', 'G4'], // Moving Arp
              ['F3', 'A3', 'C4', 'F4'], // Quick Arp
              ['E3', 'G3', 'B3', 'E4'], // Simple Stride
              ['D3', 'F3', 'A3', 'D4']  // Simple Rain
            ];
            
            const pattern = arpPatterns[index] || ['C4', 'E4', 'G4'];
            // Play notes in sequence for arpeggio effect
            pattern.forEach((note, i) => {
              setTimeout(() => {
                arpSynth.triggerAttackRelease(note, '8n', undefined, 0.4);
              }, i * 100);
            });
          }
          break;
          
        case 'other':
          // Bass/low-end sounds for other category
          if (bassSynth) {
            const bassNotes = ['C1', 'G1', 'F1'];
            const note = bassNotes[index] || 'C1';
            bassSynth.triggerAttackRelease(note, '4n', undefined);
            
            // Add some texture with the main synth
            if (synth) {
              setTimeout(() => {
                synth.triggerAttackRelease(['C3', 'E3'], '8n', undefined, 0.3);
              }, 200);
            }
          }
          break;
      }
    };

    playButtonSound();
  };

  const playChord = async (chordName) => {
    await startAudio();
    
    if (synth && chordNotes[chordName]) {
      const notes = chordNotes[chordName];
      
      // Stop any currently playing notes
      synth.releaseAll();
      
      // Add slight delay between notes for more realistic piano effect
      notes.forEach((note, index) => {
        setTimeout(() => {
          synth.triggerAttackRelease(note, '1.5n', undefined, 0.8 - (index * 0.1));
        }, index * 15);
      });
      
      // Add a subtle bass note for fuller sound
      setTimeout(() => {
        const bassNote = notes[0].replace(/\d/, '1');
        synth.triggerAttackRelease(bassNote, '2n', undefined, 0.3);
      }, 50);
    }
  };

  return (
    <div className="bg-[#1F1F1F] max-h-[180px] sm:max-h-[235px] md600:max-h-[235px] md:max-h-[410px] overflow-auto xl:overflow-hidden">
      {/* Chord Section */}
      <div className="w-full flex items-center justify-center">
        <div className="bg-[#FFFFFF1A] items-center mt-1 px-1 py-1 md:mt-2 md:px-2 md:py-2 lg:px-3 rounded-lg">
          <div className="flex gap-1 px-1 md:gap-2 md:px-2 lg:gap-3 items-center lg:px-3">
            <GiPianoKeys className='text-[10px] md600:text-[12px] md:text-[16px] lg:text-[18px] 2xl:text-[20px]' />
            <p className='text-white text-[10px] md600:text-[12px] md:text-[14px] lg:text-[16px]'>Basic</p>
            <HiMiniChevronUpDown className='text-[#FFFFFF99] text-[10px] md600:text-[12px] md:text-[14px] lg:text-[16px]' />
          </div>
          <div className="grid grid-cols-3 gap-1 md600:gap-2 mx-1 mt-1 md:grid-cols-4 md:gap-3 md:mx-2 md:mt-2 lg:gap-4 lg:mx-3 lg:mt-3">
            {BasicData.map((item, index) => (
              <div 
                key={index} 
                className="bg-[#1F1F1F] text-white w-[90px] md600:w-[110px] p-1 md600:p-2 md:w-[120px] lg:w-[130px] rounded-lg border border-[#333] hover:border-[#555] cursor-pointer transition-all"
                onClick={() => playChord(item.name)}
              >
                <p className='text-white text-[10px] md600:text-[12px] md:text-[14px] lg:text-[16px] text-center mb-1'>{item.name}</p>
                <div className="flex justify-between items-center">
                  <span className="w-2 h-2 md600:w-3 md600:h-3 lg:w-4 lg:h-4 text-[8px] md600:text-[10px] lg:text-[12px]">⚪</span>
                  <FaPlus className='text-[10px] md600:text-[12px] lg:text-[16px] text-[#FFFFFF99] hover:text-white transition-colors' />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Playing Sounds Section */}
      <div className="max-w-full md600:w-full flex items-center md600:justify-center my-3 lg:my-0 overflow-auto">
        <div className="bg-[#FFFFFF1A] items-center mt-1 px-1 md:mt-2 md:px-2 py-1 lg:px-3 lg:py-2 rounded-lg">
          <div className="flex gap-1 px-1 md:gap-2 md:px-2 lg:gap-3 items-center lg:px-3">
            <div className="w-2 h-2 md600:w-3 md600:h-3 lg:w-4 lg:h-4 text-[8px] md600:text-[10px] lg:text-[12px]">🎵</div>
            <p className='text-white text-[10px] md600:text-[12px] md:text-[14px] lg:text-[16px]'>Playing Sounds</p>
          </div>
          
          <div className="flex">
            {/* Basic Column */}
            <div className='bg-[#1F1F1F] ms-1 mt-1 p-1 w-[110px] h-[120px] md600:w-[100px] md600:h-[155px] md:ms-2 md:mt-2 md:p-2 md:w-[110px] md:h-[180px] lg:ms-3 lg:w-[116px] lg:h-[150px] rounded-lg'>
              <p className='text-[#FFFFFF99] text-[10px] md600:text-[12px] md:text-[14px] mb-2'>Basic</p>
              {BasicData1.map((item, index) => (
                <div key={index} className="mb-1">
                  <button
                    className={`${isButtonSelected('basic', index) ? "bg-white text-black" : "text-[#FFFFFF] bg-transparent"} justify-center w-[100px] mt-1 h-[25px] lg:w-[100px] lg:h-[30px] md:mt-2 text-[8px] md600:text-[10px] rounded-md border border-[#FFFFFF1A] hover:border-[#FFFFFF3A] transition-all relative`}
                    onClick={() => toggleButton('basic', index)}
                  >
                    {isButtonSelected('basic', index) && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-[#1F1F1F]"></div>
                    )}
                    {item.name}
                  </button>
                </div>
              ))}
            </div>

            {/* Stabs Column */}
            <div className='bg-[#1F1F1F] mx-1 mt-1 p-1 w-[315px] h-[120px] md600:w-[170px] md600:h-[155px] md:mx-2 lg:mx-3 md:mt-2 md:p-2 md:w-[200px] md:h-[180px] lg:w-[340px] lg:h-[150px] rounded-lg'>
              <p className='text-[#FFFFFF99] text-[8px] sm:text-[10px] md600:text-[12px] md:text-[14px] mb-2'>Stabs</p>
              <div className="grid grid-cols-3 pt-1 md600:grid-cols-2 gap-1 md:gap-2 lg:grid-cols-3 lg:gap-3 md:pt-2">
                {Stabs.map((item, index) => (
                  <div key={index}>
                    <button
                      className={`${isButtonSelected('stabs', index) ? "bg-white text-black" : "text-[#FFFFFF] bg-transparent"} justify-center w-[100px] h-[25px] md600:w-[80px] md:w-[90px] md600:h-[25px] lg:w-[100px] lg:h-[30px] text-[8px] md600:text-[10px] rounded-md border border-[#FFFFFF1A] hover:border-[#FFFFFF3A] transition-all relative`}
                      onClick={() => toggleButton('stabs', index)}
                    >
                      {isButtonSelected('stabs', index) && (
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-[#1F1F1F]"></div>
                      )}
                      {item.name}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Arpeggiated Column */}
            <div className='bg-[#1F1F1F] mt-1 p-1 w-[315px] h-[120px] md600:w-[170px] md600:h-[155px] md:mt-2 md:p-2 md:w-[200px] md:h-[180px] lg:w-[340px] lg:h-[150px] rounded-lg'>
              <p className='text-[#FFFFFF99] text-[8px] sm:text-[10px] md600:text-[12px] md:text-[14px] mb-2'>Arpeggiated</p>
              <div className="grid grid-cols-3 md600:grid-cols-2 gap-1 md:gap-2 lg:grid-cols-3 lg:gap-3 pt-1 md:pt-2">
                {Arpeggiated.map((item, index) => (
                  <div key={index} className="flex">
                    <button
                      className={`${isButtonSelected('arpeggiated', index) ? "bg-white text-black" : "text-[#FFFFFF] bg-transparent"} justify-center w-[100px] h-[25px] md600:w-[80px] md:w-[90px] mt-1 lg:mt-0 md600:h-[25px] lg:w-[100px] lg:h-[30px] text-[8px] md600:text-[10px] rounded-md border border-[#FFFFFF1A] hover:border-[#FFFFFF3A] transition-all relative`}
                      onClick={() => toggleButton('arpeggiated', index)}
                    >
                      {isButtonSelected('arpeggiated', index) && (
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-[#1F1F1F]"></div>
                      )}
                      {item.name}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Other Column */}
            <div className='bg-[#1F1F1F] mt-1 mx-1 p-1 md:mx-2 lg:mx-3 md:mt-2 md:p-2 w-[110px] h-[120px] md600:w-[100px] md600:h-[155px] md:w-[110px] md:h-[180px] lg:ms-3 lg:w-[116px] lg:h-[150px] rounded-lg'>
              <p className='text-[#FFFFFF99] text-[8px] sm:text-[10px] md600:text-[12px] md:text-[14px] mb-2'>Other</p>
              {other.map((item, index) => (
                <div key={index} className="mb-1">
                  <button
                    className={`${isButtonSelected('other', index) ? "bg-white text-black" : "text-[#FFFFFF] bg-transparent"} mt-1 md:mt-2 justify-center w-[100px] h-[25px] md600:w-[90px] md600:h-[25px] lg:w-[100px] lg:h-[30px] text-[8px] md600:text-[10px] rounded-md border border-[#FFFFFF1A] hover:border-[#FFFFFF3A] transition-all relative`}
                    onClick={() => toggleButton('other', index)}
                  >
                    {isButtonSelected('other', index) && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-[#1F1F1F]"></div>
                    )}
                    {item.name}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Audio Start Notice */}
      {!isAudioStarted && (
        <div className="text-center p-2">
          <p className="text-[#FFFFFF99] text-xs">Click any button to start audio</p>
        </div>
      )}
    </div>
  );
};

export default SDemo;