"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { 
  QrCode, 
  Download, 
  Share2, 
  MoreVertical, 
  Copy, 
  CheckCircle,
  Clock,
  AlertTriangle,
  Play,
  Pause,
  Flag,
  Users,
  ArrowRight
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { StageBadge } from "@/components/ui/stage-badge"
import type { Item, Workflow, Stage } from "@/types/schema"

interface ItemHeaderProps {
  item: Item
  workflow: Workflow
  currentStage?: Stage
  onAdvanceItem?: (itemId: string, toStageId: string, reason: string) => void
  onReassignTeam?: (itemId: string, teamId: string) => void
  onFlagIssue?: (itemId: string, reason: string) => void
}

export function ItemHeader({ 
  item, 
  workflow, 
  currentStage,
  onAdvanceItem,
  onReassignTeam,
  onFlagIssue
}: ItemHeaderProps) {
  const { toast } = useToast()
  const [elapsedTime, setElapsedTime] = useState(0)
  const [timeLeft, setTimeLeft] = useState(0)
  const [slaStatus, setSlaStatus] = useState<'on-track' | 'warning' | 'overdue'>('on-track')

  // Mock SLA data - in real app this would come from the item or order
  const promisedLeadTime = 8 * 60 * 60 * 1000 // 8 hours in milliseconds
  const startTime = new Date(item.createdAt).getTime()

  useEffect(() => {
    const updateTimers = () => {
      const now = Date.now()
      const elapsed = now - startTime
      const remaining = Math.max(0, promisedLeadTime - elapsed)
      
      setElapsedTime(elapsed)
      setTimeLeft(remaining)

      // Calculate SLA status
      const progressPercent = (elapsed / promisedLeadTime) * 100
      if (progressPercent < 80) {
        setSlaStatus('on-track')
      } else if (progressPercent <= 100) {
        setSlaStatus('warning')
      } else {
        setSlaStatus('overdue')
      }
    }

    updateTimers()
    const interval = setInterval(updateTimers, 1000)
    return () => clearInterval(interval)
  }, [startTime, promisedLeadTime])

  const formatTime = (ms: number) => {
    const hours = Math.floor(ms / (1000 * 60 * 60))
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60))
    const seconds = Math.floor((ms % (1000 * 60)) / 1000)
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }

  const getSlaColor = () => {
    switch (slaStatus) {
      case 'on-track': return 'bg-green-500'
      case 'warning': return 'bg-yellow-500'
      case 'overdue': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  const getSlaTextColor = () => {
    switch (slaStatus) {
      case 'on-track': return 'text-green-700'
      case 'warning': return 'text-yellow-700'
      case 'overdue': return 'text-red-700'
      default: return 'text-gray-700'
    }
  }

  const copyItemId = async () => {
    try {
      await navigator.clipboard.writeText(item.sku)
      toast({
        title: "Item ID copied",
        description: "Item ID has been copied to clipboard",
      })
    } catch (error) {
      toast({
        title: "Failed to copy",
        description: "Could not copy item ID to clipboard",
        variant: "destructive",
      })
    }
  }

  const copyDeepLink = async () => {
    try {
      const link = `${window.location.origin}/app/items/${item.id}`
      await navigator.clipboard.writeText(link)
      toast({
        title: "Link copied",
        description: "Deep link has been copied to clipboard",
      })
    } catch (error) {
      toast({
        title: "Failed to copy",
        description: "Could not copy link to clipboard",
        variant: "destructive",
      })
    }
  }

  const downloadQR = (format: 'png' | 'svg' | 'pdf') => {
    // Mock QR download - in real app this would generate and download the QR
    toast({
      title: "QR Code downloaded",
      description: `QR code has been downloaded as ${format.toUpperCase()}`,
    })
  }

  const exportPDF = () => {
    // Mock PDF export - in real app this would generate and download a PDF dossier
    toast({
      title: "PDF exported",
      description: "Item dossier has been exported as PDF",
    })
  }

  return (
    <div className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Left: Item Identity & Stage */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="font-mono text-lg font-semibold">{item.sku}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={copyItemId}
                  className="h-6 w-6 p-0"
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
              <Badge variant="outline" className="font-mono">
                {item.id}
              </Badge>
            </div>
            
            {currentStage && (
              <div className="flex items-center gap-2">
                <ArrowRight className="h-4 w-4 text-gray-400" />
                <StageBadge stage={currentStage} />
              </div>
            )}
          </div>

          {/* Center: SLA/RAG Bar */}
          <div className="flex-1 max-w-md mx-8">
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className={getSlaTextColor()}>
                    Elapsed: {formatTime(elapsedTime)}
                  </span>
                  <span className={getSlaTextColor()}>
                    Time left: {formatTime(timeLeft)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Progress 
                    value={(elapsedTime / promisedLeadTime) * 100} 
                    className="flex-1 h-2"
                  />
                  <div className={`w-3 h-3 rounded-full ${getSlaColor()}`} />
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Target: {formatTime(promisedLeadTime)}
                </div>
              </div>
            </div>
          </div>

          {/* Right: Primary Actions */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => downloadQR('png')}
              className="h-8"
            >
              <QrCode className="h-4 w-4 mr-2" />
              QR
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={exportPDF}
              className="h-8"
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={copyDeepLink}
              className="h-8"
            >
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => onAdvanceItem?.(item.id, '', '')}>
                  <ArrowRight className="h-4 w-4 mr-2" />
                  Admin Advance
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onReassignTeam?.(item.id, '')}>
                  <Users className="h-4 w-4 mr-2" />
                  Reassign Team
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onFlagIssue?.(item.id, '')}>
                  <Flag className="h-4 w-4 mr-2" />
                  Flag Issue
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </div>
  )
}
