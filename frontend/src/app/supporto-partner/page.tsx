import FooterPubblico from "@/components/FooterPubblico";
import NavbarPubblica from "@/components/NavbarPubblica";

const faq = [
  {
    d: "Come registro il mio locale su Arrivo?",
    r: "Vai su arrivoapp.it/registra-attivita, crea un account partner e inserisci i dati del locale. Il tuo profilo sarà attivo entro 24 ore dalla verifica.",
  },
  {
    d: "Quanto costa usare Arrivo?",
    r: "La registrazione è gratuita. Arrivo applica una commissione sulle transazioni gestite tramite piattaforma. I dettagli del piano vengono comunicati durante l'onboarding.",
  },
  {
    d: "Come ricevo le prenotazioni?",
    r: "Ogni nuova prenotazione appare in tempo reale nella tua dashboard e genera una notifica via email. Puoi anche integrare le notifiche via app.",
  },
  {
    d: "Posso gestire più sedi con un unico account?",
    r: "Sì. Il pannello partner supporta la gestione di più sedi. Ogni sede ha la propria dashboard, menu e disponibilità indipendenti.",
  },
  {
    d: "Come funziona il pagamento? Quando ricevo i soldi?",
    r: "I clienti pagano online prima di arrivare. I fondi vengono trasferiti sul tuo conto entro 2-3 giorni lavorativi, al netto della commissione.",
  },
  {
    d: "Posso modificare il menu in qualsiasi momento?",
    r: "Sì. Dal pannello partner puoi aggiornare piatti, prezzi e disponibilità in tempo reale. Le modifiche sono visibili ai clienti immediatamente.",
  },
  {
    d: "Cosa succede se devo chiudere il locale per un giorno?",
    r: "Puoi bloccare le disponibilità per date specifiche dalla sezione 'Orari e disponibilità' della dashboard. Nessuna prenotazione verrà accettata per quelle fasce.",
  },
  {
    d: "Come posso contattare il supporto Arrivo?",
    r: "Scrivi a davidetiano@arrivoapp.it oppure usa il form di contatto su arrivoapp.it/contatti. Il team risponde entro 24 ore lavorative.",
  },
];

export default function SupportoPartnerPage() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-black text-white">
      <NavbarPubblica />

      {/* Hero */}
      <section className="mx-auto max-w-screen-xl px-4 py-16 sm:px-6 sm:py-24">
        <span className="inline-flex rounded-full border border-[#ff6b00]/40 bg-[#ff6b00]/10 px-4 py-1.5 text-xs font-black uppercase text-[#ff6b00]">
          Supporto partner
        </span>
        <h1 className="mt-5 text-4xl font-black leading-tight sm:text-5xl">
          Siamo qui per<br />
          <span className="text-[#ff6b00]">aiutarti.</span>
        </h1>
        <p className="mt-6 max-w-xl text-base font-bold leading-7 text-white/60">
          Hai domande sulla gestione del tuo locale su Arrivo? Trova le risposte qui sotto
          o contattaci direttamente. Risposta garantita entro 24 ore.
        </p>
      </section>

      {/* Canali di supporto */}
      <section className="bg-[#0a0a0a] py-14">
        <div className="mx-auto max-w-screen-xl px-4 sm:px-6">
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { titolo: "Email partner", desc: "Scrivi a davidetiano@arrivoapp.it per questioni tecniche, commerciali o operative.", cta: "Scrivi →", href: "mailto:davidetiano@arrivoapp.it" },
              { titolo: "Onboarding dedicato", desc: "Per i nuovi partner offriamo una sessione di setup guidato. Prenota una call.", cta: "Prenota call →", href: "mailto:davidetiano@arrivoapp.it?subject=Richiesta onboarding" },
              { titolo: "Documentazione", desc: "Guide dettagliate su dashboard, menu, prenotazioni e pagamenti. In preparazione.", cta: "Presto disponibile", href: "#" },
            ].map((c) => (
              <div key={c.titolo} className="rounded-2xl border border-white/8 bg-white/[0.04] p-6">
                <h3 className="font-black text-[#ff6b00]">{c.titolo}</h3>
                <p className="mt-2 text-sm font-bold leading-6 text-white/55">{c.desc}</p>
                <a href={c.href} className="mt-4 block text-sm font-black text-white transition hover:text-[#ff6b00]">
                  {c.cta}
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-screen-xl px-4 sm:px-6">
          <p className="text-xs font-black uppercase text-[#ff6b00]">Domande frequenti</p>
          <h2 className="mt-2 text-2xl font-black sm:text-3xl">FAQ per i partner</h2>
          <div className="mt-8 space-y-3">
            {faq.map((f) => (
              <div key={f.d} className="rounded-2xl border border-white/8 bg-white/[0.03] p-6">
                <h3 className="font-black">{f.d}</h3>
                <p className="mt-2 text-sm font-bold leading-6 text-white/55">{f.r}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA contatto diretto */}
      <section className="bg-[#0a0a0a] py-16">
        <div className="mx-auto max-w-screen-xl px-4 sm:px-6">
          <div className="rounded-[2rem] bg-[#ff6b00] p-8 sm:p-10 lg:flex lg:items-center lg:justify-between">
            <div>
              <h2 className="text-2xl font-black text-white sm:text-3xl">Non hai trovato risposta?</h2>
              <p className="mt-2 text-sm font-bold text-white/80">
                Scrivici direttamente. Il team risponde entro 24 ore lavorative.
              </p>
            </div>
            <a
              href="mailto:davidetiano@arrivoapp.it"
              className="mt-6 block shrink-0 rounded-2xl bg-black px-7 py-3.5 text-center text-sm font-black text-white transition hover:bg-white hover:text-black lg:mt-0"
            >
              Contattaci →
            </a>
          </div>
        </div>
      </section>

      <FooterPubblico />
    </main>
  );
}
