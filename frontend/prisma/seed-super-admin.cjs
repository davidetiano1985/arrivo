'use strict'

const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const BCRYPT_ROUNDS = 12

async function main() {
  const email = process.env.SUPER_ADMIN_EMAIL?.trim().toLowerCase()
  const name = process.env.SUPER_ADMIN_NAME?.trim() || 'Super Admin'
  const rawPassword = process.env.SUPER_ADMIN_PASSWORD

  if (!email) throw new Error('SUPER_ADMIN_EMAIL è obbligatorio')
  if (!rawPassword) throw new Error('SUPER_ADMIN_PASSWORD è obbligatorio')
  if (rawPassword.length < 12) throw new Error('SUPER_ADMIN_PASSWORD deve avere almeno 12 caratteri')

  const dbUrl = process.env.DATABASE_URL
  if (!dbUrl) throw new Error('DATABASE_URL è obbligatorio')

  const prisma = new PrismaClient({ datasourceUrl: dbUrl })

  try {
    const password = await bcrypt.hash(rawPassword, BCRYPT_ROUNDS)

    const user = await prisma.user.upsert({
      where: { email },
      update: {
        name,
        password,
        role: 'super_admin',
        suspended: false,
      },
      create: {
        email,
        name,
        password,
        role: 'super_admin',
        suspended: false,
      },
    })

    console.log(`Super admin pronto: ${user.email} | ruolo: ${user.role}`)
  } finally {
    await prisma.$disconnect()
  }
}

main().catch((error) => {
  console.error(error.message)
  process.exit(1)
})
