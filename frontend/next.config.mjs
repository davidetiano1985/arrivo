/** @type {import('next').NextConfig} */
const nextConfig = {
  // Keep pg and Prisma server-side only — prevents accidental client bundle inclusion [build fix]
  serverExternalPackages: ['pg', '@prisma/client', '@prisma/adapter-pg', 'ioredis'],

  async headers() {
    // CSP: blocks external script injection while allowing Next.js inline hydration.
    // 'unsafe-inline' is required for Next.js — nonce-based CSP would need extra setup.
    const csp = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https://arrivoapp.it https://lh3.googleusercontent.com",
      "font-src 'self' data:",
      "connect-src 'self' https://accounts.google.com https://oauth2.googleapis.com",
      "frame-src 'none'",
      "frame-ancestors 'none'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join('; ')

    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
          { key: "Content-Security-Policy", value: csp },
        ],
      },
    ]
  },
}

export default nextConfig
