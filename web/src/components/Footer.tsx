export default function Footer() {
  return (
    <footer className="border-t border-brand-border bg-brand-dark mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="text-xs text-brand-muted">
          <span className="font-bold text-brand-teal">Invisible Insurance Engine</span>
          {' '}· SBI GFF 2026 · Built by Jyotheeswar Reddy
        </div>
        <div className="text-xs text-brand-muted">
          🔒 Demo Mode · No real payouts · India-wide parametric coverage
        </div>
      </div>
    </footer>
  )
}
