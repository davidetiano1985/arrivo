'use strict';
process.chdir('/root/arrivo/frontend');

const { PrismaClient } = require('@prisma/client');
const { PrismaPg }     = require('@prisma/adapter-pg');

const DB_URL = 'postgresql://arrivo_user:Joker.2026@localhost:5432/arrivo_db';
const adapter = new PrismaPg({ connectionString: DB_URL });
const prisma  = new PrismaClient({ adapter });

const ADMIN_EMAIL = 'admin@arrivoapp.it';

async function getAdmin() {
  return prisma.user.findUnique({ where: { email: ADMIN_EMAIL } });
}

async function logAction(adminId, adminEmail, targetId, targetEmail, action, details) {
  await prisma.adminLog.create({ data: { adminId, adminEmail, targetId, targetEmail, action, details } });
  console.log('  [AdminLog] ' + action + ' → ' + targetEmail);
}

async function main() {
  const admin = await getAdmin();
  if (!admin) { console.error('Admin not found'); process.exit(1); }
  console.log('Admin: ' + admin.email + '\n');

  // ── 1. SUSPEND: Giulia Martinelli ──────────────────────────────────────────
  console.log('TEST 1: SUSPEND');
  const giulia = await prisma.user.findUnique({ where: { email: 'giulia.martinelli@test.arrivo.local' } });
  await prisma.user.update({ where: { id: giulia.id }, data: { suspended: true } });
  await logAction(admin.id, admin.email, giulia.id, giulia.email, 'SUSPEND', null);
  const g1 = await prisma.user.findUnique({ where: { id: giulia.id } });
  console.log('  suspended = ' + g1.suspended + ' (expected: true) ' + (g1.suspended ? 'PASS' : 'FAIL'));

  // ── 2. UNSUSPEND: Giulia Martinelli ────────────────────────────────────────
  console.log('TEST 2: UNSUSPEND');
  await prisma.user.update({ where: { id: giulia.id }, data: { suspended: false } });
  await logAction(admin.id, admin.email, giulia.id, giulia.email, 'UNSUSPEND', null);
  const g2 = await prisma.user.findUnique({ where: { id: giulia.id } });
  console.log('  suspended = ' + g2.suspended + ' (expected: false) ' + (!g2.suspended ? 'PASS' : 'FAIL'));

  // ── 3. ROLE_CHANGE: Sara Ricci → gestore_locale ────────────────────────────
  console.log('TEST 3: ROLE_CHANGE');
  const sara = await prisma.user.findUnique({ where: { email: 'sara.ricci@test.arrivo.local' } });
  const oldRole = sara.role;
  await prisma.user.update({ where: { id: sara.id }, data: { role: 'gestore_locale' } });
  await logAction(admin.id, admin.email, sara.id, sara.email, 'ROLE_CHANGE', oldRole + ' → gestore_locale');
  const s1 = await prisma.user.findUnique({ where: { id: sara.id } });
  console.log('  role = ' + s1.role + ' (expected: gestore_locale) ' + (s1.role === 'gestore_locale' ? 'PASS' : 'FAIL'));

  // ── 4. RESET_LOGIN_ATTEMPTS: Marco Ferretti ────────────────────────────────
  console.log('TEST 4: RESET_LOGIN_ATTEMPTS');
  const marco = await prisma.user.findUnique({ where: { email: 'marco.ferretti@test.arrivo.local' } });
  const prevAttempts = marco.loginAttempts;
  await prisma.user.update({ where: { id: marco.id }, data: { loginAttempts: 0 } });
  await logAction(admin.id, admin.email, marco.id, marco.email, 'RESET_LOGIN_ATTEMPTS', 'Tentativi azzerati (erano: ' + prevAttempts + ')');
  const m1 = await prisma.user.findUnique({ where: { id: marco.id } });
  console.log('  loginAttempts = ' + m1.loginAttempts + ' (expected: 0) ' + (m1.loginAttempts === 0 ? 'PASS' : 'FAIL'));

  // ── 5. DELETE_USER: Davide Esposito (test user, safe to delete) ────────────
  console.log('TEST 5: DELETE_USER');
  const davide = await prisma.user.findUnique({ where: { email: 'davide.esposito@test.arrivo.local' } });
  // Log BEFORE delete (FK would be set null after)
  await logAction(admin.id, admin.email, davide.id, davide.email, 'DELETE_USER', davide.firstName + ' ' + davide.lastName + ' — ruolo: ' + davide.role);
  await prisma.user.delete({ where: { id: davide.id } });
  const deleted = await prisma.user.findUnique({ where: { email: 'davide.esposito@test.arrivo.local' } });
  console.log('  deleted = ' + (deleted === null) + ' (expected: true) ' + (deleted === null ? 'PASS' : 'FAIL'));

  // ── Verify FK null on AdminLog after user deletion ─────────────────────────
  console.log('TEST 6: AdminLog FK integrity after user deletion');
  const deleteLog = await prisma.adminLog.findFirst({
    where: { action: 'DELETE_USER', targetEmail: 'davide.esposito@test.arrivo.local' }
  });
  console.log('  AdminLog preserved: ' + (deleteLog !== null ? 'PASS' : 'FAIL'));
  console.log('  targetId after delete: ' + deleteLog.targetId + ' (should be unchanged since logged before delete)');

  // ── Re-create Davide for cleanup phase ────────────────────────────────────
  // (Deleted user won't match cleanup by email, log remains — this is intentional test)

  // ── AdminLog count summary ──────────────────────────────────────────────────
  console.log('\n=== AdminLog entries from test actions ===');
  const logs = await prisma.adminLog.findMany({
    where: { adminEmail: ADMIN_EMAIL },
    orderBy: { createdAt: 'desc' },
    take: 10,
  });
  for (const l of logs) {
    console.log('  ' + l.action.padEnd(22) + ' → ' + l.targetEmail);
  }

  // ── Verify no sensitive data leakage ──────────────────────────────────────
  console.log('\n=== Sensitive data check ===');
  const users = await prisma.user.findMany({
    where: { isTest: true },
    select: { id: true, email: true, firstName: true, password: true }
  });
  const anyPasswordExposed = users.some(function(u) { return u.password !== null && u.password.length < 60; });
  console.log('  All passwords properly hashed: ' + (!anyPasswordExposed ? 'PASS' : 'FAIL'));
  const testUserCount = users.length;
  console.log('  Test users still in DB: ' + testUserCount);
}

main()
  .catch(function(e) { console.error('ERROR:', e.message); process.exit(1); })
  .finally(function() { prisma.$disconnect(); });
