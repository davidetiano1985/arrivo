import Link from "next/link";

import FooterPubblico from "@/components/FooterPubblico";
import NavbarPubblica from "@/components/NavbarPubblica";

const vantaggi = [
  { titolo: "Prenotazioni automatiche", testo: "Gestisci tavoli e coperti in tempo reale. Niente più telefonate, niente doppi appuntamenti." },
  { titolo: "Ordini pre-consegnati", testo: "Ricevi gli ordini ancora prima che il cliente entri. La cucina lavora con anticipo, la sala senza caos." },
  { titolo: "Incasso anticipato", testo: "Il cliente paga online prima di arrivare. Il tuo incasso è già garantito, zero insolvenze." },
  { titolo: "Dashboard in tempo reale", testo: "Monitora prenotazioni, ordini e incasso da un'unica interfaccia. Dati chiari, decisioni rapide." },
];

const steps = [
  { n: "01", t: "Registrati come partner", d: "Crea il tuo account partner con email e dati dell'attività. Gratis, senza impegno." },
  { n: "02", t: "Inserisci i dati del locale", d: "Nome, indirizzo, orari, cucina, foto. Il tuo profilo pubblico su Arrivo è pronto in meno di un giorno." },
  { n: "03", t: "Carica il menu", d: "Aggiungi piatti, prezzi, foto e allergeni. Il menu digitale è sempre aggiornato e visibile ai clienti." },
  { n: "04", t: "Inizia a ricevere prenotazioni", d: "Dal giorno successivo puoi già ricevere prenotazioni e pre-ordini. Noi pensiamo alla tecnologia, tu alla cucina." },
];

export default function RegistraAttivitaPage() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-black text-white">
      <NavbarPubblica />

      {/* Hero */}
      <section className="mx-auto max-w-screen-xl px-4 py-16 sm:px-6 sm:py-24">
        <span className="inline-flex rounded-full border border-[#ff6b00]/40 bg-[#ff6b00]/10 px-4 py-1.5 text-xs font-black uppercase text-[#ff6b00]">
          Per i ristoratori
        </span>
        <h1 className="mt-5 text-4xl font-black leading-tight sm:text-5xl lg:text-6xl">
          Porta il tuo locale<br />
          <span className="text-[#ff6b00]">su Arrivo.</span>
        </h1>
        <p className="mt-6 max-w-xl text-base font-bold leading-7 text-white/60">
          Prenotazioni intelligenti, ordini anticipati, incasso sicuro. Arrivo ottimizza
          cucina, sala e cassa — tutto in un&apos;unica piattaforma.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/registrati"
            className="rounded-2xl bg-[#ff6b00] px-7 py-3.5 text-center text-sm font-black text-white transition hover:bg-[#e05e00]"
          >
            Registra la tua attività
          </Link>
          <Link
            href="/come-funziona"
            className="rounded-2xl border border-white/20 px-7 py-3.5 text-center text-sm font-black text-white transition hover:border-white/50"
          >
            Come funziona →
          </Link>
        </div>
      </section>

      {/* Numeri */}
      <section className="bg-[#0a0a0a] py-14">
        <div className="mx-auto max-w-screen-xl px-4 sm:px-6">
          <div className="grid gap-4 sm:grid-cols-4">
            {[
              { n: "0€", lab: "Costo di iscrizione" },
              { n: "< 1 gg", lab: "Attivazione profilo" },
              { n: "100%", lab: "Incasso garantito" },
              { n: "24/7", lab: "Dashboard disponibile" },
            ].map((s) => (
              <div key={s.lab} className="rounded-2xl border border-white/8 bg-white/[0.04] p-5 text-center">
                <p className="text-3xl font-black text-[#ff6b00]">{s.n}</p>
                <p className="mt-1 text-xs font-bold text-white/50">{s.lab}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Vantaggi */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-screen-xl px-4 sm:px-6">
          <p className="text-xs font-black uppercase text-[#ff6b00]">Perché Arrivo</p>
          <h2 className="mt-2 text-2xl font-black sm:text-3xl">Cosa ottieni con Arrivo</h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {vantaggi.map((v) => (
              <div key={v.titolo} className="rounded-2xl border border-white/8 bg-white/[0.04] p-6">
                <h3 className="font-black text-[#ff6b00]">{v.titolo}</h3>
                <p className="mt-2 text-sm font-bold leading-6 text-white/55">{v.testo}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Onboarding steps */}
      <section className="bg-[#0a0a0a] py-16 sm:py-20">
        <div className="mx-auto max-w-screen-xl px-4 sm:px-6">
          <p className="text-xs font-black uppercase text-[#ff6b00]">Onboarding</p>
          <h2 className="mt-2 text-2xl font-black sm:text-3xl">Sei online in meno di un giorno</h2>
          <div className="mt-8 space-y-4">
            {steps.map((s, i) => (
              <div key={s.n} className="flex gap-6 rounded-2xl border border-white/8 bg-white/[0.03] p-6">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#ff6b00]/15 text-lg font-black text-[#ff6b00]">
                  {i + 1}
                </span>
                <div>
                  <h3 className="font-black">{s.t}</h3>
                  <p className="mt-2 text-sm font-bold leading-6 text-white/55">{s.d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16">
        <div className="mx-auto max-w-screen-xl px-4 sm:px-6">
          <div className="rounded-[2rem] bg-[#ff6b00] p-8 sm:p-10 lg:flex lg:items-center lg:justify-between">
            <div>
              <h2 className="text-2xl font-black text-white sm:text-3xl">Porta il tuo locale su Arrivo.</h2>
              <p className="mt-2 text-sm font-bold text-white/80">Gratuito. Nessun vincolo. Attivo in meno di 24 ore.</p>
            </div>
            <Link
              href="/registrati"
              className="mt-6 block shrink-0 rounded-2xl bg-black px-7 py-3.5 text-center text-sm font-black text-white transition hover:bg-white hover:text-black lg:mt-0"
            >
              Registra la tua attività →
            </Link>
          </div>
        </div>
      </section>

      <FooterPubblico />
    </main>
  );
}
