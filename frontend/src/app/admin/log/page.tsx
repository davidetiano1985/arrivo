import Link from 'next/link'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'

import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const ACTION_LABELS: Record<string, { label: string; color: string }> = {
  ROLE_CHANGE:          { label: 'Cambio ruolo',        color: 'bg-blue-100 text-blue-800'      },
  SUSPEND:              { label: 'Sospensione',          color: 'bg-red-100 text-red-700'        },
  UNSUSPEND:            { label: 'Riattivazione',        color: 'bg-emerald-100 text-emerald-700'},
  DELETE_USER:          { label: 'Eliminazione utente',  color: 'bg-red-200 text-red-800'        },
  RESET_PASSWORD:       { label: 'Reset password',       color: 'bg-yellow-100 text-yellow-800'  },
  RESET_LOGIN_ATTEMPTS: { label: 'Reset tentativi',      color: 'bg-gray-100 text-gray-700'      },
  CREATE_USER:          { label: 'Creazione utente',     color: 'bg-purple-100 text-purple-800'  },
  APPROVA_RICHIESTA:    { label: 'Approva richiesta',    color: 'bg-emerald-100 text-emerald-800' },
  RIFIUTA_RICHIESTA:    { label: 'Rifiuta richiesta',    color: 'bg-red-100 text-red-700'         },
  RESOLVE_ALERT:        { label: 'Risolvi alert',        color: 'bg-amber-100 text-amber-800'     },
  CREATE_ALERT:         { label: 'Crea alert',           color: 'bg-orange-100 text-orange-800'   },
  FORCE_LOGOUT:         { label: 'Forza logout',         color: 'bg-violet-100 text-violet-800'   },
  VIEW_AS_USER:         { label: 'Visualizza come utente', color: 'bg-sky-100 text-sky-800'        },
  EDIT_USER:            { label: 'Modifica utente',      color: 'bg-indigo-100 text-indigo-800'   },
  CREATE_LOCALE:        { label: 'Crea locale',          color: 'bg-teal-100 text-teal-800'       },
  EDIT_LOCALE:          { label: 'Modifica locale',      color: 'bg-cyan-100 text-cyan-800'       },
}

function fmt(d: Date) {
  return d.toLocaleString('it-IT', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  })
}

export default async function AdminLogPage({
  searchParams,
}: {
  searchParams: { cursor?: string; action?: string }
}) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as { role?: string })?.role !== 'super_admin') redirect('/login')

  const perPage      = 50
  const actionFilter = searchParams.action ?? ''
  const cursor       = searchParams.cursor ?? null  // id of last item in previous page

  const where = actionFilter ? { action: actionFilter } : {}

  // Fetch perPage + 1 to detect if there's a next page
  const [total, rawLogs] = await Promise.all([
    prisma.adminLog.count({ where }),
    prisma.adminLog.findMany({
      where,
      orderBy:  { createdAt: 'desc' },
      take:     perPage + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    }),
  ])

  const hasNextPage = rawLogs.length > perPage
  const logs        = hasNextPage ? rawLogs.slice(0, perPage) : rawLogs
  const nextCursor  = hasNextPage ? logs[logs.length - 1].id : null

  function cursorLink(c: string | null) {
    const sp = new URLSearchParams()
    if (actionFilter) sp.set('action', actionFilter)
    if (c) sp.set('cursor', c)
    return `/admin/log?${sp.toString()}`
  }

  return (
    <main className="min-h-screen w-full overflow-x-hidden bg-black px-4 py-6 text-white sm:px-6 sm:py-8">
      <div className="mx-auto w-full max-w-5xl">

        <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-[#ff6b00]">Super admin</p>
            <h1 className="mt-1 text-3xl font-black">Log admin</h1>
            <p className="mt-1 text-sm font-bold text-white/40">Sola lettura · immutabile</p>
          </div>
          <Link
            href="/admin/users"
            className="flex h-9 items-center gap-2 rounded-xl border border-white/10 px-3 text-xs font-black text-white/60 transition hover:border-white/30 hover:text-white"
          >
            ← Utenti
          </Link>
        </div>

        {/* Filter by action */}
        <div className="mb-4 flex flex-wrap items-center gap-2">
          {['', ...Object.keys(ACTION_LABELS)].map((a) => {
            // Reset cursor when changing action filter
            const sp = new URLSearchParams()
            if (a) sp.set('action', a)
            const isActive = actionFilter === a
            return (
              <Link
                key={a || 'all'}
                href={`/admin/log?${sp.toString()}`}
                className={`rounded-full px-3 py-1.5 text-xs font-black transition ${
                  isActive
                    ? 'bg-[#ff6b00] text-white'
                    : 'border border-white/10 text-white/50 hover:border-white/30 hover:text-white'
                }`}
              >
                {a ? (ACTION_LABELS[a]?.label ?? a) : 'Tutte'}
              </Link>
            )
          })}
          <span className="ml-auto text-xs font-black text-white/30">{total} log totali</span>
        </div>

        {/* Log table */}
        <div className="overflow-hidden rounded-2xl bg-white text-black shadow-[0_8px_30px_rgba(0,0,0,0.25)]">

          {/* Desktop */}
          <div className="hidden sm:block">
            <table className="w-full border-collapse text-left text-sm">
              <thead className="bg-black text-white">
                <tr>
                  <th className="px-4 py-3 text-xs font-black uppercase whitespace-nowrap">Data / Ora</th>
                  <th className="px-4 py-3 text-xs font-black uppercase">Azione</th>
                  <th className="px-4 py-3 text-xs font-black uppercase">Admin</th>
                  <th className="px-4 py-3 text-xs font-black uppercase">Target</th>
                  <th className="px-4 py-3 text-xs font-black uppercase">Dettagli</th>
                </tr>
              </thead>
              <tbody>
                {logs.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-sm font-black text-black/40">
                      Nessun log trovato.
                    </td>
                  </tr>
                )}
                {logs.map((log) => {
                  const meta = ACTION_LABELS[log.action]
                  return (
                    <tr key={log.id} className="border-t border-black/6 hover:bg-black/[0.02]">
                      <td className="px-4 py-3 font-mono text-xs text-black/50 whitespace-nowrap">{fmt(log.createdAt)}</td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-black whitespace-nowrap ${meta?.color ?? 'bg-gray-100 text-gray-700'}`}>
                          {meta?.label ?? log.action}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs font-bold text-black/65 break-all">{log.adminEmail}</td>
                      <td className="px-4 py-3">
                        {log.targetId ? (
                          <Link
                            href={`/admin/users/${log.targetId}`}
                            className="text-xs font-bold text-[#ff6b00] hover:underline break-all"
                          >
                            {log.targetEmail}
                          </Link>
                        ) : (
                          <span className="text-xs font-bold text-black/50 break-all">{log.targetEmail}</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs font-bold text-black/50">{log.details ?? '—'}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile */}
          <div className="sm:hidden divide-y divide-black/6">
            {logs.length === 0 && (
              <p className="py-10 text-center text-sm font-black text-black/40">Nessun log.</p>
            )}
            {logs.map((log) => {
              const meta = ACTION_LABELS[log.action]
              return (
                <div key={log.id} className="p-4">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-black ${meta?.color ?? 'bg-gray-100 text-gray-700'}`}>
                      {meta?.label ?? log.action}
                    </span>
                    <span className="font-mono text-xs text-black/40">{fmt(log.createdAt)}</span>
                  </div>
                  <p className="mt-2 text-xs font-bold text-black/50">
                    Admin: <span className="text-black/70">{log.adminEmail}</span>
                  </p>
                  <p className="text-xs font-bold text-black/50">
                    Target: <span className="text-black/70">{log.targetEmail}</span>
                  </p>
                  {log.details && (
                    <p className="mt-1 text-xs font-bold text-black/40">{log.details}</p>
                  )}
                </div>
              )
            })}
          </div>

          {/* Cursor pagination */}
          {(cursor || hasNextPage) && (
            <div className="border-t border-black/6 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-xs font-black text-black/45">
                  {total} log totali
                </p>
                <div className="flex gap-2">
                  {cursor && (
                    <Link
                      href={cursorLink(null)}
                      className="rounded-xl border border-black/10 px-3 py-1.5 text-xs font-black text-black transition hover:bg-[#ff6b00] hover:text-white hover:border-[#ff6b00]"
                    >
                      ← Inizio
                    </Link>
                  )}
                  {hasNextPage && nextCursor && (
                    <Link
                      href={cursorLink(nextCursor)}
                      className="rounded-xl border border-black/10 px-3 py-1.5 text-xs font-black text-black transition hover:bg-[#ff6b00] hover:text-white hover:border-[#ff6b00]"
                    >
                      Successivi →
                    </Link>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
