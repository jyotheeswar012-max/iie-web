import type { Metadata, Viewport } from 'next';
import './globals.css';
import { TopNav } from '@/components/TopNav';

export const metadata: Metadata = {
  title: 'YONO-Oracle IIE | SBI Intelligent Insurance Engine',
  description:
    'India’s first fully autonomous parametric crop insurance engine. Oracle-verified, AI-quorum-governed, blockchain-audited, IMPS-settled in <3s.',
  keywords: [
    'YONO', 'SBI', 'crop insurance', 'parametric', 'blockchain', 'oracle',
    'IMPS', 'GFF2026', 'India Stack', 'gradient boosting', 'fraud detection',
  ],
  authors: [{ name: 'IIE Team' }],
  openGraph: {
    title: 'YONO-Oracle IIE — Parametric Crop Insurance',
    description:
      'Zero-form, instant payout crop insurance. AI quorum (GB v3.0) + 6-state FSM + blockchain + IMPS. Built for SBI Global Fintech Fest 2026.',
    type: 'website',
    siteName: 'YONO-Oracle IIE',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'YONO-Oracle IIE | Parametric Crop Insurance',
    description: 'Oracle · AI · Blockchain · IMPS — crop insurance claims in <3s',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#030712',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body style={{ margin:0, padding:0, background:'#030712', color:'#e6edf3', minHeight:'100vh' }}>
        <TopNav />
        <main id="main-content">
          {children}
        </main>
      </body>
    </html>
  );
}
