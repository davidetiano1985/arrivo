import { getServerSession } from 'next-auth'
import { redirect }         from 'next/navigation'
import Link                 from 'next/link'

import { authOptions } from '@/lib/auth'
import { prisma }      from '@/lib/prisma'

function fmt(d: Date) {
  return d.toLocaleString('it-IT', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

export default async function ClientiPage({
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

  const numericId = search.startsWith('#')
    ? parseInt(search.slice(1), 10)
    : /^\d+$/.test(search) ? parseInt(search, 10) : null

  const where = {
    role: 'cliente' as const,
    ...(status === 'attivo'  ? { suspended: false } : {}),
    ...(status === 'sospeso' ? { suspended: true  } : {}),
    ...(search ? {
      OR: [
        ...(numericId !== null && !isNaN(numericId) ? [{ numericId }] : []),
        { firstName: { contains: search, mode: 'insensitive' as const } },
        { lastName:  { contains: search, mode: 'insensitive' as const } },
        { email:     { contains: search, mode: 'insensitive' as const } },
      ],
    } : {}),
  }

  const [total, active, suspended, clienti] = await Promise.all([
    prisma.user.count({ where }),
    prisma.user.count({ where: { role: 'cliente', suspended: false } }),
    prisma.user.count({ where: { role: 'cliente', suspended: true  } }),
    prisma.user.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip:    (page - 1) * perPage,
      take:    perPage,
      select: {
        id: true, numericId: true, firstName: true, lastName: true,
        email: true, phone: true, suspended: true, createdAt: true,
        password: true, loginAttempts: true,
        accounts: { select: { provider: true } },
      },
    }),
  ])

  const totalPages = Math.ceil(total / perPage)

  function pageLink(p: number) {
    const sp = new URLSearchParams(searchParams as Record<string, string>)
    sp.set('page', String(p))
    return `/admin/clienti?${sp.toString()}`
  }

  return (
    <main className="min-h-screen w-full overflow-x-hidden px-4 py-6 sm:px-6 sm:py-8">
      <div className="mx-auto w-full max-w-6xl space-y-6">

        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-[#ff6b00]">Super Admin</p>
            <h1 className="mt-1 text-3xl font-black">Clienti</h1>
          </div>
          <Link href="/admin/users" className="flex h-9 items-center gap-2 rounded-xl border border-white/10 px-3 text-xs font-black text-white/60 transition hover:border-white/30 hover:text-white">
            Tutti gli utenti →
          </Link>
        </div>

        {/* Stats */}
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            { label: 'Clienti totali', value: total,     color: 'text-white'         },
            { label: 'Attivi',         value: active,    color: 'text-emerald-400'   },
            { label: 'Sospesi',        value: suspended, color: suspended > 0 ? 'text-red-400' : 'text-white' },
          ].map((s) => (
            <div key={s.label} className="rounded-2xl border border-white/[0.07] bg-white/[0.04] p-4">
              <p className="text-[10px] font-black uppercase text-white/30">{s.label}</p>
              <p className={`mt-2 text-3xl font-black ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Filter bar */}
        <div className="flex flex-wrap items-center gap-2">
          {[
            { key: '',        label: 'Tutti'   },
            { key: 'attivo',  label: 'Attivi'  },
            { key: 'sospeso', label: 'Sospesi' },
          ].map((f) => {
            const sp = new URLSearchParams(searchParams as Record<string, string>)
            if (f.key) sp.set('status', f.key); else sp.delete('status')
            sp.delete('page')
            return (
              <Link key={f.key} href={`/admin/clienti?${sp.toString()}`}
                className={`rounded-full px-3 py-1.5 text-xs font-black transition ${
                  status === f.key ? 'bg-[#ff6b00] text-black' : 'border border-white/10 text-white/50 hover:text-white'
                }`}
              >
                {f.label}
              </Link>
            )
          })}
        </div>

        {/* Table / cards */}
        <div className="overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.03]">
          <div className="hidden lg:block">
            <table className="w-full border-collapse text-sm">
              <thead className="bg-white/5">
                <tr>
                  {['#ID', 'Nome', 'Email', 'Telefono', 'Metodo', 'Tentativi', 'Stato', 'Registrato', ''].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-[10px] font-black uppercase text-white/30">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {clienti.length === 0 && (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-sm font-bold text-white/25">Nessun cliente trovato.</td>
                  </tr>
                )}
                {clienti.map((u) => {
                  const isGoogle = u.accounts.some((a) => a.provider === 'google')
                  const method   = isGoogle && !u.password ? 'Google' : isGoogle ? 'Google+Email' : 'Email'
                  return (
                    <tr key={u.id} className="border-t border-white/[0.05] hover:bg-white/[0.02]">
                      <td className="px-4 py-3 font-mono text-xs text-white/30">#{String(u.numericId).padStart(6,'0')}</td>
                      <td className="px-4 py-3 font-black text-white">{u.firstName ?? ''} {u.lastName ?? ''}</td>
                      <td className="px-4 py-3 text-xs font-bold text-white/50">{u.email}</td>
                      <td className="px-4 py-3 text-xs font-bold text-white/40">{u.phone ?? '—'}</td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-black ${
                          method.includes('Google') ? 'bg-blue-500/20 text-blue-300' : 'bg-white/[0.07] text-white/40'
                        }`}>{method}</span>
                      </td>
                      <td className="px-4 py-3">
                        {u.loginAttempts > 0 && (
                          <span className={`rounded-full px-2 py-0.5 text-[10px] font-black ${
                            u.loginAttempts >= 5 ? 'bg-amber-400/20 text-amber-400' : 'bg-white/10 text-white/40'
                          }`}>{u.loginAttempts}</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-black ${
                          u.suspended ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'
                        }`}>{u.suspended ? 'Sospeso' : 'Attivo'}</span>
                      </td>
                      <td className="px-4 py-3 text-xs font-bold text-white/30 whitespace-nowrap">{fmt(u.createdAt)}</td>
                      <td className="px-4 py-3">
                        <Link href={`/admin/users/${u.id}`} className="text-[10px] font-black text-[#ff6b00] hover:underline">
                          Apri →
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile */}
          <div className="grid gap-3 p-4 lg:hidden">
            {clienti.map((u) => (
              <Link key={u.id} href={`/admin/users/${u.id}`}
                className="block rounded-xl border border-white/[0.07] p-4 transition hover:border-[#ff6b00]/30"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-black text-white">{u.firstName ?? ''} {u.lastName ?? ''}</p>
                    <p className="text-xs font-bold text-white/40">{u.email}</p>
                  </div>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-black ${
                    u.suspended ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'
                  }`}>{u.suspended ? 'Sospeso' : 'Attivo'}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs font-bold text-white/30">Pagina {page} di {totalPages} · {total} clienti</p>
            <div className="flex gap-1.5">
              {page > 1 && <Link href={pageLink(page - 1)} className="rounded-xl border border-white/10 px-3 py-1.5 text-xs font-black text-white/60 hover:text-white">← Prec</Link>}
              {page < totalPages && <Link href={pageLink(page + 1)} className="rounded-xl border border-white/10 px-3 py-1.5 text-xs font-black text-white/60 hover:text-white">Succ →</Link>}
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
