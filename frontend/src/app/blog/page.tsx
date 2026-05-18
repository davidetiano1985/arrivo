import FooterPubblico from "@/components/FooterPubblico";
import NavbarPubblica from "@/components/NavbarPubblica";

const articoliDemo = [
  { titolo: "Come Arrivo sta cambiando l'esperienza ristorante", categoria: "Prodotto", data: "Prossimamente", desc: "Un'analisi del problema delle attese nei ristoranti e come la tecnologia può risolverlo." },
  { titolo: "Perché i ristoratori scelgono Arrivo", categoria: "Ristoratori", data: "Prossimamente", desc: "Storie di locali che hanno ottimizzato cucina, sala e incasso grazie alla prenotazione intelligente." },
  { titolo: "Il futuro del food-tech in Italia", categoria: "Settore", data: "Prossimamente", desc: "Tendenze, numeri e opportunità nel mercato della ristorazione digitale italiana." },
  { titolo: "Ordina prima di arrivare: la guida completa", categoria: "Guide", data: "Prossimamente", desc: "Come funziona il pre-ordine su Arrivo, passo dopo passo." },
  { titolo: "5 modi per risparmiare tempo al ristorante", categoria: "Tips", data: "Prossimamente", desc: "Consigli pratici per rendere ogni uscita al ristorante più veloce e piacevole." },
  { titolo: "Arrivo per i locali: guida all'onboarding", categoria: "Ristoratori", data: "Prossimamente", desc: "Tutto quello che devi sapere per portare il tuo locale su Arrivo in meno di un giorno." },
];

export default function BlogPage() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-black text-white">
      <NavbarPubblica />

      {/* Hero */}
      <section className="mx-auto max-w-screen-xl px-4 py-16 sm:px-6 sm:py-24">
        <span className="inline-flex rounded-full border border-[#ff6b00]/40 bg-[#ff6b00]/10 px-4 py-1.5 text-xs font-black uppercase text-[#ff6b00]">
          Blog
        </span>
        <h1 className="mt-5 text-4xl font-black leading-tight sm:text-5xl">
          Storie, guide e<br />
          <span className="text-[#ff6b00]">news da Arrivo.</span>
        </h1>
        <p className="mt-6 max-w-xl text-sm font-bold leading-7 text-white/55">
          Articoli sul futuro del food-tech, guide per ristoratori e clienti, e notizie dalla nostra startup.
        </p>
      </section>

      {/* Banner "in arrivo" */}
      <section className="bg-[#0a0a0a] py-12">
        <div className="mx-auto max-w-screen-xl px-4 sm:px-6">
          <div className="rounded-2xl border border-[#ff6b00]/20 bg-[#ff6b00]/5 p-8 text-center">
            <p className="text-2xl font-black">Il blog è in arrivo.</p>
            <p className="mt-2 text-sm font-bold text-white/55">
              Stiamo preparando contenuti di qualità su food-tech, ristorazione e prodotto.
              Nel frattempo, puoi leggere un&apos;anteprima degli articoli in programma.
            </p>
          </div>
        </div>
      </section>

      {/* Card articoli demo */}
      <section className="py-16">
        <div className="mx-auto max-w-screen-xl px-4 sm:px-6">
          <p className="text-xs font-black uppercase text-white/40">In programma</p>
          <h2 className="mt-2 text-2xl font-black sm:text-3xl">Prossimi articoli</h2>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {articoliDemo.map((art) => (
              <div key={art.titolo} className="rounded-2xl border border-white/8 bg-white/[0.03] p-6 transition hover:border-white/15">
                <span className="inline-block rounded-full bg-[#ff6b00]/15 px-3 py-1 text-[10px] font-black uppercase text-[#ff6b00]">
                  {art.categoria}
                </span>
                <h3 className="mt-3 font-black leading-snug">{art.titolo}</h3>
                <p className="mt-2 text-sm font-bold leading-6 text-white/50">{art.desc}</p>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-xs font-bold text-white/30">{art.data}</span>
                  <span className="rounded-full border border-white/15 px-3 py-1 text-xs font-black text-white/40">
                    In arrivo
                  </span>
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
