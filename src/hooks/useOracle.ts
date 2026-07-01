/**
 * useOracle — Cache-First Oracle Hook
 * ------------------------------------
 * Calls /api/oracle?district=<district>
 * Exposes { data, source, cacheReason, loading, error }
 * so any component can render the "Live data delayed" badge.
 */

import { useState, useEffect, useRef } from 'react';

export type OracleSource = 'live' | 'cache' | 'idle';

export interface OracleOrb {
  value: number;
  source: string;
  date: string;
  label: string;
  unit?: string;
}

export interface OracleRisk {
  weightedScore: number;
  eligible: boolean;
  payoutEstimate: number;
  premiumEstimate: number;
  confidence: number;
}

export interface OracleData {
  scenario: string;
  district: string;
  state: string;
  event: string;
  source: OracleSource;
  cacheReason?: string;
  fallbackDetail?: string;
  cachedAt?: string;
  fetchedAt?: string;
  servedAt?: string;
  oracle: {
    ndvi:     OracleOrb;
    rainfall: OracleOrb;
    temp:     OracleOrb;
    soil:     OracleOrb;
  };
  risk: OracleRisk;
  farmers: number;
}

interface UseOracleResult {
  data:        OracleData | null;
  source:      OracleSource;
  cacheReason: string;
  loading:     boolean;
  error:       string | null;
  refetch:     () => void;
}

export function useOracle(district: string): UseOracleResult {
  const [data,        setData]        = useState<OracleData | null>(null);
  const [source,      setSource]      = useState<OracleSource>('idle');
  const [cacheReason, setCacheReason] = useState('');
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState<string | null>(null);
  const fetchCount = useRef(0);

  const fetchOracle = async () => {
    if (!district) return;
    setLoading(true);
    setError(null);
    const callId = ++fetchCount.current;

    try {
      const res  = await fetch(`/api/oracle?district=${encodeURIComponent(district.toLowerCase())}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json: OracleData = await res.json();

      if (callId !== fetchCount.current) return; // stale response guard

      setData(json);
      setSource(json.source ?? 'live');
      setCacheReason(json.cacheReason ?? '');
    } catch (err) {
      if (callId !== fetchCount.current) return;
      setError(err instanceof Error ? err.message : 'Oracle fetch failed');
      setSource('cache');
      setCacheReason('Live data delayed; showing recent valid baseline');
    } finally {
      if (callId === fetchCount.current) setLoading(false);
    }
  };

  useEffect(() => {
    fetchOracle();
  }, [district]); // eslint-disable-line react-hooks/exhaustive-deps

  return { data, source, cacheReason, loading, error, refetch: fetchOracle };
}
