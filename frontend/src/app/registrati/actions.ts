'use server'

import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import { redirect } from 'next/navigation'

import { sendVerificationEmail } from '@/lib/email'
import { prisma } from '@/lib/prisma'

export async function registraCliente(
  formData: FormData,
): Promise<{ error: string } | void> {
  const firstName = (formData.get('nome') as string | null)?.trim() ?? ''
  const lastName = (formData.get('cognome') as string | null)?.trim() ?? ''
  const name = [firstName, lastName].filter(Boolean).join(' ')
  const email = (formData.get('email') as string | null)?.toLowerCase().trim() ?? ''
  const password = (formData.get('password') as string | null) ?? ''
  const conferma = (formData.get('conferma-password') as string | null) ?? ''

  if (!firstName || !lastName || !email || !password) return { error: 'Tutti i campi sono obbligatori.' }
  if (password.length < 8) return { error: 'La password deve avere almeno 8 caratteri.' }
  if (password !== conferma) return { error: 'Le password non coincidono.' }

  const esistente = await prisma.user.findUnique({ where: { email } })
  if (esistente) {
    if (!esistente.emailVerified) {
      // Unverified: resend verification instead of blocking
      const token = crypto.randomBytes(32).toString('hex')
      const expires = new Date(Date.now() + 24 * 60 * 60 * 1000)
      await prisma.verificationToken.deleteMany({ where: { identifier: email } })
      await prisma.verificationToken.create({ data: { identifier: email, token, expires } })
      await sendVerificationEmail(email, token, esistente.firstName ?? '')
      redirect('/verifica-email')
    }
    // Distinguish Google-only accounts from email/password accounts
    if (!esistente.password) {
      return {
        error: 'Questa email è già registrata tramite Google. Clicca "Accedi con Google" per entrare.',
      }
    }
    return {
      error: 'Questa email è già registrata. Accedi con le tue credenziali.',
    }
  }

  const hashed = await bcrypt.hash(password, 12)

  // Se c'è già un locale approvato con questa email, il ruolo iniziale è gestore_locale
  const localeApprovato = await prisma.localeRequest.findFirst({
    where: { email, status: 'approved' },
  })
  const ruolo = localeApprovato ? 'gestore_locale' : 'cliente'

  await prisma.user.create({
    data: { name, firstName, lastName, email, password: hashed, role: ruolo },
  })

  const token = crypto.randomBytes(32).toString('hex')
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000)

  await prisma.verificationToken.deleteMany({ where: { identifier: email } })
  await prisma.verificationToken.create({
    data: { identifier: email, token, expires },
  })

  await sendVerificationEmail(email, token, firstName)

  redirect('/verifica-email')
}
