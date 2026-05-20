# ARRIVO — Enterprise CI/CD Pipeline Setup

## GitHub Secrets richiesti

Vai su: `GitHub repo → Settings → Secrets and variables → Actions → New repository secret`

### 🔐 VPS Deploy (obbligatori per web + backend)

| Secret | Descrizione | Esempio |
|--------|-------------|---------|
| `VPS_SSH_KEY` | Chiave SSH privata (ed25519 o RSA) | `-----BEGIN OPENSSH PRIVATE KEY-----...` |
| `VPS_HOST` | IP o hostname del VPS | `123.456.789.0` |
| `VPS_USER` | Utente SSH sul VPS | `root` |

**Come generare la chiave SSH:**
```bash
ssh-keygen -t ed25519 -C "arrivo-deploy" -f ~/.ssh/arrivo_deploy
# Aggiungi la chiave pubblica al VPS:
ssh-copy-id -i ~/.ssh/arrivo_deploy.pub root@TUO_VPS_IP
# Il contenuto di arrivo_deploy (privata) va in VPS_SSH_KEY
cat ~/.ssh/arrivo_deploy
```

---

### 📱 Android Signing (per APK release firmato)

| Secret | Descrizione |
|--------|-------------|
| `ANDROID_KEYSTORE_BASE64` | Keystore file in base64 |
| `ANDROID_STORE_PASSWORD` | Password del keystore |
| `ANDROID_KEY_ALIAS` | Alias della chiave (default: `arrivo-key`) |
| `ANDROID_KEY_PASSWORD` | Password della chiave |

**Come generare il keystore:**
```bash
bash scripts/generate-keystore.sh
```
Lo script genera tutto e ti mostra i valori da copiare nei secrets.

---

## Workflows attivi

| Workflow | Trigger | Cosa fa |
|----------|---------|---------|
| `deploy-web.yml` | Push su main (frontend/) | TypeScript + build + deploy VPS + health check |
| `deploy-backend.yml` | Push su main (backend/) | Test → deploy FastAPI su VPS |
| `build-android.yml` | Push su main (arrivo-build/) | Build APK debug → artifact |
| `release-android.yml` | Manuale (workflow_dispatch) | Build APK release firmato → GitHub Release |
| `pr-checks.yml` | Ogni Pull Request | TS + lint + test + security scan |
| `test-backend.yml` | Push backend + PR | Test FastAPI con PostgreSQL reale |

---

## Deploy VPS — Struttura attesa

```
/root/arrivo/
├── frontend/          ← Next.js app
│   ├── .env           ← variabili produzione (DATABASE_URL, etc.)
│   └── ...
├── backend/           ← FastAPI app
│   ├── .env
│   └── .venv/         ← virtualenv Python
├── scripts/
│   ├── deploy.sh      ← deploy frontend
│   └── deploy-backend.sh ← deploy backend
└── .git/
```

**PM2 processi richiesti:**
```bash
# Frontend Next.js
pm2 start npm --name "arrivo" -- start
# Backend FastAPI
pm2 start "uvicorn app.main:app --host 0.0.0.0 --port 8000" --name "arrivo-api"
pm2 save
```

---

## Rollback manuale

```bash
# Web (su VPS):
cd /root/arrivo/frontend
git log --oneline -10               # trova commit stabile
git reset --hard <commit-sha>
npm run build && pm2 reload arrivo

# Backend (su VPS):
cd /root/arrivo
git reset --hard <commit-sha>
cd backend && alembic downgrade -1
pm2 reload arrivo-api
```

---

## Release APK firmato — step-by-step

1. Genera keystore: `bash scripts/generate-keystore.sh`
2. Aggiungi i 4 secrets Android su GitHub
3. Vai su Actions → "Release Android APK (Manuale)"
4. Click "Run workflow" → inserisci version_name e version_code
5. Scarica APK dagli Artifacts o dalla GitHub Release
