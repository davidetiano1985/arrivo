import Link from "next/link";

import HeaderPublico from "./HeaderPublico";

export default function NavbarPubblica() {
  return (
    <div className="sticky top-0 z-30 border-b border-white/10 bg-black/95 backdrop-blur-md">
      <div className="mx-auto max-w-screen-xl px-4 sm:px-6">
        <header className="flex items-center justify-between gap-3 py-4">
          <Link className="min-w-0" href="/">
            <img src="/arrivo_logo.svg" alt="Arrivo" className="h-9 w-auto" />
            <p className="mt-0.5 text-[10px] font-bold uppercase text-white/40">
              Prenota · Ordina · Arriva
            </p>
          </Link>
          <HeaderPublico />
        </header>
      </div>
    </div>
  );
}
