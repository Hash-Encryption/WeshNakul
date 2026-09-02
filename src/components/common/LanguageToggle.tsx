import React from 'react';
import { useLocale } from '../../context/LocaleContext';

interface LanguageToggleProps {
  className?: string;
}

export const LanguageToggle: React.FC<LanguageToggleProps> = ({ className = '' }) => {
  const { locale, toggleLocale } = useLocale();

  return (
    <button
      onClick={toggleLocale}
      type="button"
      className={`
        inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full
        bg-white/80 backdrop-blur-sm border border-brand-border
        text-xs font-bold text-brand-ink hover:bg-white
        transition-all duration-150 active:scale-95 shadow-sm
        ${className}
      `}
      aria-label="Toggle language"
    >
      <span>{locale === 'ar' ? 'EN' : 'عربي'}</span>
      <span className="text-sm">🌐</span>
    </button>
  );
};
