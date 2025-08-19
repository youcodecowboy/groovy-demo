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

  // Transform brand billing data to match the existing component format
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

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Usage & Billing</h1>
        <p className="text-gray-600">
          Track your brand platform usage and costs across all activities.
        </p>
      </div>

      <BillingHeaderCards data={billingData} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <UsageTrendChart data={billingData} />
        <UsageByEntityTable data={billingData} />
      </div>
    </div>
  )
}