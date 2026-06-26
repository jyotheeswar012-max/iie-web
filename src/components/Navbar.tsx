'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

const NAV = [
  { href:'/',             label:'Home',         icon:'🟢' },
  { href:'/demo',         label:'Live Demo',    icon:'⚡', highlight: true },
  { href:'/risk',         label:'Risk Map',     icon:'🛰️' },
  { href:'/enroll',       label:'Enroll',       icon:'📱' },
  { href:'/payouts',      label:'Payouts',      icon:'💳' },
  { href:'/blockchain',   label:'Blockchain',   icon:'⛓️' },
  { href:'/india-stack',  label:'India Stack',  icon:'🇮🇳' },
  { href:'/architecture', label:'Architecture', icon:'🏗️' },
  { href:'/impact',       label:'GFF Impact',   icon:'🏆' },
]

export default function Navbar() {
  const path = usePathname()
  const [open, setOpen] = useState(false)
  return (
    <nav className="sticky top-0 z-50 border-b border-[#21262d] bg-[#030712]/90 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 flex h-14 items-center justify-between gap-2">
        <Link href="/" className="font-black text-[#64ffda] flex items-center gap-1.5 flex-shrink-0 text-sm">
          🛡️ <span className="hidden sm:block">YONO-Oracle IIE</span>
        </Link>
        <div className="hidden lg:flex items-center gap-0.5">
          {NAV.map(({ href, label, icon, highlight }) => (
            <Link key={href} href={href}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-all whitespace-nowrap ${
                path === href
                  ? 'bg-[#64ffda]/10 text-[#64ffda] border border-[#64ffda]/20'
                  : highlight
                  ? 'bg-[#3fb950]/10 text-[#3fb950] border border-[#3fb950]/20 hover:bg-[#3fb950]/20'
                  : 'text-[#7d8590] hover:text-[#e6edf3] hover:bg-white/5'
              }`}>
              {icon} {label}
            </Link>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <span className="hidden sm:flex items-center gap-1.5 text-[11px] text-[#3fb950] flex-shrink-0">
            <span className="pulse-dot" /> LIVE
          </span>
          <button className="lg:hidden text-[#7d8590]" onClick={() => setOpen(!open)}>{open ? '✕' : '☰'}</button>
        </div>
      </div>
      {open && (
        <div className="lg:hidden border-t border-[#21262d] bg-[#030712] px-4 pb-4 grid grid-cols-3 gap-1">
          {NAV.map(({ href, label, icon }) => (
            <Link key={href} href={href} onClick={() => setOpen(false)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold mt-1 ${
                path === href ? 'bg-[#64ffda]/10 text-[#64ffda]' : 'text-[#7d8590]'
              }`}>{icon} {label}</Link>
          ))}
        </div>
      )}
    </nav>
  )
}
