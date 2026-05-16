import Link from "next/link";

import { users } from "../../data/users";

export default function AdminPage() {
  return (
    <main className="min-h-screen bg-black px-5 py-8 text-white">
      <section className="mx-auto w-full max-w-3xl">
        <div className="rounded-[2rem] bg-[#ff6b00] p-6">
          <p className="text-sm font-black uppercase text-black/60">
            Pannello super admin demo
          </p>
          <h1 className="mt-3 text-4xl font-black tracking-normal">
            Benvenuto Davide
          </h1>
          <p className="mt-2 text-base font-bold text-white/90">
            ruolo: super admin
          </p>
        </div>

        <div className="mt-6">
          <h2 className="text-2xl font-black">Sezioni admin</h2>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Link
              className="group block rounded-2xl border border-white/10 bg-white/[0.06] p-5 text-white shadow-lg shadow-black/20 transition duration-200 hover:-translate-y-0.5 hover:border-[#ff6b00]/70 hover:bg-white/[0.1] focus:outline-none focus:ring-2 focus:ring-[#ff6b00] focus:ring-offset-2 focus:ring-offset-black"
              href="/admin/users"
            >
              <div className="flex h-full flex-col justify-between gap-5">
                <div>
                  <p className="text-xs font-black uppercase text-[#ff6b00]">
                    Controlli piattaforma
                  </p>
                  <h3 className="mt-2 text-xl font-black">
                    Utenti e accessi
                  </h3>
                  <p className="mt-2 text-sm font-bold leading-6 text-white/70">
                    Gestisci utenti, ruoli e accessi della piattaforma
                  </p>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs font-black uppercase text-white/45">
                    /admin/users
                  </span>
                  <span className="rounded-full bg-[#ff6b00] px-4 py-2 text-xs font-black text-black transition group-hover:bg-white">
                    Apri
                  </span>
                </div>
              </div>
            </Link>
          </div>
        </div>

        <div className="mt-6">
          <h2 className="text-2xl font-black">Utenti demo</h2>

          <div className="mt-4 grid gap-3">
            {users.map((user) => (
              <article
                className="rounded-2xl bg-white p-4 text-black"
                key={user.id}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-black">{user.nome}</h3>
                    <p className="mt-1 text-sm font-bold text-black/55">
                      {user.email}
                    </p>
                    <p className="mt-2 text-xs font-black uppercase text-[#ff6b00]">
                      {user.ruolo}
                    </p>
                  </div>

                  <button className="shrink-0 rounded-xl bg-black px-4 py-3 text-xs font-black text-white">
                    Modifica ruolo
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
