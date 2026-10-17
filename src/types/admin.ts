/**
 * Admin Authentication and Read-Only Analytics Types
 */

export interface AdminUser {
  id: string;
  email: string;
  role: 'admin';
}

export interface AdminAuthResponse {
  success?: boolean;
  authenticated?: boolean;
  token?: string;
  user?: AdminUser;
  error?: string;
  message?: string;
}

export type TimeRangeFilter = '24h' | '7d' | '30d' | 'all';

export interface AdminTimeRange {
  filter: TimeRangeFilter;
  start_time: string;
  end_time: string;
}

export interface AdminAnalyticsSummary {
  total_events: number;
  unique_visitors: number;
  total_sessions: number;
  rooms_created_success: number;
  rooms_created_failed: number;
  rooms_joined_success: number;
  rooms_joined_failed: number;
  total_swipes: number;
  total_matches: number;
  total_minigames_started: number;
  total_minigames_completed: number;
  total_maps_clicks: number;
  total_delivery_clicks: number;
  total_revotes: number;
  total_technical_failures: number;
}

export interface EventTypeCount {
  event_type: string;
  count: number;
}

export interface CategoryCount {
  category: string;
  count: number;
}

export interface RoomModeCount {
  room_mode: string;
  count: number;
}

export interface EatingModeCount {
  eating_mode: string;
  count: number;
}

export interface SwipeVoteCount {
  vote: string;
  count: number;
}

export interface TopWinningRestaurant {
  restaurant_id: string;
  wins_count: number;
}

export interface MiniGameStat {
  game_type: string;
  started_count: number;
  completed_count: number;
}

export interface JoinFailureReason {
  reason: string;
  count: number;
}

export interface ActivityTimelinePoint {
  bucket_time: string;
  event_count?: number;
  session_count: number;
  room_create_count: number;
  swipe_count: number;
  match_count: number;
}

export interface AdminBreakdowns {
  by_event_type: EventTypeCount[];
  by_category: CategoryCount[];
  by_room_mode: RoomModeCount[];
  by_eating_mode: EatingModeCount[];
  swipes_by_vote: SwipeVoteCount[];
  top_winning_restaurants: TopWinningRestaurant[];
  minigames: MiniGameStat[];
  join_failures: JoinFailureReason[];
  activity_timeline: ActivityTimelinePoint[];
}

export interface AdminRecentEvent {
  id: string;
  event_id: string;
  event_type: string;
  event_time: string;
  room_code?: string;
  category?: string;
  eating_mode?: string;
  room_mode?: string;
  app_version?: string;
}

export interface AdminAnalyticsResponse {
  success: boolean;
  time_range: AdminTimeRange;
  summary: AdminAnalyticsSummary;
  breakdowns: AdminBreakdowns;
  recent_events: AdminRecentEvent[];
  warning?: string;
  error?: string;
  message?: string;
}
