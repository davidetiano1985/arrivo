import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

export async function sendAdminNotificationEmail(data: {
  nome: string
  tipo: string
  citta: string
  email: string
  telefono: string
}) {
  const adminEmail = process.env.SMTP_FROM!
  const righe = [
    ['Locale', data.nome],
    ['Tipo', data.tipo || '—'],
    ['Città', data.citta],
    ['Email referente', data.email],
    ['Telefono', data.telefono || '—'],
  ]

  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: adminEmail,
    subject: `[Arrivo] Nuova richiesta locale: ${data.nome}`,
    html: `<!DOCTYPE html>
<html lang="it">
<head><meta charset="utf-8" /><title>Nuova richiesta locale</title></head>
<body style="margin:0;padding:0;background:#000000;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#000000;">
    <tr>
      <td align="center" style="padding:40px 16px;">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background:#111111;border-radius:24px;overflow:hidden;">
          <tr>
            <td style="background:#000000;padding:28px 40px 20px;border-bottom:1px solid #1a1a1a;">
              <img src="https://arrivoapp.it/arrivo_logo.svg" alt="Arrivo" width="90" style="display:block;" />
            </td>
          </tr>
          <tr>
            <td style="padding:36px 40px 28px;">
              <p style="margin:0 0 8px;font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:#ff6b00;">Nuova richiesta locale</p>
              <h1 style="margin:0 0 24px;font-size:22px;font-weight:900;color:#ffffff;line-height:1.3;">${data.nome}</h1>
              <table width="100%" cellpadding="0" cellspacing="0" style="border-radius:12px;overflow:hidden;border:1px solid rgba(255,255,255,0.08);">
                ${righe.map(([label, val], i) => `
                <tr style="background:${i % 2 === 0 ? 'rgba(255,255,255,0.03)' : 'transparent'};">
                  <td style="padding:12px 16px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:rgba(255,255,255,0.35);width:40%;">${label}</td>
                  <td style="padding:12px 16px;font-size:13px;font-weight:700;color:#ffffff;">${val}</td>
                </tr>`).join('')}
              </table>
              <div style="margin-top:28px;text-align:center;">
                <a href="https://arrivoapp.it/admin" style="display:inline-block;background:#ff6b00;color:#ffffff;text-decoration:none;font-size:14px;font-weight:900;padding:14px 36px;border-radius:12px;">
                  Vai all'admin &rarr;
                </a>
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 40px;border-top:1px solid rgba(255,255,255,0.06);">
              <p style="margin:0;font-size:11px;color:rgba(255,255,255,0.20);">Arrivo &middot; arrivoapp.it</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
  })
}

export async function sendVerificationEmail(email: string, token: string, firstName?: string) {
  const url = `${process.env.NEXTAUTH_URL}/api/auth/verify?token=${token}`
  const greeting = firstName ? `Ciao ${firstName}!` : 'Benvenuto su Arrivo!'

  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: email,
    subject: 'Verifica il tuo account Arrivo',
    html: `<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1.0" />
  <title>Verifica il tuo account Arrivo</title>
</head>
<body style="margin:0;padding:0;background:#000000;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#000000;">
    <tr>
      <td align="center" style="padding:40px 16px;">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background:#111111;border-radius:24px;overflow:hidden;">

          <!-- Header -->
          <tr>
            <td style="background:#000000;padding:32px 40px 24px;text-align:center;border-bottom:1px solid #1a1a1a;">
              <img src="https://arrivoapp.it/arrivo_logo.svg" alt="Arrivo" width="110" style="display:block;margin:0 auto;" />
              <p style="margin:10px 0 0;font-size:10px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:rgba(255,255,255,0.35);">PRENOTA &middot; ORDINA &middot; ARRIVA</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px 40px 32px;">
              <p style="margin:0 0 10px;font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:#ff6b00;">Verifica account</p>
              <h1 style="margin:0 0 16px;font-size:26px;font-weight:900;color:#ffffff;line-height:1.25;">${greeting}</h1>
              <p style="margin:0 0 32px;font-size:15px;font-weight:600;line-height:1.75;color:rgba(255,255,255,0.60);">
                Grazie per esserti registrato. Clicca il pulsante qui sotto per verificare il tuo indirizzo email e attivare l&rsquo;account.
              </p>

              <!-- CTA button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding:0 0 32px;">
                    <a href="${url}" style="display:inline-block;background:#ff6b00;color:#ffffff;text-decoration:none;font-size:15px;font-weight:900;padding:16px 44px;border-radius:14px;letter-spacing:0.2px;">
                      Verifica email &rarr;
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Fallback URL -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background:rgba(255,255,255,0.04);border-radius:12px;border:1px solid rgba(255,255,255,0.08);">
                <tr>
                  <td style="padding:16px 20px;">
                    <p style="margin:0 0 6px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:rgba(255,255,255,0.30);">Il pulsante non funziona?</p>
                    <p style="margin:0;font-size:12px;color:rgba(255,255,255,0.45);word-break:break-all;line-height:1.65;">
                      Copia e incolla nel browser:<br />
                      <a href="${url}" style="color:#ff6b00;text-decoration:none;font-weight:700;">${url}</a>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:24px 40px;border-top:1px solid rgba(255,255,255,0.06);">
              <p style="margin:0 0 8px;font-size:12px;color:rgba(255,255,255,0.30);line-height:1.65;">
                Il link scade tra <strong style="color:rgba(255,255,255,0.50);">24 ore</strong>. Se non hai richiesto la registrazione, ignora questa email.
              </p>
              <p style="margin:0;font-size:11px;color:rgba(255,255,255,0.18);">
                Arrivo &middot; arrivoapp.it
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
  })
}
