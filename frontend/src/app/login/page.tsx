'use client'

import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errore, setErrore] = useState("");
  const [caricamento, setCaricamento] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setErrore("");
    setCaricamento(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setCaricamento(false);

    if (!result || result.error) {
      setErrore("Email o password non corretti.");
      return;
    }

    router.push("/admin");
    router.refresh();
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-black px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <Link
            className="text-2xl font-black tracking-[0.16em] text-white"
            href="/"
          >
            ARRIVO
          </Link>
          <p className="mt-1 text-xs font-bold uppercase text-white/45">
            Food delivery premium
          </p>
        </div>

        <div className="rounded-[2rem] bg-white p-6 text-black shadow-[0_24px_70px_rgba(0,0,0,0.5)]">
          <h1 className="text-2xl font-black">Accedi</h1>
          <p className="mt-1 text-sm font-bold text-black/55">
            Inserisci le tue credenziali per continuare.
          </p>

          <form className="mt-6 grid gap-4" onSubmit={handleLogin}>
            <div>
              <label
                className="block text-xs font-black uppercase text-black/45"
                htmlFor="email"
              >
                Email
              </label>
              <input
                autoComplete="email"
                className="mt-2 h-12 w-full rounded-xl border border-black/10 bg-white px-3 text-sm font-bold outline-none placeholder:text-black/35 focus:border-[#ff6b00]"
                id="email"
                name="email"
                onChange={(e) => setEmail(e.target.value)}
                placeholder="la-tua@email.com"
                required
                type="email"
                value={email}
              />
            </div>

            <div>
              <label
                className="block text-xs font-black uppercase text-black/45"
                htmlFor="password"
              >
                Password
              </label>
              <input
                autoComplete="current-password"
                className="mt-2 h-12 w-full rounded-xl border border-black/10 bg-white px-3 text-sm font-bold outline-none placeholder:text-black/35 focus:border-[#ff6b00]"
                id="password"
                name="password"
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                type="password"
                value={password}
              />
            </div>

            {errore && (
              <p className="rounded-xl bg-red-50 px-3 py-2 text-sm font-bold text-red-600">
                {errore}
              </p>
            )}

            <button
              className="h-12 w-full rounded-xl bg-[#ff6b00] text-sm font-black text-white disabled:opacity-60"
              disabled={caricamento}
              type="submit"
            >
              {caricamento ? "Accesso in corso…" : "Accedi"}
            </button>
          </form>

          <p className="mt-5 text-center text-sm font-bold text-black/55">
            Non hai un account?{" "}
            <Link className="font-black text-[#ff6b00]" href="/registrati">
              Registrati
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
