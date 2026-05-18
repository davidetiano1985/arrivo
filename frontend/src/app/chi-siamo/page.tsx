import Link from "next/link";

import FooterPubblico from "@/components/FooterPubblico";
import NavbarPubblica from "@/components/NavbarPubblica";

export default function ChiSiamoPage() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-black text-white">
      <NavbarPubblica />

      {/* Hero */}
      <section className="mx-auto max-w-screen-xl px-4 py-16 sm:px-6 sm:py-24">
        <span className="inline-flex rounded-full border border-[#ff6b00]/40 bg-[#ff6b00]/10 px-4 py-1.5 text-xs font-black uppercase text-[#ff6b00]">
          Chi siamo
        </span>
        <h1 className="mt-5 text-4xl font-black leading-tight sm:text-5xl lg:text-6xl">
          Nati per eliminare<br />
          <span className="text-[#ff6b00]">l&apos;attesa al ristorante.</span>
        </h1>
        <p className="mt-6 max-w-2xl text-base font-bold leading-7 text-white/60 sm:text-lg">
          Arrivo è una piattaforma food-tech che trasforma il modo in cui le persone vivono l&apos;esperienza del ristorante.
          Non siamo delivery. Siamo il futuro della prenotazione intelligente.
        </p>
      </section>

      {/* Problema */}
      <section className="bg-[#0a0a0a] py-16 sm:py-20">
        <div className="mx-auto max-w-screen-xl px-4 sm:px-6">
          <div className="lg:grid lg:grid-cols-2 lg:gap-16">
            <div>
              <p className="text-xs font-black uppercase text-[#ff6b00]">Il problema</p>
              <h2 className="mt-3 text-3xl font-black sm:text-4xl">Andare al ristorante non dovrebbe essere stressante.</h2>
              <p className="mt-4 text-sm font-bold leading-7 text-white/55">
                Eppure capita sempre: attesa in piedi all&apos;ingresso, menu da sfogliare per venti minuti,
                ordine che arriva tardi, conto lento. Tempo sprecato. Esperienza rovinata.
              </p>
              <p className="mt-3 text-sm font-bold leading-7 text-white/55">
                Davide Tiano ha vissuto questo problema ogni settimana. E ha deciso di risolverlo.
              </p>
            </div>
            <div className="mt-10 grid grid-cols-2 gap-4 lg:mt-0">
              {[
                { n: "45 min", lab: "Attesa media al ristorante" },
                { n: "3x", lab: "Più lento senza prenotazione" },
                { n: "68%", lab: "Clienti frustrati dall'attesa" },
                { n: "0 min", lab: "Attesa con Arrivo" },
              ].map((s) => (
                <div key={s.lab} className="rounded-2xl border border-white/8 bg-white/[0.04] p-5">
                  <p className="text-3xl font-black text-[#ff6b00]">{s.n}</p>
                  <p className="mt-1 text-xs font-bold text-white/50">{s.lab}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* La soluzione */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-screen-xl px-4 sm:px-6">
          <div className="mb-10 max-w-xl">
            <p className="text-xs font-black uppercase text-[#ff6b00]">La soluzione</p>
            <h2 className="mt-3 text-3xl font-black sm:text-4xl">
              Arrivi, ti siedi, mangi.
            </h2>
            <p className="mt-4 text-sm font-bold leading-7 text-white/55">
              Con Arrivo prenoti il tavolo, ordini dal menu e paghi — tutto prima di arrivare.
              Quando entri nel locale, il tavolo ti aspetta e il piatto è già in cucina.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { titolo: "Per i clienti", testo: "Zero attese, tavolo pronto, ordine già in cucina. Un'esperienza ristorante finalmente smart." },
              { titolo: "Per i locali", testo: "Ordini programmati, cucina organizzata, sala senza caos. Più coperti, più qualità, più controllo." },
              { titolo: "Per il futuro", testo: "Arrivo nasce oggi ma pensa in grande: ogni locale food in Italia, accessibile in tre tap." },
            ].map((c) => (
              <div key={c.titolo} className="rounded-2xl border border-white/8 bg-white/[0.04] p-6">
                <h3 className="font-black text-[#ff6b00]">{c.titolo}</h3>
                <p className="mt-2 text-sm font-bold leading-6 text-white/55">{c.testo}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Chi ha creato Arrivo */}
      <section className="bg-[#0a0a0a] py-16 sm:py-20">
        <div className="mx-auto max-w-screen-xl px-4 sm:px-6">
          <p className="text-xs font-black uppercase text-[#ff6b00]">Il team fondatore</p>
          <h2 className="mt-3 text-3xl font-black sm:text-4xl">Le persone dietro Arrivo</h2>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:max-w-2xl">
            {[
              {
                nome: "Davide Tiano",
                ruolo: "Founder & CEO",
                bio: "Ha ideato e costruito Arrivo con la visione di rendere l'esperienza ristorante più intelligente, veloce e piacevole per tutti.",
                email: "davidetiano@arrivoapp.it",
              },
              {
                nome: "Silvia Russo",
                ruolo: "Co-founder",
                bio: "Ha sostenuto la nascita di Arrivo contribuendo alla visione del prodotto e allo sviluppo della piattaforma.",
                email: "silviarusso@arrivoapp.it",
              },
            ].map((p) => (
              <div key={p.nome} className="rounded-2xl border border-white/10 bg-white/[0.04] p-6">
                <div className="flex items-center gap-4">
                  <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-[#ff6b00] text-xl font-black">
                    {p.nome.charAt(0)}
                  </div>
                  <div>
                    <p className="font-black">{p.nome}</p>
                    <p className="text-xs font-bold text-white/45">{p.ruolo}</p>
                  </div>
                </div>
                <p className="mt-4 text-sm font-bold leading-6 text-white/55">{p.bio}</p>
                <a className="mt-3 block text-xs font-black text-[#ff6b00]" href={`mailto:${p.email}`}>{p.email}</a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16">
        <div className="mx-auto max-w-screen-xl px-4 sm:px-6">
          <div className="rounded-[2rem] bg-[#ff6b00] p-8 sm:p-10 lg:flex lg:items-center lg:justify-between lg:gap-8">
            <div>
              <h2 className="text-2xl font-black text-white sm:text-3xl">Entra nel futuro del ristorante.</h2>
              <p className="mt-2 text-sm font-bold text-white/80">Registrati gratis e scopri come Arrivo cambia l&apos;esperienza.</p>
            </div>
            <div className="mt-6 flex shrink-0 gap-3 lg:mt-0">
              <Link className="rounded-2xl bg-black px-6 py-3 text-sm font-black text-white transition hover:bg-white hover:text-black" href="/registrati">
                Registrati
              </Link>
              <Link className="rounded-2xl border border-white/30 px-6 py-3 text-sm font-black text-white transition hover:border-white/60" href="/come-funziona">
                Come funziona →
              </Link>
            </div>
          </div>
        </div>
      </section>

      <FooterPubblico />
    </main>
  );
}
