import type { Metadata, Viewport } from 'next';
import './globals.css';
import SBIHeader from '@/components/SBIHeader';

export const metadata: Metadata = {
  title: 'YONO-Oracle IIE | SBI Intelligent Insurance Engine',
  description: 'Parametric crop insurance powered by AI oracle quorum, blockchain smart contracts, and IMPS instant payouts. Built for SBI Global Fintech Fest 2026.',
  keywords: ['YONO', 'SBI', 'crop insurance', 'parametric', 'blockchain', 'oracle', 'IMPS', 'GFF2026', 'India Stack'],
  authors: [{ name: 'IIE Team' }],
  openGraph: {
    title: 'YONO-Oracle IIE | Parametric Crop Insurance',
    description: 'Zero-form, instant payout crop insurance. AI quorum + blockchain + IMPS.',
    type: 'website',
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
      <body style={{ margin: 0, padding: 0, background: '#030712', color: '#e6edf3', minHeight: '100vh' }}>
        <SBIHeader />
        <main id="main-content">
          {children}
        </main>
      </body>
    </html>
  );
}
