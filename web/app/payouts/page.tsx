'use client';
import { Navbar } from '@/components/layout/Navbar';
import { PayoutHero } from '@/components/payouts/PayoutHero';
import { PayoutKPIs } from '@/components/payouts/PayoutKPIs';
import { PayoutFeed } from '@/components/payouts/PayoutFeed';
import { PayoutCharts } from '@/components/payouts/PayoutCharts';
import { SimulateEngine } from '@/components/payouts/SimulateEngine';

export default function PayoutsPage() {
  return (
    <main className="min-h-screen bg-[#0a0e27]">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <PayoutHero />
        <PayoutKPIs />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <PayoutFeed />
          <PayoutCharts />
        </div>
        <SimulateEngine />
      </div>
    </main>
  );
}
