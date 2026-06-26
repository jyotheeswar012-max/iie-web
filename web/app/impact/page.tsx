'use client';
import { Navbar } from '@/components/layout/Navbar';
import { ImpactHero } from '@/components/impact/ImpactHero';
import { ImpactStats } from '@/components/impact/ImpactStats';
import { HackathonPillars } from '@/components/impact/HackathonPillars';
import { BeforeAfterTable } from '@/components/impact/BeforeAfterTable';
import { SubmissionDoc } from '@/components/impact/SubmissionDoc';

export default function ImpactPage() {
  return (
    <main className="min-h-screen bg-[#0a0e27]">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <ImpactHero />
        <ImpactStats />
        <HackathonPillars />
        <BeforeAfterTable />
        <SubmissionDoc />
      </div>
    </main>
  );
}
