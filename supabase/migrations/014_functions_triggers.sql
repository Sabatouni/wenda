-- ============================================================
-- WENDA · 014_functions_triggers.sql
-- All SECURITY DEFINER functions + triggers
-- Depends on: 003–013 (all tables must exist first)
--
-- ⚠️  SHARED PROJECT SAFETY:
--   - DO NOT create is_admin() — shared project already has is_admin(app_name text)
--     and has_role(app_name text, role_name text). Use is_admin('wenda') instead.
--   - DO NOT create a new on_auth_user_created trigger — it already exists on the
--     shared project and runs handle_new_auth_user(). MERGE wenda handle logic into
--     that existing function using CREATE OR REPLACE FUNCTION.
--   - Preserve: email, full_name, avatar_url population in handle_new_auth_user().
--   - DO NOT rename or drop handle_new_auth_user(). DO NOT drop on_auth_user_created.
--   - DO NOT drop on_auth_user_email_updated (other apps depend on it).
-- ============================================================

-- ─────────────────────────────────────────────────────────────
-- 0. update_updated_at_column() — generic updated_at trigger function
-- May already exist on shared project; CREATE OR REPLACE is idempotent.
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

-- Trigger on wenda_profiles.updated_at
DROP TRIGGER IF EXISTS on_wenda_profile_updated ON wenda_profiles;
CREATE TRIGGER on_wenda_profile_updated
  BEFORE UPDATE ON wenda_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- ─────────────────────────────────────────────────────────────
-- 1. handle_new_auth_user() — populate SHARED profiles on sign-up
-- ─────────────────────────────────────────────────────────────
-- This function ALREADY EXISTS on the shared project. We REPLACE it
-- here to ensure the shared profiles row is populated for every new
-- Supabase Auth user (STV, NUMA, POS, WENDA, etc.).
--
-- ⚠️  WENDA PROFILES ARE NOT AUTO-CREATED HERE.
--   A wenda_profiles row represents explicit WENDA opt-in. It is
--   created on-demand via the create_wenda_profile() RPC called
--   during WENDA onboarding only.
--
-- Only touches shared fields: id, email, full_name, avatar_url.
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION handle_new_auth_user()
RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO UPDATE SET
    email     = EXCLUDED.email,
    full_name = COALESCE(profiles.full_name, EXCLUDED.full_name);
  RETURN NEW;
END;
$$;

-- NOTE: DO NOT recreate on_auth_user_created — it already exists on the shared project
-- and points to this function. CREATE OR REPLACE above is sufficient.


-- ─────────────────────────────────────────────────────────────
-- 1b. create_wenda_profile() — WENDA onboarding RPC
-- ─────────────────────────────────────────────────────────────
-- Called by the WENDA client during onboarding after the user has
-- authenticated. Creates the wenda_profiles row on-demand.
--
-- p_display_name : required (1–60 chars after trim)
-- p_handle       : optional; auto-generated from caller's email if omitted
--
-- Security properties:
--   • Uses auth.uid() internally — user can only create their own row
--   • Reads email from profiles (SECURITY DEFINER bypasses profiles_select_own)
--   • handle uniqueness enforced by UNIQUE constraint + explicit check
--   • Idempotent: ON CONFLICT (id) DO NOTHING returns the existing row
--   • Exposes no email or full_name to the caller
--   • REVOKE / GRANT restricts to authenticated role only
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION create_wenda_profile(
  p_display_name text,
  p_handle       text DEFAULT NULL
)
RETURNS wenda_profiles
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid     uuid := auth.uid();
  v_base    text;
  v_handle  text;
  v_suffix  int := 0;
  v_result  wenda_profiles;
BEGIN
  -- ── Auth guard ────────────────────────────────────────────
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'unauthenticated';
  END IF;

  -- ── Validate display_name ─────────────────────────────────
  IF p_display_name IS NULL OR char_length(trim(p_display_name)) < 1 THEN
    RAISE EXCEPTION 'display_name is required';
  END IF;

  -- ── Handle: user-supplied or auto-generated ───────────────
  IF p_handle IS NOT NULL THEN
    -- Sanitize: lowercase, replace disallowed chars with underscore
    v_handle := lower(regexp_replace(trim(p_handle), '[^a-z0-9_]', '_', 'g'));

    -- Pad to minimum length, truncate to maximum
    IF length(v_handle) < 2 THEN
      v_handle := rpad(v_handle, 2, '_');
    END IF;
    v_handle := left(v_handle, 30);

    -- Format validation (mirrors wenda_profiles CHECK constraint)
    IF v_handle !~ '^[a-z0-9_]{2,30}$' THEN
      RAISE EXCEPTION 'invalid_handle: must be 2–30 chars, letters/digits/underscores only';
    END IF;

    -- Uniqueness check (skip own row so re-submission is idempotent)
    IF EXISTS (
      SELECT 1 FROM wenda_profiles WHERE handle = v_handle AND id != v_uid
    ) THEN
      RAISE EXCEPTION 'handle_taken: % is already in use', v_handle;
    END IF;

  ELSE
    -- Auto-generate from the caller's own email.
    -- SECURITY DEFINER lets us read from profiles without exposing it to the client.
    SELECT lower(
             regexp_replace(
               split_part(COALESCE(p.email, ''), '@', 1),
               '[^a-z0-9_]', '_', 'g'
             )
           )
    INTO v_base
    FROM public.profiles p
    WHERE p.id = v_uid;

    -- Guard: empty or very short email prefix (edge case: social login with no email)
    IF v_base IS NULL OR length(v_base) < 2 THEN
      v_base := rpad(COALESCE(v_base, 'user'), 2, '_');
    END IF;
    v_base   := left(v_base, 28);   -- reserve 2 chars for numeric suffix
    v_handle := v_base;

    -- Collision-safe: base → base1 → base2 … base999 → base_<uid-prefix>
    LOOP
      EXIT WHEN NOT EXISTS (SELECT 1 FROM wenda_profiles WHERE handle = v_handle);
      v_suffix := v_suffix + 1;
      IF v_suffix > 999 THEN
        -- UUID fragment fallback: deterministic, unique by construction
        v_handle := left(v_base, 20) || left(v_uid::text, 8);
        EXIT;
      END IF;
      v_handle := v_base || v_suffix::text;
    END LOOP;
  END IF;

  -- ── Idempotent insert ─────────────────────────────────────
  -- ON CONFLICT (id) DO NOTHING: re-running onboarding returns the existing row.
  INSERT INTO public.wenda_profiles (id, handle, display_name)
  VALUES (v_uid, v_handle, trim(p_display_name))
  ON CONFLICT (id) DO NOTHING;

  SELECT * INTO v_result FROM public.wenda_profiles WHERE id = v_uid;
  RETURN v_result;
END;
$$;

REVOKE EXECUTE ON FUNCTION create_wenda_profile(text, text) FROM PUBLIC;
GRANT  EXECUTE ON FUNCTION create_wenda_profile(text, text) TO authenticated;


-- ─────────────────────────────────────────────────────────────
-- 2. create_place_stats() + trigger
-- Auto-creates place_stats row when a place is inserted.
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION create_place_stats()
RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO place_stats (place_id)
  VALUES (NEW.id)
  ON CONFLICT (place_id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_place_created ON places;
CREATE TRIGGER on_place_created
  AFTER INSERT ON places
  FOR EACH ROW EXECUTE FUNCTION create_place_stats();


-- ─────────────────────────────────────────────────────────────
-- 3. update_place_business_info() — business owner RPC
-- SECURITY DEFINER; verifies approved claim before updating.
-- Explicit column list prevents modifying is_hidden_gem, price_range, status.
-- NULL argument = leave unchanged; '' argument = clear the field.
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_place_business_info(
  p_place_id      uuid,
  p_description   text  DEFAULT NULL,
  p_phone         text  DEFAULT NULL,
  p_website       text  DEFAULT NULL,
  p_instagram     text  DEFAULT NULL,
  p_opening_hours jsonb DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM place_claims
    WHERE place_id    = p_place_id
      AND claimant_id = auth.uid()
      AND status      = 'approved'
  ) THEN
    RAISE EXCEPTION 'unauthorized: no approved claim on place %', p_place_id;
  END IF;

  UPDATE places SET
    description   = CASE
                      WHEN p_description   = '' THEN NULL
                      WHEN p_description   IS NOT NULL THEN p_description
                      ELSE description
                    END,
    phone         = CASE
                      WHEN p_phone         = '' THEN NULL
                      WHEN p_phone         IS NOT NULL THEN p_phone
                      ELSE phone
                    END,
    website       = CASE
                      WHEN p_website       = '' THEN NULL
                      WHEN p_website       IS NOT NULL THEN p_website
                      ELSE website
                    END,
    instagram     = CASE
                      WHEN p_instagram     = '' THEN NULL
                      WHEN p_instagram     IS NOT NULL THEN p_instagram
                      ELSE instagram
                    END,
    opening_hours = CASE
                      WHEN p_opening_hours = 'null'::jsonb THEN NULL
                      WHEN p_opening_hours IS NOT NULL THEN p_opening_hours
                      ELSE opening_hours
                    END,
    updated_at    = now()
  WHERE id     = p_place_id
    AND status != 'archived';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'place % not found or is archived', p_place_id;
  END IF;
END;
$$;

REVOKE EXECUTE ON FUNCTION update_place_business_info(uuid,text,text,text,text,jsonb) FROM PUBLIC;
GRANT  EXECUTE ON FUNCTION update_place_business_info(uuid,text,text,text,text,jsonb) TO authenticated;


-- ─────────────────────────────────────────────────────────────
-- 4. search_places_nearby() — PostGIS geo search RPC
-- Uses geography type and ST_DWithin for accurate Earth-curve distance
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION search_places_nearby(
  lat      float8,
  lng      float8,
  radius_m int    DEFAULT 5000,
  category text   DEFAULT NULL,
  lim      int    DEFAULT 20
)
RETURNS TABLE (
  id       uuid,
  name     text,
  locality text,
  category text,
  slug     text,
  dist_m   float8
)
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    p.id,
    p.name,
    p.locality,
    p.category,
    p.slug,
    ST_Distance(p.coords, ST_MakePoint(lng, lat)::geography) AS dist_m
  FROM places p
  WHERE p.status  = 'active'
    AND p.coords  IS NOT NULL
    AND ST_DWithin(p.coords, ST_MakePoint(lng, lat)::geography, radius_m)
    AND (search_places_nearby.category IS NULL
         OR p.category = search_places_nearby.category)
  ORDER BY dist_m
  LIMIT lim;
$$;

REVOKE EXECUTE ON FUNCTION search_places_nearby(float8,float8,int,text,int) FROM PUBLIC;
GRANT  EXECUTE ON FUNCTION search_places_nearby(float8,float8,int,text,int) TO anon, authenticated;


-- ─────────────────────────────────────────────────────────────
-- 5. refresh_place_stats() — nightly stats recalculation
-- trending_score = visit_7d * 4 + saves_7d * 3
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION refresh_place_stats()
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE place_stats ps SET
    visit_7d = (
      SELECT COUNT(*)
      FROM   visits v
      WHERE  v.place_id  = ps.place_id
        AND  v.visited_at >= now() - interval '7 days'
    ),
    saves_7d = (
      SELECT COUNT(*)
      FROM   saved_places sp
      WHERE  sp.place_id = ps.place_id
        AND  sp.saved_at >= now() - interval '7 days'
    ),
    visit_total = (
      SELECT COUNT(*) FROM visits v WHERE v.place_id = ps.place_id
    ),
    save_count = (
      SELECT COUNT(*) FROM saved_places sp WHERE sp.place_id = ps.place_id
    ),
    updated_at = now();

  UPDATE place_stats SET
    trending_score = (visit_7d * 4) + (saves_7d * 3);
END;
$$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_extension WHERE extname = 'pg_cron'
  ) THEN
    PERFORM cron.schedule(
      'wenda-refresh-place-stats',
      '0 0 * * *',
      'SELECT refresh_place_stats()'
    );
  ELSE
    RAISE NOTICE 'pg_cron not available. Schedule refresh_place_stats() via Vercel Cron instead.';
  END IF;
END;
$$;

REVOKE EXECUTE ON FUNCTION refresh_place_stats() FROM PUBLIC;


-- ─────────────────────────────────────────────────────────────
-- 6. delete_user_account() — GDPR-compliant soft delete
-- Anonymizes wenda_profiles (NOT shared profiles). Clears active claims.
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION delete_user_account(p_user_id uuid)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS DISTINCT FROM p_user_id THEN
    RAISE EXCEPTION 'unauthorized: can only delete your own account';
  END IF;

  -- Anonymize WENDA identity; shared profiles table is left intact
  -- (other apps — STV, NUMA, POS — manage their own data)
  UPDATE wenda_profiles SET
    handle       = 'deleted_' || left(p_user_id::text, 8),
    display_name = 'Deleted User',
    avatar_path  = NULL,
    avatar_url   = NULL,
    bio          = NULL,
    city         = NULL,
    is_deleted   = true,
    updated_at   = now()
  WHERE id = p_user_id;

  -- Nullify active business claims: no orphaned claim privileges
  UPDATE place_claims
  SET    claimant_id = NULL
  WHERE  claimant_id = p_user_id
    AND  status      = 'approved';
END;
$$;

REVOKE EXECUTE ON FUNCTION delete_user_account(uuid) FROM PUBLIC;
GRANT  EXECUTE ON FUNCTION delete_user_account(uuid) TO authenticated;
