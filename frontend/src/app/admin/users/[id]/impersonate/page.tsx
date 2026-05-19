/**
 * "View as user" — shows what the user's data looks like
 * from their perspective. Read-only, no session switching.
 */
import { notFound }         from 'next/navigation'
import { getServerSession } from 'next-auth'
import { redirect }         from 'next/navigation'
import Link                 from 'next/link'

import { authOptions } from '@/lib/auth'
import { prisma }      from '@/lib/prisma'

function fmt(d: Date | null | undefined) {
  if (!d) return '—'
  return d.toLocaleString('it-IT', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

export default async function ImpersonatePage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as { role?: string })?.role !== 'super_admin') redirect('/login')

  const user = await prisma.user.findUnique({
    where: { id: params.id },
    select: {
      id: true, numericId: true, firstName: true, lastName: true, name: true,
      email: true, phone: true, role: true, suspended: true,
      emailVerified: true, createdAt: true, updatedAt: true,
      image: true, profileIncomplete: true,
      loginEvents: {
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: { id: true, createdAt: true, success: true, ipAddress: true, provider: true },
      },
      adminLogsAsTarget: {
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: { id: true, createdAt: true, action: true, adminEmail: true, details: true },
      },
      restaurants: {
        select: { id: true, name: true, city: true, status: true, slug: true },
      },
      accounts: { select: { provider: true } },
    },
  })

  if (!user) notFound()

  const isGoogle = user.accounts.some((a) => a.provider === 'google')
  const adminEmail = (session.user as { email?: string })?.email ?? ''

  return (
    <main className="min-h-screen w-full overflow-x-hidden bg-black px-4 py-6 sm:px-6 sm:py-8">

      {/* Admin banner — always visible */}
      <div className="sticky top-0 z-50 mb-6 flex items-center justify-between rounded-2xl border border-amber-400/40 bg-amber-400/10 px-4 py-3 backdrop-blur">
        <div className="flex items-center gap-3">
          <span className="h-2 w-2 animate-pulse rounded-full bg-amber-400" />
          <div>
            <p className="text-xs font-black text-amber-400">
              MODALITÀ IMPERSONAZIONE — Sola lettura
            </p>
            <p className="text-[10px] font-bold text-amber-400/60">
              Navigazione come: {user.email} · Admin: {adminEmail}
            </p>
          </div>
        </div>
        <Link
          href={`/admin/users/${user.id}`}
          className="rounded-xl border border-amber-400/40 px-3 py-1.5 text-xs font-black text-amber-400 transition hover:bg-amber-400/10"
        >
          ← Esci
        </Link>
      </div>

      <div className="mx-auto w-full max-w-2xl space-y-6 text-white">

        {/* Profile card (as user would see it) */}
        <div className="rounded-[2rem] bg-[#ff6b00] p-6">
          <p className="text-xs font-black uppercase text-black/50">Il tuo profilo</p>
          {user.profileIncomplete && (
            <div className="mt-3 rounded-xl border border-black/20 bg-black/10 px-4 py-2">
              <p className="text-xs font-black text-black/70">
                ⚠ Profilo incompleto — l'utente vedrebbe il popup di completamento
              </p>
            </div>
          )}
          <h1 className="mt-3 text-2xl font-black text-black">
            {user.firstName ?? ''} {user.lastName ?? ''}
          </h1>
          <p className="mt-1 text-sm font-bold text-black/70">{user.email}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="rounded-full bg-black/20 px-3 py-1 text-xs font-black text-black">
              {user.role}
            </span>
            <span className="rounded-full bg-black/20 px-3 py-1 text-xs font-black text-black">
              {isGoogle ? 'Google OAuth' : 'Email / Password'}
            </span>
            {user.suspended && (
              <span className="rounded-full bg-red-600 px-3 py-1 text-xs font-black text-white">
                SOSPESO
              </span>
            )}
          </div>
        </div>

        {/* User details */}
        <div className="rounded-2xl bg-white p-5 text-black">
          <p className="mb-3 text-[10px] font-black uppercase text-black/40">Dati account</p>
          <dl className="space-y-2">
            {[
              ['Email',         user.email],
              ['Telefono',      user.phone ?? 'Non impostato'],
              ['Registrato il', fmt(user.createdAt)],
              ['Email verificata', user.emailVerified ? fmt(user.emailVerified) : 'No'],
              ['Profilo completo', user.profileIncomplete ? 'No — incompleto' : 'Sì'],
            ].map(([k, v]) => (
              <div key={k} className="flex flex-col border-b border-black/5 pb-2 last:border-0">
                <dt className="text-[10px] font-black uppercase text-black/35">{k}</dt>
                <dd className="text-sm font-bold text-black">{v}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Restaurants */}
        {user.restaurants.length > 0 && (
          <div className="rounded-2xl bg-white p-5 text-black">
            <p className="mb-3 text-[10px] font-black uppercase text-black/40">
              Ristoranti ({user.restaurants.length})
            </p>
            <div className="space-y-2">
              {user.restaurants.map((r) => (
                <div key={r.id} className="flex items-center justify-between rounded-xl bg-black/[0.03] px-4 py-3">
                  <div>
                    <p className="font-black text-black">{r.name}</p>
                    <p className="text-xs font-bold text-black/40">{r.city ?? '—'}</p>
                  </div>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-black ${
                    r.status === 'approved' ? 'bg-emerald-100 text-emerald-700'
                    : r.status === 'rejected' ? 'bg-red-100 text-red-700'
                    : 'bg-amber-100 text-amber-700'
                  }`}>{r.status}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Login history */}
        <div className="rounded-2xl bg-white p-5 text-black">
          <p className="mb-3 text-[10px] font-black uppercase text-black/40">Ultimi accessi</p>
          {user.loginEvents.length === 0 ? (
            <p className="text-xs font-bold text-black/30">Nessun accesso registrato.</p>
          ) : (
            <div className="space-y-2">
              {user.loginEvents.map((ev) => (
                <div key={ev.id} className="flex items-center justify-between rounded-xl bg-black/[0.03] px-4 py-2.5">
                  <div className="flex items-center gap-2">
                    <span className={`h-2 w-2 rounded-full ${ev.success ? 'bg-emerald-500' : 'bg-red-500'}`} />
                    <span className="text-xs font-black text-black/60">{ev.provider}</span>
                    {ev.ipAddress && <span className="font-mono text-[10px] text-black/30">{ev.ipAddress}</span>}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-black ${ev.success ? 'text-emerald-600' : 'text-red-600'}`}>
                      {ev.success ? 'Successo' : 'Fallito'}
                    </span>
                    <span className="text-[10px] font-bold text-black/30">{fmt(ev.createdAt)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bottom exit */}
        <div className="flex justify-center pb-6">
          <Link
            href={`/admin/users/${user.id}`}
            className="rounded-2xl bg-[#ff6b00] px-8 py-3 font-black text-black transition hover:bg-orange-400"
          >
            ← Torna al pannello admin
          </Link>
        </div>
      </div>
    </main>
  )
}
