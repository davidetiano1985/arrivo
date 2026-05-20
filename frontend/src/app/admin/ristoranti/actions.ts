'use server'

import { getServerSession } from 'next-auth'
import { revalidatePath }   from 'next/cache'

import { logAdminAction } from '@/lib/adminLog'
import { authOptions }    from '@/lib/auth'
import { prisma }         from '@/lib/prisma'

type RestaurantStatus = 'pending' | 'approved' | 'rejected'

async function verificaSuperAdmin() {
  const session = await getServerSession(authOptions)
  if (!session) throw new Error('Non autenticato')
  const u = session.user as { role: string; id: string; email?: string }
  if (u.role !== 'super_admin') throw new Error('Accesso negato')
  return { id: u.id, email: u.email ?? 'admin@arrivo' }
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

// ── Crea locale ───────────────────────────────────────────────────────────────

export async function creaLocale(
  formData: FormData,
): Promise<{ error?: string; id?: string }> {
  try {
    const admin = await verificaSuperAdmin()

    const name        = (formData.get('name')        as string | null)?.trim() ?? ''
    const tipo        = (formData.get('tipo')         as string | null)?.trim() || null
    const address     = (formData.get('address')      as string | null)?.trim() || null
    const city        = (formData.get('city')         as string | null)?.trim() || null
    const zip         = (formData.get('zip')          as string | null)?.trim() || null
    const phone       = (formData.get('phone')        as string | null)?.trim() || null
    const email       = (formData.get('email')        as string | null)?.toLowerCase().trim() || null
    const description = (formData.get('description')  as string | null)?.trim() || null
    const hours       = (formData.get('hours')        as string | null)?.trim() || null
    const status      = ((formData.get('status')      as string | null) ?? 'pending') as RestaurantStatus
    const ownerId     = (formData.get('ownerId')      as string | null)?.trim() || null

    if (!name) return { error: 'Il nome del locale è obbligatorio' }

    // Generate unique slug
    let baseSlug = slugify(name)
    let slug     = baseSlug
    let attempt  = 1
    while (await prisma.restaurant.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${attempt++}`
    }

    const locale = await prisma.restaurant.create({
      data: { name, slug, tipo, address, city, zip, phone, email, description, hours, status, ownerId },
    })

    await logAdminAction({
      adminId:     admin.id,
      adminEmail:  admin.email,
      targetId:    locale.id,
      targetEmail: email ?? name,
      action:      'CREATE_LOCALE',
      details:     `"${name}" — stato: ${status}${ownerId ? ` — owner: ${ownerId}` : ''}`,
    })

    revalidatePath('/admin/ristoranti')
    return { id: locale.id }
  } catch (err) {
    return { error: (err as Error).message }
  }
}

// ── Aggiorna locale ───────────────────────────────────────────────────────────

export async function aggiornaLocale(
  localeId: string,
  formData: FormData,
): Promise<{ error?: string }> {
  try {
    const admin = await verificaSuperAdmin()

    const name        = (formData.get('name')        as string | null)?.trim() ?? ''
    const tipo        = (formData.get('tipo')         as string | null)?.trim() || null
    const address     = (formData.get('address')      as string | null)?.trim() || null
    const city        = (formData.get('city')         as string | null)?.trim() || null
    const zip         = (formData.get('zip')          as string | null)?.trim() || null
    const phone       = (formData.get('phone')        as string | null)?.trim() || null
    const email       = (formData.get('email')        as string | null)?.toLowerCase().trim() || null
    const description = (formData.get('description')  as string | null)?.trim() || null
    const hours       = (formData.get('hours')        as string | null)?.trim() || null
    const status      = ((formData.get('status')      as string | null) ?? 'pending') as RestaurantStatus
    const ownerId     = (formData.get('ownerId')      as string | null)?.trim() || null

    if (!name) return { error: 'Il nome del locale è obbligatorio' }

    const existing = await prisma.restaurant.findUnique({ where: { id: localeId } })
    if (!existing) return { error: 'Locale non trovato' }

    await prisma.restaurant.update({
      where: { id: localeId },
      data:  { name, tipo, address, city, zip, phone, email, description, hours, status, ownerId },
    })

    await logAdminAction({
      adminId:     admin.id,
      adminEmail:  admin.email,
      targetId:    localeId,
      targetEmail: email ?? name,
      action:      'EDIT_LOCALE',
      details:     `"${existing.name}" → "${name}" — stato: ${status}`,
    })

    revalidatePath('/admin/ristoranti')
    revalidatePath(`/admin/ristoranti/${localeId}`)
    return {}
  } catch (err) {
    return { error: (err as Error).message }
  }
}
