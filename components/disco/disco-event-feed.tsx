"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Clock, 
  MapPin, 
  MessageSquare, 
  CheckCircle, 
  AlertTriangle, 
  Scan,
  Camera,
  FileText,
  Settings,
  ChevronDown,
  ChevronUp
} from "lucide-react"

interface Event {
  id: string
  type: 'scan' | 'transition' | 'exception' | 'message' | 'qc' | 'location' | 'note'
  timestamp: number
  summary: string
  details?: string
  user?: string
  stage?: string
}

interface DiscoEventFeedProps {
  events: Event[]
  maxEvents?: number
}

export function DiscoEventFeed({ events, maxEvents = 5 }: DiscoEventFeedProps) {
  const [showAll, setShowAll] = useState(false)

  const getEventIcon = (type: Event['type']) => {
    switch (type) {
      case 'scan': return <Scan className="h-4 w-4" />
      case 'transition': return <CheckCircle className="h-4 w-4" />
      case 'exception': return <AlertTriangle className="h-4 w-4" />
      case 'message': return <MessageSquare className="h-4 w-4" />
      case 'qc': return <Settings className="h-4 w-4" />
      case 'location': return <MapPin className="h-4 w-4" />
      case 'note': return <FileText className="h-4 w-4" />
      default: return <Clock className="h-4 w-4" />
    }
  }

  const getEventColor = (type: Event['type']) => {
    switch (type) {
      case 'scan': return 'bg-blue-100 text-blue-800'
      case 'transition': return 'bg-green-100 text-green-800'
      case 'exception': return 'bg-red-100 text-red-800'
      case 'message': return 'bg-purple-100 text-purple-800'
      case 'qc': return 'bg-orange-100 text-orange-800'
      case 'location': return 'bg-indigo-100 text-indigo-800'
      case 'note': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const displayedEvents = showAll ? events : events.slice(0, maxEvents)

  if (events.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Clock className="h-4 w-4" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <Clock className="h-8 w-8 mx-auto mb-2 text-gray-300" />
            <p className="text-sm text-gray-600">No recent activity</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Clock className="h-4 w-4" />
          Recent Activity
          <Badge variant="outline" className="ml-auto text-xs">
            {events.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {displayedEvents.map((event) => (
          <div key={event.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
            <div className={`p-2 rounded-lg ${getEventColor(event.type)}`}>
              {getEventIcon(event.type)}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium text-sm">{event.summary}</span>
                <Badge variant="outline" className="text-xs">
                  {event.type}
                </Badge>
              </div>
              
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <span>{formatTimestamp(event.timestamp)}</span>
                {event.user && (
                  <>
                    <span>•</span>
                    <span>{event.user.split('@')[0]}</span>
                  </>
                )}
                {event.stage && (
                  <>
                    <span>•</span>
                    <span>{event.stage}</span>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}

        {events.length > maxEvents && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAll(!showAll)}
            className="w-full"
          >
            {showAll ? (
              <>
                <ChevronUp className="h-4 w-4 mr-2" />
                Show Less
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4 mr-2" />
                Show More ({events.length - maxEvents} more)
              </>
            )}
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
