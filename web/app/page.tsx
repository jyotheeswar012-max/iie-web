'use client';
import { HeroSection } from '@/components/home/HeroSection';
import { SatelliteTicker } from '@/components/home/SatelliteTicker';
import { MetricsRow } from '@/components/home/MetricsRow';
import { FarmerStories } from '@/components/home/FarmerStories';
import { AlertFeed } from '@/components/home/AlertFeed';
import { AgentPipeline } from '@/components/home/AgentPipeline';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#0a0e27]">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <HeroSection />
        <SatelliteTicker />
        <MetricsRow />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <FarmerStories />
          <AlertFeed />
        </div>
        <AgentPipeline />
      </div>
      <Footer />
    </main>
  );
}
