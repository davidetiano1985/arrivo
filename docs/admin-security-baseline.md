# Admin Security Baseline — Arrivo

> Ultimo aggiornamento: 2026-05-20 (revisione 2 — audit logging completo)

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

## 3. Matrice RBAC definitiva — API admin

| Route                              | Metodo    | Ruolo richiesto           | Audit log                     | Note |
|------------------------------------|-----------|---------------------------|-------------------------------|------|
| `/api/admin/alerts`                | GET       | `super_admin`             | No (polling frequente)        | Lettura alert stored + computed |
| `/api/admin/alerts`                | POST      | `super_admin`             | ✓ `admin.alert.resolve/create` | Azioni sensibili |
| `/api/admin/cleanup`               | POST      | `super_admin` o cron secret | ✓ `admin.cleanup.run`        | Distruttivo; cron loggato con `cron@system` |
| `/api/admin/events`                | GET       | `super_admin`             | No (polling frequente)        | Login events stream |
| `/api/admin/health`                | GET       | `super_admin`             | No (polling ogni 60s)         | Metriche di sistema |
| `/api/admin/health/deploy`         | GET       | `super_admin`             | No (polling)                  | Stato ultimo deploy |
| `/api/admin/search`                | GET       | `super_admin`             | ✓ `admin.search`              | Solo se q ≥ 2 chars |
| `/api/admin/stats`                 | GET       | `super_admin`             | No (polling ogni 30s)         | Stats dashboard |
| `/api/admin/stream`                | GET (SSE) | `super_admin`             | No (connessione persistente)  | Server-Sent Events |
| `/api/admin/system/auth-health`    | GET       | `super_admin`             | ✓ `admin.auth_health.view`    | Stato config OAuth |

> **Nessuna route admin è anonima.**  
> `cleanup` accetta il secret header per cron VPS — il secret non è nel codice sorgente.  
> 403 (autenticato ma ruolo sbagliato) viene loggato automaticamente come `admin.access.denied`.

---

## 4. Protezione pagine admin (Server Components)

Tutte le pagine `/admin/**` sono protette a **due livelli**:

### Layout (prima linea di difesa)

File: `frontend/src/app/admin/layout.tsx`

```typescript
const session = await getServerSession(authOptions)
if (!session)               return <AccessoNegato tipo="non_autenticato" />
if (role !== 'super_admin') return <AccessoNegato tipo="non_autorizzato" />
```

### Guard in-page (difesa in profondità)

Ogni `page.tsx` sotto `/admin/**` esegue un controllo indipendente:

```typescript
const session = await getServerSession(authOptions)
if (!session || (session.user as { role?: string })?.role !== 'super_admin') redirect('/login')
```

| Pagina                            | Guard in-page | Note |
|-----------------------------------|---------------|------|
| `/admin`                          | ✓             | Verifica role !== super_admin |
| `/admin/alert`                    | ✓             | |
| `/admin/clienti`                  | ✓             | |
| `/admin/control-plane`            | ✓             | |
| `/admin/deploy`                   | ✓             | |
| `/admin/eventi`                   | ✓             | |
| `/admin/impostazioni`             | ✓             | |
| `/admin/intelligence`             | ✓             | |
| `/admin/log`                      | ✓             | |
| `/admin/observability`            | ✓             | |
| `/admin/richieste`                | ✓             | Corretto: aggiunto `!session ||` |
| `/admin/ristoranti`               | ✓             | |
| `/admin/ristoranti/[id]`          | ✓             | |
| `/admin/ristoranti/create`        | ✓             | |
| `/admin/sicurezza`                | ✓             | |
| `/admin/system-health`            | ✓             | |
| `/admin/users`                    | ✓             | |
| `/admin/users/[id]`               | ✓             | Corretto: aggiunto guard mancante |
| `/admin/users/create`             | ✓             | Corretto: aggiunto guard mancante |
| `/admin/users/[id]/impersonate`   | ✓             | |

---

## 5. Helper RBAC centralizzato

File: `frontend/src/lib/admin-auth.ts`

### Funzioni esportate

#### `requireSuperAdmin(req: NextRequest): Promise<AuthResult>`

Verifica JWT + ruolo `super_admin`. Loggа automaticamente i 403.

```typescript
const auth = await requireSuperAdmin(req)
if (!auth.ok) return auth.response  // 401 o 403
// auth.token.id, auth.token.email, auth.token.role disponibili
```

#### `requireAdmin(req: NextRequest): Promise<AuthResult>`

Come sopra, ma accetta anche il ruolo `admin`.

#### `getCurrentAdminToken(req): Promise<AdminToken | null>`

Ritorna il token senza enforcing di ruolo.

#### `logAdminAction(params): Promise<void>`

Scrive una voce immutabile nel registro `AdminLog`. Fire-and-forget.

```typescript
logAdminAction({
  adminToken:   auth.token,
  targetEmail:  user.email,
  targetId:     user.id,       // opzionale
  action:       'admin.user.suspend',
  details:      JSON.stringify({ reason }),
}).catch(() => {})
```

#### `_logDeniedAccess` (interno)

Chiamato automaticamente da `requireSuperAdmin`/`requireAdmin` per ogni 403. Non loggare i 401 anonimi (spam DB).

---

## 6. Convenzione nomi azioni audit log

| Pattern                           | Significato |
|-----------------------------------|-------------|
| `admin.access.denied`             | 403 — utente autenticato ma non super_admin |
| `admin.auth_health.view`          | Visualizzazione config OAuth |
| `admin.alert.resolve`             | Alert risolto |
| `admin.alert.create`              | Alert creato manualmente |
| `admin.cleanup.run`               | Job cleanup eseguito |
| `admin.search`                    | Ricerca admin eseguita |
| `ROLE_CHANGE`                     | Cambio ruolo utente |
| `SUSPEND` / `UNSUSPEND`           | Sospensione/riattivazione utente |
| `DELETE_USER`                     | Eliminazione utente |
| `RESET_PASSWORD`                  | Reset password |
| `RESET_LOGIN_ATTEMPTS`            | Reset tentativi login |
| `CREATE_USER`                     | Creazione utente |
| `APPROVA_RICHIESTA`               | Approvazione richiesta locale |
| `RIFIUTA_RICHIESTA`               | Rifiuto richiesta locale |
| `RESOLVE_ALERT`                   | (legacy) Alert risolto |
| `FORCE_LOGOUT`                    | Forced logout utente |

---

## 7. Token JWT — campi rilevanti per la sicurezza

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

## 8. Protezione variabili d'ambiente di produzione

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

## 9. Regole generali

1. **Nessun segreto nei log.** Password, token, credenziali OAuth non compaiono mai in `console.log` o risposte API.
2. **Helper sempre usato.** Non usare `getToken` raw nelle API route — usare `requireSuperAdmin`.
3. **Difesa in profondità.** Layout + Page + API route proteggono lo stesso accesso in modo indipendente.
4. **Fail-safe.** In caso di errore DB durante il check di sospensione, il token rimane valido (fail-open).
5. **NODE_ENV=production obbligatorio.** Verificato sia nel deploy script (hardcoded) che dal validatore env.
6. **AdminLog è create-only.** Nessuna route espone update/delete di AdminLog.
7. **403 loggati automaticamente.** `requireSuperAdmin` logga ogni tentativo di accesso non autorizzato.
8. **401 anonimi non loggati.** Evitare spam DB da bot/scanner.
