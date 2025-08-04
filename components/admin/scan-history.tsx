"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import {
    Camera,
    CheckCircle,
    XCircle, TrendingUp,
    AlertTriangle,
    RefreshCw
} from "lucide-react"

interface ScanHistoryProps {
  userId?: string
  timeRange?: number // in milliseconds
}

export function ScanHistory({ userId, timeRange = 24 * 60 * 60 * 1000 }: ScanHistoryProps) {
  const [selectedTimeRange, setSelectedTimeRange] = useState(timeRange)
  
  const scanStats = useQuery(api.scans.getScanStats, { 
    userId, 
    timeRange: selectedTimeRange 
  })
  
  const recentScans = useQuery(api.scans.getRecentScans, { 
    userId, 
    limit: 20 
  })

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleString()
  }

  const getScanTypeColor = (scanType: string) => {
    switch (scanType) {
      case "item_lookup":
        return "bg-blue-100 text-blue-800"
      case "stage_completion":
        return "bg-green-100 text-green-800"
      case "error":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getSuccessIcon = (success: boolean) => {
    return success ? (
      <CheckCircle className="w-4 h-4 text-green-600" />
    ) : (
      <XCircle className="w-4 h-4 text-red-600" />
    )
  }

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Scans</CardTitle>
            <Camera className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {scanStats?.totalScans || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Last {Math.round(selectedTimeRange / (1000 * 60 * 60))} hours
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {scanStats?.successRate?.toFixed(1) || 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              {scanStats?.successfulScans || 0} successful
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Successful Scans</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {scanStats?.successfulScans || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Successful scans
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed Scans</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {scanStats?.errorScans || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Failed scans
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Time Range Selector */}
      <div className="flex gap-2">
        <Button
          variant={selectedTimeRange === 60 * 60 * 1000 ? "default" : "outline"}
          size="sm"
          onClick={() => setSelectedTimeRange(60 * 60 * 1000)}
        >
          1 Hour
        </Button>
        <Button
          variant={selectedTimeRange === 24 * 60 * 60 * 1000 ? "default" : "outline"}
          size="sm"
          onClick={() => setSelectedTimeRange(24 * 60 * 60 * 1000)}
        >
          24 Hours
        </Button>
        <Button
          variant={selectedTimeRange === 7 * 24 * 60 * 60 * 1000 ? "default" : "outline"}
          size="sm"
          onClick={() => setSelectedTimeRange(7 * 24 * 60 * 60 * 1000)}
        >
          7 Days
        </Button>
      </div>

      {/* Recent Scans */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4" />
            Recent Scans
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentScans?.map((scan) => (
              <div
                key={scan._id}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex items-center gap-3">
                  {getSuccessIcon(scan.success)}
                  <div>
                    <div className="font-medium">
                      {scan.qrData}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {formatTimestamp(scan.timestamp)}
                    </div>
                    {scan.errorMessage && (
                      <div className="text-sm text-red-600">
                        Error: {scan.errorMessage}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={getScanTypeColor(scan.scanType)}>
                    {scan.scanType.replace("_", " ")}
                  </Badge>
                  {scan.itemId && (
                    <Badge variant="outline">
                      Item: {scan.itemId}
                    </Badge>
                  )}
                </div>
              </div>
            ))}
            
            {recentScans?.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No scans found in the selected time range
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 