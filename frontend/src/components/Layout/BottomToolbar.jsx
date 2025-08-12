import React, { useEffect, useRef, useState } from 'react';
import { RxZoomIn, RxZoomOut } from "react-icons/rx";
import { HiOutlineSpeakerWave } from "react-icons/hi2";
import media1 from "../../Images/media1Icon.svg";
import media2 from "../../Images/media2Icon.svg";
import media3 from "../../Images/media3Icon.svg";
import media4 from "../../Images/media4Icon.svg";
import pauseIcon from "../../Images/pausewhite.svg";
import Strange from "../../Images/StrangeIcon.svg";
import darkStrange from "../../Images/darkStrangeIcon.svg";
import { IoIosArrowDown } from 'react-icons/io';
import { useTheme } from '../../Utils/ThemeContext';
import { ReactComponent as Clears } from "../../Images/clearIcons.svg";
import { ReactComponent as Tempobutton } from "../../Images/Tempobutton.svg";
import { ReactComponent as Tick } from "../../Images/Tick.svg";
import { FaStop } from 'react-icons/fa6';
import { useDispatch, useSelector } from 'react-redux';
import { 
  setRecording, 
  togglePlayPause, 
  setCurrentTime,
  setAllTracksVolume, 
  setMasterVolume, 
  setRecordedData,
  setBPM, 
  setDrumRecordedData,
  setSelectedKey,
  setSelectedScale,
  setHighlightedPianoKeys,
  clearKeyScaleSelection,
  setMetronomeSound
} from '../../Redux/Slice/studio.slice';

const BottomToolbar = () => {
    const [volume1, setVolume1] = useState(50);
    const [isIconDropdownOpen, setIsIconDropdownOpen] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [isOpen1, setIsOpen1] = useState(false);
    const [isOpen2, setIsOpen2] = useState(false);
    const [selectedMode, setSelectedMode] = useState("");
    const [selectedKey, setSelectedKeyLocal] = useState("");
    const keyDropdownRef = useRef(null);
    const tempoDropdownRef = useRef(null);
    const menuDropdownRef = useRef(null);
    const [appliedSelection, setAppliedSelection] = useState(null);
    const [tempo, setTempo] = useState(120);
    const [appliedTempo, setAppliedTempo] = useState(120);
    const [selectedMenuitems, setSelectedMenuitems] = useState('Click');
    const [selectedCountIn, setSelectedCountIn] = useState('2 bars');
    const [isVolumeChanging, setIsVolumeChanging] = useState(false);
    const [isCounting, setIsCounting] = useState(false);
    const [countInNumber, setCountInNumber] = useState(null);
    const [isIconActive, setIsIconActive] = useState(false);

    const dispatch = useDispatch();
    
    // Get play/pause state from Redux
    const isPlaying = useSelector((state) => state.studio?.isPlaying || false);
    const currentTime = useSelector((state) => state.studio?.currentTime || 0);
    const audioDuration = useSelector((state) => state.studio?.audioDuration || 150);
    const masterVolume = useSelector((state) => state.studio?.masterVolume || 80);
    const bpm = useSelector(state => state.studio.bpm);
    const tracks = useSelector((state) => state.studio?.tracks || []);
    const isRecording = useSelector((state) => state.studio?.isRecording || false);
    const recordedData = useSelector((state) => state.studio?.recordedData || []);
    const drumRecordedData = useSelector((state) => state.studio?.drumRecordedData || []);
    const pianoRecord = useSelector((state) => state.studio?.pianoRecord || []);
    
    // Get key and scale selection from Redux
    const reduxSelectedKey = useSelector((state) => state.studio?.selectedKey || null);
    const reduxSelectedScale = useSelector((state) => state.studio?.selectedScale || null);

    // Sync local state with Redux state
    useEffect(() => {
        if (reduxSelectedKey !== null) {
            setSelectedKeyLocal(reduxSelectedKey);
        }
        if (reduxSelectedScale !== null) {
            setSelectedMode(reduxSelectedScale);
        }
    }, [reduxSelectedKey, reduxSelectedScale]);

    // Handle volume change for all tracks (wise volume)
    const handleVolumeChange = (newVolume) => {
        setIsVolumeChanging(true);
        dispatch(setMasterVolume(parseInt(newVolume)));
        // dispatch(setAllTracksVolume(parseInt(newVolume)));
        
        // Reset the visual feedback after a short delay
        setTimeout(() => {
            setIsVolumeChanging(false);
        }, 500);
    };

    // Format time for display
    const formatTime = (timeInSeconds) => {
        const minutes = Math.floor(timeInSeconds / 60);
        const seconds = Math.floor(timeInSeconds % 60);
        const tenths = Math.floor((timeInSeconds % 1) * 10);
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${tenths}`;
    };

    // Handle play/pause button click
    const handlePlayPause = () => {
        dispatch(togglePlayPause());
    };

    // Handle move one second ahead
    const handleMoveForward = () => {
        const newTime = Math.min(currentTime + 1, audioDuration);
        dispatch(setCurrentTime(newTime));
    };

    // Handle move one second behind
    const handleMoveBackward = () => {
        const newTime = Math.max(currentTime - 1, 0);
        dispatch(setCurrentTime(newTime));
    };

    const handleMoveStart = () => {
        const newTime = 0;
        dispatch(setCurrentTime(newTime));
    };

    // Keyboard shortcuts for navigation
    useEffect(() => {
        const handleKeyDown = (event) => {
            // Only handle shortcuts when not typing in input fields
            if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
                return;
            }

            switch (event.key) {
                case 'ArrowLeft':
                    event.preventDefault();
                    handleMoveBackward();
                    break;
                case 'ArrowRight':
                    event.preventDefault();
                    handleMoveForward();
                    break;
                case ' ':
                    event.preventDefault();
                    handlePlayPause();
                    break;
                default:
                    break;
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [currentTime]); // Re-create listener when currentTime changes

    useEffect(() => {
        const handleClickOutside1 = (event) => {
            if (tempoDropdownRef.current && !tempoDropdownRef.current.contains(event.target)) {
                setIsOpen1(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside1);
        return () => document.removeEventListener('mousedown', handleClickOutside1);
    }, []);

    const handleIncrement = () => {
        setTempo(prev => Math.min(prev + 1, 200)); // Max 200 BPM
    };

    const handleDecrement = () => {
        setTempo(prev => Math.max(prev - 1, 60)); // Min 60 BPM
    };

    const handleApply2 = () => {
        setAppliedTempo(tempo);
        setIsOpen1(false);
        dispatch(setBPM(tempo));
    };

    const handleTempoInputChange = (e) => {
        const value = parseInt(e.target.value) || 60;
        setTempo(Math.min(Math.max(value, 60), 200));
    };

    const keys = ["C", "D", "E", "F", "G", "A", "B"];
    const sharpKeys = ["Dᵇ", "Eᵇ"];
    const sharpKeys2 = ["F#", "Aᵇ", "Bᵇ"];

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (keyDropdownRef.current && !keyDropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleKeySelect = (key) => {
        setSelectedKeyLocal(key);
        dispatch(setSelectedKey(key));
    };

    const handleScaleSelect = (scale) => {
        setSelectedMode(scale);
        dispatch(setSelectedScale(scale));
    };

    // Function to calculate highlighted piano keys based on key and scale
    const calculateHighlightedKeys = (key, scale) => {
        if (!key || !scale) {
            console.warn('❌ Missing key or scale for calculation');
            return [];
        }
        
        // Define the scale patterns (intervals from root note)
        const scalePatterns = {
            'Major': [0, 2, 4, 5, 7, 9, 11], // Whole, Whole, Half, Whole, Whole, Whole, Half
            'Minor': [0, 2, 3, 5, 7, 8, 10]  // Whole, Half, Whole, Whole, Half, Whole, Whole
        };
        
        // Define the note values (C=0, C#=1, D=2, D#=3, E=4, F=5, F#=6, G=7, G#=8, A=9, A#=10, B=11)
        const noteValues = {
            'C': 0, 'C#': 1, 'D': 2, 'Dᵇ': 1, 'D#': 3, 'E': 4, 'Eᵇ': 3, 'F': 5, 'F#': 6, 
            'G': 7, 'G#': 8, 'A': 9, 'Aᵇ': 8, 'B': 11, 'Bᵇ': 10
        };
        
        const rootNote = noteValues[key];
        if (rootNote === undefined) {
            console.warn(`❌ Unknown key: ${key}`);
            return [];
        }
        
        const pattern = scalePatterns[scale];
        if (!pattern) {
            console.warn(`❌ Unknown scale: ${scale}`);
            return [];
        }
        
        // Calculate highlighted keys across multiple octaves (C0 to C8)
        const highlightedKeys = [];
        const startOctave = 0;
        const endOctave = 8;
        
        for (let octave = startOctave; octave <= endOctave; octave++) {
            pattern.forEach(interval => {
                const midiNote = (octave * 12) + rootNote + interval;
                // Ensure we're within valid MIDI range (0-127)
                if (midiNote >= 0 && midiNote <= 127) {
                    highlightedKeys.push(midiNote);
                }
            });
        }
        
        // Sort keys for better performance
        highlightedKeys.sort((a, b) => a - b);
        return highlightedKeys;
    };

    const handleApply = () => {
        if (selectedKey && selectedMode) {
            const highlightedKeys = calculateHighlightedKeys(selectedKey, selectedMode);
            
            setAppliedSelection({
                key: selectedKey,
                scale: selectedMode
            });
            
            // Dispatch to Redux
            dispatch(setSelectedKey(selectedKey));
            dispatch(setSelectedScale(selectedMode));
            dispatch(setHighlightedPianoKeys(highlightedKeys));
            
            setIsOpen(false); // Close the dropdown after applying
        }
    };

    const handleClear = () => {
        setSelectedKeyLocal(null);
        dispatch(clearKeyScaleSelection());
        setAppliedSelection(null); // Clear the applied selection too
    };


    const menu = [
        { id: 'Click', label: 'Click' },
        { id: 'Tick', label: 'Tick' },
        { id: 'Hihat', label: 'Hihat' },
        { id: 'Clave', label: 'Clave' }
    ];

    
    const menu1 = [
        { id: '2 bars', label: '2 bars' },
        { id: '1 bar', label: '1 bar' },
        { id: 'Off', label: 'Off' }
    ];

    useEffect(() => {
        const handleClickOutside2 = (event) => {
            if (menuDropdownRef.current && !menuDropdownRef.current.contains(event.target)) {
                setIsOpen2(false); // or whatever state controls your menu dropdown
            }
        };
        document.addEventListener('mousedown', handleClickOutside2);
        return () => document.removeEventListener('mousedown', handleClickOutside2);
    }, []);

    const handleMenuItemSelect = (qualityId, qualityLabel) => {
        dispatch(setMetronomeSound(qualityLabel));
        setSelectedMenuitems(qualityLabel);
        setIsOpen2(false)
    };
    
    const handleCountInSelect = (qualityId, qualityLabel) => {
        setSelectedCountIn(qualityLabel);
        setIsOpen2(false)
    };

    const { isDark } = useTheme();

    const [recordingStartTime, setRecordingStartTime] = useState(null);

    const selectedSound = useSelector(state => state.studio.selectedSound);
    const audioRef = useRef(null);
    const useMetronomePlayer = (selectedSound) => {
    
        // Update audio whenever selectedSound changes
        useEffect(() => {
            audioRef.current = new Audio(`/Audio/metronome/${selectedSound.toLowerCase()}.wav`);
            audioRef.current.volume = volume1 / 100;
        }, [selectedSound]);
    
        const playTick = () => {
            if (!isIconActive) return;
            if (audioRef.current) {
                audioRef.current.currentTime = 0;
                audioRef.current.play().catch(() => {}); // prevent AbortError
            }
        };
    
        const stopTick = () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.currentTime = 0;
            }
        };
    
        return { playTick, stopTick };
    };

    const { playTick, stopTick } = useMetronomePlayer(selectedSound);
    const tickIntervalRef = useRef(null);

    // Start recording
    const handleStartRecord = () => {
        if (selectedCountIn === "Off") {
            dispatch(setRecording(true));
            dispatch(setRecordedData([])); // Clear timeline data
            dispatch(setDrumRecordedData([])); // Clear drum data
            setRecordingStartTime(Date.now());
            handlePlayPause();
            tickIntervalRef.current = setInterval(() => {
                playTick();
            }, 600);
          } else {
            startCountIn();
          }        
        // console.log("Recording started at:", new Date().toLocaleTimeString());
    };

    // Stop recording
    const handleStopRecord = () => {
        dispatch(setRecording(false));
        handlePlayPause();
        // console.log("Recording stopped at:", new Date().toLocaleTimeString());
        // console.log("Timeline recorded data:", recordedData);
        // console.log("Drum recorded data:", drumRecordedData);
        if (tickIntervalRef.current) {
            clearInterval(tickIntervalRef.current);
            tickIntervalRef.current = null;
        }
        stopTick();
    };

    const startCountIn = () => {
        const beats = 4;
        const bars = selectedCountIn === "2 bars" ? 2 : 1;
        let totalBeats = beats * bars;

        let currentBeat = 1;
        setIsCounting(true);
        setCountInNumber(currentBeat);
    
        const interval = setInterval(() => {
          currentBeat++;
          if (currentBeat > totalBeats) {
            tickIntervalRef.current = setInterval(() => {
                playTick();
            }, 600);
            dispatch(setRecording(true));
            clearInterval(interval);
            setIsCounting(false);
            setCountInNumber(null);
            handlePlayPause();
          } else {
            setCountInNumber(((currentBeat - 1) % beats) + 1);
          }
        }, 600); // adjust for BPM
      };

    const handleMetronomeVolume = (e) => {
        const newVolume = e.target.value;
        setVolume1(newVolume);
        if (audioRef.current) {
            audioRef.current.volume = newVolume / 100;
        }
    };

    // // Collect data while recording
    // useEffect(() => {
    //     let interval;
    //     if (isRecording && recordingStartTime) {
    //         interval = setInterval(() => {
    //             const currentData = {
    //                 timestamp: Date.now() - recordingStartTime,
    //                 currentTime: currentTime,
    //                 volume: masterVolume,
    //                 isPlaying: isPlaying
    //             };
                
    //             // Update recorded data in Redux
    //             const updatedData = [...(Array.isArray(recordedData) ? recordedData : []), currentData];
    //             dispatch(setRecordedData(updatedData));
    //         }, 1000); // Collect data every 1 second
    //     }
    //     return () => {
    //         if (interval) {
    //             clearInterval(interval);
    //         }
    //     };
    // }, [isRecording, recordingStartTime, currentTime, masterVolume, isPlaying, recordedData, dispatch]);

    useEffect(() => {
        if (!isRecording && recordedData.length > 0) {
            // console.log("Total recorded data:", recordedData);
        }
    }, [isRecording, recordedData]);

    return (
        <>
            <div className=" w-full flex justify-center md600:justify-between bg-primary-light dark:bg-primary-dark border-t border-[#1414141A] dark:border-[#FFFFFF1A] px-2 py-2 sm:px-3 sm:py-1 md:px-5 md:py-2 xl:px-7 absolute z-[99999999]">
                <div className='flex gap-2 sm:gap-3 md:gap-3 lg:gap-5 2xl:gap-7 items-center'>
                    <div className="flex items-center gap-1">
                        <HiOutlineSpeakerWave className={`text-secondary-light dark:text-secondary-dark text-[16px] md:text-[20px] lg:text-[24px] transition-colors ${isVolumeChanging ? 'text-blue-500' : ''}`} />

                    </div>
                    <div className=" md:w-32 lg:w-40 2xl:w-48  pb-1 hidden md:block relative">
                        <input
                            type="range"
                            min="0"
                            max="100"
                            value={masterVolume}
                            onChange={(e) => handleVolumeChange(e.target.value)}
                            className="w-full h-1 lg:h-2 bg-[#2B2B2B]  rounded-lg appearance-none cursor-pointer slider outline-none focus:outline-none"
                            style={{
                                background: isDark
                                    ? `linear-gradient(to right, #ffffff 0%, #ffffff ${masterVolume}%, #2B2B2B ${masterVolume}%, #2B2B2B 100%)`
                                    : `linear-gradient(to right, #141414 0%, #141414 ${masterVolume}%, #1414141A ${masterVolume}%, #1414141A 100%)`
                            }}
                        />
                    </div>
                    <p className="text-secondary-light dark:text-secondary-dark sm:text-[10px] md:text-[16px] lg:text-[18px] self-center hidden sm:block w-[60px]">{formatTime(currentTime)}</p>
                    {/* {isRecording ? (<button onClick={handleStopRecord} className="cursor-pointer">
                        
                        <div className="flex gap-1 sm:gap-2 items-center rounded-2xl bg-[#1414141A] dark:bg-[#1F1F1F] py-[1px] px-2 md:py-[4px] md:px-2 lg:py-[6px] lg:px-3">
                                <p className="text-secondary-light dark:text-secondary-dark text-[10px] md:text-[16px]"><FaStop /></p>
                            </div>
                    </button>
                    ) :
                        (<button onClick={handleStartRecord} className="cursor-pointer">
                            <div className="flex gap-1 sm:gap-2 items-center rounded-2xl bg-[#1414141A] dark:bg-[#1F1F1F] py-[1px] px-2 md:py-[4px] md:px-2 lg:py-[6px] lg:px-3">
                                <p className="rounded-full p-[3px] sm:p-[3px] lg:p-2 bg-[#FF6767]"></p>
                                <p className="text-secondary-light dark:text-secondary-dark text-[10px] md:text-[12px]">Rec</p>
                            </div>
                        </button>)
                    } */}

                    <div className="relative flex flex-col items-center">
                        {isCounting && (
                            <div className="absolute top-[-100px] flex flex-col items-center bg-[#1f1f1f] text-white px-8 py-5 rounded-lg shadow-lg">
                                <div className="text-lg font-bold">{countInNumber}</div>
                                <div className="flex gap-2 mt-2">
                                    {[1, 2, 3, 4].map((dot) => (
                                    <span
                                        key={dot}
                                        className={`w-3 h-3 rounded-full transform transition-all duration-300 ease-in-out ${
                                        dot === countInNumber ? "bg-pink-500 scale-[1.5]" : "bg-pink-900 scale-100"
                                        }`}
                                    ></span>
                                    ))}
                                </div>
                            </div>
                        )}
                  
                        {isRecording ? (
                            <button onClick={handleStopRecord} className="cursor-pointer">                        
                                <div className="flex gap-1 sm:gap-2 items-center rounded-2xl bg-[#1414141A] dark:bg-[#1F1F1F] py-[1px] px-2 md:py-[4px] md:px-2 lg:py-[6px] lg:px-3">
                                    <p className="text-secondary-light dark:text-secondary-dark text-[10px] md:text-[16px]"><FaStop /></p>
                                </div>
                            </button>
                        ) : (
                            <button onClick={() => {
                                if (!tracks || tracks.length === 0) {
                                  alert("Please Add New Track !");
                                } else {
                                  handleStartRecord();
                                }
                              }} className="cursor-pointer">
                                <div className="flex gap-1 sm:gap-2 items-center rounded-2xl bg-[#1414141A] dark:bg-[#1F1F1F] py-[1px] px-2 md:py-[4px] md:px-2 lg:py-[6px] lg:px-3">
                                    <p className="rounded-full p-[3px] sm:p-[3px] lg:p-2 bg-[#FF6767]"></p>
                                    <p className="text-secondary-light dark:text-secondary-dark text-[10px] md:text-[12px]">Rec</p>
                                </div>
                            </button>
                        )}
                    </div>

                    <div className="flex gap-1 sm:gap-2 lg:gap-3">
                        <div className="items-center rounded-full bg-[#1414141A] dark:bg-[#1F1F1F] p-1 lg:p-2 cursor-pointer" onClick={handleMoveStart}>
                            <img src={media1} alt="" className="w-[10px] h-[10px] md:w-[12px] md:h-[12px] lg:w-[16px] lg:h-[16px]" />
                        </div>
                        <div className="items-center rounded-full bg-[#1414141A] dark:bg-[#1F1F1F] p-1 lg:p-2 cursor-pointer"  onClick={handleMoveBackward}>
                            <img src={media2} alt="" className="w-[10px] h-[10px] md:w-[12px] md:h-[12px] lg:w-[16px] lg:h-[16px]" />
                        </div>
                        <button 
                            onClick={handlePlayPause}
                            className="items-center rounded-full bg-[#1414141A] dark:bg-[#1F1F1F] p-1 lg:p-2 cursor-pointer hover:bg-[#1414142A] dark:hover:bg-[#2F2F2F] transition-colors"
                        >
                            <img src={isPlaying ? pauseIcon : media3} alt="" className="w-[10px] h-[10px] md:w-[12px] md:h-[12px] lg:w-[16px] lg:h-[16px]" />
                        </button>
                        <div className="items-center rounded-full bg-[#1414141A] dark:bg-[#1F1F1F] p-1 lg:p-2 cursor-pointer"  onClick={handleMoveForward}>
                            <img src={media4} alt="" className="w-[10px] h-[10px] md:w-[12px] md:h-[12px] lg:w-[16px] lg:h-[16px]" />
                        </div>
                    </div>
                    {/* <p className="sm:text-[8px] lg:text-[12px] text-[#14141499] dark:text-[#FFFFFF99] hidden sm:block">Key <span className='text-secondary-light dark:text-secondary-dark'>-</span></p> */}
                    <div className="flex items-center justify-center">
                        <div className="relative" ref={keyDropdownRef}>
                            {/* Trigger Button */}
                            <button
                                onClick={() => setIsOpen(!isOpen)}
                                className="cursor-pointer outline-none focus:outline-none"
                            >
                                <p className="sm:text-[8px] lg:text-[12px] text-[#14141499] dark:text-[#FFFFFF99] hidden sm:block">
                                    Key <span className="text-secondary-light dark:text-secondary-dark">
                                        {appliedSelection ? `${appliedSelection.key} ${appliedSelection.scale}` : '-'}
                                    </span>
                                </p>
                            </button>

                            {/* Dropdown */}
                            {isOpen && (
                                <div className="absolute -top-[150px] left-[-180px] w-76 p-3 md600:-top-[200px] md600:left-[-140px] md600:w-76 md600:p-4 lg:-top-[250px] lg:left-[-170px] lg:w-120 bg-primary-light dark:bg-primary-dark rounded-lg shadow-lg  lg:p-5 z-50">
                                    {/* Mode Selection */}
                                    <div className="flex gap-1 mb-2  md600:gap-2 md600:mb-3 lg:gap-3 lg:mb-4">
                                        <button
                                            onClick={() => handleScaleSelect("Major")}
                                            className={`px-3 text-[8px] md600:px-4 py-1 md600:text-[10px] lg:px-5 rounded-full lg:text-[12px] border border-[#1414141A] dark:border-[#FFFFFF1A] transition-colors ${selectedMode === "Major"
                                                ? "bg-primary-dark dark:bg-primary-light text-secondary-dark dark:text-secondary-light"
                                                : "bg-primary-light dark:bg-primary-dark text-secondary-light dark:text-secondary-dark hover:bg-[#E5E5E5] dark:hover:bg-[#262529]"
                                                }`}
                                        >
                                            Major
                                        </button>
                                        <button
                                            onClick={() => handleScaleSelect("Minor")}
                                            className={`px-3 text-[8px] md600:px-4 py-1 md600:text-[10px] lg:px-5 rounded-full lg:text-[12px] border border-[#1414141A] dark:border-[#FFFFFF1A] transition-colors ${selectedMode === "Minor"
                                                ? "bg-primary-dark dark:bg-primary-light text-secondary-dark dark:text-secondary-light"
                                                : "bg-primary-light dark:bg-primary-dark text-secondary-light dark:text-secondary-dark hover:bg-[#E5E5E5] dark:hover:bg-[#262529]"
                                                }`}
                                        >
                                            Minor
                                        </button>
                                    </div>

                                    {/* Sharp Keys Row */}
                                    <div className="flex mx-auto px-5 mb-1 md600:px-6 md600:mb-2 lg:px-8 lg:mb-3 justify-between">
                                        <div className='flex gap-1 md600:gap-2'>
                                            {sharpKeys.map((key) => (
                                                <button
                                                    key={key}
                                                    onClick={() => handleKeySelect(key)}
                                                    className={`w-6 h-6 text-[10px] md600:w-8 md600:h-8 md600:text-[12px] lg:w-10 lg:h-10 rounded lg:text-[14px] border border-[#1414141A] dark:border-[#FFFFFF1A] transition-colors ${selectedKey === key
                                                        ? "bg-primary-dark dark:bg-primary-light text-secondary-dark dark:text-secondary-light"
                                                        : "bg-[#F6F6F6] dark:bg-[#1F1F1F] text-secondary-light dark:text-secondary-dark hover:bg-[#E5E5E5] dark:hover:bg-gray-600"
                                                        }`}
                                                >
                                                    {key}
                                                </button>
                                            ))}
                                        </div>
                                        <div className='flex gap-1 md600:gap-2'>
                                            {sharpKeys2.map((key) => (
                                                <button
                                                    key={key}
                                                    onClick={() => handleKeySelect(key)}
                                                    className={`w-6 h-6 text-[10px] md600:w-8 md600:h-8 md600:text-[12px] lg:w-10 lg:h-10 rounded lg:text-[14px] border border-[#1414141A] dark:border-[#FFFFFF1A] transition-colors ${selectedKey === key
                                                        ? "bg-primary-dark dark:bg-primary-light text-secondary-dark dark:text-secondary-light"
                                                        : "bg-[#F6F6F6] dark:bg-[#1F1F1F] text-secondary-light dark:text-secondary-dark hover:bg-[#E5E5E5] dark:hover:bg-gray-600"
                                                        }`}
                                                >
                                                    {key}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Natural Keys Row */}
                                    <div className="flex gap-1 mb-3 md600:gap-2 md600:mb-4 lg:mb-6 justify-center">
                                        {keys.map((key) => (
                                            <button
                                                key={key}
                                                onClick={() => handleKeySelect(key)}
                                                className={`w-6 h-6 text-[10px] md600:w-8 md600:h-8 md600:text-[12px] lg:w-10 lg:h-10 rounded lg:text-[14px] border border-[#1414141A] dark:border-[#FFFFFF1A] transition-colors ${selectedKey === key
                                                    ? "bg-primary-dark dark:bg-primary-light text-secondary-dark dark:text-secondary-light"
                                                    : "bg-[#F6F6F6] dark:bg-[#1F1F1F] text-secondary-light dark:text-secondary-dark hover:bg-[#E5E5E5] dark:hover:bg-gray-600"
                                                    }`}
                                            >
                                                {key}
                                            </button>
                                        ))}
                                    </div>

                                    {/* Footer Buttons */}
                                    <div className="flex justify-between items-center">
                                        <button
                                            onClick={handleClear}
                                            className="flex items-center gap-1 md600:gap-2 lg:gap-3 text-gray-400  transition-colors"
                                        >
                                            <Clears className='w-3 h-3 md600:w-4 md600:h-4 text-secondary-light dark:text-secondary-dark' />
                                            <p className="text-[10px] md600:text-[10px] lg:text-[12px] text-secondary-light dark:text-gray-400">Clear</p>
                                        </button>

                                        <button
                                            onClick={handleApply}
                                            className=" text-[10px] px-4 py-1 md600:text-[10px] lg:px-6  bg-primary-dark dark:bg-primary-light text-secondary-dark dark:text-secondary-light lg:text-[12px] rounded-full hover:bg-gray-200 transition-colors"
                                        >
                                            Apply
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                    {/* <p className="sm:text-[8px] lg:text-[12px] text-[#14141499] dark:text-[#FFFFFF99] hidden sm:block">Tempo <span className='text-secondary-light dark:text-secondary-dark'>120</span></p> */}
                    <div className="flex items-center justify-center">
                        <div className="relative" ref={tempoDropdownRef}>
                            {/* Trigger Button */}
                            <button
                                onClick={() => setIsOpen1(!isOpen1)}
                                className="cursor-pointer outline-none focus:outline-none"
                            >
                                <p className="sm:text-[8px] lg:text-[12px] text-[#14141499] dark:text-[#FFFFFF99] hidden sm:block">
                                    Tempo: <span className="text-secondary-light dark:text-secondary-dark">{appliedTempo}</span>
                                </p>
                            </button>

                            {/* Dropdown */}
                            {isOpen1 && (
                                <div className="absolute -top-[210px] left-[0px] md600:-top-[270px] md600:left-[25px] lg:-top-[320px] lg:left-[35px] transform -translate-x-1/2 w-40 md600:w-52 lg:w-64 bg-primary-light dark:bg-primary-dark rounded-2xl shadow-2xl p-3 md600:p-4 lg:p-6 z-50">
                                    {/* Title */}
                                    <h3 className="text-white text-center text-[10px] md600:text-[12px] lg:text-[14px] font-medium mb-2 md600:mb-3">
                                        Tempo (BPM)
                                    </h3>

                                    {/* Circular Metronome Button */}
                                    <div className="flex justify-center mb-2 md600:mb-3">
                                        <button
                                            onClick={handleIncrement}
                                        >
                                            {/* Metronome Icon */}
                                            <Tempobutton className=' w-10 h-10 md600:w-14 md600:h-14 lg:w-16 lg:h-16 text-secondary-light dark:text-secondary-dark' />
                                        </button>
                                    </div>

                                    {/* Instructions */}
                                    <p className="text-secondary-light dark:text-secondary-dark text-center text-[10px] md600:text-[12px] mb-2 md600:mb-3 leading-relaxed">
                                        Click above or tap T <br />
                                        repeatedly to set tempo
                                    </p>

                                    {/* Tempo Controls */}
                                    <div className="flex items-center justify-center gap-2 md600:gap-3 lg:gap-4 mb-3 md600:mb-4 lg:mb-6 my-auto">
                                        {/* Decrement Button */}
                                        <button
                                            onClick={handleDecrement}
                                            className="w-4 h-4 md600:w-6 md600:h-6 lg:w-8 lg:h-8 text-[10px] md600:text-[12px] bg-primary-light dark:bg-primary-dark  flex items-center justify-center border border-[#1414141A] dark:border-[#FFFFFF1A] rounded-full text-secondary-light dark:text-secondary-dark hover:bg-[#E5E5E5] dark:hover:bg-[#262529] transition-colors font-bold"
                                        >
                                            −
                                        </button>

                                        {/* Tempo Display/Input */}
                                        <div className="bg-transparent">
                                            <input
                                                type="text"
                                                value={tempo}
                                                onChange={handleTempoInputChange}
                                                min="60"
                                                max="200"
                                                className="bg-[#E5E5E5] dark:bg-[#262529] text-secondary-light dark:text-secondary-dark text-[10px] md600:text-[12px] lg:text-[14px] font-light text-center rounded-lg w-12 md600:w-16 py-1 md600:py-2 outline-none border-none"
                                            />
                                        </div>

                                        {/* Increment Button */}
                                        <button
                                            onClick={handleIncrement}
                                            className="w-4 h-4 md600:w-6 md600:h-6 lg:w-8 lg:h-8 text-[10px] md600:text-[12px] bg-primary-light dark:bg-primary-dark border border-[#1414141A] dark:border-[#FFFFFF1A] rounded-full flex items-center justify-center text-secondary-light dark:text-secondary-dark hover:bg-[#E5E5E5] dark:hover:bg-[#262529] transition-colors font-bold"
                                        >
                                            +
                                        </button>
                                    </div>

                                    {/* Apply Button */}
                                    <div className="flex justify-center">
                                        <button
                                            onClick={handleApply2}
                                            className="px-4 py-1 md600:px-6 md600:py-2 lg:px-8 bg-primary-dark dark:bg-primary-light text-secondary-dark dark:text-secondary-light text-[10px] md600:text-[12px] rounded-full transition-colors font-medium"
                                        >
                                            Apply
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="">
                        <div className="relative flex gap-2 md:gap-3" ref={menuDropdownRef}>
                            <div className='flex items-center justify-between rounded-full hover:bg-gray-700'>
                                <div onClick={() => setIsIconActive(!isIconActive)} className={`items-center rounded-full p-[2px] sm:p-1 md:p-2 cursor-pointer ${isIconActive ? "bg-primary-dark dark:bg-primary-light" : "bg-[#b5b5b5]"}`}>
                                    <img src={isDark ? darkStrange : Strange} className="w-[9px] h-[9px] sm:w-[10px] sm:h-[10px] md:w-[12px] md:h-[14px] lg:w-[14px] lg:h-[16px]" />
                                </div>
                                <div className='mx-2 cursor-pointer' onClick={() => { setIsIconDropdownOpen(!isIconDropdownOpen); setIsOpen2(!isOpen2) }}>
                                    <IoIosArrowDown className={`text-[#14141499] dark:text-[#FFFFFF99] transition-transform my-auto  duration-300 ${isIconDropdownOpen ? 'rotate-180' : 'rotate-0'}`} />
                                </div>
                            </div>

                            {isOpen2 && (
                                <div className="absolute -top-[310px] left-[-40px] md600:-top-[380px] md600:left-[25px] lg:-top-[410px] lg:left-[35px] transform -translate-x-1/2 w-40 md600:w-44 lg:w-56 bg-primary-light dark:bg-primary-dark rounded-lg shadow-2xl p-1 z-50">
                                    <div>
                                        {menu.map((option) => (
                                            <div
                                                key={option.id}
                                                className="flex items-center justify-between px-3 py-1 lg:px-4 md600:py-2 text-secondary-light dark:text-secondary-dark cursor-pointer hover:bg-[#E5E5E5] dark:hover:bg-[#262529]"
                                                onClick={() => handleMenuItemSelect(option.id, option.label)}
                                            >
                                                <div className="flex items-center gap-2 md600:gap-3">
                                                    {/* Show tick only for selected option */}
                                                    <div className="w-3 h-3 md600:w-4 md600:h-4 lg:w-5 lg:h-5 flex items-center justify-center">
                                                        {selectedMenuitems === option.label && (
                                                            <Tick className='w-3 h-3 md600:w-4 md600:h-4 lg:w-5 lg:h-5 text-secondary-light dark:text-secondary-dark' />
                                                        )}
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className='text-secondary-light dark:text-secondary-dark text-[10px] md600:text-[12px] lg:text-[14px]'>
                                                            {option.label}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="py-3 px-4 border-t border-b border-[#1414141A] dark:border-[#FFFFFF1A] my-2">
                                        <p className='text-[10px] text-secondary-light dark:text-[#FFFFFF99]'>Volume</p>
                                        <div className=" md:w-32 lg:w-40 2xl:w-48  py-1 ">
                                            <input
                                                type="range"
                                                min="0"
                                                max="100"
                                                value={volume1}
                                                onChange={handleMetronomeVolume}
                                                className="w-full h-1 lg:h-2 bg-[#2B2B2B]  rounded-lg appearance-none cursor-pointer slider outline-none focus:outline-none"
                                                style={{
                                                    background: isDark
                                                        ? `linear-gradient(to right, #ffffff 0%, #ffffff ${volume1}%, #2B2B2B ${volume1}%, #2B2B2B 100%)`
                                                        : `linear-gradient(to right, #141414 0%, #141414 ${volume1}%, #1414141A ${volume1}%, #1414141A 100%)`
                                                }}
                                            />
                                        </div>
                                    </div>
                                    <div className=''>
                                        <p className='text-[10px] text-secondary-light dark:text-[#FFFFFF99] py-3 px-4'>Count in</p>
                                        <div>
                                            {menu1.map((option) => (
                                                <div
                                                    key={option.id}
                                                    className="flex items-center justify-between px-3 py-1 lg:px-4 md600:py-2 text-secondary-light dark:text-secondary-dark cursor-pointer hover:bg-[#E5E5E5] dark:hover:bg-[#262529]"
                                                    onClick={() => handleCountInSelect(option.id, option.label)}
                                                >
                                                    <div className="flex items-center gap-2 md600:gap-3">
                                                        {/* Show tick only for selected option */}
                                                        <div className="w-3 h-3 md600:w-4 md600:h-4 lg:w-5 lg:h-5 flex items-center justify-center">
                                                            {selectedCountIn === option.label && (
                                                                <Tick className='w-3 h-3 md600:w-4 md600:h-4 lg:w-5 lg:h-5 text-secondary-light dark:text-secondary-dark' />
                                                            )}
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className='text-secondary-light dark:text-secondary-dark text-[10px] md600:text-[12px] lg:text-[14px]'>
                                                                {option.label}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className='flex sm:gap-2 md:gap-3 lg:gap-5 2xl:gap-7 items-center '>
                    <RxZoomIn className='text-[#14141499] dark:text-[#FFFFFF99] cursor-pointer  md:text-[20px] lg:text-[24px] hidden md600:block' />
                    <RxZoomOut className='text-[#14141499] dark:text-[#FFFFFF99] cursor-pointer  md:text-[20px] lg:text-[24px] hidden md600:block' />
                </div>


                <style jsx>{`
                .slider::-webkit-slider-thumb {
                    appearance: none;
                    height: 15px;
                    width: 15px;
                    border-radius: 50%;
                    background: #ffffff;
                    cursor: pointer;
                    border: none;
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
                }
                
                .slider::-moz-range-thumb {
                    height: 20px;
                    width: 20px;
                    border-radius: 50%;
                    background: #ffffff;
                    cursor: pointer;
                    border: none;
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
                }
            `}</style>
            </div>
        </>
    )
}

export default BottomToolbar


