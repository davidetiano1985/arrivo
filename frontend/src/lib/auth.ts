import { PrismaAdapter } from '@auth/prisma-adapter'
import bcrypt from 'bcryptjs'
import type { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'

import { prisma }                              from './prisma'
import { emitEvent }                          from './eventBus'
import { trackIPFailedLogin, isIPBlocked }    from './securityIntelligence'

// ── How long a JWT stays valid ────────────────────────────────────────────────
// Previously missing → NextAuth defaulted to 30 days (!)
// Now explicit: 24 hours. [Fix H4]
const JWT_MAX_AGE = 24 * 60 * 60 // seconds

// ── How often we re-check the DB for suspension / tokenVersion change ─────────
// Balance between security (fast detection) and DB load.
// 5 min = max window a suspended user could still act.  [Fix H1]
const SUSPENSION_RECHECK_MS = 5 * 60 * 1000

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: { strategy: 'jwt', maxAge: JWT_MAX_AGE },
  pages: { signIn: '/login', error: '/login' },

  providers: [
    // GoogleProvider is only initialized when both credentials are present.
    // If GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET are missing or empty the
    // provider is skipped entirely — prevents "client_id is required" errors.
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [GoogleProvider({
          clientId:     process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          allowDangerousEmailAccountLinking: true,
          authorization: {
            params: {
              // 'consent' forces Google to show the full authorization screen on
              // every login — no silent re-authorization, no "bypass" perception.
              prompt:      'consent',
              access_type: 'online',
            },
          },
        })]
      : []),

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

        // ── IP block check — fail fast before any DB query ────────────────────
        const blocked = await isIPBlocked(ip)
        if (blocked) {
          emitEvent({
            type:      'security_alert',
            category:  'security',
            ipAddress: ip,
            data:      { reason: 'ip_blocked_attempt', email: credentials.email },
          })
          return null
        }

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
            emitEvent({ type: 'login_fail', category: 'security', userId: user.id, userEmail: user.email, ipAddress: ip })
          }
          return null
        }

        // Suspended: log the attempt for audit but don't touch loginAttempts.
        if (user.suspended) {
          await prisma.loginEvent.create({
            data: { userId: user.id, success: false, ipAddress: ip, provider: 'credentials' },
          }).catch(() => {})
          emitEvent({ type: 'login_fail', category: 'security', userId: user.id, userEmail: user.email, ipAddress: ip, data: { reason: 'suspended' } })
          return null
        }

        const valid = await bcrypt.compare(credentials.password, user.password)
        if (!valid) {
          // Wrong password — increment the loginAttempts counter
          const newAttempts = (user.loginAttempts ?? 0) + 1
          await prisma.$transaction([
            prisma.loginEvent.create({
              data: { userId: user.id, success: false, ipAddress: ip, provider: 'credentials' },
            }),
            prisma.user.update({
              where: { id: user.id },
              data:  { loginAttempts: { increment: 1 } },
            }),
          ]).catch(() => {})
          // Emit with attempt count — triggers severity boost for brute-force
          emitEvent({
            type:      newAttempts >= 10 ? 'brute_force' : 'login_fail',
            category:  'security',
            userId:    user.id,
            userEmail: user.email,
            ipAddress: ip,
            data:      { attempts: newAttempts },
          })

          // Track in Redis sliding window — may auto-block the IP
          trackIPFailedLogin(ip, user.email).catch(() => {})

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
        emitEvent({ type: 'login_success', category: 'user', userId: user.id, userEmail: user.email, ipAddress: ip })

        return {
          id:           user.id,
          email:        user.email,
          name:         user.name ?? '',
          role:         user.role,
          firstName:    user.firstName ?? '',
          hasPassword:  true,
          tokenVersion: user.tokenVersion, // [Fix H1] stored in JWT for revocation checks
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
          const p = profile as { given_name?: string; family_name?: string } | undefined
          const gFirst = p?.given_name?.trim()  ?? ''
          const gLast  = p?.family_name?.trim() ?? ''

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

          await prisma.loginEvent.create({
            data: { userId: dbUser.id, success: true, provider: 'google' },
          }).catch(() => {})
          emitEvent({ type: 'login_success', category: 'user', userId: dbUser.id, userEmail: dbUser.email, data: { provider: 'google' } })
        }

        // [Fix M6] Opportunistic cleanup of expired VerificationTokens.
        // Runs once per Google login — fire-and-forget, never blocks auth.
        prisma.verificationToken
          .deleteMany({ where: { expires: { lt: new Date() } } })
          .catch(() => {})
      } catch (err) {
        console.error('[auth] signIn Google error:', err)
        return false
      }

      return true
    },

    // ── jwt ────────────────────────────────────────────────────────────────
    async jwt({ token, user, trigger }) {
      // ── Trigger: client called update() ───────────────────────────────────
      if (trigger === 'update') {
        const id = token.id as string | undefined
        if (id) {
          try {
            const dbUser = await prisma.user.findUnique({ where: { id } })
            if (dbUser) {
              token.firstName         = dbUser.firstName        ?? ''
              token.role              = dbUser.role
              token.profileIncomplete = dbUser.profileIncomplete ?? false
              token.tokenVersion      = dbUser.tokenVersion       // [Fix H1]
              token.suspended         = dbUser.suspended
              if (dbUser.suspended) token.invalid = true
            }
          } catch (err) {
            console.error('[auth] jwt update lookup error:', err)
          }
        }
        return token
      }

      // ── Initial sign-in ───────────────────────────────────────────────────
      if (user) {
        const u = user as {
          role?: string
          firstName?: string
          hasPassword?: boolean
          email?: string
          tokenVersion?: number // [Fix H1]
        }

        // Credentials path — role is already on the user object
        if (u.role) {
          token.id               = user.id
          token.role             = u.role
          token.firstName        = u.firstName ?? ''
          token.hasPassword      = u.hasPassword ?? false
          token.profileIncomplete = false
          token.tokenVersion     = u.tokenVersion ?? 0 // [Fix H1]
          token.sessionCheck     = Date.now()
          return token
        }

        // Google OAuth path — resolve by email
        const email = u.email?.toLowerCase().trim() ?? (token.email as string | undefined)
        if (!email) return token

        try {
          const dbUser = await prisma.user.findUnique({ where: { email } })
          token.id               = dbUser?.id          ?? user.id
          token.role             = dbUser?.role         ?? 'cliente'
          token.firstName        = dbUser?.firstName    ?? ''
          token.hasPassword      = dbUser?.password     ? true : false
          token.profileIncomplete = dbUser?.profileIncomplete ?? false
          token.tokenVersion     = dbUser?.tokenVersion ?? 0 // [Fix H1]
          token.sessionCheck     = Date.now()
        } catch (err) {
          console.error('[auth] jwt Google lookup error:', err)
          token.role             = (token.role             as string)  ?? 'cliente'
          token.firstName        = (token.firstName        as string)  ?? ''
          token.hasPassword      = (token.hasPassword      as boolean) ?? false
          token.profileIncomplete = (token.profileIncomplete as boolean) ?? false
          token.tokenVersion     = (token.tokenVersion     as number)  ?? 0
        }

        return token
      }

      // ── Periodic suspension + forced-logout check ─────────────────────────
      // [Fix H1] Runs at most once every SUSPENSION_RECHECK_MS per session.
      // Detects: admin suspended the user, or tokenVersion was incremented
      // (forced logout). Fail-open: a DB timeout won't lock out the user.
      const tokenId = token.id as string | undefined
      if (tokenId && !token.invalid) {
        const now       = Date.now()
        const lastCheck = (token.sessionCheck as number) ?? 0

        if (now - lastCheck > SUSPENSION_RECHECK_MS) {
          try {
            const dbUser = await prisma.user.findUnique({
              where:  { id: tokenId },
              select: { suspended: true, tokenVersion: true },
            })
            if (dbUser) {
              const storedVersion = token.tokenVersion as number | undefined
              if (
                dbUser.suspended ||
                (storedVersion !== undefined && dbUser.tokenVersion !== storedVersion)
              ) {
                // Poison this token — session callback will clear the user,
                // all auth guards will redirect to login.
                return { ...token, invalid: true }
              }
              // Still valid — update checkpoint
              token.sessionCheck = now
            }
          } catch (err) {
            console.error('[auth] jwt suspension check error:', err)
            // Fail open: don't block user on DB timeout
          }
        }
      }

      return token
    },

    // ── session ────────────────────────────────────────────────────────────
    session({ session, token }) {
      // [Fix H1] Invalidated session: clear role + id so every auth guard
      // redirects to login on the next server render.
      if (token.invalid) {
        const u = session.user as Record<string, unknown>
        u.role  = ''
        u.id    = ''
        return session
      }

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
