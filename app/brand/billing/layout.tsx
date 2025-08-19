'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { 
  BarChart3, 
  FileText, 
  CreditCard, 
  Download, 
  Settings 
} from 'lucide-react'

const billingTabs = [
  {
    name: 'Overview',
    href: '/brand/billing',
    icon: BarChart3,
    description: 'Usage dashboard and metrics'
  },
  {
    name: 'History',
    href: '/brand/billing/history',
    icon: FileText,
    description: 'Invoice history and payments'
  },
  {
    name: 'Payment',
    href: '/brand/billing/payment',
    icon: CreditCard,
    description: 'Payment methods and billing profile'
  },
  {
    name: 'Exports',
    href: '/brand/billing/exports',
    icon: Download,
    description: 'Data exports and API access'
  },
  {
    name: 'Settings',
    href: '/brand/billing/settings',
    icon: Settings,
    description: 'Alerts and billing configuration'
  }
]

export default function BrandBillingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Billing Navigation */}
      <div className="border-b bg-white">
        <div className="container mx-auto px-4">
          <nav className="flex space-x-8 overflow-x-auto">
            {billingTabs.map((tab) => {
              const isActive = pathname === tab.href
              const IconComponent = tab.icon
              
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                    isActive
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <IconComponent className="w-4 h-4" />
                  <span>{tab.name}</span>
                </Link>
              )
            })}
          </nav>
        </div>
      </div>

      {/* Page Content */}
      <div className="bg-gray-50 min-h-[calc(100vh-120px)]">
        {children}
      </div>
    </div>
  )
}
