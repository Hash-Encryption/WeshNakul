import React from 'react';
import type { FoodCategoryDef } from '../../lib/consensus';

interface CategoryCardProps {
  category: FoodCategoryDef;
  isSelected: boolean;
  onToggle: (id: string) => void;
  disabled?: boolean;
  locale: 'ar' | 'en';
  voteCount?: number;
  percentage?: number;
  showVoteCount?: boolean;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({
  category,
  isSelected,
  onToggle,
  disabled = false,
  locale,
  voteCount = 0,
  percentage = 0,
  showVoteCount = false,
}) => {
  const isWildcard = Boolean(category.isWildcard);
  const name = locale === 'ar' ? category.ar : category.en;

  const handleClick = () => {
    if (!disabled) {
      onToggle(category.id);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled}
      className={`
        relative flex flex-col items-center justify-between p-3.5 rounded-2xl
        border-2 border-brand-ink text-center transition-all duration-150 select-none
        w-full min-h-[110px]
        ${disabled ? 'cursor-default opacity-85' : 'cursor-pointer active:translate-y-1'}
        ${
          isSelected
            ? isWildcard
              ? 'bg-brand-yellow shadow-none translate-y-0.5 ring-2 ring-brand-ink'
              : 'bg-brand-redSoft shadow-none translate-y-0.5 ring-2 ring-brand-red'
            : isWildcard
            ? 'bg-amber-50/80 shadow-[0_4px_0_#241B18] hover:bg-amber-100/50'
            : 'bg-white shadow-[0_4px_0_#241B18] hover:bg-brand-cream/60'
        }
      `}
    >
      {/* Top indicator badge */}
      <div className="w-full flex items-center justify-between pointer-events-none mb-1">
        {isWildcard ? (
          <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-full bg-brand-yellowPressed text-brand-ink">
            {locale === 'ar' ? 'جوكر' : 'Wildcard'}
          </span>
        ) : (
          <span />
        )}

        <div
          className={`
            w-5 h-5 rounded-full border-2 border-brand-ink flex items-center justify-center text-[10px] font-black
            transition-colors
            ${
              isSelected
                ? isWildcard
                  ? 'bg-brand-ink text-brand-yellow'
                  : 'bg-brand-red text-white'
                : 'bg-white text-transparent'
            }
          `}
        >
          ✓
        </div>
      </div>

      {/* Main Emoji Icon */}
      <span className="text-3xl sm:text-4xl my-1 transform transition-transform duration-150 group-hover:scale-110">
        {category.icon}
      </span>

      {/* Title */}
      <span className="font-alexandria font-bold text-xs sm:text-sm text-brand-ink leading-tight line-clamp-2 min-h-[2rem] flex items-center justify-center text-center mt-1">
        {name}
      </span>

      {/* Optional live vote count pill (revealed after submission) */}
      {showVoteCount && (
        <div className="w-full mt-2 pt-1 border-t border-brand-ink/10 flex items-center justify-center gap-1">
          <span className="text-[10px] font-bold text-brand-red">
            {voteCount} {locale === 'ar' ? 'صوت' : 'votes'}
          </span>
          {percentage > 0 && (
            <span className="text-[9px] text-brand-muted font-semibold">
              ({Math.round(percentage * 100)}%)
            </span>
          )}
        </div>
      )}
    </button>
  );
};
