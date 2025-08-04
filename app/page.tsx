import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { Settings, Smartphone, Package, ArrowRight, Zap, BarChart3 } from "lucide-react"
import { AppHeader } from "@/components/layout/app-header"

export default function HomePage() {
  return (
    <>
      <AppHeader />
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30">
        <div className="container mx-auto px-6 py-20">
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Zap className="w-4 h-4" />
              Industrial Workflow OS
            </div>
            <h1 className="text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Welcome to <span className="text-blue-600">Groovy</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Transform your production workflows with our modern, intuitive platform. Design custom workflows, track
              items in real-time, and optimize your operations.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <Card className="group hover:shadow-2xl transition-all duration-500 border-0 shadow-lg hover:-translate-y-1">
              <CardHeader className="pb-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg group-hover:shadow-blue-500/25 transition-all duration-300">
                    <Settings className="w-7 h-7" />
                  </div>
                  <ArrowRight className="w-6 h-6 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-2 transition-all duration-300" />
                </div>
                <CardTitle className="text-2xl mb-3">Admin Dashboard</CardTitle>
                <CardDescription className="text-gray-600 text-base leading-relaxed">
                  Configure workflows, generate items, and monitor system status with comprehensive analytics and
                  real-time insights.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  asChild
                  className="w-full h-12 text-base bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg"
                >
                  <Link href="/admin">Open Dashboard</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-2xl transition-all duration-500 border-0 shadow-lg hover:-translate-y-1">
              <CardHeader className="pb-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-green-500 to-green-600 text-white shadow-lg group-hover:shadow-green-500/25 transition-all duration-300">
                    <Smartphone className="w-7 h-7" />
                  </div>
                  <ArrowRight className="w-6 h-6 text-gray-400 group-hover:text-green-600 group-hover:translate-x-2 transition-all duration-300" />
                </div>
                <CardTitle className="text-2xl mb-3">Factory Floor</CardTitle>
                <CardDescription className="text-gray-600 text-base leading-relaxed">
                  Scan QR codes and advance items through production stages with our mobile-optimized interface designed
                  for efficiency.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  asChild
                  className="w-full h-12 text-base bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 shadow-lg"
                >
                  <Link href="/floor">Open Floor App</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-2xl transition-all duration-500 border-0 shadow-lg hover:-translate-y-1">
              <CardHeader className="pb-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-lg group-hover:shadow-purple-500/25 transition-all duration-300">
                    <Package className="w-7 h-7" />
                  </div>
                  <ArrowRight className="w-6 h-6 text-gray-400 group-hover:text-purple-600 group-hover:translate-x-2 transition-all duration-300" />
                </div>
                <CardTitle className="text-2xl mb-3">Item Tracking</CardTitle>
                <CardDescription className="text-gray-600 text-base leading-relaxed">
                  View detailed item information and production history with complete audit trails and performance
                  metrics.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  asChild
                  variant="outline"
                  className="w-full h-12 text-base border-2 border-purple-200 hover:bg-purple-50 hover:border-purple-300 bg-transparent"
                >
                  <Link href="/admin">View Items</Link>
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="text-center mt-20">
            <div className="flex items-center justify-center gap-8 text-sm text-gray-500 mb-8">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Real-time Analytics
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4" />
                Modern Architecture
              </div>
              <div className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Fully Configurable
              </div>
            </div>
            <div className="flex justify-center gap-4">
              <Button asChild variant="outline" className="text-sm">
                <Link href="/test-users">👥 Create Test Users</Link>
              </Button>
              <Button asChild variant="outline" className="text-sm">
                <Link href="/test-suite">🧪 Test Suite</Link>
              </Button>
              <Button asChild variant="outline" className="text-sm">
                <Link href="/test-messaging">💬 Test Messaging</Link>
              </Button>
              <Button asChild variant="outline" className="text-sm">
                <Link href="/floor/messaging">🏭 Floor Messaging</Link>
              </Button>
              <Button asChild variant="outline" className="text-sm">
                <Link href="/test-backend">Test Backend</Link>
              </Button>
              <Button asChild variant="outline" className="text-sm">
                <Link href="/admin">🔧 Admin Panel</Link>
              </Button>
              <Button asChild variant="outline" className="text-sm">
                <Link href="/test-item-creation">Test Item Creation</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
