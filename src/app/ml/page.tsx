'use client';
import { useState, useEffect, useCallback } from 'react';

interface TrainResult {
  model: string;
  algorithm: string;
  dataset: { n_samples: number; positive_rate: number; features: string[]; districts_covered: number };
  metrics: { accuracy: number; precision: number; recall: number; f1_score: number; auc_roc: number; confusion_matrix: { tp: number; fp: number; tn: number; fn: number } };
  feature_importance: Record<string, number>;
  feature_importance_labels: Record<string, string>;
  stumps: { tree: number; split_feature: string; split_threshold: number; gain: number }[];
}

interface PredictResult {
  district: string;
  risk_score: number;
  risk_level: string;
  triggered: boolean;
  probability: number;
  confidence_interval: { lower: number; upper: number };
  feature_importance: Record<string, { importance_pct: number; contribution: number; direction: string }>;
  shap_waterfall: { feature: string; value: number; cumulative: number }[];
  flags: string[];
  recommendation: string;
}

const DISTRICTS = ['Barmer','Jodhpur','Latur','Nashik','Warangal','Khammam','Puri','Ludhiana','Adilabad'];
const FEAT_COLOR: Record<string, string> = {
  ndvi: '#3b82f6', temp_c: '#ef4444', rainfall_mm: '#06b6d4', soil_moisture: '#22c55e',
};
const FEAT_LABEL: Record<string, string> = {
  ndvi: 'NDVI', temp_c: 'Temp °C', rainfall_mm: 'Rainfall mm', soil_moisture: 'Soil %',
};
const RISK_COLOR: Record<string, string> = {
  CRITICAL: '#ef4444', HIGH: '#f97316', MEDIUM: '#eab308', LOW: '#22c55e',
};

function Bar({ value, max = 100, color, delay = 0, label }: { value: number; max?: number; color: string; delay?: number; label?: string }) {
  const [w, setW] = useState(0);
  useEffect(() => { const t = setTimeout(() => setW(value), delay + 100); return () => clearTimeout(t); }, [value, delay]);
  return (
    <div style={{ marginBottom: 8 }}>
      {label && <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 3 }}>
        <span style={{ color: '#94a3b8' }}>{label}</span>
        <span style={{ fontWeight: 700, color }}>{value.toFixed(1)}%</span>
      </div>}
      <div style={{ background: '#1e293b', borderRadius: 6, height: 10, overflow: 'hidden' }}>
        <div style={{ width: `${(w / max) * 100}%`, background: `linear-gradient(90deg,${color}88,${color})`, height: 10, borderRadius: 6, transition: 'width 1.1s cubic-bezier(0.4,0,0.2,1)', boxShadow: `0 0 8px ${color}44` }} />
      </div>
    </div>
  );
}

export default function MLPage() {
  const [trainData,   setTrainData]   = useState<TrainResult | null>(null);
  const [trainLoading,setTrainLoading]= useState(false);
  const [predictData, setPredictData] = useState<PredictResult | null>(null);
  const [predLoading, setPredLoading] = useState(false);
  const [district,    setDistrict]    = useState('Barmer');
  const [sliders,     setSliders]     = useState({ ndvi: 0.21, temp_c: 47.2, rainfall_mm: 8, soil_moisture_pct: 12 });

  const runTrain = useCallback(async () => {
    setTrainLoading(true);
    try {
      const r = await fetch('/api/ml/train');
      setTrainData(await r.json());
    } finally { setTrainLoading(false); }
  }, []);

  const runPredict = useCallback(async () => {
    setPredLoading(true);
    try {
      const r = await fetch('/api/ml/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ district, ...sliders }),
      });
      setPredictData(await r.json());
    } finally { setPredLoading(false); }
  }, [district, sliders]);

  useEffect(() => { runTrain(); }, [runTrain]);
  useEffect(() => { runPredict(); }, []); // eslint-disable-line

  const rcol = predictData ? RISK_COLOR[predictData.risk_level] || '#64748b' : '#64748b';

  return (
    <div style={{ minHeight: '100vh', background: '#030712', color: '#e2e8f0', fontFamily: "'Inter',system-ui,sans-serif" }}>
      <style>{`
        * { box-sizing: border-box; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin { to{transform:rotate(360deg)} }
        .fade-up { animation: fadeUp 0.4s ease both; }
        input[type=range] { -webkit-appearance:none; width:100%; height:6px; background:#1e293b; border-radius:3px; outline:none; }
        input[type=range]::-webkit-slider-thumb { -webkit-appearance:none; width:16px; height:16px; background:#3b82f6; border-radius:50%; cursor:pointer; }
        select,input { font-family:inherit; }
        @media(max-width:768px) { .two-col { grid-template-columns: 1fr !important; } }
      `}</style>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '28px 16px 48px' }}>
        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 11, color: '#3b82f6', fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 6 }}>ML Engine</div>
          <h1 style={{ fontSize: 32, fontWeight: 900, margin: 0 }}>🤖 Gradient <span style={{ background: 'linear-gradient(90deg,#3b82f6,#22c55e)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Boosting</span> Model</h1>
          <p style={{ color: '#64748b', marginTop: 8, fontSize: 13 }}>5-stump ensemble trained on 200 Kharif mock samples. NDVI×38% + Rainfall×27% + Temp×21% + Soil×14%.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }} className="two-col">

          {/* Training Panel */}
          <div style={{ background: '#0d1117', border: '1px solid #1e293b', borderRadius: 16, padding: '20px 22px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h2 style={{ fontSize: 14, fontWeight: 800, margin: 0 }}>Training Console</h2>
              <button onClick={runTrain} disabled={trainLoading}
                style={{ background: trainLoading ? '#1e293b' : '#1d4ed8', color: trainLoading ? '#475569' : '#fff', border: 'none', borderRadius: 8, padding: '6px 14px', fontSize: 11, fontWeight: 700, cursor: trainLoading ? 'default' : 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                {trainLoading ? <><span style={{ width:11,height:11,border:'2px solid #ffffff33',borderTop:'2px solid #fff',borderRadius:'50%',animation:'spin 0.7s linear infinite',display:'inline-block' }} />Training…</> : '🏋️ Train'}
              </button>
            </div>

            {trainData && (
              <div className="fade-up">
                {/* Metrics */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginBottom: 16 }}>
                  {([
                    ['Accuracy',  (trainData.metrics.accuracy  * 100).toFixed(1)+'%', '#22c55e'],
                    ['Precision', (trainData.metrics.precision * 100).toFixed(1)+'%', '#3b82f6'],
                    ['Recall',    (trainData.metrics.recall    * 100).toFixed(1)+'%', '#f59e0b'],
                    ['F1 Score',  (trainData.metrics.f1_score  * 100).toFixed(1)+'%', '#a855f7'],
                    ['AUC-ROC',   trainData.metrics.auc_roc.toFixed(3),               '#06b6d4'],
                    ['Samples',   String(trainData.dataset.n_samples),                '#64748b'],
                  ] as [string,string,string][]).map(([k,v,c]) => (
                    <div key={k} style={{ background: '#030712', border: '1px solid #1e293b', borderRadius: 8, padding: '9px 10px', textAlign: 'center' }}>
                      <div style={{ fontSize: 9, color: '#475569', marginBottom: 2 }}>{k}</div>
                      <div style={{ fontSize: 15, fontWeight: 900, color: c }}>{v}</div>
                    </div>
                  ))}
                </div>

                {/* Confusion matrix */}
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: '#475569', marginBottom: 6, textTransform: 'uppercase' }}>Confusion Matrix</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                    {([
                      ['TP (Correct Trigger)',  trainData.metrics.confusion_matrix.tp, '#052e16', '#22c55e'],
                      ['FP (False Alarm)',      trainData.metrics.confusion_matrix.fp, '#2d0a0a', '#ef4444'],
                      ['FN (Missed Trigger)',   trainData.metrics.confusion_matrix.fn, '#431407', '#f97316'],
                      ['TN (Correct Reject)',   trainData.metrics.confusion_matrix.tn, '#030712', '#64748b'],
                    ] as [string,number,string,string][]).map(([k,v,bg,c]) => (
                      <div key={k} style={{ background: bg, border: `1px solid ${c}33`, borderRadius: 8, padding: '9px 12px' }}>
                        <div style={{ fontSize: 9, color: '#475569', marginBottom: 1 }}>{k}</div>
                        <div style={{ fontSize: 22, fontWeight: 900, color: c }}>{v}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Feature importance */}
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: '#475569', marginBottom: 8, textTransform: 'uppercase' }}>Feature Importance (Gain-based)</div>
                  {Object.entries(trainData.feature_importance).map(([k, v], i) => (
                    <Bar key={k} value={v} label={FEAT_LABEL[k] || k} color={FEAT_COLOR[k] || '#64ffda'} delay={i * 150} />
                  ))}
                </div>

                {/* Stumps */}
                <div style={{ marginTop: 12 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: '#475569', marginBottom: 6, textTransform: 'uppercase' }}>Decision Stumps</div>
                  {trainData.stumps.map(s => (
                    <div key={s.tree} style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 10, color: '#94a3b8', padding: '3px 0', borderBottom: '1px dashed #1e293b' }}>
                      <span style={{ color: '#475569', minWidth: 40 }}>Tree {s.tree}</span>
                      <span style={{ color: FEAT_COLOR[s.split_feature] || '#64748b', fontWeight: 600 }}>{FEAT_LABEL[s.split_feature] || s.split_feature}</span>
                      <span style={{ color: '#64748b' }}>≤ {s.split_threshold}</span>
                      <span style={{ marginLeft: 'auto', color: '#475569' }}>gain={s.gain.toFixed(3)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Prediction Panel */}
          <div style={{ background: '#0d1117', border: '1px solid #1e293b', borderRadius: 16, padding: '20px 22px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h2 style={{ fontSize: 14, fontWeight: 800, margin: 0 }}>Live Predictor</h2>
              <button onClick={runPredict} disabled={predLoading}
                style={{ background: predLoading ? '#1e293b' : 'linear-gradient(135deg,#065f46,#047857)', color: predLoading ? '#475569' : '#d1fae5', border: 'none', borderRadius: 8, padding: '6px 14px', fontSize: 11, fontWeight: 700, cursor: predLoading ? 'default' : 'pointer' }}>
                {predLoading ? 'Predicting…' : '🔮 Predict'}
              </button>
            </div>

            {/* District */}
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 10, color: '#475569', fontWeight: 600, marginBottom: 3 }}>DISTRICT</div>
              <select value={district} onChange={e => setDistrict(e.target.value)}
                style={{ width: '100%', background: '#030712', border: '1px solid #1e293b', borderRadius: 8, padding: '7px 10px', color: '#e2e8f0', fontSize: 12 }}>
                {DISTRICTS.map(d => <option key={d}>{d}</option>)}
              </select>
            </div>

            {/* Sliders */}
            {([
              ['ndvi',             'NDVI',              0.05, 0.95, 0.01],
              ['temp_c',           'Temperature °C',   28,   52,   0.1],
              ['rainfall_mm',      'Rainfall mm',       0,    300,  1],
              ['soil_moisture_pct','Soil Moisture %',   5,    90,   1],
            ] as [keyof typeof sliders, string, number, number, number][]).map(([k, l, min, max, step]) => (
              <div key={k} style={{ marginBottom: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, marginBottom: 4 }}>
                  <span style={{ color: '#94a3b8' }}>{l}</span>
                  <span style={{ fontWeight: 700, color: FEAT_COLOR[k] || '#64ffda' }}>{sliders[k]}</span>
                </div>
                <input type="range" min={min} max={max} step={step} value={sliders[k]}
                  onChange={e => setSliders(s => ({...s,[k]:parseFloat(e.target.value)}))}
                  style={{ accentColor: FEAT_COLOR[k] || '#3b82f6' }} />
              </div>
            ))}

            {predictData && (
              <div className="fade-up">
                {/* Score */}
                <div style={{ background: `${rcol}11`, border: `1px solid ${rcol}44`, borderRadius: 12, padding: '14px 16px', marginBottom: 14, textAlign: 'center' }}>
                  <div style={{ fontSize: 44, fontWeight: 900, color: rcol, lineHeight: 1 }}>{predictData.risk_score}</div>
                  <div style={{ fontSize: 10, color: '#475569', marginBottom: 4 }}>/ 100 · P(trigger)={( predictData.probability*100).toFixed(1)}%</div>
                  <div style={{ display: 'inline-block', background: `${rcol}22`, border: `1px solid ${rcol}55`, borderRadius: 8, padding: '3px 12px', fontSize: 11, fontWeight: 800, color: rcol }}>{predictData.risk_level}</div>
                  <div style={{ fontSize: 10, color: '#475569', marginTop: 4 }}>CI: [{predictData.confidence_interval.lower}, {predictData.confidence_interval.upper}]</div>
                </div>

                {/* SHAP waterfall */}
                <div style={{ marginBottom: 14 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: '#475569', marginBottom: 6, textTransform: 'uppercase' }}>SHAP Waterfall</div>
                  {predictData.shap_waterfall.map(s => {
                    const col = s.value >= 0 ? '#ef4444' : '#22c55e';
                    return (
                      <div key={s.feature} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
                        <span style={{ fontSize: 10, color: '#94a3b8', minWidth: 90 }}>{FEAT_LABEL[s.feature] || s.feature}</span>
                        <div style={{ flex: 1, background: '#1e293b', borderRadius: 4, height: 8, overflow: 'hidden' }}>
                          <div style={{ width: `${Math.min(100, Math.abs(s.value))}%`, background: col, height: 8, borderRadius: 4, marginLeft: s.value < 0 ? 'auto' : '0' }} />
                        </div>
                        <span style={{ fontSize: 10, fontWeight: 700, color: col, minWidth: 36, textAlign: 'right' }}>{s.value > 0 ? '+' : ''}{s.value}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Flags */}
                {predictData.flags.length > 0 && (
                  <div>
                    {predictData.flags.map((f, i) => (
                      <div key={i} style={{ background: '#2d0a0a', border: '1px solid #7f1d1d', borderRadius: 6, padding: '5px 9px', fontSize: 10, color: '#fca5a5', marginBottom: 4 }}>{f}</div>
                    ))}
                  </div>
                )}

                <div style={{ fontSize: 11, color: predictData.triggered ? '#22c55e' : '#94a3b8', fontWeight: 700, marginTop: 8 }}>
                  {predictData.triggered ? '✅' : '🟡'} {predictData.recommendation}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
