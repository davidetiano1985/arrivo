import Link from 'next/link'
import { Suspense } from 'react'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'

import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import UsersFilters from './UsersFilters'

// ── helpers ───────────────────────────────────────────────────────────────────

function roleBadge(role: string) {
  const map: Record<string, string> = {
    super_admin:    'bg-[#ff6b00] text-white',
    gestore_locale: 'bg-black text-white',
    manager:        'bg-blue-100 text-blue-800',
    staff:          'bg-emerald-100 text-emerald-800',
    cliente:        'bg-gray-100 text-gray-700',
  }
  return map[role] ?? 'bg-black/10 text-black'
}

function formatDate(d: Date) {
  return d.toLocaleString('it-IT', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

function fmtId(n: number) {
  return `#${String(n).padStart(6, '0')}`
}

type SortField = 'numericId' | 'firstName' | 'lastName' | 'email' | 'role' | 'createdAt' | 'suspended'

// ── page ──────────────────────────────────────────────────────────────────────

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: {
    page?: string
    perPage?: string
    search?: string
    role?: string
    status?: string
    sort?: string
    order?: string
  }
}) {
  // Belt-and-suspenders auth check — layout already guards, this prevents
  // any future accidental exposure if the layout guard is ever refactored
  const session = await getServerSession(authOptions)
  const sessionRole = (session?.user as { role?: string })?.role
  if (!session || sessionRole !== 'super_admin') redirect('/login')

  const page    = Math.max(1, parseInt(searchParams.page    ?? '1',  10))
  // perPage=0 ("Tutti") removed — OOM risk at scale. Cap at 100.
  const VALID_PER_PAGE = [25, 50, 100]
  const perPage = VALID_PER_PAGE.includes(parseInt(searchParams.perPage ?? '25', 10))
    ? parseInt(searchParams.perPage ?? '25', 10)
    : 25
  const search  = searchParams.search?.trim() ?? ''
  const roleFilter   = searchParams.role   ?? ''
  const statusFilter = searchParams.status ?? ''
  const sort    = (searchParams.sort  as SortField) || 'createdAt'
  const order   = (searchParams.order === 'asc' ? 'asc' : 'desc') as 'asc' | 'desc'

  // ── Build where clause ──────────────────────────────────────────────────────
  const numericSearch =
    search.startsWith('#')
      ? parseInt(search.slice(1), 10)
      : /^\d+$/.test(search)
      ? parseInt(search, 10)
      : null

  const where = {
    ...(roleFilter   ? { role: roleFilter as never } : {}),
    ...(statusFilter === 'attivo'  ? { suspended: false } : {}),
    ...(statusFilter === 'sospeso' ? { suspended: true  } : {}),
    ...(search
      ? {
          OR: [
            ...(numericSearch !== null && !isNaN(numericSearch)
              ? [{ numericId: numericSearch }]
              : []),
            { firstName: { contains: search, mode: 'insensitive' as const } },
            { lastName:  { contains: search, mode: 'insensitive' as const } },
            { email:     { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {}),
  }

  const [totalAll, totalFiltered, activeCount, suspendedCount] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where }),
    prisma.user.count({ where: { suspended: false } }),
    prisma.user.count({ where: { suspended: true  } }),
  ])

  const users = await prisma.user.findMany({
    where,
    orderBy: { [sort]: order },
    ...(perPage > 0 ? { skip: (page - 1) * perPage, take: perPage } : {}),
    select: {
      id: true, numericId: true, firstName: true, lastName: true,
      email: true, phone: true, role: true, suspended: true,
      createdAt: true, password: true,
    },
  })

  const totalPages = perPage > 0 ? Math.ceil(totalFiltered / perPage) : 1

  function sortLink(field: SortField) {
    const newOrder = sort === field && order === 'asc' ? 'desc' : 'asc'
    const sp = new URLSearchParams(searchParams as Record<string, string>)
    sp.set('sort', field)
    sp.set('order', newOrder)
    sp.delete('page')
    return `/admin/users?${sp.toString()}`
  }

  function sortIcon(field: SortField) {
    if (sort !== field) return <span className="ml-1 opacity-30 text-[10px]">↕</span>
    return <span className="ml-1 text-[10px] text-[#ff6b00]">{order === 'asc' ? '↑' : '↓'}</span>
  }

  function pageLink(p: number) {
    const sp = new URLSearchParams(searchParams as Record<string, string>)
    sp.set('page', String(p))
    return `/admin/users?${sp.toString()}`
  }

  const COL_HEADERS: [SortField | null, string][] = [
    ['numericId', '#ID'],
    ['createdAt', 'Data reg.'],
    ['firstName', 'Nome'],
    ['lastName',  'Cognome'],
    ['email',     'Email'],
    [null,        'Telefono'],
    ['role',      'Ruolo'],
    [null,        'Metodo'],
    ['suspended', 'Stato'],
  ]

  return (
    <main className="min-h-screen w-full overflow-x-hidden bg-black px-4 py-6 text-white sm:px-6 sm:py-8">
      <section className="mx-auto w-full max-w-7xl">

        {/* Header */}
        <div className="mb-6 flex items-start justify-between gap-4 flex-wrap">
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-[#ff6b00]">Super admin</p>
            <h1 className="mt-1 text-3xl font-black">Utenti</h1>
          </div>
          <Link
            href="/admin/log"
            className="flex h-9 items-center gap-2 rounded-xl border border-white/10 px-3 text-xs font-black text-white/60 transition hover:border-white/30 hover:text-white"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
            </svg>
            Log admin
          </Link>
        </div>

        {/* Stats */}
        <div className="mb-6 grid gap-3 sm:grid-cols-3">
          {[
            { label: 'Utenti totali', value: totalAll      },
            { label: 'Attivi',        value: activeCount   },
            { label: 'Sospesi',       value: suspendedCount },
          ].map((s) => (
            <article key={s.label} className="rounded-2xl bg-white p-4 text-black">
              <p className="text-xs font-black uppercase text-black/45">{s.label}</p>
              <p className="mt-2 text-3xl font-black">{s.value}</p>
            </article>
          ))}
        </div>

        {/* Main card */}
        <div className="rounded-2xl bg-white p-5 text-black shadow-[0_8px_30px_rgba(0,0,0,0.25)]">

          <Suspense>
            <UsersFilters totalUsers={totalAll} totalFiltered={totalFiltered} />
          </Suspense>

          {/* ── Mobile: cards ── */}
          <div className="grid gap-4 xl:hidden">
            {users.length === 0 && (
              <p className="py-10 text-center text-sm font-black text-black/40">Nessun utente trovato.</p>
            )}
            {users.map((u) => (
              <Link
                key={u.id}
                href={`/admin/users/${u.id}`}
                className="block rounded-2xl border border-black/8 bg-black/[0.02] p-4 transition hover:border-[#ff6b00]/40 hover:bg-[#ff6b00]/5"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-xs font-black text-black/35">{fmtId(u.numericId)}</p>
                    <p className="mt-0.5 font-black text-black truncate">
                      {u.firstName ?? ''} {u.lastName ?? ''}
                    </p>
                    <p className="text-sm font-bold text-black/55 break-all">{u.email}</p>
                  </div>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="mt-1 shrink-0 text-black/30">
                    <path d="M9 18l6-6-6-6"/>
                  </svg>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-black ${roleBadge(u.role)}`}>{u.role}</span>
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-black ${u.suspended ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>
                    {u.suspended ? 'sospeso' : 'attivo'}
                  </span>
                  <span className="rounded-full bg-black/5 px-2.5 py-0.5 text-xs font-black text-black/50">
                    {u.password === null ? 'Google' : 'Email'}
                  </span>
                  <span className="ml-auto text-xs font-bold text-black/40">{formatDate(u.createdAt)}</span>
                </div>
              </Link>
            ))}
          </div>

          {/* ── Desktop: table ── */}
          <div className="hidden xl:block">
            <div className="overflow-hidden rounded-2xl border border-black/8">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[960px] border-collapse text-left text-sm">
                  <thead className="bg-black text-white">
                    <tr>
                      {COL_HEADERS.map(([field, label]) => (
                        <th key={label} className="px-4 py-3 text-xs font-black uppercase whitespace-nowrap">
                          {field ? (
                            <Link href={sortLink(field)} className="inline-flex items-center transition hover:text-[#ff6b00]">
                              {label}{sortIcon(field)}
                            </Link>
                          ) : label}
                        </th>
                      ))}
                      <th className="px-4 py-3 text-xs font-black uppercase">Dettaglio</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.length === 0 && (
                      <tr>
                        <td colSpan={10} className="py-12 text-center text-sm font-black text-black/40">
                          Nessun utente trovato.
                        </td>
                      </tr>
                    )}
                    {users.map((u) => (
                      <tr key={u.id} className="border-t border-black/6 transition hover:bg-[#ff6b00]/5">
                        <td className="px-4 py-3 font-mono text-xs font-black text-black/50">{fmtId(u.numericId)}</td>
                        <td className="px-4 py-3 text-xs font-bold text-black/55 whitespace-nowrap">{formatDate(u.createdAt)}</td>
                        <td className="px-4 py-3 font-black text-black">{u.firstName ?? '—'}</td>
                        <td className="px-4 py-3 font-bold text-black/70">{u.lastName ?? '—'}</td>
                        <td className="px-4 py-3 font-bold text-black/65 break-all max-w-[200px]">{u.email}</td>
                        <td className="px-4 py-3 text-xs font-bold text-black/50 whitespace-nowrap">{u.phone ?? '—'}</td>
                        <td className="px-4 py-3">
                          <span className={`rounded-full px-2.5 py-0.5 text-xs font-black whitespace-nowrap ${roleBadge(u.role)}`}>{u.role}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`rounded-full px-2.5 py-0.5 text-xs font-black ${u.password === null ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>
                            {u.password === null ? 'Google' : 'Email'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`rounded-full px-2.5 py-0.5 text-xs font-black ${u.suspended ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>
                            {u.suspended ? 'sospeso' : 'attivo'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <Link
                            href={`/admin/users/${u.id}`}
                            className="inline-flex items-center gap-1 rounded-xl bg-black px-3 py-1.5 text-xs font-black text-white transition hover:bg-[#ff6b00]"
                          >
                            Apri →
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* ── Pagination ── */}
          {perPage > 0 && totalPages > 1 && (
            <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs font-black text-black/45">
                Pagina {page} di {totalPages} — {totalFiltered} risultati
              </p>
              <div className="flex flex-wrap gap-1.5">
                {page > 1 && (
                  <Link
                    href={pageLink(page - 1)}
                    className="rounded-xl border border-black/10 px-3 py-1.5 text-xs font-black text-black transition hover:bg-[#ff6b00] hover:text-white hover:border-[#ff6b00]"
                  >
                    ← Prec
                  </Link>
                )}
                {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                  const p =
                    totalPages <= 7
                      ? i + 1
                      : page <= 4
                      ? i + 1
                      : page >= totalPages - 3
                      ? totalPages - 6 + i
                      : page - 3 + i
                  return (
                    <Link
                      key={p}
                      href={pageLink(p)}
                      className={`rounded-xl px-3 py-1.5 text-xs font-black transition ${
                        p === page
                          ? 'bg-[#ff6b00] text-white'
                          : 'border border-black/10 text-black hover:bg-[#ff6b00] hover:text-white hover:border-[#ff6b00]'
                      }`}
                    >
                      {p}
                    </Link>
                  )
                })}
                {page < totalPages && (
                  <Link
                    href={pageLink(page + 1)}
                    className="rounded-xl border border-black/10 px-3 py-1.5 text-xs font-black text-black transition hover:bg-[#ff6b00] hover:text-white hover:border-[#ff6b00]"
                  >
                    Succ →
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  )
}
