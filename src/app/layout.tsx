import type { Metadata } from 'next'
import './globals.css'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: 'Invisible Insurance Engine | SBI GFF 2026',
  description: 'Insurance that pays before you ask.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#0a0e27]">
        <Navbar />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  )
}
