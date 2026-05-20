/**
 * API Metrics middleware.
 *
 * Wraps a Next.js route handler to automatically record:
 *   - Route name
 *   - HTTP method
 *   - Response status code
 *   - Latency in milliseconds
 *
 * Usage (in any route.ts):
 *
 *   import { withApiMetrics } from '@/lib/apiMetrics'
 *
 *   async function handleGET(req: NextRequest) { ... }
 *   export const GET = withApiMetrics('/api/admin/stats', handleGET)
 *
 * Metrics are persisted to ApiMetric table (fire-and-forget — never blocks).
 * Slow requests (> SLOW_THRESHOLD_MS) also emit a system event for alerting.
 */

import { type NextRequest, NextResponse } from 'next/server'

import { prisma }    from './prisma'
import { emitEvent } from './eventBus'

const SLOW_THRESHOLD_MS = 500

/**
 * Generate a compact request ID for tracing.
 * Format: {timestamp_b36}-{random_b36}  e.g. "lzk3j-4f2a"
 */
function generateRequestId(): string {
  const ts  = Date.now().toString(36)
  const rnd = Math.random().toString(36).slice(2, 6)
  return `${ts}-${rnd}`
}

type RouteHandler = (req: NextRequest, ctx?: unknown) => Promise<Response | NextResponse>

export function withApiMetrics(route: string, handler: RouteHandler): RouteHandler {
  return async function wrappedHandler(req: NextRequest, ctx?: unknown) {
    const t0        = performance.now()
    const requestId = req.headers.get('x-request-id') ?? generateRequestId()
    let   status    = 200

    try {
      const res = await handler(req, ctx)
      status = res.status

      // Propagate requestId to client — useful for support correlation
      const headers = new Headers(res.headers)
      headers.set('x-request-id', requestId)
      return new Response(res.body, { status: res.status, headers })
    } catch (err) {
      status = 500
      throw err
    } finally {
      const latencyMs = Math.round(performance.now() - t0)

      // Persist metric — fire-and-forget
      prisma.apiMetric.create({
        data: {
          route,
          method:    req.method,
          status,
          latencyMs,
          requestId,
        },
      }).catch(() => { /* never block */ })

      // Emit slow API event if over threshold
      if (latencyMs > SLOW_THRESHOLD_MS) {
        emitEvent({
          type:      'api_slow',
          category:  'performance',
          route,
          requestId,
          data:      { latencyMs, method: req.method, status },
        })
      }
    }
  }
}
