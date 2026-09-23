-- ============================================================
-- WENDA · 001_extensions.sql
-- Enable all required PostgreSQL extensions
-- Must run first. Safe to re-run (IF NOT EXISTS).
-- DO NOT APPLY WITHOUT REVIEW
-- ============================================================

-- Geospatial queries (place coordinates, ST_DWithin, ST_Distance)
CREATE EXTENSION IF NOT EXISTS postgis;

-- Required by PostGIS for geography type support
CREATE EXTENSION IF NOT EXISTS postgis_topology;

-- UUID generation via gen_random_uuid() — already in PG 14+; included for safety
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Trigram similarity for fuzzy search fallback (ILIKE / similarity())
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Scheduled jobs — REQUIRES Supabase Pro plan or higher.
-- If this fails, remove it and trigger refresh_place_stats() via a
-- Next.js cron route (e.g. Vercel Cron) calling the service-role API instead.
CREATE EXTENSION IF NOT EXISTS pg_cron;
