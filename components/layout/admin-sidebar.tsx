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
    Settings,
    Package,
    Workflow,
    Home,
    Smartphone,
    Monitor,
    List,
    Library,
    CheckCircle,
    Activity,
    MessageSquare,
    Users,
    UserPlus,
    Bell,
    Flag,
    AlertTriangle,
    MapPin,
    FileText
} from "lucide-react"
import { SignedIn, UserButton } from "@/components/ui/mock-auth-components"

const navigation = [
  {
    title: "Overview",
    items: [
      { name: "Dashboard", href: "/admin", icon: Monitor, exact: true },
      { name: "Activity", href: "/admin/activity", icon: Activity },
      { name: "All Items", href: "/admin/items-list", icon: List },
      { name: "Completed Items", href: "/admin/completed-items", icon: CheckCircle },
    ],
  },
  {
    title: "Communication",
    items: [
      { name: "Messaging", href: "/admin/messaging", icon: MessageSquare },
      { name: "Notifications", href: "/admin/activity", icon: Bell },
    ],
  },
  {
    title: "Management",
    items: [
      { name: "Users", href: "/admin/users", icon: Users },
      { name: "Teams", href: "/admin/teams", icon: UserPlus },
      { name: "Tasks", href: "/admin/tasks", icon: CheckCircle },
      { name: "Purchase Orders", href: "/admin/purchase-orders", icon: FileText },
      { name: "Locations", href: "/admin/locations", icon: MapPin },
      { name: "Location History", href: "/admin/location-history", icon: MapPin },
      { name: "Defective Items", href: "/admin/defective-items", icon: AlertTriangle },
      { name: "Flagged Items", href: "/admin/flagged-items", icon: Flag },
    ],
  },
  {
    title: "Configuration",
    items: [
      { name: "Workflow Library", href: "/admin/workflows", icon: Library },
      { name: "Workflow Builder", href: "/admin/workflow", icon: Workflow },
      { name: "Create Items", href: "/admin/items", icon: Package },
    ],
  },
  {
    title: "Operations",
    items: [
      { name: "Factory Floor", href: "/floor", icon: Smartphone },
      { name: "Home", href: "/", icon: Home },
    ],
  },
]

interface AdminSidebarProps {
  children: React.ReactNode
}

export function AdminSidebar({ children }: AdminSidebarProps) {
  const pathname = usePathname()

  return (
    <SidebarProvider defaultOpen>
      <Sidebar className="border-r-0 shadow-sm bg-gray-50/50">
        <SidebarHeader className="border-b px-6 py-5 bg-white">
          <div className="flex items-center gap-3">
            <Image src="/groovy-logo.png" alt="Groovy" width={120} height={36} className="h-9 w-auto" />
          </div>
        </SidebarHeader>
        <SidebarContent className="px-4 py-6">
          {navigation.map((section) => (
            <SidebarGroup key={section.title} className="mb-8">
              <SidebarGroupLabel className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                {section.title}
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu className="space-y-1">
                  {section.items.map((item) => (
                    <SidebarMenuItem key={item.name}>
                      <SidebarMenuButton
                        asChild
                        isActive={item.exact ? pathname === item.href : pathname.startsWith(item.href)}
                        className="h-11 px-4 rounded-lg hover:bg-white hover:shadow-sm transition-all duration-200"
                      >
                        <Link href={item.href} className="flex items-center gap-3">
                          <item.icon className="h-5 w-5" />
                          <span className="font-medium">{item.name}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          ))}
          <div className="mt-8 pt-6 border-t">
            <SignedIn>
              <div className="px-2">
                <span className="text-xs text-gray-500 mb-3 block">Account</span>
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
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-sm">
              <Settings className="h-5 w-5" />
            </div>
            <div>
              <p className="text-base font-semibold text-gray-900">Admin Console</p>
              <p className="text-sm text-gray-500">Groovy v0.1</p>
            </div>
          </div>
        </header>
        {children}
      </SidebarInset>
    </SidebarProvider>
  )
}
