export interface StageAction {
  id: string
  type: "scan" | "photo" | "note" | "approval" | "measurement" | "inspection"
  label: string
  required: boolean
  config?: {
    photoCount?: number
    notePrompt?: string
    measurementUnit?: string
    inspectionChecklist?: string[]
  }
}

export interface Stage {
  id: string
  name: string
  color: string
  description?: string
  actions: StageAction[]
  allowedNextStageIds: string[]
  order: number
}

export interface Workflow {
  id: string
  name: string
  description?: string
  stages: Stage[]
  entryStageId: string
}

export interface ItemMetadata {
  brand?: string
  fabricCode?: string
  color?: string
  size?: string
  style?: string
  season?: string
  notes?: string
}

export interface Item {
  id: string
  sku: string
  qrData: string
  currentStageId: string
  workflowId: string
  status: "inactive" | "active" | "completed" | "paused"
  metadata?: ItemMetadata
  currentLocationId?: string
  createdAt: string
  activatedAt?: string
  completedAt?: string
  history: Array<{
    from: string
    to: string
    at: string
    user: string
    completedActions?: Array<{
      actionId: string
      type: string
      data: any
    }>
  }>
}

export interface CreateWorkflowInput {
  name: string
  description?: string
  stages: Omit<Stage, "id">[]
  entryStageId?: string
}

export interface CreateItemsBulkInput {
  count: number
  skuPrefix: string
  workflowId: string
}

export interface AdvanceItemInput {
  itemId: string
  toStageId: string
  completedActions?: Array<{
    actionId: string
    type: string
    data: any
  }>
}

export interface GetItemsParams {
  workflowId?: string
  stageId?: string
  status?: string
  limit?: number
}

// Brand interface types
export interface Brand {
  _id: string
  name: string
  email: string
  contactPerson: string
  phone?: string
  address?: string
  logo?: string
  isActive: boolean
  createdAt: number
  updatedAt: number
  metadata?: any
}

export interface Factory {
  _id: string
  name: string
  location: string
  adminUserId: string
  isActive: boolean
  capacity?: number
  specialties?: string[]
  createdAt: number
  updatedAt: number
}

export interface BrandFactoryRelation {
  _id: string
  brandId: string
  factoryId: string
  isActive: boolean
  partnershipStartDate: number
  notes?: string
}

export interface PurchaseOrderItem {
  sku: string
  quantity: number
  description: string
  specifications?: any
}

export interface PurchaseOrder {
  _id: string
  brandId: string
  factoryId: string
  poNumber: string
  status: "pending" | "accepted" | "rejected" | "completed"
  items: PurchaseOrderItem[]
  totalValue: number
  requestedDeliveryDate: number
  submittedAt: number
  acceptedAt?: number
  acceptedBy?: string
  notes?: string
  metadata?: any
}

// Extended types for existing entities
export interface ExtendedItem extends Item {
  brandId?: string
  purchaseOrderId?: string
}

export interface ExtendedUser {
  _id: string
  name: string
  email: string
  role: "admin" | "operator" | "viewer" | "manager"
  isActive: boolean
  createdAt: number
  lastLogin?: number
  team?: string
  avatar?: string
  phone?: string
  brandId?: string
  factoryId?: string
  userType?: "brand" | "factory" | "system"
}

export interface ExtendedMessage {
  _id: string
  senderId: string
  recipientId: string
  content: string
  messageType: "text" | "image" | "file" | "system"
  isRead: boolean
  createdAt: number
  readAt?: number
  replyToId?: string
  metadata?: any
  brandId?: string
  factoryId?: string
  orderId?: string
}
