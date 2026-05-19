'use server'

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function completaProfiloGoogle(
  firstName: string,
  lastName: string,
): Promise<{ error?: string }> {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return { error: 'Non autenticato' }

    const userId = (session.user as { id?: string })?.id
    if (!userId) return { error: 'Sessione non valida' }

    const first = firstName.trim()
    const last  = lastName.trim()

    if (!first)         return { error: 'Il nome è obbligatorio' }
    if (!last)          return { error: 'Il cognome è obbligatorio' }
    if (first.length > 50) return { error: 'Nome troppo lungo (max 50 caratteri)' }
    if (last.length  > 50) return { error: 'Cognome troppo lungo (max 50 caratteri)' }

    await prisma.user.update({
      where: { id: userId },
      data: {
        firstName:        first,
        lastName:         last,
        name:             `${first} ${last}`,
        profileIncomplete: false,
      },
    })

    return {}
  } catch (err) {
    return { error: (err as Error).message }
  }
}
