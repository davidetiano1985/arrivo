'use client'

import { useState, useTransition } from 'react'

import { approvaRichiesta, rifiutaRichiesta } from './actions'

export default function RichiestaActions({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition()
  const [rifiuto, setRifiuto] = useState(false)
  const [nota, setNota] = useState('')
  const [esito, setEsito] = useState<'approvata' | 'rifiutata' | null>(null)
  const [errore, setErrore] = useState('')

  if (esito === 'approvata') {
    return (
      <span className="inline-block rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-800">
        Approvata ✓
      </span>
    )
  }
  if (esito === 'rifiutata') {
    return (
      <span className="inline-block rounded-full bg-red-100 px-3 py-1 text-xs font-black text-red-700">
        Rifiutata ✓
      </span>
    )
  }

  function handleApprova() {
    setErrore('')
    startTransition(async () => {
      try {
        const res = await approvaRichiesta(id)
        if (res?.error) { setErrore(res.error); return }
        setEsito('approvata')
      } catch {
        setErrore('Errore imprevisto.')
      }
    })
  }

  function handleRifiuta() {
    if (!rifiuto) { setRifiuto(true); return }
    setErrore('')
    startTransition(async () => {
      try {
        const res = await rifiutaRichiesta(id, nota || undefined)
        if (res?.error) { setErrore(res.error); return }
        setEsito('rifiutata')
      } catch {
        setErrore('Errore imprevisto.')
      }
    })
  }

  return (
    <div className="flex flex-col gap-2">
      {errore && (
        <p className="text-xs font-bold text-red-600">{errore}</p>
      )}

      {rifiuto && (
        <input
          className="h-8 w-full rounded-lg border border-black/15 bg-white px-2 text-xs font-bold outline-none placeholder:text-black/30 focus:border-[#ff6b00]"
          onChange={(e) => setNota(e.target.value)}
          placeholder="Nota (opzionale)"
          type="text"
          value={nota}
        />
      )}

      <div className="flex gap-2">
        <button
          className="rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-black text-white transition hover:bg-emerald-600 disabled:opacity-50"
          disabled={isPending}
          onClick={handleApprova}
          type="button"
        >
          {isPending ? '…' : 'Approva'}
        </button>
        <button
          className="rounded-lg bg-black/10 px-3 py-1.5 text-xs font-black text-black/70 transition hover:bg-red-100 hover:text-red-700 disabled:opacity-50"
          disabled={isPending}
          onClick={handleRifiuta}
          type="button"
        >
          {isPending ? '…' : rifiuto ? 'Conferma rifiuto' : 'Rifiuta'}
        </button>
        {rifiuto && (
          <button
            className="text-xs font-bold text-black/40 hover:text-black/70"
            onClick={() => { setRifiuto(false); setNota('') }}
            type="button"
          >
            Annulla
          </button>
        )}
      </div>
    </div>
  )
}
