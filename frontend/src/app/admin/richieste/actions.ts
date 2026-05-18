'use server'

import { revalidatePath } from 'next/cache'
import { getServerSession } from 'next-auth'

import { sendRichiestaApprovataEmail, sendRichiestaRifiutataEmail } from '@/lib/email'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

function slugify(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

async function uniqueSlug(base: string): Promise<string> {
  const slug = slugify(base)
  const exists = await prisma.restaurant.findUnique({ where: { slug } })
  if (!exists) return slug
  let i = 2
  while (true) {
    const candidate = `${slug}-${i}`
    const dup = await prisma.restaurant.findUnique({ where: { slug: candidate } })
    if (!dup) return candidate
    i++
  }
}

export async function approvaRichiesta(
  id: string,
): Promise<{ error: string } | void> {
  const session = await getServerSession(authOptions)
  if ((session?.user as { role?: string })?.role !== 'super_admin') {
    return { error: 'Non autorizzato.' }
  }

  const richiesta = await prisma.localeRequest.findUnique({ where: { id } })
  if (!richiesta) return { error: 'Richiesta non trovata.' }
  if (richiesta.status !== 'pending') return { error: 'Richiesta già elaborata.' }

  // Collega al User esistente se presente
  const utente = await prisma.user.findUnique({ where: { email: richiesta.email } })

  const slug = await uniqueSlug(richiesta.nome)

  await prisma.$transaction([
    // Crea il record Restaurant
    prisma.restaurant.create({
      data: {
        name: richiesta.nome,
        slug,
        tipo: richiesta.tipo ?? undefined,
        city: richiesta.citta,
        phone: richiesta.telefono ?? undefined,
        email: richiesta.email,
        status: 'approved',
        ownerId: utente?.id ?? null,
      },
    }),
    // Aggiorna LocaleRequest
    prisma.localeRequest.update({
      where: { id },
      data: { status: 'approved' },
    }),
    // Se esiste l'utente, promuovi a gestore_locale
    ...(utente
      ? [prisma.user.update({ where: { id: utente.id }, data: { role: 'gestore_locale' } })]
      : []),
  ])

  try {
    await sendRichiestaApprovataEmail(richiesta.email, richiesta.nome)
  } catch {
    // Email non bloccante
  }

  revalidatePath('/admin/richieste')
}

export async function rifiutaRichiesta(
  id: string,
  nota?: string,
): Promise<{ error: string } | void> {
  const session = await getServerSession(authOptions)
  if ((session?.user as { role?: string })?.role !== 'super_admin') {
    return { error: 'Non autorizzato.' }
  }

  const richiesta = await prisma.localeRequest.findUnique({ where: { id } })
  if (!richiesta) return { error: 'Richiesta non trovata.' }
  if (richiesta.status !== 'pending') return { error: 'Richiesta già elaborata.' }

  await prisma.localeRequest.update({
    where: { id },
    data: { status: 'rejected', note: nota || null },
  })

  try {
    await sendRichiestaRifiutataEmail(richiesta.email, richiesta.nome, nota)
  } catch {
    // Email non bloccante
  }

  revalidatePath('/admin/richieste')
}
