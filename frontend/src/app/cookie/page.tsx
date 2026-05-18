import FooterPubblico from "@/components/FooterPubblico";
import NavbarPubblica from "@/components/NavbarPubblica";

const tipiCookie = [
  {
    tipo: "Cookie tecnici necessari",
    desc: "Essenziali per il funzionamento del sito. Senza di essi alcune funzionalità non sarebbero disponibili.",
    esempi: ["Session token (autenticazione)", "CSRF protection token", "Preferenze di sessione"],
    base: "Interesse legittimo / Necessità tecnica",
  },
  {
    tipo: "Cookie di autenticazione",
    desc: "Utilizzati per mantenere la sessione dell'utente attiva dopo il login.",
    esempi: ["next-auth.session-token", "next-auth.csrf-token"],
    base: "Esecuzione del contratto",
  },
  {
    tipo: "Cookie analitici (in futuro)",
    desc: "Utilizzeremo strumenti di analytics privacy-first (es. Plausible) per capire come gli utenti usano la piattaforma. Nessun dato personale trasferito a terzi.",
    esempi: ["Conteggio visite aggregate", "Pagine più visitate"],
    base: "Consenso dell'utente",
  },
];

export default function CookiePage() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-black text-white">
      <NavbarPubblica />

      {/* Hero */}
      <section className="mx-auto max-w-screen-xl px-4 py-16 sm:px-6 sm:py-20">
        <span className="inline-flex rounded-full border border-[#ff6b00]/40 bg-[#ff6b00]/10 px-4 py-1.5 text-xs font-black uppercase text-[#ff6b00]">
          Cookie
        </span>
        <h1 className="mt-5 text-3xl font-black sm:text-4xl">Cookie Policy</h1>
        <p className="mt-3 text-sm font-bold text-white/40">Ultimo aggiornamento: maggio 2025</p>
        <div className="mt-4 rounded-xl border border-[#ff6b00]/20 bg-[#ff6b00]/5 p-4">
          <p className="text-xs font-bold text-white/50">
            <strong className="text-white/70">Nota:</strong> Questa policy è una bozza predisposta per il lancio.
            Verrà revisionata da un professionista legale prima del go-live.
          </p>
        </div>
      </section>

      {/* Intro */}
      <section className="pb-10">
        <div className="mx-auto max-w-screen-xl px-4 sm:px-6">
          <div className="max-w-3xl">
            <p className="text-sm font-bold leading-7 text-white/60">
              Questa Cookie Policy spiega come Arrivo (arrivoapp.it) utilizza i cookie e tecnologie simili
              per il funzionamento della piattaforma, in conformità con il GDPR e le Linee Guida del Garante
              Privacy italiano del 10 giugno 2021.
            </p>
          </div>
        </div>
      </section>

      {/* Cosa sono i cookie */}
      <section className="bg-[#0a0a0a] py-14">
        <div className="mx-auto max-w-screen-xl px-4 sm:px-6">
          <div className="max-w-3xl">
            <h2 className="text-lg font-black text-[#ff6b00]">Cosa sono i cookie?</h2>
            <p className="mt-3 text-sm font-bold leading-7 text-white/60">
              I cookie sono piccoli file di testo che i siti web salvano sul tuo browser.
              Servono a ricordare le tue preferenze, mantenere la sessione di accesso e raccogliere
              informazioni statistiche sull&apos;utilizzo del sito. Non contengono virus e non possono
              accedere ai tuoi dati personali al di fuori di quello che hai fornito al sito.
            </p>
          </div>
        </div>
      </section>

      {/* Tipi di cookie */}
      <section className="py-16">
        <div className="mx-auto max-w-screen-xl px-4 sm:px-6">
          <h2 className="text-lg font-black">Cookie utilizzati da Arrivo</h2>
          <div className="mt-6 space-y-5">
            {tipiCookie.map((c) => (
              <div key={c.tipo} className="rounded-2xl border border-white/8 bg-white/[0.03] p-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <h3 className="font-black">{c.tipo}</h3>
                  <span className="rounded-full bg-[#ff6b00]/10 px-3 py-1 text-xs font-black text-[#ff6b00]">
                    {c.base}
                  </span>
                </div>
                <p className="mt-2 text-sm font-bold leading-6 text-white/55">{c.desc}</p>
                <div className="mt-3">
                  <p className="text-xs font-black uppercase text-white/30">Esempi</p>
                  <ul className="mt-1 space-y-1">
                    {c.esempi.map((e) => (
                      <li key={e} className="flex items-center gap-2 text-xs font-bold text-white/45">
                        <span className="h-1 w-1 rounded-full bg-white/25" />
                        {e}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Gestione cookie */}
      <section className="bg-[#0a0a0a] py-16">
        <div className="mx-auto max-w-screen-xl px-4 sm:px-6">
          <div className="max-w-3xl space-y-8">
            <div>
              <h2 className="text-lg font-black text-[#ff6b00]">Come gestire i cookie</h2>
              <p className="mt-3 text-sm font-bold leading-7 text-white/60">
                Puoi gestire o eliminare i cookie tramite le impostazioni del tuo browser.
                Tieni presente che disabilitare i cookie tecnici necessari potrebbe impedire
                il corretto funzionamento della piattaforma (es. impossibilità di effettuare il login).
              </p>
              <ul className="mt-4 space-y-2 text-sm font-bold text-white/60">
                {[
                  "Chrome: Impostazioni → Privacy e sicurezza → Cookie",
                  "Firefox: Impostazioni → Privacy e sicurezza → Cookie e dati dei siti",
                  "Safari: Preferenze → Privacy → Cookie e dati dei siti web",
                  "Edge: Impostazioni → Privacy, ricerca e servizi → Cookie",
                ].map((b) => (
                  <li key={b} className="flex items-start gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#ff6b00]" />
                    {b}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h2 className="text-lg font-black text-[#ff6b00]">Cookie di terze parti</h2>
              <p className="mt-3 text-sm font-bold leading-7 text-white/60">
                Attualmente Arrivo non utilizza cookie di profilazione o marketing di terze parti.
                In futuro, l&apos;eventuale introduzione di cookie analitici sarà comunicata e
                soggetta a consenso esplicito.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-black text-[#ff6b00]">Contatti</h2>
              <p className="mt-3 text-sm font-bold leading-7 text-white/60">
                Per domande sulla Cookie Policy:
                <a href="mailto:davidetiano@arrivoapp.it" className="ml-1 text-[#ff6b00]">davidetiano@arrivoapp.it</a>.
              </p>
            </div>
          </div>
        </div>
      </section>

      <FooterPubblico />
    </main>
  );
}
