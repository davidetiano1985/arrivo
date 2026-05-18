import Link from "next/link";

export default function RegistrazioneLocaleInviataPage() {
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
          <p className="text-xs font-black uppercase text-[#ff6b00]">
            Richiesta inviata
          </p>
          <h1 className="mt-2 text-2xl font-black">
            Locale in attesa di approvazione
          </h1>
          <p className="mt-2 text-sm font-bold text-black/55">
            Abbiamo ricevuto la richiesta di registrazione del tuo locale.
            Riceverai una email di conferma a breve.
          </p>

          <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4">
            <p className="text-xs font-black uppercase text-amber-700">
              Cosa succede adesso
            </p>
            <p className="mt-2 text-sm font-bold text-amber-900">
              Il team Arrivo verificherà le informazioni entro 48 ore. Riceverai
              una email quando il locale sarà approvato e attivato sulla
              piattaforma.
            </p>
          </div>

          <p className="mt-5 text-center text-sm font-bold text-black/55">
            <Link className="font-black text-black" href="/">
              ← Torna alla home
            </Link>
          </p>
        </div>

        <p className="mt-6 text-center text-xs font-bold text-white/35">
          Approvazione in corso. Il team Arrivo ti contatterà entro 48 ore.
        </p>
      </div>
    </main>
  );
}
