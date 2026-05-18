import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-black px-4 text-white">
      <div className="text-center">
        <p className="text-xs font-black uppercase tracking-widest text-[#ff6b00]">Errore 404</p>
        <h1 className="mt-4 text-[6rem] font-black leading-none tracking-tight sm:text-[9rem]">
          404
        </h1>
        <p className="mt-4 text-xl font-black text-white sm:text-2xl">
          Pagina non trovata
        </p>
        <p className="mt-3 text-sm font-bold text-white/50">
          La pagina che cerchi non esiste o è stata spostata.
        </p>

        <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link
            className="rounded-2xl bg-[#ff6b00] px-7 py-3.5 text-sm font-black text-white transition hover:bg-[#e05e00]"
            href="/"
          >
            Torna alla home
          </Link>
          <Link
            className="rounded-2xl border border-white/20 px-7 py-3.5 text-sm font-black text-white/80 transition hover:border-white/50 hover:text-white"
            href="/login"
          >
            Accedi
          </Link>
        </div>
      </div>

      <div className="mt-20 text-center">
        <Link href="/">
          <img alt="Arrivo" className="mx-auto h-8 w-auto opacity-30" src="/arrivo_logo.svg" />
        </Link>
      </div>
    </main>
  )
}
