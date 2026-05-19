'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { creaUtente } from '../actions'

const RUOLI = ['cliente', 'staff', 'manager', 'gestore_locale', 'super_admin'] as const

export default function CreateUserForm() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const form = e.currentTarget
    const fd = new FormData(form)
    const res = await creaUtente(fd)
    if (res?.error) {
      setError(res.error)
    } else {
      startTransition(() => router.push('/admin/users?created=1'))
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-2xl bg-red-50 border border-red-200 px-4 py-3 text-sm font-bold text-red-700">
          {error}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-xs font-black uppercase text-black/45" htmlFor="firstName">
            Nome *
          </label>
          <input
            id="firstName"
            name="firstName"
            type="text"
            required
            autoComplete="given-name"
            className="h-11 w-full rounded-xl border border-black/10 bg-white px-4 text-sm font-bold text-black outline-none focus:border-[#ff6b00] focus:ring-2 focus:ring-[#ff6b00]/20"
            placeholder="Mario"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-black uppercase text-black/45" htmlFor="lastName">
            Cognome *
          </label>
          <input
            id="lastName"
            name="lastName"
            type="text"
            required
            autoComplete="family-name"
            className="h-11 w-full rounded-xl border border-black/10 bg-white px-4 text-sm font-bold text-black outline-none focus:border-[#ff6b00] focus:ring-2 focus:ring-[#ff6b00]/20"
            placeholder="Rossi"
          />
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-black uppercase text-black/45" htmlFor="email">
          Email *
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className="h-11 w-full rounded-xl border border-black/10 bg-white px-4 text-sm font-bold text-black outline-none focus:border-[#ff6b00] focus:ring-2 focus:ring-[#ff6b00]/20"
          placeholder="mario@esempio.it"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-black uppercase text-black/45" htmlFor="phone">
          Telefono (opzionale)
        </label>
        <input
          id="phone"
          name="phone"
          type="tel"
          autoComplete="tel"
          className="h-11 w-full rounded-xl border border-black/10 bg-white px-4 text-sm font-bold text-black outline-none focus:border-[#ff6b00] focus:ring-2 focus:ring-[#ff6b00]/20"
          placeholder="+39 333 1234567"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-black uppercase text-black/45" htmlFor="role">
          Ruolo *
        </label>
        <select
          id="role"
          name="role"
          defaultValue="cliente"
          className="h-11 w-full rounded-xl border border-black/10 bg-white px-4 text-sm font-black text-black outline-none focus:border-[#ff6b00] focus:ring-2 focus:ring-[#ff6b00]/20"
        >
          {RUOLI.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
      </div>

      <div className="rounded-2xl bg-black/[0.03] px-4 py-3">
        <p className="text-xs font-black text-black/50">
          ℹ️ All'utente verrà inviata un'email per impostare la password e attivare l'account.
          L'account non sarà accessibile finché l'utente non completa il processo.
        </p>
      </div>

      <div className="flex flex-wrap gap-3 pt-2">
        <button
          type="submit"
          disabled={isPending}
          className="flex h-11 flex-1 items-center justify-center rounded-xl bg-[#ff6b00] text-sm font-black text-white transition hover:bg-[#e55f00] disabled:opacity-50 sm:flex-none sm:px-8"
        >
          {isPending ? 'Creazione…' : 'Crea utente →'}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="flex h-11 items-center justify-center rounded-xl border border-black/10 px-6 text-sm font-black text-black transition hover:bg-black/5"
        >
          Annulla
        </button>
      </div>
    </form>
  )
}
