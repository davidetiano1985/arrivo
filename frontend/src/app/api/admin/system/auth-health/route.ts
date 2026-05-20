import { type NextRequest, NextResponse } from 'next/server'

import { requireSuperAdmin, logAdminAction } from '@/lib/admin-auth'

/**
 * GET /api/admin/system/auth-health
 *
 * Stato della configurazione OAuth e NextAuth.
 * Solo super_admin. Non espone mai i valori delle credenziali.
 *
 * Risposta:
 * {
 *   googleProvider: "ACTIVE" | "MISSING",
 *   nextAuthUrl:    "OK"     | "MISSING",
 *   nextAuthSecret: "OK"     | "MISSING",
 *   timestamp: "ISO string"
 * }
 */
export async function GET(req: NextRequest) {
  const auth = await requireSuperAdmin(req)
  if (!auth.ok) return auth.response

  const googleProvider = !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET)
  const nextAuthUrl    = !!process.env.NEXTAUTH_URL
  const nextAuthSecret = !!process.env.NEXTAUTH_SECRET

  // Audit log — questa route espone stato config OAuth, loggare ogni accesso
  logAdminAction({
    adminToken:  auth.token,
    targetEmail: 'system',
    action:      'admin.auth_health.view',
    details:     JSON.stringify({
      googleProvider: googleProvider ? 'ACTIVE' : 'MISSING',
      nextAuthUrl:    nextAuthUrl    ? 'OK'     : 'MISSING',
      nextAuthSecret: nextAuthSecret ? 'OK'     : 'MISSING',
    }),
  }).catch(() => {})

  return NextResponse.json({
    googleProvider: googleProvider ? 'ACTIVE'  : 'MISSING',
    nextAuthUrl:    nextAuthUrl    ? 'OK'       : 'MISSING',
    nextAuthSecret: nextAuthSecret ? 'OK'       : 'MISSING',
    timestamp: new Date().toISOString(),
  })
}
