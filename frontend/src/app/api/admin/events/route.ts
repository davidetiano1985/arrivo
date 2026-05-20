import { type NextRequest, NextResponse } from 'next/server'

import { prisma }            from '@/lib/prisma'
import { withApiMetrics }    from '@/lib/apiMetrics'
import { requireSuperAdmin } from '@/lib/admin-auth'

async function handleGET(req: NextRequest) {
  const auth = await requireSuperAdmin(req)
  if (!auth.ok) return auth.response

  const url    = new URL(req.url)
  const limit  = Math.min(100, Math.max(1, parseInt(url.searchParams.get('limit') ?? '50', 10)))

  const events = await prisma.loginEvent.findMany({
    orderBy: { createdAt: 'desc' },
    take:    limit,
    select: {
      id:        true,
      createdAt: true,
      success:   true,
      ipAddress: true,
      provider:  true,
      userId:    true,
      user: {
        select: { email: true, firstName: true, lastName: true, role: true },
      },
    },
  })

  return NextResponse.json({ events, timestamp: new Date().toISOString() })
}

export const GET = withApiMetrics('/api/admin/events', handleGET)
