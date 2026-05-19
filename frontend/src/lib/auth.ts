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
      allowDangerousEmailAccountLinking: true,
      authorization: {
        params: {
          // Always show Google account selector — prevents auto-skip of consent
          // screen when the user has previously authorized this app.
          // Without this, Google may silently re-authorize an already-approved
          // account, making the flow appear to "bypass" login on repeated attempts.
          prompt: 'select_account',
        },
      },
    }),

    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email:    { label: 'Email',    type: 'email'    },
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
          id:          user.id,
          email:       user.email,
          name:        user.name ?? '',
          role:        user.role,
          firstName:   user.firstName ?? '',
          hasPassword: true,
        }
      },
    }),
  ],

  callbacks: {
    // ── signIn ─────────────────────────────────────────────────────────────
    async signIn({ user, account }) {
      if (account?.provider !== 'google') return true

      // Google must always provide an email — hard gate
      const email = user.email?.toLowerCase().trim()
      if (!email) return false

      try {
        // All DB lookups use email — never user.id (which is the Google profile
        // ID before the adapter writes the row, not a valid DB UUID)
        const dbUser = await prisma.user.findUnique({ where: { email } })

        // Block suspended users before anything else
        if (dbUser?.suspended) return false

        // Auto-verify email for existing email/password accounts now linking Google.
        // Brand-new Google-only accounts: the adapter sets emailVerified on creation.
        if (dbUser && !dbUser.emailVerified) {
          await prisma.user.update({
            where: { email },
            data:  { emailVerified: new Date() },
          })
        }
      } catch (err) {
        console.error('[auth] signIn Google error:', err)
        return false
      }

      return true
    },

    // ── jwt ────────────────────────────────────────────────────────────────
    async jwt({ token, user, account, trigger, profile }) {
      // Session refresh triggered by client update()
      if (trigger === 'update') {
        const id = token.id as string | undefined
        if (id) {
          try {
            const dbUser = await prisma.user.findUnique({ where: { id } })
            if (dbUser) {
              token.firstName = dbUser.firstName ?? ''
              token.role      = dbUser.role
            }
          } catch (err) {
            console.error('[auth] jwt update lookup error:', err)
          }
        }
        return token
      }

      // First sign-in for this session
      if (user) {
        // Credentials: role + firstName are already on the user object
        const u = user as {
          role?: string
          firstName?: string
          hasPassword?: boolean
          email?: string
        }

        if (u.role) {
          token.id          = user.id
          token.role        = u.role
          token.firstName   = u.firstName ?? ''
          token.hasPassword = u.hasPassword ?? false
          return token
        }

        // Google OAuth: use email as the single source of truth — never user.id
        const email = u.email?.toLowerCase().trim() ?? token.email as string | undefined
        if (!email) return token

        try {
          const dbUser = await prisma.user.findUnique({ where: { email } })

          // Populate firstName/lastName from Google profile on first login.
          // The Prisma adapter creates the User with `name` (full display name)
          // but does NOT split it into firstName/lastName (custom fields).
          // We do that here once and persist it so the dashboard greeting works.
          let firstName = dbUser?.firstName ?? ''
          if (dbUser && !dbUser.firstName && profile) {
            const p = profile as {
              given_name?: string
              family_name?: string
              name?: string
            }
            firstName  = p.given_name  ?? (p.name?.trim().split(/\s+/)[0])  ?? ''
            const lastName = p.family_name ?? (p.name?.trim().split(/\s+/).slice(1).join(' ')) ?? ''
            if (firstName || lastName) {
              try {
                await prisma.user.update({
                  where: { email },
                  data: {
                    firstName: firstName  || null,
                    lastName:  lastName   || null,
                  },
                })
              } catch (updateErr) {
                console.error('[auth] jwt firstName update error:', updateErr)
              }
            }
          }

          token.id          = dbUser?.id ?? user.id   // DB id when available
          token.role        = dbUser?.role        ?? 'cliente'
          token.firstName   = firstName
          token.hasPassword = dbUser?.password    ? true : false
        } catch (err) {
          console.error('[auth] jwt Google lookup error:', err)
          // Keep any previously set token values; apply safe defaults for missing ones
          token.role        = (token.role        as string)  ?? 'cliente'
          token.firstName   = (token.firstName   as string)  ?? ''
          token.hasPassword = (token.hasPassword as boolean) ?? false
        }
      }

      return token
    },

    // ── session ────────────────────────────────────────────────────────────
    session({ session, token }) {
      if (session.user) {
        const u = session.user as {
          role: string
          id: string
          firstName: string
          hasPassword: boolean
        }
        u.role        = (token.role        as string)  ?? 'cliente'
        u.id          = (token.id          as string)  ?? ''
        u.firstName   = (token.firstName   as string)  ?? ''
        u.hasPassword = (token.hasPassword as boolean) ?? false
      }
      return session
    },
  },
}
