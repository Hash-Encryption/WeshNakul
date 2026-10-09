import React from 'react';
import type { MiniGameDefinition, MiniGameSuitabilityResult } from '../../config/miniGames';
import { MiniGameArtwork } from './MiniGameArtwork';
import { useLocale } from '../../context/LocaleContext';

interface MiniGameDeckCardProps {
  game: MiniGameDefinition;
  suitability: MiniGameSuitabilityResult;
  onSelect: (game: MiniGameDefinition) => void;
  isWide?: boolean;
}

export const MiniGameDeckCard: React.FC<MiniGameDeckCardProps> = ({
  game,
  suitability,
  onSelect,
  isWide = false,
}) => {
  const { t } = useLocale();

  const isRecommended = suitability.state === 'recommended';
  const isLessIdeal = suitability.state === 'less_ideal';
  const isUnavailable = suitability.state === 'unavailable';

  const handleClick = () => {
    if (isUnavailable) return;
    onSelect(game);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isUnavailable}
      className={`relative w-full rounded-2xl border-2 border-[#241B18] transition-all text-start select-none flex flex-col justify-between overflow-hidden cursor-pointer ${
        game.bgClass
      } ${
        isWide ? 'col-span-2 sm:col-span-2 p-3 sm:p-3.5' : 'p-2.5 sm:p-3'
      } ${
        isUnavailable
          ? 'opacity-50 grayscale-[40%] cursor-not-allowed shadow-[0px_1px_0px_#241B18]'
          : isRecommended
          ? 'shadow-[0px_3px_0px_#241B18] ring-2 ring-[#F0443E]/30 active:translate-y-0.5 active:shadow-none hover:brightness-[1.02]'
          : isLessIdeal
          ? 'opacity-85 shadow-[0px_2px_0px_#241B18] active:translate-y-0.5 active:shadow-none hover:opacity-100'
          : 'shadow-[0px_3px_0px_#241B18] active:translate-y-0.5 active:shadow-none hover:brightness-[1.02]'
      }`}
    >
      {/* Top badges (Recommended or Reason) */}
      <div className="absolute top-2 end-2 z-10 flex flex-col items-end gap-1 pointer-events-none">
        {isRecommended && suitability.badgeKey && (
          <span className="px-2 py-0.5 rounded-full bg-[#FFEFEF] border border-[#F0443E] text-[#F0443E] font-black text-[9px] sm:text-[10px] font-alexandria shadow-xs whitespace-nowrap">
            {t(suitability.badgeKey)}
          </span>
        )}
        {isUnavailable && suitability.reasonKey && (
          <span className="px-2 py-0.5 rounded-full bg-[#F3F4F6] border border-[#6B7280] text-[#4B5563] font-black text-[9px] sm:text-[10px] font-alexandria whitespace-nowrap">
            {t(suitability.reasonKey, suitability.reasonParams)}
          </span>
        )}
      </div>

      {/* Card Content */}
      <div className={isWide ? 'flex items-center gap-3 w-full' : 'flex flex-col gap-1.5 w-full'}>
        {/* Visual Artwork Thumbnail */}
        <div
          className={`shrink-0 flex items-center justify-center ${
            isWide ? 'w-16 h-14' : 'w-full h-13 sm:h-14 py-0.5'
          }`}
        >
          <MiniGameArtwork
            asset={game.imageAsset}
            className={isWide ? 'w-16 h-13 object-contain' : 'w-16 h-13 sm:h-14 object-contain'}
          />
        </div>

        {/* Text Information */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <h5 className="font-alexandria font-black text-xs sm:text-sm text-[#241B18] leading-tight truncate">
              {t(game.nameKey)}
            </h5>
          </div>
          <p className="font-alexandria font-bold text-[10px] sm:text-[11px] text-[#7A6E67] leading-snug mt-0.5 line-clamp-2">
            {t(game.descriptionKey)}
          </p>
        </div>
      </div>
    </button>
  );
};
