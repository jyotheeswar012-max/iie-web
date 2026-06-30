import type { Metadata } from 'next';
import './globals.css';
import SBIHeader from '@/components/SBIHeader';

export const metadata: Metadata = {
  title: 'YONO-Oracle IIE · SBI GFF 2026',
  description: 'India\'s first fully autonomous parametric crop insurance engine — oracle-verified, AI-quorum-governed, blockchain-audited, IMPS-settled.',
  keywords: ['SBI','YONO','crop insurance','parametric','blockchain','India Stack','GFF 2026'],
  openGraph: {
    title: 'YONO-Oracle IIE — SBI Global Fintech Fest 2026',
    description: 'Claim settlement: 6 months → <3 seconds. Zero forms. 100% autonomous.',
    siteName: 'YONO-Oracle IIE',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin:0, padding:0, background:'#f8fafc' }}>
        <SBIHeader />
        {children}
      </body>
    </html>
  );
}
