"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  MapPin, 
  Clock, 
  ArrowRight,
  Building2,
  Package,
  Truck,
  Warehouse
} from "lucide-react"

interface Location {
  id: string
  name: string
  type: 'factory' | 'warehouse' | 'shipping' | 'storage' | 'production'
  timestamp: number
  duration?: number // time spent at this location
}

interface LocationHistoryProps {
  currentLocation?: Location
  locationHistory: Location[]
  maxHistory?: number
}

export function LocationHistory({ 
  currentLocation, 
  locationHistory, 
  maxHistory = 10 
}: LocationHistoryProps) {
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

  const formatDuration = (durationMs: number) => {
    const hours = Math.floor(durationMs / (1000 * 60 * 60))
    const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60))
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`
    }
    return `${minutes}m`
  }

  const getLocationIcon = (type: Location['type']) => {
    switch (type) {
      case 'factory': return <Building2 className="h-4 w-4" />
      case 'warehouse': return <Warehouse className="h-4 w-4" />
      case 'shipping': return <Truck className="h-4 w-4" />
      case 'storage': return <Package className="h-4 w-4" />
      case 'production': return <Building2 className="h-4 w-4" />
      default: return <MapPin className="h-4 w-4" />
    }
  }

  const getLocationColor = (type: Location['type']) => {
    switch (type) {
      case 'factory': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'warehouse': return 'bg-green-100 text-green-800 border-green-200'
      case 'shipping': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'storage': return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'production': return 'bg-indigo-100 text-indigo-800 border-indigo-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const recentHistory = locationHistory.slice(0, maxHistory)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Location & Movement
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Location */}
        {currentLocation && (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-3 mb-2">
              <div className={`p-2 rounded-lg border ${getLocationColor(currentLocation.type)}`}>
                {getLocationIcon(currentLocation.type)}
              </div>
              <div>
                <div className="font-medium text-blue-900">Current Location</div>
                <div className="text-sm text-blue-700">{currentLocation.name}</div>
              </div>
              <Badge className="bg-blue-100 text-blue-800 border-blue-300">
                {currentLocation.type}
              </Badge>
            </div>
            <div className="text-xs text-blue-600 flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Arrived {formatTimestamp(currentLocation.timestamp)}
            </div>
          </div>
        )}

        {/* Location History */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-gray-700">Recent Movement</h4>
            <Badge variant="outline" className="text-xs">
              {recentHistory.length} locations
            </Badge>
          </div>
          
          {recentHistory.length > 0 ? (
            <div className="space-y-2">
              {recentHistory.map((location, index) => (
                <div key={location.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className={`p-2 rounded-lg border ${getLocationColor(location.type)}`}>
                    {getLocationIcon(location.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">{location.name}</span>
                      <Badge variant="outline" className="text-xs">
                        {location.type}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatTimestamp(location.timestamp)}
                      </span>
                      {location.duration && (
                        <>
                          <span>•</span>
                          <span>Duration: {formatDuration(location.duration)}</span>
                        </>
                      )}
                    </div>
                  </div>
                  
                  {index < recentHistory.length - 1 && (
                    <ArrowRight className="h-4 w-4 text-gray-400" />
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <MapPin className="h-8 w-8 mx-auto mb-2 text-gray-300" />
              <p className="text-sm text-gray-600">No location history available</p>
            </div>
          )}
        </div>

        {/* Location Statistics */}
        {recentHistory.length > 0 && (
          <div className="border-t pt-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-gray-500">Total Locations</div>
                <div className="font-medium">{recentHistory.length}</div>
              </div>
              <div>
                <div className="text-gray-500">Current Type</div>
                <div className="font-medium capitalize">
                  {currentLocation?.type || 'Unknown'}
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
