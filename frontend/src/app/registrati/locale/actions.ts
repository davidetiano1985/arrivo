'use server'

import { redirect } from 'next/navigation'

import { sendAdminNotificationEmail } from '@/lib/email'
import { prisma } from '@/lib/prisma'

export async function inviaRichiestaLocale(
  formData: FormData,
): Promise<{ error: string } | void> {
  const nome = (formData.get('nome-attivita') as string | null)?.trim() ?? ''
  const tipo = (formData.get('tipo-attivita') as string | null)?.trim() ?? ''
  const citta = (formData.get('citta') as string | null)?.trim() ?? ''
  const email = (formData.get('email-referente') as string | null)?.toLowerCase().trim() ?? ''
  const telefono = (formData.get('telefono') as string | null)?.trim() ?? ''

  if (!nome || !citta || !email) {
    return { error: 'Nome attività, città e email sono obbligatori.' }
  }

  const esistente = await prisma.localeRequest.findFirst({
    where: { email, status: 'pending' },
  })
  if (esistente) {
    return { error: 'Abbiamo già una richiesta con questa email. Ti risponderemo entro 48 ore.' }
  }

  await prisma.localeRequest.create({
    data: {
      nome,
      tipo: tipo || null,
      citta,
      email,
      telefono: telefono || null,
    },
  })

  try {
    await sendAdminNotificationEmail({ nome, tipo, citta, email, telefono })
  } catch {
    // Notifica non bloccante — i dati sono già salvati nel DB
  }

  redirect('/registrazione-locale-inviata')
}
