import React, { useState, useRef, useEffect } from 'react';
import { Mic, Play, Pause, Square } from 'lucide-react';
import { IoClose } from 'react-icons/io5';
import { useDispatch, useSelector } from 'react-redux';
import { setRecordingAudio, addAudioClipToTrack, updateAudioClip } from '../Redux/Slice/studio.slice';
import AccessPopup from './AccessPopup';
import { selectStudioState } from '../Redux/rootReducer';
import { BASE_URL } from '../Utils/baseUrl';
import { IoVolumeHighOutline } from "react-icons/io5";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import subscription from "../Images/subscriptionIcon.svg";
import { LuHeadphoneOff } from "react-icons/lu";
import { PiWaveformBold } from "react-icons/pi";
import PricingModel from './PricingModel';
import { LiaWaveSquareSolid } from "react-icons/lia";


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

const VoiceAndMic = ({ onClose, onRecorded }) => {

    const dispatch = useDispatch();
    const [showOffcanvas1, setShowOffcanvas1] = useState(true);
    const [isRecording, setIsRecording] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [audioLevel, setAudioLevel] = useState(0);
    const [recordingTime, setRecordingTime] = useState(0);
    const [selectedInput, setSelectedInput] = useState('No Input selected');
    const [activeTab, setActiveTab] = useState('Audio');
    const [showAccessPopup, setShowAccessPopup] = useState(false);
    const [volume, setVolume] = useState(90);
    const [reverb, setReverb] = useState(-90);
    const [pan, setPan] = useState(0);
    const [pricingModalOpen, setPricingModalOpen] = useState(false);


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

    const keyOptions = ['DbM', 'DM', 'EbM', 'EM', 'FM', 'F#M', 'GM', 'AbM', 'AM', 'BbM', 'BM', 'CM'];

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

    return (
        <>
            {showOffcanvas1 === true && (
                <>
                    <div className="fixed z-[12] w-full h-full transition-transform left-0 right-0 translate-y-full bottom-[210px] sm:bottom-[260px] md600:bottom-[275px] md:bottom-[450px] lg:bottom-[455px] xl:bottom-[465px] 2xl:bottom-[516px]">
                        <div className="border-b border-[#FFFFFF1A] h-full">
                            <div className=" bg-[#1F1F1F] flex items-center px-1 md600:px-2 md600:pt-2 lg:px-3 lg:pt-3">
                                <div>
                                    <IoClose className='text-[10px] sm:text-[12px] md600:text-[14px] md:text-[16px] lg:text-[18px] 2xl:text-[20px] text-[#FFFFFF99] cursor-pointer justify-start' onClick={() => {
                                        setShowOffcanvas1(false);
                                        onClose && onClose();
                                    }} />
                                </div>
                            </div>
                            <div className="bg-[#1F1F1F] flex space-x-2 sm:space-x-3 px-1 md600:space-x-4 md600:px-2 lg:space-x-6 2xl:space-x-8 justify-center lg:px-3">
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
                                            className={`text-[8px] md600:text-[10px] md:text-[12px] lg:text-[14px] 2xl:text-[16px] font-medium transition-colors ${activeTab === tab ? 'text-white border-b-2 border-white ' : 'text-gray-400 hover:text-white'}`}>
                                            {tab}
                                        </button>
                                    ))}
                            </div>
                            <div className="h-full">
                                {activeTab === 'Audio' && (
                                    <>
                                        {/* <div>
                                            <div className=" bg-[#1F1F1F] flex items-center justify-center pt-1 pb-1 px-2 md600:px-2 md600:pt-2 md600:pb-1 sm:gap-6 md600:gap-12 md:gap-16 lg:pt-4 lg:pb-2 lg:px-3 lg:gap-20 2xl:pt-5 2xl:pb-3 2xl:px-3 2xl:gap-24">
                                                <div className="flex space-x-1 md600:space-x-2 lg:space-x-4 2xl:space-x-10">
                                                    <div className="flex flex-col items-center">
                                                        <Knob label="Reverb" min={-135} max={135} defaultAngle={reverb} onChange={(value) => setReverb(value)} />
                                                    </div>

                                                    <div className="flex flex-col items-center">
                                                        <Knob label="Pan" min={-135} max={135} defaultAngle={pan} onChange={(value) => setPan(value)} />
                                                    </div>

                                                    <div className="flex flex-col items-center">
                                                        <Knob label="Volume" min={-135} max={135} defaultAngle={volume} onChange={(value) => setVolume(value)} />
                                                    </div>
                                                </div>
                                            </div>
                                        </div> */}

                                        {/* Header */}
                                        {/* <div className="bg-gray-800 rounded-lg p-4 mb-4 h-full">
                                            <div className="flex items-center justify-between mb-4">
                                                <div className="flex items-center space-x-4">
                                                    <div className="flex items-center space-x-2">
                                                        <Mic className="text-purple-400" size={24} />
                                                        <span className="text-xl font-semibold">Recording Studio</span>
                                                    </div>
                                                </div>

                                                <div className="flex items-center space-x-4">
                                                    <AudioLevelBars />
                                                    <span className="text-sm text-gray-400">{formatTime(recordingTime)}</span>
                                                </div>
                                            </div>

                                            
                                            <div className="flex items-center space-x-4 mb-4">
                                                <select
                                                    className="bg-gray-700 px-3 py-2 rounded text-sm"
                                                    value={selectedInput}
                                                    onChange={(e) => setSelectedInput(e.target.value)}
                                                >
                                                    <option>No Input selected</option>
                                                    <option>Default Microphone</option>
                                                    <option>External Microphone</option>
                                                </select>

                                                <button className="bg-purple-600 px-4 py-2 rounded text-sm hover:bg-purple-700 transition-colors">
                                                    Calibrate
                                                </button>

                                                <span className="text-sm text-gray-400">Monitoring:</span>
                                            </div>

                                            
                                            <div className="flex items-center space-x-2">
                                                <button
                                                    onClick={isRecording ? stopRecording : startRecording}
                                                    className={`p-3 rounded-full transition-colors ${isRecording
                                                        ? 'bg-red-600 hover:bg-red-700'
                                                        : 'bg-purple-600 hover:bg-purple-700'
                                                        }`}
                                                >
                                                    {isRecording ? <Square size={20} /> : <Mic size={20} />}
                                                </button>

                                                <button
                                                    className="p-3 rounded-full bg-gray-700 hover:bg-gray-600 transition-colors"
                                                    onClick={() => setIsPlaying(!isPlaying)}
                                                >
                                                    {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                                                </button>
                                            </div>
                                        </div> */}



                                        <div className="min-h-screen text-white">
                                            {/* Header */}
                                            <div className="flex items-center justify-between px-6 bg-[#1f1f1f]">
                                                {/* Left Section */}
                                                <div className="flex items-center space-x-4">
                                                    <div className="flex items-center space-x-2">
                                                        <Mic className="w-4 h-4" />
                                                        <span className="text-sm">External Microphone Synpath...</span>
                                                        <FaChevronLeft className="w-4 h-4 transform rotate-90" />
                                                    </div>

                                                    <div className="flex items-center space-x-2">
                                                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                                                        <span className="text-sm">Calibrate</span>
                                                    </div>

                                                    <div className="flex items-center space-x-2">
                                                        <span className="text-sm">Monitoring:</span>
                                                        <div className="w-8 h-8 bg-[#525252] rounded-lg flex items-center justify-center">
                                                            <LuHeadphoneOff className="w-4 h-4" />
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Center Section */}
                                                <div className="flex items-center space-x-2 border border-[#5d5d5d] px-6 py-3">
                                                    <div className="flex items-center">
                                                        <FaChevronLeft className="w-4 h-4 cursor-pointer hover:text-purple-300" />
                                                        <FaChevronRight className="w-4 h-4 cursor-pointer hover:text-purple-300" />
                                                    </div>
                                                    <div className="flex items-center gap-5">
                                                        <span className="text-sm">Blues</span>
                                                        <FaChevronLeft className="w-4 h-4 transform rotate-90 cursor-pointer hover:text-purple-300" />
                                                    </div>
                                                </div>

                                                {/* Right Section */}
                                                <div className="flex items-center space-x-6">
                                                    <div className="border rounded-lg border-secondary-light/10 dark:border-secondary-dark/10 ms-auto me-1 md600:me-2 lg:me-3 cursor-pointer" onClick={() => setPricingModalOpen(true)}>
                                                        <p className="text-secondary-light dark:text-secondary-dark text-[8px] md600:text-[10px] md:text-[12px] lg:text-[14px] px-2 md600:px-3 md:px-4 lg:px-5 2xl:px-6 py-1">Save Preset</p>
                                                    </div>

                                                    <div className="flex items-center space-x-6">
                                                        <div className="flex items-center justify-center px-2 md600:px-2 md600:pt-2 md600:pb-1 sm:gap-6 md600:gap-12 md:gap-16 lg:pt-4 lg:pb-2 lg:px-3 lg:gap-20 2xl:pt-5 2xl:pb-3 2xl:px-3 2xl:gap-24">
                                                            <div className="flex space-x-1 md600:space-x-2 lg:space-x-4 2xl:space-x-10">
                                                                <div className="flex flex-col items-center">
                                                                    <Knob label="Reverb" min={-135} max={135} defaultAngle={reverb} onChange={(value) => setReverb(value)} />
                                                                </div>

                                                                <div className="flex flex-col items-center">
                                                                    <Knob label="Pan" min={-135} max={135} defaultAngle={pan} onChange={(value) => setPan(value)} />
                                                                </div>

                                                                <div className="flex flex-col items-center">
                                                                    <Knob label="Volume" min={-135} max={135} defaultAngle={volume} onChange={(value) => setVolume(value)} />
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="flex flex-col items-center cursor-pointer hover:text-purple-300">
                                                            <IoVolumeHighOutline className="w-8 h-8 mb-1" />
                                                            <span className="text-xs">Volume</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Main Content */}
                                            <div className="flex items-center justify-center px-12 py-8 bg-[#242424]">
                                                <div className="flex items-center space-x-12">

                                                    {/* Vocal Cleanup Card */}
                                                    <div className="bg-[#1f1f1f] backdrop-blur-sm border border-[#5d5d5d] rounded-xl p-6 w-80">
                                                        <div className="flex items-center space-x-3 mb-6">
                                                            <div className="w-8 h-8 bg-[#525252] rounded-lg flex items-center justify-center">
                                                                <img src={subscription} alt="subscription" className="w-4 h-4" />
                                                            </div>
                                                            <h3 className="text-xl font-semibold">Vocal Cleanup</h3>
                                                        </div>

                                                        <div className="flex flex-col items-center space-y-4 bg-[#333333] rounded-xl py-3">
                                                            <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-purple-700 rounded-lg flex items-center justify-center">
                                                                <PiWaveformBold className='w-12 h-12' />
                                                            </div>
                                                            <p className="text-[#ffffff] text-sm text-center">
                                                                Select an audio region to apply
                                                            </p>
                                                        </div>
                                                    </div>

                                                    {/* Vocal Tuner Card */}
                                                    <div className="bg-[#1f1f1f] backdrop-blur-sm border border-[#5d5d5d] rounded-xl p-6 w-90">
                                                        <div className="flex items-center justify-between mb-6">
                                                            <div className="flex items-center space-x-3">
                                                                <div className="w-8 h-8 bg-[#525252] rounded-lg flex items-center justify-center">
                                                                    <img src={subscription} alt="subscription" className="w-4 h-4" />
                                                                </div>
                                                                <h3 className="text-xl font-semibold">Vocal Tuner</h3>
                                                            </div>

                                                            <div className="flex items-center space-x-4">
                                                                <span className="text-sm text-[#ffffff]">Realtime</span>
                                                                {/* onClick={() => setIsRealtimeEnabled(!isRealtimeEnabled) */}
                                                                <div
                                                                    className={`w-10 h-6 rounded-full cursor-pointer transition-colors ${isRealtimeEnabled ? 'bg-purple-500' : 'bg-gray-600'
                                                                        }`}
                                                                    onClick={() => setPricingModalOpen(true)}>
                                                                    <div
                                                                        className={`w-4 h-4 bg-white rounded-full mt-1 transition-transform ${!isRealtimeEnabled ? 'ml-5' : 'ml-1'
                                                                            }`}
                                                                    ></div>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center space-x-8">
                                                            {/* Key Selection */}
                                                            <div>
                                                                <div className="flex justify-center items-center gap-1 mb-3 cursor-pointer" onClick={() => setPricingModalOpen(true)}>
                                                                    <span className="text-lg text-[#ffffff]">Key</span>
                                                                    <span className="text-lg font-semibold">{selectedKey}</span>
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
                                                                    <div className="absolute inset-0 flex items-center justify-center">
                                                                        <div className="space-y-0.5">
                                                                            <LiaWaveSquareSolid className='w-10 h-10' />
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                <div className="flex items-center justify-between">
                                                                    <span className="text-sm text-[#ffffff]">Amount</span>
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
                                        <div className="bg-gray-800 rounded-lg p-4 mb-4 h-full">
                                            <div className="flex items-center justify-between mb-4">
                                                <div className="flex items-center space-x-4">
                                                    <div className="flex items-center space-x-2">
                                                        <span className="text-xl font-semibold">Effects Section</span>
                                                    </div>
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