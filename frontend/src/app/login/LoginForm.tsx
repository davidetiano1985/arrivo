'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { signIn, getSession } from 'next-auth/react'
import { useState } from 'react'

import GoogleSignInButton from '@/components/GoogleSignInButton'

// Maps NextAuth error codes → Italian user-friendly messages
const OAUTH_ERROR_MESSAGES: Record<string, string> = {
  OAuthAccountNotLinked:
    'Questa email è già registrata con password. Usa email e password per accedere.',
  OAuthCallbackError:
    'Si è verificato un errore con Google. Riprova.',
  OAuthSignin:
    'Impossibile avviare il login con Google. Riprova.',
  Callback:
    'Errore durante il login. Riprova tra qualche istante.',
  AccessDenied:
    'Accesso negato.',
  Verification:
    'Link di verifica scaduto o non valido.',
}

// Destination after login based on role
const ROLE_REDIRECT: Record<string, string> = {
  super_admin:    '/admin',
  gestore_locale: '/ristorante',
}

function EyeIcon() {
  return (
    <svg fill="none" height={20} stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" width={20} xmlns="http://www.w3.org/2000/svg">
      <path d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function EyeOffIcon() {
  return (
    <svg fill="none" height={20} stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" width={20} xmlns="http://www.w3.org/2000/svg">
      <path d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export default function LoginForm({
  errorParam,
  callbackUrl,
}: {
  errorParam?: string
  callbackUrl?: string
}) {
  const router = useRouter()
  const [email, setEmail]                 = useState('')
  const [password, setPassword]           = useState('')
  const [errore, setErrore]               = useState('')
  const [caricamento, setCaricamento]     = useState(false)
  const [mostraPassword, setMostraPassword] = useState(false)

  // Error from NextAuth OAuth redirect (e.g. ?error=OAuthAccountNotLinked)
  const oauthError = errorParam
    ? (OAUTH_ERROR_MESSAGES[errorParam] ?? 'Si è verificato un errore. Riprova.')
    : null

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setErrore('')
    setCaricamento(true)

    try {
      const result = await signIn('credentials', {
        email: email.toLowerCase().trim(),
        password,
        redirect: false,
      })

      if (!result || result.error) {
        setErrore('Email o password non corretti.')
        return
      }

      const session = await getSession()
      const role = (session?.user as { role?: string } | undefined)?.role ?? ''
      const dest = ROLE_REDIRECT[role] ?? callbackUrl ?? '/'
      router.push(dest)
      router.refresh()
    } catch {
      setErrore('Errore di rete. Controlla la connessione e riprova.')
    } finally {
      setCaricamento(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-black px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center">
          <Link href="/">
            <img alt="Arrivo" className="h-10 w-auto" src="/arrivo_logo.svg" />
          </Link>
          <p className="mt-1 text-xs font-bold uppercase text-white/45">
            Prenota · Ordina · Arriva
          </p>
        </div>

        <div className="rounded-[2rem] bg-white p-6 text-black shadow-[0_24px_70px_rgba(0,0,0,0.5)]">
          <h1 className="text-2xl font-black">Accedi</h1>
          <p className="mt-1 text-sm font-bold text-black/55">
            Inserisci le tue credenziali per continuare.
          </p>

          {/* OAuth error banner (from NextAuth redirect) */}
          {oauthError && (
            <div className="mt-4 rounded-xl bg-amber-50 border border-amber-200 px-3 py-3 text-sm font-bold text-amber-800">
              {oauthError}
            </div>
          )}

          <form className="mt-6 grid gap-4" onSubmit={handleLogin}>
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
                onChange={(e) => setEmail(e.target.value)}
                placeholder="la-tua@email.com"
                required
                type="email"
                value={email}
              />
            </div>

            <div>
              <label
                className="block text-xs font-black uppercase text-black/45"
                htmlFor="password"
              >
                Password
              </label>
              <div className="relative">
                <input
                  autoComplete="current-password"
                  className="mt-2 h-12 w-full rounded-xl border border-black/10 bg-white px-3 pr-11 text-sm font-bold outline-none placeholder:text-black/35 focus:border-[#ff6b00]"
                  id="password"
                  name="password"
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  type={mostraPassword ? 'text' : 'password'}
                  value={password}
                />
                <button
                  aria-label={mostraPassword ? 'Nascondi password' : 'Mostra password'}
                  className="absolute right-3 top-1/2 mt-1 -translate-y-1/2 text-black/35 hover:text-black/70"
                  onClick={() => setMostraPassword((v) => !v)}
                  tabIndex={-1}
                  type="button"
                >
                  {mostraPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>

            {/* Credentials error */}
            {errore && (
              <p className="rounded-xl bg-red-50 px-3 py-2 text-sm font-bold text-red-600">
                {errore}
              </p>
            )}

            <button
              className="h-12 w-full rounded-xl bg-[#ff6b00] text-sm font-black text-white disabled:opacity-60"
              disabled={caricamento}
              type="submit"
            >
              {caricamento ? 'Accesso in corso…' : 'Accedi'}
            </button>
          </form>

          <p className="mt-5 text-center text-sm font-bold text-black/55">
            Non hai un account?{' '}
            <Link className="font-black text-[#ff6b00]" href="/registrati">
              Registrati
            </Link>
          </p>

          <div className="relative mt-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-black/10" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white px-3 text-xs font-bold text-black/40">
                oppure
              </span>
            </div>
          </div>

          <GoogleSignInButton callbackUrl={callbackUrl ?? '/'} label="Accedi con Google" />
        </div>
      </div>
    </main>
  )
}
