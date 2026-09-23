-- ============================================================
-- WENDA · 006_place_photos.sql
-- place_photos with attribution/rights fields
-- Depends on: 004_places.sql, 003_profiles.sql
-- ============================================================

CREATE TABLE place_photos (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  place_id      uuid NOT NULL REFERENCES places(id) ON DELETE RESTRICT,
  storage_path  text NOT NULL,
  caption       text,
  sort_order    int  NOT NULL DEFAULT 0,
  is_cover      boolean NOT NULL DEFAULT false,
  photographer_name text,
  photographer_url  text,
  license           text
    CHECK (license IN ('own', 'cc-by', 'cc-by-nc', 'stock', 'permission', 'public-domain')),
  source_url        text,
  status      text NOT NULL DEFAULT 'pending'
                CHECK (status IN ('pending', 'approved', 'rejected')),
  uploaded_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  approved_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  reviewed_at timestamptz,
  created_at  timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE place_photos IS
  'Photos for places. pending/rejected rows not publicly readable (storage RLS). Attribution required.';
COMMENT ON COLUMN place_photos.license IS
  'own=uploader owns it; cc-by/cc-by-nc=Creative Commons; stock=licensed stock; permission=explicit written permission; public-domain';

-- Storage bucket requirements (cannot be created via SQL — configure in Supabase Dashboard):
--   place-photos: PRIVATE bucket. Storage RLS restricts GET to approved photos only.
--   avatars:      PUBLIC bucket (profile photos are public-facing).
--   post-photos:  PRIVATE bucket. Same approved-only restriction as place-photos.
--   place-documents: PRIVATE. Authenticated + admin only (claim evidence).
COMMENT ON COLUMN place_photos.storage_path IS
  'Path in private "place-photos" bucket, e.g. place-photos/abc123/img1.webp. Bucket must NOT be public.';

CREATE INDEX IF NOT EXISTS idx_place_photos_place  ON place_photos (place_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_place_photos_status ON place_photos (status) WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS idx_place_photos_cover  ON place_photos (place_id, is_cover) WHERE is_cover = true;
