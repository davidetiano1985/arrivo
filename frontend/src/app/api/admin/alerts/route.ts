import { getToken } from 'next-auth/jwt'
import { type NextRequest, NextResponse } from 'next/server'

import { prisma } from '@/lib/prisma'

// ── Computed alert types ──────────────────────────────────────────────────────

export type ComputedAlert = {
  id:          string
  type:        string
  severity:    'low' | 'medium' | 'high' | 'critical'
  title:       string
  description: string
  count:       number
}

async function buildComputedAlerts(): Promise<ComputedAlert[]> {
  const now            = new Date()
  const tenMinutesAgo  = new Date(now.getTime() -  10 * 60 * 1000)
  const oneHourAgo     = new Date(now.getTime() -  60 * 60 * 1000)

  const [
    bruteForceUsers,
    failedTenMin,
    failedOneHour,
    suspendedWithAttempts,
  ] = await Promise.all([
    // Users with >= 10 failed login attempts
    prisma.user.findMany({
      where: { loginAttempts: { gte: 10 } },
      select: { email: true, loginAttempts: true },
      take: 10,
    }),
    // Failed logins in last 10 min
    prisma.loginEvent.count({ where: { success: false, createdAt: { gte: tenMinutesAgo } } }),
    // Failed logins in last 1 h
    prisma.loginEvent.count({ where: { success: false, createdAt: { gte: oneHourAgo } } }),
    // Suspended users who still attempted login in last 24h
    prisma.user.count({
      where: {
        suspended: true,
        loginEvents: {
          some: {
            createdAt: { gte: new Date(now.getTime() - 24 * 60 * 60 * 1000) },
          },
        },
      },
    }),
  ])

  const alerts: ComputedAlert[] = []

  // Brute force per-user
  for (const u of bruteForceUsers) {
    const sev: ComputedAlert['severity'] = u.loginAttempts >= 20 ? 'critical' : u.loginAttempts >= 15 ? 'high' : 'medium'
    alerts.push({
      id:          `bf-${u.email}`,
      type:        'security',
      severity:    sev,
      title:       'Brute force rilevato',
      description: `${u.email} — ${u.loginAttempts} tentativi falliti accumulati`,
      count:       u.loginAttempts,
    })
  }

  // High failed-login rate in 10-min window
  if (failedTenMin > 10) {
    alerts.push({
      id:          'rate-10min',
      type:        'security',
      severity:    'critical',
      title:       'Attacco in corso',
      description: `${failedTenMin} login falliti negli ultimi 10 minuti`,
      count:       failedTenMin,
    })
  } else if (failedTenMin > 3) {
    alerts.push({
      id:          'rate-10min',
      type:        'security',
      severity:    'high',
      title:       'Spike login falliti',
      description: `${failedTenMin} login falliti negli ultimi 10 minuti`,
      count:       failedTenMin,
    })
  }

  // Elevated hourly failure rate
  if (failedOneHour > 50) {
    alerts.push({
      id:          'rate-1h',
      type:        'security',
      severity:    'high',
      title:       'Tasso fallimenti elevato (1h)',
      description: `${failedOneHour} login falliti nell'ultima ora`,
      count:       failedOneHour,
    })
  }

  // Suspended users trying to login
  if (suspendedWithAttempts > 0) {
    alerts.push({
      id:          'suspended-attempts',
      type:        'security',
      severity:    'medium',
      title:       'Utenti sospesi con tentativi di accesso',
      description: `${suspendedWithAttempts} utenti sospesi hanno tentato il login nelle ultime 24h`,
      count:       suspendedWithAttempts,
    })
  }

  return alerts
}

// ── GET ──────────────────────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  const token = await getToken({ req })
  if (!token || (token.role as string) !== 'super_admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const [stored, computed] = await Promise.all([
    prisma.systemAlert.findMany({
      orderBy: [{ resolved: 'asc' }, { createdAt: 'desc' }],
      take:    200,
    }),
    buildComputedAlerts(),
  ])

  return NextResponse.json({ stored, computed, timestamp: new Date().toISOString() })
}

// ── POST — resolve alert ──────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const token = await getToken({ req })
  if (!token || (token.role as string) !== 'super_admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json().catch(() => ({}))

  if (body.action === 'resolve' && typeof body.id === 'string') {
    await prisma.systemAlert.update({
      where: { id: body.id },
      data: {
        resolved:   true,
        resolvedAt: new Date(),
        resolvedBy: (token.email as string | undefined) ?? 'admin',
      },
    })
    return NextResponse.json({ ok: true })
  }

  if (body.action === 'create') {
    const alert = await prisma.systemAlert.create({
      data: {
        type:        body.type        ?? 'system',
        severity:    body.severity    ?? 'medium',
        title:       body.title       ?? 'Alert manuale',
        description: body.description ?? null,
        metadata:    body.metadata    ?? null,
      },
    })
    return NextResponse.json({ ok: true, alert })
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
}
