import React from 'react';

export interface ArcadeWheelSlice {
  id: string;
  name: string;
  emoji?: string;
  votes: number;
  color: string;
  startAngle: number;
  endAngle: number;
  midAngle: number;
  angle: number;
}

export interface ArcadeWheelProps {
  slices: ArcadeWheelSlice[];
  rotation?: number;
  isSpinning?: boolean;
  wheelRef?: React.RefObject<SVGGElement | null>;
  needleRef?: React.RefObject<SVGGElement | null>;
  centerEmoji?: string;
  durationMs?: number;
  reducedMotion?: boolean;
  onTransitionEnd?: () => void;
}

// Pre-computed 16 pegs around the 320x320 wheel circumference (radius 141)
const PEGS = Array.from({ length: 16 }, (_, i) => {
  const angle = i * 22.5;
  const rad = (angle * Math.PI) / 180;
  return {
    x: 160 + 141 * Math.sin(rad),
    y: 160 - 141 * Math.cos(rad),
  };
});

export const ArcadeWheel: React.FC<ArcadeWheelProps> = ({
  slices,
  rotation = 0,
  isSpinning = false,
  wheelRef,
  needleRef,
  centerEmoji = '🎲',
  onTransitionEnd,
}) => {
  const sliceCount = slices.length;
  // Scale label and emoji size based on slice count for optimal readability
  const labelFontSize = sliceCount <= 2 ? '14' : sliceCount <= 4 ? '12' : '11';
  const emojiFontSize = sliceCount <= 2 ? '24' : sliceCount <= 4 ? '20' : '18';
  const emojiY = sliceCount <= 2 ? '54' : '58';
  const labelY = sliceCount <= 2 ? '78' : '80';

  return (
    <div className="relative w-64 h-64 sm:w-72 sm:h-72 flex items-center justify-center my-1 select-none">
      <svg
        viewBox="0 0 320 320"
        className="w-full h-full select-none overflow-visible drop-shadow-[0px_6px_0px_#241B18]"
      >
        {/* Rotating Wheel Group with direct DOM ref control */}
        <g
          ref={wheelRef}
          style={{
            transform: `rotate(${rotation}deg)`,
            transformOrigin: '160px 160px',
            transition: 'none',
            willChange: isSpinning ? 'transform' : 'auto',
          }}
          onTransitionEnd={onTransitionEnd}
        >
          {/* Thick Arcade Outer Rim */}
          <circle cx="160" cy="160" r="146" fill="#241B18" />

          {/* Slices */}
          {slices.map((slice) => {
            const startRad = (slice.startAngle * Math.PI) / 180;
            const endRad = (slice.endAngle * Math.PI) / 180;
            const x1 = 160 + 136 * Math.sin(startRad);
            const y1 = 160 - 136 * Math.cos(startRad);
            const x2 = 160 + 136 * Math.sin(endRad);
            const y2 = 160 - 136 * Math.cos(endRad);
            const largeArc = slice.angle > 180 ? 1 : 0;
            const pathData = `M 160 160 L ${x1} ${y1} A 136 136 0 ${largeArc} 1 ${x2} ${y2} Z`;

            return (
              <path
                key={`slice-${slice.id}`}
                d={pathData}
                fill={slice.color}
                stroke="#241B18"
                strokeWidth="2.5"
              />
            );
          })}

          {/* Inside-Slice Labels & Emojis */}
          {slices.map((slice) => {
            const maxLen = sliceCount <= 2 ? 16 : 12;
            const displayName =
              slice.name.length > maxLen ? slice.name.slice(0, maxLen).trim() + '...' : slice.name;

            return (
              <g key={`label-${slice.id}`} transform={`rotate(${slice.midAngle} 160 160)`}>
                {slice.emoji && (
                  <text
                    x="160"
                    y={emojiY}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontSize={emojiFontSize}
                    className="select-none pointer-events-none"
                  >
                    {slice.emoji}
                  </text>
                )}
                <text
                  x="160"
                  y={labelY}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill="#241B18"
                  fontSize={labelFontSize}
                  fontWeight="900"
                  fontFamily="Alexandria, system-ui, sans-serif"
                  className="select-none pointer-events-none"
                >
                  {displayName}
                </text>
              </g>
            );
          })}

          {/* Metallic Pegs on Rim (Rotate with wheel) */}
          {PEGS.map((peg, i) => (
            <g key={`peg-${i}`}>
              <circle cx={peg.x} cy={peg.y} r="3.5" fill="#FFFDF8" stroke="#241B18" strokeWidth="1.2" />
              <circle cx={peg.x - 0.8} cy={peg.y - 0.8} r="1" fill="#FFFFFF" />
            </g>
          ))}
        </g>

        {/* 3D Tactile Center Cap (Outside rotating group so center emoji stays upright) */}
        <g className="pointer-events-none">
          <circle cx="160" cy="160" r="30" fill="#241B18" />
          <circle cx="160" cy="160" r="28" fill="#FFFDF8" stroke="#241B18" strokeWidth="3" />
          <circle cx="160" cy="160" r="22" fill="#FFD75A" stroke="#241B18" strokeWidth="2" />
          <text
            x="160"
            y="161"
            textAnchor="middle"
            dominantBaseline="central"
            fontSize="20"
            className="select-none pointer-events-none"
          >
            {centerEmoji}
          </text>
        </g>

        {/* Top Arcade Indicator Needle (Direct ref control for physical boundary kicks) */}
        <g
          ref={needleRef}
          style={{
            transform: 'rotate(0deg)',
            transformOrigin: '160px 8px',
            willChange: isSpinning ? 'transform' : 'auto',
          }}
          className="pointer-events-none"
        >
          {/* Needle Drop Shadow */}
          <polygon
            points="148,8 172,8 160,37"
            fill="#000000"
            opacity="0.25"
            transform="translate(0, 3)"
          />
          {/* Needle Body */}
          <polygon
            points="148,8 172,8 160,36"
            fill="#EF4444"
            stroke="#241B18"
            strokeWidth="3"
            strokeLinejoin="round"
          />
          {/* Inner Accent Ridge */}
          <polygon points="160,11 170,9 160,34" fill="#DC2626" />
          <line
            x1="160"
            y1="10"
            x2="160"
            y2="34"
            stroke="#FEE2E2"
            strokeWidth="1.5"
            strokeLinecap="round"
            opacity="0.7"
          />
          {/* Brass Pivot Rivet */}
          <circle cx="160" cy="8" r="8" fill="#FBBF24" stroke="#241B18" strokeWidth="3" />
          <circle cx="160" cy="8" r="3" fill="#241B18" />
        </g>
      </svg>
    </div>
  );
};
