'use client'

import { PaymentMethods } from '@/components/billing/payment-methods'
import { BillingProfileForm } from '@/components/billing/billing-profile-form'

// Mock brand profile data
const mockBrandProfile = {
  companyName: 'Fashion Brand Inc.',
  contactName: 'Sarah Johnson',
  email: 'billing@fashionbrand.com',
  phone: '+1-555-0123',
  address: '123 Fashion Ave',
  city: 'New York',
  state: 'NY',
  zipCode: '10001',
  country: 'United States',
  taxId: '12-3456789'
}

export function BrandBillingPayment() {
  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment & Billing Profile</h1>
        <p className="text-gray-600">
          Manage your payment methods and billing information.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <PaymentMethods />
        <BillingProfileForm initialData={mockBrandProfile} />
      </div>
    </div>
  )
}
