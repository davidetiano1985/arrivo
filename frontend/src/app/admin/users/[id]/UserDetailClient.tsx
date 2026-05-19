'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import {
  aggiornaRuolo,
  togglaSospensione,
  resetPassword,
  resetTentativiLogin,
  eliminaUtente,
} from '../actions'

const RUOLI = ['super_admin', 'gestore_locale', 'manager', 'staff', 'cliente'] as const

type Props = {
  userId: string
  isSelf: boolean
  currentRole: string
  suspended: boolean
  hasPassword: boolean
  loginAttempts: number
}

type ModalConfig = {
  title: string
  message: string
  confirmLabel: string
  destructive?: boolean
  onConfirm: () => Promise<void>
} | null

export default function UserDetailClient({
  userId,
  isSelf,
  currentRole,
  suspended,
  hasPassword,
  loginAttempts,
}: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [role, setRole] = useState(currentRole)
  const [isSuspended, setIsSuspended] = useState(suspended)
  const [attempts, setAttempts] = useState(loginAttempts)
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null)
  const [modal, setModal] = useState<ModalConfig>(null)

  function showToast(msg: string, ok: boolean) {
    setToast({ msg, ok })
    setTimeout(() => setToast(null), 3500)
  }

  async function run(action: () => Promise<{ error?: string }>) {
    const res = await action()
    if (res?.error) {
      showToast(res.error, false)
    } else {
      showToast('Operazione completata.', true)
      startTransition(() => router.refresh())
    }
  }

  function confirm(cfg: ModalConfig) {
    setModal(cfg)
  }

  // ── Role change ─────────────────────────────────────────────────────────────
  function handleRoleChange(newRole: string) {
    if (newRole === role) return
    confirm({
      title:        'Cambia ruolo',
      message:      `Cambiare il ruolo di questo utente da "${role}" a "${newRole}"?`,
      confirmLabel: 'Cambia ruolo',
      onConfirm: async () => {
        const prev = role
        setRole(newRole)
        const res = await aggiornaRuolo(userId, newRole)
        if (res?.error) { showToast(res.error, false); setRole(prev) }
        else { showToast(`Ruolo aggiornato → ${newRole}`, true); startTransition(() => router.refresh()) }
      },
    })
  }

  // ── Suspend / unsuspend ──────────────────────────────────────────────────────
  function handleSuspend() {
    const willSuspend = !isSuspended
    confirm({
      title:        willSuspend ? 'Sospendi utente' : 'Riattiva utente',
      message:      willSuspend
        ? 'L\'utente non potrà più accedere. Confermare?'
        : 'L\'utente potrà tornare ad accedere. Confermare?',
      confirmLabel: willSuspend ? 'Sospendi' : 'Riattiva',
      destructive:  willSuspend,
      onConfirm: async () => {
        const res = await togglaSospensione(userId, willSuspend)
        if (res?.error) showToast(res.error, false)
        else { setIsSuspended(willSuspend); showToast(willSuspend ? 'Utente sospeso.' : 'Utente riattivato.', true); startTransition(() => router.refresh()) }
      },
    })
  }

  // ── Reset password ───────────────────────────────────────────────────────────
  function handleResetPassword() {
    confirm({
      title:        'Reset password',
      message:      'Verrà inviata all\'utente un\'email con il link per impostare una nuova password.',
      confirmLabel: 'Invia email',
      onConfirm:    async () => run(() => resetPassword(userId)),
    })
  }

  // ── Reset login attempts ─────────────────────────────────────────────────────
  function handleResetAttempts() {
    confirm({
      title:        'Reset tentativi login',
      message:      `Azzerare i ${attempts} tentativi di login falliti?`,
      confirmLabel: 'Azzera',
      onConfirm: async () => {
        const res = await resetTentativiLogin(userId)
        if (res?.error) showToast(res.error, false)
        else { setAttempts(0); showToast('Tentativi azzerati.', true); startTransition(() => router.refresh()) }
      },
    })
  }

  // ── Delete user ──────────────────────────────────────────────────────────────
  function handleDelete() {
    confirm({
      title:        'Elimina utente',
      message:      'Questa azione è irreversibile. L\'utente e tutti i suoi dati verranno eliminati permanentemente.',
      confirmLabel: 'Elimina definitivamente',
      destructive:  true,
      onConfirm: async () => {
        const res = await eliminaUtente(userId)
        if (res?.error) showToast(res.error, false)
        else router.push('/admin/users')
      },
    })
  }

  const loading = isPending

  return (
    <>
      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 rounded-2xl px-5 py-3 text-sm font-black text-white shadow-2xl transition-all ${toast.ok ? 'bg-emerald-600' : 'bg-red-600'}`}>
          {toast.msg}
        </div>
      )}

      {/* Confirm modal */}
      {modal && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
            <h2 className="text-lg font-black text-black">{modal.title}</h2>
            <p className="mt-2 text-sm font-bold leading-relaxed text-black/60">{modal.message}</p>
            <div className="mt-5 flex justify-end gap-3">
              <button
                className="rounded-xl border border-black/10 px-4 py-2 text-sm font-black text-black transition hover:bg-black/5"
                onClick={() => setModal(null)}
                disabled={loading}
              >
                Annulla
              </button>
              <button
                className={`rounded-xl px-4 py-2 text-sm font-black text-white transition disabled:opacity-50 ${modal.destructive ? 'bg-red-600 hover:bg-red-700' : 'bg-[#ff6b00] hover:bg-[#e55f00]'}`}
                onClick={async () => {
                  const cfg = modal
                  setModal(null)
                  await cfg.onConfirm()
                }}
                disabled={loading}
              >
                {modal.confirmLabel}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Actions panel */}
      <div className="space-y-4">

        {/* Role */}
        <div className="rounded-2xl bg-black/[0.03] p-4">
          <p className="mb-3 text-xs font-black uppercase tracking-widest text-black/45">Ruolo</p>
          <div className="flex flex-wrap items-center gap-3">
            <select
              className="h-10 rounded-xl border border-black/10 bg-white px-3 text-sm font-black text-black outline-none focus:border-[#ff6b00] disabled:opacity-50"
              value={role}
              disabled={loading}
              onChange={(e) => handleRoleChange(e.target.value)}
            >
              {RUOLI.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
            {isSelf && (
              <span className="text-xs font-black text-black/40">⚠ Non puoi cambiare il tuo stesso ruolo da super_admin</span>
            )}
          </div>
        </div>

        {/* Account status */}
        <div className="rounded-2xl bg-black/[0.03] p-4">
          <p className="mb-3 text-xs font-black uppercase tracking-widest text-black/45">Stato account</p>
          <div className="flex flex-wrap items-center gap-3">
            <span className={`rounded-full px-3 py-1.5 text-sm font-black ${isSuspended ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>
              {isSuspended ? '● Sospeso' : '● Attivo'}
            </span>
            <button
              className={`rounded-xl px-4 py-2 text-sm font-black text-white transition disabled:opacity-50 ${isSuspended ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-[#ff6b00] hover:bg-[#e55f00]'}`}
              disabled={loading || (isSelf && !isSuspended)}
              onClick={handleSuspend}
              title={isSelf && !isSuspended ? 'Non puoi sospendere te stesso' : undefined}
            >
              {isSuspended ? 'Riattiva account' : 'Sospendi account'}
            </button>
          </div>
        </div>

        {/* Login attempts */}
        <div className="rounded-2xl bg-black/[0.03] p-4">
          <p className="mb-3 text-xs font-black uppercase tracking-widest text-black/45">Tentativi login falliti</p>
          <div className="flex flex-wrap items-center gap-3">
            <span className={`rounded-full px-3 py-1.5 text-sm font-black ${attempts > 5 ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'}`}>
              {attempts} {attempts === 1 ? 'tentativo' : 'tentativi'}
            </span>
            {attempts > 0 && (
              <button
                className="rounded-xl border border-black/10 bg-white px-4 py-2 text-sm font-black text-black transition hover:bg-black hover:text-white disabled:opacity-50"
                disabled={loading}
                onClick={handleResetAttempts}
              >
                Azzera tentativi
              </button>
            )}
          </div>
        </div>

        {/* Password reset */}
        {hasPassword && (
          <div className="rounded-2xl bg-black/[0.03] p-4">
            <p className="mb-3 text-xs font-black uppercase tracking-widest text-black/45">Password</p>
            <button
              className="rounded-xl border border-black/10 bg-white px-4 py-2 text-sm font-black text-black transition hover:bg-black hover:text-white disabled:opacity-50"
              disabled={loading}
              onClick={handleResetPassword}
            >
              Invia email reset password
            </button>
          </div>
        )}

        {/* Delete — always last, always red */}
        {!isSelf && (
          <div className="rounded-2xl border border-red-100 bg-red-50 p-4">
            <p className="mb-1 text-xs font-black uppercase tracking-widest text-red-400">Zona pericolosa</p>
            <p className="mb-3 text-xs font-bold text-red-400">Questa azione è irreversibile e non può essere annullata.</p>
            <button
              className="rounded-xl bg-red-600 px-4 py-2 text-sm font-black text-white transition hover:bg-red-700 disabled:opacity-50"
              disabled={loading}
              onClick={handleDelete}
            >
              Elimina utente
            </button>
          </div>
        )}
      </div>
    </>
  )
}
