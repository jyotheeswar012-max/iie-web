import SatelliteTicker from '@/components/SatelliteTicker'
import MetricsRow from '@/components/MetricsRow'
import AgentPipeline from '@/components/AgentPipeline'
import HeroSection from '@/components/HeroSection'
import FarmerStories from '@/components/FarmerStories'
import AlertFeed from '@/components/AlertFeed'

export default function HomePage() {
  return (
    <div>
      <SatelliteTicker />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <HeroSection />
        <MetricsRow />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <FarmerStories />
          <AlertFeed />
        </div>
        <div className="mt-6">
          <AgentPipeline />
        </div>
      </div>
    </div>
  )
}
