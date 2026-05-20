import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'

import { authOptions } from '@/lib/auth'
import LoginForm from './LoginForm'

const ROLE_REDIRECT: Record<string, string> = {
  super_admin:    '/admin',
  gestore_locale: '/ristorante',
}

// Server component — reads NextAuth ?error= param before rendering
// Redirects already-authenticated users away from /login
export default async function LoginPage({
  searchParams,
}: {
  searchParams: { error?: string; callbackUrl?: string }
}) {
  // Only bypass when there's no OAuth error to display
  if (!searchParams.error) {
    const session = await getServerSession(authOptions)
    if (session?.user) {
      const role = (session.user as { role?: string })?.role ?? ''
      redirect(ROLE_REDIRECT[role] ?? searchParams.callbackUrl ?? '/')
    }
  }

  const googleEnabled = !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET)

  return (
    <LoginForm
      callbackUrl={searchParams.callbackUrl}
      errorParam={searchParams.error}
      googleEnabled={googleEnabled}
    />
  )
}
