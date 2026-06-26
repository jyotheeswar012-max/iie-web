'use client';
import { Navbar } from '@/components/layout/Navbar';
import { RiskHero } from '@/components/risk/RiskHero';
import { RiskMap } from '@/components/risk/RiskMap';
import { RiskTable } from '@/components/risk/RiskTable';
import { RiskTrendChart } from '@/components/risk/RiskTrendChart';

export default function RiskPage() {
  return (
    <main className="min-h-screen bg-[#0a0e27]">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <RiskHero />
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-3"><RiskMap /></div>
          <div className="lg:col-span-2"><RiskTable /></div>
        </div>
        <RiskTrendChart />
      </div>
    </main>
  );
}
