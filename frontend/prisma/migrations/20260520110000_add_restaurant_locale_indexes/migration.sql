-- Add missing indexes for Restaurant and LocaleRequest
-- Improves query performance for status filter + time sort at scale

CREATE INDEX IF NOT EXISTS "Restaurant_status_createdAt_idx"
  ON "Restaurant" ("status", "createdAt" DESC);

CREATE INDEX IF NOT EXISTS "Restaurant_ownerId_createdAt_idx"
  ON "Restaurant" ("ownerId", "createdAt" DESC);

CREATE INDEX IF NOT EXISTS "Restaurant_createdAt_idx"
  ON "Restaurant" ("createdAt" DESC);

CREATE INDEX IF NOT EXISTS "LocaleRequest_status_createdAt_idx"
  ON "LocaleRequest" ("status", "createdAt" DESC);

CREATE INDEX IF NOT EXISTS "LocaleRequest_createdAt_idx"
  ON "LocaleRequest" ("createdAt" DESC);
