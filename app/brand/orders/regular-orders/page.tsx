'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Package, Plus } from "lucide-react"
import Link from "next/link"

export default function BrandRegularOrdersPage() {
  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Regular Orders</h1>
          <p className="text-gray-600">Manage your regular customer orders</p>
        </div>
        <Button asChild className="bg-black hover:bg-gray-800">
          <Link href="/brand/orders/new">
            <Plus className="w-4 h-4 mr-2" />
            Create Order
          </Link>
        </Button>
      </div>

      <Card>
        <CardContent className="p-12 text-center">
          <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Regular Orders</h3>
          <p className="text-gray-600 mb-4">Create your first regular order to get started</p>
          <Button asChild className="bg-black hover:bg-gray-800">
            <Link href="/brand/orders/new">
              <Plus className="w-4 h-4 mr-2" />
              Create First Order
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
