"use client";

import {
  Bike,
  CalendarCheck,
  ChevronRight,
  Clock3,
  Flame,
  Home,
  MapPin,
  Search,
  ShoppingBag,
  Star,
  User
} from "lucide-react";

const categories = ["Burger", "Pizza", "Poke", "Pasta", "Sushi"];

const featured = [
  {
    name: "Smash Club",
    food: "Double burger, fries, cola",
    time: "18-24 min",
    rating: "4.9",
    promo: "-30%",
    color: "bg-[#ff6b00]",
    plate: "bg-[#111111]"
  },
  {
    name: "Pizza Sprint",
    food: "Margherita, diavola, crocche",
    time: "20-28 min",
    rating: "4.8",
    promo: "Gratis",
    color: "bg-white",
    plate: "bg-[#ff6b00]"
  },
  {
    name: "Urban Bowl",
    food: "Poke salmon, rice, avocado",
    time: "14-22 min",
    rating: "4.7",
    promo: "Top",
    color: "bg-[#ff8a00]",
    plate: "bg-white"
  }
];

const navItems = [
  { label: "Home", Icon: Home, active: true },
  { label: "Cerca", Icon: Search, active: false },
  { label: "Ordini", Icon: ShoppingBag, active: false },
  { label: "Profilo", Icon: User, active: false }
];

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white">
      <div className="mx-auto min-h-screen w-full max-w-md pb-28 sm:max-w-2xl lg:max-w-6xl lg:pb-10">
        <header className="sticky top-0 z-20 border-b border-white/10 bg-black/95 px-4 py-4 backdrop-blur">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-black uppercase text-[#ff6b00]">
                consegna a
              </p>
              <button className="mt-1 flex items-center gap-1 text-lg font-black">
                Milano centro
                <ChevronRight className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>

            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-[#151515]">
              <MapPin className="h-5 w-5 text-[#ff6b00]" aria-hidden="true" />
            </div>
          </div>
        </header>

        <section className="px-4 pt-5">
          <div className="rounded-[2rem] bg-[#ff6b00] p-5 shadow-[0_24px_60px_rgba(255,107,0,0.28)] sm:p-7 lg:grid lg:grid-cols-[1fr_0.85fr] lg:items-center lg:gap-8">
            <div>
              <div className="mb-5 inline-flex rounded-full bg-black px-4 py-2 text-sm font-black">
                ARRIVO
              </div>
              <h1 className="max-w-xl text-5xl font-black leading-[0.9] tracking-normal text-white sm:text-6xl lg:text-7xl">
                Fame? Prenota. Ordina. Arriva.
              </h1>
              <p className="mt-5 max-w-lg text-base font-bold leading-7 text-white/90">
                Delivery, ritiro e tavolo pronto in una schermata. Tutto veloce,
                chiaro, arancione.
              </p>
            </div>

            <div className="mt-7 rounded-[1.5rem] bg-black p-4 lg:mt-0">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-black uppercase text-white/45">
                    ordine live
                  </p>
                  <p className="mt-1 text-xl font-black">Burger in arrivo</p>
                </div>
                <div className="grid h-14 w-14 place-items-center rounded-2xl bg-[#ff6b00]">
                  <Bike className="h-7 w-7" aria-hidden="true" />
                </div>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-white p-4 text-black">
                  <p className="text-xs font-black text-black/45">Tempo</p>
                  <p className="mt-1 text-2xl font-black">16 min</p>
                </div>
                <div className="rounded-2xl bg-white p-4 text-black">
                  <p className="text-xs font-black text-black/45">Totale</p>
                  <p className="mt-1 text-2xl font-black">EUR 12</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="px-4 pt-5">
          <form className="flex items-center gap-3 rounded-2xl bg-white p-2 text-black">
            <label className="sr-only" htmlFor="search">
              Cerca cibo o ristorante
            </label>
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-black text-white">
              <Search className="h-5 w-5" aria-hidden="true" />
            </div>
            <input
              className="min-w-0 flex-1 bg-transparent text-sm font-black outline-none placeholder:text-black/45"
              id="search"
              placeholder="Cerca cibo, ristorante o zona"
              type="search"
            />
          </form>

          <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
            {categories.map((category) => (
              <button
                className="shrink-0 rounded-2xl bg-[#161616] px-5 py-3 text-sm font-black text-white"
                key={category}
              >
                {category}
              </button>
            ))}
          </div>
        </section>

        <section className="px-4 pt-7">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-sm font-black text-[#ff6b00]">
                scelti per te
              </p>
              <h2 className="mt-1 text-3xl font-black">Grandi card food</h2>
            </div>
            <button className="rounded-full bg-[#ff6b00] px-4 py-2 text-sm font-black">
              Tutti
            </button>
          </div>

          <div className="mt-4 grid gap-5 lg:grid-cols-3">
            {featured.map((item) => (
              <article
                className={`${item.color} overflow-hidden rounded-[2rem] text-black shadow-[0_18px_50px_rgba(0,0,0,0.35)]`}
                key={item.name}
              >
                <div className="relative min-h-48 p-5">
                  <div className="flex items-start justify-between gap-4">
                    <span className="rounded-full bg-black px-4 py-2 text-sm font-black text-white">
                      {item.promo}
                    </span>
                    <span className="flex items-center gap-1 rounded-full bg-white px-3 py-2 text-sm font-black">
                      <Star
                        className="h-4 w-4 fill-[#ff6b00] text-[#ff6b00]"
                        aria-hidden="true"
                      />
                      {item.rating}
                    </span>
                  </div>

                  <div
                    className={`absolute bottom-5 right-5 grid h-28 w-28 place-items-center rounded-full ${item.plate} shadow-[0_16px_35px_rgba(0,0,0,0.22)]`}
                  >
                    <div className="h-16 w-16 rounded-full bg-[#ff6b00] ring-[12px] ring-white/85" />
                  </div>
                </div>

                <div className="rounded-t-[2rem] bg-white p-5">
                  <h3 className="text-2xl font-black">{item.name}</h3>
                  <p className="mt-1 text-sm font-bold text-black/55">
                    {item.food}
                  </p>
                  <div className="mt-5 flex items-center justify-between gap-4">
                    <span className="flex items-center gap-2 text-sm font-black">
                      <Clock3
                        className="h-4 w-4 text-[#ff6b00]"
                        aria-hidden="true"
                      />
                      {item.time}
                    </span>
                    <button className="rounded-xl bg-[#ff6b00] px-4 py-3 text-sm font-black text-white">
                      Ordina
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="px-4 pt-7">
          <div className="grid gap-4 lg:grid-cols-[0.8fr_1.2fr]">
            <div className="rounded-[2rem] bg-[#161616] p-5">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#ff6b00]">
                <Flame className="h-6 w-6" aria-hidden="true" />
              </div>
              <h2 className="mt-5 text-3xl font-black">Promo calde</h2>
              <p className="mt-2 text-sm font-bold leading-6 text-white/55">
                Offerte forti ogni giorno, pensate per scegliere in pochi secondi.
              </p>
            </div>

            <div className="rounded-[2rem] bg-[#ff6b00] p-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-black text-black/55">
                    prenotazione smart
                  </p>
                  <h2 className="mt-1 text-3xl font-black text-white">
                    Tavolo pronto alle 20:30
                  </h2>
                </div>
                <div className="grid h-14 w-14 place-items-center rounded-2xl bg-black text-white">
                  <CalendarCheck className="h-7 w-7" aria-hidden="true" />
                </div>
              </div>
              <button className="mt-6 h-12 w-full rounded-2xl bg-white text-sm font-black text-black">
                Prenota ora
              </button>
            </div>
          </div>
        </section>
      </div>

      <nav
        aria-label="Navigazione principale"
        className="fixed inset-x-0 bottom-0 z-30 border-t border-white/10 bg-[#080808] px-4 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] pt-3 md:hidden"
      >
        <div className="mx-auto grid max-w-md grid-cols-4 gap-2">
          {navItems.map(({ label, Icon, active }) => (
            <button
              className={`flex min-h-14 flex-col items-center justify-center gap-1 rounded-2xl text-xs font-black ${
                active ? "bg-[#ff6b00] text-white" : "text-white/55"
              }`}
              key={label}
            >
              <Icon className="h-5 w-5" aria-hidden="true" />
              {label}
            </button>
          ))}
        </div>
      </nav>
    </main>
  );
}
