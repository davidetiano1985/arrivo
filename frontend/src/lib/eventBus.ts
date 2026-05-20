/**
 * Central EventBus.
 *
 * Every system event flows through here:
 *   1. Assigns severity score (1–100)
 *   2. Broadcasts in-process to connected SSE clients (real-time)
 *   3. Persists to SystemEvent table (fire-and-forget — never blocks caller)
 *
 * Usage:
 *   emitEvent({ type: 'login_fail', category: 'security', userEmail, ipAddress })
 */

import { Prisma }             from '@prisma/client'
import { prisma }             from './prisma'
import { broadcastLiveEvent } from './eventEmitter'
import type { LiveEvent }     from './eventEmitter'

// ── Event types ───────────────────────────────────────────────────────────────

export type EventType =
  | 'login_success'
  | 'login_fail'
  | 'brute_force'
  | 'admin_action'
  | 'user_suspended'
  | 'force_logout'
  | 'security_alert'
  | 'api_slow'
  | 'db_slow'
  | 'db_error'

export type EventCategory = 'security' | 'performance' | 'user' | 'system' | 'admin'

// ── Severity map (baseline scores) ───────────────────────────────────────────
// Dynamic boosting happens in emitEvent based on context.

const SEVERITY: Record<EventType, number> = {
  login_success:  5,
  login_fail:     30,
  brute_force:    85,
  admin_action:   35,
  user_suspended: 60,
  force_logout:   55,
  security_alert: 75,
  api_slow:       40,
  db_slow:        55,
  db_error:       90,
}

// ── Emit ──────────────────────────────────────────────────────────────────────

export type EmitPayload = {
  type:       EventType
  category:   EventCategory
  userId?:    string
  userEmail?: string
  ipAddress?: string
  route?:     string
  data?:      Record<string, unknown>
}

export function emitEvent(payload: EmitPayload): void {
  let severity = SEVERITY[payload.type] ?? 20

  // Dynamic severity boosts
  const attempts = (payload.data?.attempts as number | undefined) ?? 0
  if (payload.type === 'login_fail'  && attempts > 10) severity = Math.min(100, severity + 30)
  if (payload.type === 'login_fail'  && attempts > 5)  severity = Math.min(100, severity + 15)
  if (payload.type === 'brute_force' && attempts > 20) severity = 100

  const ts = new Date().toISOString()

  // 1. Real-time push to connected SSE clients (synchronous, in-process)
  const live: LiveEvent = {
    type:      payload.type,
    category:  payload.category,
    severity,
    userId:    payload.userId    ?? null,
    userEmail: payload.userEmail ?? null,
    ipAddress: payload.ipAddress ?? null,
    route:     payload.route     ?? null,
    data:      payload.data      ?? null,
    ts,
  }
  broadcastLiveEvent(live)

  // 2. Persist to DB — fire-and-forget (no await, no throw)
  prisma.systemEvent.create({
    data: {
      type:      payload.type,
      category:  payload.category,
      severity,
      userId:    payload.userId,
      userEmail: payload.userEmail,
      ipAddress: payload.ipAddress,
      route:     payload.route,
      data:      (payload.data ?? {}) as unknown as Prisma.InputJsonValue,
    },
  }).catch(() => { /* intentionally silent */ })
}
