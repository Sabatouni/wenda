-- ============================================================
-- WENDA · 012_moderation.sql
-- reports, moderation_actions
-- Depends on: 003_profiles.sql, 002_enums.sql
-- ============================================================

-- reports — polymorphic content references (content_type + content_id)
CREATE TABLE reports (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id  uuid REFERENCES profiles(id) ON DELETE SET NULL,
  content_type text NOT NULL
    CHECK (content_type IN ('post', 'place_photo', 'place', 'profile', 'event')),
  content_id   uuid NOT NULL,
  reason       report_reason NOT NULL,
  detail       text CHECK (char_length(detail) <= 1000),
  status       report_status NOT NULL DEFAULT 'pending',
  created_at   timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE reports IS
  'User-submitted content reports. content_id is polymorphic (no FK) — validated in app layer.';

CREATE INDEX IF NOT EXISTS idx_reports_pending  ON reports (status, created_at DESC) WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS idx_reports_content  ON reports (content_type, content_id);
CREATE INDEX IF NOT EXISTS idx_reports_reporter ON reports (reporter_id);

-- moderation_actions — immutable audit log, service role only
CREATE TABLE moderation_actions (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  moderator_id  uuid REFERENCES profiles(id) ON DELETE SET NULL,
  content_type  text NOT NULL,
  content_id    uuid NOT NULL,
  action        moderation_action_type NOT NULL,
  reason        text,
  report_id     uuid REFERENCES reports(id) ON DELETE SET NULL,
  created_at    timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE moderation_actions IS
  'Immutable audit log of moderator actions. Service role only — no client writes.';

CREATE INDEX IF NOT EXISTS idx_mod_actions_content   ON moderation_actions (content_type, content_id);
CREATE INDEX IF NOT EXISTS idx_mod_actions_moderator ON moderation_actions (moderator_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_mod_actions_report    ON moderation_actions (report_id);
