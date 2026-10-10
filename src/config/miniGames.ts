export type MiniGameId =
  | 'shuffle_cards'
  | 'sudden_death'
  | 'food_brawl'
  | 'food_race'
  | 'pick_a_box'
  | 'emoji_clash'
  | 'sizzling_skillet';

export type TieType = 'restaurant' | 'category';

export type MiniGameSuitabilityState = 'recommended' | 'normal' | 'less_ideal' | 'unavailable';

export interface MiniGameSuitabilityContext {
  tieCount: number;
  activePlayerCount: number;
  tieType: TieType;
  contenderIds?: string[];
}

export interface MiniGameSuitabilityResult {
  state: MiniGameSuitabilityState;
  badgeKey?: string;
  reasonKey?: string;
  reasonParams?: Record<string, string | number>;
}

export interface MiniGameDefinition {
  id: MiniGameId;
  nameKey: string;
  descriptionKey: string;
  imageAsset: string;
  bgClass: string;
  needsCaptain: boolean;
  minPlayers: number;
  implemented: boolean;
  idealTieCounts?: number[];
  supportedTieCounts?: number[];
  getSuitability: (ctx: MiniGameSuitabilityContext) => MiniGameSuitabilityResult;
}

export const MINI_GAMES: MiniGameDefinition[] = [
  {
    id: 'shuffle_cards',
    nameKey: 'gameSwiper.gameShuffleCards',
    descriptionKey: 'gameSwiper.gameShuffleCardsDesc',
    imageAsset: 'shuffle_cards',
    bgClass: 'bg-[#FFF1ED]',
    needsCaptain: true,
    minPlayers: 2,
    implemented: false,
    idealTieCounts: [3],
    supportedTieCounts: [2, 3, 4],
    getSuitability: ({ tieCount, activePlayerCount }) => {
      if (activePlayerCount < 2) {
        return {
          state: 'unavailable',
          reasonKey: 'gameSwiper.badgeNeedsPlayers',
          reasonParams: { count: 2 },
        };
      }
      if (tieCount === 3) {
        return {
          state: 'recommended',
          badgeKey: 'gameSwiper.badgeBestForTie',
        };
      }
      if (tieCount === 2 || tieCount === 4) {
        return { state: 'normal' };
      }
      if (tieCount >= 5) {
        return { state: 'less_ideal' };
      }
      return { state: 'normal' };
    },
  },
  {
    id: 'sudden_death',
    nameKey: 'gameSwiper.gameSuddenDeath',
    descriptionKey: 'gameSwiper.gameSuddenDeathDesc',
    imageAsset: 'sudden_death',
    bgClass: 'bg-[#FFF6E6]',
    needsCaptain: false,
    minPlayers: 1,
    implemented: true,
    idealTieCounts: [2],
    supportedTieCounts: [2],
    getSuitability: ({ tieCount }) => {
      if (tieCount === 2) {
        return {
          state: 'recommended',
          badgeKey: 'gameSwiper.badgeBestForTie',
        };
      }
      return { state: 'normal' };
    },
  },
  {
    id: 'food_brawl',
    nameKey: 'gameSwiper.gameFoodBrawl',
    descriptionKey: 'gameSwiper.gameFoodBrawlDesc',
    imageAsset: 'food_brawl',
    bgClass: 'bg-[#EDFAF0]',
    needsCaptain: true,
    minPlayers: 2,
    implemented: false,
    getSuitability: ({ activePlayerCount }) => {
      if (activePlayerCount < 2) {
        return {
          state: 'unavailable',
          reasonKey: 'gameSwiper.badgeNeedsPlayers',
          reasonParams: { count: 2 },
        };
      }
      return { state: 'normal' };
    },
  },
  {
    id: 'food_race',
    nameKey: 'gameSwiper.gameFoodRace',
    descriptionKey: 'gameSwiper.gameFoodRaceDesc',
    imageAsset: 'food_race',
    bgClass: 'bg-[#EDF7FC]',
    needsCaptain: true,
    minPlayers: 2,
    implemented: false,
    getSuitability: ({ activePlayerCount }) => {
      if (activePlayerCount < 2) {
        return {
          state: 'unavailable',
          reasonKey: 'gameSwiper.badgeNeedsPlayers',
          reasonParams: { count: 2 },
        };
      }
      return { state: 'normal' };
    },
  },
  {
    id: 'pick_a_box',
    nameKey: 'gameSwiper.gamePickABox',
    descriptionKey: 'gameSwiper.gamePickABoxDesc',
    imageAsset: 'pick_a_box',
    bgClass: 'bg-[#F6EEFD]',
    needsCaptain: true,
    minPlayers: 2,
    implemented: false,
    getSuitability: ({ activePlayerCount }) => {
      if (activePlayerCount < 2) {
        return {
          state: 'unavailable',
          reasonKey: 'gameSwiper.badgeNeedsPlayers',
          reasonParams: { count: 2 },
        };
      }
      return { state: 'normal' };
    },
  },
  {
    id: 'emoji_clash',
    nameKey: 'gameSwiper.gameEmojiClash',
    descriptionKey: 'gameSwiper.gameEmojiClashDesc',
    imageAsset: 'emoji_clash',
    bgClass: 'bg-[#FDEDF2]',
    needsCaptain: true,
    minPlayers: 2,
    implemented: false,
    getSuitability: ({ activePlayerCount }) => {
      if (activePlayerCount < 2) {
        return {
          state: 'unavailable',
          reasonKey: 'gameSwiper.badgeNeedsPlayers',
          reasonParams: { count: 2 },
        };
      }
      return { state: 'normal' };
    },
  },
  {
    id: 'sizzling_skillet',
    nameKey: 'gameSwiper.gameSizzlingSkillet',
    descriptionKey: 'gameSwiper.gameSizzlingSkilletDesc',
    imageAsset: 'sizzling_skillet',
    bgClass: 'bg-[#F0FDF4]',
    needsCaptain: false,
    minPlayers: 3,
    implemented: false,
    getSuitability: ({ activePlayerCount }) => {
      if (activePlayerCount < 3) {
        return {
          state: 'unavailable',
          reasonKey: 'gameSwiper.badgeNeedsPlayers',
          reasonParams: { count: 3 },
        };
      }
      return { state: 'normal' };
    },
  },
];
