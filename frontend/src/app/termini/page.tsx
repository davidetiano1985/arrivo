import FooterPubblico from "@/components/FooterPubblico";
import NavbarPubblica from "@/components/NavbarPubblica";

export default function TerminiPage() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-black text-white">
      <NavbarPubblica />

      {/* Hero */}
      <section className="mx-auto max-w-screen-xl px-4 py-16 sm:px-6 sm:py-20">
        <span className="inline-flex rounded-full border border-[#ff6b00]/40 bg-[#ff6b00]/10 px-4 py-1.5 text-xs font-black uppercase text-[#ff6b00]">
          Termini
        </span>
        <h1 className="mt-5 text-3xl font-black sm:text-4xl">Termini di Servizio</h1>
        <p className="mt-3 text-sm font-bold text-white/40">Ultimo aggiornamento: maggio 2025</p>
        <div className="mt-4 rounded-xl border border-[#ff6b00]/20 bg-[#ff6b00]/5 p-4">
          <p className="text-xs font-bold text-white/50">
            <strong className="text-white/70">Nota:</strong> Questo documento è una bozza predisposta per il lancio.
            Verrà revisionata da un professionista legale prima del go-live.
          </p>
        </div>
      </section>

      {/* Contenuto */}
      <section className="pb-20">
        <div className="mx-auto max-w-screen-xl px-4 sm:px-6">
          <div className="max-w-3xl space-y-10">

            <div>
              <h2 className="text-lg font-black text-[#ff6b00]">1. Accettazione dei termini</h2>
              <p className="mt-3 text-sm font-bold leading-7 text-white/60">
                Utilizzando la piattaforma Arrivo (il &ldquo;Servizio&rdquo;), accessibile su arrivoapp.it e tramite app mobile,
                l&apos;utente accetta integralmente i presenti Termini di Servizio. Se non accetti, non utilizzare il Servizio.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-black text-[#ff6b00]">2. Il Servizio</h2>
              <p className="mt-3 text-sm font-bold leading-7 text-white/60">
                Arrivo è una piattaforma di intermediazione che consente agli utenti di prenotare tavoli,
                inviare pre-ordini e pagare presso ristoranti aderenti. Arrivo non è un ristorante né un
                servizio di delivery. La responsabilità per la qualità del cibo e del servizio rimane in
                capo all&apos;esercente.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-black text-[#ff6b00]">3. Registrazione e account</h2>
              <p className="mt-3 text-sm font-bold leading-7 text-white/60">
                Per utilizzare il Servizio è necessario creare un account con email verificata.
                L&apos;utente è responsabile della sicurezza delle proprie credenziali e di tutte le
                attività svolte con il proprio account. In caso di accesso non autorizzato,
                è necessario notificarlo immediatamente a
                <a href="mailto:davidetiano@arrivoapp.it" className="ml-1 text-[#ff6b00]">davidetiano@arrivoapp.it</a>.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-black text-[#ff6b00]">4. Prenotazioni</h2>
              <p className="mt-3 text-sm font-bold leading-7 text-white/60">
                Le prenotazioni effettuate tramite Arrivo sono vincolanti per entrambe le parti (utente ed esercente).
                L&apos;utente può cancellare gratuitamente fino a 2 ore prima dell&apos;orario prenotato.
                Cancellazioni tardive o mancata presentazione (no-show) possono comportare limitazioni all&apos;utilizzo
                futuro del Servizio.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-black text-[#ff6b00]">5. Pagamenti e rimborsi</h2>
              <p className="mt-3 text-sm font-bold leading-7 text-white/60">
                I pagamenti sono elaborati da provider certificati (Stripe, PayPal). I rimborsi per cancellazioni
                nei termini previsti o per problemi documentati con l&apos;ordine vengono processati entro 24 ore.
                Arrivo non è responsabile per malfunzionamenti dei sistemi di pagamento di terzi.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-black text-[#ff6b00]">6. Condotta dell&apos;utente</h2>
              <p className="mt-3 text-sm font-bold leading-7 text-white/60">
                L&apos;utente si impegna a non utilizzare il Servizio per scopi illeciti, a non inserire dati falsi,
                a non tentare di accedere abusivamente a sistemi informatici e a non creare account multipli
                per aggirare limitazioni. Arrivo si riserva il diritto di sospendere o chiudere account
                in caso di violazioni.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-black text-[#ff6b00]">7. Limitazione di responsabilità</h2>
              <p className="mt-3 text-sm font-bold leading-7 text-white/60">
                Arrivo non è responsabile per la qualità del cibo, il comportamento del personale del ristorante,
                disservizi causati da forza maggiore o interruzioni del servizio di terze parti (operatori
                di rete, provider di pagamento). La responsabilità massima di Arrivo è limitata all&apos;importo
                dell&apos;ultima transazione dell&apos;utente.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-black text-[#ff6b00]">8. Modifiche ai termini</h2>
              <p className="mt-3 text-sm font-bold leading-7 text-white/60">
                Arrivo si riserva il diritto di modificare i presenti Termini in qualsiasi momento.
                Le modifiche sostanziali verranno comunicate via email con almeno 14 giorni di preavviso.
                L&apos;uso continuato del Servizio dopo la notifica costituisce accettazione dei nuovi termini.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-black text-[#ff6b00]">9. Legge applicabile e foro competente</h2>
              <p className="mt-3 text-sm font-bold leading-7 text-white/60">
                I presenti Termini sono regolati dalla legge italiana. Per qualsiasi controversia è competente
                il Foro di Milano, salvo diversa disposizione di legge per i consumatori.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-black text-[#ff6b00]">10. Contatti</h2>
              <p className="mt-3 text-sm font-bold leading-7 text-white/60">
                Per qualsiasi questione relativa ai presenti Termini:
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
