import { defineConfig, env } from 'prisma/config'

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    seed: 'node prisma/seed-super-admin.cjs',
  },
  datasource: {
    url: env('DATABASE_URL'),
  },
})
