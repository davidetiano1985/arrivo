'use client'

import Link from 'next/link'
import { useState, useTransition } from 'react'

import { registraCliente } from './actions'

function EyeIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}

function EyeOffIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  )
}

export default function RegistrazioneForm() {
  const [errore, setErrore] = useState('')
  const [isPending, startTransition] = useTransition()
  const [mostraPassword, setMostraPassword] = useState(false)
  const [mostraConferma, setMostraConferma] = useState(false)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setErrore('')
    const formData = new FormData(e.currentTarget)
    startTransition(async () => {
      try {
        const result = await registraCliente(formData)
        if (result?.error) setErrore(result.error)
      } catch (err) {
        // Re-throw Next.js internal errors (redirect, notFound, etc.) so the
        // router can handle them. Without this, redirect() in Server Actions
        // is silently caught and the navigation never happens.
        if ((err as { digest?: string })?.digest?.startsWith('NEXT_REDIRECT')) throw err
        setErrore('Qualcosa è andato storto. Aggiorna la pagina e riprova.')
      }
    })
  }

  return (
    <form className="mt-6 grid gap-4" onSubmit={handleSubmit}>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label
            className="block text-xs font-black uppercase text-black/45"
            htmlFor="nome"
          >
            Nome
          </label>
          <input
            autoComplete="given-name"
            className="mt-2 h-12 w-full rounded-xl border border-black/10 bg-white px-3 text-sm font-bold outline-none placeholder:text-black/35 focus:border-[#ff6b00]"
            id="nome"
            name="nome"
            placeholder="Mario"
            required
            type="text"
          />
        </div>

        <div>
          <label
            className="block text-xs font-black uppercase text-black/45"
            htmlFor="cognome"
          >
            Cognome
          </label>
          <input
            autoComplete="family-name"
            className="mt-2 h-12 w-full rounded-xl border border-black/10 bg-white px-3 text-sm font-bold outline-none placeholder:text-black/35 focus:border-[#ff6b00]"
            id="cognome"
            name="cognome"
            placeholder="Rossi"
            required
            type="text"
          />
        </div>
      </div>

      <div>
        <label
          className="block text-xs font-black uppercase text-black/45"
          htmlFor="email"
        >
          Email
        </label>
        <input
          autoComplete="email"
          className="mt-2 h-12 w-full rounded-xl border border-black/10 bg-white px-3 text-sm font-bold outline-none placeholder:text-black/35 focus:border-[#ff6b00]"
          id="email"
          name="email"
          placeholder="la-tua@email.com"
          required
          type="email"
        />
      </div>

      <div>
        <label
          className="block text-xs font-black uppercase text-black/45"
          htmlFor="password"
        >
          Password
        </label>
        <div className="relative mt-2">
          <input
            autoComplete="new-password"
            className="h-12 w-full rounded-xl border border-black/10 bg-white px-3 pr-11 text-sm font-bold outline-none placeholder:text-black/35 focus:border-[#ff6b00]"
            id="password"
            name="password"
            placeholder="••••••••"
            required
            type={mostraPassword ? 'text' : 'password'}
          />
          <button
            aria-label={mostraPassword ? 'Nascondi password' : 'Mostra password'}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-black/35 hover:text-black/60"
            onClick={() => setMostraPassword((v) => !v)}
            tabIndex={-1}
            type="button"
          >
            {mostraPassword ? <EyeOffIcon /> : <EyeIcon />}
          </button>
        </div>
      </div>

      <div>
        <label
          className="block text-xs font-black uppercase text-black/45"
          htmlFor="conferma-password"
        >
          Conferma password
        </label>
        <div className="relative mt-2">
          <input
            autoComplete="new-password"
            className="h-12 w-full rounded-xl border border-black/10 bg-white px-3 pr-11 text-sm font-bold outline-none placeholder:text-black/35 focus:border-[#ff6b00]"
            id="conferma-password"
            name="conferma-password"
            placeholder="••••••••"
            required
            type={mostraConferma ? 'text' : 'password'}
          />
          <button
            aria-label={mostraConferma ? 'Nascondi conferma password' : 'Mostra conferma password'}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-black/35 hover:text-black/60"
            onClick={() => setMostraConferma((v) => !v)}
            tabIndex={-1}
            type="button"
          >
            {mostraConferma ? <EyeOffIcon /> : <EyeIcon />}
          </button>
        </div>
      </div>

      {errore && (
        <div className="rounded-xl bg-red-50 px-3 py-2.5">
          <p className="text-sm font-bold text-red-600">{errore}</p>
          {errore.includes('già registrat') && (
            <Link
              className="mt-1 inline-block text-xs font-black text-[#ff6b00] hover:underline"
              href="/login"
            >
              → Vai al login
            </Link>
          )}
        </div>
      )}

      <button
        className="h-12 w-full rounded-xl bg-[#ff6b00] text-sm font-black text-white disabled:opacity-60"
        disabled={isPending}
        type="submit"
      >
        {isPending ? 'Creazione account…' : 'Crea account'}
      </button>

      <p className="text-center text-xs font-bold text-black/45">
        Riceverai un link di verifica alla tua email
      </p>
    </form>
  )
}
