import { getServerSession } from 'next-auth'
import { redirect }         from 'next/navigation'
import Link                 from 'next/link'

import { authOptions } from '@/lib/auth'
import { prisma }      from '@/lib/prisma'

function fmt(d: Date) {
  return d.toLocaleString('it-IT', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

export default async function SicurezzaPage() {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as { role?: string })?.role !== 'super_admin') redirect('/login')

  const now            = new Date()
  const tenMinutesAgo  = new Date(now.getTime() -  10 * 60 * 1000)
  const oneHourAgo     = new Date(now.getTime() -  60 * 60 * 1000)
  const twentyFourHAgo = new Date(now.getTime() -  24 * 60 * 60 * 1000)
  const sevenDaysAgo   = new Date(now.getTime() -   7 * 24 * 60 * 60 * 1000)

  const [
    // Aggregates
    failed10min,
    failed1h,
    failed24h,
    success24h,
    failed7d,
    // At-risk users
    usersHighAttempts,
    suspendedUsers,
    // Recent failures with IP
    recentFailures,
    // Brute-force users detail
    bruteUsers,
    // Top failure IPs (last 24h)
    foreignIPEvents,
  ] = await Promise.all([
    prisma.loginEvent.count({ where: { success: false, createdAt: { gte: tenMinutesAgo } } }),
    prisma.loginEvent.count({ where: { success: false, createdAt: { gte: oneHourAgo    } } }),
    prisma.loginEvent.count({ where: { success: false, createdAt: { gte: twentyFourHAgo} } }),
    prisma.loginEvent.count({ where: { success: true,  createdAt: { gte: twentyFourHAgo} } }),
    prisma.loginEvent.count({ where: { success: false, createdAt: { gte: sevenDaysAgo  } } }),
    prisma.user.findMany({
      where: { loginAttempts: { gte: 5 }, suspended: false },
      select: { id: true, email: true, firstName: true, lastName: true, loginAttempts: true, createdAt: true },
      orderBy: { loginAttempts: 'desc' },
      take: 20,
    }),
    prisma.user.findMany({
      where: { suspended: true },
      select: { id: true, email: true, firstName: true, lastName: true, updatedAt: true, role: true },
      orderBy: { updatedAt: 'desc' },
      take: 10,
    }),
    prisma.loginEvent.findMany({
      where: { success: false, createdAt: { gte: twentyFourHAgo } },
      orderBy: { createdAt: 'desc' },
      take: 50,
      select: {
        id: true, createdAt: true, ipAddress: true, provider: true,
        user: { select: { email: true } },
      },
    }),
    prisma.user.findMany({
      where: { loginAttempts: { gte: 10 } },
      select: {
        id: true, email: true, firstName: true, lastName: true,
        loginAttempts: true, suspended: true,
        loginEvents: {
          where: { success: false },
          select: { ipAddress: true, createdAt: true },
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
      },
      orderBy: { loginAttempts: 'desc' },
      take: 10,
    }),
    // Foreign IP events (rough detection: not starting with Italian prefixes)
    prisma.loginEvent.findMany({
      where: {
        success:   false,
        createdAt: { gte: twentyFourHAgo },
        ipAddress: { not: null },
      },
      select: { ipAddress: true },
    }),
  ])

  // Count IP frequencies
  const ipFreq = new Map<string, number>()
  for (const ev of foreignIPEvents) {
    if (ev.ipAddress) {
      ipFreq.set(ev.ipAddress, (ipFreq.get(ev.ipAddress) ?? 0) + 1)
    }
  }
  const topIPs = Array.from(ipFreq.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)

  const total24h = success24h + failed24h
  const failRate24h = total24h > 0 ? Math.round((failed24h / total24h) * 100) : 0

  const systemStatus =
    failed10min > 10 || bruteUsers.some((u) => u.loginAttempts >= 20)
      ? 'red'
      : failed10min > 3 || usersHighAttempts.length > 0
      ? 'yellow'
      : 'green'

  const statusMap = {
    green:  { dot: 'bg-emerald-500', label: 'Nessuna minaccia attiva', bar: 'text-emerald-400' },
    yellow: { dot: 'bg-amber-400',   label: 'Attività sospetta rilevata', bar: 'text-amber-400' },
    red:    { dot: 'bg-red-500',     label: 'Attacco in corso',          bar: 'text-red-400' },
  }
  const st = statusMap[systemStatus]

  return (
    <main className="min-h-screen w-full overflow-x-hidden px-4 py-6 sm:px-6 sm:py-8">
      <div className="mx-auto w-full max-w-6xl space-y-6">

        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-[#ff6b00]">Super Admin</p>
            <h1 className="mt-1 text-3xl font-black">Sicurezza</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className={`flex items-center gap-2 ${st.bar}`}>
              <span className={`h-2.5 w-2.5 rounded-full ${st.dot} animate-pulse`} />
              <span className="text-xs font-black">{st.label}</span>
            </div>
            <Link href="/admin/alert" className="flex h-9 items-center gap-2 rounded-xl border border-white/10 px-3 text-xs font-black text-white/60 transition hover:border-white/30 hover:text-white">
              Alert Center →
            </Link>
          </div>
        </div>

        {/* Metric row */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {[
            { label: 'Falliti 10min', value: failed10min,  alert: failed10min  > 3  },
            { label: 'Falliti 1h',    value: failed1h,     alert: failed1h     > 10 },
            { label: 'Falliti 24h',   value: failed24h,    alert: false              },
            { label: 'Tasso fail 24h',value: `${failRate24h}%`, alert: failRate24h > 30 },
            { label: 'Falliti 7gg',   value: failed7d,     alert: false              },
          ].map((m) => (
            <div key={m.label} className={`rounded-2xl border p-4 ${m.alert ? 'border-red-500/30 bg-red-500/[0.05]' : 'border-white/[0.07] bg-white/[0.03]'}`}>
              <p className="text-[10px] font-black uppercase tracking-widest text-white/30">{m.label}</p>
              <p className={`mt-2 text-2xl font-black ${m.alert ? 'text-red-400' : 'text-white'}`}>{m.value}</p>
            </div>
          ))}
        </div>

        {/* Brute force users */}
        {bruteUsers.length > 0 && (
          <section className="rounded-2xl border border-red-500/20 bg-red-500/[0.04] p-5">
            <p className="mb-4 text-xs font-black uppercase tracking-widest text-red-400">
              Brute force — utenti con ≥ 10 tentativi falliti ({bruteUsers.length})
            </p>
            <div className="space-y-3">
              {bruteUsers.map((u) => (
                <div key={u.id} className="flex flex-wrap items-start justify-between gap-3 rounded-xl border border-red-500/15 bg-black/20 p-4">
                  <div>
                    <p className="text-sm font-black text-white">{u.firstName ?? ''} {u.lastName ?? ''}</p>
                    <p className="text-xs font-bold text-white/50">{u.email}</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {u.loginEvents.map((ev, i) => (
                        <span key={i} className="font-mono text-[10px] text-white/25">
                          {ev.ipAddress ?? 'IP?'} {new Date(ev.createdAt).toLocaleTimeString('it-IT')}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`rounded-full px-3 py-1 text-xs font-black ${
                      u.loginAttempts >= 20 ? 'bg-red-500/30 text-red-300' : 'bg-amber-400/20 text-amber-400'
                    }`}>
                      {u.loginAttempts} tentativi
                    </span>
                    <span className={`rounded-full px-3 py-1 text-xs font-black ${
                      u.suspended ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'
                    }`}>
                      {u.suspended ? 'Sospeso' : 'Attivo'}
                    </span>
                    <Link
                      href={`/admin/users/${u.id}`}
                      className="rounded-xl border border-white/10 px-3 py-1.5 text-[10px] font-black text-white/60 transition hover:border-[#ff6b00]/50 hover:text-white"
                    >
                      Gestisci →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* At-risk users (5-9 attempts) */}
        {usersHighAttempts.length > 0 && (
          <section>
            <p className="mb-3 text-xs font-black uppercase tracking-widest text-amber-400">
              Utenti a rischio — tentativi falliti ≥ 5 ({usersHighAttempts.length})
            </p>
            <div className="overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.03]">
              <table className="w-full border-collapse text-sm">
                <thead className="bg-white/5">
                  <tr>
                    <th className="px-4 py-3 text-left text-[10px] font-black uppercase text-white/30">Utente</th>
                    <th className="px-4 py-3 text-left text-[10px] font-black uppercase text-white/30">Email</th>
                    <th className="px-4 py-3 text-left text-[10px] font-black uppercase text-white/30">Tentativi</th>
                    <th className="px-4 py-3 text-left text-[10px] font-black uppercase text-white/30">Azione</th>
                  </tr>
                </thead>
                <tbody>
                  {usersHighAttempts.map((u) => (
                    <tr key={u.id} className="border-t border-white/[0.05]">
                      <td className="px-4 py-3 font-black text-white">{u.firstName ?? ''} {u.lastName ?? ''}</td>
                      <td className="px-4 py-3 font-bold text-white/50">{u.email}</td>
                      <td className="px-4 py-3">
                        <span className="rounded-full bg-amber-400/20 px-2.5 py-1 text-xs font-black text-amber-400">
                          {u.loginAttempts}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          href={`/admin/users/${u.id}`}
                          className="text-xs font-black text-[#ff6b00] hover:underline"
                        >
                          Apri →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* Two-column: Top IPs + Suspended */}
        <div className="grid gap-6 lg:grid-cols-2">

          {/* Top IPs */}
          <section>
            <p className="mb-3 text-xs font-black uppercase tracking-widest text-white/40">
              IP con più fallimenti (24h)
            </p>
            <div className="overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.03]">
              {topIPs.length === 0 ? (
                <p className="px-5 py-6 text-xs font-bold text-white/25">Nessun fallimento nelle ultime 24h.</p>
              ) : (
                <table className="w-full border-collapse text-sm">
                  <thead className="bg-white/5">
                    <tr>
                      <th className="px-4 py-2.5 text-left text-[10px] font-black uppercase text-white/30">#</th>
                      <th className="px-4 py-2.5 text-left text-[10px] font-black uppercase text-white/30">IP Address</th>
                      <th className="px-4 py-2.5 text-left text-[10px] font-black uppercase text-white/30">Tentativi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topIPs.map(([ip, count], i) => (
                      <tr key={ip} className="border-t border-white/[0.05]">
                        <td className="px-4 py-2.5 text-xs font-black text-white/30">{i + 1}</td>
                        <td className="px-4 py-2.5 font-mono text-sm text-white/70">{ip}</td>
                        <td className="px-4 py-2.5">
                          <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-black ${
                            count >= 10 ? 'bg-red-500/20 text-red-400'
                            : count >= 5 ? 'bg-amber-400/20 text-amber-400'
                            : 'bg-white/10 text-white/50'
                          }`}>
                            {count}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </section>

          {/* Suspended users */}
          <section>
            <p className="mb-3 text-xs font-black uppercase tracking-widest text-white/40">
              Utenti sospesi ({suspendedUsers.length})
            </p>
            <div className="overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.03]">
              {suspendedUsers.length === 0 ? (
                <p className="px-5 py-6 text-xs font-bold text-white/25">Nessun utente sospeso.</p>
              ) : (
                <div className="divide-y divide-white/[0.05]">
                  {suspendedUsers.map((u) => (
                    <div key={u.id} className="flex items-center justify-between px-4 py-3">
                      <div>
                        <p className="text-sm font-black text-white">{u.firstName ?? ''} {u.lastName ?? ''}</p>
                        <p className="text-xs font-bold text-white/40">{u.email}</p>
                      </div>
                      <Link
                        href={`/admin/users/${u.id}`}
                        className="text-xs font-black text-[#ff6b00] hover:underline"
                      >
                        Apri →
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Recent failures feed */}
        <section>
          <p className="mb-3 text-xs font-black uppercase tracking-widest text-white/40">
            Login falliti recenti (ultime 24h — max 50)
          </p>
          <div className="overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.03]">
            {recentFailures.length === 0 ? (
              <p className="px-5 py-6 text-xs font-bold text-white/25">Nessun fallimento nelle ultime 24h. ✓</p>
            ) : (
              <div className="divide-y divide-white/[0.05]">
                {recentFailures.map((ev) => (
                  <div key={ev.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span className="h-2 w-2 rounded-full bg-red-500" />
                      <span className="text-xs font-bold text-white/60">{ev.user?.email ?? '—'}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      {ev.ipAddress && (
                        <span className="font-mono text-[10px] text-white/30">{ev.ipAddress}</span>
                      )}
                      <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-bold text-white/40">
                        {ev.provider}
                      </span>
                      <span className="font-mono text-[10px] text-white/25">{fmt(ev.createdAt)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  )
}
