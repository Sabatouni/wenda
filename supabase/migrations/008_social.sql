-- ============================================================
-- WENDA · 008_social.sql
-- saved_places, collections, collection_items, visits
-- Depends on: 003_profiles.sql, 004_places.sql
-- ============================================================

-- saved_places — private to owner
-- Note: composite PK (user_id, place_id). No separate 'id' column.
-- Column is 'saved_at' NOT 'created_at'
CREATE TABLE saved_places (
  user_id    uuid NOT NULL REFERENCES profiles(id)  ON DELETE CASCADE,
  place_id   uuid NOT NULL REFERENCES places(id)    ON DELETE CASCADE,
  saved_at   timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, place_id)
);

COMMENT ON TABLE saved_places IS
  'User bookmark list. Composite PK (user_id, place_id). Private — RLS owner-only.';

CREATE INDEX IF NOT EXISTS idx_saved_places_user ON saved_places (user_id, saved_at DESC);

-- collections — user-curated place lists
CREATE TABLE collections (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id    uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name        text NOT NULL CHECK (char_length(name) BETWEEN 1 AND 80),
  description text,
  is_public   boolean NOT NULL DEFAULT false,
  cover_path  text,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE collections IS
  'User-curated place lists. is_public=false rows are owner-only (RLS enforced).';

CREATE INDEX IF NOT EXISTS idx_collections_owner  ON collections (owner_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_collections_public ON collections (is_public, updated_at DESC) WHERE is_public = true;

-- collection_items
CREATE TABLE collection_items (
  collection_id uuid NOT NULL REFERENCES collections(id) ON DELETE CASCADE,
  place_id      uuid NOT NULL REFERENCES places(id)      ON DELETE CASCADE,
  sort_order    int  NOT NULL DEFAULT 0,
  added_at      timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (collection_id, place_id)
);

CREATE INDEX IF NOT EXISTS idx_collection_items_collection ON collection_items (collection_id, sort_order);

-- visits — EAT timezone; one per (user, place, EAT day)
-- Individual visit history is PRIVATE — RLS user-only (no admin SELECT on raw rows)
CREATE TABLE visits (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid NOT NULL REFERENCES profiles(id)  ON DELETE CASCADE,
  place_id   uuid NOT NULL REFERENCES places(id)    ON DELETE CASCADE,
  visited_at timestamptz NOT NULL DEFAULT now(),

  -- Generated STORED column using East Africa Time (UTC+3 year-round, no DST)
  -- Prevents 11pm EAT (= midnight UTC) landing on the wrong calendar day
  visit_day  date GENERATED ALWAYS AS (
    (visited_at AT TIME ZONE 'Africa/Dar_es_Salaam')::date
  ) STORED,

  note       text
);

COMMENT ON TABLE visits IS
  'User visit log. Private — only the owner can see individual rows. Aggregates via place_stats only.';
COMMENT ON COLUMN visits.visit_day IS
  'EAT date (Africa/Dar_es_Salaam = UTC+3). Used by deduplication unique index.';

-- One visit per (user, place, EAT day)
CREATE UNIQUE INDEX visits_day_idx     ON visits (user_id, place_id, visit_day);
CREATE INDEX IF NOT EXISTS idx_visits_place_time ON visits (place_id, visited_at DESC);
