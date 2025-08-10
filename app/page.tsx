import Navbar from "@/components/Navbar"
import Hero from "@/components/Hero"
import FeatureGrid from "@/components/FeatureGrid"
import TrustStrip from "@/components/TrustStrip"
import Industries from "@/components/Industries"
import Footer from "@/components/Footer"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#F7F8FB]">
      <Navbar />
      <Hero />
      <FeatureGrid />
      <TrustStrip />
      <Industries />
      <Footer />
    </div>
  )
}
