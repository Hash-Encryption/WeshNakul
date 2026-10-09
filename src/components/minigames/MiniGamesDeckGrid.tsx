import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import {
  MINI_GAMES,
  type MiniGameDefinition,
  type MiniGameSuitabilityContext,
  type TieType,
} from '../../config/miniGames';
import { MiniGameDeckCard } from './MiniGameDeckCard';

interface MiniGamesDeckGridProps {
  tieCount: number;
  activePlayerCount: number;
  tieType?: TieType;
  contenderIds?: string[];
  onSelectGame: (game: MiniGameDefinition) => void;
}

export const MiniGamesDeckGrid: React.FC<MiniGamesDeckGridProps> = ({
  tieCount,
  activePlayerCount,
  tieType = 'restaurant',
  contenderIds,
  onSelectGame,
}) => {
  const suitabilityContext = useMemo<MiniGameSuitabilityContext>(
    () => ({
      tieCount,
      activePlayerCount,
      tieType,
      contenderIds,
    }),
    [tieCount, activePlayerCount, tieType, contenderIds]
  );

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="overflow-hidden w-full pt-1"
    >
      <div className="grid grid-cols-2 gap-2 sm:gap-2.5">
        {MINI_GAMES.map((game) => {
          const suitability = game.getSuitability(suitabilityContext);
          const isWide = game.id === 'sizzling_skillet';

          return (
            <MiniGameDeckCard
              key={game.id}
              game={game}
              suitability={suitability}
              onSelect={onSelectGame}
              isWide={isWide}
            />
          );
        })}
      </div>
    </motion.div>
  );
};
