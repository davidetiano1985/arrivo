'use strict';
process.chdir('/root/arrivo/frontend');

const { PrismaClient } = require('@prisma/client');
const { PrismaPg }     = require('@prisma/adapter-pg');
const bcrypt           = require('bcryptjs');

const DB_URL = 'postgresql://arrivo_user:Joker.2026@localhost:5432/arrivo_db';
const adapter = new PrismaPg({ connectionString: DB_URL });
const prisma  = new PrismaClient({ adapter });

function daysAgo(n) {
  const d = new Date(); d.setDate(d.getDate() - n); return d;
}
function rInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function rItem(a) { return a[Math.floor(Math.random() * a.length)]; }

const IPS_ITA     = ['217.33.12.45','151.64.22.180','79.12.45.211','93.57.128.34','87.28.12.154','109.54.200.33'];
const IPS_FOREIGN = ['45.76.123.45','91.108.4.56','185.220.101.23','104.21.45.89'];

async function main() {
  console.log('Generating bcrypt hash...');
  const pwHash = await bcrypt.hash('Password123!', 10);

  const USERS = [
    // 14 clienti
    { firstName:'Marco',     lastName:'Ferretti',   email:'marco.ferretti@test.arrivo.local',    phone:'+39 347 1234567', role:'cliente',        pw:pwHash, daysOld:45,  loginAttempts:12, suspended:false, isGoogle:false, scenario:'brute_force' },
    { firstName:'Giulia',    lastName:'Martinelli', email:'giulia.martinelli@test.arrivo.local', phone:'+39 333 9876543', role:'cliente',        pw:pwHash, daysOld:30,  loginAttempts:0,  suspended:false, isGoogle:false, scenario:'normal' },
    { firstName:'Andrea',    lastName:'Conti',      email:'andrea.conti@test.arrivo.local',      phone:'+39 328 5551234', role:'cliente',        pw:pwHash, daysOld:20,  loginAttempts:7,  suspended:false, isGoogle:false, scenario:'brute_force' },
    { firstName:'Sara',      lastName:'Ricci',      email:'sara.ricci@test.arrivo.local',        phone:'+39 366 7890123', role:'cliente',        pw:pwHash, daysOld:15,  loginAttempts:0,  suspended:false, isGoogle:false, scenario:'normal' },
    { firstName:'Luca',      lastName:'Moretti',    email:'luca.moretti@test.arrivo.local',      phone:'+39 339 2345678', role:'cliente',        pw:pwHash, daysOld:60,  loginAttempts:0,  suspended:true,  isGoogle:false, scenario:'suspended' },
    { firstName:'Elena',     lastName:'Russo',      email:'elena.russo@test.arrivo.local',       phone:'+39 348 3456789', role:'cliente',        pw:null,   daysOld:12,  loginAttempts:0,  suspended:false, isGoogle:true,  scenario:'google' },
    { firstName:'Davide',    lastName:'Esposito',   email:'davide.esposito@test.arrivo.local',   phone:'+39 338 4567890', role:'cliente',        pw:null,   daysOld:8,   loginAttempts:0,  suspended:false, isGoogle:true,  scenario:'google' },
    { firstName:'Chiara',    lastName:'Lombardi',   email:'chiara.lombardi@test.arrivo.local',   phone:'+39 349 5678901', role:'cliente',        pw:null,   daysOld:5,   loginAttempts:0,  suspended:false, isGoogle:true,  scenario:'google' },
    { firstName:'Francesco', lastName:'Romano',     email:'francesco.romano@test.arrivo.local',  phone:'+39 351 6789012', role:'cliente',        pw:pwHash, daysOld:25,  loginAttempts:0,  suspended:false, isGoogle:false, scenario:'multi_ip' },
    { firstName:'Valentina', lastName:'Gallo',      email:'valentina.gallo@test.arrivo.local',   phone:'+39 354 7890123', role:'cliente',        pw:null,   daysOld:18,  loginAttempts:0,  suspended:false, isGoogle:true,  scenario:'google' },
    { firstName:'Matteo',    lastName:'Marino',     email:'matteo.marino@test.arrivo.local',     phone:'+39 347 8901234', role:'cliente',        pw:pwHash, daysOld:35,  loginAttempts:0,  suspended:false, isGoogle:false, scenario:'normal' },
    { firstName:'Alessia',   lastName:'Greco',      email:'alessia.greco@test.arrivo.local',     phone:'+39 360 9012345', role:'cliente',        pw:pwHash, daysOld:7,   loginAttempts:0,  suspended:false, isGoogle:false, scenario:'reset_password' },
    { firstName:'Simone',    lastName:'Costa',      email:'simone.costa@test.arrivo.local',      phone:'+39 347 0123456', role:'cliente',        pw:null,   daysOld:3,   loginAttempts:0,  suspended:false, isGoogle:true,  scenario:'google' },
    { firstName:'Federica',  lastName:'De Luca',    email:'federica.deluca@test.arrivo.local',   phone:'+39 347 1357924', role:'cliente',        pw:pwHash, daysOld:50,  loginAttempts:0,  suspended:false, isGoogle:false, scenario:'normal' },
    // 4 gestore_locale
    { firstName:'Roberto',   lastName:'Fontana',    email:'roberto.fontana@test.arrivo.local',   phone:'+39 02 12345678', role:'gestore_locale', pw:pwHash, daysOld:90,  loginAttempts:0,  suspended:false, isGoogle:false, scenario:'normal' },
    { firstName:'Paola',     lastName:'Santoro',    email:'paola.santoro@test.arrivo.local',     phone:'+39 06 98765432', role:'gestore_locale', pw:null,   daysOld:75,  loginAttempts:0,  suspended:false, isGoogle:true,  scenario:'google' },
    { firstName:'Claudio',   lastName:'Barbieri',   email:'claudio.barbieri@test.arrivo.local',  phone:'+39 011 2345678', role:'gestore_locale', pw:pwHash, daysOld:120, loginAttempts:0,  suspended:false, isGoogle:false, scenario:'normal' },
    { firstName:'Monica',    lastName:'Ferrari',    email:'monica.ferrari@test.arrivo.local',    phone:'+39 055 3456789', role:'gestore_locale', pw:null,   daysOld:55,  loginAttempts:0,  suspended:false, isGoogle:true,  scenario:'google' },
    // 2 manager
    { firstName:'Antonio',   lastName:'Caruso',     email:'antonio.caruso@test.arrivo.local',    phone:'+39 081 9876543', role:'manager',        pw:pwHash, daysOld:200, loginAttempts:0,  suspended:false, isGoogle:false, scenario:'normal' },
    { firstName:'Laura',     lastName:'Mancini',    email:'laura.mancini@test.arrivo.local',     phone:'+39 051 1234567', role:'manager',        pw:null,   daysOld:180, loginAttempts:0,  suspended:false, isGoogle:true,  scenario:'google' },
  ];

  console.log('Creating 20 test users...');
  const created = [];
  for (const u of USERS) {
    const createdAt = daysAgo(u.daysOld);
    const dbUser = await prisma.user.create({ data: {
      firstName: u.firstName, lastName: u.lastName,
      name: u.firstName + ' ' + u.lastName,
      email: u.email, phone: u.phone, role: u.role,
      password: u.pw, emailVerified: createdAt,
      suspended: u.suspended, loginAttempts: u.loginAttempts,
      profileIncomplete: false, isTest: true, createdAt,
    }});
    created.push(Object.assign({}, dbUser, { scenario: u.scenario, isGoogle: u.isGoogle }));
    console.log('  + ' + u.firstName + ' ' + u.lastName + ' (' + u.role + ')');
  }

  // Login events
  console.log('Generating login events...');
  const events = [];
  for (const u of created) {
    const counts = { brute_force:15, multi_ip:10, normal:rInt(2,8), google:rInt(1,6), suspended:rInt(1,4), reset_password:rInt(3,6) };
    const n = counts[u.scenario] !== undefined ? counts[u.scenario] : rInt(1,5);
    for (let i = 0; i < n; i++) {
      const createdAt = daysAgo(rInt(0,30));
      createdAt.setHours(rInt(6,23)); createdAt.setMinutes(rInt(0,59));
      let success, ip, provider;
      if (u.scenario === 'brute_force') {
        success = i >= n - 2; ip = rItem(IPS_FOREIGN); provider = 'credentials';
      } else if (u.scenario === 'multi_ip') {
        success = true; ip = rItem(IPS_ITA.concat(IPS_FOREIGN)); provider = 'credentials';
      } else if (u.scenario === 'google') {
        success = true; ip = rItem(IPS_ITA); provider = 'google';
      } else if (u.scenario === 'suspended') {
        success = false; ip = rItem(IPS_ITA); provider = 'credentials';
      } else if (u.scenario === 'reset_password') {
        success = (i % 3 !== 0); ip = rItem(IPS_ITA); provider = 'credentials';
      } else {
        success = rInt(0,10) > 1; ip = rItem(IPS_ITA);
        provider = u.isGoogle ? 'google' : 'credentials';
      }
      events.push({ userId:u.id, success, ipAddress:ip, provider, createdAt });
    }
  }
  const evRes = await prisma.loginEvent.createMany({ data: events });
  console.log('  Login events created: ' + evRes.count);

  // Admin logs
  console.log('Generating admin log entries...');
  const adminUser = await prisma.user.findFirst({ where: { role: 'super_admin' } });
  const adminEmail = adminUser ? adminUser.email : 'admin@arrivoapp.it';
  const adminId    = adminUser ? adminUser.id   : null;

  const bruteUser = created.find(function(u) { return u.scenario === 'brute_force'; });
  const gesLocal  = created.find(function(u) { return u.role === 'gestore_locale'; });
  const resetUser = created.find(function(u) { return u.scenario === 'reset_password'; });

  const logEntries = [];
  if (bruteUser) {
    logEntries.push({ adminId, adminEmail, targetId:bruteUser.id, targetEmail:bruteUser.email, action:'SUSPEND',              details:'Sospeso per attivita sospetta da IP esteri', createdAt:daysAgo(rInt(1,10)) });
    logEntries.push({ adminId, adminEmail, targetId:bruteUser.id, targetEmail:bruteUser.email, action:'RESET_LOGIN_ATTEMPTS', details:'Tentativi azzerati (erano: ' + bruteUser.loginAttempts + ')', createdAt:daysAgo(rInt(1,5)) });
  }
  if (gesLocal)  logEntries.push({ adminId, adminEmail, targetId:gesLocal.id,  targetEmail:gesLocal.email,  action:'ROLE_CHANGE',    details:'cliente → gestore_locale',  createdAt:daysAgo(rInt(5,20)) });
  if (resetUser) logEntries.push({ adminId, adminEmail, targetId:resetUser.id, targetEmail:resetUser.email, action:'RESET_PASSWORD', details:'Email di reset inviata',     createdAt:daysAgo(rInt(1,7))  });

  const logRes = await prisma.adminLog.createMany({ data: logEntries });
  console.log('  Admin log entries: ' + logRes.count);

  const total = await prisma.user.count({ where: { isTest: true } });
  console.log('DONE — test users in DB: ' + total);
}

main()
  .catch(function(e) { console.error('ERROR:', e.message); process.exit(1); })
  .finally(function() { prisma.$disconnect(); });
