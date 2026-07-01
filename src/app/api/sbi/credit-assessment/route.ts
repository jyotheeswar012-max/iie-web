/**
 * POST /api/sbi/credit-assessment
 * -------------------------------------------------
 * Mock: SBI Credit Assessment API.
 * In production uses SBI's internal CIBIL+Bureau
 * pre-screen endpoint to check farmer credit exposure
 * before co-lending or top-up loan eligibility.
 *
 * Request body: { customerId, aadhaarHash }
 * Response:     { eligible, creditScore, riskBand, maxLoanTopup, existingExposure, bureauRef }
 */
import { NextRequest, NextResponse } from 'next/server';

const MOCK_CREDIT: Record<string, object> = {
  'SBI-CUST-84821': {
    eligible:         true,
    creditScore:      712,
    riskBand:         'MEDIUM_LOW',
    maxLoanTopup:     75000,
    existingExposure: 42000,
    kccLimit:         120000,
    kccUtilisation:   35,
    bureauRef:        'CIBIL-TXN-SBI-2026-004821',
    pmFasalSubsidy:   true,
    recommendation:   'Eligible for KCC top-up ₹75,000 post-payout settlement',
    _source:          'SBI Credit Assessment API — CIBIL bureau pre-screen (mock)',
    _endpoint:        'https://api.sbi.co.in/credit/v1/farmer-assess  [MOCK]',
  },
};

export async function POST(req: NextRequest) {
  await new Promise(r => setTimeout(r, 260));
  const { customerId } = await req.json();
  const credit = MOCK_CREDIT[customerId];
  if (!credit) {
    return NextResponse.json(
      { eligible: false, error: 'Customer not found in SBI credit bureau', _source: 'SBI Credit API (mock)' },
      { status: 404 }
    );
  }
  return NextResponse.json(credit);
}
