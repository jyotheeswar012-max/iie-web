import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: 'Invisible Insurance Engine | SBI GFF 2026',
  description: 'Agentic parametric insurance payouts at scale. Zero paperwork. Instant protection via SBI YONO.',
  keywords: ['SBI', 'insurance', 'parametric', 'agentic AI', 'farmers', 'YONO', 'GFF 2026'],
  openGraph: {
    title: 'Invisible Insurance Engine',
    description: 'Insurance that pays before you ask.',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="bg-[#0a0e27] text-white antialiased">
        <Toaster position="top-right" toastOptions={{
          style: { background: '#161b22', color: '#e6edf3', border: '1px solid #21262d' }
        }} />
        {children}
      </body>
    </html>
  )
}
