/**
 * POST /api/sbi/yono-session
 * -------------------------------------------------
 * Mock: YONO session-token validation.
 * In production this would call SBI's internal
 * YONO OAuth 2.0 token-introspection endpoint.
 *
 * Request body: { token: string }
 * Response:     { valid, customerId, name, kycStatus, yonoTier, issuedAt, expiresAt, sessionId }
 */
import { NextRequest, NextResponse } from 'next/server';

const MOCK_SESSIONS: Record<string, object> = {
  'YONO-DEMO-TOKEN-IIE': {
    valid:      true,
    customerId: 'SBI-CUST-84821',
    name:       'Ramesh Kumar',
    kycStatus:  'FULL_KYC',
    yonoTier:   'KISAN_PLUS',
    issuedAt:   '2026-06-30T04:00:00Z',
    expiresAt:  '2026-06-30T16:00:00Z',
    sessionId:  'sess_9bf23c9e0a12',
    _source:    'SBI YONO OAuth 2.0 Token Introspection (mock)',
    _endpoint:  'https://yono.sbi.co.in/api/v2/auth/introspect  [MOCK]',
  },
};

export async function POST(req: NextRequest) {
  await new Promise(r => setTimeout(r, 180)); // simulate network latency
  const { token } = await req.json();
  const session = MOCK_SESSIONS[token];
  if (!session) {
    return NextResponse.json(
      { valid: false, error: 'Token not found or expired', _source: 'SBI YONO Auth (mock)' },
      { status: 401 }
    );
  }
  return NextResponse.json(session);
}
