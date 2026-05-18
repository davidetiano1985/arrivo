import Link from "next/link";

const colonne = [
  {
    titolo: "Azienda",
    voci: [
      { label: "Chi siamo", href: "/chi-siamo" },
      { label: "Come funziona", href: "/come-funziona" },
      { label: "Blog", href: "/blog" },
      { label: "Lavora con noi", href: "/lavora-con-noi" },
    ],
  },
  {
    titolo: "Clienti",
    voci: [
      { label: "Trova ristoranti", href: "/trova-ristoranti" },
      { label: "Prenota tavolo", href: "/prenota-tavolo" },
      { label: "Ordina prima", href: "/ordina-prima" },
      { label: "Pagamenti", href: "/pagamenti" },
    ],
  },
  {
    titolo: "Ristoratori",
    voci: [
      { label: "Registra la tua attività", href: "/registra-attivita" },
      { label: "Dashboard partner", href: "/dashboard" },
      { label: "Gestione ordini", href: "/gestione-ordini" },
      { label: "Supporto partner", href: "/supporto-partner" },
    ],
  },
  {
    titolo: "Supporto",
    voci: [
      { label: "Contattaci", href: "/contatti" },
      { label: "FAQ", href: "/faq" },
      { label: "Privacy", href: "/privacy" },
      { label: "Termini di servizio", href: "/termini" },
    ],
  },
];

export default function FooterPubblico() {
  return (
    <footer className="border-t border-white/10 bg-[#050505] pt-14 pb-8">
      <div className="mx-auto max-w-screen-xl px-4 sm:px-6">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4 lg:grid-cols-5">
          <div className="col-span-2 sm:col-span-4 lg:col-span-1">
            <Link href="/">
              <img src="/arrivo_logo.svg" alt="Arrivo" className="h-8 w-auto" />
              <p className="mt-1 text-[10px] font-bold uppercase text-white/35">
                Prenota · Ordina · Arriva
              </p>
            </Link>
            <p className="mt-4 text-xs font-bold leading-5 text-white/35">
              La nuova esperienza food.<br />
              Arrivi, ti siedi, mangi.
            </p>
          </div>

          {colonne.map((col) => (
            <div key={col.titolo}>
              <p className="text-xs font-black uppercase text-white/40">{col.titolo}</p>
              <ul className="mt-4 space-y-2.5">
                {col.voci.map((v) => (
                  <li key={v.href}>
                    <Link
                      className="text-sm font-bold text-white/50 transition hover:text-white"
                      href={v.href}
                    >
                      {v.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-4 border-t border-white/10 pt-8 sm:flex-row sm:items-center">
          <p className="text-xs font-bold text-white/25">
            © 2025 Arrivo. Tutti i diritti riservati.
          </p>
          <div className="flex gap-5">
            <Link className="text-xs font-bold text-white/25 transition hover:text-white/60" href="/privacy">Privacy</Link>
            <Link className="text-xs font-bold text-white/25 transition hover:text-white/60" href="/termini">Termini</Link>
            <Link className="text-xs font-bold text-white/25 transition hover:text-white/60" href="/cookie">Cookie</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
