'use client';

export default function DemoError({ reset }: { reset: () => void }) {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#030712',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "'Inter',system-ui,sans-serif",
      padding: '20px',
    }}>
      <div style={{ textAlign: 'center', maxWidth: 460, width: '100%' }}>

        {/* Icon */}
        <div style={{ fontSize: 52, marginBottom: 14, lineHeight: 1 }}>⚠️</div>

        {/* Title */}
        <div style={{ fontSize: 22, fontWeight: 900, color: '#fca5a5', marginBottom: 6 }}>
          IIE Engine Error
        </div>

        {/* Subtitle */}
        <div style={{ fontSize: 13, color: '#64748b', lineHeight: 1.7, marginBottom: 8 }}>
          An unexpected error occurred in the demo pipeline.
        </div>

        {/* Offline callout — the key message */}
        <div style={{
          background: '#1c1400',
          border: '1px solid #854d0e',
          borderRadius: 12,
          padding: '14px 18px',
          marginBottom: 24,
          textAlign: 'left',
        }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#f59e0b', marginBottom: 6, letterSpacing: '0.05em' }}>
            📼 OFFLINE DEMO MODE AVAILABLE
          </div>
          <div style={{ fontSize: 12, color: '#d1fae5', lineHeight: 1.7 }}>
            APIs may be down or venue wifi is unstable. <b style={{ color: '#fde68a' }}>Offline Demo Mode</b> runs
            the identical Enroll → Oracle → Execute → Audit → ML flow using pre-recorded canonical
            data — <b style={{ color: '#4ade80' }}>zero network required</b>. Judges see the same
            screens, same numbers, same receipt.
          </div>
          <div style={{ marginTop: 10, fontSize: 11, color: '#78716c', fontFamily: 'monospace' }}>
            Policy: SBI-IIE-00341 · Ramesh Kumar · Flood · ₹48,200 · RRN 924819023741
          </div>
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
          <a
            href="/demo?offline=1"
            style={{
              background: 'linear-gradient(135deg,#92400e,#b45309)',
              color: '#fde68a',
              textDecoration: 'none',
              borderRadius: 10,
              padding: '11px 22px',
              fontSize: 13,
              fontWeight: 800,
              boxShadow: '0 4px 16px #92400e55',
            }}
          >
            📼 Run Offline Demo
          </a>
          <button
            onClick={reset}
            style={{
              background: '#0f172a',
              color: '#94a3b8',
              border: '1px solid #1e293b',
              borderRadius: 10,
              padding: '11px 22px',
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            ↺ Try Live Again
          </button>
          <a
            href="/"
            style={{
              background: '#0f172a',
              color: '#64748b',
              textDecoration: 'none',
              borderRadius: 10,
              padding: '11px 22px',
              fontSize: 13,
              fontWeight: 700,
              border: '1px solid #1e293b',
            }}
          >
            ← Home
          </a>
        </div>

        {/* Engineering maturity note */}
        <div style={{ marginTop: 24, fontSize: 10, color: '#334155', lineHeight: 1.6 }}>
          Production systems carry both live and offline paths. This error boundary is intentional — not a bug.
        </div>

      </div>
    </div>
  );
}
