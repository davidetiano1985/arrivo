import { getToken } from 'next-auth/jwt'
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request })
  const baseUrl = process.env.NEXTAUTH_URL || 'https://arrivoapp.it'

  if (!token) {
    return NextResponse.redirect(new URL('/login', baseUrl))
  }

  if (token.role !== 'super_admin') {
    return NextResponse.redirect(new URL('/', baseUrl))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}
