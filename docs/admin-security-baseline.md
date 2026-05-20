# Admin Security Baseline — Arrivo

> Ultimo aggiornamento: 2026-05-20

---

## 1. Ruoli e autorizzazioni

| Ruolo         | Livello | Accesso admin |
|---------------|---------|---------------|
| `cliente`     | 0       | Nessuno        |
| `ristoratore` | 1       | Nessuno        |
| `admin`       | 2       | Futuro (non ancora usato) |
| `super_admin` | 3       | Completo       |

**Tutte** le route `/api/admin/*` e le pagine `/admin/*` richiedono il ruolo `super_admin`.

---

## 2. Codici HTTP per autenticazione/autorizzazione

| Situazione                              | HTTP |
|-----------------------------------------|------|
| JWT assente, scaduto o invalidato       | 401  |
| JWT valido ma ruolo insufficiente       | 403  |

> **Regola:** non restituire mai 401 se l'utente è autenticato. Il 401 è riservato ai non-autenticati.

---

## 3. Helper RBAC centralizzato

File: `frontend/src/lib/admin-auth.ts`

### Funzioni esportate

#### `requireSuperAdmin(req: NextRequest): Promise<AuthResult>`

Verifica JWT + ruolo `super_admin`. Usata in tutte le route admin API.

```typescript
const auth = await requireSuperAdmin(req)
if (!auth.ok) return auth.response  // 401 o 403
// auth.token.id, auth.token.email, auth.token.role disponibili
```

#### `requireAdmin(req: NextRequest): Promise<AuthResult>`

Come sopra, ma accetta anche il ruolo `admin` (usata per funzionalità di secondo livello).

#### `getCurrentAdminToken(req): Promise<AdminToken | null>`

Ritorna il token senza enforcing di ruolo. Usata per arricchire risposte opzionali.

#### `logAdminAction(params): Promise<void>`

Scrive una voce immutabile nel log di audit (`AdminLog`). Fire-and-forget — non blocca mai l'azione admin.

```typescript
await logAdminAction({
  adminToken:   auth.token,
  targetEmail:  user.email,
  targetId:     user.id,       // opzionale
  action:       'suspend_user',
  details:      JSON.stringify({ reason }),  // opzionale
})
```

---

## 4. Protezione layout admin (Server Component)

File: `frontend/src/app/admin/layout.tsx`

```typescript
const session = await getServerSession(authOptions)
if (!session)                                    return <AccessoNegato tipo="non_autenticato" />
if (role !== 'super_admin')                      return <AccessoNegato tipo="non_autorizzato" />
```

Il layout è la prima linea di difesa per tutte le pagine `/admin/*`.  
Le singole pagine eseguono un controllo ridondante come difesa in profondità.

---

## 5. Protezione route API admin

Tutte le route in `frontend/src/app/api/admin/**` usano `requireSuperAdmin` dall'helper centralizzato.

| Route                              | Metodi  | Auth richiesta  |
|------------------------------------|---------|-----------------|
| `/api/admin/alerts`                | GET POST | super_admin    |
| `/api/admin/cleanup`               | POST    | super_admin **o** `CLEANUP_SECRET` header (cron) |
| `/api/admin/events`                | GET     | super_admin    |
| `/api/admin/health`                | GET     | super_admin    |
| `/api/admin/health/deploy`         | GET     | super_admin    |
| `/api/admin/search`                | GET     | super_admin    |
| `/api/admin/stats`                 | GET     | super_admin    |
| `/api/admin/stream`                | GET (SSE)| super_admin   |
| `/api/admin/system/auth-health`    | GET     | super_admin    |

> **Nessuna route admin è anonima.**  
> `cleanup` accetta anche il secret header per l'uso da cron VPS — il secret non è nel codice sorgente.

---

## 6. Token JWT — campi rilevanti per la sicurezza

| Campo          | Tipo    | Descrizione |
|----------------|---------|-------------|
| `id`           | string  | UUID utente |
| `role`         | string  | Ruolo corrente (dal DB) |
| `email`        | string  | Email utente |
| `tokenVersion` | number  | Incrementato per forced-logout |
| `invalid`      | boolean | `true` se sessione invalidata (suspended/revoked) |
| `sessionCheck` | number  | Timestamp ultimo controllo DB (ogni 5 min) |

`requireSuperAdmin` rigetta i token con `token.invalid === true` con **401** (non 403), perché la sessione è tecnicamente non più valida.

---

## 7. Protezione variabili d'ambiente di produzione

Script: `scripts/validate-production-env.js`  
Integrazione: `scripts/deploy.sh` (step 5b)

**Variabili obbligatorie** — deploy bloccato se mancanti:
- `NODE_ENV` (deve essere esattamente `"production"`)
- `DATABASE_URL`
- `NEXTAUTH_URL`
- `NEXTAUTH_SECRET`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`

**Variabili consigliate** — warning ma non bloccante:
- `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`

Il validatore mostra solo valori mascherati (`abc...xyz`) — mai i valori reali nei log.

---

## 8. Audit log (AdminLog)

Ogni azione admin sensibile deve essere loggata tramite `logAdminAction()`.

Campi obbligatori del modello:
- `adminEmail` — chi ha eseguito l'azione
- `targetEmail` — su chi (o cosa) ha agito
- `action` — stringa descrittiva (es. `"suspend_user"`, `"resolve_alert"`)

Campi opzionali:
- `adminId`, `targetId` — FK verso `User` (SetNull on delete — l'audit sopravvive alla cancellazione utente)
- `details` — JSON o testo libero (no dati sensibili)

---

## 9. Regole generali

1. **Nessun segreto nei log.** Password, token, credenziali OAuth non compaiono mai in `console.log` o risposte API.
2. **Nessun bypass del middleware.** Non usare `getServerSession` raw nelle API route — usare sempre l'helper.
3. **Difesa in profondità.** Layout + Page + API route proteggono lo stesso accesso in modo indipendente.
4. **Fail-safe.** In caso di errore DB durante il check di sospensione, il token rimane valido (fail-open) — meglio un accesso extra che bloccare tutti gli utenti.
5. **NODE_ENV=production obbligatorio.** Verificato sia nel deploy script (hardcoded) che dal validatore env.
