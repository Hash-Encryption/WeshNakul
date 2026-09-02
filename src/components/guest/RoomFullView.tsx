import React from 'react';
import { useLocale } from '../../context/LocaleContext';
import { TactileButton } from '../common/TactileButton';

interface RoomFullViewProps {
  onGoHome: () => void;
}

export const RoomFullView: React.FC<RoomFullViewProps> = ({ onGoHome }) => {
  const { t } = useLocale();

  return (
    <div className="flex flex-col items-center justify-center min-h-[85dvh] px-6 py-8 text-center max-w-sm mx-auto">
      <div className="w-20 h-20 rounded-3xl bg-brand-redSoft border-2 border-brand-red/20 flex items-center justify-center text-4xl mb-6 shadow-sm animate-pulse">
        ⛔
      </div>

      <h2 className="text-2xl sm:text-3xl font-extrabold text-brand-ink mb-2 font-alexandria tracking-tight">
        {t('roomFull.title')}
      </h2>

      <p className="text-brand-gray text-sm mb-8">
        {t('roomFull.subtitle')}
      </p>

      <div className="w-full flex flex-col gap-3">
        <TactileButton
          onClick={onGoHome}
          variant="primary"
          fullWidth
          size="lg"
        >
          {t('roomFull.createNew')}
        </TactileButton>

        <TactileButton
          onClick={onGoHome}
          variant="ghost"
          fullWidth
          size="md"
        >
          {t('roomFull.goHome')}
        </TactileButton>
      </div>
    </div>
  );
};
