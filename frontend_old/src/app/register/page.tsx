"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { AuthInput, AuthShell, PrimaryAuthButton } from "@/components/auth/AuthShell";

export default function RegisterPage() {
  const [submitted, setSubmitted] = useState(false);

  return (
    <AuthShell
      badge="Nuovo account"
      subtitle="Crea il tuo profilo cliente per prenotare, ordinare e pagare prima di arrivare."
      title="Crea account"
    >
      {submitted ? (
        <div
          className="rounded-3xl border border-[#a8ffbf]/20 bg-[#a8ffbf]/10 p-5 text-[#d7ffe0]"
          role="status"
        >
          <CheckCircle2 className="h-8 w-8" aria-hidden="true" />
          <p className="mt-4 text-lg font-black">
            Controlla la tua email per confermare l’account.
          </p>
          <Link
            className="mt-5 inline-flex h-12 items-center justify-center rounded-2xl bg-white px-5 text-sm font-black text-[#05060a] transition hover:-translate-y-0.5"
            href="/login"
          >
            Vai al login
          </Link>
        </div>
      ) : (
        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            setSubmitted(true);
          }}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <AuthInput label="Nome" placeholder="Mario" />
            <AuthInput label="Cognome" placeholder="Rossi" />
          </div>
          <AuthInput label="Email" placeholder="nome@email.it" type="email" />
          <AuthInput label="Password" placeholder="Crea una password" type="password" />
          <AuthInput
            label="Conferma password"
            placeholder="Ripeti la password"
            type="password"
          />

          <label className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.05] p-4 text-sm leading-6 text-white/58">
            <input
              className="mt-1 h-4 w-4 rounded border-white/20 bg-white/10 accent-[#ff6a3d]"
              required
              type="checkbox"
            />
            <span>Accetto termini, condizioni e trattamento dei dati.</span>
          </label>

          <PrimaryAuthButton>Registrati</PrimaryAuthButton>
          <p className="text-center text-sm font-semibold text-white/46">
            Hai gia&apos; un account?{" "}
            <Link className="font-black text-[#ffb36b] transition hover:text-white" href="/login">
              Accedi
            </Link>
          </p>
        </form>
      )}
    </AuthShell>
  );
}

