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
import { Home, Workflow, MessageSquare, Settings, Package, FileText, Users, Users2, Zap, Cog } from "lucide-react"
import { SignedIn, UserButton } from "@/components/ui/mock-auth-components"

const navigation = [
  {
    title: "Core",
    items: [
      { name: "Home", href: "/app", icon: Home, exact: true },
      { name: "Workflows", href: "/app/workflows", icon: Workflow },
      { name: "Items", href: "/app/items", icon: Package },
      { name: "Teams", href: "/app/teams", icon: Users },
      { name: "Customers", href: "/app/customers", icon: Users2 },
      { name: "Orders", href: "/app/orders", icon: FileText },
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

  return (
    <SidebarProvider defaultOpen>
      <Sidebar className="bg-[#F7F8FB] border-r">
        <SidebarHeader className="border-b px-6 py-5 bg-white">
          <div className="flex items-center justify-between">
            <Image src="/groovy-logo.png" alt="Groovy" width={150} height={45} className="h-10 w-auto" />
          </div>
        </SidebarHeader>
        <SidebarContent className="px-4 py-6">
          {navigation.map((section) => (
            <SidebarGroup key={section.title} className="mb-8">
              <SidebarGroupLabel className="mb-3">
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
                        className="h-12 px-4 rounded-md border-l-2 data-[active=true]:bg-white data-[active=true]:shadow-sm data-[active=true]:border-black hover:bg-white"
                      >
                        <Link href={item.href} className="flex items-center gap-3">
                          <item.icon className="h-6 w-6" />
                          <span className="text-base font-semibold">{item.name}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          ))}
          <div className="mt-8 border-t pt-6">
            <SignedIn>
              <div className="px-2">
                <span className="text-sm text-gray-600 italic mb-3 block">Account</span>
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


