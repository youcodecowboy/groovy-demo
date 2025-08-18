"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Plus, 
  Search, 
  Filter,
  Calendar,
  Building2,
  Download,
  Upload
} from "lucide-react"
import { useRouter } from "next/navigation"

interface OrdersHeaderProps {
  activeTab: string
  onTabChange: (tab: string) => void
  searchQuery: string
  onSearchChange: (query: string) => void
  statusFilter: string
  onStatusFilterChange: (status: string) => void
  brandFilter: string
  onBrandFilterChange: (brand: string) => void
  factoryFilter: string
  onFactoryFilterChange: (factory: string) => void
  dateRange: { from: string; to: string }
  onDateRangeChange: (range: { from: string; to: string }) => void
  brands: Array<{ _id: string; name: string }>
  factories: Array<{ _id: string; name: string }>
  viewMode: "table" | "cards" | "kanban"
  onViewModeChange: (mode: "table" | "cards" | "kanban") => void
}

export default function OrdersHeader({
  activeTab,
  onTabChange,
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  brandFilter,
  onBrandFilterChange,
  factoryFilter,
  onFactoryFilterChange,
  dateRange,
  onDateRangeChange,
  brands,
  factories,
  viewMode,
  onViewModeChange,
}: OrdersHeaderProps) {
  const router = useRouter()

  const handleNewOrder = () => {
    router.push("/app/orders/new")
  }

  const handleImportOrders = () => {
    router.push("/app/orders/import")
  }

  return (
    <div className="space-y-6">
      {/* Main Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Production Orders</h1>
          <p className="text-gray-600 italic">Manage orders, track progress, and monitor financials</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={handleImportOrders}
            className="h-10 rounded-full border border-black bg-white px-5 text-black hover:bg-black hover:text-white"
          >
            <Upload className="mr-2 h-4 w-4" />
            Import
          </Button>
          <Button 
            onClick={handleNewOrder}
            className="h-10 rounded-full border border-black bg-black px-5 text-white hover:bg-white hover:text-black"
          >
            <Plus className="mr-2 h-4 w-4" />
            New Order
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="inbox">Inbox</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="all">All Orders</TabsTrigger>
          <TabsTrigger value="import">Import</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-6">
            {/* Search */}
            <div className="lg:col-span-2">
              <label className="text-sm font-medium text-gray-700">Search</label>
              <div className="relative mt-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search orders..."
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <label className="text-sm font-medium text-gray-700">Status</label>
              <Select value={statusFilter} onValueChange={onStatusFilterChange}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="accepted">Accepted</SelectItem>
                  <SelectItem value="in_production">In Production</SelectItem>
                  <SelectItem value="paused">Paused</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Brand Filter */}
            <div>
              <label className="text-sm font-medium text-gray-700">Brand</label>
              <Select value={brandFilter} onValueChange={onBrandFilterChange}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="All Brands" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Brands</SelectItem>
                  {brands.map(brand => (
                    <SelectItem key={brand._id} value={brand._id}>
                      {brand.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Factory Filter */}
            <div>
              <label className="text-sm font-medium text-gray-700">Factory</label>
              <Select value={factoryFilter} onValueChange={onFactoryFilterChange}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="All Factories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Factories</SelectItem>
                  {factories.map(factory => (
                    <SelectItem key={factory._id} value={factory._id}>
                      {factory.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Date Range */}
            <div>
              <label className="text-sm font-medium text-gray-700">Date Range</label>
              <div className="mt-1 flex gap-2">
                <Input
                  type="date"
                  value={dateRange.from}
                  onChange={(e) => onDateRangeChange({ ...dateRange, from: e.target.value })}
                  className="text-sm"
                />
                <Input
                  type="date"
                  value={dateRange.to}
                  onChange={(e) => onDateRangeChange({ ...dateRange, to: e.target.value })}
                  className="text-sm"
                />
              </div>
            </div>
          </div>

          {/* View Mode Toggle */}
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700">View:</span>
              <div className="flex rounded-md border border-gray-300">
                <button
                  onClick={() => onViewModeChange("table")}
                  className={`px-3 py-1 text-sm ${
                    viewMode === "table"
                      ? "bg-black text-white"
                      : "bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  Table
                </button>
                <button
                  onClick={() => onViewModeChange("cards")}
                  className={`px-3 py-1 text-sm ${
                    viewMode === "cards"
                      ? "bg-black text-white"
                      : "bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  Cards
                </button>
                <button
                  onClick={() => onViewModeChange("kanban")}
                  className={`px-3 py-1 text-sm ${
                    viewMode === "kanban"
                      ? "bg-black text-white"
                      : "bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  Kanban
                </button>
              </div>
            </div>

            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
