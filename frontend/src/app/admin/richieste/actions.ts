'use server'

import { revalidatePath } from 'next/cache'
import { getServerSession } from 'next-auth'

import { sendRichiestaApprovataEmail, sendRichiestaRifiutataEmail } from '@/lib/email'
import { logAdminAction } from '@/lib/adminLog'
import { prisma }         from '@/lib/prisma'
import { authOptions }    from '@/lib/auth'

async function verificaSuperAdmin() {
  const session = await getServerSession(authOptions)
  if (!session) throw new Error('Non autenticato')
  const u = session.user as { role: string; id: string; email?: string }
  if (u.role !== 'super_admin') throw new Error('Accesso negato')
  return { id: u.id, email: u.email ?? 'admin@arrivo' }
}

function slugify(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

// Bounded uniqueSlug — max 50 iterations to avoid infinite loop
async function uniqueSlug(base: string): Promise<string> {
  const slug = slugify(base)
  const exists = await prisma.restaurant.findUnique({ where: { slug } })
  if (!exists) return slug

  for (let i = 2; i <= 50; i++) {
    const candidate = `${slug}-${i}`
    const dup = await prisma.restaurant.findUnique({ where: { slug: candidate } })
    if (!dup) return candidate
  }
  // Fallback: slug + timestamp
  return `${slug}-${Date.now()}`
}

export async function approvaRichiesta(
  id: string,
): Promise<{ error: string } | void> {
  let admin: { id: string; email: string }
  try {
    admin = await verificaSuperAdmin()
  } catch {
    return { error: 'Non autorizzato.' }
  }

  const richiesta = await prisma.localeRequest.findUnique({ where: { id } })
  if (!richiesta) return { error: 'Richiesta non trovata.' }
  if (richiesta.status !== 'pending') return { error: 'Richiesta già elaborata.' }

  const utente = await prisma.user.findUnique({ where: { email: richiesta.email } })
  const slug   = await uniqueSlug(richiesta.nome)

  await prisma.$transaction([
    prisma.restaurant.create({
      data: {
        name:    richiesta.nome,
        slug,
        tipo:    richiesta.tipo    ?? undefined,
        city:    richiesta.citta,
        phone:   richiesta.telefono ?? undefined,
        email:   richiesta.email,
        status:  'approved',
        ownerId: utente?.id ?? null,
      },
    }),
    prisma.localeRequest.update({
      where: { id },
      data:  { status: 'approved' },
    }),
    ...(utente
      ? [prisma.user.update({ where: { id: utente.id }, data: { role: 'gestore_locale' } })]
      : []),
  ])

  // ── AdminLog (previously missing — audit fix) ─────────────────────────────
  await logAdminAction({
    adminId:     admin.id,
    adminEmail:  admin.email,
    targetEmail: richiesta.email,
    targetId:    utente?.id,
    action:      'APPROVA_RICHIESTA',
    details:     `Locale: ${richiesta.nome} (${richiesta.citta})${utente ? ` — Utente promosso a gestore_locale` : ''}`,
  })

  try {
    await sendRichiestaApprovataEmail(richiesta.email, richiesta.nome)
  } catch {
    // Email non bloccante
  }

  revalidatePath('/admin/richieste')
  revalidatePath('/admin')
}

export async function rifiutaRichiesta(
  id: string,
  nota?: string,
): Promise<{ error: string } | void> {
  let admin: { id: string; email: string }
  try {
    admin = await verificaSuperAdmin()
  } catch {
    return { error: 'Non autorizzato.' }
  }

  const richiesta = await prisma.localeRequest.findUnique({ where: { id } })
  if (!richiesta) return { error: 'Richiesta non trovata.' }
  if (richiesta.status !== 'pending') return { error: 'Richiesta già elaborata.' }

  await prisma.localeRequest.update({
    where: { id },
    data:  { status: 'rejected', note: nota || null },
  })

  // ── AdminLog (previously missing — audit fix) ─────────────────────────────
  await logAdminAction({
    adminId:     admin.id,
    adminEmail:  admin.email,
    targetEmail: richiesta.email,
    action:      'RIFIUTA_RICHIESTA',
    details:     `Locale: ${richiesta.nome} (${richiesta.citta})${nota ? ` — Nota: ${nota}` : ''}`,
  })

  try {
    await sendRichiestaRifiutataEmail(richiesta.email, richiesta.nome, nota)
  } catch {
    // Email non bloccante
  }

  revalidatePath('/admin/richieste')
  revalidatePath('/admin')
}
