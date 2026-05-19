import { getServerSession } from 'next-auth'
import Link from 'next/link'

import { authOptions } from '@/lib/auth'
import { prisma }      from '@/lib/prisma'
import AdminControlRoom from '@/components/admin/AdminControlRoom'

export default async function AdminDashboardPage() {
  const session = await getServerSession(authOptions)
  if (!session) return null

  const firstName = (session.user as { firstName?: string })?.firstName
  const name = firstName || session.user?.name?.split(' ')[0] || 'Admin'

  const now            = new Date()
  const tenMinutesAgo  = new Date(now.getTime() -  10 * 60 * 1000)
  const oneHourAgo     = new Date(now.getTime() -  60 * 60 * 1000)
  const twentyFourHAgo = new Date(now.getTime() -  24 * 60 * 60 * 1000)

  const [
    totalUsers, newUsers24h, suspendedCount,
    pendingRequests,
    failedLoginsLastHour, successLoginsLastHour,
    failedLoginsTenMin,
    usersHighAttempts,
    activeAlerts, criticalAlerts,
    totalRestaurants,
    recentEvents,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { createdAt: { gte: twentyFourHAgo } } }),
    prisma.user.count({ where: { suspended: true } }),
    prisma.localeRequest.count({ where: { status: 'pending' } }),
    prisma.loginEvent.count({ where: { success: false, createdAt: { gte: oneHourAgo } } }),
    prisma.loginEvent.count({ where: { success: true,  createdAt: { gte: oneHourAgo } } }),
    prisma.loginEvent.count({ where: { success: false, createdAt: { gte: tenMinutesAgo } } }),
    prisma.user.count({ where: { loginAttempts: { gte: 5 } } }),
    prisma.systemAlert.count({ where: { resolved: false } }),
    prisma.systemAlert.count({ where: { resolved: false, severity: 'critical' } }),
    prisma.restaurant.count(),
    prisma.loginEvent.findMany({
      orderBy: { createdAt: 'desc' },
      take: 12,
      select: {
        id: true, createdAt: true, success: true,
        ipAddress: true, provider: true,
        user: { select: { email: true, firstName: true } },
      },
    }),
  ])

  let systemStatus: 'green' | 'yellow' | 'red' = 'green'
  if (criticalAlerts > 0 || failedLoginsTenMin > 10) systemStatus = 'red'
  else if (activeAlerts > 0 || failedLoginsTenMin > 3 || pendingRequests > 0 || usersHighAttempts > 0) systemStatus = 'yellow'

  const initialData = {
    totalUsers, newUsers24h, suspendedCount,
    pendingRequests,
    failedLoginsLastHour, successLoginsLastHour,
    failedLoginsTenMin,
    usersHighAttempts,
    activeAlerts, criticalAlerts,
    totalRestaurants,
    systemStatus,
    recentEvents: recentEvents.map((e) => ({
      id:        e.id,
      createdAt: e.createdAt.toISOString(),
      success:   e.success,
      ipAddress: e.ipAddress,
      provider:  e.provider,
      userEmail: e.user?.email ?? null,
      userName:  e.user?.firstName ?? null,
    })),
  }

  return (
    <main className="min-h-screen w-full overflow-x-hidden px-4 py-6 sm:px-6 sm:py-8">
      <div className="mx-auto w-full max-w-7xl">

        {/* Header */}
        <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-[#ff6b00]">Super Admin</p>
            <h1 className="mt-1 text-3xl font-black">
              Control Room
              <span className="ml-3 font-bold text-white/30 text-xl">— {name}</span>
            </h1>
          </div>
          <Link
            href="/admin/alert"
            className="flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2.5 text-xs font-black text-white/60 transition hover:border-[#ff6b00]/50 hover:text-white"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            Alert Center
            {activeAlerts > 0 && (
              <span className="rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-black text-white">
                {activeAlerts}
              </span>
            )}
          </Link>
        </div>

        {/* Live dashboard — client component handles polling */}
        <AdminControlRoom initialData={initialData} />
      </div>
    </main>
  )
}
