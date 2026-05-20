/**
 * Redis Cache layer with local memory fallback.
 *
 * Primary: Redis (shared across all Next.js workers / future instances)
 * Fallback: In-process Map (per-worker, limited TTL, max 500 entries)
 *           Automatically activated when Redis is unavailable.
 *
 * Usage:
 *   const stats = await cachedOr('admin:stats', 30, () => computeStats())
 */

import { redisPub as redis } from './redis'

// ── Local in-memory fallback ──────────────────────────────────────────────────

type LocalEntry = { value: unknown; expires: number }
const _local = new Map<string, LocalEntry>()

/** Prune expired entries and enforce size cap. */
function _localEvict(): void {
  const now = Date.now()
  Array.from(_local.entries()).forEach(([k, v]) => {
    if (now > v.expires) _local.delete(k)
  })
  // Hard cap: evict oldest 10% if still over limit
  if (_local.size > 500) {
    const toDelete = Math.ceil(_local.size * 0.1)
    let deleted = 0
    Array.from(_local.keys()).forEach((k) => {
      if (deleted++ < toDelete) _local.delete(k)
    })
  }
}

function _localGet<T>(key: string): T | null {
  const entry = _local.get(key)
  if (!entry) return null
  if (Date.now() > entry.expires) { _local.delete(key); return null }
  return entry.value as T
}

function _localSet(key: string, value: unknown, ttlSeconds: number): void {
  _localEvict()
  _local.set(key, { value, expires: Date.now() + ttlSeconds * 1_000 })
}

function _localDelete(key: string): void {
  _local.delete(key)
}

// ── Redis + fallback helpers ──────────────────────────────────────────────────

/**
 * Get a cached value. Returns null on miss or error.
 * Falls back to local memory cache when Redis is unavailable.
 */
export async function cacheGet<T>(key: string): Promise<T | null> {
  try {
    const raw = await redis.get(key)
    if (raw === null) return null
    return JSON.parse(raw) as T
  } catch {
    // Redis unavailable — try local fallback
    return _localGet<T>(key)
  }
}

/**
 * Set a value in cache with TTL (seconds).
 * Falls back to local memory cache when Redis is unavailable.
 */
export async function cacheSet(
  key:        string,
  value:      unknown,
  ttlSeconds: number,
): Promise<void> {
  try {
    await redis.set(key, JSON.stringify(value), 'EX', ttlSeconds)
    // Also mirror to local so immediate reads don't need to go to Redis
    _localSet(key, value, ttlSeconds)
  } catch {
    // Redis unavailable — store locally
    _localSet(key, value, ttlSeconds)
  }
}

/**
 * Delete a single cached key from both Redis and local.
 */
export async function cacheDelete(key: string): Promise<void> {
  _localDelete(key)
  try {
    await redis.del(key)
  } catch { /* fail-open */ }
}

/**
 * Delete all keys matching a prefix.
 * Uses SCAN for safety — never blocks Redis.
 * Local cache entries with matching prefix are also removed.
 */
export async function cachePrefixDelete(prefix: string): Promise<number> {
  // Clear local entries with this prefix
  Array.from(_local.keys()).forEach((k) => {
    if (k.startsWith(prefix)) _local.delete(k)
  })

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
 *
 * Redis down? Automatically falls back to local Map cache
 * so hot paths remain fast even during Redis outages.
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

/**
 * Local cache stats (for observability).
 */
export function localCacheStats(): { size: number; keys: string[] } {
  _localEvict()
  return { size: _local.size, keys: Array.from(_local.keys()) as string[] }
}
