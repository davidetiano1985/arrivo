-- Migration: add zip and hours fields to Restaurant
-- 2026-05-20

ALTER TABLE "Restaurant" ADD COLUMN IF NOT EXISTS "zip"   TEXT;
ALTER TABLE "Restaurant" ADD COLUMN IF NOT EXISTS "hours" TEXT;
