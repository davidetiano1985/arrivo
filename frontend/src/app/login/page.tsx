import LoginForm from './LoginForm'

// Server component — reads NextAuth ?error= param before rendering
export default function LoginPage({
  searchParams,
}: {
  searchParams: { error?: string; callbackUrl?: string }
}) {
  return (
    <LoginForm
      callbackUrl={searchParams.callbackUrl}
      errorParam={searchParams.error}
    />
  )
}
