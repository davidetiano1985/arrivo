import FooterPubblico from "@/components/FooterPubblico";
import NavbarPubblica from "@/components/NavbarPubblica";

export default function PrivacyPage() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-black text-white">
      <NavbarPubblica />

      {/* Hero */}
      <section className="mx-auto max-w-screen-xl px-4 py-16 sm:px-6 sm:py-20">
        <span className="inline-flex rounded-full border border-[#ff6b00]/40 bg-[#ff6b00]/10 px-4 py-1.5 text-xs font-black uppercase text-[#ff6b00]">
          Privacy
        </span>
        <h1 className="mt-5 text-3xl font-black sm:text-4xl">Informativa sulla Privacy</h1>
        <p className="mt-3 text-sm font-bold text-white/40">Ultimo aggiornamento: maggio 2025</p>
        <p className="mt-4 max-w-xl text-sm font-bold leading-7 text-white/55">
          Questo documento descrive come Arrivo raccoglie, utilizza e protegge i dati personali degli utenti,
          in conformità con il Regolamento (UE) 2016/679 (GDPR) e la normativa italiana vigente.
        </p>
        <div className="mt-4 rounded-xl border border-[#ff6b00]/20 bg-[#ff6b00]/5 p-4">
          <p className="text-xs font-bold text-white/50">
            <strong className="text-white/70">Nota:</strong> Questo documento è una bozza predisposta per il lancio della piattaforma.
            Prima del go-live, verrà revisionata da un professionista legale.
          </p>
        </div>
      </section>

      {/* Contenuto */}
      <section className="pb-20">
        <div className="mx-auto max-w-screen-xl px-4 sm:px-6">
          <div className="max-w-3xl space-y-10">

            <div>
              <h2 className="text-lg font-black text-[#ff6b00]">1. Titolare del trattamento</h2>
              <p className="mt-3 text-sm font-bold leading-7 text-white/60">
                Il titolare del trattamento è Davide Tiano, raggiungibile all&apos;indirizzo email
                <a href="mailto:davidetiano@arrivoapp.it" className="ml-1 text-[#ff6b00]">davidetiano@arrivoapp.it</a>.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-black text-[#ff6b00]">2. Dati raccolti</h2>
              <p className="mt-3 text-sm font-bold leading-7 text-white/60">
                Raccogliamo i seguenti dati personali:
              </p>
              <ul className="mt-3 space-y-2 text-sm font-bold text-white/60">
                {[
                  "Dati di registrazione: nome, indirizzo email, password (in forma criptata).",
                  "Dati di prenotazione: data, orario, numero di ospiti, nome del ristorante.",
                  "Dati di ordine: piatti selezionati, note, preferenze alimentari.",
                  "Dati di pagamento: gestiti da provider certificati (Stripe, PayPal). Non conserviamo dati di carte.",
                  "Dati tecnici: indirizzo IP, tipo di browser, sistema operativo (log di accesso).",
                  "Dati Google (se accedi con Google): nome, email, foto profilo forniti da Google OAuth.",
                ].map((v) => (
                  <li key={v} className="flex items-start gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#ff6b00]" />
                    {v}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h2 className="text-lg font-black text-[#ff6b00]">3. Finalità del trattamento</h2>
              <p className="mt-3 text-sm font-bold leading-7 text-white/60">
                I dati vengono utilizzati per:
              </p>
              <ul className="mt-3 space-y-2 text-sm font-bold text-white/60">
                {[
                  "Erogazione del servizio di prenotazione, pre-ordine e pagamento.",
                  "Invio di comunicazioni transazionali (conferma prenotazione, ricevuta pagamento).",
                  "Assistenza clienti e risoluzione di problemi.",
                  "Miglioramento della piattaforma tramite analisi aggregata degli utilizzi.",
                  "Adempimento di obblighi legali e fiscali.",
                ].map((v) => (
                  <li key={v} className="flex items-start gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#ff6b00]" />
                    {v}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h2 className="text-lg font-black text-[#ff6b00]">4. Base giuridica</h2>
              <p className="mt-3 text-sm font-bold leading-7 text-white/60">
                Il trattamento è basato su: esecuzione del contratto (fornitura del servizio), consenso dell&apos;utente
                (comunicazioni marketing, se previste), interesse legittimo (sicurezza e miglioramento del servizio),
                e obbligo legale (conservazione dei dati fiscali).
              </p>
            </div>

            <div>
              <h2 className="text-lg font-black text-[#ff6b00]">5. Conservazione dei dati</h2>
              <p className="mt-3 text-sm font-bold leading-7 text-white/60">
                I dati vengono conservati per il tempo necessario all&apos;erogazione del servizio e fino a 10 anni
                per gli obblighi fiscali. I token di verifica email hanno validità di 24 ore.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-black text-[#ff6b00]">6. Diritti dell&apos;utente</h2>
              <p className="mt-3 text-sm font-bold leading-7 text-white/60">
                Hai diritto di accedere ai tuoi dati, rettificarli, cancellarli (diritto all&apos;oblio),
                limitarne il trattamento, alla portabilità e di opporti al trattamento.
                Per esercitare i tuoi diritti scrivi a
                <a href="mailto:davidetiano@arrivoapp.it" className="ml-1 text-[#ff6b00]">davidetiano@arrivoapp.it</a>.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-black text-[#ff6b00]">7. Cookie</h2>
              <p className="mt-3 text-sm font-bold leading-7 text-white/60">
                Arrivo utilizza cookie tecnici necessari al funzionamento del servizio. Per i dettagli
                consulta la nostra <a href="/cookie" className="text-[#ff6b00]">Cookie Policy</a>.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-black text-[#ff6b00]">8. Sicurezza</h2>
              <p className="mt-3 text-sm font-bold leading-7 text-white/60">
                I dati sono protetti con crittografia SSL/TLS in transito e crittografia a riposo.
                Le password sono conservate in forma hash irreversibile (bcrypt). I dati di pagamento
                non transitano mai sui nostri server.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-black text-[#ff6b00]">9. Contatti</h2>
              <p className="mt-3 text-sm font-bold leading-7 text-white/60">
                Per qualsiasi domanda sulla privacy scrivici a
                <a href="mailto:davidetiano@arrivoapp.it" className="ml-1 text-[#ff6b00]">davidetiano@arrivoapp.it</a>.
                Hai anche il diritto di proporre reclamo all&apos;autorità di controllo competente (Garante Privacy italiano).
              </p>
            </div>

          </div>
        </div>
      </section>

      <FooterPubblico />
    </main>
  );
}
