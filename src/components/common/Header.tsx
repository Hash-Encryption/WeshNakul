import React from 'react';
import { useLocale } from '../../context/LocaleContext';
import { LanguageToggle } from './LanguageToggle';

interface HeaderProps {
  onBack?: () => void;
  showBack?: boolean;
  participantCount?: number;
  showCount?: boolean;
  showMenu?: boolean;
  onMenuClick?: () => void;
  showLangToggle?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onBack,
  showBack = true,
  participantCount = 1,
  showCount = true,
  showMenu = false,
  onMenuClick,
  showLangToggle = false,
}) => {
  const { isRTL, t } = useLocale();

  return (
    <header className="relative flex items-center justify-between w-full pt-4 pb-2 px-4 z-20">
      {/* Left / Start Action */}
      <div className="w-12 flex items-center justify-start">
        {showBack && onBack ? (
          <button
            onClick={onBack}
            type="button"
            className="w-10 h-10 rounded-full bg-white border border-brand-border/80 flex items-center justify-center text-brand-ink hover:bg-brand-redSoft/50 active:scale-95 transition-all shadow-sm"
            aria-label={t('common.back')}
          >
            <svg
              className={`w-5 h-5 text-brand-red transition-transform ${isRTL ? '' : 'rotate-180'}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        ) : showMenu ? (
          <button
            onClick={onMenuClick}
            type="button"
            className="w-10 h-10 rounded-full bg-white border border-brand-border/80 flex items-center justify-center text-brand-ink hover:bg-brand-redSoft/50 active:scale-95 transition-all shadow-sm text-lg"
            aria-label="Options"
          >
            •••
          </button>
        ) : (
          <div className="w-10" />
        )}
      </div>

      {/* Center Logo Mark */}
      <div className="flex-1 flex items-center justify-center">
        <div className="relative flex items-center justify-center w-12 h-10">
          {/* Yellow Pizza Card */}
          <div className="absolute w-6 h-7 bg-[#FFD75A] rounded-lg transform -rotate-12 -translate-x-2.5 shadow-sm border border-black/5 flex items-center justify-center text-xs">
            🍕
          </div>
          {/* Green Burger Card */}
          <div className="absolute w-6 h-7 bg-[#55B96A] rounded-lg transform rotate-12 translate-x-2.5 shadow-sm border border-black/5 flex items-center justify-center text-xs">
            🍔
          </div>
          {/* Red 3D Arabic Question Mark */}
          <div className="relative z-10 text-brand-red font-bold text-2xl filter drop-shadow-[0_2px_4px_rgba(240,68,62,0.35)] leading-none select-none">
            ؟
          </div>
        </div>
      </div>

      {/* Right / End Action */}
      <div className="w-16 flex items-center justify-end gap-2">
        {showLangToggle && <LanguageToggle />}
        {showCount && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-brand-redSoft border border-brand-red/15 text-brand-red text-xs font-bold shadow-sm">
            <span className="text-sm">👥</span>
            <span>{participantCount}</span>
          </div>
        )}
      </div>
    </header>
  );
};
