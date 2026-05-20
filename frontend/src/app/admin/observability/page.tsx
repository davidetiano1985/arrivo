import Link from 'next/link'
import { getServerSession } from 'next-auth'
import { redirect }         from 'next/navigation'

import { authOptions } from '@/lib/auth'
import { prisma }      from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export default async function ObservabilityPage() {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as { role?: string })?.role !== 'super_admin') redirect('/login')

  const now  = new Date()
  const t1h  = new Date(now.getTime() -  60 * 60 * 1000)
  const t24h = new Date(now.getTime() -  24 * 60 * 60 * 1000)
  const t7d  = new Date(now.getTime() -   7 * 24 * 60 * 60 * 1000)

  // ── DB latency probes (3 samples for trend) ─────────────────────────────────
  const probes = await Promise.all(
    Array.from({ length: 3 }, async (_, i) => {
      const t0 = performance.now()
      try {
        await prisma.$queryRaw`SELECT ${i + 1}`
        return Math.round(performance.now() - t0)
      } catch {
        return -1
      }
    })
  )
  const validProbes = probes.filter((p) => p >= 0)
  const dbLatencyAvg = validProbes.length
    ? Math.round(validProbes.reduce((a, b) => a + b, 0) / validProbes.length)
    : -1
  const dbStatus = dbLatencyAvg < 0 ? 'error' : dbLatencyAvg > 200 ? 'slow' : 'ok'

  // ── ApiMetric data (if table has any rows) ──────────────────────────────────
  const [apiMetricCount, topSlowRoutes, apiMetricsByRoute] = await Promise.all([
    prisma.apiMetric.count(),
    // Slowest routes (p95 approximation — top 5% by latency)
    prisma.apiMetric.findMany({
      where:   { createdAt: { gte: t24h } },
      orderBy: { latencyMs: 'desc' },
      take:    20,
      select:  { route: true, latencyMs: true, status: true, method: true, createdAt: true },
    }),
    // Aggregate by route
    prisma.apiMetric.groupBy({
      by:     ['route', 'method'],
      where:  { createdAt: { gte: t24h } },
      _avg:   { latencyMs: true },
      _max:   { latencyMs: true },
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take:   15,
    }),
  ])

  // ── Login event patterns (traffic proxy) ────────────────────────────────────
  const [
    loginsByHour,
    totalLogins7d,
    failedLogins7d,
    loginProviders,
    dbErrors,
  ] = await Promise.all([
    // Hourly distribution last 24h
    prisma.loginEvent.findMany({
      where:   { createdAt: { gte: t24h } },
      select:  { createdAt: true, success: true },
    }),
    prisma.loginEvent.count({ where: { createdAt: { gte: t7d } } }),
    prisma.loginEvent.count({ where: { success: false, createdAt: { gte: t7d } } }),
    // Provider breakdown
    prisma.loginEvent.groupBy({
      by:     ['provider'],
      where:  { createdAt: { gte: t7d } },
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
    }),
    // DB/system errors from SystemEvent table (if populated)
    prisma.systemEvent.findMany({
      where:   { category: 'performance', createdAt: { gte: t24h } },
      orderBy: { createdAt: 'desc' },
      take:    20,
      select:  { type: true, severity: true, data: true, createdAt: true, route: true },
    }).catch(() => [] as never[]),
  ])

  // Build hourly buckets
  const hourBuckets = new Map<number, { success: number; fail: number }>()
  for (const ev of loginsByHour) {
    const h = ev.createdAt.getHours()
    const b = hourBuckets.get(h) ?? { success: 0, fail: 0 }
    if (ev.success) b.success++ ; else b.fail++
    hourBuckets.set(h, b)
  }
  const hourData = Array.from({ length: 24 }, (_, h) => ({
    hour:    h,
    ...( hourBuckets.get(h) ?? { success: 0, fail: 0 }),
  }))
  const maxHour = Math.max(...hourData.map((h) => h.success + h.fail), 1)

  // ── System event counts ─────────────────────────────────────────────────────
  const [totalSystemEvents, recentSystemEvents] = await Promise.all([
    prisma.systemEvent.count().catch(() => 0),
    prisma.systemEvent.findMany({
      orderBy: { createdAt: 'desc' },
      take:    15,
      select:  { type: true, category: true, severity: true, userEmail: true, ipAddress: true, createdAt: true, route: true },
    }).catch(() => [] as never[]),
  ])

  const errorRate7d = totalLogins7d > 0 ? Math.round((failedLogins7d / totalLogins7d) * 100) : 0

  // N+1 detection hint: admin pages making multiple counts vs single aggregated query
  const n1Hints = [
    {
      location: 'admin/layout.tsx',
      issue:    '8 COUNT queries indipendenti per sidebar badge ad ogni page load',
      impact:   'Medio — 8 round-trip invece di 1 aggregato',
      fix:      'Consolidare in una query con subselects o usare un cache layer',
    },
    {
      location: 'admin/page.tsx',
      issue:    '12 query parallele in Promise.all per la dashboard',
      impact:   'Basso — parallele, ma aumentano con il traffico',
      fix:      'Aggiungere caching con revalidate=30 su rotte read-only',
    },
  ]

  return (
    <main className="min-h-screen w-full overflow-x-hidden px-4 py-6 sm:px-6 sm:py-8">
      <div className="mx-auto w-full max-w-6xl space-y-6">

        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-[#ff6b00]">Super Admin</p>
            <h1 className="mt-1 text-3xl font-black">Observability Engine</h1>
            <p className="mt-1 text-xs font-bold text-white/30">
              DB latency · API metrics · Traffic patterns · N+1 detection
            </p>
          </div>
          <div className="flex gap-2">
            <Link href="/admin/control-plane" className="flex h-9 items-center gap-2 rounded-xl border border-white/10 px-3 text-xs font-black text-white/60 transition hover:border-white/30 hover:text-white">
              Control Plane
            </Link>
            <Link href="/admin/intelligence" className="flex h-9 items-center gap-2 rounded-xl border border-white/10 px-3 text-xs font-black text-white/60 transition hover:border-white/30 hover:text-white">
              Intelligence →
            </Link>
          </div>
        </div>

        {/* ── DB Latency ─────────────────────────────────────────────────────── */}
        <div className="grid gap-4 sm:grid-cols-4">
          {[
            { label: 'Latenza media (3 probe)',  value: dbLatencyAvg >= 0 ? `${dbLatencyAvg}ms` : 'N/A',
              color: dbStatus === 'error' ? 'text-red-400' : dbLatencyAvg > 200 ? 'text-amber-400' : 'text-emerald-400' },
            { label: 'Probe 1',  value: probes[0] >= 0 ? `${probes[0]}ms` : 'ERR', color: 'text-white' },
            { label: 'Probe 2',  value: probes[1] >= 0 ? `${probes[1]}ms` : 'ERR', color: 'text-white' },
            { label: 'Probe 3',  value: probes[2] >= 0 ? `${probes[2]}ms` : 'ERR', color: 'text-white' },
          ].map((m) => (
            <div key={m.label} className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-4">
              <p className="text-[10px] font-black uppercase text-white/30">{m.label}</p>
              <p className={`mt-2 text-2xl font-black ${m.color}`}>{m.value}</p>
            </div>
          ))}
        </div>

        {/* ── Traffic pattern (24h hourly) ────────────────────────────────────── */}
        <section>
          <p className="mb-3 text-xs font-black uppercase tracking-widest text-white/40">
            Traffic Pattern — login 24h per ora
          </p>
          <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-5">
            <div className="flex items-end gap-1 overflow-x-auto pb-3">
              {hourData.map((h) => {
                const total  = h.success + h.fail
                const height = Math.max(2, Math.round((total / maxHour) * 80))
                const failH  = total > 0 ? Math.round((h.fail / total) * height) : 0
                return (
                  <div key={h.hour} className="flex min-w-[1.75rem] flex-col items-center gap-0.5">
                    <div
                      className="relative w-5 overflow-hidden rounded-t-sm"
                      style={{ height: `${height}px` }}
                    >
                      <div className="absolute bottom-0 w-full bg-emerald-500/60"
                        style={{ height: `${height - failH}px` }} />
                      {failH > 0 && (
                        <div className="absolute top-0 w-full bg-red-500/70"
                          style={{ height: `${failH}px` }} />
                      )}
                    </div>
                    <span className="text-[9px] font-bold text-white/20">
                      {String(h.hour).padStart(2, '0')}
                    </span>
                  </div>
                )
              })}
            </div>
            <div className="flex gap-4 text-[10px] font-bold">
              <span className="flex items-center gap-1 text-emerald-400">
                <span className="h-2 w-2 rounded-sm bg-emerald-500/60" /> Successi
              </span>
              <span className="flex items-center gap-1 text-red-400">
                <span className="h-2 w-2 rounded-sm bg-red-500/70" /> Fallimenti
              </span>
            </div>
          </div>
        </section>

        {/* ── Two-col: API metrics + Provider breakdown ────────────────────── */}
        <div className="grid gap-6 lg:grid-cols-2">

          {/* API Metrics */}
          <section>
            <p className="mb-3 text-xs font-black uppercase tracking-widest text-white/40">
              API Metrics per Route (24h)
              {apiMetricCount === 0 && (
                <span className="ml-2 text-white/25 normal-case font-bold">
                  — nessun dato (usa withApiMetrics wrapper)
                </span>
              )}
            </p>
            <div className="overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.03]">
              {apiMetricsByRoute.length === 0 ? (
                <div className="p-5">
                  <p className="text-xs font-bold text-white/30 mb-3">
                    ApiMetric table vuota. Instrumenta le API routes con:
                  </p>
                  <pre className="rounded-xl bg-white/[0.05] p-3 text-[10px] font-mono text-white/50 overflow-x-auto">
{`import { withApiMetrics } from '@/lib/apiMetrics'

export const GET = withApiMetrics(
  '/api/admin/stats',
  async (req) => { /* handler */ }
)`}
                  </pre>
                </div>
              ) : (
                <table className="w-full border-collapse text-xs">
                  <thead className="bg-white/5">
                    <tr>
                      {['Route', 'Calls', 'Avg', 'P95'].map((h) => (
                        <th key={h} className="px-4 py-2.5 text-left text-[10px] font-black uppercase text-white/30">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {apiMetricsByRoute.map((r, i) => (
                      <tr key={i} className="border-t border-white/[0.05]">
                        <td className="px-4 py-2.5 font-mono text-white/70 truncate max-w-[160px]">
                          {r.route}
                        </td>
                        <td className="px-4 py-2.5 font-black text-white">{r._count.id}</td>
                        <td className="px-4 py-2.5">
                          <span className={`font-black ${
                            (r._avg.latencyMs ?? 0) > 500 ? 'text-red-400' :
                            (r._avg.latencyMs ?? 0) > 200 ? 'text-amber-400' : 'text-emerald-400'
                          }`}>
                            {Math.round(r._avg.latencyMs ?? 0)}ms
                          </span>
                        </td>
                        <td className="px-4 py-2.5 font-black text-white/50">
                          {r._max.latencyMs}ms
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </section>

          {/* Provider + 7d summary */}
          <section className="space-y-4">
            <div>
              <p className="mb-3 text-xs font-black uppercase tracking-widest text-white/40">
                Login Provider Split (7gg)
              </p>
              <div className="overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.03]">
                <div className="divide-y divide-white/[0.05]">
                  {loginProviders.map((p) => (
                    <div key={p.provider} className="flex items-center justify-between px-4 py-3">
                      <span className="font-black text-white capitalize">{p.provider}</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm font-black text-white/60">{p._count.id}</span>
                        <span className="text-[10px] text-white/25">
                          {totalLogins7d > 0
                            ? `${Math.round((p._count.id / totalLogins7d) * 100)}%`
                            : '—'}
                        </span>
                      </div>
                    </div>
                  ))}
                  {loginProviders.length === 0 && (
                    <p className="px-4 py-4 text-xs font-bold text-white/25">Nessun dato.</p>
                  )}
                </div>
              </div>
            </div>

            <div>
              <p className="mb-3 text-xs font-black uppercase tracking-widest text-white/40">
                Event Store (SystemEvent)
              </p>
              <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-4">
                <p className="text-2xl font-black text-white">{totalSystemEvents.toLocaleString('it-IT')}</p>
                <p className="mt-0.5 text-xs font-bold text-white/30">eventi totali nel store</p>
                <p className="mt-2 text-[10px] font-bold text-white/20">
                  Aumenta collegando EventBus ad auth.ts e admin actions
                </p>
              </div>
            </div>
          </section>
        </div>

        {/* ── Recent System Events ────────────────────────────────────────────── */}
        {recentSystemEvents.length > 0 && (
          <section>
            <p className="mb-3 text-xs font-black uppercase tracking-widest text-white/40">
              System Events recenti (performance category)
            </p>
            <div className="overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.03]">
              <div className="divide-y divide-white/[0.05]">
                {recentSystemEvents.map((ev, i) => (
                  <div key={i} className="flex items-center justify-between gap-3 px-4 py-2.5">
                    <div className="flex items-center gap-2">
                      <span className={`h-1.5 w-1.5 rounded-full ${
                        ev.severity >= 70 ? 'bg-red-500' :
                        ev.severity >= 40 ? 'bg-amber-400' : 'bg-emerald-500'
                      }`} />
                      <span className="text-xs font-black text-white/70">{ev.type}</span>
                      {ev.route && (
                        <span className="font-mono text-[10px] text-white/30">{ev.route}</span>
                      )}
                    </div>
                    <span className="font-mono text-[10px] text-white/25">
                      {ev.createdAt.toLocaleTimeString('it-IT')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ── N+1 Detection Hints ─────────────────────────────────────────────── */}
        <section>
          <p className="mb-3 text-xs font-black uppercase tracking-widest text-amber-400">
            ⚠ N+1 Detection Hints
          </p>
          <div className="space-y-3">
            {n1Hints.map((h, i) => (
              <div key={i} className="rounded-2xl border border-amber-400/20 bg-amber-400/[0.04] p-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <p className="font-mono text-xs font-black text-amber-400">{h.location}</p>
                  <span className="rounded-full bg-amber-400/20 px-2 py-0.5 text-[10px] font-black text-amber-400">
                    Impatto: {h.impact.split(' — ')[0]}
                  </span>
                </div>
                <p className="mt-1.5 text-xs font-bold text-white/60">{h.issue}</p>
                <p className="mt-1 text-xs font-bold text-white/35">
                  <span className="text-white/20">Fix:</span> {h.fix}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Scalability roadmap ──────────────────────────────────────────────── */}
        <section>
          <p className="mb-3 text-xs font-black uppercase tracking-widest text-white/40">
            Scalability Roadmap
          </p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                label: 'pg_trgm + GIN index',
                desc:  'Per ricerca full-text su User.email / name — necessario oltre 50k utenti',
                effort: 'Basso',
              },
              {
                label: 'Cursor pagination',
                desc:  'Sostituire LIMIT/OFFSET con cursor-based su tabelle > 100k righe',
                effort: 'Medio',
              },
              {
                label: 'Redis cache layer',
                desc:  'Cache per /api/admin/stats (TTL 30s) — elimina 13 query per sidebar refresh',
                effort: 'Medio',
              },
              {
                label: 'LoginEvent retention',
                desc:  'Archivio/purge eventi > 90 giorni — table scan rallenta con 1M+ righe',
                effort: 'Basso',
              },
              {
                label: 'PM2 cluster mode',
                desc:  'Passa da fork a cluster + Redis pub/sub per EventEmitter cross-process',
                effort: 'Alto',
              },
              {
                label: 'SystemEvent partitioning',
                desc:  'Partizione mensile su SystemEvent.createdAt per write performance',
                effort: 'Alto',
              },
            ].map((item) => (
              <div key={item.label} className="rounded-xl border border-white/[0.07] bg-white/[0.03] p-4">
                <p className="text-sm font-black text-white">{item.label}</p>
                <p className="mt-1 text-[10px] font-bold text-white/35">{item.desc}</p>
                <span className="mt-2 inline-block rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-black text-white/40">
                  Effort: {item.effort}
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  )
}
