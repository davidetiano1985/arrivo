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
  searchParams: { page?: string; status?: string; search?: string }
}) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as { role?: string })?.role !== 'super_admin') redirect('/login')

  const page     = Math.max(1, parseInt(searchParams.page ?? '1', 10))
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

  const [total, restaurants] = await Promise.all([
    prisma.restaurant.count({ where }),
    prisma.restaurant.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip:    (page - 1) * perPage,
      take:    perPage,
      select: {
        id: true, name: true, slug: true, city: true, tipo: true,
        email: true, phone: true, status: true, createdAt: true,
        owner: { select: { id: true, email: true, firstName: true, lastName: true } },
      },
    }),
  ])

  const totalPages = Math.ceil(total / perPage)

  const statusBadge = (s: string) => ({
    approved: 'bg-emerald-500/20 text-emerald-400',
    rejected: 'bg-red-500/20 text-red-400',
    pending:  'bg-amber-400/20 text-amber-400',
  }[s] ?? 'bg-white/10 text-white/40')

  const statusLabel = { approved: 'Approvato', rejected: 'Rifiutato', pending: 'In attesa' }

  function pageLink(p: number) {
    const sp = new URLSearchParams(searchParams as Record<string, string>)
    sp.set('page', String(p))
    return `/admin/ristoranti?${sp.toString()}`
  }

  return (
    <main className="min-h-screen w-full overflow-x-hidden px-4 py-6 sm:px-6 sm:py-8">
      <div className="mx-auto w-full max-w-6xl space-y-6">

        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-[#ff6b00]">Super Admin</p>
            <h1 className="mt-1 text-3xl font-black">Ristoranti</h1>
            <p className="mt-1 text-sm font-bold text-white/40">{total} totali</p>
          </div>
          <Link href="/admin/richieste" className="flex h-9 items-center gap-2 rounded-xl border border-white/10 px-3 text-xs font-black text-white/60 transition hover:border-white/30 hover:text-white">
            Nuove richieste →
          </Link>
        </div>

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
              <p className="py-8 text-center text-sm font-bold text-white/25">Nessun ristorante trovato.</p>
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
                    Owner:{' '}
                    <Link href={`/admin/users/${r.owner.id}`} className="text-[#ff6b00] hover:underline">
                      {r.owner.firstName ?? ''} {r.owner.lastName ?? ''} ({r.owner.email})
                    </Link>
                  </p>
                )}
                <p className="mt-1 font-mono text-[10px] text-white/25">/{r.slug} · {fmt(r.createdAt)}</p>
              </div>
            ))}
          </div>

          {/* Desktop table */}
          <div className="hidden lg:block">
            <table className="w-full border-collapse text-sm">
              <thead className="bg-white/5">
                <tr>
                  {['Nome', 'Città', 'Tipo', 'Email', 'Owner', 'Stato', 'Creato'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-[10px] font-black uppercase text-white/30">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {restaurants.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-sm font-bold text-white/25">
                      Nessun ristorante trovato.
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs font-bold text-white/30">Pagina {page} di {totalPages}</p>
            <div className="flex gap-1.5">
              {page > 1 && (
                <Link href={pageLink(page - 1)} className="rounded-xl border border-white/10 px-3 py-1.5 text-xs font-black text-white/60 hover:text-white">← Prec</Link>
              )}
              {page < totalPages && (
                <Link href={pageLink(page + 1)} className="rounded-xl border border-white/10 px-3 py-1.5 text-xs font-black text-white/60 hover:text-white">Succ →</Link>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
