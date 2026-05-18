import FooterPubblico from "@/components/FooterPubblico";
import NavbarPubblica from "@/components/NavbarPubblica";

const categorie = [
  { label: "Italiana", emoji: "🍝" },
  { label: "Pizza", emoji: "🍕" },
  { label: "Sushi", emoji: "🍣" },
  { label: "Hamburger", emoji: "🍔" },
  { label: "Vegano", emoji: "🥗" },
  { label: "Pesce", emoji: "🐟" },
  { label: "Steakhouse", emoji: "🥩" },
  { label: "Dessert", emoji: "🍮" },
];

const ristoranti = [
  { nome: "Trattoria da Luca", cucina: "Italiana", citta: "Milano", voto: "4.8", tempoPrep: "15 min", priceRange: "€€" },
  { nome: "Sushi Zen", cucina: "Giapponese", citta: "Milano", voto: "4.9", tempoPrep: "20 min", priceRange: "€€€" },
  { nome: "Pizzeria Napoli Vera", cucina: "Pizza", citta: "Roma", voto: "4.7", tempoPrep: "12 min", priceRange: "€" },
  { nome: "Il Bistrot", cucina: "Francese", citta: "Torino", voto: "4.6", tempoPrep: "25 min", priceRange: "€€€" },
  { nome: "Verde & Fresco", cucina: "Vegano", citta: "Bologna", voto: "4.5", tempoPrep: "10 min", priceRange: "€€" },
  { nome: "Mar Aperto", cucina: "Pesce", citta: "Napoli", voto: "4.8", tempoPrep: "18 min", priceRange: "€€€" },
];

export default function TrovaRistorantiPage() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-black text-white">
      <NavbarPubblica />

      {/* Hero + Search */}
      <section className="mx-auto max-w-screen-xl px-4 py-16 sm:px-6 sm:py-24">
        <span className="inline-flex rounded-full border border-[#ff6b00]/40 bg-[#ff6b00]/10 px-4 py-1.5 text-xs font-black uppercase text-[#ff6b00]">
          Trova ristoranti
        </span>
        <h1 className="mt-5 text-4xl font-black leading-tight sm:text-5xl">
          Il tuo prossimo pasto<br />
          <span className="text-[#ff6b00]">a portata di tap.</span>
        </h1>
        <p className="mt-6 max-w-xl text-base font-bold leading-7 text-white/60">
          Esplora ristoranti per città, cucina o disponibilità. Prenota il tavolo e ordina prima di arrivare.
        </p>

        {/* Search bar */}
        <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex flex-1 items-center gap-3 rounded-2xl border border-white/15 bg-white/[0.05] px-4 py-3">
            <svg className="h-4 w-4 shrink-0 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <span className="text-sm font-bold text-white/30">Cerca ristorante o cucina…</span>
          </div>
          <div className="flex items-center gap-3 rounded-2xl border border-white/15 bg-white/[0.05] px-4 py-3 sm:w-48">
            <svg className="h-4 w-4 shrink-0 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            </svg>
            <span className="text-sm font-bold text-white/30">Milano</span>
          </div>
          <button className="rounded-2xl bg-[#ff6b00] px-7 py-3.5 text-sm font-black text-white transition hover:bg-[#e05e00]">
            Cerca
          </button>
        </div>
      </section>

      {/* Categorie */}
      <section className="bg-[#0a0a0a] py-12">
        <div className="mx-auto max-w-screen-xl px-4 sm:px-6">
          <p className="text-xs font-black uppercase text-[#ff6b00]">Filtra per cucina</p>
          <div className="mt-5 flex flex-wrap gap-3">
            {categorie.map((c) => (
              <button
                key={c.label}
                className="flex items-center gap-2 rounded-2xl border border-white/15 bg-white/[0.04] px-4 py-2 text-sm font-black text-white/70 transition hover:border-[#ff6b00]/50 hover:text-white"
              >
                <span>{c.emoji}</span>
                {c.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Risultati mock */}
      <section className="py-16">
        <div className="mx-auto max-w-screen-xl px-4 sm:px-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-black uppercase text-white/40">Risultati</p>
              <h2 className="mt-1 text-2xl font-black sm:text-3xl">Ristoranti disponibili</h2>
            </div>
            <span className="rounded-full border border-white/10 px-3 py-1 text-xs font-black text-white/40">
              Presto disponibile
            </span>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {ristoranti.map((r) => (
              <div key={r.nome} className="group cursor-pointer rounded-2xl border border-white/8 bg-white/[0.03] p-5 transition hover:border-white/20">
                {/* Immagine placeholder */}
                <div className="mb-4 h-36 rounded-xl bg-white/[0.06]" />
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-black leading-snug group-hover:text-[#ff6b00] transition">{r.nome}</h3>
                  <span className="shrink-0 text-sm font-black text-[#ff6b00]">★ {r.voto}</span>
                </div>
                <p className="mt-1 text-xs font-bold text-white/45">{r.cucina} · {r.citta} · {r.priceRange}</p>
                <div className="mt-3 flex items-center justify-between">
                  <span className="rounded-full bg-[#ff6b00]/10 px-3 py-1 text-xs font-black text-[#ff6b00]">
                    Pronto in {r.tempoPrep}
                  </span>
                  <span className="text-xs font-bold text-white/30">Prenota →</span>
                </div>
              </div>
            ))}
          </div>

          {/* Coming soon overlay note */}
          <div className="mt-10 rounded-2xl border border-[#ff6b00]/20 bg-[#ff6b00]/5 p-6 text-center">
            <p className="font-black">La ricerca in tempo reale è in arrivo.</p>
            <p className="mt-1 text-sm font-bold text-white/50">
              Stiamo onboarding i primi ristoranti. Registrati per essere avvisato al lancio.
            </p>
            <a
              href="/registrati"
              className="mt-4 inline-block rounded-2xl bg-[#ff6b00] px-6 py-3 text-sm font-black text-white transition hover:bg-[#e05e00]"
            >
              Registrati gratis
            </a>
          </div>
        </div>
      </section>

      <FooterPubblico />
    </main>
  );
}
