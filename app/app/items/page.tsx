"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Plus, 
  RefreshCw, 
  AlertTriangle, 
  Flag, 
  CheckCircle, 
  Clock, 
  XCircle,
  Package,
  Eye,
  Filter
} from "lucide-react"
import { useRouter } from "next/navigation"
import ItemsTable from "@/components/items/items-table"

export default function ItemsPage() {
  const router = useRouter()
  const [activeView, setActiveView] = useState("all")

  // Status-based view configurations
  const viewConfigs = [
    {
      id: "all",
      label: "All Items",
      icon: Package,
      color: "bg-gray-100 text-gray-700",
      description: "View all production items"
    },
    {
      id: "active",
      label: "Active",
      icon: CheckCircle,
      color: "bg-emerald-100 text-emerald-700",
      description: "Items currently in production"
    },
    {
      id: "flagged",
      label: "Flagged",
      icon: Flag,
      color: "bg-orange-100 text-orange-700",
      description: "Items flagged for attention"
    },
    {
      id: "defective",
      label: "Defective",
      icon: AlertTriangle,
      color: "bg-red-100 text-red-700",
      description: "Items marked as defective"
    },
    {
      id: "paused",
      label: "Paused",
      icon: Clock,
      color: "bg-amber-100 text-amber-700",
      description: "Items temporarily paused"
    },
    {
      id: "completed",
      label: "Completed",
      icon: CheckCircle,
      color: "bg-blue-100 text-blue-700",
      description: "Successfully completed items"
    }
  ]

  return (
    <div className="space-y-6">
      {/* Enhanced Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Items</h1>
            <p className="text-gray-600">Manage production items with comprehensive status tracking</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Button onClick={() => router.push("/app/items/new")}>
              <Plus className="w-4 h-4 mr-2" />
              New Item
            </Button>
          </div>
        </div>

        {/* Quick Status Overview */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
          {viewConfigs.map((view) => (
            <button
              key={view.id}
              onClick={() => setActiveView(view.id)}
              className={`
                p-3 rounded-lg border-2 transition-all duration-200 text-left
                ${activeView === view.id 
                  ? 'border-black bg-black text-white' 
                  : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                }
              `}
            >
              <div className="flex items-center gap-2 mb-1">
                <view.icon className={`w-4 h-4 ${activeView === view.id ? 'text-white' : view.color.split(' ')[1]}`} />
                <span className="text-sm font-medium">
                  {view.label}
                </span>
              </div>
              <p className={`text-xs ${activeView === view.id ? 'text-gray-200' : 'text-gray-500'}`}>
                {view.description}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Status-Based Content */}
      <Tabs value={activeView} onValueChange={setActiveView} className="w-full">
        <TabsList className="hidden">
          {viewConfigs.map((view) => (
            <TabsTrigger key={view.id} value={view.id}>
              {view.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {viewConfigs.map((view) => (
          <TabsContent key={view.id} value={view.id} className="space-y-4">
            {/* View Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${view.color}`}>
                  <view.icon className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">{view.label}</h2>
                  <p className="text-sm text-gray-600">{view.description}</p>
                </div>
              </div>
              
              {/* View-specific actions */}
              {view.id === "flagged" && (
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                    <Flag className="w-3 h-3 mr-1" />
                    Requires Attention
                  </Badge>
                </div>
              )}
              
              {view.id === "defective" && (
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                    <AlertTriangle className="w-3 h-3 mr-1" />
                    Quality Issue
                  </Badge>
                </div>
              )}
            </div>

            {/* Items Table with Status Filter */}
            <ItemsTable 
              statusFilter={view.id === "all" ? "all" : view.id}
              showStatusFilter={false}
              showQuickActions={true}
            />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
