import React from 'react';
import { ChatTeardropText } from '@phosphor-icons/react';
import { useLocale } from '../../context/LocaleContext';

interface FeedbackFloatingButtonProps {
  onClick: () => void;
  isOpen?: boolean;
}

export const FeedbackFloatingButton: React.FC<FeedbackFloatingButtonProps> = ({
  onClick,
  isOpen = false,
}) => {
  const { t } = useLocale();

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={t('feedback.buttonAria')}
      aria-haspopup="dialog"
      aria-expanded={isOpen}
      className="fixed bottom-[max(1.25rem,env(safe-area-inset-bottom))] start-4 sm:start-6 z-40 w-12 h-12 rounded-full bg-brand-red text-white flex items-center justify-center shadow-tactile-red hover:bg-brand-redPressed active:translate-y-0.5 transition-all duration-150 cursor-pointer focus:outline-none focus-visible:ring-3 focus-visible:ring-brand-ink/40 select-none"
    >
      <ChatTeardropText size={24} weight="bold" />
    </button>
  );
};
