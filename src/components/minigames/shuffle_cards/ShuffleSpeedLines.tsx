import React from 'react';
import { motion } from 'motion/react';

export const ShuffleSpeedLines: React.FC = () => {
  return (
    <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden flex items-center justify-center">
      <svg
        className="w-full h-full opacity-85"
        viewBox="0 0 400 240"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Top whoosh streaks */}
        <motion.path
          d="M 10 45 L 390 45"
          stroke="#F0443E"
          strokeWidth="3"
          strokeDasharray="60 30 40 50"
          strokeLinecap="round"
          animate={{ strokeDashoffset: [0, -400] }}
          transition={{ repeat: Infinity, duration: 0.65, ease: 'linear' }}
          opacity={0.7}
        />
        <motion.path
          d="M 30 75 L 370 75"
          stroke="#FFD75A"
          strokeWidth="2.5"
          strokeDasharray="80 40 30 60"
          strokeLinecap="round"
          animate={{ strokeDashoffset: [-400, 0] }}
          transition={{ repeat: Infinity, duration: 0.55, ease: 'linear' }}
          opacity={0.8}
        />

        {/* Mid whoosh streaks */}
        <motion.path
          d="M 0 120 L 400 120"
          stroke="#F0443E"
          strokeWidth="3.5"
          strokeDasharray="90 50 70 40"
          strokeLinecap="round"
          animate={{ strokeDashoffset: [0, -500] }}
          transition={{ repeat: Infinity, duration: 0.48, ease: 'linear' }}
          opacity={0.85}
        />
        <motion.path
          d="M 40 145 L 380 145"
          stroke="#73C8EA"
          strokeWidth="2"
          strokeDasharray="50 35 45 40"
          strokeLinecap="round"
          animate={{ strokeDashoffset: [-400, 0] }}
          transition={{ repeat: Infinity, duration: 0.6, ease: 'linear' }}
          opacity={0.75}
        />

        {/* Bottom whoosh streaks */}
        <motion.path
          d="M 15 190 L 395 190"
          stroke="#FFD75A"
          strokeWidth="2.5"
          strokeDasharray="70 45 60 55"
          strokeLinecap="round"
          animate={{ strokeDashoffset: [0, -450] }}
          transition={{ repeat: Infinity, duration: 0.52, ease: 'linear' }}
          opacity={0.7}
        />

        {/* Dynamic cartoon wind curves */}
        <motion.path
          d="M 50 60 Q 200 35 350 60"
          stroke="#241B18"
          strokeWidth="1.5"
          strokeDasharray="30 40"
          strokeLinecap="round"
          animate={{ strokeDashoffset: [0, -200] }}
          transition={{ repeat: Infinity, duration: 0.7, ease: 'linear' }}
          opacity={0.25}
        />
        <motion.path
          d="M 30 170 Q 200 195 370 170"
          stroke="#241B18"
          strokeWidth="1.5"
          strokeDasharray="40 50"
          strokeLinecap="round"
          animate={{ strokeDashoffset: [-200, 0] }}
          transition={{ repeat: Infinity, duration: 0.75, ease: 'linear' }}
          opacity={0.25}
        />
      </svg>
    </div>
  );
};
