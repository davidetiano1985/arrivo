import Link from 'next/link'
import { getServerSession } from 'next-auth'
import { redirect }         from 'next/navigation'

import { authOptions } from '@/lib/auth'
import { prisma }      from '@/lib/prisma'

export const dynamic = 'force-dynamic'

function fmt(d: Date) {
  return d.toLocaleString('it-IT', {
    day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit',
  })
}

function riskBadge(score: number) {
  if (score >= 70) return 'bg-red-500/20 text-red-400'
  if (score >= 40) return 'bg-amber-400/20 text-amber-400'
  return 'bg-emerald-500/20 text-emerald-400'
}

function riskLabel(score: number) {
  if (score >= 70) return 'ALTO'
  if (score >= 40) return 'MEDIO'
  return 'BASSO'
}

export default async function IntelligencePage() {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as { role?: string })?.role !== 'super_admin') redirect('/login')

  const now   = new Date()
  const t1h   = new Date(now.getTime() -   60 * 60 * 1000)
  const t6h   = new Date(now.getTime() -  360 * 60 * 1000)
  const t24h  = new Date(now.getTime() -  24  * 60 * 60 * 1000)
  const t7d   = new Date(now.getTime() -   7  * 24 * 60 * 60 * 1000)

  // ── 1. User anomaly scores ──────────────────────────────────────────────────
  // Users sorted by risk: loginAttempts + suspended + recent failures
  const [atRiskUsers, recentFailsByUser] = await Promise.all([
    prisma.user.findMany({
      where: {
        OR: [
          { loginAttempts: { gte: 3 } },
          { suspended: true },
        ],
      },
      select: {
        id: true, email: true, firstName: true, lastName: true,
        loginAttempts: true, suspended: true, createdAt: true, role: true,
      },
      orderBy: { loginAttempts: 'desc' },
      take: 25,
    }),
    // Count recent failures per user (last 24h)
    prisma.loginEvent.groupBy({
      by: ['userId'],
      where: { success: false, createdAt: { gte: t24h } },
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 25,
    }),
  ])

  // Build userId → recentFails map
  const failMap = new Map(recentFailsByUser.map((r) => [r.userId, r._count.id]))

  // Compute anomaly score per user
  const scoredUsers = atRiskUsers.map((u) => {
    const recentFails = failMap.get(u.id) ?? 0
    let score = 0
    score += Math.min(50, u.loginAttempts * 5)   // up to 50 pts from attempt count
    score += recentFails >= 10 ? 30 : recentFails >= 5 ? 15 : recentFails * 2  // recent activity
    if (u.suspended) score += 20                 // already suspended
    // New account + attempts = more suspicious
    const ageHours = (now.getTime() - u.createdAt.getTime()) / 3_600_000
    if (ageHours < 24 && u.loginAttempts > 0) score += 20
    return { ...u, anomalyScore: Math.min(100, Math.round(score)), recentFails }
  }).sort((a, b) => b.anomalyScore - a.anomalyScore)

  // ── 2. IP concentration analysis ───────────────────────────────────────────
  // IPs with multiple failed login attempts → probable brute force source
  const failsByIp = await prisma.loginEvent.groupBy({
    by: ['ipAddress'],
    where: { success: false, createdAt: { gte: t24h }, ipAddress: { not: null } },
    _count: { id: true },
    having: { id: { _count: { gt: 2 } } },
    orderBy: { _count: { id: 'desc' } },
    take: 15,
  })

  // For top 5 IPs, count distinct users targeted
  const topIpDetails = await Promise.all(
    failsByIp.slice(0, 5).map(async (g) => {
      const users = await prisma.loginEvent.findMany({
        where: { ipAddress: g.ipAddress, createdAt: { gte: t24h } },
        distinct: ['userId'],
        select: { userId: true, user: { select: { email: true } } },
      })
      return {
        ip:         g.ipAddress as string,
        totalFails: g._count.id,
        targets:    users.length,
        emails:     users.slice(0, 3).map((u) => u.user?.email ?? '?'),
      }
    })
  )

  // ── 3. Fail rate spike detection (15-minute buckets last 6h) ───────────────
  // Detect attack onset by comparing buckets
  const failEvents = await prisma.loginEvent.findMany({
    where: { success: false, createdAt: { gte: t6h } },
    select: { createdAt: true },
    orderBy: { createdAt: 'asc' },
  })

  const BUCKET_MIN = 15
  const buckets = new Map<string, number>()
  for (const ev of failEvents) {
    const slot = Math.floor(ev.createdAt.getTime() / (BUCKET_MIN * 60_000))
    const key  = String(slot)
    buckets.set(key, (buckets.get(key) ?? 0) + 1)
  }
  const bucketData = Array.from(buckets.entries())
    .sort((a, b) => Number(a[0]) - Number(b[0]))
    .map(([slot, count]) => ({
      time:  new Date(Number(slot) * BUCKET_MIN * 60_000).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }),
      count,
      spike: count >= 5,
    }))

  const maxBucket = Math.max(...bucketData.map((b) => b.count), 1)

  // ── 4. Admin action patterns (last 24h) ────────────────────────────────────
  const adminActionSummary = await prisma.adminLog.groupBy({
    by: ['action'],
    where: { createdAt: { gte: t24h } },
    _count: { id: true },
    orderBy: { _count: { id: 'desc' } },
    take: 10,
  })

  // ── 5. Root cause hints ────────────────────────────────────────────────────
  const [failCount10m, failCount1h, suspendedToday, newUsersFailed] = await Promise.all([
    prisma.loginEvent.count({ where: { success: false, createdAt: { gte: new Date(now.getTime() - 10 * 60_000) } } }),
    prisma.loginEvent.count({ where: { success: false, createdAt: { gte: t1h } } }),
    prisma.user.count({ where: { suspended: true, updatedAt: { gte: t24h } } }),
    prisma.user.count({ where: { loginAttempts: { gte: 1 }, createdAt: { gte: t24h } } }),
  ])

  type RootCause = {
    probability: 'alta' | 'media' | 'bassa'
    hypothesis: string
    evidence: string
    action: string
    href?: string
  }

  const rootCauses: RootCause[] = []

  if (failCount10m > 10) {
    rootCauses.push({
      probability: 'alta',
      hypothesis:  'Attacco brute-force in corso',
      evidence:    `${failCount10m} login falliti negli ultimi 10 minuti`,
      action:      'Verifica IP source e sospendi account bersaglio',
      href:        '/admin/sicurezza',
    })
  } else if (failCount1h > 20) {
    rootCauses.push({
      probability: 'media',
      hypothesis:  'Brute-force distribuito su più IP',
      evidence:    `${failCount1h} fallimenti nell'ultima ora`,
      action:      'Analizza concentrazione IP',
      href:        '/admin/sicurezza',
    })
  }

  if (topIpDetails.some((ip) => ip.targets > 3)) {
    rootCauses.push({
      probability: 'alta',
      hypothesis:  'Credential stuffing da IP singolo',
      evidence:    `IP con attacchi su ${topIpDetails.find((ip) => ip.targets > 3)?.targets} account diversi`,
      action:      'Blocca IP a livello firewall + reset utenti colpiti',
      href:        '/admin/sicurezza',
    })
  }

  if (newUsersFailed > 0) {
    rootCauses.push({
      probability: 'media',
      hypothesis:  'Account nuovi con tentativi login falliti',
      evidence:    `${newUsersFailed} nuovi utenti (< 24h) con ≥ 1 tentativo fallito`,
      action:      'Possibile registrazione massiva bot → verifica pattern email',
      href:        '/admin/users',
    })
  }

  if (suspendedToday > 2) {
    rootCauses.push({
      probability: 'media',
      hypothesis:  'Operazione sicurezza in corso',
      evidence:    `${suspendedToday} sospensioni nelle ultime 24h`,
      action:      'Revisiona log admin per correlazione',
      href:        '/admin/log',
    })
  }

  if (rootCauses.length === 0) {
    rootCauses.push({
      probability: 'bassa',
      hypothesis:  'Nessuna anomalia rilevata',
      evidence:    'Tutti i parametri nei range normali',
      action:      'Monitoraggio routinario',
    })
  }

  const probColor = { alta: 'bg-red-500/20 text-red-400', media: 'bg-amber-400/20 text-amber-400', bassa: 'bg-emerald-500/20 text-emerald-400' }

  return (
    <main className="min-h-screen w-full overflow-x-hidden px-4 py-6 sm:px-6 sm:py-8">
      <div className="mx-auto w-full max-w-6xl space-y-6">

        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-[#ff6b00]">Super Admin</p>
            <h1 className="mt-1 text-3xl font-black">Intelligence Layer</h1>
            <p className="mt-1 text-xs font-bold text-white/30">
              Correlazione eventi · Anomaly scoring · Root cause detection
            </p>
          </div>
          <div className="flex gap-2">
            <Link href="/admin/control-plane" className="flex h-9 items-center gap-2 rounded-xl border border-white/10 px-3 text-xs font-black text-white/60 transition hover:border-white/30 hover:text-white">
              Control Plane
            </Link>
            <Link href="/admin/sicurezza" className="flex h-9 items-center gap-2 rounded-xl border border-white/10 px-3 text-xs font-black text-white/60 transition hover:border-white/30 hover:text-white">
              Sicurezza →
            </Link>
          </div>
        </div>

        {/* ── Root cause detection ────────────────────────────────────────────── */}
        <section>
          <p className="mb-3 text-xs font-black uppercase tracking-widest text-[#ff6b00]">
            Root Cause Detection
          </p>
          <div className="space-y-3">
            {rootCauses.map((rc, i) => (
              <div key={i} className={`rounded-2xl border p-5 ${
                rc.probability === 'alta'  ? 'border-red-500/30   bg-red-500/[0.04]'   :
                rc.probability === 'media' ? 'border-amber-400/30 bg-amber-400/[0.04]' :
                                             'border-white/[0.07] bg-white/[0.03]'
              }`}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-black ${probColor[rc.probability]}`}>
                      PROB. {rc.probability.toUpperCase()}
                    </span>
                    <p className="font-black text-white">{rc.hypothesis}</p>
                  </div>
                  {rc.href && (
                    <Link href={rc.href} className="text-xs font-black text-[#ff6b00] hover:underline">
                      Indaga →
                    </Link>
                  )}
                </div>
                <p className="mt-2 text-xs font-bold text-white/50">
                  <span className="text-white/30">Evidenza:</span> {rc.evidence}
                </p>
                <p className="mt-1 text-xs font-bold text-white/40">
                  <span className="text-white/30">Azione:</span> {rc.action}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Two-col: Anomaly scores + IP intelligence ───────────────────── */}
        <div className="grid gap-6 lg:grid-cols-2">

          {/* User Anomaly Scores */}
          <section>
            <p className="mb-3 text-xs font-black uppercase tracking-widest text-white/40">
              User Anomaly Score (top {scoredUsers.length})
            </p>
            <div className="overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.03]">
              {scoredUsers.length === 0 ? (
                <p className="px-5 py-6 text-xs font-bold text-white/25">Nessun utente a rischio.</p>
              ) : (
                <div className="divide-y divide-white/[0.05]">
                  {scoredUsers.map((u) => (
                    <div key={u.id} className="flex items-center justify-between gap-3 px-4 py-3">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-black text-white">
                          {u.firstName ?? ''} {u.lastName ?? ''}
                        </p>
                        <p className="truncate text-xs font-bold text-white/40">{u.email}</p>
                        <p className="text-[10px] font-bold text-white/25">
                          {u.loginAttempts} att. totali · {u.recentFails} fail 24h
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        {u.suspended && (
                          <span className="rounded-full bg-red-500/20 px-2 py-0.5 text-[10px] font-black text-red-400">
                            Sospeso
                          </span>
                        )}
                        <div className="text-right">
                          <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-black ${riskBadge(u.anomalyScore)}`}>
                            {u.anomalyScore} — {riskLabel(u.anomalyScore)}
                          </span>
                        </div>
                        <Link href={`/admin/users/${u.id}`}
                          className="text-[10px] font-black text-[#ff6b00] hover:underline">
                          →
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* IP Intelligence */}
          <section>
            <p className="mb-3 text-xs font-black uppercase tracking-widest text-white/40">
              IP Intelligence — concentrazione attacchi (24h)
            </p>
            <div className="overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.03]">
              {topIpDetails.length === 0 ? (
                <p className="px-5 py-6 text-xs font-bold text-white/25">
                  Nessun IP con pattern anomali nelle ultime 24h.
                </p>
              ) : (
                <div className="divide-y divide-white/[0.05]">
                  {topIpDetails.map((ip) => (
                    <div key={ip.ip} className="px-4 py-3">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-sm font-black text-white">{ip.ip}</span>
                        <div className="flex items-center gap-2">
                          <span className={`rounded-full px-2 py-0.5 text-[10px] font-black ${
                            ip.totalFails >= 20 ? 'bg-red-500/20 text-red-400'
                            : ip.totalFails >= 10 ? 'bg-amber-400/20 text-amber-400'
                            : 'bg-white/10 text-white/50'
                          }`}>
                            {ip.totalFails} fail
                          </span>
                          <span className="text-[10px] font-bold text-white/30">
                            {ip.targets} target{ip.targets !== 1 ? 's' : ''}
                          </span>
                        </div>
                      </div>
                      {ip.emails.length > 0 && (
                        <p className="mt-1 text-[10px] font-bold text-white/25">
                          Account: {ip.emails.join(', ')}
                          {ip.targets > 3 ? ` +${ip.targets - 3} altri` : ''}
                        </p>
                      )}
                      {ip.targets > 3 && (
                        <span className="mt-1 inline-block rounded bg-red-500/20 px-1.5 py-0.5 text-[10px] font-black text-red-400">
                          CREDENTIAL STUFFING
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>

        {/* ── Attack timeline ─────────────────────────────────────────────────── */}
        {bucketData.length > 0 && (
          <section>
            <p className="mb-3 text-xs font-black uppercase tracking-widest text-white/40">
              Attack Timeline — login falliti (bucket 15min, ultime 6h)
            </p>
            <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-5">
              <div className="flex items-end gap-1 overflow-x-auto pb-2">
                {bucketData.map((b, i) => (
                  <div key={i} className="flex min-w-[2.5rem] flex-col items-center gap-1">
                    <span className="text-[9px] font-black text-white/30">{b.count > 0 ? b.count : ''}</span>
                    <div
                      className={`w-7 rounded-t-sm transition-all ${
                        b.spike ? 'bg-red-500' : b.count > 0 ? 'bg-amber-400/60' : 'bg-white/10'
                      }`}
                      style={{ height: `${Math.max(4, Math.round((b.count / maxBucket) * 80))}px` }}
                    />
                    <span className="text-[9px] font-bold text-white/25 rotate-45 origin-left whitespace-nowrap">
                      {b.time}
                    </span>
                  </div>
                ))}
              </div>
              <p className="mt-6 text-[10px] font-bold text-white/25">
                Spike (barra rossa) = ≥ 5 fallimenti in 15 minuti
              </p>
            </div>
          </section>
        )}

        {/* ── Admin action summary ────────────────────────────────────────────── */}
        {adminActionSummary.length > 0 && (
          <section>
            <p className="mb-3 text-xs font-black uppercase tracking-widest text-white/40">
              Admin Activity (ultime 24h)
            </p>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
              {adminActionSummary.map((a) => (
                <div key={a.action} className="rounded-xl border border-white/[0.07] bg-white/[0.03] px-4 py-3">
                  <p className="text-lg font-black text-white">{a._count.id}</p>
                  <p className="mt-0.5 text-[10px] font-bold text-white/40">{a.action.replace(/_/g, ' ')}</p>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  )
}
