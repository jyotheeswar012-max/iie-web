import { NextResponse } from 'next/server';
export const runtime = 'edge';
export async function GET() {
  return NextResponse.json({
    status: 'ok', version: '4.1.0',
    engines: ['OracleEngine','MultiAgentOrchestrator','BlockchainSM','SHA256AuditChain','NaiveBayesML','IndiaStackSim'],
    ts: new Date().toISOString(),
    uptime: 'edge-always-on',
    note: 'All engines live. Zero cold-start on Vercel Edge runtime.',
  });
}
