'use server'

import { getServerSession } from 'next-auth'
import { revalidatePath } from 'next/cache'

import { authOptions } from '../../../lib/auth'
import { prisma } from '../../../lib/prisma'

const RUOLI_VALIDI = [
  'super_admin',
  'gestore_locale',
  'manager',
  'staff',
  'cliente',
] as const

type RuoloValido = (typeof RUOLI_VALIDI)[number]

async function verificaSuperAdmin() {
  const session = await getServerSession(authOptions)
  if (!session) throw new Error('Non autenticato')
  const user = session.user as { role: string; id: string }
  if (user.role !== 'super_admin') throw new Error('Accesso negato')
  return user
}

export async function aggiornaRuolo(userId: string, nuovoRuolo: string) {
  const caller = await verificaSuperAdmin()

  if (!RUOLI_VALIDI.includes(nuovoRuolo as RuoloValido)) {
    throw new Error('Ruolo non valido')
  }

  if (userId === caller.id && nuovoRuolo !== 'super_admin') {
    throw new Error('Non puoi togliere il ruolo super_admin a te stesso')
  }

  await prisma.user.update({
    where: { id: userId },
    data: { role: nuovoRuolo as RuoloValido },
  })

  revalidatePath('/admin/users')
}

export async function togglaSospensione(userId: string, sospendi: boolean) {
  const caller = await verificaSuperAdmin()

  if (sospendi && userId === caller.id) {
    throw new Error('Non puoi sospendere te stesso')
  }

  await prisma.user.update({
    where: { id: userId },
    data: { suspended: sospendi },
  })

  revalidatePath('/admin/users')
}
