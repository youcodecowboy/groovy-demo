'use client'

import { Badge } from '@/components/ui/badge'
import { formatUnit, type Unit } from '@/types/materials'

interface UnitChipProps {
  unit: Unit
  variant?: 'default' | 'secondary' | 'outline'
  className?: string
}

export default function UnitChip({ unit, variant = 'secondary', className }: UnitChipProps) {
  const unitLabels: Record<Unit, string> = {
    'm': 'm',
    'yd': 'yd',
    'pc': 'pc',
    'kg': 'kg',
    'g': 'g',
    'roll': 'roll',
    'cone': 'cone',
    'box': 'box'
  }

  return (
    <Badge variant={variant} className={className}>
      {unitLabels[unit] || unit}
    </Badge>
  )
}
