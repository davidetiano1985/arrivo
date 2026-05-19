import os, sys, json
os.environ['PYTHONUTF8'] = '1'
import paramiko

host = '209.227.239.83'
user = 'root'
password = 'Joker.2024'

def run(client, cmd, timeout=30):
    _, stdout, stderr = client.exec_command(cmd, timeout=timeout)
    out = stdout.read().decode('utf-8', errors='replace')
    err = stderr.read().decode('utf-8', errors='replace')
    stdout.channel.recv_exit_status()
    return out.strip(), err.strip()

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect(host, username=user, password=password, timeout=15)

W = lambda s: sys.stdout.buffer.write((s + '\n').encode('utf-8', errors='replace')) or sys.stdout.flush()

W('=== PM2 STATUS ===')
o, _ = run(ssh, 'pm2 show arrivo 2>&1 | grep -E "status|uptime|restarts|memory|cpu|pid"')
W(o)

W('\n=== PM2 LOGS (last 50 lines) ===')
o, _ = run(ssh, 'pm2 logs arrivo --lines 50 --nostream 2>&1')
W(o)

W('\n=== HTTP STATUS ALL PAGES ===')
pages = [
    '/', '/login', '/registrati', '/registrati/locale',
    '/verifica-email', '/email-verificata',
    '/supporto-partner', '/blog', '/chi-siamo',
    '/come-funziona', '/contatti', '/cookie', '/faq',
    '/lavora-con-noi', '/ordina-prima', '/pagamenti',
    '/prenota-tavolo', '/privacy', '/termini',
    '/trova-ristoranti', '/dashboard', '/profilo',
    '/admin', '/admin/users',
    '/api/auth/providers', '/api/auth/session',
]
for page in pages:
    o, _ = run(ssh, f'curl -s -o /dev/null -w "%{{http_code}} %{{time_total}}s" http://localhost:3000{page}')
    W(f'  {page}: {o}')

W('\n=== API AUTH PROVIDERS ===')
o, _ = run(ssh, 'curl -s http://localhost:3000/api/auth/providers')
W(o)

W('\n=== API AUTH SESSION (no cookie) ===')
o, _ = run(ssh, 'curl -s http://localhost:3000/api/auth/session')
W(o)

W('\n=== NGINX STATUS ===')
o, _ = run(ssh, 'systemctl is-active nginx && nginx -t 2>&1')
W(o)

W('\n=== NGINX CONFIG (server_name, proxy) ===')
o, _ = run(ssh, 'grep -E "server_name|proxy_pass|listen|ssl" /etc/nginx/sites-enabled/* 2>/dev/null || grep -r "proxy_pass" /etc/nginx/ 2>/dev/null | head -20')
W(o)

W('\n=== SSL CERT EXPIRY ===')
o, _ = run(ssh, 'echo | openssl s_client -connect arrivoapp.it:443 -servername arrivoapp.it 2>/dev/null | openssl x509 -noout -dates 2>/dev/null')
W(o)

W('\n=== DB: USER TABLE COLUMNS ===')
o, _ = run(ssh, '''sudo -u postgres psql -d arrivo_db -c "SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_name='User' ORDER BY ordinal_position;" 2>&1''')
W(o)

W('\n=== DB: RECENT USERS ===')
o, _ = run(ssh, '''sudo -u postgres psql -d arrivo_db -c "SELECT email, role, \\\"emailVerified\\\", \\\"firstName\\\", \\\"lastName\\\", \\\"createdAt\\\" FROM \\\"User\\\" ORDER BY \\\"createdAt\\\" DESC LIMIT 5;" 2>&1''')
W(o)

W('\n=== DB: STUCK UNVERIFIED USERS ===')
o, _ = run(ssh, '''sudo -u postgres psql -d arrivo_db -c "SELECT email, \\\"createdAt\\\" FROM \\\"User\\\" WHERE \\\"emailVerified\\\" IS NULL;" 2>&1''')
W(o)

W('\n=== DB: VERIFICATION TOKENS ===')
o, _ = run(ssh, '''sudo -u postgres psql -d arrivo_db -c "SELECT identifier, expires FROM \\\"VerificationToken\\\" ORDER BY expires DESC LIMIT 5;" 2>&1''')
W(o)

W('\n=== DISK & MEMORY ===')
o, _ = run(ssh, 'df -h / && free -m')
W(o)

W('\n=== ENV VARS CHECK (no values) ===')
o, _ = run(ssh, 'cd /root/arrivo/frontend && grep -E "^[A-Z_]+=" .env.local | cut -d= -f1 | sort')
W(o)

W('\n=== .env.local NEXTAUTH_URL ===')
o, _ = run(ssh, 'cd /root/arrivo/frontend && grep NEXTAUTH_URL .env.local')
W(o)

W('\n=== PRODUCTION URL HEADERS ===')
o, _ = run(ssh, 'curl -sI https://arrivoapp.it/ | head -20')
W(o)

ssh.close()
