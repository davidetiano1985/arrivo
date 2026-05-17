import Link from "next/link";

type Props = {
  tipo: "non_autenticato" | "non_autorizzato";
  ruolo?: string;
};

export default function AccessoNegato({ tipo, ruolo }: Props) {
  if (tipo === "non_autenticato") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black px-6 py-12 text-white">
        <div className="w-full max-w-sm text-center">
          <p className="text-xs font-black uppercase text-[#ff6b00]">
            Arrivo Admin
          </p>
          <h1 className="mt-4 text-4xl font-black">Accedi per continuare</h1>
          <p className="mt-3 text-sm font-bold text-white/60">
            Devi autenticarti per accedere a quest&apos;area.
          </p>
          <Link
            className="mt-8 inline-block rounded-2xl bg-[#ff6b00] px-6 py-3 text-sm font-black text-black"
            href="/login"
          >
            Vai al login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-black px-6 py-12 text-white">
      <div className="w-full max-w-sm text-center">
        <p className="text-xs font-black uppercase text-[#ff6b00]">
          Area riservata
        </p>
        <h1 className="mt-4 text-4xl font-black">Accesso negato</h1>
        <p className="mt-3 text-sm font-bold text-white/60">
          Il tuo ruolo{" "}
          <span className="font-black text-white">{ruolo}</span>{" "}
          non ha accesso a quest&apos;area.
        </p>
        <Link
          className="mt-8 inline-block rounded-2xl bg-[#ff6b00] px-6 py-3 text-sm font-black text-black"
          href="/"
        >
          Torna alla home
        </Link>
      </div>
    </div>
  );
}
