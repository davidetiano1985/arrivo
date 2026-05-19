# ARRIVO — FILE DI CONTINUAZIONE CHAT
> Carica questo file in una nuova chat con Claude per riprendere esattamente da dove ci siamo fermati.

---

## CHI SEI E CHI SONO IO

**Progetto:** Arrivo — startup food-tech italiana (NON delivery).
**Concetto:** prenota tavolo → ordina dal menu → paga online → arrivi e ti siedi, piatto già in cucina.
**Founder:** Davide Tiano (`davidetiano@arrivoapp.it`) + Silvia Russo (`silviarusso@arrivoapp.it`)
**Dominio live:** `https://arrivoapp.it`
**Repository:** `https://github.com/davidetiano1985/arrivo.git`
**Branch principale:** `main`

---

## REGOLE ASSOLUTE — NON VIOLARLE MAI

```
NON fare cat dei file .env
NON mostrare SMTP_PASS o password in chat
NON fare push senza conferma esplicita dell'utente (a meno che l'utente non dica "fai push")
NON toccare .env.local
NON avviare localhost automaticamente
NON usare porte 3000/3001
NON toccare package.json senza motivo
NON toccare backend/database senza istruzione esplicita
NON fare redesign
NON aggiungere librerie esterne senza approvazione
```

---

## STRUTTURA PROGETTO

```
C:\Users\Dado\Desktop\Arrivo\
├── frontend/                        ← Next.js app (lavori qui)
│   ├── src/
│   │   ├── app/                     ← pagine Next.js App Router
│   │   ├── components/              ← componenti condivisi
│   │   ├── lib/                     ← auth.ts, prisma.ts, email.ts
│   │   └── data/                    ← dati mock (non renderizzati nelle pagine reali)
│   ├── prisma/                      ← schema Prisma
│   ├── public/                      ← arrivo_logo.svg, favicon.svg, robots.txt
│   ├── next.config.mjs
│   └── package.json
├── arrivo_logo.svg                  ← logo originale (copia in public/)
└── ARRIVO_HANDOFF_CONTINUAZIONE.md ← questo file
```

**WORKTREE ATTIVO:**
```
C:\Users\Dado\Desktop\Arrivo\.claude\worktrees\infallible-khorana-707851\
```
Le modifiche vanno fatte nel worktree. La build si esegue da:
```
cd C:/Users/Dado/Desktop/Arrivo/frontend && npm run build
```
(il worktree non ha node_modules propri)

**Git push:** sempre con:
```bash
git push origin HEAD:main
```
eseguito dalla directory worktree.

---

## STACK TECNICO

| Cosa | Versione/Dettaglio |
|---|---|
| Framework | Next.js 14.2.15, App Router |
| React | 18 |
| TypeScript | sì |
| CSS | Tailwind CSS |
| Auth | NextAuth v4, PrismaAdapter, JWT strategy |
| ORM | Prisma 7 con `@prisma/adapter-pg` (PrismaPg) |
| DB | PostgreSQL su VPS Aruba |
| Email | Nodemailer + Aruba SMTP (`smtps.aruba.it:465`) |
| Password | bcryptjs (12 rounds) |
| Deploy | VPS Ubuntu 22.04, PM2, Nginx reverse proxy |
| Colori | bg: `#000000`, accent: `#ff6b00` |

---

## VPS — COMANDI DEPLOY

```bash
cd ~/arrivo/frontend && git pull && npm run build && pm2 restart arrivo
```

**DB:** host `localhost:5432`, db `arrivo_db`, user `arrivo_user`
**NEXTAUTH_URL:** deve essere `https://arrivoapp.it` (senza trailing slash, senza www, con https)

---

## STATO ATTUALE AUTH

**File:** `frontend/src/lib/auth.ts`

- Strategy: JWT
- Providers: CredentialsProvider + GoogleProvider
- `pages: { signIn: '/login', error: '/login' }` ← entrambi configurati
- `allowDangerousEmailAccountLinking: true` su GoogleProvider
- `signIn` callback: blocca utenti sospesi, auto-verifica email per Google
- `jwt` callback: per OAuth legge role dal DB (non viene dal token Google)
- Il log diagnostico OAuth (`console.log GOOGLE_CLIENT_ID...`) è stato RIMOSSO

**Flusso registrazione cliente:**
1. `/registrati` → `RegistrazioneForm.tsx` (client) → Server Action `registraCliente()`
2. Crea utente con `emailVerified: null`, invia email con token 32 bytes, 24h
3. `/api/auth/verify?token=` → verifica token → imposta `emailVerified` → redirect `/email-verificata`

**Seed super admin:** `frontend/prisma/seed-super-admin.cjs`
→ include `emailVerified: new Date()` in create e update

---

## RUOLI UTENTE

| Ruolo | Descrizione |
|---|---|
| `cliente` | utente normale, si registra liberamente |
| `gestore` | proprietario di locale |
| `admin` | amministratore |
| `super_admin` | accesso completo, inserito manualmente via seed |

---

## PAGINE ESISTENTI

### Pagine pubbliche (usano NavbarPubblica + FooterPubblico)
| Route | File | Stato |
|---|---|---|
| `/` | `app/page.tsx` | ✅ homepage completa |
| `/chi-siamo` | `app/chi-siamo/page.tsx` | ✅ |
| `/come-funziona` | `app/come-funziona/page.tsx` | ✅ |
| `/blog` | `app/blog/page.tsx` | ✅ (articoli "in arrivo") |
| `/lavora-con-noi` | `app/lavora-con-noi/page.tsx` | ✅ |
| `/trova-ristoranti` | `app/trova-ristoranti/page.tsx` | ✅ (coming soon banner) |
| `/prenota-tavolo` | `app/prenota-tavolo/page.tsx` | ✅ |
| `/ordina-prima` | `app/ordina-prima/page.tsx` | ✅ |
| `/pagamenti` | `app/pagamenti/page.tsx` | ✅ |
| `/registra-attivita` | `app/registra-attivita/page.tsx` | ✅ |
| `/dashboard` | `app/dashboard/page.tsx` | ✅ (preview marketing, no fake browser) |
| `/gestione-ordini` | `app/gestione-ordini/page.tsx` | ✅ |
| `/supporto-partner` | `app/supporto-partner/page.tsx` | ✅ |
| `/contatti` | `app/contatti/page.tsx` | ✅ |
| `/faq` | `app/faq/page.tsx` | ✅ |
| `/privacy` | `app/privacy/page.tsx` | ✅ (bozza con disclaimer) |
| `/termini` | `app/termini/page.tsx` | ✅ (bozza con disclaimer) |
| `/cookie` | `app/cookie/page.tsx` | ✅ (bozza con disclaimer) |

### Pagine auth (sfondo nero, logo centrato con flexbox)
| Route | File | Stato |
|---|---|---|
| `/login` | `app/login/page.tsx` | ✅ con Google OAuth |
| `/registrati` | `app/registrati/page.tsx` | ✅ con verifica email |
| `/registrati/locale` | `app/registrati/locale/page.tsx` | ✅ mailto funzionante |
| `/email-verificata` | `app/email-verificata/page.tsx` | ✅ |
| `/verifica-email` | `app/verifica-email/page.tsx` | ✅ |
| `/registrazione-locale-inviata` | `app/registrazione-locale-inviata/page.tsx` | ✅ |

### Pagine admin (richiede autenticazione)
| Route | File | Note |
|---|---|---|
| `/admin` | `app/admin/page.tsx` | protetta, dati reali da DB |
| `/admin/users` | `app/admin/users/page.tsx` | gestione utenti, ruoli, sospensione |
| `/admin/layout.tsx` | layout con logo SVG + "Admin" |

---

## COMPONENTI CONDIVISI

| File | Descrizione |
|---|---|
| `components/NavbarPubblica.tsx` | navbar sticky pubblica, include HeaderPublico |
| `components/FooterPubblico.tsx` | footer 4 colonne con tutti i link reali |
| `components/HeaderPublico.tsx` | client component, 3 stati auth (loading/guest/logged) |
| `components/GoogleSignInButton.tsx` | pulsante Google OAuth, usa `signIn('google', ...)` |
| `components/SessionProvider.tsx` | wrapper NextAuth per client |
| `components/AccessoNegato.tsx` | pagina errore accesso negato |
| `components/LogoutButton.tsx` | pulsante logout admin (client component) |

---

## LOGO E BRAND

- **Logo SVG:** `frontend/public/arrivo_logo.svg` (copia di `Desktop/Arrivo/arrivo_logo.svg`)
- **Favicon:** `frontend/public/favicon.svg` (cerchio arancione con lancette, square)
- **Colore brand:** `#FF5722` / `#ff6b00`
- **Tagline:** "Prenota · Ordina · Arriva"
- **Logo usato in:** NavbarPubblica, FooterPubblico, homepage header, login, registrati, registrati/locale, email-verificata, verifica-email, registrazione-locale-inviata, admin/layout.tsx
- **Centratura logo:** usare `flex flex-col items-center` (NON `text-center` — non centra le img)

---

## SECURITY — STATO ATTUALE

### next.config.mjs (headers attivi)
```javascript
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
```

### robots.txt
```
User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/
```

### Open Graph (layout.tsx)
```
og:title, og:description, og:url, og:siteName, og:locale (it_IT), og:type (website)
```

### Cosa manca ancora (non urgente)
- HSTS → da aggiungere in Nginx sul VPS (`add_header Strict-Transport-Security "max-age=31536000; includeSubDomains"`)
- og:image → richiede un'immagine 1200x630
- sitemap.xml → da creare
- favicon.ico binario → attuale è SVG, va bene per browser moderni

---

## SAFE BROWSING — STORIA E STATO

**Problema:** Google Safe Browsing segnalava "Pagine ingannevoli", URL flaggato: `/api/auth/signin?error=OAuthCallback`

**Causa principale identificata:** log diagnostico OAuth in produzione + form `/registrati/locale` con pulsante non funzionale (raccoglieva dati ma non faceva nulla = pattern phishing).

**Fix già eseguiti (tutto committato su main):**
1. ✅ Rimosso log diagnostico `console.log` di GOOGLE_CLIENT_ID da `auth.ts`
2. ✅ Rimossa scritta "Food delivery premium" da tutte le pagine
3. ✅ Rimossa label "Demo UI — registrazione non ancora attiva"
4. ✅ Rimossa fake browser bar con URL `dashboard.arrivoapp.it`
5. ✅ Aggiunti security headers in `next.config.mjs`
6. ✅ Corretto metadata (`description: "Arrivo frontend"` → testo reale)
7. ✅ Creato `robots.txt`
8. ✅ Aggiunto `pages.error: '/login'` in auth.ts (fix OAuthCallback error page)
9. ✅ Form `/registrati/locale`: pulsante morto → `<a mailto:>` funzionante
10. ✅ Aggiunto Open Graph in layout.tsx
11. ✅ Creato `favicon.svg`
12. ✅ "Coming soon" → "In arrivo" in blog

**Azione da fare sul VPS:** deploy + richiesta revisione Google Search Console

---

## ULTIMO COMMIT

```
efeb1cd — "Final safe browsing cleanup: fix dead form button, add error page redirect, Open Graph, favicon, translate coming soon"
push: OK su origin/main
```

---

## COSE PENDENTI / TODO

1. **VPS:** deploy ultima versione (`git pull && npm run build && pm2 restart arrivo`)
2. **Google Search Console:** richiedere revisione manuale dopo deploy
3. **Google Safe Browsing:** segnalare risoluzione su `https://safebrowsing.google.com/safebrowsing/report_error/`
4. **Google OAuth 401:** verificare su VPS che `NEXTAUTH_URL=https://arrivoapp.it` sia corretto in `.env.local`, poi testare login Google
5. **HSTS:** aggiungere in Nginx (lato VPS, non frontend)
6. **og:image:** creare immagine 1200x630 per Open Graph
7. **sitemap.xml:** creare `app/sitemap.ts` o `public/sitemap.xml`
8. **Privacy/Termini/Cookie:** far revisionare da professionista legale prima del lancio ufficiale
9. **Seed super admin VPS:** rilanciare seed se serve (`node prisma/seed-super-admin.cjs`)

---

## COME FARE BUILD E PUSH

```bash
# Build (dalla cartella principale del progetto, non dal worktree)
cd C:/Users/Dado/Desktop/Arrivo/frontend && npm run build

# Commit e push (dal worktree)
cd C:/Users/Dado/Desktop/Arrivo/.claude/worktrees/infallible-khorana-707851
git add <file>
git commit -m "messaggio"
git push origin HEAD:main
```

---

## PATTERN DI CODICE DA RISPETTARE

### Pagina pubblica standard
```tsx
import FooterPubblico from "@/components/FooterPubblico";
import NavbarPubblica from "@/components/NavbarPubblica";

export default function NomePagina() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-black text-white">
      <NavbarPubblica />
      {/* sezioni */}
      <FooterPubblico />
    </main>
  );
}
```

### Pagina auth standard (login/registrazione)
```tsx
<main className="flex min-h-screen items-center justify-center bg-black px-4 py-12">
  <div className="w-full max-w-sm">
    <div className="mb-8 flex flex-col items-center">  {/* SEMPRE flex, non text-center */}
      <Link href="/">
        <img src="/arrivo_logo.svg" alt="Arrivo" className="h-10 w-auto" />
      </Link>
      <p className="mt-1 text-xs font-bold uppercase text-white/45">
        Prenota · Ordina · Arriva
      </p>
    </div>
    <div className="rounded-[2rem] bg-white p-6 text-black shadow-[0_24px_70px_rgba(0,0,0,0.5)]">
      {/* form */}
    </div>
  </div>
</main>
```

### Server Action
```typescript
'use server'
// logica server-side, nessun import client
```

### Client component con Server Action
```typescript
'use client'
import { useTransition } from 'react'
const [isPending, startTransition] = useTransition()
startTransition(async () => {
  const result = await serverAction(formData)
  if (result?.error) setErrore(result.error)
})
```

---

## FILE CHIAVE NON ANCORA DOCUMENTATI

| File | Cosa fa |
|---|---|
| `src/app/registrati/actions.ts` | Server Action `registraCliente()`: valida dati, crea user (role: cliente, emailVerified: null), genera token 32 bytes, invia email verifica, redirect `/verifica-email` |
| `src/app/api/auth/verify/route.ts` | GET handler: legge `?token=`, trova VerificationToken, controlla scadenza, imposta `emailVerified`, cancella token, redirect `/email-verificata`. Se scaduto → redirect `/registrati?errore=link-scaduto` |
| `src/lib/email.ts` | Nodemailer con Aruba SMTP (`smtps.aruba.it:465`). Esporta `sendVerificationEmail(email, token)`. Link verifica: `${NEXTAUTH_URL}/api/auth/verify?token=` |
| `src/lib/prisma.ts` | Singleton PrismaPg client |
| `prisma/prisma.config.ts` | Config DB per Prisma 7 (legge `DATABASE_URL` dall'env) |
| `prisma/seed-super-admin.cjs` | Crea/aggiorna super_admin con `emailVerified: new Date()`. Lanciare con `node prisma/seed-super-admin.cjs` sul VPS |
| `src/data/users.ts` | Dati mock legacy (DemoUser) — NON usati nelle pagine reali, da non importare |
| `src/data/restaurants.ts` | Dati mock legacy — NON usati nelle pagine reali |
| `src/data/currentUser.ts` | Mock legacy — NON usato nelle pagine reali |

---

## GOOGLE OAUTH — STATO APERTO ⚠️

Il Google OAuth ha avuto un errore `401 invalid_client` che non è mai stato risolto definitivamente in questa chat.

**Cosa è stato fatto:**
- Aggiunto diagnostic log (poi rimosso dopo push)
- Verificato che `auth.ts` usa le env var corrette (`GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`)
- Aggiunto `allowDangerousEmailAccountLinking: true`

**Cause probabili non ancora verificate:**
- `GOOGLE_CLIENT_ID` o `GOOGLE_CLIENT_SECRET` nel `.env.local` del VPS ha spazi, virgolette o `\r` invisibili
- Il Google Cloud Client non è stato "pubblicato" (rimasto in stato "Testing")
- `NEXTAUTH_URL` non corrisponde esattamente al dominio autorizzato in Google Cloud Console
- L'URI di redirect `https://arrivoapp.it/api/auth/callback/google` non è registrato nel Google Cloud Client

**Cosa fare sul VPS:**
```bash
# Controllare le env var (senza mostrare i valori segreti)
grep -c "GOOGLE_CLIENT_ID" ~/arrivo/frontend/.env.local
grep -c "GOOGLE_CLIENT_SECRET" ~/arrivo/frontend/.env.local
# Verificare lunghezza (non valore) per escludere whitespace
```

---

## WORKTREE — ATTENZIONE IN NUOVE CHAT

Il worktree `infallible-khorana-707851` è stato creato automaticamente da Claude Code per questa sessione. In una **nuova chat**, Claude Code creerà un **nuovo worktree** con un nome diverso.

**Come gestirlo in una nuova chat:**
- Le modifiche vanno sempre fatte nel worktree corrente della nuova sessione
- La build va sempre eseguita da `C:/Users/Dado/Desktop/Arrivo/frontend/` (ha i node_modules)
- Il push va sempre con `git push origin HEAD:main`
- Il codice attuale è su `main` — il worktree fa checkout di main automaticamente

---

## NOTE FINALI

- Il progetto usa Prisma 7 con adapter pg — la config DB è in `prisma.config.ts`, NON in `datasource` dello schema
- I dati in `src/data/` (users.ts, restaurants.ts) sono mock non collegati a pagine reali — non renderizzarli su pagine pubbliche
- La registrazione locale (`/registrati/locale`) è collegata a `mailto:` perché il backend non è ancora pronto — non aggiungere server action senza istruzioni esplicit
- Le pagine Privacy/Termini/Cookie hanno un disclaimer "bozza" visibile — è intenzionale
- `allowDangerousEmailAccountLinking: true` è necessario per evitare duplicati tra account Google e email/password con la stessa email
