"use client"

import type React from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { useState } from "react"
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarProvider,
    SidebarInset,
    SidebarTrigger,
} from "@/components/ui/sidebar"
import { 
    Home, 
    MessageSquare, 
    FileText, 
    Factory,
    Users2, 
    BarChart3,
    CreditCard,
    Users,
    ShoppingBag,
    Package,
    Truck,
    Palette,
    Scissors,
    Bell,
    Settings,
    Search,
    TrendingUp,
    Calendar,
    FileCheck,
    Receipt,
    ShoppingCart,
    Plane,
    ClipboardList,
    QrCode,
    Barcode,
    Tag,
    Hash,
    Calculator,
    DollarSign,
    Clock,
    AlertTriangle,
    TrendingDown,
    PackageCheck,
    Percent,
    Zap,
    Cog,
    Leaf
} from "lucide-react"
import { SignedIn, UserButton } from "@/components/ui/mock-auth-components"
import { BrandHeaderBell } from "./brand-header-bell"

// Navigation organized by tabs with colors
const tabNavigation = {
  core: [
    { name: "Dashboard", href: "/brand/dashboard", icon: Home, exact: true, color: "text-blue-600" },
    { name: "Orders", href: "/brand/orders", icon: FileText, exact: false, color: "text-green-600" },
    { name: "Messaging", href: "/brand/messaging", icon: MessageSquare, exact: false, color: "text-purple-600" },
    { name: "Factories", href: "/brand/factories", icon: Factory, exact: false, color: "text-orange-600" },
    { name: "CRM", href: "/brand/crm", icon: Users2, exact: false, color: "text-indigo-600" },
    { name: "Reports", href: "/brand/reports", icon: BarChart3, exact: false, color: "text-emerald-600" },
    { name: "Usage & Billing", href: "/brand/billing", icon: CreditCard, exact: false, color: "text-red-600" },
    { name: "Team", href: "/brand/team", icon: Users, exact: false, color: "text-teal-600" },
  ],
  market: [
    { name: "Marketplace", href: "/brand/marketplace", icon: ShoppingBag, exact: false, color: "text-blue-600" },
    { name: "Sample Hub", href: "/brand/samples", icon: Package, exact: false, color: "text-green-600" },
    { name: "Logistics", href: "/brand/logistics", icon: Truck, exact: false, color: "text-orange-600" },
    { name: "Design Library", href: "/brand/design-library", icon: Palette, exact: false, color: "text-purple-600" },
    { name: "Fabric Library", href: "/brand/fabric-library", icon: Scissors, exact: false, color: "text-indigo-600" },
  ],
  utilities: [
    // Document Generators
    { name: "Invoice Generator", href: "/brand/invoice-generator", icon: Receipt, exact: false, color: "text-blue-600" },
    { name: "PO Generator", href: "/brand/po-generator", icon: ShoppingCart, exact: false, color: "text-green-600" },
    { name: "AWB Generator", href: "/brand/awb-generator", icon: Plane, exact: false, color: "text-cyan-600" },
    { name: "Packing List", href: "/brand/packing-list-generator", icon: ClipboardList, exact: false, color: "text-orange-600" },
    { name: "Compliance Docs", href: "/brand/compliance-templates", icon: FileCheck, exact: false, color: "text-purple-600" },
    
    // Label & QR Tools
    { name: "QR Generator", href: "/brand/qr-generator", icon: QrCode, exact: false, color: "text-indigo-600" },
    { name: "Barcode Generator", href: "/brand/barcode-generator", icon: Barcode, exact: false, color: "text-emerald-600" },
    { name: "Label Generator", href: "/brand/label-generator", icon: Tag, exact: false, color: "text-amber-600" },
    { name: "Batch Generator", href: "/brand/batch-generator", icon: Hash, exact: false, color: "text-slate-600" },
    
    // Brand Calculators
    { name: "Cost Estimator", href: "/brand/cost-estimator", icon: DollarSign, exact: false, color: "text-green-600" },
    { name: "Profit Calculator", href: "/brand/profit-calculator", icon: Calculator, exact: false, color: "text-emerald-600" },
    { name: "Lead Time Calculator", href: "/brand/lead-time-calculator", icon: Clock, exact: false, color: "text-orange-600" },
    { name: "Quality Metrics", href: "/brand/quality-metrics", icon: TrendingUp, exact: false, color: "text-blue-600" },
    
    // Placeholders for future brand tools
    { name: "Brand Analytics", href: "/brand/analytics", icon: BarChart3, exact: false, color: "text-purple-600" },
    { name: "Sustainability Tracker", href: "/brand/sustainability", icon: Leaf, exact: false, color: "text-green-600" },
  ]
}

interface BrandSidebarProps {
  children: React.ReactNode
}

export function BrandSidebar({ children }: BrandSidebarProps) {
  const pathname = usePathname()
  const [activeTab, setActiveTab] = useState<'core' | 'market' | 'utilities'>('core')

  const currentNavigation = tabNavigation[activeTab]

  return (
    <SidebarProvider defaultOpen>
      <Sidebar className="bg-[#F7F8FB] border-r-2 border-black w-64 !border-r-2 !border-black">
        <SidebarHeader className="border-b-2 border-black px-6 h-16 bg-white">
          <div className="flex items-center justify-between h-full">
            <Image src="/groovy-logo.png" alt="Groovy" width={150} height={45} className="h-10 w-auto" />
            <div className="text-xs text-gray-500 font-medium">BRAND</div>
          </div>
        </SidebarHeader>
        <SidebarContent className="px-4 py-0 flex flex-col h-full">
          {/* Tab Navigation - Full Width */}
          <div className="flex-shrink-0 -mx-4">
            <div className="flex bg-white border-b-2 border-black">
              {(['core', 'market', 'utilities'] as const).map((tab, index) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 px-3 py-2 text-xs font-semibold transition-colors ${
                    activeTab === tab
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                  } ${index > 0 ? 'border-l-2 border-black' : ''}`}
                >
                  {tab.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto min-h-0">
            <SidebarGroup className="mb-6 pt-4">
              <SidebarGroupContent>
                <SidebarMenu className="space-y-0">
                  {currentNavigation.map((item) => (
                    <SidebarMenuItem key={item.name}>
                      <SidebarMenuButton
                        asChild
                        isActive={item.exact ? pathname === item.href : pathname.startsWith(item.href)}
                        className="h-10 px-3 mx-1 rounded-md data-[active=true]:bg-white data-[active=true]:shadow-sm data-[active=true]:border-l-4 data-[active=true]:border-blue-600 hover:bg-white hover:border-l-4 hover:border-gray-300 transition-all duration-200"
                      >
                        <Link href={item.href} className="flex items-center gap-2">
                          <item.icon className={`h-5 w-5 ${item.color || 'text-gray-600'}`} />
                          <span className="text-sm font-semibold text-gray-800">{item.name}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </div>

          {/* Tab Description - Bottom Left */}
          <div className="mt-auto mb-4 flex-shrink-0">
            <div className="px-6">
              <p className="text-xs text-gray-600 italic text-left">
                {activeTab === 'core' && "Core brand management and operations"}
                {activeTab === 'market' && "Marketplace and library resources"}
                {activeTab === 'utilities' && "Document generators and calculators"}
              </p>
            </div>
          </div>

          <div className="border-t-2 border-black pt-4 flex-shrink-0 -mx-4">
            <SignedIn>
              <div className="px-2">
                <span className="text-sm text-gray-600 italic mb-2 block">Account</span>
                <UserButton />
              </div>
            </SignedIn>
          </div>
        </SidebarContent>
      </Sidebar>
      <SidebarInset className="flex-1">
        <header className="flex h-16 shrink-0 items-center gap-2 border-b-2 border-black bg-white px-8 md:px-10">
          <SidebarTrigger className="-ml-1" />
          <div className="flex-1" />
          <BrandHeaderBell />
        </header>
        <div className="p-8 md:p-10">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
