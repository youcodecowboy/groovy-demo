import type {
    Workflow,
    Item,
    CreateWorkflowInput,
    CreateItemsBulkInput,
    AdvanceItemInput,
    GetItemsParams,
} from "@/types/schema"

// Mock data storage
let workflows: Workflow[] = []
let items: Item[] = []

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
}
