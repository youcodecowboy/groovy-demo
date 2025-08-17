"use client"

import Image from "next/image"
import { Badge } from "@/components/ui/badge"

interface DiscoHeaderProps {
  currentTeam: string
}

export function DiscoHeader({ currentTeam }: DiscoHeaderProps) {
  const currentTime = new Date().toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })

  const getTeamDisplayName = (teamId: string) => {
    const teamNames: Record<string, string> = {
      production: "Production",
      cutting: "Cutting",
      sewing: "Sewing",
      quality: "Quality Control",
      packaging: "Packaging",
    }
    return teamNames[teamId] || teamId
  }

  return (
    <div className="sticky top-0 z-40 bg-white border-b shadow-sm">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Left: Groovy Logo */}
          <div className="flex items-center">
            <Image
              src="/groovy-logo.png"
              alt="Groovy"
              width={120}
              height={36}
              className="h-9 w-auto"
            />
          </div>

          {/* Center: Team Indicator */}
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
              {getTeamDisplayName(currentTeam)}
            </Badge>
            <span className="text-sm text-gray-500 font-mono">
              {currentTime}
            </span>
          </div>

          {/* Right: Status Indicator */}
          <div className="flex items-center">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-600">Online</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
