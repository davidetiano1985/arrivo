'use client'

import Link from 'next/link'
import { useState } from 'react'

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
  const [nome, setNome] = useState('')
  const [tipo, setTipo] = useState('')
  const [citta, setCitta] = useState('')
  const [email, setEmail] = useState('')
  const [telefono, setTelefono] = useState('')

  const corpo = encodeURIComponent(
    `Salve,\n\nVorrei registrare il mio locale su Arrivo.\n\nNome attività: ${nome || '—'}\nTipo: ${tipo || '—'}\nCittà: ${citta || '—'}\nEmail referente: ${email || '—'}\nTelefono: ${telefono || '—'}\n\nIn attesa di un vostro riscontro,\n${nome || '—'}`
  )

  const mailtoHref = `mailto:davidetiano@arrivoapp.it?subject=Richiesta%20registrazione%20locale%20%E2%80%94%20${encodeURIComponent(nome || 'Nuovo locale')}&body=${corpo}`

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

          <div className="mt-6 grid gap-4">
            <div>
              <label
                className="block text-xs font-black uppercase text-black/45"
                htmlFor="nome-attivita"
              >
                Nome attività
              </label>
              <input
                className="mt-2 h-12 w-full rounded-xl border border-black/10 bg-white px-3 text-sm font-bold outline-none placeholder:text-black/35 focus:border-[#ff6b00]"
                id="nome-attivita"
                name="nome-attivita"
                onChange={(e) => setNome(e.target.value)}
                placeholder="es. Pizzeria Napoli"
                type="text"
                value={nome}
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
                onChange={(e) => setTipo(e.target.value)}
                value={tipo}
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
                Città
              </label>
              <input
                className="mt-2 h-12 w-full rounded-xl border border-black/10 bg-white px-3 text-sm font-bold outline-none placeholder:text-black/35 focus:border-[#ff6b00]"
                id="citta"
                name="citta"
                onChange={(e) => setCitta(e.target.value)}
                placeholder="es. Milano"
                type="text"
                value={citta}
              />
            </div>

            <div>
              <label
                className="block text-xs font-black uppercase text-black/45"
                htmlFor="email-referente"
              >
                Email referente
              </label>
              <input
                autoComplete="email"
                className="mt-2 h-12 w-full rounded-xl border border-black/10 bg-white px-3 text-sm font-bold outline-none placeholder:text-black/35 focus:border-[#ff6b00]"
                id="email-referente"
                name="email-referente"
                onChange={(e) => setEmail(e.target.value)}
                placeholder="referente@locale.it"
                type="email"
                value={email}
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
                onChange={(e) => setTelefono(e.target.value)}
                placeholder="+39 02 1234567"
                type="tel"
                value={telefono}
              />
            </div>

            <a
              className="block h-12 w-full rounded-xl bg-[#ff6b00] text-center text-sm font-black text-white leading-[3rem]"
              href={mailtoHref}
            >
              Invia richiesta via email →
            </a>
            <p className="text-center text-xs font-bold text-black/45">
              Si aprirà la tua app email con tutti i dati precompilati
            </p>
          </div>

          <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4">
            <p className="text-xs font-black uppercase text-amber-700">Cosa succede dopo</p>
            <p className="mt-2 text-sm font-bold text-amber-900">
              Riceverai una email di conferma. Il team Arrivo verificherà le informazioni e attiverà il locale entro 48 ore.
            </p>
          </div>

          <p className="mt-5 text-center text-sm font-bold text-black/55">
            <Link className="font-black text-black" href="/registrati">
              ← Torna alla registrazione cliente
            </Link>
          </p>
        </div>

        <p className="mt-6 text-center text-xs font-bold text-white/35">
          Registrazione partner in fase di attivazione. Riceverai conferma via email.
        </p>
      </div>
    </main>
  )
}
