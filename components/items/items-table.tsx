"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { StageBadge } from "@/components/ui/stage-badge"
import type { Item, Workflow } from "@/types/schema"
import { Search, Filter, Play, Package, Clock, CheckCircle, Pause, Eye } from "lucide-react"

interface ItemsTableProps {
  items: Item[]
  workflows: Workflow[]
  onActivateItem: (itemId: string) => void
  onRefresh: () => void
}

const statusConfig = {
  inactive: { label: "Inactive", color: "bg-gray-100 text-gray-700", icon: Pause },
  active: { label: "Active", color: "bg-blue-100 text-blue-700", icon: Clock },
  completed: { label: "Completed", color: "bg-green-100 text-green-700", icon: CheckCircle },
  paused: { label: "Paused", color: "bg-yellow-100 text-yellow-700", icon: Pause },
}

export function ItemsTable({ items, workflows, onActivateItem, onRefresh }: ItemsTableProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [workflowFilter, setWorkflowFilter] = useState<string>("all")
  const router = useRouter()

  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.metadata?.brand?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.metadata?.style?.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = statusFilter === "all" || item.status === statusFilter
    const matchesWorkflow = workflowFilter === "all" || item.workflowId === workflowFilter

    return matchesSearch && matchesStatus && matchesWorkflow
  })

  const getWorkflowName = (workflowId: string) => {
    return workflows.find((w) => w.id === workflowId)?.name || "Unknown Workflow"
  }

  const getCurrentStage = (item: Item) => {
    const workflow = workflows.find((w) => w.id === item.workflowId)
    if (!workflow) return null

    if (item.status === "inactive") return null
    return workflow.stages.find((s) => s.id === item.currentStageId)
  }

  const handleItemClick = (itemId: string) => {
    router.push(`/admin/items-list/${itemId}`)
  }

  const statusCounts = {
    all: items.length,
    inactive: items.filter((i) => i.status === "inactive").length,
    active: items.filter((i) => i.status === "active").length,
    completed: items.filter((i) => i.status === "completed").length,
    paused: items.filter((i) => i.status === "paused").length,
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">All Items</h1>
          <p className="text-gray-600">Manage and track all production items across workflows</p>
        </div>
        <Button onClick={onRefresh} variant="outline">
          Refresh
        </Button>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-5 gap-4">
        {Object.entries(statusCounts).map(([status, count]) => {
          const config =
            status === "all"
              ? { label: "All Items", color: "bg-gray-100 text-gray-700", icon: Package }
              : statusConfig[status as keyof typeof statusConfig]

          const IconComponent = config.icon

          return (
            <Card key={status} className="border-0 shadow-sm hover:shadow-md transition-all duration-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{config.label}</p>
                    <p className="text-2xl font-bold text-gray-900">{count}</p>
                  </div>
                  <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${config.color}`}>
                    <IconComponent className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search by SKU, ID, brand, or style..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-11"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48 h-11">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="paused">Paused</SelectItem>
              </SelectContent>
            </Select>
            <Select value={workflowFilter} onValueChange={setWorkflowFilter}>
              <SelectTrigger className="w-48 h-11">
                <SelectValue placeholder="Filter by workflow" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Workflows</SelectItem>
                {workflows.map((workflow) => (
                  <SelectItem key={workflow.id} value={workflow.id}>
                    {workflow.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Items Table */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">
            Items ({filteredItems.length} of {items.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredItems.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Package className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="font-medium">No items found</p>
                <p className="text-sm">Try adjusting your search or filters</p>
              </div>
            ) : (
              filteredItems.map((item) => {
                const currentStage = getCurrentStage(item)
                const statusInfo = statusConfig[item.status]
                const StatusIcon = statusInfo.icon

                return (
                  <div
                    key={item.id}
                    className="p-4 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer group"
                    onClick={() => handleItemClick(item.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 grid grid-cols-6 gap-4 items-center">
                        <div>
                          <div className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                            {item.sku}
                          </div>
                          <div className="text-sm text-gray-600">{item.id}</div>
                        </div>

                        <div>
                          <div
                            className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}
                          >
                            <StatusIcon className="w-3 h-3" />
                            {statusInfo.label}
                          </div>
                        </div>

                        <div>
                          {currentStage ? (
                            <StageBadge stage={currentStage} className="text-xs" />
                          ) : (
                            <Badge variant="outline" className="text-xs">
                              {item.status === "inactive" ? "Pending Activation" : "No Stage"}
                            </Badge>
                          )}
                        </div>

                        <div>
                          <div className="text-sm font-medium">{getWorkflowName(item.workflowId)}</div>
                        </div>

                        <div>
                          {item.metadata && (
                            <div className="text-sm text-gray-600">
                              <div>{item.metadata.brand}</div>
                              <div className="text-xs">{item.metadata.style}</div>
                            </div>
                          )}
                        </div>

                        <div className="text-sm text-gray-600">
                          <div>Created: {new Date(item.createdAt).toLocaleDateString()}</div>
                          {item.activatedAt && (
                            <div className="text-xs">Activated: {new Date(item.activatedAt).toLocaleDateString()}</div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleItemClick(item.id)
                          }}
                          size="sm"
                          variant="outline"
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View Details
                        </Button>
                        {item.status === "inactive" && (
                          <Button
                            onClick={(e) => {
                              e.stopPropagation()
                              onActivateItem(item.id)
                            }}
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <Play className="w-4 h-4 mr-1" />
                            Activate
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
