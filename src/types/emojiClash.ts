import type { RestaurantItem } from './restaurant';

export type EmojiClashPhase =
  | 'fighter_select' // 10s
  | 'squad_fusion'   // 5.5s staged
  | 'brawl'          // 15s
  | 'podium'         // winner celebration
  | 'completed';     // finalized

export type SquadFusionStage = 'fusion_intro' | 'banner_drop' | 'fight_callout';

export type EmojiFighterId =
  | 'troll'       // 😂
  | 'infernal'    // 🔥
  | 'mischief'    // 😈
  | 'joker'       // 🤡
  | 'heavyweight' // 🥊
  | 'rex'         // 🦖
  | 'chili'       // 🌶️
  | 'doom';       // 💀

export interface EmojiFighterOption {
  id: EmojiFighterId;
  emoji: string;
  nameKey: string;
  defaultTitleEn: string;
  defaultTitleAr: string;
  themeColor: string;
}

export const EMOJI_FIGHTERS: EmojiFighterOption[] = [
  { id: 'troll', emoji: '😂', nameKey: 'emojiClash.fighters.troll', defaultTitleEn: 'The Troll', defaultTitleAr: 'الضحوك', themeColor: '#F59E0B' },
  { id: 'infernal', emoji: '🔥', nameKey: 'emojiClash.fighters.infernal', defaultTitleEn: 'Infernal', defaultTitleAr: 'المشتعل', themeColor: '#EF4444' },
  { id: 'mischief', emoji: '😈', nameKey: 'emojiClash.fighters.mischief', defaultTitleEn: 'Mischief', defaultTitleAr: 'المشاكس', themeColor: '#8B5CF6' },
  { id: 'joker', emoji: '🤡', nameKey: 'emojiClash.fighters.joker', defaultTitleEn: 'The Joker', defaultTitleAr: 'المهرج', themeColor: '#EC4899' },
  { id: 'heavyweight', emoji: '🥊', nameKey: 'emojiClash.fighters.heavyweight', defaultTitleEn: 'Heavyweight', defaultTitleAr: 'الملاكم', themeColor: '#DC2626' },
  { id: 'rex', emoji: '🦖', nameKey: 'emojiClash.fighters.rex', defaultTitleEn: 'Rex', defaultTitleAr: 'الديناصور', themeColor: '#10B981' },
  { id: 'chili', emoji: '🌶️', nameKey: 'emojiClash.fighters.chili', defaultTitleEn: 'Hot Chili', defaultTitleAr: 'الحار', themeColor: '#EA580C' },
  { id: 'doom', emoji: '💀', nameKey: 'emojiClash.fighters.doom', defaultTitleEn: 'Doom', defaultTitleAr: 'القاضي', themeColor: '#6B7280' },
];

export type SpiceItemType = 'spice' | 'garlic' | 'fire';

export interface SquadMember {
  participantId: string;
  nickname: string;
  playerColor?: string;
}

export interface EmojiSquad {
  squadId: string;
  emoji: string;
  fighterId: EmojiFighterId;
  members: SquadMember[];
  isMega: boolean;
  restaurant: RestaurantItem;
  ringColor: string;
  ringBorderColor: string;
  isWinner: boolean;
  baseSize: number; // dynamically scaled: 2 squads: 72/88px, 3-4: 56/70px, 5-8: 46/58px
  initialPos: { x: number; y: number };
}

export type EmojiClashRealtimeMessage =
  | {
      type: 'emoji_clash_start';
      contenderIds: string[];
      winnerRestaurantId: string;
      battleSeed: number;
      startedAt: number;
    }
  | {
      type: 'emoji_fighter_pick';
      participantId: string;
      emoji: string;
      fighterId: EmojiFighterId;
      nickname: string;
      playerColor?: string;
    }
  | {
      type: 'mustard_tap';
      participantId: string;
      tapIndex: number;
    }
  | {
      type: 'spice_throw';
      participantId: string;
      item: SpiceItemType;
      throwAngle: number;
      throwSeed: number;
    }
  | {
      type: 'emoji_clash_finalized';
      winnerRestaurantId: string;
    };
