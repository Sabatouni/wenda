-- ============================================================
-- WENDA · 016_seed_vibes.sql
-- Canonical vibe tags (8 exact slugs per spec)
-- Depends on: 005_vibes.sql
-- ============================================================

INSERT INTO vibes (slug, name, icon) VALUES
  ('beach-ocean',   'Beach & Ocean',   '🏖️'),
  ('local-food',    'Local Food',       '🍽️'),
  ('nightlife',     'Nightlife',        '🌙'),
  ('nature-hiking', 'Nature & Hiking',  '🌿'),
  ('arts-culture',  'Arts & Culture',   '🎭'),
  ('family-kids',   'Family & Kids',    '👨‍👩‍👧'),
  ('sunset-spots',  'Sunset Spots',     '🌅'),
  ('hidden-gems',   'Hidden Gems',      '💎')
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  icon = EXCLUDED.icon;

