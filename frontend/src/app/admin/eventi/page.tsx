import { getServerSession } from 'next-auth'
import { redirect }         from 'next/navigation'
import Link                 from 'next/link'

import { authOptions } from '@/lib/auth'
import { prisma }      from '@/lib/prisma'
import EventiLiveClient from './EventiLiveClient'

export default async function EventiPage() {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as { role?: string })?.role !== 'super_admin') redirect('/login')

  const events = await prisma.loginEvent.findMany({
    orderBy: { createdAt: 'desc' },
    take: 100,
    select: {
      id: true, createdAt: true, success: true,
      ipAddress: true, provider: true, userId: true,
      user: { select: { email: true, firstName: true, lastName: true, role: true, id: true } },
    },
  })

  const serialized = events.map((e) => ({
    id:        e.id,
    createdAt: e.createdAt.toISOString(),
    success:   e.success,
    ipAddress: e.ipAddress,
    provider:  e.provider,
    userId:    e.userId,
    userEmail: e.user?.email     ?? null,
    userName:  e.user?.firstName ?? null,
    userRole:  e.user?.role      ?? null,
    userDbId:  e.user?.id        ?? null,
  }))

  return (
    <main className="min-h-screen w-full overflow-x-hidden px-4 py-6 sm:px-6 sm:py-8">
      <div className="mx-auto w-full max-w-5xl space-y-6">

        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-[#ff6b00]">Super Admin</p>
            <h1 className="mt-1 text-3xl font-black">
              <span className="mr-2 inline-block h-2.5 w-2.5 animate-pulse rounded-full bg-blue-400" />
              Eventi Live
            </h1>
            <p className="mt-1 text-xs font-bold text-white/30">Polling ogni 15s · ultimi 100 eventi</p>
          </div>
          <Link href="/admin/sicurezza" className="flex h-9 items-center gap-2 rounded-xl border border-white/10 px-3 text-xs font-black text-white/60 transition hover:border-white/30 hover:text-white">
            Sicurezza →
          </Link>
        </div>

        {/* Live event feed — client component */}
        <EventiLiveClient initialEvents={serialized} />
      </div>
    </main>
  )
}
