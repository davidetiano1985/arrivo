import NextAuth, { DefaultSession } from 'next-auth'
import { JWT } from 'next-auth/jwt'

declare module 'next-auth' {
  interface Session {
    user: {
      id:                string
      role:              string
      firstName:         string
      hasPassword:       boolean
      profileIncomplete: boolean
    } & DefaultSession['user']
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id:                string
    role:              string
    firstName:         string
    hasPassword:       boolean
    profileIncomplete: boolean
  }
}
