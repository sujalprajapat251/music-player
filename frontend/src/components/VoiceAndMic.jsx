import React, { useState, useRef, useEffect } from 'react';
import { Mic, Play, Pause, Square } from 'lucide-react';
import { IoClose } from 'react-icons/io5';
import { useDispatch, useSelector } from 'react-redux';
import { setRecordingAudio } from '../Redux/Slice/studio.slice';

const VoiceAndMic = ({ onClose, onRecorded }) => {

    const dispatch = useDispatch();

    const [showOffcanvas1, setShowOffcanvas1] = useState(true);
    const [isRecording, setIsRecording] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [audioLevel, setAudioLevel] = useState(0);
    const [recordingTime, setRecordingTime] = useState(0);
    const [selectedInput, setSelectedInput] = useState('No Input selected');
    const [activeTab, setActiveTab] = useState('Audio');

    const getTrackType = useSelector((state) => state.studio.newtrackType);

    const mediaRecorderRef = useRef(null);
    const audioContextRef = useRef(null);
    const analyserRef = useRef(null);
    const streamRef = useRef(null);
    const timerRef = useRef(null);

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

            mediaRecorder.onstop = () => {
                const blobType = options.mimeType || 'audio/webm';
                const blob = new Blob(chunks, { type: blobType });
                const url = URL.createObjectURL(blob);
                console.log("ulr ::: > ", url)
                dispatch(setRecordingAudio(url));

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
            // Optional: surface a friendly message; adjust to your UI needs
            alert(error?.message || 'Unable to start recording.');
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

    return (
        <>
            {showOffcanvas1 === true && (
                <>
                    <div className="fixed z-[10] w-full h-full transition-transform left-0 right-0 translate-y-full bottom-[210px] sm:bottom-[260px] md600:bottom-[275px] md:bottom-[450px] lg:bottom-[455px] xl:bottom-[465px] 2xl:bottom-[516px]">
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
                                        {/* Header */}
                                        <div className="bg-gray-800 rounded-lg p-4 mb-4 h-full">
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

                                            {/* Input Selection */}
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

                                            {/* Transport Controls */}
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
        </>
    );
};

export default VoiceAndMic;