"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    Building2,
    Package,
    MessageSquare,
    TrendingUp,
    Clock,
    CheckCircle,
    AlertCircle,
    Plus,
    Search,
    Filter
} from "lucide-react"
import { BrandHeader } from "@/components/brand/brand-header"
import { useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { useToast } from "@/hooks/use-toast"

export default function BrandDashboard() {
  const { toast } = useToast()
  const seedDemoData = useMutation(api.seed.seedDemoData)

  const handleSeedData = async () => {
    try {
      await seedDemoData()
      toast({
        title: "Success",
        description: "Demo data created successfully with brands and factories",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create demo data",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <BrandHeader />
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Brand Dashboard</h1>
            <p className="text-gray-600">Monitor your production orders and factory network</p>
          </div>
          <Button onClick={handleSeedData} variant="outline" size="sm">
            Seed Demo Data
          </Button>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Orders</p>
                  <p className="text-2xl font-bold text-gray-900">12</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                  <Package className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

                      <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Items in Production</p>
                    <p className="text-2xl font-bold text-gray-900">47</p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
                    <TrendingUp className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

                      <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Connected Factories</p>
                    <p className="text-2xl font-bold text-gray-900">3</p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100">
                    <Building2 className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

                      <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Unread Messages</p>
                    <p className="text-2xl font-bold text-gray-900">5</p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-orange-100">
                    <MessageSquare className="h-6 w-6 text-orange-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button className="w-full justify-start" variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Create New Purchase Order
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <MessageSquare className="w-4 h-4 mr-2" />
                Send Message to Factory
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Package className="w-4 h-4 mr-2" />
                View Production Report
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Order #PO-2024-001 completed</p>
                    <p className="text-xs text-gray-500">2 hours ago</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">New message from Factory A</p>
                    <p className="text-xs text-gray-500">4 hours ago</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Item SKU-123 moved to Stage 3</p>
                    <p className="text-xs text-gray-500">6 hours ago</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Active Orders Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Active Purchase Orders</CardTitle>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    placeholder="Search orders..."
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
                <Button variant="outline" size="sm">
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Sample Order Row */}
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div>
                    <p className="font-medium">PO-2024-001</p>
                    <p className="text-sm text-gray-500">Factory A • 50 items</p>
                  </div>
                  <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                    <Clock className="w-3 h-3 mr-1" />
                    In Production
                  </Badge>
                </div>
                <div className="text-right">
                  <p className="font-medium">$12,500</p>
                  <p className="text-sm text-gray-500">Due: Dec 15, 2024</p>
                </div>
                <Button variant="outline" size="sm">
                  View Details
                </Button>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div>
                    <p className="font-medium">PO-2024-002</p>
                    <p className="text-sm text-gray-500">Factory B • 25 items</p>
                  </div>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Completed
                  </Badge>
                </div>
                <div className="text-right">
                  <p className="font-medium">$8,200</p>
                  <p className="text-sm text-gray-500">Completed: Dec 10, 2024</p>
                </div>
                <Button variant="outline" size="sm">
                  View Details
                </Button>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div>
                    <p className="font-medium">PO-2024-003</p>
                    <p className="text-sm text-gray-500">Factory C • 100 items</p>
                  </div>
                  <Badge variant="secondary" className="bg-red-100 text-red-800">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    Pending Review
                  </Badge>
                </div>
                <div className="text-right">
                  <p className="font-medium">$25,000</p>
                  <p className="text-sm text-gray-500">Submitted: Dec 12, 2024</p>
                </div>
                <Button variant="outline" size="sm">
                  View Details
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 