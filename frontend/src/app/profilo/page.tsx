'use client'

import Link from 'next/link'
import { signOut, useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useTransition } from 'react'

import { aggiornaProfilo, cambiaPassword } from './actions'

const roleLabel: Record<string, string> = {
  super_admin: 'Super Admin',
  gestore_locale: 'Gestore locale',
  manager: 'Manager',
  staff: 'Staff',
  cliente: 'Cliente',
}

export default function ProfiloPage() {
  const { data: session, status, update } = useSession()
  const router = useRouter()

  // Profile edit state
  const [editProfilo, setEditProfilo] = useState(false)
  const [nomeVal, setNomeVal] = useState('')
  const [cognomeVal, setCognomeVal] = useState('')
  const [profiloMsg, setProfiloMsg] = useState<{ ok?: boolean; text: string } | null>(null)
  const [isPendingProfilo, startProfilo] = useTransition()

  // Password change state
  const [editPassword, setEditPassword] = useState(false)
  const [pwAttuale, setPwAttuale] = useState('')
  const [pwNuova, setPwNuova] = useState('')
  const [pwConferma, setPwConferma] = useState('')
  const [passwordMsg, setPasswordMsg] = useState<{ ok?: boolean; text: string } | null>(null)
  const [isPendingPassword, startPassword] = useTransition()

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
    id?: string
    hasPassword?: boolean
  }

  const currentFirstName = u.firstName || u.name?.split(' ')[0] || ''
  const currentLastName = (u as { lastName?: string }).lastName || ''
  const displayName = u.firstName
    ? [u.firstName, currentLastName].filter(Boolean).join(' ')
    : (u.name ?? '')

  function openEditProfilo() {
    setNomeVal(currentFirstName)
    setCognomeVal(currentLastName)
    setProfiloMsg(null)
    setEditProfilo(true)
  }

  function handleSalvaProfilo() {
    setProfiloMsg(null)
    startProfilo(async () => {
      try {
        const res = await aggiornaProfilo(nomeVal, cognomeVal)
        if (res.error) {
          setProfiloMsg({ text: res.error })
        } else {
          await update()
          setProfiloMsg({ ok: true, text: 'Profilo aggiornato.' })
          setEditProfilo(false)
        }
      } catch {
        setProfiloMsg({ text: 'Errore imprevisto. Riprova.' })
      }
    })
  }

  function handleCambiaPassword() {
    setPasswordMsg(null)
    startPassword(async () => {
      try {
        const res = await cambiaPassword(pwAttuale, pwNuova, pwConferma)
        if (res.error) {
          setPasswordMsg({ text: res.error })
        } else {
          setPasswordMsg({ ok: true, text: 'Password aggiornata con successo.' })
          setPwAttuale('')
          setPwNuova('')
          setPwConferma('')
          setEditPassword(false)
        }
      } catch {
        setPasswordMsg({ text: 'Errore imprevisto. Riprova.' })
      }
    })
  }

  return (
    <main className="min-h-screen bg-black text-white">
      {/* Header */}
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
            {currentFirstName ? `Ciao, ${currentFirstName}` : 'Il tuo account'}
          </h1>

          {/* ── Profilo card ── */}
          <section className="mt-8 rounded-[1.5rem] border border-white/8 bg-white/[0.04] overflow-hidden">
            <div className="px-6 py-5 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase text-white/35">Nome</p>
                <p className="mt-1 text-sm font-bold">{displayName || '—'}</p>
              </div>
              {!editProfilo && (
                <button
                  className="shrink-0 rounded-full bg-white/8 px-4 py-1.5 text-xs font-black text-white/60 transition hover:bg-white/14 hover:text-white"
                  onClick={openEditProfilo}
                  type="button"
                >
                  Modifica
                </button>
              )}
            </div>

            {/* Inline edit form */}
            {editProfilo && (
              <div className="border-t border-white/8 px-6 py-5 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-black uppercase text-white/35 mb-1.5">
                      Nome *
                    </label>
                    <input
                      autoComplete="given-name"
                      autoFocus
                      className="h-10 w-full rounded-xl border border-white/12 bg-white/6 px-3 text-sm font-bold text-white outline-none placeholder:text-white/25 focus:border-[#ff6b00] transition"
                      maxLength={50}
                      onChange={(e) => setNomeVal(e.target.value)}
                      placeholder="Nome"
                      type="text"
                      value={nomeVal}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black uppercase text-white/35 mb-1.5">
                      Cognome
                    </label>
                    <input
                      autoComplete="family-name"
                      className="h-10 w-full rounded-xl border border-white/12 bg-white/6 px-3 text-sm font-bold text-white outline-none placeholder:text-white/25 focus:border-[#ff6b00] transition"
                      maxLength={50}
                      onChange={(e) => setCognomeVal(e.target.value)}
                      placeholder="Cognome"
                      type="text"
                      value={cognomeVal}
                    />
                  </div>
                </div>

                {profiloMsg && (
                  <p className={`text-xs font-bold ${profiloMsg.ok ? 'text-emerald-400' : 'text-red-400'}`}>
                    {profiloMsg.text}
                  </p>
                )}

                <div className="flex gap-2 pt-1">
                  <button
                    className="rounded-xl bg-[#ff6b00] px-5 py-2 text-xs font-black text-white transition hover:bg-[#e55f00] disabled:opacity-50"
                    disabled={isPendingProfilo}
                    onClick={handleSalvaProfilo}
                    type="button"
                  >
                    {isPendingProfilo ? 'Salvo…' : 'Salva'}
                  </button>
                  <button
                    className="rounded-xl bg-white/8 px-5 py-2 text-xs font-black text-white/60 transition hover:bg-white/14 hover:text-white"
                    disabled={isPendingProfilo}
                    onClick={() => { setEditProfilo(false); setProfiloMsg(null) }}
                    type="button"
                  >
                    Annulla
                  </button>
                </div>
              </div>
            )}

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
          </section>

          {/* ── Cambio password card — solo per utenti con password (non Google) ── */}
          {u.hasPassword && <section className="mt-4 rounded-[1.5rem] border border-white/8 bg-white/[0.04] overflow-hidden">
            <div className="px-6 py-5 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase text-white/35">Password</p>
                <p className="mt-1 text-sm font-bold text-white/40">••••••••</p>
              </div>
              {!editPassword && (
                <button
                  className="shrink-0 rounded-full bg-white/8 px-4 py-1.5 text-xs font-black text-white/60 transition hover:bg-white/14 hover:text-white"
                  onClick={() => { setEditPassword(true); setPasswordMsg(null) }}
                  type="button"
                >
                  Cambia
                </button>
              )}
            </div>

            {editPassword && (
              <div className="border-t border-white/8 px-6 py-5 space-y-3">
                <div>
                  <label className="block text-xs font-black uppercase text-white/35 mb-1.5">
                    Password attuale *
                  </label>
                  <input
                    autoComplete="current-password"
                    autoFocus
                    className="h-10 w-full rounded-xl border border-white/12 bg-white/6 px-3 text-sm font-bold text-white outline-none placeholder:text-white/25 focus:border-[#ff6b00] transition"
                    onChange={(e) => setPwAttuale(e.target.value)}
                    placeholder="Password attuale"
                    type="password"
                    value={pwAttuale}
                  />
                </div>
                <div>
                  <label className="block text-xs font-black uppercase text-white/35 mb-1.5">
                    Nuova password * (min. 8 caratteri)
                  </label>
                  <input
                    autoComplete="new-password"
                    className="h-10 w-full rounded-xl border border-white/12 bg-white/6 px-3 text-sm font-bold text-white outline-none placeholder:text-white/25 focus:border-[#ff6b00] transition"
                    onChange={(e) => setPwNuova(e.target.value)}
                    placeholder="Nuova password"
                    type="password"
                    value={pwNuova}
                  />
                </div>
                <div>
                  <label className="block text-xs font-black uppercase text-white/35 mb-1.5">
                    Conferma nuova password *
                  </label>
                  <input
                    autoComplete="new-password"
                    className="h-10 w-full rounded-xl border border-white/12 bg-white/6 px-3 text-sm font-bold text-white outline-none placeholder:text-white/25 focus:border-[#ff6b00] transition"
                    onChange={(e) => setPwConferma(e.target.value)}
                    placeholder="Ripeti nuova password"
                    type="password"
                    value={pwConferma}
                  />
                </div>

                {passwordMsg && (
                  <p className={`text-xs font-bold ${passwordMsg.ok ? 'text-emerald-400' : 'text-red-400'}`}>
                    {passwordMsg.text}
                  </p>
                )}

                <div className="flex gap-2 pt-1">
                  <button
                    className="rounded-xl bg-[#ff6b00] px-5 py-2 text-xs font-black text-white transition hover:bg-[#e55f00] disabled:opacity-50"
                    disabled={isPendingPassword}
                    onClick={handleCambiaPassword}
                    type="button"
                  >
                    {isPendingPassword ? 'Salvo…' : 'Aggiorna password'}
                  </button>
                  <button
                    className="rounded-xl bg-white/8 px-5 py-2 text-xs font-black text-white/60 transition hover:bg-white/14 hover:text-white"
                    disabled={isPendingPassword}
                    onClick={() => {
                      setEditPassword(false)
                      setPwAttuale('')
                      setPwNuova('')
                      setPwConferma('')
                      setPasswordMsg(null)
                    }}
                    type="button"
                  >
                    Annulla
                  </button>
                </div>
              </div>
            )}
          </section>}

          {/* Persistent success messages (outside form) */}
          {profiloMsg?.ok && !editProfilo && (
            <p className="mt-3 text-xs font-bold text-emerald-400">{profiloMsg.text}</p>
          )}
          {passwordMsg?.ok && !editPassword && (
            <p className="mt-3 text-xs font-bold text-emerald-400">{passwordMsg.text}</p>
          )}

          {/* In arrivo */}
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
