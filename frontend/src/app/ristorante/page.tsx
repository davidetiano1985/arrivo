import Link from 'next/link'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'

import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import RistoranteEditForm from './RistoranteEditForm'

const statusConfig: Record<string, { label: string; dot: string; text: string }> = {
  pending:  { label: 'In attesa', dot: 'bg-amber-400',   text: 'text-amber-600' },
  approved: { label: 'Attivo',    dot: 'bg-emerald-400', text: 'text-emerald-600' },
  rejected: { label: 'Non approvato', dot: 'bg-red-400', text: 'text-red-600' },
}

export default async function RistorantePage() {
  const session = await getServerSession(authOptions)
  const role = (session?.user as { role?: string })?.role

  if (!session || (role !== 'gestore_locale' && role !== 'super_admin')) {
    redirect('/login')
  }

  const userId = (session.user as { id: string }).id
  const restaurant = await prisma.restaurant.findFirst({
    where: { ownerId: userId },
  })

  const firstName = (session.user as { firstName?: string })?.firstName
    || session.user?.name?.split(' ')[0]
    || ''

  return (
    <main className="min-h-screen overflow-x-hidden bg-black px-4 py-6 text-white sm:px-5 sm:py-8">
      <section className="mx-auto w-full max-w-3xl">

        <div className="mb-2 flex items-center gap-3">
          <Link className="text-xs font-black text-white/40 transition hover:text-white" href="/">
            ← Home
          </Link>
        </div>

        <div className="mb-6">
          <p className="text-xs font-black uppercase text-[#ff6b00]">Pannello gestore</p>
          <h1 className="mt-2 text-3xl font-black">
            {firstName ? `Benvenuto, ${firstName}` : 'Il tuo locale'}
          </h1>
        </div>

        {!restaurant ? (
          /* ── Nessun locale collegato ── */
          <div className="rounded-[2rem] border border-white/8 bg-white/[0.04] px-8 py-12 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/8">
              <svg className="h-7 w-7 text-white/40" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72m-13.5 8.65h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.75c0 .415.336.75.75.75z" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h2 className="text-xl font-black text-white">Nessun locale collegato</h2>
            <p className="mt-2 text-sm font-bold text-white/45 leading-6">
              Il tuo account non è ancora associato a nessun locale.<br />
              Se hai già inviato una richiesta, attendi l'approvazione.
            </p>
            <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Link
                className="rounded-full bg-[#ff6b00] px-6 py-2.5 text-sm font-black text-black transition hover:bg-[#e05e00]"
                href="/registrati/locale"
              >
                Registra il tuo locale
              </Link>
              <Link
                className="rounded-full border border-white/20 px-6 py-2.5 text-sm font-black text-white/70 transition hover:border-white/50 hover:text-white"
                href="/contatti"
              >
                Contattaci
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* ── Intestazione locale ── */}
            <div className="rounded-[2rem] bg-[#ff6b00] p-5 sm:p-6">
              <p className="text-sm font-black uppercase text-black/60">Il tuo locale</p>
              <h2 className="mt-2 break-words text-3xl font-black tracking-normal sm:text-4xl">
                {restaurant.name}
              </h2>
              {restaurant.city && (
                <p className="mt-1 text-base font-bold text-black/70">{restaurant.city}</p>
              )}
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-full ${statusConfig[restaurant.status]?.dot ?? 'bg-white/40'}`} />
                  <span className="text-sm font-black text-black/80">
                    {statusConfig[restaurant.status]?.label ?? restaurant.status}
                  </span>
                </div>
                {restaurant.status === 'approved' && (
                  <Link
                    className="rounded-full bg-black/15 px-4 py-1.5 text-xs font-black text-black/80 transition hover:bg-black/25"
                    href={`/ristoranti/${restaurant.slug}`}
                    target="_blank"
                  >
                    Vedi pagina pubblica →
                  </Link>
                )}
              </div>
            </div>

            {/* ── Dati contatto (con form modifica) ── */}
            <RistoranteEditForm restaurant={{
              id: restaurant.id,
              name: restaurant.name,
              tipo: restaurant.tipo,
              city: restaurant.city,
              address: restaurant.address,
              phone: restaurant.phone,
              email: restaurant.email,
            }} />

            {/* ── Placeholder funzionalità future ── */}
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-[1.5rem] border border-white/8 bg-white/[0.04] p-6">
                <p className="text-xs font-black uppercase text-[#ff6b00]">Prenotazioni</p>
                <p className="mt-2 text-2xl font-black text-white/20">—</p>
                <p className="mt-1 text-xs font-bold text-white/25 leading-5">
                  Gestione prenotazioni tavoli disponibile prossimamente.
                </p>
              </div>
              <div className="rounded-[1.5rem] border border-white/8 bg-white/[0.04] p-6">
                <p className="text-xs font-black uppercase text-[#ff6b00]">Ordini</p>
                <p className="mt-2 text-2xl font-black text-white/20">—</p>
                <p className="mt-1 text-xs font-bold text-white/25 leading-5">
                  Ricezione e gestione ordini pre-arrivo disponibile prossimamente.
                </p>
              </div>
              <div className="rounded-[1.5rem] border border-white/8 bg-white/[0.04] p-6">
                <p className="text-xs font-black uppercase text-[#ff6b00]">Menu</p>
                <p className="mt-2 text-2xl font-black text-white/20">—</p>
                <p className="mt-1 text-xs font-bold text-white/25 leading-5">
                  Gestione menu digitale disponibile prossimamente.
                </p>
              </div>
              <div className="rounded-[1.5rem] border border-white/8 bg-white/[0.04] p-6">
                <p className="text-xs font-black uppercase text-[#ff6b00]">Statistiche</p>
                <p className="mt-2 text-2xl font-black text-white/20">—</p>
                <p className="mt-1 text-xs font-bold text-white/25 leading-5">
                  Report e analisi delle performance disponibili prossimamente.
                </p>
              </div>
            </div>
          </>
        )}

      </section>
    </main>
  )
}
