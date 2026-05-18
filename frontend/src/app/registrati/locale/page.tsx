'use client'

import Link from 'next/link'
import { useState, useTransition } from 'react'

import { inviaRichiestaLocale } from './actions'

const tipiLocale = [
  'Ristorante',
  'Creperia',
  'Cornetteria',
  'Bakery / Pasticceria',
  'Pub / Birreria',
  'Sushi Bar',
  'Street Food',
  'Altro',
]

export default function RegistratiLocalePage() {
  const [errore, setErrore] = useState('')
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setErrore('')
    const formData = new FormData(e.currentTarget)
    startTransition(async () => {
      try {
        const result = await inviaRichiestaLocale(formData)
        if (result?.error) setErrore(result.error)
      } catch {
        setErrore('Errore imprevisto. Riprova o scrivici direttamente via email.')
      }
    })
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-black px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center">
          <Link href="/">
            <img src="/arrivo_logo.svg" alt="Arrivo" className="h-10 w-auto" />
          </Link>
          <p className="mt-1 text-xs font-bold uppercase text-white/45">
            Prenota · Ordina · Arriva
          </p>
        </div>

        <div className="rounded-[2rem] bg-white p-6 text-black shadow-[0_24px_70px_rgba(0,0,0,0.5)]">
          <p className="text-xs font-black uppercase text-[#ff6b00]">Per gestori</p>
          <h1 className="mt-2 text-2xl font-black">Registra il tuo locale</h1>
          <p className="mt-1 text-sm font-bold text-black/55">
            Il locale sarà visibile su Arrivo solo dopo l&apos;approvazione del team.
          </p>

          <form className="mt-6 grid gap-4" onSubmit={handleSubmit}>
            <div>
              <label
                className="block text-xs font-black uppercase text-black/45"
                htmlFor="nome-attivita"
              >
                Nome attività *
              </label>
              <input
                className="mt-2 h-12 w-full rounded-xl border border-black/10 bg-white px-3 text-sm font-bold outline-none placeholder:text-black/35 focus:border-[#ff6b00]"
                id="nome-attivita"
                name="nome-attivita"
                placeholder="es. Pizzeria Napoli"
                required
                type="text"
              />
            </div>

            <div>
              <label
                className="block text-xs font-black uppercase text-black/45"
                htmlFor="tipo-attivita"
              >
                Tipo attività
              </label>
              <select
                className="mt-2 h-12 w-full rounded-xl border border-black/10 bg-white px-3 text-sm font-bold text-black outline-none focus:border-[#ff6b00]"
                id="tipo-attivita"
                name="tipo-attivita"
              >
                <option value="">Seleziona tipo</option>
                {tipiLocale.map((t) => (
                  <option key={t} value={t.toLowerCase()}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                className="block text-xs font-black uppercase text-black/45"
                htmlFor="citta"
              >
                Città *
              </label>
              <input
                className="mt-2 h-12 w-full rounded-xl border border-black/10 bg-white px-3 text-sm font-bold outline-none placeholder:text-black/35 focus:border-[#ff6b00]"
                id="citta"
                name="citta"
                placeholder="es. Milano"
                required
                type="text"
              />
            </div>

            <div>
              <label
                className="block text-xs font-black uppercase text-black/45"
                htmlFor="email-referente"
              >
                Email referente *
              </label>
              <input
                autoComplete="email"
                className="mt-2 h-12 w-full rounded-xl border border-black/10 bg-white px-3 text-sm font-bold outline-none placeholder:text-black/35 focus:border-[#ff6b00]"
                id="email-referente"
                name="email-referente"
                placeholder="referente@locale.it"
                required
                type="email"
              />
            </div>

            <div>
              <label
                className="block text-xs font-black uppercase text-black/45"
                htmlFor="telefono"
              >
                Telefono
              </label>
              <input
                autoComplete="tel"
                className="mt-2 h-12 w-full rounded-xl border border-black/10 bg-white px-3 text-sm font-bold outline-none placeholder:text-black/35 focus:border-[#ff6b00]"
                id="telefono"
                name="telefono"
                placeholder="+39 02 1234567"
                type="tel"
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
              {isPending ? 'Invio in corso…' : 'Invia richiesta'}
            </button>

            <p className="text-center text-xs font-bold text-black/45">
              Il team Arrivo ti risponderà entro 48 ore all&apos;email fornita
            </p>
          </form>

          <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4">
            <p className="text-xs font-black uppercase text-amber-700">Cosa succede dopo</p>
            <p className="mt-2 text-sm font-bold text-amber-900">
              Il team Arrivo verificherà le informazioni e attiverà il locale entro 48 ore.
            </p>
          </div>

          <div className="mt-5 flex items-center justify-between">
            <Link className="text-sm font-black text-black" href="/registrati">
              ← Torna alla registrazione cliente
            </Link>
            <a
              className="text-xs font-bold text-black/40 transition hover:text-black/70"
              href="mailto:davidetiano@arrivoapp.it?subject=Richiesta%20registrazione%20locale"
            >
              Scrivi via email
            </a>
          </div>
        </div>

        <p className="mt-6 text-center text-xs font-bold text-white/35">
          Registrazione partner in fase di attivazione.
        </p>
      </div>
    </main>
  )
}
