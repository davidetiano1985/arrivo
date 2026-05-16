"use client";

import Link from "next/link";
import { AuthInput, AuthShell, PrimaryAuthButton } from "@/components/auth/AuthShell";

export default function AdminLoginPage() {
  return (
    <AuthShell
      badge="Area admin"
      mode="admin"
      subtitle="Accesso riservato al team Arrivo per monitoraggio e gestione piattaforma."
      title="Admin login"
    >
      <form
        className="space-y-4"
        onSubmit={(event) => {
          event.preventDefault();
        }}
      >
        <AuthInput label="Email admin" placeholder="admin@arrivo.it" type="email" />
        <AuthInput label="Password" placeholder="Password amministratore" type="password" />

        <PrimaryAuthButton>Entra nel pannello</PrimaryAuthButton>

        <div className="pt-2 text-center text-sm font-semibold text-white/46">
          <Link className="font-black text-[#ffb36b] transition hover:text-white" href="/login">
            Torna al login cliente
          </Link>
        </div>
      </form>
    </AuthShell>
  );
}

