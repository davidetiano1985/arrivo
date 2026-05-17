import { getServerSession } from "next-auth";

import { authOptions } from "../../../lib/auth";
import { prisma } from "../../../lib/prisma";
import UserActions from "./UserActions";

function getRoleBadgeClass(role: string) {
  if (role === "super_admin") return "bg-[#ff6b00] text-white";
  if (role === "gestore_locale") return "bg-black text-white";
  if (role === "manager") return "bg-blue-100 text-blue-800";
  if (role === "staff") return "bg-emerald-100 text-emerald-800";
  if (role === "cliente") return "bg-gray-100 text-gray-700";
  return "bg-black/10 text-black";
}

function formatDate(date: Date) {
  return date.toLocaleString("it-IT", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function AdminUsersPage() {
  const session = await getServerSession(authOptions);
  const currentUserId = (session?.user as { id?: string })?.id ?? "";

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      suspended: true,
      createdAt: true,
    },
  });

  const totalUsers = users.length;
  const activeUsers = users.filter((u) => !u.suspended).length;
  const suspendedUsers = users.filter((u) => u.suspended).length;

  return (
    <main className="min-h-screen w-full max-w-full overflow-x-hidden bg-black px-4 py-6 text-white sm:px-5 sm:py-8">
      <section className="mx-auto w-full max-w-5xl min-w-0">
        <div className="mb-6">
          <p className="text-sm font-black uppercase text-[#ff6b00]">
            Super admin
          </p>
          <h1 className="mt-2 text-3xl font-black">Utenti</h1>
        </div>

        <div className="mb-6 grid min-w-0 gap-3 sm:grid-cols-3">
          <article className="min-w-0 overflow-hidden rounded-2xl bg-white p-4 text-black">
            <p className="text-xs font-black uppercase text-black/45">
              Utenti totali
            </p>
            <p className="mt-2 text-3xl font-black">{totalUsers}</p>
          </article>
          <article className="min-w-0 overflow-hidden rounded-2xl bg-white p-4 text-black">
            <p className="text-xs font-black uppercase text-black/45">
              Attivi
            </p>
            <p className="mt-2 text-3xl font-black">{activeUsers}</p>
          </article>
          <article className="min-w-0 overflow-hidden rounded-2xl bg-white p-4 text-black">
            <p className="text-xs font-black uppercase text-black/45">
              Sospesi
            </p>
            <p className="mt-2 text-3xl font-black">{suspendedUsers}</p>
          </article>
        </div>

        {/* Mobile: card list */}
        <div className="grid w-full min-w-0 max-w-full gap-4 lg:hidden">
          {users.map((user) => (
            <article
              className="w-full min-w-0 max-w-full overflow-hidden rounded-2xl bg-white p-4 text-black shadow-[0_18px_45px_rgba(0,0,0,0.22)]"
              key={user.id}
            >
              <div className="min-w-0">
                <h2 className="break-words text-xl font-black">
                  {user.name ?? "—"}
                </h2>
                <p className="mt-1 break-all text-sm font-bold text-black/55">
                  {user.email}
                </p>
              </div>

              <div className="mt-4 grid min-w-0 gap-3">
                <div className="min-w-0 overflow-hidden rounded-2xl bg-black/[0.04] p-3">
                  <p className="text-xs font-black uppercase text-black/45">
                    Ruolo attuale
                  </p>
                  <span
                    className={`mt-2 inline-flex max-w-full break-all rounded-full px-3 py-1 text-xs font-black ${getRoleBadgeClass(user.role)}`}
                  >
                    {user.role}
                  </span>
                </div>

                <div className="min-w-0 overflow-hidden rounded-2xl bg-black/[0.04] p-3">
                  <p className="text-xs font-black uppercase text-black/45">
                    Stato
                  </p>
                  <span
                    className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-black ${user.suspended ? "bg-red-100 text-red-800" : "bg-emerald-100 text-emerald-800"}`}
                  >
                    {user.suspended ? "sospeso" : "attivo"}
                  </span>
                </div>

                <div className="min-w-0 overflow-hidden rounded-2xl bg-black/[0.04] p-3">
                  <p className="mb-2 text-xs font-black uppercase text-black/45">
                    Azioni
                  </p>
                  <UserActions
                    currentRole={user.role}
                    isSelf={user.id === currentUserId}
                    suspended={user.suspended}
                    userId={user.id}
                  />
                </div>

                <div className="min-w-0 overflow-hidden rounded-2xl bg-black/[0.04] p-3">
                  <p className="text-xs font-black uppercase text-black/45">
                    Registrato il
                  </p>
                  <p className="mt-2 break-words text-sm font-bold text-black/65">
                    {formatDate(user.createdAt)}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Desktop: table */}
        <div className="hidden max-w-full overflow-hidden rounded-2xl bg-white text-black shadow-[0_18px_45px_rgba(0,0,0,0.28)] lg:block">
          <div className="max-h-[70vh] overflow-auto">
            <table className="w-full min-w-0 border-collapse text-left">
              <thead className="sticky top-0 z-10 bg-[#ff6b00] text-white shadow-sm">
                <tr>
                  <th className="px-5 py-4 text-xs font-black uppercase">Nome</th>
                  <th className="px-5 py-4 text-xs font-black uppercase">Email</th>
                  <th className="px-5 py-4 text-xs font-black uppercase">Ruolo</th>
                  <th className="px-5 py-4 text-xs font-black uppercase">Stato</th>
                  <th className="px-5 py-4 text-xs font-black uppercase">Azioni</th>
                  <th className="px-5 py-4 text-xs font-black uppercase">Registrato il</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr
                    className="border-t border-black/10 transition hover:bg-[#ff6b00]/5"
                    key={user.id}
                  >
                    <td className="px-5 py-4 align-middle text-sm font-black">
                      {user.name ?? "—"}
                    </td>
                    <td className="px-5 py-4 align-middle text-sm font-bold text-black/65">
                      {user.email}
                    </td>
                    <td className="px-5 py-4 align-middle">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-black ${getRoleBadgeClass(user.role)}`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="px-5 py-4 align-middle">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-black ${user.suspended ? "bg-red-100 text-red-800" : "bg-emerald-100 text-emerald-800"}`}
                      >
                        {user.suspended ? "sospeso" : "attivo"}
                      </span>
                    </td>
                    <td className="px-5 py-4 align-middle">
                      <UserActions
                        currentRole={user.role}
                        isSelf={user.id === currentUserId}
                        suspended={user.suspended}
                        userId={user.id}
                      />
                    </td>
                    <td className="px-5 py-4 align-middle text-sm font-bold text-black/65">
                      {formatDate(user.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </main>
  );
}
