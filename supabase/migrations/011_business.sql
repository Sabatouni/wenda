-- ============================================================
-- WENDA · 011_business.sql
-- business_profiles, place_claims
-- Depends on: 003_profiles.sql, 004_places.sql, 002_enums.sql
-- ============================================================

-- business_profiles
CREATE TABLE business_profiles (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id      uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  business_name text NOT NULL CHECK (char_length(business_name) BETWEEN 1 AND 120),
  contact_email text,
  verified_at   timestamptz,
  created_at    timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE business_profiles IS
  'Optional business entity linked to a user account. Verified by admin team.';

CREATE INDEX IF NOT EXISTS idx_business_profiles_owner ON business_profiles (owner_id);

-- place_claims
-- Approved claim grants ability to call update_place_business_info() RPC.
-- is_business_owner flag REMOVED from profiles — derived from this table.
CREATE TABLE place_claims (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  claimant_id  uuid REFERENCES profiles(id)          ON DELETE SET NULL,
  place_id     uuid NOT NULL REFERENCES places(id)   ON DELETE CASCADE,
  business_id  uuid REFERENCES business_profiles(id) ON DELETE SET NULL,
  status       claim_status NOT NULL DEFAULT 'pending',
  evidence_url text,
  reviewed_by  uuid REFERENCES profiles(id)          ON DELETE SET NULL,
  reviewed_at  timestamptz,
  notes        text,
  created_at   timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE place_claims IS
  'Business ownership claims. Approved claim allows update_place_business_info() RPC only.';
COMMENT ON COLUMN place_claims.claimant_id IS
  'SET NULL on profile delete — claim record preserved for audit.';

CREATE INDEX IF NOT EXISTS idx_place_claims_claimant ON place_claims (claimant_id, status);
CREATE INDEX IF NOT EXISTS idx_place_claims_place    ON place_claims (place_id, status);
CREATE INDEX IF NOT EXISTS idx_place_claims_pending  ON place_claims (status, created_at) WHERE status = 'pending';
