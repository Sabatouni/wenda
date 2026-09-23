-- ============================================================
-- WENDA · 003_profiles.sql
-- WENDA-specific public identity table
--
-- ⚠️  SHARED PROJECT SAFETY:
--   The shared `profiles` table (id, email, full_name, avatar_url,
--   created_at, updated_at) is used by STV, NUMA, POS, and WENDA.
--   Live RLS policies on that table:
--     profiles_select_own  → SELECT USING (id = auth.uid())
--     profiles_update_own  → UPDATE USING (id = auth.uid())
--   DO NOT ALTER, DROP, or ADD COLUMNS to the shared profiles table.
--   DO NOT create a public SELECT policy on profiles.
--
--   Instead: WENDA uses a separate `wenda_profiles` table as a
--   1:1 extension of profiles, containing only WENDA-specific
--   public identity fields. The shared table stays private.
--
-- ⚠️  ON-DEMAND CREATION:
--   A row in `wenda_profiles` is NOT created automatically when a
--   user registers in Supabase Auth. Auth user = shared identity only.
--   A wenda_profiles row is created on-demand during WENDA onboarding
--   via the create_wenda_profile() SECURITY DEFINER RPC
--   (see 014_functions_triggers.sql).
--   This ensures STV / NUMA / POS users are never auto-enrolled in
--   WENDA and that WENDA profiles represent explicit opt-in.
-- ============================================================

-- ── 1. Create wenda_profiles ─────────────────────────────────
-- 1:1 with profiles.id. Deleting the auth user cascades here.
-- Exposes no email / full_name / other shared-app private fields.
-- Rows are created explicitly via create_wenda_profile() RPC only.
CREATE TABLE IF NOT EXISTS wenda_profiles (
  id           uuid        PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  handle       text        NOT NULL UNIQUE,
  display_name text        NOT NULL,
  avatar_path  text,                    -- WENDA Storage path (avatars bucket)
  avatar_url   text,                    -- auth-provider avatar (fallback)
  bio          text,
  city         text,
  is_deleted   boolean     NOT NULL DEFAULT false,
  joined_at    timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT wenda_profiles_handle_format
    CHECK (handle ~ '^[a-z0-9_]{2,30}$'),
  CONSTRAINT wenda_profiles_display_name_length
    CHECK (char_length(display_name) BETWEEN 1 AND 60),
  CONSTRAINT wenda_profiles_bio_length
    CHECK (bio IS NULL OR char_length(bio) <= 300)
);

-- ── 2. Indexes ───────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_wenda_profiles_handle
  ON wenda_profiles (handle);

CREATE INDEX IF NOT EXISTS idx_wenda_profiles_city
  ON wenda_profiles (city)
  WHERE is_deleted = false;

CREATE INDEX IF NOT EXISTS idx_wenda_profiles_deleted
  ON wenda_profiles (is_deleted)
  WHERE is_deleted = true;

-- ── 3. Comments ──────────────────────────────────────────────
COMMENT ON TABLE wenda_profiles IS
  'WENDA public identity extension. 1:1 with profiles.id. '
  'Rows are created on-demand via create_wenda_profile() RPC during WENDA onboarding. '
  'Contains only WENDA-facing fields: handle, display_name, avatar, bio, city. '
  'No email or other cross-app private data. '
  'is_deleted=true = soft-deleted WENDA account (anonymized).';

COMMENT ON TABLE profiles IS
  'Shared profiles table — used by STV, NUMA, POS, WENDA. '
  'Do NOT add WENDA-specific columns here. '
  'WENDA identity fields live in wenda_profiles.';
