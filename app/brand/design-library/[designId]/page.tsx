'use client'

import { BrandDesignDetail } from "@/components/brand/brand-design-detail"

interface BrandDesignDetailPageProps {
  params: {
    designId: string
  }
}

export default function BrandDesignDetailPage({ params }: BrandDesignDetailPageProps) {
  return <BrandDesignDetail designId={params.designId} />
}
