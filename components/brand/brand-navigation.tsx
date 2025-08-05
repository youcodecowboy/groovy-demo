"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Menu, Package, BarChart3, Home, MessageSquare, Building2, FileText } from "lucide-react"

const navigationItems = [
  {
    title: "Dashboard",
    href: "/brand/dashboard",
    icon: BarChart3,
    description: "Production overview and metrics",
  },
  {
    title: "Purchase Orders",
    href: "/brand/orders",
    icon: FileText,
    description: "Manage your production orders",
  },
  {
    title: "Production Tracking",
    href: "/brand/items",
    icon: Package,
    description: "Monitor items in production",
  },
  {
    title: "Factory Network",
    href: "/brand/factories",
    icon: Building2,
    description: "View connected factories",
  },
  {
    title: "Messaging",
    href: "/brand/messaging",
    icon: MessageSquare,
    description: "Communicate with factories",
  },
]

export function BrandNavigation() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
          <Menu className="w-5 h-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-80">
        <SheetHeader className="text-left">
          <SheetTitle className="flex items-center gap-2">
            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
              <Building2 className="w-4 h-4 text-white" />
            </div>
            Brand Interface
          </SheetTitle>
        </SheetHeader>

        <div className="mt-8 space-y-2">
          {navigationItems.map((item) => {
            const isActive = pathname === item.href
            const IconComponent = item.icon

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                  isActive ? "bg-gray-50 text-gray-900 border border-gray-200" : "hover:bg-gray-50 text-gray-700"
                }`}
              >
                <IconComponent className="w-5 h-5" />
                <div>
                  <div className="font-medium">{item.title}</div>
                  <div className="text-sm text-gray-500">{item.description}</div>
                </div>
              </Link>
            )
          })}

          <div className="border-t pt-4 mt-6">
            <Link
              href="/"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 text-gray-700 transition-colors"
            >
              <Home className="w-5 h-5" />
              <div>
                <div className="font-medium">Back to Home</div>
                <div className="text-sm text-gray-500">Return to main dashboard</div>
              </div>
            </Link>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
} 