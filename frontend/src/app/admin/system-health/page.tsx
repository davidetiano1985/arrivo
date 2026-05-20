import { getServerSession } from 'next-auth'
import { redirect }         from 'next/navigation'
import Link                 from 'next/link'

import { authOptions } from '@/lib/auth'
import { prisma }      from '@/lib/prisma'
import SystemHealthLive from './SystemHealthLive'

export default async function SystemHealthPage() {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as { role?: string })?.role !== 'super_admin') redirect('/login')

  // Server-side DB probe for initial render
  const t0 = performance.now()
  let dbStatus:  'ok' | 'error' = 'ok'
  let dbLatency = 0
  try {
    await prisma.$queryRaw`SELECT 1`
    dbLatency = Math.round(performance.now() - t0)
  } catch {
    dbStatus  = 'error'
    dbLatency = -1
  }

  const mem        = process.memoryUsage()
  const memUsedMB  = Math.round(mem.heapUsed  / 1024 / 1024)
  const memTotalMB = Math.round(mem.heapTotal / 1024 / 1024)
  const uptimeSec  = Math.round(process.uptime())

  const twentyFourHAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
  const [failed24h, total24h, totalUsers, totalLoginEvents] = await Promise.all([
    prisma.loginEvent.count({ where: { success: false, createdAt: { gte: twentyFourHAgo } } }),
    prisma.loginEvent.count({ where: {                 createdAt: { gte: twentyFourHAgo } } }),
    prisma.user.count(),
    prisma.loginEvent.count(),
  ])

  const errorRate = total24h > 0 ? Math.round((failed24h / total24h) * 100) : 0

  function uptimeStr(s: number) {
    const d = Math.floor(s / 86400)
    const h = Math.floor((s % 86400) / 3600)
    const m = Math.floor((s % 3600) / 60)
    if (d > 0) return `${d}g ${h}h ${m}m`
    if (h > 0) return `${h}h ${m}m`
    return `${m}m ${s % 60}s`
  }

  const googleOAuth = (
    process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
  ) ? 'active' : 'missing' as const

  const initialData = {
    dbStatus:    dbStatus === 'error' ? 'error' : dbLatency > 200 ? 'slow' : 'ok',
    dbLatency,
    memUsedMB,
    memTotalMB,
    memPercent:  Math.round((memUsedMB / memTotalMB) * 100),
    uptimeSec,
    errorRate,
    failed24h,
    total24h,
    googleOAuth,
  } as const

  return (
    <main className="min-h-screen w-full overflow-x-hidden px-4 py-6 sm:px-6 sm:py-8">
      <div className="mx-auto w-full max-w-4xl space-y-6">

        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-[#ff6b00]">Super Admin</p>
            <h1 className="mt-1 text-3xl font-black">System Health</h1>
            <p className="mt-1 text-xs font-bold text-white/30">Aggiornamento live ogni 60s</p>
          </div>
          <Link href="/admin" className="flex h-9 items-center gap-2 rounded-xl border border-white/10 px-3 text-xs font-black text-white/60 transition hover:border-white/30 hover:text-white">
            ← Dashboard
          </Link>
        </div>

        {/* Static DB stats */}
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-white/[0.07] bg-white/[0.04] p-5">
            <p className="text-[10px] font-black uppercase tracking-widest text-white/30">Database — Record totali</p>
            <div className="mt-4 space-y-2">
              {[
                { label: 'Utenti (User)',       value: totalUsers.toLocaleString('it-IT')        },
                { label: 'Login eventi',        value: totalLoginEvents.toLocaleString('it-IT')   },
                { label: 'Login falliti 24h',   value: failed24h.toLocaleString('it-IT')          },
                { label: 'Login totali 24h',    value: total24h.toLocaleString('it-IT')           },
              ].map((r) => (
                <div key={r.label} className="flex items-center justify-between border-b border-white/[0.05] pb-2 last:border-0">
                  <span className="text-xs font-bold text-white/50">{r.label}</span>
                  <span className="font-mono text-sm font-black text-white">{r.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-white/[0.07] bg-white/[0.04] p-5">
            <p className="text-[10px] font-black uppercase tracking-widest text-white/30">Uptime del processo</p>
            <p className="mt-4 text-3xl font-black text-white">{uptimeStr(uptimeSec)}</p>
            <p className="mt-2 text-xs font-bold text-white/30">Node.js process uptime</p>
            <p className="mt-4 text-xs font-bold text-white/40">
              Tasso di errore 24h:{' '}
              <span className={errorRate > 30 ? 'text-red-400' : errorRate > 10 ? 'text-amber-400' : 'text-emerald-400'}>
                {errorRate}%
              </span>
              {' '}({failed24h} / {total24h} login)
            </p>
          </div>
        </div>

        {/* Live health component (polls /api/admin/health every 60s) */}
        <SystemHealthLive initialData={initialData} />
      </div>
    </main>
  )
}
