import { prisma } from './prisma'

export async function logAdminAction({
  adminId,
  adminEmail,
  targetId,
  targetEmail,
  action,
  details,
}: {
  adminId: string
  adminEmail: string
  targetId?: string
  targetEmail: string
  action: string
  details?: string
}) {
  try {
    await prisma.adminLog.create({
      data: { adminId, adminEmail, targetId, targetEmail, action, details },
    })
  } catch (err) {
    // Never throw — logging failure must not block the admin action
    console.error('[adminLog] Failed to write log entry:', err)
  }
}
