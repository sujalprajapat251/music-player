import React, { useState, useRef, useEffect } from 'react';
import { FaPowerOff } from 'react-icons/fa6';
import { IoClose } from 'react-icons/io5';
import { FaPlay, FaStop } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { removeEffect, updateEffectParameter, removeEffectFromTrack, updateTrackEffectParameter } from '../Redux/Slice/effects.slice';
import { selectStudioState } from '../Redux/rootReducer';

function polarToCartesian(cx, cy, r, angle) {
    const a = (angle - 90) * Math.PI / 180.0;
    return {
        x: cx + r * Math.cos(a),
        y: cy + r * Math.sin(a)
    };
}

// Helper to describe arc path
function describeArc(cx, cy, r, startAngle, endAngle) {
    const start = polarToCartesian(cx, cy, r, endAngle);
    const end = polarToCartesian(cx, cy, r, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
    return [
        "M", start.x, start.y,
        "A", r, r, 0, largeArcFlag, 0, end.x, end.y
    ].join(" ");
}



function BadgeTooltip({ value, visible }) {
    if (!visible) return null;

    // Round the angle value to nearest integer
    const roundedValue = Math.round(value);

    return (
        <div
            className="absolute -top-6 right-1 bg-[#8F7CFD99] text-white text-xs px-2 py-1 rounded-md shadow-lg pointer-events-none z-10 font-medium"
            style={{
                minWidth: '32px',
                textAlign: 'center'
            }}
        >
            {roundedValue}
        </div>
    );
}

function Knob({ label = "Bite", min = -135, max = 135, defaultAngle, onValueChange, parameterIndex }) {
    const [angle, setAngle] = useState(defaultAngle ?? min);
    const [showTooltip, setShowTooltip] = useState(false);
    const knobRef = useRef(null);
    const dragging = useRef(false);
    const lastY = useRef(0);

    // Tailwind-consistent responsive sizes
    const getResponsiveSize = () => {
        if (typeof window !== 'undefined') {
            if (window.innerWidth >= 1440) return 66; // 2xl
            if (window.innerWidth >= 1280) return 54; // xl  
            if (window.innerWidth >= 601) return 48;  // md600
            if (window.innerWidth >= 425) return 36;  // sm
            return 34; // xs (mobile)
        }
        return 56;
    };

    const [size, setSize] = useState(getResponsiveSize());

    useEffect(() => {
        const handleResize = () => setSize(getResponsiveSize());
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Update angle when defaultAngle prop changes (important for parameter persistence)
    useEffect(() => {
        if (defaultAngle !== undefined) {
            setAngle(defaultAngle);
        }
    }, [defaultAngle]);

    // Tailwind-consistent responsive sizes
    const getResponsiveStroke = () => {
        if (typeof window !== 'undefined') {
            if (window.innerWidth >= 768) return 3;
            if (window.innerWidth >= 768) return 3;  // md
            // if (window.innerWidth >= 640) return 40;  // sm
            return 2; // xs (mobile)
        }
        return 56;
    };

    const [stroke, setStroke] = useState(getResponsiveStroke());

    useEffect(() => {
        const handleResizeStroke = () => setStroke(getResponsiveStroke());
        window.addEventListener('resize', handleResizeStroke);
        return () => window.removeEventListener('resize', handleResizeStroke);
    }, []);


    const radius = (size - stroke) / 2;
    const center = size / 2;


    const onMouseDown = (e) => {
        dragging.current = true;
        lastY.current = e.clientY;
        setShowTooltip(true);
        document.addEventListener("mousemove", onMouseMove);
        document.addEventListener("mouseup", onMouseUp);
    };

    const onMouseMove = (e) => {
        if (!dragging.current) return;
        const deltaY = lastY.current - e.clientY; // up is negative, down is positive
        lastY.current = e.clientY;
        setAngle((prev) => {
            let next = prev + deltaY * 1.5; // adjust sensitivity as needed
            next = Math.max(min, Math.min(max, next));
            
            // Call the callback to update Redux
            if (onValueChange) {
                onValueChange(parameterIndex, next);
            }
            
            return next;
        });
    };

    const onMouseUp = () => {
        dragging.current = false;
        setShowTooltip(false);
        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", onMouseUp);
    };

    const onMouseEnter = () => {
        if (!dragging.current) {
            setShowTooltip(true);
        }
    };

    const onMouseLeave = () => {
        if (!dragging.current) {
            setShowTooltip(false);
        }
    };


    const arcStart = min; // -135
    const valueAngle = angle; // current angle
    const fgArc = describeArc(center, center, radius, arcStart, valueAngle);

    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                // marginTop: 40,
            }}
        >
            <div
                ref={knobRef}
                style={{
                    width: size,
                    height: size,
                    position: "relative",
                    cursor: "pointer",
                }}
                onMouseDown={onMouseDown}
            >
                <svg width={size} height={size}>
                    {/* Full background circle */}
                    <circle
                        cx={center}
                        cy={center}
                        r={radius}
                        stroke="#444"
                        strokeWidth={stroke}
                        fill="#1F1F1F"
                    />
                    {/* Colored arc (top half, up to value) */}
                    <path
                        d={fgArc}
                        stroke="#bbb"
                        strokeWidth={stroke}
                        fill="#1F1F1F"
                        strokeLinecap="round"
                    />
                </svg>
                {/* Indicator line */}
                <div
                    className={`absolute top-1.5 left-1/2 w-0.5 h-2 md600:h-3 xl:h-5 2xl:h-6 bg-gray-400 rounded-sm -translate-x-1/2 origin-bottom`}
                    style={{
                        transform: `translateX(-50%) rotate(${angle}deg)`,
                    }}
                />
                <BadgeTooltip value={angle} visible={showTooltip} />
            </div>
            <div className='text-[8px] md600:text-[10px] md:text-[12px] 2xl:text-[16px] mt-1 items-center text-[#aaa]'
                style={{
                    fontFamily: "sans-serif"
                }}
            >
                {label}
            </div>
        </div>
    );
}

function Knob1({ label = "Bite", min = -135, max = 135, defaultAngle, onValueChange, parameterIndex }) {
    const [angle, setAngle] = useState(defaultAngle ?? min);
    const [showTooltip, setShowTooltip] = useState(false);
    const knobRef = useRef(null);
    const dragging = useRef(false);
    const lastY = useRef(0);

    // Tailwind-consistent responsive sizes
    const getResponsiveSize = () => {
        if (typeof window !== 'undefined') {
            if (window.innerWidth >= 1440) return 50; // 2xl
            if (window.innerWidth >= 1280) return 40; // xl  
            // md
            if (window.innerWidth >= 601) return 32;  // sm
            if (window.innerWidth >= 425) return 28;  // sm
            return 24; // xs (mobile)
        }
        return 56;
    };

    const [size, setSize] = useState(getResponsiveSize());

    useEffect(() => {
        const handleResize = () => setSize(getResponsiveSize());
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Update angle when defaultAngle prop changes (important for parameter persistence)
    useEffect(() => {
        if (defaultAngle !== undefined) {
            setAngle(defaultAngle);
        }
    }, [defaultAngle]);

    // Tailwind-consistent responsive sizes
    const getResponsiveStroke = () => {
        if (typeof window !== 'undefined') {
            if (window.innerWidth >= 1440) return 3;
            if (window.innerWidth >= 768) return 2;  // md
            // if (window.innerWidth >= 640) return 40;  // sm
            return 2; // xs (mobile)
        }
        return 56;
    };

    const [stroke, setStroke] = useState(getResponsiveStroke());

    useEffect(() => {
        const handleResizeStroke = () => setStroke(getResponsiveStroke());
        window.addEventListener('resize', handleResizeStroke);
        return () => window.removeEventListener('resize', handleResizeStroke);
    }, []);


    const radius = (size - stroke) / 2;
    const center = size / 2;


    const onMouseDown = (e) => {
        dragging.current = true;
        lastY.current = e.clientY;
        setShowTooltip(true);
        document.addEventListener("mousemove", onMouseMove);
        document.addEventListener("mouseup", onMouseUp);
    };

    const onMouseMove = (e) => {
        if (!dragging.current) return;
        const deltaY = lastY.current - e.clientY; // up is negative, down is positive
        lastY.current = e.clientY;
        setAngle((prev) => {
            let next = prev + deltaY * 1.5; // adjust sensitivity as needed
            next = Math.max(min, Math.min(max, next));
            
            // Call the callback to update Redux
            if (onValueChange) {
                onValueChange(parameterIndex, next);
            }
            
            return next;
        });
    };

    const onMouseUp = () => {
        dragging.current = false;
        setShowTooltip(false);
        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", onMouseUp);
    };

    const onMouseEnter = () => {
        if (!dragging.current) {
            setShowTooltip(true);
        }
    };

    const onMouseLeave = () => {
        if (!dragging.current) {
            setShowTooltip(false);
        }
    };

    const arcStart = min; // -135
    const valueAngle = angle; // current angle
    const fgArc = describeArc(center, center, radius, arcStart, valueAngle);

    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                // marginTop: 40,
            }}
        >
            <div
                ref={knobRef}
                style={{
                    width: size,
                    height: size,
                    position: "relative",
                    cursor: "pointer",
                }}
                onMouseDown={onMouseDown}
            >
                <svg width={size} height={size}>
                    {/* Full background circle */}
                    <circle
                        cx={center}
                        cy={center}
                        r={radius}
                        stroke="#444"
                        strokeWidth={stroke}
                        fill="#1F1F1F"
                    />
                    {/* Colored arc (top half, up to value) */}
                    <path
                        d={fgArc}
                        stroke="#bbb"
                        strokeWidth={stroke}
                        fill="#1F1F1F"
                        strokeLinecap="round"
                    />
                </svg>
                {/* Indicator line */}
                <div
                    className={`absolute top-1.5 left-1/2 w-0.5 h-2 md600:h-2 lg:h-3 bg-gray-400 rounded-sm -translate-x-1/2 origin-bottom`}

                    style={{
                        transform: `translateX(-50%) rotate(${angle}deg)`,
                    }}
                />
                <BadgeTooltip value={angle} visible={showTooltip} />
            </div>
            <div className='text-[8px] md600:text-[10px] md:text-[12px] 2xl:text-[16px] mt-1 items-center text-[#aaa]'
                style={{
                    fontFamily: "sans-serif"
                }}
            >
                {label}
            </div>
        </div>
    );
}

const Fuzz = () => {

    const [isPoweredOn, setIsPoweredOn] = useState(true);
    const [isPlaying, setIsPlaying] = useState(false);
    const [audioContext, setAudioContext] = useState(null);
    const [oscillator, setOscillator] = useState(null);
    const [gainNode, setGainNode] = useState(null);
    const [filterNode, setFilterNode] = useState(null);

    const handlePowerToggle = () => {
        setIsPoweredOn(!isPoweredOn);
    };

    const dispatch = useDispatch();
    const { trackEffects, selectedTrackId } = useSelector((state) => state.effects);
    const currentTrackId = useSelector((state) => selectStudioState(state)?.currentTrackId);
    const { activeEffects } = useSelector((state) => state.effects);

    // Use selectedTrackId from effects or fall back to currentTrackId from studio
    const activeTrackId = selectedTrackId || currentTrackId;

    // Get effects for the currently selected track
    const trackSpecificEffects = trackEffects[activeTrackId] || [];
    // Get the current effect's instanceId from track-specific effects or fallback to activeEffects
    const currentEffect = trackSpecificEffects.find(effect =>
        effect.name === "Fuzz"
    ) || activeEffects.find(effect =>
        effect.name === "Fuzz"
    );
    const currentInstanceId = currentEffect?.instanceId;

    const handleRemoveEffect = (instanceId) => {
        if (!instanceId) return;
        
        if (activeTrackId && trackSpecificEffects.some(effect => effect.instanceId === instanceId)) {
            // Remove from track-specific effects
            dispatch(removeEffectFromTrack({ trackId: activeTrackId, instanceId }));
        } else if (activeEffects.some(effect => effect.instanceId === instanceId)) {
            // Remove from general active effects
            dispatch(removeEffect(instanceId));
        }
    };

    // Handle knob value changes for both track-specific and global effects
    const handleKnobChange = (parameterIndex, value) => {
        if (!currentInstanceId) return;
        
        // First try updating track-specific effects
        if (activeTrackId && trackSpecificEffects.some(effect => effect.instanceId === currentInstanceId)) {
            dispatch(updateTrackEffectParameter({
                trackId: activeTrackId,
                instanceId: currentInstanceId,
                parameterIndex: parameterIndex,
                value: value
            }));
        } 
        // Fall back to updating global effects
        else if (activeEffects.some(effect => effect.instanceId === currentInstanceId)) {
            dispatch(updateEffectParameter({
                instanceId: currentInstanceId,
                parameterIndex: parameterIndex,
                value: value
            }));

            const storageKey = `fuzz_${currentInstanceId}_values`;
            const existingValues = JSON.parse(localStorage.getItem(storageKey) || '[]');
            existingValues[parameterIndex] = value;
            localStorage.setItem(storageKey, JSON.stringify(existingValues));

            // Update sound parameters in real-time if playing
            if (isPlaying && audioContext) {
                updateSoundParameters();
            }
        }
    };

    // Generate sound based on Fuzz parameters
    const generateSound = async () => {
        if (!audioContext || !isPoweredOn) return;

        try {
            // Resume audio context if suspended
            if (audioContext.state === 'suspended') {
                await audioContext.resume();
            }

            // Stop existing sound
            stopSound();

            // Get current parameters
            const grain = getCurrentParameterValue(0);
            const bite = getCurrentParameterValue(1);
            const lowCut = getCurrentParameterValue(2);

            // Create oscillator
            const osc = audioContext.createOscillator();
            osc.type = 'sawtooth';
            
            // Calculate frequency based on grain parameter
            const baseFreq = 220; // A3 note
            const freqModulation = ((grain + 135) / 270) * 400; // 0-400 Hz modulation
            const frequency = baseFreq + freqModulation;
            osc.frequency.setValueAtTime(frequency, audioContext.currentTime);

            // Create gain node for volume control
            const gain = audioContext.createGain();
            const volume = 0.3 + ((grain + 135) / 270) * 0.2; // 0.3 to 0.5
            gain.gain.setValueAtTime(volume, audioContext.currentTime);

            // Create filter for bite parameter
            const filter = audioContext.createBiquadFilter();
            filter.type = 'lowpass';
            const filterFreq = 200 + ((bite + 135) / 270) * 2000; // 200-2200 Hz
            filter.frequency.setValueAtTime(filterFreq, audioContext.currentTime);
            filter.Q.setValueAtTime(1 + ((bite + 135) / 270) * 5, audioContext.currentTime);

            // Create high-pass filter for low cut
            const highPass = audioContext.createBiquadFilter();
            highPass.type = 'highpass';
            const highPassFreq = 80 + ((lowCut + 135) / 270) * 200; // 80-280 Hz
            highPass.frequency.setValueAtTime(highPassFreq, audioContext.currentTime);

            // Create distortion for fuzz effect
            const distortion = audioContext.createWaveShaper();
            const drive = 1 + ((grain + 135) / 270) * 20; // 1-21 drive
            const curve = createDistortionCurve(drive);
            distortion.curve = curve;
            distortion.oversample = '4x';

            // Connect audio nodes
            osc.connect(gain);
            gain.connect(highPass);
            highPass.connect(filter);
            filter.connect(distortion);
            distortion.connect(audioContext.destination);

            // Start oscillator
            osc.start(audioContext.currentTime);

            // Store references
            setOscillator(osc);
            setGainNode(gain);
            setFilterNode(filter);
            setIsPlaying(true);

        } catch (error) {
            console.error('Error generating sound:', error);
        }
    };

    // Stop sound generation
    const stopSound = () => {
        if (oscillator) {
            try {
                oscillator.stop();
                oscillator.disconnect();
            } catch (e) {
                // Oscillator might already be stopped
            }
            setOscillator(null);
        }
        if (gainNode) {
            gainNode.disconnect();
            setGainNode(null);
        }
        if (filterNode) {
            filterNode.disconnect();
            setFilterNode(null);
        }
        setIsPlaying(false);
    };

    // Update sound parameters in real-time
    const updateSoundParameters = () => {
        if (!oscillator || !gainNode || !filterNode || !audioContext) return;

        const grain = getCurrentParameterValue(0);
        const bite = getCurrentParameterValue(1);
        const lowCut = getCurrentParameterValue(2);

        const now = audioContext.currentTime;

        // Update frequency based on grain
        const baseFreq = 220;
        const freqModulation = ((grain + 135) / 270) * 400;
        const frequency = baseFreq + freqModulation;
        oscillator.frequency.setValueAtTime(frequency, now);

        // Update volume based on grain
        const volume = 0.3 + ((grain + 135) / 270) * 0.2;
        gainNode.gain.setValueAtTime(volume, now);

        // Update filter frequency based on bite
        const filterFreq = 200 + ((bite + 135) / 270) * 2000;
        filterNode.frequency.setValueAtTime(filterFreq, now);
        filterNode.Q.setValueAtTime(1 + ((bite + 135) / 270) * 5, now);
    };

    // Create distortion curve for fuzz effect
    const createDistortionCurve = (drive) => {
        const samples = 44100;
        const curve = new Float32Array(samples);
        const driveValue = Math.max(1, drive);

        for (let i = 0; i < samples; i++) {
            const x = (i * 2) / samples - 1;
            curve[i] = Math.tanh(x * driveValue);
        }

        return curve;
    };

    // Get current parameter values for initialization
    const getCurrentParameterValue = (parameterIndex) => {
        if (currentEffect && currentEffect.parameters && currentEffect.parameters[parameterIndex]) {
            return currentEffect.parameters[parameterIndex].value;
        }
        if (currentInstanceId) {
            const savedValues = localStorage.getItem(`fuzz_${currentInstanceId}_values`);
            if (savedValues) {
                try {
                    const parsedValues = JSON.parse(savedValues);
                    if (parsedValues[parameterIndex] !== null && parsedValues[parameterIndex] !== undefined) {
                        return parsedValues[parameterIndex];
                    }
                } catch (error) {
                    console.error('Error parsing saved Fuzz values:', error);
                }
            }
        }
        // Return default values based on parameter index
        switch (parameterIndex) {
            case 0: return 0;   // Grain (start at 0 for subtle effect)
            case 1: return 45;  // Bite (moderate high-frequency emphasis)
            case 2: return 90;  // Low Cut (higher cut frequency)
            default: return 0;
        }
    };

    // Debug logging
    useEffect(() => {
        console.log('🎛️ Fuzz Component - Active Track ID:', activeTrackId);
        console.log('🎛️ Fuzz Component - Track Effects:', trackSpecificEffects);
        console.log('🎛️ Fuzz Component - Current Effect:', currentEffect);
        console.log('🎛️ Fuzz Component - Instance ID:', currentInstanceId);
    }, [activeTrackId, trackSpecificEffects, currentEffect, currentInstanceId]);

    return (
        <div className='bg-[#141414]'>
            <div className={`flex justify-between items-center w-[150px] h-[50px] sm:w-[190px] sm:h-[50px] md600:w-[220px] md:w-[230px] md:h-[55px] lg:w-[240px] xl:h-[60px] 2xl:w-[256px] 2xl:h-[64px] rounded-t-lg px-2 md:px-3 lg:px-8 xl:px-3 transition-colors duration-300 ${isPoweredOn ? 'bg-[#8F7CFD]' : 'bg-gray-600'}`}>
                <FaPowerOff
                    className={`text-[16px] md600:text-[20px] cursor-pointer transition-colors duration-200 ${isPoweredOn ? 'text-white hover:text-green-400' : 'text-red-500 hover:text-red-400'}`}
                    onClick={handlePowerToggle}
                />
                <div className="flex flex-col items-center">
                    <p className='text-white text-[12px] md600:text-[16px]'>Fuzz</p>
                    <button
                        onClick={isPlaying ? stopSound : generateSound}
                        disabled={!isPoweredOn}
                        className={`text-[8px] md600:text-[10px] px-2 py-1 rounded transition-colors flex items-center gap-1 ${
                            isPlaying 
                                ? 'bg-red-500 text-white hover:bg-red-600' 
                                : isPoweredOn 
                                    ? 'bg-green-500 text-white hover:bg-green-600' 
                                    : 'bg-gray-500 text-gray-300 cursor-not-allowed'
                        }`}
                        title={isPlaying ? 'Stop Sound' : 'Generate Sound with Fuzz'}
                    >
                        {isPlaying ? <FaStop /> : <FaPlay />}
                        {isPlaying ? 'STOP' : 'PLAY'}
                    </button>
                </div>
                <IoClose
                    className={`text-[16px] md600:text-[20px] ${isPoweredOn ? 'text-white hover:text-green-400' : 'text-white hover:text-red-500'}`}
                    onClick={() => handleRemoveEffect(currentInstanceId)}
                />
            </div>
            <div className={`w-[150px] h-[190px] sm:w-[190px] sm:h-[213px] md600:w-[220px] md600:h-[210px] md:w-[230px] md:h-[265px] lg:w-[240px] lg:h-[282px] xl:w-[240px] xl:h-[285px] 2xl:w-[256px] 2xl:h-[300px] bg-[#302f2f] relative transition-opacity duration-300 ${!isPoweredOn ? 'opacity-50 pointer-events-none' : ''}`}>
                {/* Sound Playing Indicator */}
                {isPlaying && (
                    <div className="absolute top-2 right-2 w-3 h-3 bg-green-400 rounded-full animate-pulse flex items-center justify-center" 
                         title="Sound generation in progress">
                        <div className="w-1 h-1 bg-white rounded-full"></div>
                    </div>
                )}
                {/* Drive Knob - Top Left */}
                <div className="absolute top-[20px] left-[30px] sm:top-[30px] sm:left-[40px] md600:top-[25px] md600:left-[40px] md:top-[25px] md:left-[40px]">
                    <Knob 
                        label="Grain" 
                        min={-135} 
                        max={135} 
                        defaultAngle={getCurrentParameterValue(0)}
                        onValueChange={handleKnobChange}
                        parameterIndex={0}
                    />
                </div>

                {/* Tone Knob - Top Right */}
                <div className="absolute top-[50px] right-[30px] sm:top-[60px] sm:right-[50px] md600:top-[65px] md600:right-[45px] md:top-[80px] md:right-[35px]">
                    <Knob 
                        label="Bite" 
                        min={-135} 
                        max={135} 
                        defaultAngle={getCurrentParameterValue(1)}
                        onValueChange={handleKnobChange}
                        parameterIndex={1}
                    />
                </div>

                {/* Mix Knob - Bottom Center */}
                <div className="absolute bottom-[15px] left-[30px] sm:bottom-[25px] sm:left-[40px] md600:left-[40px] md600:bottom-[45px] md:left-[40px] md:bottom-[73px]">
                    <Knob1 
                        label="Low Cut" 
                        min={-135} 
                        max={135} 
                        defaultAngle={getCurrentParameterValue(2)}
                        onValueChange={handleKnobChange}
                        parameterIndex={2}
                    />
                </div>
            </div>
        </div>
    )
}

export default Fuzz
