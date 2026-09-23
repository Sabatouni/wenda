-- ============================================================
-- WENDA · 009_posts.sql
-- posts, post_photos, post_likes
-- Depends on: 003_profiles.sql, 004_places.sql
-- ============================================================

-- posts
-- ON DELETE RESTRICT on place_id: cannot delete a place while community posts exist
-- ON DELETE SET NULL on author_id: post preserved when user deletes account
CREATE TABLE posts (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  place_id    uuid NOT NULL REFERENCES places(id)    ON DELETE RESTRICT,
  author_id   uuid           REFERENCES profiles(id) ON DELETE SET NULL,
  body        text NOT NULL CHECK (char_length(body) BETWEEN 1 AND 2000),
  is_hidden   boolean NOT NULL DEFAULT false,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE posts IS
  'Community posts for places. place_id RESTRICT prevents place physical deletion.';

CREATE INDEX IF NOT EXISTS idx_posts_place_created ON posts (place_id, created_at DESC)
  WHERE is_hidden = false;
CREATE INDEX IF NOT EXISTS idx_posts_author ON posts (author_id, created_at DESC);

-- post_photos
CREATE TABLE post_photos (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id      uuid NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  storage_path text NOT NULL,
  sort_order   int  NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_post_photos_post ON post_photos (post_id, sort_order);

-- post_likes — composite PK
CREATE TABLE post_likes (
  user_id  uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  post_id  uuid NOT NULL REFERENCES posts(id)    ON DELETE CASCADE,
  liked_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, post_id)
);

CREATE INDEX IF NOT EXISTS idx_post_likes_post ON post_likes (post_id);
