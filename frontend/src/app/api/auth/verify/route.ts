import { NextRequest, NextResponse } from 'next/server'

import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  const baseUrl = process.env.NEXTAUTH_URL || 'https://arrivoapp.it'
  const token = request.nextUrl.searchParams.get('token')

  if (!token) {
    return NextResponse.redirect(new URL('/login', baseUrl))
  }

  const record = await prisma.verificationToken.findUnique({ where: { token } })

  if (!record || record.expires < new Date()) {
    if (record) await prisma.verificationToken.delete({ where: { token } })
    return NextResponse.redirect(new URL('/registrati?errore=link-scaduto', baseUrl))
  }

  await prisma.user.update({
    where: { email: record.identifier },
    data: { emailVerified: new Date() },
  })

  await prisma.verificationToken.delete({ where: { token } })

  return NextResponse.redirect(new URL('/email-verificata', baseUrl))
}
