# Project Status - Arrivo

## Overview del progetto

Arrivo e una piattaforma food-tech pensata per unire discovery ristoranti,
prenotazione, ordine e gestione operativa in un'unica esperienza.

Lo stato attuale del progetto e focalizzato sul frontend demo:

- homepage pubblica mobile-first
- dati demo per ristoranti
- dati demo per utenti e ruoli
- pannello demo super admin
- gestione demo utenti lato UI

Il progetto non ha ancora integrazione reale con backend, database,
autenticazione o API.

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

## Sistema ruoli attuale

Il sistema ruoli esiste solo come struttura dati demo nel frontend.

File principale:

```text
frontend/src/data/users.ts
```

Ruoli demo presenti nei dati:

- `user`
- `restaurant_admin`
- `super_admin`

Ruoli disponibili nella select UI della pagina utenti:

- `super_admin`
- `admin`
- `manager`
- `staff`

Nota importante:

- i ruoli modificati nella pagina `/admin/users` aggiornano solo lo stato locale
  React della pagina.
- non vengono salvati su file, database o backend.
- non esiste ancora un modello permessi reale.
- non esiste ancora autenticazione reale.

Utente super admin demo richiesto:

```text
Nome: Davide Tiano
Email: davidetiano1985@gmail.com
Ruolo: super_admin
Restaurant IDs: []
```

## Stato pagina /admin

File:

```text
frontend/src/app/admin/page.tsx
```

La pagina `/admin` e un pannello demo semplice per super admin.

Mostra:

- messaggio `Benvenuto Davide`
- ruolo `super admin`
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

- tabella utenti da `frontend/src/data/users.ts`
- filtro per ruolo
- ricerca per nome/email
- bottone `Reset filters`
- select ruolo controllata con `useState`
- status locale `active` / `suspended`
- toggle `Suspend` / `Activate`
- colonna `Restaurant Access`
- bottone demo `Assign Restaurant`
- aggiunta locale del restaurant id fake `roma-centro`
- colonna `Last updated`
- aggiornamento locale di `Last updated` quando cambiano:
  - ruolo
  - status
  - restaurant access
- colonna `Actions`
- bottone `View details`
- pannello `User details`
- bottone `Close details`
- card dettagli responsive
- badge colorati per ruolo e status
- sezione `Danger zone`
- bottone demo `Delete user`
- conferma browser con `confirm()`
- rimozione utente solo dallo stato locale
- protezione per impedire eliminazione di utenti `super_admin`

Migliorie UX presenti:

- header tabella sticky
- hover rows
- spacing uniforme
- badge colorati
- tabella con scroll mobile/orizzontale
- pannello dettagli responsive

## Convenzioni UI

- usare Tailwind CSS esistente
- evitare librerie UI pesanti finche il design system non e stabile
- mantenere componenti admin semplici e modulari
- preferire una pagina stabile prima di estrarre componenti condivisi
- mantenere layout responsive mobile-first
- evitare refactor estetici non richiesti

## Stato backend

Le cartelle `backend/` e `database/` esistono ma non sono ancora collegate
al nuovo frontend Next.js.

Ogni integrazione futura dovra:

- mantenere separazione frontend/backend
- evitare accesso diretto database dal frontend
- passare tramite API o servizi dedicati
- mantenere persistenza e autorizzazioni lato server

## Funzionalita gia implementate

Homepage:

- homepage premium food delivery
- stile nero/arancione
- card ristoranti demo
- dati ristoranti letti da file dati
- navbar mobile demo

Dati ristoranti:

- file `frontend/src/data/restaurants.ts`
- ristoranti demo:
  - `Pizzeria Napoli`
  - `Sushi Zen`
- ogni ristorante include:
  - slug
  - nome
  - categoria
  - indirizzo
  - rating
  - tempo stimato
  - descrizione
  - immagine placeholder
  - menu base

Dati utenti:

- file `frontend/src/data/users.ts`
- utenti demo con:
  - id
  - nome
  - email
  - ruolo
  - restaurantIds assegnati

Admin demo:

- pagina `/admin`
- pagina `/admin/users`
- gestione demo ruoli/status/restaurant access
- dettagli utente
- delete demo locale per utenti non super admin

## Cosa e demo UI

Le seguenti funzionalita sono solo demo lato UI:

- cambio ruolo utente
- cambio status active/suspended
- assegnazione ristoranti
- aggiornamento `Last updated`
- delete utente
- pannello dettagli utente
- ricerca e filtri
- card riepilogo utenti
- pulsanti `Modifica`, `View details`, `Assign Restaurant`, `Delete user`

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
- persistenza status utenti
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
- test automatici

## Roadmap prossimi step

Prossimi step consigliati, in ordine prudente:

1. Stabilizzare il modello dati frontend
   - allineare ruoli demo e ruoli UI
   - decidere nomenclatura finale: `restaurant_admin` oppure `admin`
   - definire tipi condivisi per utenti e ristoranti

2. Creare navigazione admin minima
   - link da `/admin` a `/admin/users`
   - eventuale layout admin semplice
   - breadcrumb o header interno

3. Preparare mock auth frontend
   - utente corrente demo
   - guardie UI demo per ruolo
   - nessuna sicurezza reale, solo simulazione

4. Definire contratti API futuri
   - utenti
   - ruoli
   - ristoranti
   - assegnazioni restaurant access

5. Collegare backend solo quando il frontend demo e stabile
   - endpoint users
   - endpoint restaurants
   - persistenza ruoli/status/accessi

6. Introdurre autenticazione reale
   - login
   - sessione
   - protezione pagine admin
   - controllo ruoli lato server

7. Evolvere pannelli operativi
   - super admin
   - restaurant admin
   - manager
   - staff

8. Introdurre testing
   - test componenti critici
   - test filtri utenti
   - test permessi quando esisteranno davvero

## Regole architetturali da mantenere

Regole operative attuali:

- mantenere frontend e backend separati
- non collegare database finche il modello UI non e stabile
- non introdurre API finte sparse nei componenti
- tenere i dati demo dentro `frontend/src/data`
- evitare redesign non richiesti
- fare task piccoli e incrementali
- non toccare config Next se non strettamente necessario
- non modificare backend per task solo frontend
- non modificare `package.json` senza richiesta esplicita
- non avviare server quando non richiesto
- non usare localhost quando richiesto di evitarlo
- mantenere UI mobile-first
- mantenere stile premium nero/arancione coerente
- preferire stato locale React per demo UI temporanee
- spostare logica condivisa in tipi/helper solo quando serve davvero
- distinguere sempre tra:
  - demo UI
  - dati demo
  - logica reale
  - persistenza reale

## Regola operativa Codex

Evitare task enormi o richieste generiche tipo:

- "sistema tutto"
- "crea backend completo"
- "rifai architettura"

Preferire:

- task piccoli
- task isolati
- modifiche verificabili
- una feature per volta
- backend solo dopo stabilizzazione UI/frontend

Regole di sicurezza future:

- il ruolo `super_admin` non deve essere eliminabile dalla UI reale.
- i controlli UI non bastano per la sicurezza.
- ogni permesso reale dovra essere validato lato server.
- ogni modifica critica dovra avere audit log e persistenza tracciata.
