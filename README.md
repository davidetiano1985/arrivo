# Arrivo

Arrivo e' una web app mobile-first per ristoranti: il cliente sceglie il ristorante, prenota tavolo e orario, ordina prima di arrivare, paga online e trova tutto pronto.

Questo repository contiene lo scaffold iniziale del progetto. Non include ancora funzioni applicative reali: la base e' pronta per sviluppare frontend, backend, database, pannelli operativi e documentazione.

## Stack

- Frontend: Next.js, React, Tailwind CSS
- Backend: Python, FastAPI
- Database: PostgreSQL
- Superfici previste: cliente mobile, pannello ristorante, super admin

## Struttura

```text
Arrivo/
  frontend/            App Next.js principale mobile-first
  backend/             API FastAPI modulare
  database/            Setup, schema e migrazioni PostgreSQL
  docs/                Specifiche e documentazione prodotto
  assets/              Asset di brand, immagini, icone
  design/              Token, wireframe, mockup e reference UI
  admin/               Area futura super admin
  restaurant-panel/    Area futura pannello ristorante
  mobile-webapp/       Area futura esperienza cliente mobile
```

## Avvio futuro

Le dipendenze non sono ancora installate. Quando si passa allo sviluppo reale:

```bash
cd frontend
npm install
npm run dev
```

```bash
cd backend
python -m venv .venv
pip install -r requirements.txt
uvicorn app.main:app --reload
```

## Documentazione

La specifica iniziale e' in `docs/SPECIFICA_ARRIVO.md`.

