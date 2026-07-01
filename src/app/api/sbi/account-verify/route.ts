/**
 * POST /api/sbi/account-verify
 * -------------------------------------------------
 * Mock: Account Aggregator (AA) balance verification.
 * In production uses SBI's AA FIP endpoint via
 * the NBFC-AA framework (RBI AA framework, 2021).
 *
 * Request body: { accountNumber: string, ifsc: string }
 * Response:     { verified, accountHolder, balance, accountType, branchName, aaConsentRef }
 */
import { NextRequest, NextResponse } from 'next/server';

const MOCK_ACCOUNTS: Record<string, object> = {
  '30041234567': {
    verified:       true,
    accountHolder:  'Ramesh Kumar',
    balance:        14820,
    accountType:    'SBI_KISAN_CREDIT',
    branchName:     'SBI Barmer Main Branch (IFSC: SBIN0004821)',
    aaConsentRef:   'AA-CONSENT-SBI-IIE-00341',
    linkedUpiVpa:   'rameshkumar@sbi',
    pmFasalLinked:  true,
    _source:        'SBI Account Aggregator FIP (RBI AA Framework — mock)',
    _endpoint:      'https://fip.sbi.co.in/aa/v1/account/verify  [MOCK]',
  },
};

export async function POST(req: NextRequest) {
  await new Promise(r => setTimeout(r, 220));
  const { accountNumber } = await req.json();
  const account = MOCK_ACCOUNTS[accountNumber];
  if (!account) {
    return NextResponse.json(
      { verified: false, error: 'Account not found or AA consent not granted', _source: 'SBI AA FIP (mock)' },
      { status: 404 }
    );
  }
  return NextResponse.json(account);
}
