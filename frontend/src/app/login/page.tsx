import Link from "next/link";

export default function LoginPage() {
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
          <h1 className="text-2xl font-black">Accedi</h1>
          <p className="mt-1 text-sm font-bold text-black/55">
            Inserisci le tue credenziali per continuare.
          </p>

          <div className="mt-6 grid gap-4">
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
                autoComplete="current-password"
                className="mt-2 h-12 w-full rounded-xl border border-black/10 bg-white px-3 text-sm font-bold outline-none placeholder:text-black/35 focus:border-[#ff6b00]"
                id="password"
                name="password"
                placeholder="••••••••"
                type="password"
              />
            </div>

            <button
              className="h-12 w-full rounded-xl bg-[#ff6b00] text-sm font-black text-white"
              type="button"
            >
              Accedi
            </button>
          </div>

          <div className="my-5 flex items-center gap-3">
            <div className="h-px flex-1 bg-black/10" />
            <span className="text-xs font-bold text-black/45">oppure</span>
            <div className="h-px flex-1 bg-black/10" />
          </div>

          <button
            className="flex h-12 w-full items-center justify-center gap-3 rounded-xl border-2 border-black/10 text-sm font-black text-black transition hover:border-[#ff6b00]"
            type="button"
          >
            <span className="font-black text-[#4285f4]">G</span>
            Continua con Google
          </button>

          <p className="mt-5 text-center text-sm font-bold text-black/55">
            Non hai un account?{" "}
            <Link className="font-black text-[#ff6b00]" href="/registrati">
              Registrati
            </Link>
          </p>
        </div>

        <p className="mt-6 text-center text-xs font-bold text-white/35">
          Demo UI — autenticazione non ancora attiva
        </p>
      </div>
    </main>
  );
}
