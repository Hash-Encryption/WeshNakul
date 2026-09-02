import React, { useState } from 'react';
import { motion } from 'motion/react';
import type { Room, Participant } from '../../types/database';
import { useLocale } from '../../context/LocaleContext';
import { getProceduralToken } from '../../lib/tokenGenerator';
import { Header } from '../common/Header';
import { ProceduralAvatar } from '../common/ProceduralAvatar';
import { TactileButton } from '../common/TactileButton';
import { SparkleRays, DoodleHeart } from '../common/DecorativeSparkles';

interface GuestJoinScreenProps {
  room: Room;
  participants: Participant[];
  onJoin: (nickname: string) => Promise<void>;
  onBack: () => void;
  isLoading?: boolean;
  error?: string | null;
}

export const GuestJoinScreen: React.FC<GuestJoinScreenProps> = ({
  room,
  participants,
  onJoin,
  onBack,
  isLoading = false,
  error,
}) => {
  const { locale, t } = useLocale();
  const [nickname, setNickname] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  // Live procedural token preview
  const nextToken = getProceduralToken(participants.length);

  const getEatingModeLabel = (mode: string) => {
    switch (mode) {
      case 'delivery':
        return t('mode.delivery');
      case 'dine_in':
        return t('mode.dineIn');
      case 'any':
      default:
        return t('mode.flexible');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nickname.trim()) {
      setLocalError(t('guest.nicknameLabel'));
      return;
    }
    setLocalError(null);
    await onJoin(nickname.trim());
  };

  return (
    <div className="relative flex flex-col justify-between min-h-[92dvh] w-full px-4 pb-6">
      <div>
        {/* Header with Language Toggle & Count */}
        <Header
          onBack={onBack}
          participantCount={participants.length}
          showCount={true}
          showLangToggle={true}
        />

        {/* Heading */}
        <div className="text-center mt-3 mb-5 px-2 relative">
          <DoodleHeart className="absolute top-0 end-4 transform rotate-12" color="#55B96A" />
          <h2 className="text-3xl sm:text-4xl font-extrabold text-brand-ink mb-1.5 font-alexandria tracking-tight">
            {t('guest.joinTitle')}
          </h2>
          <p className="text-brand-gray text-xs sm:text-sm font-medium">
            {t('guest.joinSubtitle')}
          </p>
        </div>

        {/* Room Info Summary Pill */}
        <div className="max-w-sm mx-auto mb-5 p-4 rounded-3xl bg-white border border-brand-border shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-brand-cream border border-brand-border flex items-center justify-center text-xl">
              📍
            </div>
            <div>
              <span className="text-xs font-bold text-brand-gray/80 block">
                {room.city} {room.neighborhood ? `• ${room.neighborhood}` : ''}
              </span>
              <span className="text-sm font-extrabold text-brand-ink">
                {getEatingModeLabel(room.eating_mode)}
              </span>
            </div>
          </div>
          <div className="text-end">
            <span className="text-xs font-mono font-bold text-brand-red bg-brand-redSoft px-2.5 py-1 rounded-xl">
              #{room.code}
            </span>
          </div>
        </div>

        {/* Interactive Nickname & Token Preview */}
        <div className="max-w-sm mx-auto bg-white rounded-3xl p-6 border border-brand-border shadow-sm text-center">
          {/* Live Procedural Token Avatar */}
          <div className="flex flex-col items-center justify-center mb-4">
            <motion.div
              key={nickname ? nickname[0] : 'empty'}
              initial={{ scale: 0.85, opacity: 0.8 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            >
              <ProceduralAvatar
                nickname={nickname || '?'}
                shape={nextToken.shape}
                color={nextToken.color}
                size="xl"
              />
            </motion.div>
            <span className="text-[11px] font-semibold text-brand-gray mt-2">
              {locale === 'ar' ? 'رمزك التلقائي' : 'Your Squad Token'}
            </span>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <div className="text-start">
              <label htmlFor="guest-nickname-input" className="text-xs font-bold text-brand-ink mb-1.5 block">
                {t('guest.nicknameLabel')}
              </label>
              <input
                id="guest-nickname-input"
                type="text"
                value={nickname}
                onChange={(e) => {
                  setNickname(e.target.value);
                  setLocalError(null);
                }}
                placeholder={t('guest.nicknamePlaceholder')}
                maxLength={25}
                autoFocus
                className="w-full py-3.5 px-4 rounded-2xl border-2 border-brand-border bg-brand-cream/40 focus:bg-white focus:border-brand-red focus:outline-none text-center text-lg font-bold text-brand-ink placeholder:text-brand-gray/50 transition-all"
              />
              {(localError || error) && (
                <p className="text-xs text-brand-red font-semibold mt-2 text-center">
                  {localError || error}
                </p>
              )}
            </div>
          </form>
        </div>
      </div>

      {/* Bottom Sticky Action */}
      <div className="relative max-w-sm w-full mx-auto mt-6 pt-2">
        <SparkleRays className="absolute top-0 start-2 transform rotate-12 scale-75" color="#FFD75A" />
        <SparkleRays className="absolute bottom-2 end-2 transform -rotate-12 scale-75" color="#FFD75A" />

        <TactileButton
          onClick={handleSubmit}
          variant="primary"
          fullWidth
          size="lg"
          isLoading={isLoading}
          disabled={!nickname.trim()}
        >
          {t('guest.submit')}
        </TactileButton>
      </div>
    </div>
  );
};
