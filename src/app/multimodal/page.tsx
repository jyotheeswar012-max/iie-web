'use client';
import { useState, useRef, useEffect } from 'react';

const C = {
  bg: '#030712', panel: '#0d1117', border: 'rgba(255,255,255,0.08)',
  text: '#e6edf3', sub: '#7d8590',
  teal: '#64ffda', green: '#3fb950', yellow: '#e3b341', blue: '#82b1ff', red: '#f85149', purple: '#e040fb',
};

type VoicePhase = 'idle' | 'listening' | 'processing' | 'parsed' | 'enrolled';
type ImagePhase = 'idle' | 'uploading' | 'analysing' | 'done';

// Simulated ASR transcripts per language
const DEMO_TRANSCRIPTS: Record<string, { raw: string; parsed: Record<string, string> }> = {
  hi: {
    raw: '"मेरा नाम रामेश कुमार है। मैं बाड़मेर, राजस्थान से हूँ। मेरे पास 4.5 एकड़ जमीन है और मैं गेहूँ उगाता हूँ।"',
    parsed: { Name: 'Ramesh Kumar', District: 'Barmer', State: 'Rajasthan', Acreage: '4.5 acres', Crop: 'Wheat (Gehu)', Language: 'Hindi' },
  },
  te: {
    raw: '"నా పేరు వెంకట రెడ్డి. నేను వరంగల్, తెలంగాణ నుంచి. నా దగ్గర 3.2 ఎకరాల భూమి ఉంది. వరి పంట వేస్తాను."',
    parsed: { Name: 'Venkat Reddy', District: 'Warangal', State: 'Telangana', Acreage: '3.2 acres', Crop: 'Rice (Vari)', Language: 'Telugu' },
  },
  ta: {
    raw: '"என் பெயர் முருகன். நாங்கள் புரி, ஒடிசாவிலிருந்து வருகிறேன். என்னிடம் 2.8 ஏக்கர் நிலம் உள்ளது. நெல் விவசாயம் செய்கிறேன்."',
    parsed: { Name: 'Murugan', District: 'Puri', State: 'Odisha', Acreage: '2.8 acres', Crop: 'Paddy (Nel)', Language: 'Tamil' },
  },
};

const NDVI_RESULTS = [
  { label: 'Estimated NDVI', value: '0.31', color: C.yellow, note: 'Moderate vegetation — early stress detected' },
  { label: 'Crop Health', value: 'Fair', color: C.yellow, note: 'Moisture deficit likely based on leaf colour' },
  { label: 'Suggested Coverage', value: '₹1,20,000', color: C.green, note: 'Auto-filled in enrollment form' },
  { label: 'Risk Band', value: 'Medium-High', color: C.red, note: 'Recommend Platinum Shield plan' },
];

const LANG_OPTIONS = [
  { code: 'hi', label: 'Hindi हिंदी', flag: '🇮🇳' },
  { code: 'te', label: 'Telugu తెలుగు', flag: '🇮🇳' },
  { code: 'ta', label: 'Tamil தமிழ்', flag: '🇮🇳' },
];

function VoiceEnroll() {
  const [lang, setLang] = useState('hi');
  const [phase, setPhase] = useState<VoicePhase>('idle');
  const [dots, setDots] = useState('');
  const ref = useRef<ReturnType<typeof setInterval> | null>(null);

  const demo = DEMO_TRANSCRIPTS[lang];

  const start = () => {
    setPhase('listening');
    let t = 0;
    ref.current = setInterval(() => {
      t++;
      setDots(d => d.length >= 3 ? '' : d + '•');
      if (t === 30) { setPhase('processing'); }
      if (t === 50) { setPhase('parsed'); clearInterval(ref.current!); }
    }, 100);
  };

  const enroll = () => setPhase('enrolled');
  const reset = () => { setPhase('idle'); setDots(''); if (ref.current) clearInterval(ref.current); };

  useEffect(() => () => { if (ref.current) clearInterval(ref.current); }, []);

  return (
    <div>
      <div style={{ marginBottom: 16, padding: '12px 18px', borderRadius: 12, background: `${C.teal}10`, border: `1px solid ${C.teal}33`, fontSize: 13, color: C.sub, lineHeight: 1.6 }}>
        🎤 <span style={{ color: C.teal, fontWeight: 700 }}>Voice Enrollment</span> — Farmer speaks in regional language. Whisper ASR transcribes → NLP parser extracts structured fields → Aadhaar eKYC auto-launched.
      </div>

      {/* Language selector */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {LANG_OPTIONS.map(l => (
          <button key={l.code} onClick={() => { setLang(l.code); reset(); }}
            style={{ padding: '8px 16px', borderRadius: 10, border: `1px solid ${lang === l.code ? C.teal : C.border}`, background: lang === l.code ? `${C.teal}18` : C.panel, color: lang === l.code ? C.teal : C.sub, fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>
            {l.flag} {l.label}
          </button>
        ))}
      </div>

      {/* Mic area */}
      {phase === 'idle' && (
        <div style={{ textAlign: 'center', padding: '40px 20px' }}>
          <button onClick={start}
            style={{ width: 100, height: 100, borderRadius: '50%', border: `3px solid ${C.teal}`, background: `${C.teal}18`, cursor: 'pointer', fontSize: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            🎤
          </button>
          <div style={{ fontSize: 16, fontWeight: 700, color: C.text }}>Tap to speak</div>
          <div style={{ fontSize: 13, color: C.sub, marginTop: 4 }}>Simulates farmer voice input in {LANG_OPTIONS.find(l => l.code === lang)?.label}</div>
        </div>
      )}

      {phase === 'listening' && (
        <div style={{ textAlign: 'center', padding: '40px 20px' }}>
          <div style={{ width: 100, height: 100, borderRadius: '50%', border: `3px solid ${C.red}`, background: `${C.red}18`, fontSize: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', animation: 'pulse 1s infinite' }}>🎙</div>
          <div style={{ fontSize: 20, fontWeight: 900, color: C.red }}>Listening{dots}</div>
          <div style={{ fontSize: 13, color: C.sub, marginTop: 8, fontStyle: 'italic', maxWidth: 400, margin: '8px auto 0', padding: '0 20px' }}>{demo.raw}</div>
        </div>
      )}

      {phase === 'processing' && (
        <div style={{ textAlign: 'center', padding: '40px 20px' }}>
          <div style={{ fontSize: 28, marginBottom: 12 }}>⚙️</div>
          <div style={{ fontSize: 18, fontWeight: 800, color: C.blue }}>Whisper ASR → NLP Parser{dots}</div>
          <div style={{ fontSize: 13, color: C.sub, marginTop: 8 }}>Extracting: name, district, acreage, crop type...</div>
        </div>
      )}

      {(phase === 'parsed' || phase === 'enrolled') && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
            {Object.entries(demo.parsed).map(([k, v]) => (
              <div key={k} style={{ padding: '12px 16px', borderRadius: 12, background: C.panel, border: `1px solid ${C.border}` }}>
                <div style={{ fontSize: 10, color: C.sub, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>{k}</div>
                <div style={{ fontSize: 15, fontWeight: 800, color: C.text }}>{v}</div>
              </div>
            ))}
          </div>

          {phase === 'parsed' && (
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={enroll} style={{ flex: 1, padding: '12px 0', borderRadius: 12, border: `1px solid ${C.green}`, background: `${C.green}18`, color: C.green, fontWeight: 800, cursor: 'pointer', fontSize: 14 }}>✅ Confirm & Launch eKYC</button>
              <button onClick={reset} style={{ padding: '12px 20px', borderRadius: 12, border: `1px solid ${C.border}`, background: 'transparent', color: C.sub, fontWeight: 700, cursor: 'pointer', fontSize: 14 }}>↺ Retry</button>
            </div>
          )}

          {phase === 'enrolled' && (
            <div style={{ padding: 20, borderRadius: 16, background: `${C.green}10`, border: `1px solid ${C.green}44`, textAlign: 'center' }}>
              <div style={{ fontSize: 36, marginBottom: 8 }}>✅</div>
              <div style={{ fontSize: 18, fontWeight: 900, color: C.green, marginBottom: 4 }}>Aadhaar eKYC Launched!</div>
              <div style={{ fontSize: 13, color: C.sub }}>OTP sent to registered mobile. Enrollment completes in ~8 seconds.</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ImageNDVI() {
  const [phase, setPhase] = useState<ImagePhase>('idle');
  const [dots, setDots] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startAnalysis = () => {
    setPhase('uploading');
    let t = 0;
    timerRef.current = setInterval(() => {
      t++;
      setDots(d => d.length >= 3 ? '' : d + '•');
      if (t === 15) setPhase('analysing');
      if (t === 40) { setPhase('done'); clearInterval(timerRef.current!); }
    }, 100);
  };

  const reset = () => { setPhase('idle'); setDots(''); if (timerRef.current) clearInterval(timerRef.current); };
  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  return (
    <div>
      <div style={{ marginBottom: 16, padding: '12px 18px', borderRadius: 12, background: `${C.green}10`, border: `1px solid ${C.green}33`, fontSize: 13, color: C.sub, lineHeight: 1.6 }}>
        📸 <span style={{ color: C.green, fontWeight: 700 }}>Crop Image NDVI Assist</span> — Upload a photo of your crop field. ResNet18 estimator infers NDVI, health score, and suggested coverage amount.
      </div>

      {phase === 'idle' && (
        <div
          onDragOver={e => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={e => { e.preventDefault(); setDragOver(false); startAnalysis(); }}
          onClick={() => inputRef.current?.click()}
          style={{ border: `2px dashed ${dragOver ? C.green : C.border}`, borderRadius: 20, padding: '48px 24px', textAlign: 'center', cursor: 'pointer', background: dragOver ? `${C.green}08` : 'transparent', transition: 'all 0.2s' }}>
          <input ref={inputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={startAnalysis} />
          <div style={{ fontSize: 48, marginBottom: 12 }}>🌾</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: C.text, marginBottom: 6 }}>Drop crop field photo here</div>
          <div style={{ fontSize: 13, color: C.sub }}>or click to browse · JPG, PNG, HEIC supported</div>
          <div style={{ marginTop: 16 }}>
            <button onClick={e => { e.stopPropagation(); startAnalysis(); }}
              style={{ padding: '10px 24px', borderRadius: 12, border: `1px solid ${C.green}`, background: `${C.green}18`, color: C.green, fontWeight: 700, cursor: 'pointer', fontSize: 13 }}>
              ▶ Simulate with Demo Image
            </button>
          </div>
        </div>
      )}

      {phase === 'uploading' && (
        <div style={{ textAlign: 'center', padding: 40 }}>
          <div style={{ fontSize: 28, marginBottom: 12 }}>⬆️</div>
          <div style={{ fontSize: 16, fontWeight: 800, color: C.blue }}>Uploading image{dots}</div>
          <div style={{ fontSize: 13, color: C.sub, marginTop: 6 }}>Sending to ResNet18 inference endpoint...</div>
        </div>
      )}

      {phase === 'analysing' && (
        <div style={{ textAlign: 'center', padding: 40 }}>
          <div style={{ fontSize: 28, marginBottom: 12 }}>🔬</div>
          <div style={{ fontSize: 16, fontWeight: 800, color: C.purple }}>Analysing vegetation{dots}</div>
          <div style={{ fontSize: 13, color: C.sub, marginTop: 6 }}>Estimating NDVI · Chlorophyll index · Moisture deficit...</div>
        </div>
      )}

      {phase === 'done' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginBottom: 16 }}>
            {NDVI_RESULTS.map(r => (
              <div key={r.label} style={{ padding: '16px', borderRadius: 14, background: C.panel, border: `1px solid ${r.color}33` }}>
                <div style={{ fontSize: 10, color: C.sub, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>{r.label}</div>
                <div style={{ fontSize: 22, fontWeight: 900, color: r.color, marginBottom: 4 }}>{r.value}</div>
                <div style={{ fontSize: 11, color: C.sub }}>{r.note}</div>
              </div>
            ))}
          </div>
          <div style={{ padding: 16, borderRadius: 14, background: `${C.teal}10`, border: `1px solid ${C.teal}33`, marginBottom: 12 }}>
            <div style={{ fontWeight: 800, color: C.teal, fontSize: 13, marginBottom: 6 }}>✨ Auto-filled in enrollment form</div>
            <div style={{ fontSize: 12, color: C.sub }}>Coverage amount (₹1,20,000) and risk band (Medium-High → Platinum Shield) have been pre-populated. Farmer only needs to confirm.</div>
          </div>
          <button onClick={reset} style={{ padding: '10px 20px', borderRadius: 10, border: `1px solid ${C.border}`, background: 'transparent', color: C.sub, fontWeight: 700, cursor: 'pointer', fontSize: 13 }}>↺ Analyse another image</button>
        </div>
      )}
    </div>
  );
}

export default function MultiModalPage() {
  const [tab, setTab] = useState<'voice' | 'image'>('voice');
  return (
    <div style={{ background: C.bg, color: C.text, minHeight: '100vh' }}>
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '24px 16px 48px' }}>
        <div style={{ borderRadius: 20, background: 'linear-gradient(135deg,#0d1117,#0a0f1e,#1a0d3b)', border: `1px solid ${C.border}`, padding: 28, marginBottom: 20 }}>
          <div style={{ fontSize: 11, color: C.purple, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8 }}>Multi-Modal Enrollment · IIE</div>
          <h1 style={{ margin: '0 0 8px', fontSize: 28, fontWeight: 900 }}>Any Farmer. Any Device. Any Language.</h1>
          <p style={{ margin: 0, fontSize: 14, color: C.sub }}>Voice in Hindi, Telugu, or Tamil → AI enrolls. Crop photo → AI estimates NDVI and pre-fills coverage. Zero paperwork, zero literacy barrier.</p>
        </div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
          {[{ id: 'voice', icon: '🎤', label: 'Voice Enrollment', color: C.teal }, { id: 'image', icon: '📸', label: 'Image NDVI Assist', color: C.green }].map(t => (
            <button key={t.id} onClick={() => setTab(t.id as 'voice' | 'image')}
              style={{ padding: '10px 22px', borderRadius: 12, border: `1px solid ${tab === t.id ? t.color : C.border}`, background: tab === t.id ? `${t.color}18` : C.panel, color: tab === t.id ? t.color : C.sub, fontWeight: 700, fontSize: 14, cursor: 'pointer', display: 'flex', gap: 8, alignItems: 'center' }}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>
        <div style={{ borderRadius: 20, border: `1px solid ${C.border}`, background: C.panel, padding: 28 }}>
          {tab === 'voice' ? <VoiceEnroll /> : <ImageNDVI />}
        </div>
      </div>
    </div>
  );
}
