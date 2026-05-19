import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Public health-check endpoint — used by GitHub Actions deploy pipeline.
// Returns 200 when the app + DB are reachable, 503 otherwise.
export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`
    return NextResponse.json({ status: 'ok', ts: Date.now() }, { status: 200 })
  } catch (err) {
    console.error('[health] DB check failed:', err)
    return NextResponse.json({ status: 'error', ts: Date.now() }, { status: 503 })
  }
}
