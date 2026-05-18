import FooterPubblico from "@/components/FooterPubblico";
import NavbarPubblica from "@/components/NavbarPubblica";

const sezioni = [
  {
    titolo: "Generale",
    domande: [
      { d: "Cos'è Arrivo?", r: "Arrivo è una piattaforma food-tech che ti permette di prenotare un tavolo, ordinare dal menu e pagare — tutto prima di arrivare al ristorante. Quando entri, il tavolo è pronto e il piatto è già in cucina." },
      { d: "Arrivo è un servizio di delivery?", r: "No. Arrivo non è delivery. Sei tu che vai al ristorante, ma arrivi senza code, senza attese al menu e senza aspettare il conto. L'esperienza è quella del ristorante, ottimizzata." },
      { d: "In quali città è disponibile Arrivo?", r: "Arrivo è in fase di lancio. Le prime città saranno annunciate a breve. Registrati per essere tra i primi ad essere avvisato." },
    ],
  },
  {
    titolo: "Prenotazioni",
    domande: [
      { d: "Come prenoto un tavolo?", r: "Cerca il ristorante su Arrivo, scegli data, orario e numero di ospiti. La conferma è immediata, senza telefonate." },
      { d: "Posso cancellare una prenotazione?", r: "Sì. Puoi cancellare gratuitamente fino a 2 ore prima dell'orario prenotato dalla tua area personale." },
      { d: "Cosa succede se arrivo in ritardo?", r: "Il locale viene notificato automaticamente. Puoi anche aggiornare il tuo orario stimato dall'app." },
      { d: "La prenotazione è garantita?", r: "Sì. Una volta confermata, il tavolo è riservato per te. Nessuna sorpresa all'arrivo." },
    ],
  },
  {
    titolo: "Ordini",
    domande: [
      { d: "Posso ordinare senza prenotare il tavolo?", r: "No. Il pre-ordine è legato alla prenotazione, in modo che il locale sappia esattamente quando prepararti il piatto." },
      { d: "Posso modificare l'ordine dopo averlo inviato?", r: "Sì, puoi modificare il pre-ordine fino a 30 minuti prima dell'orario di arrivo." },
      { d: "Posso indicare allergie o intolleranze?", r: "Sì. Ogni piatto ha un campo note per segnalare allergie, varianti o richieste speciali." },
      { d: "Cosa succede se un piatto non è disponibile?", r: "Il locale ti avvisa via notifica. Puoi scegliere un'alternativa o ricevere un rimborso immediato per quel piatto." },
    ],
  },
  {
    titolo: "Pagamenti",
    domande: [
      { d: "Quali metodi di pagamento sono accettati?", r: "Accettiamo carte di credito/debito (Visa, Mastercard, Amex), Apple Pay, Google Pay e PayPal." },
      { d: "Il pagamento è sicuro?", r: "Sì. Tutte le transazioni sono crittografate con SSL a 256 bit e protette da autenticazione 3D Secure." },
      { d: "Quando viene addebitato il pagamento?", r: "Al momento della conferma dell'ordine. Ricevi subito una ricevuta via email." },
      { d: "Come funzionano i rimborsi?", r: "In caso di cancellazione nei tempi previsti o problema con l'ordine, il rimborso viene processato entro 24 ore." },
    ],
  },
  {
    titolo: "Account",
    domande: [
      { d: "Come mi registro?", r: "Vai su arrivoapp.it/registrati, inserisci email e password. Ricevi un link di verifica via email. Fatto." },
      { d: "Posso registrarmi con Google?", r: "Sì. Puoi usare il tuo account Google per registrarti e accedere più velocemente." },
      { d: "Ho dimenticato la password, come faccio?", r: "Clicca su 'Password dimenticata' nella pagina di accesso e ti invieremo un link per reimpostarla." },
      { d: "Come elimino il mio account?", r: "Scrivici a davidetiano@arrivoapp.it e processeremo la cancellazione entro 7 giorni lavorativi." },
    ],
  },
];

export default function FaqPage() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-black text-white">
      <NavbarPubblica />

      {/* Hero */}
      <section className="mx-auto max-w-screen-xl px-4 py-16 sm:px-6 sm:py-24">
        <span className="inline-flex rounded-full border border-[#ff6b00]/40 bg-[#ff6b00]/10 px-4 py-1.5 text-xs font-black uppercase text-[#ff6b00]">
          FAQ
        </span>
        <h1 className="mt-5 text-4xl font-black leading-tight sm:text-5xl">
          Domande frequenti.<br />
          <span className="text-[#ff6b00]">Risposte chiare.</span>
        </h1>
        <p className="mt-6 max-w-xl text-base font-bold leading-7 text-white/60">
          Hai dubbi su come funziona Arrivo? Trova la risposta qui sotto.
          Se non trovi quello che cerchi, scrivici.
        </p>
      </section>

      {/* Sezioni FAQ */}
      <section className="pb-20">
        <div className="mx-auto max-w-screen-xl px-4 sm:px-6">
          <div className="space-y-12">
            {sezioni.map((s) => (
              <div key={s.titolo}>
                <div className="flex items-center gap-3 mb-5">
                  <h2 className="text-xl font-black">{s.titolo}</h2>
                  <div className="h-px flex-1 bg-white/10" />
                </div>
                <div className="space-y-3">
                  {s.domande.map((f) => (
                    <div key={f.d} className="rounded-2xl border border-white/8 bg-white/[0.03] p-5 sm:p-6">
                      <h3 className="font-black">{f.d}</h3>
                      <p className="mt-2 text-sm font-bold leading-6 text-white/55">{f.r}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA contatto */}
      <section className="bg-[#0a0a0a] py-16">
        <div className="mx-auto max-w-screen-xl px-4 sm:px-6">
          <div className="rounded-[2rem] bg-[#ff6b00] p-8 sm:p-10 lg:flex lg:items-center lg:justify-between">
            <div>
              <h2 className="text-2xl font-black text-white sm:text-3xl">Non hai trovato la risposta?</h2>
              <p className="mt-2 text-sm font-bold text-white/80">
                Scrivici. Rispondiamo entro 24 ore lavorative.
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
