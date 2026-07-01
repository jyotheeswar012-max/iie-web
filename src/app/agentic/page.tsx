'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

// ─────────────────────────────────────────────────────────────────────────────
// THEME
// ─────────────────────────────────────────────────────────────────────────────
const C = {
  bg:     '#060D1A',
  panel:  '#0C1829',
  border: 'rgba(246,139,31,0.14)',
  text:   '#F5F7FA',
  sub:    '#8FA3C0',
  orange: '#F68B1F',
  green:  '#3fb950',
  blue:   '#82b1ff',
  purple: '#a78bfa',
  red:    '#f85149',
  teal:   '#64ffda',
  amber:  '#e3b341',
};

// ─────────────────────────────────────────────────────────────────────────────
// 4 AGENT CARDS
// ─────────────────────────────────────────────────────────────────────────────
const AGENTS = [
  {
    id: 'A1',
    name: 'NDVI Sentinel',
    icon: '🛰️',
    color: C.teal,
    source: 'NASA MODIS · 250m · 16-day composite',
    role: 'Monitors vegetation index across enrolled districts. Flags Severe Stress (NDVI < 0.30) as a primary drought trigger.',
    trigger: 'NDVI < 0.30',
    weight: '40%',
    lastPing: '4 min ago',
    status: 'ALERT',
    metric: 'NDVI 0.21 — Barmer',
  },
  {
    id: 'A2',
    name: 'Rain Watcher',
    icon: '🌧️',
    color: C.blue,
    source: 'IMD District API · 24h rolling',
    role: 'Tracks district-level cumulative rainfall. Fires drought signal when < 25mm or flood signal when > 200mm in 24 h.',
    trigger: '< 25mm drought / > 200mm flood',
    weight: '25%',
    lastPing: '2 min ago',
    status: 'ALERT',
    metric: '8mm — Barmer (drought)',
  },
  {
    id: 'A3',
    name: 'Thermal Guard',
    icon: '🌡️',
    color: C.amber,
    source: 'ISRO Bhuvan · Land Surface Temp · 1km',
    role: 'Detects heatwave events when land-surface temperature exceeds 42°C. Weighted alongside NDVI for compounded crop stress.',
    trigger: 'LST > 42°C',
    weight: '25%',
    lastPing: '6 min ago',
    status: 'ALERT',
    metric: '47.2°C — Barmer',
  },
  {
    id: 'A4',
    name: 'Soil Moisture Oracle',
    icon: '🌱',
    color: C.green,
    source: 'ICAR-IARI Sensor Network',
    role: 'Reads volumetric soil moisture from ICAR field sensors. Critical dry threshold at 15% — permanent wilting point for most crops.',
    trigger: 'Soil < 15%',
    weight: '10%',
    lastPing: '9 min ago',
    status: 'NOMINAL',
    metric: '12% — Barmer (dry)',
  },
];

function AgentCards() {
  const [expanded, setExpanded] = useState<string | null>(null);
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,minmax(0,1fr))', gap: 14, marginBottom: 22 }}>
      {AGENTS.map(a => {
        const isAlert = a.status === 'ALERT';
        const open = expanded === a.id;
        return (
          <div
            key={a.id}
            onClick={() => setExpanded(open ? null : a.id)}
            style={{
              borderRadius: 18,
              border: `1px solid ${open ? a.color : isAlert ? a.color + '55' : C.border}`,
              background: open ? `${a.color}08` : isAlert ? `${a.color}05` : C.panel,
              padding: '18px 20px',
              cursor: 'pointer',
              transition: 'all 0.18s',
              boxShadow: isAlert ? `0 0 22px ${a.color}14` : 'none',
            }}
          >
            {/* Top row */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 28 }}>{a.icon}</span>
                <div>
                  <div style={{ fontWeight: 900, fontSize: 14, color: a.color }}>{a.name}</div>
                  <div style={{ fontSize: 10, color: C.sub, marginTop: 2 }}>{a.source}</div>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
                <span style={{
                  fontSize: 10, fontWeight: 800, padding: '3px 10px', borderRadius: 999,
                  background: isAlert ? `${a.color}20` : '#3fb95020',
                  color: isAlert ? a.color : C.green,
                  border: `1px solid ${isAlert ? a.color + '44' : C.green + '44'}`,
                }}>{a.status}</span>
                <span style={{ fontSize: 9, color: C.sub }}>{a.lastPing}</span>
              </div>
            </div>

            {/* Metric bar */}
            <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 13, fontWeight: 800, color: isAlert ? a.color : C.green, fontFamily: 'monospace' }}>{a.metric}</span>
              <span style={{ fontSize: 10, color: C.sub }}>Weight: <b style={{ color: C.text }}>{a.weight}</b></span>
            </div>

            {/* Expanded detail */}
            {open && (
              <div style={{ marginTop: 14, paddingTop: 14, borderTop: `1px solid ${C.border}` }}>
                <p style={{ margin: '0 0 10px', fontSize: 12, color: C.sub, lineHeight: 1.65 }}>{a.role}</p>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 999, background: `${a.color}18`, color: a.color }}>Trigger: {a.trigger}</span>
                  <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 999, background: `${C.purple}18`, color: C.purple }}>Quorum weight: {a.weight}</span>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 72H SCENARIO PLAYER
// ─────────────────────────────────────────────────────────────────────────────
const SCENARIO_STEPS = [
  {
    h: 0,
    label: 'T+0h — Baseline Normal',
    icon: '🌤️',
    color: C.green,
    ndvi: 0.42, rain: 18, temp: 36, soil: 32,
    agentVerdict: 'Monitoring · No anomaly detected',
    passiveAction: 'System idle — no trigger',
    agenticAction: 'Agents running background scans every 15 min',
    notification: null,
  },
  {
    h: 18,
    label: 'T+18h — Early Stress Signal',
    icon: '🌡️',
    color: C.amber,
    ndvi: 0.31, rain: 10, temp: 43, soil: 20,
    agentVerdict: 'NDVI Sentinel: borderline · Thermal Guard: ALERT',
    passiveAction: 'System idle — threshold not crossed',
    agenticAction: '⚡ Agent coalition pre-computes risk trajectory. Farmer advisory SMS sent: "Irrigate within 6h."',
    notification: { title: 'SBI YONO', body: 'Barmer weather alert: Heatwave building. Irrigate by 6 PM to protect crops.', time: '2:14 PM' },
  },
  {
    h: 36,
    label: 'T+36h — Threshold Crossed',
    icon: '🔴',
    color: C.red,
    ndvi: 0.21, rain: 8, temp: 47, soil: 12,
    agentVerdict: '4-agent quorum: 91% confidence · TRIGGER FIRED',
    passiveAction: 'Trigger detected — human review required before payout',
    agenticAction: '⚡ Smart contract auto-executed. IMPS payout ₹48,200 dispatched. RRN generated.',
    notification: { title: 'SBI YONO', body: 'Drought trigger confirmed — Barmer. Payout ₹48,200 sent to your account (RRN 924819023741).', time: '11:42 AM' },
  },
  {
    h: 56,
    label: 'T+56h — Post-Payout Monitoring',
    icon: '✅',
    color: C.teal,
    ndvi: 0.21, rain: 8, temp: 46, soil: 11,
    agentVerdict: 'Payout settled · Monitoring for policy reset conditions',
    passiveAction: 'Payout complete — case closed',
    agenticAction: '⚡ Agent continues monitoring for secondary event. Policy reset eligibility tracked.',
    notification: { title: 'SBI YONO', body: 'Payout confirmed: ₹48,200 credited. Tap to view receipt and lodge grievance if needed.', time: '11:45 AM' },
  },
  {
    h: 72,
    label: 'T+72h — Grievance Window Open',
    icon: '📋',
    color: C.blue,
    ndvi: 0.22, rain: 9, temp: 44, soil: 13,
    agentVerdict: 'Monitoring · Grievance window 72h from payout',
    passiveAction: 'Farmer calls branch — manual escalation',
    agenticAction: '⚡ Grievance bot active. Farmer disputes via YONO chat. AI explains oracle data used. Resolved in < 5 min.',
    notification: { title: 'SBI YONO', body: '72h grievance window is open. Tap here to raise a dispute or view oracle proof for your claim.', time: '11:42 AM' },
  },
];

// YONO phone mock
function YonoPhone({ notification }: { notification: { title: string; body: string; time: string } | null }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    setShow(false);
    if (!notification) return;
    const t = setTimeout(() => setShow(true), 300);
    return () => clearTimeout(t);
  }, [notification]);

  return (
    <div style={{
      width: 200,
      borderRadius: 36,
      background: '#0a0a0a',
      border: '6px solid #1a1a1a',
      boxShadow: '0 24px 60px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.06)',
      padding: '18px 10px 22px',
      flexShrink: 0,
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Notch */}
      <div style={{ width: 60, height: 14, borderRadius: 8, background: '#111', margin: '0 auto 14px', border: '1px solid #222' }} />

      {/* Lock screen */}
      <div style={{ borderRadius: 22, background: 'linear-gradient(160deg,#0F1E36,#1a2a4a)', minHeight: 300, padding: '16px 12px', position: 'relative', overflow: 'hidden' }}>
        {/* Wallpaper clock */}
        <div style={{ textAlign: 'center', marginBottom: 12 }}>
          <div style={{ fontSize: 28, fontWeight: 900, color: '#fff', letterSpacing: '-1px' }}>
            {new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}
          </div>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' })}
          </div>
        </div>

        {/* Notification */}
        <div style={{
          borderRadius: 14,
          background: 'rgba(255,255,255,0.10)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.12)',
          padding: '10px 12px',
          opacity: show ? 1 : 0,
          transform: show ? 'translateY(0)' : 'translateY(-16px)',
          transition: 'all 0.45s cubic-bezier(0.34,1.56,0.64,1)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
            <div style={{ width: 24, height: 24, borderRadius: 6, background: 'linear-gradient(135deg,#1a3a6b,#F68B1F)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12 }}>💳</div>
            <div>
              <div style={{ fontSize: 10, fontWeight: 800, color: '#fff' }}>{notification?.title ?? 'SBI YONO'}</div>
              <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.5)' }}>now</div>
            </div>
          </div>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.85)', lineHeight: 1.5 }}>
            {notification?.body ?? ''}
          </div>
        </div>

        {/* Slide to unlock */}
        {!notification && (
          <div style={{ position: 'absolute', bottom: 14, left: 0, right: 0, textAlign: 'center', fontSize: 9, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.08em' }}>
            — swipe to unlock —
          </div>
        )}
      </div>

      {/* Home bar */}
      <div style={{ width: 50, height: 4, borderRadius: 2, background: '#333', margin: '12px auto 0' }} />
    </div>
  );
}

function ScenarioPlayer() {
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const s = SCENARIO_STEPS[step];

  useEffect(() => {
    if (playing) {
      intervalRef.current = setInterval(() => {
        setStep(prev => {
          if (prev >= SCENARIO_STEPS.length - 1) { setPlaying(false); return prev; }
          return prev + 1;
        });
      }, 2200);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [playing]);

  const barPct = (step / (SCENARIO_STEPS.length - 1)) * 100;

  return (
    <div style={{ borderRadius: 20, border: `2px solid ${C.orange}44`, background: C.panel, overflow: 'hidden', marginBottom: 22 }}>
      {/* Header */}
      <div style={{ padding: '16px 24px', borderBottom: `1px solid ${C.border}`, background: `${C.orange}0a`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
        <div>
          <span style={{ fontWeight: 900, fontSize: 15, color: C.orange }}>⏱ 72h Proactive Scenario Player</span>
          <span style={{ marginLeft: 12, fontSize: 11, color: C.sub }}>Barmer, Rajasthan · Drought event simulation</span>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => { setStep(0); setPlaying(false); }}
            style={{ padding: '6px 14px', borderRadius: 999, border: `1px solid ${C.border}`, background: 'transparent', color: C.sub, fontSize: 11, fontWeight: 800, cursor: 'pointer' }}>
            ⏮ Reset
          </button>
          <button
            onClick={() => setStep(s => Math.max(0, s - 1))}
            disabled={step === 0}
            style={{ padding: '6px 14px', borderRadius: 999, border: `1px solid ${C.border}`, background: 'transparent', color: step === 0 ? '#333' : C.text, fontSize: 11, fontWeight: 800, cursor: step === 0 ? 'default' : 'pointer' }}>
            ‹ Prev
          </button>
          <button
            onClick={() => setPlaying(p => !p)}
            style={{ padding: '6px 20px', borderRadius: 999, border: 'none', background: playing ? C.amber : C.orange, color: '#030712', fontSize: 11, fontWeight: 900, cursor: 'pointer' }}>
            {playing ? '⏸ Pause' : '▶ Play'}
          </button>
          <button
            onClick={() => setStep(s => Math.min(SCENARIO_STEPS.length - 1, s + 1))}
            disabled={step === SCENARIO_STEPS.length - 1}
            style={{ padding: '6px 14px', borderRadius: 999, border: `1px solid ${C.border}`, background: 'transparent', color: step === SCENARIO_STEPS.length - 1 ? '#333' : C.text, fontSize: 11, fontWeight: 800, cursor: step === SCENARIO_STEPS.length - 1 ? 'default' : 'pointer' }}>
            Next ›
          </button>
        </div>
      </div>

      {/* Timeline bar */}
      <div style={{ padding: '14px 24px 0', background: '#0a1120' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
          {SCENARIO_STEPS.map((ss, i) => (
            <button
              key={i}
              onClick={() => { setPlaying(false); setStep(i); }}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                opacity: i === step ? 1 : 0.45,
                transition: 'opacity 0.2s',
              }}
            >
              <div style={{
                width: 14, height: 14, borderRadius: '50%',
                background: i <= step ? ss.color : '#1e293b',
                border: `2px solid ${i === step ? ss.color : '#2e4470'}`,
                boxShadow: i === step ? `0 0 12px ${ss.color}` : 'none',
                transition: 'all 0.3s',
              }} />
              <span style={{ fontSize: 9, color: i === step ? ss.color : C.sub, fontWeight: 700, whiteSpace: 'nowrap' }}>T+{ss.h}h</span>
            </button>
          ))}
        </div>
        <div style={{ height: 4, borderRadius: 2, background: '#1e293b', marginBottom: 0 }}>
          <div style={{ height: '100%', borderRadius: 2, background: `linear-gradient(90deg,${C.green},${s.color})`, width: `${barPct}%`, transition: 'width 0.4s ease' }} />
        </div>
      </div>

      {/* Main content */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 24, padding: 24, alignItems: 'start' }}>
        <div>
          {/* Step title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
            <span style={{ fontSize: 28 }}>{s.icon}</span>
            <div>
              <div style={{ fontWeight: 900, fontSize: 18, color: s.color }}>{s.label}</div>
              <div style={{ fontSize: 12, color: C.sub, marginTop: 2 }}>Agent verdict: <span style={{ color: C.text, fontWeight: 700 }}>{s.agentVerdict}</span></div>
            </div>
          </div>

          {/* Oracle gauges */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,minmax(0,1fr))', gap: 10, marginBottom: 18 }}>
            {[
              { label: 'NDVI', val: s.ndvi.toFixed(2), pct: Math.round(s.ndvi * 100), color: s.ndvi < 0.3 ? C.red : s.ndvi < 0.5 ? C.amber : C.green },
              { label: 'Rainfall', val: `${s.rain}mm`, pct: Math.min(100, Math.round(s.rain / 3)), color: s.rain < 15 ? C.red : C.blue },
              { label: 'Temp', val: `${s.temp}°C`, pct: Math.min(100, Math.round((s.temp / 55) * 100)), color: s.temp > 42 ? C.red : C.green },
              { label: 'Soil', val: `${s.soil}%`, pct: Math.min(100, s.soil * 2), color: s.soil < 15 ? C.red : C.green },
            ].map(g => (
              <div key={g.label} style={{ borderRadius: 12, background: '#0a1120', border: `1px solid ${C.border}`, padding: '12px 14px' }}>
                <div style={{ fontSize: 10, color: C.sub, marginBottom: 5 }}>{g.label}</div>
                <div style={{ fontSize: 18, fontWeight: 900, color: g.color, fontFamily: 'monospace' }}>{g.val}</div>
                <div style={{ marginTop: 6, height: 4, borderRadius: 2, background: '#1e293b' }}>
                  <div style={{ height: '100%', borderRadius: 2, background: g.color, width: `${g.pct}%`, transition: 'width 0.5s ease' }} />
                </div>
              </div>
            ))}
          </div>

          {/* Passive vs Agentic */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div style={{ borderRadius: 14, border: `1px solid ${C.red}33`, background: `${C.red}06`, padding: '14px 16px' }}>
              <div style={{ fontSize: 10, fontWeight: 800, color: C.red, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>😴 Passive Insurance</div>
              <div style={{ fontSize: 12, color: C.sub, lineHeight: 1.65 }}>{s.passiveAction}</div>
            </div>
            <div style={{ borderRadius: 14, border: `1px solid ${C.orange}55`, background: `${C.orange}08`, padding: '14px 16px' }}>
              <div style={{ fontSize: 10, fontWeight: 800, color: C.orange, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>⚡ IIE Agentic AI</div>
              <div style={{ fontSize: 12, color: C.text, lineHeight: 1.65 }}>{s.agenticAction}</div>
            </div>
          </div>
        </div>

        {/* YONO Phone mock */}
        <YonoPhone notification={s.notification} />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PASSIVE VS AGENTIC COMPARISON TABLE
// ─────────────────────────────────────────────────────────────────────────────
const COMPARE_ROWS = [
  { dimension: 'Data collection',        passive: 'Farmer self-reports at harvest',                       agentic: 'Continuous oracle polling every 15 min (NASA · IMD · ISRO · ICAR)' },
  { dimension: 'Trigger detection',      passive: 'Manual inspection or batch job',                       agentic: '4-agent AI quorum — weighted consensus, <15 min detection' },
  { dimension: 'Fraud vector',           passive: 'Inflated claim, false photo evidence',                 agentic: 'Satellite + sensor data — no human input in trigger chain' },
  { dimension: 'Payout speed',           passive: '30–90 days (claim form → surveyor → approval)',        agentic: '<3 seconds — IMPS auto-disbursed on smart contract execution' },
  { dimension: 'Farmer burden',          passive: 'File claim, provide documents, attend inspection',     agentic: 'Zero action needed — system detects and pays automatically' },
  { dimension: 'Early warning',          passive: 'None — claim filed post-loss',                         agentic: '72h advance advisory SMS to irrigate / relocate livestock' },
  { dimension: 'Grievance resolution',   passive: '15–30 days via branch/IRDAI portal',                   agentic: 'AI grievance bot explains oracle proof in <5 min via YONO chat' },
  { dimension: 'Audit trail',            passive: 'Paper files, Excel sheets',                            agentic: 'Immutable Hyperledger Fabric chain — IRDAI read-only access' },
  { dimension: 'Premium pricing',        passive: 'Actuarial tables, blunt district-level rates',         agentic: 'Real-time per-farmer risk score → dynamic premium' },
  { dimension: 'Multi-event handling',   passive: 'One claim per season',                                 agentic: 'Continuous monitoring — secondary event detected and paid separately' },
];

function CompareTable() {
  return (
    <div style={{ borderRadius: 20, border: `1px solid ${C.border}`, background: C.panel, overflow: 'hidden', marginBottom: 22 }}>
      <div style={{ padding: '14px 22px', borderBottom: `1px solid ${C.border}`, background: `${C.purple}0a` }}>
        <div style={{ fontWeight: 900, fontSize: 15, color: C.purple }}>🆚 Passive Insurance vs. Agentic AI</div>
        <div style={{ fontSize: 11, color: C.sub, marginTop: 3 }}>10 dimensions · every row is a judge talking point</div>
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 640 }}>
          <thead>
            <tr style={{ background: '#0a1120' }}>
              <th style={{ textAlign: 'left', padding: '10px 18px', fontSize: 10, fontWeight: 800, color: C.sub, textTransform: 'uppercase', letterSpacing: '0.08em', borderBottom: `1px solid ${C.border}`, width: '22%' }}>Dimension</th>
              <th style={{ textAlign: 'left', padding: '10px 18px', fontSize: 10, fontWeight: 800, color: C.red, textTransform: 'uppercase', letterSpacing: '0.08em', borderBottom: `1px solid ${C.border}`, width: '39%' }}>😴 Passive Insurance</th>
              <th style={{ textAlign: 'left', padding: '10px 18px', fontSize: 10, fontWeight: 800, color: C.orange, textTransform: 'uppercase', letterSpacing: '0.08em', borderBottom: `1px solid ${C.border}`, width: '39%' }}>⚡ IIE Agentic AI</th>
            </tr>
          </thead>
          <tbody>
            {COMPARE_ROWS.map((row, i) => (
              <tr key={row.dimension} style={{ background: i % 2 === 0 ? 'transparent' : '#0a1120' }}>
                <td style={{ padding: '11px 18px', fontSize: 11, fontWeight: 800, color: C.text, borderBottom: `1px solid ${C.border}40` }}>{row.dimension}</td>
                <td style={{ padding: '11px 18px', fontSize: 11, color: C.sub, borderBottom: `1px solid ${C.border}40`, lineHeight: 1.5 }}>{row.passive}</td>
                <td style={{ padding: '11px 18px', fontSize: 11, color: C.text, borderBottom: `1px solid ${C.border}40`, lineHeight: 1.5 }}><span style={{ color: C.orange }}>⚡</span> {row.agentic}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// GFF 2026 THREE-PILLAR CALLOUT
// ─────────────────────────────────────────────────────────────────────────────
const GFF_PILLARS = [
  {
    icon: '🌾',
    number: '01',
    title: 'Climate-Resilient Agriculture Finance',
    color: C.green,
    tagline: 'Parametric triggers replace subjective crop-loss surveys',
    points: [
      'NASA MODIS NDVI, IMD rainfall, ISRO temperature — sovereign data, zero manipulation',
      'Payouts fired in <3s vs 30–90 day traditional claim cycle',
      'Covers drought, flood, cyclone, heatwave from a single policy',
      'Scales to 500+ districts without adding field surveyors',
    ],
    gffRelevance: 'GFF 2026 Track: Agri-Fintech & Climate Insurance Innovation',
  },
  {
    icon: '🤖',
    number: '02',
    title: 'Agentic AI for Financial Inclusion',
    color: C.purple,
    tagline: 'AI agents act — they don\'t just recommend',
    points: [
      '4-agent quorum (NDVI · Rainfall · Thermal · Soil) — no single point of manipulation',
      'Proactive 72h early warning advisory to farmers before loss occurs',
      'Zero-touch claims: farmer never files paperwork or attends inspection',
      'Grievance bot resolves disputes in <5 min using oracle proof',
    ],
    gffRelevance: 'GFF 2026 Track: AI & Digital Infrastructure for Inclusion',
  },
  {
    icon: '🏛️',
    number: '03',
    title: 'Sovereign DPI + Regulatory Trust',
    color: C.orange,
    tagline: 'Built on India Stack — designed for IRDAI audit from day one',
    points: [
      'Aadhaar eKYC + DigiLocker land records + UPI/IMPS payout — 100% India Stack',
      'DPDP Act 2023 compliant: SHA-256 Aadhaar hash, minimal retention, consent-receipted',
      'Hyperledger Fabric audit chain — IRDAI inspector gets permissioned read access',
      'PM-FASAL subsidy auto-applied — government partnership, not competition',
    ],
    gffRelevance: 'GFF 2026 Track: Regulatory Innovation & DPI Governance',
  },
];

function GFFCallout() {
  return (
    <div style={{ borderRadius: 20, border: `2px solid ${C.orange}44`, background: 'linear-gradient(135deg,#060D1A,#0F1E36,#0d0a1a)', padding: 28, marginBottom: 22 }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <div style={{ fontSize: 11, fontWeight: 800, color: C.orange, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 8 }}>Global FinTech Festival 2026</div>
        <h2 style={{ margin: '0 0 8px', fontSize: 24, fontWeight: 900, color: C.text }}>Three Pillars for the GFF Jury</h2>
        <p style={{ margin: 0, color: C.sub, fontSize: 13, maxWidth: 640, marginLeft: 'auto', marginRight: 'auto' }}>
          IIE addresses the three themes GFF 2026 judges score on: climate resilience, AI-led inclusion, and sovereign DPI governance.
        </p>
      </div>

      {/* Pillars */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,minmax(0,1fr))', gap: 16 }}>
        {GFF_PILLARS.map((p, i) => (
          <div key={i} style={{
            borderRadius: 18, border: `1px solid ${p.color}44`,
            background: `${p.color}08`, padding: '22px 20px',
            position: 'relative', overflow: 'hidden',
          }}>
            {/* Big faded number */}
            <div style={{ position: 'absolute', top: -10, right: 10, fontSize: 80, fontWeight: 900, color: `${p.color}08`, lineHeight: 1, userSelect: 'none' }}>{p.number}</div>

            <div style={{ fontSize: 32, marginBottom: 10 }}>{p.icon}</div>
            <div style={{ fontWeight: 900, fontSize: 15, color: p.color, marginBottom: 5 }}>{p.title}</div>
            <div style={{ fontSize: 11, color: C.sub, marginBottom: 14, lineHeight: 1.5, fontStyle: 'italic' }}>"{p.tagline}"</div>

            <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
              {p.points.map((pt, j) => (
                <li key={j} style={{ display: 'flex', gap: 8, fontSize: 11, color: C.sub, lineHeight: 1.55 }}>
                  <span style={{ color: p.color, flexShrink: 0, marginTop: 1 }}>▸</span>
                  {pt}
                </li>
              ))}
            </ul>

            <div style={{ padding: '7px 12px', borderRadius: 10, background: `${p.color}14`, border: `1px solid ${p.color}33`, fontSize: 10, fontWeight: 700, color: p.color }}>
              {p.gffRelevance}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────────────────────
export default function AgenticPage() {
  return (
    <div style={{ background: C.bg, color: C.text, minHeight: '100vh', padding: '0 0 56px' }}>
      <div style={{ maxWidth: 1360, margin: '0 auto', padding: '28px 18px 0' }}>

        {/* ── Hero ── */}
        <div style={{ borderRadius: 24, padding: '36px 36px 28px', marginBottom: 22, background: 'linear-gradient(135deg,#060D1A,#0F1E36,#1a1030)', border: `1px solid ${C.purple}30` }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: C.purple, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 10 }}>
            Agentic AI · 4-Oracle Quorum · 72h Proactive
          </div>
          <h1 style={{ margin: '0 0 10px', fontSize: 36, fontWeight: 900, lineHeight: 1.15 }}>
            Agentic Risk Intelligence
          </h1>
          <p style={{ margin: '0 0 22px', color: C.sub, maxWidth: 780, fontSize: 14, lineHeight: 1.75 }}>
            IIE doesn't wait for a farmer to file a claim. Four AI agents monitor satellite, weather, thermal, and soil data 24 × 7. When a quorum of ≥ 75% confidence is reached, the smart contract executes and IMPS payout fires — automatically, in under 3 seconds.
          </p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {[
              { label: '4-agent quorum',    sub: 'NASA · IMD · ISRO · ICAR',  color: C.purple },
              { label: '≥ 75% confidence',  sub: 'Weighted consensus trigger', color: C.orange },
              { label: '< 3s payout',       sub: 'IMPS auto-disbursed',        color: C.green },
              { label: '72h early warning', sub: 'Proactive farmer advisory',  color: C.teal },
              { label: 'Zero-touch claims', sub: 'No paperwork ever',          color: C.blue },
            ].map(s => (
              <div key={s.label} style={{ borderRadius: 14, padding: '9px 16px', background: `${s.color}10`, border: `1px solid ${s.color}33` }}>
                <div style={{ fontWeight: 900, fontSize: 14, color: s.color }}>{s.label}</div>
                <div style={{ fontSize: 10, color: C.sub, marginTop: 2 }}>{s.sub}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── 4 Agent Cards ── */}
        <div style={{ marginBottom: 8 }}>
          <h2 style={{ margin: '0 0 5px', fontSize: 18, fontWeight: 800 }}>AI Oracle Agents</h2>
          <p style={{ margin: '0 0 14px', fontSize: 12, color: C.sub }}>Each agent polls a different sovereign data source. Click a card to see its role and quorum weight.</p>
        </div>
        <AgentCards />

        {/* ── 72h Scenario Player ── */}
        <div style={{ marginBottom: 8 }}>
          <h2 style={{ margin: '0 0 5px', fontSize: 18, fontWeight: 800 }}>72h Proactive Scenario</h2>
          <p style={{ margin: '0 0 14px', fontSize: 12, color: C.sub }}>Step through a real drought event in Barmer, Rajasthan — see what IIE does proactively vs. what passive insurance does after the fact. The phone shows the YONO notification a farmer would receive.</p>
        </div>
        <ScenarioPlayer />

        {/* ── Comparison Table ── */}
        <div style={{ marginBottom: 8 }}>
          <h2 style={{ margin: '0 0 5px', fontSize: 18, fontWeight: 800 }}>Passive vs. Agentic</h2>
          <p style={{ margin: '0 0 14px', fontSize: 12, color: C.sub }}>Every row below is a dimension the GFF jury evaluates.</p>
        </div>
        <CompareTable />

        {/* ── GFF 2026 Callout ── */}
        <GFFCallout />

        {/* ── Footer links ── */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
          <Link href="/dashboard" style={{ padding: '12px 28px', borderRadius: 14, fontWeight: 800, fontSize: 13, background: `linear-gradient(135deg,${C.purple},${C.blue})`, color: '#fff', textDecoration: 'none' }}>Operations Dashboard</Link>
          <Link href="/demo" style={{ padding: '12px 28px', borderRadius: 14, fontWeight: 800, fontSize: 13, background: `linear-gradient(135deg,${C.teal},${C.green})`, color: '#030712', textDecoration: 'none' }}>Live Demo</Link>
          <Link href="/india-stack" style={{ padding: '12px 24px', borderRadius: 14, fontWeight: 800, fontSize: 13, border: `1px solid ${C.border}`, background: 'transparent', color: C.text, textDecoration: 'none' }}>Compliance Center</Link>
        </div>
      </div>
    </div>
  );
}
