# Auth Manual Test Checklist — Arrivo

> Ultimo aggiornamento: 2026-05-21  
> Da eseguire dopo ogni deploy che tocchi auth.ts, middleware.ts, o pagine auth.

---

## Come usarla

Spunta ogni voce manualmente in un browser reale (o Playwright).  
**Non segnare OK senza test reale.** Indicare sempre l'esito: ✅ OK / ❌ BROKEN / ⏭ NON ESEGUITO.

---

## 1 — Registrazione email

| # | Test | Atteso | Esito |
|---|------|--------|-------|
| 1.1 | `/registrati` con Nome/Cognome/Email nuova/Password valida | Redirect a `/verifica-email`, **nessun** "Qualcosa è andato storto" | |
| 1.2 | Email già registrata | Banner rosso "già registrata", link "→ Vai al login" | |
| 1.3 | Password < 8 caratteri | Errore chiaro, nessun crash | |
| 1.4 | Campi obbligatori vuoti | Browser native required validator | |
| 1.5 | Doppio click su "Crea account" | Una sola richiesta inviata | |

---

## 2 — Login email/password

| # | Test | Atteso | Esito |
|---|------|--------|-------|
| 2.1 | Email verificata + password corretta (ruolo `cliente`) | Redirect a `/` | |
| 2.2 | Email verificata + password corretta (ruolo `super_admin`) | Redirect a `/admin` | |
| 2.3 | Email verificata + password corretta (ruolo `gestore_locale`) | Redirect a `/ristorante` | |
| 2.4 | Password errata | "Email o password non corretti." | |
| 2.5 | Email non verificata | Login bloccato (nessun accesso) | |
| 2.6 | Account sospeso | Login bloccato | |

---

## 3 — Google signup (nuovo utente)

| # | Test | Atteso | Esito |
|---|------|--------|-------|
| 3.1 | Google OAuth con account che fornisce `given_name` + `family_name` | `profileIncomplete=false`, redirect `/`, header "Nome Cognome" | |
| 3.2 | Google OAuth con account che NON fornisce nome separato | `profileIncomplete=true`, redirect `/completa-profilo` | |
| 3.3 | Completa profilo su `/completa-profilo` | `profileIncomplete=false`, sessione aggiornata, redirect `/`, header "Nome Cognome" | |
| 3.4 | Accesso a `/profilo` con profilo incompleto | Redirect a `/completa-profilo` (307, server-side) | |
| 3.5 | Accesso a `/completa-profilo` con profilo completo | Redirect a `/` (307) | |

---

## 4 — Google login (utente esistente)

| # | Test | Atteso | Esito |
|---|------|--------|-------|
| 4.1 | Google con email già registrata via email/password | Collega account, nessun duplicato, accesso OK | |
| 4.2 | Google con profilo già completo | Accesso diretto, header "Nome Cognome" | |
| 4.3 | Google con utente sospeso | Accesso negato | |

---

## 5 — OAuth interrotto / State cookie

| # | Test | Atteso | Esito |
|---|------|--------|-------|
| 5.1 | Avvia Google → premi Back → riprova | Arriva a `/auth/error`, tasto "↩ Riprova con Google" visibile | |
| 5.2 | Premi "↩ Riprova con Google" su `/auth/error` | Nuovo flusso OAuth avviato correttamente | |
| 5.3 | Doppio click su "Accedi con Google" | Solo un flusso OAuth avviato (mutex `pendingRef`) | |
| 5.4 | `/auth/error?error=OAuthCallbackError` visitato direttamente | Titolo "Accesso non completato", testo italiano, nessun codice tecnico | |
| 5.5 | `/auth/error?error=AccessDenied` | Titolo "Accesso negato", **nessun** bottone Riprova Google | |

---

## 6 — Header "Nome Cognome"

| # | Test | Atteso | Esito |
|---|------|--------|-------|
| 6.1 | Utente con firstName + lastName | Header: "👋 Ciao Mario Rossi" | |
| 6.2 | Utente con solo firstName | Header: "👋 Ciao Mario" | |
| 6.3 | Utente con solo name (Google legacy) | Header: "👋 Ciao Mario Rossi" (da name) | |
| 6.4 | Utente con solo email | Header: "👋 Ciao mario" (prefisso email) | |
| 6.5 | Utente senza nessun dato nome | Header: "👋 Ciao Account" | |
| 6.6 | Dopo PATCH `/api/user/profile` + `session.update()` | Header aggiornato senza refresh manuale | |

---

## 7 — Protezione route (middleware)

| # | Test | Atteso | Esito |
|---|------|--------|-------|
| 7.1 | `/profilo` senza cookie di sessione | 307 → `/login` | |
| 7.2 | `/completa-profilo` senza cookie di sessione | 307 → `/login` | |
| 7.3 | `/admin` senza cookie di sessione | 307 → `/login` | |
| 7.4 | `/admin` con ruolo `cliente` | Redirect a `/` | |
| 7.5 | `/api/user/profile` PATCH senza token | 401 JSON | |
| 7.6 | `/api/admin/system/auth-health` senza token | 401 JSON | |

---

## 8 — Stale Server Action (dopo deploy)

| # | Test | Atteso | Esito |
|---|------|--------|-------|
| 8.1 | Submit form su pagina con bundle pre-deploy | Banner giallo "L'app è stata aggiornata. Ricarica la pagina." + bottone "↺ Ricarica pagina" | |
| 8.2 | Click "↺ Ricarica pagina" | `window.location.reload()` eseguito | |
| 8.3 | Nessun codice tecnico visibile | "Failed to find Server Action ..." NON compare all'utente | |

> **Come riprodurre:** apri la pagina → esegui deploy → senza ricaricare la pagina, premi Submit.

---

## 9 — API tecniche

```bash
# Health
curl https://arrivoapp.it/api/health
# → {"status":"ok",...}

# Providers
curl https://arrivoapp.it/api/auth/providers
# → {"google":{...},"credentials":{...}}

# Google signin redirect
curl -s -o /dev/null -w '%{http_code}' -L --max-redirs 0 https://arrivoapp.it/api/auth/signin/google
# → 302

# PATCH senza token
curl -s -o /dev/null -w '%{http_code}' -X PATCH https://arrivoapp.it/api/user/profile \
  -H 'Content-Type: application/json' -d '{"firstName":"T","lastName":"U"}'
# → 401

# Auth error page raggiungibile
curl -s -o /dev/null -w '%{http_code}' 'https://arrivoapp.it/auth/error?error=OAuthCallbackError'
# → 200
```

---

## Note operative

- **"State cookie was missing"** nei log PM2: errore browser-side (utente naviga via durante OAuth). Non disattivare le protezioni OAuth. L'UX di recovery è `/auth/error` con "↩ Riprova con Google".
- **"Failed to find Server Action"** nei log PM2: atteso post-deploy con browser stale. Ora mostra banner giallo con reload. Si risolve con F5.
- **103 PM2 restarts**: storico. Non indica instabilità; il processo è stabile da ore.
