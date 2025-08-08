import React, { useRef, useState, useEffect } from 'react'

const Knob = ({ 
  label = "Vol", 
  min = -135, 
  max = 135, 
  initialVolume = 80, 
  onChange, 
  trackId 
}) => {
  // Convert volume (0-100) to angle (-135 to 135)
  const volumeToAngle = (volume) => {
    return min + ((volume / 100) * (max - min));
  };

  // Convert angle to volume (0-100)
  const angleToVolume = (angle) => {
    return Math.round(((angle - min) / (max - min)) * 100);
  };

  const [angle, setAngle] = useState(volumeToAngle(initialVolume));
  const knobRef = useRef(null);
  const dragging = useRef(false);
  const lastY = useRef(0);

  // Update angle when initialVolume prop changes
  useEffect(() => {
    setAngle(volumeToAngle(initialVolume));
  }, [initialVolume]);

  // SVG circle parameters
  const size = 28;
  const stroke = 1.5;
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
      
      // Convert angle to volume and call onChange
      const newVolume = angleToVolume(next);
      if (onChange) {
        onChange(newVolume, trackId);
      }
      
      return next;
    });
  };

  const onMouseUp = () => {
    dragging.current = false;
    document.removeEventListener("mousemove", onMouseMove);
    document.removeEventListener("mouseup", onMouseUp);
  };

  return (
    <div style={{ display: "flex", alignItems: "center", background: "transparent", padding: 0, borderRadius: 0, width: 'auto', height: 'auto' }}>
      <div
        ref={knobRef}
        style={{
          width: size,
          height: size,
          position: "relative",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
        onMouseDown={onMouseDown}
      >
        <svg width={size} height={size}>
          {/* Circle outline */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            stroke="#888"
            strokeWidth={stroke}
            fill="#222"
          />
        </svg>
        {/* Indicator line */}
        <div
          style={{
            position: "absolute",
            top: 2,
            left: "50%",
            width: 1.5,
            height: 9,
            background: "#bbb",
            borderRadius: 1,
            transform: `translateX(-50%) rotate(${angle}deg)`,
            transformOrigin: "bottom center",
            opacity: 0.7,
          }}
        />
      </div>
      <div className='mt-4' style={{ color: "#fff", fontSize: 12, marginLeft: 4, fontFamily: "sans-serif" }}>
        {label}
      </div>
    </div>
  );
}

export default Knob