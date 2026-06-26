'use client';
import { Navbar } from '@/components/layout/Navbar';
import { EnrollHero } from '@/components/enroll/EnrollHero';
import { NudgeCards } from '@/components/enroll/NudgeCards';
import { EnrollForm } from '@/components/enroll/EnrollForm';

export default function EnrollPage() {
  return (
    <main className="min-h-screen bg-[#0a0e27]">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <EnrollHero />
        <NudgeCards />
        <EnrollForm />
      </div>
    </main>
  );
}
