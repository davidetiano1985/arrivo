import { getToken }                from 'next-auth/jwt'
import { type NextRequest, NextResponse } from 'next/server'

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
  const token = await getToken({ req })
  if (!token || (token.role as string) !== 'super_admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const googleProvider = !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET)
  const nextAuthUrl    = !!process.env.NEXTAUTH_URL
  const nextAuthSecret = !!process.env.NEXTAUTH_SECRET

  return NextResponse.json({
    googleProvider: googleProvider ? 'ACTIVE'  : 'MISSING',
    nextAuthUrl:    nextAuthUrl    ? 'OK'       : 'MISSING',
    nextAuthSecret: nextAuthSecret ? 'OK'       : 'MISSING',
    timestamp: new Date().toISOString(),
  })
}
