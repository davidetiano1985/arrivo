import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowLeft, ChefHat, ShieldCheck, Sparkles } from "lucide-react";

type AuthShellProps = {
  badge?: string;
  children: ReactNode;
  mode?: "customer" | "admin";
  subtitle: string;
  title: string;
};

export function AuthShell({
  badge = "Accesso Arrivo",
  children,
  mode = "customer",
  subtitle,
  title
}: AuthShellProps) {
  const Icon = mode === "admin" ? ShieldCheck : ChefHat;

  return (
    <main className="min-h-screen overflow-hidden bg-[#05060a] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_8%,rgba(255,106,61,0.24),transparent_30%),radial-gradient(circle_at_90%_20%,rgba(92,151,255,0.16),transparent_34%),linear-gradient(180deg,#05060a,#0b0d12)]" />

      <section className="relative z-10 mx-auto flex min-h-screen w-full max-w-6xl flex-col px-5 py-5 sm:px-7 lg:px-10">
        <header className="flex items-center justify-between">
          <Link
            className="inline-flex items-center gap-2 text-sm font-bold text-white/62 transition hover:text-white"
            href="/"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Home
          </Link>

          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-white text-[#05060a]">
              <ChefHat className="h-5 w-5" aria-hidden="true" />
            </div>
            <div className="text-lg font-black">Arrivo</div>
          </div>
        </header>

        <div className="grid flex-1 items-center gap-10 py-12 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="hidden space-y-7 lg:block">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.08] px-3 py-2 text-xs font-black uppercase text-white/74 backdrop-blur-xl">
              <Sparkles className="h-4 w-4 text-[#ffb36b]" aria-hidden="true" />
              {badge}
            </div>
            <div>
              <h1 className="max-w-xl text-6xl font-black leading-[0.9] tracking-normal">
                Ordina prima.
                <span className="block text-white/52">Arriva leggero.</span>
              </h1>
              <p className="mt-5 max-w-lg text-lg leading-8 text-white/58">
                La stessa estetica premium della homepage, pronta per i flussi
                account senza collegamenti backend.
              </p>
            </div>
          </div>

          <div className="mx-auto w-full max-w-md">
            <div className="rounded-[1.6rem] border border-white/10 bg-white/[0.07] p-3 shadow-[0_30px_100px_rgba(0,0,0,0.38)] backdrop-blur-2xl">
              <div className="rounded-[1.2rem] bg-[#0d0f15]/95 p-5 sm:p-6">
                <div className="mb-7">
                  <div className="mb-5 grid h-12 w-12 place-items-center rounded-2xl bg-[#ff6a3d] shadow-[0_16px_42px_rgba(255,106,61,0.3)]">
                    <Icon className="h-6 w-6" aria-hidden="true" />
                  </div>
                  <h2 className="text-3xl font-black tracking-normal">{title}</h2>
                  <p className="mt-3 leading-7 text-white/56">{subtitle}</p>
                </div>

                {children}
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

export function AuthInput({
  label,
  placeholder,
  type = "text"
}: {
  label: string;
  placeholder: string;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="text-sm font-black text-white/72">{label}</span>
      <input
        className="mt-2 h-14 w-full rounded-2xl border border-white/10 bg-white/[0.06] px-4 text-base font-semibold text-white outline-none transition placeholder:text-white/30 focus:border-[#ffb36b]/70 focus:bg-white/[0.09]"
        placeholder={placeholder}
        type={type}
      />
    </label>
  );
}

export function PrimaryAuthButton({ children }: { children: ReactNode }) {
  return (
    <button
      className="mt-2 flex h-14 w-full items-center justify-center rounded-2xl bg-[#ff6a3d] text-sm font-black text-white shadow-[0_18px_48px_rgba(255,106,61,0.32)] transition hover:-translate-y-0.5 hover:bg-[#ff7b55]"
      type="submit"
    >
      {children}
    </button>
  );
}
