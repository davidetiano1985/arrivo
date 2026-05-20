/**
 * Control Plane snapshot — fetches all metrics needed for the 9-card grid.
 * Shared between:
 *   - /admin/control-plane (initial SSR)
 *   - /api/admin/stream    (SSE heartbeat every 15s)
 */

import { prisma } from './prisma'

export type ControlPlaneSnapshot = {
  ts: string

  // Card 1 — System Health Score (0–100)
  healthScore:   number
  healthStatus:  'green' | 'yellow' | 'red'

  // Card 2 — Traffic Live
  activeUsers15m:  number
  loginsLastHour:  number
  loginsPerMin:    number

  // Card 3 — Security Status
  attackScore:     number   // 0–100
  failedLogins10m: number
  bruteForceUsers: number
  suspendedUsers:  number

  // Card 4 — DB Health
  dbLatency: number
  dbStatus:  'ok' | 'slow' | 'error'

  // Card 5 — Error Stream
  errorRate24h:    number
  failedLogins24h: number
  totalLogins24h:  number

  // Card 6 — Admin Actions Live
  recentAdminActions: Array<{
    action:      string
    adminEmail:  string
    targetEmail: string
    createdAt:   string
  }>

  // Card 7 — Alert Queue
  alertsTotal:        number
  alertsCritical:     number
  alertsHigh:         number
  alertsMedium:       number
  oldestAlertMinutes: number | null

  // Card 8 — System Load
  memUsedMB:  number
  memPercent: number
  uptimeSec:  number

  // Card 9 — Degradation Risk Score
  degradationScore: number   // 0–100
  riskFactors:      string[]
}

export async function fetchControlPlaneSnapshot(): Promise<ControlPlaneSnapshot> {
  const now  = new Date()
  const t15m = new Date(now.getTime() -  15 * 60 * 1000)
  const t10m = new Date(now.getTime() -  10 * 60 * 1000)
  const t1h  = new Date(now.getTime() -  60 * 60 * 1000)
  const t24h = new Date(now.getTime() -  24 * 60 * 60 * 1000)

  // ── DB latency probe ────────────────────────────────────────────────────────
  const t0 = performance.now()
  let dbStatus:  'ok' | 'slow' | 'error' = 'ok'
  let dbLatency = 0
  try {
    await prisma.$queryRaw`SELECT 1`
    dbLatency = Math.round(performance.now() - t0)
    if (dbLatency > 200) dbStatus = 'slow'
  } catch {
    dbStatus  = 'error'
    dbLatency = -1
  }

  // ── Parallel DB queries ─────────────────────────────────────────────────────
  const [
    activeUsersResult,
    loginsLastHour,
    failedLogins10m,
    totalLogins24h,
    failedLogins24h,
    bruteForceUsers,
    suspendedUsers,
    alertsTotal,
    alertsCritical,
    alertsHigh,
    alertsMedium,
    oldestAlert,
    recentAdminActions,
  ] = await Promise.all([
    // Distinct users with at least one successful login in last 15 min
    prisma.loginEvent.groupBy({
      by: ['userId'],
      where: { success: true, createdAt: { gte: t15m } },
      _count: true,
    }),
    prisma.loginEvent.count({ where: { createdAt: { gte: t1h  } } }),
    prisma.loginEvent.count({ where: { success: false, createdAt: { gte: t10m } } }),
    prisma.loginEvent.count({ where: { createdAt: { gte: t24h } } }),
    prisma.loginEvent.count({ where: { success: false, createdAt: { gte: t24h } } }),
    prisma.user.count({ where: { loginAttempts: { gte: 10 }, suspended: false } }),
    prisma.user.count({ where: { suspended: true } }),
    prisma.systemAlert.count({ where: { resolved: false } }),
    prisma.systemAlert.count({ where: { resolved: false, severity: 'critical' } }),
    prisma.systemAlert.count({ where: { resolved: false, severity: 'high'     } }),
    prisma.systemAlert.count({ where: { resolved: false, severity: 'medium'   } }),
    prisma.systemAlert.findFirst({
      where:   { resolved: false },
      orderBy: { createdAt: 'asc' },
      select:  { createdAt: true },
    }),
    prisma.adminLog.findMany({
      orderBy: { createdAt: 'desc' },
      take:    6,
      select:  { action: true, adminEmail: true, targetEmail: true, createdAt: true },
    }),
  ])

  const activeUsers15m = activeUsersResult.length

  // ── Memory + uptime ─────────────────────────────────────────────────────────
  const mem       = process.memoryUsage()
  const memUsedMB = Math.round(mem.heapUsed  / 1024 / 1024)
  const memTotMB  = Math.round(mem.heapTotal / 1024 / 1024)
  const memPercent = Math.round((memUsedMB / memTotMB) * 100)
  const uptimeSec  = Math.round(process.uptime())

  // ── Derived scores ──────────────────────────────────────────────────────────

  const errorRate24h = totalLogins24h > 0
    ? Math.round((failedLogins24h / totalLogins24h) * 100) : 0

  const loginsPerMin = Math.round((loginsLastHour / 60) * 10) / 10

  // Attack score (0–100) — weighted sum of threat signals
  const attackScore = Math.min(100, Math.round(
    (failedLogins10m  * 4)  +
    (bruteForceUsers  * 15) +
    (alertsCritical   * 25)
  ))

  // Health score (100 = perfect, 0 = critical)
  // Components: error rate (25%), DB latency (20%), attack pressure (35%), memory (20%)
  const dbLatencyFactor = dbStatus === 'error' ? 20
    : Math.min(20, dbLatency > 0 ? Math.round(dbLatency / 10) : 0)

  const healthScore = Math.max(0, Math.round(100 - (
    (Math.min(errorRate24h, 100) * 0.25) +
    dbLatencyFactor               +
    (attackScore            * 0.35) +
    (Math.min(memPercent, 100) * 0.20)
  )))

  const healthStatus: 'green' | 'yellow' | 'red' =
    healthScore >= 70 ? 'green' :
    healthScore >= 40 ? 'yellow' : 'red'

  // Degradation risk (0–100)
  const riskFactors: string[] = []
  if (failedLogins10m > 5)  riskFactors.push(`${failedLogins10m} login falliti/10min`)
  if (bruteForceUsers > 0)  riskFactors.push(`${bruteForceUsers} utenti brute-force attivi`)
  if (dbLatency      > 150) riskFactors.push(`DB latenza elevata: ${dbLatency}ms`)
  if (memPercent     > 75)  riskFactors.push(`Heap memory: ${memPercent}%`)
  if (errorRate24h   > 30)  riskFactors.push(`Error rate: ${errorRate24h}%`)
  if (alertsCritical > 0)   riskFactors.push(`${alertsCritical} alert critici aperti`)
  if (dbStatus === 'error') riskFactors.push('Database non raggiungibile')

  const degradationScore = Math.min(100, Math.round(
    (attackScore          * 0.40) +
    (Math.max(0, 100 - healthScore) * 0.40) +
    (memPercent > 75 ? (memPercent - 75) * 1.5 : 0)
  ))

  const oldestAlertMinutes = oldestAlert
    ? Math.round((now.getTime() - oldestAlert.createdAt.getTime()) / 60_000)
    : null

  return {
    ts: now.toISOString(),
    healthScore,
    healthStatus,
    activeUsers15m,
    loginsLastHour,
    loginsPerMin,
    attackScore,
    failedLogins10m,
    bruteForceUsers,
    suspendedUsers,
    dbLatency,
    dbStatus,
    errorRate24h,
    failedLogins24h,
    totalLogins24h,
    recentAdminActions: recentAdminActions.map((a) => ({
      action:      a.action,
      adminEmail:  a.adminEmail,
      targetEmail: a.targetEmail,
      createdAt:   a.createdAt.toISOString(),
    })),
    alertsTotal,
    alertsCritical,
    alertsHigh,
    alertsMedium,
    oldestAlertMinutes,
    memUsedMB,
    memPercent,
    uptimeSec,
    degradationScore,
    riskFactors,
  }
}
