-- ============================================================
-- WENDA · 017_places_discovery.sql
-- Discovery features: is_hidden_gem, price_range, cover photo view
-- Depends on: 004_places.sql, 006_place_photos.sql
-- ============================================================

-- ── Add discovery columns to places ──────────────────────────
-- is_hidden_gem: admin-controlled boolean flag (NOT user-toggleable)
ALTER TABLE places
  ADD COLUMN IF NOT EXISTS is_hidden_gem boolean NOT NULL DEFAULT false;

-- price_range: nullable 1–4 scale (1=budget … 4=luxury)
ALTER TABLE places
  ADD COLUMN IF NOT EXISTS price_range smallint
  CHECK (price_range BETWEEN 1 AND 4);

COMMENT ON COLUMN places.is_hidden_gem IS
  'Admin-curated flag. true = featured as a hidden gem. NOT user-editable.';
COMMENT ON COLUMN places.price_range IS
  '1 = budget, 2 = mid-range, 3 = upscale, 4 = luxury. NULL = unknown.';

-- Index for filtered discovery queries
CREATE INDEX IF NOT EXISTS idx_places_hidden_gem   ON places (is_hidden_gem) WHERE is_hidden_gem = true;
CREATE INDEX IF NOT EXISTS idx_places_price_range  ON places (price_range)   WHERE price_range IS NOT NULL;

-- ── places_with_cover view ────────────────────────────────────
-- Joins each place to its single approved cover photo storage path.
-- Uses LATERAL + LIMIT 1 to guarantee at most one row per place,
-- even if (incorrectly) multiple is_cover=true photos are approved.
-- The storage_path is exposed as cover_photo_url so the frontend builds:
--   supabase.storage.from('place-photos').getPublicUrl(cover_photo_url)
CREATE OR REPLACE VIEW places_with_cover AS
SELECT
  p.*,
  cover.storage_path AS cover_photo_url
FROM places p
LEFT JOIN LATERAL (
  SELECT storage_path
  FROM   place_photos
  WHERE  place_id = p.id
    AND  is_cover  = true
    AND  status    = 'approved'
  ORDER  BY created_at DESC
  LIMIT  1
) cover ON true;

COMMENT ON VIEW places_with_cover IS
  'Places with their approved cover photo storage_path exposed as cover_photo_url. '
  'LATERAL LIMIT 1 ensures no duplicate rows even if data anomalies occur. '
  'Use for all feed and card rendering.';

