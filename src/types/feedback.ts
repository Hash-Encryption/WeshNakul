export type FeedbackType = 'bug' | 'comment' | 'brand_suggestion';

export type FeedbackStatus = 'New' | 'Under review' | 'Resolved' | 'Rejected';

export interface BugDiagnosticContext {
  timestamp?: string;
  sanitized_route?: string;
  app_version?: string;
  recent_error?: {
    event?: string;
    event_phase?: string;
    error_message?: string;
    category?: string;
  };
}

export interface FeedbackSubmission {
  id: string;
  submission_type: FeedbackType;
  status: FeedbackStatus;
  user_message: string;
  submitter_name?: string | null;
  brand_name?: string | null;
  brand_location?: string | null;
  district?: string | null;
  is_brand_owner?: boolean | null;
  contact_phone?: string | null;
  diagnostic_context?: BugDiagnosticContext | null;
  created_at: string;
  updated_at: string;
  audit_logs?: FeedbackAuditLog[];
}

export interface FeedbackAuditLog {
  id: string;
  submission_id: string;
  previous_status: FeedbackStatus;
  new_status: FeedbackStatus;
  actor_admin_id: string;
  action_timestamp: string;
}

export interface CreateFeedbackPayload {
  submission_type: FeedbackType;
  user_message: string;
  submitter_name?: string;
  brand_name?: string;
  brand_location?: string;
  district?: string;
  is_brand_owner?: boolean;
  contact_phone?: string;
  diagnostic_context?: BugDiagnosticContext;
}

export interface FeedbackListResponse {
  success: boolean;
  submissions: FeedbackSubmission[];
  total: number;
  limit: number;
  offset: number;
}

export interface FeedbackDetailResponse {
  success: boolean;
  submission: FeedbackSubmission;
}

export interface UpdateFeedbackStatusPayload {
  status: FeedbackStatus;
  expected_updated_at: string;
}

export interface UpdateFeedbackStatusResponse {
  success: boolean;
  submission: FeedbackSubmission;
  message?: string;
}
