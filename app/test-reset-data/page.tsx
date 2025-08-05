"use client"

import { useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, CheckCircle, RefreshCw, Database } from "lucide-react"

export default function TestResetDataPage() {
  const { toast } = useToast()
  const resetAllData = useMutation(api.seed.resetAllData)
  
  const [isResetting, setIsResetting] = useState(false)
  const [resetResult, setResetResult] = useState<any>(null)

  const handleResetData = async () => {
    setIsResetting(true)
    try {
      const result = await resetAllData({})
      setResetResult(result)
      toast({
        title: "✅ Data Reset Complete",
        description: `Successfully reset all data and created ${result.totalItems} new items`,
      })
    } catch (error) {
      console.error("Reset error:", error)
      toast({
        title: "Error",
        description: "Failed to reset data",
        variant: "destructive",
      })
    } finally {
      setIsResetting(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Reset All Data
          </h1>
          <p className="text-gray-600">
            Clear all existing data and create fresh demo data with consistent schema
          </p>
        </div>

        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-800">
              <AlertTriangle className="w-5 h-5" />
              Warning
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-700">
              This will delete ALL existing data including items, workflows, users, and messages. 
              This action cannot be undone.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5" />
              Reset Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={handleResetData} 
              disabled={isResetting}
              className="w-full bg-red-600 hover:bg-red-700"
            >
              {isResetting ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Resetting Data...
                </>
              ) : (
                <>
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  Reset All Data
                </>
              )}
            </Button>
            
            <p className="text-sm text-gray-600">
              This will create 20 test items with proper workflow progression and consistent data structure.
            </p>
          </CardContent>
        </Card>

        {resetResult && (
          <Card className="border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-800">
                <CheckCircle className="w-5 h-5" />
                Reset Complete
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Total Items Created:</span>
                  <Badge variant="outline">{resetResult.totalItems}</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Workflows Created:</span>
                  <Badge variant="outline">1</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Locations Created:</span>
                  <Badge variant="outline">3</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Users Created:</span>
                  <Badge variant="outline">2</Badge>
                </div>
              </div>
              
              <div className="mt-4 p-3 bg-white rounded border">
                <h4 className="font-medium mb-2">Test Items Created:</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {Array.from({ length: 20 }, (_, i) => (
                    <div key={i} className="flex justify-between">
                      <span>DEMO-{(i + 1).toString().padStart(3, '0')}:</span>
                      <span className="text-gray-600">
                        Stage {Math.floor(i % 3) + 1}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>What This Does</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span>Deletes all existing data</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span>Creates fresh workflow with proper stage progression</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span>Creates 20 test items with consistent IDs</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span>Distributes items across all stages</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span>Fixes "item not found" issues</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span>Ensures all items show up in floor view</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 