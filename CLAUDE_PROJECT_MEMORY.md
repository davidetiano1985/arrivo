# CLAUDE PROJECT MEMORY — Arrivo

Questo file è la memoria tecnica completa del progetto Arrivo.
Leggilo SEMPRE all'inizio di una nuova chat prima di fare qualsiasi cosa.
Leggilo insieme a `PROJECT_STATUS.md` che rimane il source of truth operativo.

Ultimo aggiornamento: 2026-05-17

---

## 1. PANORAMICA PROGETTO

Arrivo è una piattaforma food-tech italiana per:
- discovery ristoranti
- prenotazione tavoli
- ordini
- gestione operativa ristoranti

**Dominio pubblico:** https://arrivoapp.it
**Repository GitHub:** https://github.com/davidetiano1985/arrivo
**Branch principale:** `main`

---

## 2. STATO REALE ATTUALE (maggio 2026)

### Cosa esiste e funziona in produzione
- Homepage pubblica demo (stile nero/arancione, mobile-first)
- Area `/admin` demo (pannello super admin finto)
- Area `/admin/users` demo (gestione utenti finta, stato locale React)
- Layout admin con navigazione sidebar (desktop) e top bar (mobile)
- Deploy attivo su VPS Aruba via PM2 + Nginx

### Cosa è stato preparato ma NON ancora attivo in produzione
- Schema Prisma (tabelle User, Restaurant, Account, Session, VerificationToken)
- Pacchetti auth installati: next-auth, @auth/prisma-adapter, nodemailer, bcryptjs
- Config Prisma v7 (`prisma.config.js`)
- File `.env.local.example` (template variabili d'ambiente)

### Cosa NON esiste ancora
- Login reale
- Registrazione utenti reale
- Registrazione ristoranti reale
- Sessioni reali
- Autenticazione reale
- Protezione route reale
- API routes Next.js funzionanti
- Database connesso al frontend
- Email transazionali reali
- Verifica email reale
- Approvazione ristoranti reale
- Seed super admin reale nel database
- `prisma migrate` eseguito sulla VPS
- `.env.local` creato sulla VPS

---

## 3. INFRASTRUTTURA VPS

| Componente | Dettaglio |
|---|---|
| Provider | Aruba Cloud VPS |
| OS | Ubuntu 22.04 |
| Process manager | PM2 |
| Reverse proxy | Nginx |
| Node.js | Presente (gestisce Next.js) |
| PostgreSQL | Presente, in ascolto su localhost:5432 |
| Percorso progetto | `/root/arrivo` |
| Percorso frontend | `/root/arrivo/frontend` |

---

## 4. DATABASE POSTGRESQL (VPS)

| Campo | Valore |
|---|---|
| Host | localhost (solo dalla VPS) |
| Porta | 5432 |
| Nome database | arrivo_db |
| Utente | arrivo_user |
| Password | NON inserire qui — usare .env.local |

**IMPORTANTE:** il database PostgreSQL è sulla VPS.
Da una macchina Windows locale, `localhost:5432` NON raggiunge il database.
Qualsiasi comando Prisma che richiede connessione reale (migrate, seed, db push)
deve essere eseguito SULLA VPS via SSH, non in locale.

---

## 5. STACK TECNOLOGICO COMPLETO

### Frontend (Next.js — unico sistema attivo in produzione)

| Libreria | Versione | Scopo |
|---|---|---|
| next | 14.2.15 | Framework React App Router |
| react | 18.3.1 | UI |
| typescript | 5.6.3 | Tipizzazione |
| tailwindcss | 3.4.13 | Stile |
| prisma | ^7.8.0 | ORM database (CLI) |
| @prisma/client | ^7.8.0 | Client database |
| next-auth | ^4.24.14 | Autenticazione (sessioni, OAuth) |
| @auth/prisma-adapter | ^2.11.2 | Adattatore NextAuth ↔ Prisma |
| nodemailer | ^7.0.13 | Invio email via SMTP |
| bcryptjs | ^3.0.3 | Hashing password |
| @types/nodemailer | ^8.0.0 | Tipi TypeScript |
| @types/bcryptjs | ^2.4.6 | Tipi TypeScript |

### Backend Python (FastAPI — scaffold presente, NON deployato)
- Cartella: `backend/`
- Stato: placeholder puro, zero implementazioni
- Stack: FastAPI, SQLAlchemy, asyncpg, python-jose, passlib
- Non è collegato al frontend
- Non è gestito da PM2
- Da usare solo in fasi successive (microservizi, ordini, etc.)
- NON modificare per i task correnti

### Database (schema Docker — NON usato in produzione)
- Cartella: `database/`
- Stato: docker-compose PostgreSQL, zero migrazioni, zero seeds
- Usare invece il PostgreSQL diretto sulla VPS

---

## 6. STRUTTURA CARTELLE

```
Arrivo/                        ← root repository GitHub
  frontend/                   ← UNICO frontend attivo in produzione
    src/
      app/
        page.tsx               ← homepage demo
        admin/
          layout.tsx           ← layout admin (sidebar + top bar)
          page.tsx             ← pannello admin demo
          users/
            page.tsx           ← gestione utenti demo
      data/
        restaurants.ts         ← dati demo ristoranti
        users.ts               ← dati demo utenti
    prisma/
      schema.prisma            ← schema Prisma (User, Restaurant, etc.)
    prisma.config.js           ← config Prisma v7 (CRITICO — vedi sezione 9)
    package.json               ← dipendenze frontend
    .env.local.example         ← template variabili d'ambiente (committato)
    .env.local                 ← variabili reali (NON committato, in .gitignore)
  backend/                     ← FastAPI scaffold (non attivo)
  database/                    ← schema Docker (non usato)
  frontend_old/                ← vecchio frontend (backup)
  PROJECT_STATUS.md            ← source of truth operativo
  CLAUDE_PROJECT_MEMORY.md     ← questo file
```

---

## 7. WORKFLOW CORRETTO

```
Claude/Codex (locale)
  → git commit + git push
  → GitHub (davidetiano1985/arrivo)
  → VPS: git pull
  → VPS: npm run build
  → VPS: pm2 restart arrivo
```

### Comandi deploy VPS (SSH)
```bash
cd /root/arrivo
git pull

cd /root/arrivo/frontend
npm run build

pm2 restart arrivo
```

**REGOLA:** non usare workflow alternativi senza richiesta esplicita.

---

## 8. VARIABILI D'AMBIENTE

Il file `.env.local.example` (committato) contiene il template.
Il file `.env.local` (NON committato) contiene i valori reali.

### Variabili richieste

```
DATABASE_URL="postgresql://arrivo_user:PASSWORD@localhost:5432/arrivo_db"
NEXTAUTH_SECRET="stringa casuale sicura — genera con: openssl rand -base64 32"
NEXTAUTH_URL="https://arrivoapp.it"
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
SMTP_HOST="smtps.aruba.it"
SMTP_PORT="465"
SMTP_SECURE="true"
SMTP_USER="noreply@arrivoapp.it"
SMTP_PASS="password casella Aruba"
SMTP_FROM="Arrivo <noreply@arrivoapp.it>"
```

**NON inserire password o segreti reali in nessun file committato.**
Il `.env.local` va creato manualmente sulla VPS dopo ogni `git pull` (prima volta).

---

## 9. PRISMA V7 — PROBLEMI E SOLUZIONI TROVATE

### Breaking change critica
Prisma v7 ha rimosso il campo `url` dal blocco `datasource` in `schema.prisma`.
Il vecchio formato non funziona più:
```prisma
// SBAGLIATO per Prisma v7
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")  // NON supportato in v7
}
```

Il formato corretto per `schema.prisma`:
```prisma
// CORRETTO per Prisma v7
datasource db {
  provider = "postgresql"
}
```

### File prisma.config.js (OBBLIGATORIO per migrate)
La `DATABASE_URL` va passata tramite `prisma.config.js` nella root del frontend.

**Formato corretto** (file già esistente e committato):
```javascript
const { config } = require('dotenv')
const { join } = require('path')

config({ path: join(__dirname, '.env.local') })

module.exports = {
  datasource: {
    url: process.env.DATABASE_URL,
  },
}
```

### Errori da NON ripetere
- `earlyAccess: true` nel config → il parser Prisma lo rifiuta con "excess property error"
- File `.ts` per il config → Prisma non riesce a parsare TypeScript direttamente
- File `.mjs` → stesso problema di parsing
- `module.exports` con `require()` all'interno (in alcune versioni) → problema parsing
- La soluzione finale che funziona: `.js` con `require('dotenv')` esterno al module.exports

### Comandi Prisma che funzionano in locale
```bash
npx prisma format      # valida e formatta schema (OK in locale)
npx prisma generate    # genera il client (OK in locale, non serve DB)
```

### Comandi Prisma che richiedono la VPS
```bash
npx prisma migrate dev --name init   # SOLO sulla VPS (richiede DB)
npx prisma migrate deploy            # SOLO sulla VPS (produzione)
npx prisma db seed                   # SOLO sulla VPS (richiede DB)
```

---

## 10. SCHEMA DATABASE (Prisma)

File: `frontend/prisma/schema.prisma`

### Modelli principali

**User**
- id (cuid)
- name (String?)
- email (String, unique)
- emailVerified (DateTime?)
- image (String?)
- password (String?) — null per utenti Google OAuth
- role (UserRole: user | restaurant_admin | super_admin)
- suspended (Boolean, default false)
- createdAt, updatedAt

**Restaurant**
- id (cuid)
- name, slug (unique)
- description, address, city, phone, email
- status (RestaurantStatus: pending | approved | rejected)
- ownerId → User
- createdAt, updatedAt

**Account, Session, VerificationToken**
- Modelli standard NextAuth.js (obbligatori per @auth/prisma-adapter)

---

## 11. STATO NEXTAUTH

- Pacchetto installato: `next-auth@^4.24.14`
- Adapter installato: `@auth/prisma-adapter@^2.11.2`
- File API NON ancora creato: `frontend/src/app/api/auth/[...nextauth]/route.ts`
- Google OAuth: credenziali non ancora configurate
- Provider pianificati: Credentials (email+password) + Google

---

## 12. STATO EMAIL

- Nodemailer installato: `nodemailer@^7.0.13`
- SMTP previsto: Aruba — `smtps.aruba.it:465`
- Mittente ufficiale: `noreply@arrivoapp.it`
- File servizio NON ancora creato: `frontend/src/lib/email.ts`
- Verifica email: via link (NON codice 6 cifre)

---

## 13. SUPER ADMIN REALE

- Username: davide
- Email: davidetiano1985@gmail.com
- Ruolo: super_admin
- Password: da hashare con bcryptjs (NON inserire qui)
- Lo seed NON è ancora stato eseguito
- Il super admin deve poter cambiare username e password dal pannello admin
- NON lasciare credenziali hardcoded nel frontend

---

## 14. WORKFLOW REGISTRAZIONE UTENTI (da implementare)

1. Utente si registra con email+password o Google
2. Email di verifica inviata (link, non codice)
3. Utente clicca link → account attivo automaticamente
4. Nessuna approvazione admin necessaria per utenti normali

---

## 15. WORKFLOW REGISTRAZIONE RISTORANTI (da implementare)

1. Ristorante si registra con form dedicato
2. Stato automatico: `pending`
3. Super admin vede lista pending in `/admin/restaurants`
4. Super admin approva → stato diventa `approved` → ristorante visibile pubblicamente
5. Super admin può rifiutare → stato `rejected`

---

## 16. RUOLI E PERMESSI

| Ruolo | Accesso |
|---|---|
| `user` | App pubblica, profilo personale |
| `restaurant_admin` | Pannello ristorante assegnato |
| `super_admin` | Tutto — pannello admin, approvazioni, gestione utenti |

**Regola di sicurezza:** i controlli UI non bastano. Ogni permesso reale
deve essere validato lato server. Il frontend non è mai l'unica fonte di autorizzazione.

---

## 17. RESPONSIVE E UI

- **Priorità assoluta: mobile** (95% utenti da smartphone)
- Stile: nero/arancione premium
- Lingua UI: italiano
- Regole obbligatorie:
  - Niente scroll orizzontale su mobile
  - Niente tabelle desktop su smartphone (usare card verticali)
  - Bottoni e select touch-friendly
  - Testi lunghi, email, ID → `break-words`, `break-all`, `min-w-0`
  - `w-full`, `max-w-full`, `overflow-hidden` dove serve
  - Tabelle consentite solo da `lg` in su (desktop/tablet largo)

---

## 18. RESPONSABILITÀ AI

### Claude è responsabile di
- UI, UX, responsive, mobile-first
- Design premium e rifinitura visuale
- Testi e coerenza esperienza utente
- Stile italiano

### Codex è responsabile di
- Backend, deploy, git, build
- Bug tecnici, TypeScript
- Verifica errori tecnici
- Mantenimento workflow GitHub/VPS

---

## 19. REGOLE OPERATIVE (NON DEROGARE)

- Lavorare per micro-task (una feature alla volta)
- Evitare refactor enormi non richiesti
- NON modificare `package.json` senza motivo tecnico reale
- NON avviare localhost automaticamente
- NON usare porte 3000/3001 senza richiesta esplicita
- NON lanciare `next dev` o `next start` automaticamente
- NON fare commit di `.env.local`, file temporanei, PDF, worktree locali
- NON modificare il backend FastAPI per task frontend
- NON fare push senza conferma esplicita del task
- NON fare deploy senza conferma esplicita
- Mostrare file modificati prima del commit quando possibile
- Distinguere sempre: demo UI / dati demo / logica reale / persistenza reale

---

## 20. FILE DA NON COMMITTARE MAI

- `frontend/.env.local` — credenziali reali
- `frontend/node_modules/` — già in .gitignore
- `.claude/settings.local.json` — file locale del tool
- Qualsiasi file con password, token, segreti

---

## 21. PROSSIMI STEP PRIORITARI (in ordine)

### STEP A — Migrate database sulla VPS (BLOCCANTE per tutto il resto)
- SSH nella VPS
- Creare `/root/arrivo/frontend/.env.local` con DATABASE_URL reale
- Eseguire: `npx prisma generate`
- Eseguire: `npx prisma migrate dev --name init`
- Verificare che le tabelle esistano: User, Restaurant, Account, Session, VerificationToken

### STEP B — Seed super admin
- File da creare: `frontend/prisma/seed.ts`
- Crea utente davide con password hashata bcryptjs
- Ruolo: super_admin, emailVerified impostato
- Eseguire sulla VPS: `npx prisma db seed`

### STEP C — API auth Next.js
- `frontend/src/app/api/auth/[...nextauth]/route.ts`
- `frontend/src/app/api/auth/register/route.ts`
- `frontend/src/app/api/auth/verify/route.ts`

### STEP D — API ristoranti
- `frontend/src/app/api/restaurants/register/route.ts`
- `frontend/src/app/api/admin/restaurants/route.ts`

### STEP E — Servizio email
- `frontend/src/lib/email.ts`
- Nodemailer + Aruba SMTP
- Template verifica con link (NON codice 6 cifre)

### STEP F — Pagine frontend
- `frontend/src/app/login/page.tsx`
- `frontend/src/app/register/page.tsx`
- `frontend/src/app/register/restaurant/page.tsx`
- `frontend/src/app/verify-email/page.tsx`

### STEP G — Middleware protezione route
- `frontend/src/middleware.ts`
- Protegge `/admin/*` — richiede sessione + ruolo super_admin
- Redirect a `/login` se non autenticato

### STEP H — Aggiornamento UI admin con dati reali
- `frontend/src/app/admin/page.tsx` → dati reali da DB
- `frontend/src/app/admin/users/page.tsx` → dati reali da DB
- `frontend/src/app/admin/restaurants/page.tsx` → lista pending + approva/rifiuta

### STEP I — Deploy completo
- git pull sulla VPS
- npm run build
- pm2 restart arrivo

---

## 22. PROBLEMI TECNICI INCONTRATI E RISOLTI

### Prisma v7 — earlyAccess nel config
**Problema:** `earlyAccess: true` nel `prisma.config.js` causava errore di parsing
**Causa:** il parser Prisma usa `onExcessProperty: "error"` — proprietà non riconosciute bloccano il parsing
**Soluzione:** rimuovere `earlyAccess` dal config, non è una proprietà valida in `PrismaConfigShape`

### Prisma v7 — formato config file
**Problema:** file `.ts` e `.mjs` causavano "Failed to parse syntax of config file"
**Soluzione:** usare `.js` con CommonJS (`module.exports = { ... }`)

### Prisma v7 — DATABASE_URL non disponibile nel config
**Problema:** `process.env.DATABASE_URL` era `undefined` perché Prisma carica `.env.local` DOPO il config
**Soluzione:** usare `require('dotenv').config({ path: join(__dirname, '.env.local') })` nel config PRIMA del module.exports

### Prisma migrate — connessione rifiutata in locale
**Problema:** `P1001: Can't reach database server at localhost:5432` da Windows
**Causa:** PostgreSQL è sulla VPS, non sul PC Windows locale
**Soluzione:** eseguire `prisma migrate` SSH nella VPS

### .env.local.example in gitignore
**Problema:** il file `.env.local.example` veniva ignorato dal gitignore del frontend (pattern `.env*.local`)
**Soluzione:** `git add -f frontend/.env.local.example` (force add, è solo template)

---

## 23. COMMIT RILEVANTI (cronologia)

| Hash | Descrizione |
|---|---|
| `7f1da59` | Update project source of truth |
| `6beceb7` | Add Prisma schema, env template and auth packages |
| `35041b5` | Add Prisma v7 config file |

---

## 24. NOTE FINALI

- Leggere sempre PROJECT_STATUS.md prima di iniziare task importanti
- Se una richiesta contraddice questo file o PROJECT_STATUS.md, chiarire prima
- Aggiornare questo file quando cambiano stato infrastruttura, deploy, o decisioni tecniche
- Preferire task piccoli, reversibili, committabili
- Il frontend Next.js è l'unico sistema in produzione — proteggilo sempre
- Non rompere il deploy: ogni modifica deve passare `npm run build` senza errori
