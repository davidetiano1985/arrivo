'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'

// ── Types ─────────────────────────────────────────────────────────────────────

type LiveEvent = {
  id:        string
  createdAt: string
  success:   boolean
  ipAddress: string | null
  provider:  string
  userEmail: string | null
  userName:  string | null
}

type DashData = {
  totalUsers:           number
  newUsers24h:          number
  suspendedCount:       number
  pendingRequests:      number
  failedLoginsLastHour: number
  successLoginsLastHour:number
  failedLoginsTenMin:   number
  usersHighAttempts:    number
  activeAlerts:         number
  criticalAlerts:       number
  totalRestaurants:     number
  systemStatus:         'green' | 'yellow' | 'red'
  recentEvents:         LiveEvent[]
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function StatusPill({ status }: { status: 'green' | 'yellow' | 'red' }) {
  const map = {
    green:  { dot: 'bg-emerald-500', label: 'ONLINE',   bg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' },
    yellow: { dot: 'bg-amber-400',   label: 'ATTENZIONE', bg: 'bg-amber-400/10 border-amber-400/30 text-amber-400' },
    red:    { dot: 'bg-red-500',     label: 'CRITICO',  bg: 'bg-red-500/10 border-red-500/30 text-red-400' },
  }
  const s = map[status]
  return (
    <div className={`flex items-center gap-2 rounded-full border px-3 py-1.5 ${s.bg}`}>
      <span className={`h-2 w-2 rounded-full ${s.dot} animate-pulse`} />
      <span className="text-xs font-black tracking-widest">{s.label}</span>
    </div>
  )
}

function MetricCard({
  label, value, sub, status, href,
}: {
  label:  string
  value:  string | number
  sub?:   string
  status?: 'green' | 'yellow' | 'red' | 'neutral'
  href?:  string
}) {
  const borderMap = {
    green:   'border-emerald-500/30',
    yellow:  'border-amber-400/30',
    red:     'border-red-500/30',
    neutral: 'border-white/[0.07]',
  }
  const valueMap = {
    green:   'text-emerald-400',
    yellow:  'text-amber-400',
    red:     'text-red-400',
    neutral: 'text-white',
  }
  const s = status ?? 'neutral'

  const inner = (
    <div className={`rounded-2xl border ${borderMap[s]} bg-white/[0.04] p-4 transition-colors`}>
      <p className="text-[10px] font-black uppercase tracking-widest text-white/35">{label}</p>
      <p className={`mt-2 text-2xl font-black ${valueMap[s]}`}>{value}</p>
      {sub && <p className="mt-0.5 text-xs font-bold text-white/30">{sub}</p>}
    </div>
  )

  if (href) {
    return (
      <Link href={href} className="block hover:opacity-80 transition-opacity">
        {inner}
      </Link>
    )
  }
  return inner
}

function fmt(iso: string) {
  return new Date(iso).toLocaleTimeString('it-IT', {
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  })
}

// ── Main component ────────────────────────────────────────────────────────────

export default function AdminControlRoom({ initialData }: { initialData: DashData }) {
  const [data,       setData]       = useState<DashData>(initialData)
  const [lastUpdate, setLastUpdate] = useState(new Date())
  const [tick,       setTick]       = useState(0)    // forces re-render for clock
  const timerRef  = useRef<ReturnType<typeof setInterval> | null>(null)
  const clockRef  = useRef<ReturnType<typeof setInterval> | null>(null)

  // Fetch live stats + events every 30 s
  useEffect(() => {
    async function refresh() {
      try {
        const [statsRes, eventsRes] = await Promise.all([
          fetch('/api/admin/stats',  { cache: 'no-store' }),
          fetch('/api/admin/events?limit=12', { cache: 'no-store' }),
        ])
        if (statsRes.ok && eventsRes.ok) {
          const [stats, evData] = await Promise.all([statsRes.json(), eventsRes.json()])
          setData((prev) => ({
            ...prev,
            ...stats,
            recentEvents: evData.events.map((e: {
              id: string; createdAt: string; success: boolean;
              ipAddress: string | null; provider: string;
              user?: { email?: string; firstName?: string } | null;
            }) => ({
              id:        e.id,
              createdAt: e.createdAt,
              success:   e.success,
              ipAddress: e.ipAddress,
              provider:  e.provider,
              userEmail: e.user?.email  ?? null,
              userName:  e.user?.firstName ?? null,
            })),
          }))
          setLastUpdate(new Date())
        }
      } catch { /* keep stale */ }
    }

    timerRef.current = setInterval(refresh, 30_000)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [])

  // Clock tick every second (for "last update" display)
  useEffect(() => {
    clockRef.current = setInterval(() => setTick((t) => t + 1), 1000)
    return () => { if (clockRef.current) clearInterval(clockRef.current) }
  }, [])

  const loginTotal = data.successLoginsLastHour + data.failedLoginsLastHour
  const failRate   = loginTotal > 0
    ? Math.round((data.failedLoginsLastHour / loginTotal) * 100)
    : 0

  return (
    <div className="space-y-6">

      {/* ── Status bar ─────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-3">
        <StatusPill status={data.systemStatus} />
        <span className="text-xs font-bold text-white/25">
          Aggiornato: {lastUpdate.toLocaleTimeString('it-IT')}
        </span>
        <span className="text-xs font-bold text-white/15">(polling ogni 30s)</span>
      </div>

      {/* ── Metric grid ────────────────────────────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

        {/* COLUMN 1 — Users */}
        <div className="space-y-3">
          <p className="px-1 text-[10px] font-black uppercase tracking-widest text-white/25">Utenti</p>
          <MetricCard label="Totali"    value={data.totalUsers}   href="/admin/users" />
          <MetricCard
            label="Nuovi 24h"
            value={data.newUsers24h}
            status={data.newUsers24h > 0 ? 'green' : 'neutral'}
          />
          <MetricCard
            label="Sospesi"
            value={data.suspendedCount}
            status={data.suspendedCount > 0 ? 'yellow' : 'neutral'}
            href="/admin/users?status=sospeso"
          />
        </div>

        {/* COLUMN 2 — Security */}
        <div className="space-y-3">
          <p className="px-1 text-[10px] font-black uppercase tracking-widest text-white/25">Sicurezza</p>
          <MetricCard
            label="Login OK / 1h"
            value={data.successLoginsLastHour}
            status="green"
          />
          <MetricCard
            label="Login FAIL / 1h"
            value={`${data.failedLoginsLastHour} (${failRate}%)`}
            status={failRate > 50 ? 'red' : failRate > 20 ? 'yellow' : 'neutral'}
            href="/admin/sicurezza"
          />
          <MetricCard
            label="Attacchi / 10min"
            value={data.failedLoginsTenMin}
            status={data.failedLoginsTenMin > 10 ? 'red' : data.failedLoginsTenMin > 3 ? 'yellow' : 'neutral'}
            href="/admin/sicurezza"
          />
          <MetricCard
            label="Utenti a rischio"
            value={data.usersHighAttempts}
            status={data.usersHighAttempts > 0 ? 'yellow' : 'neutral'}
            href="/admin/sicurezza"
          />
        </div>

        {/* COLUMN 3 — Sistema */}
        <div className="space-y-3">
          <p className="px-1 text-[10px] font-black uppercase tracking-widest text-white/25">Sistema</p>
          <MetricCard label="Ristoranti"   value={data.totalRestaurants} href="/admin/ristoranti" />
          <MetricCard
            label="Richieste pending"
            value={data.pendingRequests}
            status={data.pendingRequests > 0 ? 'yellow' : 'neutral'}
            href="/admin/richieste"
          />
          <Link
            href="/admin/system-health"
            className="flex items-center justify-between rounded-2xl border border-white/[0.07] bg-white/[0.04] p-4 transition hover:opacity-80"
          >
            <p className="text-[10px] font-black uppercase tracking-widest text-white/35">System Health</p>
            <span className={`h-3 w-3 rounded-full animate-pulse ${
              data.systemStatus === 'red' ? 'bg-red-500'
              : data.systemStatus === 'yellow' ? 'bg-amber-400'
              : 'bg-emerald-500'
            }`} />
          </Link>
        </div>

        {/* COLUMN 4 — Alert */}
        <div className="space-y-3">
          <p className="px-1 text-[10px] font-black uppercase tracking-widest text-white/25">Alert</p>
          <MetricCard
            label="Alert attivi"
            value={data.activeAlerts}
            status={data.criticalAlerts > 0 ? 'red' : data.activeAlerts > 0 ? 'yellow' : 'neutral'}
            href="/admin/alert"
          />
          <MetricCard
            label="Critici"
            value={data.criticalAlerts}
            status={data.criticalAlerts > 0 ? 'red' : 'neutral'}
            href="/admin/alert"
          />

          {/* Quick links */}
          <div className="space-y-2">
            {[
              { href: '/admin/log',    label: 'Log Admin'   },
              { href: '/admin/eventi', label: 'Eventi Live' },
            ].map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="flex items-center justify-between rounded-xl border border-white/[0.07] bg-white/[0.03] px-4 py-3 text-xs font-black text-white/50 transition hover:border-white/20 hover:text-white"
              >
                {l.label}
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* ── Recent events feed ─────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03]">
        <div className="flex items-center justify-between border-b border-white/[0.07] px-5 py-4">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 animate-pulse rounded-full bg-blue-400" />
            <p className="text-xs font-black uppercase tracking-widest text-white/50">
              Login recenti
            </p>
          </div>
          <Link
            href="/admin/eventi"
            className="text-xs font-black text-[#ff6b00] hover:underline"
          >
            Tutti →
          </Link>
        </div>

        <div className="divide-y divide-white/[0.05]">
          {data.recentEvents.length === 0 && (
            <p className="px-5 py-6 text-xs font-bold text-white/25">Nessun evento recente.</p>
          )}
          {data.recentEvents.map((ev) => (
            <div key={ev.id} className="flex items-center gap-3 px-5 py-3">
              <span className={`h-2 w-2 shrink-0 rounded-full ${ev.success ? 'bg-emerald-500' : 'bg-red-500'}`} />
              <div className="min-w-0 flex-1">
                <span className="text-xs font-black text-white/70">
                  {ev.userName ?? ev.userEmail ?? 'Utente sconosciuto'}
                </span>
                {ev.userEmail && ev.userName && (
                  <span className="ml-2 text-xs font-bold text-white/30">{ev.userEmail}</span>
                )}
              </div>
              <div className="flex shrink-0 items-center gap-2">
                {ev.ipAddress && (
                  <span className="font-mono text-[10px] text-white/25">{ev.ipAddress}</span>
                )}
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-black ${
                  ev.success
                    ? 'bg-emerald-500/15 text-emerald-400'
                    : 'bg-red-500/15 text-red-400'
                }`}>
                  {ev.provider}
                </span>
                <span className="font-mono text-[10px] text-white/25">{fmt(ev.createdAt)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Quick nav grid ─────────────────────────────────────────────────── */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { href: '/admin/users',         label: 'Utenti',        desc: 'Gestisci tutti i ruoli'      },
          { href: '/admin/sicurezza',      label: 'Sicurezza',     desc: 'Accessi e anomalie'          },
          { href: '/admin/richieste',      label: 'Richieste',     desc: 'Approvazione locali'         },
          { href: '/admin/system-health',  label: 'System Health', desc: 'DB, memoria, uptime'         },
        ].map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="group rounded-2xl border border-white/[0.07] bg-white/[0.03] p-4 transition hover:border-[#ff6b00]/40 hover:bg-white/[0.06]"
          >
            <p className="text-sm font-black text-white group-hover:text-[#ff6b00]">{item.label}</p>
            <p className="mt-0.5 text-xs font-bold text-white/35">{item.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
