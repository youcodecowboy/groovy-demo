"use client"

import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { 
  Search, 
  Filter,
  SortAsc,
  SortDesc,
  Edit3, 
  Eye, 
  Trash2, 
  Play, 
  Pause,
  Clock,
  Users,
  Settings,
  Workflow,
  Plus
} from "lucide-react"

interface WorkflowLibraryProps {
  onEditWorkflow: (workflowId: string) => void
}

export function WorkflowLibrary({ onEditWorkflow }: WorkflowLibraryProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Workflow Library</h2>
          <p className="text-gray-600 mt-1">Manage your saved workflows</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center gap-4">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search workflows..."
              className="pl-10"
            />
          </div>
        </div>
        <Button variant="outline" className="border-gray-300">
          <Filter className="w-4 h-4 mr-2" />
          Filter
        </Button>
        <Button variant="outline" className="border-gray-300">
          <SortAsc className="w-4 h-4 mr-2" />
          Sort
        </Button>
      </div>

      {/* Placeholder Content */}
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Workflow className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Workflows Yet</h3>
        <p className="text-gray-600 mb-6">
          Create your first workflow to get started
        </p>
        <Button
          onClick={() => onEditWorkflow("new")}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Workflow
        </Button>
      </div>
    </div>
  )
}
