import { getToken } from 'next-auth/jwt'
import { type NextRequest, NextResponse } from 'next/server'

import { prisma }           from '@/lib/prisma'
import { withApiMetrics }   from '@/lib/apiMetrics'

async function handleGET(req: NextRequest) {
  const token = await getToken({ req })
  if (!token || (token.role as string) !== 'super_admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

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
