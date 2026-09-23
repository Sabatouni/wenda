-- ============================================================
-- WENDA · 010_outings.sql
-- outings, outing_places, outing_members
-- Depends on: 003_profiles.sql, 004_places.sql, 002_enums.sql
-- ============================================================

-- outings
-- creator_id SET NULL: outing persists if creator deletes account
-- status column: uses outing_status enum defined in 002_enums.sql
CREATE TABLE outings (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id  uuid REFERENCES profiles(id) ON DELETE SET NULL,
  title       text NOT NULL CHECK (char_length(title) BETWEEN 1 AND 100),
  description text,
  date_start  timestamptz,
  date_end    timestamptz,
  is_public   boolean NOT NULL DEFAULT false,
  -- outing_status: planning | confirmed | completed | cancelled
  status      outing_status NOT NULL DEFAULT 'planning',
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT outing_dates_valid CHECK (
    date_end IS NULL OR date_start IS NULL OR date_end >= date_start
  )
);

COMMENT ON TABLE outings IS
  'Group outing plans. creator_id identifies organizer (no role column in outing_members).';
COMMENT ON COLUMN outings.status IS
  'Outing lifecycle: planning→confirmed→completed|cancelled.';

CREATE INDEX IF NOT EXISTS idx_outings_creator ON outings (creator_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_outings_public  ON outings (is_public, date_start DESC) WHERE is_public = true;

-- outing_places — composite PK; no added_by column
CREATE TABLE outing_places (
  outing_id  uuid NOT NULL REFERENCES outings(id)  ON DELETE CASCADE,
  place_id   uuid NOT NULL REFERENCES places(id)   ON DELETE CASCADE,
  sort_order int  NOT NULL DEFAULT 0,
  note       text,
  PRIMARY KEY (outing_id, place_id)
);

COMMENT ON TABLE outing_places IS
  'Places in an outing. Composite PK. No added_by column in V1.';

CREATE INDEX IF NOT EXISTS idx_outing_places_outing ON outing_places (outing_id, sort_order);

-- outing_members — composite PK; no role column (organizer = outings.creator_id)
-- Valid statuses: invited | going | maybe | cant_make_it | removed
CREATE TABLE outing_members (
  outing_id uuid NOT NULL REFERENCES outings(id)  ON DELETE CASCADE,
  user_id   uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status    outing_member_status NOT NULL DEFAULT 'invited',
  joined_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (outing_id, user_id)
);

COMMENT ON TABLE outing_members IS
  'Outing participants. Composite PK. No role column — organizer = outings.creator_id.';

CREATE INDEX IF NOT EXISTS idx_outing_members_user   ON outing_members (user_id, status);
CREATE INDEX IF NOT EXISTS idx_outing_members_outing ON outing_members (outing_id, status);
