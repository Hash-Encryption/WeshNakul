export type Locale = 'ar' | 'en';

export type EatingMode = 'delivery' | 'dine_in' | 'any';

export type RoomStatus = 'lobby' | 'food_selection' | 'restaurant_selection' | 'completed' | 'expired';

export type PlayerShape = 'scallop' | 'squircle' | 'circle' | 'diamond' | 'hexagon';

export type PlayerColor = 
  | '#55B96A'
  | '#F0443E'
  | '#FFD75A'
  | '#73C8EA'
  | '#9B86EC'
  | '#F6A6AD'
  | '#E5D3B3';

export interface Room {
  id: string;
  code: string;
  status: RoomStatus;
  eating_mode: EatingMode;
  city: string;
  neighborhood?: string | null;
  language: Locale;
  host_participant_id?: string | null;
  current_stage: string;
  created_at: string;
  expires_at: string;
}

export interface Participant {
  id: string;
  room_id: string;
  session_token: string;
  nickname: string;
  player_color: string;
  player_shape: PlayerShape;
  is_host: boolean;
  status: 'active' | 'away' | 'disconnected';
  joined_at: string;
  last_seen_at: string;
}

export interface CreateRoomInput {
  eating_mode: EatingMode;
  city: string;
  neighborhood?: string;
  language: Locale;
  host_nickname: string;
}

export interface JoinRoomInput {
  code: string;
  nickname: string;
}
