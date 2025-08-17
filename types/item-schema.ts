export interface ItemAttribute {
  id: string
  name: string
  type: 'text' | 'number' | 'select' | 'date' | 'boolean' | 'url' | 'email'
  description?: string
  required: boolean
  defaultValue?: any
  validation?: AttributeValidation
  options?: string[] // For select type
  group?: string
  order: number
  isActive: boolean
  createdAt: number
  updatedAt: number
}

export interface AttributeValidation {
  minLength?: number
  maxLength?: number
  minValue?: number
  maxValue?: number
  pattern?: string // Regex pattern
  customValidation?: string // Custom validation logic
}

export interface ItemType {
  id: string
  name: string
  description?: string
  attributes: ItemAttribute[]
  isActive: boolean
  createdAt: number
  updatedAt: number
}

export interface ItemAttributeValue {
  attributeId: string
  value: any
  lastUpdated: number
  updatedBy: string
}

export interface EnhancedItem {
  id: string
  itemId: string
  workflowId: string
  currentStageId: string
  status: 'active' | 'paused' | 'error' | 'completed'
  itemTypeId?: string
  attributes: ItemAttributeValue[]
  metadata: Record<string, any>
  startedAt: number
  updatedAt: number
  completedAt?: number
  assignedTo?: string
  qrCode?: string
  currentLocationId?: string
  isDefective?: boolean
  defectNotes?: string
  flaggedBy?: string
  flaggedAt?: number
  brandId?: string
  factoryId?: string
  purchaseOrderId?: string
}

export interface AttributeTemplate {
  id: string
  name: string
  description?: string
  attributes: ItemAttribute[]
  category: 'production' | 'quality' | 'logistics' | 'custom'
  isActive: boolean
  createdAt: number
  updatedAt: number
}

export interface BulkOperation {
  id: string
  type: 'create' | 'update' | 'delete' | 'export'
  status: 'pending' | 'processing' | 'completed' | 'failed'
  items: string[]
  template?: AttributeTemplate
  filters?: Record<string, any>
  createdAt: number
  updatedAt: number
  completedAt?: number
  error?: string
}
