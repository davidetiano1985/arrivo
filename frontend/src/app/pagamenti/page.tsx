import FooterPubblico from "@/components/FooterPubblico";
import NavbarPubblica from "@/components/NavbarPubblica";

const metodi = [
  {
    nome: "Carta di credito / debito",
    desc: "Visa, Mastercard, American Express. Pagamento sicuro con crittografia SSL a 256 bit.",
    icona: "💳",
  },
  {
    nome: "Apple Pay",
    desc: "Paga con Face ID o Touch ID direttamente dall'app. Zero inserimento dati.",
    icona: "🍎",
  },
  {
    nome: "Google Pay",
    desc: "Pagamento rapido con il tuo account Google. Un tap e sei a posto.",
    icona: "🔵",
  },
  {
    nome: "PayPal",
    desc: "Collega il tuo conto PayPal per pagare in modo semplice e protetto.",
    icona: "🅿️",
  },
];

const garanzie = [
  { titolo: "Pagamento crittografato", testo: "Ogni transazione è protetta da SSL a 256 bit. I tuoi dati non vengono mai memorizzati in chiaro." },
  { titolo: "3D Secure", testo: "Autenticazione a due fattori per ogni pagamento. Solo tu puoi autorizzare la tua carta." },
  { titolo: "Rimborso istantaneo", testo: "In caso di cancellazione o problema, il rimborso viene processato entro 24 ore." },
  { titolo: "Nessuna commissione", testo: "Non addebitiamo costi extra sul pagamento. Il prezzo che vedi è quello che paghi." },
];

export default function PagamentiPage() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-black text-white">
      <NavbarPubblica />

      {/* Hero */}
      <section className="mx-auto max-w-screen-xl px-4 py-16 sm:px-6 sm:py-24">
        <span className="inline-flex rounded-full border border-[#ff6b00]/40 bg-[#ff6b00]/10 px-4 py-1.5 text-xs font-black uppercase text-[#ff6b00]">
          Pagamenti
        </span>
        <h1 className="mt-5 text-4xl font-black leading-tight sm:text-5xl">
          Paga come vuoi,<br />
          <span className="text-[#ff6b00]">senza pensieri.</span>
        </h1>
        <p className="mt-6 max-w-xl text-base font-bold leading-7 text-white/60">
          Su Arrivo paghi online prima di arrivare. Niente conto da aspettare a fine pasto,
          niente imbarazzo per il resto. Tutto già risolto.
        </p>
      </section>

      {/* Metodi di pagamento */}
      <section className="bg-[#0a0a0a] py-16 sm:py-20">
        <div className="mx-auto max-w-screen-xl px-4 sm:px-6">
          <p className="text-xs font-black uppercase text-[#ff6b00]">Metodi accettati</p>
          <h2 className="mt-2 text-2xl font-black sm:text-3xl">Come puoi pagare</h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {metodi.map((m) => (
              <div key={m.nome} className="flex items-start gap-4 rounded-2xl border border-white/8 bg-white/[0.04] p-6">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/[0.06] text-2xl">
                  {m.icona}
                </div>
                <div>
                  <h3 className="font-black">{m.nome}</h3>
                  <p className="mt-1 text-sm font-bold leading-6 text-white/55">{m.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sicurezza */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-screen-xl px-4 sm:px-6">
          <p className="text-xs font-black uppercase text-[#ff6b00]">La nostra sicurezza</p>
          <h2 className="mt-2 text-2xl font-black sm:text-3xl">Paghi in totale sicurezza</h2>
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

      {/* Come funziona il pagamento */}
      <section className="bg-[#0a0a0a] py-16 sm:py-20">
        <div className="mx-auto max-w-screen-xl px-4 sm:px-6">
          <p className="text-xs font-black uppercase text-[#ff6b00]">Il flusso</p>
          <h2 className="mt-2 text-2xl font-black sm:text-3xl">Come funziona il pagamento</h2>
          <div className="mt-8 space-y-4">
            {[
              { n: "1", t: "Completa la prenotazione e il pre-ordine", d: "Scegli il ristorante, prenota il tavolo e aggiungi i piatti che vuoi ordinare." },
              { n: "2", t: "Scegli il metodo di pagamento", d: "Carta, Apple Pay, Google Pay o PayPal. Tutto sicuro, tutto veloce." },
              { n: "3", t: "Conferma e via", d: "Il pagamento viene processato. Ricevi conferma via email. Al ristorante non devi più pensarci." },
            ].map((s) => (
              <div key={s.n} className="flex gap-5 rounded-2xl border border-white/8 bg-white/[0.03] p-5 sm:p-7">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#ff6b00] font-black text-white">
                  {s.n}
                </div>
                <div>
                  <h3 className="font-black">{s.t}</h3>
                  <p className="mt-1 text-sm font-bold leading-6 text-white/55">{s.d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <FooterPubblico />
    </main>
  );
}
