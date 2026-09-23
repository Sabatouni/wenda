-- ============================================================
-- WENDA · 015_rls.sql
-- Row Level Security policies for all WENDA tables
-- Depends on: 003–014
--
-- ⚠️  SHARED PROJECT SAFETY — profiles table:
--   The live shared Supabase project has two pre-existing RLS policies:
--     profiles_select_own  → SELECT USING (id = auth.uid())
--     profiles_update_own  → UPDATE USING (id = auth.uid())
--   DO NOT drop these. DO NOT create a SELECT policy that exposes all rows.
--   WENDA public identity is served from wenda_profiles (separate table).
-- ============================================================

-- ── profiles (shared table — ENABLE only, NO FORCE, minimal additions) ──
-- ENABLE is a no-op if already enabled; safe to run again.
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
-- ↑ DO NOT: FORCE ROW LEVEL SECURITY (would break other apps' service-role queries)
-- ↑ DO NOT: DROP profiles_select_own (live policy — SELECT USING (id = auth.uid()))
-- ↑ DO NOT: DROP profiles_update_own (live policy — UPDATE USING (id = auth.uid()))
-- ↑ DO NOT: CREATE profiles_select_public using deleted_at — exposes all shared-project users

-- Remove the broken public-exposure policy if a previous migration applied it
DROP POLICY IF EXISTS profiles_select_public ON profiles;
-- Remove legacy WENDA-only policies that were wrongly scoped to the shared table
DROP POLICY IF EXISTS profiles_delete_own    ON profiles;

-- These are idempotent (DROP IF EXISTS then CREATE)
DROP POLICY IF EXISTS profiles_insert_own ON profiles;
CREATE POLICY profiles_insert_own ON profiles
  FOR INSERT WITH CHECK (id = auth.uid());

DROP POLICY IF EXISTS profiles_admin_all ON profiles;
CREATE POLICY profiles_admin_all ON profiles
  FOR ALL USING (is_admin('wenda'));

-- ── wenda_profiles (WENDA-owned — FORCE RLS, full policy set) ────────────
-- This table is entirely WENDA's; no other app touches it.
ALTER TABLE wenda_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE wenda_profiles FORCE ROW LEVEL SECURITY;

-- Public: anyone (anon or authenticated) can read non-deleted profiles.
-- Exposes: handle, display_name, avatar_path, avatar_url, bio, city only.
-- Does NOT expose: profiles.email, profiles.full_name, or any cross-app field.
DROP POLICY IF EXISTS wenda_profiles_select_public ON wenda_profiles;
CREATE POLICY wenda_profiles_select_public ON wenda_profiles
  FOR SELECT USING (is_deleted = false);

DROP POLICY IF EXISTS wenda_profiles_insert_own ON wenda_profiles;
CREATE POLICY wenda_profiles_insert_own ON wenda_profiles
  FOR INSERT WITH CHECK (id = auth.uid());

DROP POLICY IF EXISTS wenda_profiles_update_own ON wenda_profiles;
CREATE POLICY wenda_profiles_update_own ON wenda_profiles
  FOR UPDATE USING (id = auth.uid())
  WITH CHECK  (id = auth.uid());

DROP POLICY IF EXISTS wenda_profiles_admin_all ON wenda_profiles;
CREATE POLICY wenda_profiles_admin_all ON wenda_profiles
  FOR ALL USING (is_admin('wenda'));

-- ── places ────────────────────────────────────────────────────
ALTER TABLE places ENABLE ROW LEVEL SECURITY;
ALTER TABLE places FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS places_select_public         ON places;
DROP POLICY IF EXISTS places_insert_authenticated  ON places;
DROP POLICY IF EXISTS places_update_own            ON places;
DROP POLICY IF EXISTS places_admin_all             ON places;

CREATE POLICY places_select_public ON places
  FOR SELECT USING (status IN ('active', 'pending'));

CREATE POLICY places_insert_authenticated ON places
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY places_update_own ON places
  FOR UPDATE USING (submitted_by = auth.uid())
  WITH CHECK (submitted_by = auth.uid());

CREATE POLICY places_admin_all ON places
  FOR ALL USING (is_admin('wenda'));

-- ── vibes ─────────────────────────────────────────────────────
ALTER TABLE vibes ENABLE ROW LEVEL SECURITY;
ALTER TABLE vibes FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS vibes_select_public ON vibes;
DROP POLICY IF EXISTS vibes_admin_all     ON vibes;

CREATE POLICY vibes_select_public ON vibes
  FOR SELECT USING (true);

CREATE POLICY vibes_admin_all ON vibes
  FOR ALL USING (is_admin('wenda'));

-- ── place_vibes ───────────────────────────────────────────────
ALTER TABLE place_vibes ENABLE ROW LEVEL SECURITY;
ALTER TABLE place_vibes FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS place_vibes_select_public          ON place_vibes;
DROP POLICY IF EXISTS place_vibes_insert_authenticated   ON place_vibes;
DROP POLICY IF EXISTS place_vibes_delete_own             ON place_vibes;
DROP POLICY IF EXISTS place_vibes_admin_all              ON place_vibes;

CREATE POLICY place_vibes_select_public ON place_vibes
  FOR SELECT USING (true);

CREATE POLICY place_vibes_insert_authenticated ON place_vibes
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY place_vibes_delete_own ON place_vibes
  FOR DELETE USING (added_by = auth.uid());

CREATE POLICY place_vibes_admin_all ON place_vibes
  FOR ALL USING (is_admin('wenda'));

-- ── place_photos ──────────────────────────────────────────────
ALTER TABLE place_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE place_photos FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS place_photos_select_approved         ON place_photos;
DROP POLICY IF EXISTS place_photos_insert_authenticated    ON place_photos;
DROP POLICY IF EXISTS place_photos_update_own              ON place_photos;
DROP POLICY IF EXISTS place_photos_admin_all               ON place_photos;

CREATE POLICY place_photos_select_approved ON place_photos
  FOR SELECT USING (status = 'approved');

CREATE POLICY place_photos_insert_authenticated ON place_photos
  FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND uploaded_by = auth.uid());

CREATE POLICY place_photos_update_own ON place_photos
  FOR UPDATE USING (uploaded_by = auth.uid());

CREATE POLICY place_photos_admin_all ON place_photos
  FOR ALL USING (is_admin('wenda'));

-- ── place_stats ───────────────────────────────────────────────
ALTER TABLE place_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE place_stats FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS place_stats_select_public ON place_stats;
DROP POLICY IF EXISTS place_stats_admin_all     ON place_stats;

CREATE POLICY place_stats_select_public ON place_stats
  FOR SELECT USING (true);

CREATE POLICY place_stats_admin_all ON place_stats
  FOR ALL USING (is_admin('wenda'));

-- ── place_visits ──────────────────────────────────────────────
ALTER TABLE place_visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE place_visits FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS place_visits_select_own ON place_visits;
DROP POLICY IF EXISTS place_visits_insert_own ON place_visits;
DROP POLICY IF EXISTS place_visits_admin_all  ON place_visits;

CREATE POLICY place_visits_select_own ON place_visits
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY place_visits_insert_own ON place_visits
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY place_visits_admin_all ON place_visits
  FOR ALL USING (is_admin('wenda'));

-- ── saved_places ──────────────────────────────────────────────
ALTER TABLE saved_places ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_places FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS saved_places_select_own ON saved_places;
DROP POLICY IF EXISTS saved_places_insert_own ON saved_places;
DROP POLICY IF EXISTS saved_places_delete_own ON saved_places;
DROP POLICY IF EXISTS saved_places_admin_all  ON saved_places;

CREATE POLICY saved_places_select_own ON saved_places
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY saved_places_insert_own ON saved_places
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY saved_places_delete_own ON saved_places
  FOR DELETE USING (user_id = auth.uid());

CREATE POLICY saved_places_admin_all ON saved_places
  FOR ALL USING (is_admin('wenda'));

-- ── follows ───────────────────────────────────────────────────
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE follows FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS follows_select_public ON follows;
DROP POLICY IF EXISTS follows_insert_own    ON follows;
DROP POLICY IF EXISTS follows_delete_own    ON follows;
DROP POLICY IF EXISTS follows_admin_all     ON follows;

CREATE POLICY follows_select_public ON follows
  FOR SELECT USING (true);

CREATE POLICY follows_insert_own ON follows
  FOR INSERT WITH CHECK (follower_id = auth.uid());

CREATE POLICY follows_delete_own ON follows
  FOR DELETE USING (follower_id = auth.uid());

CREATE POLICY follows_admin_all ON follows
  FOR ALL USING (is_admin('wenda'));

-- ── posts ─────────────────────────────────────────────────────
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS posts_select_public ON posts;
DROP POLICY IF EXISTS posts_insert_own    ON posts;
DROP POLICY IF EXISTS posts_update_own    ON posts;
DROP POLICY IF EXISTS posts_delete_own    ON posts;
DROP POLICY IF EXISTS posts_admin_all     ON posts;

CREATE POLICY posts_select_public ON posts
  FOR SELECT USING (true);

CREATE POLICY posts_insert_own ON posts
  FOR INSERT WITH CHECK (author_id = auth.uid());

CREATE POLICY posts_update_own ON posts
  FOR UPDATE USING (author_id = auth.uid());

CREATE POLICY posts_delete_own ON posts
  FOR DELETE USING (author_id = auth.uid());

CREATE POLICY posts_admin_all ON posts
  FOR ALL USING (is_admin('wenda'));

-- ── post_likes ────────────────────────────────────────────────
ALTER TABLE post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_likes FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS post_likes_select_public ON post_likes;
DROP POLICY IF EXISTS post_likes_insert_own    ON post_likes;
DROP POLICY IF EXISTS post_likes_delete_own    ON post_likes;
DROP POLICY IF EXISTS post_likes_admin_all     ON post_likes;

CREATE POLICY post_likes_select_public ON post_likes
  FOR SELECT USING (true);

CREATE POLICY post_likes_insert_own ON post_likes
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY post_likes_delete_own ON post_likes
  FOR DELETE USING (user_id = auth.uid());

CREATE POLICY post_likes_admin_all ON post_likes
  FOR ALL USING (is_admin('wenda'));

-- ── post_comments ─────────────────────────────────────────────
ALTER TABLE post_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_comments FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS post_comments_select_public ON post_comments;
DROP POLICY IF EXISTS post_comments_insert_own    ON post_comments;
DROP POLICY IF EXISTS post_comments_update_own    ON post_comments;
DROP POLICY IF EXISTS post_comments_delete_own    ON post_comments;
DROP POLICY IF EXISTS post_comments_admin_all     ON post_comments;

CREATE POLICY post_comments_select_public ON post_comments
  FOR SELECT USING (true);

CREATE POLICY post_comments_insert_own ON post_comments
  FOR INSERT WITH CHECK (author_id = auth.uid());

CREATE POLICY post_comments_update_own ON post_comments
  FOR UPDATE USING (author_id = auth.uid());

CREATE POLICY post_comments_delete_own ON post_comments
  FOR DELETE USING (author_id = auth.uid());

CREATE POLICY post_comments_admin_all ON post_comments
  FOR ALL USING (is_admin('wenda'));

-- ── outings ───────────────────────────────────────────────────
ALTER TABLE outings ENABLE ROW LEVEL SECURITY;
ALTER TABLE outings FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS outings_select_member ON outings;
DROP POLICY IF EXISTS outings_insert_own    ON outings;
DROP POLICY IF EXISTS outings_update_own    ON outings;
DROP POLICY IF EXISTS outings_delete_own    ON outings;
DROP POLICY IF EXISTS outings_admin_all     ON outings;

CREATE POLICY outings_select_member ON outings
  FOR SELECT USING (
    creator_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM outing_members om
      WHERE om.outing_id = id
        AND om.user_id = auth.uid()
        AND om.status IN ('going', 'maybe', 'invited')
    )
  );

CREATE POLICY outings_insert_own ON outings
  FOR INSERT WITH CHECK (creator_id = auth.uid());

CREATE POLICY outings_update_own ON outings
  FOR UPDATE USING (creator_id = auth.uid());

CREATE POLICY outings_delete_own ON outings
  FOR DELETE USING (creator_id = auth.uid());

CREATE POLICY outings_admin_all ON outings
  FOR ALL USING (is_admin('wenda'));

-- ── outing_places ─────────────────────────────────────────────
ALTER TABLE outing_places ENABLE ROW LEVEL SECURITY;
ALTER TABLE outing_places FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS outing_places_select_member   ON outing_places;
DROP POLICY IF EXISTS outing_places_insert_creator  ON outing_places;
DROP POLICY IF EXISTS outing_places_delete_creator  ON outing_places;
DROP POLICY IF EXISTS outing_places_admin_all       ON outing_places;

CREATE POLICY outing_places_select_member ON outing_places
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM outings o
      LEFT JOIN outing_members om ON om.outing_id = o.id AND om.user_id = auth.uid()
      WHERE o.id = outing_id
        AND (
          o.creator_id = auth.uid()
          OR om.status IN ('going', 'maybe', 'invited')
        )
    )
  );

CREATE POLICY outing_places_insert_creator ON outing_places
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM outings o WHERE o.id = outing_id AND o.creator_id = auth.uid()
    )
  );

CREATE POLICY outing_places_delete_creator ON outing_places
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM outings o WHERE o.id = outing_id AND o.creator_id = auth.uid()
    )
  );

CREATE POLICY outing_places_admin_all ON outing_places
  FOR ALL USING (is_admin('wenda'));

-- ── outing_members ────────────────────────────────────────────
ALTER TABLE outing_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE outing_members FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS outing_members_select_member   ON outing_members;
DROP POLICY IF EXISTS outing_members_insert_creator  ON outing_members;
DROP POLICY IF EXISTS outing_members_update_own      ON outing_members;
DROP POLICY IF EXISTS outing_members_delete_creator  ON outing_members;
DROP POLICY IF EXISTS outing_members_admin_all       ON outing_members;

CREATE POLICY outing_members_select_member ON outing_members
  FOR SELECT USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM outings o WHERE o.id = outing_id AND o.creator_id = auth.uid()
    )
  );

CREATE POLICY outing_members_insert_creator ON outing_members
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM outings o WHERE o.id = outing_id AND o.creator_id = auth.uid()
    )
    OR user_id = auth.uid()   -- self-join via invite link
  );

CREATE POLICY outing_members_update_own ON outing_members
  FOR UPDATE USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM outings o WHERE o.id = outing_id AND o.creator_id = auth.uid()
    )
  );

CREATE POLICY outing_members_delete_creator ON outing_members
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM outings o WHERE o.id = outing_id AND o.creator_id = auth.uid()
    )
    OR user_id = auth.uid()   -- leave outing
  );

CREATE POLICY outing_members_admin_all ON outing_members
  FOR ALL USING (is_admin('wenda'));

-- ── place_claims ──────────────────────────────────────────────
-- NOTE: table is `place_claims` (from 011_business.sql), NOT `business_claims`
ALTER TABLE place_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE place_claims FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS place_claims_select_own ON place_claims;
DROP POLICY IF EXISTS place_claims_insert_own ON place_claims;
DROP POLICY IF EXISTS place_claims_admin_all  ON place_claims;

CREATE POLICY place_claims_select_own ON place_claims
  FOR SELECT USING (claimant_id = auth.uid());

CREATE POLICY place_claims_insert_own ON place_claims
  FOR INSERT WITH CHECK (claimant_id = auth.uid());

CREATE POLICY place_claims_admin_all ON place_claims
  FOR ALL USING (is_admin('wenda'));

-- ── reports ───────────────────────────────────────────────────
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS reports_select_own ON reports;
DROP POLICY IF EXISTS reports_insert_own ON reports;
DROP POLICY IF EXISTS reports_admin_all  ON reports;

CREATE POLICY reports_select_own ON reports
  FOR SELECT USING (reporter_id = auth.uid());

CREATE POLICY reports_insert_own ON reports
  FOR INSERT WITH CHECK (reporter_id = auth.uid());

CREATE POLICY reports_admin_all ON reports
  FOR ALL USING (is_admin('wenda'));

-- ── moderation_actions ────────────────────────────────────────
ALTER TABLE moderation_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE moderation_actions FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS moderation_actions_admin_all ON moderation_actions;

CREATE POLICY moderation_actions_admin_all ON moderation_actions
  FOR ALL USING (is_admin('wenda'));

-- ── notifications ─────────────────────────────────────────────
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS notifications_select_own ON notifications;
DROP POLICY IF EXISTS notifications_update_own ON notifications;
DROP POLICY IF EXISTS notifications_admin_all  ON notifications;

CREATE POLICY notifications_select_own ON notifications
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY notifications_update_own ON notifications
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY notifications_admin_all ON notifications
  FOR ALL USING (is_admin('wenda'));
