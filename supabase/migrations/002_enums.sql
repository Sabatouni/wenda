-- ============================================================
-- WENDA · 002_enums.sql
-- All custom enum types
-- Must run before any table that references these types.
--
-- ARCHITECTURE NOTE:
--   admin_role_type REMOVED — WENDA uses shared RBAC (applications/roles tables).
--   Use is_admin('wenda') and has_role('wenda', 'admin') from shared functions.
--   See 018_seed_rbac.sql for seeding wenda application + roles.
-- ============================================================

-- Place lifecycle (soft-delete via status, never physical DELETE)
CREATE TYPE place_status AS ENUM (
  'pending',    -- submitted, awaiting moderator review
  'active',     -- published and visible to all users
  'suspended',  -- temporarily hidden (e.g. flagged for review)
  'archived'    -- soft-deleted; hidden from all non-admin views
);

-- Outing lifecycle
CREATE TYPE outing_status AS ENUM (
  'planning',    -- still being planned, places not finalized
  'confirmed',   -- date + attendees locked in
  'completed',   -- outing happened
  'cancelled'    -- called off
);

-- Business claim lifecycle
CREATE TYPE claim_status AS ENUM (
  'pending',
  'approved',
  'rejected'
);

-- Outing member RSVP state
-- VALID VALUES ONLY: invited/going/maybe/cant_make_it/removed
-- 'joined' is NOT valid — use 'going'
CREATE TYPE outing_member_status AS ENUM (
  'invited',
  'going',
  'maybe',
  'cant_make_it',
  'removed'
);

-- Content report reasons
CREATE TYPE report_reason AS ENUM (
  'spam',
  'fake',
  'offensive',
  'wrong_info',
  'copyright',
  'other'
);

-- Report lifecycle
CREATE TYPE report_status AS ENUM (
  'pending',
  'reviewed',
  'actioned',
  'dismissed'
);

-- Actions a moderator can take on reported content
CREATE TYPE moderation_action_type AS ENUM (
  'hide',
  'restore',
  'delete',
  'warn_user',
  'ban_user',
  'approve_photo',
  'reject_photo'
);

-- In-app notification types
CREATE TYPE notification_type AS ENUM (
  'outing_invite',
  'outing_update',
  'post_like',
  'place_claim_update',
  'moderation_action',
  'new_event'
);
