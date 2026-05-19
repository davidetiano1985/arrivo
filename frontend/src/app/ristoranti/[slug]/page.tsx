import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { cache } from 'react'

import NavbarPubblica from '@/components/NavbarPubblica'
import { prisma } from '@/lib/prisma'

const getRestaurant = cache(async (slug: string) => {
  return prisma.restaurant.findUnique({ where: { slug } })
})

export async function generateMetadata(
  { params }: { params: { slug: string } },
): Promise<Metadata> {
  const r = await getRestaurant(params.slug)
  if (!r || r.status !== 'approved') return { title: 'Locale non trovato — Arrivo' }

  const title = `${r.name}${r.city ? ` · ${r.city}` : ''} — Arrivo`
  const description = r.description
    || `${r.tipo ? r.tipo + ' a ' : ''}${r.city ?? ''} — prenota e ordina su Arrivo.`

  return {
    title,
    description,
    openGraph: { title, description },
    twitter: { card: 'summary', title, description },
  }
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start gap-4 border-b border-white/6 px-6 py-4 last:border-0">
      <span className="w-24 shrink-0 text-xs font-black uppercase text-white/30">{label}</span>
      <span className="break-all text-sm font-bold text-white/80">{value}</span>
    </div>
  )
}

function ComingSoonCard({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-[1.5rem] border border-white/8 bg-white/[0.04] p-6">
      <p className="text-xs font-black uppercase text-[#ff6b00]">{title}</p>
      <button
        className="mt-3 w-full rounded-xl border border-white/10 bg-white/[0.04] py-3 text-sm font-black text-white/25 cursor-not-allowed"
        disabled
        type="button"
      >
        {text}
      </button>
      <p className="mt-2 text-xs font-bold text-white/20">Disponibile prossimamente</p>
    </div>
  )
}

export default async function PaginaRistorante({ params }: { params: { slug: string } }) {
  const r = await getRestaurant(params.slug)

  if (!r || r.status !== 'approved') notFound()

  const contactRows = [
    r.tipo && { label: 'Tipo', value: r.tipo },
    r.city && { label: 'Città', value: r.city },
    r.address && { label: 'Indirizzo', value: r.address },
    r.phone && { label: 'Telefono', value: r.phone },
    r.email && { label: 'Email', value: r.email },
  ].filter(Boolean) as { label: string; value: string }[]

  return (
    <main className="min-h-screen bg-black text-white">

      <NavbarPubblica />

      <div className="mx-auto max-w-screen-xl px-4 py-6 sm:px-6 sm:py-10">
        <div className="max-w-2xl">

          {/* ── Hero ── */}
          <div className="rounded-[2rem] bg-[#ff6b00] p-6 sm:p-8">
            {r.tipo && (
              <p className="mb-2 text-sm font-black uppercase text-black/55">{r.tipo}</p>
            )}
            <h1 className="break-words text-4xl font-black tracking-tight sm:text-5xl">
              {r.name}
            </h1>
            {r.city && (
              <p className="mt-2 text-lg font-bold text-black/65">{r.city}</p>
            )}
            {r.description && (
              <p className="mt-4 text-base font-semibold leading-relaxed text-black/70">
                {r.description}
              </p>
            )}
          </div>

          {/* ── Info contatto ── */}
          {contactRows.length > 0 && (
            <div className="mt-6 overflow-hidden rounded-[1.5rem] border border-white/8 bg-white/[0.04]">
              <div className="border-b border-white/8 px-6 py-4">
                <p className="text-xs font-black uppercase text-white/35">Informazioni</p>
              </div>
              {contactRows.map(({ label, value }) => (
                <InfoRow key={label} label={label} value={value} />
              ))}
            </div>
          )}

          {/* ── CTA coming soon ── */}
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <ComingSoonCard
              text="Prenota un tavolo"
              title="Prenotazioni"
            />
            <ComingSoonCard
              text="Ordina prima di arrivare"
              title="Ordina prima"
            />
          </div>

          {/* ── Footer mini ── */}
          <div className="mt-10 flex items-center justify-between gap-4 border-t border-white/6 pt-6">
            <p className="text-xs font-bold text-white/20">
              Powered by{' '}
              <Link className="font-black text-white/35 hover:text-white transition" href="/">
                Arrivo
              </Link>
            </p>
            <Link
              className="text-xs font-black text-[#ff6b00] transition hover:text-[#e05e00]"
              href="/registrati/locale"
            >
              Registra il tuo locale →
            </Link>
          </div>

        </div>
      </div>
    </main>
  )
}
