import Link from "next/link";

import FooterPubblico from "@/components/FooterPubblico";
import NavbarPubblica from "@/components/NavbarPubblica";

const steps = [
  { num: "01", titolo: "Scegli il locale", testo: "Esplora ristoranti per cucina, città o disponibilità. Filtra per orario, categoria e tipo di locale. Ogni scheda mostra menu, prezzi e disponibilità in tempo reale." },
  { num: "02", titolo: "Prenota il tavolo", testo: "Scegli data, orario e numero di ospiti. La prenotazione viene confermata in pochi secondi — senza telefonate, senza attesa, senza sorprese." },
  { num: "03", titolo: "Ordina prima di arrivare", testo: "Sfoglia il menu direttamente dall'app e invia il tuo ordine. La cucina inizia a preparare mentre sei ancora in viaggio." },
  { num: "04", titolo: "Paga online", testo: "Pagamento sicuro con carta, Apple Pay, Google Pay o PayPal. Niente conto da aspettare, niente attesa finale. Tutto già risolto." },
  { num: "05", titolo: "Arriva e siediti", testo: "Il tavolo è pronto con il tuo nome. Il piatto è già in cucina. Siediti, rilassati e inizia a mangiare. Niente attese, niente caos." },
];

const vantaggiCliente = [
  { titolo: "Zero file", testo: "Niente sala d'aspetto, niente fila all'ingresso." },
  { titolo: "Tavolo confermato", testo: "La prenotazione è garantita. Nessuna sorpresa." },
  { titolo: "Ordine già partito", testo: "Il piatto è in preparazione prima che arrivi." },
  { titolo: "Pago quando voglio", testo: "Online, in anticipo, senza pensieri finali." },
];

const vantaggiLocale = [
  { titolo: "Cucina organizzata", testo: "Gli ordini arrivano con anticipo, la produzione è prevedibile." },
  { titolo: "Sala senza caos", testo: "Niente clienti in piedi, niente modifiche last minute." },
  { titolo: "Turnover ottimizzato", testo: "I tavoli ruotano con precisione, senza sprechi." },
  { titolo: "Incasso anticipato", testo: "Il pagamento è già avvenuto. Zero inseguimenti." },
];

export default function ComeFunzionaPage() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-black text-white">
      <NavbarPubblica />

      {/* Hero */}
      <section className="mx-auto max-w-screen-xl px-4 py-16 sm:px-6 sm:py-24">
        <span className="inline-flex rounded-full border border-[#ff6b00]/40 bg-[#ff6b00]/10 px-4 py-1.5 text-xs font-black uppercase text-[#ff6b00]">
          Come funziona
        </span>
        <h1 className="mt-5 text-4xl font-black leading-tight sm:text-5xl lg:text-6xl">
          Dal telefono al tavolo<br />
          <span className="text-[#ff6b00]">in cinque passi.</span>
        </h1>
        <p className="mt-6 max-w-xl text-base font-bold leading-7 text-white/60">
          Arrivo non è delivery. È il modo più intelligente di vivere l&apos;esperienza ristorante.
          Prenota, ordina, paga — tutto prima di arrivare.
        </p>
      </section>

      {/* Steps */}
      <section className="bg-[#0a0a0a] py-16 sm:py-20">
        <div className="mx-auto max-w-screen-xl px-4 sm:px-6">
          <div className="space-y-4">
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

      {/* Vantaggi cliente */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-screen-xl px-4 sm:px-6">
          <p className="text-xs font-black uppercase text-[#ff6b00]">Per te</p>
          <h2 className="mt-2 text-3xl font-black sm:text-4xl">Vantaggi per il cliente</h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {vantaggiCliente.map((v) => (
              <div key={v.titolo} className="rounded-2xl border border-white/8 bg-white/[0.04] p-5">
                <h3 className="font-black">{v.titolo}</h3>
                <p className="mt-2 text-sm font-bold leading-6 text-white/50">{v.testo}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Vantaggi locale */}
      <section className="bg-[#0a0a0a] py-16 sm:py-20">
        <div className="mx-auto max-w-screen-xl px-4 sm:px-6">
          <p className="text-xs font-black uppercase text-white/40">Per il locale</p>
          <h2 className="mt-2 text-3xl font-black sm:text-4xl">Vantaggi per l&apos;attività</h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {vantaggiLocale.map((v) => (
              <div key={v.titolo} className="rounded-2xl border border-white/8 bg-white/[0.04] p-5">
                <h3 className="font-black">{v.titolo}</h3>
                <p className="mt-2 text-sm font-bold leading-6 text-white/50">{v.testo}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16">
        <div className="mx-auto max-w-screen-xl px-4 sm:px-6 text-center">
          <h2 className="text-3xl font-black sm:text-4xl">Pronto a provarlo?</h2>
          <p className="mt-3 text-sm font-bold text-white/55">Registrati gratis e prenota il tuo primo tavolo con Arrivo.</p>
          <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link className="rounded-2xl bg-[#ff6b00] px-7 py-3.5 text-sm font-black text-white transition hover:bg-[#e05e00]" href="/registrati">
              Registrati gratis
            </Link>
            <Link className="rounded-2xl border border-white/20 px-7 py-3.5 text-sm font-black text-white transition hover:border-white/50" href="/trova-ristoranti">
              Trova un ristorante
            </Link>
          </div>
        </div>
      </section>

      <FooterPubblico />
    </main>
  );
}
