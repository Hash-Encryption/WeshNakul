import React from 'react';

interface MiniGameArtworkProps {
  asset: string;
  className?: string;
}

export const MiniGameArtwork: React.FC<MiniGameArtworkProps> = ({ asset, className = 'w-16 h-14' }) => {
  switch (asset) {
    case 'shuffle_cards':
      return (
        <svg viewBox="0 0 80 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          {/* Sparkles */}
          <path d="M12 10L13.5 14.5L18 16L13.5 17.5L12 22L10.5 17.5L6 16L10.5 14.5L12 10Z" fill="#F0443E" opacity="0.8" />
          <path d="M68 8L69 11L72 12L69 13L68 16L67 13L64 12L67 11L68 8Z" fill="#F59E0B" />
          <path d="M72 44L73 47L76 48L73 49L72 52L71 49L68 48L71 47L72 44Z" fill="#F0443E" opacity="0.6" />

          {/* Left Card (Spade/Club) */}
          <g transform="rotate(-15 32 36)">
            <rect x="14" y="10" width="32" height="46" rx="5" fill="#FFFFFF" stroke="#241B18" strokeWidth="2.5" />
            {/* Spade symbol */}
            <path
              d="M30 30 C27 25 24 28 24 31 C24 34 28 37 30 40 C32 37 36 34 36 31 C36 28 33 25 30 30 Z"
              fill="#241B18"
            />
            <path d="M29 38 L27 43 H33 L31 38 Z" fill="#241B18" />
            <circle cx="21" cy="18" r="1.5" fill="#241B18" />
          </g>

          {/* Right Card (Heart) */}
          <g transform="rotate(10 46 36)">
            <rect x="32" y="10" width="32" height="46" rx="5" fill="#FFFFFF" stroke="#241B18" strokeWidth="2.5" />
            {/* Ace letter A */}
            <text x="36" y="21" fontFamily="sans-serif" fontWeight="900" fontSize="9" fill="#F0443E">A</text>
            {/* Heart symbol */}
            <path
              d="M48 31 C48 27 43 25 41 29 C39 25 34 27 34 31 C34 37 41 42 41 42 C41 42 48 37 48 31 Z"
              fill="#F0443E"
            />
            {/* Mini corner heart */}
            <path
              d="M59 47 C59 45.5 57 44.5 56 46 C55 44.5 53 45.5 53 47 C53 49.5 56 51 56 51 C56 51 59 49.5 59 47 Z"
              fill="#F0443E"
            />
          </g>
        </svg>
      );

    case 'sudden_death':
      return (
        <svg viewBox="0 0 80 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          {/* Flame aura */}
          <path
            d="M20 46 C16 38 18 26 26 20 C27 28 32 23 35 15 C39 24 45 10 50 8 C48 18 56 16 60 25 C64 31 66 38 62 46 C58 53 48 56 40 56 C28 56 22 52 20 46 Z"
            fill="#FFAA00"
          />
          <path
            d="M25 48 C22 41 24 32 30 27 C31 32 35 28 37 22 C40 28 44 20 47 18 C46 25 51 24 54 30 C57 35 58 41 55 47 C51 53 45 54 40 54 C32 54 27 52 25 48 Z"
            fill="#FF4400"
          />
          <path
            d="M30 49 C28 45 30 38 34 35 C35 38 38 35 40 30 C42 34 45 30 46 29 C45 34 48 33 50 37 C52 40 53 44 50 48 C47 52 43 53 40 53 C35 53 32 51 30 49 Z"
            fill="#FFD700"
          />

          {/* Skull Head */}
          <path
            d="M28 32 C28 24 33 18 40 18 C47 18 52 24 52 32 C52 38 49 41 49 44 C49 46 47 47 45 47 L35 47 C33 47 31 46 31 44 C31 41 28 38 28 32 Z"
            fill="#FFFFFF"
            stroke="#241B18"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />

          {/* Eye Sockets */}
          <ellipse cx="34" cy="32" rx="4" ry="4.5" fill="#241B18" />
          <ellipse cx="46" cy="32" rx="4" ry="4.5" fill="#241B18" />
          {/* Eye reflections */}
          <circle cx="33" cy="31" r="1.2" fill="#FFFFFF" />
          <circle cx="45" cy="31" r="1.2" fill="#FFFFFF" />

          {/* Nose */}
          <path d="M39 37 L41 37 L40 40 Z" fill="#241B18" />

          {/* Teeth */}
          <line x1="36" y1="43" x2="36" y2="47" stroke="#241B18" strokeWidth="2" strokeLinecap="round" />
          <line x1="40" y1="43" x2="40" y2="47" stroke="#241B18" strokeWidth="2" strokeLinecap="round" />
          <line x1="44" y1="43" x2="44" y2="47" stroke="#241B18" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );

    case 'food_brawl':
      return (
        <svg viewBox="0 0 80 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          {/* Left Fighter: Burger */}
          <g transform="translate(6, 16)">
            {/* Top Bun */}
            <path d="M6 16 C6 8 13 4 22 4 C31 4 38 8 38 16 Z" fill="#E89B38" stroke="#241B18" strokeWidth="2" />
            {/* Sesame seeds */}
            <circle cx="16" cy="9" r="1" fill="#FFFFFF" />
            <circle cx="24" cy="8" r="1" fill="#FFFFFF" />
            <circle cx="28" cy="11" r="1" fill="#FFFFFF" />
            {/* Patty */}
            <rect x="5" y="17" width="34" height="6" rx="3" fill="#693B11" stroke="#241B18" strokeWidth="2" />
            {/* Cheese */}
            <path d="M7 17 L37 17 L30 22 L20 18 L12 21 Z" fill="#FFC72C" />
            {/* Bottom bun */}
            <rect x="7" y="24" width="30" height="6" rx="3" fill="#E89B38" stroke="#241B18" strokeWidth="2" />
            {/* Boxing glove/eyebrow punch look */}
            <circle cx="18" cy="12" r="1.8" fill="#241B18" />
            <circle cx="26" cy="12" r="1.8" fill="#241B18" />
            <path d="M16 9 L20 11" stroke="#241B18" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M28 9 L24 11" stroke="#241B18" strokeWidth="1.5" strokeLinecap="round" />
          </g>

          {/* Right Fighter: French Fries */}
          <g transform="translate(42, 12)">
            {/* Fries Pack Box */}
            <path d="M7 18 L27 18 L24 38 L10 38 Z" fill="#EF4444" stroke="#241B18" strokeWidth="2" />
            <path d="M12 24 C14 26 20 26 22 24" stroke="#FFD75A" strokeWidth="2" strokeLinecap="round" />
            {/* Fries Sticks */}
            <rect x="9" y="8" width="4" height="12" rx="1.5" fill="#FBBF24" stroke="#241B18" strokeWidth="1.5" />
            <rect x="14" y="4" width="4" height="16" rx="1.5" fill="#FBBF24" stroke="#241B18" strokeWidth="1.5" />
            <rect x="19" y="7" width="4" height="13" rx="1.5" fill="#FBBF24" stroke="#241B18" strokeWidth="1.5" />
            <rect x="23" y="11" width="3.5" height="10" rx="1.5" fill="#FBBF24" stroke="#241B18" strokeWidth="1.5" />
            {/* Angry face on pack */}
            <circle cx="14" cy="29" r="1.5" fill="#FFFFFF" />
            <circle cx="20" cy="29" r="1.5" fill="#FFFFFF" />
            <circle cx="14" cy="29" r="0.8" fill="#241B18" />
            <circle cx="20" cy="29" r="0.8" fill="#241B18" />
          </g>

          {/* Center VS Burst */}
          <g transform="translate(32, 18)">
            <polygon
              points="10,0 13,6 19,3 17,9 23,12 17,15 19,21 13,18 10,24 7,18 1,21 3,15 -3,12 3,9 1,3 7,6"
              fill="#FFD700"
              stroke="#241B18"
              strokeWidth="2"
            />
            <text x="5.5" y="15" fontFamily="sans-serif" fontWeight="900" fontSize="8" fill="#241B18">VS</text>
          </g>
        </svg>
      );

    case 'food_race':
      return (
        <svg viewBox="0 0 80 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          {/* Checkered Flag */}
          <g transform="translate(8, 10)">
            {/* Flagpole */}
            <line x1="6" y1="4" x2="6" y2="40" stroke="#241B18" strokeWidth="2.5" strokeLinecap="round" />
            {/* Flag */}
            <g transform="translate(6, 4)">
              <rect x="0" y="0" width="18" height="18" fill="#FFFFFF" stroke="#241B18" strokeWidth="1.5" />
              {/* Checkers */}
              <rect x="0" y="0" width="6" height="6" fill="#241B18" />
              <rect x="12" y="0" width="6" height="6" fill="#241B18" />
              <rect x="6" y="6" width="6" height="6" fill="#241B18" />
              <rect x="0" y="12" width="6" height="6" fill="#241B18" />
              <rect x="12" y="12" width="6" height="6" fill="#241B18" />
            </g>
          </g>

          {/* Running Burger with Sneakers */}
          <g transform="translate(36, 12)">
            {/* Speed lines */}
            <line x1="-8" y1="18" x2="-2" y2="18" stroke="#38BDF8" strokeWidth="2" strokeLinecap="round" />
            <line x1="-10" y1="24" x2="-1" y2="24" stroke="#38BDF8" strokeWidth="2" strokeLinecap="round" />
            <line x1="-6" y1="30" x2="-1" y2="30" stroke="#38BDF8" strokeWidth="2" strokeLinecap="round" />

            {/* Burger body */}
            <path d="M4 14 C4 6 12 2 21 2 C30 2 38 6 38 14 Z" fill="#E89B38" stroke="#241B18" strokeWidth="2" />
            <rect x="3" y="15" width="36" height="5" rx="2.5" fill="#693B11" stroke="#241B18" strokeWidth="1.5" />
            <path d="M5 16 L37 16 L31 20 L21 17 L11 20 Z" fill="#FFC72C" />
            <rect x="5" y="21" width="32" height="5" rx="2.5" fill="#E89B38" stroke="#241B18" strokeWidth="2" />

            {/* Determined face */}
            <circle cx="16" cy="10" r="1.5" fill="#241B18" />
            <circle cx="26" cy="10" r="1.5" fill="#241B18" />
            <path d="M14 7 L18 9" stroke="#241B18" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M28 7 L24 9" stroke="#241B18" strokeWidth="1.5" strokeLinecap="round" />
            {/* Sweat drop */}
            <path d="M33 6 C33 4 35 3 35 3 C35 3 37 4 37 6 C37 7.5 35 8.5 35 8.5 C35 8.5 33 7.5 33 6 Z" fill="#38BDF8" />

            {/* Running legs & sneakers */}
            {/* Left leg (forward) */}
            <path d="M14 26 L10 35 L16 35" stroke="#241B18" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            <rect x="8" y="34" width="10" height="4.5" rx="2" fill="#EF4444" stroke="#241B18" strokeWidth="1.5" />
            {/* Right leg (back) */}
            <path d="M26 26 L30 32 L36 31" stroke="#241B18" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            <rect x="30" y="30" width="9" height="4.5" rx="2" fill="#EF4444" stroke="#241B18" strokeWidth="1.5" transform="rotate(-15 34 32)" />
          </g>
        </svg>
      );

    case 'pick_a_box':
      return (
        <svg viewBox="0 0 80 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          {/* Sparkles */}
          <path d="M16 12L17.5 16.5L22 18L17.5 19.5L16 24L14.5 19.5L10 18L14.5 16.5L16 12Z" fill="#F59E0B" />
          <path d="M66 10L67 13L70 14L67 15L66 18L65 15L62 14L65 13L66 10Z" fill="#A855F7" />
          <path d="M70 42L71 45L74 46L71 47L70 50L69 47L66 46L69 45L70 42Z" fill="#F59E0B" />

          {/* 3D Mystery Box */}
          <g transform="translate(18, 12)">
            {/* Top lid rhombus */}
            <polygon
              points="22,4 42,12 22,20 2,12"
              fill="#FDE047"
              stroke="#241B18"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
            {/* Ribbon on top */}
            <polygon points="17,8 27,12 27,16 17,12" fill="#F97316" />
            <polygon points="7,10 12,12 32,4 27,2" fill="#F97316" />

            {/* Left side face */}
            <polygon
              points="2,12 22,20 22,42 2,34"
              fill="#EAB308"
              stroke="#241B18"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
            {/* Left ribbon */}
            <polygon points="10,15 14,17 14,39 10,37" fill="#EA580C" />

            {/* Right side face */}
            <polygon
              points="22,20 42,12 42,34 22,42"
              fill="#CA8A04"
              stroke="#241B18"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
            {/* Right ribbon */}
            <polygon points="30,17 34,15 34,37 30,39" fill="#C2410C" />

            {/* Question Mark on Left Face */}
            <text
              x="5"
              y="32"
              fontFamily="sans-serif"
              fontWeight="900"
              fontSize="16"
              fill="#241B18"
              transform="skewY(18)"
            >
              ?
            </text>
          </g>
        </svg>
      );

    case 'emoji_clash':
      return (
        <svg viewBox="0 0 80 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          {/* Sparkles / Clash Sparks */}
          <path d="M40 8L41.5 13L46 14.5L41.5 16L40 21L38.5 16L34 14.5L38.5 13L40 8Z" fill="#F59E0B" />
          <line x1="36" y1="12" x2="44" y2="18" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" />
          <line x1="44" y1="12" x2="36" y2="18" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" />

          {/* Left Joyful/Laughing Emoji */}
          <g transform="translate(10, 16)">
            <circle cx="18" cy="18" r="16" fill="#FBBF24" stroke="#241B18" strokeWidth="2.5" />
            {/* Happy squint eyes */}
            <path d="M10 15 C12 11 15 11 17 15" stroke="#241B18" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M19 15 C21 11 24 11 26 15" stroke="#241B18" strokeWidth="2.5" strokeLinecap="round" />
            {/* Big open smile */}
            <path d="M11 20 C11 27 25 27 25 20 Z" fill="#991B1B" stroke="#241B18" strokeWidth="2" />
            <path d="M14 24 C16 26 20 26 22 24" fill="#EF4444" />
            {/* Rosy cheeks */}
            <circle cx="9" cy="21" r="2.5" fill="#F87171" opacity="0.7" />
          </g>

          {/* Right Angry/Fierce Emoji */}
          <g transform="translate(36, 16)">
            <circle cx="18" cy="18" r="16" fill="#EF4444" stroke="#241B18" strokeWidth="2.5" />
            {/* Angry slanted eyebrows */}
            <line x1="9" y1="12" x2="16" y2="16" stroke="#241B18" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="27" y1="12" x2="20" y2="16" stroke="#241B18" strokeWidth="2.5" strokeLinecap="round" />
            {/* Angry white eyes */}
            <circle cx="13" cy="18" r="3" fill="#FFFFFF" stroke="#241B18" strokeWidth="1.5" />
            <circle cx="23" cy="18" r="3" fill="#FFFFFF" stroke="#241B18" strokeWidth="1.5" />
            <circle cx="12" cy="18" r="1.5" fill="#241B18" />
            <circle cx="24" cy="18" r="1.5" fill="#241B18" />
            {/* Grimace / grit teeth mouth */}
            <rect x="11" y="24" width="14" height="5" rx="2" fill="#FFFFFF" stroke="#241B18" strokeWidth="2" />
            <line x1="15" y1="24" x2="15" y2="29" stroke="#241B18" strokeWidth="1.5" />
            <line x1="18" y1="24" x2="18" y2="29" stroke="#241B18" strokeWidth="1.5" />
            <line x1="21" y1="24" x2="21" y2="29" stroke="#241B18" strokeWidth="1.5" />
          </g>
        </svg>
      );

    case 'sizzling_skillet':
      return (
        <svg viewBox="0 0 100 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          {/* Flames rising from skillet */}
          <path
            d="M36 28 C30 20 32 10 39 4 C40 10 44 8 46 2 C49 9 53 3 56 6 C55 13 60 11 63 17 C66 22 66 27 63 32 Z"
            fill="#FFAA00"
          />
          <path
            d="M39 28 C34 22 36 14 41 9 C42 14 45 12 47 7 C49 13 52 8 54 11 C54 16 57 15 59 19 C61 23 61 27 59 31 Z"
            fill="#FF4400"
          />
          <path
            d="M43 28 C40 24 41 19 44 15 C45 18 47 17 48 13 C49 17 51 14 52 16 C53 19 55 18 56 21 C57 24 56 27 55 30 Z"
            fill="#FFD700"
          />

          {/* Cast Iron Skillet Body */}
          <g transform="translate(14, 18)">
            {/* Skillet Handle */}
            <path
              d="M58 26 L76 34 C78 35 78 38 76 39 C74 40 71 40 69 39 L52 30 Z"
              fill="#241B18"
            />
            {/* Handle hole */}
            <ellipse cx="72" cy="37" rx="2" ry="1.2" fill="#F0FDF4" />

            {/* Skillet Outer Rim / Base */}
            <ellipse cx="36" cy="27" rx="26" ry="12" fill="#241B18" />
            <ellipse cx="36" cy="25" rx="25" ry="11" fill="#3D302A" />

            {/* Skillet Hot Cooking Surface */}
            <ellipse cx="36" cy="25" rx="22" ry="9" fill="#1C1412" />

            {/* Sizzle oil sheen and hot highlights */}
            <path
              d="M20 25 C20 28 32 31 46 29 C40 27 30 26 20 25 Z"
              fill="#FF9900"
              opacity="0.8"
            />
            <ellipse cx="44" cy="23" rx="8" ry="3" fill="#FFE082" opacity="0.6" />
            <circle cx="28" cy="23" r="1.5" fill="#FFE082" opacity="0.9" />
            <circle cx="34" cy="26" r="1.2" fill="#FFE082" opacity="0.9" />
            <circle cx="42" cy="25" r="1" fill="#FFE082" opacity="0.9" />
          </g>
        </svg>
      );

    default:
      return (
        <div className={`${className} flex items-center justify-center text-2xl`}>
          🎮
        </div>
      );
  }
};
