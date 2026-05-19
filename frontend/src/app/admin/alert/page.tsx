import { getServerSession } from 'next-auth'
import { redirect }         from 'next/navigation'
import Link                 from 'next/link'

import { authOptions } from '@/lib/auth'
import { prisma }      from '@/lib/prisma'
import AlertCenterClient from './AlertCenterClient'
import { SEV_MAP, TYPE_MAP } from './constants'

function fmt(d: Date) {
  return d.toLocaleString('it-IT', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

// ── Computed alerts from live data ────────────────────────────────────────────

async function getComputedAlerts() {
  const now           = new Date()
  const tenMinutesAgo = new Date(now.getTime() -  10 * 60 * 1000)
  const oneHourAgo    = new Date(now.getTime() -  60 * 60 * 1000)
  const twentyFourHAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)

  const [bruteUsers, failedTenMin, failedOneHour, suspAttempts] = await Promise.all([
    prisma.user.findMany({
      where: { loginAttempts: { gte: 5 } },
      select: { email: true, loginAttempts: true },
      orderBy: { loginAttempts: 'desc' },
      take: 20,
    }),
    prisma.loginEvent.count({ where: { success: false, createdAt: { gte: tenMinutesAgo } } }),
    prisma.loginEvent.count({ where: { success: false, createdAt: { gte: oneHourAgo } } }),
    prisma.user.count({
      where: {
        suspended: true,
        loginEvents: {
          some: { createdAt: { gte: twentyFourHAgo } },
        },
      },
    }),
  ])

  type Sev = 'critical' | 'high' | 'medium' | 'low'
  const alerts: {
    id: string; type: string; severity: Sev;
    title: string; description: string; count: number
  }[] = []

  for (const u of bruteUsers) {
    const sev: Sev = u.loginAttempts >= 20 ? 'critical' : u.loginAttempts >= 10 ? 'high' : 'medium'
    alerts.push({
      id:          `bf-${u.email}`,
      type:        'security',
      severity:    sev,
      title:       'Brute force rilevato',
      description: `${u.email} — ${u.loginAttempts} tentativi falliti`,
      count:       u.loginAttempts,
    })
  }

  if (failedTenMin > 10) {
    alerts.push({
      id: 'rate-10min-critical', type: 'security', severity: 'critical',
      title: 'Attacco in corso',
      description: `${failedTenMin} login falliti negli ultimi 10 minuti`,
      count: failedTenMin,
    })
  } else if (failedTenMin > 3) {
    alerts.push({
      id: 'rate-10min-high', type: 'security', severity: 'high',
      title: 'Spike login falliti',
      description: `${failedTenMin} login falliti negli ultimi 10 minuti`,
      count: failedTenMin,
    })
  }

  if (failedOneHour > 50) {
    alerts.push({
      id: 'rate-1h', type: 'security', severity: 'high',
      title: 'Tasso fallimenti elevato (1h)',
      description: `${failedOneHour} login falliti nell'ultima ora`,
      count: failedOneHour,
    })
  }

  if (suspAttempts > 0) {
    alerts.push({
      id: 'suspended-attempts', type: 'security', severity: 'medium',
      title: 'Utenti sospesi tentano il login',
      description: `${suspAttempts} utenti sospesi hanno tentato l'accesso nelle ultime 24h`,
      count: suspAttempts,
    })
  }

  return alerts
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function AlertCenterPage() {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as { role?: string })?.role !== 'super_admin') redirect('/login')

  const [storedAlerts, computedAlerts] = await Promise.all([
    prisma.systemAlert.findMany({
      orderBy: [{ resolved: 'asc' }, { createdAt: 'desc' }],
    }),
    getComputedAlerts(),
  ])

  const activeStored   = storedAlerts.filter((a) => !a.resolved)
  const resolvedStored = storedAlerts.filter((a) =>  a.resolved)

  const totalActive = activeStored.length + computedAlerts.length

  return (
    <main className="min-h-screen w-full overflow-x-hidden px-4 py-6 sm:px-6 sm:py-8">
      <div className="mx-auto w-full max-w-5xl space-y-6">

        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-[#ff6b00]">Super Admin</p>
            <h1 className="mt-1 text-3xl font-black">Alert Center</h1>
            <p className="mt-1 text-sm font-bold text-white/40">
              {totalActive} alert attivi · {resolvedStored.length} risolti
            </p>
          </div>
          <Link
            href="/admin"
            className="flex h-9 items-center gap-2 rounded-xl border border-white/10 px-3 text-xs font-black text-white/60 transition hover:border-white/30 hover:text-white"
          >
            ← Dashboard
          </Link>
        </div>

        {/* Computed alerts (live, non-dismissible) */}
        {computedAlerts.length > 0 && (
          <section>
            <div className="mb-3 flex items-center gap-2">
              <span className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
              <p className="text-xs font-black uppercase tracking-widest text-white/40">
                Alert automatici — rilevati ora ({computedAlerts.length})
              </p>
            </div>
            <div className="space-y-2">
              {computedAlerts.map((a) => {
                const sev = SEV_MAP[a.severity as keyof typeof SEV_MAP] ?? SEV_MAP.low
                return (
                  <div key={a.id} className={`rounded-2xl border ${sev.border} bg-white/[0.03] p-4`}>
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="flex items-start gap-3">
                        <span className={`mt-0.5 rounded-full px-2 py-0.5 text-[10px] font-black ${sev.bg}`}>
                          {sev.label}
                        </span>
                        <div>
                          <p className="text-sm font-black text-white">{a.title}</p>
                          <p className="mt-0.5 text-xs font-bold text-white/45">{a.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-bold text-white/40">
                          {TYPE_MAP[a.type] ?? a.type}
                        </span>
                        <Link
                          href="/admin/sicurezza"
                          className="rounded-xl border border-white/10 px-3 py-1.5 text-[10px] font-black text-white/60 transition hover:border-[#ff6b00]/50 hover:text-white"
                        >
                          Indaga →
                        </Link>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        )}

        {/* Stored active alerts — dismissible */}
        <AlertCenterClient
          activeAlerts={activeStored.map((a) => ({
            ...a,
            createdAt: a.createdAt.toISOString(),
            updatedAt: a.updatedAt.toISOString(),
            resolvedAt: a.resolvedAt?.toISOString() ?? null,
          }))}
          resolvedAlerts={resolvedStored.map((a) => ({
            ...a,
            createdAt: a.createdAt.toISOString(),
            updatedAt: a.updatedAt.toISOString(),
            resolvedAt: a.resolvedAt?.toISOString() ?? null,
          }))}
        />
      </div>
    </main>
  )
}
