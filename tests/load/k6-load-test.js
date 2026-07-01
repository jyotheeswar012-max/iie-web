/**
 * IIE — Instant Insurance Engine
 * k6 Load Test Suite
 * Run: k6 run tests/load/k6-load-test.js
 *
 * Target: https://iie-web-yono.vercel.app
 * Max VUs: 1,000
 * Scenarios: Enrollment · Oracle · Payout · Audit · Health
 */

import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Counter, Rate, Trend } from 'k6/metrics';

// ── Custom metrics ────────────────────────────────────────────────────────────
const enrollErrors   = new Counter('enroll_errors');
const oracleErrors   = new Counter('oracle_errors');
const payoutErrors   = new Counter('payout_errors');
const fabricErrors   = new Counter('fabric_errors');
const enrollDuration = new Trend('enroll_duration', true);
const oracleDuration = new Trend('oracle_duration', true);
const payoutDuration = new Trend('payout_duration', true);
const errorRate      = new Rate('error_rate');

// ── Base URL ──────────────────────────────────────────────────────────────────
const BASE_URL = __ENV.BASE_URL || 'https://iie-web-yono.vercel.app';
const JUDGE_KEY = __ENV.JUDGE_KEY || 'gff2026';

// ── Common headers ────────────────────────────────────────────────────────────
const HEADERS = {
  'Content-Type': 'application/json',
  'X-Judge-Key':  JUDGE_KEY,
};

// ── Test options ──────────────────────────────────────────────────────────────
export const options = {
  scenarios: {
    // Scenario 1: Farmer Enrollment — ramp to 500 VUs
    enrollment: {
      executor:    'ramping-vus',
      startVUs:    0,
      stages: [
        { duration: '30s', target: 100  },   // ramp up
        { duration: '60s', target: 500  },   // hold at 500
        { duration: '30s', target: 0    },   // ramp down
      ],
      gracefulRampDown: '10s',
      exec: 'enrollmentScenario',
    },

    // Scenario 2: Oracle Quorum — spike to 1000 VUs
    oracle_quorum: {
      executor:    'ramping-vus',
      startTime:   '2m',
      startVUs:    0,
      stages: [
        { duration: '10s', target: 500  },
        { duration: '40s', target: 1000 },
        { duration: '10s', target: 0    },
      ],
      gracefulRampDown: '10s',
      exec: 'oracleScenario',
    },

    // Scenario 3: IMPS Payout — sustained 200 VUs
    payout: {
      executor:    'constant-vus',
      startTime:   '4m',
      vus:         200,
      duration:    '60s',
      exec:        'payoutScenario',
    },

    // Scenario 4: Fabric Audit Write — 300 VUs × 90s
    fabric_audit: {
      executor:    'constant-vus',
      startTime:   '6m',
      vus:         300,
      duration:    '90s',
      exec:        'fabricScenario',
    },

    // Scenario 5: Health check — constant 5 VUs background
    health_check: {
      executor:    'constant-vus',
      vus:         5,
      duration:    '10m',
      exec:        'healthScenario',
    },
  },

  // ── Thresholds (all must pass for green result) ────────────────────────────
  thresholds: {
    // Global
    http_req_failed:           ['rate < 0.01'],     // < 1% error rate overall
    http_req_duration:         ['p(95) < 500'],     // p95 < 500ms overall
    error_rate:                ['rate < 0.01'],

    // Per-scenario
    enroll_duration:           ['p(95) < 200', 'p(99) < 400'],
    oracle_duration:           ['p(95) < 350', 'p(99) < 600'],
    payout_duration:           ['p(95) < 3000', 'p(99) < 3500'],
  },
};

// ── Test fixtures ─────────────────────────────────────────────────────────────
const DISTRICTS = [
  { district: 'Barmer',    state: 'Rajasthan', code: 'RJ-04' },
  { district: 'Jaisalmer', state: 'Rajasthan', code: 'RJ-07' },
  { district: 'Bhuj',      state: 'Gujarat',   code: 'GJ-03' },
  { district: 'Latur',     state: 'Maharashtra',code: 'MH-11' },
  { district: 'Vidisha',   state: 'MP',        code: 'MP-09' },
  { district: 'Patna',     state: 'Bihar',     code: 'BR-11' },
  { district: 'Varanasi',  state: 'UP',        code: 'UP-18' },
];

const CROPS = ['wheat', 'rice', 'cotton', 'soybean', 'maize', 'sugarcane'];

function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function makeFarmer() {
  const d = randomItem(DISTRICTS);
  return {
    name:          `TestFarmer-${__VU}-${__ITER}`,
    aadhaar_last4: String(1000 + Math.floor(Math.random() * 8999)),
    district:      d.district,
    state:         d.state,
    district_code: d.code,
    crop:          randomItem(CROPS),
    acreage:       parseFloat((1 + Math.random() * 9).toFixed(1)),
    plan:          Math.random() > 0.5 ? 'Smart Shield' : 'Kisan Guard',
  };
}

// ── Scenario functions ────────────────────────────────────────────────────────

/** Scenario 1 — Farmer Enrollment */
export function enrollmentScenario() {
  const farmer = makeFarmer();
  const start  = Date.now();

  const res = http.post(
    `${BASE_URL}/api/oracle/enroll`,
    JSON.stringify(farmer),
    { headers: HEADERS, tags: { scenario: 'enrollment' } }
  );

  enrollDuration.add(Date.now() - start);

  const ok = check(res, {
    'enroll: status 200':         r => r.status === 200,
    'enroll: has policy_id':      r => JSON.parse(r.body)?.policy_id !== undefined,
    'enroll: has status field':   r => JSON.parse(r.body)?.status !== undefined,
    'enroll: duration < 200ms':   r => r.timings.duration < 200,
  });

  if (!ok) {
    enrollErrors.add(1);
    errorRate.add(1);
  } else {
    errorRate.add(0);
  }

  sleep(0.1 + Math.random() * 0.2);
}

/** Scenario 2 — Oracle Quorum Trigger */
export function oracleScenario() {
  const d     = randomItem(DISTRICTS);
  const start = Date.now();

  const payload = {
    policy_id:  `SBI-IIE-LOAD-${__VU}-${__ITER}`,
    event_type: 'drought',
    district:   d.district,
    crop:       randomItem(CROPS),
    acreage:    parseFloat((2 + Math.random() * 8).toFixed(1)),
    // Oracle sensor values — always below threshold to trigger
    ndvi:             parseFloat((0.15 + Math.random() * 0.15).toFixed(3)),
    rainfall_mm:      parseFloat((5 + Math.random() * 10).toFixed(1)),
    temp_c:           parseFloat((44 + Math.random() * 5).toFixed(1)),
    soil_moisture_pct:parseFloat((8 + Math.random() * 6).toFixed(1)),
  };

  const res = http.post(
    `${BASE_URL}/api/oracle/verify`,
    JSON.stringify(payload),
    { headers: HEADERS, tags: { scenario: 'oracle' } }
  );

  oracleDuration.add(Date.now() - start);

  const ok = check(res, {
    'oracle: status 200':          r => r.status === 200,
    'oracle: has quorum_pct':      r => JSON.parse(r.body)?.quorum_pct !== undefined,
    'oracle: quorum >= 0':         r => (JSON.parse(r.body)?.quorum_pct ?? -1) >= 0,
    'oracle: duration < 350ms':    r => r.timings.duration < 350,
  });

  if (!ok) {
    oracleErrors.add(1);
    errorRate.add(1);
  } else {
    errorRate.add(0);
  }

  sleep(0.05 + Math.random() * 0.1);
}

/** Scenario 3 — IMPS Payout */
export function payoutScenario() {
  const start = Date.now();

  const payload = {
    policyId:       `SBI-IIE-LOAD-${__VU}-${__ITER}`,
    beneficiaryVpa: `loadtest${__VU}@sbi`,
    amount:         10000 + Math.floor(Math.random() * 90000),
    remarks:        `IIE Load Test Payout VU=${__VU}`,
  };

  const res = http.post(
    `${BASE_URL}/api/sbi/payment`,
    JSON.stringify(payload),
    { headers: HEADERS, tags: { scenario: 'payout' } }
  );

  payoutDuration.add(Date.now() - start);

  const ok = check(res, {
    'payout: status 200':       r => r.status === 200,
    'payout: has rrn':          r => JSON.parse(r.body)?.rrn !== undefined,
    'payout: has utr':          r => JSON.parse(r.body)?.utr !== undefined,
    'payout: duration < 3s':    r => r.timings.duration < 3000,
  });

  if (!ok) {
    payoutErrors.add(1);
    errorRate.add(1);
  } else {
    errorRate.add(0);
  }

  sleep(0.2 + Math.random() * 0.3);
}

/** Scenario 4 — Hyperledger Fabric Audit Write */
export function fabricScenario() {
  const res = http.get(
    `${BASE_URL}/api/audit/trail`,
    { headers: HEADERS, tags: { scenario: 'fabric' } }
  );

  const ok = check(res, {
    'fabric: status 200':        r => r.status === 200,
    'fabric: has blocks':        r => Array.isArray(JSON.parse(r.body)?.blocks),
    'fabric: duration < 890ms':  r => r.timings.duration < 890,
  });

  if (!ok) fabricErrors.add(1);

  sleep(0.1);
}

/** Scenario 5 — Health check */
export function healthScenario() {
  const res = http.get(`${BASE_URL}/api/health`, { headers: HEADERS });
  check(res, { 'health: status 200': r => r.status === 200 });
  sleep(2);
}

// ── Summary ───────────────────────────────────────────────────────────────────
export function handleSummary(data) {
  return {
    'tests/load/k6-results.json': JSON.stringify(data, null, 2),
    stdout: `
╔══════════════════════════════════════════════════╗
║          IIE k6 Load Test Summary                ║
╚══════════════════════════════════════════════════╝

Scenarios run : 5
Max VUs       : 1,000
Total requests: ${data.metrics?.http_reqs?.values?.count ?? 'N/A'}
Error rate    : ${((data.metrics?.http_req_failed?.values?.rate ?? 0) * 100).toFixed(2)}%
p95 duration  : ${data.metrics?.http_req_duration?.values?.['p(95)']?.toFixed(0) ?? 'N/A'}ms
p99 duration  : ${data.metrics?.http_req_duration?.values?.['p(99)']?.toFixed(0) ?? 'N/A'}ms

Thresholds    : ${Object.values(data.metrics).filter(m => m.thresholds).every(m => Object.values(m.thresholds).every(t => t.ok)) ? 'ALL PASSED ✓' : 'SOME FAILED ✗'}
`,
  };
}
