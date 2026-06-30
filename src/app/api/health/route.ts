import { NextRequest, NextResponse } from 'next/server';
export const runtime = 'edge';

function cors(res: NextResponse) {
  res.headers.set('Access-Control-Allow-Origin', '*');
  res.headers.set('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.headers.set('Access-Control-Allow-Headers', 'Content-Type, X-Judge-Key');
  return res;
}

export async function OPTIONS() {
  return cors(new NextResponse(null, { status: 204 }));
}

export async function GET(_req: NextRequest) {
  return cors(NextResponse.json({
    status: 'ok',
    version: '4.2.0',
    engines: [
      'OracleEngine',
      'MultiAgentOrchestrator',
      'BlockchainSM',
      'SHA256AuditChain',
      'NaiveBayesML',
      'IndiaStackSim',
    ],
    apis: [
      'GET /api/health',
      'POST /api/oracle/enroll',
      'POST /api/oracle/verify',
      'GET  /api/oracle/feed',
      'POST /api/contract/execute',
      'GET  /api/audit/trail',
      'POST /api/ml/predict',
    ],
    ts: new Date().toISOString(),
    uptime: 'edge-always-on',
    note: 'All engines live. Vercel Edge runtime. No cold-start. GFF 2026.',
  }));
}
