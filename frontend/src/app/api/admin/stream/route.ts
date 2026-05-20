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

import { getToken }    from 'next-auth/jwt'
import { NextRequest } from 'next/server'

import { adminEmitter }               from '@/lib/eventEmitter'
import { fetchControlPlaneSnapshot }  from '@/lib/controlPlane'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  // ── Auth ─────────────────────────────────────────────────────────────────────
  const token = await getToken({ req })
  if (!token || (token.role as string) !== 'super_admin') {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    })
  }

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

      // ── Live event relay ───────────────────────────────────────────────────
      function onLive(ev: unknown) {
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
