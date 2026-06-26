'use client'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const NAV = [
  { label: 'Dashboard',   href: '/' },
  { label: 'Risk Map',    href: '/risk' },
  { label: 'Enroll',      href: '/enroll' },
  { label: 'Payouts',     href: '/payouts' },
  { label: 'Impact',      href: '/impact' },
]

export default function Navbar() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  return (
    <nav className="sticky top-0 z-50 border-b border-white/10 bg-[#0a0e27]/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#64ffda] to-[#0d3060] flex items-center justify-center text-sm font-black text-[#0a0e27] group-hover:scale-110 transition-transform">
              IIE
            </div>
            <div className="hidden sm:block">
              <div className="text-sm font-bold text-white leading-tight">Invisible Insurance Engine</div>
              <div className="text-[10px] text-[#64ffda] font-semibold tracking-widest">SBI GFF 2026</div>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {NAV.map(n => (
              <Link key={n.href} href={n.href}
                className={cn(
                  'px-4 py-2 rounded-lg text-sm font-medium transition-all',
                  pathname === n.href
                    ? 'bg-[#64ffda]/10 text-[#64ffda] border border-[#64ffda]/30'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                )}>
                {n.label}
              </Link>
            ))}
          </div>

          {/* Live badge */}
          <div className="hidden md:flex items-center gap-3">
            <div className="flex items-center gap-2 bg-[#3fb950]/10 border border-[#3fb950]/30 rounded-full px-3 py-1.5">
              <span className="w-2 h-2 rounded-full bg-[#3fb950] animate-pulse" />
              <span className="text-[#3fb950] text-xs font-bold">SYSTEM LIVE</span>
            </div>
          </div>

          {/* Mobile toggle */}
          <button onClick={() => setOpen(!open)} className="md:hidden text-white/70 hover:text-white">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {open
                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-white/10 bg-[#0a0e27] px-4 pb-4 pt-2">
          {NAV.map(n => (
            <Link key={n.href} href={n.href} onClick={() => setOpen(false)}
              className={cn(
                'block px-4 py-2.5 rounded-lg text-sm font-medium my-1 transition-all',
                pathname === n.href ? 'bg-[#64ffda]/10 text-[#64ffda]' : 'text-white/60 hover:text-white'
              )}>
              {n.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  )
}
