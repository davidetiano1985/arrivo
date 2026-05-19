'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'

type LiveEvent = {
  id:        string
  createdAt: string
  success:   boolean
  ipAddress: string | null
  provider:  string
  userId:    string
  userEmail: string | null
  userName:  string | null
  userRole:  string | null
  userDbId:  string | null
}

function fmt(iso: string) {
  return new Date(iso).toLocaleString('it-IT', {
    day: '2-digit', month: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  })
}

function roleBadge(role: string | null) {
  if (!role) return ''
  const map: Record<string, string> = {
    super_admin:    'bg-[#ff6b00]/20 text-[#ff6b00]',
    gestore_locale: 'bg-white/10 text-white/60',
    manager:        'bg-blue-500/20 text-blue-300',
    cliente:        'bg-white/[0.07] text-white/40',
  }
  return map[role] ?? 'bg-white/[0.07] text-white/40'
}

export default function EventiLiveClient({ initialEvents }: { initialEvents: LiveEvent[] }) {
  const [events,    setEvents]    = useState<LiveEvent[]>(initialEvents)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())
  const [filter,    setFilter]    = useState<'all' | 'success' | 'fail'>('all')
  const [newCount,  setNewCount]  = useState(0)
  const timerRef  = useRef<ReturnType<typeof setInterval> | null>(null)
  const latestId  = useRef<string>(initialEvents[0]?.id ?? '')

  // Poll every 15 seconds for new events
  useEffect(() => {
    async function poll() {
      try {
        const res = await fetch('/api/admin/events?limit=100', { cache: 'no-store' })
        if (!res.ok) return
        const data = await res.json()
        const fresh: LiveEvent[] = data.events.map((e: {
          id: string; createdAt: string; success: boolean;
          ipAddress: string | null; provider: string; userId: string;
          user?: { email?: string; firstName?: string; role?: string; id?: string } | null;
        }) => ({
          id:        e.id,
          createdAt: e.createdAt,
          success:   e.success,
          ipAddress: e.ipAddress,
          provider:  e.provider,
          userId:    e.userId,
          userEmail: e.user?.email     ?? null,
          userName:  e.user?.firstName ?? null,
          userRole:  e.user?.role      ?? null,
          userDbId:  e.user?.id        ?? null,
        }))

        // Count truly new events
        const prevLatest = latestId.current
        const newEvents  = fresh.filter((e) => e.id !== prevLatest && e.createdAt > (events[0]?.createdAt ?? ''))
        if (newEvents.length > 0) {
          setNewCount((n) => n + newEvents.length)
          latestId.current = fresh[0]?.id ?? latestId.current
        }

        setEvents(fresh)
        setLastUpdate(new Date())
      } catch { /* keep stale */ }
    }

    timerRef.current = setInterval(poll, 15_000)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const filtered = events.filter((e) =>
    filter === 'all'     ? true
    : filter === 'success' ? e.success
    : !e.success
  )

  const successCount = events.filter((e) => e.success).length
  const failCount    = events.filter((e) => !e.success).length

  return (
    <div className="space-y-4">
      {/* Stats + controls bar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex gap-2">
          {([
            { key: 'all',     label: `Tutti (${events.length})`          },
            { key: 'success', label: `Successi (${successCount})`        },
            { key: 'fail',    label: `Falliti (${failCount})`            },
          ] as { key: typeof filter; label: string }[]).map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`rounded-xl px-3 py-1.5 text-xs font-black transition ${
                filter === f.key
                  ? 'bg-[#ff6b00] text-black'
                  : 'border border-white/10 text-white/50 hover:text-white'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="ml-auto flex items-center gap-2">
          {newCount > 0 && (
            <span className="rounded-full bg-blue-500/20 px-2.5 py-1 text-[10px] font-black text-blue-400 animate-pulse">
              +{newCount} nuovi
            </span>
          )}
          <span className="text-[10px] font-bold text-white/25">
            {lastUpdate.toLocaleTimeString('it-IT')}
          </span>
        </div>
      </div>

      {/* Event list */}
      <div className="overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.03]">
        <div className="max-h-[70vh] overflow-y-auto">
          {filtered.length === 0 && (
            <p className="px-5 py-10 text-center text-xs font-bold text-white/25">Nessun evento.</p>
          )}
          {filtered.map((ev, idx) => (
            <div
              key={ev.id}
              className={`flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.05] px-5 py-3 transition ${
                idx === 0 && newCount > 0 ? 'bg-blue-500/[0.06]' : 'hover:bg-white/[0.02]'
              }`}
            >
              {/* Status dot + user */}
              <div className="flex items-center gap-3">
                <span className={`h-2 w-2 shrink-0 rounded-full ${ev.success ? 'bg-emerald-500' : 'bg-red-500'}`} />
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-black ${ev.success ? 'text-white' : 'text-white/70'}`}>
                      {ev.userName
                        ? ev.userName
                        : ev.userEmail
                        ? ev.userEmail.split('@')[0]
                        : 'Utente sconosciuto'
                      }
                    </span>
                    {ev.userRole && (
                      <span className={`rounded-full px-1.5 py-0.5 text-[9px] font-black ${roleBadge(ev.userRole)}`}>
                        {ev.userRole}
                      </span>
                    )}
                  </div>
                  {ev.userEmail && (
                    <p className="text-[10px] font-bold text-white/30">{ev.userEmail}</p>
                  )}
                </div>
              </div>

              {/* IP + provider + time + link */}
              <div className="flex items-center gap-3">
                {ev.ipAddress && (
                  <span className="font-mono text-[10px] text-white/25">{ev.ipAddress}</span>
                )}
                <span className={`rounded-full px-2 py-0.5 text-[9px] font-black ${
                  ev.provider === 'google'
                    ? 'bg-blue-500/15 text-blue-400'
                    : 'bg-white/[0.07] text-white/40'
                }`}>
                  {ev.provider}
                </span>
                <span className={`rounded-full px-2 py-0.5 text-[9px] font-black ${
                  ev.success ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400'
                }`}>
                  {ev.success ? 'OK' : 'FAIL'}
                </span>
                <span className="font-mono text-[10px] text-white/20">{fmt(ev.createdAt)}</span>
                {ev.userDbId && (
                  <Link
                    href={`/admin/users/${ev.userDbId}`}
                    className="text-[10px] font-black text-[#ff6b00] hover:underline"
                  >
                    Utente →
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
