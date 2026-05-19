import { getToken } from 'next-auth/jwt'
import { type NextRequest, NextResponse } from 'next/server'

import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const token = await getToken({ req })
  if (!token || (token.role as string) !== 'super_admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // ── DB latency probe ─────────────────────────────────────────────────────────
  const t0 = performance.now()
  let dbStatus: 'ok' | 'error' = 'ok'
  let dbLatency = 0

  try {
    await prisma.$queryRaw`SELECT 1`
    dbLatency = Math.round(performance.now() - t0)
  } catch {
    dbStatus  = 'error'
    dbLatency = -1
  }

  // ── Process memory ───────────────────────────────────────────────────────────
  const mem        = process.memoryUsage()
  const memUsedMB  = Math.round(mem.heapUsed  / 1024 / 1024)
  const memTotalMB = Math.round(mem.heapTotal / 1024 / 1024)
  const memPercent = Math.round((memUsedMB / memTotalMB) * 100)
  const uptime     = Math.round(process.uptime())          // seconds

  // ── Login error rate (last 24 h) ─────────────────────────────────────────────
  const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000)
  const [failed24h, total24h] = await Promise.all([
    prisma.loginEvent.count({ where: { success: false, createdAt: { gte: since24h } } }),
    prisma.loginEvent.count({ where: {                 createdAt: { gte: since24h } } }),
  ])
  const errorRate = total24h > 0 ? Math.round((failed24h / total24h) * 100) : 0

  // ── DB health classification ─────────────────────────────────────────────────
  let dbHealthStatus: 'ok' | 'slow' | 'error' = 'ok'
  if      (dbStatus === 'error') dbHealthStatus = 'error'
  else if (dbLatency > 200)      dbHealthStatus = 'slow'

  // ── Overall health status ────────────────────────────────────────────────────
  let overallStatus: 'green' | 'yellow' | 'red' = 'green'
  if (dbStatus === 'error' || memPercent > 90 || errorRate > 60) {
    overallStatus = 'red'
  } else if (dbLatency > 100 || memPercent > 70 || errorRate > 30) {
    overallStatus = 'yellow'
  }

  return NextResponse.json({
    db:     { status: dbHealthStatus, latency: dbLatency },
    memory: { used: memUsedMB, total: memTotalMB, percent: memPercent },
    uptime,
    errorRate,
    failed24h,
    total24h,
    overallStatus,
    timestamp: new Date().toISOString(),
  })
}
