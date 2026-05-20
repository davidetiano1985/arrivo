'use client'

import { useSession } from 'next-auth/react'
import { useState, useTransition } from 'react'

import { completaProfiloGoogle } from '@/app/completa-profilo/actions'

function isStaleAction(err: unknown): boolean {
  const msg = ((err as Error)?.message ?? '').toLowerCase()
  return msg.includes('failed to find server action') || msg.includes('older or newer deployment')
}

export default function CompleteProfileGuard() {
  const { data: session, update } = useSession()
  const [firstName, setFirstName] = useState('')
  const [lastName,  setLastName]  = useState('')
  const [error,     setError]     = useState('')
  const [stale,     setStale]     = useState(false)
  const [isPending, startTransition] = useTransition()

  // Read from session — populated by the session callback in auth.ts
  const incomplete =
    session != null &&
    (session.user as { profileIncomplete?: boolean })?.profileIncomplete === true

  if (!incomplete) return null

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setStale(false)
    startTransition(async () => {
      try {
        const result = await completaProfiloGoogle(firstName, lastName)
        if (result.error) { setError(result.error); return }
        // Refresh JWT so profileIncomplete becomes false in the session.
        // The jwt 'update' trigger re-reads from DB → returns false.
        await update()
      } catch (err) {
        if (isStaleAction(err)) { setStale(true); return }
        setError('Errore imprevisto. Riprova.')
      }
    })
  }

  return (
    // Overlay non chiudibile — pointer-events: all + no onClick to dismiss
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="mx-4 w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl">

        {/* Logo */}
        <img src="/arrivo_logo.svg" alt="Arrivo" className="mb-6 h-7 w-auto" />

        <h2 className="text-2xl font-black text-black">Completa il tuo profilo</h2>
        <p className="mt-2 text-sm font-bold text-black/55">
          Per accedere devi inserire nome e cognome.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {/* Nome */}
          <div>
            <label className="mb-1.5 block text-xs font-black uppercase tracking-widest text-black/45">
              Nome *
            </label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Mario"
              maxLength={50}
              required
              autoFocus
              disabled={isPending}
              className="h-11 w-full rounded-xl border border-black/15 bg-white px-4 text-sm font-bold text-black outline-none transition focus:border-[#ff6b00] focus:ring-2 focus:ring-[#ff6b00]/20 disabled:opacity-60"
            />
          </div>

          {/* Cognome */}
          <div>
            <label className="mb-1.5 block text-xs font-black uppercase tracking-widest text-black/45">
              Cognome *
            </label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Rossi"
              maxLength={50}
              required
              disabled={isPending}
              className="h-11 w-full rounded-xl border border-black/15 bg-white px-4 text-sm font-bold text-black outline-none transition focus:border-[#ff6b00] focus:ring-2 focus:ring-[#ff6b00]/20 disabled:opacity-60"
            />
          </div>

          {/* App aggiornata — ricarica richiesta */}
          {stale && (
            <div className="rounded-xl bg-amber-50 px-4 py-3">
              <p className="text-xs font-black text-amber-700">
                L'app è stata aggiornata. Ricarica la pagina e riprova.
              </p>
              <button
                className="mt-1.5 text-xs font-black text-[#ff6b00] hover:underline"
                onClick={() => window.location.reload()}
                type="button"
              >
                ↺ Ricarica pagina
              </button>
            </div>
          )}

          {/* Errore */}
          {error && (
            <p className="rounded-xl bg-red-50 px-4 py-3 text-xs font-black text-red-600">
              {error}
            </p>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={isPending}
            className="mt-2 h-11 w-full rounded-xl bg-[#ff6b00] text-sm font-black text-white transition hover:bg-[#e55f00] disabled:opacity-60"
          >
            {isPending ? 'Salvataggio…' : 'Salva e continua →'}
          </button>
        </form>
      </div>
    </div>
  )
}
