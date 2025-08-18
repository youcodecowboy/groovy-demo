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
  Flag,
  MessageSquare,
  MoreVertical,
  Copy,
  Clock,
  AlertTriangle,
  CheckCircle,
  ArrowLeft
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

interface DiscoItemHeaderProps {
  item: any
  currentStage?: any
  onFlagIssue?: (itemId: string, reason: string) => void
  onAddMessage?: (itemId: string) => void
}

export function DiscoItemHeader({ 
  item, 
  currentStage,
  onFlagIssue,
  onAddMessage
}: DiscoItemHeaderProps) {
  const { toast } = useToast()
  const router = useRouter()
  const [elapsedTime, setElapsedTime] = useState(0)
  const [timeLeft, setTimeLeft] = useState(0)
  const [slaStatus, setSlaStatus] = useState<'on-track' | 'warning' | 'overdue'>('on-track')

  // Simplified SLA calculation for mobile
  const promisedLeadTime = 8 * 60 * 60 * 1000 // 8 hours
  const startTime = new Date(item?.startedAt || Date.now()).getTime()

  useEffect(() => {
    const updateTimers = () => {
      const now = Date.now()
      const elapsed = now - startTime
      const remaining = Math.max(0, promisedLeadTime - elapsed)
      
      setElapsedTime(elapsed)
      setTimeLeft(remaining)

      // Simple SLA status
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
    return `${hours}h ${minutes}m`
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
      await navigator.clipboard.writeText(item?.itemId || '')
      toast({
        title: "Copied!",
        description: "Item ID copied to clipboard",
      })
    } catch (error) {
      toast({
        title: "Failed to copy",
        description: "Could not copy item ID",
        variant: "destructive",
      })
    }
  }

  const handleFlagIssue = () => {
    onFlagIssue?.(item?._id || '', 'Flagged from mobile interface')
    toast({
      title: "Item Flagged",
      description: "Issue has been flagged for review",
    })
  }

  const handleAddMessage = () => {
    onAddMessage?.(item?._id || '')
  }

  return (
    <div className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="px-4 py-3">
        {/* Top Row - Item ID and Back */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="h-8 w-8 p-0"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-2">
              <span className="font-mono text-lg font-semibold">#{item?.itemId}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={copyItemId}
                className="h-6 w-6 p-0"
              >
                <Copy className="h-3 w-3" />
              </Button>
            </div>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={handleFlagIssue}>
                <Flag className="h-4 w-4 mr-2" />
                Flag Issue
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleAddMessage}>
                <MessageSquare className="h-4 w-4 mr-2" />
                Add Message
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Middle Row - Stage and Status */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            {currentStage && (
              <Badge className="bg-blue-100 text-blue-800 border-blue-300">
                {currentStage.name}
              </Badge>
            )}
            <Badge variant={item?.status === "active" ? "default" : "secondary"}>
              {item?.status}
            </Badge>
          </div>
          
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${getSlaColor()}`} />
            <span className={`text-sm font-medium ${getSlaTextColor()}`}>
              {slaStatus === 'on-track' ? 'On Time' : slaStatus === 'warning' ? 'Warning' : 'Overdue'}
            </span>
          </div>
        </div>

        {/* Bottom Row - Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className={getSlaTextColor()}>
              {formatTime(elapsedTime)} elapsed
            </span>
            <span className={getSlaTextColor()}>
              {formatTime(timeLeft)} left
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Progress 
              value={(elapsedTime / promisedLeadTime) * 100} 
              className="flex-1 h-2"
            />
            <div className={`w-3 h-3 rounded-full ${getSlaColor()}`} />
          </div>
        </div>
      </div>
    </div>
  )
}
