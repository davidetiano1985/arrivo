'use server'

import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import { redirect } from 'next/navigation'

import { sendVerificationEmail } from '@/lib/email'
import { prisma } from '@/lib/prisma'

export async function registraCliente(
  formData: FormData,
): Promise<{ error: string } | void> {
  const name = (formData.get('nome') as string | null)?.trim() ?? ''
  const email = (formData.get('email') as string | null)?.toLowerCase().trim() ?? ''
  const password = (formData.get('password') as string | null) ?? ''
  const conferma = (formData.get('conferma-password') as string | null) ?? ''

  if (!name || !email || !password) return { error: 'Tutti i campi sono obbligatori.' }
  if (password.length < 8) return { error: 'La password deve avere almeno 8 caratteri.' }
  if (password !== conferma) return { error: 'Le password non coincidono.' }

  const esistente = await prisma.user.findUnique({ where: { email } })
  if (esistente) {
    if (!esistente.emailVerified) {
      // Account esiste ma non verificato: reinvia email invece di bloccare
      const token = crypto.randomBytes(32).toString('hex')
      const expires = new Date(Date.now() + 24 * 60 * 60 * 1000)
      await prisma.verificationToken.deleteMany({ where: { identifier: email } })
      await prisma.verificationToken.create({ data: { identifier: email, token, expires } })
      await sendVerificationEmail(email, token)
      redirect('/verifica-email')
    }
    return { error: 'Questa email è già registrata.' }
  }

  const hashed = await bcrypt.hash(password, 12)

  await prisma.user.create({
    data: { name, email, password: hashed, role: 'cliente' },
  })

  const token = crypto.randomBytes(32).toString('hex')
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000)

  await prisma.verificationToken.deleteMany({ where: { identifier: email } })
  await prisma.verificationToken.create({
    data: { identifier: email, token, expires },
  })

  await sendVerificationEmail(email, token)

  redirect('/verifica-email')
}
