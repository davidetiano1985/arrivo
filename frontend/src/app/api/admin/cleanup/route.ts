/**
 * POST /api/admin/cleanup
 *
 * Triggers the data retention cleanup job.
 * Requires super_admin JWT or CLEANUP_SECRET header (for cron use).
 *
 * Cron usage (VPS crontab):
 *   0 3 * * * curl -s -X POST https://arrivoapp.it/api/admin/cleanup \
 *     -H "x-cleanup-secret: $CLEANUP_SECRET" >> /var/log/arrivo-cleanup.log 2>&1
 */

import { type NextRequest, NextResponse } from 'next/server'

import { runRetentionCleanup } from '@/lib/cleanup'
import { requireSuperAdmin }   from '@/lib/admin-auth'

const CLEANUP_SECRET = process.env.CLEANUP_SECRET

export async function POST(req: NextRequest) {
  // Auth: super_admin session OR shared secret (for cron)
  const secretHeader = req.headers.get('x-cleanup-secret')
  const isSecretAuth = CLEANUP_SECRET && secretHeader === CLEANUP_SECRET

  if (!isSecretAuth) {
    const auth = await requireSuperAdmin(req)
    if (!auth.ok) return auth.response
  }

  try {
    const result = await runRetentionCleanup()
    return NextResponse.json({ ok: true, result })
  } catch (err) {
    console.error('[cleanup route] error:', err)
    return NextResponse.json(
      { ok: false, error: String(err) },
      { status: 500 }
    )
  }
}
