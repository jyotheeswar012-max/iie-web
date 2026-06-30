import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'YONO-Oracle IIE - Parametric Crop Insurance';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

const PILLS = [
  'Oracle Verified',
  'AI Quorum',
  'Blockchain Audited',
  'IMPS <3s',
  'Fraud Detection',
];

export default function OGImage() {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        background: 'linear-gradient(135deg, #030712 0%, #0a1628 60%, #051a12 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'system-ui, sans-serif',
        padding: '60px 80px',
        position: 'relative',
      }}
    >
      {/* Live badge */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          marginBottom: 28,
          background: '#0d3d2a',
          border: '1px solid #34d399',
          borderRadius: 40,
          padding: '8px 20px',
        }}
      >
        <div
          style={{
            width: 10,
            height: 10,
            borderRadius: '50%',
            background: '#34d399',
            display: 'flex',
          }}
        />
        <span
          style={{
            fontSize: 14,
            fontWeight: 700,
            color: '#34d399',
            letterSpacing: '0.08em',
          }}
        >
          LIVE · SBI GLOBAL FINTECH FEST 2026
        </span>
      </div>

      {/* Title */}
      <div
        style={{
          fontSize: 72,
          fontWeight: 900,
          color: '#ffffff',
          marginBottom: 16,
          display: 'flex',
        }}
      >
        YONO-Oracle IIE
      </div>

      {/* Subtitle */}
      <div
        style={{
          fontSize: 22,
          color: '#94a3b8',
          textAlign: 'center',
          maxWidth: 700,
          lineHeight: 1.5,
          marginBottom: 36,
          display: 'flex',
        }}
      >
        India's first fully autonomous parametric crop insurance engine
      </div>

      {/* Pills */}
      <div
        style={{
          display: 'flex',
          gap: 12,
          flexWrap: 'wrap',
          justifyContent: 'center',
        }}
      >
        {PILLS.map((t) => (
          <div
            key={t}
            style={{
              background: '#1e293b',
              border: '1px solid #334155',
              borderRadius: 8,
              padding: '8px 16px',
              fontSize: 15,
              color: '#e2e8f0',
              display: 'flex',
            }}
          >
            {t}
          </div>
        ))}
      </div>

      {/* Footer */}
      <div
        style={{
          position: 'absolute',
          bottom: 30,
          fontSize: 14,
          color: '#475569',
          display: 'flex',
        }}
      >
        iie-web.vercel.app
      </div>
    </div>,
    { ...size },
  );
}
