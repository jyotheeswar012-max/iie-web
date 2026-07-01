/**
 * /api/oracle
 *
 * Cache-First Oracle Route — SBI IIE Platform
 * -----------------------------------------------
 * Strategy:
 *   1. Race live oracle fetches against an 800 ms hard timeout.
 *   2. If ALL four sources respond in time → return merged live payload
 *      with { source: 'live' }.
 *   3. If ANY source times out or throws → fall back to the matching
 *      static scenario JSON from /public/scenarios/ and return with
 *      { source: 'cache', cacheReason: '...' }.
 *
 * The UI reads `source` and `cacheReason` to render the
 * \"Live data delayed; showing recent valid baseline\" badge.
 *
 * Query params:
 *   ?district=barmer|khammam|ludhiana   (default: barmer)
 *   ?scenario=drought|flood|normal       (overrides district lookup)
 */

import { NextRequest, NextResponse } from 'next/server';
import { readFileSync } from 'fs';
import { join } from 'path';

const TIMEOUT_MS = 800;

// Map districts to their cached scenario files
const DISTRICT_SCENARIO: Record<string, string> = {
  barmer:   'drought',
  jodhpur:  'drought',
  latur:    'drought',
  nashik:   'drought',
  warangal: 'drought',
  khammam:  'flood',
  puri:     'flood',
  ludhiana: 'normal',
};

// Load a scenario JSON from /public/scenarios/
function loadScenario(name: string): Record<string, unknown> {
  const filePath = join(process.cwd(), 'public', 'scenarios', `${name}.json`);
  const raw = readFileSync(filePath, 'utf-8');
  return JSON.parse(raw);
}

// Race a promise against a timeout
function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  const timeout = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error(`Oracle timeout after ${ms}ms`)), ms)
  );
  return Promise.race([promise, timeout]);
}

// Simulate live oracle fetches (replace with real API calls in production)
async function fetchNDVI(district: string): Promise<number> {
  // Real: await fetch(`https://modis.ornl.gov/rst/api/v1/...?district=${district}`)
  // Simulated with variable latency to demonstrate fallback in dev
  const latency = Math.random() * 1200; // 0–1200ms — will sometimes exceed 800ms
  await new Promise(r => setTimeout(r, latency));
  return 0.21 + Math.random() * 0.5;
}

async function fetchRainfall(district: string): Promise<number> {
  const latency = Math.random() * 900;
  await new Promise(r => setTimeout(r, latency));
  return 5 + Math.random() * 200;
}

async function fetchTemp(district: string): Promise<number> {
  const latency = Math.random() * 700;
  await new Promise(r => setTimeout(r, latency));
  return 28 + Math.random() * 20;
}

async function fetchSoil(district: string): Promise<number> {
  const latency = Math.random() * 600;
  await new Promise(r => setTimeout(r, latency));
  return 10 + Math.random() * 65;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const districtParam = (searchParams.get('district') ?? 'barmer').toLowerCase();
  const scenarioParam = searchParams.get('scenario');

  const scenarioName = scenarioParam ?? DISTRICT_SCENARIO[districtParam] ?? 'drought';

  // Try live fetch with hard timeout
  let liveData: Record<string, unknown> | null = null;
  let fallbackReason = '';

  try {
    const [ndvi, rainfall, temp, soil] = await withTimeout(
      Promise.all([
        fetchNDVI(districtParam),
        fetchRainfall(districtParam),
        fetchTemp(districtParam),
        fetchSoil(districtParam),
      ]),
      TIMEOUT_MS
    );

    // All four oracles responded in time — build live payload
    const scenario = loadScenario(scenarioName);
    const cached   = scenario as { oracle: Record<string, { value: number; source: string; date: string; label: string; unit?: string }>; risk: Record<string, unknown>; farmers: number; district: string; state: string; event: string; };

    liveData = {
      scenario:  scenarioName,
      district:  cached.district,
      state:     cached.state,
      event:     cached.event,
      fetchedAt: new Date().toISOString(),
      source:    'live',
      oracle: {
        ndvi:     { value: Math.round(ndvi * 100) / 100,   source: cached.oracle.ndvi.source,     date: new Date().toISOString().slice(0, 10), label: ndvi < 0.3 ? 'Severe stress' : ndvi < 0.5 ? 'Moderate stress' : ndvi < 0.65 ? 'Mild stress' : 'Healthy' },
        rainfall: { value: Math.round(rainfall),           source: cached.oracle.rainfall.source, date: new Date().toISOString().slice(0, 10), unit: 'mm', label: rainfall < 25 ? 'Drought risk' : rainfall > 200 ? 'Flood risk' : 'Normal' },
        temp:     { value: Math.round(temp * 10) / 10,     source: cached.oracle.temp.source,     date: new Date().toISOString().slice(0, 10), unit: 'degC', label: temp > 42 ? 'Heatwave' : 'Normal' },
        soil:     { value: Math.round(soil),               source: cached.oracle.soil.source,     date: new Date().toISOString().slice(0, 10), unit: '%', label: soil < 20 ? 'Critically dry' : soil > 60 ? 'Saturated' : 'Adequate' },
      },
      farmers: cached.farmers,
    };
  } catch (err: unknown) {
    fallbackReason = err instanceof Error ? err.message : 'Unknown oracle error';
  }

  // If live succeeded, return it
  if (liveData) {
    return NextResponse.json(liveData, {
      headers: { 'Cache-Control': 'no-store' },
    });
  }

  // Graceful degradation — serve static scenario cache
  let cached: Record<string, unknown>;
  try {
    cached = loadScenario(scenarioName);
  } catch {
    return NextResponse.json(
      { error: 'Scenario cache missing', scenario: scenarioName },
      { status: 500 }
    );
  }

  const response = {
    ...cached,
    source:       'cache',
    cacheReason:  'Live data delayed; showing recent valid baseline',
    fallbackDetail: fallbackReason,
    servedAt:     new Date().toISOString(),
  };

  return NextResponse.json(response, {
    headers: {
      'Cache-Control':  'public, max-age=60, stale-while-revalidate=300',
      'X-Oracle-Source': 'cache',
    },
  });
}
