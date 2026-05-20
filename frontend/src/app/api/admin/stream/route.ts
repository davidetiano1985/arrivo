/**
 * Server-Sent Events stream — real-time Control Plane feed.
 *
 * Emits two message types:
 *   { type: 'snapshot', data: ControlPlaneSnapshot }  — every 15 s (heartbeat)
 *   { type: 'event',    data: LiveEvent }              — pushed on every system event
 *
 * nginx note: X-Accel-Buffering: no disables proxy buffering.
 *             PM2 single-process mode: EventEmitter works perfectly.
 */

import { NextRequest } from 'next/server'

import { adminEmitter }               from '@/lib/eventEmitter'
import { fetchControlPlaneSnapshot }  from '@/lib/controlPlane'
import { initRedisBridge }            from '@/lib/redisBridge'
import { requireSuperAdmin }          from '@/lib/admin-auth'

// Initialize Redis→EventEmitter bridge once per process startup.
// Safe to call multiple times — guarded by global.__redisBridgeInit.
initRedisBridge()

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  // ── Auth ─────────────────────────────────────────────────────────────────────
  const auth = await requireSuperAdmin(req)
  if (!auth.ok) return auth.response

  const encoder = new TextEncoder()

  // ── Build SSE stream ──────────────────────────────────────────────────────────
  const stream = new ReadableStream({
    start(controller) {
      let closed = false
      let heartbeatTimer: ReturnType<typeof setTimeout> | undefined
      let keepAliveTimer: ReturnType<typeof setInterval> | undefined

      // Helper: safely enqueue
      function send(payload: unknown) {
        if (closed) return
        try {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(payload)}\n\n`)
          )
        } catch {
          closed = true
        }
      }

      // ── Snapshot heartbeat (every 15 s) ────────────────────────────────────
      async function heartbeat() {
        if (closed) return
        try {
          const snapshot = await fetchControlPlaneSnapshot()
          send({ type: 'snapshot', data: snapshot })
        } catch {
          // DB unreachable — don't kill the stream
        }
        if (!closed) heartbeatTimer = setTimeout(heartbeat, 15_000)
      }

      // ── Event deduplication (Redis pub/sub can cause brief cross-instance
      //    duplicates — drop events with same type+ts seen within 2s) ─────────
      const recentHashes = new Map<string, number>()
      function dedup(ev: Record<string, unknown>): boolean {
        const hash = `${String(ev.type)}:${String(ev.ts)}`
        const now  = Date.now()
        recentHashes.forEach((t, k) => { if (now - t > 2000) recentHashes.delete(k) })
        if (recentHashes.has(hash)) return true
        recentHashes.set(hash, now)
        return false
      }

      // ── Live event relay ───────────────────────────────────────────────────
      function onLive(ev: unknown) {
        if (dedup(ev as Record<string, unknown>)) return
        send({ type: 'event', data: ev })
      }
      adminEmitter.on('live', onLive)

      // ── Keep-alive comment (prevents nginx from closing idle connections) ──
      keepAliveTimer = setInterval(() => {
        if (closed) { clearInterval(keepAliveTimer); return }
        try {
          controller.enqueue(encoder.encode(': keepalive\n\n'))
        } catch {
          closed = true
        }
      }, 25_000)

      // ── Start with immediate snapshot ──────────────────────────────────────
      heartbeat()

      // ── Cleanup on client disconnect ───────────────────────────────────────
      req.signal.addEventListener('abort', () => {
        closed = true
        adminEmitter.off('live', onLive)
        if (heartbeatTimer)  clearTimeout(heartbeatTimer)
        if (keepAliveTimer)  clearInterval(keepAliveTimer)
        try { controller.close() } catch { /* already closed */ }
      })
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type':      'text/event-stream',
      'Cache-Control':     'no-cache, no-transform',
      'Connection':        'keep-alive',
      'X-Accel-Buffering': 'no',   // nginx: disable proxy_buffering for this route
    },
  })
}
