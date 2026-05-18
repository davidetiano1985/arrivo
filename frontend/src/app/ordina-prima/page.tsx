import Link from "next/link";

import FooterPubblico from "@/components/FooterPubblico";
import NavbarPubblica from "@/components/NavbarPubblica";

const vantaggi = [
  { titolo: "Zero tempo perso sul menu", testo: "Sfoglialo in tranquillità da casa. Arriva già deciso." },
  { titolo: "Piatto in cucina prima di te", testo: "Il locale inizia a preparare mentre sei ancora in viaggio." },
  { titolo: "Niente attesa al tavolo", testo: "Ti siedi e il cibo arriva. L'esperienza più fluida possibile." },
  { titolo: "Modifica fino all'ultimo", testo: "Puoi cambiare l'ordine fino a 30 minuti prima dell'arrivo." },
];

const faq = [
  { d: "Posso ordinare senza prenotare il tavolo?", r: "No. Il pre-ordine è abbinato alla prenotazione del tavolo. In questo modo il locale sa esattamente quando prepararti il piatto." },
  { d: "Cosa succede se arrivo in ritardo?", r: "Il locale viene avvisato automaticamente. La preparazione viene adeguata al tuo nuovo orario stimato." },
  { d: "Posso aggiungere allergie o preferenze?", r: "Sì. Ogni piatto ha un campo note dove puoi indicare intolleranze, varianti o richieste speciali." },
  { d: "Se un piatto non è disponibile?", r: "Il locale ti avvisa via notifica e puoi scegliere un'alternativa o ricevere rimborso immediato." },
];

export default function OrdinaPrimaPage() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-black text-white">
      <NavbarPubblica />

      {/* Hero */}
      <section className="mx-auto max-w-screen-xl px-4 py-16 sm:px-6 sm:py-24">
        <span className="inline-flex rounded-full border border-[#ff6b00]/40 bg-[#ff6b00]/10 px-4 py-1.5 text-xs font-black uppercase text-[#ff6b00]">
          Ordina prima
        </span>
        <h1 className="mt-5 text-4xl font-black leading-tight sm:text-5xl">
          Il piatto è già in cucina<br />
          <span className="text-[#ff6b00]">mentre sei in viaggio.</span>
        </h1>
        <p className="mt-6 max-w-xl text-base font-bold leading-7 text-white/60">
          Ordina dal menu prima ancora di uscire di casa. Quando arrivi al ristorante,
          non aspetti il cameriere: ti siedi e il cibo arriva.
        </p>
        <Link
          href="/trova-ristoranti"
          className="mt-8 inline-block rounded-2xl bg-[#ff6b00] px-7 py-3.5 text-sm font-black text-white transition hover:bg-[#e05e00]"
        >
          Trova un ristorante
        </Link>
      </section>

      {/* Come funziona */}
      <section className="bg-[#0a0a0a] py-16 sm:py-20">
        <div className="mx-auto max-w-screen-xl px-4 sm:px-6">
          <p className="text-xs font-black uppercase text-[#ff6b00]">Il flusso</p>
          <h2 className="mt-2 text-2xl font-black sm:text-3xl">Come funziona il pre-ordine</h2>

          <div className="mt-8 grid gap-6 lg:grid-cols-3">
            {[
              { step: "1", titolo: "Sfoglia il menu online", testo: "Ogni ristorante su Arrivo ha il menu digitale aggiornato. Foto, descrizioni, prezzi, allergeni: tutto chiaro." },
              { step: "2", titolo: "Aggiungi al carrello", testo: "Scegli i piatti per ogni ospite, aggiungi note speciali, personalizza le varianti disponibili." },
              { step: "3", titolo: "Conferma con la prenotazione", testo: "Il pre-ordine viene inviato al locale in automatico. La cucina riceve il ticket con il tuo orario di arrivo." },
            ].map((s) => (
              <div key={s.step} className="rounded-2xl border border-white/8 bg-white/[0.04] p-6">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-[#ff6b00] text-lg font-black text-white">
                  {s.step}
                </div>
                <h3 className="font-black">{s.titolo}</h3>
                <p className="mt-2 text-sm font-bold leading-6 text-white/55">{s.testo}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Vantaggi */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-screen-xl px-4 sm:px-6">
          <p className="text-xs font-black uppercase text-[#ff6b00]">Perché farlo</p>
          <h2 className="mt-2 text-2xl font-black sm:text-3xl">I vantaggi del pre-ordine</h2>
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

      {/* FAQ */}
      <section className="bg-[#0a0a0a] py-16 sm:py-20">
        <div className="mx-auto max-w-screen-xl px-4 sm:px-6">
          <p className="text-xs font-black uppercase text-[#ff6b00]">Domande frequenti</p>
          <h2 className="mt-2 text-2xl font-black sm:text-3xl">Hai dubbi?</h2>
          <div className="mt-8 space-y-4">
            {faq.map((f) => (
              <div key={f.d} className="rounded-2xl border border-white/8 bg-white/[0.03] p-6">
                <h3 className="font-black">{f.d}</h3>
                <p className="mt-2 text-sm font-bold leading-6 text-white/55">{f.r}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <FooterPubblico />
    </main>
  );
}
