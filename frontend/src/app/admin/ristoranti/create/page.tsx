import { getServerSession } from 'next-auth'
import { redirect }         from 'next/navigation'
import Link                 from 'next/link'

import { authOptions } from '@/lib/auth'
import { prisma }      from '@/lib/prisma'
import { creaLocale }  from '../actions'

export default async function CreaLocalePage() {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as { role?: string })?.role !== 'super_admin') redirect('/login')

  // Fetch gestori locale for owner selector
  const gestori = await prisma.user.findMany({
    where:   { role: { in: ['gestore_locale', 'manager'] } },
    select:  { id: true, email: true, firstName: true, lastName: true, role: true },
    orderBy: { createdAt: 'desc' },
    take:    200,
  })

  async function handleCreate(formData: FormData) {
    'use server'
    const result = await creaLocale(formData)
    if (result.error) {
      // Re-render with error — pass via redirect params
      redirect(`/admin/ristoranti/create?error=${encodeURIComponent(result.error)}`)
    } else {
      redirect(`/admin/ristoranti/${result.id}?created=1`)
    }
  }

  return (
    <main className="min-h-screen w-full overflow-x-hidden px-4 py-6 sm:px-6 sm:py-8">
      <div className="mx-auto w-full max-w-2xl space-y-6">

        {/* Header */}
        <div className="flex items-center gap-4">
          <Link
            href="/admin/ristoranti"
            className="inline-flex items-center gap-1.5 text-xs font-black text-white/45 transition hover:text-white"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            Torna ai locali
          </Link>
        </div>

        <div>
          <p className="text-xs font-black uppercase tracking-widest text-[#ff6b00]">Super Admin</p>
          <h1 className="mt-1 text-3xl font-black">Crea locale</h1>
        </div>

        <form action={handleCreate} className="space-y-5">
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
                placeholder="Es. Pizzeria da Mario"
                className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-bold text-white placeholder:text-white/20 outline-none focus:border-[#ff6b00]/60"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-black text-white/50">Tipo / Categoria</label>
                <input
                  type="text"
                  name="tipo"
                  placeholder="Es. Ristorante, Bar, Pizzeria…"
                  className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-bold text-white placeholder:text-white/20 outline-none focus:border-[#ff6b00]/60"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-black text-white/50">Stato</label>
                <select
                  name="status"
                  defaultValue="pending"
                  className="w-full rounded-xl border border-white/10 bg-[#1a1a1a] px-4 py-2.5 text-sm font-bold text-white outline-none focus:border-[#ff6b00]/60"
                >
                  <option value="pending">In attesa</option>
                  <option value="approved">Approvato</option>
                  <option value="rejected">Rifiutato</option>
                </select>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-5 space-y-4">
            <p className="text-xs font-black uppercase tracking-widest text-white/30">Indirizzo</p>

            <div>
              <label className="mb-1.5 block text-xs font-black text-white/50">Via / Indirizzo</label>
              <input
                type="text"
                name="address"
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
                  placeholder="Es. Milano"
                  className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-bold text-white placeholder:text-white/20 outline-none focus:border-[#ff6b00]/60"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-black text-white/50">CAP</label>
                <input
                  type="text"
                  name="zip"
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
                  placeholder="Es. +39 02 1234567"
                  className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-bold text-white placeholder:text-white/20 outline-none focus:border-[#ff6b00]/60"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-black text-white/50">Email</label>
                <input
                  type="email"
                  name="email"
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
                placeholder="Descrizione del locale…"
                className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-bold text-white placeholder:text-white/20 outline-none focus:border-[#ff6b00]/60 resize-none"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-black text-white/50">Orari di apertura</label>
              <textarea
                name="hours"
                rows={3}
                placeholder="Es. Lun-Ven 12:00-15:00, 19:00-23:00&#10;Sab-Dom 12:00-23:00"
                className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-bold text-white placeholder:text-white/20 outline-none focus:border-[#ff6b00]/60 resize-none"
              />
            </div>
          </div>

          <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-5 space-y-4">
            <p className="text-xs font-black uppercase tracking-widest text-white/30">Proprietario</p>

            <div>
              <label className="mb-1.5 block text-xs font-black text-white/50">
                Assegna a utente (opzionale)
              </label>
              <select
                name="ownerId"
                className="w-full rounded-xl border border-white/10 bg-[#1a1a1a] px-4 py-2.5 text-sm font-bold text-white outline-none focus:border-[#ff6b00]/60"
              >
                <option value="">— Nessun proprietario —</option>
                {gestori.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.firstName ?? ''} {u.lastName ?? ''} ({u.email}) — {u.role}
                  </option>
                ))}
              </select>
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
              Crea locale
            </button>
          </div>
        </form>
      </div>
    </main>
  )
}
