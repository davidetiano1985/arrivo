export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white">
      <div className="mx-auto min-h-screen w-full max-w-md pb-28 sm:max-w-2xl lg:max-w-5xl lg:pb-10">
        <header className="flex items-center justify-between px-5 pt-5">
          <div>
            <p className="text-2xl font-black tracking-[0.16em]">ARRIVO</p>
            <p className="mt-1 text-xs font-bold uppercase text-white/45">
              Food delivery premium
            </p>
          </div>

          <button className="rounded-full bg-white px-4 py-2 text-sm font-black text-black">
            Milano
          </button>
        </header>

        <section className="px-5 pt-6">
          <div className="overflow-hidden rounded-[2rem] bg-[#ff6b00] p-6 shadow-[0_24px_70px_rgba(255,107,0,0.26)] lg:grid lg:grid-cols-[1fr_0.8fr] lg:gap-8 lg:p-8">
            <div>
              <p className="inline-flex rounded-full bg-black px-4 py-2 text-xs font-black uppercase">
                Ordina ora
              </p>
              <h1 className="mt-5 text-5xl font-black leading-[0.9] tracking-normal text-white sm:text-6xl lg:text-7xl">
                Ordina. Prenota. Arriva.
              </h1>
              <p className="mt-5 max-w-xl text-base font-bold leading-7 text-white/90">
                Ristoranti selezionati, offerte chiare e tavolo pronto. Una
                homepage mobile-first per mangiare senza attese.
              </p>

              <div className="mt-6 flex gap-3">
                <button className="h-12 rounded-2xl bg-black px-5 text-sm font-black text-white">
                  Trova ristoranti
                </button>
                <button className="h-12 rounded-2xl bg-white px-5 text-sm font-black text-black">
                  Prenota
                </button>
              </div>
            </div>

            <div className="mt-7 rounded-[1.5rem] bg-black p-4 lg:mt-0">
              <div className="rounded-2xl bg-white p-4 text-black">
                <p className="text-xs font-black uppercase text-black/45">
                  Arrivo adesso
                </p>
                <div className="mt-3 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xl font-black">Burger Club</p>
                    <p className="mt-1 text-sm font-bold text-black/55">
                      Menu pronto in 18 min
                    </p>
                  </div>
                  <div className="grid h-16 w-16 place-items-center rounded-2xl bg-[#ff6b00] text-2xl font-black text-white">
                    B
                  </div>
                </div>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-white/10 p-4">
                  <p className="text-xs font-bold text-white/45">Tempo</p>
                  <p className="mt-1 text-2xl font-black">18m</p>
                </div>
                <div className="rounded-2xl bg-white/10 p-4">
                  <p className="text-xs font-bold text-white/45">Totale</p>
                  <p className="mt-1 text-2xl font-black">EUR 14</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="px-5 pt-5">
          <div className="flex items-center gap-3 rounded-2xl bg-white p-2 text-black">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-black text-lg font-black text-white">
              Q
            </div>
            <input
              className="min-w-0 flex-1 bg-transparent text-sm font-black outline-none placeholder:text-black/45"
              placeholder="Cerca ristorante, piatto o zona"
              type="search"
            />
            <button className="hidden h-12 rounded-xl bg-[#ff6b00] px-5 text-sm font-black text-white sm:block">
              Cerca
            </button>
          </div>

          <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
            <button className="shrink-0 rounded-full bg-[#ff6b00] px-5 py-3 text-sm font-black">
              Burger
            </button>
            <button className="shrink-0 rounded-full bg-white px-5 py-3 text-sm font-black text-black">
              Pizza
            </button>
            <button className="shrink-0 rounded-full bg-white px-5 py-3 text-sm font-black text-black">
              Sushi
            </button>
            <button className="shrink-0 rounded-full bg-white px-5 py-3 text-sm font-black text-black">
              Pasta
            </button>
          </div>
        </section>

        <section className="px-5 pt-7">
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-black uppercase text-[#ff6b00]">
                Vicino a te
              </p>
              <h2 className="mt-1 text-3xl font-black">
                Ristoranti popolari
              </h2>
            </div>
            <button className="rounded-full bg-white px-4 py-2 text-sm font-black text-black">
              Tutti
            </button>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <article className="overflow-hidden rounded-[1.75rem] bg-white text-black shadow-[0_18px_45px_rgba(0,0,0,0.28)]">
              <div className="h-32 bg-[#ff6b00] p-4">
                <div className="flex h-full items-end justify-between">
                  <span className="rounded-full bg-black px-3 py-1.5 text-xs font-black text-white">
                    -20%
                  </span>
                  <div className="grid h-20 w-20 place-items-center rounded-full bg-white text-3xl font-black text-[#ff6b00]">
                    B
                  </div>
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-xl font-black">Burger Club</h3>
                    <p className="mt-1 text-sm font-bold text-black/55">
                      Burger, fries, shake
                    </p>
                  </div>
                  <span className="rounded-full bg-black px-2.5 py-1 text-xs font-black text-white">
                    4.8
                  </span>
                </div>
                <button className="mt-4 h-11 w-full rounded-xl bg-[#ff6b00] text-sm font-black text-white">
                  Ordina ora
                </button>
              </div>
            </article>

            <article className="overflow-hidden rounded-[1.75rem] bg-white text-black shadow-[0_18px_45px_rgba(0,0,0,0.28)]">
              <div className="h-32 bg-[#111111] p-4">
                <div className="flex h-full items-end justify-between">
                  <span className="rounded-full bg-[#ff6b00] px-3 py-1.5 text-xs font-black text-white">
                    Top
                  </span>
                  <div className="grid h-20 w-20 place-items-center rounded-full bg-[#ff6b00] text-3xl font-black text-white">
                    P
                  </div>
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-xl font-black">Pizza Sprint</h3>
                    <p className="mt-1 text-sm font-bold text-black/55">
                      Pizza, fritti, bibite
                    </p>
                  </div>
                  <span className="rounded-full bg-black px-2.5 py-1 text-xs font-black text-white">
                    4.7
                  </span>
                </div>
                <button className="mt-4 h-11 w-full rounded-xl bg-[#ff6b00] text-sm font-black text-white">
                  Ordina ora
                </button>
              </div>
            </article>

            <article className="overflow-hidden rounded-[1.75rem] bg-white text-black shadow-[0_18px_45px_rgba(0,0,0,0.28)]">
              <div className="h-32 bg-[#ff8a00] p-4">
                <div className="flex h-full items-end justify-between">
                  <span className="rounded-full bg-black px-3 py-1.5 text-xs font-black text-white">
                    Gratis
                  </span>
                  <div className="grid h-20 w-20 place-items-center rounded-full bg-white text-3xl font-black text-[#ff6b00]">
                    S
                  </div>
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-xl font-black">Sushi Fast</h3>
                    <p className="mt-1 text-sm font-bold text-black/55">
                      Sushi, poke, ramen
                    </p>
                  </div>
                  <span className="rounded-full bg-black px-2.5 py-1 text-xs font-black text-white">
                    4.9
                  </span>
                </div>
                <button className="mt-4 h-11 w-full rounded-xl bg-[#ff6b00] text-sm font-black text-white">
                  Ordina ora
                </button>
              </div>
            </article>
          </div>
        </section>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-white/10 bg-[#070707] px-4 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] pt-3 md:hidden">
        <div className="mx-auto grid max-w-md grid-cols-4 gap-2">
          <button className="flex min-h-14 flex-col items-center justify-center rounded-2xl bg-[#ff6b00] text-xs font-black">
            Home
          </button>
          <button className="flex min-h-14 flex-col items-center justify-center rounded-2xl bg-white/10 text-xs font-black text-white/65">
            Cerca
          </button>
          <button className="flex min-h-14 flex-col items-center justify-center rounded-2xl bg-white/10 text-xs font-black text-white/65">
            Ordini
          </button>
          <button className="flex min-h-14 flex-col items-center justify-center rounded-2xl bg-white/10 text-xs font-black text-white/65">
            Profilo
          </button>
        </div>
      </nav>
    </main>
  );
}
