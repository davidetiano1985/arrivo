"use client";

import { useState } from "react";
import { users } from "../../../data/users";

const roleOptions = ["super_admin", "admin", "manager", "staff"];
const demoLastUpdatedDates = [
  "17/05/2026 09:00",
  "17/05/2026 09:15",
  "17/05/2026 09:30",
  "17/05/2026 09:45"
];

function getCurrentDateTime() {
  return new Date().toLocaleString("it-IT", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function getRoleBadgeClass(role: string) {
  if (role === "super_admin") {
    return "bg-[#ff6b00] text-white";
  }

  if (role === "admin") {
    return "bg-black text-white";
  }

  if (role === "manager") {
    return "bg-blue-100 text-blue-800";
  }

  if (role === "staff") {
    return "bg-emerald-100 text-emerald-800";
  }

  return "bg-black/10 text-black";
}

function getStatusBadgeClass(status: string) {
  return status === "active"
    ? "bg-emerald-100 text-emerald-800"
    : "bg-red-100 text-red-800";
}

function getStatusLabel(status: string) {
  return status === "active" ? "attivo" : "sospeso";
}

export default function AdminUsersPage() {
  const [managedUsers, setManagedUsers] = useState(users);
  const [roleFilter, setRoleFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedRoles, setSelectedRoles] = useState<Record<string, string>>(
    () =>
      Object.fromEntries(users.map((user) => [user.id, user.ruolo]))
  );
  const [userStatuses, setUserStatuses] = useState<Record<string, string>>(
    () => Object.fromEntries(users.map((user) => [user.id, "active"]))
  );
  const [restaurantAccess, setRestaurantAccess] = useState<
    Record<string, string[]>
  >(() =>
    Object.fromEntries(
      users.map((user) => [user.id, [...user.restaurantIds]])
    )
  );
  const [lastUpdated, setLastUpdated] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      users.map((user, index) => [
        user.id,
        demoLastUpdatedDates[index] ?? "17/05/2026 09:00"
      ])
    )
  );
  const updateLastUpdated = (userId: string) => {
    setLastUpdated((currentLastUpdated) => ({
      ...currentLastUpdated,
      [userId]: getCurrentDateTime()
    }));
  };
  const deleteUser = (userId: string) => {
    const userRole = selectedRoles[userId];
    const user = managedUsers.find((currentUser) => currentUser.id === userId);

    if (!user || user.ruolo === "super_admin" || userRole === "super_admin") {
      return;
    }

    const confirmed = window.confirm("Eliminare questo utente?");

    if (!confirmed) {
      return;
    }

    setManagedUsers((currentUsers) =>
      currentUsers.filter((user) => user.id !== userId)
    );
    setSelectedRoles((currentRoles) => {
      const nextRoles = { ...currentRoles };
      delete nextRoles[userId];
      return nextRoles;
    });
    setUserStatuses((currentStatuses) => {
      const nextStatuses = { ...currentStatuses };
      delete nextStatuses[userId];
      return nextStatuses;
    });
    setRestaurantAccess((currentAccess) => {
      const nextAccess = { ...currentAccess };
      delete nextAccess[userId];
      return nextAccess;
    });
    setLastUpdated((currentLastUpdated) => {
      const nextLastUpdated = { ...currentLastUpdated };
      delete nextLastUpdated[userId];
      return nextLastUpdated;
    });
    setSelectedUserId(null);
  };
  const totalUsers = managedUsers.length;
  const activeUsers = managedUsers.filter(
    (user) => userStatuses[user.id] === "active"
  ).length;
  const suspendedUsers = managedUsers.filter(
    (user) => userStatuses[user.id] === "suspended"
  ).length;
  const filteredUsers =
    roleFilter === "all"
      ? managedUsers.filter((user) => {
          const query = searchQuery.trim().toLowerCase();
          return (
            query.length === 0 ||
            user.nome.toLowerCase().includes(query) ||
            user.email.toLowerCase().includes(query)
          );
        })
      : managedUsers.filter((user) => {
          const query = searchQuery.trim().toLowerCase();
          const matchesRole = selectedRoles[user.id] === roleFilter;
          const matchesSearch =
            query.length === 0 ||
            user.nome.toLowerCase().includes(query) ||
            user.email.toLowerCase().includes(query);

          return matchesRole && matchesSearch;
        });
  const selectedUser = selectedUserId
    ? managedUsers.find((user) => user.id === selectedUserId) ?? null
    : null;
  const canDeleteSelectedUser =
    selectedUser !== null &&
    selectedUser.ruolo !== "super_admin" &&
    selectedRoles[selectedUser.id] !== "super_admin";

  return (
    <main className="min-h-screen bg-black px-4 py-6 text-white sm:px-5 sm:py-8">
      <section className="mx-auto w-full max-w-5xl">
        <div className="mb-6">
          <p className="text-sm font-black uppercase text-[#ff6b00]">
            Demo super admin
          </p>
          <h1 className="mt-2 text-3xl font-black">Utenti</h1>
        </div>

        <div className="mb-6 grid gap-3 sm:grid-cols-3">
          <article className="rounded-2xl bg-white p-4 text-black">
            <p className="text-xs font-black uppercase text-black/45">
              Utenti totali
            </p>
            <p className="mt-2 text-3xl font-black">{totalUsers}</p>
          </article>
          <article className="rounded-2xl bg-white p-4 text-black">
            <p className="text-xs font-black uppercase text-black/45">
              Utenti attivi
            </p>
            <p className="mt-2 text-3xl font-black">{activeUsers}</p>
          </article>
          <article className="rounded-2xl bg-white p-4 text-black">
            <p className="text-xs font-black uppercase text-black/45">
              Utenti sospesi
            </p>
            <p className="mt-2 text-3xl font-black">{suspendedUsers}</p>
          </article>
        </div>

        <div className="mb-4 grid gap-3 rounded-2xl bg-white p-4 text-black sm:grid-cols-[1fr_1fr_auto]">
          <div>
            <label
              className="block text-xs font-black uppercase text-black/45"
              htmlFor="user-search"
            >
              Cerca
            </label>
            <input
              className="mt-2 h-11 w-full rounded-xl border border-black/10 bg-white px-3 text-sm font-black text-black outline-none placeholder:text-black/35"
              id="user-search"
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Cerca per nome o email"
              type="search"
              value={searchQuery}
            />
          </div>

          <div>
            <label
              className="block text-xs font-black uppercase text-black/45"
              htmlFor="role-filter"
            >
              Filtra per ruolo
            </label>
            <select
              className="mt-2 h-11 w-full rounded-xl border border-black/10 bg-white px-3 text-sm font-black text-black"
              id="role-filter"
              onChange={(event) => setRoleFilter(event.target.value)}
              value={roleFilter}
            >
              <option value="all">tutti</option>
              {roleOptions.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <button
              className="h-11 w-full rounded-xl bg-black px-4 text-sm font-black text-white sm:w-auto"
              onClick={() => {
                setSearchQuery("");
                setRoleFilter("all");
              }}
            >
              Reimposta filtri
            </button>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl bg-white text-black shadow-[0_18px_45px_rgba(0,0,0,0.28)]">
          <div className="max-h-[70vh] overflow-auto">
            <table className="w-full min-w-[980px] border-collapse text-left">
              <thead className="sticky top-0 z-10 bg-[#ff6b00] text-white shadow-sm">
                <tr>
                  <th className="px-5 py-4 text-xs font-black uppercase">
                    Nome
                  </th>
                  <th className="px-5 py-4 text-xs font-black uppercase">
                    Email
                  </th>
                  <th className="px-5 py-4 text-xs font-black uppercase">
                    Ruolo
                  </th>
                  <th className="px-5 py-4 text-xs font-black uppercase">
                    Accesso ristoranti
                  </th>
                  <th className="px-5 py-4 text-xs font-black uppercase">
                    Stato
                  </th>
                  <th className="px-5 py-4 text-xs font-black uppercase">
                    Ultimo aggiornamento
                  </th>
                  <th className="px-5 py-4 text-xs font-black uppercase">
                    Azioni
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr
                    className="border-t border-black/10 transition hover:bg-[#ff6b00]/5"
                    key={user.id}
                  >
                    <td className="px-5 py-4 align-top text-sm font-black">
                      {user.nome}
                    </td>
                    <td className="px-5 py-4 align-top text-sm font-bold text-black/65">
                      {user.email}
                    </td>
                    <td className="px-5 py-4 align-top text-sm font-black">
                      <div className="space-y-2">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-black ${getRoleBadgeClass(
                            selectedRoles[user.id]
                          )}`}
                        >
                          {selectedRoles[user.id]}
                        </span>
                        <select
                          className="h-10 w-full rounded-xl border border-black/10 bg-white px-3 text-xs font-black text-black outline-none"
                          value={selectedRoles[user.id]}
                          onChange={(event) => {
                            setSelectedRoles((currentRoles) => ({
                              ...currentRoles,
                              [user.id]: event.target.value
                            }));
                            updateLastUpdated(user.id);
                            console.log("role changed");
                          }}
                        >
                          {!roleOptions.includes(selectedRoles[user.id]) && (
                            <option value={selectedRoles[user.id]}>
                              {selectedRoles[user.id]}
                            </option>
                          )}
                          {roleOptions.map((role) => (
                            <option key={role} value={role}>
                              {role}
                            </option>
                          ))}
                        </select>
                      </div>
                    </td>
                    <td className="px-5 py-4 align-top">
                      <div className="space-y-3">
                        <p className="max-w-[220px] text-sm font-bold leading-5 text-black/65">
                          {restaurantAccess[user.id].length > 0
                            ? restaurantAccess[user.id].join(", ")
                            : "Nessun ristorante"}
                        </p>
                        <button
                          className="rounded-xl bg-black px-4 py-2 text-xs font-black text-white"
                          onClick={() => {
                            setRestaurantAccess((currentAccess) => ({
                              ...currentAccess,
                              [user.id]: currentAccess[user.id].includes(
                                "roma-centro"
                              )
                                ? currentAccess[user.id]
                                : [...currentAccess[user.id], "roma-centro"]
                            }));
                            updateLastUpdated(user.id);
                          }}
                        >
                          Assegna ristorante
                        </button>
                      </div>
                    </td>
                    <td className="px-5 py-4 align-top">
                      <div className="flex flex-wrap items-center gap-3">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-black ${getStatusBadgeClass(
                            userStatuses[user.id]
                          )}`}
                        >
                          {getStatusLabel(userStatuses[user.id])}
                        </span>
                        <button
                          className="rounded-xl bg-[#ff6b00] px-4 py-2 text-xs font-black text-white"
                          onClick={() => {
                            setUserStatuses((currentStatuses) => ({
                              ...currentStatuses,
                              [user.id]:
                                currentStatuses[user.id] === "active"
                                  ? "suspended"
                                  : "active"
                            }));
                            updateLastUpdated(user.id);
                          }}
                        >
                          {userStatuses[user.id] === "active"
                            ? "Sospendi"
                            : "Attiva"}
                        </button>
                      </div>
                    </td>
                    <td className="px-5 py-4 align-top text-sm font-bold text-black/65">
                      {lastUpdated[user.id]}
                    </td>
                    <td className="px-5 py-4 align-top">
                      <button
                        className="rounded-xl bg-black px-4 py-2 text-xs font-black text-white"
                        onClick={() => setSelectedUserId(user.id)}
                      >
                        Dettagli
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {selectedUser && (
          <div className="mt-5 rounded-[1.75rem] border-2 border-[#ff6b00] bg-white p-5 text-black shadow-[0_18px_45px_rgba(255,107,0,0.18)] sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-xs font-black uppercase text-[#ff6b00]">
                  Dettagli utente
                </p>
                <h2 className="mt-2 text-3xl font-black">
                  {selectedUser.nome}
                </h2>
              </div>

              <button
                className="h-11 rounded-xl bg-black px-4 text-sm font-black text-white"
                onClick={() => setSelectedUserId(null)}
              >
                Chiudi dettagli
              </button>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <div className="rounded-2xl bg-black/[0.04] p-4">
                <p className="text-xs font-black uppercase text-black/45">
                  Nome
                </p>
                <p className="mt-2 text-sm font-black">{selectedUser.nome}</p>
              </div>
              <div className="rounded-2xl bg-black/[0.04] p-4">
                <p className="text-xs font-black uppercase text-black/45">
                  Email
                </p>
                <p className="mt-2 break-all text-sm font-bold">
                  {selectedUser.email}
                </p>
              </div>
              <div className="rounded-2xl bg-black/[0.04] p-4">
                <p className="text-xs font-black uppercase text-black/45">
                  Ruolo
                </p>
                <span
                  className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-black ${getRoleBadgeClass(
                    selectedRoles[selectedUser.id]
                  )}`}
                >
                  {selectedRoles[selectedUser.id]}
                </span>
              </div>
              <div className="rounded-2xl bg-black/[0.04] p-4">
                <p className="text-xs font-black uppercase text-black/45">
                  Stato
                </p>
                <span
                  className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-black ${getStatusBadgeClass(
                    userStatuses[selectedUser.id]
                  )}`}
                >
                  {getStatusLabel(userStatuses[selectedUser.id])}
                </span>
              </div>
              <div className="rounded-2xl bg-black/[0.04] p-4">
                <p className="text-xs font-black uppercase text-black/45">
                  ID ristoranti
                </p>
                <p className="mt-2 text-sm font-bold leading-6">
                  {restaurantAccess[selectedUser.id].length > 0
                    ? restaurantAccess[selectedUser.id].join(", ")
                    : "Nessun ristorante"}
                </p>
              </div>
              <div className="rounded-2xl bg-black/[0.04] p-4">
                <p className="text-xs font-black uppercase text-black/45">
                  Ultimo aggiornamento
                </p>
                <p className="mt-2 text-sm font-bold">
                  {lastUpdated[selectedUser.id]}
                </p>
              </div>
            </div>

            {canDeleteSelectedUser && (
              <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-4">
                <p className="text-xs font-black uppercase text-red-700">
                  Zona pericolosa
                </p>
                <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm font-bold text-red-900">
                    Elimina questo utente demo dallo stato locale della UI.
                  </p>
                  <button
                    className="h-11 rounded-xl bg-red-600 px-4 text-sm font-black text-white"
                    onClick={() => deleteUser(selectedUser.id)}
                  >
                    Elimina utente
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </section>
    </main>
  );
}
