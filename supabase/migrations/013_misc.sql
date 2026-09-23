-- ============================================================
-- WENDA · 013_misc.sql
-- events, notifications
-- Depends on: 003_profiles.sql, 004_places.sql, 002_enums.sql
-- ============================================================

-- events
CREATE TABLE events (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  place_id     uuid NOT NULL REFERENCES places(id)    ON DELETE CASCADE,
  created_by   uuid           REFERENCES profiles(id) ON DELETE SET NULL,
  title        text NOT NULL CHECK (char_length(title) BETWEEN 1 AND 120),
  description  text,
  starts_at    timestamptz NOT NULL,
  ends_at      timestamptz,
  ticket_url   text,
  is_published boolean NOT NULL DEFAULT false,
  created_at   timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT event_times_valid CHECK (ends_at IS NULL OR ends_at >= starts_at)
);

COMMENT ON TABLE events IS
  'Place-specific events. Published events visible to all. Admin/place-owner managed.';

CREATE INDEX IF NOT EXISTS idx_events_place_time ON events (place_id, starts_at) WHERE is_published = true;
CREATE INDEX IF NOT EXISTS idx_events_upcoming   ON events (starts_at) WHERE is_published = true AND starts_at > now();

-- notifications — system-generated only, no client INSERT
CREATE TABLE notifications (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type       notification_type NOT NULL,
  payload    jsonb NOT NULL DEFAULT '{}',
  is_read    boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE notifications IS
  'In-app notifications. Created by service role or SECURITY DEFINER functions only — no client INSERT.';
COMMENT ON COLUMN notifications.payload IS
  'Type-specific data. e.g. for outing_invite: {"outing_id":"...","inviter_handle":"..."}';

CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON notifications (user_id, created_at DESC) WHERE is_read = false;
CREATE INDEX IF NOT EXISTS idx_notifications_user_all    ON notifications (user_id, created_at DESC);
