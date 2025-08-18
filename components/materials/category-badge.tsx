'use client'

import { Badge } from '@/components/ui/badge'
import { type MaterialCategory } from '@/types/materials'
import { 
  Shirt, 
  Scissors, 
  Package, 
  Box,
  Circle
} from 'lucide-react'

interface CategoryBadgeProps {
  category: MaterialCategory
  showIcon?: boolean
  variant?: 'default' | 'secondary' | 'outline'
  className?: string
}

export default function CategoryBadge({ 
  category, 
  showIcon = true, 
  variant = 'secondary',
  className 
}: CategoryBadgeProps) {
  const categoryConfig = {
    fabric: {
      label: 'Fabric',
      icon: Shirt,
      color: 'bg-blue-100 text-blue-800 hover:bg-blue-200'
    },
    trim: {
      label: 'Trim',
      icon: Scissors,
      color: 'bg-green-100 text-green-800 hover:bg-green-200'
    },
    accessory: {
      label: 'Accessory',
      icon: Package,
      color: 'bg-purple-100 text-purple-800 hover:bg-purple-200'
    },
    packaging: {
      label: 'Packaging',
      icon: Box,
      color: 'bg-orange-100 text-orange-800 hover:bg-orange-200'
    },
    other: {
      label: 'Other',
      icon: Circle,
      color: 'bg-gray-100 text-gray-800 hover:bg-gray-200'
    }
  }

  const config = categoryConfig[category]
  const Icon = config.icon

  if (variant === 'default' || variant === 'outline') {
    return (
      <Badge variant={variant} className={className}>
        {showIcon && <Icon className="w-3 h-3 mr-1" />}
        {config.label}
      </Badge>
    )
  }

  return (
    <Badge 
      variant="secondary" 
      className={`${config.color} border-0 ${className}`}
    >
      {showIcon && <Icon className="w-3 h-3 mr-1" />}
      {config.label}
    </Badge>
  )
}