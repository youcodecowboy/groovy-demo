"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Factory, Building2, ArrowRight } from "lucide-react"

export default function Page() {
  const router = useRouter()
  
  const handleFactoryAccess = () => {
    // Redirect to factory/app side
    router.push("/app")
  }

  const handleBrandAccess = () => {
    // Redirect to brand side
    router.push("/brand")
  }
  
  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6">
      <div className="w-full max-w-4xl space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Choose Your Interface</h1>
          <p className="text-gray-600 mt-2">Development mode - no authentication required</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Factory Side Option */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-blue-500" onClick={handleFactoryAccess}>
            <CardHeader className="text-center pb-4">
              <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <Factory className="w-8 h-8 text-blue-600" />
              </div>
              <CardTitle className="text-xl">Factory Side</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-gray-600">
                Access the factory management interface for production tracking, 
                quality control, and operational workflows.
              </p>
              <div className="space-y-2 text-sm text-gray-500">
                <div>• Production tracking & monitoring</div>
                <div>• Quality control workflows</div>
                <div>• Inventory management</div>
                <div>• Staff management</div>
              </div>
              <Button className="w-full bg-blue-600 hover:bg-blue-700">
                <span>Continue as Factory</span>
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>

          {/* Brand Side Option */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-purple-500" onClick={handleBrandAccess}>
            <CardHeader className="text-center pb-4">
              <div className="mx-auto w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                <Building2 className="w-8 h-8 text-purple-600" />
              </div>
              <CardTitle className="text-xl">Brand Side</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-gray-600">
                Access the brand management interface for order tracking, 
                supplier management, and brand oversight.
              </p>
              <div className="space-y-2 text-sm text-gray-500">
                <div>• Purchase order management</div>
                <div>• Factory relationship tracking</div>
                <div>• Production oversight</div>
                <div>• Brand analytics</div>
              </div>
              <Button className="w-full bg-purple-600 hover:bg-purple-700">
                <span>Continue as Brand</span>
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="text-center text-sm text-gray-500">
          <p>Both interfaces are fully functional with demo data</p>
        </div>
      </div>
    </div>
  )
}


