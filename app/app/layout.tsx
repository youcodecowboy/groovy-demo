import type React from "react"
import { AppSidebar } from "@/components/layout/app-sidebar"

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppSidebar>
      <div className="min-h-[calc(100vh-4rem)] bg-[#F7F8FB] p-8 md:p-10">
        {children}
      </div>
    </AppSidebar>
  )
}


