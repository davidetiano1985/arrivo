# Project Status - Arrivo

Questo file e la source of truth operativa del progetto Arrivo.

Ogni decisione tecnica, task futuro, deploy, intervento Codex/Claude e cambio
di stato rilevante deve restare coerente con questo documento.

## Stato attuale

- homepage online
- `/admin` online
- `/admin/users` online
- layout admin minimale presente
- responsive mobile ancora da rifinire
- tutto e ancora demo frontend
- autenticazione reale non ancora implementata
- database reale non ancora implementato
- backend non collegato al frontend demo
- nessuna persistenza reale delle modifiche UI

## Overview del progetto

Arrivo e una piattaforma food-tech pensata per unire discovery ristoranti,
prenotazione, ordine e gestione operativa in un'unica esperienza.

Lo stato attuale del progetto e focalizzato sul frontend demo:

- homepage pubblica mobile-first
- dati demo per ristoranti
- dati demo per utenti e ruoli
- pannello demo super admin
- gestione demo utenti lato UI
- navigazione admin demo

Il progetto non ha ancora integrazione reale con backend, database,
autenticazione o API.

## Workflow tecnico

Workflow corretto per modifiche e rilascio:

```text
Codex/Claude -> GitHub -> VPS -> build -> pm2 restart
```

Flusso pratico:

1. Codex o Claude lavora su micro-task locali.
2. Le modifiche vengono committate e pushate su GitHub.
3. La VPS prende gli aggiornamenti da GitHub con `git pull`.
4. La build viene eseguita sul frontend.
5. PM2 riavvia il processo pubblico.

## Deploy corretto VPS

Comandi corretti da eseguire sulla VPS:

```bash
cd /root/arrivo
git pull

cd /root/arrivo/frontend
npm run build

pm2 restart arrivo
```

Non usare workflow alternativi se non richiesto esplicitamente.

## Infrastruttura

- provider: Aruba Cloud VPS
- sistema operativo: Ubuntu 22.04
- frontend: Next.js
- process manager: PM2
- reverse proxy: Nginx
- dominio pubblico: https://arrivoapp.it

## Stack utilizzato

Frontend:

- Next.js
- React
- TypeScript
- Tailwind CSS
- App Router di Next.js

Dati demo:

- file TypeScript locali dentro `frontend/src/data`
- nessun database
- nessuna API
- nessuna persistenza reale

Infrastruttura runtime:

- Node.js su VPS
- PM2 per processo applicativo
- Nginx davanti all'app

## AI responsibilities

Codex e responsabile principalmente di:

- backend
- deploy
- git
- build
- bug tecnici
- TypeScript
- verifica errori tecnici
- mantenimento del workflow GitHub/VPS

Claude e responsabile principalmente di:

- UI
- UX
- responsive
- mobile-first
- design premium
- rifinitura visuale
- testi e coerenza dell'esperienza utente

Nota:

- Codex puo intervenire su UI quando il task lo richiede, ma deve restare
  incrementale e conservativo.
- Claude puo proporre UI/UX, ma le modifiche devono restare compatibili con
  lo stato tecnico reale del progetto.

## Regole operative

- lavorare per micro-task
- evitare refactor enormi
- non modificare backend inutilmente
- non toccare `package.json` senza motivo chiaro
- mantenere UI mobile-first
- mantenere UI in italiano
- mantenere frontend e backend separati
- non collegare database finche il modello UI non e stabile
- non introdurre API finte sparse nei componenti
- tenere i dati demo dentro `frontend/src/data`
- evitare redesign completi non richiesti
- fare modifiche verificabili
- una feature per volta
- mantenere stile premium nero/arancione coerente
- distinguere sempre:
  - demo UI
  - dati demo
  - logica reale
  - persistenza reale

## Regole Codex

- NON avviare localhost automaticamente
- NON usare porte 3000/3001 per test automatici
- NON lanciare `next start` o `next dev` senza richiesta esplicita
- evitare task che richiedono autorizzazioni continue
- evitare workflow interattivi inutili
- mostrare sempre file modificati prima del commit quando possibile
- non modificare backend per task solo frontend
- non modificare `package.json` senza richiesta esplicita o motivo tecnico reale
- non avviare server quando non richiesto
- non usare localhost quando richiesto di evitarlo
- preferire patch piccole e isolate
- non fare commit di file locali non richiesti
- non includere file temporanei, PDF o worktree locali nei commit se non richiesto

## Regole comunicazione

- spiegazioni semplici
- una istruzione alla volta
- evitare muri di testo
- dire chiaramente cosa e stato modificato
- dire chiaramente cosa non e stato modificato
- distinguere sempre demo UI e logica reale
- segnalare se un test non e stato eseguito
- quando possibile, mostrare i file modificati prima del commit

## Regole responsive

- niente scroll orizzontale su mobile
- niente tabelle desktop su smartphone
- usare card verticali responsive su mobile
- bottoni e select devono essere touch-friendly
- email, restaurantIds e testi lunghi devono andare a capo
- usare `min-w-0`, `break-words`, `break-all`, `overflow-hidden` dove serve
- usare `w-full`, `max-w-full` e wrapper responsive
- evitare elementi con larghezze fisse troppo grandi su mobile
- desktop deve restare ordinato e leggibile
- mobile e la priorita: circa il 95% degli utenti usera Arrivo da smartphone

## Struttura principale cartelle

Struttura rilevante del repository:

```text
Arrivo/
  admin/
  assets/
  backend/
  database/
  design/
  docs/
  frontend/
  frontend_old/
  mobile-webapp/
  restaurant-panel/
```

Struttura frontend attuale:

```text
frontend/
  src/
    app/
      page.tsx
      admin/
        layout.tsx
        page.tsx
        users/
          page.tsx
    data/
      restaurants.ts
      users.ts
```

Cartelle importanti:

- `frontend`: nuovo frontend stabile Next.js creato dopo il reset.
- `frontend_old`: vecchio frontend spostato e mantenuto come backup.
- `frontend/src/data`: sorgente dati demo lato frontend.
- `frontend/src/app/admin`: pagine demo area admin.
- `backend`: presente ma non collegato al frontend demo.
- `database`: presente ma non collegato al frontend demo.

## Stato schema Prisma

File principali:

```text
frontend/prisma/schema.prisma
frontend/prisma.config.ts
```

Lo schema Prisma esiste ed è allineato alle decisioni architetturali attuali.

### Stato attuale

- schema scritto e aggiornato
- `prisma.config.ts` creato (Prisma 7)
- `npm install` NON ancora eseguito in locale con i nuovi pacchetti
- migrate NON ancora eseguita
- database VPS NON ancora toccato
- nessuna connessione al frontend demo

### Configurazione Prisma 7

```text
frontend/prisma.config.ts  ← DATABASE_URL letta qui
frontend/prisma/schema.prisma  ← NON ha url nel datasource (corretto Prisma 7)
```

Regola importante: `schema.prisma` NON deve avere `url` nel datasource.
`DATABASE_URL` viene letta esclusivamente da `prisma.config.ts`.

### Comandi per la futura migrate sulla VPS

```bash
cd /root/arrivo/frontend
npm install
npx prisma generate
npx prisma migrate deploy
```

NON usare `prisma migrate dev` in produzione.
NON eseguire migrate senza verificare che il DB sia vergine.

### Enum UserRole (definitivo)

```prisma
enum UserRole {
  super_admin
  gestore_locale
  manager
  staff
  cliente        // default automatico alla registrazione
}
```

### Model User

- `role UserRole @default(cliente)` — ruolo iniziale automatico corretto
- `emailVerified DateTime?` — compatibile NextAuth
- `suspended Boolean @default(false)` — coerente con stato UI demo
- `password String?` — null per OAuth Google

### Model Restaurant

- nome `Restaurant` mantenuto per ora (non rinominare in `Locale` prima della prima migrate)
- campo `tipo String?` aggiunto per classificare il tipo di locale food
  (ristorante, creperia, bakery, pub, sushi bar, street food ecc.)
- `status RestaurantStatus @default(pending)` — coerente con flusso approvazione

### Nota importante

Il model si chiama ancora `Restaurant` internamente.
NON rinominare in `Locale` prima di decidere quando fare la prima migrate.
Rinominare dopo dati presenti richiede migrazione custom.

## Stato backend

Le cartelle `backend/` e `database/` esistono ma non sono ancora collegate
al nuovo frontend Next.js.

Ogni integrazione futura dovra:

- mantenere separazione frontend/backend
- evitare accesso diretto database dal frontend
- passare tramite API o servizi dedicati
- mantenere persistenza e autorizzazioni lato server
- validare permessi lato server
- evitare logica critica solo lato UI

## Sistema ruoli attuale

Il sistema ruoli esiste solo come struttura dati demo nel frontend.

File principale:

```text
frontend/src/data/users.ts
```

### Ruoli ufficiali (nomenclatura definitiva)

| Ruolo           | Descrizione                                      |
|-----------------|--------------------------------------------------|
| `super_admin`   | Amministratore piattaforma                       |
| `gestore_locale`| Proprietario/gestore del locale food             |
| `manager`       | Manager operativo del locale                     |
| `staff`         | Personale del locale                             |
| `cliente`       | Utente finale (ruolo iniziale automatico)        |

### Decisione architetturale: sistema utenti unificato

- tutti gli utenti usano la stessa registrazione e lo stesso login
- al momento della registrazione il ruolo assegnato automaticamente e `cliente`
- il `super_admin` puo cambiare il ruolo di qualsiasi utente dal pannello admin
- al login successivo ogni utente vede il pannello corretto in base al ruolo assegnato

Motivo: Arrivo supporta qualsiasi locale food (ristoranti, creperie, cornetterie,
bakery, pub, sushi bar, street food ecc.), quindi i ruoli devono essere generici
e non legati a un tipo specifico di locale.

### Stato attuale ruoli (demo)

- i ruoli modificati nella pagina `/admin/users` aggiornano solo lo stato locale
  React della pagina.
- non vengono salvati su file, database o backend.
- non esiste ancora un modello permessi reale.
- non esiste ancora autenticazione reale.

Utente super admin demo:

```text
Nome: Davide Tiano
Email: davidetiano1985@gmail.com
Ruolo: super_admin
Restaurant IDs: []
```

## Stato homepage

File:

```text
frontend/src/app/page.tsx
```

Homepage demo:

- homepage premium food delivery
- stile nero/arancione
- mobile-first
- hero principale
- ricerca demo
- chip categoria demo
- card ristoranti demo
- navbar mobile demo
- dati ristoranti letti da `frontend/src/data/restaurants.ts`

Stato:

- pagina frontend demo
- nessuna ricerca reale
- nessun ordine reale
- nessuna prenotazione reale
- nessuna chiamata API

## Stato layout admin

File:

```text
frontend/src/app/admin/layout.tsx
```

Layout admin demo:

- titolo `Arrivo Admin`
- link `Pannello`
- link `Utenti`
- sidebar semplice desktop
- top navigation mobile
- stile nero/arancione

Stato:

- layout frontend demo
- nessun controllo accessi reale
- nessuna protezione route reale

## Stato pagina /admin

File:

```text
frontend/src/app/admin/page.tsx
```

La pagina `/admin` e un pannello demo semplice per super admin.

Mostra:

- messaggio `Benvenuto Davide`
- ruolo `super admin`
- card/link verso `/admin/users`
- elenco utenti demo
- nome, email e ruolo per ogni utente
- bottone finto `Modifica ruolo`

Stato:

- pagina statica/demo
- nessun login reale
- nessun controllo accessi
- nessuna chiamata API
- nessuna persistenza

## Stato pagina /admin/users

File:

```text
frontend/src/app/admin/users/page.tsx
```

La pagina `/admin/users` e la vista demo piu avanzata per gestione utenti.

Funzionalita presenti:

- utenti da `frontend/src/data/users.ts`
- filtro per ruolo
- ricerca per nome/email
- bottone `Reimposta filtri`
- select ruolo controllata con `useState`
- status locale `active` / `suspended`
- toggle visuale `Sospendi` / `Attiva`
- accesso ristoranti demo
- bottone demo `Assegna ristorante`
- aggiunta locale del restaurant id fake `roma-centro`
- campo `Ultimo aggiornamento`
- aggiornamento locale di `Ultimo aggiornamento` quando cambiano:
  - ruolo
  - stato
  - accesso ristoranti
- azione `Dettagli`
- pannello `Dettagli utente`
- bottone `Chiudi dettagli`
- card dettagli responsive
- badge colorati per ruolo e stato
- sezione `Zona pericolosa`
- bottone demo `Elimina utente`
- conferma browser con `confirm()`
- rimozione utente solo dallo stato locale
- protezione UI per impedire eliminazione di utenti `super_admin`

Responsive attuale:

- mobile: deve usare card verticali responsive
- desktop/tablet largo: puo usare tabella da `lg` in su
- mobile: non deve avere scroll orizzontale
- testi lunghi, email e restaurantIds devono andare a capo
- responsive mobile ancora da rifinire se emergono nuove anomalie reali

Stato:

- pagina demo locale React
- nessuna API
- nessuna persistenza
- nessuna autorizzazione reale

## Dati ristoranti

File:

```text
frontend/src/data/restaurants.ts
```

Ristoranti demo:

- `Pizzeria Napoli`
- `Sushi Zen`

Ogni ristorante include:

- slug
- nome
- categoria
- indirizzo
- rating
- tempo stimato
- descrizione
- immagine placeholder
- menu base

## Dati utenti

File:

```text
frontend/src/data/users.ts
```

Utenti demo con:

- id
- nome
- email
- ruolo
- restaurantIds assegnati

## Cosa e demo UI

Le seguenti funzionalita sono solo demo lato UI:

- cambio ruolo utente
- cambio stato active/suspended
- assegnazione ristoranti
- aggiornamento `Ultimo aggiornamento`
- eliminazione utente
- pannello dettagli utente
- ricerca e filtri
- card riepilogo utenti
- pulsanti `Modifica ruolo`, `Dettagli`, `Assegna ristorante`,
  `Elimina utente`
- navbar mobile homepage
- ricerca homepage
- categorie homepage

Tutti questi comportamenti vivono nello stato locale React della pagina.
Ricaricando la pagina, i dati tornano allo stato iniziale definito nei file demo.

## Cosa NON esiste ancora

Non esistono ancora:

- login reale
- registrazione utenti
- logout
- sessioni
- autenticazione
- autorizzazione reale
- protezione route
- backend collegato al frontend
- database collegato al frontend
- API per utenti
- API per ristoranti
- persistenza modifiche ruoli
- persistenza stato utenti
- persistenza assegnazione ristoranti
- audit log reale
- upload immagini
- gestione menu reale
- pannello restaurant admin reale
- pannello staff reale
- sistema ordini reale
- sistema prenotazioni reale
- pagamenti
- notifiche
- email transactional
- gestione permessi granulare
- validazione lato server
- test automatici strutturati

## Roadmap prossimi step

Prossimi step consigliati, in ordine prudente:

1. Rifinire responsive mobile delle pagine demo
   - eliminare ogni overflow orizzontale residuo
   - mantenere card mobile per viste complesse
   - verificare testi lunghi, email e bottoni

2. Stabilizzare il modello dati frontend
   - [x] ruoli allineati tra dati demo e UI
   - [x] nomenclatura definitiva decisa (vedi sezione "Sistema ruoli attuale")
   - definire tipi condivisi per utenti e ristoranti

3. Stabilizzare navigazione admin minima
   - mantenere layout admin semplice
   - evitare navigazione complessa finche auth e permessi non esistono

4. Preparare mock auth frontend
   - utente corrente demo
   - guardie UI demo per ruolo
   - nessuna sicurezza reale, solo simulazione

5. Definire contratti API futuri
   - utenti
   - ruoli
   - ristoranti
   - assegnazioni restaurant access

6. Collegare backend solo quando il frontend demo e stabile
   - endpoint users
   - endpoint restaurants
   - persistenza ruoli/status/accessi

7. Introdurre autenticazione reale
   - login
   - sessione
   - protezione pagine admin
   - controllo ruoli lato server

8. Evolvere pannelli operativi
   - super admin
   - gestore locale
   - manager
   - staff

9. Introdurre testing
   - test componenti critici
   - test filtri utenti
   - test permessi quando esisteranno davvero

## Regole di sicurezza future

- il ruolo `super_admin` non deve essere eliminabile dalla UI reale
- i controlli UI non bastano per la sicurezza
- ogni permesso reale dovra essere validato lato server
- ogni modifica critica dovra avere audit log e persistenza tracciata
- il frontend non deve mai essere fonte unica di autorizzazione
- ogni integrazione database deve passare da backend/API

## Note operative finali

- Questo file deve essere letto prima di task importanti.
- Se una richiesta contraddice questo file, chiarire prima di procedere.
- Se cambia infrastruttura, deploy, stato frontend o responsabilita AI,
  aggiornare questo file.
- Preferire sempre task piccoli, reversibili e committabili.
