-- ============================================================
-- WENDA · 004_places.sql
-- places table with PostGIS coords + FTS column
-- Depends on: 001_extensions.sql (postgis), 002_enums.sql, 003_profiles.sql
-- ============================================================

CREATE TABLE places (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug          text NOT NULL UNIQUE,
  name          text NOT NULL CHECK (char_length(name) BETWEEN 2 AND 120),
  description   text,
  category      text NOT NULL,

  -- Geography
  locality      text,
  island        text NOT NULL DEFAULT 'Unguja',
  region        text NOT NULL DEFAULT 'Zanzibar',
  country_code  char(2) NOT NULL DEFAULT 'TZ',
  coords        geography(Point, 4326),

  -- Contact / business info (writable ONLY via update_place_business_info() RPC)
  phone         text,
  website       text,
  instagram     text,
  opening_hours jsonb,

  -- Moderation
  status        place_status NOT NULL DEFAULT 'pending',
  is_verified   boolean NOT NULL DEFAULT false,
  submitted_by  uuid REFERENCES profiles(id) ON DELETE SET NULL,

  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

-- FTS with 'simple' config (not 'english') — avoids stemming issues with Swahili names
ALTER TABLE places ADD COLUMN fts tsvector
  GENERATED ALWAYS AS (
    to_tsvector('simple',
      coalesce(name, '')        || ' ' ||
      coalesce(locality, '')    || ' ' ||
      coalesce(description, '') || ' ' ||
      coalesce(island, '')      || ' ' ||
      coalesce(category, ''))
  ) STORED;

COMMENT ON TABLE places IS
  'Core place records. Never physically deleted — use status=archived for soft delete.';
COMMENT ON COLUMN places.coords IS
  'PostGIS geography(Point,4326). NULL if coordinates unknown. Use ST_DWithin for proximity.';
COMMENT ON COLUMN places.opening_hours IS
  'JSON map of day abbreviation to HH:MM-HH:MM range. e.g. {"mon":"09:00-22:00"}';

-- Indexes
CREATE INDEX IF NOT EXISTS idx_places_coords     ON places USING GIST (coords);
CREATE INDEX IF NOT EXISTS idx_places_fts        ON places USING GIN  (fts);
CREATE INDEX IF NOT EXISTS idx_places_status     ON places (status);
CREATE INDEX IF NOT EXISTS idx_places_island     ON places (island);
CREATE INDEX IF NOT EXISTS idx_places_category   ON places (category);
CREATE INDEX IF NOT EXISTS idx_places_slug       ON places (slug);
CREATE INDEX IF NOT EXISTS idx_places_cat_status ON places (category, status) WHERE status = 'active';
