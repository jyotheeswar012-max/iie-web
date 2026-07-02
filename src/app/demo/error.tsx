'use client';
import { useEffect } from 'react';

export default function DemoError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[IIE Demo Error]', error);
  }, [error]);

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#030712',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: "'Inter',system-ui,sans-serif",
        padding: 24,
      }}
    >
      <div style={{ textAlign: 'center', maxWidth: 520, width: '100%' }}>

        <div style={{ fontSize: 44, marginBottom: 16 }}>⚠️</div>

        <h1
          style={{
            fontSize: 20,
            fontWeight: 900,
            color: '#f87171',
            marginBottom: 8,
          }}
        >
          Something went wrong
        </h1>

        <p
          style={{
            color: '#64748b',
            fontSize: 13,
            lineHeight: 1.7,
            marginBottom: error?.message ? 12 : 24,
          }}
        >
          An unexpected error occurred in the demo pipeline.
        </p>

        {error?.message && (
          <div
            style={{
              background: '#0f172a',
              border: '1px solid #1e293b',
              borderRadius: 10,
              padding: '10px 14px',
              marginBottom: 24,
              fontFamily: 'monospace',
              fontSize: 11,
              color: '#94a3b8',
              textAlign: 'left',
              wordBreak: 'break-word',
              lineHeight: 1.6,
            }}
          >
            {error.message}
            {error.digest && (
              <>
                <br />
                <span style={{ color: '#475569' }}>digest: {error.digest}</span>
              </>
            )}
          </div>
        )}

        <div
          style={{
            display: 'flex',
            gap: 10,
            justifyContent: 'center',
            flexWrap: 'wrap',
          }}
        >
          <button
            onClick={reset}
            style={{
              background: 'linear-gradient(135deg,#065f46,#047857)',
              color: '#d1fae5',
              border: 'none',
              borderRadius: 10,
              padding: '10px 22px',
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            🔄 Try Again
          </button>

          <a
            href="/demo"
            style={{
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.15)',
              color: '#e2e8f0',
              borderRadius: 10,
              padding: '10px 22px',
              fontSize: 13,
              fontWeight: 700,
              textDecoration: 'none',
            }}
          >
            ↺ Reload Demo
          </a>

          <a
            href="/"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.10)',
              color: '#94a3b8',
              borderRadius: 10,
              padding: '10px 22px',
              fontSize: 13,
              fontWeight: 700,
              textDecoration: 'none',
            }}
          >
            ← Home
          </a>
        </div>

      </div>
    </div>
  );
}
