'use client'

import Link from 'next/link'
import { signIn } from 'next-auth/react'
import { useState } from 'react'

// ── Error code → user-facing copy ────────────────────────────────────────────
// NextAuth sends the raw error code as ?error=<code>.
// We never surface these codes to the user — only human Italian text.
const ERROR_MAP: Record<string, { title: string; body: string; isOAuth?: true }> = {
  OAuthCallbackError: {
    title: 'Accesso non completato',
    body: "L'accesso con Google è stato interrotto o è scaduto. "
        + "Apri una nuova scheda e riprova — oppure torna al login.",
    isOAuth: true,
  },
  Callback: {
    title: 'Errore durante il login',
    body: 'Si è verificato un errore durante il callback OAuth. Riprova tra qualche istante.',
    isOAuth: true,
  },
  OAuthSignin: {
    title: 'Impossibile avviare il login',
    body: 'Non è stato possibile avviare il login con Google. Controlla la connessione e riprova.',
    isOAuth: true,
  },
  AccessDenied: {
    title: 'Accesso negato',
    body: 'Non hai i permessi necessari per accedere a questa risorsa.',
  },
  Verification: {
    title: 'Link non valido',
    body: 'Il link di verifica è scaduto o non è più valido. Richiedi un nuovo link.',
  },
  Default: {
    title: 'Accesso non completato',
    body: "Si è verificato un errore durante l'accesso. Riprova.",
    isOAuth: true,
  },
}

function WarningIcon() {
  return (
    <svg
      className="h-6 w-6 text-amber-500"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export default function AuthErrorClient({ error }: { error?: string }) {
  const { title, body, isOAuth } = ERROR_MAP[error ?? 'Default'] ?? ERROR_MAP.Default
  const [loading, setLoading] = useState(false)

  async function handleRetry() {
    if (loading) return
    setLoading(true)
    // signIn('google') always generates a fresh state cookie — safe retry
    await signIn('google', { callbackUrl: '/' })
    // navigates away on success; loading stays true until redirect
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-black px-4 py-12">
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="mb-8 flex flex-col items-center">
          <Link href="/">
            <img alt="Arrivo" className="h-10 w-auto" src="/arrivo_logo.svg" />
          </Link>
          <p className="mt-1 text-xs font-bold uppercase text-white/45">
            Prenota · Ordina · Arriva
          </p>
        </div>

        <div className="rounded-[2rem] bg-white p-6 text-black shadow-[0_24px_70px_rgba(0,0,0,0.5)]">

          {/* Icon */}
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50">
            <WarningIcon />
          </div>

          <h1 className="text-2xl font-black">{title}</h1>
          <p className="mt-2 text-sm font-bold text-black/55">{body}</p>

          <div className="mt-6 flex flex-col gap-3">

            {/* Only show retry button for OAuth errors */}
            {isOAuth && (
              <button
                className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#ff6b00] text-sm font-black text-white transition hover:bg-[#e05e00] disabled:opacity-60"
                disabled={loading}
                onClick={handleRetry}
                type="button"
              >
                {loading ? 'Reindirizzamento…' : '↩ Riprova con Google'}
              </button>
            )}

            <Link
              className="flex h-12 w-full items-center justify-center rounded-xl border border-black/10 text-sm font-black text-black/70 transition hover:bg-black/[0.04]"
              href="/login"
            >
              Torna al login
            </Link>
          </div>
        </div>

      </div>
    </main>
  )
}
