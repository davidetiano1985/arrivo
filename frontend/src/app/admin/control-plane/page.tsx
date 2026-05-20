import Link from 'next/link'
import { getServerSession } from 'next-auth'
import { redirect }         from 'next/navigation'

import { authOptions }               from '@/lib/auth'
import { fetchControlPlaneSnapshot } from '@/lib/controlPlane'
import ControlPlaneClient            from './ControlPlaneClient'

export const dynamic = 'force-dynamic'

export default async function ControlPlanePage() {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as { role?: string })?.role !== 'super_admin') redirect('/login')

  const snapshot = await fetchControlPlaneSnapshot()

  return (
    <main className="min-h-screen w-full overflow-x-hidden px-4 py-6 sm:px-6 sm:py-8">
      <div className="mx-auto w-full max-w-7xl space-y-6">

        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-[#ff6b00]">Super Admin</p>
            <h1 className="mt-1 text-3xl font-black">
              Control Plane
            </h1>
            <p className="mt-1 text-xs font-bold text-white/30">
              SSE live · 9 card sistema · aggiorna ogni 15s
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {[
              { href: '/admin/intelligence',  label: 'Intelligence' },
              { href: '/admin/observability', label: 'Observability' },
              { href: '/admin',               label: 'Dashboard' },
            ].map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="flex h-9 items-center gap-2 rounded-xl border border-white/10 px-3 text-xs font-black text-white/60 transition hover:border-white/30 hover:text-white"
              >
                {l.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Live 3×3 grid */}
        <ControlPlaneClient initial={snapshot} />

        {/* Quick links */}
        <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {[
            { href: '/admin/sicurezza',      label: 'Sicurezza'     },
            { href: '/admin/alert',          label: 'Alert Center'  },
            { href: '/admin/users',          label: 'Utenti'        },
            { href: '/admin/log',            label: 'Log Admin'     },
            { href: '/admin/system-health',  label: 'System Health' },
            { href: '/admin/eventi',         label: 'Eventi Live'   },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center justify-between rounded-xl border border-white/[0.07] bg-white/[0.02] px-4 py-3 text-xs font-black text-white/50 transition hover:border-[#ff6b00]/30 hover:text-white"
            >
              {item.label}
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </Link>
          ))}
        </div>
      </div>
    </main>
  )
}
