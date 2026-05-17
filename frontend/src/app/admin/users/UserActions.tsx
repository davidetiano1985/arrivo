'use client'

import { useState } from 'react'

import { aggiornaRuolo, togglaSospensione } from './actions'

const RUOLI = [
  'super_admin',
  'gestore_locale',
  'manager',
  'staff',
  'cliente',
] as const

type Props = {
  userId: string
  currentRole: string
  suspended: boolean
  isSelf: boolean
}

export default function UserActions({ userId, currentRole, suspended, isSelf }: Props) {
  const [loading, setLoading] = useState(false)
  const [role, setRole] = useState(currentRole)
  const [isSuspended, setIsSuspended] = useState(suspended)

  async function handleRoleChange(newRole: string) {
    if (isSelf && newRole !== 'super_admin') {
      alert('Non puoi togliere il ruolo super_admin a te stesso.')
      setRole(currentRole)
      return
    }
    setLoading(true)
    setRole(newRole)
    try {
      await aggiornaRuolo(userId, newRole)
    } catch (e) {
      alert((e as Error).message)
      setRole(role)
    } finally {
      setLoading(false)
    }
  }

  async function handleToggle() {
    if (isSelf && !isSuspended) {
      alert('Non puoi sospendere te stesso.')
      return
    }
    const messaggio = isSuspended
      ? 'Riattivare questo utente?'
      : 'Sospendere questo utente?'
    if (!window.confirm(messaggio)) return

    setLoading(true)
    try {
      await togglaSospensione(userId, !isSuspended)
      setIsSuspended((prev) => !prev)
    } catch (e) {
      alert((e as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <select
        className="h-9 rounded-xl border border-black/10 bg-white px-2 text-xs font-black text-black outline-none disabled:opacity-50"
        disabled={loading}
        onChange={(e) => handleRoleChange(e.target.value)}
        value={role}
      >
        {RUOLI.map((r) => (
          <option key={r} value={r}>
            {r}
          </option>
        ))}
      </select>

      <button
        className={`rounded-xl px-3 py-2 text-xs font-black text-white disabled:opacity-50 ${
          isSuspended ? 'bg-emerald-600' : 'bg-[#ff6b00]'
        }`}
        disabled={loading || (isSelf && !isSuspended)}
        onClick={handleToggle}
        title={isSelf && !isSuspended ? 'Non puoi sospendere te stesso' : undefined}
      >
        {isSuspended ? 'Riattiva' : 'Sospendi'}
      </button>
    </div>
  )
}
