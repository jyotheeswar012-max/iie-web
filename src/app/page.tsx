import Navbar from '@/components/Navbar'
import HeroSection from '@/components/HeroSection'
import SatelliteTicker from '@/components/SatelliteTicker'
import MetricsRow from '@/components/MetricsRow'
import FarmerStories from '@/components/FarmerStories'
import AlertFeed from '@/components/AlertFeed'
import AgentPipeline from '@/components/AgentPipeline'
import Footer from '@/components/Footer'

export default function Home() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <HeroSection />
        <SatelliteTicker />
        <MetricsRow />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-10">
          <FarmerStories />
          <AlertFeed />
        </div>
        <div className="mt-10">
          <AgentPipeline />
        </div>
      </div>
      <Footer />
    </main>
  )
}
