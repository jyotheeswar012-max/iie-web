'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Shield, Activity, Leaf, Zap, Trophy, Menu, X } from 'lucide-react'
import { useState } from 'react'

const NAV = [
  { href: '/',         label: 'Mission Control', icon: Activity },
  { href: '/risk',     label: 'Risk Map',         icon: Shield },
  { href: '/enroll',   label: 'Enroll',           icon: Leaf },
  { href: '/payouts',  label: 'Live Payouts',     icon: Zap },
  { href: '/impact',   label: 'Impact',           icon: Trophy },
]

export default function Navbar() {
  const path = usePathname()
  const [open, setOpen] = useState(false)
  return (
    <nav className="sticky top-0 z-50 border-b border-brand-border bg-brand-dark/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex h-14 items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-black text-brand-teal tracking-tight">
          <Shield size={20} />
          <span className="text-sm">IIE</span>
          <span className="hidden sm:block text-xs text-brand-muted font-normal ml-1">Invisible Insurance Engine</span>
        </Link>
        <div className="hidden md:flex items-center gap-1">
          {NAV.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                path === href
                  ? 'bg-brand-teal/10 text-brand-teal border border-brand-teal/30'
                  : 'text-brand-muted hover:text-brand-text hover:bg-white/5'
              }`}>
              <Icon size={13} />{label}
            </Link>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <span className="hidden sm:flex items-center gap-1.5 text-xs text-brand-green">
            <span className="pulse-dot" />
            LIVE
          </span>
          <button className="md:hidden text-brand-muted" onClick={() => setOpen(!open)}>
            {open ? <X size={20}/> : <Menu size={20}/>}
          </button>
        </div>
      </div>
      {open && (
        <div className="md:hidden border-t border-brand-border bg-brand-dark px-4 pb-4">
          {NAV.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href} onClick={() => setOpen(false)}
              className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-semibold mt-1 transition-all ${
                path === href ? 'bg-brand-teal/10 text-brand-teal' : 'text-brand-muted hover:text-brand-text'
              }`}>
              <Icon size={15}/>{label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  )
}
