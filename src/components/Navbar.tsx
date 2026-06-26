'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

const NAV = [
  { href:'/',              label:'Mission Control', icon:'🟢' },
  { href:'/risk',          label:'Risk Map',        icon:'🛰️' },
  { href:'/enroll',        label:'Enroll',          icon:'📱' },
  { href:'/payouts',       label:'Live Payouts',    icon:'⚡' },
  { href:'/blockchain',    label:'Blockchain',      icon:'⛓️' },
  { href:'/india-stack',   label:'India Stack',     icon:'🇮🇳' },
  { href:'/architecture',  label:'Architecture',    icon:'🏗️' },
  { href:'/impact',        label:'GFF Impact',      icon:'🏆' },
]

export default function Navbar() {
  const path = usePathname()
  const [open, setOpen] = useState(false)
  return (
    <nav className="sticky top-0 z-50 border-b border-[#21262d] bg-[#030712]/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 flex h-14 items-center justify-between gap-4">
        <Link href="/" className="font-black text-[#64ffda] tracking-tight flex items-center gap-2 flex-shrink-0">
          <span className="text-lg">🛡️</span>
          <span className="text-sm hidden sm:block">YONO-Oracle IIE</span>
        </Link>
        <div className="hidden lg:flex items-center gap-0.5 overflow-x-auto">
          {NAV.map(({ href, label, icon }) => (
            <Link key={href} href={href}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                path === href
                  ? 'bg-[#64ffda]/10 text-[#64ffda] border border-[#64ffda]/20'
                  : 'text-[#7d8590] hover:text-[#e6edf3] hover:bg-white/5'
              }`}>
              <span>{icon}</span>{label}
            </Link>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden sm:flex items-center gap-1.5 text-xs text-[#3fb950] flex-shrink-0">
            <span className="pulse-dot" /> LIVE
          </span>
          <button className="lg:hidden text-[#7d8590] text-xl" onClick={() => setOpen(!open)}>
            {open ? '✕' : '☰'}
          </button>
        </div>
      </div>
      {open && (
        <div className="lg:hidden border-t border-[#21262d] bg-[#030712] px-4 pb-4 grid grid-cols-2 gap-1">
          {NAV.map(({ href, label, icon }) => (
            <Link key={href} href={href} onClick={() => setOpen(false)}
              className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-semibold mt-1 ${
                path === href ? 'bg-[#64ffda]/10 text-[#64ffda]' : 'text-[#7d8590]'
              }`}>{icon} {label}</Link>
          ))}
        </div>
      )}
    </nav>
  )
}
