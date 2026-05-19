import Link from 'next/link'
import CreateUserForm from './CreateUserForm'

export default function CreateUserPage() {
  return (
    <main className="min-h-screen w-full overflow-x-hidden bg-black px-4 py-6 text-white sm:px-6 sm:py-8">
      <div className="mx-auto w-full max-w-lg">

        <Link
          href="/admin/users"
          className="mb-6 inline-flex items-center gap-1.5 text-xs font-black text-white/45 transition hover:text-white"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          Torna agli utenti
        </Link>

        <div className="rounded-2xl bg-white p-6 text-black shadow-[0_8px_30px_rgba(0,0,0,0.25)] sm:p-8">
          <p className="text-xs font-black uppercase tracking-widest text-[#ff6b00]">Super admin</p>
          <h1 className="mt-2 text-2xl font-black text-black">Crea utente</h1>
          <p className="mt-1 text-sm font-bold text-black/50">
            L'utente riceverà un'email per impostare la password.
          </p>

          <div className="mt-6">
            <CreateUserForm />
          </div>
        </div>
      </div>
    </main>
  )
}
