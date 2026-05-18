import Link from "next/link";
import { getServerSession } from "next-auth";
import type { ReactNode } from "react";

import AccessoNegato from "../../components/AccessoNegato";
import { authOptions } from "../../lib/auth";
import LogoutButton from "./LogoutButton";

type AdminLink = { href: string; label: string; onlySuperAdmin?: boolean };

const adminLinks: AdminLink[] = [
  { href: "/admin", label: "Pannello" },
  { href: "/admin/users", label: "Utenti", onlySuperAdmin: true },
];

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return <AccessoNegato tipo="non_autenticato" />;
  }

  const role = (session.user as { role: string }).role;

  if (role !== "super_admin") {
    return <AccessoNegato tipo="non_autorizzato" ruolo={role} />;
  }

  const visibleLinks = adminLinks.filter(
    (link) => !link.onlySuperAdmin || role === "super_admin"
  );

  return (
    <div className="min-h-screen overflow-x-hidden bg-black text-white">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-white/10 bg-black px-6 py-7 md:flex md:flex-col">
        <Link className="flex items-center gap-2" href="/admin">
          <img src="/arrivo_logo.svg" alt="Arrivo" className="h-7 w-auto" />
          <span className="text-sm font-black text-[#ff6b00]">Admin</span>
        </Link>

        <nav className="mt-8 grid gap-2">
          {visibleLinks.map((link) => (
            <Link
              className="rounded-2xl px-4 py-3 text-sm font-black text-white/70 transition hover:bg-[#ff6b00] hover:text-black"
              href={link.href}
              key={link.href}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="mt-auto border-t border-white/10 pt-4">
          <LogoutButton />
        </div>
      </aside>

      <header className="sticky top-0 z-20 border-b border-white/10 bg-black/95 px-4 py-4 backdrop-blur md:hidden">
        <Link className="flex items-center gap-2" href="/admin">
          <img src="/arrivo_logo.svg" alt="Arrivo" className="h-6 w-auto" />
          <span className="text-sm font-black text-[#ff6b00]">Admin</span>
        </Link>

        <nav className="mt-4 flex flex-wrap gap-2">
          {visibleLinks.map((link) => (
            <Link
              className="rounded-full border border-white/10 px-4 py-2 text-sm font-black text-white/75 transition hover:border-[#ff6b00] hover:text-[#ff6b00]"
              href={link.href}
              key={link.href}
            >
              {link.href === "/admin" ? "Pannello" : link.label}
            </Link>
          ))}
          <LogoutButton mobile />
        </nav>
      </header>

      <div className="md:pl-64">{children}</div>
    </div>
  );
}
