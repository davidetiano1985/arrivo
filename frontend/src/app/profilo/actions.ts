'use server'

import bcrypt from 'bcryptjs'
import { getServerSession } from 'next-auth'

import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function aggiornaProfilo(
  firstName: string,
  lastName: string,
): Promise<{ error?: string; ok?: true }> {
  const session = await getServerSession(authOptions)
  if (!session?.user) return { error: 'Non autorizzato.' }

  const nome = firstName.trim().slice(0, 50)
  const cognome = lastName.trim().slice(0, 50)
  if (!nome) return { error: 'Il nome è obbligatorio.' }

  const id = (session.user as { id: string }).id
  const name = [nome, cognome].filter(Boolean).join(' ')

  await prisma.user.update({
    where: { id },
    data: {
      firstName:        nome,
      lastName:         cognome || null,
      name,
      profileIncomplete: false, // [Fix H2] clear the incomplete flag when profile is updated
    },
  })

  return { ok: true }
}

export async function cambiaPassword(
  currentPassword: string,
  newPassword: string,
  confirmPassword: string,
): Promise<{ error?: string; ok?: true }> {
  const session = await getServerSession(authOptions)
  if (!session?.user) return { error: 'Non autorizzato.' }

  if (!newPassword || newPassword.length < 8) {
    return { error: 'La nuova password deve essere di almeno 8 caratteri.' }
  }
  if (newPassword !== confirmPassword) {
    return { error: 'Le password non coincidono.' }
  }

  const id = (session.user as { id: string }).id
  const user = await prisma.user.findUnique({ where: { id } })
  if (!user) return { error: 'Utente non trovato.' }

  if (!user.password) {
    return { error: 'Hai effettuato l\'accesso con Google: non puoi impostare una password da qui.' }
  }

  const valid = await bcrypt.compare(currentPassword, user.password)
  if (!valid) return { error: 'Password attuale non corretta.' }

  const hashed = await bcrypt.hash(newPassword, 12)
  await prisma.user.update({ where: { id }, data: { password: hashed } })

  return { ok: true }
}
