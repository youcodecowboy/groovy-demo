import type {
    Workflow,
    Item,
    CreateWorkflowInput,
    CreateItemsBulkInput,
    AdvanceItemInput,
    GetItemsParams,
} from "@/types/schema"
import type {
    Material,
    MaterialLot,
    MaterialMovement,
    PriceHistory,
    InventorySnapshot,
    LabelTemplate,
    MaterialFilters,
    ReceiveMaterialForm,
    IssueMaterialForm,
    TransferMaterialForm,
    AdjustMaterialForm,
    MaterialSettings,
    Location,
    MovementType,
    Unit,
    MaterialCategory,
    UnitConversion,
    MaterialAttributeTemplate,
} from "@/types/materials"
import {
    DEFAULT_UNIT_CONVERSIONS,
    DEFAULT_CATEGORY_TEMPLATES,
    isLowStock,
} from "@/types/materials"

// Mock data storage
let workflows: Workflow[] = []
let items: Item[] = []

// Materials mock data storage
let materials: Material[] = []
let materialLots: MaterialLot[] = []
let materialMovements: MaterialMovement[] = []
let priceHistory: PriceHistory[] = []
let locations: Location[] = []
let labelTemplates: LabelTemplate[] = []
let unitConversions: UnitConversion[] = [...DEFAULT_UNIT_CONVERSIONS]
let materialSettings: MaterialSettings = {
  defaultCurrency: 'USD',
  valuationMethod: 'FIFO',
  lowStockThreshold: 10,
  enableLotTracking: true,
  requireReceiptPO: false,
}

// Demo workflow data with enhanced actions
const demoWorkflow: Workflow = {
  id: "demo-workflow-1",
  name: "Standard Production Flow",
  description: "Complete garment production workflow with quality controls",
  entryStageId: "cut",
  stages: [
    {
      id: "cut",
      name: "Cut",
      color: "#ef4444",
      description: "Fabric cutting operations",
      order: 0,
      actions: [
        {
          id: "cut-measurement",
          type: "measurement",
          label: "Measure fabric dimensions",
          required: true,
          config: { measurementUnit: "inches" },
        },
        {
          id: "cut-photo",
          type: "photo",
          label: "Photo of cut pieces",
          required: false,
          config: { photoCount: 2 },
        },
      ],
      allowedNextStageIds: ["sew"],
    },
    {
      id: "sew",
      name: "Sew",
      color: "#f97316",
      description: "Sewing and assembly operations",
      order: 1,
      actions: [
        {
          id: "sew-inspection",
          type: "inspection",
          label: "Pre-sewing inspection",
          required: true,
          config: {
            inspectionChecklist: ["Thread quality", "Fabric alignment", "Pattern matching"],
          },
        },
      ],
      allowedNextStageIds: ["wash"],
    },
    {
      id: "wash",
      name: "Wash",
      color: "#3b82f6",
      description: "Washing and treatment",
      order: 2,
      actions: [
        {
          id: "wash-scan",
          type: "scan",
          label: "Scan before washing",
          required: true,
        },
        {
          id: "wash-note",
          type: "note",
          label: "Washing instructions",
          required: true,
          config: { notePrompt: "Enter washing temperature and cycle details" },
        },
      ],
      allowedNextStageIds: ["qc"],
    },
    {
      id: "qc",
      name: "QC",
      color: "#8b5cf6",
      description: "Quality control and inspection",
      order: 3,
      actions: [
        {
          id: "qc-inspection",
          type: "inspection",
          label: "Quality inspection",
          required: true,
          config: {
            inspectionChecklist: ["Stitching quality", "Color consistency", "Size accuracy", "Overall finish"],
          },
        },
        {
          id: "qc-approval",
          type: "approval",
          label: "QC approval",
          required: true,
        },
      ],
      allowedNextStageIds: ["pack"],
    },
    {
      id: "pack",
      name: "Pack",
      color: "#10b981",
      description: "Final packaging",
      order: 4,
      actions: [
        {
          id: "pack-scan",
          type: "scan",
          label: "Final scan",
          required: true,
        },
        {
          id: "pack-photo",
          type: "photo",
          label: "Packaged item photo",
          required: true,
          config: { photoCount: 1 },
        },
      ],
      allowedNextStageIds: [],
    },
  ],
}

// Additional demo workflows
const demoWorkflows: Workflow[] = [
  demoWorkflow,
  {
    id: "demo-workflow-2",
    name: "Express Production",
    description: "Fast-track workflow for urgent orders with minimal stages",
    entryStageId: "express-cut",
    stages: [
      {
        id: "express-cut",
        name: "Express Cut",
        color: "#f59e0b",
        description: "Rapid cutting for urgent orders",
        order: 0,
        actions: [
          {
            id: "express-cut-scan",
            type: "scan",
            label: "Quick scan",
            required: true,
          },
        ],
        allowedNextStageIds: ["express-sew"],
      },
      {
        id: "express-sew",
        name: "Express Sew",
        color: "#f97316",
        description: "Priority sewing operations",
        order: 1,
        actions: [
          {
            id: "express-sew-photo",
            type: "photo",
            label: "Quality photo",
            required: true,
          },
        ],
        allowedNextStageIds: ["express-pack"],
      },
      {
        id: "express-pack",
        name: "Express Pack",
        color: "#10b981",
        description: "Priority packaging and shipping",
        order: 2,
        actions: [
          {
            id: "express-pack-approval",
            type: "approval",
            label: "Final approval",
            required: true,
          },
        ],
        allowedNextStageIds: [],
      },
    ],
  },
  {
    id: "demo-workflow-3",
    name: "Premium Quality Control",
    description: "Enhanced workflow with multiple quality checkpoints for premium products",
    entryStageId: "premium-inspect",
    stages: [
      {
        id: "premium-inspect",
        name: "Material Inspection",
        color: "#8b5cf6",
        description: "Thorough material quality inspection",
        order: 0,
        actions: [
          {
            id: "premium-inspect-check",
            type: "inspection",
            label: "Material quality check",
            required: true,
            config: {
              inspectionChecklist: ["Fabric quality", "Color consistency", "Defect check"],
            },
          },
        ],
        allowedNextStageIds: ["premium-cut"],
      },
      {
        id: "premium-cut",
        name: "Precision Cut",
        color: "#ef4444",
        description: "Precision cutting with measurements",
        order: 1,
        actions: [
          {
            id: "premium-cut-measure",
            type: "measurement",
            label: "Precision measurements",
            required: true,
          },
          {
            id: "premium-cut-photo",
            type: "photo",
            label: "Cut documentation",
            required: true,
          },
        ],
        allowedNextStageIds: ["premium-sew"],
      },
      {
        id: "premium-sew",
        name: "Premium Sewing",
        color: "#f97316",
        description: "High-quality sewing operations",
        order: 2,
        actions: [
          {
            id: "premium-sew-inspection",
            type: "inspection",
            label: "Sewing quality check",
            required: true,
          },
        ],
        allowedNextStageIds: ["premium-qc"],
      },
      {
        id: "premium-qc",
        name: "Final QC",
        color: "#8b5cf6",
        description: "Comprehensive final quality control",
        order: 3,
        actions: [
          {
            id: "premium-qc-full",
            type: "inspection",
            label: "Full quality inspection",
            required: true,
            config: {
              inspectionChecklist: [
                "Stitching quality",
                "Fit and finish",
                "Color accuracy",
                "Overall appearance",
                "Packaging readiness",
              ],
            },
          },
          {
            id: "premium-qc-approval",
            type: "approval",
            label: "QC manager approval",
            required: true,
          },
        ],
        allowedNextStageIds: ["premium-pack"],
      },
      {
        id: "premium-pack",
        name: "Premium Packaging",
        color: "#10b981",
        description: "Premium packaging and presentation",
        order: 4,
        actions: [
          {
            id: "premium-pack-photo",
            type: "photo",
            label: "Final product photo",
            required: true,
          },
        ],
        allowedNextStageIds: [],
      },
    ],
  },
]

// Initialize with demo data
const initializeDemoData = () => {
  workflows = [...demoWorkflows]

  // Generate demo items with different statuses
  const demoItems: Item[] = []
  for (let i = 1; i <= 25; i++) {
    const itemId = `ITEM-${i.toString().padStart(3, "0")}`
    const workflowIndex = Math.floor(Math.random() * workflows.length)
    const selectedWorkflow = workflows[workflowIndex]
    const stageIndex = Math.floor(Math.random() * selectedWorkflow.stages.length)
    const currentStage = selectedWorkflow.stages[stageIndex]
    const createdAt = new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()

    // 30% inactive, 60% active, 10% completed
    let status: "inactive" | "active" | "completed" = "active"
    if (i <= 8) status = "inactive"
    else if (i > 22) status = "completed"

    demoItems.push({
      id: itemId,
      sku: `SKU-${i.toString().padStart(3, "0")}`,
      qrData: itemId,
      currentStageId: status === "inactive" ? "pending" : currentStage.id,
      workflowId: selectedWorkflow.id,
      status,
      createdAt,
      activatedAt: status !== "inactive" ? createdAt : undefined,
      completedAt:
        status === "completed" ? new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString() : undefined,
      metadata: {
        brand: ["Zara", "H&M", "Uniqlo", "Nike", "Adidas"][Math.floor(Math.random() * 5)],
        fabricCode: ["COT-100-DEN", "WOL-80-CAS", "COT-100-JER"][Math.floor(Math.random() * 3)],
        color: ["Blue", "Black", "White", "Grey", "Red"][Math.floor(Math.random() * 5)],
        size: ["S", "M", "L", "XL"][Math.floor(Math.random() * 4)],
        style: ["T-Shirt", "Jeans", "Sweater", "Jacket"][Math.floor(Math.random() * 4)],
        season: ["SS24", "FW24"][Math.floor(Math.random() * 2)],
      },
      history:
        status === "inactive"
          ? []
          : [
              {
                from: "",
                to: currentStage.id,
                at: createdAt,
                user: "system@demo",
              },
            ],
    })
  }
  items = demoItems
}

// Initialize on first load
if (workflows.length === 0) {
  initializeDemoData()
}

export const dataAdapter = {
  async getWorkflows(): Promise<Workflow[]> {
    return [...workflows]
  },

  async getWorkflow(workflowId: string): Promise<Workflow> {
    const workflow = workflows.find((w) => w.id === workflowId)
    if (!workflow) throw new Error("Workflow not found")
    return workflow
  },

  async createWorkflow(input: CreateWorkflowInput): Promise<Workflow> {
    const workflow: Workflow = {
      id: `workflow-${Date.now()}`,
      name: input.name,
      description: input.description,
      stages: input.stages.map((stage, index) => ({
        ...stage,
        id: `stage-${Date.now()}-${index}-${Math.random().toString(36).substr(2, 9)}`,
        order: index,
      })),
      entryStageId: input.entryStageId || input.stages[0]?.id || "",
    }

    if (workflow.entryStageId === "") {
      workflow.entryStageId = workflow.stages[0]?.id || ""
    }

    workflows.push(workflow)
    return workflow
  },

  async updateWorkflow(workflowId: string, input: CreateWorkflowInput): Promise<Workflow> {
    const index = workflows.findIndex((w) => w.id === workflowId)
    if (index === -1) throw new Error("Workflow not found")

    const updatedWorkflow: Workflow = {
      id: workflowId,
      name: input.name,
      description: input.description,
      stages: input.stages.map((stage, stageIndex) => ({
        ...stage,
        id: stage.id || `stage-${Date.now()}-${stageIndex}-${Math.random().toString(36).substr(2, 9)}`,
        order: stageIndex,
      })),
      entryStageId: input.entryStageId || input.stages[0]?.id || "",
    }

    if (updatedWorkflow.entryStageId === "") {
      updatedWorkflow.entryStageId = updatedWorkflow.stages[0]?.id || ""
    }

    workflows[index] = updatedWorkflow
    return updatedWorkflow
  },

  async deleteWorkflow(workflowId: string): Promise<void> {
    const index = workflows.findIndex((w) => w.id === workflowId)
    if (index === -1) throw new Error("Workflow not found")

    // Check if any items are using this workflow
    const itemsUsingWorkflow = items.filter((item) => item.workflowId === workflowId)
    if (itemsUsingWorkflow.length > 0) {
      throw new Error(`Cannot delete workflow: ${itemsUsingWorkflow.length} items are using this workflow`)
    }

    workflows.splice(index, 1)
  },

  async getItems(params?: GetItemsParams): Promise<Item[]> {
    let filteredItems = [...items]

    if (params?.workflowId) {
      filteredItems = filteredItems.filter((item) => item.workflowId === params.workflowId)
    }

    if (params?.stageId) {
      filteredItems = filteredItems.filter((item) => item.currentStageId === params.stageId)
    }

    if (params?.status) {
      filteredItems = filteredItems.filter((item) => item.status === params.status)
    }

    if (params?.limit) {
      filteredItems = filteredItems.slice(0, params.limit)
    }

    return filteredItems.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  },

  async createItemsBulk(input: CreateItemsBulkInput): Promise<Item[]> {
    const workflow = workflows.find((w) => w.id === input.workflowId)
    if (!workflow) throw new Error("Workflow not found")

    const newItems: Item[] = []
    const timestamp = new Date().toISOString()

    for (let i = 1; i <= input.count; i++) {
      const itemId = `${input.skuPrefix}-${Date.now()}-${i.toString().padStart(3, "0")}`
      const item: Item = {
        id: itemId,
        sku: itemId,
        qrData: itemId,
        currentStageId: "pending",
        workflowId: workflow.id,
        status: "inactive",
        createdAt: timestamp,
        history: [],
      }
      newItems.push(item)
    }

    items.push(...newItems)
    return newItems
  },

  async getItem(itemId: string): Promise<Item> {
    const item = items.find((i) => i.id === itemId)
    if (!item) throw new Error("Item not found")
    return item
  },

  async activateItem(itemId: string): Promise<Item> {
    const itemIndex = items.findIndex((i) => i.id === itemId)
    if (itemIndex === -1) throw new Error("Item not found")

    const item = items[itemIndex]
    const workflow = workflows.find((w) => w.id === item.workflowId)
    if (!workflow) throw new Error("Workflow not found")

    const updatedItem = {
      ...item,
      status: "active" as const,
      currentStageId: workflow.entryStageId,
      activatedAt: new Date().toISOString(),
      history: [
        {
          from: "pending",
          to: workflow.entryStageId,
          at: new Date().toISOString(),
          user: "admin@demo",
        },
      ],
    }

    items[itemIndex] = updatedItem
    return updatedItem
  },

  async advanceItem(input: AdvanceItemInput): Promise<Item> {
    const itemIndex = items.findIndex((i) => i.id === input.itemId)
    if (itemIndex === -1) throw new Error("Item not found")

    const item = items[itemIndex]
    const workflow = workflows.find((w) => w.id === item.workflowId)
    if (!workflow) throw new Error("Workflow not found")

    const currentStage = workflow.stages.find((s) => s.id === item.currentStageId)
    if (!currentStage) throw new Error("Current stage not found")

    // Validate transition
    if (!currentStage.allowedNextStageIds.includes(input.toStageId)) {
      throw new Error("Invalid transition: not allowed from current stage")
    }

    const targetStage = workflow.stages.find((s) => s.id === input.toStageId)
    if (!targetStage) throw new Error("Target stage not found")

    // Check if this is the final stage
    const isCompleted = targetStage.allowedNextStageIds.length === 0

    // Update item
    const updatedItem = {
      ...item,
      currentStageId: input.toStageId,
      status: isCompleted ? ("completed" as const) : item.status,
      completedAt: isCompleted ? new Date().toISOString() : item.completedAt,
      history: [
        ...item.history,
        {
          from: item.currentStageId,
          to: input.toStageId,
          at: new Date().toISOString(),
          user: "floor@demo",
          completedActions: input.completedActions,
        },
      ],
    }

    items[itemIndex] = updatedItem
    return updatedItem
  },

  // New method for advancing items with completed actions
  async advanceItemWithActions(itemId: string, toStageId: string, completedActions: any[]): Promise<Item> {
    return this.advanceItem({
      itemId,
      toStageId,
      completedActions,
    })
  },

  async resetDemoData(): Promise<void> {
    initializeDemoData()
  },

  // Materials methods (non-breaking additions)
  async getMaterials(filters?: MaterialFilters): Promise<Material[]> {
    let filtered = [...materials]
    
    if (filters?.search) {
      const search = filters.search.toLowerCase()
      filtered = filtered.filter(m => 
        m.name.toLowerCase().includes(search) || 
        m.code.toLowerCase().includes(search)
      )
    }
    
    if (filters?.category?.length) {
      filtered = filtered.filter(m => filters.category!.includes(m.category))
    }
    
    if (filters?.archived !== undefined) {
      filtered = filtered.filter(m => !!m.archived === filters.archived)
    }
    
    return filtered
  },

  async getMaterial(id: string): Promise<Material | null> {
    return materials.find(m => m.id === id) || null
  },

  async createMaterial(input: Omit<Material, 'id' | 'createdAt' | 'updatedAt'>): Promise<Material> {
    const material: Material = {
      ...input,
      id: `mat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }
    materials.push(material)
    return material
  },

  async updateMaterial(id: string, updates: Partial<Material>): Promise<Material | null> {
    const index = materials.findIndex(m => m.id === id)
    if (index === -1) return null
    
    materials[index] = {
      ...materials[index],
      ...updates,
      updatedAt: Date.now(),
    }
    return materials[index]
  },

  async deleteMaterial(id: string): Promise<boolean> {
    const index = materials.findIndex(m => m.id === id)
    if (index === -1) return false
    
    materials.splice(index, 1)
    return true
  },

  async getMaterialLots(materialId: string): Promise<MaterialLot[]> {
    return materialLots.filter(lot => lot.materialId === materialId)
  },

  async getMaterialLot(id: string): Promise<MaterialLot | null> {
    return materialLots.find(lot => lot.id === id) || null
  },

  async receiveMaterial(input: ReceiveMaterialForm): Promise<MaterialLot> {
    const lot: MaterialLot = {
      id: `lot_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      materialId: input.materialId,
      lotCode: input.lotCode,
      color: input.color,
      widthMm: input.widthMm,
      receivedAt: Date.now(),
      unitCost: input.unitCost,
      quantity: input.quantity,
      locationId: input.locationId,
      supplierId: input.supplierId,
      poId: input.poId,
      notes: input.notes,
    }
    
    materialLots.push(lot)
    
    // Record movement
    const movement: MaterialMovement = {
      id: `mov_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      at: Date.now(),
      type: 'RECEIPT',
      materialId: input.materialId,
      lotId: lot.id,
      toLocationId: input.locationId,
      quantity: input.quantity,
      unitCost: input.unitCost,
      actor: 'system', // In real app, would be current user
    }
    
    materialMovements.push(movement)
    
    // Add price history
    const price: PriceHistory = {
      id: `price_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      materialId: input.materialId,
      at: Date.now(),
      unitCost: input.unitCost,
      currency: materialSettings.defaultCurrency,
      source: input.poId ? 'PO' : 'Manual',
    }
    
    priceHistory.push(price)
    
    return lot
  },

  async issueMaterial(input: IssueMaterialForm): Promise<MaterialMovement | null> {
    const material = await this.getMaterial(input.materialId)
    if (!material) return null
    
    // Find lot to issue from (FIFO if not specified)
    let lotToIssue: MaterialLot | undefined
    if (input.lotId) {
      lotToIssue = materialLots.find(lot => lot.id === input.lotId)
    } else {
      // FIFO - oldest lot with available quantity
      const availableLots = materialLots
        .filter(lot => lot.materialId === input.materialId && lot.quantity > 0)
        .sort((a, b) => a.receivedAt - b.receivedAt)
      lotToIssue = availableLots[0]
    }
    
    if (!lotToIssue || lotToIssue.quantity < input.quantity) {
      throw new Error('Insufficient inventory')
    }
    
    // Update lot quantity
    lotToIssue.quantity -= input.quantity
    
    // Record movement
    const movement: MaterialMovement = {
      id: `mov_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      at: Date.now(),
      type: 'ISSUE',
      materialId: input.materialId,
      lotId: lotToIssue.id,
      fromLocationId: lotToIssue.locationId,
      quantity: input.quantity,
      unitCost: lotToIssue.unitCost,
      orderId: input.orderId,
      itemId: input.itemId,
      reason: input.reason,
      actor: 'system',
    }
    
    materialMovements.push(movement)
    return movement
  },

  async transferMaterial(input: TransferMaterialForm): Promise<MaterialMovement | null> {
    const lot = materialLots.find(l => l.id === input.lotId)
    if (!lot || lot.quantity < input.quantity) return null
    
    // Update lot location if transferring entire lot
    if (lot.quantity === input.quantity) {
      lot.locationId = input.toLocationId
    } else {
      // Split lot - create new lot at destination
      const newLot: MaterialLot = {
        ...lot,
        id: `lot_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        quantity: input.quantity,
        locationId: input.toLocationId,
      }
      materialLots.push(newLot)
      lot.quantity -= input.quantity
    }
    
    const movement: MaterialMovement = {
      id: `mov_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      at: Date.now(),
      type: 'TRANSFER',
      materialId: input.materialId,
      lotId: input.lotId,
      fromLocationId: input.fromLocationId,
      toLocationId: input.toLocationId,
      quantity: input.quantity,
      reason: input.reason,
      actor: 'system',
    }
    
    materialMovements.push(movement)
    return movement
  },

  async adjustMaterial(input: AdjustMaterialForm): Promise<MaterialMovement | null> {
    const lot = materialLots.find(l => l.id === input.lotId)
    if (!lot) return null
    
    lot.quantity += input.quantity // can be negative
    if (lot.quantity < 0) lot.quantity = 0
    
    const movement: MaterialMovement = {
      id: `mov_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      at: Date.now(),
      type: 'ADJUST',
      materialId: input.materialId,
      lotId: input.lotId,
      quantity: input.quantity,
      reason: input.reason,
      actor: 'system',
    }
    
    materialMovements.push(movement)
    return movement
  },

  async getMaterialMovements(materialId: string): Promise<MaterialMovement[]> {
    return materialMovements
      .filter(mov => mov.materialId === materialId)
      .sort((a, b) => b.at - a.at)
  },

  async getInventorySnapshot(materialId: string): Promise<InventorySnapshot> {
    const lots = materialLots.filter(lot => lot.materialId === materialId)
    const onHand = lots.reduce((sum, lot) => sum + lot.quantity, 0)
    const value = lots.reduce((sum, lot) => sum + (lot.quantity * lot.unitCost), 0)
    
    return {
      materialId,
      onHand,
      onOrder: 0, // TODO: calculate from POs
      allocated: 0, // TODO: calculate from order allocations
      available: onHand,
      value,
      currency: materialSettings.defaultCurrency,
    }
  },

  async getPriceHistory(materialId: string): Promise<PriceHistory[]> {
    return priceHistory
      .filter(p => p.materialId === materialId)
      .sort((a, b) => b.at - a.at)
  },

  async getLocations(): Promise<Location[]> {
    return [...locations]
  },

  async createLocation(input: Omit<Location, 'id'>): Promise<Location> {
    const location: Location = {
      ...input,
      id: `loc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    }
    locations.push(location)
    return location
  },

  async getLabelTemplates(): Promise<LabelTemplate[]> {
    return [...labelTemplates]
  },

  async createLabelTemplate(input: Omit<LabelTemplate, 'id'>): Promise<LabelTemplate> {
    const template: LabelTemplate = {
      ...input,
      id: `tpl_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    }
    labelTemplates.push(template)
    return template
  },

  async getUnitConversions(): Promise<UnitConversion[]> {
    return [...unitConversions]
  },

  async updateUnitConversions(conversions: UnitConversion[]): Promise<void> {
    unitConversions = [...conversions]
  },

  async getMaterialSettings(): Promise<MaterialSettings> {
    return { ...materialSettings }
  },

  async updateMaterialSettings(settings: Partial<MaterialSettings>): Promise<MaterialSettings> {
    materialSettings = { ...materialSettings, ...settings }
    return materialSettings
  },

  async getCategoryTemplates(): Promise<typeof DEFAULT_CATEGORY_TEMPLATES> {
    return DEFAULT_CATEGORY_TEMPLATES
  },

  // Initialize demo materials data
  async initializeMaterialsDemo(): Promise<void> {
    // Clear existing data
    materials = []
    materialLots = []
    materialMovements = []
    priceHistory = []
    locations = []
    labelTemplates = []
    
    // Create demo locations
    locations.push(
      { id: 'loc-1', name: 'WH-A1-BIN01', kind: 'bin' },
      { id: 'loc-2', name: 'WH-A1-BIN02', kind: 'bin' },
      { id: 'loc-3', name: 'WH-B2-RACK01', kind: 'rack' },
      { id: 'loc-4', name: 'FLOOR-CUTTING', kind: 'room' }
    )
    
    // Create demo materials
    const demoMaterials: Omit<Material, 'id' | 'createdAt' | 'updatedAt'>[] = [
      {
        code: 'FAB-001',
        name: 'Cotton Canvas - Natural',
        category: 'fabric',
        defaultUnit: 'm',
        attributes: {
          composition: '100% Cotton',
          gsm: 280,
          weave: 'Plain',
          stretch: false,
          washable: true
        },
        reorderPoint: 50,
      },
      {
        code: 'FAB-002',
        name: 'Denim - Indigo Blue',
        category: 'fabric',
        defaultUnit: 'm',
        attributes: {
          composition: '98% Cotton, 2% Elastane',
          gsm: 320,
          weave: 'Twill',
          stretch: true,
          washable: true
        },
        reorderPoint: 30,
      },
      {
        code: 'TRM-001',
        name: 'Metal Buttons - Silver',
        category: 'trim',
        defaultUnit: 'pc',
        attributes: {
          size: '15mm',
          material: 'Brass',
          finish: 'Brushed',
          colorfast: true
        },
        reorderPoint: 500,
      },
      {
        code: 'ACC-001',
        name: 'YKK Zipper - Black',
        category: 'accessory',
        defaultUnit: 'pc',
        attributes: {
          type: 'Zipper',
          size: '12"',
          material: 'Nylon',
          color: 'Black'
        },
        reorderPoint: 100,
      }
    ]
    
    // Create materials and lots
    for (const materialData of demoMaterials) {
      const material = await this.createMaterial(materialData)
      
      // Create some demo lots
      if (material.category === 'fabric') {
        await this.receiveMaterial({
          materialId: material.id,
          quantity: 100,
          unitCost: 15.50,
          unit: 'm',
          lotCode: 'LOT-2024-001',
          color: material.name.includes('Indigo') ? 'Indigo Blue' : 'Natural',
          widthMm: 1500,
          locationId: 'loc-1',
        })
        
        await this.receiveMaterial({
          materialId: material.id,
          quantity: 75,
          unitCost: 16.20,
          unit: 'm',
          lotCode: 'LOT-2024-002',
          color: material.name.includes('Indigo') ? 'Indigo Blue' : 'Natural',
          widthMm: 1500,
          locationId: 'loc-2',
        })
      } else {
        await this.receiveMaterial({
          materialId: material.id,
          quantity: material.category === 'trim' ? 1000 : 200,
          unitCost: material.category === 'trim' ? 0.25 : 2.50,
          unit: material.defaultUnit,
          lotCode: 'LOT-2024-001',
          locationId: 'loc-3',
        })
      }
    }
    
    // Create some demo movements (issues)
    const fabricMaterial = materials.find(m => m.code === 'FAB-001')
    if (fabricMaterial) {
      await this.issueMaterial({
        materialId: fabricMaterial.id,
        quantity: 25,
        unit: 'm',
        reason: 'Production Order #PO-001',
      })
    }
    
    // Create demo label templates
    labelTemplates.push(
      {
        id: 'tpl-material',
        name: 'Material Label',
        scope: 'material',
        widthMm: 50,
        heightMm: 30,
        fields: [
          { key: 'code', x: 5, y: 5, font: 12 },
          { key: 'name', x: 5, y: 15, font: 10 },
          { key: 'qr', x: 35, y: 5, font: 0 }
        ]
      },
      {
        id: 'tpl-lot',
        name: 'Lot Label',
        scope: 'lot',
        widthMm: 60,
        heightMm: 40,
        fields: [
          { key: 'lotCode', x: 5, y: 5, font: 12 },
          { key: 'materialName', x: 5, y: 15, font: 10 },
          { key: 'quantity', x: 5, y: 25, font: 10 },
          { key: 'qr', x: 40, y: 10, font: 0 }
        ]
      }
    )
  },

  // Purchase Orders methods
  async getPendingMaterialOrders(): Promise<any[]> {
    // Mock pending orders data - in real app would come from database
    return [
      {
        id: 'po-001',
        materialId: materials[0]?.id,
        materialName: materials[0]?.name,
        quantity: 100,
        unit: materials[0]?.defaultUnit,
        unitCost: 15.50,
        totalValue: 1550,
        supplier: 'Fabric World Inc.',
        expectedDelivery: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days from now
        status: 'pending',
        createdAt: Date.now() - 2 * 24 * 60 * 60 * 1000, // 2 days ago
      },
      {
        id: 'po-002',
        materialId: materials[1]?.id,
        materialName: materials[1]?.name,
        quantity: 50,
        unit: materials[1]?.defaultUnit,
        unitCost: 18.75,
        totalValue: 937.50,
        supplier: 'Premium Textiles Ltd.',
        expectedDelivery: Date.now() + 10 * 24 * 60 * 60 * 1000, // 10 days from now
        status: 'pending',
        createdAt: Date.now() - 1 * 24 * 60 * 60 * 1000, // 1 day ago
      }
    ]
  },

  async createPurchaseOrder(materialId: string, quantity: number, unitCost: number, supplier: string, notes?: string): Promise<string> {
    const material = materials.find(m => m.id === materialId)
    if (!material) throw new Error('Material not found')

    const poId = `po-${Date.now()}`
    const po = {
      id: poId,
      materialId,
      materialName: material.name,
      quantity,
      unit: material.defaultUnit,
      unitCost,
      totalValue: quantity * unitCost,
      supplier,
      expectedDelivery: Date.now() + 14 * 24 * 60 * 60 * 1000, // 2 weeks default
      status: 'pending',
      notes,
      createdAt: Date.now(),
    }

    // In real app, would save to database
    console.log('Created PO:', po)
    return poId
  },

  async getPurchaseOrderHistory(materialId: string): Promise<any[]> {
    // Mock PO history - in real app would query database
    return [
      {
        id: 'po-hist-001',
        materialId,
        quantity: 150,
        unitCost: 14.25,
        totalValue: 2137.50,
        supplier: 'Fabric World Inc.',
        status: 'completed',
        orderDate: Date.now() - 30 * 24 * 60 * 60 * 1000,
        deliveredDate: Date.now() - 23 * 24 * 60 * 60 * 1000,
      },
      {
        id: 'po-hist-002',
        materialId,
        quantity: 200,
        unitCost: 15.80,
        totalValue: 3160,
        supplier: 'Premium Textiles Ltd.',
        status: 'completed',
        orderDate: Date.now() - 60 * 24 * 60 * 60 * 1000,
        deliveredDate: Date.now() - 52 * 24 * 60 * 60 * 1000,
      }
    ]
  },

  // Locations methods
  async getLocations(): Promise<Location[]> {
    return [...locations]
  },

  async createLocation(location: Omit<Location, 'id'>): Promise<string> {
    const id = `loc-${Date.now()}`
    locations.push({ ...location, id })
    return id
  },

  async updateLocation(id: string, updates: Partial<Location>): Promise<void> {
    const index = locations.findIndex(l => l.id === id)
    if (index >= 0) {
      locations[index] = { ...locations[index], ...updates }
    }
  },

  async deleteLocation(id: string): Promise<void> {
    const index = locations.findIndex(l => l.id === id)
    if (index >= 0) {
      locations.splice(index, 1)
    }
  },

  async getMaterialLotsByLocation(materialId: string): Promise<Record<string, MaterialLot[]>> {
    const materialLotsByLocation: Record<string, MaterialLot[]> = {}
    
    materialLots
      .filter(lot => lot.materialId === materialId && lot.quantity > 0)
      .forEach(lot => {
        const locationId = lot.locationId || 'unassigned'
        if (!materialLotsByLocation[locationId]) {
          materialLotsByLocation[locationId] = []
        }
        materialLotsByLocation[locationId].push(lot)
      })
    
    return materialLotsByLocation
  },

  // Usage analytics methods
  async getMaterialUsageAnalytics(materialId: string, days: number = 30): Promise<any> {
    const cutoffDate = Date.now() - (days * 24 * 60 * 60 * 1000)
    const movements = materialMovements.filter(m => 
      m.materialId === materialId && 
      m.at >= cutoffDate &&
      m.type === 'ISSUE'
    )

    // Calculate daily usage
    const dailyUsage: Record<string, number> = {}
    movements.forEach(movement => {
      const date = new Date(movement.at).toISOString().split('T')[0]
      dailyUsage[date] = (dailyUsage[date] || 0) + movement.quantity
    })

    const totalUsage = movements.reduce((sum, m) => sum + m.quantity, 0)
    const avgDailyUsage = totalUsage / days
    const projectedRunOut = avgDailyUsage > 0 ? (await this.getInventorySnapshot(materialId)).onHand / avgDailyUsage : null

    return {
      totalUsage,
      avgDailyUsage,
      projectedRunOut,
      dailyUsage,
      movements: movements.slice(0, 10), // Recent 10 movements
    }
  },

  // Label generation methods
  async getLabelTemplates(): Promise<LabelTemplate[]> {
    return [...labelTemplates]
  },

  async generateMaterialLabel(materialId: string, templateId: string): Promise<string> {
    const material = materials.find(m => m.id === materialId)
    const template = labelTemplates.find(t => t.id === templateId)
    
    if (!material || !template) throw new Error('Material or template not found')

    // Mock label generation - in real app would generate actual PDF/image
    const labelData = {
      material,
      template,
      qrData: `material:${material.id}`,
      generatedAt: Date.now(),
    }

    console.log('Generated label:', labelData)
    return `label-${Date.now()}.pdf`
  },

  async generateLotLabel(lotId: string, templateId: string): Promise<string> {
    const lot = materialLots.find(l => l.id === lotId)
    const template = labelTemplates.find(t => t.id === templateId)
    
    if (!lot || !template) throw new Error('Lot or template not found')

    const material = materials.find(m => m.id === lot.materialId)
    
    const labelData = {
      lot,
      material,
      template,
      qrData: `lot:${lot.id}`,
      generatedAt: Date.now(),
    }

    console.log('Generated lot label:', labelData)
    return `lot-label-${Date.now()}.pdf`
  },

  // Material alerts methods
  async getMaterialAlerts(): Promise<any[]> {
    const alerts = []
    
    // Check for low stock alerts
    for (const material of materials) {
      const snapshot = await this.getInventorySnapshot(material.id)
      if (isLowStock(material, snapshot.onHand)) {
        alerts.push({
          id: `alert-low-stock-${material.id}`,
          type: 'low_stock',
          severity: 'warning',
          materialId: material.id,
          materialName: material.name,
          message: `${material.name} is below reorder point (${snapshot.onHand} ${material.defaultUnit} remaining)`,
          createdAt: Date.now(),
          acknowledged: false,
        })
      }
    }

    // Check for high usage alerts
    for (const material of materials) {
      const analytics = await this.getMaterialUsageAnalytics(material.id, 7)
      if (analytics.avgDailyUsage > 10) { // Mock threshold
        alerts.push({
          id: `alert-high-usage-${material.id}`,
          type: 'high_usage',
          severity: 'info',
          materialId: material.id,
          materialName: material.name,
          message: `${material.name} has high usage: ${analytics.avgDailyUsage.toFixed(1)} ${material.defaultUnit}/day`,
          createdAt: Date.now(),
          acknowledged: false,
        })
      }
    }

    return alerts.sort((a, b) => b.createdAt - a.createdAt)
  },

  async acknowledgeAlert(alertId: string): Promise<void> {
    console.log('Acknowledged alert:', alertId)
    // In real app, would update database
  },

  // Settings methods
  async updateMaterialSettings(settings: Partial<MaterialSettings>): Promise<void> {
    materialSettings = { ...materialSettings, ...settings }
  },

  async getMaterialSettings(): Promise<MaterialSettings> {
    return { ...materialSettings }
  },

  // Additional methods for new features
  async getMaterialLots(materialId: string): Promise<MaterialLot[]> {
    return materialLots.filter(lot => lot.materialId === materialId)
  },

  async getPriceHistory(materialId: string): Promise<PriceHistory[]> {
    return priceHistory
      .filter(p => p.materialId === materialId)
      .sort((a, b) => b.at - a.at) // Most recent first
  },

  async addPriceHistory(priceData: Omit<PriceHistory, 'id' | 'at'>): Promise<string> {
    const id = `price-${Date.now()}`
    const price: PriceHistory = {
      ...priceData,
      id,
      at: Date.now()
    }
    priceHistory.push(price)
    return id
  },

  async getAuditTrail(materialId: string): Promise<any[]> {
    // Mock audit trail data - in real app would come from database
    return [
      {
        id: 'audit-001',
        timestamp: Date.now() - 2 * 24 * 60 * 60 * 1000,
        action: 'CREATE',
        entity: 'material',
        entityId: materialId,
        actor: 'John Doe',
        changes: {
          name: { from: null, to: 'Cotton Canvas - Natural' },
          code: { from: null, to: 'FAB-001' },
          category: { from: null, to: 'fabric' }
        }
      },
      {
        id: 'audit-002',
        timestamp: Date.now() - 1 * 24 * 60 * 60 * 1000,
        action: 'RECEIVE',
        entity: 'lot',
        entityId: 'lot-001',
        actor: 'Jane Smith',
        changes: {
          quantity: { from: 0, to: 100 },
          unitCost: { from: null, to: 15.50 }
        },
        metadata: {
          lotCode: 'LOT-2024-001',
          location: 'WH-A1-BIN01'
        }
      },
      {
        id: 'audit-003',
        timestamp: Date.now() - 6 * 60 * 60 * 1000,
        action: 'UPDATE',
        entity: 'material',
        entityId: materialId,
        actor: 'John Doe',
        changes: {
          reorderPoint: { from: 30, to: 50 }
        }
      },
      {
        id: 'audit-004',
        timestamp: Date.now() - 2 * 60 * 60 * 1000,
        action: 'ISSUE',
        entity: 'lot',
        entityId: 'lot-001',
        actor: 'Mike Johnson',
        changes: {
          quantity: { from: 100, to: 75 }
        },
        metadata: {
          reason: 'Production Order #PO-001',
          issuedTo: 'Cutting Department'
        }
      }
    ].sort((a, b) => b.timestamp - a.timestamp)
  },
}
