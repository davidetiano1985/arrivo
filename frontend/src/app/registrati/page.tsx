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

          <div className="relative mt-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-black/10" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white px-3 text-xs font-bold text-black/40">
                oppure
              </span>
            </div>
          </div>

          <button
            className="mt-4 flex h-12 w-full cursor-not-allowed items-center justify-center gap-3 rounded-xl border border-black/10 text-sm font-black text-black/35 opacity-50"
            disabled
            type="button"
          >
            <svg fill="none" height={18} viewBox="0 0 24 24" width={18} xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Registrati con Google
          </button>
          <p className="mt-2 text-center text-xs font-bold text-black/30">
            Disponibile a breve
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
