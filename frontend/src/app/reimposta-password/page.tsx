'use client'

import { useState, useTransition } from 'react'
import { useSearchParams } from 'next/navigation'
import { reimpostaPassword } from './actions'

export default function ReimpostaPasswordPage() {
  const params  = useSearchParams()
  const token   = params.get('token') ?? ''
  const [error, setError]       = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  if (!token) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black px-4">
        <div className="w-full max-w-sm rounded-2xl bg-white p-8 text-center">
          <p className="text-2xl font-black text-black">Link non valido</p>
          <p className="mt-2 text-sm font-bold text-black/50">
            Il link per il reset password è mancante o non corretto.
          </p>
        </div>
      </main>
    )
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const fd = new FormData(e.currentTarget)
    fd.set('token', token)
    startTransition(async () => {
      const res = await reimpostaPassword(fd)
      if (res?.error) setError(res.error)
    })
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-black px-4 py-8">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <img src="/arrivo_logo.svg" alt="Arrivo" className="mx-auto h-8 w-auto" />
        </div>

        <div className="rounded-2xl bg-white p-7 shadow-2xl">
          <p className="text-xs font-black uppercase tracking-widest text-[#ff6b00]">Arrivo</p>
          <h1 className="mt-2 text-2xl font-black text-black">Nuova password</h1>
          <p className="mt-1 text-sm font-bold text-black/50">Scegli una password sicura di almeno 8 caratteri.</p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {error && (
              <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm font-bold text-red-700">
                {error}
              </div>
            )}

            <div>
              <label className="mb-1.5 block text-xs font-black uppercase text-black/45" htmlFor="password">
                Nuova password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                minLength={8}
                autoComplete="new-password"
                className="h-11 w-full rounded-xl border border-black/10 bg-white px-4 text-sm font-bold text-black outline-none focus:border-[#ff6b00] focus:ring-2 focus:ring-[#ff6b00]/20"
                placeholder="Almeno 8 caratteri"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-black uppercase text-black/45" htmlFor="conferma">
                Conferma password
              </label>
              <input
                id="conferma"
                name="conferma"
                type="password"
                required
                minLength={8}
                autoComplete="new-password"
                className="h-11 w-full rounded-xl border border-black/10 bg-white px-4 text-sm font-bold text-black outline-none focus:border-[#ff6b00] focus:ring-2 focus:ring-[#ff6b00]/20"
                placeholder="Ripeti la password"
              />
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="mt-2 flex h-12 w-full items-center justify-center rounded-xl bg-[#ff6b00] text-sm font-black text-white transition hover:bg-[#e55f00] disabled:opacity-50"
            >
              {isPending ? 'Salvataggio…' : 'Salva nuova password →'}
            </button>
          </form>
        </div>
      </div>
    </main>
  )
}
