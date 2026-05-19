import { getToken } from 'next-auth/jwt'
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

// ─── In-memory rate limiter ──────────────────────────────────────────────────
// Works in single-process PM2 fork mode. Not suitable for multi-process clusters.

type RLEntry = { count: number; resetAt: number }
const rl = new Map<string, RLEntry>()

const LIMITS: Record<string, { windowMs: number; max: number }> = {
  '/api/auth/callback/credentials': { windowMs: 15 * 60_000, max: 10 },
  '/api/auth/verify':               { windowMs: 60 * 60_000, max: 20 },
  '/registrati':                    { windowMs: 60 * 60_000, max: 8  },
  '/registrati/locale':             { windowMs: 60 * 60_000, max: 5  },
}

// Prune stale entries every ~500 calls to prevent unbounded memory growth
let pruneCounter = 0
function maybeprune() {
  if (++pruneCounter < 500) return
  pruneCounter = 0
  const now = Date.now()
  rl.forEach((v, k) => { if (now > v.resetAt) rl.delete(k) })
}

function getIp(req: NextRequest): string {
  return (
    req.headers.get('x-real-ip') ??
    req.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
    '127.0.0.1'
  )
}

function isRateLimited(path: string, ip: string): boolean {
  const cfg = LIMITS[path]
  if (!cfg) return false

  maybeprune()

  const now = Date.now()
  const key = `${path}:${ip}`
  const entry = rl.get(key)

  if (!entry || now > entry.resetAt) {
    rl.set(key, { count: 1, resetAt: now + cfg.windowMs })
    return false
  }

  if (entry.count >= cfg.max) return true
  entry.count++
  return false
}

// ─── Routes that only need rate limiting, not auth ───────────────────────────
const PUBLIC_RATE_LIMITED = new Set([
  '/api/auth/callback/credentials',
  '/api/auth/verify',
  '/registrati',
  '/registrati/locale',
])

// ─── Middleware entry point ──────────────────────────────────────────────────

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const ip = getIp(request)

  // 1. Rate limit public endpoints (POST + verify GET)
  if (PUBLIC_RATE_LIMITED.has(pathname)) {
    const isPost = request.method === 'POST'
    const isVerify = pathname === '/api/auth/verify'
    if ((isPost || isVerify) && isRateLimited(pathname, ip)) {
      return new NextResponse(
        JSON.stringify({ error: 'Troppe richieste. Riprova tra qualche minuto.' }),
        {
          status: 429,
          headers: { 'Content-Type': 'application/json', 'Retry-After': '60' },
        },
      )
    }
    return NextResponse.next()
  }

  // 2. Auth protection for private areas (/admin, /ristorante)
  const token = await getToken({ req: request })
  const baseUrl = process.env.NEXTAUTH_URL || 'https://arrivoapp.it'

  if (!token) {
    return NextResponse.redirect(new URL('/login', baseUrl))
  }

  if (pathname.startsWith('/admin') && token.role !== 'super_admin') {
    return NextResponse.redirect(new URL('/', baseUrl))
  }

  if (
    pathname.startsWith('/ristorante') &&
    token.role !== 'gestore_locale' &&
    token.role !== 'super_admin'
  ) {
    return NextResponse.redirect(new URL('/', baseUrl))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/ristorante/:path*',
    '/api/auth/callback/credentials',
    '/api/auth/verify',
    '/registrati',
    '/registrati/locale',
  ],
}
