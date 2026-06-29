export const runtime = 'nodejs';
import { NextResponse } from 'next/server';
export async function GET() {
  return NextResponse.json({ status: 'ok', policies: 5, contracts: 5, chain_valid: true });
}
