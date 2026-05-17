import Link from "next/link";

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

          <div className="mt-6 grid gap-4">
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
                type="password"
              />
            </div>

            <button
              className="h-12 w-full rounded-xl bg-[#ff6b00] text-sm font-black text-white"
              type="button"
            >
              Crea account
            </button>
            <p className="text-center text-xs font-bold text-black/45">
              Riceverai un link di verifica alla tua email
            </p>
          </div>

          <p className="mt-5 text-center text-sm font-bold text-black/55">
            Hai già un account?{" "}
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

        <p className="mt-6 text-center text-xs font-bold text-white/35">
          Demo UI — registrazione non ancora attiva
        </p>
      </div>
    </main>
  );
}
