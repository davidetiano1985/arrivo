import { getServerSession }  from 'next-auth'
import { redirect }           from 'next/navigation'
import Link                   from 'next/link'

import { authOptions } from '@/lib/auth'

export default async function ImpostazioniPage() {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as { role?: string })?.role !== 'super_admin') redirect('/login')

  const adminEmail = session.user?.email ?? ''

  return (
    <main className="min-h-screen w-full overflow-x-hidden px-4 py-6 sm:px-6 sm:py-8">
      <div className="mx-auto w-full max-w-3xl space-y-6">

        {/* Header */}
        <div>
          <p className="text-xs font-black uppercase tracking-widest text-[#ff6b00]">Super Admin</p>
          <h1 className="mt-1 text-3xl font-black">Impostazioni</h1>
        </div>

        {/* System info */}
        <div className="rounded-2xl border border-white/[0.07] bg-white/[0.04] p-5">
          <p className="mb-4 text-[10px] font-black uppercase tracking-widest text-white/30">Sessione corrente</p>
          <div className="space-y-3">
            {[
              ['Account',    adminEmail],
              ['Ruolo',      'super_admin'],
              ['Strategia',  'JWT (stateless)'],
              ['Max Age',    '24 ore (consigliato — verifica in lib/auth.ts)'],
            ].map(([k, v]) => (
              <div key={k} className="flex flex-wrap items-start justify-between gap-2 border-b border-white/[0.05] pb-3 last:border-0">
                <span className="text-xs font-black text-white/40">{k}</span>
                <span className="text-xs font-bold text-white/70 break-all">{v}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Action links */}
        <div className="rounded-2xl border border-white/[0.07] bg-white/[0.04] p-5">
          <p className="mb-4 text-[10px] font-black uppercase tracking-widest text-white/30">Azioni rapide</p>
          <div className="space-y-2">
            {[
              { href: '/admin/users',         label: 'Gestisci utenti',        desc: 'Tutti i ruoli'               },
              { href: '/admin/alert',          label: 'Alert Center',           desc: 'Visualizza e risolvi alert'  },
              { href: '/admin/system-health',  label: 'System Health',          desc: 'DB, memoria, uptime'         },
              { href: '/admin/log',            label: 'Log Admin',              desc: 'Audit trail immutabile'      },
              { href: '/admin/richieste',      label: 'Richieste locali',       desc: 'Approva o rifiuta'           },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center justify-between rounded-xl border border-white/[0.07] px-4 py-3 transition hover:border-[#ff6b00]/40 hover:bg-white/[0.04]"
              >
                <div>
                  <p className="text-sm font-black text-white">{item.label}</p>
                  <p className="text-xs font-bold text-white/35">{item.desc}</p>
                </div>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-white/30">
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </Link>
            ))}
          </div>
        </div>

        {/* Scalability notices */}
        <div className="rounded-2xl border border-amber-400/20 bg-amber-400/[0.04] p-5">
          <p className="mb-3 text-[10px] font-black uppercase tracking-widest text-amber-400">
            ⚠ Interventi scalabilità consigliati
          </p>
          <ul className="space-y-2 text-xs font-bold text-white/50">
            {[
              'pg_trgm + GIN index per ricerca utenti (> 50k utenti)',
              'JWT maxAge: verificare sia impostato a 24h in lib/auth.ts',
              'Redis rate limiter per PM2 cluster mode',
              'BullMQ + Redis per email queue (burst handling)',
              'pgBouncer per connection pooling',
              'Cursor pagination al posto di LIMIT/OFFSET',
              'LoginEvent retention policy (archivio > 90 giorni)',
            ].map((note) => (
              <li key={note} className="flex items-start gap-2">
                <span className="mt-0.5 shrink-0 text-amber-400">→</span>
                {note}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </main>
  )
}
