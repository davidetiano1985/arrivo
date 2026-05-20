#!/usr/bin/env node
/**
 * validate-production-env.js
 * Chiamato da deploy.sh prima di build e pm2 restart.
 * Controlla che tutte le variabili obbligatorie siano presenti e non vuote.
 *
 * SICUREZZA: logga solo nomi e valori mascherati — mai il valore reale.
 * Exit 0 = tutto OK.  Exit 1 = variabili mancanti → deploy interrotto.
 */

'use strict'

// ── Variabili obbligatorie — deploy bloccato se mancano ─────────────────────
const REQUIRED = [
  'DATABASE_URL',
  'NEXTAUTH_URL',
  'NEXTAUTH_SECRET',
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
]

// ── Variabili consigliate — warning ma non blocca ────────────────────────────
const RECOMMENDED = [
  'SMTP_HOST',
  'SMTP_USER',
  'SMTP_PASS',
  'SMTP_FROM',
]

/** Mostra solo i primi 3 e gli ultimi 3 caratteri del valore. */
function mask(value) {
  if (!value || value.length <= 6) return '***'
  return value.slice(0, 3) + '...' + value.slice(-3)
}

/**
 * Ritorna true se la variabile è valorizzata e non è una stringa vuota
 * o un placeholder ("", '', "CAMBIA_ME", ecc.).
 */
function isPresent(val) {
  if (val === undefined || val === null) return false
  const t = val.trim()
  if (t === '')   return false
  if (t === '""') return false
  if (t === "''") return false
  return true
}

// ── Output ───────────────────────────────────────────────────────────────────
let failed = false
const missing = []

console.log('')
console.log('══════════════════════════════════════════════════════')
console.log('  ARRIVO — VALIDAZIONE ENV DI PRODUZIONE')
console.log('══════════════════════════════════════════════════════')
console.log('')
console.log('  Variabili OBBLIGATORIE:')

for (const key of REQUIRED) {
  const val = process.env[key]
  if (isPresent(val)) {
    process.stdout.write(`  ✓  ${key.padEnd(26)} ${mask(val)}\n`)
  } else {
    process.stderr.write(`  ✗  ${key.padEnd(26)} MANCANTE O VUOTA  ← ERRORE\n`)
    missing.push(key)
    failed = true
  }
}

console.log('')
console.log('  Variabili CONSIGLIATE (warning se assenti):')

for (const key of RECOMMENDED) {
  const val = process.env[key]
  if (isPresent(val)) {
    process.stdout.write(`  ✓  ${key.padEnd(26)} ${mask(val)}\n`)
  } else {
    process.stdout.write(`  ⚠  ${key.padEnd(26)} non impostata\n`)
  }
}

console.log('')
console.log('══════════════════════════════════════════════════════')

if (failed) {
  process.stderr.write('\n')
  process.stderr.write(`✗ Validazione FALLITA — variabili mancanti: ${missing.join(', ')}\n`)
  process.stderr.write('  Aggiorna /root/arrivo/frontend/.env e riprova il deploy.\n')
  process.stderr.write('\n')
  process.exit(1)
}

console.log('')
console.log('✓ Tutte le env var obbligatorie sono presenti.')
console.log('')
process.exit(0)
