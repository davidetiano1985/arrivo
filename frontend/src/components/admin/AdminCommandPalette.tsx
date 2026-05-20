'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'

// ── Types ─────────────────────────────────────────────────────────────────────

type UserResult = {
  id: string
  numericId: number
  firstName: string | null
  lastName: string | null
  email: string
  role: string
  suspended: boolean
}

type RestaurantResult = {
  id: string
  name: string
  city: string | null
  status: string
  slug: string
}

type LogResult = {
  id: string
  createdAt: string
  action: string
  adminEmail: string
  targetEmail: string
  details: string | null
}

type Results = {
  users:       UserResult[]
  restaurants: RestaurantResult[]
  logs:        LogResult[]
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function roleBadgeClass(role: string) {
  const map: Record<string, string> = {
    super_admin:    'bg-[#ff6b00]/20 text-[#ff6b00]',
    gestore_locale: 'bg-white/10 text-white/70',
    manager:        'bg-blue-500/20 text-blue-300',
    staff:          'bg-emerald-500/20 text-emerald-300',
    cliente:        'bg-white/10 text-white/50',
  }
  return map[role] ?? 'bg-white/10 text-white/50'
}

const ACTION_LABELS: Record<string, string> = {
  ROLE_CHANGE:          'Cambio ruolo',
  SUSPEND:              'Sospensione',
  UNSUSPEND:            'Riattivazione',
  DELETE_USER:          'Eliminazione',
  RESET_PASSWORD:       'Reset password',
  RESET_LOGIN_ATTEMPTS: 'Reset tentativi',
  CREATE_USER:          'Creazione',
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function AdminCommandPalette({
  open,
  onClose,
}: {
  open:    boolean
  onClose: () => void
}) {
  const [query,   setQuery]   = useState('')
  const [results, setResults] = useState<Results | null>(null)
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const router = useRouter()

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setQuery('')
      setResults(null)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [open])

  // Keyboard listener for Ctrl+K / Cmd+K / Escape
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        if (!open) return   // parent will open
      }
      if (e.key === 'Escape' && open) onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  // Debounced search
  useEffect(() => {
    if (!query || query.length < 2) {
      setResults(null)
      return
    }

    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/admin/search?q=${encodeURIComponent(query)}`)
        if (res.ok) setResults(await res.json())
      } finally {
        setLoading(false)
      }
    }, 250)

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [query])

  const hasResults =
    results && (results.users.length > 0 || results.restaurants.length > 0 || results.logs.length > 0)

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[9998] flex items-start justify-center pt-[10vh]">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="relative z-10 w-full max-w-2xl overflow-hidden rounded-2xl border border-white/10 bg-[#111] shadow-2xl shadow-black/60">

        {/* Search input */}
        <div className="flex items-center gap-3 border-b border-white/[0.07] px-5 py-4">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="shrink-0 text-white/40">
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
          </svg>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cerca utenti, ristoranti, log…"
            className="flex-1 bg-transparent text-sm font-bold text-white placeholder-white/25 outline-none"
          />
          {loading && (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="animate-spin text-white/30">
              <path d="M21 12a9 9 0 1 1-6.219-8.56" />
            </svg>
          )}
          <kbd className="rounded border border-white/10 px-2 py-0.5 text-[10px] font-black text-white/25">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div className="max-h-[60vh] overflow-y-auto">

          {/* Empty state */}
          {!query && (
            <div className="px-5 py-8 text-center">
              <p className="text-sm font-bold text-white/25">Digita per cercare utenti, ristoranti, log admin</p>
            </div>
          )}

          {query.length >= 2 && !loading && !hasResults && (
            <div className="px-5 py-8 text-center">
              <p className="text-sm font-bold text-white/25">Nessun risultato per &quot;{query}&quot;</p>
            </div>
          )}

          {/* Users */}
          {results && results.users.length > 0 && (
            <div className="border-b border-white/[0.07]">
              <p className="px-5 py-2 text-[10px] font-black uppercase tracking-widest text-white/30">
                Utenti
              </p>
              {results.users.map((u) => (
                <Link
                  key={u.id}
                  href={`/admin/users/${u.id}`}
                  onClick={onClose}
                  className="flex items-center gap-3 px-5 py-3 transition hover:bg-white/[0.05]"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10 text-xs font-black text-white/70">
                    {(u.firstName?.[0] ?? u.email[0]).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-black text-white">
                      {u.firstName ?? ''} {u.lastName ?? ''}
                    </p>
                    <p className="truncate text-xs font-bold text-white/45">{u.email}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-black ${roleBadgeClass(u.role)}`}>
                      {u.role}
                    </span>
                    {u.suspended && (
                      <span className="rounded-full bg-red-500/20 px-2 py-0.5 text-[10px] font-black text-red-400">
                        sospeso
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* Restaurants */}
          {results && results.restaurants.length > 0 && (
            <div className="border-b border-white/[0.07]">
              <p className="px-5 py-2 text-[10px] font-black uppercase tracking-widest text-white/30">
                Ristoranti
              </p>
              {results.restaurants.map((r) => (
                <Link
                  key={r.id}
                  href="/admin/ristoranti"
                  onClick={onClose}
                  className="flex items-center gap-3 px-5 py-3 transition hover:bg-white/[0.05]"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#ff6b00]/20 text-xs font-black text-[#ff6b00]">
                    {r.name[0].toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-black text-white">{r.name}</p>
                    <p className="text-xs font-bold text-white/45">{r.city ?? '—'} · /{r.slug}</p>
                  </div>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-black ${
                    r.status === 'approved' ? 'bg-emerald-500/20 text-emerald-400'
                    : r.status === 'rejected' ? 'bg-red-500/20 text-red-400'
                    : 'bg-amber-400/20 text-amber-400'
                  }`}>
                    {r.status}
                  </span>
                </Link>
              ))}
            </div>
          )}

          {/* Logs */}
          {results && results.logs.length > 0 && (
            <div>
              <p className="px-5 py-2 text-[10px] font-black uppercase tracking-widest text-white/30">
                Log Admin
              </p>
              {results.logs.map((l) => (
                <Link
                  key={l.id}
                  href="/admin/log"
                  onClick={onClose}
                  className="flex items-center gap-3 px-5 py-3 transition hover:bg-white/[0.05]"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-black text-white">
                      {ACTION_LABELS[l.action] ?? l.action}
                    </p>
                    <p className="truncate text-xs font-bold text-white/45">
                      {l.adminEmail} → {l.targetEmail}
                    </p>
                  </div>
                  <p className="shrink-0 text-xs font-bold text-white/30">
                    {new Date(l.createdAt).toLocaleDateString('it-IT')}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center gap-4 border-t border-white/[0.07] px-5 py-2.5">
          <span className="text-[10px] font-bold text-white/25">↑↓ naviga</span>
          <span className="text-[10px] font-bold text-white/25">↵ apri</span>
          <span className="text-[10px] font-bold text-white/25">ESC chiudi</span>
        </div>
      </div>
    </div>
  )
}
