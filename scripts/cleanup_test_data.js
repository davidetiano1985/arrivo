'use strict';
process.chdir('/root/arrivo/frontend');

const { PrismaClient } = require('@prisma/client');
const { PrismaPg }     = require('@prisma/adapter-pg');

const DB_URL = 'postgresql://arrivo_user:Joker.2026@localhost:5432/arrivo_db';
const adapter = new PrismaPg({ connectionString: DB_URL });
const prisma  = new PrismaClient({ adapter });

async function main() {
  console.log('=== Pre-cleanup state ===');
  const testUsers  = await prisma.user.findMany({ where: { isTest: true } });
  const testIds    = testUsers.map(function(u) { return u.id; });
  const testEmails = testUsers.map(function(u) { return u.email; });
  console.log('Test users found: ' + testUsers.length);

  // 1. LoginEvent associated with test users
  const evDel = await prisma.loginEvent.deleteMany({ where: { userId: { in: testIds } } });
  console.log('LoginEvent deleted: ' + evDel.count);

  // 2. AdminLog entries targeting test users (by email, since targetId may be null)
  const logDel = await prisma.adminLog.deleteMany({
    where: { targetEmail: { in: testEmails } }
  });
  console.log('AdminLog (test targets) deleted: ' + logDel.count);

  // 3. Delete test users themselves
  const userDel = await prisma.user.deleteMany({ where: { isTest: true } });
  console.log('Test users deleted: ' + userDel.count);

  // 4. Verify real data is intact
  console.log('\n=== Post-cleanup verification ===');
  const realUsers = await prisma.user.findMany({ where: { isTest: false } });
  console.log('Real users intact: ' + realUsers.length);
  for (const u of realUsers) {
    console.log('  ' + u.email + ' (' + u.role + ') — isTest: ' + u.isTest);
  }

  const remainingTestUsers = await prisma.user.count({ where: { isTest: true } });
  console.log('Remaining test users: ' + remainingTestUsers + ' (expected: 0) ' + (remainingTestUsers === 0 ? 'PASS' : 'FAIL'));

  const totalEvents = await prisma.loginEvent.count();
  const totalLogs   = await prisma.adminLog.count();
  console.log('LoginEvent remaining: ' + totalEvents);
  console.log('AdminLog remaining:   ' + totalLogs + ' (real admin actions preserved)');

  // 5. Clean up temp script files
  const fs = require('fs');
  ['gen_test_data.js','test_admin_actions.js','cleanup_test_data.js'].forEach(function(f) {
    try { fs.unlinkSync('/root/arrivo/frontend/' + f); } catch(e) {}
  });
  console.log('\nTemp scripts removed.');
  console.log('CLEANUP COMPLETE.');
}

main()
  .catch(function(e) { console.error('ERROR:', e.message); process.exit(1); })
  .finally(function() { prisma.$disconnect(); });
