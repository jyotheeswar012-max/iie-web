/**
 * Unit tests: IIE Policy State Machine + Audit Chain Integrity
 * Run with: npx jest src/__tests__/state-machine.test.ts
 */

import { createHash } from 'crypto';

// ── State Machine ────────────────────────────────────────────────────────────────────

type PolicyState = 'ACTIVE' | 'TRIGGERED' | 'EXECUTED' | 'REJECTED';

type OracleData = {
  source: 'NASA' | 'IMD' | 'ISRO' | 'ICAR';
  ndvi?: number;       // 0..1, trigger if < 0.25
  rainfall?: number;   // mm, flood if > 200
  windSpeed?: number;  // km/h, cyclone if > 74
  weight: number;      // 0..1
};

function computeQuorumScore(oracles: OracleData[]): number {
  const totalWeight = oracles.reduce((s, o) => s + o.weight, 0);
  const triggeredWeight = oracles
    .filter(o => {
      if (o.ndvi !== undefined) return o.ndvi < 0.25;
      if (o.rainfall !== undefined) return o.rainfall > 200;
      if (o.windSpeed !== undefined) return o.windSpeed > 74;
      return false;
    })
    .reduce((s, o) => s + o.weight, 0);
  return totalWeight > 0 ? triggeredWeight / totalWeight : 0;
}

function transition(state: PolicyState, quorumScore: number, payoutConfirmed: boolean): PolicyState {
  if (state === 'ACTIVE' && quorumScore >= 0.75) return 'TRIGGERED';
  if (state === 'ACTIVE' && quorumScore < 0.75) return 'ACTIVE';
  if (state === 'TRIGGERED' && payoutConfirmed) return 'EXECUTED';
  if (state === 'TRIGGERED' && !payoutConfirmed) return 'TRIGGERED';
  return state;
}

// ── Audit Chain ─────────────────────────────────────────────────────────────────────────

type AuditRecord = {
  id: number;
  event: string;
  timestamp: string;
  data: Record<string, unknown>;
  prevHash: string;
  hash: string;
};

function sha256(input: string): string {
  return createHash('sha256').update(input).digest('hex');
}

function createAuditRecord(
  id: number,
  event: string,
  timestamp: string,
  data: Record<string, unknown>,
  prevHash: string
): AuditRecord {
  const payload = JSON.stringify({ id, event, timestamp, data, prevHash });
  return { id, event, timestamp, data, prevHash, hash: sha256(payload) };
}

function verifyChain(records: AuditRecord[]): { valid: boolean; brokenAt?: number } {
  for (let i = 1; i < records.length; i++) {
    if (records[i].prevHash !== records[i - 1].hash) {
      return { valid: false, brokenAt: i };
    }
    // Re-compute hash to check tampering
    const { hash, ...rest } = records[i];
    const payload = JSON.stringify(rest);
    if (sha256(payload) !== hash) {
      return { valid: false, brokenAt: i };
    }
  }
  return { valid: true };
}

// ── Fraud Detection ─────────────────────────────────────────────────────────────────────
function isFraud(enrolledAt: Date, payoutAt: Date, reEnrollWindowDays: number, lastEnrollDate: Date | null): boolean {
  const hoursDiff = (payoutAt.getTime() - enrolledAt.getTime()) / 36e5;
  if (hoursDiff < 72) return true; // payout within 72h of enrollment
  if (lastEnrollDate) {
    const daysSinceLast = (enrolledAt.getTime() - lastEnrollDate.getTime()) / 864e5;
    if (daysSinceLast < reEnrollWindowDays) return true; // re-enrolled too soon
  }
  return false;
}

// ═══ TEST SUITES ═════════════════════════════════════════════════════════════════════

describe('IIE Policy State Machine', () => {

  describe('computeQuorumScore', () => {
    it('returns 1.0 when all oracles trigger (drought)', () => {
      const oracles: OracleData[] = [
        { source: 'NASA',  ndvi: 0.18, weight: 0.30 },
        { source: 'IMD',   ndvi: 0.20, weight: 0.30 },
        { source: 'ISRO',  ndvi: 0.22, weight: 0.25 },
        { source: 'ICAR',  ndvi: 0.19, weight: 0.15 },
      ];
      expect(computeQuorumScore(oracles)).toBeCloseTo(1.0, 5);
    });

    it('returns 0.0 when no oracle triggers', () => {
      const oracles: OracleData[] = [
        { source: 'NASA',  ndvi: 0.60, weight: 0.30 },
        { source: 'IMD',   ndvi: 0.55, weight: 0.30 },
        { source: 'ISRO',  ndvi: 0.70, weight: 0.25 },
        { source: 'ICAR',  ndvi: 0.65, weight: 0.15 },
      ];
      expect(computeQuorumScore(oracles)).toBeCloseTo(0.0, 5);
    });

    it('returns partial quorum when only 2 of 4 trigger', () => {
      const oracles: OracleData[] = [
        { source: 'NASA',  ndvi: 0.18, weight: 0.30 },  // triggers
        { source: 'IMD',   ndvi: 0.55, weight: 0.30 },  // does not
        { source: 'ISRO',  ndvi: 0.22, weight: 0.25 },  // triggers
        { source: 'ICAR',  ndvi: 0.65, weight: 0.15 },  // does not
      ];
      // triggered weight = 0.30 + 0.25 = 0.55, total = 1.0
      expect(computeQuorumScore(oracles)).toBeCloseTo(0.55, 5);
    });

    it('triggers flood on rainfall > 200mm', () => {
      const oracles: OracleData[] = [
        { source: 'IMD',  rainfall: 250, weight: 1.0 },
      ];
      expect(computeQuorumScore(oracles)).toBeCloseTo(1.0, 5);
    });

    it('does NOT trigger flood on rainfall exactly 200mm', () => {
      const oracles: OracleData[] = [
        { source: 'IMD',  rainfall: 200, weight: 1.0 },
      ];
      expect(computeQuorumScore(oracles)).toBeCloseTo(0.0, 5);
    });

    it('triggers cyclone on windSpeed > 74 km/h', () => {
      const oracles: OracleData[] = [
        { source: 'IMD',  windSpeed: 80, weight: 1.0 },
      ];
      expect(computeQuorumScore(oracles)).toBeCloseTo(1.0, 5);
    });
  });

  describe('transition', () => {
    it('ACTIVE → TRIGGERED when quorum >= 0.75', () => {
      expect(transition('ACTIVE', 0.94, false)).toBe('TRIGGERED');
    });

    it('ACTIVE stays ACTIVE when quorum < 0.75', () => {
      expect(transition('ACTIVE', 0.55, false)).toBe('ACTIVE');
    });

    it('ACTIVE stays ACTIVE at quorum exactly 0.74', () => {
      expect(transition('ACTIVE', 0.74, false)).toBe('ACTIVE');
    });

    it('TRIGGERED → EXECUTED when payout confirmed', () => {
      expect(transition('TRIGGERED', 0.94, true)).toBe('EXECUTED');
    });

    it('TRIGGERED stays TRIGGERED when payout not confirmed', () => {
      expect(transition('TRIGGERED', 0.94, false)).toBe('TRIGGERED');
    });

    it('EXECUTED stays EXECUTED regardless of inputs', () => {
      expect(transition('EXECUTED', 1.0, true)).toBe('EXECUTED');
    });
  });

});

describe('IIE Audit Chain Integrity', () => {

  function buildChain(): AuditRecord[] {
    const records: AuditRecord[] = [];
    const genesis = createAuditRecord(1, 'Policy enrolled', '2026-06-30T09:40:00Z', { policyId: 'SBI-IIE-00341', farmer: 'Ramesh Kumar' }, '0'.repeat(64));
    records.push(genesis);
    records.push(createAuditRecord(2, 'Oracle quorum triggered', '2026-06-30T09:42:00Z', { quorum: 0.94, source: 'NASA+IMD' }, genesis.hash));
    records.push(createAuditRecord(3, 'Smart contract executed', '2026-06-30T09:42:01Z', { txHash: '0xabc123' }, records[1].hash));
    records.push(createAuditRecord(4, 'IMPS payout settled', '2026-06-30T09:42:04Z', { amount: 48200, rrn: '924819023741' }, records[2].hash));
    return records;
  }

  it('valid chain passes integrity check', () => {
    const chain = buildChain();
    expect(verifyChain(chain).valid).toBe(true);
  });

  it('tampered record fails integrity check', () => {
    const chain = buildChain();
    // Tamper with record 2
    chain[2] = { ...chain[2], data: { txHash: '0xmalicious' } };
    const result = verifyChain(chain);
    expect(result.valid).toBe(false);
    expect(result.brokenAt).toBe(2);
  });

  it('broken prevHash link fails integrity check', () => {
    const chain = buildChain();
    chain[1] = { ...chain[1], prevHash: '0'.repeat(64) };
    const result = verifyChain(chain);
    expect(result.valid).toBe(false);
    expect(result.brokenAt).toBe(1);
  });

  it('single-record chain is always valid', () => {
    const chain = [buildChain()[0]];
    expect(verifyChain(chain).valid).toBe(true);
  });

  it('each record hash is deterministic', () => {
    const r1 = createAuditRecord(1, 'test', '2026-01-01T00:00:00Z', { x: 1 }, '0'.repeat(64));
    const r2 = createAuditRecord(1, 'test', '2026-01-01T00:00:00Z', { x: 1 }, '0'.repeat(64));
    expect(r1.hash).toBe(r2.hash);
  });

});

describe('IIE Fraud Detection', () => {

  it('flags payout within 72h of enrollment', () => {
    const enrolled = new Date('2026-06-01T09:00:00Z');
    const payout   = new Date('2026-06-01T12:00:00Z'); // 3h later
    expect(isFraud(enrolled, payout, 90, null)).toBe(true);
  });

  it('allows payout after 72h', () => {
    const enrolled = new Date('2026-06-01T09:00:00Z');
    const payout   = new Date('2026-06-05T09:00:00Z'); // 4 days later
    expect(isFraud(enrolled, payout, 90, null)).toBe(false);
  });

  it('flags re-enrollment within 90-day window', () => {
    const lastEnroll = new Date('2026-04-01T00:00:00Z');
    const newEnroll  = new Date('2026-06-01T00:00:00Z'); // 61 days later
    const payout     = new Date('2026-06-15T00:00:00Z');
    expect(isFraud(newEnroll, payout, 90, lastEnroll)).toBe(true);
  });

  it('allows re-enrollment after 90 days', () => {
    const lastEnroll = new Date('2026-01-01T00:00:00Z');
    const newEnroll  = new Date('2026-06-01T00:00:00Z'); // 151 days later
    const payout     = new Date('2026-06-15T00:00:00Z');
    expect(isFraud(newEnroll, payout, 90, lastEnroll)).toBe(false);
  });

});
