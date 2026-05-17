import Link from "next/link";

export default function VerificaEmailPage() {
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
            Quasi fatto
          </p>
          <h1 className="mt-2 text-2xl font-black">Controlla la tua email</h1>
          <p className="mt-2 text-sm font-bold text-black/55">
            Abbiamo inviato un link di verifica al tuo indirizzo email. Clicca
            il link per attivare il tuo account.
          </p>

          <div className="mt-5 rounded-2xl bg-black/[0.04] p-4">
            <p className="text-xs font-black uppercase text-black/45">
              Non vedi l&apos;email?
            </p>
            <p className="mt-2 text-sm font-bold text-black/55">
              Controlla la cartella spam o posta indesiderata. Il link scade
              dopo 24 ore.
            </p>
          </div>

          <p className="mt-5 text-center text-sm font-bold text-black/55">
            <Link className="font-black text-[#ff6b00]" href="/login">
              ← Torna al login
            </Link>
          </p>
        </div>

      </div>
    </main>
  );
}
