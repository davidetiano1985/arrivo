'use client'

import { useState, useTransition } from 'react'

import { risolviAlert, creaAlert } from './actions'
import { SEV_MAP, TYPE_MAP } from './constants'

type StoredAlert = {
  id:          string
  createdAt:   string
  updatedAt:   string
  type:        string
  severity:    string
  title:       string
  description: string | null
  resolved:    boolean
  resolvedAt:  string | null
  resolvedBy:  string | null
  metadata:    unknown
}

function fmt(iso: string) {
  return new Date(iso).toLocaleString('it-IT', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

function AlertRow({ alert, onResolve }: { alert: StoredAlert; onResolve: (id: string) => void }) {
  const sev     = SEV_MAP[alert.severity as keyof typeof SEV_MAP] ?? SEV_MAP.low
  const [busy, startTransition] = useTransition()

  return (
    <div className={`rounded-2xl border ${sev.border} bg-white/[0.03] p-4 transition-opacity ${busy ? 'opacity-50' : ''}`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className={`mt-0.5 shrink-0 rounded-full px-2 py-0.5 text-[10px] font-black ${sev.bg}`}>
            {sev.label}
          </span>
          <div>
            <p className="text-sm font-black text-white">{alert.title}</p>
            {alert.description && (
              <p className="mt-0.5 text-xs font-bold text-white/45">{alert.description}</p>
            )}
            <p className="mt-1 text-[10px] font-bold text-white/25">
              {fmt(alert.createdAt)} · {TYPE_MAP[alert.type] ?? alert.type}
            </p>
          </div>
        </div>

        {!alert.resolved && (
          <button
            disabled={busy}
            onClick={() => startTransition(async () => {
              const res = await risolviAlert(alert.id)
              if (!res.error) onResolve(alert.id)
            })}
            className="shrink-0 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-[10px] font-black text-emerald-400 transition hover:bg-emerald-500/20 disabled:cursor-not-allowed"
          >
            {busy ? 'Risolvo…' : 'Risolto ✓'}
          </button>
        )}

        {alert.resolved && (
          <div className="text-right">
            <span className="rounded-full bg-emerald-500/15 px-2.5 py-1 text-[10px] font-black text-emerald-400">
              Risolto
            </span>
            {alert.resolvedBy && (
              <p className="mt-1 text-[10px] font-bold text-white/25">da {alert.resolvedBy}</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// ── New alert form ────────────────────────────────────────────────────────────

function NewAlertForm({ onCreated }: { onCreated: () => void }) {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [desc,  setDesc]  = useState('')
  const [type,  setType]  = useState('system')
  const [sev,   setSev]   = useState('medium')
  const [err,   setErr]   = useState('')
  const [busy, startTransition] = useTransition()

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2.5 text-xs font-black text-white/60 transition hover:border-[#ff6b00]/40 hover:text-white"
      >
        + Crea alert manuale
      </button>
    )
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 space-y-4">
      <p className="text-sm font-black text-white">Nuovo alert manuale</p>

      {err && <p className="text-xs font-bold text-red-400">{err}</p>}

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-[10px] font-black uppercase text-white/35">Tipo</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full rounded-xl bg-white/5 px-3 py-2 text-sm font-bold text-white outline-none border border-white/10"
          >
            {Object.entries(TYPE_MAP).map(([k, v]) => (
              <option key={k} value={k} className="bg-black">{v}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-[10px] font-black uppercase text-white/35">Severità</label>
          <select
            value={sev}
            onChange={(e) => setSev(e.target.value)}
            className="w-full rounded-xl bg-white/5 px-3 py-2 text-sm font-bold text-white outline-none border border-white/10"
          >
            {Object.entries(SEV_MAP).map(([k, v]) => (
              <option key={k} value={k} className="bg-black">{v.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="mb-1 block text-[10px] font-black uppercase text-white/35">Titolo *</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Titolo dell'alert"
          className="w-full rounded-xl bg-white/5 px-3 py-2 text-sm font-bold text-white placeholder-white/20 outline-none border border-white/10"
        />
      </div>

      <div>
        <label className="mb-1 block text-[10px] font-black uppercase text-white/35">Descrizione</label>
        <textarea
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          rows={2}
          placeholder="Dettagli (opzionale)"
          className="w-full rounded-xl bg-white/5 px-3 py-2 text-sm font-bold text-white placeholder-white/20 outline-none border border-white/10 resize-none"
        />
      </div>

      <div className="flex gap-2">
        <button
          disabled={busy}
          onClick={() => startTransition(async () => {
            setErr('')
            const res = await creaAlert({ type, severity: sev, title, description: desc })
            if (res.error) { setErr(res.error); return }
            setTitle(''); setDesc(''); setOpen(false)
            onCreated()
          })}
          className="rounded-xl bg-[#ff6b00] px-4 py-2 text-xs font-black text-black transition hover:bg-orange-400 disabled:opacity-50"
        >
          {busy ? 'Creo…' : 'Crea alert'}
        </button>
        <button
          onClick={() => setOpen(false)}
          className="rounded-xl border border-white/10 px-4 py-2 text-xs font-black text-white/50 transition hover:text-white"
        >
          Annulla
        </button>
      </div>
    </div>
  )
}

// ── Main export ───────────────────────────────────────────────────────────────

export default function AlertCenterClient({
  activeAlerts,
  resolvedAlerts,
}: {
  activeAlerts:   StoredAlert[]
  resolvedAlerts: StoredAlert[]
}) {
  const [active,   setActive]   = useState(activeAlerts)
  const [resolved, setResolved] = useState(resolvedAlerts)
  const [showResolved, setShowResolved] = useState(false)

  function handleResolve(id: string) {
    const alert = active.find((a) => a.id === id)
    if (alert) {
      setActive((prev) => prev.filter((a) => a.id !== id))
      setResolved((prev) => [
        { ...alert, resolved: true, resolvedAt: new Date().toISOString() },
        ...prev,
      ])
    }
  }

  return (
    <div className="space-y-6">

      {/* Active stored alerts */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <p className="text-xs font-black uppercase tracking-widest text-white/40">
            Alert manuali attivi ({active.length})
          </p>
          <NewAlertForm onCreated={() => {
            // Trigger page refresh via router or just show success
            window.location.reload()
          }} />
        </div>

        {active.length === 0 && (
          <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-8 text-center">
            <p className="text-sm font-bold text-white/25">Nessun alert manuale attivo.</p>
          </div>
        )}

        <div className="space-y-2">
          {active.map((a) => (
            <AlertRow key={a.id} alert={a} onResolve={handleResolve} />
          ))}
        </div>
      </section>

      {/* Resolved archive */}
      {resolved.length > 0 && (
        <section>
          <button
            onClick={() => setShowResolved((v) => !v)}
            className="flex items-center gap-2 text-xs font-black text-white/30 transition hover:text-white/60"
          >
            <svg
              width="12" height="12" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2.5"
              className={`transition-transform ${showResolved ? 'rotate-90' : ''}`}
            >
              <path d="M9 18l6-6-6-6" />
            </svg>
            Archivio risolti ({resolved.length})
          </button>

          {showResolved && (
            <div className="mt-3 space-y-2 opacity-50">
              {resolved.slice(0, 20).map((a) => (
                <AlertRow key={a.id} alert={a} onResolve={() => {}} />
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  )
}
