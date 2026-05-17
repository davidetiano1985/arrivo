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

export async function sendVerificationEmail(email: string, token: string) {
  const url = `${process.env.NEXTAUTH_URL}/api/auth/verify?token=${token}`

  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: email,
    subject: 'Verifica il tuo account Arrivo',
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 16px">
        <h1 style="font-size:24px;font-weight:900;margin:0 0 8px">Benvenuto su Arrivo</h1>
        <p style="color:#555;margin:0 0 24px">Clicca il pulsante qui sotto per verificare il tuo indirizzo email e attivare l'account.</p>
        <a href="${url}" style="display:inline-block;background:#ff6b00;color:#fff;text-decoration:none;font-weight:900;padding:14px 28px;border-radius:12px;font-size:14px">
          Verifica email
        </a>
        <p style="color:#999;font-size:12px;margin:24px 0 0">Il link scade tra 24 ore. Se non hai richiesto la registrazione ignora questa email.</p>
      </div>
    `,
  })
}
