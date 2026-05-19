import type { ReactNode } from 'react'
import { getServerSession } from 'next-auth'

import AccessoNegato from '@/components/AccessoNegato'
import AdminSidebar  from '@/components/admin/AdminSidebar'
import { authOptions } from '@/lib/auth'
import { prisma }      from '@/lib/prisma'

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await getServerSession(authOptions)

  if (!session) return <AccessoNegato tipo="non_autenticato" />

  const role = (session.user as { role: string }).role
  if (role !== 'super_admin') return <AccessoNegato tipo="non_autorizzato" ruolo={role} />

  // ── Fetch initial stats for sidebar badges ─────────────────────────────────
  const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000)

  const [
    totalUsers,
    suspendedCount,
    pendingRequests,
    activeAlerts,
    criticalAlerts,
    usersHighAttempts,
    failedLoginsTenMin,
    totalRestaurants,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { suspended: true } }),
    prisma.localeRequest.count({ where: { status: 'pending' } }),
    prisma.systemAlert.count({ where: { resolved: false } }),
    prisma.systemAlert.count({ where: { resolved: false, severity: 'critical' } }),
    prisma.user.count({ where: { loginAttempts: { gte: 5 } } }),
    prisma.loginEvent.count({ where: { success: false, createdAt: { gte: tenMinutesAgo } } }),
    prisma.restaurant.count(),
  ])

  let systemStatus: 'green' | 'yellow' | 'red' = 'green'
  if (criticalAlerts > 0 || failedLoginsTenMin > 10) {
    systemStatus = 'red'
  } else if (
    activeAlerts > 0 || failedLoginsTenMin > 3 ||
    pendingRequests > 0 || usersHighAttempts > 0
  ) {
    systemStatus = 'yellow'
  }

  const adminName  = (session.user as { firstName?: string })?.firstName
    || session.user?.name?.split(' ')[0]
    || 'Admin'
  const adminEmail = session.user?.email ?? ''

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Client component — manages sidebar + command palette + live polling */}
      <AdminSidebar
        adminName={adminName}
        adminEmail={adminEmail}
        initialStats={{
          totalUsers, suspendedCount, pendingRequests,
          activeAlerts, criticalAlerts, usersHighAttempts,
          failedLoginsTenMin, totalRestaurants, systemStatus,
        }}
      />
      <div className="md:pl-72">
        {children}
      </div>
    </div>
  )
}
