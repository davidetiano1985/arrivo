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

          <div className="relative mt-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-black/10" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white px-3 text-xs font-bold text-black/40">
                oppure
              </span>
            </div>
          </div>

          <button
            className="mt-4 flex h-12 w-full cursor-not-allowed items-center justify-center gap-3 rounded-xl border border-black/10 text-sm font-black text-black/35 opacity-50"
            disabled
            type="button"
          >
            <svg fill="none" height={18} viewBox="0 0 24 24" width={18} xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Accedi con Google
          </button>
          <p className="mt-2 text-center text-xs font-bold text-black/30">
            Disponibile a breve
          </p>
        </div>
      </div>
    </main>
  );
}
