'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import type { ControlPlaneSnapshot } from '@/lib/controlPlane'

// ── Helpers ───────────────────────────────────────────────────────────────────

type StatusColor = 'green' | 'yellow' | 'red' | 'blue' | 'neutral'

const STATUS_RING: Record<StatusColor, string> = {
  green:   'border-emerald-500/40 bg-emerald-500/[0.04]',
  yellow:  'border-amber-400/40   bg-amber-400/[0.04]',
  red:     'border-red-500/40     bg-red-500/[0.04]',
  blue:    'border-blue-400/40    bg-blue-400/[0.04]',
  neutral: 'border-white/[0.07]   bg-white/[0.03]',
}
const STATUS_VALUE: Record<StatusColor, string> = {
  green:   'text-emerald-400',
  yellow:  'text-amber-400',
  red:     'text-red-400',
  blue:    'text-blue-400',
  neutral: 'text-white',
}
const STATUS_DOT: Record<StatusColor, string> = {
  green:   'bg-emerald-500',
  yellow:  'bg-amber-400',
  red:     'bg-red-500',
  blue:    'bg-blue-400',
  neutral: 'bg-white/30',
}

function scoreColor(score: number, invert = false): StatusColor {
  const high = score >= 70
  const mid  = score >= 40
  if (invert) return high ? 'red' : mid ? 'yellow' : 'green'
  return high ? 'green' : mid ? 'yellow' : 'red'
}

function fmtAge(minutes: number): string {
  if (minutes < 60)    return `${minutes}min`
  if (minutes < 1440)  return `${Math.round(minutes / 60)}h`
  return `${Math.round(minutes / 1440)}g`
}

function fmtUptime(sec: number): string {
  const d = Math.floor(sec / 86400)
  const h = Math.floor((sec % 86400) / 3600)
  const m = Math.floor((sec % 3600) / 60)
  if (d > 0) return `${d}g ${h}h`
  if (h > 0) return `${h}h ${m}m`
  return `${m}m`
}

const ACTION_LABELS: Record<string, string> = {
  ROLE_CHANGE:          'Cambio ruolo',
  SUSPEND:              'Sospensione',
  UNSUSPEND:            'Riattivazione',
  DELETE_USER:          'Eliminazione',
  RESET_PASSWORD:       'Reset password',
  RESET_LOGIN_ATTEMPTS: 'Reset tentativi',
  CREATE_USER:          'Crea account',
  APPROVA_RICHIESTA:    'Approva richiesta',
  RIFIUTA_RICHIESTA:    'Rifiuta richiesta',
  RESOLVE_ALERT:        'Risolvi alert',
  CREATE_ALERT:         'Crea alert',
  FORCE_LOGOUT:         'Forza logout',
  VIEW_AS_USER:         'Impersonazione',
}

// ── Card wrapper ──────────────────────────────────────────────────────────────

function Card({
  label, color = 'neutral', href, children, pulse = false,
}: {
  label:    string
  color?:   StatusColor
  href?:    string
  pulse?:   boolean
  children: React.ReactNode
}) {
  const inner = (
    <div className={`relative h-full rounded-2xl border p-5 transition-colors ${STATUS_RING[color]}`}>
      <div className="mb-3 flex items-center gap-2">
        <span className={`h-1.5 w-1.5 rounded-full ${STATUS_DOT[color]} ${pulse ? 'animate-pulse' : ''}`} />
        <p className="text-[10px] font-black uppercase tracking-widest text-white/35">{label}</p>
      </div>
      {children}
    </div>
  )
  if (href) {
    return (
      <Link href={href} className="block h-full hover:opacity-90 transition-opacity">
        {inner}
      </Link>
    )
  }
  return inner
}

// ── Score ring ────────────────────────────────────────────────────────────────

function ScoreRing({ score, color }: { score: number; color: StatusColor }) {
  const r   = 28
  const circ = 2 * Math.PI * r
  const dash = (score / 100) * circ

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width="72" height="72" viewBox="0 0 72 72" className="-rotate-90">
        <circle cx="36" cy="36" r={r} stroke="currentColor" strokeWidth="5"
          className="text-white/10" fill="none" />
        <circle cx="36" cy="36" r={r} stroke="currentColor" strokeWidth="5"
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" fill="none"
          className={STATUS_VALUE[color]} style={{ transition: 'stroke-dasharray 0.6s ease' }}
        />
      </svg>
      <span className={`absolute text-xl font-black ${STATUS_VALUE[color]}`}>{score}</span>
    </div>
  )
}

// ── Live event dot ────────────────────────────────────────────────────────────

type LiveDot = { id: string; success: boolean; ts: number }

// ── Main component ────────────────────────────────────────────────────────────

export default function ControlPlaneClient({
  initial,
}: {
  initial: ControlPlaneSnapshot
}) {
  const [snap,       setSnap]       = useState<ControlPlaneSnapshot>(initial)
  const [connected,  setConnected]  = useState(false)
  const [lastUpdate, setLastUpdate] = useState(new Date())
  const [liveDots,   setLiveDots]   = useState<LiveDot[]>([])
  const esRef = useRef<EventSource | null>(null)

  useEffect(() => {
    function connect() {
      const es = new EventSource('/api/admin/stream')
      esRef.current = es

      es.onopen = () => setConnected(true)

      es.onmessage = (e) => {
        try {
          const msg = JSON.parse(e.data) as { type: string; data: unknown }
          if (msg.type === 'snapshot') {
            setSnap(msg.data as ControlPlaneSnapshot)
            setLastUpdate(new Date())
          } else if (msg.type === 'event') {
            const ev = msg.data as { type: string; ts: string }
            if (ev.type === 'login_success' || ev.type === 'login_fail') {
              const dot: LiveDot = {
                id:      ev.ts,
                success: ev.type === 'login_success',
                ts:      Date.now(),
              }
              setLiveDots((prev) => [dot, ...prev].slice(0, 20))
            }
          }
        } catch { /* ignore malformed */ }
      }

      es.onerror = () => {
        setConnected(false)
        es.close()
        // Reconnect after 5 s
        setTimeout(connect, 5_000)
      }
    }

    connect()
    return () => {
      esRef.current?.close()
    }
  }, [])

  const s = snap

  const healthColor  = scoreColor(s.healthScore,     false)
  const attackColor  = scoreColor(s.attackScore,      true)
  const degradeColor = scoreColor(s.degradationScore, true)
  const dbColor: StatusColor = s.dbStatus === 'error' ? 'red' : s.dbStatus === 'slow' ? 'yellow' : 'green'
  const memColor: StatusColor = s.memPercent > 80 ? 'red' : s.memPercent > 60 ? 'yellow' : 'green'

  return (
    <div className="space-y-4">

      {/* ── Status bar ─────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-2.5">
        <div className="flex items-center gap-2">
          <span className={`h-2 w-2 rounded-full ${connected ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
          <span className="text-xs font-black text-white/50">
            {connected ? 'SSE LIVE' : 'Reconnecting…'}
          </span>
        </div>
        <span className="text-white/20">·</span>
        <span className="text-xs font-bold text-white/30">
          Aggiornato: {lastUpdate.toLocaleTimeString('it-IT')}
        </span>
        <span className="ml-auto flex gap-1">
          {liveDots.map((d) => (
            <span
              key={d.id}
              className={`h-1.5 w-1.5 rounded-full transition-opacity ${
                d.success ? 'bg-emerald-500' : 'bg-red-500'
              }`}
            />
          ))}
        </span>
      </div>

      {/* ── 3×3 Grid ──────────────────────────────────────────────────────── */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">

        {/* CARD 1 — System Health Score */}
        <Card label="System Health Score" color={healthColor} href="/admin/system-health" pulse>
          <div className="flex items-center gap-4">
            <ScoreRing score={s.healthScore} color={healthColor} />
            <div>
              <p className={`text-sm font-black ${STATUS_VALUE[healthColor]}`}>
                {healthColor === 'green' ? 'Sistema sano' : healthColor === 'yellow' ? 'Attenzione' : 'CRITICO'}
              </p>
              <p className="mt-0.5 text-xs font-bold text-white/30">
                Error rate {s.errorRate24h}% · DB {s.dbLatency > 0 ? `${s.dbLatency}ms` : '—'}
              </p>
              <p className="mt-0.5 text-xs font-bold text-white/25">
                Heap {s.memPercent}% · Uptime {fmtUptime(s.uptimeSec)}
              </p>
            </div>
          </div>
        </Card>

        {/* CARD 2 — Traffic Live */}
        <Card label="Traffic Live" color="blue" href="/admin/eventi" pulse>
          <div className="space-y-2">
            <div className="flex items-end justify-between">
              <span className="text-3xl font-black text-white">{s.activeUsers15m}</span>
              <span className="text-xs font-bold text-white/30">utenti attivi / 15min</span>
            </div>
            <div className="flex justify-between border-t border-white/[0.06] pt-2">
              <div className="text-center">
                <p className="text-lg font-black text-blue-400">{s.loginsLastHour}</p>
                <p className="text-[10px] font-bold text-white/30">login / 1h</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-black text-blue-400">{s.loginsPerMin}</p>
                <p className="text-[10px] font-bold text-white/30">login / min</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-black text-white">{s.totalLogins24h}</p>
                <p className="text-[10px] font-bold text-white/30">login / 24h</p>
              </div>
            </div>
          </div>
        </Card>

        {/* CARD 3 — Security Status */}
        <Card label="Security Status" color={attackColor} href="/admin/sicurezza" pulse={s.attackScore > 50}>
          <div className="flex items-center gap-4">
            <ScoreRing score={s.attackScore} color={attackColor} />
            <div>
              <p className={`text-sm font-black ${STATUS_VALUE[attackColor]}`}>
                {s.attackScore === 0  ? 'Nessuna minaccia' :
                 s.attackScore  < 40 ? 'Attività normale' :
                 s.attackScore  < 70 ? 'Sospetto' : 'ATTACCO RILEVATO'}
              </p>
              <p className="mt-0.5 text-xs font-bold text-white/30">
                {s.failedLogins10m} fail / 10min
              </p>
              <p className="mt-0.5 text-xs font-bold text-white/25">
                {s.bruteForceUsers > 0
                  ? `⚠ ${s.bruteForceUsers} brute-force`
                  : `${s.suspendedUsers} sospesi`}
              </p>
            </div>
          </div>
        </Card>

        {/* CARD 4 — DB Health */}
        <Card label="Database Health" color={dbColor} href="/admin/observability">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className={`text-2xl font-black ${STATUS_VALUE[dbColor]}`}>
                {s.dbStatus === 'error' ? 'ERROR' : `${s.dbLatency}ms`}
              </span>
              <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-black ${
                s.dbStatus === 'ok'    ? 'bg-emerald-500/20 text-emerald-400' :
                s.dbStatus === 'slow'  ? 'bg-amber-400/20   text-amber-400'   :
                                         'bg-red-500/20     text-red-400'
              }`}>
                {s.dbStatus.toUpperCase()}
              </span>
            </div>
            <p className="text-[10px] font-bold text-white/25">
              Latenza ping · soglia OK: &lt;200ms · slow: &lt;500ms
            </p>
          </div>
        </Card>

        {/* CARD 5 — Error Stream */}
        <Card
          label="Error Stream 24h"
          color={s.errorRate24h > 50 ? 'red' : s.errorRate24h > 20 ? 'yellow' : 'neutral'}
          href="/admin/sicurezza"
        >
          <div className="space-y-2">
            <div className="flex items-end justify-between">
              <span className={`text-3xl font-black ${
                s.errorRate24h > 50 ? 'text-red-400' :
                s.errorRate24h > 20 ? 'text-amber-400' : 'text-white'
              }`}>
                {s.errorRate24h}%
              </span>
              <span className="text-xs font-bold text-white/30">fail rate</span>
            </div>
            <div className="flex justify-between border-t border-white/[0.06] pt-2 text-xs font-bold">
              <span className="text-red-400">{s.failedLogins24h} falliti</span>
              <span className="text-white/30">/</span>
              <span className="text-white/50">{s.totalLogins24h} totali</span>
            </div>
          </div>
        </Card>

        {/* CARD 6 — Admin Actions Live */}
        <Card label="Admin Actions Live" color="neutral" href="/admin/log">
          <div className="space-y-1.5">
            {s.recentAdminActions.length === 0 ? (
              <p className="text-xs font-bold text-white/20">Nessuna azione recente</p>
            ) : (
              s.recentAdminActions.slice(0, 4).map((a, i) => (
                <div key={i} className="flex items-center justify-between gap-2">
                  <span className="truncate text-[11px] font-black text-white/70">
                    {ACTION_LABELS[a.action] ?? a.action}
                  </span>
                  <span className="shrink-0 font-mono text-[10px] text-white/25">
                    {new Date(a.createdAt).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* CARD 7 — Alert Queue */}
        <Card
          label="Alert Queue"
          color={s.alertsCritical > 0 ? 'red' : s.alertsHigh > 0 ? 'yellow' : s.alertsTotal > 0 ? 'yellow' : 'neutral'}
          href="/admin/alert"
          pulse={s.alertsCritical > 0}
        >
          <div className="space-y-2">
            <div className="flex items-end justify-between">
              <span className="text-3xl font-black text-white">{s.alertsTotal}</span>
              <span className="text-xs font-bold text-white/30">alert aperti</span>
            </div>
            <div className="flex gap-2">
              {s.alertsCritical > 0 && (
                <span className="rounded-full bg-red-500/20 px-2 py-0.5 text-[10px] font-black text-red-400">
                  {s.alertsCritical} critici
                </span>
              )}
              {s.alertsHigh > 0 && (
                <span className="rounded-full bg-orange-500/20 px-2 py-0.5 text-[10px] font-black text-orange-400">
                  {s.alertsHigh} alti
                </span>
              )}
              {s.alertsMedium > 0 && (
                <span className="rounded-full bg-amber-400/20 px-2 py-0.5 text-[10px] font-black text-amber-400">
                  {s.alertsMedium} medi
                </span>
              )}
              {s.alertsTotal === 0 && (
                <span className="text-xs font-bold text-emerald-400">✓ Nessun alert</span>
              )}
            </div>
            {s.oldestAlertMinutes !== null && (
              <p className="text-[10px] font-bold text-white/25">
                Più vecchio: {fmtAge(s.oldestAlertMinutes)} fa
              </p>
            )}
          </div>
        </Card>

        {/* CARD 8 — System Load */}
        <Card label="System Load" color={memColor} href="/admin/system-health">
          <div className="space-y-2">
            <div>
              <div className="mb-1 flex items-center justify-between text-xs font-bold">
                <span className="text-white/40">Heap memory</span>
                <span className={STATUS_VALUE[memColor]}>{s.memPercent}%</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    memColor === 'red' ? 'bg-red-500' :
                    memColor === 'yellow' ? 'bg-amber-400' : 'bg-emerald-500'
                  }`}
                  style={{ width: `${Math.min(100, s.memPercent)}%` }}
                />
              </div>
            </div>
            <div className="flex justify-between text-xs font-bold">
              <span className="text-white/40">{s.memUsedMB} MB usati</span>
              <span className="text-white/40">Uptime: {fmtUptime(s.uptimeSec)}</span>
            </div>
          </div>
        </Card>

        {/* CARD 9 — Degradation Risk Score */}
        <Card label="Degradation Risk Score" color={degradeColor} href="/admin/intelligence" pulse={s.degradationScore > 60}>
          <div className="flex items-center gap-4">
            <ScoreRing score={s.degradationScore} color={degradeColor} />
            <div className="min-w-0 flex-1">
              <p className={`text-sm font-black ${STATUS_VALUE[degradeColor]}`}>
                {s.degradationScore === 0 ? 'Nessun rischio' :
                 s.degradationScore  < 30 ? 'Rischio basso' :
                 s.degradationScore  < 60 ? 'Rischio medio' : 'RISCHIO ALTO'}
              </p>
              {s.riskFactors.length > 0 ? (
                <ul className="mt-1 space-y-0.5">
                  {s.riskFactors.slice(0, 2).map((f, i) => (
                    <li key={i} className="truncate text-[10px] font-bold text-white/30">→ {f}</li>
                  ))}
                  {s.riskFactors.length > 2 && (
                    <li className="text-[10px] font-bold text-white/20">
                      +{s.riskFactors.length - 2} altri fattori
                    </li>
                  )}
                </ul>
              ) : (
                <p className="mt-1 text-[10px] font-bold text-white/25">Sistema stabile</p>
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
