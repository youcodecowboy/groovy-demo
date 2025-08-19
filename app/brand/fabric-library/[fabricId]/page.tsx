'use client'

import { BrandFabricDetail } from "@/components/brand/brand-fabric-detail"

interface BrandFabricDetailPageProps {
  params: {
    fabricId: string
  }
}

export default function BrandFabricDetailPage({ params }: BrandFabricDetailPageProps) {
  return <BrandFabricDetail fabricId={params.fabricId} />
}
