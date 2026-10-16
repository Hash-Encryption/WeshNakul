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
  onLeave?: () => void;
  showLeave?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onBack,
  showBack = true,
  participantCount = 1,
  showCount = true,
  showMenu = false,
  onMenuClick,
  showLangToggle = false,
  onLeave,
  showLeave = false,
}) => {
  const { isRTL, t } = useLocale();

  return (
    <header className="relative flex items-center justify-between w-full pt-4 pb-2 px-4 z-20">
      {/* Left / Start Action */}
      <div className="min-w-12 flex items-center justify-start gap-1.5">
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
        ) : (showLeave || onLeave) ? (
          <button
            onClick={onLeave}
            type="button"
            className="h-10 px-3 rounded-full bg-white border border-[#241B18]/15 hover:bg-[#F0443E]/10 hover:border-[#F0443E]/30 text-[#241B18] hover:text-[#F0443E] active:scale-95 transition-all shadow-sm flex items-center gap-1.5 text-xs font-black font-alexandria"
            aria-label={isRTL ? 'الخروج للرئيسية' : 'Leave to Home'}
            title={isRTL ? 'الخروج للرئيسية' : 'Leave to Home'}
          >
            <span>🚪</span>
            <span>{isRTL ? 'خروج' : 'Leave'}</span>
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
      <div className="min-w-16 flex items-center justify-end gap-2">
        {showBack && (showLeave || onLeave) && (
          <button
            onClick={onLeave}
            type="button"
            className="h-8 px-2.5 rounded-full bg-white border border-[#241B18]/15 hover:bg-[#F0443E]/10 hover:border-[#F0443E]/30 text-[#241B18] hover:text-[#F0443E] active:scale-95 transition-all shadow-sm flex items-center gap-1 text-[11px] font-black font-alexandria"
            aria-label={isRTL ? 'خروج' : 'Leave'}
            title={isRTL ? 'الخروج للرئيسية' : 'Leave to Home'}
          >
            <span>🚪</span>
            <span className="hidden sm:inline">{isRTL ? 'خروج' : 'Leave'}</span>
          </button>
        )}
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
