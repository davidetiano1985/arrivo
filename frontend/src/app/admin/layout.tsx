import Link from "next/link";
import type { ReactNode } from "react";

const adminLinks = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/users", label: "Users" }
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-black text-white">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-white/10 bg-black px-6 py-7 md:flex md:flex-col">
        <Link className="text-2xl font-black text-[#ff6b00]" href="/admin">
          Arrivo Admin
        </Link>

        <nav className="mt-8 grid gap-2">
          {adminLinks.map((link) => (
            <Link
              className="rounded-2xl px-4 py-3 text-sm font-black text-white/70 transition hover:bg-[#ff6b00] hover:text-black"
              href={link.href}
              key={link.href}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </aside>

      <header className="sticky top-0 z-20 border-b border-white/10 bg-black/95 px-4 py-4 backdrop-blur md:hidden">
        <Link className="text-xl font-black text-[#ff6b00]" href="/admin">
          Arrivo Admin
        </Link>

        <nav className="mt-4 flex gap-2 overflow-x-auto">
          {adminLinks.map((link) => (
            <Link
              className="shrink-0 rounded-full border border-white/10 px-4 py-2 text-sm font-black text-white/75 transition hover:border-[#ff6b00] hover:text-[#ff6b00]"
              href={link.href}
              key={link.href}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </header>

      <div className="md:pl-64">{children}</div>
    </div>
  );
}
