import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getServerSession } from 'next-auth'

import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import UserDetailClient from './UserDetailClient'

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

function fmt(d: Date | null | undefined) {
  if (!d) return '—'
  return d.toLocaleString('it-IT', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

function fmtId(n: number) {
  return `#${String(n).padStart(6, '0')}`
}

export default async function UserDetailPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  const currentUserId = (session?.user as { id?: string })?.id ?? ''

  const user = await prisma.user.findUnique({
    where: { id: params.id },
    select: {
      id: true, numericId: true, firstName: true, lastName: true, name: true,
      email: true, phone: true, role: true, suspended: true, emailVerified: true,
      image: true, password: true, createdAt: true, updatedAt: true,
      loginAttempts: true, tokenVersion: true,
      accounts: { select: { provider: true } },
      adminLogsAsTarget: {
        select: { id: true, createdAt: true, adminEmail: true, action: true, details: true },
        orderBy: { createdAt: 'desc' },
        take: 30,
      },
      loginEvents: {
        select: { id: true, createdAt: true, success: true, ipAddress: true, provider: true },
        orderBy: { createdAt: 'desc' },
        take: 20,
      },
    },
  })

  if (!user) notFound()

  const isSelf   = user.id === currentUserId
  const isGoogle = user.accounts.some((a) => a.provider === 'google')
  const method   = isGoogle && !user.password
    ? 'Solo Google'
    : isGoogle && user.password
    ? 'Google + Email'
    : 'Email / Password'

  const ACTION_LABELS: Record<string, string> = {
    ROLE_CHANGE:          'Cambio ruolo',
    SUSPEND:              'Sospensione',
    UNSUSPEND:            'Riattivazione',
    DELETE_USER:          'Eliminazione',
    RESET_PASSWORD:       'Reset password',
    RESET_LOGIN_ATTEMPTS: 'Reset tentativi',
    CREATE_USER:          'Creazione account',
    APPROVA_RICHIESTA:    'Approva richiesta locale',
    RIFIUTA_RICHIESTA:    'Rifiuta richiesta locale',
    RESOLVE_ALERT:        'Risolvi alert',
    CREATE_ALERT:         'Crea alert',
    FORCE_LOGOUT:         'Forza logout',
    VIEW_AS_USER:         'Visualizza come utente',
    EDIT_USER:            'Modifica dati utente',
  }

  return (
    <main className="min-h-screen w-full overflow-x-hidden bg-black px-4 py-6 text-white sm:px-6 sm:py-8">
      <div className="mx-auto w-full max-w-4xl space-y-6">

        {/* Back */}
        <Link
          href="/admin/users"
          className="inline-flex items-center gap-1.5 text-xs font-black text-white/45 transition hover:text-white"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          Torna agli utenti
        </Link>

        {/* Header card */}
        <div className="rounded-2xl bg-[#ff6b00] p-5 sm:p-6">
          <p className="text-xs font-black uppercase tracking-widest text-black/50">Dettaglio utente</p>
          <div className="mt-3 flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-black text-black sm:text-3xl">
                {user.firstName ?? ''} {user.lastName ?? ''}
              </h1>
              <p className="mt-1 break-all text-sm font-bold text-black/70">{user.email}</p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <span className="font-mono text-sm font-black text-black/60">{fmtId(user.numericId)}</span>
              <span className={`rounded-full px-3 py-1 text-xs font-black ${user.suspended ? 'bg-red-600 text-white' : 'bg-emerald-500 text-white'}`}>
                {user.suspended ? 'Sospeso' : 'Attivo'}
              </span>
              {!isSelf && (
                <Link
                  href={`/admin/users/${user.id}/impersonate`}
                  className="mt-1 rounded-xl border border-black/20 bg-black/10 px-3 py-1.5 text-xs font-black text-black transition hover:bg-black/20"
                >
                  👁 Visualizza come utente
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Data + Actions grid */}
        <div className="grid gap-6 lg:grid-cols-2">

          {/* Data */}
          <div className="rounded-2xl bg-white p-5 text-black">
            <p className="mb-4 text-xs font-black uppercase tracking-widest text-black/45">Dati completi</p>
            <dl className="space-y-3">
              {[
                ['ID numerico',         fmtId(user.numericId)],
                ['ID database',         user.id],
                ['Nome',                user.firstName ?? '—'],
                ['Cognome',             user.lastName  ?? '—'],
                ['Email',               user.email],
                ['Telefono',            user.phone ?? '—'],
                ['Ruolo',               null],
                ['Metodo accesso',      method],
                ['Email verificata',    isGoogle ? 'VERIFICATA ✓' : user.emailVerified ? fmt(user.emailVerified) : 'No'],
                ['Registrato il',       fmt(user.createdAt)],
                ['Ultimo aggiornamento', fmt(user.updatedAt)],
                ['Tentativi login fail.', String(user.loginAttempts)],
              ['Token version',        String(user.tokenVersion)],
              ].map(([label, value]) => (
                <div key={label} className="flex flex-col gap-0.5 border-b border-black/5 pb-2 last:border-0 last:pb-0">
                  <dt className="text-xs font-black uppercase text-black/35">{label}</dt>
                  <dd className="break-all text-sm font-bold text-black">
                    {label === 'Ruolo' ? (
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-black ${roleBadge(user.role)}`}>{user.role}</span>
                    ) : value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Actions */}
          <div className="rounded-2xl bg-white p-5 text-black">
            <p className="mb-4 text-xs font-black uppercase tracking-widest text-black/45">Azioni super admin</p>
            <UserDetailClient
              userId={user.id}
              isSelf={isSelf}
              currentRole={user.role}
              suspended={user.suspended}
              hasPassword={!!user.password}
              loginAttempts={user.loginAttempts}
              tokenVersion={user.tokenVersion}
              firstName={user.firstName ?? ''}
              lastName={user.lastName  ?? ''}
              email={user.email}
              phone={user.phone ?? ''}
            />
          </div>
        </div>

        {/* Login history */}
        {user.loginEvents.length > 0 && (
          <div className="rounded-2xl bg-white p-5 text-black">
            <p className="mb-4 text-xs font-black uppercase tracking-widest text-black/45">Storico accessi (ultimi 20)</p>
            <div className="space-y-2">
              {user.loginEvents.map((ev) => (
                <div key={ev.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-black/[0.03] px-4 py-2.5">
                  <div className="flex items-center gap-2">
                    <span className={`h-2 w-2 rounded-full ${ev.success ? 'bg-emerald-500' : 'bg-red-500'}`} />
                    <span className="text-xs font-black text-black/60">{ev.provider}</span>
                    {ev.ipAddress && (
                      <span className="text-xs font-bold text-black/40 font-mono">{ev.ipAddress}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-black ${ev.success ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                      {ev.success ? 'Successo' : 'Fallito'}
                    </span>
                    <span className="text-xs font-bold text-black/40">{fmt(ev.createdAt)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Admin action history for this user */}
        {user.adminLogsAsTarget.length > 0 && (
          <div className="rounded-2xl bg-white p-5 text-black">
            <p className="mb-4 text-xs font-black uppercase tracking-widest text-black/45">
              Storico azioni admin su questo utente
            </p>
            <div className="space-y-2">
              {user.adminLogsAsTarget.map((log) => (
                <div key={log.id} className="flex flex-wrap items-start justify-between gap-2 rounded-xl bg-black/[0.03] px-4 py-3">
                  <div>
                    <p className="text-xs font-black text-black">
                      {ACTION_LABELS[log.action] ?? log.action}
                    </p>
                    {log.details && (
                      <p className="mt-0.5 text-xs font-bold text-black/50">{log.details}</p>
                    )}
                    <p className="mt-0.5 text-xs font-bold text-black/35">da {log.adminEmail}</p>
                  </div>
                  <span className="text-xs font-bold text-black/40 whitespace-nowrap">{fmt(log.createdAt)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
