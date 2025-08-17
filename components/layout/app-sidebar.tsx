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
    Archive
} from "lucide-react"
import { SignedIn, UserButton } from "@/components/ui/mock-auth-components"
import { FeatureManager } from "./feature-manager"

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

const coreNavigation = [
  {
    title: "Core",
    items: [
      { name: "Home", href: "/app", icon: Home, exact: true },
      { name: "Workflows", href: "/app/workflows", icon: Workflow },
      { name: "Items", href: "/app/items", icon: Package },
      { name: "Teams", href: "/app/teams", icon: Users },
      { name: "Customers", href: "/app/customers", icon: Users2 },
      { name: "Orders", href: "/app/orders", icon: FileText },
      { name: "Reports", href: "/app/reports", icon: BarChart3 },
      { name: "Messages", href: "/app/messages", icon: MessageSquare },
      { name: "Settings", href: "/app/settings", icon: Settings },
    ],
  },
  {
    title: "Disco",
    items: [
      { name: "Floor App", href: "/disco", icon: Zap },
      { name: "Configuration", href: "/disco/config", icon: Cog },
    ],
  },
]

interface AppSidebarProps {
  children: React.ReactNode
}

export function AppSidebar({ children }: AppSidebarProps) {
  const pathname = usePathname()
  const [enabledFeatures, setEnabledFeatures] = useState<string[]>([])

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
          featureId
        }
      })

    if (featureItems.length === 0) return []

    return [
      {
        title: "Features",
        items: featureItems
      }
    ]
  }

  const allNavigation = [...coreNavigation, ...generateFeatureNavigation()]

  return (
    <SidebarProvider defaultOpen>
      <Sidebar className="bg-[#F7F8FB] border-r">
        <SidebarHeader className="border-b px-6 py-5 bg-white">
          <div className="flex items-center justify-between">
            <Image src="/groovy-logo.png" alt="Groovy" width={150} height={45} className="h-10 w-auto" />
          </div>
        </SidebarHeader>
        <SidebarContent className="px-4 py-6 flex flex-col h-full">
          {/* Add Features Button */}
          <div className="mb-4 flex-shrink-0">
            <FeatureManager 
              onFeatureToggle={handleFeatureToggle}
            />
          </div>

          <div className="flex-1 overflow-y-auto min-h-0">
            {allNavigation.map((section) => (
              <SidebarGroup key={section.title} className="mb-6">
                <SidebarGroupLabel className="mb-2">
                  <span className="inline-flex items-center rounded-full border border-black/10 bg-gray-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-gray-800">
                    {section.title}
                  </span>
                </SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu className="space-y-0">
                    {section.items.map((item) => (
                      <SidebarMenuItem key={item.name}>
                        <SidebarMenuButton
                          asChild
                          isActive={item.exact ? pathname === item.href : pathname.startsWith(item.href)}
                          className="h-10 px-4 rounded-md border-l-2 data-[active=true]:bg-white data-[active=true]:shadow-sm data-[active=true]:border-black hover:bg-white"
                        >
                          <Link href={item.href} className="flex items-center gap-3">
                            <item.icon className="h-5 w-5" />
                            <span className="text-sm font-semibold">{item.name}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            ))}
          </div>

          <div className="mt-6 border-t pt-4 flex-shrink-0">
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
        <header className="flex h-16 shrink-0 items-center gap-2 border-b bg-white px-6">
          <SidebarTrigger className="-ml-1" />
          <div className="flex-1" />
        </header>
        {children}
      </SidebarInset>
    </SidebarProvider>
  )
}


