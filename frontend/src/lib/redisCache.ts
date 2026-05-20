/**
 * Redis Cache layer.
 *
 * Simple get/set/delete with TTL and namespace support.
 * Fail-open: if Redis is unavailable, functions return null / no-op.
 *
 * Usage:
 *   const stats = await cacheGet<Stats>('admin:stats')
 *   if (!stats) {
 *     const fresh = await computeStats()
 *     await cacheSet('admin:stats', fresh, 30)
 *     return fresh
 *   }
 *   return stats
 *
 * Or use the convenience wrapper:
 *   const stats = await cachedOr('admin:stats', 30, () => computeStats())
 */

import { redisPub as redis } from './redis'

/**
 * Get a cached value. Returns null on miss or Redis error.
 */
export async function cacheGet<T>(key: string): Promise<T | null> {
  try {
    const raw = await redis.get(key)
    if (raw === null) return null
    return JSON.parse(raw) as T
  } catch {
    return null
  }
}

/**
 * Set a value in cache with TTL (seconds).
 */
export async function cacheSet(
  key:        string,
  value:      unknown,
  ttlSeconds: number,
): Promise<void> {
  try {
    await redis.set(key, JSON.stringify(value), 'EX', ttlSeconds)
  } catch {
    // fail-open
  }
}

/**
 * Delete a single cached key.
 */
export async function cacheDelete(key: string): Promise<void> {
  try {
    await redis.del(key)
  } catch { /* fail-open */ }
}

/**
 * Delete all keys matching a prefix (e.g. 'admin:' to flush all admin cache).
 * Uses SCAN for safety — never blocks Redis.
 */
export async function cachePrefixDelete(prefix: string): Promise<number> {
  try {
    let deleted = 0
    let cursor  = '0'
    do {
      const [next, keys] = await redis.scan(cursor, 'MATCH', `${prefix}*`, 'COUNT', 100)
      cursor = next
      if (keys.length > 0) {
        await redis.del(...keys)
        deleted += keys.length
      }
    } while (cursor !== '0')
    return deleted
  } catch {
    return 0
  }
}

/**
 * Convenience: get cached value or compute + store it.
 * The factory function is only called on cache miss.
 */
export async function cachedOr<T>(
  key:        string,
  ttlSeconds: number,
  factory:    () => Promise<T>,
): Promise<T> {
  const cached = await cacheGet<T>(key)
  if (cached !== null) return cached

  const fresh = await factory()
  await cacheSet(key, fresh, ttlSeconds)
  return fresh
}
