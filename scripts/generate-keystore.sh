#!/bin/bash
# ─────────────────────────────────────────────────────────────────────────────
# ARRIVO — Generatore Keystore Android per release APK firmato
#
# USO:
#   bash scripts/generate-keystore.sh
#
# OUTPUT:
#   - arrivo-release.keystore  (file keystore — NON committare su git!)
#   - Istruzioni per aggiungere i secrets su GitHub
# ─────────────────────────────────────────────────────────────────────────────

set -euo pipefail

KEYSTORE_FILE="arrivo-release.keystore"
ALIAS="arrivo-key"

echo ""
echo "╔══════════════════════════════════════════════╗"
echo "║  ARRIVO — Generazione Keystore Android       ║"
echo "╚══════════════════════════════════════════════╝"
echo ""

# Controlla che keytool sia disponibile
if ! command -v keytool &>/dev/null; then
    echo "❌ keytool non trovato. Installa JDK 17+ e aggiungi al PATH."
    exit 1
fi

# Chiedi le password
echo "Scegli una password per il keystore (min 6 caratteri):"
read -sr STORE_PASS
echo ""
echo "Conferma password keystore:"
read -sr STORE_PASS2
echo ""
[ "$STORE_PASS" = "$STORE_PASS2" ] || { echo "❌ Password non coincidono"; exit 1; }

echo "Password per la chiave (può essere uguale al keystore):"
read -sr KEY_PASS
echo ""

# Genera keystore
echo "→ Generazione keystore..."
keytool -genkeypair \
    -v \
    -keystore "$KEYSTORE_FILE" \
    -keyalg RSA \
    -keysize 2048 \
    -validity 10000 \
    -alias "$ALIAS" \
    -storepass "$STORE_PASS" \
    -keypass "$KEY_PASS" \
    -dname "CN=ARRIVO Admin, OU=Mobile, O=ARRIVO, L=Italy, ST=Italy, C=IT"

echo ""
echo "✅ Keystore generato: $KEYSTORE_FILE"
echo ""

# Codifica in base64 per GitHub Secrets
echo "→ Codifica base64 per GitHub Secrets..."
if command -v base64 &>/dev/null; then
    BASE64_VAL=$(base64 -w 0 "$KEYSTORE_FILE" 2>/dev/null || base64 "$KEYSTORE_FILE")
else
    echo "⚠ base64 non trovato — codifica manualmente il file"
    BASE64_VAL="<codifica manualmente con: base64 $KEYSTORE_FILE>"
fi

echo ""
echo "══════════════════════════════════════════════════════════"
echo "  COPIA QUESTI VALORI NEI GITHUB SECRETS"
echo "  (Settings → Secrets and variables → Actions)"
echo "══════════════════════════════════════════════════════════"
echo ""
echo "Secret: ANDROID_KEYSTORE_BASE64"
echo "Valore (base64):"
echo "$BASE64_VAL"
echo ""
echo "Secret: ANDROID_STORE_PASSWORD"
echo "Valore: [la password keystore che hai scelto]"
echo ""
echo "Secret: ANDROID_KEY_ALIAS"
echo "Valore: $ALIAS"
echo ""
echo "Secret: ANDROID_KEY_PASSWORD"
echo "Valore: [la password chiave che hai scelto]"
echo ""
echo "══════════════════════════════════════════════════════════"
echo ""
echo "⚠  IMPORTANTE:"
echo "   - Salva il file '$KEYSTORE_FILE' in un posto sicuro (NON su git!)"
echo "   - Se perdi il keystore, non puoi più fare update delle app firmate"
echo "   - Aggiungi '$KEYSTORE_FILE' al .gitignore"
echo ""
echo "✅ Fatto! Ora configura i 4 secrets su GitHub."
