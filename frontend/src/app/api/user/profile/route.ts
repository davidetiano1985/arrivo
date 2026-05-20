/**
 * PATCH /api/user/profile
 *
 * Updates firstName and lastName of the currently authenticated user.
 * - Requires a valid JWT session (401 if missing/invalid).
 * - Only touches the authenticated user's own record (no targetId param).
 * - Cannot change role, email, or other sensitive fields.
 * - Trims and validates names; sets profileIncomplete=false when both are present.
 */

import { type NextRequest, NextResponse } from 'next/server'
import { getToken }                        from 'next-auth/jwt'
import { prisma }                          from '@/lib/prisma'

export async function PATCH(req: NextRequest) {
  // ── Auth ──────────────────────────────────────────────────────────────────
  const token = await getToken({ req })

  if (!token?.id || token.invalid) {
    return NextResponse.json({ error: 'Non autenticato.' }, { status: 401 })
  }

  // ── Parse body ───────────────────────────────────────────────────────────
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Corpo della richiesta non valido.' }, { status: 400 })
  }

  if (!body || typeof body !== 'object') {
    return NextResponse.json({ error: 'Corpo della richiesta non valido.' }, { status: 400 })
  }

  const { firstName: rawFirst, lastName: rawLast } = body as Record<string, unknown>

  if (typeof rawFirst !== 'string' || typeof rawLast !== 'string') {
    return NextResponse.json({ error: 'firstName e lastName sono obbligatori.' }, { status: 400 })
  }

  const firstName = rawFirst.trim()
  const lastName  = rawLast.trim()

  if (!firstName || firstName.length < 2) {
    return NextResponse.json({ error: 'Il nome deve contenere almeno 2 caratteri.' }, { status: 422 })
  }
  if (!lastName || lastName.length < 2) {
    return NextResponse.json({ error: 'Il cognome deve contenere almeno 2 caratteri.' }, { status: 422 })
  }
  if (firstName.length > 50) {
    return NextResponse.json({ error: 'Il nome non può superare 50 caratteri.' }, { status: 422 })
  }
  if (lastName.length > 50) {
    return NextResponse.json({ error: 'Il cognome non può superare 50 caratteri.' }, { status: 422 })
  }

  // ── Update DB ─────────────────────────────────────────────────────────────
  try {
    const updated = await prisma.user.update({
      where: { id: token.id as string },
      data: {
        firstName,
        lastName,
        name:              `${firstName} ${lastName}`,
        profileIncomplete: false,
      },
      select: { id: true, firstName: true, lastName: true, name: true, profileIncomplete: true },
    })

    return NextResponse.json({ ok: true, user: updated })
  } catch (err) {
    console.error('[PATCH /api/user/profile] error:', err)
    return NextResponse.json({ error: 'Errore interno del server.' }, { status: 500 })
  }
}
