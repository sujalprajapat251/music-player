import React, { useEffect, useRef, useState } from 'react';
import { FaPowerOff } from 'react-icons/fa6';
import { IoClose } from 'react-icons/io5';
import { useDispatch, useSelector } from 'react-redux';
import { removeEffect, updateEffectParameter } from '../Redux/Slice/effects.slice';
import { getEffectsProcessor } from '../Utils/audioEffectsProcessor';
import { removeEffectFromTrack, updateTrackEffectParameter, setSelectedTrackId } from '../Redux/Slice/effects.slice';
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

    // Tailwind-consistent responsive sizes
    const getResponsiveStroke = () => {
        if (typeof window !== 'undefined') {
            if (window.innerWidth >= 768) return 3;
            if (window.innerWidth >= 320) return 2;  // md
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

const ClassicDist = () => {

    const [isPoweredOn, setIsPoweredOn] = useState(true);

    const handlePowerToggle = () => {
        setIsPoweredOn(!isPoweredOn);
    };

    const dispatch = useDispatch();
    const { trackEffects, selectedTrackId } = useSelector((state) => state.effects);
    const currentTrackId = useSelector((state) => selectStudioState(state)?.currentTrackId);
    const { activeEffects } = useSelector((state) => state.effects);

    // Get the current effect's instanceId from activeEffects
    // const currentEffect = activeEffects.find(effect => effect.name === "Classic Dist");
    // const currentInstanceId = currentEffect?.instanceId;

    // Use selectedTrackId from effects or fall back to currentTrackId from studio
    const activeTrackId = selectedTrackId || currentTrackId;

    // Get effects for the currently selected track
    const trackSpecificEffects = trackEffects[activeTrackId] || [];
    // Get the current effect's instanceId from track-specific effects or fallback to activeEffects
    const currentEffect = trackSpecificEffects.find(effect =>
        effect.name === "Classic Dist" || effect.name === "ClassicDist"
    ) || activeEffects.find(effect =>
        effect.name === "Classic Dist" || effect.name === "ClassicDist"
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

    // Handle knob value changes
    // specific track
    const handleKnobChange = (parameterIndex, value) => {
        if (currentInstanceId && activeTrackId) {
            dispatch(updateTrackEffectParameter({
                trackId: activeTrackId,
                instanceId: currentInstanceId,
                parameterIndex: parameterIndex,
                value: value
            }));
        }
    };

    // Get current parameter values for initialization
    const getCurrentParameterValue = (parameterIndex) => {
        if (currentEffect && currentEffect.parameters && currentEffect.parameters[parameterIndex]) {
            return currentEffect.parameters[parameterIndex].value;
        }
        // Return default values based on parameter index
        switch (parameterIndex) {
            case 0: return -90; // Dist (Mix)
            case 1: return 0;   // Tone (Amount)
            case 2: return 90;  // Low Cut (Makeup)
            default: return 0;
        }
    };

    // Show track info in the component
    const trackName = useSelector((state) => {
        const tracks = selectStudioState(state)?.tracks || [];
        const track = tracks.find(t => t.id === activeTrackId);
        return track?.name || 'No Track Selected';
    });

    return (
        <div className='bg-[#141414]'>
            <div className={`flex justify-between items-center w-[150px] h-[50px] sm:w-[190px] sm:h-[50px] md600:w-[220px] md:w-[230px] md:h-[55px] lg:w-[240px] xl:h-[60px] 2xl:w-[256px] 2xl:h-[64px] rounded-t-lg px-2 md:px-3 lg:px-8 xl:px-3 transition-colors duration-300 ${isPoweredOn ? 'bg-[#8F7CFD]' : 'bg-gray-600'}`}>
                <FaPowerOff
                    className={`text-[16px] md600:text-[20px] cursor-pointer transition-colors duration-200 ${isPoweredOn ? 'text-white hover:text-green-400' : 'text-red-500 hover:text-red-400'}`}
                    onClick={handlePowerToggle}
                />
                <p className='text-white text-[12px] md600:text-[16px]'>Classic Dist</p>
                <IoClose
                    className={`text-[16px] md600:text-[20px] ${isPoweredOn ? 'text-white hover:text-green-400' : 'text-white hover:text-red-500'}`}
                    onClick={() => handleRemoveEffect(currentInstanceId)}
                />
            </div>
            <div className={`w-[150px] h-[185px] sm:w-[190px] sm:h-[193px] md600:w-[220px] md600:h-[210px] md:w-[230px] md:h-[265px] lg:w-[240px] lg:h-[282px] xl:w-[240px] xl:h-[285px] 2xl:w-[256px] 2xl:h-[300px] bg-[#302f2f] relative transition-opacity duration-300 ${!isPoweredOn ? 'opacity-50 pointer-events-none' : ''}`}>

                {/* Dist Knob - Top Left */}
                <div className="absolute top-[20px] left-[30px] sm:top-[30px] sm:left-[40px] md600:top-[25px] md600:left-[40px] md:top-[25px] md:left-[40px]">
                    <Knob
                        label="Dist"
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
                        label="Tone"
                        min={-135}
                        max={135}
                        defaultAngle={getCurrentParameterValue(1)}
                        onValueChange={handleKnobChange}
                        parameterIndex={1}
                    />
                </div>

                {/* Low cut Knob - Bottom Center */}
                <div className="absolute bottom-[15px] left-[30px] sm:bottom-[25px] sm:left-[40px] md600:left-[40px] md600:bottom-[45px] md:left-[40px] md:bottom-[45px]">
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

export default ClassicDist



// import React, { useEffect, useRef, useState, useCallback } from 'react';
// import { FaPowerOff } from 'react-icons/fa6';
// import { IoClose } from 'react-icons/io5';
// import { useDispatch, useSelector } from 'react-redux';
// import { removeEffect, updateEffectParameter } from '../Redux/Slice/effects.slice';
// import { getEffectsProcessor } from '../Utils/audioEffectsProcessor';
// import { removeEffectFromTrack, updateTrackEffectParameter, setSelectedTrackId } from '../Redux/Slice/effects.slice';
// import { selectStudioState } from '../Redux/rootReducer';
// import { getAudioContextManager } from '../Utils/AudioContextManager';

// const effectsMiddleware = (store) => (next) => (action) => {
//     const result = next(action);

//     // Listen for effect parameter changes
//     if (action.type === 'effects/updateTrackEffectParameter') {
//         const { trackId, instanceId } = action.payload;
//         const state = store.getState();
//         const trackEffects = state.effects.trackEffects[trackId] || [];
//         const audioContextManager = getAudioContextManager();

//         // Reapply effects to track
//         setTimeout(() => {
//             audioContextManager.applyEffectsToTrack(trackId, trackEffects);
//         }, 0);
//     }

//     // Listen for effect additions/removals
//     if (action.type === 'effects/addEffectToTrack' || action.type === 'effects/removeEffectFromTrack') {
//         const { trackId } = action.payload;
//         const state = store.getState();
//         const trackEffects = state.effects.trackEffects[trackId] || [];
//         const audioContextManager = getAudioContextManager();

//         setTimeout(() => {
//             audioContextManager.applyEffectsToTrack(trackId, trackEffects);
//         }, 0);
//     }

//     return result;
// };

// function polarToCartesian(cx, cy, r, angle) {
//     const a = (angle - 90) * Math.PI / 180.0;
//     return {
//         x: cx + r * Math.cos(a),
//         y: cy + r * Math.sin(a)
//     };
// }

// // Helper to describe arc path
// function describeArc(cx, cy, r, startAngle, endAngle) {
//     const start = polarToCartesian(cx, cy, r, endAngle);
//     const end = polarToCartesian(cx, cy, r, startAngle);
//     const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
//     return [
//         "M", start.x, start.y,
//         "A", r, r, 0, largeArcFlag, 0, end.x, end.y
//     ].join(" ");
// }

// function BadgeTooltip({ value, visible }) {
//     if (!visible) return null;

//     // Round the angle value to nearest integer
//     const roundedValue = Math.round(value);

//     return (
//         <div
//             className="absolute -top-6 right-1 bg-[#8F7CFD99] text-white text-xs px-2 py-1 rounded-md shadow-lg pointer-events-none z-10 font-medium"
//             style={{
//                 minWidth: '32px',
//                 textAlign: 'center'
//             }}
//         >
//             {roundedValue}
//         </div>
//     );
// }

// function Knob({ label = "Bite", min = -135, max = 135, defaultAngle, onValueChange, parameterIndex }) {
//     const [angle, setAngle] = useState(defaultAngle ?? min);
//     const [showTooltip, setShowTooltip] = useState(false);
//     const knobRef = useRef(null);
//     const dragging = useRef(false);
//     const lastY = useRef(0);

//     // Tailwind-consistent responsive sizes
//     const getResponsiveSize = () => {
//         if (typeof window !== 'undefined') {
//             if (window.innerWidth >= 1440) return 66; // 2xl
//             if (window.innerWidth >= 1280) return 54; // xl  
//             if (window.innerWidth >= 601) return 48;  // md600
//             if (window.innerWidth >= 425) return 36;  // sm
//             return 34; // xs (mobile)
//         }
//         return 56;
//     };

//     const [size, setSize] = useState(getResponsiveSize());

//     useEffect(() => {
//         const handleResize = () => setSize(getResponsiveSize());
//         window.addEventListener('resize', handleResize);
//         return () => window.removeEventListener('resize', handleResize);
//     }, []);

//     // Tailwind-consistent responsive sizes
//     const getResponsiveStroke = () => {
//         if (typeof window !== 'undefined') {
//             if (window.innerWidth >= 768) return 3;
//             if (window.innerWidth >= 320) return 2;  // md
//             // if (window.innerWidth >= 640) return 40;  // sm
//             return 2; // xs (mobile)
//         }
//         return 56;
//     };

//     const [stroke, setStroke] = useState(getResponsiveStroke());

//     useEffect(() => {
//         const handleResizeStroke = () => setStroke(getResponsiveStroke());
//         window.addEventListener('resize', handleResizeStroke);
//         return () => window.removeEventListener('resize', handleResizeStroke);
//     }, []);

//     const radius = (size - stroke) / 2;
//     const center = size / 2;

//     const onMouseDown = (e) => {
//         dragging.current = true;
//         lastY.current = e.clientY;
//         setShowTooltip(true);
//         document.addEventListener("mousemove", onMouseMove);
//         document.addEventListener("mouseup", onMouseUp);
//     };

//     const onMouseMove = (e) => {
//         if (!dragging.current) return;
//         const deltaY = lastY.current - e.clientY; // up is negative, down is positive
//         lastY.current = e.clientY;
//         setAngle((prev) => {
//             let next = prev + deltaY * 1.5; // adjust sensitivity as needed
//             next = Math.max(min, Math.min(max, next));

//             // Call the callback to update Redux
//             if (onValueChange) {
//                 onValueChange(parameterIndex, next);
//             }

//             return next;
//         });
//     };

//     const onMouseUp = () => {
//         dragging.current = false;
//         setShowTooltip(false);
//         document.removeEventListener("mousemove", onMouseMove);
//         document.removeEventListener("mouseup", onMouseUp);
//     };

//     const onMouseEnter = () => {
//         if (!dragging.current) {
//             setShowTooltip(true);
//         }
//     };

//     const onMouseLeave = () => {
//         if (!dragging.current) {
//             setShowTooltip(false);
//         }
//     };

//     const arcStart = min; // -135
//     const valueAngle = angle; // current angle
//     const fgArc = describeArc(center, center, radius, arcStart, valueAngle);

//     return (
//         <div
//             style={{
//                 display: "flex",
//                 flexDirection: "column",
//                 alignItems: "center",
//                 // marginTop: 40,
//             }}
//         >
//             <div
//                 ref={knobRef}
//                 style={{
//                     width: size,
//                     height: size,
//                     position: "relative",
//                     cursor: "pointer",
//                 }}
//                 onMouseDown={onMouseDown}
//             >
//                 <svg width={size} height={size}>
//                     {/* Full background circle */}
//                     <circle
//                         cx={center}
//                         cy={center}
//                         r={radius}
//                         stroke="#444"
//                         strokeWidth={stroke}
//                         fill="#1F1F1F"
//                     />
//                     {/* Colored arc (top half, up to value) */}
//                     <path
//                         d={fgArc}
//                         stroke="#bbb"
//                         strokeWidth={stroke}
//                         fill="#1F1F1F"
//                         strokeLinecap="round"
//                     />
//                 </svg>
//                 {/* Indicator line */}
//                 <div
//                     className={`absolute top-1.5 left-1/2 w-0.5 h-2 md600:h-3 xl:h-5 2xl:h-6 bg-gray-400 rounded-sm -translate-x-1/2 origin-bottom`}
//                     style={{
//                         transform: `translateX(-50%) rotate(${angle}deg)`,
//                     }}
//                 />
//                 <BadgeTooltip value={angle} visible={showTooltip} />
//             </div>
//             <div className='text-[8px] md600:text-[10px] md:text-[12px] 2xl:text-[16px] mt-1 items-center text-[#aaa]'
//                 style={{
//                     fontFamily: "sans-serif"
//                 }}
//             >
//                 {label}
//             </div>
//         </div>
//     );
// }

// function Knob1({ label = "Bite", min = -135, max = 135, defaultAngle, onValueChange, parameterIndex }) {
//     const [angle, setAngle] = useState(defaultAngle ?? min);
//     const [showTooltip, setShowTooltip] = useState(false);
//     const knobRef = useRef(null);
//     const dragging = useRef(false);
//     const lastY = useRef(0);

//     // Tailwind-consistent responsive sizes
//     const getResponsiveSize = () => {
//         if (typeof window !== 'undefined') {
//             if (window.innerWidth >= 1440) return 50; // 2xl
//             if (window.innerWidth >= 1280) return 40; // xl  
//             // md
//             if (window.innerWidth >= 601) return 32;  // sm
//             if (window.innerWidth >= 425) return 28;  // sm
//             return 24; // xs (mobile)
//         }
//         return 56;
//     };

//     const [size, setSize] = useState(getResponsiveSize());

//     useEffect(() => {
//         const handleResize = () => setSize(getResponsiveSize());
//         window.addEventListener('resize', handleResize);
//         return () => window.removeEventListener('resize', handleResize);
//     }, []);

//     // Tailwind-consistent responsive sizes
//     const getResponsiveStroke = () => {
//         if (typeof window !== 'undefined') {
//             if (window.innerWidth >= 1440) return 3;
//             if (window.innerWidth >= 768) return 2;  // md
//             // if (window.innerWidth >= 640) return 40;  // sm
//             return 2; // xs (mobile)
//         }
//         return 56;
//     };

//     const [stroke, setStroke] = useState(getResponsiveStroke());

//     useEffect(() => {
//         const handleResizeStroke = () => setStroke(getResponsiveStroke());
//         window.addEventListener('resize', handleResizeStroke);
//         return () => window.removeEventListener('resize', handleResizeStroke);
//     }, []);

//     const radius = (size - stroke) / 2;
//     const center = size / 2;

//     const onMouseDown = (e) => {
//         dragging.current = true;
//         lastY.current = e.clientY;
//         setShowTooltip(true);
//         document.addEventListener("mousemove", onMouseMove);
//         document.addEventListener("mouseup", onMouseUp);
//     };

//     const onMouseMove = (e) => {
//         if (!dragging.current) return;
//         const deltaY = lastY.current - e.clientY; // up is negative, down is positive
//         lastY.current = e.clientY;
//         setAngle((prev) => {
//             let next = prev + deltaY * 1.5; // adjust sensitivity as needed
//             next = Math.max(min, Math.min(max, next));

//             // Call the callback to update Redux
//             if (onValueChange) {
//                 onValueChange(parameterIndex, next);
//             }

//             return next;
//         });
//     };

//     const onMouseUp = () => {
//         dragging.current = false;
//         setShowTooltip(false);
//         document.removeEventListener("mousemove", onMouseMove);
//         document.removeEventListener("mouseup", onMouseUp);
//     };

//     const onMouseEnter = () => {
//         if (!dragging.current) {
//             setShowTooltip(true);
//         }
//     };

//     const onMouseLeave = () => {
//         if (!dragging.current) {
//             setShowTooltip(false);
//         }
//     };

//     const arcStart = min; // -135
//     const valueAngle = angle; // current angle
//     const fgArc = describeArc(center, center, radius, arcStart, valueAngle);

//     return (
//         <div
//             style={{
//                 display: "flex",
//                 flexDirection: "column",
//                 alignItems: "center",
//                 // marginTop: 40,
//             }}
//         >
//             <div
//                 ref={knobRef}
//                 style={{
//                     width: size,
//                     height: size,
//                     position: "relative",
//                     cursor: "pointer",
//                 }}
//                 onMouseDown={onMouseDown}
//             >
//                 <svg width={size} height={size}>
//                     {/* Full background circle */}
//                     <circle
//                         cx={center}
//                         cy={center}
//                         r={radius}
//                         stroke="#444"
//                         strokeWidth={stroke}
//                         fill="#1F1F1F"
//                     />
//                     {/* Colored arc (top half, up to value) */}
//                     <path
//                         d={fgArc}
//                         stroke="#bbb"
//                         strokeWidth={stroke}
//                         fill="#1F1F1F"
//                         strokeLinecap="round"
//                     />
//                 </svg>
//                 {/* Indicator line */}
//                 <div
//                     className={`absolute top-1.5 left-1/2 w-0.5 h-2 md600:h-2 lg:h-3 bg-gray-400 rounded-sm -translate-x-1/2 origin-bottom`}
//                     style={{
//                         transform: `translateX(-50%) rotate(${angle}deg)`,
//                     }}
//                 />
//                 <BadgeTooltip value={angle} visible={showTooltip} />
//             </div>
//             <div className='text-[8px] md600:text-[10px] md:text-[12px] 2xl:text-[16px] mt-1 items-center text-[#aaa]'
//                 style={{
//                     fontFamily: "sans-serif"
//                 }}
//             >
//                 {label}
//             </div>
//         </div>
//     );
// }

// const ClassicDist = () => {

//     const audioContextManager = getAudioContextManager();
//     const [isPoweredOn, setIsPoweredOn] = useState(true);

//     const handlePowerToggle = () => {
//         setIsPoweredOn(!isPoweredOn);
//     };

//     const dispatch = useDispatch();
//     const { trackEffects, selectedTrackId } = useSelector((state) => state.effects);
//     const currentTrackId = useSelector((state) => selectStudioState(state)?.currentTrackId);
//     const { activeEffects } = useSelector((state) => state.effects);

//     // Get the current effect's instanceId from activeEffects
//     // const currentEffect = activeEffects.find(effect => effect.name === "Classic Dist");
//     // const currentInstanceId = currentEffect?.instanceId;

//     // Use selectedTrackId from effects or fall back to currentTrackId from studio
//     const activeTrackId = selectedTrackId || currentTrackId;

//     // Get effects for the currently selected track
//     const trackSpecificEffects = trackEffects[activeTrackId] || [];
//     // Get the current effect's instanceId from track-specific effects or fallback to activeEffects
//     const currentEffect = trackSpecificEffects.find(effect =>
//         effect.name === "Classic Dist" || effect.name === "ClassicDist"
//     ) || activeEffects.find(effect =>
//         effect.name === "Classic Dist" || effect.name === "ClassicDist"
//     );
//     const currentInstanceId = currentEffect?.instanceId;

//     const handleRemoveEffect = (instanceId) => {
//         if (!instanceId) return;

//         if (activeTrackId && trackSpecificEffects.some(effect => effect.instanceId === instanceId)) {
//             // Remove from track-specific effects
//             dispatch(removeEffectFromTrack({ trackId: activeTrackId, instanceId }));
//         } else if (activeEffects.some(effect => effect.instanceId === instanceId)) {
//             // Remove from general active effects
//             dispatch(removeEffect(instanceId));
//         }
//     };

//     const handleKnobChange = useCallback((parameterIndex, value) => {
//         if (currentInstanceId && activeTrackId) {
//             // Update Redux state
//             dispatch(updateTrackEffectParameter({
//                 trackId: activeTrackId,
//                 instanceId: currentInstanceId,
//                 parameterIndex: parameterIndex,
//                 value: value
//             }));

//             // Apply effect in real-time to audio
//             const normalizedValue = (value + 135) / 270; // Convert angle to 0-1 range
//             const effectParams = {};

//             // Get current effect parameters
//             const currentParams = getCurrentEffectParameters();

//             // Update specific parameter
//             switch (parameterIndex) {
//                 case 0: // Dist
//                     effectParams.dist = normalizedValue;
//                     effectParams.tone = currentParams.tone || 0.5;
//                     effectParams.lowCut = currentParams.lowCut || 0.5;
//                     break;
//                 case 1: // Tone  
//                     effectParams.dist = currentParams.dist || 0.5;
//                     effectParams.tone = normalizedValue;
//                     effectParams.lowCut = currentParams.lowCut || 0.5;
//                     break;
//                 case 2: // Low Cut
//                     effectParams.dist = currentParams.dist || 0.5;
//                     effectParams.tone = currentParams.tone || 0.5;
//                     effectParams.lowCut = normalizedValue;
//                     break;
//             }

//             // Update effect parameters in audio context
//             audioContextManager.updateTrackEffectParameter(
//                 activeTrackId,
//                 currentInstanceId,
//                 effectParams
//             );
//         }
//     }, [currentInstanceId, activeTrackId, dispatch]);

//     // Helper method to get current effect parameters
//     const getCurrentEffectParameters = useCallback(() => {
//         if (!currentEffect || !currentEffect.parameters) {
//             return { dist: 0.5, tone: 0.5, lowCut: 0.5 };
//         }

//         const params = {};
//         currentEffect.parameters.forEach((param, index) => {
//             const normalizedValue = (param.value + 135) / 270;
//             switch (index) {
//                 case 0: params.dist = normalizedValue; break;
//                 case 1: params.tone = normalizedValue; break;
//                 case 2: params.lowCut = normalizedValue; break;
//             }
//         });

//         return params;
//     }, [currentEffect]);

//     // Show track info in the component
//     const trackName = useSelector((state) => {
//         const tracks = selectStudioState(state)?.tracks || [];
//         const track = tracks.find(t => t.id === activeTrackId);
//         return track?.name || 'No Track Selected';
//     });

//     // Add real-time preview button to ClassicDist component:
//     const handleEffectPreview = useCallback(async () => {
//         if (!activeTrackId) return;

//         try {
//             // Get track data from store
//             const state = store.getState();
//             const tracks = selectStudioState(state)?.tracks || [];
//             const pianoNotes = selectStudioState(state)?.pianoNotes || [];
//             const drumRecordedData = selectStudioState(state)?.drumRecordedData || [];

//             // Filter data for current track
//             const trackNotes = pianoNotes.filter(n => n?.trackId === activeTrackId);
//             const trackDrums = drumRecordedData.filter(d => d?.trackId === activeTrackId);

//             if (trackNotes.length > 0 || trackDrums.length > 0) {
//                 await audioContextManager.playTrack(activeTrackId, trackNotes, trackDrums);
//             }
//         } catch (error) {
//             console.error('Failed to preview effect:', error);
//         }
//     }, [activeTrackId, audioContextManager]);

//     return (

//         <div className='bg-[#141414]'>

//             {/* // Add this button to your ClassicDist JSX: */}
//             <div className="absolute bottom-2 right-2">
//                 <button
//                     onClick={handleEffectPreview}
//                     className="bg-[#8F7CFD] text-white px-2 py-1 rounded text-xs hover:bg-[#7A6BF0] transition-colors"
//                     disabled={!isPoweredOn}
//                 >
//                     Preview
//                 </button>
//             </div>
//             <div className={`flex justify-between items-center w-[150px] h-[40px] sm:w-[190px] sm:h-[50px] md600:w-[220px] md:w-[230px] md:h-[55px] lg:w-[240px] xl:h-[60px] 2xl:w-[256px] 2xl:h-[64px] rounded-t-lg px-2 md:px-3 transition-colors duration-300 ${isPoweredOn ? 'bg-[#8F7CFD]' : 'bg-gray-600'}`}>
//                 <FaPowerOff
//                     className={`text-[16px] md600:text-[20px] cursor-pointer transition-colors duration-200 ${isPoweredOn ? 'text-white hover:text-green-400' : 'text-red-500 hover:text-red-400'}`}
//                     onClick={handlePowerToggle}
//                 />
//                 <p className='text-white text-[12px] md600:text-[16px]'>Classic Dist</p>
//                 <IoClose
//                     className={`text-[16px] md600:text-[20px] ${isPoweredOn ? 'text-white hover:text-green-400' : 'text-white hover:text-red-500'}`}
//                     onClick={() => handleRemoveEffect(currentInstanceId)}
//                 />
//             </div>
//             <div className={`w-[150px] h-[140px] sm:w-[190px] sm:h-[180px] md600:w-[220px] md600:h-[210px] md:w-[230px] md:h-[265px] lg:w-[240px] lg:h-[282px] xl:w-[240px] xl:h-[285px] 2xl:w-[256px] 2xl:h-[300px] bg-[#302f2f] relative transition-opacity duration-300 ${!isPoweredOn ? 'opacity-50 pointer-events-none' : ''}`}>

//                 {/* Dist Knob - Top Left */}
//                 <div className="absolute top-[20px] left-[30px] sm:top-[30px] sm:left-[40px] md600:top-[25px] md600:left-[40px] md:top-[25px] md:left-[40px]">
//                     <Knob
//                         label="Dist"
//                         min={-135}
//                         max={135}
//                         defaultAngle={getCurrentEffectParameters(0)}
//                         onValueChange={handleKnobChange}
//                         parameterIndex={0}
//                     />
//                 </div>

//                 {/* Tone Knob - Top Right */}
//                 <div className="absolute top-[50px] right-[30px] sm:top-[60px] sm:right-[50px] md600:top-[65px] md600:right-[45px] md:top-[80px] md:right-[35px]">
//                     <Knob
//                         label="Tone"
//                         min={-135}
//                         max={135}
//                         defaultAngle={getCurrentEffectParameters(1)}
//                         onValueChange={handleKnobChange}
//                         parameterIndex={1}
//                     />
//                 </div>

//                 {/* Low cut Knob - Bottom Center */}
//                 <div className="absolute bottom-[15px] left-[30px] sm:bottom-[25px] sm:left-[40px] md600:left-[40px] md600:bottom-[45px] md:left-[40px] md:bottom-[45px]">
//                     <Knob1
//                         label="Low Cut"
//                         min={-135}
//                         max={135}
//                         defaultAngle={getCurrentEffectParameters(2)}
//                         onValueChange={handleKnobChange}
//                         parameterIndex={2}
//                     />
//                 </div>
//             </div>
//         </div>
//     )
// }

// export default ClassicDist
