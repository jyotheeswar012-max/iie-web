'use client';

import { useState } from 'react';
import Link from 'next/link';

// ─── theme ────────────────────────────────────────────────────────────────────
const C = {
  bg:     '#060D1A',
  panel:  '#0C1829',
  border: 'rgba(246,139,31,0.14)',
  text:   '#F5F7FA',
  sub:    '#8FA3C0',
  orange: '#F68B1F',
  green:  '#3fb950',
  blue:   '#82b1ff',
  red:    '#f85149',
  teal:   '#64ffda',
  amber:  '#e3b341',
  purple: '#a78bfa',
};

// ─── types ────────────────────────────────────────────────────────────────────
type ApiState = 'idle' | 'loading' | 'success' | 'error';
interface ApiResult { state: ApiState; data: object | null; ms: number | null; }

function fresh(): ApiResult { return { state: 'idle', data: null, ms: null }; }

// ─── JSON renderer ───────────────────────────────────────────────────────────
function JsonView({ data }: { data: object }) {
  const lines = JSON.stringify(data, null, 2).split('\n');
  return (
    <pre style={{
      margin: 0, fontSize: 11, lineHeight: 1.7, fontFamily: 'monospace',
      color: C.teal, overflowX: 'auto', whiteSpace: 'pre-wrap', wordBreak: 'break-all',
    }}>
      {lines.map((line, i) => {
        // colour keys orange, strings teal, numbers blue, booleans purple
        const coloured = line
          .replace(/("[^"]+"):/g, '<k>$1</k>:')
          .replace(/: ("[^"]*")/g, ': <s>$1</s>')
          .replace(/: (\d+\.?\d*)/g, ': <n>$1</n>')
          .replace(/: (true|false)/g, ': <b>$1</b>');
        return (
          <span key={i} dangerouslySetInnerHTML={{ __html: coloured
            .replace(/<k>/g, `<span style="color:${C.orange}">`)
            .replace(/<\/k>/g, '</span>')
            .replace(/<s>/g, `<span style="color:${C.teal}">`)
            .replace(/<\/s>/g, '</span>')
            .replace(/<n>/g, `<span style="color:${C.blue}">`)
            .replace(/<\/n>/g, '</span>')
            .replace(/<b>/g, `<span style="color:${C.purple}">`)
            .replace(/<\/b>/g, '</span>') + '\n',
          }} />
        );
      })}
    </pre>
  );
}

// ─── single API panel ────────────────────────────────────────────────────────
interface ApiPanelProps {
  number:      string;
  title:       string;
  subtitle:    string;
  method:      string;
  endpoint:    string;
  mockUrl:     string;
  description: string;
  color:       string;
  icon:        string;
  sbiProduct:  string;
  payload:     object;
  result:      ApiResult;
  onCall:      () => void;
}

function ApiPanel(p: ApiPanelProps) {
  const isLoading = p.result.state === 'loading';
  const isSuccess = p.result.state === 'success';
  const isError   = p.result.state === 'error';

  return (
    <div style={{
      borderRadius: 20,
      border: `1px solid ${isSuccess ? p.color + '55' : isError ? C.red + '44' : C.border}`,
      background: isSuccess ? `${p.color}06` : C.panel,
      overflow: 'hidden',
      transition: 'all 0.2s',
      boxShadow: isSuccess ? `0 0 28px ${p.color}12` : 'none',
    }}>
      {/* Header */}
      <div style={{ padding: '16px 22px', borderBottom: `1px solid ${C.border}`, background: `${p.color}0a`, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
        <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
          <div style={{ fontSize: 32, lineHeight: 1 }}>{p.icon}</div>
          <div>
            <div style={{ fontSize: 10, fontWeight: 800, color: p.color, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 3 }}>
              SBI API {p.number} · {p.sbiProduct}
            </div>
            <div style={{ fontWeight: 900, fontSize: 16, color: C.text }}>{p.title}</div>
            <div style={{ fontSize: 11, color: C.sub, marginTop: 2 }}>{p.subtitle}</div>
          </div>
        </div>
        <span style={{
          fontSize: 9, fontWeight: 800, padding: '4px 10px', borderRadius: 999,
          background: `${p.color}18`, color: p.color,
          border: `1px solid ${p.color}33`, whiteSpace: 'nowrap', flexShrink: 0,
        }}>{p.method}</span>
      </div>

      {/* Body */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0 }}>
        {/* Left: description + request */}
        <div style={{ padding: '18px 20px', borderRight: `1px solid ${C.border}` }}>
          <p style={{ margin: '0 0 14px', fontSize: 12, color: C.sub, lineHeight: 1.65 }}>{p.description}</p>

          {/* Endpoint pills */}
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 10, color: C.sub, marginBottom: 5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Production endpoint</div>
            <div style={{ fontFamily: 'monospace', fontSize: 10, color: C.amber, background: '#0a1120', padding: '7px 12px', borderRadius: 8, border: `1px solid ${C.border}`, wordBreak: 'break-all' }}>{p.endpoint}</div>
          </div>
          <div style={{ marginBottom: 18 }}>
            <div style={{ fontSize: 10, color: C.sub, marginBottom: 5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Demo mock route</div>
            <div style={{ fontFamily: 'monospace', fontSize: 10, color: C.teal, background: '#0a1120', padding: '7px 12px', borderRadius: 8, border: `1px solid ${C.border}` }}>{p.mockUrl}</div>
          </div>

          {/* Request payload */}
          <div style={{ fontSize: 10, color: C.sub, marginBottom: 6, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Request payload</div>
          <div style={{ background: '#0a1120', borderRadius: 10, border: `1px solid ${C.border}`, padding: '10px 14px', marginBottom: 16 }}>
            <JsonView data={p.payload} />
          </div>

          <button
            onClick={p.onCall}
            disabled={isLoading}
            style={{
              width: '100%', padding: '11px', borderRadius: 12, border: 'none',
              background: isLoading ? C.amber : `linear-gradient(135deg,${p.color},${p.color}cc)`,
              color: '#030712', fontSize: 13, fontWeight: 900,
              cursor: isLoading ? 'wait' : 'pointer',
              transition: 'all 0.2s',
              animation: isLoading ? 'pulse-btn 1s ease-in-out infinite' : 'none',
            }}
          >
            <style>{`@keyframes pulse-btn { 0%,100%{opacity:1} 50%{opacity:0.65} }`}</style>
            {isLoading ? '⏳ Calling SBI API…' : `▶ Call ${p.title}`}
          </button>
        </div>

        {/* Right: response */}
        <div style={{ padding: '18px 20px' }}>
          <div style={{ fontSize: 10, color: C.sub, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Response</span>
            {p.result.ms !== null && (
              <span style={{ color: C.green, fontSize: 10 }}>⚡ {p.result.ms}ms</span>
            )}
          </div>

          {p.result.state === 'idle' && (
            <div style={{ borderRadius: 12, background: '#0a1120', border: `1px solid ${C.border}`, padding: '28px 20px', textAlign: 'center' }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>🏦</div>
              <div style={{ fontSize: 11, color: C.sub }}>Hit the button to fire the SBI API call</div>
            </div>
          )}

          {p.result.state === 'loading' && (
            <div style={{ borderRadius: 12, background: '#0a1120', border: `1px solid ${C.border}`, padding: '28px 20px', textAlign: 'center' }}>
              <div style={{ fontSize: 11, color: C.amber, fontFamily: 'monospace', animation: 'pulse-btn 1s infinite' }}>Awaiting SBI response…</div>
            </div>
          )}

          {(isSuccess || isError) && p.result.data && (
            <div style={{
              borderRadius: 12,
              background: '#0a1120',
              border: `1px solid ${isError ? C.red + '44' : p.color + '33'}`,
              padding: '14px 16px',
              maxHeight: 340,
              overflowY: 'auto',
            }}>
              <JsonView data={p.result.data} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── main page ────────────────────────────────────────────────────────────────
export default function SbiApisPage() {
  const [yono,   setYono]   = useState<ApiResult>(fresh());
  const [acct,   setAcct]   = useState<ApiResult>(fresh());
  const [pay,    setPay]    = useState<ApiResult>(fresh());
  const [credit, setCredit] = useState<ApiResult>(fresh());

  async function call(
    setter: (r: ApiResult) => void,
    url: string,
    body: object,
  ) {
    setter({ state: 'loading', data: null, ms: null });
    const t0 = Date.now();
    try {
      const res  = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const data = await res.json();
      setter({ state: res.ok ? 'success' : 'error', data, ms: Date.now() - t0 });
    } catch (e) {
      setter({ state: 'error', data: { error: String(e) }, ms: Date.now() - t0 });
    }
  }

  const APIS = [
    {
      number:      '01',
      title:       'YONO Session Validation',
      subtitle:    'Verify a farmer\'s YONO session token before policy enrollment',
      method:      'POST',
      endpoint:    'https://yono.sbi.co.in/api/v2/auth/introspect',
      mockUrl:     '/api/sbi/yono-session',
      description: 'IIE calls the YONO OAuth 2.0 token-introspection endpoint at enrollment. This confirms the farmer is a genuine, KYC-verified SBI customer — not just an Aadhaar OTP verification. The response surfaces YONO tier (KISAN_PLUS), full-KYC status, and session expiry. Without this call, the policy could be enrolled by a non-SBI customer.',
      color:       C.orange,
      icon:        '📲',
      sbiProduct:  'YONO Kisan API',
      payload:     { token: 'YONO-DEMO-TOKEN-IIE' },
      result:      yono,
      onCall:      () => call(setYono, '/api/sbi/yono-session', { token: 'YONO-DEMO-TOKEN-IIE' }),
    },
    {
      number:      '02',
      title:       'Account Aggregator Verify',
      subtitle:    'Confirm bank account + UPI VPA before payout disbursement',
      method:      'POST',
      endpoint:    'https://fip.sbi.co.in/aa/v1/account/verify',
      mockUrl:     '/api/sbi/account-verify',
      description: 'Before firing an IMPS payout, IIE calls SBI\'s Account Aggregator FIP (Financial Information Provider) to verify the destination account is active, linked to the farmer\'s AA consent, and has a valid UPI VPA. This is the RBI Account Aggregator framework in action — the farmer consents once at enrollment and IIE uses the consent reference for every subsequent payout.',
      color:       C.teal,
      icon:        '🏦',
      sbiProduct:  'Account Aggregator FIP',
      payload:     { accountNumber: '30041234567', ifsc: 'SBIN0004821' },
      result:      acct,
      onCall:      () => call(setAcct, '/api/sbi/account-verify', { accountNumber: '30041234567', ifsc: 'SBIN0004821' }),
    },
    {
      number:      '03',
      title:       'IMPS Payout Initiation',
      subtitle:    'SBI Payment Gateway — auto-disburse parametric payout via NPCI',
      method:      'POST',
      endpoint:    'https://api.onlinesbi.sbi/pgw/v2/imps/initiate',
      mockUrl:     '/api/sbi/payment',
      description: 'This is the money-movement call. Once the 4-agent oracle quorum fires, the smart contract calls SBI\'s IMPS channel via the SBI Corporate Internet Banking (CIB) API. The response returns an RRN (Reference Retrieval Number) and UTR — the two immutable identifiers NPCI and RBI use for settlement audit. Both are anchored to Hyperledger Fabric.',
      color:       C.green,
      icon:        '💸',
      sbiProduct:  'SBI Payment Gateway',
      payload:     { policyId: 'SBI-IIE-00341', beneficiaryVpa: 'rameshkumar@sbi', amount: 48200, remarks: 'IIE Drought Payout — Barmer 2026' },
      result:      pay,
      onCall:      () => call(setPay, '/api/sbi/payment', { policyId: 'SBI-IIE-00341', beneficiaryVpa: 'rameshkumar@sbi', amount: 48200, remarks: 'IIE Drought Payout — Barmer 2026' }),
    },
    {
      number:      '04',
      title:       'Credit Assessment',
      subtitle:    'Post-payout KCC top-up eligibility via SBI bureau pre-screen',
      method:      'POST',
      endpoint:    'https://api.sbi.co.in/credit/v1/farmer-assess',
      mockUrl:     '/api/sbi/credit-assessment',
      description: 'After a payout is settled, IIE optionally calls SBI\'s Credit Assessment API (backed by CIBIL bureau data) to check if the farmer qualifies for a Kisan Credit Card (KCC) top-up. This turns a parametric insurance product into a full financial inclusion journey — the farmer gets insurance, then a top-up loan, all within the same YONO session. No other agri-insurtech does this today.',
      color:       C.purple,
      icon:        '📊',
      sbiProduct:  'SBI Credit Assessment API',
      payload:     { customerId: 'SBI-CUST-84821', aadhaarHash: 'sha256:9bf23c9e0a12ab7c' },
      result:      credit,
      onCall:      () => call(setCredit, '/api/sbi/credit-assessment', { customerId: 'SBI-CUST-84821', aadhaarHash: 'sha256:9bf23c9e0a12ab7c' }),
    },
  ];

  const allCalled = [yono, acct, pay, credit].every(r => r.state === 'success');

  return (
    <div style={{ background: C.bg, color: C.text, minHeight: '100vh', padding: '0 0 56px' }}>
      <div style={{ maxWidth: 1360, margin: '0 auto', padding: '28px 18px 0' }}>

        {/* Hero */}
        <div style={{ borderRadius: 24, padding: '34px 36px 26px', marginBottom: 22, background: 'linear-gradient(135deg,#060D1A,#0F1E36,#1a0d26)', border: `1px solid ${C.orange}33` }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: C.orange, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 10 }}>SBI-Native Integration · Not Just Any Bank</div>
          <h1 style={{ margin: '0 0 10px', fontSize: 34, fontWeight: 900 }}>SBI API Command Center</h1>
          <p style={{ margin: '0 0 20px', color: C.sub, maxWidth: 820, fontSize: 14, lineHeight: 1.75 }}>
            IIE is built <em style={{ color: C.text }}>on top of SBI's own APIs</em> — not alongside them. Every enrollment, every payout, every credit check flows through SBI's production endpoints. Hit the buttons below to fire live mock calls against our Next.js route handlers that mirror the exact request/response shape of each SBI API.
          </p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {[
              { label: 'YONO Kisan API',        sub: 'Session token validation',  color: C.orange },
              { label: 'Account Aggregator',    sub: 'RBI AA Framework FIP',      color: C.teal },
              { label: 'SBI Payment Gateway',   sub: 'IMPS/NPCI CIB channel',     color: C.green },
              { label: 'Credit Assessment API', sub: 'CIBIL bureau pre-screen',   color: C.purple },
            ].map(s => (
              <div key={s.label} style={{ borderRadius: 12, padding: '8px 16px', background: `${s.color}10`, border: `1px solid ${s.color}33` }}>
                <div style={{ fontWeight: 900, fontSize: 13, color: s.color }}>{s.label}</div>
                <div style={{ fontSize: 10, color: C.sub, marginTop: 2 }}>{s.sub}</div>
              </div>
            ))}
          </div>
        </div>

        {/* All-green banner */}
        {allCalled && (
          <div style={{ borderRadius: 16, padding: '14px 22px', marginBottom: 20, background: '#3fb95014', border: '1px solid #3fb95055', display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 22 }}>✅</span>
            <div>
              <div style={{ fontWeight: 900, color: C.green, fontSize: 14 }}>All 4 SBI APIs responded successfully</div>
              <div style={{ fontSize: 11, color: C.sub, marginTop: 2 }}>Full enrollment-to-payout-to-credit journey demonstrated. This is what makes IIE SBI-native.</div>
            </div>
          </div>
        )}

        {/* API panels */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {APIS.map(api => <ApiPanel key={api.number} {...api} />)}
        </div>

        {/* Journey diagram */}
        <div style={{ borderRadius: 20, border: `1px solid ${C.border}`, background: C.panel, padding: 26, marginTop: 22, marginBottom: 22 }}>
          <h2 style={{ margin: '0 0 6px', fontSize: 18, fontWeight: 800 }}>The SBI-Native Journey</h2>
          <p style={{ margin: '0 0 18px', fontSize: 12, color: C.sub }}>Four SBI APIs form an unbroken chain from enrollment to financial inclusion.</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 0, flexWrap: 'wrap' }}>
            {[
              { step: '1', icon: '📲', label: 'YONO Session', sub: 'KYC gate', color: C.orange },
              { step: '2', icon: '🏦', label: 'AA Verify',    sub: 'Account gate', color: C.teal },
              { step: '3', icon: '💸', label: 'IMPS Payout',  sub: 'Money moves', color: C.green },
              { step: '4', icon: '📊', label: 'KCC Top-Up',   sub: 'Credit offer', color: C.purple },
            ].map((item, i, arr) => (
              <div key={item.step} style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ textAlign: 'center', padding: '14px 20px', borderRadius: 16, background: `${item.color}10`, border: `1px solid ${item.color}44`, minWidth: 110 }}>
                  <div style={{ fontSize: 24, marginBottom: 4 }}>{item.icon}</div>
                  <div style={{ fontWeight: 800, fontSize: 12, color: item.color }}>{item.label}</div>
                  <div style={{ fontSize: 10, color: C.sub, marginTop: 2 }}>{item.sub}</div>
                </div>
                {i < arr.length - 1 && (
                  <div style={{ width: 36, height: 2, background: `linear-gradient(90deg,${item.color},${arr[i+1].color})`, flexShrink: 0 }} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Footer links */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
          <Link href="/dashboard"   style={{ padding: '12px 28px', borderRadius: 14, fontWeight: 800, fontSize: 13, background: `linear-gradient(135deg,${C.orange},${C.amber})`, color: '#030712', textDecoration: 'none' }}>Operations Dashboard</Link>
          <Link href="/agentic"     style={{ padding: '12px 28px', borderRadius: 14, fontWeight: 800, fontSize: 13, background: `linear-gradient(135deg,${C.purple},${C.blue})`, color: '#fff', textDecoration: 'none' }}>Agentic AI</Link>
          <Link href="/india-stack" style={{ padding: '12px 24px', borderRadius: 14, fontWeight: 800, fontSize: 13, border: `1px solid ${C.border}`, background: 'transparent', color: C.text, textDecoration: 'none' }}>Compliance Center</Link>
        </div>
      </div>
    </div>
  );
}
