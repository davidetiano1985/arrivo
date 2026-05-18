import Link from "next/link";

import FooterPubblico from "@/components/FooterPubblico";
import NavbarPubblica from "@/components/NavbarPubblica";

const flusso = [
  { n: "1", t: "Il cliente pre-ordina", d: "Prima di arrivare, il cliente sceglie i piatti dall'app. L'ordine entra nel sistema con orario di arrivo previsto." },
  { n: "2", t: "La cucina riceve il ticket", d: "Il pannello cucina mostra l'ordine in tempo reale. Tempo di preparazione stimato calcolato in automatico." },
  { n: "3", t: "Stato aggiornato in tempo reale", d: "La sala vede quando l'ordine è in preparazione, pronto o consegnato. Zero comunicazioni verbali, zero errori." },
  { n: "4", t: "Il cliente arriva, mangia", d: "Quando il cliente si siede, il piatto è già pronto o in uscita. Esperienza senza attese." },
];

const vantaggi = [
  { titolo: "Meno errori in cucina", testo: "Gli ordini arrivano scritti e chiari. Nessun fraintendimento tra sala e cucina." },
  { titolo: "Cucina più organizzata", testo: "Gli ordini sono sequenziati per orario. La produzione è prevedibile e gestibile." },
  { titolo: "Meno sprechi", testo: "Sai in anticipo cosa verrà ordinato. Meno derrate inutilizzate, più controllo sui costi." },
  { titolo: "Tempi di attesa ridotti", testo: "Con la gestione pre-ordini, il tempo medio dal tavolo al piatto cala drasticamente." },
];

export default function GestioneOrdiniPage() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-black text-white">
      <NavbarPubblica />

      {/* Hero */}
      <section className="mx-auto max-w-screen-xl px-4 py-16 sm:px-6 sm:py-24">
        <span className="inline-flex rounded-full border border-[#ff6b00]/40 bg-[#ff6b00]/10 px-4 py-1.5 text-xs font-black uppercase text-[#ff6b00]">
          Gestione ordini
        </span>
        <h1 className="mt-5 text-4xl font-black leading-tight sm:text-5xl">
          Ordini organizzati,<br />
          <span className="text-[#ff6b00]">cucina senza caos.</span>
        </h1>
        <p className="mt-6 max-w-xl text-base font-bold leading-7 text-white/60">
          Con Arrivo gli ordini arrivano in cucina prima ancora che il cliente entri nel locale.
          La tua brigata lavora con anticipo. La sala non aspetta.
        </p>
        <Link
          href="/registra-attivita"
          className="mt-8 inline-block rounded-2xl bg-[#ff6b00] px-7 py-3.5 text-sm font-black text-white transition hover:bg-[#e05e00]"
        >
          Registra il tuo locale
        </Link>
      </section>

      {/* Flusso ordine */}
      <section className="bg-[#0a0a0a] py-16 sm:py-20">
        <div className="mx-auto max-w-screen-xl px-4 sm:px-6">
          <p className="text-xs font-black uppercase text-[#ff6b00]">Come funziona</p>
          <h2 className="mt-2 text-2xl font-black sm:text-3xl">Dal pre-ordine al piatto</h2>
          <div className="mt-8 space-y-4">
            {flusso.map((s) => (
              <div key={s.n} className="flex gap-6 rounded-2xl border border-white/8 bg-white/[0.03] p-6">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#ff6b00] text-lg font-black text-white">
                  {s.n}
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

      {/* Vantaggi */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-screen-xl px-4 sm:px-6">
          <p className="text-xs font-black uppercase text-[#ff6b00]">I benefici</p>
          <h2 className="mt-2 text-2xl font-black sm:text-3xl">Cosa cambia per il tuo locale</h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {vantaggi.map((v) => (
              <div key={v.titolo} className="rounded-2xl border border-white/8 bg-white/[0.04] p-5">
                <h3 className="font-black text-[#ff6b00]">{v.titolo}</h3>
                <p className="mt-2 text-sm font-bold leading-6 text-white/55">{v.testo}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pannello cucina preview */}
      <section className="bg-[#0a0a0a] py-16">
        <div className="mx-auto max-w-screen-xl px-4 sm:px-6">
          <p className="text-xs font-black uppercase text-[#ff6b00]">Pannello cucina</p>
          <h2 className="mt-2 text-2xl font-black sm:text-3xl">Semplice, anche in corsa</h2>
          <p className="mt-3 text-sm font-bold text-white/55 max-w-xl">
            Il pannello cucina di Arrivo è pensato per essere usato con le mani sporche di farina.
            Font grande, colori netti, priorità visiva immediata.
          </p>
          <div className="mt-8 overflow-hidden rounded-[2rem] border border-white/10 bg-[#111] p-6">
            <p className="mb-4 text-xs font-black text-white/30">ORDINI ATTIVI — 13:00</p>
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                { tavolo: "T.3", piatti: ["Carbonara ×2", "Tiramisù ×1"], stato: "In preparazione", color: "text-[#ff6b00] bg-[#ff6b00]/10" },
                { tavolo: "T.5", piatti: ["Bistecca media ×1", "Insalata ×1"], stato: "Pronto", color: "text-green-400 bg-green-500/10" },
                { tavolo: "T.7", piatti: ["Risotto ×3"], stato: "In arrivo", color: "text-blue-400 bg-blue-500/10" },
              ].map((o) => (
                <div key={o.tavolo} className="rounded-2xl border border-white/8 bg-white/[0.04] p-5">
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-black">{o.tavolo}</span>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-black ${o.color}`}>{o.stato}</span>
                  </div>
                  <ul className="mt-3 space-y-1">
                    {o.piatti.map((p) => (
                      <li key={p} className="text-sm font-bold text-white/70">• {p}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <p className="mt-4 text-center text-xs font-bold text-white/25">Anteprima — dati dimostrativi</p>
          </div>
        </div>
      </section>

      <FooterPubblico />
    </main>
  );
}
