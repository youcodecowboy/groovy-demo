import { Metadata } from "next"
import Navbar from "@/components/Navbar"
import Hero from "@/components/Hero"
import FactoryDigitizationCompact from "@/components/marketing/FactoryDigitizationCompact"
import Section from "@/components/marketing/Section"
import ScanToSignalDemo from "@/components/marketing/ScanToSignalDemo"
import Pillars from "@/components/marketing/Pillars"
import UseCaseCarousel from "@/components/marketing/UseCaseCarousel"
import PricingStrip from "@/components/marketing/PricingStrip"
import SocialProof from "@/components/marketing/SocialProof"
import FAQ from "@/components/marketing/FAQ"
import FooterCTAs from "@/components/marketing/FooterCTAs"
import Footer from "@/components/Footer"

export const metadata: Metadata = {
  title: "Groovy — Frictionless, traceable manufacturing OS",
  description: "Digitize the workflows you already run. From factory scans to brand signals—fast.",
  openGraph: {
    title: "Groovy — Frictionless, traceable manufacturing OS",
    description: "Digitize the workflows you already run. From factory scans to brand signals—fast.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Groovy — Frictionless, traceable manufacturing OS",
    description: "Digitize the workflows you already run. From factory scans to brand signals—fast.",
  },
}

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "Groovy",
            "description": "Frictionless, traceable manufacturing operating system",
            "url": "https://groovy.com",
            "logo": "https://groovy.com/groovy-logo.png",
            "sameAs": [
              "https://twitter.com/groovy",
              "https://linkedin.com/company/groovy"
            ]
          })
        }}
      />
      
      <div className="min-h-screen bg-[#F7F8FB]">
        <Navbar />
        <Hero />
        
        {/* Factory Digitization Compact Section */}
        <FactoryDigitizationCompact />

        {/* Interactive Demo section */}
        <Section className="bg-zinc-50">
          <div className="text-center space-y-8">
            <div className="space-y-4">
              <h2 className="text-3xl md:text-4xl font-semibold text-zinc-900">
                From scan to signal in under a second.
              </h2>
              <p className="text-lg text-zinc-600 max-w-3xl mx-auto">
                Simulate a factory scan and watch the brand view update instantly.
              </p>
            </div>
            <ScanToSignalDemo />
          </div>
        </Section>

        {/* What you get (pillars) section */}
        <Section>
          <div className="text-center space-y-8">
            <div className="space-y-4">
              <h2 className="text-3xl md:text-4xl font-semibold text-zinc-900">
                What you get
              </h2>
            </div>
            <Pillars />
          </div>
        </Section>

        {/* Use Cases carousel section */}
        <Section className="bg-zinc-50">
          <div className="text-center space-y-8">
            <div className="space-y-4">
              <h2 className="text-3xl md:text-4xl font-semibold text-zinc-900">
                Use Cases
              </h2>
            </div>
            <UseCaseCarousel />
          </div>
        </Section>

        {/* Pricing section */}
        <Section>
          <PricingStrip />
        </Section>

        {/* Social proof section */}
        <Section className="bg-zinc-50">
          <SocialProof />
        </Section>

        {/* FAQ section */}
        <Section>
          <div className="text-center space-y-8">
            <div className="space-y-4">
              <h2 className="text-3xl md:text-4xl font-semibold text-zinc-900">
                Frequently Asked Questions
              </h2>
            </div>
            <FAQ />
          </div>
        </Section>

        {/* Footer CTAs section */}
        <Section className="bg-zinc-50">
          <FooterCTAs />
        </Section>

        <Footer />
      </div>
    </>
  )
}
