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
  const [mostraPassword, setMostraPassword] = useState(false);

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
              <div className="relative">
                <input
                  autoComplete="current-password"
                  className="mt-2 h-12 w-full rounded-xl border border-black/10 bg-white px-3 pr-11 text-sm font-bold outline-none placeholder:text-black/35 focus:border-[#ff6b00]"
                  id="password"
                  name="password"
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  type={mostraPassword ? "text" : "password"}
                  value={password}
                />
                <button
                  aria-label={mostraPassword ? "Nascondi password" : "Mostra password"}
                  className="absolute right-3 top-1/2 mt-1 -translate-y-1/2 text-black/35 hover:text-black/70"
                  onClick={() => setMostraPassword((v) => !v)}
                  tabIndex={-1}
                  type="button"
                >
                  {mostraPassword ? (
                    <svg fill="none" height={20} stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" width={20} xmlns="http://www.w3.org/2000/svg">
                      <path d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ) : (
                    <svg fill="none" height={20} stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" width={20} xmlns="http://www.w3.org/2000/svg">
                      <path d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </button>
              </div>
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
