import FooterPubblico from "@/components/FooterPubblico";
import NavbarPubblica from "@/components/NavbarPubblica";

const ruoli = [
  {
    area: "Sviluppo",
    tag: "Tech",
    posizioni: ["Frontend Developer (Next.js / React)", "Backend Developer (Node.js)", "Mobile Developer (React Native)"],
    desc: "Costruiamo una piattaforma che cambierà il modo di vivere il ristorante. Cerchiamo sviluppatori che amano prodotti ben fatti.",
  },
  {
    area: "Marketing & Social",
    tag: "Growth",
    posizioni: ["Social Media Manager", "Content Creator food-tech", "Growth Hacker"],
    desc: "Arrivo deve diventare il brand di riferimento nel food-tech italiano. Cerchiamo persone creative con passione per il racconto digitale.",
  },
  {
    area: "Assistenza clienti",
    tag: "Support",
    posizioni: ["Customer Support Specialist", "Onboarding Partner Specialist"],
    desc: "Il nostro servizio clienti è parte del prodotto. Cerchiamo persone empatiche, veloci e precise nella risoluzione dei problemi.",
  },
  {
    area: "Partnership attività food",
    tag: "Partnership",
    posizioni: ["Partner Account Manager", "Business Development (locali food)"],
    desc: "Portiamo i migliori locali italiani su Arrivo. Cerchiamo persone con esperienza nel settore food e capacità relazionali forti.",
  },
];

export default function LavoraConNoiPage() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-black text-white">
      <NavbarPubblica />

      {/* Hero */}
      <section className="mx-auto max-w-screen-xl px-4 py-16 sm:px-6 sm:py-24">
        <span className="inline-flex rounded-full border border-[#ff6b00]/40 bg-[#ff6b00]/10 px-4 py-1.5 text-xs font-black uppercase text-[#ff6b00]">
          Lavora con noi
        </span>
        <h1 className="mt-5 text-4xl font-black leading-tight sm:text-5xl">
          Costruiamo il futuro<br />
          <span className="text-[#ff6b00]">del ristorante, insieme.</span>
        </h1>
        <p className="mt-6 max-w-xl text-base font-bold leading-7 text-white/60">
          Arrivo è una startup food-tech in crescita. Stiamo costruendo il team che porterà questa visione in ogni ristorante d&apos;Italia.
          Se vuoi fare parte di questo progetto, vogliamo conoscerti.
        </p>
      </section>

      {/* Valori */}
      <section className="bg-[#0a0a0a] py-14">
        <div className="mx-auto max-w-screen-xl px-4 sm:px-6">
          <p className="text-xs font-black uppercase text-[#ff6b00]">Come lavoriamo</p>
          <h2 className="mt-2 text-2xl font-black sm:text-3xl">I nostri valori</h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {[
              { titolo: "Velocità", testo: "Iteriamo fast, impariamo subito, miglioriamo sempre." },
              { titolo: "Qualità", testo: "Non lanciamo cose mediocri. Ogni dettaglio conta." },
              { titolo: "Impatto reale", testo: "Lavoriamo su problemi veri per persone reali." },
            ].map((v) => (
              <div key={v.titolo} className="rounded-2xl border border-white/8 bg-white/[0.04] p-5">
                <h3 className="font-black text-[#ff6b00]">{v.titolo}</h3>
                <p className="mt-2 text-sm font-bold leading-6 text-white/55">{v.testo}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Ruoli */}
      <section className="py-16">
        <div className="mx-auto max-w-screen-xl px-4 sm:px-6">
          <p className="text-xs font-black uppercase text-[#ff6b00]">Posizioni aperte</p>
          <h2 className="mt-2 text-2xl font-black sm:text-3xl">Stiamo cercando</h2>

          <div className="mt-8 space-y-4">
            {ruoli.map((r) => (
              <div key={r.area} className="rounded-2xl border border-white/8 bg-white/[0.03] p-6 sm:p-8">
                <div className="flex flex-wrap items-start gap-3 sm:items-center">
                  <h3 className="text-xl font-black">{r.area}</h3>
                  <span className="rounded-full bg-[#ff6b00]/15 px-3 py-1 text-xs font-black text-[#ff6b00]">{r.tag}</span>
                </div>
                <p className="mt-3 text-sm font-bold leading-6 text-white/55">{r.desc}</p>
                <ul className="mt-4 space-y-2">
                  {r.posizioni.map((p) => (
                    <li key={p} className="flex items-center gap-2 text-sm font-bold text-white/70">
                      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#ff6b00]" />
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA candidatura */}
      <section className="bg-[#0a0a0a] py-16">
        <div className="mx-auto max-w-screen-xl px-4 sm:px-6">
          <div className="rounded-[2rem] bg-[#ff6b00] p-8 sm:p-10 lg:flex lg:items-center lg:justify-between">
            <div>
              <h2 className="text-2xl font-black text-white sm:text-3xl">Mandaci la tua candidatura.</h2>
              <p className="mt-2 text-sm font-bold text-white/80">
                Anche se non trovi il ruolo esatto, scrivici lo stesso. Stiamo crescendo.
              </p>
            </div>
            <a
              className="mt-6 block shrink-0 rounded-2xl bg-black px-7 py-3.5 text-center text-sm font-black text-white transition hover:bg-white hover:text-black lg:mt-0"
              href="mailto:davidetiano@arrivoapp.it"
            >
              Scrivici →
            </a>
          </div>
        </div>
      </section>

      <FooterPubblico />
    </main>
  );
}
