-- Enterprise indexes + request tracing fields
-- Migration: 20260520030000_enterprise_indexes_tracing

-- Add requestId to SystemEvent for end-to-end tracing
ALTER TABLE "SystemEvent" ADD COLUMN IF NOT EXISTS "requestId" TEXT;

-- Add requestId to ApiMetric for end-to-end tracing
ALTER TABLE "ApiMetric" ADD COLUMN IF NOT EXISTS "requestId" TEXT;

-- LoginEvent: IP reputation analysis index
CREATE INDEX IF NOT EXISTS "LoginEvent_ipAddress_createdAt_idx"
  ON "LoginEvent" ("ipAddress", "createdAt" DESC);

-- LoginEvent: fail-rate analysis index
CREATE INDEX IF NOT EXISTS "LoginEvent_success_createdAt_idx"
  ON "LoginEvent" ("success", "createdAt" DESC);

-- LoginEvent: retention cleanup / general time-range scan
CREATE INDEX IF NOT EXISTS "LoginEvent_createdAt_idx"
  ON "LoginEvent" ("createdAt" DESC);

-- SystemEvent: IP threat analysis index
CREATE INDEX IF NOT EXISTS "SystemEvent_ipAddress_createdAt_idx"
  ON "SystemEvent" ("ipAddress", "createdAt" DESC);

-- SystemEvent: request tracing lookup
CREATE INDEX IF NOT EXISTS "SystemEvent_requestId_idx"
  ON "SystemEvent" ("requestId");

-- ApiMetric: request tracing lookup
CREATE INDEX IF NOT EXISTS "ApiMetric_requestId_idx"
  ON "ApiMetric" ("requestId");
