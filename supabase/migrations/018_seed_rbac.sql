-- ============================================================
-- WENDA · 018_seed_rbac.sql
-- Seed WENDA application + supplementary roles in shared RBAC tables
-- Depends on: shared applications, roles tables (pre-existing)
--
-- ⚠️  SCHEMA NOTE (verified against live nceyjgayttsaozfqiwtj):
--   applications table: (id, slug [UNIQUE], name, description, is_active, ...)
--     — conflict target is (slug), NOT (name)
--     — display label column is 'name', NOT 'display_name'
--   roles table: (id, slug [UNIQUE], name, description, level, ...)
--     — NO application_name column — roles are global, scoped via user_application_roles
--     — conflict target is (slug), NOT (application_name, name)
--
-- ⚠️  ROLE ARCHITECTURE NOTE (verified against live hierarchy):
--   Existing shared roles (do NOT duplicate):
--     owner (100), admin (80), developer (70), manager (60),
--     editor (50), moderator (40), support (40), worker (20), viewer (10)
--
--   is_admin('wenda') → has_role('wenda', 'admin') → checks r.slug = 'admin'
--   It does NOT check for 'wenda_admin'. Admin/moderator access in WENDA
--   uses the existing generic 'admin' and 'moderator' roles scoped to this app.
--
--   This migration only seeds roles with NO existing generic equivalent:
--     wenda_content_moderator (30) — restrict to posts/comments only
--     wenda_place_moderator   (30) — restrict to place listings/photos only
--
--   To grant standard WENDA admin access, assign the existing 'admin' role
--   to the user on the 'wenda' application (see usage example below).
-- ============================================================

-- ── 1. Register WENDA as an application ──────────────────────
-- slug = 'wenda' matches the string used by is_admin('wenda') and has_role('wenda', ...)
INSERT INTO applications (slug, name, description)
VALUES (
  'wenda',
  'Wenda',
  'Social discovery platform — find places by vibe'
)
ON CONFLICT (slug) DO UPDATE SET
  name        = EXCLUDED.name,
  description = EXCLUDED.description;

-- ── 2. Seed WENDA-specific supplementary roles only ──────────
-- Standard access levels (admin, moderator) use EXISTING global roles —
-- do not create wenda_admin / wenda_moderator here.
-- Only new roles with no generic equivalent are inserted.
--
-- Level 30 sits between worker (20) and moderator (40), fitting the hierarchy.
INSERT INTO roles (slug, name, description, level) VALUES
  ('wenda_content_moderator', 'Wenda Content Moderator', 'Moderate user-generated posts and comments only', 30),
  ('wenda_place_moderator',   'Wenda Place Moderator',   'Moderate place listings and photos only',         30)
ON CONFLICT (slug) DO UPDATE SET
  name        = EXCLUDED.name,
  description = EXCLUDED.description,
  level       = EXCLUDED.level;

-- ── 3. Usage reference ───────────────────────────────────────
-- Grant a WENDA admin role (uses existing 'admin' slug — checked by is_admin('wenda')):
--
--   INSERT INTO user_application_roles (user_id, application_id, role_id)
--   SELECT '<target-user-uuid>', a.id, r.id
--   FROM   applications a JOIN roles r ON r.slug = 'admin'
--   WHERE  a.slug = 'wenda';
--
-- Grant WENDA moderator (uses existing 'moderator' slug):
--
--   INSERT INTO user_application_roles (user_id, application_id, role_id)
--   SELECT '<target-user-uuid>', a.id, r.id
--   FROM   applications a JOIN roles r ON r.slug = 'moderator'
--   WHERE  a.slug = 'wenda';
--
-- Grant a granular content-only moderator (new WENDA-specific role):
--
--   INSERT INTO user_application_roles (user_id, application_id, role_id)
--   SELECT '<target-user-uuid>', a.id, r.id
--   FROM   applications a JOIN roles r ON r.slug = 'wenda_content_moderator'
--   WHERE  a.slug = 'wenda';
--
-- Verify access using shared RPCs:
--   SELECT is_admin('wenda');                              -- checks role slug = 'admin' on wenda
--   SELECT has_role('wenda', 'moderator');                 -- generic moderator on wenda
--   SELECT has_role('wenda', 'wenda_content_moderator');  -- content-only moderator on wenda
