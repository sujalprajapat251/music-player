import React, { useEffect, useRef, useState } from 'react';
import { FaPowerOff } from 'react-icons/fa6';
import { IoClose } from 'react-icons/io5';
import { useDispatch, useSelector } from 'react-redux';
import { removeEffect } from '../Redux/Slice/effects.slice';

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
            className="absolute -top-7 right-7 bg-[#409C9F] text-white text-xs px-2 py-1 rounded-md shadow-lg pointer-events-none z-10 font-medium"
            style={{
                minWidth: '32px',
                textAlign: 'center'
            }}
        >
            {roundedValue}
        </div>
    );
}


function Knob3({ label = "Bite", min = -135, max = 135, defaultAngle }) {
    const [angle, setAngle] = useState(defaultAngle ?? min);
    const [showTooltip, setShowTooltip] = useState(false);
    const knobRef = useRef(null);
    const dragging = useRef(false);
    const lastY = useRef(0);


    // Tailwind-consistent responsive sizes
    const getResponsiveSize = () => {
        if (typeof window !== 'undefined') {
            if (window.innerWidth >= 1440) return 100; // 2xl

            return 80; // xs (mobile)
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
                    className={`absolute top-1.5 left-1/2 w-0.5 h-4 bg-gray-400 rounded-sm -translate-x-1/2 origin-bottom`}
                    style={{
                        transform: `translateX(-50%) rotate(${angle}deg)`,
                    }}
                />
                <BadgeTooltip value={angle} visible={showTooltip} />
            </div>
            <div className='text-[12px]  2xl:text-[16px] mt-1 items-center text-[#aaa]'
                style={{
                    fontFamily: "sans-serif"
                }}
            >
                {label}
            </div>
        </div>
    );
}



const Rotary = () => {

    const [isPoweredOn, setIsPoweredOn] = useState(true);

    const handlePowerToggle = () => {
        setIsPoweredOn(!isPoweredOn);
    };

    const dispatch = useDispatch();
    const { activeEffects } = useSelector((state) => state.effects);

    const handleRemoveEffect = (instanceId) => {
        dispatch(removeEffect(instanceId));
    };

    // Get the current effect's instanceId from activeEffects
    const currentEffect = activeEffects.find(effect => effect.name === "Rotary");
    const currentInstanceId = currentEffect?.instanceId;

    return (
        <div className='bg-[#141414]'>
            <div className={`flex justify-between items-center w-[150px] h-[40px] sm:w-[190px] sm:h-[50px] md600:w-[220px] md:w-[230px] md:h-[55px] lg:w-[240px] xl:h-[60px] 2xl:w-[256px] 2xl:h-[64px] rounded-t-lg px-2 md:px-3 transition-colors duration-300 ${isPoweredOn ? 'bg-[#409C9F]' : 'bg-gray-600'
                }`}>
                <FaPowerOff
                    className={`text-[16px] md600:text-[20px] cursor-pointer transition-colors duration-200 ${isPoweredOn ? 'text-white hover:text-purple-400' : 'text-red-500 hover:text-red-400'
                        }`}
                    onClick={handlePowerToggle}
                />
                <p className='text-white text-[12px] md600:text-[16px]'>Rotary</p>
                <IoClose
                    className={`text-[16px] md600:text-[20px] ${isPoweredOn
                        ? 'text-white hover:text-purple-400'
                        : 'text-white hover:text-red-500'
                        }`}
                    onClick={() => handleRemoveEffect(currentInstanceId)}
                />
            </div>
            <div className={`w-[150px] h-[140px] sm:w-[190px] sm:h-[180px] md600:w-[220px] md600:h-[210px] md:w-[230px] md:h-[265px] lg:w-[240px] lg:h-[282px] xl:w-[240px] xl:h-[285px] 2xl:w-[256px] 2xl:h-[300px]  bg-[#302f2f] flex items-center justify-center ${!isPoweredOn ? 'opacity-50 pointer-events-none' : ''}`}>
                {/* Tone Knob - Top Right */}
                <div className="">
                    <Knob3 label="Rate" min={-135} max={135} defaultAngle={-2} />
                </div>


            </div>
        </div>
    )
}

export default Rotary
