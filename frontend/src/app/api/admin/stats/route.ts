import { getToken } from 'next-auth/jwt'
import { type NextRequest, NextResponse } from 'next/server'

import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const token = await getToken({ req })
  if (!token || (token.role as string) !== 'super_admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

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

  return NextResponse.json({
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
  })
}
