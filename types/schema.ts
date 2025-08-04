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
