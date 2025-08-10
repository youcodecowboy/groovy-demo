"use client"

import { useWorkflows, useItems } from "@/hooks/use-convex"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { useState } from "react"

export default function DebugPage() {
  const { workflows, isLoading: workflowsLoading } = useWorkflows()
  const { allItems, isLoading: itemsLoading } = useItems()
  const router = useRouter()
  const org = useQuery(api.tenancy.getOrganization, {})
  const updateOrgName = useMutation(api.tenancy.updateOrganizationName)
  
  // Direct queries to test
  const directWorkflows = useQuery(api.workflows.getAll)
  const directItems = useQuery(api.items.getAll)
  const [newName, setNewName] = useState("")

  const handleTestNavigation = (itemId: string) => {
    router.push(`/floor/items/${itemId}`)
  }

  return (
    <div className="container mx-auto p-8 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Debug Page</h1>
        <p className="text-gray-600">Check Convex connection and data</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Organization (per-tenant)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div><strong>Name:</strong> {org?.name ?? "—"}</div>
            <div><strong>Slug:</strong> {org?.slug ?? "—"}</div>
            <div className="flex items-end gap-2">
              <div className="flex-1">
                <label className="block text-xs text-gray-600 mb-1">Rename</label>
                <input
                  className="w-full rounded-md border px-3 py-2"
                  placeholder="e.g., Acme"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                />
              </div>
              <Button
                onClick={async () => {
                  const value = newName.trim()
                  if (!value) return
                  await updateOrgName({ name: value })
                  setNewName("")
                }}
              >
                Save
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Environment Variables</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div>
              <strong>NEXT_PUBLIC_CONVEX_URL:</strong> {process.env.NEXT_PUBLIC_CONVEX_URL || "Not set"}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Items (direct query)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div>
              <strong>Loading:</strong> {directItems === undefined ? "Yes" : "No"}
            </div>
            <div>
              <strong>Count:</strong> {directItems?.length || 0}
            </div>
            {directItems && directItems.length > 0 && (
              <div className="space-y-4">
                <h4 className="font-medium">Item Details:</h4>
                {directItems.slice(0, 5).map((item) => (
                  <div key={item._id} className="p-3 border rounded-lg">
                    <div><strong>Convex ID:</strong> {item._id}</div>
                    <div><strong>Item ID (SKU):</strong> {item.itemId}</div>
                    <div><strong>Status:</strong> {item.status}</div>
                    <div><strong>Current Stage:</strong> {item.currentStageId}</div>
                    <div><strong>Brand:</strong> {item.metadata?.brand}</div>
                    <Button 
                      size="sm" 
                      onClick={() => handleTestNavigation(item.itemId)}
                      className="mt-2"
                    >
                      Test Navigation to /floor/items/{item.itemId}
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Workflows (direct query)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div>
              <strong>Loading:</strong> {directWorkflows === undefined ? "Yes" : "No"}
            </div>
            <div>
              <strong>Count:</strong> {directWorkflows?.length || 0}
            </div>
            {directWorkflows && directWorkflows.length > 0 && (
              <div className="space-y-4">
                <h4 className="font-medium">Workflow Details:</h4>
                {directWorkflows.slice(0, 3).map((workflow) => (
                  <div key={workflow._id} className="p-3 border rounded-lg">
                    <div><strong>Convex ID:</strong> {workflow._id}</div>
                    <div><strong>Name:</strong> {workflow.name}</div>
                    <div><strong>Stages:</strong> {workflow.stages.length}</div>
                    <div><strong>Stages:</strong> {workflow.stages.map(s => s.name).join(", ")}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 