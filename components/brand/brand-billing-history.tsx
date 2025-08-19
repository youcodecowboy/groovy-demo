'use client'

import { useState, useEffect } from 'react'
import { InvoicesTable } from '@/components/billing/invoices-table'
import { brandAdapter } from '@/lib/brand-adapter'
import { BrandBillingSummary } from '@/lib/brand-mock-data'

export function BrandBillingHistory() {
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
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (!billingSummary) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-gray-600">Failed to load billing history</p>
        </div>
      </div>
    )
  }

  // Transform brand invoices to match the expected format
  const invoicesData = billingSummary.invoices.map(invoice => ({
    ...invoice,
    period: `${billingSummary.currentPeriod.startDate.toLocaleDateString()} - ${billingSummary.currentPeriod.endDate.toLocaleDateString()}`,
    downloadUrl: `/api/invoices/${invoice.id}/download` // Mock URL
  }))

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Billing History</h1>
        <p className="text-gray-600">
          View and download your past invoices and payment history.
        </p>
      </div>

      <InvoicesTable invoices={invoicesData} />
    </div>
  )
}