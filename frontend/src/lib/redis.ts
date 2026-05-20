/**
 * Redis client singletons.
 *
 * Two separate clients are required for pub/sub:
 *   - `redisPub`  — used by eventBus.ts to PUBLISH events
 *   - `redisSub`  — used by redisBridge.ts in subscribe mode
 *     (a subscribed client can only run subscribe/unsubscribe commands)
 *
 * Both survive Next.js hot-module reloads via globalThis cache.
 * Connection errors are logged but never crash the app (fail-open).
 */

import Redis from 'ioredis'

declare global {
  // eslint-disable-next-line no-var
  var __redisPub: Redis | undefined
  // eslint-disable-next-line no-var
  var __redisSub: Redis | undefined
}

function makeRedisClient(label: string): Redis {
  const client = new Redis({
    host:           process.env.REDIS_HOST     ?? '127.0.0.1',
    port:           parseInt(process.env.REDIS_PORT ?? '6379', 10),
    password:       process.env.REDIS_PASSWORD,
    lazyConnect:    true,
    enableReadyCheck: true,
    maxRetriesPerRequest: 3,
    retryStrategy(times) {
      if (times > 10) return null // stop retrying after 10 attempts
      return Math.min(times * 200, 3000)
    },
  })

  client.on('connect', () => {
    console.log(`[redis:${label}] connected`)
  })
  client.on('error', (err: Error) => {
    // Log but never crash — app degrades to in-process-only mode
    console.error(`[redis:${label}] error:`, err.message)
  })
  client.on('reconnecting', () => {
    console.log(`[redis:${label}] reconnecting…`)
  })

  return client
}

// Publisher client (used for PUBLISH commands)
if (!global.__redisPub) {
  global.__redisPub = makeRedisClient('pub')
  global.__redisPub.connect().catch(() => { /* handled by error handler */ })
}
export const redisPub: Redis = global.__redisPub

// Subscriber client (used for SUBSCRIBE commands only)
if (!global.__redisSub) {
  global.__redisSub = makeRedisClient('sub')
  // connect() is called by redisBridge when it subscribes
}
export const redisSub: Redis = global.__redisSub

// Channel name for system events
export const EVENTS_CHANNEL = 'arrivo:events'
