import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    Building2,
    Package,
    MessageSquare,
    TrendingUp,
    MapPin,
    Phone,
    Mail,
    Users,
    Clock,
    CheckCircle
} from "lucide-react"
import { BrandHeader } from "@/components/brand/brand-header"

export default function BrandFactories() {
  return (
    <div className="min-h-screen bg-gray-50">
      <BrandHeader />
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Factory Network</h1>
          <p className="text-gray-600">Manage your production partnerships and factory relationships</p>
        </div>

        {/* Network Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Connected Factories</p>
                    <p className="text-2xl font-bold text-gray-900">3</p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                    <Building2 className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

                      <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Orders</p>
                    <p className="text-2xl font-bold text-gray-900">12</p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
                    <Package className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

                      <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Avg. Completion Time</p>
                    <p className="text-2xl font-bold text-gray-900">8.5 days</p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100">
                    <TrendingUp className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
        </div>

        {/* Factories List */}
        <div className="space-y-6">
          {/* Factory A */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Building2 className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold">Factory A</h3>
                      <p className="text-sm text-gray-600">Premium Manufacturing Partner</p>
                      <div className="flex items-center gap-4 mt-2">
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          <MapPin className="w-4 h-4" />
                          <span>Detroit, MI</span>
                        </div>
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          <Users className="w-4 h-4" />
                          <span>150 employees</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Active Orders</p>
                      <p className="text-lg font-semibold">5</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Items in Production</p>
                      <p className="text-lg font-semibold">23</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Completion Rate</p>
                      <p className="text-lg font-semibold text-green-600">98%</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <Button variant="outline" size="sm">
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Send Message
                    </Button>
                    <Button variant="outline" size="sm">
                      <Phone className="w-4 h-4 mr-2" />
                      Call
                    </Button>
                    <Button variant="outline" size="sm">
                      <Mail className="w-4 h-4 mr-2" />
                      Email
                    </Button>
                  </div>
                </div>

                <div className="text-right">
                  <Badge variant="secondary" className="bg-green-100 text-green-800 mb-2">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Active Partner
                  </Badge>
                  <p className="text-sm text-gray-500">Partnership since Jan 2023</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Factory B */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <Building2 className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold">Factory B</h3>
                      <p className="text-sm text-gray-600">Specialized Electronics</p>
                      <div className="flex items-center gap-4 mt-2">
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          <MapPin className="w-4 h-4" />
                          <span>Austin, TX</span>
                        </div>
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          <Users className="w-4 h-4" />
                          <span>75 employees</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Active Orders</p>
                      <p className="text-lg font-semibold">3</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Items in Production</p>
                      <p className="text-lg font-semibold">12</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Completion Rate</p>
                      <p className="text-lg font-semibold text-green-600">95%</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <Button variant="outline" size="sm">
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Send Message
                    </Button>
                    <Button variant="outline" size="sm">
                      <Phone className="w-4 h-4 mr-2" />
                      Call
                    </Button>
                    <Button variant="outline" size="sm">
                      <Mail className="w-4 h-4 mr-2" />
                      Email
                    </Button>
                  </div>
                </div>

                <div className="text-right">
                  <Badge variant="secondary" className="bg-green-100 text-green-800 mb-2">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Active Partner
                  </Badge>
                  <p className="text-sm text-gray-500">Partnership since Mar 2023</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Factory C */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Building2 className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold">Factory C</h3>
                      <p className="text-sm text-gray-600">Textile & Apparel</p>
                      <div className="flex items-center gap-4 mt-2">
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          <MapPin className="w-4 h-4" />
                          <span>Los Angeles, CA</span>
                        </div>
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          <Users className="w-4 h-4" />
                          <span>200 employees</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Active Orders</p>
                      <p className="text-lg font-semibold">4</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Items in Production</p>
                      <p className="text-lg font-semibold">18</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Completion Rate</p>
                      <p className="text-lg font-semibold text-yellow-600">92%</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <Button variant="outline" size="sm">
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Send Message
                    </Button>
                    <Button variant="outline" size="sm">
                      <Phone className="w-4 h-4 mr-2" />
                      Call
                    </Button>
                    <Button variant="outline" size="sm">
                      <Mail className="w-4 h-4 mr-2" />
                      Email
                    </Button>
                  </div>
                </div>

                <div className="text-right">
                  <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 mb-2">
                    <Clock className="w-3 h-3 mr-1" />
                    New Partner
                  </Badge>
                  <p className="text-sm text-gray-500">Partnership since Nov 2024</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 