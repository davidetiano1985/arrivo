import Link from "next/link";

export default function EmailVerificataPage() {
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
          <p className="text-xs font-black uppercase text-[#ff6b00]">
            Email verificata
          </p>
          <h1 className="mt-2 text-2xl font-black">Account attivato</h1>
          <p className="mt-2 text-sm font-bold text-black/55">
            Il tuo account è pronto. Puoi ora accedere ad Arrivo e iniziare a
            ordinare dai migliori locali.
          </p>

          <Link
            className="mt-6 block h-12 w-full rounded-xl bg-[#ff6b00] text-center text-sm font-black text-black leading-[3rem]"
            href="/login"
          >
            Accedi al tuo account
          </Link>

          <p className="mt-5 text-center text-sm font-bold text-black/55">
            <Link className="font-black text-black" href="/">
              ← Torna alla home
            </Link>
          </p>
        </div>

        <p className="mt-6 text-center text-xs font-bold text-white/35">
          Demo UI — verifica email non ancora attiva
        </p>
      </div>
    </main>
  );
}
