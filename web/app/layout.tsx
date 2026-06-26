import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from 'sonner';

export const metadata: Metadata = {
  title: 'Invisible Insurance Engine | SBI GFF 2026',
  description: 'Agentic Parametric Insurance Payouts at Scale. Zero paperwork. Instant protection via SBI YONO.',
  keywords: ['insurance', 'parametric', 'SBI', 'YONO', 'farmers', 'agentic AI', 'GFF 2026'],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#0a0e27] text-[#e6edf3] antialiased">
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
