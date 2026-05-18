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
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === 'google' && user.id) {
        const dbUser = await prisma.user.findUnique({ where: { id: user.id } })
        if (dbUser?.suspended) return false
        // Google confirms email ownership — auto-verify if not already done
        if (!dbUser?.emailVerified) {
          await prisma.user.update({
            where: { id: user.id },
            data: { emailVerified: new Date() },
          })
        }
      }
      return true
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        const u = user as { role?: string; firstName?: string }
        if (u.role) {
          // credentials sign-in: role and firstName already in the user object
          token.role = u.role
          token.firstName = u.firstName ?? ''
        } else if (user.id) {
          // OAuth sign-in: fetch from DB
          const dbUser = await prisma.user.findUnique({ where: { id: user.id } })
          token.role = dbUser?.role ?? 'cliente'
          token.firstName = dbUser?.firstName ?? ''
        }
      }
      return token
    },
    session({ session, token }) {
      if (session.user) {
        (session.user as { role: string }).role = token.role as string;
        (session.user as { id: string }).id = token.id as string;
        (session.user as { firstName: string }).firstName = (token.firstName as string) ?? '';
      }
      return session
    },
  },
}
