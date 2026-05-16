"use client";

import Link from "next/link";
import { AuthInput, AuthShell, PrimaryAuthButton } from "@/components/auth/AuthShell";

export default function LoginPage() {
  return (
    <AuthShell
      subtitle="Accedi alla tua esperienza Arrivo e riprendi prenotazioni, preferiti e ordini."
      title="Bentornato"
    >
      <form
        className="space-y-4"
        onSubmit={(event) => {
          event.preventDefault();
        }}
      >
        <AuthInput label="Email" placeholder="nome@email.it" type="email" />
        <AuthInput label="Password" placeholder="La tua password" type="password" />

        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2 font-semibold text-white/52">
            <input
              className="h-4 w-4 rounded border-white/20 bg-white/10 accent-[#ff6a3d]"
              type="checkbox"
            />
            Ricordami
          </label>
          <Link className="font-black text-[#ffb36b] transition hover:text-white" href="/register">
            Registrati
          </Link>
        </div>

        <PrimaryAuthButton>Accedi</PrimaryAuthButton>
      </form>
    </AuthShell>
  );
}

