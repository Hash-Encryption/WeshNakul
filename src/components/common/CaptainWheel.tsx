import React from 'react';
import type { CaptainCandidate } from '../../types/captain';

export interface CaptainWheelSlice {
  id: string;
  initial: string;
  nickname: string;
  color: string;
  startAngle: number;
  endAngle: number;
  midAngle: number;
  angle: number;
}

export interface CaptainWheelProps {
  candidates: CaptainCandidate[];
  rotation?: number;
  isSpinning?: boolean;
  wheelRef?: React.RefObject<SVGGElement | null>;
  needleRef?: React.RefObject<SVGGElement | null>;
  onTransitionEnd?: () => void;
}

// 8 ship-wheel helm spoke angles (0, 45, 90, 135, 180, 225, 270, 315 degrees)
const SPOKE_ANGLES = [0, 45, 90, 135, 180, 225, 270, 315];

// 16 brass rivets around the outer rim (radius 142)
const BRASS_STUDS = Array.from({ length: 16 }, (_, i) => {
  const angle = i * 22.5;
  const rad = (angle * Math.PI) / 180;
  return {
    x: 180 + 140 * Math.sin(rad),
    y: 180 - 140 * Math.cos(rad),
  };
});

const DEFAULT_SLICE_COLORS = [
  '#FFD75A', // vibrant yellow
  '#F0443E', // coral red
  '#55B96A', // mint green
  '#F6A6AD', // candy pink
  '#73C8EA', // sky blue
  '#9B86EC', // purple
  '#FFA940', // warm amber
  '#36CFC9', // teal
];

export const CaptainWheel: React.FC<CaptainWheelProps> = ({
  candidates,
  rotation = 0,
  isSpinning = false,
  wheelRef,
  needleRef,
  onTransitionEnd,
}) => {
  const count = Math.max(1, candidates.length);
  const sliceAngle = 360 / count;

  const slices: CaptainWheelSlice[] = candidates.map((cand, idx) => {
    const startAngle = idx * sliceAngle;
    const endAngle = (idx + 1) * sliceAngle;
    const midAngle = (idx + 0.5) * sliceAngle;
    const color = cand.color || DEFAULT_SLICE_COLORS[idx % DEFAULT_SLICE_COLORS.length];

    let initial = cand.initial;
    if (!initial || initial === '?') {
      initial = (cand.nickname?.trim()?.[0] || '?').toUpperCase();
    }

    return {
      id: cand.id,
      initial,
      nickname: cand.nickname,
      color,
      startAngle,
      endAngle,
      midAngle,
      angle: sliceAngle,
    };
  });

  return (
    <div className="relative w-72 h-72 sm:w-80 sm:h-80 flex items-center justify-center my-2 select-none mx-auto">
      <svg
        viewBox="0 0 360 360"
        className="w-full h-full select-none overflow-visible drop-shadow-[0px_8px_0px_#241B18]"
      >
        <defs>
          <radialGradient id="woodGripGradient" cx="50%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#C48858" />
            <stop offset="45%" stopColor="#9C643E" />
            <stop offset="100%" stopColor="#673F24" />
          </radialGradient>
          <linearGradient id="woodRimGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#B3774B" />
            <stop offset="50%" stopColor="#8C5734" />
            <stop offset="100%" stopColor="#60371C" />
          </linearGradient>
          <filter id="shadowFilter" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="3" stdDeviation="2" floodColor="#241B18" floodOpacity="0.3" />
          </filter>
        </defs>

        {/* Rotating Wheel Group (Includes Wooden Spokes + Rim + Slices) */}
        <g
          ref={wheelRef}
          style={{
            transform: `rotate(${rotation}deg)`,
            transformOrigin: '180px 180px',
            transition: 'none',
            willChange: isSpinning ? 'transform' : 'auto',
          }}
          onTransitionEnd={onTransitionEnd}
        >
          {/* 8 Ship Helm Turned Handles (Spokes) */}
          {SPOKE_ANGLES.map((deg) => (
            <g key={`handle-${deg}`} transform={`rotate(${deg} 180 180)`}>
              {/* Spoke handle drop shadow */}
              <path
                d="M 175 42 L 185 42 L 187 28 C 187 20 184 12 180 12 C 176 12 173 20 173 28 Z"
                fill="#241B18"
                opacity="0.35"
                transform="translate(0, 3)"
              />
              {/* Wooden spoke shaft */}
              <rect
                x="174"
                y="36"
                width="12"
                height="22"
                rx="4"
                fill="url(#woodGripGradient)"
                stroke="#241B18"
                strokeWidth="2.5"
              />
              {/* Turned handle knob (helm grip) */}
              <path
                d="M 174 36 C 170 30 167 22 173 14 C 176 10 184 10 187 14 C 193 22 190 30 186 36 Z"
                fill="url(#woodGripGradient)"
                stroke="#241B18"
                strokeWidth="2.5"
              />
              {/* Brass collar ring */}
              <rect
                x="172"
                y="34"
                width="16"
                height="4"
                rx="1.5"
                fill="#FFD75A"
                stroke="#241B18"
                strokeWidth="1.5"
              />
            </g>
          ))}

          {/* Heavy Wooden Outer Rim */}
          <circle cx="180" cy="180" r="148" fill="#241B18" />
          <circle cx="180" cy="180" r="144" fill="url(#woodRimGradient)" stroke="#241B18" strokeWidth="3" />
          <circle cx="180" cy="180" r="132" fill="#241B18" />

          {/* Wheel Slices */}
          {slices.map((slice) => {
            const startRad = (slice.startAngle * Math.PI) / 180;
            const endRad = (slice.endAngle * Math.PI) / 180;
            const x1 = 180 + 130 * Math.sin(startRad);
            const y1 = 180 - 130 * Math.cos(startRad);
            const x2 = 180 + 130 * Math.sin(endRad);
            const y2 = 180 - 130 * Math.cos(endRad);
            const largeArc = slice.angle > 180 ? 1 : 0;
            const pathData =
              slices.length === 1
                ? `M 180 50 A 130 130 0 1 1 179.9 50 Z`
                : `M 180 180 L ${x1} ${y1} A 130 130 0 ${largeArc} 1 ${x2} ${y2} Z`;

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

          {/* Initials-Only Player Badges (Clean circular badge on each segment) */}
          {slices.map((slice) => {
            const badgeRadius = count <= 2 ? 26 : count <= 4 ? 23 : count <= 6 ? 21 : 18;
            const fontSize = count <= 2 ? '24' : count <= 4 ? '20' : count <= 6 ? '18' : '15';
            const badgeY = count <= 2 ? 80 : 86;

            return (
              <g key={`badge-${slice.id}`} transform={`rotate(${slice.midAngle} 180 180)`}>
                {/* Badge circle */}
                <circle
                  cx="180"
                  cy={badgeY}
                  r={badgeRadius}
                  fill="#FFF8EB"
                  stroke="#241B18"
                  strokeWidth="2.5"
                  filter="url(#shadowFilter)"
                />
                {/* Player Initial Only */}
                <text
                  x="180"
                  y={badgeY + 1}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill="#241B18"
                  fontSize={fontSize}
                  fontWeight="900"
                  fontFamily="Alexandria, system-ui, sans-serif"
                  className="select-none pointer-events-none"
                >
                  {slice.initial}
                </text>
              </g>
            );
          })}

          {/* Brass Rivet Studs around Rim */}
          {BRASS_STUDS.map((stud, i) => (
            <g key={`stud-${i}`}>
              <circle cx={stud.x} cy={stud.y} r="3.5" fill="#FFD75A" stroke="#241B18" strokeWidth="1.2" />
              <circle cx={stud.x - 0.7} cy={stud.y - 0.7} r="1" fill="#FFFDF8" />
            </g>
          ))}
        </g>

        {/* Center Captain Emblem Cap (Stationary so Captain Hat Stays Upright!) */}
        <g className="pointer-events-none">
          {/* Outer Gold Ring */}
          <circle cx="180" cy="180" r="38" fill="#241B18" />
          <circle cx="180" cy="180" r="35" fill="#FFFDF8" stroke="#241B18" strokeWidth="3" />
          <circle cx="180" cy="180" r="31" fill="#FFEDB3" stroke="#241B18" strokeWidth="2" />

          {/* Captain Hat Emblem */}
          <g transform="translate(180, 180)">
            {/* Dark Visor / Peak */}
            <path
              d="M -22 6 Q 0 16 22 6 Q 16 0 0 -1 Q -16 0 -22 6 Z"
              fill="#241B18"
            />
            {/* Hat Crown (White Sailor Peaked Cap) */}
            <path
              d="M -20 3 C -23 -10 -15 -18 0 -18 C 15 -18 23 -10 20 3 Z"
              fill="#FFFFFF"
              stroke="#241B18"
              strokeWidth="2"
            />
            {/* Dark Cap Band */}
            <path
              d="M -19 3 Q 0 7 19 3 Q 18 8 0 8 Q -18 8 -19 3 Z"
              fill="#241B18"
            />
            {/* Gold Chin Strap */}
            <path
              d="M -18 4 Q 0 8 18 4"
              stroke="#F59E0B"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
            />
            {/* Golden Anchor Insignia Badge */}
            <circle cx="0" cy="-6" r="5" fill="#FFD75A" stroke="#241B18" strokeWidth="1" />
            <path
              d="M 0 -8.5 L 0 -3.5 M -2.5 -5.5 L 2.5 -5.5 M -3 -4 C -3 -2 3 -2 3 -4"
              stroke="#241B18"
              strokeWidth="1.2"
              fill="none"
              strokeLinecap="round"
            />
          </g>
        </g>

        {/* Top Indicator Needle at 12 o'clock */}
        <g
          ref={needleRef}
          style={{
            transform: 'rotate(0deg)',
            transformOrigin: '180px 14px',
            willChange: isSpinning ? 'transform' : 'auto',
          }}
          className="pointer-events-none"
        >
          {/* Drop shadow */}
          <polygon
            points="166,12 194,12 180,48"
            fill="#000000"
            opacity="0.3"
            transform="translate(0, 4)"
          />
          {/* White outline backing */}
          <polygon
            points="164,10 196,10 180,50"
            fill="#FFFFFF"
            stroke="#241B18"
            strokeWidth="3.5"
            strokeLinejoin="round"
          />
          {/* Vivid Red Arrow Body */}
          <polygon
            points="168,14 192,14 180,45"
            fill="#F0443E"
          />
          {/* Inner Accent */}
          <polygon
            points="180,17 190,15 180,42"
            fill="#D92D20"
          />
          {/* Rivet on Top */}
          <circle cx="180" cy="14" r="5" fill="#FFD75A" stroke="#241B18" strokeWidth="2" />
        </g>
      </svg>
    </div>
  );
};
