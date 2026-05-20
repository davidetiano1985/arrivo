import { getServerSession } from 'next-auth'
import { notFound, redirect } from 'next/navigation'
import Link                   from 'next/link'

import { authOptions }    from '@/lib/auth'
import { prisma }         from '@/lib/prisma'
import { aggiornaLocale } from '../actions'

function fmt(d: Date | null | undefined) {
  if (!d) return '—'
  return d.toLocaleString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export default async function ModificaLocalePage({
  params,
  searchParams,
}: {
  params:       { id: string }
  searchParams: { created?: string; saved?: string }
}) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as { role?: string })?.role !== 'super_admin') redirect('/login')

  const locale = await prisma.restaurant.findUnique({
    where:  { id: params.id },
    select: {
      id: true, name: true, slug: true, tipo: true, description: true,
      address: true, city: true, zip: true, phone: true, email: true,
      hours: true, status: true, ownerId: true, createdAt: true, updatedAt: true,
      owner: { select: { id: true, email: true, firstName: true, lastName: true } },
    },
  })

  if (!locale) notFound()

  // Fetch gestori locale for owner selector
  const gestori = await prisma.user.findMany({
    where:   { role: { in: ['gestore_locale', 'manager'] } },
    select:  { id: true, email: true, firstName: true, lastName: true, role: true },
    orderBy: { createdAt: 'desc' },
    take:    200,
  })

  const statusLabel: Record<string, string> = {
    approved: 'Approvato',
    rejected: 'Rifiutato',
    pending:  'In attesa',
  }

  async function handleUpdate(formData: FormData) {
    'use server'
    const result = await aggiornaLocale(params.id, formData)
    if (result.error) {
      redirect(`/admin/ristoranti/${params.id}?error=${encodeURIComponent(result.error)}`)
    } else {
      redirect(`/admin/ristoranti/${params.id}?saved=1`)
    }
  }

  return (
    <main className="min-h-screen w-full overflow-x-hidden px-4 py-6 sm:px-6 sm:py-8">
      <div className="mx-auto w-full max-w-2xl space-y-6">

        {/* Back */}
        <Link
          href="/admin/ristoranti"
          className="inline-flex items-center gap-1.5 text-xs font-black text-white/45 transition hover:text-white"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          Torna ai locali
        </Link>

        {/* Success banner */}
        {(searchParams.created || searchParams.saved) && (
          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/[0.06] px-5 py-3 text-sm font-black text-emerald-400">
            {searchParams.created ? '✓ Locale creato con successo.' : '✓ Modifiche salvate con successo.'}
          </div>
        )}

        {/* Header */}
        <div>
          <p className="text-xs font-black uppercase tracking-widest text-[#ff6b00]">Super Admin</p>
          <h1 className="mt-1 text-2xl font-black">{locale.name}</h1>
          <p className="mt-0.5 font-mono text-xs text-white/30">/{locale.slug} · Creato il {fmt(locale.createdAt)}</p>
        </div>

        <form action={handleUpdate} className="space-y-5">
          <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-5 space-y-4">
            <p className="text-xs font-black uppercase tracking-widest text-white/30">Informazioni base</p>

            <div>
              <label className="mb-1.5 block text-xs font-black text-white/50">
                Nome locale <span className="text-[#ff6b00]">*</span>
              </label>
              <input
                type="text"
                name="name"
                required
                defaultValue={locale.name}
                className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-bold text-white outline-none focus:border-[#ff6b00]/60"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-black text-white/50">Tipo / Categoria</label>
                <input
                  type="text"
                  name="tipo"
                  defaultValue={locale.tipo ?? ''}
                  placeholder="Es. Ristorante, Bar, Pizzeria…"
                  className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-bold text-white placeholder:text-white/20 outline-none focus:border-[#ff6b00]/60"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-black text-white/50">Stato</label>
                <select
                  name="status"
                  defaultValue={locale.status}
                  className="w-full rounded-xl border border-white/10 bg-[#1a1a1a] px-4 py-2.5 text-sm font-bold text-white outline-none focus:border-[#ff6b00]/60"
                >
                  <option value="pending">In attesa</option>
                  <option value="approved">Approvato</option>
                  <option value="rejected">Rifiutato</option>
                </select>
              </div>
            </div>

            {/* ID shown read-only */}
            <div>
              <label className="mb-1.5 block text-xs font-black text-white/30">ID (non modificabile)</label>
              <p className="rounded-xl border border-white/[0.05] bg-white/[0.02] px-4 py-2.5 font-mono text-xs text-white/25">
                {locale.id}
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-5 space-y-4">
            <p className="text-xs font-black uppercase tracking-widest text-white/30">Indirizzo</p>

            <div>
              <label className="mb-1.5 block text-xs font-black text-white/50">Via / Indirizzo</label>
              <input
                type="text"
                name="address"
                defaultValue={locale.address ?? ''}
                placeholder="Es. Via Roma 1"
                className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-bold text-white placeholder:text-white/20 outline-none focus:border-[#ff6b00]/60"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-black text-white/50">Città</label>
                <input
                  type="text"
                  name="city"
                  defaultValue={locale.city ?? ''}
                  placeholder="Es. Milano"
                  className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-bold text-white placeholder:text-white/20 outline-none focus:border-[#ff6b00]/60"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-black text-white/50">CAP</label>
                <input
                  type="text"
                  name="zip"
                  defaultValue={locale.zip ?? ''}
                  placeholder="Es. 20121"
                  className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-bold text-white placeholder:text-white/20 outline-none focus:border-[#ff6b00]/60"
                />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-5 space-y-4">
            <p className="text-xs font-black uppercase tracking-widest text-white/30">Contatti</p>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-black text-white/50">Telefono</label>
                <input
                  type="text"
                  name="phone"
                  defaultValue={locale.phone ?? ''}
                  placeholder="Es. +39 02 1234567"
                  className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-bold text-white placeholder:text-white/20 outline-none focus:border-[#ff6b00]/60"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-black text-white/50">Email</label>
                <input
                  type="email"
                  name="email"
                  defaultValue={locale.email ?? ''}
                  placeholder="Es. info@locale.it"
                  className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-bold text-white placeholder:text-white/20 outline-none focus:border-[#ff6b00]/60"
                />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-5 space-y-4">
            <p className="text-xs font-black uppercase tracking-widest text-white/30">Dettagli</p>

            <div>
              <label className="mb-1.5 block text-xs font-black text-white/50">Descrizione</label>
              <textarea
                name="description"
                rows={3}
                defaultValue={locale.description ?? ''}
                placeholder="Descrizione del locale…"
                className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-bold text-white placeholder:text-white/20 outline-none focus:border-[#ff6b00]/60 resize-none"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-black text-white/50">Orari di apertura</label>
              <textarea
                name="hours"
                rows={3}
                defaultValue={locale.hours ?? ''}
                placeholder="Es. Lun-Ven 12:00-15:00, 19:00-23:00"
                className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-bold text-white placeholder:text-white/20 outline-none focus:border-[#ff6b00]/60 resize-none"
              />
            </div>
          </div>

          <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-5 space-y-4">
            <p className="text-xs font-black uppercase tracking-widest text-white/30">Proprietario</p>

            <div>
              <label className="mb-1.5 block text-xs font-black text-white/50">Assegna a utente</label>
              <select
                name="ownerId"
                defaultValue={locale.ownerId ?? ''}
                className="w-full rounded-xl border border-white/10 bg-[#1a1a1a] px-4 py-2.5 text-sm font-bold text-white outline-none focus:border-[#ff6b00]/60"
              >
                <option value="">— Nessun proprietario —</option>
                {gestori.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.firstName ?? ''} {u.lastName ?? ''} ({u.email}) — {u.role}
                  </option>
                ))}
              </select>
              {locale.owner && (
                <p className="mt-1.5 text-xs font-bold text-white/35">
                  Attuale:{' '}
                  <Link href={`/admin/users/${locale.owner.id}`} className="text-[#ff6b00] hover:underline">
                    {locale.owner.firstName ?? ''} {locale.owner.lastName ?? ''} ({locale.owner.email})
                  </Link>
                </p>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 pb-4">
            <Link
              href="/admin/ristoranti"
              className="rounded-xl border border-white/10 px-6 py-2.5 text-sm font-black text-white/60 transition hover:text-white"
            >
              Annulla
            </Link>
            <button
              type="submit"
              className="rounded-xl bg-[#ff6b00] px-6 py-2.5 text-sm font-black text-black transition hover:bg-[#e55f00]"
            >
              Salva modifiche
            </button>
          </div>
        </form>
      </div>
    </main>
  )
}
