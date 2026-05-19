'use server'

import bcrypt from 'bcryptjs'
import { redirect } from 'next/navigation'

import { prisma } from '@/lib/prisma'

export async function reimpostaPassword(
  formData: FormData,
): Promise<{ error: string } | void> {
  const token    = (formData.get('token')    as string | null) ?? ''
  const password = (formData.get('password') as string | null) ?? ''
  const conferma = (formData.get('conferma') as string | null) ?? ''

  if (!token)                    return { error: 'Token mancante.' }
  if (password.length < 8)       return { error: 'La password deve avere almeno 8 caratteri.' }
  if (password !== conferma)     return { error: 'Le password non coincidono.' }

  const user = await prisma.user.findUnique({
    where: { passwordResetToken: token },
    select: { id: true, passwordResetExpires: true, email: true },
  })

  if (!user)                                          return { error: 'Link non valido o già utilizzato.' }
  if (!user.passwordResetExpires || user.passwordResetExpires < new Date()) {
    return { error: 'Il link è scaduto. Richiedine uno nuovo.' }
  }

  const hashed = await bcrypt.hash(password, 12)

  await prisma.user.update({
    where: { id: user.id },
    data: {
      password:            hashed,
      emailVerified:       new Date(),   // auto-verify if wasn't yet
      passwordResetToken:  null,
      passwordResetExpires: null,
      loginAttempts:       0,
    },
  })

  // [Fix M6] Opportunistic cleanup of expired VerificationTokens.
  // Fire-and-forget: failure must never block the password reset flow.
  prisma.verificationToken
    .deleteMany({ where: { expires: { lt: new Date() } } })
    .catch(() => {})

  redirect('/login?reset=1')
}
