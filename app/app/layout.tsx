import type React from "react"
import { AppSidebar } from "@/components/layout/app-sidebar"

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppSidebar>
      <div className="min-h-[calc(100vh-4rem)] bg-white">
        {children}
      </div>
    </AppSidebar>
  )
}


