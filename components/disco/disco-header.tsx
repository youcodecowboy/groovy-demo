"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"

interface DiscoHeaderProps {
  currentTeam: string
}

export function DiscoHeader({ currentTeam }: DiscoHeaderProps) {
  const [currentTime, setCurrentTime] = useState<Date | null>(null)
  const [isClient, setIsClient] = useState(false)

  // Set client flag on mount to prevent hydration mismatch
  useEffect(() => {
    setIsClient(true)
    setCurrentTime(new Date())
  }, [])

  // Update time every second
  useEffect(() => {
    if (!isClient) return

    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [isClient])

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

  const getTeamColors = (teamId: string) => {
    const colors: Record<string, { bg: string; border: string; text: string }> = {
      production: { bg: "bg-blue-600", border: "border-blue-700", text: "text-blue-100" },
      cutting: { bg: "bg-red-600", border: "border-red-700", text: "text-red-100" },
      sewing: { bg: "bg-orange-600", border: "border-orange-700", text: "text-orange-100" },
      quality: { bg: "bg-purple-600", border: "border-purple-700", text: "text-purple-100" },
      packaging: { bg: "bg-green-600", border: "border-green-700", text: "text-green-100" },
    }
    return colors[teamId] || colors.production
  }

  const teamColors = getTeamColors(currentTeam)

  return (
    <div className={`sticky top-0 z-40 ${teamColors.bg} ${teamColors.border} border-b shadow-sm transition-colors duration-300`}>
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Left: Groovy Logo */}
          <div className="flex items-center">
            <Image
              src="/groovy-logo.png"
              alt="Groovy"
              width={120}
              height={36}
              className="h-9 w-auto brightness-0 invert"
            />
          </div>

          {/* Center: Team Indicator */}
          <div className="flex items-center gap-3">
            <Badge variant="outline" className={`bg-white/20 ${teamColors.text} border-white/30`}>
              {getTeamDisplayName(currentTeam)}
            </Badge>
            <span className={`text-sm font-mono ${teamColors.text}`}>
              {isClient && currentTime ? currentTime.toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
                hour12: false,
              }) : "--:--:--"}
            </span>
          </div>

          {/* Right: Status Indicator */}
          <div className="flex items-center">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
              <span className={`text-sm ${teamColors.text}`}>Online</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
