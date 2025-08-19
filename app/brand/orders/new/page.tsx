
import { PurchaseOrderForm } from "@/components/brand/purchase-order-form"

export default function NewPurchaseOrder() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Create Purchase Order</h1>
          <p className="text-gray-600">Submit a new purchase order to your factory partners</p>
        </div>
        
        <PurchaseOrderForm />
      </div>
    </div>
  )
} 