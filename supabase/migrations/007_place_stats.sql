-- ============================================================
-- WENDA · 007_place_stats.sql
-- place_stats — one row per place, auto-created by trigger (014)
-- Depends on: 004_places.sql
-- ============================================================

-- place_stats row created automatically by on_place_created trigger (014)
-- Trending = visit_7d * 4 + saves_7d * 3 (recency-bounded)
-- All counts updated atomically by refresh_place_stats() which re-counts from source tables

CREATE TABLE place_stats (
  place_id       uuid PRIMARY KEY REFERENCES places(id) ON DELETE CASCADE,
  save_count     int NOT NULL DEFAULT 0,
  visit_total    int NOT NULL DEFAULT 0,
  visit_7d       int NOT NULL DEFAULT 0,
  saves_7d       int NOT NULL DEFAULT 0,
  trending_score int NOT NULL DEFAULT 0,
  updated_at     timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT place_stats_nonneg CHECK (
    save_count   >= 0 AND
    visit_total  >= 0 AND
    visit_7d     >= 0 AND
    saves_7d     >= 0 AND
    trending_score >= 0
  )
);

COMMENT ON TABLE place_stats IS
  'Denormalized stats per place. Created by trigger on place INSERT. Refreshed nightly by refresh_place_stats().';
COMMENT ON COLUMN place_stats.trending_score IS
  'visit_7d * 4 + saves_7d * 3. Recency-bounded so established places do not dominate indefinitely.';

CREATE INDEX IF NOT EXISTS idx_place_stats_trending ON place_stats (trending_score DESC);
CREATE INDEX IF NOT EXISTS idx_place_stats_saves    ON place_stats (save_count DESC);
CREATE INDEX IF NOT EXISTS idx_place_stats_7d       ON place_stats (visit_7d DESC, saves_7d DESC);
