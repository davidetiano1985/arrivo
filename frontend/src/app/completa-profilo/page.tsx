'use client'

/**
 * /completa-profilo
 *
 * Standalone page for users who signed up via Google but didn't provide
 * firstName/lastName (profileIncomplete = true).
 *
 * Access rules (enforced in middleware BEFORE this page renders):
 *   • Not authenticated  → middleware redirects to /login
 *   • Profile complete   → middleware redirects to /
 *   • super_admin        → middleware exempts; page renders (edge-case guard)
 *
 * After save:
 *   1. DB updated (firstName, lastName, profileIncomplete=false)
 *   2. JWT refreshed via session.update() so the new values propagate immediately
 *   3. Router replaces current history entry with / (no back-button loop)
 */

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useState, useTransition } from 'react'

import { completaProfiloGoogle } from './actions'

function isStaleAction(err: unknown): boolean {
  const msg = ((err as Error)?.message ?? '').toLowerCase()
  return msg.includes('failed to find server action') || msg.includes('older or newer deployment')
}

export default function CompletaProfiloPage() {
  const { update } = useSession()
  const router = useRouter()

  const [firstName, setFirstName] = useState('')
  const [lastName,  setLastName]  = useState('')
  const [error,     setError]     = useState('')
  const [stale,     setStale]     = useState(false)
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setStale(false)
    startTransition(async () => {
      try {
        const result = await completaProfiloGoogle(firstName, lastName)
        if (result.error) { setError(result.error); return }
        // Refresh JWT → profileIncomplete becomes false in the session,
        // then navigate home. router.replace prevents back-button loop.
        await update()
        router.replace('/')
      } catch (err) {
        if (isStaleAction(err)) { setStale(true); return }
        setError('Errore imprevisto. Riprova.')
      }
    })
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-black px-4">
      <div className="w-full max-w-md">

        {/* Logo */}
        <Link href="/">
          <img src="/arrivo_logo.svg" alt="Arrivo" className="mb-8 h-7 w-auto" />
        </Link>

        <h1 className="text-3xl font-black text-white">Completa il tuo profilo</h1>
        <p className="mt-2 text-sm font-bold text-white/50">
          Inserisci nome e cognome per accedere ad Arrivo.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">

          {/* Nome */}
          <div>
            <label
              className="mb-1.5 block text-xs font-black uppercase tracking-widest text-white/45"
              htmlFor="firstName"
            >
              Nome *
            </label>
            <input
              autoComplete="given-name"
              autoFocus
              className="h-11 w-full rounded-xl border border-white/15 bg-white/6 px-4 text-sm font-bold text-white outline-none transition placeholder:text-white/25 focus:border-[#ff6b00] focus:ring-2 focus:ring-[#ff6b00]/20 disabled:opacity-60"
              disabled={isPending}
              id="firstName"
              maxLength={50}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Mario"
              required
              type="text"
              value={firstName}
            />
          </div>

          {/* Cognome */}
          <div>
            <label
              className="mb-1.5 block text-xs font-black uppercase tracking-widest text-white/45"
              htmlFor="lastName"
            >
              Cognome *
            </label>
            <input
              autoComplete="family-name"
              className="h-11 w-full rounded-xl border border-white/15 bg-white/6 px-4 text-sm font-bold text-white outline-none transition placeholder:text-white/25 focus:border-[#ff6b00] focus:ring-2 focus:ring-[#ff6b00]/20 disabled:opacity-60"
              disabled={isPending}
              id="lastName"
              maxLength={50}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Rossi"
              required
              type="text"
              value={lastName}
            />
          </div>

          {/* App aggiornata — ricarica richiesta */}
          {stale && (
            <div className="rounded-xl bg-amber-950/40 px-4 py-3">
              <p className="text-xs font-black text-amber-400">
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
            <p className="rounded-xl bg-red-950/50 px-4 py-3 text-xs font-black text-red-400">
              {error}
            </p>
          )}

          {/* Submit */}
          <button
            className="mt-2 h-11 w-full rounded-xl bg-[#ff6b00] text-sm font-black text-white transition hover:bg-[#e55f00] disabled:opacity-60"
            disabled={isPending}
            type="submit"
          >
            {isPending ? 'Salvataggio…' : 'Salva e continua →'}
          </button>

        </form>
      </div>
    </main>
  )
}
