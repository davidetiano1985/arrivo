import { PrismaAdapter } from '@auth/prisma-adapter'
import bcrypt from 'bcryptjs'
import type { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'

import { prisma } from './prisma'

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: { strategy: 'jwt' },
  pages: { signIn: '/login', error: '/login' },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      // allows linking Google to an existing email/password account
      allowDangerousEmailAccountLinking: true,
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const user = await prisma.user.findUnique({
          where: { email: credentials.email.toLowerCase().trim() },
        })

        if (!user || !user.password || user.suspended || !user.emailVerified) return null

        const valid = await bcrypt.compare(credentials.password, user.password)
        if (!valid) return null

        return {
          id: user.id,
          email: user.email,
          name: user.name ?? '',
          role: user.role,
          firstName: user.firstName ?? '',
          hasPassword: true,
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === 'google') {
        // Require email from Google profile
        if (!user.email) return false

        try {
          // Look up by email — safe even when the DB row doesn't exist yet
          // (new users: adapter creates the row after signIn returns true)
          const dbUser = await prisma.user.findUnique({ where: { email: user.email } })

          if (dbUser?.suspended) return false

          // Auto-verify for existing email/password accounts linking Google.
          // New Google-only users get emailVerified set by the adapter on creation.
          if (dbUser && !dbUser.emailVerified) {
            await prisma.user.update({
              where: { email: user.email },
              data: { emailVerified: new Date() },
            })
          }
        } catch (err) {
          console.error('[signIn] Google callback DB error:', err)
          return false
        }
      }
      return true
    },
    async jwt({ token, user, trigger }) {
      if (trigger === 'update' && token.id) {
        const dbUser = await prisma.user.findUnique({ where: { id: token.id as string } })
        if (dbUser) {
          token.firstName = dbUser.firstName ?? ''
          token.role = dbUser.role
        }
        return token
      }
      if (user) {
        token.id = user.id
        const u = user as { role?: string; firstName?: string; hasPassword?: boolean }
        if (u.role) {
          // credentials sign-in: role and firstName already in the user object
          token.role = u.role
          token.firstName = u.firstName ?? ''
          token.hasPassword = u.hasPassword ?? false
        } else if (user.id) {
          // OAuth sign-in: fetch from DB by id, fallback to email if row not yet committed
          let dbUser = await prisma.user.findUnique({ where: { id: user.id } })
          if (!dbUser && user.email) {
            dbUser = await prisma.user.findUnique({ where: { email: user.email } })
          }
          token.role = dbUser?.role ?? 'cliente'
          token.firstName = dbUser?.firstName ?? ''
          token.hasPassword = !!dbUser?.password
        }
      }
      return token
    },
    session({ session, token }) {
      if (session.user) {
        (session.user as { role: string }).role = token.role as string;
        (session.user as { id: string }).id = token.id as string;
        (session.user as { firstName: string }).firstName = (token.firstName as string) ?? '';
        (session.user as { hasPassword: boolean }).hasPassword = (token.hasPassword as boolean) ?? false;
      }
      return session
    },
  },
}
