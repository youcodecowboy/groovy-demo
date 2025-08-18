"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { 
  Clock, 
  MapPin, 
  MessageSquare, 
  CheckCircle, 
  AlertTriangle, 
  QrCode,
  User,
  ChevronDown,
  ChevronRight,
  Scan,
  Camera,
  FileText,
  Settings
} from "lucide-react"

interface Event {
  id: string
  type: 'scan' | 'transition' | 'exception' | 'message' | 'qc' | 'location' | 'note'
  timestamp: number
  summary: string
  details?: string
  user?: string
  stage?: string
  metadata?: Record<string, any>
}

interface EventFeedProps {
  events: Event[]
  maxEvents?: number
}

export function EventFeed({ events, maxEvents = 20 }: EventFeedProps) {
  const [expandedEvents, setExpandedEvents] = useState<Set<string>>(new Set())

  const toggleEvent = (eventId: string) => {
    const newExpanded = new Set(expandedEvents)
    if (newExpanded.has(eventId)) {
      newExpanded.delete(eventId)
    } else {
      newExpanded.add(eventId)
    }
    setExpandedEvents(newExpanded)
  }

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
      case 'scan': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'transition': return 'bg-green-100 text-green-800 border-green-200'
      case 'exception': return 'bg-red-100 text-red-800 border-red-200'
      case 'message': return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'qc': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'location': return 'bg-indigo-100 text-indigo-800 border-indigo-200'
      case 'note': return 'bg-gray-100 text-gray-800 border-gray-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const recentEvents = events.slice(0, maxEvents)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Recent Events
          <Badge variant="outline" className="ml-auto">
            {recentEvents.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {recentEvents.length > 0 ? (
            recentEvents.map((event) => (
              <Collapsible 
                key={event.id}
                open={expandedEvents.has(event.id)}
                onOpenChange={() => toggleEvent(event.id)}
              >
                <CollapsibleTrigger asChild>
                  <Button
                    variant="ghost"
                    className="w-full justify-start p-3 h-auto hover:bg-gray-50"
                  >
                    <div className="flex items-start gap-3 w-full">
                      <div className={`p-2 rounded-lg border ${getEventColor(event.type)}`}>
                        {getEventIcon(event.type)}
                      </div>
                      
                      <div className="flex-1 text-left">
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
                              <span className="flex items-center gap-1">
                                <User className="h-3 w-3" />
                                {event.user}
                              </span>
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
                      
                      {event.details && (
                        <div className="flex items-center">
                          {expandedEvents.has(event.id) ? (
                            <ChevronDown className="h-4 w-4 text-gray-400" />
                          ) : (
                            <ChevronRight className="h-4 w-4 text-gray-400" />
                          )}
                        </div>
                      )}
                    </div>
                  </Button>
                </CollapsibleTrigger>
                
                {event.details && (
                  <CollapsibleContent>
                    <div className="ml-11 mb-3 p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-700">{event.details}</p>
                      {event.metadata && Object.keys(event.metadata).length > 0 && (
                        <div className="mt-2 pt-2 border-t border-gray-200">
                          <div className="text-xs text-gray-500 mb-1">Metadata:</div>
                          <div className="space-y-1">
                            {Object.entries(event.metadata).map(([key, value]) => (
                              <div key={key} className="text-xs">
                                <span className="font-medium">{key}:</span> {String(value)}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </CollapsibleContent>
                )}
              </Collapsible>
            ))
          ) : (
            <div className="text-center py-8">
              <Clock className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <h4 className="text-lg font-medium mb-2">No events yet</h4>
              <p className="text-gray-600">Events will appear here as the item progresses through the workflow</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
