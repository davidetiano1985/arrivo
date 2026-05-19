import os, sys, time
os.environ['PYTHONUTF8'] = '1'
import paramiko

host = '209.227.239.83'
user = 'root'
password = 'Joker.2024'
app_dir = '/root/arrivo/frontend'

W = lambda s: sys.stdout.buffer.write((s+'\n').encode('utf-8', errors='replace')) or sys.stdout.flush()

def run(client, cmd, timeout=300):
    W(f'$ {cmd[:90]}')
    _, stdout, stderr = client.exec_command(cmd, timeout=timeout)
    out = stdout.read().decode('utf-8', errors='replace')
    err = stderr.read().decode('utf-8', errors='replace')
    code = stdout.channel.recv_exit_status()
    if out.strip(): W(out.strip()[:800])
    if err.strip(): W('[err] ' + err.strip()[:300])
    return code, out

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect(host, username=user, password=password, timeout=15)
W('Connected')

run(ssh, f'cd {app_dir} && git pull origin main', timeout=60)

W('\nprisma migrate deploy...')
run(ssh, f'cd {app_dir} && set -o allexport && source .env.local && set +o allexport && npx prisma migrate deploy', timeout=120)

run(ssh, f'cd {app_dir} && set -o allexport && source .env.local && set +o allexport && npx prisma generate', timeout=120)

W('\nBuilding...')
code, _ = run(ssh, f'cd {app_dir} && npm run build', timeout=480)
if code != 0:
    W('BUILD FAILED'); sys.exit(1)

run(ssh, 'pm2 restart arrivo --update-env')
time.sleep(5)

W('\n=== VERIFY ===')
pages = ['/admin', '/admin/richieste', '/admin/users', '/']
for p in pages:
    run(ssh, f'curl -s -o /dev/null -w "{p}: %{{http_code}}" http://localhost:3000{p}')

# Verify middleware blocks unauthenticated
run(ssh, 'curl -s -o /dev/null -w "Non-auth /admin redirect: %{http_code} -> %{redirect_url}" http://localhost:3000/admin')

# Verify migration
run(ssh, '''sudo -u postgres psql -d arrivo_db -c "SELECT migration_name FROM _prisma_migrations ORDER BY finished_at DESC LIMIT 4;" 2>&1''')

# Verify Restaurant.ownerId is nullable
run(ssh, '''sudo -u postgres psql -d arrivo_db -c "SELECT column_name, is_nullable FROM information_schema.columns WHERE table_name='Restaurant' AND column_name='ownerId';" 2>&1''')

run(ssh, 'pm2 status')
ssh.close()
W('\nDone.')
