import { type NextRequest, NextResponse } from 'next/server'

import { prisma }            from '@/lib/prisma'
import { requireSuperAdmin } from '@/lib/admin-auth'

export async function GET(req: NextRequest) {
  const auth = await requireSuperAdmin(req)
  if (!auth.ok) return auth.response

  const url = new URL(req.url)
  const q   = url.searchParams.get('q')?.trim() ?? ''

  if (q.length < 2) {
    return NextResponse.json({ users: [], restaurants: [], logs: [] })
  }

  // Numeric ID shortcut
  const numericId =
    q.startsWith('#')
      ? parseInt(q.slice(1), 10)
      : /^\d+$/.test(q)
      ? parseInt(q, 10)
      : null

  const [users, restaurants, logs] = await Promise.all([
    prisma.user.findMany({
      where: {
        OR: [
          ...(numericId !== null && !isNaN(numericId) ? [{ numericId }] : []),
          { firstName: { contains: q, mode: 'insensitive' as const } },
          { lastName:  { contains: q, mode: 'insensitive' as const } },
          { email:     { contains: q, mode: 'insensitive' as const } },
        ],
      },
      select: {
        id: true, numericId: true, firstName: true, lastName: true,
        email: true, role: true, suspended: true,
      },
      take: 8,
    }),

    prisma.restaurant.findMany({
      where: {
        OR: [
          { name:  { contains: q, mode: 'insensitive' as const } },
          { email: { contains: q, mode: 'insensitive' as const } },
          { city:  { contains: q, mode: 'insensitive' as const } },
          { slug:  { contains: q, mode: 'insensitive' as const } },
        ],
      },
      select: { id: true, name: true, city: true, status: true, slug: true },
      take: 5,
    }),

    prisma.adminLog.findMany({
      where: {
        OR: [
          { targetEmail: { contains: q, mode: 'insensitive' as const } },
          { adminEmail:  { contains: q, mode: 'insensitive' as const } },
          { action:      { contains: q, mode: 'insensitive' as const } },
        ],
      },
      select: {
        id: true, createdAt: true, action: true,
        adminEmail: true, targetEmail: true, details: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
  ])

  return NextResponse.json({ users, restaurants, logs })
}
