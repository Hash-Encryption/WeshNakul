import type { RestaurantItem } from './restaurant';

export type ShuffleCardsPhase =
  | 'initial_reveal'
  | 'vortex_qualifier'
  | 'finalists_reveal'
  | 'flipping_down'
  | 'shuffling'
  | 'pick_ready'
  | 'revealing_pick'
  | 'shuffle_again_bounce'
  | 'winner_celebration'
  | 'completed';

export interface ShuffleCardItem {
  id: string;
  isShuffleAgain: boolean;
  restaurant?: RestaurantItem;
  contenderLabel?: string;
  isFaceUp: boolean;
  isZoomed: boolean;
  isWinner: boolean;
  isEjected: boolean;
  slotIndex: number;
}

export type ShuffleCardsRealtimeMessage =
  | {
      type: 'shuffle_cards_start';
      captainId: string;
      captainNickname: string;
      captainColor?: string;
      contenderIds: string[];
      winnerId: string;
      seed: string;
    }
  | {
      type: 'shuffle_cards_pick';
      cardIndex: number;
      isShuffleAgain: boolean;
      pickedByParticipantId: string;
    }
  | {
      type: 'shuffle_cards_again';
      seed: string;
      attempt: number;
    }
  | {
      type: 'shuffle_cards_finalized';
      winnerId: string;
    };
