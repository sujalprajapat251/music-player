import React, { useState, useRef, useEffect } from 'react';
import { Mic } from 'lucide-react';
import { IoClose } from 'react-icons/io5';
import { useDispatch, useSelector } from 'react-redux';
import { setRecordingAudio, addAudioClipToTrack, updateAudioClip } from '../Redux/Slice/studio.slice';
import AccessPopup from './AccessPopup';
import { selectStudioState } from '../Redux/rootReducer';
import { BASE_URL } from '../Utils/baseUrl';
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import subscription from "../Images/subscriptionIcon.svg";
import { LuHeadphoneOff } from "react-icons/lu";
import { PiWaveformBold } from "react-icons/pi";
import PricingModel from './PricingModel';
import { LiaWaveSquareSolid } from "react-icons/lia";
import { FaChevronDown } from "react-icons/fa";
import { addEffect, setShowEffectsLibrary, toggleEffectsOffcanvas } from '../Redux/Slice/effects.slice';
import { setSelectedInstrument as setSelectedInstrumentAction } from '../Redux/Slice/studio.slice';
import OpenInstrumentModal from './OpenInstrumentsModel';


function polarToCartesian(cx, cy, r, angle) {
    const a = (angle - 90) * Math.PI / 180.0;
    return {
        x: cx + r * Math.cos(a),
        y: cy + r * Math.sin(a)
    };
}

function describeArc(cx, cy, r, startAngle, endAngle) {
    const start = polarToCartesian(cx, cy, r, endAngle);
    const end = polarToCartesian(cx, cy, r, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
    return [
        "M", start.x, start.y,
        "A", r, r, 0, largeArcFlag, 0, end.x, end.y
    ].join(" ");
}

function Knob({ label = "Bite", min = -135, max = 135, defaultAngle, onChange }) {
    const [angle, setAngle] = useState(defaultAngle ?? min);
    const knobRef = useRef(null);
    const dragging = useRef(false);
    const lastY = useRef(0);

    const getResponsiveSize = () => {
        if (typeof window !== 'undefined') {
            if (window.innerWidth >= 1440) return 56;
            if (window.innerWidth >= 1280) return 52;
            if (window.innerWidth >= 1024) return 48;
            if (window.innerWidth >= 768) return 44;
            if (window.innerWidth >= 640) return 40;
            return 30;
        }
        return 56;
    };

    const [size, setSize] = useState(getResponsiveSize());

    useEffect(() => {
        const handleResize = () => setSize(getResponsiveSize());
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);


    const getResponsiveStroke = () => {
        if (typeof window !== 'undefined') {
            if (window.innerWidth >= 768) return 3;
            // if (window.innerWidth >= 640) return 40;
            return 2;
        }
        return 56;
    };

    const [stroke, setStroke] = useState(getResponsiveStroke());

    useEffect(() => {
        const handleResizeStroke = () => setStroke(getResponsiveStroke());
        window.addEventListener('resize', handleResizeStroke);
        return () => window.removeEventListener('resize', handleResizeStroke);
    }, []);

    useEffect(() => {
        if (defaultAngle !== undefined) {
            setAngle(defaultAngle);
        }
    }, [defaultAngle]);

    const radius = (size - stroke) / 2;
    const center = size / 2;
    const onMouseDown = (e) => {
        dragging.current = true;
        lastY.current = e.clientY;
        document.addEventListener("mousemove", onMouseMove);
        document.addEventListener("mouseup", onMouseUp);
    };

    const onMouseMove = (e) => {
        if (!dragging.current) return;
        const deltaY = lastY.current - e.clientY;
        lastY.current = e.clientY;
        setAngle((prev) => {
            let next = prev + deltaY * 1.5;
            next = Math.max(min, Math.min(max, next));

            if (onChange) {
                onChange(next);
            }
            return next;
        });
    };

    const onMouseUp = () => {
        dragging.current = false;
        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", onMouseUp);
    };

    const arcStart = min;
    const valueAngle = angle;
    const fgArc = describeArc(center, center, radius, arcStart, valueAngle);

    return (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", }}>
            <div ref={knobRef} style={{ width: size, height: size, position: "relative", cursor: "pointer", }} onMouseDown={onMouseDown}>
                <svg width={size} height={size}>
                    <circle cx={center} cy={center} r={radius} stroke="#444" strokeWidth={stroke} fill="#1F1F1F" />
                    <path d={fgArc} stroke="#bbb" strokeWidth={stroke} fill="#1F1F1F" strokeLinecap="round" />
                </svg>
                <div className={`absolute top-1.5 left-1/2 w-0.5 h-2 md600:h-3 lg:h-4 bg-gray-400 rounded-sm -translate-x-1/2 origin-bottom`} style={{ transform: `translateX(-50%) rotate(${angle}deg)`, }} />
            </div>
            <div className='text-[8px] md600:text-[10px] md:text-[12px] 2xl:text-[14px] mt-1 items-center text-[#aaa]' style={{ fontFamily: "sans-serif" }}>{label}</div>
        </div>
    );
}

const VoiceAndMic = ({ onClose, onRecorded, selectedInstrument, setSelectedInstrument }) => {

    const dispatch = useDispatch();
    const [showOffcanvas1, setShowOffcanvas1] = useState(true);
    const [isRecording, setIsRecording] = useState(false);
    const [audioLevel, setAudioLevel] = useState(0);
    const [recordingTime, setRecordingTime] = useState(0);
    const [selectedInput, setSelectedInput] = useState('No instrument selected');
    const [activeTab, setActiveTab] = useState('Audio');
    const [showAccessPopup, setShowAccessPopup] = useState(false);
    const [volume, setVolume] = useState(90);
    const [reverb, setReverb] = useState(-90);
    const [pan, setPan] = useState(0);
    const [pricingModalOpen, setPricingModalOpen] = useState(false);

    const [isDragOver, setIsDragOver] = useState(false);
    const [isProcessingDrop, setIsProcessingDrop] = useState(false);
    const [effectsSearchTerm, setEffectsSearchTerm] = useState('');
    const [selectedEffectCategory, setSelectedEffectCategory] = useState(null);

    const { activeEffects, showEffectsLibrary, effectsLibrary, showEffectsOffcanvas, showEffectsTwo } = useSelector((state) => state.effects);

    const getTrackType = useSelector((state) => selectStudioState(state).newtrackType);
    const getIsRecording = useSelector((state) => selectStudioState(state).isRecording);
    const currentTime = useSelector((state) => selectStudioState(state).currentTime || 0);
    const currentTrackId = useSelector((state) => selectStudioState(state).currentTrackId);

    const mediaRecorderRef = useRef(null);
    const audioContextRef = useRef(null);
    const analyserRef = useRef(null);
    const streamRef = useRef(null);
    const timerRef = useRef(null);

    const [isRealtimeEnabled, setIsRealtimeEnabled] = useState(true);
    const [vocalTunerAmount, setVocalTunerAmount] = useState(70);
    const [selectedKey, setSelectedKey] = useState('D');

    // Initialize audio context and get microphone access
    const initializeAudio = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            streamRef.current = stream;

            audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
            analyserRef.current = audioContextRef.current.createAnalyser();
            const source = audioContextRef.current.createMediaStreamSource(stream);
            source.connect(analyserRef.current);

            analyserRef.current.fftSize = 256;

            // Start monitoring audio levels
            monitorAudioLevel();
        } catch (error) {
            console.error('Error accessing microphone:', error);
        }
    };

    const monitorAudioLevel = () => {
        if (!analyserRef.current) return;

        const bufferLength = analyserRef.current.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        const updateLevel = () => {
            analyserRef.current.getByteFrequencyData(dataArray);
            const average = dataArray.reduce((sum, value) => sum + value, 0) / bufferLength;
            setAudioLevel(average / 255 * 100);
            requestAnimationFrame(updateLevel);
        };

        updateLevel();
    };

    const startRecording = async () => {
        try {
            if (!streamRef.current || !(streamRef.current instanceof MediaStream)) {
                await initializeAudio();
            }

            const stream = streamRef.current;
            if (!stream || !(stream instanceof MediaStream)) {
                throw new Error('Microphone not initialized or permission denied.');
            }

            const options = {};
            if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported('audio/webm')) {
                options.mimeType = 'audio/webm';
            }

            const mediaRecorder = new MediaRecorder(stream, options);
            mediaRecorderRef.current = mediaRecorder;

            const chunks = [];
            mediaRecorder.ondataavailable = (event) => {
                if (event.data && event.data.size > 0) {
                    chunks.push(event.data);
                }
            };

            mediaRecorder.onstop = async () => {
                const blobType = options.mimeType || 'audio/webm';
                const blob = new Blob(chunks, { type: blobType });
                const url = URL.createObjectURL(blob);

                dispatch(setRecordingAudio(url));

                // Append recorded blob as an audio clip on the current track
                try {
                    // Compute accurate duration from the blob
                    let durationSec = 0;
                    try {
                        const arrayBuffer = await blob.arrayBuffer();
                        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
                        const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
                        durationSec = audioBuffer.duration;
                        audioCtx.close();
                    } catch (e) {
                        durationSec = Number(recordingTime) || 0;
                    }
                    // Fallback safeguard
                    if (!Number.isFinite(durationSec) || durationSec <= 0) {
                        durationSec = Number(recordingTime) || 0;
                    }

                    const startTime = Math.max(0, (Number(currentTime) || 0) - (Number(durationSec) || 0));
                    if (currentTrackId) {
                        // Create a stable clip id so we can update URL after upload
                        const clipId = Date.now() + Math.random();

                        dispatch(addAudioClipToTrack({
                            trackId: currentTrackId,
                            audioClip: {
                                id: clipId,
                                url,
                                name: 'Mic Recording',
                                duration: durationSec,
                                trimStart: 0,
                                trimEnd: durationSec,
                                startTime,
                                fromRecording: true,
                                type: 'audio'
                            }
                        }));

                        // Upload blob to backend to obtain HTTP URL, then update the clip
                        try {
                            const formData = new FormData();
                            formData.append('audio', blob, `mic_recording_${Date.now()}.webm`);
                            const resp = await fetch(`${BASE_URL}/upload-audio`, {
                                method: 'POST',
                                body: formData,
                                credentials: 'include'
                            });
                            if (resp.ok) {
                                const data = await resp.json();
                                const httpUrl = data?.url;
                                if (httpUrl) {
                                    dispatch(updateAudioClip({
                                        trackId: currentTrackId,
                                        clipId,
                                        updates: { url: httpUrl }
                                    }));
                                }
                            }
                        } catch (uploadErr) {
                            // Silently ignore upload errors; clip will keep blob URL
                        }
                    } else {
                        console.warn('No currentTrackId set; cannot append recording to timeline.');
                    }
                } catch (e) {
                    console.warn('Failed to append recording to track:', e);
                }

                if (onRecorded) {
                    onRecorded({ url, duration: recordingTime, blob, type: blobType });
                }
            };

            mediaRecorder.start();
            setIsRecording(true);
            setRecordingTime(0);

            if (timerRef.current) clearInterval(timerRef.current);
            timerRef.current = setInterval(() => {
                setRecordingTime(prev => prev + 1);
            }, 1000);
        } catch (error) {
            console.error('Failed to start recording:', error);
            setShowAccessPopup(true);
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            clearInterval(timerRef.current);
        }
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // Audio level visualization bars
    const AudioLevelBars = () => {
        const bars = Array.from({ length: 8 }, (_, i) => {
            const threshold = (i + 1) * 12.5;
            const isActive = audioLevel > threshold;
            const isRed = i >= 6;

            return (
                <div
                    key={i}
                    className={`w-2 h-6 mx-0.5 rounded-sm transition-all duration-75 ${isActive
                        ? isRed
                            ? 'bg-red-500'
                            : 'bg-green-400'
                        : 'bg-gray-600'
                        }`}
                />
            );
        });

        return <div className="flex items-end">{bars}</div>;
    };

    useEffect(() => {
        initializeAudio();

        return () => {
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
            }
            if (audioContextRef.current) {
                audioContextRef.current.close();
            }
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
    }, []);

    // Start/stop mic based on global recording flag from BottomToolbar
    useEffect(() => {
        try {
            if (getTrackType === 'Voice & Mic') {
                if (getIsRecording && !isRecording) {
                    startRecording();
                } else if (!getIsRecording && isRecording) {
                    stopRecording();
                }
            }
        } catch (_) {
            // no-op
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [getIsRecording, getTrackType]);

    const [isOpen, setIsOpen] = useState(false);
    const [audioInputs, setAudioInputs] = useState([]);

    // Discover connected audio input devices (potential live instruments)
    useEffect(() => {
        const fetchAudioInputs = async () => {
            try {
                // Ensure labels are available
                try {
                    await navigator.mediaDevices.getUserMedia({ audio: true });
                } catch (_) {
                    // ignore; enumerateDevices may still work, and AccessPopup handles perms elsewhere
                }

                const devices = await navigator.mediaDevices.enumerateDevices();
                const inputs = devices
                    .filter(d => d.kind === 'audioinput')
                    .map(d => d.label || 'Audio Input');

                // Optional: prioritize likely instrument/audio interface devices
                const keywords = ['usb', 'interface', 'mixer', 'line', 'guitar', 'external'];
                const prioritized = inputs.sort((a, b) => {
                    const aMatch = keywords.some(k => a.toLowerCase().includes(k));
                    const bMatch = keywords.some(k => b.toLowerCase().includes(k));
                    return (bMatch === aMatch) ? 0 : (bMatch ? 1 : -1);
                });

                setAudioInputs(prioritized);
            } catch (_) {
                setAudioInputs([]);
            }
        };

        fetchAudioInputs();
        // Re-run if permissions change or component opens
    }, []);

    const handleSelectInput = (input) => {
        setSelectedInput(input);
        setIsOpen(false);
        setPricingModalOpen(true);
    };

    const handleAddEffectFromLibrary = (effect) => {
        console.log('handleAddEffectFromLibrary called with:', effect);
    
        if (isProcessingDrop) {
          console.log('Already processing a drop, skipping duplicate');
          return;
        }
    
        setIsProcessingDrop(true);
        dispatch(addEffect(effect));
        dispatch(setShowEffectsLibrary(false));
        setEffectsSearchTerm('');
        setSelectedEffectCategory(null);
    
        setTimeout(() => {
          setIsProcessingDrop(false);
        }, 100);
      };

      const handlePlusButtonClick = () => {
        dispatch(toggleEffectsOffcanvas());
      };

      const INSTRUMENTS = [
        { id: 'Loud and Clear ', name: 'Loud and Clear ', category: '' },
        { id: 'Loud and Clear-Head...', name: 'Loud and Clear-Head...', category: '' },
        { id: 'Mobile Mic Enhancer', name: 'Mobile Mic Enhancer', category: '' },
        { id: 'Pop', name: 'Pop', category: '' },
        { id: 'Pop Delay', name: 'Pop Delay', category: '' },
        { id: 'Blues', name: 'Blues', category: '' },
        { id: 'Dub', name: 'Dub', category: '' },
        { id: 'Lo-fi', name: 'Lo-fi', category: '' },
        { id: 'Psychedelic', name: 'Psychedelic', category: '' },
        { id: 'Dizzy', name: 'Dizzy', category: '' },
        { id: 'Space Face', name: 'Space Face', category: '' },
        { id: 'Podcast', name: 'Podcast', category: '' }
    ];

    const [currentInstrumentIndex, setCurrentInstrumentIndex] = useState(0);
        const nextInstrument = () => {
        setCurrentInstrumentIndex((prev) => {
            const nextIdx = (prev + 1) % INSTRUMENTS.length;
                try {
                    dispatch(setSelectedInstrumentAction(INSTRUMENTS[nextIdx]));
                } catch (err) {
                    console.warn('Failed to dispatch setSelectedInstrumentAction:', err);
                }
            return nextIdx;
        });
    };

    const prevInstrument = () => {
        setCurrentInstrumentIndex((prev) => {
            const nextIdx = prev === 0 ? INSTRUMENTS.length - 1 : prev - 1;
            try {
                dispatch(setSelectedInstrumentAction(INSTRUMENTS[nextIdx]));
            } catch (err) {
                console.warn('Failed to dispatch setSelectedInstrumentAction:', err);
            }
            return nextIdx;
        });
    };

      const [openInstrumentModal, setOpenInstrumentModal] = useState(false);

    return (
        <>
            {openInstrumentModal && (
                <OpenInstrumentModal onClose={() => setOpenInstrumentModal(false)} initialCategory={"Voice & Mic"} initialSubCategory={"Voice - Clean"} />
            )}
            {showOffcanvas1 === true && (
                <>
                    <div className="fixed z-[10] w-full h-full transition-transform left-0 right-0 translate-y-full bottom-[330px] sm:bottom-[351px] md:bottom-[400px] lg:bottom-[430px] xl:bottom-[433px] 2xl:bottom-[467px] shadow-[0_-2px_11px_rgba(0,0,0,0.08)]">
                        <div className="border-b border-gray-300 dark:border-[#FFFFFF1A] h-full">
                            <div className="bg-white dark:bg-[#1F1F1F] flex items-center p-1 md600:px-2 md600:pt-2 lg:px-3 lg:pt-3">
                                <div>
                                    <IoClose className='text-[10px] sm:text-[12px] md600:text-[14px] md:text-[16px] lg:text-[18px] 2xl:text-[20px] text-gray-600 dark:text-[#FFFFFF99] cursor-pointer justify-start' onClick={() => {
                                        setShowOffcanvas1(false);
                                        onClose && onClose();
                                    }} />
                                </div>
                            </div>
                            <div className="bg-white dark:bg-[#1F1F1F] flex space-x-2 sm:space-x-3 px-1 md600:space-x-4 md600:px-2 lg:space-x-6 2xl:space-x-8 justify-center lg:px-3">
                                {['Audio', 'Effects']
                                    .filter(tab => {
                                        if (
                                            tab === 'Chords' &&
                                            (getTrackType === 'Bass & 808' || getTrackType === 'bass' || getTrackType === '808')
                                        ) {
                                            return false;
                                        }
                                        return true;
                                    })
                                    .map((tab) => (
                                        <button key={tab} onClick={() => setActiveTab(tab)}
                                            className={`text-[10px] md600:text-[10px] md:text-[12px] lg:text-[14px] 2xl:text-[16px] font-medium transition-colors ${activeTab === tab ? 'text-black dark:text-white border-b-2 border-black dark:border-white ' : 'text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white'}`}>
                                            {tab}
                                        </button>
                                    ))}
                            </div>
                            <div className="h-full">
                                {activeTab === 'Audio' && (
                                    <>
                                        <div className="min-h-screen text-white">
                                            {/* Header */}
                                            <div className="flex items-center justify-between px-2 md:px-6 py-1 bg-white dark:bg-[#1F1F1F] gap-2 md:gap-0">
                                                {/* Left Section */}
                                                <div className="">
                                                    <div className="relative w-32 sm:w-40 md:w-64">
                                                        <button
                                                            onClick={() => setIsOpen(!isOpen)}
                                                            className="w-full transition-colors duration-200 rounded-lg px-2 lg:px-3 py-2 flex items-center justify-between text-white border border-gray-600"
                                                        >
                                                            <div className="flex items-center space-x-2 min-w-0 text-black dark:text-white">
                                                                <Mic className="w-4 sm:w-3 lg:w-7 h-4 sm:h-3 lg:h-7" />
                                                                <span className="text-[10px] md:text-[12px] lg:text-sm text-gray-600 dark:text-gray-300 truncate w-[11rem] sm:w-[8rem] md:w-[10rem] lg:w-[22rem]">
                                                                    {selectedInput}
                                                                </span>
                                                            </div>
                                                            <FaChevronDown className={`w-3 lg:w-4 h-3 lg:h-4 text-black dark:text-gray-300 transition-transform duration-200 ${isOpen ? 'transform rotate-180' : '' }`} />
                                                        </button>

                                                        {isOpen && (
                                                            <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-[#1F1F1F] border border-gray-600 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
                                                                {audioInputs.length > 0 ? (
                                                                    audioInputs.map((input, index) => (
                                                                        <button
                                                                            key={index}
                                                                            onClick={() => handleSelectInput(input)}
                                                                            className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-700 transition-colors duration-150 flex items-center space-x-2 ${selectedInput === input ? 'bg-gray-700 text-white' : 'text-gray-300'
                                                                                } ${index === 0 ? 'rounded-t-lg' : ''} ${index === audioInputs.length - 1 ? 'rounded-b-lg' : ''
                                                                                }`}
                                                                        >
                                                                            <Mic className="w-3 lg:w-4 h-3 lg:h-4" />
                                                                            <span className="truncate">{input}</span>
                                                                        </button>
                                                                    ))
                                                                ) : (
                                                                    <div className="px-3 py-2 text-[7px] sm:text-[9px] md:text-[12px] lg:text-sm text-black dark:text-gray-400">No instrument detected</div>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className='flex items-center justify-between mt-3'>
                                                        <div className="text-black dark:text-white flex items-center space-x-2 border border-[#5d5d5d] py-1 px-1 sm:px-2 md:px-3 rounded-full cursor-pointer" onClick={() => setPricingModalOpen(true)}>
                                                            <Mic className="w-3 lg:w-4 h-3 lg:h-4" />
                                                            <span className="text-[7px] sm:text-[9px] md:text-[12px] lg:text-sm">Calibrate</span>
                                                        </div>

                                                        <div className="flex items-center space-x-2 text-black dark:text-white">
                                                            <span className="text-[7px] sm:text-[9px] md:text-[12px] lg:text-sm">Monitoring:</span>
                                                            <div className="w-5 md:w-8 h-5 md:h-8 bg-[#525252] text-white rounded-lg flex items-center justify-center">
                                                                <LuHeadphoneOff className="w-2 md:w-3 lg:w-4 h-2 md:h-3 lg:h-4" />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Center Section */}
                                                {/* <div className="flex overflow-x-auto sm:max-w-[380px] md:w-full"> */}
                                                <div>
                                                    <div className="flex items-center sm:space-x-2 border border-[#5d5d5d] rounded-lg">
                                                        <div className="flex items-center px-1 md:px-2 lg:px-4 py-2 lg:py-3 sm:gap-2 md:gap-4 border-r border-[#5d5d5d] text-gray-600 dark:text-gray-200">
                                                            <FaChevronLeft onClick={prevInstrument} className="w-2 sm:w-3 lg:w-4 h-2 sm:h-3 lg:h-4 cursor-pointer hover:text-purple-300" />
                                                            <FaChevronRight onClick={nextInstrument} className="w-2 sm:w-3 lg:w-4 h-2 sm:h-3 lg:h-4 cursor-pointer hover:text-purple-300" />
                                                        </div>
                                                
                                                        <div className="flex items-center gap-1 sm:gap-3 md:gap-8 ms-1 sm:px-1 md:px-2 lg:px-4 p-1 sm:py-1 md:py-2 lg:py-3 text-gray-600 dark:text-gray-200"
                                                            onClick={() => {
                                                            setOpenInstrumentModal(true);
                                                            // setGlide(135); // set glide to max visible position so it appears enabled
                                                        }}
                                                        >
                                                            <div className="w-[130px]">
                                                                <span className="truncate text-[7px] sm:text-[9px] md:text-[12px] lg:text-sm text-black dark:text-gray-200">
                                                                    {selectedInstrument?.name ?? INSTRUMENTS[currentInstrumentIndex]?.name}
                                                                </span>
                                                            </div>
                                                            <FaChevronDown className="w-3 lg:w-4 h-3 lg:h-4 transform cursor-pointer hover:text-purple-300" />
                                                        </div>
                                                    </div>

                                                    <div className="inline-block mt-2 border rounded-lg border-secondary-light/30 dark:border-secondary-dark/20 ms-auto me-1 md600:me-2 lg:me-3 cursor-pointer" onClick={() => setPricingModalOpen(true)}>
                                                        <p className="text-secondary-light dark:text-secondary-dark text-[8px] md600:text-[10px] md:text-[12px] lg:text-[14px] px-2 md600:px-3 md:px-4 lg:px-5 2xl:px-6 py-1">Save Preset</p>
                                                    </div>
                                                </div>

                                                {/* Right Section */}
                                                    <div className="flex items-center space-x-6">
                                                        <div className="flex items-center justify-center px-2 md600:px-2 md600:pt-2 md600:pb-1 sm:gap-6 md600:gap-12 md:gap-16 lg:pt-4 lg:pb-2 lg:px-3 lg:gap-20 2xl:pt-5 2xl:pb-3 2xl:px-3 2xl:gap-24">
                                                            <div className="flex space-x-1 md600:space-x-2 lg:space-x-4 2xl:space-x-10">
                                                                <div className="flex flex-col items-center">
                                                                    <Knob label="Reverb" min={-135} max={135} defaultAngle={reverb} onChange={(value) => setReverb(value)} />
                                                                </div>

                                                                <div className="flex flex-col items-center">
                                                                    <Knob label="Pan" min={-135} max={135} defaultAngle={pan} onChange={(value) => setPan(value)} />
                                                                </div>

                                                                <div className="flex flex-col items-center hidden sm:block">
                                                                    <Knob label="Volume" min={-135} max={135} defaultAngle={volume} onChange={(value) => setVolume(value)} />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            {/* </div> */}

                                            {/* Main Content */}
                                            <div className="flex items-center justify-center md:px-12 py-2 md:py-4 2xl:py-4 bg-[#e7e7e7] dark:bg-[#242424]">
                                                <div className="flex items-center md:space-x-12 flex-col md:flex-row h-[194px] 2xl:h-[214px] overflow-auto">

                                                    {/* Vocal Cleanup Card */}
                                                    <div className="bg-white dark:bg-[#1F1F1F] backdrop-blur-sm border border-[#5d5d5d] rounded-xl p-2 2xl:p-5 w-64 sm:w-80 mb-3 md:mb-0">
                                                        <div className="flex items-center space-x-3 mb-3 lg:mb-4">
                                                            <div className="w-7 h-7 bg-[#525252] rounded-lg flex items-center justify-center">
                                                                <img src={subscription} alt="subscription" className="w-4 h-4" />
                                                            </div>
                                                            <h3 className="text-md lg:text-lg font-semibold text-black dark:text-white">Vocal Cleanup</h3>
                                                        </div>

                                                        <div className="flex flex-col items-center space-y-4 bg-[#e7e7e7] dark:bg-[#333333] rounded-xl py-3">
                                                            <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-purple-700 rounded-lg flex items-center justify-center">
                                                                <PiWaveformBold className='w-12 h-12' />
                                                            </div>
                                                            <p className="text-black dark:text-[#ffffff] text-sm text-center">
                                                                Select an audio region to apply
                                                            </p>
                                                        </div>
                                                    </div>

                                                    {/* Vocal Tuner Card */}
                                                    <div className="bg-white dark:bg-[#1F1F1F] backdrop-blur-sm border border-[#5d5d5d] rounded-xl p-2 2xl:p-5 w-72 sm:w-96 ms-0 mb-3 md:mb-0">
                                                        <div className="flex items-center justify-between mb-3 lg:mb-4">
                                                            <div className="flex items-center space-x-3">
                                                                <div className="w-7 h-7 bg-[#525252] rounded-lg flex items-center justify-center">
                                                                    <img src={subscription} alt="subscription" className="w-4 h-4" />
                                                                </div>
                                                                <h3 className="text-md lg:text-lg font-semibold text-black dark:text-white">Vocal Tuner</h3>
                                                            </div>

                                                            <div className="flex items-center space-x-4">
                                                                <span className="text-sm text-[#ffffff] text-black dark:text-white">Realtime</span>
                                                                {/* onClick={() => setIsRealtimeEnabled(!isRealtimeEnabled) */}
                                                                <div
                                                                    className={`w-8 h-5 rounded-full cursor-pointer transition-colors ${isRealtimeEnabled ? 'bg-purple-500' : 'bg-gray-600'
                                                                        }`}
                                                                    onClick={() => setPricingModalOpen(true)}>
                                                                    <div
                                                                        className={`w-3 h-3 bg-white rounded-full mt-1 transition-transform ${!isRealtimeEnabled ? 'ml-5' : 'ml-1'
                                                                            }`}
                                                                    ></div>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center space-x-8">
                                                            {/* Key Selection */}
                                                            <div>
                                                                <div className="flex justify-center items-center gap-1 mb-3 cursor-pointer" onClick={() => setPricingModalOpen(true)}>
                                                                    <span className="text-lg text-[#ffffff] text-black dark:text-white">Key</span>
                                                                    <span className="text-lg font-semibold text-black dark:text-white">{selectedKey}</span>
                                                                </div>

                                                                {/* Piano Keys */}
                                                                <div className="flex flex-col items-center space-y-2">
                                                                    {/* Top round notes */}
                                                                    <div className="flex space-x-2" onClick={() => setPricingModalOpen(true)}>
                                                                        {['C', 'D', 'E', 'F', 'G'].map((note, index) => (
                                                                            <div
                                                                                key={note}
                                                                                className={`w-5 h-5 rounded-full border-2 border-purple-500 flex items-center justify-center cursor-pointer transition-colors ${selectedKey === note ? 'bg-[#6a23a1]' : 'bg-transparent'}`}
                                                                                onClick={() => setSelectedKey(note)}
                                                                            ></div>
                                                                        ))}
                                                                    </div>

                                                                    {/* Bottom rounded rectangle notes */}
                                                                    <div className="flex space-x-2" onClick={() => setPricingModalOpen(true)}>
                                                                        {['A', 'B', 'C', 'D', 'E', 'F', 'G'].map((note, index) => (
                                                                            <div
                                                                                key={note}
                                                                                className={`w-5 h-10 rounded-full border-2 border-purple-500 flex items-center justify-center cursor-pointer transition-colors ${selectedKey === note ? 'bg-[#6a23a1]' : 'bg-transparent'}`}
                                                                                onClick={() => setSelectedKey(note)}
                                                                            ></div>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            {/* Amount Control */}
                                                            <div className='flex flex-col items-center'>
                                                                {/* Circular Progress */}
                                                                <div className="relative w-24 h-24 mx-auto mb-3 cursor-pointer" onClick={() => setPricingModalOpen(true)}>
                                                                    <div className="w-24 h-24 rounded-full border-4 border-purple-700"></div>
                                                                    <div
                                                                        className="absolute top-0 left-0 w-24 h-24 rounded-full border-4 border-purple-400 transform transition-transform"
                                                                        style={{
                                                                            background: `conic-gradient(from 0deg, transparent ${(100 - vocalTunerAmount) * 3.6}deg, rgb(168, 85, 247) ${(100 - vocalTunerAmount) * 3.6}deg)`,
                                                                            clipPath: 'circle(50% at 50% 50%)'
                                                                        }}
                                                                    ></div>

                                                                    {/* Waveform icon in center */}
                                                                    <div className="absolute inset-0 flex items-center justify-center text-black dark:text-white">
                                                                        <div className="space-y-0.5">
                                                                            <LiaWaveSquareSolid className='w-10 h-10' />
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                <div className="flex items-center justify-between">
                                                                    <span className="text-sm text-[#ffffff] text-black dark:text-white">Amount</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                </div>
                                            </div>
                                        </div>
                                    </>
                                )}

                                {activeTab === 'Effects' && (
                                    <>
                                    {/* Header */}
                                    <div className={`w-full overflow-x-auto transition-all duration-200 ${
                                        isDragOver ? "bg-[#409C9F] bg-opacity-10" : ""
                                        }`}
                                        onDragOver={(e) => {
                                        e.preventDefault();
                                        e.dataTransfer.dropEffect = 'copy';
                                        setIsDragOver(true);
                                        console.log('Drag over Effects tab');
                                        }}
                                        onDragLeave={(e) => {
                                        if (!e.currentTarget.contains(e.relatedTarget)) {
                                            setIsDragOver(false);
                                            console.log('Drag leave Effects tab');
                                        }
                                        }}
                                        onDrop={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        setIsDragOver(false);
                                        console.log('Drop on Effects tab');
                                        try {
                                            const effectData = JSON.parse(e.dataTransfer.getData('application/json'));
                                            console.log('Dropped effect data:', effectData);
                                            handleAddEffectFromLibrary(effectData);
                                        } catch (error) {
                                            console.error('Error parsing dropped effect data:', error);
                                        }
                                        }}
                                    >
                                        <div className="flex items-center justify-center p-2 sm:p-4 min-w-max bg-white dark:bg-[#1f1f1f]">
                                            <div className="flex gap-2 sm:gap-4 min-w-max">
                                            {activeEffects.map((effect) => (
                                                <div key={effect.instanceId} className="w-[150px] h-[238px] sm:w-[190px] sm:h-[250px] md600:w-[220px] md600:h-[250px] md:w-[230px] md:h-[280px] lg:w-[200px] lg:h-[300px] xl:w-[240px] xl:h-[310px] 2xl:w-[256px] 2xl:h-[330px] bg-gray-200 dark:bg-[#1a1a1a] rounded-xl overflow-hidden shadow-lg text-black dark:text-white flex flex-col shrink-0">
                                                <div className="flex-1 w-full flex items-center justify-center">
                                                    {effect.component ? (
                                                    <div className="w-full h-full flex items-center justify-center">
                                                        {React.createElement(effect.component)}
                                                    </div>
                                                    ) : (
                                                    <div className="flex items-center justify-center h-full">
                                                        <p className="text-gray-500 dark:text-gray-400 text-sm">No component available</p>
                                                    </div>
                                                    )}
                                                </div>
                                                </div>
                                            ))}
                                            {activeEffects.length < effectsLibrary?.length && (
                                                <div className="w-[150px] h-[238px] sm:w-[190px] sm:h-[250px] md600:w-[220px] md600:h-[250px] md:w-[230px] md:h-[280px] lg:w-[200px] lg:h-[300px] xl:w-[240px] xl:h-[310px] 2xl:w-[256px] 2xl:h-[330px] bg-gray-100 dark:bg-[#1a1a1a] rounded-xl flex flex-col items-center justify-center text-black dark:text-white cursor-pointer hover:bg-gray-200 dark:hover:bg-[#2a2a2a] transition-colors shrink-0 border-2 border-dashed border-gray-400 dark:border-gray-600"
                                                onClick={handlePlusButtonClick}
                                                onDragOver={(e) => {
                                                    e.preventDefault();
                                                    e.dataTransfer.dropEffect = 'copy';
                                                    e.currentTarget.style.borderColor = '#409C9F';
                                                    e.currentTarget.style.backgroundColor = '#2a2a2a';
                                                }}
                                                onDragLeave={(e) => {
                                                    e.currentTarget.style.borderColor = '#6B7280';
                                                    e.currentTarget.style.backgroundColor = '#1a1a1a';
                                                }}
                                                onDrop={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    e.currentTarget.style.borderColor = '#6B7280';
                                                    e.currentTarget.style.backgroundColor = '#1a1a1a';
                                                    try {
                                                    const effectData = JSON.parse(e.dataTransfer.getData('application/json'));
                                                    handleAddEffectFromLibrary(effectData);
                                                    } catch (error) {
                                                    console.error('Error parsing dropped effect data:', error);
                                                    }
                                                }}
                                                >
                                                <div className="w-14 h-14 bg-black dark:bg-white text-white dark:text-black rounded-full flex items-center justify-center text-2xl font-bold mb-4">+</div>
                                                <p className="text-center text-xs sm:text-sm leading-snug">Select From the<br />effects library</p>
                                                </div>
                                            )}
                                            {Array.from({ length: 4 - activeEffects.length - 1 }, (_, index) => (
                                                <div key={index} className="
                                                w-[150px] h-[238px] sm:w-[190px] sm:h-[250px] md600:w-[220px] md600:h-[250px]
                                                md:w-[230px] md:h-[280px] lg:w-[240px] lg:h-[300px] xl:w-[240px] xl:h-[310px] 
                                                2xl:w-[256px] 2xl:h-[330px]
                                                rounded-xl shrink-0 border-2 border-dashed
                                                bg-primary-light dark:bg-primary-dark 
                                                border-gray-300 dark:border-gray-600
                                                transition-colors
                                            "
                                            onDragOver={(e) => {
                                                e.preventDefault();
                                                e.dataTransfer.dropEffect = "copy";
                                                e.currentTarget.style.borderColor = "#409C9F";
                                                e.currentTarget.style.backgroundColor =
                                                document.documentElement.classList.contains("dark")
                                                    ? "#2a2a2a"
                                                    : "#f3f4f6"; // light gray for light mode
                                            }}
                                            onDragLeave={(e) => {
                                                e.currentTarget.style.borderColor =
                                                document.documentElement.classList.contains("dark")
                                                    ? "#4B5563"
                                                    : "#D1D5DB"; // gray-300 for light
                                                e.currentTarget.style.backgroundColor =
                                                document.documentElement.classList.contains("dark")
                                                    ? "#1a1a1a"
                                                    : "#ffffff";
                                            }}
                                            onDrop={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                e.currentTarget.style.borderColor =
                                                document.documentElement.classList.contains("dark")
                                                    ? "#4B5563"
                                                    : "#D1D5DB";
                                                e.currentTarget.style.backgroundColor =
                                                document.documentElement.classList.contains("dark")
                                                    ? "#1a1a1a"
                                                    : "#ffffff";
                                                    try {
                                                    const effectData = JSON.parse(e.dataTransfer.getData('application/json'));
                                                    handleAddEffectFromLibrary(effectData);
                                                    } catch (error) {
                                                    console.error('Error parsing dropped effect data:', error);
                                                    }
                                                }}
                                                ></div>
                                            ))}
                                            </div>
                                        </div>
                                    </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* AccessPopup for microphone permission */}
            {showAccessPopup && (
                <AccessPopup onClose={() => setShowAccessPopup(false)} />
            )}

            {/* Pricing Modal */}
            <PricingModel
                pricingModalOpen={pricingModalOpen}
                setPricingModalOpen={setPricingModalOpen}
            />
        </>
    );
};

export default VoiceAndMic;