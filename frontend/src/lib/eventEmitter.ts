/**
 * Global in-process EventEmitter singleton.
 *
 * Survives Next.js hot-module reloads (stored on globalThis).
 * Works perfectly with single-process PM2 (fork mode).
 * For cluster mode: replace with Redis pub/sub adapter.
 *
 * Max 200 concurrent SSE listeners — adjust if needed.
 */

import { EventEmitter } from 'events'

declare global {
  // eslint-disable-next-line no-var
  var __adminEventEmitter: EventEmitter | undefined
}

if (!global.__adminEventEmitter) {
  const ee = new EventEmitter()
  ee.setMaxListeners(200)
  global.__adminEventEmitter = ee
}

export const adminEmitter: EventEmitter = global.__adminEventEmitter

// ── LiveEvent shape (matches SystemEvent fields) ──────────────────────────────

export type LiveEvent = {
  type:      string
  category:  string
  severity:  number
  userId?:   string | null
  userEmail?: string | null
  ipAddress?: string | null
  route?:    string | null
  data?:     Record<string, unknown> | null
  ts:        string
}

export function broadcastLiveEvent(ev: LiveEvent): void {
  try {
    adminEmitter.emit('live', ev)
  } catch {
    // never fail the caller
  }
}
