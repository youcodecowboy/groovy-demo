"use client"

import { useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { useWorkflows, useItems, useItemMutations } from "@/hooks/use-convex"
import { useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, Database, CheckCircle } from "lucide-react"

export default function TestBackendPage() {
  const { workflows, isLoading: workflowsLoading } = useWorkflows()
  const { allItems, isLoading: itemsLoading } = useItems()
  const { createItem } = useItemMutations()
  const { toast } = useToast()
  const [isSeeding, setIsSeeding] = useState(false)
  const seedDemoData = useMutation(api.seed.seedDemoData)

  const handleSeedData = async () => {
    setIsSeeding(true)
    try {
      const result = await seedDemoData()
      toast({
        title: "Success",
        description: `Demo data seeded successfully: ${result.workflowsCreated} workflows, ${result.itemsCreated} items`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to seed demo data",
        variant: "destructive",
      })
    } finally {
      setIsSeeding(false)
    }
  }

  const handleCreateTestItem = async () => {
    try {
      if (!workflows || workflows.length === 0) {
        toast({
          title: "Error",
          description: "No workflows available",
          variant: "destructive",
        })
        return
      }

      const workflow = workflows[0]
      const itemId = await createItem({
        itemId: `TEST-${Date.now()}`,
        workflowId: workflow._id,
        metadata: {
          brand: "Test Brand",
          color: "Blue",
          size: "M",
          style: "Test Style",
        },
      })

      toast({
        title: "Success",
        description: `Created test item: ${itemId}`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create test item",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="container mx-auto p-8 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Backend Test Page</h1>
        <p className="text-gray-600">Test Convex connection and data operations</p>
      </div>

      {/* Connection Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            Connection Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <span className="text-green-600 font-medium">Connected to Convex</span>
          </div>
        </CardContent>
      </Card>

      {/* Data Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Workflows</CardTitle>
          </CardHeader>
          <CardContent>
            {workflowsLoading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Loading...</span>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="text-2xl font-bold">{workflows?.length || 0}</div>
                <div className="text-sm text-gray-600">Total workflows</div>
                {workflows && workflows.length > 0 && (
                  <div className="space-y-1">
                    {workflows.slice(0, 3).map((workflow) => (
                      <div key={workflow._id} className="flex items-center gap-2">
                        <Badge variant="secondary">{workflow.name}</Badge>
                        <span className="text-xs text-gray-500">
                          {workflow.stages.length} stages
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Items</CardTitle>
          </CardHeader>
          <CardContent>
            {itemsLoading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Loading...</span>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="text-2xl font-bold">{allItems?.length || 0}</div>
                <div className="text-sm text-gray-600">Total items</div>
                {allItems && allItems.length > 0 && (
                  <div className="space-y-1">
                    <div className="text-xs text-gray-500">
                      Active: {allItems.filter(item => item.status === "active").length}
                    </div>
                    <div className="text-xs text-gray-500">
                      Completed: {allItems.filter(item => item.status === "completed").length}
                    </div>
                    <div className="text-xs text-gray-500">
                      Paused: {allItems.filter(item => item.status === "paused").length}
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Button onClick={handleSeedData} disabled={isSeeding}>
              {isSeeding ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Seeding...
                </>
              ) : (
                "Seed Demo Data"
              )}
            </Button>
            <Button onClick={handleCreateTestItem} variant="outline">
              Create Test Item
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Items */}
      {allItems && allItems.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {allItems.slice(0, 5).map((item) => (
                <div key={item._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium">{item.itemId}</div>
                    <div className="text-sm text-gray-600">
                      {item.metadata?.brand} - {item.metadata?.style}
                    </div>
                  </div>
                  <Badge variant={item.status === "active" ? "default" : "secondary"}>
                    {item.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 