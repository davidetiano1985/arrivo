'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { signOut } from 'next-auth/react'

import AdminCommandPalette from './AdminCommandPalette'

// ── Types ─────────────────────────────────────────────────────────────────────

type Stats = {
  totalUsers:          number
  suspendedCount:      number
  pendingRequests:     number
  activeAlerts:        number
  criticalAlerts:      number
  usersHighAttempts:   number
  failedLoginsTenMin:  number
  totalRestaurants:    number
  systemStatus:        'green' | 'yellow' | 'red'
}

// ── Status dot ────────────────────────────────────────────────────────────────

function Dot({ status, pulse = false }: { status: 'green' | 'yellow' | 'red' | 'blue'; pulse?: boolean }) {
  const map = {
    green:  'bg-emerald-500',
    yellow: 'bg-amber-400',
    red:    'bg-red-500',
    blue:   'bg-blue-400',
  }
  return (
    <span className={`inline-block h-2 w-2 shrink-0 rounded-full ${map[status]} ${pulse ? 'animate-pulse' : ''}`} />
  )
}

// ── Badge ─────────────────────────────────────────────────────────────────────

function Badge({ value, color = 'neutral' }: {
  value:  string | number
  color?: 'neutral' | 'amber' | 'red' | 'green'
}) {
  const map = {
    neutral: 'bg-white/10 text-white/60',
    amber:   'bg-amber-400/20 text-amber-400',
    red:     'bg-red-500/20 text-red-400',
    green:   'bg-emerald-500/20 text-emerald-400',
  }
  return (
    <span className={`ml-auto rounded-full px-2 py-0.5 text-[10px] font-black ${map[color]}`}>
      {value}
    </span>
  )
}

// ── Nav item ──────────────────────────────────────────────────────────────────

function NavItem({
  href, label, badge, dot,
}: {
  href:    string
  label:   string
  badge?:  { value: string | number; color?: 'neutral' | 'amber' | 'red' | 'green' }
  dot?:    'green' | 'yellow' | 'red' | 'blue'
}) {
  const pathname = usePathname()
  const isActive = href === '/admin'
    ? pathname === '/admin'
    : pathname.startsWith(href)

  return (
    <Link
      href={href}
      className={`flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-black transition-all ${
        isActive
          ? 'bg-[#ff6b00] text-black'
          : 'text-white/55 hover:bg-white/[0.06] hover:text-white'
      }`}
    >
      {dot && <Dot status={dot} pulse={dot === 'green' || dot === 'blue'} />}
      <span className="min-w-0 flex-1 truncate">{label}</span>
      {badge && <Badge value={badge.value} color={badge.color} />}
    </Link>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-1 mt-5 px-3 text-[10px] font-black uppercase tracking-widest text-white/20">
      {children}
    </p>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export default function AdminSidebar({
  adminName, adminEmail, initialStats,
}: {
  adminName:    string
  adminEmail:   string
  initialStats: Stats
}) {
  const [stats,       setStats]       = useState<Stats>(initialStats)
  const [searchOpen,  setSearchOpen]  = useState(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Live-poll stats every 30 s
  useEffect(() => {
    async function poll() {
      try {
        const res = await fetch('/api/admin/stats', { cache: 'no-store' })
        if (res.ok) setStats(await res.json())
      } catch { /* keep stale */ }
    }
    timerRef.current = setInterval(poll, 30_000)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [])

  // Global Ctrl+K / Cmd+K
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setSearchOpen(true)
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  // Derived badge colors
  const securityColor: 'amber' | 'red' | 'neutral' =
    stats.failedLoginsTenMin > 10 ? 'red' : stats.usersHighAttempts > 0 || stats.failedLoginsTenMin > 3 ? 'amber' : 'neutral'

  const alertColor: 'red' | 'amber' | 'neutral' =
    stats.criticalAlerts > 0 ? 'red' : stats.activeAlerts > 0 ? 'amber' : 'neutral'

  return (
    <>
      <AdminCommandPalette open={searchOpen} onClose={() => setSearchOpen(false)} />

      {/* ── Desktop sidebar ───────────────────────────────────────────────── */}
      <aside className="fixed inset-y-0 left-0 hidden w-72 flex-col border-r border-white/[0.07] bg-[#0d0d0d] md:flex">

        {/* Logo row */}
        <div className="flex items-center gap-3 border-b border-white/[0.07] px-5 py-5">
          <Link href="/admin" className="flex items-center gap-2.5">
            <img src="/arrivo_logo.svg" alt="Arrivo" className="h-6 w-auto" />
            <span className="text-[11px] font-black tracking-widest text-[#ff6b00]">CONTROL ROOM</span>
          </Link>
          <div className="ml-auto">
            <Dot status={stats.systemStatus} pulse={stats.systemStatus === 'green'} />
          </div>
        </div>

        {/* Global search trigger */}
        <div className="border-b border-white/[0.07] px-4 py-3">
          <button
            onClick={() => setSearchOpen(true)}
            className="flex w-full items-center gap-2.5 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-bold text-white/35 transition hover:border-white/20 hover:text-white/70"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
            </svg>
            <span className="flex-1 text-left">Cerca…</span>
            <kbd className="rounded border border-white/10 px-1.5 py-0.5 text-[10px] font-black text-white/20">⌘K</kbd>
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-3">

          <NavItem href="/admin" label="Dashboard" dot={stats.systemStatus} />

          <SectionLabel>Utenti</SectionLabel>
          <NavItem
            href="/admin/users"
            label="Tutti gli utenti"
            badge={{ value: stats.totalUsers }}
          />
          <NavItem href="/admin/clienti" label="Clienti" />

          <SectionLabel>Locali</SectionLabel>
          <NavItem
            href="/admin/ristoranti"
            label="Ristoranti"
            badge={{ value: stats.totalRestaurants }}
          />
          <NavItem
            href="/admin/richieste"
            label="Richieste"
            badge={stats.pendingRequests > 0
              ? { value: stats.pendingRequests, color: 'amber' }
              : undefined}
          />

          <SectionLabel>Sicurezza</SectionLabel>
          <NavItem
            href="/admin/sicurezza"
            label="Sicurezza"
            badge={stats.usersHighAttempts > 0
              ? { value: stats.usersHighAttempts, color: securityColor }
              : undefined}
          />
          <NavItem
            href="/admin/alert"
            label="Alert Center"
            badge={stats.activeAlerts > 0
              ? { value: stats.activeAlerts, color: alertColor }
              : undefined}
          />

          <SectionLabel>Sistema</SectionLabel>
          <NavItem href="/admin/log"           label="Log Admin" />
          <NavItem href="/admin/eventi"        label="Eventi Live"   dot="blue" />
          <NavItem href="/admin/system-health" label="System Health" dot={stats.systemStatus} />

          <SectionLabel>Config</SectionLabel>
          <NavItem href="/admin/impostazioni" label="Impostazioni" />
        </nav>

        {/* Admin footer */}
        <div className="border-t border-white/[0.07] px-4 py-4">
          <p className="mb-0.5 truncate text-xs font-black text-white/70">{adminName}</p>
          <p className="mb-3 truncate text-[11px] font-bold text-white/30">{adminEmail}</p>
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="w-full rounded-xl px-3 py-2 text-left text-xs font-black text-white/40 transition hover:bg-red-600/20 hover:text-red-400"
          >
            Esci →
          </button>
        </div>
      </aside>

      {/* ── Mobile top bar ────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-white/[0.07] bg-[#0d0d0d]/95 px-4 py-3 backdrop-blur md:hidden">
        <Link href="/admin" className="flex items-center gap-2">
          <img src="/arrivo_logo.svg" alt="Arrivo" className="h-5 w-auto" />
          <span className="text-[11px] font-black tracking-widest text-[#ff6b00]">ADMIN</span>
          <Dot status={stats.systemStatus} pulse />
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setSearchOpen(true)}
            className="rounded-xl border border-white/10 p-2 text-white/50 transition hover:text-white"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
            </svg>
          </button>

          <Link href="/admin/alert" className="relative rounded-xl border border-white/10 p-2 text-white/50 transition hover:text-white">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            {stats.activeAlerts > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-black text-white">
                {stats.activeAlerts}
              </span>
            )}
          </Link>

          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="rounded-xl border border-white/10 px-2.5 py-2 text-xs font-black text-white/50 transition hover:border-red-500/50 hover:text-red-400"
          >
            Esci
          </button>
        </div>
      </header>
    </>
  )
}
