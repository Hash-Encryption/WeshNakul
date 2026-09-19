-- WeshNakul — Forward-Only Migration: Repair Secure Fair Draw Infrastructure
-- Migration: 20260919000200_repair_secure_fair_draw.sql
-- 1. Ensure schema private exists.
-- 2. Drop any legacy/fallback functions if created in public/private schemas.
-- 3. Require genuine pgcrypto extension for cryptographic entropy (gen_random_bytes).
-- 4. Ensure private.fair_draw_history exists with hardened placeholder-safe constraints:
--    last_winner_id nullable, consecutive_win_count default 0 and check >= 0.
-- 5. Install private.crypto_random_index with genuine rejection sampling.
-- 6. Install private.secure_fair_draw with canonical key, first-use serialization, and 2-win anti-streak.
-- 7. Secure permissions: revoke all on private table and functions from PUBLIC, anon, authenticated.
-- 8. Zero modifications to newer room-mode, taxonomy, or consensus RPCs.

-- 1. Ensure private schema exists
CREATE SCHEMA IF NOT EXISTS private;

-- 2. Drop any legacy fallback function
DROP FUNCTION IF EXISTS public.gen_random_bytes(int);
DROP FUNCTION IF EXISTS private.gen_random_bytes(int);

-- 3. Ensure genuine pgcrypto extension is installed
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Fail clearly if genuine gen_random_bytes is not available
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_proc p
    WHERE p.proname = 'gen_random_bytes'
  ) THEN
    RAISE EXCEPTION 'Genuine gen_random_bytes() from pgcrypto extension is strictly required'
      USING ERRCODE = '0A000';
  END IF;
END $$;

-- 4. Ensure private.fair_draw_history exists with hardened constraints
CREATE TABLE IF NOT EXISTS private.fair_draw_history (
  decision_kind text NOT NULL,
  canonical_candidate_key text NOT NULL,
  draw_version int NOT NULL DEFAULT 1,
  last_winner_id text,
  consecutive_win_count int NOT NULL DEFAULT 0,
  last_draw_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (decision_kind, canonical_candidate_key, draw_version)
);

-- Ensure constraints accommodate first-use placeholder rows (last_winner_id NULL, consecutive_win_count 0)
ALTER TABLE private.fair_draw_history ALTER COLUMN last_winner_id DROP NOT NULL;
ALTER TABLE private.fair_draw_history ALTER COLUMN consecutive_win_count SET DEFAULT 0;
ALTER TABLE private.fair_draw_history DROP CONSTRAINT IF EXISTS fair_draw_history_consecutive_win_count_check;
ALTER TABLE private.fair_draw_history ADD CONSTRAINT fair_draw_history_consecutive_win_count_check CHECK (consecutive_win_count >= 0);

-- Revoke all table permissions from public/untrusted roles
REVOKE ALL ON TABLE private.fair_draw_history FROM PUBLIC, anon, authenticated;

-- 5. Replace private.crypto_random_index with unbiased rejection sampling
CREATE OR REPLACE FUNCTION private.crypto_random_index(p_count int) RETURNS int
LANGUAGE plpgsql VOLATILE SET search_path = pg_catalog, public, private AS $$
DECLARE
  v_num bigint;
  v_limit bigint;
BEGIN
  IF p_count <= 1 THEN RETURN 1; END IF;
  -- 2^32 = 4294967296. Rejection sampling eliminates modulo bias.
  v_limit := (4294967296 / p_count) * p_count;
  LOOP
    v_num := ('x' || encode(gen_random_bytes(4), 'hex'))::bit(32)::bigint;
    IF v_num < v_limit THEN
      RETURN 1 + (v_num % p_count)::int;
    END IF;
  END LOOP;
END;
$$;

-- 6. Replace private.secure_fair_draw with first-use row serialization and anti-streak rule
CREATE OR REPLACE FUNCTION private.secure_fair_draw(
  p_decision_kind text,
  p_candidates text[],
  p_draw_version int DEFAULT 1
) RETURNS text
LANGUAGE plpgsql VOLATILE SECURITY DEFINER SET search_path = pg_catalog, public, private AS $$
DECLARE
  v_sorted text[];
  v_key text;
  v_last_winner text;
  v_consecutive int := 0;
  v_eligible text[];
  v_winner text;
  v_idx int;
BEGIN
  IF p_candidates IS NULL OR cardinality(p_candidates) = 0 THEN
    RETURN NULL;
  END IF;
  IF cardinality(p_candidates) = 1 THEN
    RETURN p_candidates[1];
  END IF;

  -- 1. Canonical key: sorted candidates joined by '|'
  SELECT array_agg(c ORDER BY c) INTO v_sorted FROM unnest(p_candidates) c;
  v_key := array_to_string(v_sorted, '|');

  -- 2. Ensure placeholder history row exists first for row-level serialization on first use
  INSERT INTO private.fair_draw_history (
    decision_kind, canonical_candidate_key, draw_version,
    last_winner_id, consecutive_win_count, last_draw_at, updated_at
  ) VALUES (
    p_decision_kind, v_key, p_draw_version,
    NULL, 0, now(), now()
  )
  ON CONFLICT (decision_kind, canonical_candidate_key, draw_version) DO NOTHING;

  -- 3. Acquire row-level lock atomically across all concurrent draws
  SELECT last_winner_id, consecutive_win_count
  INTO v_last_winner, v_consecutive
  FROM private.fair_draw_history
  WHERE decision_kind = p_decision_kind
    AND canonical_candidate_key = v_key
    AND draw_version = p_draw_version
  FOR UPDATE;

  -- 4. Anti-streak rule: after 2 consecutive identical wins for this exact canonical matchup,
  -- temporarily exclude that candidate for this draw only.
  IF v_consecutive >= 2 AND v_last_winner IS NOT NULL THEN
    SELECT array_agg(c) INTO v_eligible FROM unnest(v_sorted) c WHERE c <> v_last_winner;
    IF v_eligible IS NULL OR cardinality(v_eligible) = 0 THEN
      v_eligible := v_sorted;
    END IF;
  ELSE
    v_eligible := v_sorted;
  END IF;

  -- 5. Cryptographically secure unbiased draw
  v_idx := private.crypto_random_index(cardinality(v_eligible));
  v_winner := v_eligible[v_idx];

  -- 6. Calculate new streak counter
  IF v_last_winner IS NOT NULL AND v_winner = v_last_winner THEN
    v_consecutive := v_consecutive + 1;
  ELSE
    v_last_winner := v_winner;
    v_consecutive := 1;
  END IF;

  -- 7. Update history row atomically
  UPDATE private.fair_draw_history
  SET last_winner_id = v_last_winner,
      consecutive_win_count = v_consecutive,
      last_draw_at = now(),
      updated_at = now()
  WHERE decision_kind = p_decision_kind
    AND canonical_candidate_key = v_key
    AND draw_version = p_draw_version;

  RETURN v_winner;
END;
$$;

-- 7. Revoke direct function access from public/untrusted roles
REVOKE ALL ON FUNCTION private.crypto_random_index(int) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION private.secure_fair_draw(text, text[], int) FROM PUBLIC, anon, authenticated;
