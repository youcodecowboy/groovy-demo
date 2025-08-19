'use client'

import { BrandOrderDetail } from "@/components/brand/brand-order-detail"

interface BrandOrderDetailPageProps {
  params: {
    orderId: string
  }
}

export default function BrandOrderDetailPage({ params }: BrandOrderDetailPageProps) {
  return <BrandOrderDetail orderId={params.orderId} />
}
