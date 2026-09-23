import type { Place, VibeItem, CategoryItem } from '@/types'
import { unsplash } from '@/lib/utils'

// ─────────────────────────────────────────────────────────────────────────────
// Demo places (Zanzibar seed content)
// Dev/demo only — real data comes from Supabase.
//
// Schema alignment (migrations 001–017):
//   locality + island   (NOT location + area)
//   vibes: VibeSlug[]   (8 canonical slugs — no 'hidden-gem', 'chill', etc.)
//   is_hidden_gem       (boolean flag — NOT isHidden, NOT a vibe)
//   price_range         (smallint 1–4 nullable — NOT priceRange)
//   cover_photo_url     (resolved URL — NOT coverPhoto Unsplash ID)
//   stats.save_count    (NOT direct saves prop)
//   stats.visit_7d      (NOT visitsThisWeek)
//   trending            (UI-derived; kept as optional flag)
//   isNew/isHidden      REMOVED — use isNewPlace(created_at) / is_hidden_gem
// ─────────────────────────────────────────────────────────────────────────────

// Fake created_at dates: some recent (< 90 days) for isNewPlace() demo
const NOW = new Date()
const daysAgo = (d: number) =>
  new Date(NOW.getTime() - d * 24 * 60 * 60 * 1000).toISOString()

export const DEMO_PLACES: Place[] = [
  {
    id: '1',
    slug: 'the-rock-michamwi',
    name: 'The Rock',
    locality: 'Michamwi',
    region: 'East Coast',
    island: 'Unguja',
    description: 'Built on a coral rock in the Indian Ocean, accessible by boat at high tide. One of the most photographed restaurants in East Africa — seafood grilled right on the water.',
    category: 'restaurant',
    vibes: ['sunset-spots', 'arts-culture', 'local-food'],
    is_hidden_gem: false,
    price_range: 3,
    status: 'active',
    created_at: daysAgo(400),
    trending: true,
    cover_photo_url: unsplash('1559128010-7c1ad6e1d6a3', 800),
    stats: { place_id: '1', save_count: 1243, visit_total: 8200, visit_7d: 342, saves_7d: 28, updated_at: daysAgo(0) },
  },
  {
    id: '2',
    slug: 'emerson-spice-rooftop',
    name: 'Emerson Spice',
    locality: 'Stone Town',
    island: 'Unguja',
    description: 'A rooftop terrace hidden above the old Arab quarter. The evening tea service here is a proper ritual — cushions, candlelight, the call to prayer in the background.',
    category: 'restaurant',
    vibes: ['sunset-spots', 'nature-hiking', 'arts-culture'],
    is_hidden_gem: false,
    price_range: 3,
    status: 'active',
    created_at: daysAgo(520),
    cover_photo_url: unsplash('1520250497591-112f2f40a3f4', 800),
    stats: { place_id: '2', save_count: 876, visit_total: 4300, visit_7d: 198, saves_7d: 14, updated_at: daysAgo(0) },
  },
  {
    id: '3',
    slug: 'paje-beach',
    name: 'Paje Beach',
    locality: 'Paje',
    region: 'East Coast',
    island: 'Unguja',
    description: 'Wide white sand beach with shallow turquoise lagoons perfect for kitesurfing. The village behind it has a good run of beach bars and local spots.',
    category: 'beach',
    vibes: ['beach-ocean', 'family-kids', 'nature-hiking'],
    is_hidden_gem: false,
    price_range: 1,
    status: 'active',
    created_at: daysAgo(620),
    trending: true,
    cover_photo_url: unsplash('1507525428034-b723cf961d3e', 800),
    stats: { place_id: '3', save_count: 2104, visit_total: 14000, visit_7d: 580, saves_7d: 62, updated_at: daysAgo(0) },
  },
  {
    id: '4',
    slug: 'forodhani-gardens',
    name: 'Forodhani Gardens',
    locality: 'Stone Town',
    island: 'Unguja',
    description: 'Every evening the waterfront fills with food stalls. Zanzibar pizza, sugarcane juice, fresh grilled octopus. Eat while watching the dhows come in.',
    category: 'market',
    vibes: ['family-kids', 'local-food', 'nature-hiking'],
    is_hidden_gem: false,
    price_range: 1,
    status: 'active',
    created_at: daysAgo(730),
    trending: true,
    cover_photo_url: unsplash('1506368249639-73a05d6f6488', 800),
    stats: { place_id: '4', save_count: 1567, visit_total: 9800, visit_7d: 412, saves_7d: 38, updated_at: daysAgo(0) },
  },
  {
    id: '5',
    slug: 'nungwi-beach-north',
    name: 'Nungwi Beach',
    locality: 'Nungwi',
    region: 'North A',
    island: 'Unguja',
    description: 'No tides here — calm, swimmable water all day long. At sunset, the beach is genuinely hard to beat. Several beach bars set up right in the sand.',
    category: 'beach',
    vibes: ['beach-ocean', 'nightlife', 'family-kids'],
    is_hidden_gem: false,
    price_range: 2,
    status: 'active',
    created_at: daysAgo(480),
    cover_photo_url: unsplash('1505118380757-91f5f5632de0', 800),
    stats: { place_id: '5', save_count: 1834, visit_total: 11200, visit_7d: 490, saves_7d: 45, updated_at: daysAgo(0) },
  },
  {
    id: '6',
    slug: 'stone-town-coffee',
    name: 'Stone Town Coffee',
    locality: 'Stone Town',
    island: 'Unguja',
    description: 'A proper specialty coffee shop tucked into a Stone Town alley. Cold brew, single origin Tanzanian, and a terrace overlooking a leafy courtyard.',
    category: 'cafe',
    vibes: ['nature-hiking', 'arts-culture', 'family-kids'],
    is_hidden_gem: false,
    price_range: 2,
    status: 'active',
    created_at: daysAgo(45),   // new — within 90 days
    cover_photo_url: unsplash('1501339847302-ac426a4a7cbb', 800),
    stats: { place_id: '6', save_count: 432, visit_total: 1800, visit_7d: 88, saves_7d: 11, updated_at: daysAgo(0) },
  },
  {
    id: '7',
    slug: 'kendwa-rocks-beach-bar',
    name: 'Kendwa Rocks',
    locality: 'Kendwa',
    region: 'North A',
    island: 'Unguja',
    description: 'The full moon parties are legendary, but any night here is a good night — fire dancers, beach bonfire, cold Kilimanjaro in hand.',
    category: 'nightlife',
    vibes: ['nightlife', 'family-kids', 'beach-ocean'],
    is_hidden_gem: false,
    price_range: 2,
    status: 'active',
    created_at: daysAgo(350),
    cover_photo_url: unsplash('1520942702018-0862200e6873', 800),
    stats: { place_id: '7', save_count: 789, visit_total: 4200, visit_7d: 224, saves_7d: 18, updated_at: daysAgo(0) },
  },
  {
    id: '8',
    slug: 'jambiani-shoreline-cafe',
    name: 'Jambiani Shoreline',
    locality: 'Jambiani',
    region: 'East Coast',
    island: 'Unguja',
    description: 'Wooden tables in the sand, seaweed farmers paddling past, Swahili coast cooking. The crab curry and coconut rice is worth the drive alone.',
    category: 'restaurant',
    vibes: ['local-food', 'nature-hiking', 'sunset-spots'],
    is_hidden_gem: true,   // admin-curated hidden gem
    price_range: 2,
    status: 'active',
    created_at: daysAgo(290),
    cover_photo_url: unsplash('1445307806294-bff7f67ff225', 800),
    stats: { place_id: '8', save_count: 345, visit_total: 1200, visit_7d: 67, saves_7d: 8, updated_at: daysAgo(0) },
  },
  {
    id: '9',
    slug: 'jozani-forest-walk',
    name: 'Jozani Forest',
    locality: 'Jozani-Chwaka Bay',
    region: 'Central',
    island: 'Unguja',
    description: "Home to Zanzibar's rare red colobus monkeys. The forest boardwalk is quiet, a bit otherworldly, and ten degrees cooler than the coast.",
    category: 'activity',
    vibes: ['nature-hiking', 'hidden-gems', 'arts-culture'],
    is_hidden_gem: true,   // admin-curated hidden gem
    price_range: 1,
    status: 'active',
    created_at: daysAgo(410),
    cover_photo_url: unsplash('1469474968028-56623f02e42e', 800),
    stats: { place_id: '9', save_count: 623, visit_total: 3100, visit_7d: 102, saves_7d: 12, updated_at: daysAgo(0) },
  },
  {
    id: '10',
    slug: 'matemwe-reef-lodge',
    name: 'Matemwe Beach',
    locality: 'Matemwe',
    region: 'North A',
    island: 'Unguja',
    description: 'Almost nobody here. Crystal water, a reef you can wade out to at low tide, and one of the few places on the island you can genuinely switch off.',
    category: 'beach',
    vibes: ['nature-hiking', 'beach-ocean', 'sunset-spots'],
    is_hidden_gem: true,   // admin-curated hidden gem
    price_range: 1,
    status: 'active',
    created_at: daysAgo(560),
    cover_photo_url: unsplash('1499424084859-d34ac5e66bc4', 800),
    stats: { place_id: '10', save_count: 287, visit_total: 980, visit_7d: 45, saves_7d: 6, updated_at: daysAgo(0) },
  },
  {
    id: '11',
    slug: 'swahili-coast-supper-club',
    name: 'Swahili Coast',
    locality: 'Stone Town',
    island: 'Unguja',
    description: 'A supper club that changes its menu weekly — whatever came in fresh from the market and the sea that morning. No set menu, no printed prices, trust the chef.',
    category: 'restaurant',
    vibes: ['sunset-spots', 'local-food', 'arts-culture'],
    is_hidden_gem: false,
    price_range: 4,
    status: 'active',
    created_at: daysAgo(60),   // new — within 90 days
    cover_photo_url: unsplash('1414235077428-338989a2e8c0', 800),
    stats: { place_id: '11', save_count: 521, visit_total: 2200, visit_7d: 133, saves_7d: 19, updated_at: daysAgo(0) },
  },
  {
    id: '12',
    slug: 'kizimkazi-dolphin-bay',
    name: 'Kizimkazi Bay',
    locality: 'Kizimkazi',
    region: 'South',
    island: 'Unguja',
    description: "Spinner dolphins come into the bay almost every morning. The fishing village behind the beach has barely changed in a hundred years.",
    category: 'activity',
    vibes: ['hidden-gems', 'family-kids', 'nature-hiking'],
    is_hidden_gem: false,
    price_range: 1,
    status: 'active',
    created_at: daysAgo(300),
    cover_photo_url: unsplash('1559737558-29e20b1a5a3c', 800),
    stats: { place_id: '12', save_count: 412, visit_total: 2600, visit_7d: 78, saves_7d: 9, updated_at: daysAgo(0) },
  },
]

// ─── Vibes ────────────────────────────────────────────────────────────────────
// Must match VIBE_CONFIG in types/index.ts and 016_seed_vibes.sql

export const DEMO_VIBES: VibeItem[] = [
  { slug: 'beach-ocean',   label: 'Beach & Ocean',   emoji: '🏖️', photoId: '1507525428034-b723cf961d3e', placeCount: 19 },
  { slug: 'local-food',    label: 'Local Food',      emoji: '🍽️', photoId: '1414235077428-338989a2e8c0', placeCount: 27 },
  { slug: 'nightlife',     label: 'Nightlife',       emoji: '🌙', photoId: '1520942702018-0862200e6873', placeCount: 9  },
  { slug: 'nature-hiking', label: 'Nature & Hiking', emoji: '🌿', photoId: '1469474968028-56623f02e42e', placeCount: 14 },
  { slug: 'arts-culture',  label: 'Arts & Culture',  emoji: '🎭', photoId: '1506368249639-73a05d6f6488', placeCount: 15 },
  { slug: 'family-kids',   label: 'Family & Kids',   emoji: '👨‍👩‍👧', photoId: '1505118380757-91f5f5632de0', placeCount: 31 },
  { slug: 'sunset-spots',  label: 'Sunset Spots',    emoji: '🌅', photoId: '1520250497591-112f2f40a3f4', placeCount: 18 },
  { slug: 'hidden-gems',   label: 'Hidden Gems',     emoji: '💎', photoId: '1559737558-29e20b1a5a3c', placeCount: 11 },
]

// ─── Categories ───────────────────────────────────────────────────────────────
// 'hidden-gem' is NOT a category — use is_hidden_gem flag on places

export const CATEGORIES: CategoryItem[] = [
  { id: 'all',        label: 'All',        emoji: '✦' },
  { id: 'restaurant', label: 'Food',       emoji: '🍽' },
  { id: 'cafe',       label: 'Cafés',      emoji: '☕' },
  { id: 'beach',      label: 'Beaches',    emoji: '🏖' },
  { id: 'nightlife',  label: 'Nightlife',  emoji: '🌙' },
  { id: 'activity',   label: 'Activities', emoji: '🎯' },
  { id: 'event',      label: 'Events',     emoji: '🎉' },
  { id: 'viewpoint',  label: 'Viewpoints', emoji: '👁' },
  { id: 'market',     label: 'Markets',    emoji: '🛍' },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function getTrendingPlaces(): Place[] {
  return DEMO_PLACES.filter(p => p.trending)
}

/** Returns places created within the last 90 days (mirrors isNewPlace()). */
export function getNewPlaces(): Place[] {
  const NINETY_DAYS_MS = 90 * 24 * 60 * 60 * 1000
  return DEMO_PLACES.filter(p => Date.now() - new Date(p.created_at).getTime() < NINETY_DAYS_MS)
}

/** Returns places flagged by admin/curator as hidden gems (is_hidden_gem = true). */
export function getHiddenGems(): Place[] {
  return DEMO_PLACES.filter(p => p.is_hidden_gem)
}

export function getPlacesByCategory(category: string): Place[] {
  if (category === 'all') return DEMO_PLACES
  return DEMO_PLACES.filter(p => p.category === category)
}

export function getPlacesByVibe(vibe: string): Place[] {
  return DEMO_PLACES.filter(p => p.vibes.includes(vibe as never))
}

export function getPlaceBySlug(slug: string): Place | undefined {
  return DEMO_PLACES.find(p => p.slug === slug)
}
