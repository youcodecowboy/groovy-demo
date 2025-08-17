"use client"

import React, { useState, useMemo } from "react"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Plus,
  Search,
  FileText,
  Edit3,
  Eye,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Filter,
  Calendar,
  Package,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Columns,
  ChevronLeft,
  ChevronRight,
  X,
  Hash,
  User,
  Users,
  Tag,
  MapPin,
  Star,
  Target,
  Zap,
  PlusCircle
} from "lucide-react"
import { useRouter } from "next/navigation"

// Column type definitions
interface ColumnType {
  id: string
  name: string
  icon: React.ComponentType<any>
  description: string
  color: string
  configurable: boolean
  sortable: boolean
  filterable: boolean
}

const COLUMN_TYPES: ColumnType[] = [
  {
    id: "text",
    name: "Text",
    icon: FileText,
    description: "Simple text field",
    color: "bg-blue-100 text-blue-700",
    configurable: true,
    sortable: true,
    filterable: true
  },
  {
    id: "number",
    name: "Number",
    icon: Hash,
    description: "Numeric values",
    color: "bg-green-100 text-green-700",
    configurable: true,
    sortable: true,
    filterable: true
  },
  {
    id: "status",
    name: "Status",
    icon: Target,
    description: "Status with colors",
    color: "bg-purple-100 text-purple-700",
    configurable: true,
    sortable: true,
    filterable: true
  },
  {
    id: "team",
    name: "Team",
    icon: Users,
    description: "Team assignment",
    color: "bg-orange-100 text-orange-700",
    configurable: true,
    sortable: true,
    filterable: true
  },
  {
    id: "date",
    name: "Date",
    icon: Calendar,
    description: "Date and time",
    color: "bg-indigo-100 text-indigo-700",
    configurable: true,
    sortable: true,
    filterable: true
  },
  {
    id: "person",
    name: "Person",
    icon: User,
    description: "Single person assignment",
    color: "bg-pink-100 text-pink-700",
    configurable: true,
    sortable: true,
    filterable: true
  },
  {
    id: "tags",
    name: "Tags",
    icon: Tag,
    description: "Multiple tags",
    color: "bg-yellow-100 text-yellow-700",
    configurable: true,
    sortable: false,
    filterable: true
  },
  {
    id: "location",
    name: "Location",
    icon: MapPin,
    description: "Physical location",
    color: "bg-red-100 text-red-700",
    configurable: true,
    sortable: true,
    filterable: true
  },
  {
    id: "priority",
    name: "Priority",
    icon: Star,
    description: "Priority levels",
    color: "bg-amber-100 text-amber-700",
    configurable: true,
    sortable: true,
    filterable: true
  },
  {
    id: "progress",
    name: "Progress",
    icon: Zap,
    description: "Progress percentage",
    color: "bg-emerald-100 text-emerald-700",
    configurable: true,
    sortable: true,
    filterable: false
  }
]

interface ColumnConfig {
  id: string
  type: string
  label: string
  visible: boolean
  sortable: boolean
  filterable: boolean
  config?: any
  position: number
}

export default function ItemsTable() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [workflowFilter, setWorkflowFilter] = useState<string>("all")
  const [brandFilter, setBrandFilter] = useState<string>("all")
  const [sortField, setSortField] = useState<string>("startedAt")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")
  const [showFilters, setShowFilters] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(25)
  const [showColumnConfig, setShowColumnConfig] = useState(false)
  const [showAddColumn, setShowAddColumn] = useState(false)
  const [newColumnType, setNewColumnType] = useState<string>("")
  const [newColumnLabel, setNewColumnLabel] = useState("")

  // Enhanced column configuration with types
  const [columnConfig, setColumnConfig] = useState<Record<string, ColumnConfig>>({
    itemId: {
      id: "itemId",
      type: "text",
      label: "Item ID",
      visible: true,
      sortable: true,
      filterable: true,
      position: 0
    },
    status: {
      id: "status",
      type: "status",
      label: "Status",
      visible: true,
      sortable: true,
      filterable: true,
      position: 1,
      config: {
        options: [
          { value: "active", label: "Active", color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
          { value: "paused", label: "Paused", color: "bg-amber-50 text-amber-700 border-amber-200" },
          { value: "completed", label: "Completed", color: "bg-blue-50 text-blue-700 border-blue-200" },
          { value: "error", label: "Error", color: "bg-red-50 text-red-700 border-red-200" }
        ]
      }
    },
    workflow: {
      id: "workflow",
      type: "text",
      label: "Workflow",
      visible: true,
      sortable: true,
      filterable: true,
      position: 2
    },
    stage: {
      id: "stage",
      type: "text",
      label: "Stage",
      visible: true,
      sortable: false,
      filterable: true,
      position: 3
    },
    brand: {
      id: "brand",
      type: "text",
      label: "Brand",
      visible: true,
      sortable: true,
      filterable: true,
      position: 4
    },
    style: {
      id: "style",
      type: "text",
      label: "Style",
      visible: true,
      sortable: true,
      filterable: true,
      position: 5
    },
    startedAt: {
      id: "startedAt",
      type: "date",
      label: "Started",
      visible: true,
      sortable: true,
      filterable: true,
      position: 6
    },
    actions: {
      id: "actions",
      type: "actions",
      label: "Actions",
      visible: true,
      sortable: false,
      filterable: false,
      position: 7
    }
  })

  const items = useQuery(api.items.getAll) || []
  const workflows = useQuery(api.workflows.getAll) || []
  const router = useRouter()

  // Enhanced filtering and sorting
  const filteredAndSortedItems = useMemo(() => {
    let filtered = items.filter(item => {
      const matchesSearch =
        item.itemId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.metadata?.brand?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.metadata?.style?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.metadata?.sku?.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesStatus = statusFilter === "all" || item.status === statusFilter
      const matchesWorkflow = workflowFilter === "all" || item.workflowId === workflowFilter
      const matchesBrand = brandFilter === "all" || item.metadata?.brand === brandFilter

      return matchesSearch && matchesStatus && matchesWorkflow && matchesBrand
    })

    // Sorting
    filtered.sort((a, b) => {
      let aValue: any = a[sortField as keyof typeof a]
      let bValue: any = b[sortField as keyof typeof b]

      // Handle nested metadata fields
      if (sortField.startsWith('metadata.')) {
        const field = sortField.replace('metadata.', '')
        aValue = a.metadata?.[field] || ''
        bValue = b.metadata?.[field] || ''
      }

      if (typeof aValue === 'string') aValue = aValue.toLowerCase()
      if (typeof bValue === 'string') bValue = bValue.toLowerCase()

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
      return 0
    })

    return filtered
  }, [items, searchQuery, statusFilter, workflowFilter, brandFilter, sortField, sortDirection])

  const getWorkflowName = (workflowId: string) => {
    const workflow = workflows.find(w => w._id === workflowId)
    return workflow?.name || "Unknown Workflow"
  }

  const getStageName = (workflowId: string, stageId: string) => {
    const workflow = workflows.find(w => w._id === workflowId)
    const stage = workflow?.stages?.find(s => s.id === stageId)
    return stage?.name || "Unknown Stage"
  }

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "active":
        return {
          label: "Active",
          color: "bg-emerald-50 text-emerald-700 border-emerald-200",
          icon: CheckCircle,
          dotColor: "bg-emerald-500"
        }
      case "paused":
        return {
          label: "Paused",
          color: "bg-amber-50 text-amber-700 border-amber-200",
          icon: Clock,
          dotColor: "bg-amber-500"
        }
      case "completed":
        return {
          label: "Completed",
          color: "bg-blue-50 text-blue-700 border-blue-200",
          icon: CheckCircle,
          dotColor: "bg-blue-500"
        }
      case "error":
        return {
          label: "Error",
          color: "bg-red-50 text-red-700 border-red-200",
          icon: AlertCircle,
          dotColor: "bg-red-500"
        }
      default:
        return {
          label: "Unknown",
          color: "bg-gray-50 text-gray-700 border-gray-200",
          icon: XCircle,
          dotColor: "bg-gray-500"
        }
    }
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const formatRelativeTime = (timestamp: number) => {
    const now = Date.now()
    const diff = now - timestamp
    const minutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (days > 0) return `${days}d ago`
    if (hours > 0) return `${hours}h ago`
    if (minutes > 0) return `${minutes}m ago`
    return "Just now"
  }

  const getUniqueBrands = () => {
    const brands = new Set<string>()
    items.forEach(item => {
      if (item.metadata?.brand) {
        brands.add(item.metadata.brand)
      }
    })
    return Array.from(brands)
  }

  const getUniqueWorkflows = () => {
    return workflows.map(w => ({ id: w._id, name: w.name }))
  }

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const SortIcon = ({ field }: { field: string }) => {
    if (sortField !== field) return <ChevronDown className="w-4 h-4 text-gray-400" />
    return sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
  }

  // Pagination calculations
  const totalPages = Math.ceil(filteredAndSortedItems.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedItems = filteredAndSortedItems.slice(startIndex, endIndex)

  // Reset to first page when filters change
  React.useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, statusFilter, workflowFilter, brandFilter])

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const updateColumnConfig = (columnId: string, updates: Partial<ColumnConfig>) => {
    setColumnConfig(prev => ({
      ...prev,
      [columnId]: { ...prev[columnId], ...updates }
    }))
  }

  const getVisibleColumns = () => {
    return Object.values(columnConfig)
      .filter(config => config.visible)
      .sort((a, b) => a.position - b.position)
  }

  const addNewColumn = () => {
    if (!newColumnType || !newColumnLabel) return

    const columnType = COLUMN_TYPES.find(t => t.id === newColumnType)
    if (!columnType) return

    const newColumnId = `custom_${Date.now()}`
    const maxPosition = Math.max(...Object.values(columnConfig).map(c => c.position))

    const newColumn: ColumnConfig = {
      id: newColumnId,
      type: newColumnType,
      label: newColumnLabel,
      visible: true,
      sortable: columnType.sortable,
      filterable: columnType.filterable,
      position: maxPosition + 1,
      config: {}
    }

    setColumnConfig(prev => ({
      ...prev,
      [newColumnId]: newColumn
    }))

    setNewColumnType("")
    setNewColumnLabel("")
    setShowAddColumn(false)
  }

  const removeColumn = (columnId: string) => {
    if (columnId === "actions") return // Don't allow removing actions column

    setColumnConfig(prev => {
      const newConfig = { ...prev }
      delete newConfig[columnId]
      return newConfig
    })
  }

  const getColumnTypeIcon = (type: string) => {
    const columnType = COLUMN_TYPES.find(t => t.id === type)
    return columnType?.icon || FileText
  }

  const getColumnTypeColor = (type: string) => {
    const columnType = COLUMN_TYPES.find(t => t.id === type)
    return columnType?.color || "bg-gray-100 text-gray-700"
  }

  return (
    <div className="space-y-6">
      {/* Enhanced Filters */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-6">
          <div className="space-y-4">
            {/* Search and Quick Filters */}
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex-1 max-w-md">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Search items by ID, brand, style, SKU..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 h-11"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2"
                >
                  <Filter className="w-4 h-4" />
                  Filters
                  {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </Button>

                <Dialog open={showColumnConfig} onOpenChange={setShowColumnConfig}>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2"
                    >
                      <Columns className="w-4 h-4" />
                      Columns
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                        <Columns className="w-5 h-5" />
                        Configure Table Columns
                      </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-600">
                          Customize which columns are visible and their configuration.
                        </p>
                        <Button
                          onClick={() => setShowAddColumn(true)}
                          size="sm"
                          className="flex items-center gap-2"
                        >
                          <PlusCircle className="w-4 h-4" />
                          Add Column
                        </Button>
                      </div>

                      {/* Add New Column Section */}
                      {showAddColumn && (
                        <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-medium">Add New Column</h3>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setShowAddColumn(false)}
                              className="h-6 w-6 p-0"
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </div>
                          <div className="space-y-4">
                            <div>
                              <Label>Column Type</Label>
                              <Select value={newColumnType} onValueChange={setNewColumnType}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select column type" />
                                </SelectTrigger>
                                <SelectContent>
                                  {COLUMN_TYPES.map(type => {
                                    const Icon = type.icon
                                    return (
                                      <SelectItem key={type.id} value={type.id}>
                                        <div className="flex items-center gap-2">
                                          <Icon className="w-4 h-4" />
                                          <span>{type.name}</span>
                                        </div>
                                      </SelectItem>
                                    )
                                  })}
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label>Column Label</Label>
                              <Input
                                value={newColumnLabel}
                                onChange={(e) => setNewColumnLabel(e.target.value)}
                                placeholder="Enter column name"
                              />
                            </div>
                            <div className="flex justify-end gap-2">
                              <Button variant="outline" onClick={() => setShowAddColumn(false)}>
                                Cancel
                              </Button>
                              <Button onClick={addNewColumn} disabled={!newColumnType || !newColumnLabel}>
                                Add Column
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Column Configuration Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {Object.values(columnConfig).map((config) => {
                          const Icon = getColumnTypeIcon(config.type)
                          const typeColor = getColumnTypeColor(config.type)
                          const columnType = COLUMN_TYPES.find(t => t.id === config.type)

                          return (
                            <div key={config.id} className="border border-gray-200 rounded-lg p-4 bg-white">
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-2">
                                  <div className={`p-1 rounded ${typeColor}`}>
                                    <Icon className="w-4 h-4" />
                                  </div>
                                  <div>
                                    <div className="text-sm font-medium text-gray-900">{config.label}</div>
                                    <div className="text-xs text-gray-500">{columnType?.name}</div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Switch
                                    checked={config.visible}
                                    onCheckedChange={(checked) => updateColumnConfig(config.id, { visible: checked })}
                                  />
                                  {config.id !== "actions" && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => removeColumn(config.id)}
                                      className="h-6 w-6 p-0 text-gray-400 hover:text-red-500"
                                    >
                                      <X className="w-3 h-3" />
                                    </Button>
                                  )}
                                </div>
                              </div>

                              {config.visible && (
                                <div className="space-y-2">
                                  <Input
                                    value={config.label}
                                    onChange={(e) => updateColumnConfig(config.id, { label: e.target.value })}
                                    className="text-sm"
                                    placeholder="Column label"
                                  />
                                  <div className="flex items-center gap-4 text-xs text-gray-500">
                                    {config.sortable && <span>Sortable</span>}
                                    {config.filterable && <span>Filterable</span>}
                                  </div>
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>

                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {filteredAndSortedItems.length} items
                  </Badge>
                </div>
              </div>

              {/* Advanced Filters */}
              {showFilters && (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3 pt-4 border-t">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Status</label>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none"
                    >
                      <option value="all">All Statuses</option>
                      <option value="active">Active</option>
                      <option value="paused">Paused</option>
                      <option value="completed">Completed</option>
                      <option value="error">Error</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Workflow</label>
                    <select
                      value={workflowFilter}
                      onChange={(e) => setWorkflowFilter(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none"
                    >
                      <option value="all">All Workflows</option>
                      {getUniqueWorkflows().map(workflow => (
                        <option key={workflow.id} value={workflow.id}>
                          {workflow.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Brand</label>
                    <select
                      value={brandFilter}
                      onChange={(e) => setBrandFilter(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none"
                    >
                      <option value="all">All Brands</option>
                      {getUniqueBrands().map(brand => (
                        <option key={brand} value={brand}>
                          {brand}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </div>
          </div>
          </CardContent>
        </Card>

      {/* Items Table */}
      {filteredAndSortedItems.length === 0 ? (
        <Card className="border-0 shadow-sm">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Package className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No items found</h3>
            <p className="text-gray-600 text-center mb-6 max-w-md">
              {searchQuery || statusFilter !== "all" || workflowFilter !== "all" || brandFilter !== "all"
                ? "Try adjusting your filters to see more items."
                : "Get started by creating your first production item."}
            </p>
            <Button onClick={() => router.push("/app/items/new")}>
              <Plus className="w-4 h-4 mr-2" />
              Create Item
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-0 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {getVisibleColumns().map((config) => (
                    <th key={config.id} className="px-6 py-4 text-left">
                      {config.sortable ? (
                        <button
                          onClick={() => handleSort(config.id)}
                          className="flex items-center gap-2 text-sm font-semibold text-gray-900 hover:text-gray-700 transition-colors"
                        >
                          {config.label}
                          <SortIcon field={config.id} />
                        </button>
                      ) : (
                        <span className="text-sm font-semibold text-gray-900">{config.label}</span>
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {paginatedItems.map((item) => {
                  const statusConfig = getStatusConfig(item.status)
                  const workflowName = getWorkflowName(item.workflowId)
                  const stageName = getStageName(item.workflowId, item.currentStageId)

                  return (
                    <tr key={item._id} className="hover:bg-gray-50 transition-colors">
                      {getVisibleColumns().map((config) => {
                        switch (config.id) {
                          case 'itemId':
                            return (
                              <td key={config.id} className="px-6 py-4">
                                <div className="flex items-center">
                                  <div className="flex-shrink-0">
                                    <Package className="w-5 h-5 text-gray-400" />
                                  </div>
                                  <div className="ml-3">
                                    <div className="text-sm font-medium text-gray-900 font-mono">
                                      {item.itemId}
                                    </div>
                                  </div>
                                </div>
                              </td>
                            )

                          case 'status':
                            return (
                              <td key={config.id} className="px-6 py-4">
                                <Badge className={`${statusConfig.color} border`}>
                                  <div className={`w-2 h-2 rounded-full ${statusConfig.dotColor} mr-2`} />
                                  {statusConfig.label}
                                </Badge>
                              </td>
                            )

                          case 'workflow':
                            return (
                              <td key={config.id} className="px-6 py-4">
                                <div className="text-sm text-gray-900 font-medium">
                                  {workflowName}
                                </div>
                              </td>
                            )

                          case 'stage':
                            return (
                              <td key={config.id} className="px-6 py-4">
                                <div className="text-sm text-gray-600">
                                  {stageName}
                                </div>
                              </td>
                            )

                          case 'brand':
                            return (
                              <td key={config.id} className="px-6 py-4">
                                <div className="text-sm text-gray-900">
                                  {item.metadata?.brand || "-"}
                                </div>
                              </td>
                            )

                          case 'style':
                            return (
                              <td key={config.id} className="px-6 py-4">
                                <div className="text-sm text-gray-900">
                                  {item.metadata?.style || "-"}
                                </div>
                              </td>
                            )

                          case 'startedAt':
                            return (
                              <td key={config.id} className="px-6 py-4">
                                <div className="text-sm text-gray-900">
                                  {formatDate(item.startedAt)}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {formatRelativeTime(item.startedAt)}
                                </div>
                              </td>
                            )

                          case 'actions':
                            return (
                              <td key={config.id} className="px-6 py-4">
                                <div className="flex items-center gap-2">
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => router.push(`/app/items/${item._id}`)}
                                    className="h-8 w-8 p-0"
                                  >
                                    <Eye className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => router.push(`/app/items/${item._id}/edit`)}
                                    className="h-8 w-8 p-0"
                                  >
                                    <Edit3 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </td>
                            )

                          default:
                            // Handle custom columns
                            if (config.type === 'text' || config.type === 'number') {
                              return (
                                <td key={config.id} className="px-6 py-4">
                                  <div className="text-sm text-gray-900">
                                    {item.metadata?.[config.id] || "-"}
                                  </div>
                                </td>
                              )
                            }

                            return <td key={config.id} className="px-6 py-4">-</td>
                        }
                      })}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <span>
                  Showing {startIndex + 1} to {Math.min(endIndex, filteredAndSortedItems.length)} of {filteredAndSortedItems.length} items
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="h-8 w-8 p-0"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum: number
                    if (totalPages <= 5) {
                      pageNum = i + 1
                    } else if (currentPage <= 3) {
                      pageNum = i + 1
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i
                    } else {
                      pageNum = currentPage - 2 + i
                    }

                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? "default" : "outline"}
                        size="sm"
                        onClick={() => handlePageChange(pageNum)}
                        className="h-8 w-8 p-0 text-sm"
                      >
                        {pageNum}
                      </Button>
                    )
                  })}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="h-8 w-8 p-0"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </Card>
      )}
    </div>
  )
}
