import React, { useState, useRef, useEffect } from 'react';

interface CompassProps {
  northAngle: number; // 0-360 degrees (0 = north is up)
  onAngleChange?: (angle: number) => void;
  editable?: boolean;
  size?: number; // diameter in pixels
}

const Compass: React.FC<CompassProps> = ({
  northAngle = 0,
  onAngleChange,
  editable = false,
  size = 80,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const compassRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!editable || !onAngleChange) return;
    e.preventDefault();
    setIsDragging(true);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !onAngleChange || !compassRef.current) return;

      const rect = compassRef.current.getBoundingClientRect();
      const compassCenter = {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      };

      const dx = e.clientX - compassCenter.x;
      const dy = e.clientY - compassCenter.y;

      // Calculate angle (0 = up, clockwise)
      let angle = Math.atan2(dy, dx) * (180 / Math.PI);
      angle = (angle + 90 + 360) % 360; // Adjust so 0 = up

      onAngleChange(Math.round(angle));
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, onAngleChange]);

  return (
    <div
      ref={compassRef}
      className="relative bg-white rounded-full shadow-lg border-2 border-gray-300"
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Compass circle background */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={size / 2 - 4}
          fill="white"
          stroke="#E5E7EB"
          strokeWidth="2"
        />

        {/* Degree markings */}
        {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
          <g key={angle} transform={`rotate(${angle}, ${size / 2}, ${size / 2})`}>
            <line
              x1={size / 2}
              y1={8}
              x2={size / 2}
              y2={12}
              stroke="#D1D5DB"
              strokeWidth="1"
            />
          </g>
        ))}

        {/* Cardinal directions (fixed) */}
        <g>
          {/* N */}
          <text
            x={size / 2}
            y={14}
            textAnchor="middle"
            fontSize="12"
            fontWeight="bold"
            fill="#374151"
          >
            N
          </text>
          {/* S */}
          <text
            x={size / 2}
            y={size - 6}
            textAnchor="middle"
            fontSize="10"
            fill="#9CA3AF"
          >
            S
          </text>
          {/* E */}
          <text
            x={size - 10}
            y={size / 2 + 4}
            textAnchor="middle"
            fontSize="10"
            fill="#9CA3AF"
          >
            E
          </text>
          {/* W */}
          <text
            x={10}
            y={size / 2 + 4}
            textAnchor="middle"
            fontSize="10"
            fill="#9CA3AF"
          >
            W
          </text>
        </g>

        {/* North arrow (rotates based on northAngle) */}
        <g transform={`rotate(${northAngle}, ${size / 2}, ${size / 2})`}>
          {/* Arrow shaft */}
          <line
            x1={size / 2}
            y1={size / 2}
            x2={size / 2}
            y2={size / 2 - size / 3}
            stroke="#EF4444"
            strokeWidth="3"
            strokeLinecap="round"
          />
          {/* Arrow head */}
          <path
            d={`
              M ${size / 2} ${size / 2 - size / 3}
              L ${size / 2 - 6} ${size / 2 - size / 3 + 10}
              L ${size / 2 + 6} ${size / 2 - size / 3 + 10}
              Z
            `}
            fill="#EF4444"
          />
          {/* South indicator (gray) */}
          <line
            x1={size / 2}
            y1={size / 2}
            x2={size / 2}
            y2={size / 2 + size / 4}
            stroke="#9CA3AF"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </g>

        {/* Interaction overlay (if editable) */}
        {editable && (
          <circle
            cx={size / 2}
            cy={size / 2}
            r={size / 2 - 4}
            fill="transparent"
            className={isDragging ? 'cursor-grabbing' : 'cursor-grab'}
            onMouseDown={handleMouseDown}
          />
        )}
      </svg>

      {/* Angle display */}
      {editable && (
        <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs text-gray-600 bg-white px-2 py-1 rounded border border-gray-300 shadow-sm">
          {northAngle.toFixed(0)}°
        </div>
      )}
    </div>
  );
};

export default Compass;
