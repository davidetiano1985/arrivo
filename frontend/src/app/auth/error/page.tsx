/**
 * /auth/error
 *
 * NextAuth error landing page (pages.error in authOptions).
 * Receives ?error=<code> from NextAuth on OAuth failures.
 *
 * Shows user-friendly Italian messages — no stack traces, no technical details.
 * "Riprova con Google" starts a fresh OAuth flow (new state cookie).
 */

import AuthErrorClient from './AuthErrorClient'

export default function AuthErrorPage({
  searchParams,
}: {
  searchParams: { error?: string }
}) {
  return <AuthErrorClient error={searchParams.error} />
}
