import Link from 'next/link'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'

import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import RichiestaActions from './RichiestaActions'

const statusBadge: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-800',
  approved: 'bg-emerald-100 text-emerald-800',
  rejected: 'bg-red-100 text-red-700',
}
const statusLabel: Record<string, string> = {
  pending: 'In attesa',
  approved: 'Approvata',
  rejected: 'Rifiutata',
}

function formatDate(date: Date) {
  return date.toLocaleString('it-IT', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

export default async function RichiestePage() {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as { role?: string })?.role !== 'super_admin') redirect('/login')

  const richieste = await prisma.localeRequest.findMany({
    orderBy: { createdAt: 'desc' },
  })

  const pending = richieste.filter((r) => r.status === 'pending').length
  const approved = richieste.filter((r) => r.status === 'approved').length
  const rejected = richieste.filter((r) => r.status === 'rejected').length

  return (
    <main className="min-h-screen overflow-x-hidden bg-black px-4 py-6 text-white sm:px-5 sm:py-8">
      <section className="mx-auto w-full max-w-5xl">

        <div className="mb-2 flex items-center gap-3">
          <Link className="text-xs font-black text-white/40 transition hover:text-white" href="/admin">
            ← Admin
          </Link>
        </div>

        <div className="mb-6">
          <p className="text-xs font-black uppercase text-[#ff6b00]">Super admin</p>
          <h1 className="mt-2 text-3xl font-black">Richieste locali</h1>
        </div>

        <div className="mb-6 grid gap-3 sm:grid-cols-3">
          <article className="rounded-2xl bg-white p-4 text-black">
            <p className="text-xs font-black uppercase text-black/45">In attesa</p>
            <p className="mt-2 text-3xl font-black text-amber-600">{pending}</p>
          </article>
          <article className="rounded-2xl bg-white p-4 text-black">
            <p className="text-xs font-black uppercase text-black/45">Approvate</p>
            <p className="mt-2 text-3xl font-black text-emerald-600">{approved}</p>
          </article>
          <article className="rounded-2xl bg-white p-4 text-black">
            <p className="text-xs font-black uppercase text-black/45">Rifiutate</p>
            <p className="mt-2 text-3xl font-black text-red-600">{rejected}</p>
          </article>
        </div>

        {richieste.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-6 py-12 text-center">
            <p className="text-sm font-bold text-white/40">Nessuna richiesta ancora ricevuta.</p>
          </div>
        ) : (
          <>
            {/* Mobile: cards */}
            <div className="grid gap-4 lg:hidden">
              {richieste.map((r) => (
                <article className="rounded-2xl bg-white p-5 text-black shadow-[0_18px_45px_rgba(0,0,0,0.22)]" key={r.id}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h2 className="text-lg font-black">{r.nome}</h2>
                      <p className="mt-0.5 text-xs font-bold text-black/50">{r.tipo || '—'} · {r.citta}</p>
                    </div>
                    <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-black ${statusBadge[r.status]}`}>
                      {statusLabel[r.status]}
                    </span>
                  </div>

                  <div className="mt-4 grid gap-2 text-sm">
                    <div className="flex gap-2">
                      <span className="font-black text-black/40 w-20 shrink-0">Email</span>
                      <span className="font-bold break-all">{r.email}</span>
                    </div>
                    {r.telefono && (
                      <div className="flex gap-2">
                        <span className="font-black text-black/40 w-20 shrink-0">Telefono</span>
                        <span className="font-bold">{r.telefono}</span>
                      </div>
                    )}
                    <div className="flex gap-2">
                      <span className="font-black text-black/40 w-20 shrink-0">Data</span>
                      <span className="font-bold text-black/65">{formatDate(r.createdAt)}</span>
                    </div>
                    {r.note && (
                      <div className="flex gap-2">
                        <span className="font-black text-black/40 w-20 shrink-0">Nota</span>
                        <span className="font-bold text-black/65 italic">{r.note}</span>
                      </div>
                    )}
                  </div>

                  {r.status === 'pending' && (
                    <div className="mt-4 border-t border-black/10 pt-4">
                      <RichiestaActions id={r.id} />
                    </div>
                  )}
                </article>
              ))}
            </div>

            {/* Desktop: table */}
            <div className="hidden overflow-hidden rounded-2xl bg-white text-black shadow-[0_18px_45px_rgba(0,0,0,0.28)] lg:block">
              <div className="max-h-[70vh] overflow-auto">
                <table className="w-full border-collapse text-left">
                  <thead className="sticky top-0 z-10 bg-[#ff6b00] text-white shadow-sm">
                    <tr>
                      <th className="px-5 py-4 text-xs font-black uppercase">Locale</th>
                      <th className="px-5 py-4 text-xs font-black uppercase">Tipo · Città</th>
                      <th className="px-5 py-4 text-xs font-black uppercase">Email</th>
                      <th className="px-5 py-4 text-xs font-black uppercase">Telefono</th>
                      <th className="px-5 py-4 text-xs font-black uppercase">Status</th>
                      <th className="px-5 py-4 text-xs font-black uppercase">Data</th>
                      <th className="px-5 py-4 text-xs font-black uppercase">Azioni</th>
                    </tr>
                  </thead>
                  <tbody>
                    {richieste.map((r) => (
                      <tr className="border-t border-black/10 transition hover:bg-[#ff6b00]/5" key={r.id}>
                        <td className="px-5 py-4 align-middle">
                          <p className="text-sm font-black">{r.nome}</p>
                          {r.note && <p className="mt-0.5 text-xs font-bold text-black/45 italic">{r.note}</p>}
                        </td>
                        <td className="px-5 py-4 align-middle text-sm font-bold text-black/65">
                          {r.tipo || '—'}<br />{r.citta}
                        </td>
                        <td className="px-5 py-4 align-middle text-sm font-bold text-black/65 break-all">
                          {r.email}
                        </td>
                        <td className="px-5 py-4 align-middle text-sm font-bold text-black/65">
                          {r.telefono || '—'}
                        </td>
                        <td className="px-5 py-4 align-middle">
                          <span className={`rounded-full px-3 py-1 text-xs font-black ${statusBadge[r.status]}`}>
                            {statusLabel[r.status]}
                          </span>
                        </td>
                        <td className="px-5 py-4 align-middle text-sm font-bold text-black/65 whitespace-nowrap">
                          {formatDate(r.createdAt)}
                        </td>
                        <td className="px-5 py-4 align-middle">
                          {r.status === 'pending' ? (
                            <RichiestaActions id={r.id} />
                          ) : (
                            <span className="text-xs font-bold text-black/30">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </section>
    </main>
  )
}
