"use client"

import type React from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { useState, useEffect } from "react"
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
import { Badge } from "@/components/ui/badge"
import { 
    Home, 
    Workflow, 
    MessageSquare, 
    Settings, 
    Package, 
    FileText, 
    Users, 
    Users2, 
    Zap, 
    Cog, 
    BarChart3,
    Calendar,
    Palette,
    Scissors,
    Truck,
    Warehouse,
    WashingMachine,
    Archive,
    Package2,
    Bell,
    Plus,
    Wrench,
    Database,
    Shield,
    QrCode,
    Barcode,
    Tag,
    Hash,
    Receipt,
    ShoppingCart,
    Plane,
    ClipboardList,
    FileCheck,
    Calculator,
    DollarSign,
    Clock,
    AlertTriangle,
    TrendingUp,
    PackageCheck,
    Percent
} from "lucide-react"
import { SignedIn, UserButton } from "@/components/ui/mock-auth-components"
import { FeatureManager } from "./feature-manager"
import { HeaderBell } from "@/components/notifications"

// Feature configuration mapping
const featureConfig = {
  "material-tracking": { name: "Material Tracking", icon: Package, href: "/app/material-tracking" },
  "capacity-planning": { name: "Capacity Planning", icon: Calendar, href: "/app/capacity-planning" },
  "sample-studio": { name: "Sample Studio", icon: Palette, href: "/app/sample-studio" },
  "pattern-making": { name: "Pattern Making", icon: Scissors, href: "/app/pattern-making" },
  "logistics-tracking": { name: "Logistics Tracking", icon: Truck, href: "/app/logistics-tracking" },
  "design": { name: "Design", icon: Palette, href: "/app/design" },
  "storage-tracking": { name: "Storage Tracking", icon: Warehouse, href: "/app/storage-tracking" },
  "subcontracting": { name: "Subcontracting", icon: Users, href: "/app/subcontracting" },
  "wash-management": { name: "Wash Management", icon: WashingMachine, href: "/app/wash-management" },
  "product-archive": { name: "Product Archive", icon: Archive, href: "/app/product-archive" }
}

// Navigation organized by tabs with colors
const tabNavigation = {
  core: [
    { name: "Home", href: "/app", icon: Home, exact: true, color: "text-blue-600" },
    { name: "Workflows", href: "/app/workflows", icon: Workflow, exact: false, color: "text-purple-600" },
    { name: "Items", href: "/app/items", icon: Package, exact: false, color: "text-green-600" },
    { name: "Materials", href: "/materials", icon: Package2, exact: false, color: "text-orange-600" },
    { name: "Teams", href: "/app/teams", icon: Users, exact: false, color: "text-indigo-600" },
    { name: "Customers", href: "/app/customers", icon: Users2, exact: false, color: "text-teal-600" },
    { name: "Orders", href: "/app/orders", icon: FileText, exact: false, color: "text-red-600" },
    { name: "Reports", href: "/app/reports", icon: BarChart3, exact: false, color: "text-emerald-600" },
    { name: "Messages", href: "/app/messages", icon: MessageSquare, exact: false, color: "text-cyan-600" },
    { name: "Usage & Billing", href: "/app/billing", icon: Settings, exact: false, color: "text-gray-600" },
  ],
  disco: [
    { name: "Floor App", href: "/disco", icon: Zap, exact: false, color: "text-yellow-600" },
    { name: "Configuration", href: "/disco/config", icon: Cog, exact: false, color: "text-slate-600" },
  ],
  utilities: [
    // Document Generators
    { name: "Invoice Generator", href: "/app/invoice-generator", icon: Receipt, exact: false, color: "text-blue-600" },
    { name: "PO Generator", href: "/app/po-generator", icon: ShoppingCart, exact: false, color: "text-green-600" },
    { name: "AWB Generator", href: "/app/awb-generator", icon: Plane, exact: false, color: "text-cyan-600" },
    { name: "Packing List", href: "/app/packing-list-generator", icon: ClipboardList, exact: false, color: "text-orange-600" },
    { name: "Compliance Docs", href: "/app/compliance-templates", icon: FileCheck, exact: false, color: "text-purple-600" },
    
    // Label & Inventory Tools
    { name: "QR Generator", href: "/app/qr-generator", icon: QrCode, exact: false, color: "text-indigo-600" },
    { name: "Barcode Generator", href: "/app/barcode-generator", icon: Barcode, exact: false, color: "text-emerald-600" },
    { name: "Label Generator", href: "/app/label-generator", icon: Tag, exact: false, color: "text-amber-600" },
    { name: "Batch Generator", href: "/app/batch-generator", icon: Hash, exact: false, color: "text-slate-600" },
    { name: "Inventory Labels", href: "/app/inventory-labels", icon: PackageCheck, exact: false, color: "text-teal-600" },
    
    // Calculators & Estimators
    { name: "Material Calculator", href: "/app/material-calculator", icon: Calculator, exact: false, color: "text-red-600" },
    { name: "Cost Estimator", href: "/app/cost-estimator", icon: DollarSign, exact: false, color: "text-green-600" },
    { name: "Stock Reconciliation", href: "/app/stock-reconciliation", icon: TrendingUp, exact: false, color: "text-blue-600" },
    { name: "Profit Calculator", href: "/app/profit-calculator", icon: Calculator, exact: false, color: "text-emerald-600" },
    { name: "On-Time Calculator", href: "/app/on-time-calculator", icon: Clock, exact: false, color: "text-orange-600" },
    { name: "Labor Estimator", href: "/app/labor-estimator", icon: Users, exact: false, color: "text-purple-600" },
    { name: "Defect Calculator", href: "/app/defect-calculator", icon: AlertTriangle, exact: false, color: "text-red-600" },
  ]
}

interface AppSidebarProps {
  children: React.ReactNode
}

export function AppSidebar({ children }: AppSidebarProps) {
  const pathname = usePathname()
  const [enabledFeatures, setEnabledFeatures] = useState<string[]>([])
  const [activeTab, setActiveTab] = useState<'core' | 'disco' | 'utilities'>('core')

  // Load enabled features from localStorage on mount and listen for changes
  useEffect(() => {
    const loadFeatures = () => {
      const saved = localStorage.getItem('groovy-enabled-features')
      if (saved) {
        try {
          setEnabledFeatures(JSON.parse(saved))
        } catch (e) {
          console.error('Failed to parse saved features:', e)
        }
      }
    }

    // Load initially
    loadFeatures()

    // Listen for storage changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'groovy-enabled-features') {
        loadFeatures()
      }
    }

    window.addEventListener('storage', handleStorageChange)
    
    // Also listen for custom events (for same-tab updates)
    const handleCustomStorageChange = () => {
      loadFeatures()
    }
    
    window.addEventListener('groovy-features-changed', handleCustomStorageChange)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('groovy-features-changed', handleCustomStorageChange)
    }
  }, [])

  const handleFeatureToggle = (featureId: string, enabled: boolean) => {
    console.log(`Feature ${featureId} ${enabled ? 'enabled' : 'disabled'}`)
    // Here you would typically make an API call to enable/disable the feature
  }

  // Generate dynamic feature navigation
  const generateFeatureNavigation = () => {
    const featureItems = enabledFeatures
      .filter(featureId => featureConfig[featureId as keyof typeof featureConfig])
      .map(featureId => {
        const config = featureConfig[featureId as keyof typeof featureConfig]
        return {
          name: config.name,
          href: config.href,
          icon: config.icon,
          exact: false,
          isFeature: true,
          featureId,
          color: "text-blue-600"
        }
      })

    return featureItems
  }

  const getCurrentNavigation = () => {
    const baseNavigation = tabNavigation[activeTab]
    
    // Start with Add Features at the top
    let navigation = [{
      name: "Add Features",
      href: "#",
      icon: Plus,
      exact: false,
      color: "text-blue-600"
    }]
    
    // Add the base navigation items
    navigation = [...navigation, ...baseNavigation]
    
    // Add features to core tab if they exist
    if (activeTab === 'core') {
      const featureItems = generateFeatureNavigation()
      if (featureItems.length > 0) {
        navigation = [...navigation, ...featureItems]
      }
    }
    
    return navigation
  }

  const currentNavigation = getCurrentNavigation()

  return (
    <SidebarProvider defaultOpen>
              <Sidebar className="bg-[#F7F8FB] border-r-2 border-black w-64 !border-r-2 !border-black">
        <SidebarHeader className="border-b-2 border-black px-6 h-16 bg-white">
          <div className="flex items-center justify-between h-full">
            <Image src="/groovy-logo.png" alt="Groovy" width={150} height={45} className="h-10 w-auto" />
          </div>
        </SidebarHeader>
        <SidebarContent className="px-4 py-0 flex flex-col h-full">
          {/* Tab Navigation - Full Width */}
          <div className="flex-shrink-0 -mx-4">
            <div className="flex bg-white border-b-2 border-black">
              {(['core', 'disco', 'utilities'] as const).map((tab, index) => (
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
                          asChild={item.name !== "Add Features"}
                          isActive={item.exact ? pathname === item.href : pathname.startsWith(item.href)}
                          className="h-10 px-3 mx-1 rounded-md data-[active=true]:bg-white data-[active=true]:shadow-sm data-[active=true]:border-l-4 data-[active=true]:border-blue-600 hover:bg-white hover:border-l-4 hover:border-gray-300 transition-all duration-200"
                          onClick={item.name === "Add Features" ? () => {
                            // Open the feature manager dialog
                            const event = new CustomEvent('open-feature-manager')
                            window.dispatchEvent(event)
                          } : undefined}
                        >
                          {item.name === "Add Features" ? (
                            <div className="flex items-center gap-2">
                              <item.icon className={`h-5 w-5 ${item.color || 'text-gray-600'}`} />
                              <span className="text-sm font-semibold text-gray-800">{item.name}</span>
                            </div>
                          ) : (
                            <Link href={item.href} className="flex items-center gap-2">
                              <item.icon className={`h-5 w-5 ${item.color || 'text-gray-600'}`} />
                              <span className="text-sm font-semibold text-gray-800">{item.name}</span>
                            </Link>
                          )}
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
                {activeTab === 'core' && "Core application features and workflows"}
                {activeTab === 'disco' && "Floor operations and configuration tools"}
                {activeTab === 'utilities' && "System settings and administrative tools"}
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

          {/* Hidden FeatureManager for dialog */}
          <div className="hidden">
            <FeatureManager 
              onFeatureToggle={handleFeatureToggle}
              hideButton={true}
            />
          </div>
        </SidebarContent>
      </Sidebar>
      <SidebarInset className="flex-1">
        <header className="flex h-16 shrink-0 items-center gap-2 border-b-2 border-black bg-white px-8 md:px-10">
          <SidebarTrigger className="-ml-1" />
          <div className="flex-1" />
          <HeaderBell />
        </header>
        <div className="p-8 md:p-10">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}


