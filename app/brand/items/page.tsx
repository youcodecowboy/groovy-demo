import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    Package,
    Search,
    Filter,
    Clock,
    CheckCircle,
    AlertCircle,
    Eye,
    MapPin
} from "lucide-react"
import { BrandHeader } from "@/components/brand/brand-header"

export default function BrandItems() {
  return (
    <div className="min-h-screen bg-gray-50">
      <BrandHeader />
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Production Tracking</h1>
          <p className="text-gray-600">Monitor your items as they move through production stages</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Items</p>
                  <p className="text-2xl font-bold text-gray-900">47</p>
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
                    <p className="text-sm font-medium text-gray-600">In Production</p>
                    <p className="text-2xl font-bold text-gray-900">32</p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-yellow-100">
                    <Clock className="h-6 w-6 text-yellow-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

                      <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Completed</p>
                    <p className="text-2xl font-bold text-gray-900">12</p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

                      <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Issues</p>
                    <p className="text-2xl font-bold text-gray-900">3</p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-red-100">
                    <AlertCircle className="h-6 w-6 text-red-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  placeholder="Search items by SKU, order, or status..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>
              <Button variant="outline">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Items List */}
        <div className="space-y-4">
          {/* Item 1 */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div>
                    <h3 className="font-semibold text-lg">SKU-123-001</h3>
                    <p className="text-sm text-gray-600">PO-2024-001 • Factory A</p>
                    <p className="text-xs text-gray-500">Created: Dec 1, 2024 • Last Updated: 2 hours ago</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                      Stage 3
                    </Badge>
                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                      <Clock className="w-3 h-3 mr-1" />
                      In Progress
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <Eye className="w-4 h-4 mr-1" />
                    Track
                  </Button>
                  <Button variant="outline" size="sm">
                    <MapPin className="w-4 h-4 mr-1" />
                    Location
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Item 2 */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div>
                    <h3 className="font-semibold text-lg">SKU-123-002</h3>
                    <p className="text-sm text-gray-600">PO-2024-001 • Factory A</p>
                    <p className="text-xs text-gray-500">Created: Dec 1, 2024 • Last Updated: 4 hours ago</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      Stage 5
                    </Badge>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Completed
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <Eye className="w-4 h-4 mr-1" />
                    View Details
                  </Button>
                  <Button variant="outline" size="sm">
                    Download Report
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Item 3 */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div>
                    <h3 className="font-semibold text-lg">SKU-456-001</h3>
                    <p className="text-sm text-gray-600">PO-2024-002 • Factory B</p>
                    <p className="text-xs text-gray-500">Created: Nov 25, 2024 • Last Updated: 1 day ago</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                      Stage 2
                    </Badge>
                    <Badge variant="secondary" className="bg-red-100 text-red-800">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      Issue Detected
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <Eye className="w-4 h-4 mr-1" />
                    Track
                  </Button>
                  <Button variant="outline" size="sm">
                    Message Factory
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Item 4 */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div>
                    <h3 className="font-semibold text-lg">SKU-789-001</h3>
                    <p className="text-sm text-gray-600">PO-2024-003 • Factory C</p>
                    <p className="text-xs text-gray-500">Created: Dec 12, 2024 • Last Updated: 6 hours ago</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="bg-gray-100 text-gray-800">
                      Stage 1
                    </Badge>
                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                      <Clock className="w-3 h-3 mr-1" />
                      Pending
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <Eye className="w-4 h-4 mr-1" />
                    Track
                  </Button>
                  <Button variant="outline" size="sm">
                    <MapPin className="w-4 h-4 mr-1" />
                    Location
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 