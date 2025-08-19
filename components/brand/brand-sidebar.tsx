"use client"

import type React from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
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
    Bell
} from "lucide-react"
import { SignedIn, UserButton } from "@/components/ui/mock-auth-components"
import { BrandHeaderBell } from "./brand-header-bell"

const brandNavigation = [
  {
    title: "Core",
    items: [
      { name: "Dashboard", href: "/brand", icon: Home, exact: true },
      { name: "Orders", href: "/brand/orders", icon: FileText },
      { name: "Messaging", href: "/brand/messaging", icon: MessageSquare },
      { name: "Factories", href: "/brand/factories", icon: Factory },
      { name: "CRM", href: "/brand/crm", icon: Users2 },
      { name: "Reports", href: "/brand/reports", icon: BarChart3 },
      { name: "Usage & Billing", href: "/brand/billing", icon: CreditCard },
      { name: "Team", href: "/brand/team", icon: Users },
    ],
  },
  {
    title: "Marketplace",
    items: [
      { name: "Marketplace", href: "/brand/marketplace", icon: ShoppingBag },
      { name: "Sample Hub", href: "/brand/samples", icon: Package },
      { name: "Logistics", href: "/brand/logistics", icon: Truck },
    ],
  },
  {
    title: "Libraries",
    items: [
      { name: "Design Library", href: "/brand/design-library", icon: Palette },
      { name: "Fabric Library", href: "/brand/fabric-library", icon: Scissors },
    ],
  },
]

interface BrandSidebarProps {
  children: React.ReactNode
}

export function BrandSidebar({ children }: BrandSidebarProps) {
  const pathname = usePathname()

  return (
    <SidebarProvider defaultOpen>
      <Sidebar className="bg-[#F7F8FB] border-r">
        <SidebarHeader className="border-b px-6 h-16 bg-white">
          <div className="flex items-center justify-between h-full">
            <Image src="/groovy-logo.png" alt="Groovy" width={150} height={45} className="h-10 w-auto" />
            <div className="text-xs text-gray-500 font-medium">BRAND</div>
          </div>
        </SidebarHeader>
        <SidebarContent className="px-4 py-6 flex flex-col h-full">
          <div className="flex-1 overflow-y-auto min-h-0">
            {brandNavigation.map((section) => (
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
        <header className="flex h-16 shrink-0 items-center gap-2 border-b bg-white px-8 md:px-10">
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