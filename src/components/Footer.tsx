export default function Footer() {
  return (
    <footer className="border-t border-[#21262d] bg-[#0d1117] mt-16">
      <div className="max-w-7xl mx-auto px-4 py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="text-xs text-[#7d8590]">
          <span className="font-bold text-[#64ffda]">Invisible Insurance Engine</span>
          {' · SBI GFF 2026 · Built by Jyotheeswar Reddy'}
        </div>
        <div className="text-xs text-[#7d8590]">🔒 Demo Mode · No real payouts</div>
      </div>
    </footer>
  )
}
