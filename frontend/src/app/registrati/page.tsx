import Link from 'next/link'

import RegistrazioneForm from './RegistrazioneForm'

export default function RegistratiPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-black px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <Link
            className="text-2xl font-black tracking-[0.16em] text-white"
            href="/"
          >
            ARRIVO
          </Link>
          <p className="mt-1 text-xs font-bold uppercase text-white/45">
            Food delivery premium
          </p>
        </div>

        <div className="rounded-[2rem] bg-white p-6 text-black shadow-[0_24px_70px_rgba(0,0,0,0.5)]">
          <h1 className="text-2xl font-black">Crea il tuo account</h1>
          <p className="mt-1 text-sm font-bold text-black/55">
            Registrati come cliente per ordinare e prenotare dai migliori locali.
          </p>

          <RegistrazioneForm />

          <p className="mt-5 text-center text-sm font-bold text-black/55">
            Hai già un account?{' '}
            <Link className="font-black text-[#ff6b00]" href="/login">
              Accedi
            </Link>
          </p>

          <div className="mt-5 rounded-2xl bg-black/[0.04] p-4">
            <p className="text-xs font-black uppercase text-black/45">
              Sei un gestore di locale?
            </p>
            <p className="mt-2 text-sm font-bold text-black/55">
              Registra ristoranti, creperie, bakery e qualsiasi locale food su
              Arrivo.
            </p>
            <Link
              className="mt-3 inline-block rounded-xl bg-black px-4 py-2 text-xs font-black text-white"
              href="/registrati/locale"
            >
              Registra il tuo locale →
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
