'use client';
import { useState, useEffect, useRef } from 'react';

type Tab = 'script' | 'deck' | 'video' | 'qa';

// ── colours ────────────────────────────────────────────────────────────────
const C = {
  bg: '#030712', panel: '#0d1117', border: 'rgba(255,255,255,0.08)',
  text: '#e6edf3', sub: '#7d8590',
  teal: '#64ffda', green: '#3fb950', yellow: '#e3b341', blue: '#82b1ff', red: '#f85149', purple: '#e040fb',
};

// ══════════════════════════════════════════════════════════════════════════════
// 1. DEMO SCRIPT
// ══════════════════════════════════════════════════════════════════════════════
const SCRIPT_SECTIONS = [
  {
    id: 1, title: 'The Hook', time: '0:00–0:20', color: C.teal, cue: '🎤 Face judges — NO slides yet',
    hook: '"150 million farmers. ₹1.5 lakh crore in crop losses every year. And an insurance claim that takes 47 days and 12 forms to settle. We built a system that settles in under 3 seconds — no forms, no agent, no fraud."',
    bullets: [
      'Pause after the number — let 47 days land.',
      'Make eye contact with each judge in turn.',
      'Step forward as you say "under 3 seconds".',
    ],
  },
  {
    id: 2, title: 'The Problem', time: '0:20–0:40', color: C.red, cue: '📊 Switch to Problem slide',
    hook: '"Today, PMFBY enrollment is 30%. Why? Farmers need a physical agent. Documents get lost. Payouts require manual field visits. And 42% of claims are denied because the paperwork was wrong — not because the crop didn\'t fail."',
    bullets: [
      'Point to the 42% stat on-screen.',
      'Slow down on "not because the crop didn\'t fail" — this is the emotional spike.',
      'Pause 1 second before transitioning.',
    ],
  },
  {
    id: 3, title: 'Our Solution', time: '0:40–1:05', color: C.green, cue: '🖥️ Switch to YONO demo live',
    hook: '"IIE is a zero-paperwork parametric insurance engine. A farmer speaks in Hindi — our AI enrolls them in 40 seconds via YONO. When satellite data from NASA, IMD, and ISRO detects drought, a smart contract auto-triggers. IMPS payout hits the farmer\'s account in 2.3 seconds."',
    bullets: [
      'Click through YONO screens as you speak.',
      'Hit the "payout" screen exactly on "2.3 seconds".',
      'Don\'t rush — let the UI do the talking.',
    ],
  },
  {
    id: 4, title: 'India Stack Advantage', time: '1:05–1:35', color: C.blue, cue: '🔗 Switch to India Stack slide',
    hook: '"We are India-first by design. Aadhaar eKYC in 8 seconds. DigiLocker pulls land records automatically. DPDP-compliant consent with on-chain hash. NPCI IMPS settlement. No foreign API dependency — 100% sovereign infrastructure."',
    bullets: [
      'Emphasise "sovereign infrastructure" — this resonates with SBI judges.',
      'Mention IRDAI sandbox application in Q4 2026.',
      'Quick nod to PM-FASAL subsidy integration.',
    ],
  },
  {
    id: 5, title: 'The Ask & Vision', time: '1:35–2:00', color: C.yellow, cue: '🎯 Return to face judges',
    hook: '"We are asking for SBI Fintech Fest recognition and a path to the IRDAI sandbox. Our 6-quarter roadmap takes us to 500 districts, 50 lakh farmers, and ₹10,000 crore in insured value — all on India Stack, all auditable, all autonomous."',
    bullets: [
      'End on a number: 50 lakh farmers.',
      'Smile and hold eye contact for 2 seconds after finishing.',
      '"Thank you — we\'re ready for questions."',
    ],
  },
];

function DemoScript() {
  const [step, setStep] = useState(0);
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (running) {
      timer.current = setInterval(() => setElapsed(e => e + 1), 1000);
    } else {
      if (timer.current) clearInterval(timer.current);
    }
    return () => { if (timer.current) clearInterval(timer.current); };
  }, [running]);

  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  const sec = SCRIPT_SECTIONS[step];
  const pct = Math.min((elapsed / 120) * 100, 100);

  return (
    <div>
      {/* Timer bar */}
      <div style={{ background: C.panel, borderRadius: 16, border: `1px solid ${C.border}`, padding: 20, marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, flexWrap: 'wrap', gap: 10 }}>
          <div>
            <div style={{ fontSize: 11, color: C.sub, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>Presentation Timer · 2:00 total</div>
            <div style={{ fontSize: 36, fontWeight: 900, color: pct > 90 ? C.red : pct > 75 ? C.yellow : C.teal, fontFamily: 'monospace' }}>{fmt(elapsed)}</div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => setRunning(r => !r)} style={{ padding: '10px 20px', borderRadius: 10, border: `1px solid ${running ? C.red : C.green}`, background: running ? `${C.red}18` : `${C.green}18`, color: running ? C.red : C.green, fontWeight: 800, cursor: 'pointer', fontSize: 13 }}>
              {running ? '⏸ Pause' : '▶ Start'}
            </button>
            <button onClick={() => { setRunning(false); setElapsed(0); }} style={{ padding: '10px 20px', borderRadius: 10, border: `1px solid ${C.border}`, background: 'transparent', color: C.sub, fontWeight: 700, cursor: 'pointer', fontSize: 13 }}>↺ Reset</button>
          </div>
        </div>
        <div style={{ height: 6, borderRadius: 3, background: '#1e293b' }}>
          <div style={{ height: 6, borderRadius: 3, background: pct > 90 ? C.red : pct > 75 ? C.yellow : C.teal, width: `${pct}%`, transition: 'width 1s linear' }} />
        </div>
      </div>

      {/* Step nav pills */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
        {SCRIPT_SECTIONS.map((s, i) => (
          <button key={s.id} onClick={() => setStep(i)}
            style={{ padding: '6px 14px', borderRadius: 999, border: `1px solid ${step === i ? s.color : C.border}`, background: step === i ? `${s.color}18` : 'transparent', color: step === i ? s.color : C.sub, fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>
            {s.id}. {s.title}
          </button>
        ))}
      </div>

      {/* Current section card */}
      <div style={{ borderRadius: 20, border: `2px solid ${sec.color}44`, background: `${sec.color}06`, padding: 28 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 11, color: sec.color, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>Section {sec.id} of 5 · {sec.time}</div>
            <div style={{ fontSize: 24, fontWeight: 900 }}>{sec.title}</div>
          </div>
          <div style={{ padding: '8px 14px', borderRadius: 12, background: `${sec.color}18`, border: `1px solid ${sec.color}44`, fontSize: 12, fontWeight: 700, color: sec.color }}>{sec.cue}</div>
        </div>

        <div style={{ borderRadius: 14, background: C.panel, border: `1px solid ${C.border}`, padding: 20, marginBottom: 16, fontStyle: 'italic', fontSize: 15, lineHeight: 1.7, color: C.text }}>
          {sec.hook}
        </div>

        <div style={{ display: 'grid', gap: 8 }}>
          {sec.bullets.map((b, i) => (
            <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: '10px 14px', borderRadius: 12, background: C.panel, border: `1px solid ${C.border}` }}>
              <span style={{ color: sec.color, fontWeight: 900, flexShrink: 0 }}>→</span>
              <span style={{ fontSize: 13, color: C.text, lineHeight: 1.5 }}>{b}</span>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 20, gap: 10 }}>
          <button onClick={() => setStep(s => Math.max(0, s - 1))} disabled={step === 0}
            style={{ padding: '10px 24px', borderRadius: 12, border: `1px solid ${C.border}`, background: 'transparent', color: step === 0 ? C.sub : C.text, fontWeight: 700, cursor: step === 0 ? 'default' : 'pointer', fontSize: 13 }}>← Prev</button>
          <div style={{ fontSize: 12, color: C.sub, alignSelf: 'center' }}>{step + 1} / {SCRIPT_SECTIONS.length}</div>
          <button onClick={() => setStep(s => Math.min(SCRIPT_SECTIONS.length - 1, s + 1))} disabled={step === SCRIPT_SECTIONS.length - 1}
            style={{ padding: '10px 24px', borderRadius: 12, border: `1px solid ${sec.color}`, background: `${sec.color}18`, color: sec.color, fontWeight: 700, cursor: step === SCRIPT_SECTIONS.length - 1 ? 'default' : 'pointer', fontSize: 13 }}>Next →</button>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// 2. PITCH DECK
// ══════════════════════════════════════════════════════════════════════════════
const SLIDES = [
  { id: 1,  title: 'IIE — Intelligent Insurance Engine', sub: 'SBI Fintech Fest 2026', color: C.teal,
    bullets: ['Zero-paperwork parametric crop insurance', 'Powered by India Stack + AI oracles + blockchain', 'Settlement in < 3 seconds via NPCI IMPS'],
    notes: 'Open with the product name large and bold. Let the tagline land. No animations needed — confidence sells this slide.' },
  { id: 2,  title: 'The Crisis', sub: '₹1.5L Cr annual crop loss · 30% PMFBY penetration', color: C.red,
    bullets: ['47 days average claim settlement', '42% claims denied due to paperwork errors', '120M smallholder farmers without digital access'],
    notes: 'Speak slowly here. The 42% denial stat is your emotional anchor. Pause after it.' },
  { id: 3,  title: 'Why Now?', sub: 'India Stack is ready. AI is cheap. Blockchain is enterprise-grade.', color: C.yellow,
    bullets: ['Aadhaar + DigiLocker + UPI now at 1B+ scale', 'Sentinel-2 NDVI data free via NASA / ISRO', 'Hyperledger + Polygon mature for financial use'],
    notes: 'This is the "why us, why now" slide. Emphasise that the infrastructure cost is near-zero.' },
  { id: 4,  title: 'How It Works', sub: '40s enroll → oracle watch → auto-payout', color: C.green,
    bullets: ['Farmer speaks Hindi → AI parses → Aadhaar eKYC in 8s', 'Satellite oracles (NASA + IMD + ISRO + ICAR) watch NDVI daily', 'Smart contract fires on quorum ≥ 75% → IMPS in 2.3s'],
    notes: 'If live demo is running, click through YONO here. Say the step numbers aloud as the UI advances.' },
  { id: 5,  title: 'India Stack Core', sub: '100% sovereign infrastructure', color: C.blue,
    bullets: ['Aadhaar eKYC — 8-second biometric verification', 'DigiLocker — automated land record fetch (Khasra + RoR)', 'NPCI IMPS + UPI — real-time settlement, no intermediary'],
    notes: 'SBI judges care about this. Say "no foreign API dependency" explicitly.' },
  { id: 6,  title: 'Multi-Modal Enrollment', sub: 'Voice · Image · Text — any device', color: C.purple,
    bullets: ['Voice: Hindi/Telugu/Tamil → Whisper ASR → structured JSON', 'Image: Crop photo → ResNet NDVI estimator → pre-fill coverage', 'SMS fallback for 2G phones via USSD bridge'],
    notes: 'This is a differentiator slide. Competitors require forms; we accept speech.' },
  { id: 7,  title: 'Sustainability & Climate', sub: 'Aligned with India NDC 2070 and NAPCC', color: C.green,
    bullets: ['Each policy carries a carbon-weighted risk score', 'Drought/flood data fed back to ICAR climate model', 'FPO group policies incentivise soil health practices'],
    notes: 'Mention Paris Agreement alignment briefly. Judges from ESG backgrounds will appreciate this.' },
  { id: 8,  title: 'Competitor Landscape', sub: 'We win on zero paperwork + agent autonomy', color: C.yellow,
    bullets: ['ICICI Lombard Fasal: requires agent visit for enrollment', 'Bajaj Allianz Smart Crop: 14-day settlement, no voice input', 'IIE: 40s enrollment, <3s payout, fully autonomous, blockchain-audited'],
    notes: 'Don\'t name competitors aggressively. Frame as "existing approaches" vs "our approach".' },
  { id: 9,  title: 'Roadmap to Scale', sub: 'Q3 2026 → Q3 2027', color: C.blue,
    bullets: ['Q4 2026: IRDAI regulatory sandbox application', 'Q1 2027: SBI Core Banking (Finacle CBS) pilot — 5 districts', 'Q3 2027: 500 districts · 50L farmers · ₹10,000 Cr insured'],
    notes: 'Ground the vision in a specific number: 50 lakh farmers. That is 4% of India\'s agricultural workforce.' },
  { id: 10, title: 'The Ask', sub: 'SBI Fintech Fest Recognition + IRDAI Sandbox Path', color: C.teal,
    bullets: ['Recognition at SBI Fintech Fest 2026', 'Letter of support for IRDAI sandbox application', 'Pilot MoU with SBI Agri vertical — 5 Rajasthan districts'],
    notes: 'Be specific. "A letter of support" is a concrete, low-friction ask that judges can say yes to.' },
];

function PitchDeck() {
  const [slide, setSlide] = useState(0);
  const [notesOpen, setNotesOpen] = useState(false);
  const s = SLIDES[slide];

  return (
    <div>
      {/* 16:9 slide card */}
      <div style={{ borderRadius: 20, border: `2px solid ${s.color}44`, background: `linear-gradient(135deg, #0d1117 0%, #0a0f1e 60%, ${s.color}0a 100%)`, aspectRatio: '16/9', padding: '5% 6%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', marginBottom: 12, position: 'relative', overflow: 'hidden' }}>
        {/* Corner watermark */}
        <div style={{ position: 'absolute', top: 16, right: 20, fontSize: 11, fontWeight: 800, color: `${s.color}88`, letterSpacing: 2, textTransform: 'uppercase' }}>SBI Fintech Fest 2026 · IIE</div>
        <div style={{ position: 'absolute', bottom: 16, right: 20, fontSize: 11, color: C.sub }}>{s.id} / {SLIDES.length}</div>

        <div>
          <div style={{ fontSize: 11, color: s.color, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 10 }}>Slide {s.id}</div>
          <div style={{ fontSize: 'clamp(18px, 3.5vw, 36px)', fontWeight: 900, lineHeight: 1.15, marginBottom: 8 }}>{s.title}</div>
          <div style={{ fontSize: 'clamp(11px, 1.5vw, 15px)', color: s.color, fontWeight: 600, marginBottom: 24 }}>{s.sub}</div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {s.bullets.map((b, i) => (
            <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <span style={{ color: s.color, fontWeight: 900, fontSize: 'clamp(10px,1.5vw,14px)', marginTop: 2, flexShrink: 0 }}>▸</span>
              <span style={{ fontSize: 'clamp(11px,1.5vw,15px)', lineHeight: 1.5, color: C.text }}>{b}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Speaker notes toggle */}
      <div style={{ marginBottom: 12 }}>
        <button onClick={() => setNotesOpen(o => !o)} style={{ padding: '8px 16px', borderRadius: 10, border: `1px solid ${C.border}`, background: notesOpen ? `${C.yellow}18` : 'transparent', color: notesOpen ? C.yellow : C.sub, fontWeight: 700, cursor: 'pointer', fontSize: 12 }}>🗒 Speaker Notes {notesOpen ? '▲' : '▼'}</button>
        {notesOpen && (
          <div style={{ marginTop: 8, padding: 16, borderRadius: 14, background: C.panel, border: `1px solid ${C.yellow}33`, fontSize: 13, color: C.text, lineHeight: 1.7, fontStyle: 'italic' }}>{s.notes}</div>
        )}
      </div>

      {/* Slide strip */}
      <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 8 }}>
        {SLIDES.map((sl, i) => (
          <button key={sl.id} onClick={() => setSlide(i)}
            style={{ flexShrink: 0, width: 80, height: 50, borderRadius: 8, border: `2px solid ${slide === i ? sl.color : C.border}`, background: slide === i ? `${sl.color}18` : C.panel, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
            <div style={{ fontSize: 9, fontWeight: 800, color: slide === i ? sl.color : C.sub }}>{sl.id}</div>
            <div style={{ fontSize: 7, color: C.sub, textAlign: 'center', lineHeight: 1.2, padding: '0 4px', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{sl.title}</div>
          </button>
        ))}
      </div>

      {/* Prev / Next */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12 }}>
        <button onClick={() => setSlide(s => Math.max(0, s - 1))} disabled={slide === 0}
          style={{ padding: '10px 24px', borderRadius: 12, border: `1px solid ${C.border}`, background: 'transparent', color: slide === 0 ? C.sub : C.text, fontWeight: 700, cursor: slide === 0 ? 'default' : 'pointer' }}>← Prev</button>
        <button onClick={() => setSlide(s => Math.min(SLIDES.length - 1, s + 1))} disabled={slide === SLIDES.length - 1}
          style={{ padding: '10px 24px', borderRadius: 12, border: `1px solid ${s.color}`, background: `${s.color}18`, color: s.color, fontWeight: 700, cursor: slide === SLIDES.length - 1 ? 'default' : 'pointer' }}>Next →</button>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// 3. VIDEO GUIDE
// ══════════════════════════════════════════════════════════════════════════════
const SHOTS = [
  { id: 1,  time: '0:00–0:08', title: 'Talking head intro',       screen: 'Camera only',           action: 'Look directly into camera. Say the hook line. Confident, slow.', tip: 'Natural light from window on your left.' },
  { id: 2,  time: '0:08–0:20', title: 'Problem stats overlay',    screen: '/dashboard — KPI strip', action: 'Narrate: "150 million farmers, 47 days, 42% denied." Click each KPI.', tip: 'Use Loom cursor highlight on each number.' },
  { id: 3,  time: '0:20–0:35', title: 'YONO splash → login',      screen: '/yono — screens 1-2',    action: 'Narrate enrollment flow. Click through splash and MPIN screens.', tip: 'Keep pace slow — judges may not know YONO.' },
  { id: 4,  time: '0:35–0:50', title: 'Voice enrollment demo',    screen: '/multimodal — Voice tab', action: 'Click the mic. Speak "Mera naam Ramesh hai" — watch AI parse live.', tip: 'Speak clearly and slightly slowly for demo effect.' },
  { id: 5,  time: '0:50–1:05', title: 'Aadhaar eKYC + DigiLocker', screen: '/yono — screens 5-6',   action: 'Show consent checkboxes → OTP → verified badge → DigiLocker fetch.', tip: 'Pause on the "Aadhaar Verified" green badge.' },
  { id: 6,  time: '1:05–1:20', title: 'Oracle + smart contract',  screen: '/yono — screens 7-8',    action: 'Show processing animation. Say "NASA, IMD, ISRO data — quorum 94%."', tip: 'Let the step animation finish naturally.' },
  { id: 7,  time: '1:20–1:30', title: 'IMPS payout receipt',      screen: '/yono — screen 10',      action: 'Show ₹48,200 payout. Say "2.3 seconds. No agent. No form."', tip: 'Zoom into the RRN and UPI reference numbers.' },
  { id: 8,  time: '1:30–1:42', title: 'India Stack architecture', screen: '/india-stack',            action: 'Walk through Aadhaar, DigiLocker, NPCI layer cards briefly.', tip: 'Say "100% sovereign infrastructure" — SBI loves this.' },
  { id: 9,  time: '1:42–1:52', title: 'Roadmap timeline',         screen: '/dashboard — Roadmap',   action: 'Scroll to roadmap. Point: Q4 IRDAI sandbox → Q1 SBI pilot.', tip: 'Keep at 10 seconds — don\'t over-explain.' },
  { id: 10, time: '1:52–2:00', title: 'Ask + sign-off',           screen: 'Camera only',            action: 'Face camera. "50 lakh farmers. Under 3 seconds. Built on India. Thank you."', tip: 'Smile and hold 2 seconds after final word.' },
];

function VideoGuide() {
  const [playing, setPlaying] = useState(false);
  const [tick, setTick] = useState(0);
  const [activeShot, setActiveShot] = useState(0);
  const ref = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (playing) {
      ref.current = setInterval(() => {
        setTick(t => {
          const next = t + 1;
          const pct = (next / 120) * 100;
          const shotIdx = Math.min(Math.floor((pct / 100) * SHOTS.length), SHOTS.length - 1);
          setActiveShot(shotIdx);
          if (next >= 120) { setPlaying(false); return 120; }
          return next;
        });
      }, 100); // 10x speed for demo
    } else {
      if (ref.current) clearInterval(ref.current);
    }
    return () => { if (ref.current) clearInterval(ref.current); };
  }, [playing]);

  const pct = (tick / 120) * 100;
  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  return (
    <div>
      {/* Simulate player */}
      <div style={{ background: C.panel, borderRadius: 16, border: `1px solid ${C.border}`, padding: 20, marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, flexWrap: 'wrap', gap: 10 }}>
          <div>
            <div style={{ fontSize: 11, color: C.sub, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>Loom Recording · 2:00 guide</div>
            <div style={{ fontSize: 28, fontWeight: 900, color: C.teal, fontFamily: 'monospace' }}>{fmt(tick)} <span style={{ fontSize: 13, color: C.sub }}>/ 2:00</span></div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => setPlaying(p => !p)}
              style={{ padding: '10px 20px', borderRadius: 10, border: `1px solid ${playing ? C.red : C.green}`, background: playing ? `${C.red}18` : `${C.green}18`, color: playing ? C.red : C.green, fontWeight: 800, cursor: 'pointer', fontSize: 13 }}>
              {playing ? '⏸ Pause' : '▶ Simulate'}
            </button>
            <button onClick={() => { setPlaying(false); setTick(0); setActiveShot(0); }}
              style={{ padding: '10px 20px', borderRadius: 10, border: `1px solid ${C.border}`, background: 'transparent', color: C.sub, fontWeight: 700, cursor: 'pointer', fontSize: 13 }}>↺ Reset</button>
          </div>
        </div>
        {/* Timeline */}
        <div style={{ position: 'relative', height: 8, borderRadius: 4, background: '#1e293b', marginBottom: 6, cursor: 'pointer' }}>
          {SHOTS.map((sh, i) => (
            <div key={sh.id} style={{ position: 'absolute', left: `${(i / SHOTS.length) * 100}%`, top: 0, width: `${(1 / SHOTS.length) * 100}%`, height: '100%', borderRight: '1px solid #030712' }} />
          ))}
          <div style={{ height: 8, borderRadius: 4, background: C.teal, width: `${pct}%`, transition: 'width 0.1s linear', position: 'absolute', top: 0, left: 0 }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: C.sub }}>
          <span>0:00</span><span>1:00</span><span>2:00</span>
        </div>
      </div>

      {/* Shot list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {SHOTS.map((sh, i) => (
          <div key={sh.id} onClick={() => setActiveShot(i)}
            style={{ borderRadius: 14, border: `1px solid ${activeShot === i ? C.teal : C.border}`, background: activeShot === i ? `${C.teal}08` : C.panel, padding: '14px 18px', cursor: 'pointer', display: 'grid', gridTemplateColumns: '60px 1fr', gap: 14, alignItems: 'start', transition: 'all 0.2s' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 18, fontWeight: 900, color: activeShot === i ? C.teal : C.sub }}>#{sh.id}</div>
              <div style={{ fontSize: 10, color: C.sub, fontFamily: 'monospace' }}>{sh.time}</div>
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 4, color: activeShot === i ? C.teal : C.text }}>{sh.title}</div>
              <div style={{ fontSize: 11, color: C.blue, marginBottom: 6 }}>📺 {sh.screen}</div>
              <div style={{ fontSize: 12, color: C.sub, lineHeight: 1.5, marginBottom: 4 }}>{sh.action}</div>
              {activeShot === i && (
                <div style={{ fontSize: 11, padding: '6px 10px', borderRadius: 8, background: `${C.yellow}18`, border: `1px solid ${C.yellow}44`, color: C.yellow }}>💡 {sh.tip}</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// 4. Q&A PREP
// ══════════════════════════════════════════════════════════════════════════════
const QA = [
  {
    q: 'How is this different from PMFBY or existing insurtech players like Fasal?',
    tags: ['Differentiation', 'Competition'],
    color: C.teal,
    a: 'PMFBY requires a physical agent, takes 47 days, and denies 42% of claims on paperwork grounds — not crop failure grounds. Fasal and similar platforms still require manual enrollment and have 14+ day settlement windows. IIE is the only system where a farmer can enroll by voice in 40 seconds, with settlement in under 3 seconds triggered automatically by satellite data — no agent, no form, no human in the loop at any stage.',
  },
  {
    q: 'What happens if the oracle data is wrong or manipulated?',
    tags: ['Technical Risk', 'Oracle'],
    color: C.red,
    a: 'We use a 4-oracle weighted quorum (NASA, IMD, ISRO, ICAR). No single oracle can trigger a payout — the threshold is 75% weighted agreement. Each oracle\'s data source URL is hardcoded into the smart contract; any deviation is rejected at the contract level. All oracle submissions are logged on Hyperledger Fabric with SHA-256 hash chains, making manipulation detectable in real time. Additionally, oracle wallets are permissioned — only allowlisted addresses can submit data.',
  },
  {
    q: 'How do you handle Aadhaar data under DPDP Act 2023?',
    tags: ['Regulatory', 'DPDP', 'Privacy'],
    color: C.blue,
    a: 'We never store raw Aadhaar numbers. The UID is converted to a SHA-256 one-way hash at the point of entry and never transmitted or stored in plaintext. Consent is collected per-purpose (enrollment, KYC, payout) with individual checkboxes — each consent event is logged on-chain with timestamp, purpose, and DPO email. Retention is capped at 7 years per IRDAI guidelines. We have designed for data minimisation: only the hash, land parcel ID, and UPI VPA are stored long-term.',
  },
  {
    q: 'Is this actually profitable? What is the unit economics?',
    tags: ['Business Model', 'Economics'],
    color: C.yellow,
    a: 'We operate as a technology platform, not the insurer. Revenue model: (1) SaaS fee to IRDAI-licensed insurer per policy processed (est. ₹150/policy), (2) 0.3% of payout volume as settlement fee. At 10 lakh policies/year and avg payout of ₹50,000: SaaS = ₹15 Cr/yr, settlement = ₹15 Cr/yr. Operating cost is primarily cloud compute for oracle ingestion (est. ₹2–3 Cr/yr). Breakeven at ~3 lakh policies. PM-FASAL subsidy routing adds a government channel with near-zero CAC.',
  },
  {
    q: 'Can a semi-literate farmer in rural Rajasthan actually use this?',
    tags: ['Accessibility', 'UX'],
    color: C.green,
    a: 'Yes — that is the design constraint, not an afterthought. Enrollment works entirely by voice in Hindi, Telugu, or Tamil via Whisper ASR, requiring zero literacy. The YONO interface uses icons and audio prompts in regional languages. For farmers without smartphones, we have a USSD SMS bridge over 2G. The only biometric required is the Aadhaar OTP on their registered mobile — which is already familiar to most rural users from PMJDY bank account setup.',
  },
  {
    q: 'What is the regulatory pathway? You are not an insurer.',
    tags: ['Regulatory', 'IRDAI'],
    color: C.purple,
    a: 'We operate as an InsurTech platform under the IRDAI\'s Insurance Regulatory Sandbox framework (circular IRDAI/REG/CIR/MISC/016/01/2019). We partner with a licensed insurer who underwrites the risk — we provide the technology layer for enrollment, oracle-driven trigger, and automated settlement. Our Q4 2026 milestone is a formal sandbox application. The blockchain audit trail, DPDP compliance, and Aadhaar eKYC architecture are specifically designed to meet IRDAI\'s data governance requirements for sandbox approval.',
  },
];

function QAPrep() {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <div>
      <div style={{ marginBottom: 16, padding: '12px 18px', borderRadius: 12, background: `${C.teal}10`, border: `1px solid ${C.teal}33`, fontSize: 13, color: C.sub }}>
        🧑‍⚖️ <span style={{ color: C.teal, fontWeight: 700 }}>6 hardest judge questions</span> — click to expand the full model answer. Practice out loud.
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {QA.map((item, i) => (
          <div key={i} style={{ borderRadius: 16, border: `1px solid ${open === i ? item.color : C.border}`, background: open === i ? `${item.color}08` : C.panel, overflow: 'hidden', transition: 'all 0.2s' }}>
            <button onClick={() => setOpen(open === i ? null : i)}
              style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', padding: '16px 20px', display: 'flex', alignItems: 'flex-start', gap: 12, textAlign: 'left' }}>
              <span style={{ fontSize: 20, flexShrink: 0, marginTop: 2 }}>❓</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 800, fontSize: 14, color: open === i ? item.color : C.text, lineHeight: 1.4, marginBottom: 6 }}>{item.q}</div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {item.tags.map(t => (
                    <span key={t} style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 999, background: `${item.color}18`, color: item.color, border: `1px solid ${item.color}33` }}>{t}</span>
                  ))}
                </div>
              </div>
              <span style={{ color: C.sub, fontSize: 14, flexShrink: 0, marginTop: 4 }}>{open === i ? '▲' : '▼'}</span>
            </button>
            {open === i && (
              <div style={{ padding: '0 20px 20px', borderTop: `1px solid ${item.color}22` }}>
                <div style={{ marginTop: 14, fontSize: 14, color: C.text, lineHeight: 1.75 }}>{item.a}</div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// PAGE SHELL
// ══════════════════════════════════════════════════════════════════════════════
const TABS: { id: Tab; label: string; icon: string; color: string }[] = [
  { id: 'script', label: 'Demo Script',  icon: '🎤', color: C.teal   },
  { id: 'deck',   label: 'Pitch Deck',   icon: '📊', color: C.blue   },
  { id: 'video',  label: 'Video Guide',  icon: '🎬', color: C.purple },
  { id: 'qa',     label: 'Q&A Prep',     icon: '🧑‍⚖️', color: C.yellow },
];

export default function PitchPage() {
  const [tab, setTab] = useState<Tab>('script');
  const active = TABS.find(t => t.id === tab)!;

  return (
    <div style={{ background: C.bg, color: C.text, minHeight: '100vh' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 16px 48px' }}>
        {/* Header */}
        <div style={{ borderRadius: 20, background: 'linear-gradient(135deg,#0d1117,#0a0f1e,#0d1b4b)', border: `1px solid ${C.border}`, padding: 28, marginBottom: 20 }}>
          <div style={{ fontSize: 11, color: C.teal, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8 }}>SBI Fintech Fest 2026 · IIE</div>
          <h1 style={{ margin: '0 0 8px', fontSize: 32, fontWeight: 900 }}>Pitch Toolkit</h1>
          <p style={{ margin: 0, fontSize: 14, color: C.sub, maxWidth: 620 }}>Everything you need to deliver a winning 2-minute demo — script, slides, Loom guide, and judge Q&A.</p>
        </div>

        {/* Tab bar */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 20, flexWrap: 'wrap' }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              style={{ padding: '10px 20px', borderRadius: 12, border: `1px solid ${tab === t.id ? t.color : C.border}`, background: tab === t.id ? `${t.color}18` : C.panel, color: tab === t.id ? t.color : C.sub, fontWeight: 700, fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, transition: 'all 0.2s' }}>
              <span>{t.icon}</span>{t.label}
            </button>
          ))}
        </div>

        {/* Active tab label */}
        <div style={{ marginBottom: 16, fontSize: 12, color: active.color, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 2 }}>{active.icon} {active.label}</div>

        {/* Tab content */}
        {tab === 'script' && <DemoScript />}
        {tab === 'deck'   && <PitchDeck />}
        {tab === 'video'  && <VideoGuide />}
        {tab === 'qa'     && <QAPrep />}
      </div>
    </div>
  );
}
