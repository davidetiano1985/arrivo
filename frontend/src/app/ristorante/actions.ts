'use server'

import { revalidatePath } from 'next/cache'
import { getServerSession } from 'next-auth'

import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

type DatiLocale = {
  nome: string
  tipo: string
  citta: string
  indirizzo: string
  telefono: string
  email: string
}

export async function aggiornaDatiLocale(
  restaurantId: string,
  data: DatiLocale,
): Promise<{ error?: string; ok?: true }> {
  const session = await getServerSession(authOptions)
  if (!session?.user) return { error: 'Non autorizzato.' }

  const role = (session.user as { role?: string }).role
  const userId = (session.user as { id: string }).id

  const nome = data.nome.trim().slice(0, 100)
  const citta = data.citta.trim().slice(0, 100)
  if (!nome) return { error: 'Il nome del locale è obbligatorio.' }
  if (!citta) return { error: 'La città è obbligatoria.' }

  const emailVal = data.email.trim()
  if (emailVal && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailVal)) {
    return { error: 'Formato email non valido.' }
  }

  const restaurant = await prisma.restaurant.findUnique({ where: { id: restaurantId } })
  if (!restaurant) return { error: 'Locale non trovato.' }

  if (role !== 'super_admin' && restaurant.ownerId !== userId) {
    return { error: 'Non autorizzato.' }
  }

  await prisma.restaurant.update({
    where: { id: restaurantId },
    data: {
      name: nome,
      tipo: data.tipo.trim() || null,
      city: citta,
      address: data.indirizzo.trim() || null,
      phone: data.telefono.trim() || null,
      email: emailVal || null,
    },
  })

  revalidatePath('/ristorante')
  return { ok: true }
}
