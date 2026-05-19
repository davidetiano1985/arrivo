'use server'

import { revalidatePath } from 'next/cache'
import { getServerSession } from 'next-auth'

import { authOptions } from '@/lib/auth'
import { logAdminAction } from '@/lib/adminLog'
import { prisma } from '@/lib/prisma'

async function verificaSuperAdmin() {
  const session = await getServerSession(authOptions)
  if (!session) throw new Error('Non autenticato')
  const u = session.user as { role: string; id: string; email?: string }
  if (u.role !== 'super_admin') throw new Error('Accesso negato')
  return { id: u.id, email: u.email ?? 'admin@arrivo' }
}

export async function risolviAlert(id: string): Promise<{ error?: string }> {
  try {
    const admin = await verificaSuperAdmin()

    const alert = await prisma.systemAlert.findUnique({ where: { id } })
    if (!alert)             return { error: 'Alert non trovato' }
    if (alert.resolved)     return { error: 'Alert già risolto' }

    await prisma.systemAlert.update({
      where: { id },
      data: {
        resolved:   true,
        resolvedAt: new Date(),
        resolvedBy: admin.email,
      },
    })

    await logAdminAction({
      adminId:    admin.id,
      adminEmail: admin.email,
      targetEmail: 'system',
      action:     'RESOLVE_ALERT',
      details:    `Alert risolto: ${alert.title} (${alert.severity})`,
    })

    revalidatePath('/admin/alert')
    revalidatePath('/admin')
    return {}
  } catch (err) {
    return { error: (err as Error).message }
  }
}

export async function creaAlert(data: {
  type:        string
  severity:    string
  title:       string
  description?: string
}): Promise<{ error?: string }> {
  try {
    await verificaSuperAdmin()

    if (!data.title?.trim()) return { error: 'Titolo obbligatorio' }

    await prisma.systemAlert.create({
      data: {
        type:        data.type        || 'system',
        severity:    data.severity    || 'medium',
        title:       data.title.trim(),
        description: data.description?.trim() || null,
      },
    })

    revalidatePath('/admin/alert')
    return {}
  } catch (err) {
    return { error: (err as Error).message }
  }
}
