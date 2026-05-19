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
          // 'consent' forces Google to show the full authorization screen on
          // every login — no silent re-authorization, no "bypass" perception.
          // Every attempt is visually identical: account picker + allow button.
          // More explicit than 'select_account' (which skips the allow step
          // if the user has previously authorized this app).
          prompt: 'consent',
          access_type: 'online',
        },
      },
    }),

    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email:    { label: 'Email',    type: 'email'    },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) return null

        const ip = (req?.headers?.['x-real-ip'] as string | undefined)
          ?? (req?.headers?.['x-forwarded-for'] as string | undefined)?.split(',')[0]?.trim()
          ?? '127.0.0.1'

        const user = await prisma.user.findUnique({
          where: { email: credentials.email.toLowerCase().trim() },
        })

        // Hard gates that are NOT password-related — log attempt but do NOT
        // increment loginAttempts (counter is for "wrong password" only so that
        // "reset attempts" is meaningful to the admin).
        if (!user || !user.password || !user.emailVerified) {
          if (user?.id) {
            await prisma.loginEvent.create({
              data: { userId: user.id, success: false, ipAddress: ip, provider: 'credentials' },
            }).catch(() => {})
          }
          return null
        }

        // Suspended: log the attempt for audit but don't touch loginAttempts.
        if (user.suspended) {
          await prisma.loginEvent.create({
            data: { userId: user.id, success: false, ipAddress: ip, provider: 'credentials' },
          }).catch(() => {})
          return null
        }

        const valid = await bcrypt.compare(credentials.password, user.password)
        if (!valid) {
          // Wrong password — increment the loginAttempts counter
          await prisma.$transaction([
            prisma.loginEvent.create({
              data: { userId: user.id, success: false, ipAddress: ip, provider: 'credentials' },
            }),
            prisma.user.update({
              where: { id: user.id },
              data:  { loginAttempts: { increment: 1 } },
            }),
          ]).catch(() => {})
          return null
        }

        // Success — reset attempts counter, log event
        await prisma.$transaction([
          prisma.loginEvent.create({
            data: { userId: user.id, success: true, ipAddress: ip, provider: 'credentials' },
          }),
          prisma.user.update({
            where: { id: user.id },
            data:  { loginAttempts: 0 },
          }),
        ]).catch(() => {})

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
    async signIn({ user, account, profile }) {
      if (account?.provider !== 'google') return true

      // Google must always provide an email — hard gate
      const email = user.email?.toLowerCase().trim()
      if (!email) return false

      try {
        // Single query reused for auth logic, name save and LoginEvent.
        const dbUser = await prisma.user.findUnique({ where: { email } })

        // Block suspended users before anything else
        if (dbUser?.suspended) return false

        // Auto-verify email for existing email/password accounts now linking Google.
        if (dbUser && !dbUser.emailVerified) {
          await prisma.user.update({
            where: { email },
            data:  { emailVerified: new Date() },
          })
        }

        if (dbUser) {
          // ── Save nome + cognome from Google profile ─────────────────────
          // SOURCE: profile.given_name / profile.family_name (OAuth spec fields).
          // If either is missing → mark profileIncomplete so the guard popup
          // blocks the user until they fill in the data manually.
          const p = profile as { given_name?: string; family_name?: string } | undefined
          const gFirst = p?.given_name?.trim()  ?? ''
          const gLast  = p?.family_name?.trim() ?? ''

          // Prefer Google-provided value; fall back to whatever is already in DB
          // so manually-completed profiles are never overwritten with empty strings.
          const firstName = gFirst || (dbUser.firstName ?? '')
          const lastName  = gLast  || (dbUser.lastName  ?? '')
          const profileIncomplete = !firstName || !lastName

          await prisma.user.update({
            where: { email },
            data: {
              firstName:        firstName || null,
              lastName:         lastName  || null,
              name:             firstName && lastName ? `${firstName} ${lastName}` : (dbUser.name ?? null),
              profileIncomplete,
            },
          }).catch((e) => console.error('[auth] signIn name update error:', e))

          // Log successful Google login
          await prisma.loginEvent.create({
            data: { userId: dbUser.id, success: true, provider: 'google' },
          }).catch(() => {})
        }
      } catch (err) {
        console.error('[auth] signIn Google error:', err)
        return false
      }

      return true
    },

    // ── jwt ────────────────────────────────────────────────────────────────
    async jwt({ token, user, trigger }) {
      // Session refresh triggered by client update()
      if (trigger === 'update') {
        const id = token.id as string | undefined
        if (id) {
          try {
            const dbUser = await prisma.user.findUnique({ where: { id } })
            if (dbUser) {
              token.firstName        = dbUser.firstName        ?? ''
              token.role             = dbUser.role
              token.profileIncomplete = dbUser.profileIncomplete ?? false
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
          token.id               = user.id
          token.role             = u.role
          token.firstName        = u.firstName ?? ''
          token.hasPassword      = u.hasPassword ?? false
          token.profileIncomplete = false   // credentials users always have firstName/lastName
          return token
        }

        // Google OAuth: use email as the single source of truth — never user.id
        const email = u.email?.toLowerCase().trim() ?? (token.email as string | undefined)
        if (!email) return token

        try {
          // firstName/lastName have already been saved by the signIn callback above;
          // just read the final DB state (no profile manipulation needed here).
          const dbUser = await prisma.user.findUnique({ where: { email } })

          token.id               = dbUser?.id          ?? user.id
          token.role             = dbUser?.role         ?? 'cliente'
          token.firstName        = dbUser?.firstName    ?? ''
          token.hasPassword      = dbUser?.password     ? true : false
          token.profileIncomplete = dbUser?.profileIncomplete ?? false
        } catch (err) {
          console.error('[auth] jwt Google lookup error:', err)
          token.role             = (token.role             as string)  ?? 'cliente'
          token.firstName        = (token.firstName        as string)  ?? ''
          token.hasPassword      = (token.hasPassword      as boolean) ?? false
          token.profileIncomplete = (token.profileIncomplete as boolean) ?? false
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
          profileIncomplete: boolean
        }
        u.role             = (token.role             as string)  ?? 'cliente'
        u.id               = (token.id               as string)  ?? ''
        u.firstName        = (token.firstName        as string)  ?? ''
        u.hasPassword      = (token.hasPassword      as boolean) ?? false
        u.profileIncomplete = (token.profileIncomplete as boolean) ?? false
      }
      return session
    },
  },
}
