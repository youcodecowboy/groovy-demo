'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'

interface BrandWelcomeBannerProps {
  onDismiss?: () => void
}

export function BrandWelcomeBanner({ onDismiss }: BrandWelcomeBannerProps) {
  const [isVisible, setIsVisible] = useState(true)

  const handleDismiss = () => {
    setIsVisible(false)
    onDismiss?.()
  }

  if (!isVisible) return null

  return (
    <div className="relative overflow-hidden rounded-xl border border-black/10 bg-gradient-to-r from-[#0b0b0b] via-[#15161a] to-black p-8 text-white">
      {/* Dismiss button */}
      <button
        onClick={handleDismiss}
        className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full transition-colors z-10"
        title="Dismiss"
      >
        <X className="h-5 w-5 text-white/80" />
      </button>
      
      {/* subtle grid/texture overlay */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(120% 120% at 0% 50%, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0) 55%), linear-gradient(to right, rgba(255,255,255,0.07) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.07) 1px, transparent 1px)",
          backgroundSize: "auto, 18px 18px, 18px 18px",
        }}
      />
      
      <div className="relative flex items-center gap-6">
        <div className="relative h-20 w-20 md:h-28 md:w-28 lg:h-36 lg:w-36">
          <Image
            src="/groovy%20mascot.png"
            alt="Groovy mascot"
            fill
            className="object-contain origin-center scale-[1.9]"
            priority
          />
        </div>
        
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl md:text-3xl font-semibold leading-tight">
            <span className="relative -top-0.5 italic">Welcome to </span>
            <Image
              src="/groovy-logo.png"
              alt="Groovy"
              width={280}
              height={80}
              className="ml-2 inline h-12 md:h-14 w-auto align-[-8px] invert brightness-0"
              priority
            />
          </h2>
          <p className="mt-2 text-base md:text-lg text-white/80 italic">
            Groovy Brand Interface — the most powerful platform for managing your production network and factory relationships.
          </p>
          
          <div className="mt-4 flex w-full flex-wrap items-center gap-3">
            <Button 
              className="h-10 rounded-full border border-white bg-white/10 px-5 text-white hover:bg-white hover:text-black"
              onClick={() => window.location.href = '/brand/orders'}
            >
              View Orders
            </Button>
            <Button 
              className="h-10 rounded-full border border-white bg-white px-5 text-black hover:bg-black hover:text-white"
              onClick={() => window.location.href = '/brand/factories'}
            >
              Manage Factories
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
