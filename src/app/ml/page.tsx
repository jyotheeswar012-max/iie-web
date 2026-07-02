'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';

const C = {
  bg: '#060D1A', panel: '#0C1829', border: 'rgba(246,139,31,0.14)',
  text: '#F5F7FA', sub: '#8FA3C0',
  orange: '#F68B1F', green: '#3fb950', blue: '#82b1ff',
  purple: '#a78bfa', red: '#f85149', teal: '#64ffda', amber: '#e3b341',
};

const FEATURES = [
  { name: 'NDVI Score',             src: 'NASA MODIS / Sentinel-2', pct: 38, color: '#3fb950', tag: 'Crop vigour — drought confirmed when < 0.35',     shap: '+0.42' },
  { name: 'Rainfall Anomaly (30d)', src: 'IMD District Bulletin',   pct: 27, color: '#82b1ff', tag: '< 20 mm in 30 days vs 15-yr mean',                 shap: '+0.31' },
  { name: 'Land Surface Temp',      src: 'ISRO Bhuvan',             pct: 21, color: '#F68B1F', tag: 'Threshold >= 45 °C = heat stress confirmed',         shap: '+0.24' },
  { name: 'Soil Moisture %',        src: 'ICAR Sensor Network',     pct: 14, color: '#e3b341', tag: '< 15% field capacity = drought-grade moisture',     shap: '+0.16' },
];

const METRICS = [
  { k: 'AUC-ROC',   v: '0.8333', color: '#3fb950', note: 'Held-out 85-row test set' },
  { k: 'F1 Score',  v: '0.85',   color: '#64ffda', note: 'Harmonic mean P/R' },
  { k: 'Precision', v: '0.79',   color: '#82b1ff', note: 'TP / (TP + FP)' },
  { k: 'Recall',    v: '0.91',   color: '#a78bfa', note: 'TP / (TP + FN)' },
];

const MODEL_CARD = [
  { k: 'Architecture',      v: 'Logistic Regression (scikit-learn 1.4)' },
  { k: 'Training data',     v: '500-row dataset · 423 used after cleaning · 338 train / 85 test' },
  { k: 'Features',          v: 'NDVI, Rainfall anomaly, Land surface temp, Soil moisture (all district-level)' },
  { k: 'Train/test split',  v: '80/20 stratified · random_state=42' },
  { k: 'SHAP method',       v: 'LinearExplainer — exact φᵢ = coefᵢ × (xᵢ − μᵢ) / σᵢ' },
  { k: 'Inference runtime', v: 'TypeScript dot-product on model_weights.json — no Python at runtime' },
  { k: 'Trigger policy',    v: 'Oracle >= 75% quorum — LR score is an input, not the sole trigger' },
  { k: 'PII in model',      v: 'None — farmer identity never used as a feature' },
];

const THRESHOLDS = [
  { threshold: 'NDVI < 0.35',     source: 'FAO Crop Monitor Drought Classification' },
  { threshold: 'Rain < 20 mm/30d',source: 'IMD District Drought Alert Protocol' },
  { threshold: 'LST > 45 °C',     source: 'ISRO Bhuvan Heat Stress Standard' },
  { threshold: 'Soil < 15%',      source: 'ICAR Field Capacity Baseline' },
  { threshold: 'Quorum >= 75%',   source: 'IIE Contract Specification, clause 4.2' },
];

const SHAP_FORMULA = [
  { step: '1', text: 'Load coef_, intercept_, feature means μ and stds σ from model_weights.json' },
  { step: '2', text: 'For each feature i: φᵢ = coefᵢ × (xᵢ − μᵢ) / σᵢ  (exact LinearExplainer result)' },
  { step: '3', text: 'base_value = σ(intercept_ + Σ coefᵢ × μᵢ/σᵢ)  — average model output' },
  { step: '4', text: 'prediction = σ(intercept_ + Σ coefᵢ × xᵢ/σᵢ)  — individual prediction' },
  { step: '5', text: 'Verify: base_value + Σφᵢ ≈ prediction  (additivity check, tolerance 1e-6)' },
];

export default function MLPage() {
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setAnimate(true), 200);
    return () => clearTimeout(t);
  }, []);

  return (
    <div style={{ background: C.bg, color: C.text, minHeight: '100vh', padding: '0 0 64px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '28px 18px 0' }}>

        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <Link href="/judge" style={{ fontSize: 11, fontWeight: 700, color: C.orange, textDecoration: 'none', display: 'inline-block', marginBottom: 8 }}>
            &larr; Judge Demo
          </Link>
          <h1 style={{ margin: '8px 0 6px', fontSize: 34, fontWeight: 900 }}>ML Model &mdash; Logistic Regression + SHAP</h1>
          <p style={{ margin: 0, color: C.sub, fontSize: 14, lineHeight: 1.65 }}>
            Real Logistic Regression &middot; 500-row dataset, 423 used after cleaning, 338 train&nbsp;/&nbsp;85 test &middot;
            AUC&nbsp;=&nbsp;0.8333 &middot; F1&nbsp;=&nbsp;0.85 &middot;
            Exact SHAP via LinearExplainer &middot; Inference runs as TypeScript dot-product on Vercel Edge &mdash; no Python at runtime.
          </p>
        </div>

        {/* Metrics strip */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 24 }}>
          {METRICS.map(m => (
            <div key={m.k} style={{ borderRadius: 16, padding: '18px 20px', background: C.panel, border: `1px solid ${m.color}44`, textAlign: 'center' }}>
              <div style={{ fontSize: 32, fontWeight: 900, color: m.color, lineHeight: 1 }}>{m.v}</div>
              <div style={{ fontSize: 13, fontWeight: 800, color: C.text, marginTop: 4 }}>{m.k}</div>
              <div style={{ fontSize: 10, color: C.sub, marginTop: 3 }}>{m.note}</div>
            </div>
          ))}
        </div>

        {/* Model Card */}
        <div style={{ borderRadius: 20, border: `1px solid ${C.border}`, background: C.panel, padding: '20px 24px', marginBottom: 24 }}>
          <h2 style={{ margin: '0 0 14px', fontSize: 17, fontWeight: 900 }}>Model Card</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }}>
            {MODEL_CARD.map(r => (
              <div key={r.k} style={{ borderRadius: 12, padding: '10px 14px', background: '#0a1120', border: `1px solid ${C.border}` }}>
                <div style={{ fontSize: 10, color: C.sub, marginBottom: 3, fontWeight: 700 }}>{r.k}</div>
                <div style={{ fontSize: 11, color: C.text, lineHeight: 1.5 }}>{r.v}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Verify badge */}
        <div style={{ borderRadius: 16, border: `1px solid ${C.teal}44`, background: `${C.teal}08`, padding: '14px 20px', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 22 }}>🔬</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: C.teal, marginBottom: 3 }}>Verify independently</div>
            <div style={{ fontSize: 11, color: C.sub, lineHeight: 1.6 }}>
              Training code: <code style={{ color: C.teal }}>scripts/train_model.py</code> &nbsp;·&nbsp;
              Weights: <code style={{ color: C.teal }}>src/data/model_weights.json</code> &nbsp;·&nbsp;
              Inference: <code style={{ color: C.teal }}>src/app/api/ml/predict/route.ts</code> &nbsp;·&nbsp;
              <code style={{ color: C.amber }}>curl -X POST /api/ml/predict -H &apos;Content-Type: application/json&apos; -d &apos;&#123;&quot;district&quot;:&quot;Barmer&quot;,&quot;ndvi&quot;:0.21,&quot;temp_c&quot;:47.2,&quot;rainfall_mm&quot;:8,&quot;soil_moisture_pct&quot;:12,&quot;event_type&quot;:&quot;drought&quot;&#125;&apos;</code>
            </div>
          </div>
        </div>

        {/* SHAP Feature Importance */}
        <div style={{ borderRadius: 20, border: `1px solid ${C.border}`, background: C.panel, padding: '22px 24px', marginBottom: 24 }}>
          <h2 style={{ margin: '0 0 6px', fontSize: 18, fontWeight: 900 }}>SHAP Feature Importance</h2>
          <p style={{ margin: '0 0 18px', fontSize: 11, color: C.sub }}>
            Mean |φᵢ| across test set &middot; Computed via LinearExplainer (exact, not approximate) &middot;
            All features are district-level sovereign data — no farmer PII
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {FEATURES.map((f, i) => (
              <div key={i}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                  <div>
                    <span style={{ fontSize: 13, fontWeight: 800, color: C.text }}>{f.name}</span>
                    <span style={{ marginLeft: 10, fontSize: 10, color: C.sub }}>{f.src}</span>
                    <div style={{ fontSize: 10, color: C.sub, marginTop: 2 }}>{f.tag}</div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontSize: 22, fontWeight: 900, color: f.color, lineHeight: 1 }}>{f.pct}%</div>
                    <div style={{ fontSize: 10, color: C.sub }}>SHAP {f.shap}</div>
                  </div>
                </div>
                <div style={{ height: 12, borderRadius: 6, background: '#1e293b', overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', borderRadius: 6, background: f.color,
                    width: animate ? `${f.pct}%` : '0%',
                    transition: 'width 0.9s ease',
                  }} />
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 16, padding: '10px 14px', borderRadius: 10, background: '#0a1120', border: `1px solid ${C.border}` }}>
            <span style={{ fontSize: 10, color: C.sub }}>
              No farmer demographic, name, Aadhaar, or location data is used as a model feature.
              All inputs are geo-aggregated at district level. SHAP computed using LinearExplainer on the 85-row held-out test set.
              Values stable across 5-fold CV (σ &lt; 0.02).
            </span>
          </div>
        </div>

        {/* SHAP formula */}
        <div style={{ borderRadius: 20, border: `1px solid ${C.purple}44`, background: C.panel, padding: '22px 24px', marginBottom: 24 }}>
          <h2 style={{ margin: '0 0 6px', fontSize: 18, fontWeight: 900 }}>How SHAP is Computed (LinearExplainer)</h2>
          <p style={{ margin: '0 0 14px', fontSize: 11, color: C.sub }}>
            Linear models admit exact SHAP values — no sampling, no approximation. Every prediction ships with these values in the API response.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {SHAP_FORMULA.map(s => (
              <div key={s.step} style={{ display: 'flex', gap: 14, padding: '10px 14px', borderRadius: 12, background: '#0a1120', border: `1px solid ${C.border}` }}>
                <span style={{ fontSize: 11, fontWeight: 900, color: C.purple, flexShrink: 0, width: 18 }}>{s.step}.</span>
                <span style={{ fontSize: 11, color: C.text, fontFamily: 'monospace', lineHeight: 1.6 }}>{s.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Trigger thresholds */}
        <div style={{ borderRadius: 20, border: `1px solid ${C.border}`, background: C.panel, padding: '22px 24px', marginBottom: 24 }}>
          <h2 style={{ margin: '0 0 6px', fontSize: 18, fontWeight: 900 }}>Payout Trigger Thresholds</h2>
          <p style={{ margin: '0 0 14px', fontSize: 11, color: C.sub }}>
            Each threshold is drawn from a named sovereign standard — not an arbitrary IIE choice. All 4 must be met + oracle quorum &ge; 75%.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {THRESHOLDS.map((t, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '10px 16px', borderRadius: 12, background: '#0a1120', border: `1px solid ${C.border}` }}>
                <span style={{ fontSize: 16, color: C.teal }}>✓</span>
                <div style={{ flex: 1 }}>
                  <span style={{ fontSize: 13, fontWeight: 800, color: C.teal, fontFamily: 'monospace' }}>{t.threshold}</span>
                  <span style={{ marginLeft: 12, fontSize: 10, color: C.sub }}>{t.source}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer nav */}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
          {[
            { label: 'Judge Demo',  href: '/judge',   color: C.orange },
            { label: 'Agents',      href: '/agents',  color: C.purple },
            { label: 'Impact',      href: '/impact',  color: C.amber  },
            { label: 'Home',        href: '/',        color: C.sub    },
          ].map(b => (
            <Link key={b.href} href={b.href} style={{ padding: '9px 18px', borderRadius: 12, background: `${b.color}12`, border: `1px solid ${b.color}44`, color: b.color, fontSize: 11, fontWeight: 800, textDecoration: 'none' }}>
              {b.label}
            </Link>
          ))}
        </div>

      </div>
    </div>
  );
}
