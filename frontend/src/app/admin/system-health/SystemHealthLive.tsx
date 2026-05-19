'use client'

import { useEffect, useRef, useState } from 'react'

type HealthData = {
  dbStatus:   string
  dbLatency:  number
  memUsedMB:  number
  memTotalMB: number
  memPercent: number
  uptimeSec:  number
  errorRate:  number
  failed24h:  number
  total24h:   number
}

function StatusBadge({ status }: { status: 'ok' | 'slow' | 'error' | string }) {
  const map = {
    ok:    { label: 'OK',    cls: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
    slow:  { label: 'LENTO', cls: 'bg-amber-400/20 text-amber-400 border-amber-400/30' },
    error: { label: 'ERRORE',cls: 'bg-red-500/20 text-red-400 border-red-500/30' },
  }
  const s = map[status as 'ok' | 'slow' | 'error'] ?? map.ok
  return (
    <span className={`rounded-full border px-2.5 py-1 text-[10px] font-black ${s.cls}`}>
      {s.label}
    </span>
  )
}

function ProgressBar({ percent, color }: { percent: number; color: 'green' | 'yellow' | 'red' }) {
  const map = { green: 'bg-emerald-500', yellow: 'bg-amber-400', red: 'bg-red-500' }
  return (
    <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
      <div
        className={`h-full rounded-full transition-all duration-700 ${map[color]}`}
        style={{ width: `${Math.min(100, percent)}%` }}
      />
    </div>
  )
}

function uptimeStr(s: number) {
  const d = Math.floor(s / 86400)
  const h = Math.floor((s % 86400) / 3600)
  const m = Math.floor((s % 3600) / 60)
  if (d > 0) return `${d}g ${h}h ${m}m`
  if (h > 0) return `${h}h ${m}m`
  return `${m}m ${s % 60}s`
}

export default function SystemHealthLive({ initialData }: { initialData: HealthData }) {
  const [data,       setData]       = useState<HealthData>(initialData)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    async function poll() {
      try {
        const res = await fetch('/api/admin/health', { cache: 'no-store' })
        if (res.ok) {
          const h = await res.json()
          setData({
            dbStatus:   h.db.status,
            dbLatency:  h.db.latency,
            memUsedMB:  h.memory.used,
            memTotalMB: h.memory.total,
            memPercent: h.memory.percent,
            uptimeSec:  h.uptime,
            errorRate:  h.errorRate,
            failed24h:  h.failed24h,
            total24h:   h.total24h,
          })
          setLastUpdate(new Date())
        }
      } catch { /* stale */ }
    }

    timerRef.current = setInterval(poll, 60_000)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [])

  const memColor   = data.memPercent > 80 ? 'red' : data.memPercent > 60 ? 'yellow' : 'green'
  const errorColor = data.errorRate  > 30 ? 'red' : data.errorRate  > 10 ? 'yellow' : 'green'

  return (
    <div className="space-y-4">
      <p className="text-[10px] font-bold text-white/25">
        Live (polling 60s) · Ultimo aggiornamento: {lastUpdate.toLocaleTimeString('it-IT')}
      </p>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

        {/* DB */}
        <div className={`rounded-2xl border p-5 ${
          data.dbStatus === 'error' ? 'border-red-500/30 bg-red-500/[0.05]'
          : data.dbStatus === 'slow' ? 'border-amber-400/30 bg-amber-400/[0.05]'
          : 'border-white/[0.07] bg-white/[0.04]'
        }`}>
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-black uppercase tracking-widest text-white/30">Database</p>
            <StatusBadge status={data.dbStatus} />
          </div>
          <p className="mt-3 text-2xl font-black text-white">
            {data.dbLatency >= 0 ? `${data.dbLatency}ms` : '—'}
          </p>
          <p className="mt-0.5 text-xs font-bold text-white/30">latenza query</p>
        </div>

        {/* Memory */}
        <div className="rounded-2xl border border-white/[0.07] bg-white/[0.04] p-5">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-black uppercase tracking-widest text-white/30">Memoria Heap</p>
            <StatusBadge status={data.memPercent > 80 ? 'error' : data.memPercent > 60 ? 'slow' : 'ok'} />
          </div>
          <p className="mt-3 text-2xl font-black text-white">{data.memUsedMB} MB</p>
          <p className="mt-0.5 text-xs font-bold text-white/30">di {data.memTotalMB} MB ({data.memPercent}%)</p>
          <ProgressBar percent={data.memPercent} color={memColor} />
        </div>

        {/* Uptime */}
        <div className="rounded-2xl border border-white/[0.07] bg-white/[0.04] p-5">
          <p className="text-[10px] font-black uppercase tracking-widest text-white/30">Uptime</p>
          <p className="mt-3 text-2xl font-black text-emerald-400">{uptimeStr(data.uptimeSec)}</p>
          <p className="mt-0.5 text-xs font-bold text-white/30">processo Node.js attivo</p>
        </div>

        {/* Error rate */}
        <div className="rounded-2xl border border-white/[0.07] bg-white/[0.04] p-5">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-black uppercase tracking-widest text-white/30">Tasso Errori 24h</p>
            <StatusBadge status={data.errorRate > 30 ? 'error' : data.errorRate > 10 ? 'slow' : 'ok'} />
          </div>
          <p className={`mt-3 text-2xl font-black ${
            data.errorRate > 30 ? 'text-red-400' : data.errorRate > 10 ? 'text-amber-400' : 'text-emerald-400'
          }`}>
            {data.errorRate}%
          </p>
          <p className="mt-0.5 text-xs font-bold text-white/30">
            {data.failed24h} falliti / {data.total24h} totali
          </p>
          <ProgressBar percent={data.errorRate} color={errorColor} />
        </div>

        {/* Email (informational — no live check yet) */}
        <div className="rounded-2xl border border-white/[0.07] bg-white/[0.04] p-5">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-black uppercase tracking-widest text-white/30">Email System</p>
            <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-black text-white/30">
              SMTP
            </span>
          </div>
          <p className="mt-3 text-2xl font-black text-white/40">Nodemailer</p>
          <p className="mt-0.5 text-xs font-bold text-white/25">Queue: non configurata · Sync mode</p>
          <p className="mt-2 text-[10px] font-bold text-amber-400/60">
            ⚠ Consigliato: BullMQ + Redis per burst handling
          </p>
        </div>

        {/* Queue */}
        <div className="rounded-2xl border border-white/[0.07] bg-white/[0.04] p-5">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-black uppercase tracking-widest text-white/30">Task Queue</p>
            <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-black text-white/30">
              N/A
            </span>
          </div>
          <p className="mt-3 text-2xl font-black text-white/40">Non attiva</p>
          <p className="mt-0.5 text-xs font-bold text-white/25">Redis + BullMQ non configurati</p>
          <p className="mt-2 text-[10px] font-bold text-amber-400/60">
            ⚠ Necessaria a 50k+ utenti
          </p>
        </div>
      </div>
    </div>
  )
}
