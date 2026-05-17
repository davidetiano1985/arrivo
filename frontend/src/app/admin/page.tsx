import Link from "next/link";
import { getServerSession } from "next-auth";

import { authOptions } from "../../lib/auth";
import { prisma } from "../../lib/prisma";

export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  if (!session) return null;

  const name = session.user?.name ?? session.user?.email ?? "Admin";
  const role = (session.user as { role: string }).role;

  const [totalUsers, activeUsers, suspendedUsers] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { suspended: false } }),
    prisma.user.count({ where: { suspended: true } }),
  ]);

  return (
    <main className="min-h-screen overflow-x-hidden bg-black px-4 py-6 text-white sm:px-5 sm:py-8">
      <section className="mx-auto w-full max-w-3xl">
        <div className="rounded-[2rem] bg-[#ff6b00] p-5 sm:p-6">
          <p className="text-sm font-black uppercase text-black/60">
            Pannello super admin
          </p>
          <h1 className="mt-3 break-words text-3xl font-black tracking-normal sm:text-4xl">
            Benvenuto {name}
          </h1>
          <p className="mt-2 text-base font-bold text-white/90">
            ruolo: {role}
          </p>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <article className="rounded-2xl bg-white p-4 text-black">
            <p className="text-xs font-black uppercase text-black/45">
              Utenti totali
            </p>
            <p className="mt-2 text-3xl font-black">{totalUsers}</p>
          </article>
          <article className="rounded-2xl bg-white p-4 text-black">
            <p className="text-xs font-black uppercase text-black/45">
              Attivi
            </p>
            <p className="mt-2 text-3xl font-black">{activeUsers}</p>
          </article>
          <article className="rounded-2xl bg-white p-4 text-black">
            <p className="text-xs font-black uppercase text-black/45">
              Sospesi
            </p>
            <p className="mt-2 text-3xl font-black">{suspendedUsers}</p>
          </article>
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

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <span className="break-all text-xs font-black uppercase text-white/45">
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
      </section>
    </main>
  );
}
