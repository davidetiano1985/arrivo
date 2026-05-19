# ARRIVO — HANDOFF AUTH + ADMIN + REGISTRAZIONE
UPDATED: 2026-05-18

---

## ISTRUZIONI PER NUOVA CHAT

- Leggere questo file prima di fare qualsiasi domanda.
- Non chiedere OS: utente usa Windows.
- Non chiedere IP VPS, dominio, percorso, database, email, PM2: sono tutti qui.
- Dare un comando alla volta.
- Spiegazioni semplici, niente muri di testo.
- Prima diagnosi, poi fix.
- Non fare tentativi casuali sulla VPS.

---

## UTENTE / OWNER

Nome: Davide Tiano
Email personale: davidetiano1985@gmail.com
Super admin email: admin@arrivoapp.it
Nome super admin: Davide Tiano
Password super admin: NON salvata qui — inserita solo sulla VPS.

Preferenze:
- Windows + Windows Terminal / PowerShell
- istruzioni semplici
- una cosa alla volta
- log finali copiabili per ChatGPT

---

## SSH / VPS

```
ssh root@209.227.239.83
```

Provider: Aruba Cloud VPS
Nome: davide-vps
IP: 209.227.239.83
OS: Ubuntu 22.04
Utente SSH: root
Prompt: root@davide-vps

Repo path VPS: /root/arrivo
Frontend path VPS: /root/arrivo/frontend

---

## DOMINIO / PRODUZIONE

https://arrivoapp.it

Sito online: SÌ
Build: SUCCESS
PM2: ONLINE

---

## STACK

| Layer | Tecnologia |
|-------|-----------|
| Frontend | Next.js 14, React 18, TypeScript, Tailwind CSS, App Router |
| Auth | NextAuth v4 + @auth/prisma-adapter |
| Database | PostgreSQL su VPS Aruba |
| ORM | Prisma 7.8.0 + @prisma/adapter-pg |
| Email | Nodemailer + SMTP Aruba |
| Password | bcryptjs |
| Infrastruttura | Ubuntu 22.04, PM2, Nginx, VPS Aruba |
| Node | v20.20.2 |
| npm | 10.8.2 |

---

## GITHUB

Repo: https://github.com/davidetiano1985/arrivo
Branch produzione: main
Ultimo commit pushato: 3caf02d

Workflow deploy:
1. lavoro locale / Claude / Codex
2. git commit
3. git push origin main
4. VPS: git pull
5. se package cambia: npm install
6. npm run build
7. pm2 restart arrivo

---

## PM2

Processo: arrivo

Comandi:
```bash
pm2 list
pm2 restart arrivo
pm2 logs arrivo --lines 100
```

Nota: npm start manuale dà EADDRINUSE perché PM2 usa già porta 3000. Non è un errore grave.

---

## DATABASE POSTGRESQL

```
Database:  arrivo_db
Utente:    arrivo_user
Password:  Joker.2026
Host:      localhost
Porta:     5432

DATABASE_URL=postgresql://arrivo_user:Joker.2026@localhost:5432/arrivo_db
```

Controllo tabelle:
```bash
psql -h localhost -U arrivo_user -d arrivo_db -c "\dt"
```

Permesso già assegnato:
```sql
ALTER USER arrivo_user CREATEDB;
```
(necessario per prisma migrate dev con shadow database)

Tabelle create dalla migrate: SÌ (migrate dev --name init eseguita con successo)

---

## EMAIL

Casella: noreply@arrivoapp.it
Provider: Aruba
Webmail: https://webmail.aruba.it

```
SMTP_HOST=smtps.aruba.it
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=noreply@arrivoapp.it
SMTP_FROM="Arrivo <noreply@arrivoapp.it>"
```

Password SMTP: presente in .env.local sulla VPS. NON mostrarla in chat/file.

---

## ENV

File presenti sulla VPS:
- /root/arrivo/frontend/.env.local
- /root/arrivo/frontend/.env

Prisma CLI usa .env.
Non fare `cat` dei file env.

Controlli sicuri:
```bash
ls -la /root/arrivo/frontend/.env.local
grep -c "DATABASE_URL" /root/arrivo/frontend/.env.local
```

Caricare env nel terminale:
```bash
cd /root/arrivo/frontend
set -a && source .env && set +a
```

Variabili richieste in .env.local:
```
DATABASE_URL=postgresql://arrivo_user:PASSWORD@localhost:5432/arrivo_db
NEXTAUTH_SECRET=<openssl rand -base64 32>
NEXTAUTH_URL=https://arrivoapp.it
GOOGLE_CLIENT_ID=           # vuoto per ora
GOOGLE_CLIENT_SECRET=       # vuoto per ora
SMTP_HOST=smtps.aruba.it
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=noreply@arrivoapp.it
SMTP_PASS=<password casella Aruba>
SMTP_FROM="Arrivo <noreply@arrivoapp.it>"
```

---

## PRISMA 7

Schema: frontend/prisma/schema.prisma
Config: frontend/prisma.config.ts
Seed: frontend/prisma/seed-super-admin.cjs

### prisma.config.ts (contenuto attuale)
```typescript
import { defineConfig, env } from 'prisma/config'

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    seed: 'node prisma/seed-super-admin.cjs',
  },
  datasource: {
    url: env('DATABASE_URL'),
  },
})
```

### schema.prisma (generator attuale)
```prisma
generator client {
  provider        = "prisma-client-js"
  previewFeatures = ["driverAdapters"]
}

datasource db {
  provider = "postgresql"
}
```

IMPORTANTE: schema.prisma NON ha `url` nel datasource. Viene letta da prisma.config.ts.
NON aggiungere `url` a schema.prisma.

### Enum UserRole (allineato e bloccato)
```prisma
enum UserRole {
  super_admin
  gestore_locale
  manager
  staff
  cliente
}
```

Default: `cliente`

NON usare più: `user`, `admin`, `restaurant_admin`

### Comandi Prisma sulla VPS
```bash
cd /root/arrivo/frontend
npx prisma generate
npx prisma migrate deploy
npx prisma db seed
```

NON usare `prisma migrate dev` in produzione.

---

## SEED SUPER ADMIN

File: frontend/prisma/seed-super-admin.cjs

Stato: FUNZIONANTE
Super admin creato: admin@arrivoapp.it | role: super_admin

Comando per eseguire:
```bash
cd /root/arrivo/frontend
export DATABASE_URL="postgresql://arrivo_user:Joker.2026@localhost:5432/arrivo_db"
SUPER_ADMIN_EMAIL="admin@arrivoapp.it" \
SUPER_ADMIN_NAME="Davide Tiano" \
SUPER_ADMIN_PASSWORD="<password>" \
npx prisma db seed
```

Il seed usa @prisma/adapter-pg con `new PrismaPg({ connectionString })`.
È idempotente: se l'utente esiste lo aggiorna, se non esiste lo crea.

---

## AUTH — STATO ATTUALE: REALE E FUNZIONANTE

### Login reale: SÌ
- /login usa NextAuth CredentialsProvider
- bcrypt.compare su User.password dal DB
- Sessione JWT reale
- Redirect a /admin dopo login corretto
- Messaggio errore se credenziali sbagliate

### Sessione: SÌ
- NextAuth v4 con strategy JWT
- Token include: id, email, name, role
- SessionProvider avvolge l'app in layout.tsx

### Protezione admin: SÌ
- admin/layout.tsx usa getServerSession(authOptions)
- Se non autenticato → AccessoNegato (tipo: non_autenticato)
- Se ruolo ≠ super_admin → AccessoNegato (tipo: non_autorizzato)
- currentDemoUser NON viene più usato per guard admin

---

## FILE AUTH CHIAVE

| File | Descrizione |
|------|-------------|
| src/lib/prisma.ts | Singleton PrismaClient con adapter-pg |
| src/lib/auth.ts | NextAuth authOptions (CredentialsProvider, JWT, PrismaAdapter) |
| src/app/api/auth/[...nextauth]/route.ts | NextAuth route handler |
| src/components/SessionProvider.tsx | Client wrapper SessionProvider |
| src/app/layout.tsx | Root layout con SessionProvider |
| src/app/login/page.tsx | Login reale con signIn("credentials") |
| src/app/admin/layout.tsx | Guard reale con getServerSession |

---

## ADMIN — STATO ATTUALE: REALE E FUNZIONANTE

### /admin (dashboard)
- Server component async
- Mostra nome e ruolo dalla sessione reale
- Conta utenti reali: totali, attivi, sospesi (via prisma.user.count)
- Nessun dato demo

### /admin/users
- Server component async
- Lista utenti reali dal DB (prisma.user.findMany)
- Mostra: nome, email, ruolo (badge colorato), stato (attivo/sospeso), data registrazione
- Card mobile + tabella desktop

### Gestione utenti reale: SÌ (commit 3caf02d)

**Modifica ruolo:**
- Select dropdown per ogni utente
- Chiama Server Action aggiornaRuolo()
- Aggiorna DB in tempo reale
- revalidatePath('/admin/users')

**Sospendi/Riattiva:**
- Bottone per ogni utente
- Chiama Server Action togglaSospensione()
- Aggiorna campo suspended nel DB
- Confirm dialog prima dell'azione

**Self-protection:**
- Super admin NON può sospendere se stesso (bottone disabilitato)
- Super admin NON può togliere ruolo super_admin a se stesso (alert + blocco)
- Verifiche sia lato client che lato server (Server Action)

**File gestione utenti:**
- src/app/admin/users/actions.ts — Server Actions
- src/app/admin/users/UserActions.tsx — Client component controlli
- src/app/admin/users/page.tsx — Server component pagina

---

## RUOLI DEFINITIVI (nomenclatura BLOCCATA)

| Ruolo | Descrizione |
|-------|-------------|
| super_admin | Amministratore piattaforma |
| gestore_locale | Proprietario/gestore del locale food |
| manager | Manager operativo del locale |
| staff | Personale del locale |
| cliente | Utente finale — ruolo iniziale automatico |

---

## COMMIT STORIA SESSIONE

| Hash | Descrizione |
|------|-------------|
| b0aa0b5 | Add auth pages, Prisma 7 config, updated schema and admin UI |
| 76b9ede | Fix seed: remove Prisma DMMF introspection, use direct upsert |
| 61775ab | Fix PrismaClient constructor: pass datasourceUrl explicitly |
| f79e29c | Fix seed: use PrismaPg adapter with pg.Pool |
| 299e110 | Add driverAdapters previewFeature, fix PrismaPg constructor |
| 439105e | Implement real NextAuth login with credentials and Prisma adapter |
| a818c96 | Fix TypeScript cast in jwt callback for user role |
| 27b6dd7 | Replace demo admin pages with real Prisma data from DB |
| **3caf02d** | **Add real user management: role update and suspend/reactivate** |

Ultimo commit pushato: **3caf02d** ← stato attuale di origin/main e VPS

---

## STATO ATTUALE PAGINE

| Pagina | Stato |
|--------|-------|
| / | Online (demo UI) |
| /login | Reale — NextAuth credentials |
| /admin | Reale — dati DB, sessione reale |
| /admin/users | Reale — utenti DB, modifica ruolo, sospendi/riattiva |
| /registrati | UI demo — nessuna logica reale |
| /registrati/locale | UI demo — nessuna logica reale |
| /verifica-email | UI statica |
| /email-verificata | UI statica |
| /registrazione-locale-inviata | UI statica |

---

## DIFFERENZA DEMO / REALE

| Cosa | Demo | Reale (attuale) |
|------|------|-----------------|
| Utente corrente | currentDemoUser costante | getServerSession() |
| Guard admin | early return su ruolo demo | getServerSession + JWT |
| Ruoli | selectedRoles useState | DB PostgreSQL |
| Stato utenti | userStatuses useState | DB suspended field |
| Login | UI visiva, nessuna azione | NextAuth signIn |
| Registrazione | UI visiva, nessuna azione | DA FARE |
| Email verifica | pagina statica | DA FARE |
| Google OAuth | non configurato | DA FARE |

---

## PROSSIMI STEP

1. **Registrazione utenti reale**
   - Form /registrati → Server Action
   - Crea User con ruolo cliente
   - Hash password con bcrypt
   - Invia email di verifica con Nodemailer

2. **Email verifica**
   - Token di verifica in DB (VerificationToken model già in schema)
   - Route /api/auth/verify?token=...
   - Aggiorna emailVerified nel DB

3. **Google OAuth**
   - Aggiungere GoogleProvider in authOptions
   - Configurare Google Cloud Console
   - Callback: https://arrivoapp.it/api/auth/callback/google

4. **Registrazione locale (gestore_locale)**
   - Form /registrati/locale
   - Crea richiesta con status pending
   - Notifica super_admin
   - Workflow approvazione in /admin

---

## COMANDI SICURI USATI SPESSO

```bash
cd /root/arrivo
cd /root/arrivo/frontend
git status
git pull
npm install
npm run build
npx prisma generate
pm2 list
pm2 restart arrivo
pm2 logs arrivo --lines 100
psql -h localhost -U arrivo_user -d arrivo_db -c "\dt"
```

---

## FORMATO LOG FINALE AI

```
DIGLI A CHATGPT
- operazione eseguita:
- file toccati:
- errori sì/no:
- hash commit:
- prossimo comando:
- note:
```

Regole: ultimo blocco della risposta, copiabile, massimo 8-10 righe.

---

## ERRORI GIÀ RISOLTI (non riproporre)

1. EADDRINUSE su npm start → PM2 usa già porta 3000, non è errore
2. prisma migrate deploy → datasource.url required → fix: prisma.config.ts + .env
3. DATABASE_URL mancante → fix: set -a && source .env && set +a
4. SMTP_FROM con spazi rompe export → fix: source .env non grep
5. migrate dev → shadow DB permission denied → fix: ALTER USER arrivo_user CREATEDB
6. seed → Unable to read User fields from Prisma metadata → fix: seed riscritto senza DMMF
7. PrismaClient needs non-empty options → fix: adapter-pg richiesto
8. Unknown property datasourceUrl → fix: usare { adapter } non { datasourceUrl }
9. prisma.user undefined → fix: previewFeatures=["driverAdapters"] in generator
10. TypeScript: Conversion of type User|AdapterUser → fix: doppio cast as unknown as
