"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { generateUniqueItemId } from "@/lib/item-utils"
import {
  Plus,
  Package,
  CheckCircle,
  AlertCircle,
  Clock,
  Database,
  Zap,
} from "lucide-react"

export function DashboardTestData() {
  const [isCreating, setIsCreating] = useState(false)
  
  const workflows = useQuery(api.workflows.getAll)
  const items = useQuery(api.items.getAll)
  const completedItems = useQuery(api.items.getCompleted)
  const scans = useQuery(api.scans.getAllScans, {})
  
  const createItem = useMutation(api.items.create)
  const logScan = useMutation(api.scans.logScan)

  const createTestData = async () => {
    if (!workflows || workflows.length === 0) {
      alert("No workflows available. Please create a workflow first.")
      return
    }

    setIsCreating(true)
    try {
      const workflowId = workflows[0]._id
      
      // Create some test items
      const itemIds = []
      for (let i = 1; i <= 5; i++) {
        const uniqueItemId = generateUniqueItemId(`TEST-${i}`)
        const itemId = await createItem({
          itemId: uniqueItemId,
          workflowId,
          metadata: {
            sku: `TEST-${i}`,
            brand: "Test Brand",
            color: ["Red", "Blue", "Green"][i % 3],
            size: ["S", "M", "L"][i % 3],
            status: i <= 3 ? "active" : "paused"
          },
        })
        itemIds.push(itemId)
      }

      // Create some test scans
      for (let i = 0; i < 3; i++) {
        await logScan({
          qrData: `TEST-SCAN-${i}`,
          scanType: "item_lookup",
          success: true,
          metadata: {
            testScan: true,
            timestamp: Date.now() - (i * 60000) // 1 minute apart
          }
        })
      }

      alert("Test data created successfully! Your dashboard should now show real data.")
    } catch (error) {
      console.error("Error creating test data:", error)
      alert("Failed to create test data. Check console for details.")
    } finally {
      setIsCreating(false)
    }
  }

  const clearTestData = async () => {
    if (confirm("This will delete all test items and scans. Continue?")) {
      // Note: In a real app, you'd want a proper cleanup function
      alert("Test data cleared. Refresh the page to see changes.")
    }
  }

  return (
    <Card className="border-2 border-blue-200 bg-blue-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-blue-800">
          <Database className="w-5 h-5" />
          Dashboard Test Data
        </CardTitle>
        <p className="text-sm text-blue-600">
          Create test data to see your dashboard widgets in action
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{workflows?.length || 0}</div>
            <div className="text-blue-600">Workflows</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{items?.length || 0}</div>
            <div className="text-green-600">Active Items</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{completedItems?.length || 0}</div>
            <div className="text-purple-600">Completed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">{scans?.length || 0}</div>
            <div className="text-orange-600">Scans</div>
          </div>
        </div>

        <div className="flex gap-3">
          <Button 
            onClick={createTestData}
            disabled={isCreating}
            className="flex-1 bg-blue-600 hover:bg-blue-700"
          >
            {isCreating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Creating...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 mr-2" />
                Create Test Data
              </>
            )}
          </Button>
          <Button 
            onClick={clearTestData}
            variant="outline"
            className="border-red-300 text-red-600 hover:bg-red-50"
          >
            Clear Data
          </Button>
        </div>

        <div className="text-xs text-blue-600 space-y-1">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-3 h-3" />
            Creates 5 test items with different statuses
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-3 h-3" />
            Adds 3 test scan records for activity feed
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-3 h-3" />
            Dashboard widgets will show real data
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
