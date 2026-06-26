import type { Metadata } from 'next'
import './globals.css'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { Toaster } from 'react-hot-toast'

export const metadata: Metadata = {
  title: 'Invisible Insurance Engine | SBI GFF 2026',
  description: 'Insurance that pays before you ask. Agentic AI parametric insurance via SBI YONO.',
  keywords: ['insurance','fintech','AI','SBI','YONO','parametric','farmers'],
  openGraph: {
    title: 'Invisible Insurance Engine',
    description: 'Insurance that pays before you ask.',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-brand-navy">
        <Navbar />
        <main className="min-h-screen">{children}</main>
        <Footer />
        <Toaster position="top-right" toastOptions={{
          style: { background:'#161b22', color:'#e6edf3', border:'1px solid #21262d' },
        }} />
      </body>
    </html>
  )
}
