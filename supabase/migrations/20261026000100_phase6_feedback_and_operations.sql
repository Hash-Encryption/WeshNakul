-- ============================================================================
-- WeshNakul Phase 6: Feedback & Operations Schema
-- Migration: 20261026000100_phase6_feedback_and_operations.sql
--
-- Security and Access Controls:
-- 1. Direct public/anon access is strictly denied.
-- 2. Direct authenticated user access is strictly denied.
-- 3. Access is granted solely to service_role for edge server API gateways.
-- 4. Status history audit logs are append-only.
-- 5. Status transitions and audit logging are unified in atomic RPC.
-- ============================================================================

BEGIN;

-- 1. Feedback Submissions Table
CREATE TABLE IF NOT EXISTS public.feedback_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_type text NOT NULL CHECK (submission_type IN ('bug', 'comment', 'brand_suggestion')),
  status text NOT NULL DEFAULT 'New' CHECK (status IN ('New', 'Under review', 'Resolved', 'Rejected')),
  user_message text NOT NULL,
  submitter_name text,
  brand_name text,
  brand_location text,
  district text,
  is_brand_owner boolean,
  contact_phone text,
  diagnostic_context jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes for efficient admin inbox filtering and sorting
CREATE INDEX IF NOT EXISTS idx_feedback_submissions_status_type
  ON public.feedback_submissions (status, submission_type, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_feedback_submissions_created_at
  ON public.feedback_submissions (created_at DESC);

-- 2. Feedback Status History Audit Table (minimal approved schema: no notes)
CREATE TABLE IF NOT EXISTS public.feedback_audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id uuid NOT NULL REFERENCES public.feedback_submissions(id) ON DELETE CASCADE,
  previous_status text NOT NULL CHECK (previous_status IN ('New', 'Under review', 'Resolved', 'Rejected')),
  new_status text NOT NULL CHECK (new_status IN ('New', 'Under review', 'Resolved', 'Rejected')),
  actor_admin_id text NOT NULL,
  action_timestamp timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_feedback_audit_logs_submission
  ON public.feedback_audit_logs (submission_id, action_timestamp DESC);

-- 3. Immutability Protection for Status Audit Logs
CREATE OR REPLACE FUNCTION public.prevent_feedback_audit_tampering()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  RAISE EXCEPTION 'WSH_AUDIT_LOG_IMMUTABLE: Status audit records cannot be modified or deleted.'
    USING ERRCODE = '23505';
END;
$$;

DROP TRIGGER IF EXISTS trg_feedback_audit_immutable ON public.feedback_audit_logs;
CREATE TRIGGER trg_feedback_audit_immutable
  BEFORE UPDATE OR DELETE ON public.feedback_audit_logs
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_feedback_audit_tampering();

-- 4. Authoritative Atomic Status Transition RPC
DROP FUNCTION IF EXISTS public.update_feedback_submission_status(uuid, text, timestamptz, text);
CREATE OR REPLACE FUNCTION public.update_feedback_submission_status(
  p_id uuid,
  p_new_status text,
  p_expected_updated_at timestamptz,
  p_actor_admin_id text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
DECLARE
  v_current public.feedback_submissions%ROWTYPE;
  v_updated public.feedback_submissions%ROWTYPE;
  v_now timestamptz := now();
  v_audit_id uuid;
BEGIN
  -- 1. Validate status input
  IF p_new_status NOT IN ('New', 'Under review', 'Resolved', 'Rejected') THEN
    RAISE EXCEPTION 'WSH_INVALID_FEEDBACK_STATUS: Status must be New, Under review, Resolved, or Rejected.'
      USING ERRCODE = '22023';
  END IF;

  -- 2. Validate mandatory expected_updated_at timestamp (Fix A)
  IF p_expected_updated_at IS NULL THEN
    RAISE EXCEPTION 'WSH_FEEDBACK_MISSING_TIMESTAMP: Expected updated_at timestamp is required.'
      USING ERRCODE = '22004';
  END IF;

  -- 3. Validate mandatory nonblank actor identity (Fix B)
  IF p_actor_admin_id IS NULL OR length(trim(p_actor_admin_id)) = 0 THEN
    RAISE EXCEPTION 'WSH_FEEDBACK_MISSING_ACTOR: Admin actor identity is required.'
      USING ERRCODE = '22004';
  END IF;

  -- 4. Lock target row for update
  SELECT * INTO v_current
  FROM public.feedback_submissions
  WHERE id = p_id
  FOR UPDATE;

  -- 5. Check existence
  IF NOT FOUND THEN
    RAISE EXCEPTION 'WSH_FEEDBACK_NOT_FOUND: Feedback submission % not found.', p_id
      USING ERRCODE = 'P0002';
  END IF;

  -- 6. Check optimistic concurrency
  IF v_current.updated_at IS DISTINCT FROM p_expected_updated_at THEN
    RAISE EXCEPTION 'WSH_FEEDBACK_CONCURRENCY_CONFLICT: Submission was modified by another administrator.'
      USING ERRCODE = 'P0001';
  END IF;

  -- 7. Update submission record
  UPDATE public.feedback_submissions
  SET status = p_new_status,
      updated_at = v_now
  WHERE id = p_id
  RETURNING * INTO v_updated;

  -- 8. Insert audit history record atomically
  INSERT INTO public.feedback_audit_logs (
    submission_id,
    previous_status,
    new_status,
    actor_admin_id,
    action_timestamp
  ) VALUES (
    p_id,
    v_current.status,
    p_new_status,
    trim(p_actor_admin_id),
    v_now
  ) RETURNING id INTO v_audit_id;

  -- 9. Return updated submission representation
  RETURN jsonb_build_object(
    'success', true,
    'submission', to_jsonb(v_updated),
    'audit_log_id', v_audit_id
  );
END;
$$;

-- 5. Row Level Security & Least-Privilege Grants
ALTER TABLE public.feedback_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback_audit_logs ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.feedback_submissions FROM PUBLIC, anon, authenticated;
REVOKE ALL ON TABLE public.feedback_audit_logs FROM PUBLIC, anon, authenticated;

GRANT ALL ON TABLE public.feedback_submissions TO service_role;
GRANT ALL ON TABLE public.feedback_audit_logs TO service_role;

REVOKE ALL ON FUNCTION public.update_feedback_submission_status(uuid, text, timestamptz, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.update_feedback_submission_status(uuid, text, timestamptz, text) TO service_role;

COMMIT;
