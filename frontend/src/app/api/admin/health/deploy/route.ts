/**
 * Deploy health endpoint — returns current deployment status.
 *
 * Requires: super_admin JWT
 *
 * Returns:
 *   - commit hash + message + deployer
 *   - deploy timestamp + status
 *   - live DB latency
 *   - live Redis latency
 *   - Node.js process uptime + memory
 */

import { NextRequest } from 'next/server'
import fs              from 'fs'
import path            from 'path'

import { prisma }            from '@/lib/prisma'
import { redisPub }          from '@/lib/redis'
import { requireSuperAdmin } from '@/lib/admin-auth'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

type DeployInfo = {
  commit:      string
  commitShort: string
  commitMsg:   string
  deployer:    string
  deployedAt:  string
  status:      'success' | 'rolled_back' | 'build_failed'
  rollbackAt?: string
}

export async function GET(req: NextRequest) {
  // ── Auth ───────────────────────────────────────────────────────────────────
  const auth = await requireSuperAdmin(req)
  if (!auth.ok) return auth.response

  // ── Read deploy info file ─────────────────────────────────────────────────
  let deploy: DeployInfo | null = null
  try {
    const p = path.join(process.cwd(), '.deploy-info.json')
    if (fs.existsSync(p)) {
      deploy = JSON.parse(fs.readFileSync(p, 'utf-8')) as DeployInfo
    }
  } catch {
    // no deploy info file — first deploy or pre-feature
  }

  // ── DB latency probe ──────────────────────────────────────────────────────
  const t0 = performance.now()
  let dbStatus:  'ok' | 'slow' | 'error' = 'ok'
  let dbLatency  = 0
  try {
    await prisma.$queryRaw`SELECT 1`
    dbLatency = Math.round(performance.now() - t0)
    if (dbLatency > 200) dbStatus = 'slow'
  } catch {
    dbStatus  = 'error'
    dbLatency = -1
  }

  // ── Redis latency probe ───────────────────────────────────────────────────
  const tR = performance.now()
  let redisStatus:  'ok' | 'slow' | 'error' = 'ok'
  let redisLatency  = 0
  try {
    await redisPub.ping()
    redisLatency = Math.round(performance.now() - tR)
    if (redisLatency > 50) redisStatus = 'slow'
  } catch {
    redisStatus  = 'error'
    redisLatency = -1
  }

  // ── Process stats ─────────────────────────────────────────────────────────
  const mem        = process.memoryUsage()
  const uptimeSec  = Math.round(process.uptime())
  const memUsedMB  = Math.round(mem.heapUsed  / 1024 / 1024)
  const memTotalMB = Math.round(mem.heapTotal / 1024 / 1024)
  const memPercent = Math.round((memUsedMB / memTotalMB) * 100)

  // ── Overall health ────────────────────────────────────────────────────────
  const overall =
    dbStatus    === 'error' ? 'degraded' :
    redisStatus === 'error' ? 'degraded' :
    deploy?.status === 'rolled_back' ? 'rolled_back' :
    'ok'

  return Response.json({
    ts:     new Date().toISOString(),
    overall,

    deploy: deploy ?? {
      commit:      'unknown',
      commitShort: 'unknown',
      commitMsg:   'No deploy info available',
      deployer:    'unknown',
      deployedAt:  null,
      status:      'unknown',
    },

    db: {
      status:    dbStatus,
      latencyMs: dbLatency,
    },

    redis: {
      status:    redisStatus,
      latencyMs: redisLatency,
    },

    process: {
      nodeVersion: process.version,
      uptimeSec,
      memUsedMB,
      memTotalMB,
      memPercent,
    },
  })
}
