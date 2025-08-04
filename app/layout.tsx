import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"
import { ConvexClientProvider } from "@/lib/convex"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Groovy v0.1 - Industrial Workflow OS",
  description: "Modern workflow management for industrial operations",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ConvexClientProvider>
          <div className="min-h-screen bg-gray-50/50">{children}</div>
          <Toaster />
        </ConvexClientProvider>
      </body>
    </html>
  )
}
