import Link from "next/link";

import FooterPubblico from "@/components/FooterPubblico";
import NavbarPubblica from "@/components/NavbarPubblica";

const steps = [
  { num: "01", titolo: "Scegli il ristorante", testo: "Trova il locale su Arrivo, sfoglia il menu e controlla la disponibilità in tempo reale per la tua data e ora." },
  { num: "02", titolo: "Seleziona data e ospiti", testo: "Scegli il giorno, l'orario e il numero di persone. Il sistema mostra solo i tavoli effettivamente disponibili." },
  { num: "03", titolo: "Conferma in un tap", testo: "Ricevi conferma immediata via email. Nessun telefono, nessuna attesa di risposta, nessuna sorpresa." },
  { num: "04", titolo: "Arriva e siediti", testo: "Il locale ti aspetta. Il tuo nome è sul tavolo. Se hai già ordinato, il piatto è in preparazione." },
];

const garanzie = [
  { titolo: "Conferma istantanea", testo: "La prenotazione è garantita in meno di un secondo. Zero chiamate, zero attesa." },
  { titolo: "Modifica gratuita", testo: "Hai cambiato programma? Modifica o cancella fino a 2 ore prima senza costi." },
  { titolo: "Nessuna penale", testo: "Non addebitiamo nulla per la sola prenotazione. Paghi solo ciò che ordini." },
  { titolo: "Notifiche in tempo reale", testo: "Ricevi aggiornamenti via email e app: conferma, promemoria, eventuali avvisi del locale." },
];

export default function PrenotaTavoloPage() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-black text-white">
      <NavbarPubblica />

      {/* Hero */}
      <section className="mx-auto max-w-screen-xl px-4 py-16 sm:px-6 sm:py-24">
        <span className="inline-flex rounded-full border border-[#ff6b00]/40 bg-[#ff6b00]/10 px-4 py-1.5 text-xs font-black uppercase text-[#ff6b00]">
          Prenota tavolo
        </span>
        <h1 className="mt-5 text-4xl font-black leading-tight sm:text-5xl">
          Il tuo tavolo, confermato<br />
          <span className="text-[#ff6b00]">in un secondo.</span>
        </h1>
        <p className="mt-6 max-w-xl text-base font-bold leading-7 text-white/60">
          Con Arrivo prenoti il tavolo in tre tap. Nessuna telefonata, nessuna attesa di risposta.
          Conferma immediata, posto garantito.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/trova-ristoranti"
            className="rounded-2xl bg-[#ff6b00] px-7 py-3.5 text-center text-sm font-black text-white transition hover:bg-[#e05e00]"
          >
            Trova un ristorante
          </Link>
          <Link
            href="/registrati"
            className="rounded-2xl border border-white/20 px-7 py-3.5 text-center text-sm font-black text-white transition hover:border-white/50"
          >
            Registrati gratis
          </Link>
        </div>
      </section>

      {/* Come funziona */}
      <section className="bg-[#0a0a0a] py-16 sm:py-20">
        <div className="mx-auto max-w-screen-xl px-4 sm:px-6">
          <p className="text-xs font-black uppercase text-[#ff6b00]">Il processo</p>
          <h2 className="mt-2 text-2xl font-black sm:text-3xl">Come si prenota</h2>
          <div className="mt-8 space-y-4">
            {steps.map((step, i) => (
              <div key={step.num} className="flex gap-6 rounded-2xl border border-white/8 bg-white/[0.03] p-6 sm:p-8">
                <div className="shrink-0">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#ff6b00]/15 text-lg font-black text-[#ff6b00]">
                    {i + 1}
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-black">{step.titolo}</h3>
                  <p className="mt-2 text-sm font-bold leading-7 text-white/55">{step.testo}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Garanzie */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-screen-xl px-4 sm:px-6">
          <p className="text-xs font-black uppercase text-[#ff6b00]">Le nostre garanzie</p>
          <h2 className="mt-2 text-2xl font-black sm:text-3xl">Prenota con sicurezza</h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {garanzie.map((g) => (
              <div key={g.titolo} className="rounded-2xl border border-white/8 bg-white/[0.04] p-5">
                <h3 className="font-black text-[#ff6b00]">{g.titolo}</h3>
                <p className="mt-2 text-sm font-bold leading-6 text-white/55">{g.testo}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#0a0a0a] py-16">
        <div className="mx-auto max-w-screen-xl px-4 sm:px-6">
          <div className="rounded-[2rem] bg-[#ff6b00] p-8 sm:p-10 lg:flex lg:items-center lg:justify-between">
            <div>
              <h2 className="text-2xl font-black text-white sm:text-3xl">Prenota il tuo primo tavolo.</h2>
              <p className="mt-2 text-sm font-bold text-white/80">
                Registrati gratis e scopri la prenotazione senza stress.
              </p>
            </div>
            <Link
              href="/registrati"
              className="mt-6 block shrink-0 rounded-2xl bg-black px-7 py-3.5 text-center text-sm font-black text-white transition hover:bg-white hover:text-black lg:mt-0"
            >
              Registrati gratis →
            </Link>
          </div>
        </div>
      </section>

      <FooterPubblico />
    </main>
  );
}
