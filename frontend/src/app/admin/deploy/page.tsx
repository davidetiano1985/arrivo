import { getServerSession }    from 'next-auth'
import { redirect }             from 'next/navigation'
import Link                     from 'next/link'
import fs                       from 'fs'
import path                     from 'path'

import { authOptions }   from '@/lib/auth'
import { prisma }        from '@/lib/prisma'
import { redisPub }      from '@/lib/redis'

export const dynamic = 'force-dynamic'

type DeployInfo = {
  commit:      string
  commitShort: string
  commitMsg:   string
  deployer:    string
  deployedAt:  string
  status:      'success' | 'rolled_back' | 'build_failed' | string
  rollbackAt?: string
}

function fmt(iso: string | null | undefined) {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('it-IT', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  })
}

function fmtDuration(sec: number) {
  if (sec < 60)   return `${sec}s`
  if (sec < 3600) return `${Math.floor(sec / 60)}m ${sec % 60}s`
  const h = Math.floor(sec / 3600)
  const m = Math.floor((sec % 3600) / 60)
  return `${h}h ${m}m`
}

export default async function DeployPage() {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as { role?: string })?.role !== 'super_admin') redirect('/login')

  // Read deploy info
  let deploy: DeployInfo | null = null
  try {
    const p = path.join(process.cwd(), '.deploy-info.json')
    if (fs.existsSync(p)) {
      deploy = JSON.parse(fs.readFileSync(p, 'utf-8')) as DeployInfo
    }
  } catch { /* no file yet */ }

  // DB probe
  const t0 = performance.now()
  let dbStatus:  'ok' | 'slow' | 'error' = 'ok'
  let dbLatency  = 0
  try {
    await prisma.$queryRaw`SELECT 1`
    dbLatency = Math.round(performance.now() - t0)
    if (dbLatency > 200) dbStatus = 'slow'
  } catch {
    dbStatus  = 'error'
    dbLatency = -1
  }

  // Redis probe
  const tR = performance.now()
  let redisStatus:  'ok' | 'slow' | 'error' = 'ok'
  let redisLatency  = 0
  try {
    await redisPub.ping()
    redisLatency = Math.round(performance.now() - tR)
    if (redisLatency > 50) redisStatus = 'slow'
  } catch {
    redisStatus  = 'error'
    redisLatency = -1
  }

  // Process stats
  const mem        = process.memoryUsage()
  const uptimeSec  = Math.round(process.uptime())
  const memUsedMB  = Math.round(mem.heapUsed  / 1024 / 1024)
  const memTotalMB = Math.round(mem.heapTotal / 1024 / 1024)
  const memPercent = Math.round((memUsedMB / memTotalMB) * 100)

  // Prisma migration tracking
  const migrations = await prisma.$queryRaw<Array<{
    migration_name: string; finished_at: Date | null; applied_steps_count: number
  }>>`
    SELECT migration_name, finished_at, applied_steps_count
    FROM _prisma_migrations
    ORDER BY started_at DESC
    LIMIT 10
  `.catch(() => [])

  const statusColor = {
    success:      'text-emerald-400',
    rolled_back:  'text-amber-400',
    build_failed: 'text-red-400',
  } as Record<string, string>

  const statusLabel = {
    success:      '✓ Successo',
    rolled_back:  '⚠ Rollback eseguito',
    build_failed: '✗ Build fallita',
  } as Record<string, string>

  const healthColor = (s: string) =>
    s === 'ok' ? 'text-emerald-400' :
    s === 'slow' ? 'text-amber-400' : 'text-red-400'

  return (
    <main className="min-h-screen w-full overflow-x-hidden px-4 py-6 sm:px-6 sm:py-8">
      <div className="mx-auto w-full max-w-4xl space-y-6">

        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-[#ff6b00]">Super Admin</p>
            <h1 className="mt-1 text-3xl font-black">Deploy Info</h1>
          </div>
          <Link
            href="/api/admin/health/deploy"
            target="_blank"
            className="flex h-9 items-center gap-2 rounded-xl border border-white/10 px-3 text-xs font-black text-white/60 transition hover:border-white/30 hover:text-white"
          >
            JSON raw →
          </Link>
        </div>

        {/* Deploy status */}
        <section className={`rounded-2xl border p-5 ${
          deploy?.status === 'success' ? 'border-emerald-500/20 bg-emerald-500/[0.04]' :
          deploy?.status === 'rolled_back' ? 'border-amber-400/20 bg-amber-400/[0.04]' :
          deploy?.status === 'build_failed' ? 'border-red-500/20 bg-red-500/[0.04]' :
          'border-white/[0.07] bg-white/[0.03]'
        }`}>
          <p className="mb-4 text-xs font-black uppercase tracking-widest text-white/30">
            Ultimo deploy
          </p>
          {deploy ? (
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-3">
                <span className={`text-lg font-black ${statusColor[deploy.status] ?? 'text-white'}`}>
                  {statusLabel[deploy.status] ?? deploy.status}
                </span>
                <span className="font-mono text-sm font-black text-white/60">
                  {deploy.commitShort}
                </span>
              </div>
              <dl className="grid gap-2 sm:grid-cols-2">
                {[
                  ['Commit completo', deploy.commit],
                  ['Messaggio',       deploy.commitMsg],
                  ['Deployato da',    deploy.deployer],
                  ['Data deploy',     fmt(deploy.deployedAt)],
                  ...(deploy.rollbackAt ? [['Rollback alle', fmt(deploy.rollbackAt)]] : []),
                ].map(([label, value]) => (
                  <div key={label} className="flex flex-col gap-0.5">
                    <dt className="text-[10px] font-black uppercase text-white/30">{label}</dt>
                    <dd className="break-all font-mono text-xs font-bold text-white/70">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          ) : (
            <p className="text-sm font-bold text-white/40">
              Nessun file .deploy-info.json — esegui il primo deploy automatico.
            </p>
          )}
        </section>

        {/* Services health */}
        <div className="grid gap-4 sm:grid-cols-3">
          {/* DB */}
          <div className={`rounded-2xl border p-4 ${
            dbStatus === 'ok' ? 'border-emerald-500/20 bg-emerald-500/[0.04]'
            : dbStatus === 'slow' ? 'border-amber-400/20 bg-amber-400/[0.04]'
            : 'border-red-500/20 bg-red-500/[0.04]'
          }`}>
            <p className="text-[10px] font-black uppercase tracking-widest text-white/30">Database</p>
            <p className={`mt-2 text-2xl font-black ${healthColor(dbStatus)}`}>
              {dbStatus === 'ok' ? '● Online' : dbStatus === 'slow' ? '● Lento' : '● Offline'}
            </p>
            <p className="mt-0.5 text-xs font-bold text-white/40">
              {dbLatency >= 0 ? `${dbLatency}ms` : 'unreachable'}
            </p>
          </div>

          {/* Redis */}
          <div className={`rounded-2xl border p-4 ${
            redisStatus === 'ok' ? 'border-emerald-500/20 bg-emerald-500/[0.04]'
            : redisStatus === 'slow' ? 'border-amber-400/20 bg-amber-400/[0.04]'
            : 'border-red-500/20 bg-red-500/[0.04]'
          }`}>
            <p className="text-[10px] font-black uppercase tracking-widest text-white/30">Redis</p>
            <p className={`mt-2 text-2xl font-black ${healthColor(redisStatus)}`}>
              {redisStatus === 'ok' ? '● Online' : redisStatus === 'slow' ? '● Lento' : '● Offline'}
            </p>
            <p className="mt-0.5 text-xs font-bold text-white/40">
              {redisLatency >= 0 ? `${redisLatency}ms` : 'unreachable'}
            </p>
          </div>

          {/* Process */}
          <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-white/30">Processo Node</p>
            <p className="mt-2 text-2xl font-black text-emerald-400">● Online</p>
            <p className="mt-0.5 text-xs font-bold text-white/40">
              Uptime: {fmtDuration(uptimeSec)}
            </p>
          </div>
        </div>

        {/* Process details */}
        <section className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-5">
          <p className="mb-4 text-xs font-black uppercase tracking-widest text-white/30">
            Dettagli processo
          </p>
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              ['Node.js',      process.version],
              ['Uptime',       fmtDuration(uptimeSec)],
              ['Heap usato',   `${memUsedMB} MB / ${memTotalMB} MB (${memPercent}%)`],
            ].map(([label, value]) => (
              <div key={label}>
                <p className="text-[10px] font-black uppercase text-white/30">{label}</p>
                <p className="mt-1 font-mono text-sm font-black text-white/70">{value}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Migrations */}
        <section>
          <p className="mb-3 text-xs font-black uppercase tracking-widest text-white/40">
            Migrazioni DB (ultime 10)
          </p>
          <div className="overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.03]">
            {migrations.length === 0 ? (
              <p className="px-5 py-6 text-xs font-bold text-white/25">Nessuna migrazione trovata.</p>
            ) : (
              <table className="w-full border-collapse text-sm">
                <thead className="bg-white/5">
                  <tr>
                    {['Nome migrazione', 'Stato', 'Completata il'].map((h) => (
                      <th key={h} className="px-4 py-2.5 text-left text-[10px] font-black uppercase text-white/30">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(migrations as Array<{ migration_name: string; finished_at: Date | null; applied_steps_count: number }>).map((m) => (
                    <tr key={m.migration_name} className="border-t border-white/[0.05]">
                      <td className="px-4 py-2.5 font-mono text-xs text-white/70">{m.migration_name}</td>
                      <td className="px-4 py-2.5">
                        <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-black ${
                          m.finished_at
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : 'bg-amber-400/20 text-amber-400'
                        }`}>
                          {m.finished_at ? '✓ Applicata' : '⚠ Pendente'}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 font-mono text-[11px] text-white/40">
                        {m.finished_at ? fmt(m.finished_at.toISOString()) : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>
      </div>
    </main>
  )
}
