"use client"

import { useState } from "react"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { AdminSidebar } from "@/components/layout/admin-sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
    Package,
    Search,
    Filter,
    Eye, Clock,
    CheckCircle,
    Pause,
    Calendar,
    User,
    Building2
} from "lucide-react"
import Link from "next/link"

export default function ItemsListPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [workflowFilter, setWorkflowFilter] = useState<string>("all")

  const items = useQuery(api.items.getAll)
  const workflows = useQuery(api.workflows.getAll)

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getWorkflowName = (workflowId: string) => {
    const workflow = workflows?.find(w => w._id === workflowId)
    return workflow?.name || "Unknown Workflow"
  }

  const getStageName = (workflowId: string, stageId: string) => {
    const workflow = workflows?.find(w => w._id === workflowId)
    const stage = workflow?.stages.find(s => s.id === stageId)
    return stage?.name || "Unknown Stage"
  }

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "active":
        return { label: "Active", color: "bg-blue-100 text-blue-800 border-blue-200", icon: Clock }
      case "completed":
        return { label: "Completed", color: "bg-green-100 text-green-800 border-green-200", icon: CheckCircle }
      case "error":
        return { label: "Error", color: "bg-red-100 text-red-800 border-red-200", icon: Pause }
      default:
        return { label: "Unknown", color: "bg-gray-100 text-gray-800 border-gray-200", icon: Pause }
    }
  }

  const filteredItems = items?.filter(item => {
    const matchesSearch = !searchQuery || 
      item.itemId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.qrCode?.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesStatus = statusFilter === "all" || item.status === statusFilter
    const matchesWorkflow = workflowFilter === "all" || item.workflowId === workflowFilter

    return matchesSearch && matchesStatus && matchesWorkflow
  }) || []

  if (items === undefined) {
    return (
      <AdminSidebar>
        <div className="flex-1 space-y-6 p-6">
          <div className="text-center py-12">
            <div className="text-lg">Loading items...</div>
          </div>
        </div>
      </AdminSidebar>
    )
  }

  const statusCounts = {
    all: items.length,
    active: items.filter(i => i.status === "active").length,
    completed: items.filter(i => i.status === "completed").length,
    error: items.filter(i => i.status === "error").length,
  }

  return (
    <AdminSidebar>
      <div className="flex-1 space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">All Items</h1>
            <p className="text-muted-foreground">
              Manage and track all production items across workflows
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Items</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statusCounts.all}</div>
              <p className="text-xs text-muted-foreground">
                All production items
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Items</CardTitle>
              <Clock className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{statusCounts.active}</div>
              <p className="text-xs text-muted-foreground">
                Currently in production
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed Items</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{statusCounts.completed}</div>
              <p className="text-xs text-muted-foreground">
                Finished production
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Error Items</CardTitle>
              <Pause className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{statusCounts.error}</div>
              <p className="text-xs text-muted-foreground">
                Require attention
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters & Search
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search by item ID or QR code..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="error">Error</SelectItem>
                </SelectContent>
              </Select>
              <Select value={workflowFilter} onValueChange={setWorkflowFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by workflow" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Workflows</SelectItem>
                  {workflows?.map((workflow) => (
                    <SelectItem key={workflow._id} value={workflow._id}>
                      {workflow.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Items Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Items List
            </CardTitle>
            <CardDescription>
              {filteredItems.length} of {items.length} items
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredItems.length === 0 ? (
              <div className="text-center py-12">
                <Package className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No Items Found
                </h3>
                <p className="text-gray-500">
                  {searchQuery || statusFilter !== "all" || workflowFilter !== "all" 
                    ? "Try adjusting your filters" 
                    : "No items have been created yet"}
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item ID</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Workflow</TableHead>
                    <TableHead>Current Stage</TableHead>
                    <TableHead>Assigned To</TableHead>
                    <TableHead>Started</TableHead>
                    <TableHead>Updated</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredItems.map((item) => {
                    const statusConfig = getStatusConfig(item.status)
                    const StatusIcon = statusConfig.icon

                    return (
                      <TableRow key={item._id}>
                        <TableCell className="font-mono">
                          <Link 
                            href={`/floor/items/${item.itemId}`}
                            className="text-blue-600 hover:text-blue-800 underline"
                          >
                            {item.itemId}
                          </Link>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant="outline" 
                            className={statusConfig.color}
                          >
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {statusConfig.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4 text-gray-400" />
                            {getWorkflowName(item.workflowId)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {getStageName(item.workflowId, item.currentStageId)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {item.assignedTo ? (
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-gray-400" />
                              {item.assignedTo}
                            </div>
                          ) : (
                            <span className="text-gray-400">Unassigned</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Calendar className="h-4 w-4" />
                            {formatDate(item.startedAt)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Calendar className="h-4 w-4" />
                            {formatDate(item.updatedAt)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" asChild>
                              <Link href={`/floor/items/${item.itemId}`}>
                                <Eye className="h-4 w-4 mr-1" />
                                View
                              </Link>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminSidebar>
  )
}
