'use client'

import { BrandSampleDetail } from "@/components/brand/brand-sample-detail"

interface BrandSampleDetailPageProps {
  params: {
    sampleId: string
  }
}

export default function BrandSampleDetailPage({ params }: BrandSampleDetailPageProps) {
  return <BrandSampleDetail sampleId={params.sampleId} />
}
