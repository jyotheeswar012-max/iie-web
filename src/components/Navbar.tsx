'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

const NAV = [
  { href:'/',        label:'Mission Control' },
  { href:'/risk',    label:'Risk Map' },
  { href:'/enroll',  label:'Enroll' },
  { href:'/payouts', label:'Live Payouts' },
  { href:'/impact',  label:'Impact' },
]

export default function Navbar() {
  const path = usePathname()
  const [open, setOpen] = useState(false)
  return (
    <nav className="sticky top-0 z-50 border-b border-[#21262d] bg-[#0d1117]/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 flex h-14 items-center justify-between">
        <Link href="/" className="font-black text-[#64ffda] tracking-tight flex items-center gap-2">
          <span className="text-lg">🛡️</span>
          <span className="text-sm">IIE</span>
          <span className="hidden sm:block text-xs text-[#7d8590] font-normal">Invisible Insurance Engine</span>
        </Link>
        <div className="hidden md:flex items-center gap-1">
          {NAV.map(({ href, label }) => (
            <Link key={href} href={href}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                path === href
                  ? 'bg-[#64ffda]/10 text-[#64ffda] border border-[#64ffda]/30'
                  : 'text-[#7d8590] hover:text-[#e6edf3] hover:bg-white/5'
              }`}>{label}</Link>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden sm:flex items-center gap-1.5 text-xs text-[#3fb950]">
            <span className="pulse-dot" /> LIVE
          </span>
          <button className="md:hidden text-[#7d8590] text-xl" onClick={() => setOpen(!open)}>
            {open ? '✕' : '☰'}
          </button>
        </div>
      </div>
      {open && (
        <div className="md:hidden border-t border-[#21262d] bg-[#0d1117] px-4 pb-4">
          {NAV.map(({ href, label }) => (
            <Link key={href} href={href} onClick={() => setOpen(false)}
              className={`flex px-3 py-2.5 rounded-lg text-sm font-semibold mt-1 ${
                path === href ? 'bg-[#64ffda]/10 text-[#64ffda]' : 'text-[#7d8590]'
              }`}>{label}</Link>
          ))}
        </div>
      )}
    </nav>
  )
}
