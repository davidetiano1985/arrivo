/**
 * Security Intelligence Engine.
 *
 * Redis-powered, real-time threat detection:
 *
 *   1. IP Reputation Scoring (0–100)
 *      - Sliding-window failed login count per IP (last 1h)
 *      - Score formula: min(100, failCount * 5)
 *      - Threshold auto-block: ≥ 20 failures → IP blocked for 6h
 *
 *   2. Anomaly Detection
 *      - Login frequency deviation: compare last-15-min rate vs 7-day baseline
 *      - Anomaly score (0–100) stored in Redis with 5-min TTL
 *
 *   3. Session Risk Scoring
 *      - Combines: IP reputation + user's loginAttempts + suspended flag
 *      - Returns 0–100 risk integer per request
 *
 * Redis key schema:
 *   ip:fail:{ip}      → Sorted Set, members = event timestamps (sliding 1h window)
 *   ip:blocked:{ip}   → String, value = "1", TTL = block duration
 *   ip:risk:{ip}      → String, cached risk score, TTL = 60s
 *   sec:topips        → Sorted Set, score = fail count, member = ip (1h window)
 */

import { redisPub as redis }  from './redis'
import { emitEvent }          from './eventBus'

// ── Constants ─────────────────────────────────────────────────────────────────

const WINDOW_SEC        = 60 * 60          // 1-hour sliding window for IP fails
const BLOCK_THRESHOLD   = 20               // auto-block after 20 failures / window
const BLOCK_TTL_SEC     = 6 * 60 * 60      // 6-hour block
const RISK_CACHE_TTL    = 60               // cache risk score for 60s
const TOP_IPS_WINDOW    = 60 * 60          // top IPs sorted set refresh: 1h

// ── IP Reputation ─────────────────────────────────────────────────────────────

/**
 * Record a failed login attempt from an IP.
 * Adds the current timestamp to the IP's sorted set and trims old entries.
 * Automatically blocks the IP if it crosses BLOCK_THRESHOLD.
 *
 * Returns true if the IP was newly blocked.
 */
export async function trackIPFailedLogin(
  ip: string,
  userEmail?: string,
): Promise<{ blocked: boolean; failCount: number }> {
  if (!ip || ip === '127.0.0.1' || ip === '::1') {
    return { blocked: false, failCount: 0 }
  }

  const now     = Date.now()
  const cutoff  = now - WINDOW_SEC * 1000
  const failKey = `ip:fail:${ip}`
  const topKey  = 'sec:topips'

  try {
    // Add timestamp to sliding window set
    await redis.zadd(failKey, now, `${now}`)
    // Remove entries older than the window
    await redis.zremrangebyscore(failKey, '-inf', cutoff)
    // Set expiry on the key itself
    await redis.expire(failKey, WINDOW_SEC)

    // Update global top-IPs sorted set
    await redis.zincrby(topKey, 1, ip)
    await redis.expire(topKey, TOP_IPS_WINDOW)

    // Invalidate cached risk score
    await redis.del(`ip:risk:${ip}`)

    // Count failures in window
    const failCount = await redis.zcard(failKey)

    // Auto-block if threshold exceeded
    const alreadyBlocked = await isIPBlocked(ip)
    if (!alreadyBlocked && failCount >= BLOCK_THRESHOLD) {
      await blockIP(ip, BLOCK_TTL_SEC)
      emitEvent({
        type:      'ip_blocked',
        category:  'security',
        ipAddress: ip,
        userEmail,
        data:      { failCount, windowSec: WINDOW_SEC, blockTtlSec: BLOCK_TTL_SEC },
      })
      return { blocked: true, failCount }
    }

    return { blocked: false, failCount }
  } catch {
    // Redis unavailable — fail-open (don't block legitimate users)
    return { blocked: false, failCount: 0 }
  }
}

/**
 * Check if an IP is currently blocked.
 */
export async function isIPBlocked(ip: string): Promise<boolean> {
  if (!ip || ip === '127.0.0.1' || ip === '::1') return false
  try {
    const v = await redis.get(`ip:blocked:${ip}`)
    return v !== null
  } catch {
    return false  // fail-open
  }
}

/**
 * Block an IP for a given duration.
 */
export async function blockIP(ip: string, ttlSec: number = BLOCK_TTL_SEC): Promise<void> {
  try {
    await redis.set(`ip:blocked:${ip}`, '1', 'EX', ttlSec)
  } catch { /* fail-open */ }
}

/**
 * Unblock an IP (admin action).
 */
export async function unblockIP(ip: string): Promise<void> {
  try {
    await redis.del(`ip:blocked:${ip}`)
  } catch { /* fail-open */ }
}

/**
 * Compute IP risk score (0–100).
 * Cached in Redis for 60s to avoid re-computation on every request.
 */
export async function getIPRiskScore(ip: string): Promise<number> {
  if (!ip || ip === '127.0.0.1' || ip === '::1') return 0

  const cacheKey = `ip:risk:${ip}`

  try {
    // Check cache first
    const cached = await redis.get(cacheKey)
    if (cached !== null) return parseInt(cached, 10)

    // Compute from sliding window
    const failCount = await redis.zcard(`ip:fail:${ip}`)
    const blocked   = await isIPBlocked(ip)

    // Score: 5 points per failure, +100 if blocked
    const score = blocked ? 100 : Math.min(99, failCount * 5)

    // Cache for 60s
    await redis.set(cacheKey, String(score), 'EX', RISK_CACHE_TTL)

    return score
  } catch {
    return 0  // fail-open
  }
}

/**
 * Get the top N riskiest IPs from the global sorted set.
 */
export async function getTopRiskyIPs(n: number = 20): Promise<Array<{
  ip:        string
  failCount: number
  score:     number
  blocked:   boolean
}>> {
  try {
    // Top N by fail count descending
    const entries = await redis.zrevrangebyscore('sec:topips', '+inf', '0', 'WITHSCORES', 'LIMIT', 0, n)

    const results: Array<{ ip: string; failCount: number; score: number; blocked: boolean }> = []

    for (let i = 0; i < entries.length; i += 2) {
      const ip        = entries[i]
      const failCount = parseInt(entries[i + 1], 10)
      const score     = Math.min(99, failCount * 5)
      const blocked   = await isIPBlocked(ip)
      results.push({ ip, failCount, score, blocked })
    }

    return results
  } catch {
    return []
  }
}

// ── Session Risk Scoring ──────────────────────────────────────────────────────

export type SessionRiskContext = {
  ip:            string
  loginAttempts: number
  suspended:     boolean
  failCountRecent?: number  // optional: pre-computed
}

/**
 * Compute session risk score (0–100).
 * Higher = more suspicious. >= 70 should trigger additional verification.
 */
export async function computeSessionRisk(ctx: SessionRiskContext): Promise<number> {
  const ipScore    = await getIPRiskScore(ctx.ip)
  const blocked    = await isIPBlocked(ctx.ip)

  if (blocked || ctx.suspended) return 100

  let score = 0
  score += ipScore * 0.5                                    // 50% weight: IP reputation
  score += Math.min(50, ctx.loginAttempts * 5) * 0.5       // 50% weight: past behavior

  return Math.min(100, Math.round(score))
}

// ── Anomaly Detection ─────────────────────────────────────────────────────────

/**
 * Detect login frequency anomalies.
 * Compares recent 15-min rate against a 7-day rolling average.
 * Returns anomaly score 0–100.
 */
export async function detectLoginAnomaly(
  logins15m: number,
  avgLogins15mBaseline: number,  // computed from DB 7d average
): Promise<{ anomalyScore: number; isAnomaly: boolean; deviation: number }> {

  if (avgLogins15mBaseline === 0) {
    // No baseline — can't detect anomaly
    return { anomalyScore: 0, isAnomaly: false, deviation: 0 }
  }

  const deviation    = ((logins15m - avgLogins15mBaseline) / avgLogins15mBaseline) * 100
  const anomalyScore = Math.min(100, Math.max(0, Math.round(deviation * 0.5)))
  const isAnomaly    = anomalyScore >= 60 && logins15m > 5  // require minimum volume

  return { anomalyScore, isAnomaly, deviation: Math.round(deviation) }
}

// ── IP Fail Window Cleanup ────────────────────────────────────────────────────

/**
 * Get current failure count for an IP in the sliding window.
 * Used for display in security dashboard without triggering side effects.
 */
export async function getIPFailCount(ip: string): Promise<number> {
  if (!ip) return 0
  try {
    const cutoff = Date.now() - WINDOW_SEC * 1000
    await redis.zremrangebyscore(`ip:fail:${ip}`, '-inf', cutoff)
    return await redis.zcard(`ip:fail:${ip}`)
  } catch {
    return 0
  }
}
