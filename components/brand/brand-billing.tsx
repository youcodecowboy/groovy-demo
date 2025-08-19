'use client'

import { useState, useEffect } from 'react'
import { BillingHeaderCards } from '@/components/billing/billing-header-cards'
import { UsageTrendChart } from '@/components/billing/usage-trend-chart'
import { UsageByEntityTable } from '@/components/billing/usage-by-entity-table'
import { brandAdapter } from '@/lib/brand-adapter'
import { BrandBillingSummary } from '@/lib/brand-mock-data'

export function BrandBilling() {
  const [billingSummary, setBillingSummary] = useState<BrandBillingSummary | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadBillingData = async () => {
      try {
        setLoading(true)
        const data = await brandAdapter.getBillingSummary()
        setBillingSummary(data)
      } catch (error) {
        console.error('Failed to load billing data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadBillingData()
  }, [])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-96 bg-gray-200 rounded-lg"></div>
            <div className="h-96 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!billingSummary) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-gray-600">Failed to load billing data</p>
        </div>
      </div>
    )
  }

  // Transform brand billing data to match the BillingHeaderCards expected format
  const usageData = {
    start: billingSummary.currentPeriod.startDate.toISOString(),
    end: billingSummary.currentPeriod.endDate.toISOString(),
    totalRecords: billingSummary.currentPeriod.usage,
    totalCostCents: billingSummary.currentPeriod.cost * 100, // Convert to cents
    forecastCostCents: Math.round(billingSummary.currentPeriod.cost * 1.2 * 100), // Simple forecast
    nextInvoiceDate: billingSummary.currentPeriod.endDate.toISOString()
  }

  // Transform data for other components
  const billingData = {
    currentPeriod: {
      totalCost: billingSummary.currentPeriod.cost,
      totalUsage: billingSummary.currentPeriod.usage,
      currency: billingSummary.currentPeriod.currency,
      startDate: billingSummary.currentPeriod.startDate,
      endDate: billingSummary.currentPeriod.endDate
    },
    previousPeriod: {
      totalCost: billingSummary.previousPeriod.cost,
      totalUsage: billingSummary.previousPeriod.usage
    },
    breakdown: billingSummary.breakdown.map(item => ({
      category: item.category,
      usage: item.usage,
      cost: item.cost,
      unit: 'operations' // Default unit for brand operations
    }))
  }

  // Transform breakdown data for UsageByEntityTable
  const entityData = billingSummary.breakdown.map(item => ({
    entity: item.category,
    count: item.usage,
    share: (item.usage / billingSummary.currentPeriod.usage) * 100,
    costCents: item.cost * 100, // Convert to cents
    trend: [item.usage * 0.8, item.usage * 0.9, item.usage, item.usage * 1.1, item.usage * 1.2, item.usage * 1.3, item.usage * 1.4] // Mock trend data
  }))

  // Transform data for UsageTrendChart
  const trendData = [
    { date: '2024-01-01', items: 12, orders: 8, materials: 6, messages: 5, workflows: 3, teams: 2, attachments: 1 },
    { date: '2024-01-02', items: 15, orders: 10, materials: 8, messages: 7, workflows: 4, teams: 3, attachments: 2 },
    { date: '2024-01-03', items: 18, orders: 12, materials: 10, messages: 9, workflows: 5, teams: 4, attachments: 2 },
    { date: '2024-01-04', items: 22, orders: 15, materials: 12, messages: 11, workflows: 6, teams: 5, attachments: 3 },
    { date: '2024-01-05', items: 25, orders: 18, materials: 14, messages: 13, workflows: 7, teams: 6, attachments: 3 },
    { date: '2024-01-06', items: 28, orders: 20, materials: 16, messages: 15, workflows: 8, teams: 7, attachments: 4 },
    { date: '2024-01-07', items: 30, orders: 22, materials: 18, messages: 17, workflows: 9, teams: 8, attachments: 4 }
  ]

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Usage & Billing</h1>
        <p className="text-gray-600">
          Track your brand platform usage and costs across all activities.
        </p>
      </div>

      <BillingHeaderCards usageData={usageData} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <UsageTrendChart data={trendData} />
        <UsageByEntityTable data={entityData} />
      </div>
    </div>
  )
}
