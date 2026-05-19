'use server'

import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import { getServerSession } from 'next-auth'
import { revalidatePath } from 'next/cache'

import { sendAccountCreatedByAdminEmail, sendPasswordResetEmail } from '@/lib/email'
import { logAdminAction } from '@/lib/adminLog'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const RUOLI_VALIDI = ['super_admin', 'gestore_locale', 'manager', 'staff', 'cliente'] as const
type RuoloValido = (typeof RUOLI_VALIDI)[number]

async function verificaSuperAdmin() {
  const session = await getServerSession(authOptions)
  if (!session) throw new Error('Non autenticato')
  const u = session.user as { role: string; id: string; email?: string }
  if (u.role !== 'super_admin') throw new Error('Accesso negato')
  return { id: u.id, email: u.email ?? 'admin@arrivo' }
}

// ── Aggiorna ruolo ────────────────────────────────────────────────────────────

export async function aggiornaRuolo(
  userId: string,
  nuovoRuolo: string,
): Promise<{ error?: string }> {
  try {
    const admin = await verificaSuperAdmin()
    if (!RUOLI_VALIDI.includes(nuovoRuolo as RuoloValido)) return { error: 'Ruolo non valido' }
    if (userId === admin.id && nuovoRuolo !== 'super_admin')
      return { error: 'Non puoi togliere il ruolo super_admin a te stesso' }

    const target = await prisma.user.findUnique({ where: { id: userId } })
    if (!target) return { error: 'Utente non trovato' }

    await prisma.user.update({ where: { id: userId }, data: { role: nuovoRuolo as RuoloValido } })

    await logAdminAction({
      adminId: admin.id,
      adminEmail: admin.email,
      targetId: userId,
      targetEmail: target.email,
      action: 'ROLE_CHANGE',
      details: `${target.role} → ${nuovoRuolo}`,
    })

    revalidatePath('/admin/users')
    revalidatePath(`/admin/users/${userId}`)
    return {}
  } catch (err) {
    return { error: (err as Error).message }
  }
}

// ── Blocca / Sblocca ─────────────────────────────────────────────────────────

export async function togglaSospensione(
  userId: string,
  sospendi: boolean,
): Promise<{ error?: string }> {
  try {
    const admin = await verificaSuperAdmin()
    if (sospendi && userId === admin.id) return { error: 'Non puoi sospendere te stesso' }

    const target = await prisma.user.findUnique({ where: { id: userId } })
    if (!target) return { error: 'Utente non trovato' }

    await prisma.user.update({ where: { id: userId }, data: { suspended: sospendi } })

    await logAdminAction({
      adminId: admin.id,
      adminEmail: admin.email,
      targetId: userId,
      targetEmail: target.email,
      action: sospendi ? 'SUSPEND' : 'UNSUSPEND',
    })

    revalidatePath('/admin/users')
    revalidatePath(`/admin/users/${userId}`)
    return {}
  } catch (err) {
    return { error: (err as Error).message }
  }
}

// ── Reset password ────────────────────────────────────────────────────────────

export async function resetPassword(userId: string): Promise<{ error?: string }> {
  try {
    const admin = await verificaSuperAdmin()

    const target = await prisma.user.findUnique({ where: { id: userId } })
    if (!target) return { error: 'Utente non trovato' }

    // Google-only accounts cannot reset via password
    if (!target.password) return { error: 'Questo utente usa solo Google OAuth e non ha una password da reimpostare' }

    const token = crypto.randomBytes(32).toString('hex')
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000)

    await prisma.user.update({
      where: { id: userId },
      data: { passwordResetToken: token, passwordResetExpires: expires },
    })

    await sendPasswordResetEmail(target.email, token, target.firstName ?? undefined)

    await logAdminAction({
      adminId: admin.id,
      adminEmail: admin.email,
      targetId: userId,
      targetEmail: target.email,
      action: 'RESET_PASSWORD',
      details: 'Email di reset inviata',
    })

    revalidatePath(`/admin/users/${userId}`)
    return {}
  } catch (err) {
    return { error: (err as Error).message }
  }
}

// ── Reset tentativi login ─────────────────────────────────────────────────────

export async function resetTentativiLogin(userId: string): Promise<{ error?: string }> {
  try {
    const admin = await verificaSuperAdmin()

    const target = await prisma.user.findUnique({ where: { id: userId } })
    if (!target) return { error: 'Utente non trovato' }

    await prisma.user.update({ where: { id: userId }, data: { loginAttempts: 0 } })

    await logAdminAction({
      adminId: admin.id,
      adminEmail: admin.email,
      targetId: userId,
      targetEmail: target.email,
      action: 'RESET_LOGIN_ATTEMPTS',
      details: `Tentativi azzerati (erano: ${target.loginAttempts})`,
    })

    revalidatePath(`/admin/users/${userId}`)
    return {}
  } catch (err) {
    return { error: (err as Error).message }
  }
}

// ── Elimina utente ────────────────────────────────────────────────────────────

export async function eliminaUtente(userId: string): Promise<{ error?: string }> {
  try {
    const admin = await verificaSuperAdmin()
    if (userId === admin.id) return { error: 'Non puoi eliminare te stesso' }

    const target = await prisma.user.findUnique({ where: { id: userId } })
    if (!target) return { error: 'Utente non trovato' }

    // Log BEFORE delete (after delete the relation is gone)
    await logAdminAction({
      adminId: admin.id,
      adminEmail: admin.email,
      targetId: userId,
      targetEmail: target.email,
      action: 'DELETE_USER',
      details: `${target.firstName ?? ''} ${target.lastName ?? ''} (${target.email}) — ruolo: ${target.role}`.trim(),
    })

    await prisma.user.delete({ where: { id: userId } })

    revalidatePath('/admin/users')
    return {}
  } catch (err) {
    return { error: (err as Error).message }
  }
}

// ── Crea utente ───────────────────────────────────────────────────────────────

export async function creaUtente(
  formData: FormData,
): Promise<{ error?: string; success?: boolean }> {
  try {
    const admin = await verificaSuperAdmin()

    const firstName = (formData.get('firstName') as string | null)?.trim() ?? ''
    const lastName  = (formData.get('lastName')  as string | null)?.trim() ?? ''
    const email     = (formData.get('email')     as string | null)?.toLowerCase().trim() ?? ''
    const phone     = (formData.get('phone')     as string | null)?.trim() || null
    const role      = (formData.get('role')      as string | null) ?? 'cliente'

    if (!firstName || !lastName || !email) return { error: 'Nome, cognome ed email sono obbligatori' }
    if (!RUOLI_VALIDI.includes(role as RuoloValido)) return { error: 'Ruolo non valido' }

    const esistente = await prisma.user.findUnique({ where: { email } })
    if (esistente) return { error: 'Email già registrata' }

    const token   = crypto.randomBytes(32).toString('hex')
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000)

    const nuovoUtente = await prisma.user.create({
      data: {
        name:                `${firstName} ${lastName}`,
        firstName,
        lastName,
        email,
        phone,
        role:                role as RuoloValido,
        emailVerified:       null,
        password:            null,
        passwordResetToken:  token,
        passwordResetExpires: expires,
      },
    })

    await sendAccountCreatedByAdminEmail(email, token, firstName)

    await logAdminAction({
      adminId:    admin.id,
      adminEmail: admin.email,
      targetId:   nuovoUtente.id,
      targetEmail: email,
      action:     'CREATE_USER',
      details:    `${firstName} ${lastName} — ruolo: ${role}`,
    })

    revalidatePath('/admin/users')
    return { success: true }
  } catch (err) {
    return { error: (err as Error).message }
  }
}
