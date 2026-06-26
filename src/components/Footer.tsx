export default function Footer() {
  return (
    <footer className="border-t border-white/10 mt-16 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-md bg-gradient-to-br from-[#64ffda] to-[#0d3060] flex items-center justify-center text-xs font-black text-[#0a0e27]">IIE</div>
          <span className="text-white/50 text-sm">Invisible Insurance Engine &mdash; SBI GFF 2026</span>
        </div>
        <div className="text-white/30 text-xs text-center">
          Built by <span className="text-[#64ffda] font-semibold">Jyotheeswar Reddy</span> &nbsp;&middot;&nbsp;
          Demo mode &mdash; no real payouts &nbsp;&middot;&nbsp;
          Next.js 14 + FastAPI + Vercel
        </div>
        <div className="flex items-center gap-2 bg-[#3fb950]/10 border border-[#3fb950]/30 rounded-full px-3 py-1.5">
          <span className="w-2 h-2 rounded-full bg-[#3fb950] animate-pulse" />
          <span className="text-[#3fb950] text-xs font-bold">ALL AGENTS RUNNING</span>
        </div>
      </div>
    </footer>
  )
}
