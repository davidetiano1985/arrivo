'use client'

import { useState, useTransition } from 'react'

import { registraCliente } from './actions'

export default function RegistrazioneForm() {
  const [errore, setErrore] = useState('')
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setErrore('')
    const formData = new FormData(e.currentTarget)
    startTransition(async () => {
      const result = await registraCliente(formData)
      if (result?.error) setErrore(result.error)
    })
  }

  return (
    <form className="mt-6 grid gap-4" onSubmit={handleSubmit}>
      <div>
        <label
          className="block text-xs font-black uppercase text-black/45"
          htmlFor="nome"
        >
          Nome completo
        </label>
        <input
          autoComplete="name"
          className="mt-2 h-12 w-full rounded-xl border border-black/10 bg-white px-3 text-sm font-bold outline-none placeholder:text-black/35 focus:border-[#ff6b00]"
          id="nome"
          name="nome"
          placeholder="Mario Rossi"
          required
          type="text"
        />
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
        <input
          autoComplete="new-password"
          className="mt-2 h-12 w-full rounded-xl border border-black/10 bg-white px-3 text-sm font-bold outline-none placeholder:text-black/35 focus:border-[#ff6b00]"
          id="password"
          name="password"
          placeholder="••••••••"
          required
          type="password"
        />
      </div>

      <div>
        <label
          className="block text-xs font-black uppercase text-black/45"
          htmlFor="conferma-password"
        >
          Conferma password
        </label>
        <input
          autoComplete="new-password"
          className="mt-2 h-12 w-full rounded-xl border border-black/10 bg-white px-3 text-sm font-bold outline-none placeholder:text-black/35 focus:border-[#ff6b00]"
          id="conferma-password"
          name="conferma-password"
          placeholder="••••••••"
          required
          type="password"
        />
      </div>

      {errore && (
        <p className="rounded-xl bg-red-50 px-3 py-2 text-sm font-bold text-red-600">
          {errore}
        </p>
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
