// ============================================================
// WENDA — Canonical TypeScript types
// Aligned to DB migrations 001–018
// Last updated: 2026-09-22
//
// Rules:
//   - Every type here maps directly to a DB column or is
//     explicitly marked as a UI/derived concept.
//   - Do NOT add fields that don't exist in the DB schema
//     without a clear comment explaining why.
//   - hidden-gem is NOT a PlaceCategory and NOT a VibeSlug.
//     It is the places.is_hidden_gem boolean flag.
// ============================================================

// ─────────────────────────────────────────────────────────────
// Vibe slugs — must match 016_seed_vibes.sql exactly
// ─────────────────────────────────────────────────────────────
export type VibeSlug =
  | 'beach-ocean'
  | 'local-food'
  | 'nightlife'
  | 'nature-hiking'
  | 'arts-culture'
  | 'family-kids'
  | 'sunset-spots'
  | 'hidden-gems'

// ─────────────────────────────────────────────────────────────
// Place categories — 'hidden-gem' is NOT a category.
// It is the places.is_hidden_gem boolean flag (admin/curator).
// 'all' is a UI-only filter value, not stored in the DB.
// ─────────────────────────────────────────────────────────────
export type PlaceCategory =
  | 'restaurant'
  | 'cafe'
  | 'beach'
  | 'nightlife'
  | 'activity'
  | 'event'
  | 'viewpoint'
  | 'market'

// ─────────────────────────────────────────────────────────────
// Outing member statuses — matches outing_member_status enum.
// 'joined' is NOT valid. Use 'going'.
// Active filter set: ['invited', 'going', 'maybe']
// ─────────────────────────────────────────────────────────────
export type OutingMemberStatus =
  | 'invited'
  | 'going'
  | 'maybe'
  | 'cant_make_it'
  | 'removed'

// ─────────────────────────────────────────────────────────────
// PlacePhoto — matches place_photos table
// No alt_text column. No attribution_name/attribution_url.
// Use photographer_name, photographer_url, source_url.
// ─────────────────────────────────────────────────────────────
export interface PlacePhoto {
  id: string
  place_id: string
  storage_path: string
  url?: string | null           // resolved public URL (not stored in DB, computed on fetch)
  photographer_name?: string | null
  photographer_url?: string | null
  source_url?: string | null
  caption?: string | null
  sort_order: number
  is_cover: boolean
}

// ─────────────────────────────────────────────────────────────
// PlaceStats — matches place_stats table (materialized view)
// ─────────────────────────────────────────────────────────────
export interface PlaceStats {
  place_id: string
  save_count: number
  visit_total: number
  visit_7d: number
  saves_7d: number
  updated_at: string
}

// ─────────────────────────────────────────────────────────────
// Place — matches places table + joined relations
// ─────────────────────────────────────────────────────────────
export interface Place {
  id: string
  slug: string
  name: string
  description: string
  // Location — matches DB columns exactly (NOT location/area)
  locality: string        // e.g. 'Stone Town', 'Nungwi'
  region?: string | null  // e.g. 'North A', 'East Coast'
  island: string          // e.g. 'Unguja', 'Pemba'
  // Classification
  category: PlaceCategory
  vibes: VibeSlug[]
  // Discovery (admin/curator managed via 017_places_discovery.sql)
  is_hidden_gem: boolean  // NOT a vibe; NOT settable by business owners
  price_range: 1 | 2 | 3 | 4 | null  // nullable; NULL = price unknown
  // Lifecycle
  status: 'active' | 'pending' | 'archived' | 'suspended'
  created_at: string
  // Relations (populated via joins — absent if not requested)
  photos?: PlacePhoto[]
  cover_photo_url?: string | null   // resolved URL of is_cover photo
  stats?: PlaceStats
  // UI-derived flags (NOT stored in DB)
  trending?: boolean  // computed server-side from stats formula
}

// ─────────────────────────────────────────────────────────────
// isNewPlace — derived client-side from created_at.
// NOT a DB column. 90-day threshold.
// ─────────────────────────────────────────────────────────────
export function isNewPlace(createdAt: string): boolean {
  const NINETY_DAYS_MS = 90 * 24 * 60 * 60 * 1000
  return Date.now() - new Date(createdAt).getTime() < NINETY_DAYS_MS
}

// ─────────────────────────────────────────────────────────────
// Profile — matches wenda_profiles table (WENDA public identity extension of profiles)
// Field is 'handle', NOT 'username'.
// ─────────────────────────────────────────────────────────────
export interface Profile {
  id: string
  handle: string           // unique @handle — NOT 'username'
  display_name: string
  avatar_url?: string | null
  bio?: string | null
  city?: string | null
  avatar_path?: string | null
  joined_at: string        // wenda_profiles.joined_at (NOT profiles.created_at)
  updated_at: string
  is_deleted: boolean      // true = soft-deleted WENDA account (NOT deleted_at)
}

// ─────────────────────────────────────────────────────────────
// WendaOnboardingInput — params for the create_wenda_profile() RPC
// Matches 014_functions_triggers.sql: create_wenda_profile(p_display_name, p_handle?)
// ─────────────────────────────────────────────────────────────
export interface WendaOnboardingInput {
  display_name: string   // required, 1–60 chars; used as initial display_name
  handle?: string        // optional; server auto-generates from email if omitted
}

// ─────────────────────────────────────────────────────────────
// SavedPlace — matches saved_places table
// ─────────────────────────────────────────────────────────────
export interface SavedPlace {
  // No 'id' column — composite PK (user_id, place_id)
  user_id: string
  place_id: string
  saved_at: string
}

// ─────────────────────────────────────────────────────────────
// Visit — matches visits table
// RLS enforces per-user privacy in the DB — not just frontend.
// ─────────────────────────────────────────────────────────────
export interface Visit {
  id: string
  user_id: string
  place_id: string
  visit_day: string   // YYYY-MM-DD generated from created_at (Africa/Dar_es_Salaam)
  created_at: string
}

// ─────────────────────────────────────────────────────────────
// Outing — matches outings table
// ─────────────────────────────────────────────────────────────
export type OutingStatus = 'planning' | 'confirmed' | 'completed' | 'cancelled'

export interface Outing {
  id: string
  title: string
  creator_id: string          // organizer identity (NOT outing_members.role)
  date_start?: string | null  // ISO date — NOT 'date' or 'planned_for'
  date_end?: string | null    // ISO date
  is_public: boolean
  status: OutingStatus
  created_at: string
  // Relations
  places?: OutingPlace[]
  members?: OutingMember[]
}

// ─────────────────────────────────────────────────────────────
// OutingMember — matches outing_members table
// No 'role' column — organizer = outings.creator_id
// ─────────────────────────────────────────────────────────────
export interface OutingMember {
  // No 'id' — composite PK (outing_id, user_id)
  outing_id: string
  user_id: string
  status: OutingMemberStatus  // invited | going | maybe | cant_make_it | removed
  // NOTE: no 'role' field — organizer identity is outings.creator_id
  joined_at: string
  profile?: Profile
}

// ─────────────────────────────────────────────────────────────
// OutingPlace — matches outing_places table
// No 'added_by' column in V1 schema
// ─────────────────────────────────────────────────────────────
export interface OutingPlace {
  // No 'id' — composite PK (outing_id, place_id)
  outing_id: string
  place_id: string
  note?: string | null
  sort_order: number
  // NOTE: no 'added_by' — not tracked in V1
  place?: Place
}

// ─────────────────────────────────────────────────────────────
// BusinessProfile — matches business_profiles table
// ─────────────────────────────────────────────────────────────
export interface BusinessProfile {
  id: string
  place_id: string
  owner_id: string
  claimed_at: string
  verified: boolean
}

// ─────────────────────────────────────────────────────────────
// Post — matches posts table
// ─────────────────────────────────────────────────────────────
export type PostType = 'place_review' | 'outing_recap' | 'tip' | 'general'

export interface Post {
  id: string
  author_id: string
  place_id?: string | null
  outing_id?: string | null
  type: PostType
  content: string
  media_urls: string[]
  is_public: boolean
  created_at: string
}

// ─────────────────────────────────────────────────────────────
// Moderation — matches reports + moderation_actions tables
// ─────────────────────────────────────────────────────────────
export type ReportReason =
  | 'spam'
  | 'inappropriate'
  | 'incorrect_info'
  | 'duplicate'
  | 'other'

export interface Report {
  id: string
  reporter_id: string
  content_type: 'place' | 'post' | 'profile' | 'outing'
  content_id: string
  reason: ReportReason
  details?: string | null
  status: 'open' | 'reviewed' | 'resolved' | 'dismissed'
  created_at: string
}

// ─────────────────────────────────────────────────────────────
// Vibe config — display metadata for the 8 canonical vibes
// Matches 016_seed_vibes.sql exactly
// ─────────────────────────────────────────────────────────────
export interface VibeConfig {
  slug: VibeSlug
  label: string
  emoji: string
  description?: string
}

export const VIBE_CONFIG: Record<VibeSlug, VibeConfig> = {
  'beach-ocean':   { slug: 'beach-ocean',   label: 'Beach & Ocean',   emoji: '🏖️' },
  'local-food':    { slug: 'local-food',    label: 'Local Food',      emoji: '🍽️' },
  'nightlife':     { slug: 'nightlife',     label: 'Nightlife',       emoji: '🌙' },
  'nature-hiking': { slug: 'nature-hiking', label: 'Nature & Hiking', emoji: '🌿' },
  'arts-culture':  { slug: 'arts-culture',  label: 'Arts & Culture',  emoji: '🎭' },
  'family-kids':   { slug: 'family-kids',   label: 'Family & Kids',   emoji: '👨‍👩‍👧' },
  'sunset-spots':  { slug: 'sunset-spots',  label: 'Sunset Spots',    emoji: '🌅' },
  'hidden-gems':   { slug: 'hidden-gems',   label: 'Hidden Gems',     emoji: '💎' },
}

// ─────────────────────────────────────────────────────────────
// Price range labels
// ─────────────────────────────────────────────────────────────
export const PRICE_RANGE_LABELS: Record<1 | 2 | 3 | 4, string> = {
  1: '$',
  2: '$$',
  3: '$$$',
  4: '$$$$',
}

// ─────────────────────────────────────────────────────────────
// UI-only types (not DB entities)
// ─────────────────────────────────────────────────────────────

// VibeItem: VibeConfig extended with demo/UI display data
export interface VibeItem extends VibeConfig {
  photoId: string     // Unsplash photo ID (dev/demo only)
  placeCount: number
}

// CategoryItem: UI filter chip (not a DB entity)
// 'all' is a UI-only value
export interface CategoryItem {
  id: PlaceCategory | 'all'
  label: string
  emoji: string
}
