"use client"

import Image from "next/image"
import { BrandNavigation } from "./brand-navigation"
import { Badge } from "@/components/ui/badge"
import { Clock } from "lucide-react"

export function BrandHeader() {
  const currentTime = new Date().toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  })

  return (
    <div className="bg-black text-white shadow-lg">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <BrandNavigation />
            <div>
              <h1 className="text-xl font-bold">Brand Interface</h1>
              <p className="text-gray-300 text-sm">Production Monitoring Dashboard</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
              <Clock className="w-3 h-3 mr-1" />
              {currentTime}
            </Badge>
            <Image
              src="/groovy-logo.png"
              alt="Groovy"
              width={100}
              height={30}
              className="h-8 w-auto brightness-0 invert"
            />
          </div>
        </div>
      </div>
    </div>
  )
} 