'use client'

import Link from 'next/link'
import { signOut, useSession } from 'next-auth/react'

function PinIcon() {
  return (
    <svg fill="none" height={14} stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" width={14} xmlns="http://www.w3.org/2000/svg">
      <path d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export default function HeaderPublico() {
  const { data: session, status } = useSession()
  const role      = (session?.user as { role?: string }      | undefined)?.role
  const firstName = (session?.user as { firstName?: string } | undefined)?.firstName
  const lastName  = (session?.user as { lastName?: string }  | undefined)?.lastName
  const fullName  = [firstName, lastName].filter(Boolean).join(' ').trim()
  const greeting  = fullName || session?.user?.name || session?.user?.email?.split('@')[0] || 'Account'

  return (
    <div className="flex shrink-0 items-center gap-2">
      <button
        className="hidden items-center gap-1.5 rounded-full border border-white/20 px-3 py-2 text-sm font-black text-white/60 sm:flex"
        disabled
        title="Funzione disponibile a breve"
        type="button"
      >
        <PinIcon />
        Scegli luogo
      </button>

      {status === 'loading' ? (
        <div className="h-9 w-24 animate-pulse rounded-full bg-white/10" />
      ) : !session ? (
        <>
          <Link
            className="rounded-full border border-white/20 px-4 py-2 text-sm font-black text-white/80 transition hover:border-white/50 hover:text-white"
            href="/login"
          >
            Accedi
          </Link>
          <Link
            className="rounded-full bg-[#ff6b00] px-4 py-2 text-sm font-black text-black transition hover:bg-[#e05e00]"
            href="/registrati"
          >
            Registrati
          </Link>
        </>
      ) : (
        <>
          <span className="hidden text-sm font-black text-white/50 sm:block">
            👋 Ciao{greeting ? ` ${greeting}` : ''}
          </span>

          {role === 'super_admin' ? (
            <Link
              className="rounded-full border border-white/20 px-4 py-2 text-sm font-black text-white/80 transition hover:border-white/50 hover:text-white"
              href="/admin"
            >
              Admin
            </Link>
          ) : role === 'gestore_locale' ? (
            <Link
              className="rounded-full border border-white/20 px-4 py-2 text-sm font-black text-white/80 transition hover:border-white/50 hover:text-white"
              href="/ristorante"
            >
              Il mio locale
            </Link>
          ) : (
            <Link
              className="rounded-full border border-white/20 px-4 py-2 text-sm font-black text-white/80 transition hover:border-white/50 hover:text-white"
              href="/profilo"
            >
              Profilo
            </Link>
          )}

          <button
            className="rounded-full bg-[#ff6b00] px-4 py-2 text-sm font-black text-black transition hover:bg-[#e05e00]"
            onClick={() => signOut({ callbackUrl: '/' })}
            type="button"
          >
            Esci
          </button>
        </>
      )}
    </div>
  )
}
