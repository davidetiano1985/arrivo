'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useCallback, useTransition } from 'react'
import Link from 'next/link'

const RUOLI = ['', 'super_admin', 'gestore_locale', 'manager', 'staff', 'cliente'] as const
const PER_PAGE_OPTIONS = [25, 50, 100, 0] as const // 0 = tutti

export default function UsersFilters({
  totalUsers,
  totalFiltered,
}: {
  totalUsers: number
  totalFiltered: number
}) {
  const router   = useRouter()
  const pathname = usePathname()
  const params   = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const update = useCallback(
    (updates: Record<string, string>) => {
      const sp = new URLSearchParams(params.toString())
      Object.entries(updates).forEach(([k, v]) => {
        if (v) sp.set(k, v)
        else sp.delete(k)
      })
      sp.delete('page')               // reset to page 1 on filter change
      startTransition(() => router.push(`${pathname}?${sp.toString()}`))
    },
    [params, pathname, router],
  )

  const search  = params.get('search')  ?? ''
  const role    = params.get('role')    ?? ''
  const status  = params.get('status')  ?? ''
  const perPage = Number(params.get('perPage') ?? 25)

  const hasFilters = search || role || status

  return (
    <div className="mb-6 space-y-4">
      {/* Search + create button */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-black/35 pointer-events-none" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            className="h-10 w-full rounded-xl border border-black/10 bg-white pl-9 pr-4 text-sm font-bold text-black placeholder:text-black/35 outline-none focus:border-[#ff6b00] focus:ring-2 focus:ring-[#ff6b00]/20"
            defaultValue={search}
            onKeyDown={(e) => {
              if (e.key === 'Enter') update({ search: (e.target as HTMLInputElement).value })
            }}
            onBlur={(e) => update({ search: e.target.value })}
            placeholder="Cerca nome, email, #ID…"
            type="search"
          />
        </div>

        <Link
          href="/admin/users/create"
          className="flex h-10 items-center gap-2 rounded-xl bg-[#ff6b00] px-4 text-sm font-black text-white transition hover:bg-[#e55f00] whitespace-nowrap"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M12 5v14M5 12h14"/></svg>
          Crea utente
        </Link>
      </div>

      {/* Filters row */}
      <div className="flex flex-wrap items-center gap-3">
        <select
          className="h-9 rounded-xl border border-black/10 bg-white px-3 text-xs font-black text-black outline-none focus:border-[#ff6b00]"
          value={role}
          onChange={(e) => update({ role: e.target.value })}
        >
          <option value="">Tutti i ruoli</option>
          {RUOLI.filter(Boolean).map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>

        <select
          className="h-9 rounded-xl border border-black/10 bg-white px-3 text-xs font-black text-black outline-none focus:border-[#ff6b00]"
          value={status}
          onChange={(e) => update({ status: e.target.value })}
        >
          <option value="">Tutti gli stati</option>
          <option value="attivo">Attivi</option>
          <option value="sospeso">Sospesi</option>
        </select>

        <select
          className="h-9 rounded-xl border border-black/10 bg-white px-3 text-xs font-black text-black outline-none focus:border-[#ff6b00]"
          value={perPage}
          onChange={(e) => update({ perPage: e.target.value })}
        >
          <option value={25}>25 per pagina</option>
          <option value={50}>50 per pagina</option>
          <option value={100}>100 per pagina</option>
          <option value={0}>Tutti</option>
        </select>

        {hasFilters && (
          <button
            className="h-9 rounded-xl border border-red-200 bg-red-50 px-3 text-xs font-black text-red-600 transition hover:bg-red-100"
            onClick={() => update({ search: '', role: '', status: '' })}
          >
            ✕ Rimuovi filtri
          </button>
        )}

        {isPending && (
          <span className="text-xs font-black text-black/40 animate-pulse">Carico…</span>
        )}

        <span className="ml-auto text-xs font-black text-black/40">
          {hasFilters
            ? `${totalFiltered} di ${totalUsers} utenti`
            : `${totalUsers} utenti totali`}
        </span>
      </div>
    </div>
  )
}
