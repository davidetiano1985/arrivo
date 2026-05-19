import type { Metadata } from 'next'
import Link from 'next/link'

import FooterPubblico from '@/components/FooterPubblico'
import NavbarPubblica from '@/components/NavbarPubblica'
import { prisma } from '@/lib/prisma'

export const metadata: Metadata = {
  title: 'Trova ristoranti — Arrivo',
  description: 'Scopri i ristoranti su Arrivo. Filtra per città, prenota il tavolo e ordina prima di arrivare.',
  openGraph: {
    title: 'Trova ristoranti — Arrivo',
    description: 'Scopri i ristoranti su Arrivo. Filtra per città, prenota il tavolo e ordina prima di arrivare.',
  },
}

export default async function TrovaRistorantiPage({
  searchParams,
}: {
  searchParams: { city?: string }
}) {
  const city = searchParams.city?.trim() || ''

  const ristoranti = await prisma.restaurant.findMany({
    where: {
      status: 'approved',
      ...(city ? { city: { contains: city, mode: 'insensitive' } } : {}),
    },
    orderBy: { createdAt: 'desc' },
    select: { id: true, name: true, slug: true, city: true, tipo: true },
  })

  return (
    <main className="min-h-screen overflow-x-hidden bg-black text-white">
      <NavbarPubblica />

      {/* Hero + Search */}
      <section className="mx-auto max-w-screen-xl px-4 py-16 sm:px-6 sm:py-24">
        <span className="inline-flex rounded-full border border-[#ff6b00]/40 bg-[#ff6b00]/10 px-4 py-1.5 text-xs font-black uppercase text-[#ff6b00]">
          Trova ristoranti
        </span>
        <h1 className="mt-5 text-4xl font-black leading-tight sm:text-5xl">
          Il tuo prossimo pasto<br />
          <span className="text-[#ff6b00]">a portata di tap.</span>
        </h1>
        <p className="mt-6 max-w-xl text-base font-bold leading-7 text-white/60">
          Esplora i ristoranti disponibili su Arrivo. Prenota il tavolo e ordina prima di arrivare.
        </p>

        {/* Search form — GET, zero client JS */}
        <form action="/trova-ristoranti" method="GET" className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex flex-1 items-center gap-3 rounded-2xl border border-white/15 bg-white/[0.05] px-4 py-3">
            <svg className="h-4 w-4 shrink-0 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <input
              className="w-full bg-transparent text-sm font-bold text-white outline-none placeholder:text-white/30"
              defaultValue={city}
              name="city"
              placeholder="Filtra per città… es. Milano, Roma"
              type="text"
            />
          </div>
          <button
            className="rounded-2xl bg-[#ff6b00] px-7 py-3.5 text-sm font-black text-white transition hover:bg-[#e05e00]"
            type="submit"
          >
            Cerca
          </button>
          {city && (
            <a
              className="rounded-2xl border border-white/15 px-5 py-3.5 text-sm font-black text-white/60 transition hover:border-white/40 hover:text-white"
              href="/trova-ristoranti"
            >
              Azzera
            </a>
          )}
        </form>
      </section>

      {/* Risultati */}
      <section className="pb-24">
        <div className="mx-auto max-w-screen-xl px-4 sm:px-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-black uppercase text-white/40">Risultati</p>
              <h2 className="mt-1 text-2xl font-black sm:text-3xl">
                {city ? `Ristoranti a ${city}` : 'Tutti i ristoranti'}
              </h2>
            </div>
            <span className="rounded-full border border-white/10 px-3 py-1 text-xs font-black text-white/40">
              {ristoranti.length} {ristoranti.length === 1 ? 'locale' : 'locali'}
            </span>
          </div>

          {ristoranti.length === 0 ? (
            <div className="mt-16 flex flex-col items-center gap-4 text-center">
              <div className="rounded-full border border-white/10 bg-white/[0.04] p-6">
                <svg className="h-8 w-8 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.75 9.776c.112-.017.227-.026.344-.026h15.812c.117 0 .232.009.344.026m-16.5 0a2.25 2.25 0 00-1.883 2.542l.857 6a2.25 2.25 0 002.227 1.932H19.05a2.25 2.25 0 002.227-1.932l.857-6a2.25 2.25 0 00-1.883-2.542m-16.5 0V6A2.25 2.25 0 016 3.75h3.879a1.5 1.5 0 011.06.44l2.122 2.12a1.5 1.5 0 001.06.44H18A2.25 2.25 0 0120.25 9v.776" />
                </svg>
              </div>
              <p className="text-lg font-black">Nessun ristorante trovato</p>
              <p className="text-sm font-bold text-white/40">
                {city
                  ? `Non ci sono ancora ristoranti approvati a "${city}".`
                  : 'Non ci sono ancora ristoranti approvati sulla piattaforma.'}
              </p>
              {city && (
                <a
                  className="mt-2 rounded-2xl border border-white/20 px-5 py-2.5 text-sm font-black text-white/70 transition hover:border-white/50 hover:text-white"
                  href="/trova-ristoranti"
                >
                  Vedi tutti i ristoranti
                </a>
              )}
            </div>
          ) : (
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {ristoranti.map((r) => (
                <Link
                  key={r.id}
                  href={`/ristoranti/${r.slug}`}
                  className="group rounded-2xl border border-white/8 bg-white/[0.03] p-5 transition hover:border-[#ff6b00]/40 hover:bg-white/[0.06]"
                >
                  {/* Placeholder visivo */}
                  <div className="mb-4 flex h-32 items-center justify-center rounded-xl bg-[#ff6b00]/10">
                    <span className="text-4xl font-black text-[#ff6b00]/40">
                      {r.name.charAt(0).toUpperCase()}
                    </span>
                  </div>

                  <h3 className="font-black leading-snug transition group-hover:text-[#ff6b00]">
                    {r.name}
                  </h3>

                  <p className="mt-1 text-xs font-bold text-white/45">
                    {[r.tipo, r.city].filter(Boolean).join(' · ')}
                  </p>

                  <div className="mt-4 flex items-center justify-between">
                    <span className="rounded-full bg-[#ff6b00]/10 px-3 py-1 text-xs font-black text-[#ff6b00]">
                      Scopri il locale
                    </span>
                    <span className="text-xs font-bold text-white/30 transition group-hover:text-white/60">
                      →
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* CTA ristoratori */}
          <div className="mt-16 rounded-2xl border border-[#ff6b00]/20 bg-[#ff6b00]/5 p-6 text-center">
            <p className="font-black">Hai un ristorante?</p>
            <p className="mt-1 text-sm font-bold text-white/50">
              Porta il tuo locale su Arrivo. Registrazione gratuita, approvazione in 24 ore.
            </p>
            <a
              href="/registrati/locale"
              className="mt-4 inline-block rounded-2xl bg-[#ff6b00] px-6 py-3 text-sm font-black text-white transition hover:bg-[#e05e00]"
            >
              Registra il tuo locale →
            </a>
          </div>
        </div>
      </section>

      <FooterPubblico />
    </main>
  )
}
