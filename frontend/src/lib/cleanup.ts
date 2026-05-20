/**
 * Data retention cleanup.
 *
 * Retention policy (configurable via env):
 *   SystemEvent  — 90 days  (RETENTION_SYSTEM_EVENTS_DAYS)
 *   LoginEvent   — 180 days (RETENTION_LOGIN_EVENTS_DAYS)
 *   ApiMetric    — 30 days  (RETENTION_API_METRICS_DAYS)
 *
 * Designed to run daily via cron. Returns counts of deleted rows.
 */

import { prisma } from './prisma'

const SYSTEM_EVENTS_DAYS = parseInt(process.env.RETENTION_SYSTEM_EVENTS_DAYS ?? '90',  10)
const LOGIN_EVENTS_DAYS  = parseInt(process.env.RETENTION_LOGIN_EVENTS_DAYS  ?? '180', 10)
const API_METRICS_DAYS   = parseInt(process.env.RETENTION_API_METRICS_DAYS   ?? '30',  10)

function daysAgo(days: number): Date {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000)
}

export type CleanupResult = {
  systemEvents:  number
  loginEvents:   number
  apiMetrics:    number
  durationMs:    number
  ranAt:         string
}

export async function runRetentionCleanup(): Promise<CleanupResult> {
  const t0 = performance.now()

  const [systemEvents, loginEvents, apiMetrics] = await Promise.all([
    prisma.systemEvent.deleteMany({
      where: { createdAt: { lt: daysAgo(SYSTEM_EVENTS_DAYS) } },
    }),
    prisma.loginEvent.deleteMany({
      where: { createdAt: { lt: daysAgo(LOGIN_EVENTS_DAYS) } },
    }),
    prisma.apiMetric.deleteMany({
      where: { createdAt: { lt: daysAgo(API_METRICS_DAYS) } },
    }),
  ])

  const durationMs = Math.round(performance.now() - t0)

  const result: CleanupResult = {
    systemEvents:  systemEvents.count,
    loginEvents:   loginEvents.count,
    apiMetrics:    apiMetrics.count,
    durationMs,
    ranAt:         new Date().toISOString(),
  }

  console.log('[cleanup] retention run:', JSON.stringify(result))
  return result
}
