# Arrivo Backend

API FastAPI per Arrivo.

Lo scaffold include la struttura modulare iniziale, senza endpoint o logiche reali.

## Cartelle principali

- `app/routes`: router API
- `app/models`: modelli dominio/database futuri
- `app/services`: servizi applicativi futuri
- `app/database`: connessione e sessioni database future
- `app/auth`: autenticazione e autorizzazioni future
- `app/utils`: utilita' condivise

## Avvio futuro

```bash
python -m venv .venv
pip install -r requirements.txt
uvicorn app.main:app --reload
```

