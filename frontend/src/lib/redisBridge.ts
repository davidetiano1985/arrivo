/**
 * Redis → local EventEmitter bridge.
 *
 * Subscribes to the `arrivo:events` Redis channel and re-emits each
 * message on the local adminEmitter so all connected SSE clients
 * (in this process) receive live events published by any app process.
 *
 * This is the key piece for distributed (multi-process / cluster) support:
 *   Process A emits event → publishes to Redis → all processes' bridges
 *   pick it up → all processes' SSE clients receive it.
 *
 * In single-process PM2 (current setup) this still works fine — the event
 * round-trips through Redis but that's <1 ms and negligible.
 *
 * Call initRedisBridge() exactly once at stream startup.
 */

import { adminEmitter }    from './eventEmitter'
import { redisSub, EVENTS_CHANNEL } from './redis'

declare global {
  // eslint-disable-next-line no-var
  var __redisBridgeInit: boolean | undefined
}

export function initRedisBridge(): void {
  if (global.__redisBridgeInit) return
  global.__redisBridgeInit = true

  redisSub.connect().catch(() => { /* error logged by redis.ts */ })

  redisSub.subscribe(EVENTS_CHANNEL, (err) => {
    if (err) {
      console.error('[redisBridge] subscribe error:', err.message)
    } else {
      console.log(`[redisBridge] subscribed to ${EVENTS_CHANNEL}`)
    }
  })

  redisSub.on('message', (_channel: string, message: string) => {
    try {
      const ev = JSON.parse(message)
      adminEmitter.emit('live', ev)
    } catch {
      // Malformed message — ignore
    }
  })
}
