import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"
import { AppProviders } from "@/components/providers/app-providers"
import { MockAuthProvider } from "@/components/providers/mock-auth-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Groovy v0.1 - Industrial Workflow OS",
  description: "Modern workflow management for industrial operations",
  metadataBase: new URL('https://groovy.com'),
  generator: 'v0.dev',
  robots: { index: false, follow: false },
  openGraph: {
    title: "Groovy — Operating System Builder",
    description: "Configurable OS for your business. Track anything.",
    images: [
      {
        url: "/placeholder.jpg",
        width: 1200,
        height: 630,
        alt: "Groovy",
      },
    ],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className} suppressHydrationWarning={true}>
        <MockAuthProvider>
          <AppProviders>
            <div className="min-h-screen">{children}</div>
          </AppProviders>
          <Toaster />
        </MockAuthProvider>
      </body>
    </html>
  )
}
