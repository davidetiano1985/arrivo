import { getToken } from 'next-auth/jwt'
import { type NextRequest, NextResponse } from 'next/server'

import { prisma }           from '@/lib/prisma'
import { withApiMetrics }   from '@/lib/apiMetrics'
import { cachedOr }         from '@/lib/redisCache'

const STATS_CACHE_KEY = 'admin:stats'
const STATS_CACHE_TTL = 30  // 30-second cache — sidebar polls every 30s

async function handleGET(req: NextRequest) {
  const token = await getToken({ req })
  if (!token || (token.role as string) !== 'super_admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Bypass cache if ?fresh=1 (for manual refresh triggers)
  const fresh = new URL(req.url).searchParams.get('fresh') === '1'
  if (!fresh) {
    const cached = await cachedOr(STATS_CACHE_KEY, STATS_CACHE_TTL, computeStats)
    return NextResponse.json(cached)
  }

  const stats = await computeStats()
  return NextResponse.json(stats)
}

async function computeStats() {
  const now              = new Date()
  const tenMinutesAgo    = new Date(now.getTime() -  10 * 60 * 1000)
  const oneHourAgo       = new Date(now.getTime() -  60 * 60 * 1000)
  const twentyFourHAgo   = new Date(now.getTime() -  24 * 60 * 60 * 1000)

  const [
    totalUsers,
    newUsers24h,
    suspendedCount,
    pendingRequests,
    failedLoginsLastHour,
    successLoginsLastHour,
    failedLoginsTenMin,
    successLoginsTenMin,
    usersHighAttempts,
    activeAlerts,
    criticalAlerts,
    totalRestaurants,
    newRestaurants24h,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { createdAt: { gte: twentyFourHAgo } } }),
    prisma.user.count({ where: { suspended: true } }),
    prisma.localeRequest.count({ where: { status: 'pending' } }),
    prisma.loginEvent.count({ where: { success: false, createdAt: { gte: oneHourAgo } } }),
    prisma.loginEvent.count({ where: { success: true,  createdAt: { gte: oneHourAgo } } }),
    prisma.loginEvent.count({ where: { success: false, createdAt: { gte: tenMinutesAgo } } }),
    prisma.loginEvent.count({ where: { success: true,  createdAt: { gte: tenMinutesAgo } } }),
    prisma.user.count({ where: { loginAttempts: { gte: 5 } } }),
    prisma.systemAlert.count({ where: { resolved: false } }),
    prisma.systemAlert.count({ where: { resolved: false, severity: 'critical' } }),
    prisma.restaurant.count(),
    prisma.restaurant.count({ where: { createdAt: { gte: twentyFourHAgo } } }),
  ])

  // Worst-case status propagation
  let systemStatus: 'green' | 'yellow' | 'red' = 'green'
  if (criticalAlerts > 0 || failedLoginsTenMin > 10) {
    systemStatus = 'red'
  } else if (
    activeAlerts > 0 ||
    failedLoginsTenMin > 3 ||
    pendingRequests > 0 ||
    usersHighAttempts > 0
  ) {
    systemStatus = 'yellow'
  }

  return {
    totalUsers,
    newUsers24h,
    suspendedCount,
    pendingRequests,
    failedLoginsLastHour,
    successLoginsLastHour,
    failedLoginsTenMin,
    successLoginsTenMin,
    usersHighAttempts,
    activeAlerts,
    criticalAlerts,
    totalRestaurants,
    newRestaurants24h,
    systemStatus,
    timestamp: now.toISOString(),
  }
}

export const GET = withApiMetrics('/api/admin/stats', handleGET)
