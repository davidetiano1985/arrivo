import FooterPubblico from "@/components/FooterPubblico";
import NavbarPubblica from "@/components/NavbarPubblica";

export default function ContattiPage() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-black text-white">
      <NavbarPubblica />

      {/* Hero */}
      <section className="mx-auto max-w-screen-xl px-4 py-16 sm:px-6 sm:py-24">
        <span className="inline-flex rounded-full border border-[#ff6b00]/40 bg-[#ff6b00]/10 px-4 py-1.5 text-xs font-black uppercase text-[#ff6b00]">
          Contatti
        </span>
        <h1 className="mt-5 text-4xl font-black leading-tight sm:text-5xl">
          Parliamo.<br />
          <span className="text-[#ff6b00]">Siamo qui.</span>
        </h1>
        <p className="mt-6 max-w-xl text-base font-bold leading-7 text-white/60">
          Che tu abbia una domanda, voglia segnalare un problema o proporre una collaborazione —
          scrivici. Rispondiamo entro 24 ore lavorative.
        </p>
      </section>

      {/* Contatti principali */}
      <section className="bg-[#0a0a0a] py-16">
        <div className="mx-auto max-w-screen-xl px-4 sm:px-6">
          <div className="grid gap-6 sm:grid-cols-2 lg:max-w-3xl">
            {[
              {
                nome: "Davide Tiano",
                ruolo: "Founder & CEO",
                email: "davidetiano@arrivoapp.it",
                desc: "Per collaborazioni, media, partnership commerciali e questioni generali.",
              },
              {
                nome: "Silvia Russo",
                ruolo: "Co-founder",
                email: "silviarusso@arrivoapp.it",
                desc: "Per feedback sul prodotto, onboarding partner e supporto operativo.",
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
                <p className="mt-4 text-sm font-bold leading-6 text-white/55">{p.desc}</p>
                <a
                  href={`mailto:${p.email}`}
                  className="mt-3 flex items-center gap-2 text-sm font-black text-[#ff6b00] transition hover:text-[#e05e00]"
                >
                  {p.email} →
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Aree di contatto */}
      <section className="py-16">
        <div className="mx-auto max-w-screen-xl px-4 sm:px-6">
          <p className="text-xs font-black uppercase text-[#ff6b00]">Per argomento</p>
          <h2 className="mt-2 text-2xl font-black sm:text-3xl">Di cosa hai bisogno?</h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { titolo: "Supporto clienti", desc: "Problemi con prenotazioni, ordini o account.", email: "davidetiano@arrivoapp.it", subject: "Supporto clienti" },
              { titolo: "Supporto partner", desc: "Gestione locale, onboarding, dashboard.", email: "davidetiano@arrivoapp.it", subject: "Supporto partner" },
              { titolo: "Stampa & Media", desc: "Interviste, contenuti, comunicati stampa.", email: "davidetiano@arrivoapp.it", subject: "Richiesta media" },
              { titolo: "Collaborazioni", desc: "Partnership, investimenti, proposte business.", email: "davidetiano@arrivoapp.it", subject: "Collaborazione" },
            ].map((c) => (
              <div key={c.titolo} className="rounded-2xl border border-white/8 bg-white/[0.04] p-5">
                <h3 className="font-black">{c.titolo}</h3>
                <p className="mt-2 text-sm font-bold leading-6 text-white/50">{c.desc}</p>
                <a
                  href={`mailto:${c.email}?subject=${encodeURIComponent(c.subject)}`}
                  className="mt-3 block text-xs font-black text-[#ff6b00] transition hover:text-[#e05e00]"
                >
                  Scrivi →
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Note */}
      <section className="bg-[#0a0a0a] py-12">
        <div className="mx-auto max-w-screen-xl px-4 sm:px-6">
          <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-6">
            <h3 className="font-black">Tempi di risposta</h3>
            <p className="mt-2 text-sm font-bold leading-6 text-white/55">
              Il team di Arrivo risponde a tutte le email entro <strong className="text-white">24 ore lavorative</strong>.
              Per urgenze o richieste di supporto critico (locale attivo, problemi con pagamenti),
              specifica &ldquo;URGENTE&rdquo; nell&apos;oggetto dell&apos;email.
            </p>
          </div>
        </div>
      </section>

      <FooterPubblico />
    </main>
  );
}
