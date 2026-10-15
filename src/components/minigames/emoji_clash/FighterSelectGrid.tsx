import React from 'react';
import { motion } from 'motion/react';
import { useLocale } from '../../../context/LocaleContext';
import {
  EMOJI_FIGHTERS,
  type EmojiFighterId,
  type EmojiFighterOption,
} from '../../../types/emojiClash';
import type { Participant } from '../../../types/database';

interface FighterSelectGridProps {
  selectedFighterId: EmojiFighterId | null;
  onSelectFighter: (fighter: EmojiFighterOption) => void;
  picksByParticipant: Record<string, EmojiFighterId>;
  participants: Participant[];
  currentParticipantId: string;
}

export const FighterSelectGrid: React.FC<FighterSelectGridProps> = ({
  selectedFighterId,
  onSelectFighter,
  picksByParticipant,
  participants,
  currentParticipantId,
}) => {
  const { locale } = useLocale();

  return (
    <div className="w-full max-w-sm mx-auto flex flex-col gap-3 px-2 z-20">
      {/* Title & Prompt */}
      <div className="text-center">
        <h4 className="text-base sm:text-lg font-black text-white font-alexandria tracking-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
          {locale === 'ar' ? 'اختر مقاتلك المفضل! 🥊' : 'Select Your Fighter! 🥊'}
        </h4>
        <p className="text-xs font-semibold text-amber-300 font-alexandria">
          {locale === 'ar'
            ? 'اضغط لتثبيت اختيارك قبل نهاية العداد'
            : 'Tap an emoji to lock in your champion'}
        </p>
      </div>

      {/* 2x4 Arcade Grid */}
      <div className="grid grid-cols-4 gap-2 sm:gap-2.5">
        {EMOJI_FIGHTERS.map((fighter, index) => {
          const isSelected = selectedFighterId === fighter.id;

          // Find all participants who picked this emoji
          const pickingParticipants = participants.filter(
            (p) => picksByParticipant[p.id] === fighter.id
          );

          return (
            <motion.button
              key={fighter.id}
              type="button"
              onClick={() => onSelectFighter(fighter)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.92 }}
              animate={
                isSelected
                  ? { scale: [1, 1.08, 1], transition: { duration: 0.25 } }
                  : { y: [0, -3, 0] }
              }
              transition={
                isSelected
                  ? undefined
                  : {
                      duration: 2.2,
                      repeat: Infinity,
                      ease: 'easeInOut',
                      delay: index * 0.15,
                    }
              }
              className={`relative rounded-2xl p-2 sm:p-2.5 flex flex-col items-center justify-between border-2 transition-all cursor-pointer backdrop-blur-md overflow-hidden ${
                isSelected
                  ? 'bg-gradient-to-b from-amber-400/30 to-amber-600/40 border-[#FFD700] shadow-[0_0_16px_rgba(255,215,0,0.7)] ring-2 ring-amber-300'
                  : 'bg-white/10 hover:bg-white/15 border-white/20 shadow-[0_4px_10px_rgba(0,0,0,0.4)]'
              }`}
            >
              {/* Glossy top shine */}
              <div className="absolute top-0 inset-x-0 h-1/2 bg-gradient-to-b from-white/20 to-transparent pointer-events-none rounded-t-2xl" />

              {/* Emoji Icon with Idle Breathing */}
              <span className="text-3xl sm:text-4xl filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.6)] py-1">
                {fighter.emoji}
              </span>

              {/* Localized Fighter Title */}
              <div className="w-full text-center mt-1 z-10 leading-none">
                <span className="block text-[11px] font-black text-white font-alexandria truncate drop-shadow-[0_1px_2px_#000]">
                  {locale === 'ar' ? fighter.defaultTitleAr : fighter.defaultTitleEn}
                </span>
              </div>

              {/* Attached Contributor Avatar Pills */}
              {pickingParticipants.length > 0 && (
                <div className="flex items-center justify-center -space-x-1.5 rtl:space-x-reverse mt-1.5 z-10">
                  {pickingParticipants.map((p) => {
                    const isMe = p.id === currentParticipantId;
                    return (
                      <div
                        key={p.id}
                        title={p.nickname}
                        style={{ backgroundColor: p.player_color || '#FFD75A' }}
                        className={`w-5 h-5 rounded-full border border-black text-[9px] font-black flex items-center justify-center text-black shadow-xs ${
                          isMe ? 'ring-2 ring-white scale-110 z-20' : ''
                        }`}
                      >
                        {p.nickname.slice(0, 1).toUpperCase()}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Lock-in checkmark */}
              {isSelected && (
                <div className="absolute top-1 end-1 w-4 h-4 rounded-full bg-emerald-500 border border-white text-[9px] font-black text-white flex items-center justify-center shadow-xs">
                  ✓
                </div>
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};
