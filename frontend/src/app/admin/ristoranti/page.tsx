import { getServerSession } from 'next-auth'
import { redirect }         from 'next/navigation'
import Link                 from 'next/link'

import { authOptions } from '@/lib/auth'
import { prisma }      from '@/lib/prisma'

function fmt(d: Date) {
  return d.toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

export default async function RistorantiPage({
  searchParams,
}: {
  searchParams: { cursor?: string; status?: string; search?: string }
}) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as { role?: string })?.role !== 'super_admin') redirect('/login')

  const cursorId = searchParams.cursor ?? null
  const perPage  = 25
  const status   = searchParams.status ?? ''
  const search   = searchParams.search?.trim() ?? ''

  const where = {
    ...(status ? { status: status as 'pending' | 'approved' | 'rejected' } : {}),
    ...(search ? {
      OR: [
        { name:  { contains: search, mode: 'insensitive' as const } },
        { email: { contains: search, mode: 'insensitive' as const } },
        { city:  { contains: search, mode: 'insensitive' as const } },
      ],
    } : {}),
  }

  const [total, rawRestaurants] = await Promise.all([
    prisma.restaurant.count({ where }),
    prisma.restaurant.findMany({
      where,
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      take:    perPage + 1,
      ...(cursorId ? { cursor: { id: cursorId }, skip: 1 } : {}),
      select: {
        id: true, name: true, slug: true, city: true, tipo: true,
        email: true, phone: true, status: true, createdAt: true,
        owner: { select: { id: true, email: true, firstName: true, lastName: true } },
      },
    }),
  ])

  const hasNextPage  = rawRestaurants.length > perPage
  const restaurants  = hasNextPage ? rawRestaurants.slice(0, perPage) : rawRestaurants
  const nextCursor   = hasNextPage ? restaurants[restaurants.length - 1].id : null

  function cursorLink(c: string | null) {
    const sp = new URLSearchParams(searchParams as Record<string, string>)
    sp.delete('cursor')
    if (c) sp.set('cursor', c)
    return `/admin/ristoranti?${sp.toString()}`
  }

  const statusBadge = (s: string) => ({
    approved: 'bg-emerald-500/20 text-emerald-400',
    rejected: 'bg-red-500/20 text-red-400',
    pending:  'bg-amber-400/20 text-amber-400',
  }[s] ?? 'bg-white/10 text-white/40')

  const statusLabel = { approved: 'Approvato', rejected: 'Rifiutato', pending: 'In attesa' }

  return (
    <main className="min-h-screen w-full overflow-x-hidden px-4 py-6 sm:px-6 sm:py-8">
      <div className="mx-auto w-full max-w-6xl space-y-6">

        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-[#ff6b00]">Super Admin</p>
            <h1 className="mt-1 text-3xl font-black">Locali</h1>
            <p className="mt-1 text-sm font-bold text-white/40">{total} totali</p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/admin/ristoranti/create"
              className="flex h-9 items-center gap-2 rounded-xl bg-[#ff6b00] px-4 text-xs font-black text-black transition hover:bg-[#e55f00]"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <path d="M12 5v14M5 12h14"/>
              </svg>
              Crea locale
            </Link>
            <Link href="/admin/richieste" className="flex h-9 items-center gap-2 rounded-xl border border-white/10 px-3 text-xs font-black text-white/60 transition hover:border-white/30 hover:text-white">
              Richieste →
            </Link>
          </div>
        </div>

        {/* Search */}
        <form method="GET" action="/admin/ristoranti" className="flex items-center gap-2">
          {status && <input type="hidden" name="status" value={status} />}
          <div className="relative flex-1 max-w-sm">
            <svg className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/30" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              type="text"
              name="search"
              defaultValue={search}
              placeholder="Cerca per nome, email, città…"
              className="w-full rounded-xl border border-white/10 bg-white/[0.04] py-2 pl-8 pr-9 text-xs font-bold text-white placeholder:text-white/25 outline-none focus:border-[#ff6b00]/50"
            />
            {search && (
              <a
                href={`/admin/ristoranti?${status ? `status=${status}` : ''}`}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white"
                aria-label="Cancella ricerca"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <path d="M18 6 6 18M6 6l12 12"/>
                </svg>
              </a>
            )}
          </div>
          <button
            type="submit"
            className="rounded-xl border border-white/10 px-3 py-2 text-xs font-black text-white/60 transition hover:border-[#ff6b00]/40 hover:text-white"
          >
            Cerca
          </button>
        </form>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {[
            { key: '',          label: 'Tutti'       },
            { key: 'pending',   label: 'In attesa'   },
            { key: 'approved',  label: 'Approvati'   },
            { key: 'rejected',  label: 'Rifiutati'   },
          ].map((f) => {
            const sp = new URLSearchParams(searchParams as Record<string, string>)
            if (f.key) sp.set('status', f.key); else sp.delete('status')
            sp.delete('page')
            return (
              <Link
                key={f.key}
                href={`/admin/ristoranti?${sp.toString()}`}
                className={`rounded-full px-3 py-1.5 text-xs font-black transition ${
                  status === f.key
                    ? 'bg-[#ff6b00] text-black'
                    : 'border border-white/10 text-white/50 hover:text-white'
                }`}
              >
                {f.label}
              </Link>
            )
          })}
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.03]">
          {/* Mobile cards */}
          <div className="grid gap-3 p-4 lg:hidden">
            {restaurants.length === 0 && (
              <p className="py-8 text-center text-sm font-bold text-white/25">Nessun locale trovato.</p>
            )}
            {restaurants.map((r) => (
              <div key={r.id} className="rounded-xl border border-white/[0.07] bg-white/[0.03] p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-black text-white">{r.name}</p>
                    <p className="text-xs font-bold text-white/40">{r.city ?? '—'} · {r.tipo ?? '—'}</p>
                  </div>
                  <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-black ${statusBadge(r.status)}`}>
                    {statusLabel[r.status as keyof typeof statusLabel] ?? r.status}
                  </span>
                </div>
                {r.owner && (
                  <p className="mt-2 text-xs font-bold text-white/35">
                    Proprietario:{' '}
                    <Link href={`/admin/users/${r.owner.id}`} className="text-[#ff6b00] hover:underline">
                      {r.owner.firstName ?? ''} {r.owner.lastName ?? ''} ({r.owner.email})
                    </Link>
                  </p>
                )}
                <div className="mt-2 flex items-center justify-between">
                  <p className="font-mono text-[10px] text-white/25">/{r.slug} · {fmt(r.createdAt)}</p>
                  <Link
                    href={`/admin/ristoranti/${r.id}`}
                    className="rounded-xl border border-white/10 px-2.5 py-1 text-[10px] font-black text-white/50 transition hover:border-[#ff6b00]/50 hover:text-white"
                  >
                    ✏️ Modifica
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop table */}
          <div className="hidden lg:block">
            <table className="w-full border-collapse text-sm">
              <thead className="bg-white/5">
                <tr>
                  {['Nome', 'Città', 'Tipo', 'Email', 'Proprietario', 'Stato', 'Creato', ''].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-[10px] font-black uppercase text-white/30">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {restaurants.length === 0 && (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-sm font-bold text-white/25">
                      Nessun locale trovato.
                    </td>
                  </tr>
                )}
                {restaurants.map((r) => (
                  <tr key={r.id} className="border-t border-white/[0.05] hover:bg-white/[0.02]">
                    <td className="px-4 py-3 font-black text-white">{r.name}</td>
                    <td className="px-4 py-3 text-xs font-bold text-white/50">{r.city ?? '—'}</td>
                    <td className="px-4 py-3 text-xs font-bold text-white/50">{r.tipo ?? '—'}</td>
                    <td className="px-4 py-3 text-xs font-bold text-white/40">{r.email ?? '—'}</td>
                    <td className="px-4 py-3 text-xs font-bold text-white/50">
                      {r.owner ? (
                        <Link href={`/admin/users/${r.owner.id}`} className="text-[#ff6b00] hover:underline">
                          {r.owner.firstName ?? ''} {r.owner.lastName ?? ''}
                        </Link>
                      ) : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-black ${statusBadge(r.status)}`}>
                        {statusLabel[r.status as keyof typeof statusLabel] ?? r.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs font-bold text-white/30 whitespace-nowrap">
                      {fmt(r.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/ristoranti/${r.id}`}
                        className="rounded-xl border border-white/10 px-2.5 py-1.5 text-[10px] font-black text-white/50 transition hover:border-[#ff6b00]/50 hover:text-white"
                      >
                        ✏️ Modifica
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Cursor Pagination */}
        {(cursorId || hasNextPage) && (
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs font-bold text-white/30">{total} locali totali</p>
            <div className="flex gap-1.5">
              {cursorId && (
                <Link href={cursorLink(null)} className="rounded-xl border border-white/10 px-3 py-1.5 text-xs font-black text-white/60 hover:text-white">← Inizio</Link>
              )}
              {hasNextPage && nextCursor && (
                <Link href={cursorLink(nextCursor)} className="rounded-xl border border-white/10 px-3 py-1.5 text-xs font-black text-white/60 hover:text-white">Successivi {perPage} →</Link>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
