'use client'

import Link from 'next/link'
import { signOut, useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

const roleLabel: Record<string, string> = {
  super_admin: 'Super Admin',
  gestore_locale: 'Gestore locale',
  manager: 'Manager',
  staff: 'Staff',
  cliente: 'Cliente',
}

export default function ProfiloPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login')
  }, [status, router])

  if (status === 'loading' || !session) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black">
        <div className="h-8 w-8 animate-pulse rounded-full bg-white/20" />
      </main>
    )
  }

  const u = session.user as {
    name?: string
    email?: string
    firstName?: string
    lastName?: string
    role?: string
  }

  const firstName = u.firstName || u.name?.split(' ')[0] || ''
  const displayName = u.firstName
    ? [u.firstName, (u as { lastName?: string }).lastName].filter(Boolean).join(' ')
    : (u.name ?? '')

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-screen-xl px-4 sm:px-6">
        <header className="flex items-center justify-between gap-3 py-5">
          <Link href="/">
            <img src="/arrivo_logo.svg" alt="Arrivo" className="h-10 w-auto" />
          </Link>
          <button
            className="rounded-full border border-white/20 px-4 py-2 text-sm font-black text-white/80 transition hover:border-white/50 hover:text-white"
            onClick={() => signOut({ callbackUrl: '/' })}
            type="button"
          >
            Esci
          </button>
        </header>
      </div>

      <div className="mx-auto max-w-screen-xl px-4 py-10 sm:px-6">
        <div className="max-w-md">
          <p className="text-xs font-black uppercase text-[#ff6b00]">Il tuo profilo</p>
          <h1 className="mt-2 text-3xl font-black">
            {firstName ? `Ciao, ${firstName}` : 'Il tuo account'}
          </h1>

          <div className="mt-8 space-y-0 rounded-[1.5rem] border border-white/8 bg-white/[0.04] overflow-hidden">
            <div className="px-6 py-5">
              <p className="text-xs font-black uppercase text-white/35">Nome</p>
              <p className="mt-1 text-sm font-bold">{displayName || '—'}</p>
            </div>
            <div className="border-t border-white/8 px-6 py-5">
              <p className="text-xs font-black uppercase text-white/35">Email</p>
              <p className="mt-1 text-sm font-bold">{u.email}</p>
            </div>
            <div className="border-t border-white/8 px-6 py-5">
              <p className="text-xs font-black uppercase text-white/35">Ruolo</p>
              <span className="mt-1 inline-block rounded-full bg-[#ff6b00]/15 px-3 py-1 text-xs font-black text-[#ff6b00]">
                {roleLabel[u.role ?? ''] ?? u.role ?? '—'}
              </span>
            </div>
          </div>

          <div className="mt-4 rounded-[1.5rem] border border-white/6 bg-white/[0.02] px-6 py-5">
            <p className="text-xs font-black uppercase text-white/25">In arrivo</p>
            <p className="mt-2 text-sm font-bold text-white/35">
              Storico prenotazioni, preferenze e impostazioni account — disponibili presto.
            </p>
          </div>

          <button
            className="mt-6 h-12 w-full rounded-xl bg-white/[0.06] text-sm font-black text-white/60 transition hover:bg-white/10 hover:text-white"
            onClick={() => signOut({ callbackUrl: '/' })}
            type="button"
          >
            Esci dall'account
          </button>
        </div>
      </div>
    </main>
  )
}
