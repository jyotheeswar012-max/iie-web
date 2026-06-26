import SatelliteTicker from '@/components/SatelliteTicker'
import MetricsRow from '@/components/MetricsRow'
import AgentPipeline from '@/components/AgentPipeline'
import HeroSection from '@/components/HeroSection'
import FarmerStories from '@/components/FarmerStories'
import AlertFeed from '@/components/AlertFeed'
import LivePayoutBanner from '@/components/LivePayoutBanner'
import WhyItWins from '@/components/WhyItWins'

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <SatelliteTicker />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        <HeroSection />
        <LivePayoutBanner />
        <MetricsRow />
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3"><FarmerStories /></div>
          <div className="lg:col-span-2"><AlertFeed /></div>
        </div>
        <AgentPipeline />
        <WhyItWins />
      </div>
    </div>
  )
}
