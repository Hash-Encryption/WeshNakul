import React from 'react';
import type { PlayerShape } from '../../types/database';
import { extractInitial } from '../../lib/tokenGenerator';

interface ProceduralAvatarProps {
  nickname: string;
  shape: PlayerShape;
  color: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showCrown?: boolean;
}

const sizeMap = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-11 h-11 text-base',
  lg: 'w-14 h-14 text-xl',
  xl: 'w-20 h-20 text-3xl',
};

export const ProceduralAvatar: React.FC<ProceduralAvatarProps> = ({
  nickname,
  shape,
  color,
  size = 'md',
  className = '',
  showCrown = false,
}) => {
  const initial = extractInitial(nickname);

  // SVG shape paths within a 100x100 coordinate box
  const renderShapePath = () => {
    switch (shape) {
      case 'circle':
        return <circle cx="50" cy="50" r="46" fill={color} />;

      case 'squircle':
        return (
          <rect
            x="4"
            y="4"
            width="92"
            height="92"
            rx="30"
            ry="30"
            fill={color}
          />
        );

      case 'diamond':
        return (
          <path
            d="M 50,4 C 54,4 58,8 86,46 C 90,50 90,54 86,58 C 58,86 54,96 50,96 C 46,96 42,86 14,58 C 10,54 10,50 14,46 C 42,8 46,4 50,4 Z"
            fill={color}
          />
        );

      case 'hexagon':
        return (
          <polygon
            points="50,4 90,26 90,74 50,96 10,74 10,26"
            fill={color}
            strokeLinejoin="round"
          />
        );

      case 'scallop':
      default:
        // 8-petal cute flower / scallop badge
        return (
          <path
            d="M 50,6 
               C 62,6 64,18 74,18 
               C 84,18 84,30 92,38 
               C 100,46 94,58 92,66 
               C 90,74 80,82 72,88 
               C 64,94 56,94 50,94 
               C 44,94 36,94 28,88 
               C 20,82 10,74 8,66 
               C 6,58 0,46 8,38 
               C 16,30 16,18 26,18 
               C 36,18 38,6 50,6 Z"
            fill={color}
          />
        );
    }
  };

  return (
    <div className={`relative inline-flex items-center justify-center select-none ${className}`}>
      {showCrown && (
        <span
          className="absolute -top-2.5 z-10 text-sm filter drop-shadow-sm animate-bounce"
          style={{ animationDuration: '2s' }}
          role="img"
          aria-label="Host"
        >
          👑
        </span>
      )}
      <div className={`relative flex items-center justify-center transition-transform hover:scale-105 ${sizeMap[size]}`}>
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full drop-shadow-sm overflow-visible"
        >
          {/* Base shape with fill */}
          {renderShapePath()}
          {/* Subtle glossy highlight curve */}
          <path
            d="M 22,24 Q 50,14 78,24 Q 50,30 22,24 Z"
            fill="white"
            fillOpacity="0.28"
          />
        </svg>
        <span
          className="absolute font-alexandria font-bold text-white tracking-wider flex items-center justify-center pointer-events-none drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)]"
          style={{ transform: 'translateY(-0.5px)' }}
        >
          {initial}
        </span>
      </div>
    </div>
  );
};
