/**
 * admin-auth.ts
 * Helper RBAC centralizzato per le route API dell'area admin.
 *
 * Regole:
 *   401 = non autenticato (JWT assente, scaduto o invalidato)
 *   403 = autenticato ma ruolo insufficiente
 *
 * Utilizzo tipo:
 *   const auth = await requireSuperAdmin(req)
 *   if (!auth.ok) return auth.response
 *   // auth.token.id, auth.token.email, auth.token.role disponibili
 */

import { getToken, type JWT } from 'next-auth/jwt'
import { type NextRequest, NextResponse } from 'next/server'

import { prisma } from './prisma'

// ── Tipo del token admin arricchito ──────────────────────────────────────────

export type AdminToken = JWT & {
  id:    string
  email: string
  role:  string
}

type AuthOk     = { ok: true;  token: AdminToken }
type AuthFail   = { ok: false; response: NextResponse }
export type AuthResult = AuthOk | AuthFail

// ── requireSuperAdmin ─────────────────────────────────────────────────────────

/**
 * Verifica che la richiesta abbia un JWT valido con ruolo super_admin.
 *
 * Ritorna { ok: true, token }   → richiesta autorizzata
 * Ritorna { ok: false, response }:
 *   - 401  se non autenticato o token invalidato (suspended / forced-logout)
 *   - 403  se autenticato ma ruolo != super_admin
 */
export async function requireSuperAdmin(req: NextRequest): Promise<AuthResult> {
  const token = await getToken({ req })

  if (!token || token.invalid) {
    return {
      ok: false,
      response: NextResponse.json({ error: 'Non autenticato' }, { status: 401 }),
    }
  }

  if ((token.role as string) !== 'super_admin') {
    // Log 403 — utente autenticato ma senza privilegio super_admin.
    // Non loggare 401 anonimi (spam DB).
    _logDeniedAccess(token as AdminToken, req.url).catch(() => {})
    return {
      ok: false,
      response: NextResponse.json({ error: 'Accesso negato' }, { status: 403 }),
    }
  }

  return { ok: true, token: token as AdminToken }
}

// ── requireAdmin ──────────────────────────────────────────────────────────────

/**
 * Verifica che la richiesta abbia un JWT valido con ruolo admin o super_admin.
 * Usato per funzioni admin di secondo livello (non super_admin-only).
 */
export async function requireAdmin(req: NextRequest): Promise<AuthResult> {
  const token = await getToken({ req })

  if (!token || token.invalid) {
    return {
      ok: false,
      response: NextResponse.json({ error: 'Non autenticato' }, { status: 401 }),
    }
  }

  const role = token.role as string
  if (role !== 'super_admin' && role !== 'admin') {
    _logDeniedAccess(token as AdminToken, req.url).catch(() => {})
    return {
      ok: false,
      response: NextResponse.json({ error: 'Accesso negato' }, { status: 403 }),
    }
  }

  return { ok: true, token: token as AdminToken }
}

// ── getCurrentAdminToken ──────────────────────────────────────────────────────

/**
 * Ritorna il token corrente senza forzare un ruolo specifico.
 * Utile per arricchire risposte opzionali con informazioni sull'admin loggato.
 * Ritorna null se non autenticato o token invalidato.
 */
export async function getCurrentAdminToken(req: NextRequest): Promise<AdminToken | null> {
  const token = await getToken({ req })
  if (!token || token.invalid) return null
  return token as AdminToken
}

// ── _logDeniedAccess (interno) ────────────────────────────────────────────────

/**
 * Scrive un evento "accesso negato" nel log per utenti autenticati (403).
 * Non chiamare per richieste anonime (401) — evita spam DB.
 * @internal
 */
async function _logDeniedAccess(token: AdminToken, url: string): Promise<void> {
  try {
    const route = new URL(url).pathname
    await prisma.adminLog.create({
      data: {
        adminId:     token.id    ?? null,
        adminEmail:  token.email ?? 'unknown',
        targetId:    null,
        targetEmail: token.email ?? 'unknown',
        action:      'admin.access.denied',
        details:     JSON.stringify({ route, requiredRole: 'super_admin', actualRole: token.role }),
      },
    })
  } catch {
    // Silenzioso — il log di sicurezza non deve bloccare la risposta
  }
}

// ── logAdminAction ────────────────────────────────────────────────────────────

type LogAdminActionParams = {
  /** Token dell'admin che ha eseguito l'azione (da requireSuperAdmin/requireAdmin). */
  adminToken:   AdminToken
  /** ID del record target, se applicabile. */
  targetId?:    string
  /** Email del target (obbligatoria per il log). */
  targetEmail:  string
  /** Stringa descrittiva dell'azione (es. "suspend_user", "resolve_alert"). */
  action:       string
  /** Dettagli opzionali in formato libero (JSON o testo). */
  details?:     string
}

/**
 * Scrive una voce immutabile nel registro AdminLog.
 * Fire-and-forget: gli errori vengono loggati su console ma non rilanciati,
 * così un problema di audit log non blocca mai l'azione admin.
 */
export async function logAdminAction(params: LogAdminActionParams): Promise<void> {
  try {
    await prisma.adminLog.create({
      data: {
        adminId:     params.adminToken.id    ?? null,
        adminEmail:  params.adminToken.email ?? 'unknown',
        targetId:    params.targetId         ?? null,
        targetEmail: params.targetEmail,
        action:      params.action,
        details:     params.details          ?? null,
      },
    })
  } catch (err) {
    console.error('[logAdminAction] impossibile scrivere il log di audit:', err)
  }
}
