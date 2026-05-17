# Arrivo — Riepilogo progetto per nuova chat

## Identità progetto

Arrivo è una piattaforma food-tech mobile-first.
Discovery, prenotazione, ordine e gestione operativa in un'unica app.
Supporta qualsiasi locale food: ristoranti, creperie, bakery, pub, sushi bar, street food ecc.

Dominio pubblico: https://arrivoapp.it
Repository: GitHub → VPS Aruba

---

## Stato attuale reale

- homepage online (demo)
- `/admin` online (demo, guard demo attivo)
- `/admin/users` online (demo)
- `/login`, `/registrati`, `/registrati/locale` online (UI demo, nessuna logica reale)
- `/verifica-email`, `/email-verificata`, `/registrazione-locale-inviata` online (UI demo)
- auth reale: NON implementata
- database: schema pronto, migrate NON eseguita, DB VPS NON toccato
- backend: scaffold esistente ma non collegato al frontend

---

## Stack tecnico

| Layer | Tecnologia |
|-------|-----------|
| Frontend | Next.js 14, React 18, TypeScript, Tailwind CSS, App Router |
| Auth (futuro) | NextAuth v4 + @auth/prisma-adapter |
| Database | PostgreSQL su VPS Aruba |
| ORM | Prisma 7 |
| Email | Nodemailer + SMTP Aruba (noreply@arrivoapp.it) |
| Password | bcryptjs |
| Infrastruttura | Ubuntu 22.04, PM2, Nginx, VPS Aruba |

---

## Ruoli definitivi (nomenclatura BLOCCATA)

| Ruolo | Descrizione |
|-------|-------------|
| `super_admin` | Amministratore piattaforma |
| `gestore_locale` | Proprietario/gestore del locale food |
| `manager` | Manager operativo del locale |
| `staff` | Personale del locale |
| `cliente` | Utente finale — ruolo iniziale automatico |

Regola: NON usare `user`, `restaurant_admin`, `admin`. Sono obsoleti.

---

## Decisioni architetturali importanti

### Sistema utenti unificato
- un solo login/registrazione per tutti
- ruolo iniziale automatico: `cliente`
- il `super_admin` cambia ruolo dal pannello admin
- al login successivo l'utente vede il pannello corretto per il suo ruolo

### Prisma 7
- `schema.prisma` NON ha `url` nel datasource (solo `provider = "postgresql"`)
- `DATABASE_URL` viene letta da `frontend/prisma.config.ts`
- NON aggiungere `url` a schema.prisma

### Model Restaurant
- NON rinominare in `Locale` prima della prima migrate
- ha campo `tipo String?` per classificare il tipo di locale
- `status`: `pending / approved / rejected`

### Guard admin (demo)
- `currentDemoUser` in `frontend/src/data/currentUser.ts`
- se `null` → "Accedi per continuare"
- se ruolo ≠ `super_admin` → "Accesso negato"
- facilmente sostituibile con `getServerSession()` NextAuth

---

## Stato auth

- `currentDemoUser` = costante statica demo (Davide Tiano, super_admin)
- per simulare "non autenticato": impostare `currentDemoUser = null`
- per simulare ruolo diverso: cambiare `.find()` in `currentUser.ts`
- NextAuth NON implementato
- Nessun session reale, nessun middleware, nessun JWT

---

## Stato Prisma

- `frontend/prisma/schema.prisma` — schema allineato, pronto
- `frontend/prisma.config.ts` — creato, legge DATABASE_URL
- `npm install` NON eseguito in locale con i nuovi pacchetti (prisma, next-auth, bcryptjs ecc.)
- migrate NON ancora eseguita
- DB VPS NON ancora toccato

### Comandi per la migrate (SOLO sulla VPS)
```bash
cd /root/arrivo/frontend
npm install
npx prisma generate
npx prisma migrate deploy
```

---

## Stato frontend (file principali)

```
frontend/src/
  app/
    page.tsx                          homepage
    login/page.tsx                    login UI demo
    registrati/page.tsx               registrazione cliente UI demo
    registrati/locale/page.tsx        registrazione locale UI demo
    verifica-email/page.tsx           stato verifica email
    email-verificata/page.tsx         email verificata
    registrazione-locale-inviata/     conferma richiesta locale
    admin/
      layout.tsx                      guard demo + sidebar
      page.tsx                        pannello super admin demo
      users/page.tsx                  gestione utenti demo
  components/
    AccessoNegato.tsx                 componente riutilizzabile accesso negato
  data/
    currentUser.ts                    utente demo corrente (nullable)
    users.ts                          dati utenti demo
    restaurants.ts                    dati ristoranti demo
frontend/prisma/
  schema.prisma                       schema Prisma allineato
frontend/
  prisma.config.ts                    config Prisma 7
  .env.local.example                  template variabili ambiente
```

---

## Regole operative (da rispettare sempre)

- lavorare per micro-task
- mobile-first sempre
- UI in italiano
- stile nero/arancione (#ff6b00) coerente
- NON avviare localhost automaticamente
- NON usare porte 3000/3001
- NON fare commit senza conferma
- NON fare push senza conferma
- NON toccare .env.local
- NON toccare package.json senza motivo
- NON fare refactor enormi
- distinguere sempre: demo UI / dati demo / logica reale / persistenza reale

---

## Cose da NON fare

- NON aggiungere `url` a datasource in schema.prisma
- NON rinominare `Restaurant` in `Locale` prima della prima migrate
- NON usare `prisma migrate dev` in produzione
- NON eseguire migrate senza DB vergine
- NON collegare database finché il frontend demo non è stabile
- NON introdurre Context globale o Provider inutili
- NON usare localStorage per auth demo
- NON creare middleware Next.js finché NextAuth non è implementato

---

## Workflow VPS/deploy

```
Codex/Claude → GitHub → VPS → build → pm2 restart
```

```bash
# sulla VPS
cd /root/arrivo
git pull

cd /root/arrivo/frontend
npm run build
pm2 restart arrivo
```

---

## Prossimi step consigliati

1. **npm install sulla VPS** con tutti i nuovi pacchetti
2. **Prima migrate Prisma** (`prisma migrate deploy` su DB vergine)
3. **Implementare NextAuth** — route `/api/auth/[...nextauth]`, session provider
4. **Collegare login reale** — form `/login` → NextAuth signIn
5. **Collegare registrazione** — Server Action o API route
6. **Protezione route reale** — middleware Next.js con session check
7. **Pannelli operativi** per ruolo (gestore_locale, manager, staff)

---

## Differenza demo / reale

| Cosa | Demo | Reale |
|------|------|-------|
| Utente corrente | `currentDemoUser` costante | `getServerSession()` |
| Guard admin | early return su `ruolo !== super_admin` | middleware + session |
| Ruoli | `selectedRoles` useState | DB PostgreSQL |
| Stato utenti | useState locale | DB + API |
| Login | UI visiva, nessuna azione | NextAuth signIn |
| Registrazione | UI visiva, nessuna azione | Server Action + DB |
| Email verifica | pagina statica | Nodemailer + token DB |
| Approvazione locale | pagina statica | workflow super_admin |
