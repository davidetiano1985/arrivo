'use client'

import { signOut } from 'next-auth/react'

export default function LogoutButton({ mobile = false }: { mobile?: boolean }) {
  if (mobile) {
    return (
      <button
        onClick={() => signOut({ callbackUrl: '/login' })}
        className="rounded-full border border-white/10 px-4 py-2 text-sm font-black text-white/75 transition hover:border-red-500 hover:text-red-400"
      >
        Esci
      </button>
    )
  }

  return (
    <button
      onClick={() => signOut({ callbackUrl: '/login' })}
      className="w-full rounded-2xl px-4 py-3 text-left text-sm font-black text-white/50 transition hover:bg-red-600 hover:text-white"
    >
      Esci
    </button>
  )
}
