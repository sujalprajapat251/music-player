import React, { useEffect, useRef, useState } from 'react';
import { FaPowerOff } from 'react-icons/fa6';
import { IoClose } from 'react-icons/io5';
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

function Knob1({ label = "Bite", min = -135, max = 135, defaultAngle }) {
    const [angle, setAngle] = useState(defaultAngle ?? min);
    const knobRef = useRef(null);
    const dragging = useRef(false);
    const lastY = useRef(0);


    // Tailwind-consistent responsive sizes
    const getResponsiveSize = () => {
        if (typeof window !== 'undefined') {
            if (window.innerWidth >= 1440) return 50; // 2xl
            if (window.innerWidth >= 1280) return 40; // xl  
            if (window.innerWidth >= 1024) return 36; // lg
            if (window.innerWidth >= 768) return 32;  // md
            if (window.innerWidth >= 640) return 28;  // sm
            return 20; // xs (mobile)
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
        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", onMouseUp);
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
                    className={`absolute top-1.5 left-1/2 w-0.5 h-2 md600:h-3 lg:h-4 bg-gray-400 rounded-sm -translate-x-1/2 origin-bottom`}
                    style={{
                        transform: `translateX(-50%) rotate(${angle}deg)`,
                    }}
                />
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

const AutoPan = () => {
    return (
        <div className='bg-[#141414]'>
            <div className='flex justify-between items-center w-[250px] h-[63px] rounded-t-lg bg-[#409C9F] px-3'>
                <FaPowerOff className='text-white text-[20px]' />
                <p className='text-white text-[16px]'>Auto Pan</p>
                <IoClose className='text-white text-[20px]' />
            </div>
            <div className='w-[250px] h-[337px] bg-[#302f2f] relative'>
                {/* Tone Knob - Top Right */}
                <div className="absolute top-[50px] right-[30px]">
                    <Knob1 label="Rate" min={-135} max={135} defaultAngle={0} />
                </div>

                {/* Low cut Knob - Bottom Center */}
                <div className="absolute top-[130px] left-[60px] left-1/2 transform -translate-x-1/2">
                    <Knob1 label="Depth" min={-135} max={135} defaultAngle={90} />
                </div>
            </div>
        </div>
    )
}

export default AutoPan
