import { ArrowRight, Clock3, CreditCard, MapPin, Utensils } from "lucide-react";

const steps = [
  {
    label: "Scegli",
    text: "Ristorante, orario e tavolo.",
    Icon: MapPin
  },
  {
    label: "Ordina",
    text: "Menu pronto da mobile.",
    Icon: Utensils
  },
  {
    label: "Paga",
    text: "Checkout online anticipato.",
    Icon: CreditCard
  }
];

export default function Home() {
  return (
    <main className="min-h-screen bg-linen text-ink">
      <section className="mx-auto flex min-h-screen w-full max-w-md flex-col px-5 py-6 sm:max-w-2xl lg:max-w-5xl">
        <header className="flex items-center justify-between">
          <div className="text-xl font-black tracking-normal">Arrivo</div>
          <div className="rounded-full border border-ink/10 bg-white px-3 py-1 text-xs font-semibold text-ink/70">
            Mobile first
          </div>
        </header>

        <div className="grid flex-1 items-center gap-8 py-10 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full bg-tomato/10 px-3 py-1 text-sm font-semibold text-tomato">
              <Clock3 className="h-4 w-4" aria-hidden="true" />
              Tavolo e ordine pronti al tuo arrivo
            </div>

            <div className="space-y-4">
              <h1 className="text-5xl font-black leading-[0.95] tracking-normal sm:text-6xl">
                Arrivi. Mangi.
              </h1>
              <p className="max-w-xl text-lg leading-7 text-ink/70">
                Prenota, ordina e paga prima di entrare al ristorante. Arrivo
                prepara l&apos;esperienza prima ancora che tu sia al tavolo.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {steps.map(({ label, text, Icon }) => (
                <div
                  className="rounded-lg border border-ink/10 bg-white p-4 shadow-soft"
                  key={label}
                >
                  <Icon className="mb-4 h-5 w-5 text-basil" aria-hidden="true" />
                  <div className="font-bold">{label}</div>
                  <div className="mt-1 text-sm leading-5 text-ink/60">{text}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="mx-auto w-full max-w-[330px] rounded-[2rem] bg-ink p-3 shadow-soft">
            <div className="rounded-[1.5rem] bg-linen p-4">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold uppercase text-ink/50">
                    Oggi
                  </div>
                  <div className="text-lg font-black">Pranzo veloce</div>
                </div>
                <div className="rounded-full bg-basil px-3 py-1 text-xs font-bold text-white">
                  12:45
                </div>
              </div>

              <div className="space-y-3">
                <div className="rounded-lg bg-white p-4">
                  <div className="text-sm font-bold">Tavolo 8</div>
                  <div className="mt-1 text-sm text-ink/60">2 persone, interno</div>
                </div>
                <div className="rounded-lg bg-white p-4">
                  <div className="text-sm font-bold">Ordine confermato</div>
                  <div className="mt-1 text-sm text-ink/60">
                    Pizza margherita, acqua, tiramisu
                  </div>
                </div>
                <button className="flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-tomato text-sm font-black text-white">
                  Vai al riepilogo
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

