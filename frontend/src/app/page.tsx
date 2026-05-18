import Link from "next/link";

import FooterPubblico from "../components/FooterPubblico";
import HeaderPublico from "../components/HeaderPublico";

// ── Dati mock inline per la homepage ─────────────────────────────────────────

type MockLocale = {
  nome: string;
  categoria: string;
  rating: string;
  tempo: string;
  tag: string;
  sfondo: string;
  avatar: string;
  avatarTesto: string;
};

const evidenza: MockLocale[] = [
  { nome: "Sushi Zen", categoria: "Sushi · Giapponese", rating: "4.9", tempo: "20 min", tag: "Top rated", sfondo: "bg-[#0d1520]", avatar: "bg-[#ff6b00]", avatarTesto: "text-white" },
  { nome: "Grill House", categoria: "Steakhouse · Grill", rating: "4.8", tempo: "25 min", tag: "Premium", sfondo: "bg-[#1a0800]", avatar: "bg-white", avatarTesto: "text-black" },
  { nome: "Pizzeria Napoli", categoria: "Pizza · Napoletana", rating: "4.8", tempo: "18 min", tag: "Popolare", sfondo: "bg-[#ff6b00]", avatar: "bg-black", avatarTesto: "text-white" },
  { nome: "Le Gourmet", categoria: "Fine dining · Italiano", rating: "4.9", tempo: "30 min", tag: "Esclusivo", sfondo: "bg-[#111827]", avatar: "bg-[#ff6b00]", avatarTesto: "text-white" },
  { nome: "Sunday Brunch", categoria: "Brunch · Colazione", rating: "4.7", tempo: "15 min", tag: "Novità", sfondo: "bg-[#1a0a2e]", avatar: "bg-white", avatarTesto: "text-black" },
];

const steps = [
  { num: "01", titolo: "Scegli il ristorante", testo: "Esplora locali per cucina, zona o disponibilità. Filtra per orario e stile." },
  { num: "02", titolo: "Prenota il tavolo", testo: "Scegli data, orario e numero di ospiti. Conferma in pochi secondi, senza telefonate." },
  { num: "03", titolo: "Ordina prima di arrivare", testo: "Sfoglia il menu e invia l'ordine dal telefono. La cucina inizia a preparare." },
  { num: "04", titolo: "Arriva e siediti", testo: "Tavolo pronto, piatto in cucina, niente code. Goditi il pasto dal primo secondo." },
];

const vantaggiCliente = [
  { titolo: "Zero attese", testo: "Niente fila, niente sala d'aspetto. Il tavolo è tuo dall'arrivo." },
  { titolo: "Tavolo garantito", testo: "Prenotazione confermata in tempo reale. Nessuna sorpresa all'ingresso." },
  { titolo: "Ordine già in cucina", testo: "Il tuo piatto inizia a essere preparato prima che tu arrivi al locale." },
  { titolo: "Esperienza migliore", testo: "Più tempo a tavola, meno tempo perso. Più rilassante, sempre." },
];

const vantaggiRistorante = [
  { titolo: "Cucina organizzata", testo: "Ordini anticipati permettono una gestione più efficiente della produzione." },
  { titolo: "Meno caos in sala", testo: "Lo staff si concentra sul servizio, non sulle modifiche last minute." },
  { titolo: "Tavoli ottimizzati", testo: "Visione completa delle prenotazioni e turnover intelligente dei coperti." },
  { titolo: "Ordini programmati", testo: "Prevedibilità degli ordini: meno sprechi, più qualità costante." },
];

const categorie = ["Pizza", "Sushi", "Gourmet", "Steakhouse", "Aperitivo", "Street food", "Healthy", "Dessert"];

// ── Pagina ───────────────────────────────────────────────────────────────────

export default function Home() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-black text-white">

      {/* ── HEADER ── */}
      <div className="mx-auto max-w-screen-xl px-4 sm:px-6">
        <header className="flex items-center justify-between gap-3 py-5">
          <div className="min-w-0">
            <img src="/arrivo_logo.svg" alt="Arrivo" className="h-10 w-auto" />
            <p className="mt-0.5 text-[10px] font-bold uppercase text-white/40">
              Prenota · Ordina · Arriva
            </p>
          </div>
          <HeaderPublico />
        </header>
      </div>

      {/* ── HERO ── */}
      <section className="mx-auto max-w-screen-xl px-4 pb-16 pt-6 sm:px-6 sm:pt-10 lg:pt-16">
        <div className="max-w-3xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#ff6b00]/40 bg-[#ff6b00]/10 px-4 py-1.5 text-xs font-black uppercase text-[#ff6b00]">
            La nuova esperienza food
          </span>

          <h1 className="mt-5 text-[3rem] font-black leading-[0.92] tracking-tight sm:text-[4.5rem] lg:text-[5.5rem]">
            Arrivi,
            <br />
            <span className="text-[#ff6b00]">ti siedi,</span>
            <br />
            mangi.
          </h1>

          <p className="mt-6 max-w-xl text-base font-bold leading-7 text-white/60 sm:text-lg">
            Prenota il tavolo, ordina prima e trova tutto pronto quando arrivi al ristorante.
            Zero attese. Zero caos. Solo il pasto.
          </p>

          {/* Search bar */}
          <div className="mt-8 overflow-hidden rounded-2xl bg-white shadow-[0_20px_60px_rgba(255,107,0,0.15)]">
            <div className="flex flex-col sm:flex-row">
              <div className="flex-1 border-b border-black/10 px-5 py-4 sm:border-b-0 sm:border-r">
                <p className="text-[10px] font-black uppercase text-black/40">Ristorante o cucina</p>
                <input
                  className="mt-1 w-full bg-transparent text-sm font-black text-black outline-none placeholder:text-black/30"
                  placeholder="Es. Sushi, Pizza, Steakhouse…"
                  type="text"
                />
              </div>
              <div className="border-b border-black/10 px-5 py-4 sm:w-44 sm:border-b-0 sm:border-r">
                <p className="text-[10px] font-black uppercase text-black/40">Città</p>
                <input
                  className="mt-1 w-full bg-transparent text-sm font-black text-black outline-none placeholder:text-black/30"
                  placeholder="Milano, Roma…"
                  type="text"
                />
              </div>
              <div className="p-3">
                <button className="h-full w-full rounded-xl bg-[#ff6b00] px-6 py-3 text-sm font-black text-white transition hover:bg-[#e05e00] sm:h-auto sm:w-auto">
                  Cerca
                </button>
              </div>
            </div>
          </div>

          {/* CTA buttons */}
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <button className="h-13 rounded-2xl bg-[#ff6b00] px-7 py-3.5 text-sm font-black text-white transition hover:bg-[#e05e00]">
              Trova un ristorante
            </button>
            <Link
              href="/registrati/locale"
              className="h-13 rounded-2xl border border-white/20 px-7 py-3.5 text-sm font-black text-white/80 transition hover:border-white/50 hover:text-white text-center"
            >
              Per i ristoratori →
            </Link>
          </div>
        </div>

        {/* Stats strip */}
        <div className="mt-12 grid grid-cols-3 gap-4 border-t border-white/10 pt-10 sm:flex sm:gap-12">
          {[
            { val: "500+", lab: "Locali partner" },
            { val: "12.000+", lab: "Prenotazioni" },
            { val: "4.9", lab: "Rating medio" },
          ].map((s) => (
            <div key={s.lab}>
              <p className="text-2xl font-black text-[#ff6b00] sm:text-3xl">{s.val}</p>
              <p className="mt-1 text-xs font-bold text-white/45">{s.lab}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── COME FUNZIONA ── */}
      <section className="bg-[#0a0a0a] py-16 sm:py-20">
        <div className="mx-auto max-w-screen-xl px-4 sm:px-6">
          <div className="mb-10 max-w-lg">
            <p className="text-xs font-black uppercase text-[#ff6b00]">Come funziona</p>
            <h2 className="mt-2 text-3xl font-black sm:text-4xl">
              Dal telefono al tavolo,<br />in quattro mosse.
            </h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step) => (
              <div
                key={step.num}
                className="rounded-[1.5rem] border border-white/8 bg-white/[0.04] p-6 transition hover:border-[#ff6b00]/30 hover:bg-white/[0.07]"
              >
                <p className="text-4xl font-black text-[#ff6b00]/30">{step.num}</p>
                <h3 className="mt-4 text-lg font-black leading-tight">{step.titolo}</h3>
                <p className="mt-2 text-sm font-bold leading-6 text-white/50">{step.testo}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CATEGORIE ── */}
      <section className="py-12 sm:py-14">
        <div className="mx-auto max-w-screen-xl px-4 sm:px-6">
          <div className="mb-6 flex items-end justify-between">
            <div>
              <p className="text-xs font-black uppercase text-[#ff6b00]">Esplora</p>
              <h2 className="mt-1 text-2xl font-black sm:text-3xl">Scegli la cucina</h2>
            </div>
          </div>

          <div className="flex flex-wrap gap-2.5">
            {categorie.map((cat, i) => (
              <button
                key={cat}
                className={`rounded-full px-5 py-2.5 text-sm font-black transition ${
                  i === 0
                    ? "bg-[#ff6b00] text-white"
                    : "border border-white/15 text-white/75 hover:border-[#ff6b00]/50 hover:text-white"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── RISTORANTI IN EVIDENZA ── */}
      <section className="pb-16">
        <div className="mx-auto max-w-screen-xl px-4 sm:px-6">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <p className="text-xs font-black uppercase text-[#ff6b00]">Ristoranti in evidenza</p>
              <h2 className="mt-1 text-2xl font-black sm:text-3xl">I più prenotati</h2>
            </div>
            <button className="hidden rounded-full border border-white/15 px-4 py-2 text-sm font-black text-white/70 transition hover:border-white/40 hover:text-white sm:block">
              Vedi tutti
            </button>
          </div>

          {/* Horizontal scroll su mobile, grid su desktop */}
          <div className="-mx-4 flex gap-4 overflow-x-auto px-4 pb-4 sm:-mx-6 sm:px-6 lg:mx-0 lg:grid lg:grid-cols-3 lg:overflow-visible lg:px-0 lg:pb-0 xl:grid-cols-5">
            {evidenza.map((locale) => (
              <article
                key={locale.nome}
                className="w-72 shrink-0 overflow-hidden rounded-[1.75rem] bg-white text-black shadow-[0_18px_45px_rgba(0,0,0,0.35)] transition hover:-translate-y-1 hover:shadow-[0_24px_55px_rgba(0,0,0,0.45)] lg:w-auto xl:w-auto"
              >
                {/* Card header */}
                <div className={`relative h-36 ${locale.sfondo} p-4`}>
                  <span className="absolute left-4 top-4 rounded-full bg-black/40 px-3 py-1 text-[10px] font-black text-white backdrop-blur-sm">
                    {locale.tag}
                  </span>
                  <div className={`absolute bottom-4 right-4 grid h-14 w-14 place-items-center rounded-2xl text-2xl font-black ${locale.avatar} ${locale.avatarTesto}`}>
                    {locale.nome.charAt(0)}
                  </div>
                </div>

                {/* Card body */}
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="break-words font-black">{locale.nome}</h3>
                      <p className="mt-0.5 text-xs font-bold text-black/50">{locale.categoria}</p>
                    </div>
                    <span className="shrink-0 rounded-full bg-black px-2 py-0.5 text-xs font-black text-white">
                      ★ {locale.rating}
                    </span>
                  </div>

                  <div className="mt-3 flex items-center gap-2 text-xs font-bold text-black/45">
                    <span>⏱ {locale.tempo}</span>
                    <span>·</span>
                    <span>Tavoli disponibili</span>
                  </div>

                  <button className="mt-4 h-10 w-full rounded-xl bg-[#ff6b00] text-sm font-black text-white transition hover:bg-[#e05e00]">
                    Prenota ora
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── VANTAGGI CLIENTE ── */}
      <section className="bg-[#0a0a0a] py-16 sm:py-20">
        <div className="mx-auto max-w-screen-xl px-4 sm:px-6">
          <div className="lg:grid lg:grid-cols-2 lg:gap-16">
            <div className="mb-10 lg:mb-0">
              <p className="text-xs font-black uppercase text-[#ff6b00]">Per te</p>
              <h2 className="mt-2 text-3xl font-black leading-tight sm:text-4xl">
                L'esperienza di un ristorante
                <br />
                <span className="text-[#ff6b00]">senza le seccature.</span>
              </h2>
              <p className="mt-4 max-w-md text-sm font-bold leading-7 text-white/50">
                Arrivo elimina l'attesa e il caos. Tu scegli, prenoti, ordini e arrivi già sapendo cosa ti aspetta.
              </p>
              <button className="mt-6 rounded-2xl bg-[#ff6b00] px-6 py-3 text-sm font-black text-white transition hover:bg-[#e05e00]">
                Registrati gratis
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {vantaggiCliente.map((v) => (
                <div
                  key={v.titolo}
                  className="rounded-2xl border border-white/8 bg-white/[0.04] p-5"
                >
                  <div className="mb-3 h-8 w-8 rounded-xl bg-[#ff6b00]/20 flex items-center justify-center">
                    <div className="h-3 w-3 rounded-full bg-[#ff6b00]" />
                  </div>
                  <h3 className="font-black">{v.titolo}</h3>
                  <p className="mt-1.5 text-xs font-bold leading-5 text-white/45">{v.testo}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── VANTAGGI RISTORANTE ── */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-screen-xl px-4 sm:px-6">
          <div className="lg:grid lg:grid-cols-2 lg:gap-16">
            <div className="order-2 mb-10 grid grid-cols-2 gap-4 lg:order-1 lg:mb-0">
              {vantaggiRistorante.map((v) => (
                <div
                  key={v.titolo}
                  className="rounded-2xl border border-white/8 bg-white/[0.04] p-5"
                >
                  <div className="mb-3 h-8 w-8 rounded-xl bg-white/10 flex items-center justify-center">
                    <div className="h-3 w-3 rounded-full bg-white/60" />
                  </div>
                  <h3 className="font-black">{v.titolo}</h3>
                  <p className="mt-1.5 text-xs font-bold leading-5 text-white/45">{v.testo}</p>
                </div>
              ))}
            </div>

            <div className="order-1 mb-10 lg:order-2 lg:mb-0">
              <p className="text-xs font-black uppercase text-white/40">Per il tuo locale</p>
              <h2 className="mt-2 text-3xl font-black leading-tight sm:text-4xl">
                Gestisci il tuo ristorante
                <br />
                <span className="text-white">in modo intelligente.</span>
              </h2>
              <p className="mt-4 max-w-md text-sm font-bold leading-7 text-white/50">
                Prenotazioni, ordini anticipati e gestione tavoli in un unico pannello. Meno caos, più controllo.
              </p>
              <Link
                href="/registrati/locale"
                className="mt-6 inline-block rounded-2xl border border-white/20 px-6 py-3 text-sm font-black text-white transition hover:border-white/50"
              >
                Porta il tuo locale su Arrivo →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA RISTORATORI ── */}
      <section className="py-8 sm:py-12">
        <div className="mx-auto max-w-screen-xl px-4 sm:px-6">
          <div className="overflow-hidden rounded-[2rem] bg-[#ff6b00] p-8 sm:p-10 lg:flex lg:items-center lg:justify-between lg:gap-8 lg:p-12">
            <div>
              <p className="text-xs font-black uppercase text-white/60">Per i ristoratori</p>
              <h2 className="mt-2 text-3xl font-black text-white sm:text-4xl">
                Hai un ristorante?
              </h2>
              <p className="mt-3 max-w-lg text-sm font-bold leading-7 text-white/80">
                Porta il tuo locale su Arrivo e organizza prenotazioni, tavoli e ordini in modo intelligente.
                Aumenta i coperti, riduci il caos, offri un'esperienza migliore.
              </p>
            </div>
            <div className="mt-6 flex shrink-0 flex-col gap-3 sm:flex-row lg:mt-0">
              <Link
                href="/registrati/locale"
                className="rounded-2xl bg-black px-7 py-3.5 text-center text-sm font-black text-white transition hover:bg-white hover:text-black"
              >
                Registra il tuo locale
              </Link>
              <button className="rounded-2xl border border-white/30 px-7 py-3.5 text-sm font-black text-white transition hover:border-white/60">
                Scopri di più
              </button>
            </div>
          </div>
        </div>
      </section>

      <FooterPubblico />

      {/* ── MOBILE NAV ── */}
      <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-white/10 bg-[#070707] px-4 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] pt-3 sm:hidden">
        <div className="mx-auto grid max-w-md grid-cols-4 gap-2">
          {[
            { label: "Home", attivo: true },
            { label: "Cerca", attivo: false },
            { label: "Prenotazioni", attivo: false },
            { label: "Profilo", attivo: false },
          ].map((item) => (
            <button
              key={item.label}
              className={`flex min-h-14 flex-col items-center justify-center rounded-2xl text-xs font-black ${
                item.attivo ? "bg-[#ff6b00] text-white" : "bg-white/10 text-white/60"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </nav>

    </main>
  );
}
