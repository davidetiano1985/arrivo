import Link from "next/link";

import FooterPubblico from "@/components/FooterPubblico";
import NavbarPubblica from "@/components/NavbarPubblica";

const features = [
  { titolo: "Prenotazioni in tempo reale", testo: "Visualizza ogni prenotazione nel momento in cui arriva. Tavolo, orario, numero di ospiti, note speciali." },
  { titolo: "Gestione ordini pre-arrivo", testo: "Tutti i pre-ordini organizzati per orario di arrivo. La cucina sa esattamente cosa preparare e quando." },
  { titolo: "Incasso e reportistica", testo: "Monitoraggio di incassi giornalieri, settimanali e mensili. Export dati, report per la contabilità." },
  { titolo: "Menu digitale aggiornabile", testo: "Modifica prezzi, aggiungi piatti, metti in pausa voci esaurite. Aggiornamenti in tempo reale." },
  { titolo: "Disponibilità tavoli", testo: "Gestisci la capacità del locale con un click. Apri, chiudi o blocca fasce orarie in pochi secondi." },
  { titolo: "Notifiche al team", testo: "Il personale riceve avvisi per nuovi ordini, modifiche e clienti in arrivo. Tutto coordinato." },
];

export default function DashboardPage() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-black text-white">
      <NavbarPubblica />

      {/* Hero */}
      <section className="mx-auto max-w-screen-xl px-4 py-16 sm:px-6 sm:py-24">
        <span className="inline-flex rounded-full border border-[#ff6b00]/40 bg-[#ff6b00]/10 px-4 py-1.5 text-xs font-black uppercase text-[#ff6b00]">
          Dashboard partner
        </span>
        <h1 className="mt-5 text-4xl font-black leading-tight sm:text-5xl">
          Il tuo locale,<br />
          <span className="text-[#ff6b00]">sotto controllo.</span>
        </h1>
        <p className="mt-6 max-w-xl text-base font-bold leading-7 text-white/60">
          La dashboard Arrivo è il centro di controllo del tuo ristorante.
          Prenotazioni, ordini, incasso e menu — tutto in un&apos;unica schermata.
        </p>
        <Link
          href="/registra-attivita"
          className="mt-8 inline-block rounded-2xl bg-[#ff6b00] px-7 py-3.5 text-sm font-black text-white transition hover:bg-[#e05e00]"
        >
          Accedi alla dashboard
        </Link>
      </section>

      {/* Mock preview */}
      <section className="bg-[#0a0a0a] py-14">
        <div className="mx-auto max-w-screen-xl px-4 sm:px-6">
          <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-[#111]">
            {/* Fake browser chrome */}
            <div className="flex items-center gap-2 border-b border-white/8 px-5 py-3">
              <div className="h-3 w-3 rounded-full bg-white/10" />
              <div className="h-3 w-3 rounded-full bg-white/10" />
              <div className="h-3 w-3 rounded-full bg-white/10" />
              <div className="ml-4 flex-1 rounded-md bg-white/5 px-3 py-1 text-xs font-bold text-white/20">
                dashboard.arrivoapp.it
              </div>
            </div>
            {/* Dashboard mock */}
            <div className="grid gap-0 lg:grid-cols-4">
              {/* Sidebar */}
              <div className="hidden border-r border-white/8 p-5 lg:block">
                <p className="mb-4 text-xs font-black text-white/30">MENU</p>
                {["Panoramica", "Prenotazioni", "Ordini", "Menu", "Incasso", "Impostazioni"].map((v) => (
                  <div key={v} className={`mb-1 rounded-xl px-3 py-2 text-sm font-bold ${v === "Panoramica" ? "bg-[#ff6b00]/15 text-[#ff6b00]" : "text-white/40"}`}>
                    {v}
                  </div>
                ))}
              </div>
              {/* Main */}
              <div className="col-span-3 p-6">
                <p className="text-xs font-black text-white/30">OGGI — LUNEDÌ 16 GIUGNO</p>
                <div className="mt-4 grid grid-cols-3 gap-3">
                  {[
                    { lab: "Prenotazioni", val: "12" },
                    { lab: "Ordini ricevuti", val: "8" },
                    { lab: "Incasso", val: "€ 486" },
                  ].map((s) => (
                    <div key={s.lab} className="rounded-xl border border-white/8 bg-white/[0.03] p-4">
                      <p className="text-xs font-bold text-white/40">{s.lab}</p>
                      <p className="mt-1 text-2xl font-black text-[#ff6b00]">{s.val}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-4">
                  <p className="mb-3 text-xs font-black text-white/30">PROSSIME PRENOTAZIONI</p>
                  {[
                    { ora: "12:30", nome: "Rossi M.", n: "4 ospiti", stato: "Ordinato" },
                    { ora: "13:00", nome: "Bianchi L.", n: "2 ospiti", stato: "In arrivo" },
                    { ora: "13:30", nome: "Ferrari G.", n: "6 ospiti", stato: "Solo tavolo" },
                  ].map((p) => (
                    <div key={p.ora} className="mb-2 flex items-center justify-between rounded-xl border border-white/6 bg-white/[0.02] px-4 py-3">
                      <div className="flex items-center gap-4">
                        <span className="text-sm font-black text-[#ff6b00]">{p.ora}</span>
                        <span className="text-sm font-bold">{p.nome}</span>
                        <span className="text-xs font-bold text-white/40">{p.n}</span>
                      </div>
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-black ${p.stato === "Ordinato" ? "bg-green-500/15 text-green-400" : p.stato === "In arrivo" ? "bg-[#ff6b00]/15 text-[#ff6b00]" : "bg-white/8 text-white/40"}`}>
                        {p.stato}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <p className="mt-4 text-center text-xs font-bold text-white/25">Anteprima — dati dimostrativi</p>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-screen-xl px-4 sm:px-6">
          <p className="text-xs font-black uppercase text-[#ff6b00]">Funzionalità</p>
          <h2 className="mt-2 text-2xl font-black sm:text-3xl">Tutto quello che ti serve</h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <div key={f.titolo} className="rounded-2xl border border-white/8 bg-white/[0.04] p-6">
                <h3 className="font-black text-[#ff6b00]">{f.titolo}</h3>
                <p className="mt-2 text-sm font-bold leading-6 text-white/55">{f.testo}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#0a0a0a] py-16">
        <div className="mx-auto max-w-screen-xl px-4 sm:px-6 text-center">
          <h2 className="text-3xl font-black sm:text-4xl">Pronto ad accedere?</h2>
          <p className="mt-3 text-sm font-bold text-white/55">Registra la tua attività e accedi alla dashboard in meno di 24 ore.</p>
          <Link
            href="/registra-attivita"
            className="mt-6 inline-block rounded-2xl bg-[#ff6b00] px-7 py-3.5 text-sm font-black text-white transition hover:bg-[#e05e00]"
          >
            Registra la tua attività
          </Link>
        </div>
      </section>

      <FooterPubblico />
    </main>
  );
}
