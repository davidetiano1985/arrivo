import { ImageResponse } from 'next/og'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const alt = 'Arrivo — Prenota, ordina e arriva senza attese'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'center',
          backgroundColor: '#000000',
          padding: '80px 90px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Background glow */}
        <div
          style={{
            position: 'absolute',
            top: -200,
            right: -200,
            width: 700,
            height: 700,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255,107,0,0.12) 0%, transparent 70%)',
          }}
        />

        {/* Badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: 'rgba(255,107,0,0.12)',
            border: '1px solid rgba(255,107,0,0.4)',
            borderRadius: 100,
            padding: '10px 24px',
            marginBottom: 36,
          }}
        >
          <span style={{ fontSize: 18, fontWeight: 700, color: '#ff6b00', letterSpacing: 2, textTransform: 'uppercase' }}>
            La nuova esperienza food
          </span>
        </div>

        {/* Logo text */}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 0, marginBottom: 24 }}>
          <span style={{ fontSize: 100, fontWeight: 900, color: '#ffffff', letterSpacing: -4, lineHeight: 1 }}>
            Arrivo
          </span>
          <span style={{ fontSize: 100, fontWeight: 900, color: '#ff6b00', letterSpacing: -4, lineHeight: 1, marginLeft: 4 }}>.</span>
        </div>

        {/* Tagline */}
        <div style={{ fontSize: 34, fontWeight: 700, color: 'rgba(255,255,255,0.60)', marginBottom: 60, lineHeight: 1.4, maxWidth: 700 }}>
          Prenota il tavolo, ordina prima e arriva senza attese.
        </div>

        {/* Tags */}
        <div style={{ display: 'flex', gap: 16 }}>
          {['Zero attese', 'Zero code', '100% digitale'].map((tag) => (
            <div
              key={tag}
              style={{
                backgroundColor: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: 100,
                padding: '12px 28px',
                fontSize: 22,
                fontWeight: 700,
                color: 'rgba(255,255,255,0.70)',
              }}
            >
              {tag}
            </div>
          ))}
        </div>

        {/* URL bottom right */}
        <div
          style={{
            position: 'absolute',
            bottom: 52,
            right: 90,
            fontSize: 22,
            fontWeight: 700,
            color: 'rgba(255,255,255,0.25)',
          }}
        >
          arrivoapp.it
        </div>
      </div>
    ),
    { ...size }
  )
}
