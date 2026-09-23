-- ============================================================
-- WENDA · 005_vibes.sql
-- vibes lookup table + place_vibes junction
-- Depends on: 004_places.sql
-- ============================================================

CREATE TABLE vibes (
  id   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL UNIQUE,
  icon text
);

COMMENT ON TABLE vibes IS
  'Canonical vibe tags. Seeded in 016_seed_vibes.sql. Admin-managed only.';

CREATE TABLE place_vibes (
  place_id uuid NOT NULL REFERENCES places(id)  ON DELETE CASCADE,
  vibe_id  uuid NOT NULL REFERENCES vibes(id)   ON DELETE CASCADE,
  added_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  added_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (place_id, vibe_id)
);

COMMENT ON TABLE place_vibes IS
  'Many-to-many: places ↔ vibes.';

CREATE INDEX IF NOT EXISTS idx_place_vibes_vibe ON place_vibes (vibe_id);
CREATE INDEX IF NOT EXISTS idx_vibes_slug       ON vibes (slug);
