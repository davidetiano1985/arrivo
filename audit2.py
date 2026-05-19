import os, sys
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

W = lambda s: sys.stdout.buffer.write((s+'\n').encode('utf-8', errors='replace')) or sys.stdout.flush()

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect(host, username=user, password=password, timeout=15)

W('=== SMTP TEST (nodemailer verify) ===')
o, _ = run(ssh, '''cd /root/arrivo/frontend && set -o allexport && source .env.local && set +o allexport && node -e "
const nodemailer = require('nodemailer');
const t = nodemailer.createTransport({host:process.env.SMTP_HOST,port:Number(process.env.SMTP_PORT),secure:process.env.SMTP_SECURE==='true',auth:{user:process.env.SMTP_USER,pass:process.env.SMTP_PASS}});
t.verify((err,ok)=>{ if(err){console.log('SMTP_FAIL:',err.message)} else {console.log('SMTP_OK')} process.exit(0) });
" 2>&1''', timeout=30)
W(o)

W('\n=== SMTP CONFIG (keys only) ===')
o, _ = run(ssh, 'cd /root/arrivo/frontend && grep -E "^SMTP" .env.local | cut -d= -f1')
W(o)

W('\n=== SMTP_HOST VALUE ===')
o, _ = run(ssh, 'cd /root/arrivo/frontend && grep "^SMTP_HOST" .env.local')
W(o)

W('\n=== PM2 ERROR LOG TIMESTAMPS (last 20) ===')
o, _ = run(ssh, 'pm2 logs arrivo --err --lines 20 --nostream --timestamp 2>&1 | head -40')
W(o)

W('\n=== EXISTING PAGES IN /src/app ===')
o, _ = run(ssh, 'find /root/arrivo/frontend/src/app -name "page.tsx" | sort')
W(o)

W('\n=== HSTS CHECK ===')
o, _ = run(ssh, 'curl -sI https://arrivoapp.it/ | grep -i "strict-transport"')
W(o)

W('\n=== REDIRECT HTTP->HTTPS ===')
o, _ = run(ssh, 'curl -s -o /dev/null -w "%{http_code} -> %{redirect_url}" http://arrivoapp.it/')
W(o)

ssh.close()
