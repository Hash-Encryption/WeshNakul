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

export interface AdminDeepFilters {
  range?: TimeRangeFilter;
  category?: string | null;
  district?: string | null;
  eating_mode?: string | null;
  room_mode?: string | null;
  limit?: number;
  offset?: number;
}

export interface DeepAnalyticsKPIs {
  total_events: number;
  rooms_created_success: number;
  rooms_joined_success: number;
  total_candidates_generated: number;
  total_card_impressions: number;
  total_swipes: number;
  total_yes_votes: number;
  total_no_votes: number;
  total_later_votes: number;
  total_matches: number;
  total_maps_clicks: number;
  total_delivery_clicks: number;
  total_minigames_started: number;
  total_minigames_completed: number;
  total_revotes: number;
  total_explicit_exits: number;
  total_technical_failures: number;
  approval_rate_pct: number | null;
  exposure_to_yes_pct: number | null;
}

export interface BrandMetricRow {
  restaurant_id: string;
  candidate_count: number;
  impression_count: number;
  yes_votes: number;
  no_votes: number;
  later_votes: number;
  total_votes: number;
  match_wins: number;
  maps_clicks: number;
  delivery_clicks: number;
  is_low_confidence: boolean;
  approval_rate_pct: number | null;
  exposure_to_yes_pct: number | null;
  win_rate_pct: number | null;
}

export interface AlgorithmHealthSummary {
  total_impressions: number;
  distinct_brands_shown: number;
  top_brand_impression_share_pct: number;
  hhi_concentration_index: number;
}

export interface ResolutionMethodCount {
  method: string;
  count: number;
}

export interface CatalogChangeRecord {
  id: string;
  entity_type: string;
  entity_id: string;
  action: string;
  changed_by: string;
  change_summary: string;
  previous_state: Record<string, unknown> | null;
  new_state: Record<string, unknown> | null;
  effective_at: string;
}

export interface AdminDeepPagination {
  total: number;
  limit: number;
  offset: number;
  has_more: boolean;
}

export interface AdminDeepAnalyticsResponse {
  success: boolean;
  time_range: {
    filter?: TimeRangeFilter;
    start_time: string;
    end_time: string;
  };
  filters: {
    category?: string | null;
    district?: string | null;
    eating_mode?: string | null;
    room_mode?: string | null;
  };
  kpis: DeepAnalyticsKPIs;
  algorithm_health: {
    summary: AlgorithmHealthSummary;
    brands: BrandMetricRow[];
    resolution_methods: ResolutionMethodCount[];
  };
  catalog_history: CatalogChangeRecord[];
  pagination: AdminDeepPagination;
  events: Array<{
    id: string;
    event_id: string;
    event_type: string;
    event_time: string;
    category?: string;
    district?: string;
    eating_mode?: string;
    room_mode?: string;
    app_version?: string;
    payload?: Record<string, unknown>;
  }>;
  warning?: string;
  error?: string;
  message?: string;
}

