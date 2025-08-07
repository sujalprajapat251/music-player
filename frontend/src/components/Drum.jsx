// import React, { useState, useRef, useCallback, useEffect } from 'react';

// const DrumPadMachine = () => {
//   const [currentMachine, setCurrentMachine] = useState(0);
//   const [activePads, setActivePads] = useState(new Set());
//   const [displayDescription, setDisplayDescription] = useState('Press a key or click a pad!');
//   const [volume, setVolume] = useState(0.7);
//   const [pan, setPan] = useState(0); // -1 to 1 (left to right)
//   const [reverb, setReverb] = useState(0.2); // 0 to 1 (dry to wet)
//   const [isRecording, setIsRecording] = useState(false);
//   const [sequence, setSequence] = useState([]);
//   const [isPlaying, setIsPlaying] = useState(false);
//   const [audioBuffers, setAudioBuffers] = useState({});
//   const [loadingStatus, setLoadingStatus] = useState({});
//   const [selectedPad, setSelectedPad] = useState(null); // For individual pad effects
//   const [padEffects, setPadEffects] = useState({}); // Store effects for each pad
//   const audioContextRef = useRef(null);
//   const reverbBufferRef = useRef(null);

//   const descriptions = {
//     Q: 'Chant: Hey!', '1': 'Clap', '3': 'Crash',
//     G: 'Closed hi-hat', E: 'Open hi-hat', '8': 'Percussion',
//     D: 'Snare', A: 'Kick one', U: 'Kick two',
//     X: 'Tom', T: 'Ride', '7': 'Cymbal',
//     Y: 'Clap', H: 'Shaker', J: 'Cowbell', K: 'Wood block'
//   };

//   // Initialize Web Audio API
//   const getAudioContext = useCallback(() => {
//     if (!audioContextRef.current) {
//       audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
//     }
//     return audioContextRef.current;
//   }, []);

//   // Create reverb impulse response
//   const createReverbBuffer = useCallback(() => {
//     if (reverbBufferRef.current) return reverbBufferRef.current;

//     const audioContext = getAudioContext();
//     const length = audioContext.sampleRate * 2; // 2 second reverb
//     const buffer = audioContext.createBuffer(2, length, audioContext.sampleRate);

//     for (let channel = 0; channel < 2; channel++) {
//       const channelData = buffer.getChannelData(channel);
//       for (let i = 0; i < length; i++) {
//         const decay = Math.pow(1 - i / length, 2);
//         channelData[i] = (Math.random() * 2 - 1) * decay;
//       }
//     }

//     reverbBufferRef.current = buffer;
//     return buffer;
//   }, [getAudioContext]);

//   const machines = [
//     {
//       name: "Trap Kit",
//       type:"Machine",
//       color: '#7c3aed',
//       pads: [
//         { id: 'Q', label: 'Q', audioUrl: '/Audio/Tasty/q.mp3' },
//         { id: '1', label: '1', audioUrl: '/Audio/Tasty/1.mp3' },
//         { id: 'E', label: 'E', audioUrl: '/Audio/Tasty/e.mp3' },
//         { id: '8', label: '8', audioUrl: '/Audio/Tasty/8.mp3' },
//         { id: 'D', label: 'D', audioUrl: '/Audio/Tasty/d.mp3' },
//         { id: 'O', label: 'O', audioUrl: '/Audio/Tasty/o.mp3' },
//         { id: 'A', label: 'A', audioUrl: '/Audio/Tasty/a.mp3' },
//         { id: 'U', label: 'U', audioUrl: '/Audio/Tasty/u.mp3' },
//         { id: 'X', label: 'X', audioUrl: '/Audio/Tasty/x.mp3' },
//         { id: 'T', label: 'T', audioUrl: '/Audio/Tasty/t.mp3' },
//         { id: 'J', label: 'J', audioUrl: '/Audio/Tasty/j.mp3' },
//       ]
//     },
//     {
//       name: "Muffle Kit",
//       type:"Machine",
//       color: '#7c3aed',
//       pads: [
//         { id: 'Q', label: 'Q', audioUrl: '/Audio/Muffled/q.mp3' },
//         { id: '1', label: '1', audioUrl: '/Audio/Muffled/1.mp3' },
//         { id: 'E', label: 'E', audioUrl: '/Audio/Muffled/e.mp3' },
//         { id: '8', label: '8', audioUrl: '/Audio/Muffled/8.mp3' },
//         { id: 'D', label: 'D', audioUrl: '/Audio/Muffled/d.mp3' },
//         { id: 'O', label: 'O', audioUrl: '/Audio/Muffled/o.mp3' },
//         { id: 'A', label: 'A', audioUrl: '/Audio/Muffled/a.mp3' },
//         { id: 'U', label: 'U', audioUrl: '/Audio/Muffled/u.mp3' },
//         { id: 'X', label: 'X', audioUrl: '/Audio/Muffled/x.mp3' },
//         { id: 'T', label: 'T', audioUrl: '/Audio/Muffled/t.mp3' },
//         { id: 'J', label: 'J', audioUrl: '/Audio/Muffled/j.mp3' },
//         { id: 'H', label: 'H', audioUrl: '/Audio/Muffled/h.mp3' },
//         { id: 'K', label: 'K', audioUrl: '/Audio/Muffled/k.mp3' },
//         { id: 'Y', label: 'Y', audioUrl: '/Audio/Muffled/y.mp3' },
//         { id: '9', label: '9', audioUrl: '/Audio/Muffled/9.mp3' },
//         { id: '7', label: '7', audioUrl: '/Audio/Muffled/7.mp3' },
//       ]
//     }
//   ];

//   // Load audio from URL
//   const loadAudioFromUrl = useCallback(async (audioUrl, padId, machineIndex) => {
//     try {
//       const bufferKey = `${machineIndex}-${padId}`;
//       setLoadingStatus(prev => ({
//         ...prev,
//         [bufferKey]: 'loading'
//       }));

//       const audioContext = getAudioContext();
//       const response = await fetch(audioUrl);

//       if (!response.ok) {
//         throw new Error(`HTTP error! status: ${response.status}`);
//       }

//       const arrayBuffer = await response.arrayBuffer();
//       const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

//       setAudioBuffers(prev => ({
//         ...prev,
//         [bufferKey]: audioBuffer
//       }));

//       setLoadingStatus(prev => ({
//         ...prev,
//         [bufferKey]: 'loaded'
//       }));

//       return audioBuffer;
//     } catch (error) {
//       console.error('Error loading audio from URL:', error);
//       const bufferKey = `${machineIndex}-${padId}`;
//       setLoadingStatus(prev => ({
//         ...prev,
//         [bufferKey]: 'error'
//       }));
//       return null;
//     }
//   }, [getAudioContext]);

//   // Play sound with effects
//   const playSound = useCallback((pad) => {
//     try {
//       const audioContext = getAudioContext();

//       // Resume context if suspended
//       if (audioContext.state === 'suspended') {
//         audioContext.resume();
//       }

//       const bufferKey = `${currentMachine}-${pad.id}`;
//       const audioBuffer = audioBuffers[bufferKey];

//       if (audioBuffer) {
//         // Get pad-specific effects or use global settings
//         const padEffect = padEffects[pad.id] || {};
//         const effectiveVolume = padEffect.volume !== undefined ? padEffect.volume : volume;
//         const effectivePan = padEffect.pan !== undefined ? padEffect.pan : pan;
//         const effectiveReverb = padEffect.reverb !== undefined ? padEffect.reverb : reverb;

//         // Create audio nodes
//         const source = audioContext.createBufferSource();
//         const gainNode = audioContext.createGain();
//         const panNode = audioContext.createStereoPanner();
//         const dryGainNode = audioContext.createGain();
//         const wetGainNode = audioContext.createGain();
//         const convolver = audioContext.createConvolver();

//         // Set up reverb
//         convolver.buffer = createReverbBuffer();

//         // Set up source
//         source.buffer = audioBuffer;

//         // Set up gain (volume)
//         gainNode.gain.setValueAtTime(effectiveVolume, audioContext.currentTime);

//         // Set up pan (-1 = left, 1 = right)
//         panNode.pan.setValueAtTime(effectivePan, audioContext.currentTime);

//         // Set up reverb mix
//         dryGainNode.gain.setValueAtTime(1 - effectiveReverb, audioContext.currentTime);
//         wetGainNode.gain.setValueAtTime(effectiveReverb, audioContext.currentTime);

//         // Connect nodes: Source -> Gain -> Pan -> Split to Dry/Wet
//         source.connect(gainNode);
//         gainNode.connect(panNode);

//         // Dry path
//         panNode.connect(dryGainNode);
//         dryGainNode.connect(audioContext.destination);

//         // Wet path (reverb)
//         panNode.connect(convolver);
//         convolver.connect(wetGainNode);
//         wetGainNode.connect(audioContext.destination);

//         source.start(audioContext.currentTime);

//         // Visual feedback
//         setActivePads(prev => new Set([...prev, pad.id]));
//         setTimeout(() => {
//           setActivePads(prev => {
//             const newSet = new Set(prev);
//             newSet.delete(pad.id);
//             return newSet;
//           });
//         }, 200);

//         const effectsText = padEffect.volume !== undefined || padEffect.pan !== undefined || padEffect.reverb !== undefined 
//           ? ' (Custom)' : '';
//         setDisplayDescription(`${descriptions[pad.id] || 'Drum Pad'} - ${machines[currentMachine].name}${effectsText}`);

//         if (isRecording) {
//           setSequence(prev => [...prev, { 
//             key: pad.id, 
//             time: Date.now(), 
//             machine: currentMachine,
//             effects: { ...padEffect }
//           }]);
//         }
//       } else {
//         setDisplayDescription(`${descriptions[pad.id] || 'Drum Pad'} - Loading audio...`);
//       }
//     } catch (error) {
//       console.error('Error playing sound:', error);
//       setDisplayDescription('Audio not available');
//     }
//   }, [getAudioContext, volume, pan, reverb, descriptions, machines, currentMachine, isRecording, audioBuffers, padEffects, createReverbBuffer]);

//   // Load initial audio files on component mount and machine change
//   useEffect(() => {
//     const currentMachineData = machines[currentMachine];

//     currentMachineData.pads.forEach((pad) => {
//       if (pad.audioUrl) {
//         const bufferKey = `${currentMachine}-${pad.id}`;
//         if (!audioBuffers[bufferKey] && !loadingStatus[bufferKey]) {
//           loadAudioFromUrl(pad.audioUrl, pad.id, currentMachine);
//         }
//       }
//     });
//   }, [currentMachine, machines, loadAudioFromUrl, audioBuffers, loadingStatus]);

//   // Keyboard handling
//   useEffect(() => {
//     const handleKeyDown = (event) => {
//       const keyMap = {
//         81: 'Q', 49: '1', 51: '3', 71: 'G', 69: 'E', 56: '8',
//         68: 'D', 65: 'A', 85: 'U', 88: 'X', 84: 'T', 55: '7',
//         89: 'Y', 72: 'H', 74: 'J', 75: 'K'
//       };    

//       if (keyMap[event.keyCode]) {
//         event.preventDefault();
//         const currentPads = machines[currentMachine].pads;
//         const pad = currentPads.find(p => p.id === keyMap[event.keyCode]);
//         if (pad) {
//           playSound(pad);
//         }
//       }
//     };

//     document.addEventListener('keydown', handleKeyDown);
//     return () => document.removeEventListener('keydown', handleKeyDown);
//   }, [currentMachine, machines, playSound]);

//   const toggleRecording = () => {
//     if (isRecording) {
//       setIsRecording(false);
//       setDisplayDescription('Recording stopped');
//     } else {
//       setSequence([]);
//       setIsRecording(true);
//       setDisplayDescription('Recording started...');
//     }
//   };

//   const playSequence = async () => {
//     if (sequence.length === 0) return;

//     setIsPlaying(true);
//     setDisplayDescription('Playing sequence...');

//     const startTime = sequence[0].time;
//     const originalMachine = currentMachine;

//     for (let i = 0; i < sequence.length; i++) {
//       const note = sequence[i];
//       const delay = note.time - startTime;

//       setTimeout(() => {
//         if (note.machine !== undefined && note.machine !== currentMachine) {
//           setCurrentMachine(note.machine);
//         }

//         // Temporarily apply recorded effects
//         if (note.effects) {
//           setPadEffects(prev => ({
//             ...prev,
//             [note.key]: note.effects
//           }));
//         }

//         const currentPads = machines[note.machine || currentMachine].pads;
//         const pad = currentPads.find(p => p.id === note.key);
//         if (pad) {
//           playSound(pad);
//         }

//         if (i === sequence.length - 1) {
//           setIsPlaying(false);
//           setDisplayDescription('Sequence finished');
//           setCurrentMachine(originalMachine);
//         }
//       }, delay / 4);
//     }
//   };

//   const clearSequence = () => {
//     setSequence([]);
//     setDisplayDescription('Sequence cleared');
//   };

//   // Update pad-specific effects
//   const updatePadEffect = (padId, effectType, value) => {
//     setPadEffects(prev => ({
//       ...prev,
//       [padId]: {
//         ...prev[padId],
//         [effectType]: value
//       }
//     }));
//   };

//   // Clear pad-specific effects
//   const clearPadEffects = (padId) => {
//     setPadEffects(prev => {
//       const newEffects = { ...prev };
//       delete newEffects[padId];
//       return newEffects;
//     });
//   };

//   const currentMachineData = machines[currentMachine];

//   // Clean Pad Button Component
//   const PadButton = ({ pad, index, isActive, onClick }) => {
//     const description = descriptions[pad.id] || 'Drum Pad';
//     const bufferKey = `${currentMachine}-${pad.id}`;
//     const hasAudioFile = audioBuffers[bufferKey];
//     const loadingState = loadingStatus[bufferKey];
//     const hasCustomEffects = padEffects[pad.id];

//     return (
//       <button
//         className={`w-24 h-24 rounded-xl border-2 flex flex-col items-center justify-center font-bold transition-all duration-200 transform group relative ${
//           isActive 
//             ? 'border-white bg-gradient-to-br from-white to-gray-200 text-gray-900 scale-105 shadow-2xl' 
//             : selectedPad === pad.id
//             ? 'border-yellow-400 bg-gradient-to-br from-yellow-700/40 to-yellow-800/60 text-white hover:border-yellow-300 hover:scale-102 shadow-lg backdrop-blur-sm'
//             : 'border-purple-300/60 bg-gradient-to-br from-gray-700/80 to-gray-800/90 text-white hover:border-purple-400 hover:bg-gradient-to-br hover:from-purple-700/40 hover:to-purple-800/60 hover:scale-102 shadow-lg backdrop-blur-sm'
//         }`}
//         style={{
//           boxShadow: isActive 
//             ? `0 0 25px ${currentMachineData.color}, 0 0 50px ${currentMachineData.color}44, 0 8px 32px rgba(0,0,0,0.4)` 
//             : selectedPad === pad.id
//             ? '0 0 15px #fbbf24, 0 4px 20px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)'
//             : '0 4px 20px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)'
//         }}
//         onClick={onClick}
//         onDoubleClick={() => setSelectedPad(selectedPad === pad.id ? null : pad.id)}
//         onMouseDown={(e) => e.preventDefault()}
//         title={`${description} - ${hasAudioFile ? 'Audio Loaded' : loadingState === 'loading' ? 'Loading...' : 'No Audio'} ${selectedPad === pad.id ? '(Selected for editing)' : '(Double-click to edit effects)'}`}
//       >
//         <div className={`text-2xl font-black ${isActive ? 'text-gray-800' : selectedPad === pad.id ? 'text-yellow-200' : 'text-white group-hover:text-purple-200'}`}>
//           {pad.label}
//         </div>
//         <div className={`text-xs font-medium mt-1 ${isActive ? 'text-gray-600' : selectedPad === pad.id ? 'text-yellow-300' : 'text-gray-300 group-hover:text-purple-300'} truncate max-w-20 text-center leading-tight`}>
//           {description.split(':')[0].split(' ')[0]}
//         </div>

//         {/* Audio status indicator */}
//         <div className="absolute -top-1 -right-1">
//           {loadingState === 'loading' && (
//             <div className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></div>
//           )}
//           {loadingState === 'loaded' && (
//             <div className="w-3 h-3 bg-green-400 rounded-full"></div>
//           )}
//           {loadingState === 'error' && (
//             <div className="w-3 h-3 bg-red-400 rounded-full"></div>
//           )}
//           {!loadingState && (
//             <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
//           )}
//         </div>

//         {/* Custom effects indicator */}
//         {hasCustomEffects && (
//           <div className="absolute -top-1 -left-1">
//             <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
//           </div>
//         )}

//         {/* Pulse animation when active */}
//         {isActive && (
//           <div 
//             className="absolute inset-0 rounded-xl animate-ping opacity-75"
//             style={{
//               border: `2px solid ${currentMachineData.color}`,
//               backgroundColor: `${currentMachineData.color}22`
//             }}
//           />
//         )}
//       </button>
//     );
//   };

//   return (
//     <div className="w-full  bg-gray-900 text-white ">
//       {/* Top Navigation */}
//       <div className="flex justify-center items-center py-4 border-b border-gray-700">
//         <div className="flex space-x-8">
//           <button className="text-purple-400 border-b-2 border-purple-400 pb-1">
//             Instrument
//           </button>
//           <button className="text-gray-400 hover:text-white">Patterns</button>
//           <button className="text-gray-400 hover:text-white">Piano Roll</button>
//           <button className="text-purple-400 font-semibold">Effects</button>
//         </div>
//       </div>

//       {/* Machine Selector and Controls */}
//       <div className="flex justify-between items-center px-8 py-4">
//         <div className="flex items-center space-x-4">
//           <button 
//             onClick={() => setCurrentMachine((prev) => (prev - 1 + machines.length) % machines.length)}
//             className="text-gray-400 hover:text-white text-xl"
//           >
//             ←
//           </button>
//           <div className="text-center">
//             <div className="text-sm text-gray-400">⚙️</div>
//             <div className="text-white font-medium">{currentMachineData.type}</div>
//             <div className="text-white text-sm font-medium">{currentMachineData.name}</div>
//           </div>
//           <button 
//             onClick={() => setCurrentMachine((prev) => (prev + 1) % machines.length)}
//             className="text-gray-400 hover:text-white text-xl"
//           >
//             →
//           </button>
//         </div>
//       </div>

//       {/* Display */}
//       <div className="text-center py-2">
//         <div className="bg-black/50 rounded-lg p-3 backdrop-blur-sm inline-block min-w-96">
//           <p className="text-xl font-mono text-green-400">{displayDescription}</p>
//           {selectedPad && (
//             <p className="text-sm text-yellow-400 mt-1">
//               Editing pad {selectedPad} - Double-click another pad or same pad to change selection
//             </p>
//           )}
//         </div>
//       </div>

//       {/* Drum Pad Area */}
//       <div className="flex-1 flex items-center justify-center p-4">
//         <div 
//           className="p-8 rounded-2xl"
//           style={{
//             background: `linear-gradient(135deg, ${currentMachineData.color}22 0%, ${currentMachineData.color}44 50%, ${currentMachineData.color}33 100%)`,
//             backdropFilter: 'blur(10px)',
//             border: `1px solid ${currentMachineData.color}44`
//           }}
//         >
//           {/* 3x3 Grid Layout - First 9 pads */}
//           <div className="grid grid-cols-3 gap-6 mb-8">
//             {currentMachineData.pads.slice(0, 9).map((pad, index) => (
//               <PadButton
//                 key={pad.id}
//                 pad={pad}
//                 index={index}
//                 isActive={activePads.has(pad.id)}
//                 onClick={() => playSound(pad)}
//               />
//             ))}
//           </div>

//           {/* Additional pads row */}
//           {currentMachineData.pads.length > 9 && (
//             <div className="grid grid-cols-4 gap-4 justify-items-center">
//               {currentMachineData.pads.slice(9).map((pad, index) => (
//                 <PadButton
//                   key={pad.id}
//                   pad={pad}
//                   index={index + 9}
//                   isActive={activePads.has(pad.id)}
//                   onClick={() => playSound(pad)}
//                 />
//               ))}
//             </div>
//           )}
//         </div>
//       </div>

//       {/* Controls */}
//       <div className="bg-gray-800/95 backdrop-blur-sm p-4 border-t border-gray-700">
//         <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 max-w-7xl mx-auto">
//           {/* Global Effects Controls */}
//           <div className="space-y-3 ">
//             <label className="text-white font-semibold text-sm">Global Effects</label>
//             <div className="flex">
//             {/* Volume Control */}
//             <div className="space-y-1">
//               <label className="text-gray-300 text-xs">Volume: {Math.round(volume * 100)}%</label>
//               <input
//                 type="range"
//                 min="0"
//                 max="1"
//                 step="0.1"
//                 value={volume}
//                 onChange={(e) => setVolume(parseFloat(e.target.value))}
//                 className="w-full accent-purple-500"
//               />
//             </div>

//             {/* Pan Control */}
//             <div className="space-y-1">
//               <label className="text-gray-300 text-xs">Pan: {pan === 0 ? 'Center' : pan < 0 ? `${Math.abs(Math.round(pan * 100))}% Left` : `${Math.round(pan * 100)}% Right`}</label>
//               <input
//                 type="range"
//                 min="-1"
//                 max="1"
//                 step="0.1"
//                 value={pan}
//                 onChange={(e) => setPan(parseFloat(e.target.value))}
//                 className="w-full accent-blue-500"
//               />
//             </div>

//             {/* Reverb Control */}
//             <div className="space-y-1">
//               <label className="text-gray-300 text-xs">Reverb: {Math.round(reverb * 100)}%</label>
//               <input
//                 type="range"
//                 min="0"
//                 max="1"
//                 step="0.1"
//                 value={reverb}
//                 onChange={(e) => setReverb(parseFloat(e.target.value))}
//                 className="w-full accent-green-500"
//               />
//             </div>
//             </div>
//           </div>

//           {/* Individual Pad Effects */}
//           {selectedPad && (
//             <div className="space-y-3">
//               <div className="flex items-center justify-between">
//                 <label className="text-white font-semibold text-sm">Pad {selectedPad} Effects</label>
//                 <button
//                   onClick={() => clearPadEffects(selectedPad)}
//                   className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs"
//                 >
//                   Reset
//                 </button>
//               </div>

//               {/* Pad Volume */}
//               <div className="space-y-1">
//                 <label className="text-gray-300 text-xs">
//                   Volume: {padEffects[selectedPad]?.volume !== undefined ? Math.round(padEffects[selectedPad].volume * 100) + '%' : 'Global'}
//                 </label>
//                 <input
//                   type="range"
//                   min="0"
//                   max="1"
//                   step="0.1"
//                   value={padEffects[selectedPad]?.volume ?? volume}
//                   onChange={(e) => updatePadEffect(selectedPad, 'volume', parseFloat(e.target.value))}
//                   className="w-full accent-purple-500"
//                 />
//               </div>

//               {/* Pad Pan */}
//               <div className="space-y-1">
//                 <label className="text-gray-300 text-xs">
//                   Pan: {padEffects[selectedPad]?.pan !== undefined 
//                     ? padEffects[selectedPad].pan === 0 ? 'Center' 
//                       : padEffects[selectedPad].pan < 0 
//                         ? `${Math.abs(Math.round(padEffects[selectedPad].pan * 100))}% Left`
//                         : `${Math.round(padEffects[selectedPad].pan * 100)}% Right`
//                     : 'Global'}
//                 </label>
//                 <input
//                   type="range"
//                   min="-1"
//                   max="1"
//                   step="0.1"
//                   value={padEffects[selectedPad]?.pan ?? pan}
//                   onChange={(e) => updatePadEffect(selectedPad, 'pan', parseFloat(e.target.value))}
//                   className="w-full accent-blue-500"
//                 />
//               </div>

//               {/* Pad Reverb */}
//               <div className="space-y-1">
//                 <label className="text-gray-300 text-xs">
//                   Reverb: {padEffects[selectedPad]?.reverb !== undefined ? Math.round(padEffects[selectedPad].reverb * 100) + '%' : 'Global'}
//                 </label>
//                 <input
//                   type="range"
//                   min="0"
//                   max="1"
//                   step="0.1"
//                   value={padEffects[selectedPad]?.reverb ?? reverb}
//                   onChange={(e) => updatePadEffect(selectedPad, 'reverb', parseFloat(e.target.value))}
//                   className="w-full accent-green-500"
//                 />
//               </div>
//             </div>
//           )}

//           {/* Recording Controls */}
//           <div className="space-y-2">
//             <label className="text-white font-semibold text-sm">Recording</label>
//             <div className="flex gap-2">
//               <button
//                 onClick={toggleRecording}
//                 className={`px-3 py-1 rounded text-sm font-semibold transition-colors ${
//                   isRecording
//                     ? 'bg-red-600 hover:bg-red-700 text-white'
//                     : 'bg-green-600 hover:bg-green-700 text-white'
//                 }`}
//               >
//                 {isRecording ? '⏹️ Stop' : '🔴 Rec'}
//               </button>
//               <button
//                 onClick={clearSequence}
//                 className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded text-sm font-semibold transition-colors disabled:opacity-50"
//                 disabled={sequence.length === 0}
//               >
//                 🗑️ Clear
//               </button>
//             </div>
//           </div>

//           {/* Playback Controls */}
//           <div className="space-y-2">
//             <label className="text-white font-semibold text-sm">Playback</label>
//             <div className="flex gap-2 items-center">
//               <button
//                 onClick={playSequence}
//                 className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-semibold transition-colors disabled:opacity-50"
//                 disabled={sequence.length === 0 || isPlaying}
//               >
//                 {isPlaying ? '⏸️ Playing...' : '▶️ Play'}
//               </button>
//               <span className="text-white text-xs">
//                 {sequence.length} beats
//               </span>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Instructions */}
//       <div className="text-center text-gray-400 text-xs py-2 border-t border-gray-700">
//         Click pads or use keyboard • Double-click pads to edit individual effects • 🟢 Loaded | 🟡 Loading | 🔴 Error | ⚫ No Audio | 🔵 Custom Effects
//       </div>
//     </div>
//   );
// };

// export default DrumPadMachine;











// import React, { useState, useRef, useCallback, useEffect } from 'react';

// const DrumPadMachine = () => {
//   const [currentType, setCurrentType] = useState(0);
//   const [activePads, setActivePads] = useState(new Set());
//   const [displayDescription, setDisplayDescription] = useState('Press a key or click a pad!');
//   const [volume, setVolume] = useState(0.7);
//   const [pan, setPan] = useState(0);
//   const [reverb, setReverb] = useState(0.2);
//   const [isRecording, setIsRecording] = useState(false);
//   const [sequence, setSequence] = useState([]);
//   const [isPlaying, setIsPlaying] = useState(false);
//   const [audioBuffers, setAudioBuffers] = useState({});
//   const [loadingStatus, setLoadingStatus] = useState({});
//   const [selectedPad, setSelectedPad] = useState(null);
//   const [padEffects, setPadEffects] = useState({});
//   const audioContextRef = useRef(null);
//   const reverbBufferRef = useRef(null);

//   // Define different drum machine types with their own sounds
//   const drumMachineTypes = [
//     {
//       name: "Classic 808",
//       icon: "🥁",
//       color: '#7c3aed',
//       description: "Classic analog drum machine sounds",
//       effects: {
//         bassBoost: 1.2,
//         compression: 0.8,
//         saturation: 0.3
//       },
//       pads: [
//         { id: 'Q', label: 'Q', sound: 'kick', audioUrl: '/Audio/808/kick.mp3' },
//         { id: '1', label: '1', sound: 'snare', audioUrl: '/Audio/808/snare.mp3' },
//         { id: 'E', label: 'E', sound: 'hihat', audioUrl: '/Audio/808/hihat.mp3' },
//         { id: '8', label: '8', sound: 'openhat', audioUrl: '/Audio/808/openhat.mp3' },
//         { id: 'D', label: 'D', sound: 'clap', audioUrl: '/Audio/808/clap.mp3' },
//         { id: 'O', label: 'O', sound: 'perc1', audioUrl: '/Audio/808/perc1.mp3' },
//         { id: 'A', label: 'A', sound: 'bass', audioUrl: '/Audio/808/bass.mp3' },
//         { id: 'U', label: 'U', sound: 'tom', audioUrl: '/Audio/808/tom.mp3' },
//         { id: 'X', label: 'X', sound: 'crash', audioUrl: '/Audio/808/crash.mp3' },
//         { id: 'T', label: 'T', sound: 'ride', audioUrl: '/Audio/Tasty/t.mp3' },
//         { id: 'J', label: 'J', sound: 'cowbell', audioUrl: '/Audio/Tasty/j.mp3' },
//       ]
//     },
//     {
//       name: "Vintage 909",
//       icon: "🎛️",
//       color: '#dc2626',
//       description: "House and techno drum machine",
//       effects: {
//         bassBoost: 1.0,
//         compression: 0.6,
//         saturation: 0.2
//       },
//       pads: [
//         { id: 'Q', label: 'Q', sound: 'kick', audioUrl: '/Audio/909/kick.mp3' },
//         { id: '1', label: '1', sound: 'snare', audioUrl: '/Audio/909/snare.mp3' },
//         { id: 'E', label: 'E', sound: 'hihat', audioUrl: '/Audio/909/hihat.mp3' },
//         { id: '8', label: '8', sound: 'openhat', audioUrl: '/Audio/909/openhat.mp3' },
//         { id: 'D', label: 'D', sound: 'clap', audioUrl: '/Audio/909/clap.mp3' },
//         { id: 'O', label: 'O', sound: 'perc1', audioUrl: '/Audio/909/perc1.mp3' },
//         { id: 'A', label: 'A', sound: 'bass', audioUrl: '/Audio/909/bass.mp3' },
//         { id: 'U', label: 'U', sound: 'tom', audioUrl: '/Audio/909/tom.mp3' },
//         { id: 'X', label: 'X', sound: 'crash', audioUrl: '/Audio/909/crash.mp3' },
//         { id: 'T', label: 'T', sound: 'ride', audioUrl: '/Audio/Muffled/t.mp3' },
//         { id: 'J', label: 'J', sound: 'cowbell', audioUrl: '/Audio/Muffled/j.mp3' },
//         { id: 'H', label: 'H', sound: 'shaker', audioUrl: '/Audio/Muffled/h.mp3' },
//       ]
//     },
//     {
//       name: "Modern Trap",
//       icon: "💎",
//       color: '#059669',
//       description: "Contemporary trap and hip-hop sounds",
//       effects: {
//         bassBoost: 1.5,
//         compression: 1.2,
//         saturation: 0.5
//       },
//       pads: [
//         { id: 'Q', label: 'Q', sound: 'kick', audioUrl: '/Audio/Tasty/q.mp3' },
//         { id: '1', label: '1', sound: 'snare', audioUrl: '/Audio/Tasty/1.mp3' },
//         { id: 'E', label: 'E', sound: 'hihat', audioUrl: '/Audio/Tasty/e.mp3' },
//         { id: '8', label: '8', sound: 'openhat', audioUrl: '/Audio/Tasty/8.mp3' },
//         { id: 'D', label: 'D', sound: 'clap', audioUrl: '/Audio/Tasty/d.mp3' },
//         { id: 'O', label: 'O', sound: 'perc1', audioUrl: '/Audio/Tasty/o.mp3' },
//         { id: 'A', label: 'A', sound: 'bass', audioUrl: '/Audio/Tasty/a.mp3' },
//         { id: 'U', label: 'U', sound: 'tom', audioUrl: '/Audio/Tasty/u.mp3' },
//         { id: 'X', label: 'X', sound: 'crash', audioUrl: '/Audio/Tasty/x.mp3' },
//         { id: 'T', label: 'T', sound: 'ride', audioUrl: '/Audio/Tasty/t.mp3' },
//         { id: 'J', label: 'J', sound: 'cowbell', audioUrl: '/Audio/Tasty/j.mp3' },
//       ]
//     },
//     {
//       name: "Acoustic Kit",
//       icon: "🪘",
//       color: '#d97706',
//       description: "Natural acoustic drum sounds",
//       effects: {
//         bassBoost: 0.9,
//         compression: 0.4,
//         saturation: 0.1
//       },
//       pads: [
//         { id: 'Q', label: 'Q', sound: 'kick', audioUrl: '/Audio/Acoustic/kick.mp3' },
//         { id: '1', label: '1', sound: 'snare', audioUrl: '/Audio/Acoustic/snare.mp3' },
//         { id: 'E', label: 'E', sound: 'hihat', audioUrl: '/Audio/Acoustic/hihat.mp3' },
//         { id: '8', label: '8', sound: 'openhat', audioUrl: '/Audio/Acoustic/openhat.mp3' },
//         { id: 'D', label: 'D', sound: 'clap', audioUrl: '/Audio/Acoustic/clap.mp3' },
//         { id: 'O', label: 'O', sound: 'perc1', audioUrl: '/Audio/Acoustic/perc1.mp3' },
//         { id: 'A', label: 'A', sound: 'bass', audioUrl: '/Audio/Acoustic/bass.mp3' },
//         { id: 'U', label: 'U', sound: 'tom', audioUrl: '/Audio/Acoustic/tom.mp3' },
//         { id: 'X', label: 'X', sound: 'crash', audioUrl: '/Audio/Acoustic/crash.mp3' },
//         { id: 'T', label: 'T', sound: 'ride', audioUrl: '/Audio/Muffled/t.mp3' },
//         { id: 'J', label: 'J', sound: 'cowbell', audioUrl: '/Audio/Muffled/j.mp3' },
//         { id: 'H', label: 'H', sound: 'shaker', audioUrl: '/Audio/Muffled/h.mp3' },
//         { id: 'K', label: 'K', sound: 'woodblock', audioUrl: '/Audio/Muffled/k.mp3' },
//       ]
//     },
//     {
//       name: "Electro Pop",
//       icon: "⚡",
//       color: '#c2410c',
//       description: "Electronic pop and synth sounds",
//       effects: {
//         bassBoost: 1.1,
//         compression: 0.9,
//         saturation: 0.6
//       },
//       pads: [
//         { id: 'Q', label: 'Q', sound: 'kick', audioUrl: '/Audio/Electro/kick.mp3' },
//         { id: '1', label: '1', sound: 'snare', audioUrl: '/Audio/Electro/snare.mp3' },
//         { id: 'E', label: 'E', sound: 'hihat', audioUrl: '/Audio/Electro/hihat.mp3' },
//         { id: '8', label: '8', sound: 'openhat', audioUrl: '/Audio/Electro/openhat.mp3' },
//         { id: 'D', label: 'D', sound: 'clap', audioUrl: '/Audio/Electro/clap.mp3' },
//         { id: 'O', label: 'O', sound: 'perc1', audioUrl: '/Audio/Electro/perc1.mp3' },
//         { id: 'A', label: 'A', sound: 'bass', audioUrl: '/Audio/Electro/bass.mp3' },
//         { id: 'U', label: 'U', sound: 'tom', audioUrl: '/Audio/Electro/tom.mp3' },
//         { id: 'X', label: 'X', sound: 'crash', audioUrl: '/Audio/Electro/crash.mp3' },
//         { id: 'T', label: 'T', sound: 'ride', audioUrl: '/Audio/Muffled/t.mp3' },
//         { id: 'J', label: 'J', sound: 'cowbell', audioUrl: '/Audio/Muffled/j.mp3' },
//         { id: 'H', label: 'H', sound: 'shaker', audioUrl: '/Audio/Muffled/h.mp3' },
//         { id: 'K', label: 'K', sound: 'woodblock', audioUrl: '/Audio/Muffled/k.mp3' },
//         { id: 'Y', label: 'Y', sound: 'vocal', audioUrl: '/Audio/Muffled/y.mp3' },
//       ]
//     },
//     {
//       name: "Lo-Fi Vinyl",
//       icon: "📀",
//       color: '#7c2d12',
//       description: "Vintage vinyl-sampled drums",
//       effects: {
//         bassBoost: 0.8,
//         compression: 0.5,
//         saturation: 0.4
//       },
//       pads: [
//         { id: 'Q', label: 'Q', sound: 'kick', audioUrl: '/Audio/Muffled/q.mp3' },
//         { id: '1', label: '1', sound: 'snare', audioUrl: '/Audio/Muffled/1.mp3' },
//         { id: 'E', label: 'E', sound: 'hihat', audioUrl: '/Audio/Muffled/e.mp3' },
//         { id: '8', label: '8', sound: 'openhat', audioUrl: '/Audio/Muffled/8.mp3' },
//         { id: 'D', label: 'D', sound: 'clap', audioUrl: '/Audio/Muffled/d.mp3' },
//         { id: 'O', label: 'O', sound: 'perc1', audioUrl: '/Audio/Muffled/o.mp3' },
//         { id: 'A', label: 'A', sound: 'bass', audioUrl: '/Audio/Muffled/a.mp3' },
//         { id: 'U', label: 'U', sound: 'tom', audioUrl: '/Audio/Muffled/u.mp3' },
//         { id: 'X', label: 'X', sound: 'crash', audioUrl: '/Audio/Muffled/x.mp3' },
//         { id: 'T', label: 'T', sound: 'ride', audioUrl: '/Audio/Muffled/t.mp3' },
//         { id: 'J', label: 'J', sound: 'cowbell', audioUrl: '/Audio/Muffled/j.mp3' },
//         { id: 'H', label: 'H', sound: 'shaker', audioUrl: '/Audio/Muffled/h.mp3' },
//         { id: 'K', label: 'K', sound: 'woodblock', audioUrl: '/Audio/Muffled/k.mp3' },
//         { id: 'Y', label: 'Y', sound: 'vocal', audioUrl: '/Audio/Muffled/y.mp3' },
//         { id: '9', label: '9', sound: 'fx1', audioUrl: '/Audio/Muffled/9.mp3' },
//         { id: '7', label: '7', sound: 'fx2', audioUrl: '/Audio/Muffled/7.mp3' },
//       ]
//     }
//   ];

//   const soundDescriptions = {
//     kick: 'Kick Drum',
//     snare: 'Snare Drum', 
//     hihat: 'Hi-Hat Closed',
//     openhat: 'Hi-Hat Open',
//     clap: 'Hand Clap',
//     perc1: 'Percussion',
//     bass: 'Bass Drum',
//     tom: 'Tom Drum',
//     crash: 'Crash Cymbal',
//     ride: 'Ride Cymbal',
//     cowbell: 'Cowbell',
//     shaker: 'Shaker',
//     woodblock: 'Wood Block',
//     vocal: 'Vocal Sample',
//     fx1: 'Sound FX 1',
//     fx2: 'Sound FX 2'
//   };

//   // Initialize Web Audio API
//   const getAudioContext = useCallback(() => {
//     if (!audioContextRef.current) {
//       audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
//     }
//     return audioContextRef.current;
//   }, []);

//   // Create reverb impulse response
//   const createReverbBuffer = useCallback(() => {
//     if (reverbBufferRef.current) return reverbBufferRef.current;

//     const audioContext = getAudioContext();
//     const length = audioContext.sampleRate * 2;
//     const buffer = audioContext.createBuffer(2, length, audioContext.sampleRate);

//     for (let channel = 0; channel < 2; channel++) {
//       const channelData = buffer.getChannelData(channel);
//       for (let i = 0; i < length; i++) {
//         const decay = Math.pow(1 - i / length, 2);
//         channelData[i] = (Math.random() * 2 - 1) * decay;
//       }
//     }

//     reverbBufferRef.current = buffer;
//     return buffer;
//   }, [getAudioContext]);

//   // Apply drum machine type effects to audio
//   const applyTypeEffects = useCallback((audioNode, typeEffects) => {
//     const audioContext = getAudioContext();

//     // Create EQ for bass boost
//     const lowShelf = audioContext.createBiquadFilter();
//     lowShelf.type = 'lowshelf';
//     lowShelf.frequency.setValueAtTime(200, audioContext.currentTime);
//     lowShelf.gain.setValueAtTime((typeEffects.bassBoost - 1) * 10, audioContext.currentTime);

//     // Create compressor
//     const compressor = audioContext.createDynamicsCompressor();
//     compressor.threshold.setValueAtTime(-24, audioContext.currentTime);
//     compressor.knee.setValueAtTime(30, audioContext.currentTime);
//     compressor.ratio.setValueAtTime(12, audioContext.currentTime);
//     compressor.attack.setValueAtTime(0.003, audioContext.currentTime);
//     compressor.release.setValueAtTime(0.25, audioContext.currentTime);

//     // Create waveshaper for saturation
//     const waveshaper = audioContext.createWaveShaper();
//     const samples = 44100;
//     const curve = new Float32Array(samples);
//     const deg = Math.PI / 180;
//     for (let i = 0; i < samples; i++) {
//       const x = (i * 2) / samples - 1;
//       curve[i] = (3 + typeEffects.saturation) * x * 20 * deg / (Math.PI + typeEffects.saturation * Math.abs(x));
//     }
//     waveshaper.curve = curve;
//     waveshaper.oversample = '4x';

//     // Connect effects chain
//     audioNode.connect(lowShelf);
//     lowShelf.connect(compressor);
//     compressor.connect(waveshaper);

//     return waveshaper;
//   }, [getAudioContext]);

//   // Load audio from URL
//   const loadAudioFromUrl = useCallback(async (audioUrl, padId, typeIndex) => {
//     try {
//       const bufferKey = `${typeIndex}-${padId}`;
//       setLoadingStatus(prev => ({
//         ...prev,
//         [bufferKey]: 'loading'
//       }));

//       const audioContext = getAudioContext();
//       const response = await fetch(audioUrl);

//       if (!response.ok) {
//         throw new Error(`HTTP error! status: ${response.status}`);
//       }

//       const arrayBuffer = await response.arrayBuffer();
//       const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

//       setAudioBuffers(prev => ({
//         ...prev,
//         [bufferKey]: audioBuffer
//       }));

//       setLoadingStatus(prev => ({
//         ...prev,
//         [bufferKey]: 'loaded'
//       }));

//       return audioBuffer;
//     } catch (error) {
//       console.error('Error loading audio from URL:', error);
//       const bufferKey = `${typeIndex}-${padId}`;
//       setLoadingStatus(prev => ({
//         ...prev,
//         [bufferKey]: 'error'
//       }));
//       return null;
//     }
//   }, [getAudioContext]);

//   // Play sound with effects
//   const playSound = useCallback((pad) => {
//     try {
//       const audioContext = getAudioContext();

//       if (audioContext.state === 'suspended') {
//         audioContext.resume();
//       }

//       const bufferKey = `${currentType}-${pad.id}`;
//       const audioBuffer = audioBuffers[bufferKey];

//       if (audioBuffer) {
//         const padEffect = padEffects[pad.id] || {};
//         const effectiveVolume = padEffect.volume !== undefined ? padEffect.volume : volume;
//         const effectivePan = padEffect.pan !== undefined ? padEffect.pan : pan;
//         const effectiveReverb = padEffect.reverb !== undefined ? padEffect.reverb : reverb;
//         const currentTypeEffects = drumMachineTypes[currentType].effects;

//         // Create audio nodes
//         const source = audioContext.createBufferSource();
//         const gainNode = audioContext.createGain();
//         const panNode = audioContext.createStereoPanner();
//         const dryGainNode = audioContext.createGain();
//         const wetGainNode = audioContext.createGain();
//         const convolver = audioContext.createConvolver();

//         // Set up reverb
//         convolver.buffer = createReverbBuffer();

//         // Set up source
//         source.buffer = audioBuffer;

//         // Set up gain (volume)
//         gainNode.gain.setValueAtTime(effectiveVolume, audioContext.currentTime);

//         // Set up pan
//         panNode.pan.setValueAtTime(effectivePan, audioContext.currentTime);

//         // Set up reverb mix
//         dryGainNode.gain.setValueAtTime(1 - effectiveReverb, audioContext.currentTime);
//         wetGainNode.gain.setValueAtTime(effectiveReverb, audioContext.currentTime);

//         // Apply drum machine type effects
//         const effectsOutput = applyTypeEffects(source, currentTypeEffects);

//         // Connect nodes with type effects
//         effectsOutput.connect(gainNode);
//         gainNode.connect(panNode);

//         // Dry path
//         panNode.connect(dryGainNode);
//         dryGainNode.connect(audioContext.destination);

//         // Wet path (reverb)
//         panNode.connect(convolver);
//         convolver.connect(wetGainNode);
//         wetGainNode.connect(audioContext.destination);

//         source.start(audioContext.currentTime);

//         // Visual feedback
//         setActivePads(prev => new Set([...prev, pad.id]));
//         setTimeout(() => {
//           setActivePads(prev => {
//             const newSet = new Set(prev);
//             newSet.delete(pad.id);
//             return newSet;
//           });
//         }, 200);

//         const effectsText = padEffect.volume !== undefined || padEffect.pan !== undefined || padEffect.reverb !== undefined 
//           ? ' (Custom)' : '';
//         const soundName = soundDescriptions[pad.sound] || 'Drum Sound';
//         setDisplayDescription(`${soundName} - ${drumMachineTypes[currentType].name}${effectsText}`);

//         if (isRecording) {
//           setSequence(prev => [...prev, { 
//             key: pad.id, 
//             time: Date.now(), 
//             type: currentType,
//             effects: { ...padEffect }
//           }]);
//         }
//       } else {
//         const soundName = soundDescriptions[pad.sound] || 'Drum Sound';
//         setDisplayDescription(`${soundName} - Loading audio...`);
//       }
//     } catch (error) {
//       console.error('Error playing sound:', error);
//       setDisplayDescription('Audio not available');
//     }
//   }, [getAudioContext, volume, pan, reverb, soundDescriptions, drumMachineTypes, currentType, isRecording, audioBuffers, padEffects, createReverbBuffer, applyTypeEffects]);

//   // Load initial audio files on component mount and type change
//   useEffect(() => {
//     const currentTypeData = drumMachineTypes[currentType];

//     currentTypeData.pads.forEach((pad) => {
//       if (pad.audioUrl) {
//         const bufferKey = `${currentType}-${pad.id}`;
//         if (!audioBuffers[bufferKey] && !loadingStatus[bufferKey]) {
//           loadAudioFromUrl(pad.audioUrl, pad.id, currentType);
//         }
//       }
//     });
//   }, [currentType, drumMachineTypes, loadAudioFromUrl, audioBuffers, loadingStatus]);

//   // Keyboard handling
//   useEffect(() => {
//     const handleKeyDown = (event) => {
//       const keyMap = {
//         81: 'Q', 49: '1', 51: '3', 71: 'G', 69: 'E', 56: '8',
//         68: 'D', 65: 'A', 85: 'U', 88: 'X', 84: 'T', 55: '7',
//         89: 'Y', 72: 'H', 74: 'J', 75: 'K', 57: '9'
//       };    

//       if (keyMap[event.keyCode]) {
//         event.preventDefault();
//         const currentPads = drumMachineTypes[currentType].pads;
//         const pad = currentPads.find(p => p.id === keyMap[event.keyCode]);
//         if (pad) {
//           playSound(pad);
//         }
//       }
//     };

//     document.addEventListener('keydown', handleKeyDown);
//     return () => document.removeEventListener('keydown', handleKeyDown);
//   }, [currentType, drumMachineTypes, playSound]);

//   const toggleRecording = () => {
//     if (isRecording) {
//       setIsRecording(false);
//       setDisplayDescription('Recording stopped');
//     } else {
//       setSequence([]);
//       setIsRecording(true);
//       setDisplayDescription('Recording started...');
//     }
//   };

//   const playSequence = async () => {
//     if (sequence.length === 0) return;

//     setIsPlaying(true);
//     setDisplayDescription('Playing sequence...');

//     const startTime = sequence[0].time;
//     const originalType = currentType;

//     for (let i = 0; i < sequence.length; i++) {
//       const note = sequence[i];
//       const delay = note.time - startTime;

//       setTimeout(() => {
//         if (note.type !== undefined && note.type !== currentType) {
//           setCurrentType(note.type);
//         }

//         if (note.effects) {
//           setPadEffects(prev => ({
//             ...prev,
//             [note.key]: note.effects
//           }));
//         }

//         const currentPads = drumMachineTypes[note.type || currentType].pads;
//         const pad = currentPads.find(p => p.id === note.key);
//         if (pad) {
//           playSound(pad);
//         }

//         if (i === sequence.length - 1) {
//           setIsPlaying(false);
//           setDisplayDescription('Sequence finished');
//           setCurrentType(originalType);
//         }
//       }, delay / 4);
//     }
//   };

//   const clearSequence = () => {
//     setSequence([]);
//     setDisplayDescription('Sequence cleared');
//   };

//   const updatePadEffect = (padId, effectType, value) => {
//     setPadEffects(prev => ({
//       ...prev,
//       [padId]: {
//         ...prev[padId],
//         [effectType]: value
//       }
//     }));
//   };

//   const clearPadEffects = (padId) => {
//     setPadEffects(prev => {
//       const newEffects = { ...prev };
//       delete newEffects[padId];
//       return newEffects;
//     });
//   };

//   const currentTypeData = drumMachineTypes[currentType];

//   // Clean Pad Button Component
//   const PadButton = ({ pad, index, isActive, onClick }) => {
//     const soundName = soundDescriptions[pad.sound] || 'Drum Sound';
//     const bufferKey = `${currentType}-${pad.id}`;
//     const hasAudioFile = audioBuffers[bufferKey];
//     const loadingState = loadingStatus[bufferKey];
//     const hasCustomEffects = padEffects[pad.id];

//     return (
//       <button
//         className={`w-24 h-24 rounded-xl border-2 flex flex-col items-center justify-center font-bold transition-all duration-200 transform group relative ${
//           isActive 
//             ? 'border-white bg-gradient-to-br from-white to-gray-200 text-gray-900 scale-105 shadow-2xl' 
//             : selectedPad === pad.id
//             ? 'border-yellow-400 bg-gradient-to-br from-yellow-700/40 to-yellow-800/60 text-white hover:border-yellow-300 hover:scale-102 shadow-lg backdrop-blur-sm'
//             : 'border-purple-300/60 bg-gradient-to-br from-gray-700/80 to-gray-800/90 text-white hover:border-purple-400 hover:bg-gradient-to-br hover:from-purple-700/40 hover:to-purple-800/60 hover:scale-102 shadow-lg backdrop-blur-sm'
//         }`}
//         style={{
//           boxShadow: isActive 
//             ? `0 0 25px ${currentTypeData.color}, 0 0 50px ${currentTypeData.color}44, 0 8px 32px rgba(0,0,0,0.4)` 
//             : selectedPad === pad.id
//             ? '0 0 15px #fbbf24, 0 4px 20px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)'
//             : '0 4px 20px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)'
//         }}
//         onClick={onClick}
//         onDoubleClick={() => setSelectedPad(selectedPad === pad.id ? null : pad.id)}
//         onMouseDown={(e) => e.preventDefault()}
//         title={`${soundName} (${pad.label}) - ${hasAudioFile ? 'Audio Loaded' : loadingState === 'loading' ? 'Loading...' : 'No Audio'} ${selectedPad === pad.id ? '(Selected for editing)' : '(Double-click to edit effects)'}`}
//       >
//         <div className={`text-2xl font-black ${isActive ? 'text-gray-800' : selectedPad === pad.id ? 'text-yellow-200' : 'text-white group-hover:text-purple-200'}`}>
//           {pad.label}
//         </div>
//         <div className={`text-xs font-medium mt-1 ${isActive ? 'text-gray-600' : selectedPad === pad.id ? 'text-yellow-300' : 'text-gray-300 group-hover:text-purple-300'} truncate max-w-20 text-center leading-tight`}>
//           {soundName.split(' ')[0]}
//         </div>

//         {/* Audio status indicator */}
//         <div className="absolute -top-1 -right-1">
//           {loadingState === 'loading' && (
//             <div className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></div>
//           )}
//           {loadingState === 'loaded' && (
//             <div className="w-3 h-3 bg-green-400 rounded-full"></div>
//           )}
//           {loadingState === 'error' && (
//             <div className="w-3 h-3 bg-red-400 rounded-full"></div>
//           )}
//           {!loadingState && (
//             <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
//           )}
//         </div>

//         {/* Custom effects indicator */}
//         {hasCustomEffects && (
//           <div className="absolute -top-1 -left-1">
//             <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
//           </div>
//         )}

//         {/* Pulse animation when active */}
//         {isActive && (
//           <div 
//             className="absolute inset-0 rounded-xl animate-ping opacity-75"
//             style={{
//               border: `2px solid ${currentTypeData.color}`,
//               backgroundColor: `${currentTypeData.color}22`
//             }}
//           />
//         )}
//       </button>
//     );
//   };

//   return (
//     <div className="w-full bg-gray-900 text-white">
//       {/* Top Navigation */}
//       <div className="flex justify-center items-center py-4 border-b border-gray-700">
//         <div className="flex space-x-8">
//           <button className="text-purple-400 border-b-2 border-purple-400 pb-1">
//             Instrument
//           </button>
//           <button className="text-gray-400 hover:text-white">Patterns</button>
//           <button className="text-gray-400 hover:text-white">Piano Roll</button>
//           <button className="text-purple-400 font-semibold">Effects</button>
//         </div>
//       </div>

//       {/* Type Selector */}
//       <div className="flex justify-center items-center px-8 py-4">
//         <div className="flex items-center space-x-4">
//           <button 
//             onClick={() => setCurrentType((prev) => (prev - 1 + drumMachineTypes.length) % drumMachineTypes.length)}
//             className="text-gray-400 hover:text-white text-xl"
//           >
//             ←
//           </button>
//           <div className="text-center">
//             <div className="text-2xl" style={{ color: currentTypeData.color }}>{currentTypeData.icon}</div>
//             <div className="text-white font-medium">{currentTypeData.name}</div>
//             <div className="text-xs text-gray-400 max-w-32 truncate">{currentTypeData.description}</div>
//           </div>
//           <button 
//             onClick={() => setCurrentType((prev) => (prev + 1) % drumMachineTypes.length)}
//             className="text-gray-400 hover:text-white text-xl"
//           >
//             →
//           </button>
//         </div>
//       </div>

//       {/* Display */}
//       <div className="text-center py-2">
//         <div className="bg-black/50 rounded-lg p-3 backdrop-blur-sm inline-block min-w-96">
//           <p className="text-xl font-mono text-green-400">{displayDescription}</p>
//           {selectedPad && (
//             <p className="text-sm text-yellow-400 mt-1">
//               Editing pad {selectedPad} - Double-click another pad or same pad to change selection
//             </p>
//           )}
//         </div>
//       </div>

//       {/* Drum Pad Area */}
//       <div className="flex-1 flex items-center justify-center p-4">
//         <div 
//           className="p-8 rounded-2xl"
//           style={{
//             background: `linear-gradient(135deg, ${currentTypeData.color}22 0%, ${currentTypeData.color}44 50%, ${currentTypeData.color}33 100%)`,
//             backdropFilter: 'blur(10px)',
//             border: `1px solid ${currentTypeData.color}44`
//           }}
//         >
//           {/* 3x3 Grid Layout - First 9 pads */}
//           <div className="grid grid-cols-3 gap-6 mb-8">
//             {currentTypeData.pads.slice(0, 9).map((pad, index) => (
//               <PadButton
//                 key={pad.id}
//                 pad={pad}
//                 index={index}
//                 isActive={activePads.has(pad.id)}
//                 onClick={() => playSound(pad)}
//               />
//             ))}
//           </div>

//           {/* Additional pads row */}
//           {currentTypeData.pads.length > 9 && (
//             <div className="grid grid-cols-4 gap-4 justify-items-center">
//               {currentTypeData.pads.slice(9).map((pad, index) => (
//                 <PadButton
//                   key={pad.id}
//                   pad={pad}
//                   index={index + 9}
//                   isActive={activePads.has(pad.id)}
//                   onClick={() => playSound(pad)}
//                 />
//               ))}
//             </div>
//           )}
//         </div>
//       </div>

//       {/* Controls */}
//       <div className="bg-gray-800/95 backdrop-blur-sm p-4 border-t border-gray-700">
//         <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 max-w-7xl mx-auto">
//           {/* Global Effects Controls */}
//           <div className="space-y-3">
//             <label className="text-white font-semibold text-sm">Global Effects</label>
//             <div className="flex flex-col space-y-2">
//               {/* Volume Control */}
//               <div className="space-y-1">
//                 <label className="text-gray-300 text-xs">Volume: {Math.round(volume * 100)}%</label>
//                 <input
//                   type="range"
//                   min="0"
//                   max="1"
//                   step="0.1"
//                   value={volume}
//                   onChange={(e) => setVolume(parseFloat(e.target.value))}
//                   className="w-full accent-purple-500"
//                 />
//               </div>

//               {/* Pan Control */}
//               <div className="space-y-1">
//                 <label className="text-gray-300 text-xs">Pan: {pan === 0 ? 'Center' : pan < 0 ? `${Math.abs(Math.round(pan * 100))}% Left` : `${Math.round(pan * 100)}% Right`}</label>
//                 <input
//                   type="range"
//                   min="-1"
//                   max="1"
//                   step="0.1"
//                   value={pan}
//                   onChange={(e) => setPan(parseFloat(e.target.value))}
//                   className="w-full accent-blue-500"
//                 />
//               </div>

//               {/* Reverb Control */}
//               <div className="space-y-1">
//                 <label className="text-gray-300 text-xs">Reverb: {Math.round(reverb * 100)}%</label>
//                 <input
//                   type="range"
//                   min="0"
//                   max="1"
//                   step="0.1"
//                   value={reverb}
//                   onChange={(e) => setReverb(parseFloat(e.target.value))}
//                   className="w-full accent-green-500"
//                 />
//               </div>
//             </div>
//           </div>

//           {/* Individual Pad Effects */}
//           {selectedPad && (
//             <div className="space-y-3">
//               <div className="flex items-center justify-between">
//                 <label className="text-white font-semibold text-sm">Pad {selectedPad} Effects</label>
//                 <button
//                   onClick={() => clearPadEffects(selectedPad)}
//                   className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs"
//                 >
//                   Reset
//                 </button>
//               </div>

//               {/* Pad Volume */}
//               <div className="space-y-1">
//                 <label className="text-gray-300 text-xs">
//                   Volume: {padEffects[selectedPad]?.volume !== undefined ? Math.round(padEffects[selectedPad].volume * 100) + '%' : 'Global'}
//                 </label>
//                 <input
//                   type="range"
//                   min="0"
//                   max="1"
//                   step="0.1"
//                   value={padEffects[selectedPad]?.volume ?? volume}
//                   onChange={(e) => updatePadEffect(selectedPad, 'volume', parseFloat(e.target.value))}
//                   className="w-full accent-purple-500"
//                 />
//               </div>

//               {/* Pad Pan */}
//               <div className="space-y-1">
//                 <label className="text-gray-300 text-xs">
//                   Pan: {padEffects[selectedPad]?.pan !== undefined 
//                     ? padEffects[selectedPad].pan === 0 ? 'Center' 
//                       : padEffects[selectedPad].pan < 0 
//                         ? `${Math.abs(Math.round(padEffects[selectedPad].pan * 100))}% Left`
//                         : `${Math.round(padEffects[selectedPad].pan * 100)}% Right`
//                     : 'Global'}
//                 </label>
//                 <input
//                   type="range"
//                   min="-1"
//                   max="1"
//                   step="0.1"
//                   value={padEffects[selectedPad]?.pan ?? pan}
//                   onChange={(e) => updatePadEffect(selectedPad, 'pan', parseFloat(e.target.value))}
//                   className="w-full accent-blue-500"
//                 />
//               </div>

//               {/* Pad Reverb */}
//               <div className="space-y-1">
//                 <label className="text-gray-300 text-xs">
//                   Reverb: {padEffects[selectedPad]?.reverb !== undefined ? Math.round(padEffects[selectedPad].reverb * 100) + '%' : 'Global'}
//                 </label>
//                 <input
//                   type="range"
//                   min="0"
//                   max="1"
//                   step="0.1"
//                   value={padEffects[selectedPad]?.reverb ?? reverb}
//                   onChange={(e) => updatePadEffect(selectedPad, 'reverb', parseFloat(e.target.value))}
//                   className="w-full accent-green-500"
//                 />
//               </div>
//             </div>
//           )}

//           {/* Recording Controls */}
//           <div className="space-y-2">
//             <label className="text-white font-semibold text-sm">Recording</label>
//             <div className="flex gap-2">
//               <button
//                 onClick={toggleRecording}
//                 className={`px-3 py-1 rounded text-sm font-semibold transition-colors ${
//                   isRecording
//                     ? 'bg-red-600 hover:bg-red-700 text-white'
//                     : 'bg-green-600 hover:bg-green-700 text-white'
//                 }`}
//               >
//                 {isRecording ? '⏹️ Stop' : '🔴 Rec'}
//               </button>
//               <button
//                 onClick={clearSequence}
//                 className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded text-sm font-semibold transition-colors disabled:opacity-50"
//                 disabled={sequence.length === 0}
//               >
//                 🗑️ Clear
//               </button>
//             </div>
//           </div>

//           {/* Playback Controls */}
//           <div className="space-y-2">
//             <label className="text-white font-semibold text-sm">Playback</label>
//             <div className="flex gap-2 items-center">
//               <button
//                 onClick={playSequence}
//                 className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-semibold transition-colors disabled:opacity-50"
//                 disabled={sequence.length === 0 || isPlaying}
//               >
//                 {isPlaying ? '⏸️ Playing...' : '▶️ Play'}
//               </button>
//               <span className="text-white text-xs">
//                 {sequence.length} beats
//               </span>
//             </div>
//           </div>
//         </div>

//         {/* Type Effects Info */}
//         <div className="mt-4 p-3 bg-gray-700/50 rounded-lg">
//           <div className="flex items-center justify-between">
//             <div className="flex items-center space-x-3">
//               <span className="text-2xl" style={{ color: currentTypeData.color }}>{currentTypeData.icon}</span>
//               <div>
//                 <h3 className="text-white font-semibold">{currentTypeData.name}</h3>
//                 <p className="text-gray-300 text-sm">{currentTypeData.description}</p>
//               </div>
//             </div>
//             <div className="text-right text-xs text-gray-400">
//               <div>Bass: {Math.round(currentTypeData.effects.bassBoost * 100)}%</div>
//               <div>Compression: {Math.round(currentTypeData.effects.compression * 100)}%</div>
//               <div>Saturation: {Math.round(currentTypeData.effects.saturation * 100)}%</div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Instructions */}
//       <div className="text-center text-gray-400 text-xs py-2 border-t border-gray-700">
//         Click pads or use keyboard (Q,1,E,8,D,O,A,U,X,T,J,H,K,Y,9,7) • Double-click pads to edit individual effects • Change drum machine types with arrows • 🟢 Loaded | 🟡 Loading | 🔴 Error | ⚫ No Audio | 🔵 Custom Effects
//       </div>
//     </div>
//   );
// };

// export default DrumPadMachine;




import React, { useState, useRef, useCallback, useEffect } from 'react';

const DrumPadMachine = () => {
  const [currentType, setCurrentType] = useState(0);
  const [activePads, setActivePads] = useState(new Set());
  const [displayDescription, setDisplayDescription] = useState('Press a key or click a pad!');
  const [volume, setVolume] = useState(0.7);
  const [pan, setPan] = useState(0);
  const [reverb, setReverb] = useState(0.2);
  const [isRecording, setIsRecording] = useState(false);
  const [sequence, setSequence] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedPad, setSelectedPad] = useState(null);
  const [padEffects, setPadEffects] = useState({});
  const audioContextRef = useRef(null);
  const reverbBufferRef = useRef(null);

  // Define different drum machine types with synthetic sound parameters
  const drumMachineTypes = [
    {
      name: "Classic 808",
      icon: "🥁",
      color: '#7c3aed',
      description: "Classic analog drum machine sounds",
      effects: {
        bassBoost: 1.2,
        compression: 0.8,
        saturation: 0.3
      },
      pads: [
        { id: 'Q', sound: 'kick', freq: 50, decay: 0.7, type: 'kick' },
        { id: 'W', sound: 'snare', freq: 200, decay: 0.3, type: 'snare' },
        { id: 'E', sound: 'hihat', freq: 8000, decay: 0.05, type: 'hihat' },
        { id: 'R', sound: 'openhat', freq: 8000, decay: 0.3, type: 'openhat' },
        { id: 'A', sound: 'clap', freq: 1000, decay: 0.2, type: 'clap' },
        { id: 'S', sound: 'cowbell', freq: 600, decay: 0.5, type: 'cowbell' },
        { id: 'D', sound: 'bass', freq: 40, decay: 1.0, type: 'bass' },
        { id: 'F', sound: 'perc1', freq: 1000, decay: 0.2, type: 'perc1' },
        { id: 'Z', sound: 'tom', freq: 150, decay: 0.5, type: 'tom' },
        { id: 'X', sound: 'ride', freq: 3000, decay: 0.7, type: 'ride' },
        { id: 'C', sound: 'crash', freq: 5000, decay: 1.5, type: 'crash' }
      ]
    },
    {
      name: "Vintage 909",
      icon: "🎛️",
      color: '#dc2626',
      description: "House and techno drum machine",
      effects: {
        bassBoost: 1.0,
        compression: 0.6,
        saturation: 0.2
      },
      pads: [
        { id: 'Q', sound: 'kick', freq: 60, decay: 0.5, type: 'kick' },
        { id: 'W', sound: 'snare', freq: 250, decay: 0.2, type: 'snare' },
        { id: 'E', sound: 'hihat', freq: 10000, decay: 0.03, type: 'hihat' },
        { id: 'R', sound: 'openhat', freq: 10000, decay: 0.3, type: 'openhat' },
        { id: 'A', sound: 'clap', freq: 1200, decay: 0.1, type: 'clap' },
        { id: 'S', sound: 'rimshot', freq: 3000, decay: 0.05, type: 'rimshot' },
        { id: 'D', sound: 'perc2', freq: 1500, decay: 0.1, type: 'perc2' },
        { id: 'F', sound: 'tom', freq: 180, decay: 0.3, type: 'tom' },
        { id: 'Z', sound: 'crash', freq: 6000, decay: 2.0, type: 'crash' },
        { id: 'X', sound: 'ride', freq: 4000, decay: 1.2, type: 'ride' },
        { id: 'C', sound: 'fx1', freq: 2000, decay: 0.6, type: 'fx1' }
      ]
    },
    {
      name: "Modern Trap",
      icon: "💎",
      color: '#059669',
      description: "Contemporary trap and hip-hop sounds",
      effects: {
        bassBoost: 1.5,
        compression: 1.2,
        saturation: 0.5
      },
      pads: [
        { id: 'Q', sound: 'kick', freq: 45, decay: 0.8, type: 'kick' },
        { id: 'W', sound: 'snare', freq: 180, decay: 0.3, type: 'snare' },
        { id: 'E', sound: 'hihat', freq: 12000, decay: 0.02, type: 'hihat' },
        { id: 'R', sound: 'openhat', freq: 11000, decay: 0.15, type: 'openhat' },
        { id: 'A', sound: 'clap', freq: 800, decay: 0.25, type: 'clap' },
        { id: 'S', sound: 'snap', freq: 700, decay: 0.2, type: 'snap' },
        { id: 'D', sound: 'bass', freq: 35, decay: 1.2, type: 'bass' },
        { id: 'F', sound: 'vocal', freq: 440, decay: 0.4, type: 'vocal' },
        { id: 'Z', sound: 'tom', freq: 140, decay: 0.3, type: 'tom' },
        { id: 'X', sound: 'fx1', freq: 2000, decay: 1.0, type: 'fx1' },
        { id: 'C', sound: 'fx2', freq: 1000, decay: 1.5, type: 'fx2' }
      ]

    },
    {
      name: "Acoustic Kit",
      icon: "🪘",
      color: '#d97706',
      description: "Natural acoustic drum sounds",
      effects: {
        bassBoost: 0.9,
        compression: 0.4,
        saturation: 0.1
      },
      pads: [
        { id: 'Q', sound: 'kick', freq: 65, decay: 0.7, type: 'kick' },
        { id: 'W', sound: 'snare', freq: 220, decay: 0.2, type: 'snare' },
        { id: 'E', sound: 'hihat', freq: 9000, decay: 0.04, type: 'hihat' },
        { id: 'R', sound: 'openhat', freq: 8500, decay: 0.35, type: 'openhat' },
        { id: 'A', sound: 'clap', freq: 1000, decay: 0.2, type: 'clap' },
        { id: 'S', sound: 'woodblock', freq: 1500, decay: 0.1, type: 'woodblock' },
        { id: 'D', sound: 'conga', freq: 700, decay: 0.3, type: 'conga' },
        { id: 'F', sound: 'bongo', freq: 1200, decay: 0.2, type: 'bongo' },
        { id: 'Z', sound: 'tom', freq: 160, decay: 0.45, type: 'tom' },
        { id: 'X', sound: 'ride', freq: 4200, decay: 1.2, type: 'ride' },
        { id: 'C', sound: 'shaker', freq: 8000, decay: 0.1, type: 'shaker' }
      ]
    },
    {
      name: "Electro Pop",
      icon: "⚡",
      color: '#c2410c',
      description: "Electronic pop and synth sounds",
      effects: {
        bassBoost: 1.1,
        compression: 0.9,
        saturation: 0.6
      },
      pads: [
        { id: 'Q', sound: 'kick', freq: 50, decay: 0.5, type: 'kick' },
        { id: 'W', sound: 'snare', freq: 250, decay: 0.15, type: 'snare' },
        { id: 'E', sound: 'hihat', freq: 14000, decay: 0.02, type: 'hihat' },
        { id: 'R', sound: 'openhat', freq: 13000, decay: 0.25, type: 'openhat' },
        { id: 'A', sound: 'clap', freq: 900, decay: 0.15, type: 'clap' },
        { id: 'S', sound: 'vocal', freq: 500, decay: 0.3, type: 'vocal' },
        { id: 'D', sound: 'perc2', freq: 1800, decay: 0.1, type: 'perc2' },
        { id: 'F', sound: 'laser', freq: 2200, decay: 0.2, type: 'laser' },
        { id: 'Z', sound: 'crash', freq: 6000, decay: 1.6, type: 'crash' },
        { id: 'X', sound: 'fx1', freq: 2500, decay: 1.0, type: 'fx1' },
        { id: 'C', sound: 'rise', freq: 5000, decay: 2.0, type: 'rise' }
      ]
    },
    {
      name: "Lo-Fi Vinyl",
      icon: "📀",
      color: '#7c2d12',
      description: "Vintage vinyl-sampled drums",
      effects: {
        bassBoost: 0.8,
        compression: 0.5,
        saturation: 0.4
      },
      pads: [
        { id: 'Q', sound: 'kick', freq: 55, decay: 0.6, type: 'kick' },
        { id: 'W', sound: 'snare', freq: 190, decay: 0.25, type: 'snare' },
        { id: 'E', sound: 'hihat', freq: 6000, decay: 0.05, type: 'hihat' },
        { id: 'R', sound: 'openhat', freq: 5500, decay: 0.4, type: 'openhat' },
        { id: 'A', sound: 'clap', freq: 700, decay: 0.2, type: 'clap' },
        { id: 'S', sound: 'vinyl', freq: 2000, decay: 0.6, type: 'vinyl' },
        { id: 'D', sound: 'glitch', freq: 1800, decay: 0.3, type: 'glitch' },
        { id: 'F', sound: 'fx2', freq: 1000, decay: 1.5, type: 'fx2' },
        { id: 'Z', sound: 'tom', freq: 130, decay: 0.5, type: 'tom' },
        { id: 'X', sound: 'shaker', freq: 5000, decay: 0.1, type: 'shaker' },
        { id: 'C', sound: 'drop', freq: 800, decay: 2.0, type: 'drop' }
      ]
    }
  ];

  // const soundDescriptions = {
  //   kick: 'Kick Drum',
  //   snare: 'Snare Drum', 
  //   hihat: 'Hi-Hat Closed',
  //   openhat: 'Hi-Hat Open',
  //   clap: 'Hand Clap',
  //   perc1: 'Percussion',
  //   bass: 'Bass Drum',
  //   tom: 'Tom Drum',
  //   crash: 'Crash Cymbal',
  //   ride: 'Ride Cymbal',
  //   cowbell: 'Cowbell',
  //   shaker: 'Shaker',
  //   woodblock: 'Wood Block',
  //   vocal: 'Vocal Sample',
  //   fx1: 'Sound FX 1',
  //   fx2: 'Sound FX 2'
  // };

  // Initialize Web Audio API


  const soundDescriptions = {
    kick: "Kick Drum (Low-end punch)",
    snare: "Snare Drum (Sharp attack)",
    hihat: "Closed Hi-Hat (Short & tight)",
    openhat: "Open Hi-Hat (Sizzly)",
    clap: "Clap (Snappy)",
    rimshot: "Rimshot (Sharp side-stick)",
    perc1: "Percussion Hit (General)",
    perc2: "Metallic Perc (Ping)",
    bass: "808 Bass (Low rumble)",
    tom: "Tom Drum (Mid-punch)",
    crash: "Crash Cymbal (Washy)",
    ride: "Ride Cymbal (Sustained)",
    cowbell: "Cowbell (Metal click)",
    shaker: "Shaker (Rhythmic noise)",
    woodblock: "Wood Block (Thock)",
    conga: "Conga (Hand drum)",
    bongo: "Bongo (High-pitched hand drum)",
    vocal: "Vocal FX (Chops or shout)",
    fx1: "Effect Hit (Sweep / Boom)",
    fx2: "Reverse FX (Whoosh / Delay tail)",
    snap: "Finger Snap",
    laser: "Laser Shot FX",
    glitch: "Glitch FX",
    vinyl: "Vinyl Scratch",
    rise: "Riser FX",
    drop: "Drop Impact"
  };



  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    return audioContextRef.current;
  }, []);

  // Create reverb impulse response
  const createReverbBuffer = useCallback(() => {
    if (reverbBufferRef.current) return reverbBufferRef.current;

    const audioContext = getAudioContext();
    const length = audioContext.sampleRate * 2;
    const buffer = audioContext.createBuffer(2, length, audioContext.sampleRate);

    for (let channel = 0; channel < 2; channel++) {
      const channelData = buffer.getChannelData(channel);
      for (let i = 0; i < length; i++) {
        const decay = Math.pow(1 - i / length, 2);
        channelData[i] = (Math.random() * 2 - 1) * decay;
      }
    }

    reverbBufferRef.current = buffer;
    return buffer;
  }, [getAudioContext]);

  // Synthetic sound generators
  const createSynthSound = useCallback((pad, audioContext) => {
    const currentTime = audioContext.currentTime;
    const { freq, decay, type } = pad;

    switch (type) {
      case 'kick': {
        // Kick drum - low frequency oscillator with pitch envelope
        const oscillator = audioContext.createOscillator();
        const gain = audioContext.createGain();
        const filter = audioContext.createBiquadFilter();

        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(freq, currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(freq * 0.1, currentTime + 0.1);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(100, currentTime);

        gain.gain.setValueAtTime(1, currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, currentTime + decay);

        oscillator.connect(filter);
        filter.connect(gain);

        oscillator.start(currentTime);
        oscillator.stop(currentTime + decay + 0.1);

        return gain;
      }

      case 'snare': {
        // Snare drum - noise + tone
        const noiseBuffer = audioContext.createBuffer(1, audioContext.sampleRate * 0.1, audioContext.sampleRate);
        const data = noiseBuffer.getChannelData(0);
        for (let i = 0; i < data.length; i++) {
          data[i] = Math.random() * 2 - 1;
        }

        const noise = audioContext.createBufferSource();
        const oscillator = audioContext.createOscillator();
        const gain = audioContext.createGain();
        const filter = audioContext.createBiquadFilter();
        const merger = audioContext.createChannelMerger(2);

        noise.buffer = noiseBuffer;
        oscillator.type = 'triangle';
        oscillator.frequency.setValueAtTime(freq, currentTime);

        filter.type = 'highpass';
        filter.frequency.setValueAtTime(1000, currentTime);

        gain.gain.setValueAtTime(0.8, currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, currentTime + decay);

        noise.connect(filter);
        oscillator.connect(merger, 0, 0);
        filter.connect(merger, 0, 1);
        merger.connect(gain);

        noise.start(currentTime);
        oscillator.start(currentTime);
        noise.stop(currentTime + decay);
        oscillator.stop(currentTime + decay);

        return gain;
      }

      case 'hihat': {
        // Hi-hat - filtered white noise
        const noiseBuffer = audioContext.createBuffer(1, audioContext.sampleRate * 0.1, audioContext.sampleRate);
        const data = noiseBuffer.getChannelData(0);
        for (let i = 0; i < data.length; i++) {
          data[i] = Math.random() * 2 - 1;
        }

        const noise = audioContext.createBufferSource();
        const gain = audioContext.createGain();
        const filter = audioContext.createBiquadFilter();

        noise.buffer = noiseBuffer;

        filter.type = 'highpass';
        filter.frequency.setValueAtTime(freq, currentTime);
        filter.Q.setValueAtTime(30, currentTime);

        gain.gain.setValueAtTime(0.3, currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, currentTime + decay);

        noise.connect(filter);
        filter.connect(gain);

        noise.start(currentTime);
        noise.stop(currentTime + decay + 0.1);

        return gain;
      }

      case 'clap': {
        // Hand clap - multiple quick noise bursts
        const gain = audioContext.createGain();
        gain.gain.setValueAtTime(0, currentTime);

        const clapTimes = [0, 0.01, 0.02, 0.03];
        clapTimes.forEach((time, index) => {
          const noiseBuffer = audioContext.createBuffer(1, audioContext.sampleRate * 0.05, audioContext.sampleRate);
          const data = noiseBuffer.getChannelData(0);
          for (let i = 0; i < data.length; i++) {
            data[i] = Math.random() * 2 - 1;
          }

          const noise = audioContext.createBufferSource();
          const clapGain = audioContext.createGain();
          const filter = audioContext.createBiquadFilter();

          noise.buffer = noiseBuffer;

          filter.type = 'bandpass';
          filter.frequency.setValueAtTime(freq, currentTime);
          filter.Q.setValueAtTime(5, currentTime);

          clapGain.gain.setValueAtTime(0.2, currentTime + time);
          clapGain.gain.exponentialRampToValueAtTime(0.001, currentTime + time + 0.05);

          noise.connect(filter);
          filter.connect(clapGain);
          clapGain.connect(gain);

          noise.start(currentTime + time);
          noise.stop(currentTime + time + 0.05);
        });

        return gain;
      }

      case 'tom': {
        // Tom drum - pitched oscillator with envelope
        const oscillator = audioContext.createOscillator();
        const gain = audioContext.createGain();

        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(freq, currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(freq * 0.5, currentTime + decay);

        gain.gain.setValueAtTime(0.8, currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, currentTime + decay);

        oscillator.connect(gain);

        oscillator.start(currentTime);
        oscillator.stop(currentTime + decay + 0.1);

        return gain;
      }

      case 'crash':
      case 'ride': {
        // Cymbal - complex noise with metallic resonance
        const noiseBuffer = audioContext.createBuffer(1, audioContext.sampleRate * 0.1, audioContext.sampleRate);
        const data = noiseBuffer.getChannelData(0);
        for (let i = 0; i < data.length; i++) {
          data[i] = Math.random() * 2 - 1;
        }

        const noise = audioContext.createBufferSource();
        const gain = audioContext.createGain();
        const filter1 = audioContext.createBiquadFilter();
        const filter2 = audioContext.createBiquadFilter();

        noise.buffer = noiseBuffer;

        filter1.type = 'bandpass';
        filter1.frequency.setValueAtTime(freq, currentTime);
        filter1.Q.setValueAtTime(2, currentTime);

        filter2.type = 'bandpass';
        filter2.frequency.setValueAtTime(freq * 1.5, currentTime);
        filter2.Q.setValueAtTime(3, currentTime);

        gain.gain.setValueAtTime(type === 'crash' ? 0.4 : 0.2, currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, currentTime + decay);

        noise.connect(filter1);
        filter1.connect(filter2);
        filter2.connect(gain);

        noise.start(currentTime);
        noise.stop(currentTime + decay + 0.1);

        return gain;
      }

      case 'cowbell': {
        // Cowbell - metallic tone
        const oscillator1 = audioContext.createOscillator();
        const oscillator2 = audioContext.createOscillator();
        const gain = audioContext.createGain();
        const merger = audioContext.createChannelMerger(2);

        oscillator1.type = 'square';
        oscillator1.frequency.setValueAtTime(freq, currentTime);

        oscillator2.type = 'square';
        oscillator2.frequency.setValueAtTime(freq * 1.5, currentTime);

        gain.gain.setValueAtTime(0.3, currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, currentTime + decay);

        oscillator1.connect(merger, 0, 0);
        oscillator2.connect(merger, 0, 1);
        merger.connect(gain);

        oscillator1.start(currentTime);
        oscillator2.start(currentTime);
        oscillator1.stop(currentTime + decay);
        oscillator2.stop(currentTime + decay);

        return gain;
      }

      default: {
        // Generic percussion
        const oscillator = audioContext.createOscillator();
        const gain = audioContext.createGain();
        const filter = audioContext.createBiquadFilter();

        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(freq, currentTime);

        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(freq, currentTime);
        filter.Q.setValueAtTime(10, currentTime);

        gain.gain.setValueAtTime(0.3, currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, currentTime + decay);

        oscillator.connect(filter);
        filter.connect(gain);

        oscillator.start(currentTime);
        oscillator.stop(currentTime + decay + 0.1);

        return gain;
      }
    }
  }, []);

  // Apply drum machine type effects to audio
  const applyTypeEffects = useCallback((audioNode, typeEffects) => {
    const audioContext = getAudioContext();

    // Create EQ for bass boost
    const lowShelf = audioContext.createBiquadFilter();
    lowShelf.type = 'lowshelf';
    lowShelf.frequency.setValueAtTime(200, audioContext.currentTime);
    lowShelf.gain.setValueAtTime((typeEffects.bassBoost - 1) * 10, audioContext.currentTime);

    // Create compressor
    const compressor = audioContext.createDynamicsCompressor();
    compressor.threshold.setValueAtTime(-24, audioContext.currentTime);
    compressor.knee.setValueAtTime(30, audioContext.currentTime);
    compressor.ratio.setValueAtTime(12, audioContext.currentTime);
    compressor.attack.setValueAtTime(0.003, audioContext.currentTime);
    compressor.release.setValueAtTime(0.25, audioContext.currentTime);

    // Create waveshaper for saturation
    const waveshaper = audioContext.createWaveShaper();
    const samples = 44100;
    const curve = new Float32Array(samples);
    const deg = Math.PI / 180;
    for (let i = 0; i < samples; i++) {
      const x = (i * 2) / samples - 1;
      curve[i] = (3 + typeEffects.saturation) * x * 20 * deg / (Math.PI + typeEffects.saturation * Math.abs(x));
    }
    waveshaper.curve = curve;
    waveshaper.oversample = '4x';

    // Connect effects chain
    audioNode.connect(lowShelf);
    lowShelf.connect(compressor);
    compressor.connect(waveshaper);

    return waveshaper;
  }, [getAudioContext]);

  // Play sound with effects
  const playSound = useCallback((pad) => {
    try {
      const audioContext = getAudioContext();

      if (audioContext.state === 'suspended') {
        audioContext.resume();
      }

      const padEffect = padEffects[pad.id] || {};
      const effectiveVolume = padEffect.volume !== undefined ? padEffect.volume : volume;
      const effectivePan = padEffect.pan !== undefined ? padEffect.pan : pan;
      const effectiveReverb = padEffect.reverb !== undefined ? padEffect.reverb : reverb;
      const currentTypeEffects = drumMachineTypes[currentType].effects;

      // Create synthetic sound
      const synthSource = createSynthSound(pad, audioContext);

      // Create audio nodes
      const gainNode = audioContext.createGain();
      const panNode = audioContext.createStereoPanner();
      const dryGainNode = audioContext.createGain();
      const wetGainNode = audioContext.createGain();
      const convolver = audioContext.createConvolver();

      // Set up reverb
      convolver.buffer = createReverbBuffer();

      // Set up gain (volume)
      gainNode.gain.setValueAtTime(effectiveVolume, audioContext.currentTime);

      // Set up pan
      panNode.pan.setValueAtTime(effectivePan, audioContext.currentTime);

      // Set up reverb mix
      dryGainNode.gain.setValueAtTime(1 - effectiveReverb, audioContext.currentTime);
      wetGainNode.gain.setValueAtTime(effectiveReverb, audioContext.currentTime);

      // Apply drum machine type effects
      const effectsOutput = applyTypeEffects(synthSource, currentTypeEffects);

      // Connect nodes with type effects
      effectsOutput.connect(gainNode);
      gainNode.connect(panNode);

      // Dry path
      panNode.connect(dryGainNode);
      dryGainNode.connect(audioContext.destination);

      // Wet path (reverb)
      panNode.connect(convolver);
      convolver.connect(wetGainNode);
      wetGainNode.connect(audioContext.destination);

      // Visual feedback
      setActivePads(prev => new Set([...prev, pad.id]));
      setTimeout(() => {
        setActivePads(prev => {
          const newSet = new Set(prev);
          newSet.delete(pad.id);
          return newSet;
        });
      }, 200);

      const effectsText = padEffect.volume !== undefined || padEffect.pan !== undefined || padEffect.reverb !== undefined
        ? ' (Custom)' : '';
      const soundName = soundDescriptions[pad.sound] || 'Drum Sound';
      setDisplayDescription(`${soundName} - ${drumMachineTypes[currentType].name}${effectsText}`);

      if (isRecording) {
        setSequence(prev => [...prev, {
          key: pad.id,
          time: Date.now(),
          type: currentType,
          effects: { ...padEffect }
        }]);
      }
    } catch (error) {
      console.error('Error playing sound:', error);
      setDisplayDescription('Audio not available');
    }
  }, [getAudioContext, volume, pan, reverb, soundDescriptions, drumMachineTypes, currentType, isRecording, padEffects, createReverbBuffer, applyTypeEffects, createSynthSound]);

  // Keyboard handling
  useEffect(() => {
    const handleKeyDown = (event) => {
      const keyMap = {
        81: 'Q', 49: '1', 51: '3', 71: 'G', 69: 'E', 56: '8',
        68: 'D', 65: 'A', 85: 'U', 88: 'X', 84: 'T', 55: '7',
        89: 'Y', 72: 'H', 74: 'J', 75: 'K', 57: '9'
      };

      if (keyMap[event.keyCode]) {
        event.preventDefault();
        const currentPads = drumMachineTypes[currentType].pads;
        const pad = currentPads.find(p => p.id === keyMap[event.keyCode]);
        if (pad) {
          playSound(pad);
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [currentType, drumMachineTypes, playSound]);

  // const toggleRecording = () => {
  //   if (isRecording) {
  //     setIsRecording(false);
  //     setDisplayDescription('Recording stopped');
  //   } else {
  //     setSequence([]);
  //     setIsRecording(true);
  //     setDisplayDescription('Recording started...');
  //   }
  // };

  // const playSequence = async () => {
  //   if (sequence.length === 0) return;

  //   setIsPlaying(true);
  //   setDisplayDescription('Playing sequence...');

  //   const startTime = sequence[0].time;
  //   const originalType = currentType;

  //   for (let i = 0; i < sequence.length; i++) {
  //     const note = sequence[i];
  //     const delay = note.time - startTime;

  //     setTimeout(() => {
  //       if (note.type !== undefined && note.type !== currentType) {
  //         setCurrentType(note.type);
  //       }

  //       if (note.effects) {
  //         setPadEffects(prev => ({
  //           ...prev,
  //           [note.key]: note.effects
  //         }));
  //       }

  //       const currentPads = drumMachineTypes[note.type || currentType].pads;
  //       const pad = currentPads.find(p => p.id === note.key);
  //       if (pad) {
  //         playSound(pad);
  //       }

  //       if (i === sequence.length - 1) {
  //         setIsPlaying(false);
  //         setDisplayDescription('Sequence finished');
  //         setCurrentType(originalType);
  //       }
  //     }, delay / 4);
  //   }
  // };

  // const clearSequence = () => {
  //   setSequence([]);
  //   setDisplayDescription('Sequence cleared');
  // };

  // const updatePadEffect = (padId, effectType, value) => {
  //   setPadEffects(prev => ({
  //     ...prev,
  //     [padId]: {
  //       ...prev[padId],
  //       [effectType]: value
  //     }
  //   }));
  // };

  // const clearPadEffects = (padId) => {
  //   setPadEffects(prev => {
  //     const newEffects = { ...prev };
  //     delete newEffects[padId];
  //     return newEffects;
  //   });
  // };

  const currentTypeData = drumMachineTypes[currentType];

  // Clean Pad Button Component
  const PadButton = ({ pad, index, isActive, onClick }) => {
    const soundName = soundDescriptions[pad.sound] || 'Drum Sound';
    const hasCustomEffects = padEffects[pad.id];

    return (
      <button
        className={`w-24 h-24 rounded-xl border-2 flex flex-col items-center justify-center font-bold transition-all duration-200 transform group relative ${isActive
          ? 'border-white bg-gradient-to-br from-white to-gray-200 text-gray-900 scale-105 shadow-2xl'
          : selectedPad === pad.id
            ? 'border-yellow-400 bg-gradient-to-br from-yellow-700/40 to-yellow-800/60 text-white hover:border-yellow-300 hover:scale-102 shadow-lg backdrop-blur-sm'
            : 'border-purple-300/60 bg-gradient-to-br from-gray-700/80 to-gray-800/90 text-white hover:border-purple-400 hover:bg-gradient-to-br hover:from-purple-700/40 hover:to-purple-800/60 hover:scale-102 shadow-lg backdrop-blur-sm'
          }`}
        style={{
          boxShadow: isActive
            ? `0 0 25px ${currentTypeData.color}, 0 0 50px ${currentTypeData.color}44, 0 8px 32px rgba(0,0,0,0.4)`
            : selectedPad === pad.id
              ? '0 0 15px #fbbf24, 0 4px 20px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)'
              : '0 4px 20px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)'
        }}
        onClick={onClick}
        onDoubleClick={() => setSelectedPad(selectedPad === pad.id ? null : pad.id)}
        onMouseDown={(e) => e.preventDefault()}
        title={`${soundName} (${pad.label}) - Synthetic Audio Ready ${selectedPad === pad.id ? '(Selected for editing)' : '(Double-click to edit effects)'}`}
      >
        <div className={`text-2xl font-black ${isActive ? 'text-gray-800' : selectedPad === pad.id ? 'text-yellow-200' : 'text-white group-hover:text-purple-200'}`}>
          {pad.label}
        </div>
        <div className={`text-xs font-medium mt-1 ${isActive ? 'text-gray-600' : selectedPad === pad.id ? 'text-yellow-300' : 'text-gray-300 group-hover:text-purple-300'} truncate max-w-20 text-center leading-tight`}>
          {soundName.split(' ')[0]}
        </div>

        {/* Synthetic audio indicator */}
        <div className="absolute -top-1 -right-1">
          <div className="w-3 h-3 bg-cyan-400 rounded-full" title="Synthetic Audio"></div>
        </div>

        {/* Custom effects indicator */}
        {hasCustomEffects && (
          <div className="absolute -top-1 -left-1">
            <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
          </div>
        )}

        {/* Pulse animation when active */}
        {isActive && (
          <div
            className="absolute inset-0 rounded-xl animate-ping opacity-75"
            style={{
              border: `2px solid ${currentTypeData.color}`,
              backgroundColor: `${currentTypeData.color}22`
            }}
          />
        )}
      </button>
    );
  };

  return (
    <div className="w-full bg-gray-900 text-white">
      {/* Top Navigation */}
      <div className="flex justify-center items-center py-4 border-b border-gray-700">
        <div className="flex space-x-8">
          <button className="text-purple-400 border-b-2 border-purple-400 pb-1">
            Instrument
          </button>
          <button className="text-gray-400 hover:text-white">Patterns</button>
          <button className="text-gray-400 hover:text-white">Piano Roll</button>
          <button className="text-purple-400 font-semibold">Effects</button>
        </div>
      </div>

      {/* Type Selector */}
      <div className="flex justify-center items-center px-8 py-4">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setCurrentType((prev) => (prev - 1 + drumMachineTypes.length) % drumMachineTypes.length)}
            className="text-gray-400 hover:text-white text-xl"
          >
            ←
          </button>
          <div className="text-center">
            <div className="text-2xl" style={{ color: currentTypeData.color }}>{currentTypeData.icon}</div>
            <div className="text-white font-medium">{currentTypeData.name}</div>
            <div className="text-xs text-gray-400 max-w-32 truncate">{currentTypeData.description}</div>
          </div>
          <button
            onClick={() => setCurrentType((prev) => (prev + 1) % drumMachineTypes.length)}
            className="text-gray-400 hover:text-white text-xl"
          >
            →
          </button>
        </div>
      </div>

      {/* Display */}
      <div className="text-center py-2">
        <div className="bg-black/50 rounded-lg p-3 backdrop-blur-sm inline-block min-w-96">
          <p className="text-xl font-mono text-green-400">{displayDescription}</p>
          {selectedPad && (
            <p className="text-sm text-yellow-400 mt-1">
              Editing pad {selectedPad} - Double-click another pad or same pad to change selection
            </p>
          )}
        </div>
      </div>

      {/* Drum Pad Area */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div
          className="p-8 rounded-2xl"
          style={{
            background: `linear-gradient(135deg, ${currentTypeData.color}22 0%, ${currentTypeData.color}44 50%, ${currentTypeData.color}33 100%)`,
            backdropFilter: 'blur(10px)',
            border: `1px solid ${currentTypeData.color}44`
          }}
        >
          {/* 3x3 Grid Layout - First 9 pads */}
          <div className="grid grid-cols-3 gap-6 mb-8">
            {currentTypeData.pads.slice(0, 9).map((pad, index) => (
              <PadButton
                key={pad.id}
                pad={pad}
                index={index}
                isActive={activePads.has(pad.id)}
                onClick={() => playSound(pad)}
              />
            ))}
          </div>

          {/* Additional pads row */}
          {currentTypeData.pads.length > 9 && (
            <div className="grid grid-cols-4 gap-4 justify-items-center">
              {currentTypeData.pads.slice(9).map((pad, index) => (
                <PadButton
                  key={pad.id}
                  pad={pad}
                  index={index + 9}
                  isActive={activePads.has(pad.id)}
                  onClick={() => playSound(pad)}
                />
              ))}
            </div>
          )}
        </div>
      </div>


      {/* <div className="bg-gray-800/95 backdrop-blur-sm p-4 border-t border-gray-700">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 max-w-7xl mx-auto">

          <div className="space-y-3">
            <label className="text-white font-semibold text-sm">Global Effects</label>
            <div className="flex flex-col space-y-2">

              <div className="space-y-1">
                <label className="text-gray-300 text-xs">Volume: {Math.round(volume * 100)}%</label>
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


              <div className="space-y-1">
                <label className="text-gray-300 text-xs">Pan: {pan === 0 ? 'Center' : pan < 0 ? `${Math.abs(Math.round(pan * 100))}% Left` : `${Math.round(pan * 100)}% Right`}</label>
                <input
                  type="range"
                  min="-1"
                  max="1"
                  step="0.1"
                  value={pan}
                  onChange={(e) => setPan(parseFloat(e.target.value))}
                  className="w-full accent-blue-500"
                />
              </div>


              <div className="space-y-1">
                <label className="text-gray-300 text-xs">Reverb: {Math.round(reverb * 100)}%</label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={reverb}
                  onChange={(e) => setReverb(parseFloat(e.target.value))}
                  className="w-full accent-green-500"
                />
              </div>
            </div>
          </div>

          {selectedPad && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-white font-semibold text-sm">Pad {selectedPad} Effects</label>
                <button
                  onClick={() => clearPadEffects(selectedPad)}
                  className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs"
                >
                  Reset
                </button>
              </div>

              <div className="space-y-1">
                <label className="text-gray-300 text-xs">
                  Volume: {padEffects[selectedPad]?.volume !== undefined ? Math.round(padEffects[selectedPad].volume * 100) + '%' : 'Global'}
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={padEffects[selectedPad]?.volume ?? volume}
                  onChange={(e) => updatePadEffect(selectedPad, 'volume', parseFloat(e.target.value))}
                  className="w-full accent-purple-500"
                />
              </div>


              <div className="space-y-1">
                <label className="text-gray-300 text-xs">
                  Pan: {padEffects[selectedPad]?.pan !== undefined
                    ? padEffects[selectedPad].pan === 0 ? 'Center'
                      : padEffects[selectedPad].pan < 0
                        ? `${Math.abs(Math.round(padEffects[selectedPad].pan * 100))}% Left`
                        : `${Math.round(padEffects[selectedPad].pan * 100)}% Right`
                    : 'Global'}
                </label>
                <input
                  type="range"
                  min="-1"
                  max="1"
                  step="0.1"
                  value={padEffects[selectedPad]?.pan ?? pan}
                  onChange={(e) => updatePadEffect(selectedPad, 'pan', parseFloat(e.target.value))}
                  className="w-full accent-blue-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-gray-300 text-xs">
                  Reverb: {padEffects[selectedPad]?.reverb !== undefined ? Math.round(padEffects[selectedPad].reverb * 100) + '%' : 'Global'}
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={padEffects[selectedPad]?.reverb ?? reverb}
                  onChange={(e) => updatePadEffect(selectedPad, 'reverb', parseFloat(e.target.value))}
                  className="w-full accent-green-500"
                />
              </div>
            </div>
          )}


          <div className="space-y-2">
            <label className="text-white font-semibold text-sm">Recording</label>
            <div className="flex gap-2">
              <button
                onClick={toggleRecording}
                className={`px-3 py-1 rounded text-sm font-semibold transition-colors ${isRecording
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : 'bg-green-600 hover:bg-green-700 text-white'
                  }`}
              >
                {isRecording ? '⏹️ Stop' : '🔴 Rec'}
              </button>
              <button
                onClick={clearSequence}
                className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded text-sm font-semibold transition-colors disabled:opacity-50"
                disabled={sequence.length === 0}
              >
                🗑️ Clear
              </button>
            </div>
          </div>


          <div className="space-y-2">
            <label className="text-white font-semibold text-sm">Playback</label>
            <div className="flex gap-2 items-center">
              <button
                onClick={playSequence}
                className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-semibold transition-colors disabled:opacity-50"
                disabled={sequence.length === 0 || isPlaying}
              >
                {isPlaying ? '⏸️ Playing...' : '▶️ Play'}
              </button>
              <span className="text-white text-xs">
                {sequence.length} beats
              </span>
            </div>
          </div>
        </div>


        <div className="mt-4 p-3 bg-gray-700/50 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="text-2xl" style={{ color: currentTypeData.color }}>{currentTypeData.icon}</span>
              <div>
                <h3 className="text-white font-semibold">{currentTypeData.name}</h3>
                <p className="text-gray-300 text-sm">{currentTypeData.description}</p>
              </div>
            </div>
            <div className="text-right text-xs text-gray-400">
              <div>Bass: {Math.round(currentTypeData.effects.bassBoost * 100)}%</div>
              <div>Compression: {Math.round(currentTypeData.effects.compression * 100)}%</div>
              <div>Saturation: {Math.round(currentTypeData.effects.saturation * 100)}%</div>
            </div>
          </div>
        </div>
      </div> */}

      {/* Instructions */}
      {/* <div className="text-center text-gray-400 text-xs py-2 border-t border-gray-700">
        Click pads or use keyboard (Q,1,E,8,D,O,A,U,X,T,J,H,K,Y,9,7) • Double-click pads to edit individual effects • Change drum machine types with arrows • 🔵 Synthetic Audio Ready | 🔵 Custom Effects
      </div> */}
    </div>
  );
};

export default DrumPadMachine;