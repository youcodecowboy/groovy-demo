import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type {
    Workflow,
    Item,
    CreateWorkflowInput,
    CreateItemsBulkInput,
    AdvanceItemInput,
    GetItemsParams,
} from "@/types/schema";

// Helper function to convert Convex workflow to app workflow format
const convertConvexWorkflow = (convexWorkflow: any): Workflow => {
  return {
    id: convexWorkflow._id,
    name: convexWorkflow.name,
    description: convexWorkflow.description || "",
    entryStageId: convexWorkflow.stages[0]?.id || "",
    stages: convexWorkflow.stages.map((stage: any) => ({
      id: stage.id,
      name: stage.name,
      description: stage.description || "",
      color: getStageColor(stage.name),
      order: stage.order,
      actions: stage.actions || [],
      allowedNextStageIds: getNextStageIds(convexWorkflow.stages, stage.order),
    })),
  };
};

// Helper function to convert Convex item to app item format
const convertConvexItem = (convexItem: any): Item => {
  return {
    id: convexItem._id,
    sku: convexItem.itemId,
    qrData: convexItem.qrCode || convexItem.itemId,
    currentStageId: convexItem.currentStageId,
    workflowId: convexItem.workflowId,
    status: convexItem.status,
    createdAt: new Date(convexItem.startedAt).toISOString(),
    activatedAt: new Date(convexItem.startedAt).toISOString(),
    completedAt: convexItem.completedAt ? new Date(convexItem.completedAt).toISOString() : undefined,
    metadata: convexItem.metadata || {},
    history: [], // Will be populated separately if needed
  };
};

// Helper function to get stage color based on name
const getStageColor = (stageName: string): string => {
  const name = stageName.toLowerCase();
  if (name.includes("cut")) return "#ef4444";
  if (name.includes("sew")) return "#f97316";
  if (name.includes("wash")) return "#3b82f6";
  if (name.includes("qc") || name.includes("quality")) return "#8b5cf6";
  if (name.includes("pack")) return "#10b981";
  if (name.includes("dry")) return "#f59e0b";
  if (name.includes("press")) return "#8b5cf6";
  if (name.includes("ship")) return "#06b6d4";
  return "#6b7280";
};

// Helper function to get next stage IDs
const getNextStageIds = (stages: any[], currentOrder: number): string[] => {
  const nextStage = stages.find(stage => stage.order === currentOrder + 1);
  return nextStage ? [nextStage.id] : [];
};

export const useConvexDataAdapter = () => {
  // Queries
  const workflows = useQuery(api.workflows.getAll);
  const items = useQuery(api.items.getAll);
  const activeItems = useQuery(api.items.getActive);

  // Mutations
  const createWorkflowMutation = useMutation(api.workflows.create);
  const updateWorkflowMutation = useMutation(api.workflows.update);
  const deleteWorkflowMutation = useMutation(api.workflows.remove);
  const createItemMutation = useMutation(api.items.create);
  const advanceItemMutation = useMutation(api.items.advanceStage);
  const pauseItemMutation = useMutation(api.items.pauseItem);
  const resumeItemMutation = useMutation(api.items.resumeItem);
  const seedDemoDataMutation = useMutation(api.seed.seedDemoData);

  return {
    // Data getters
    getWorkflows: () => {
      if (!workflows) return [];
      return workflows.map(convertConvexWorkflow);
    },

    getItems: (params?: GetItemsParams) => {
      if (!items) return [];
      let filteredItems = items.map(convertConvexItem);

      if (params?.workflowId) {
        filteredItems = filteredItems.filter((item) => item.workflowId === params.workflowId);
      }

      if (params?.stageId) {
        filteredItems = filteredItems.filter((item) => item.currentStageId === params.stageId);
      }

      if (params?.status) {
        filteredItems = filteredItems.filter((item) => item.status === params.status);
      }

      if (params?.limit) {
        filteredItems = filteredItems.slice(0, params.limit);
      }

      return filteredItems.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    },

    getActiveItems: () => {
      if (!activeItems) return [];
      return activeItems.map(convertConvexItem);
    },

    // Workflow operations
    createWorkflow: async (input: CreateWorkflowInput): Promise<Workflow> => {
      const stages = input.stages.map((stage, index) => ({
        ...stage,
        order: index,
        isActive: true,
      }));

      const workflowId = await createWorkflowMutation({
        name: input.name,
        description: input.description,
        stages,
        createdBy: "admin@demo",
      });

      // Return the created workflow (you might need to fetch it)
      return {
        id: workflowId,
        name: input.name,
        description: input.description || "",
        entryStageId: input.entryStageId || input.stages[0]?.id || "",
        stages: stages.map((stage, index) => ({
          ...stage,
          color: getStageColor(stage.name),
          allowedNextStageIds: getNextStageIds(stages, index),
        })),
      };
    },

    updateWorkflow: async (workflowId: string, input: CreateWorkflowInput): Promise<Workflow> => {
      const stages = input.stages.map((stage, index) => ({
        ...stage,
        order: index,
        isActive: true,
      }));

      await updateWorkflowMutation({
        id: workflowId as any,
        name: input.name,
        description: input.description,
        stages,
      });

      return {
        id: workflowId,
        name: input.name,
        description: input.description || "",
        entryStageId: input.entryStageId || input.stages[0]?.id || "",
        stages: stages.map((stage, index) => ({
          ...stage,
          color: getStageColor(stage.name),
          allowedNextStageIds: getNextStageIds(stages, index),
        })),
      };
    },

    deleteWorkflow: async (workflowId: string): Promise<void> => {
      await deleteWorkflowMutation({ id: workflowId as any });
    },

    // Item operations
    createItemsBulk: async (input: CreateItemsBulkInput): Promise<Item[]> => {
      const createdItems: Item[] = [];
      
      for (let i = 1; i <= input.count; i++) {
        const itemId = `${input.skuPrefix}-${Date.now()}-${i.toString().padStart(3, "0")}`;
        
        const convexItemId = await createItemMutation({
          itemId,
          workflowId: input.workflowId as any,
          metadata: {
            brand: input.metadata?.brand || "Unknown",
            fabricCode: input.metadata?.fabricCode || "",
            color: input.metadata?.color || "",
            size: input.metadata?.size || "",
            style: input.metadata?.style || "",
            season: input.metadata?.season || "",
          },
        });

        createdItems.push({
          id: convexItemId,
          sku: itemId,
          qrData: itemId,
          currentStageId: "pending",
          workflowId: input.workflowId,
          status: "active",
          createdAt: new Date().toISOString(),
          activatedAt: new Date().toISOString(),
          metadata: {
            brand: input.metadata?.brand || "Unknown",
            fabricCode: input.metadata?.fabricCode || "",
            color: input.metadata?.color || "",
            size: input.metadata?.size || "",
            style: input.metadata?.style || "",
            season: input.metadata?.season || "",
          },
          history: [],
        });
      }

      return createdItems;
    },

    advanceItem: async (input: AdvanceItemInput): Promise<Item> => {
      const result = await advanceItemMutation({
        itemId: input.itemId as any,
        userId: "floor@demo",
        notes: input.completedActions?.map(action => action.label).join(", "),
      });

      // Return updated item (you might need to fetch it)
      return {
        id: input.itemId,
        sku: "", // Will be populated from actual item
        qrData: "",
        currentStageId: result.status === "completed" ? "completed" : (result as any).nextStage?.id || "",
        workflowId: "",
        status: result.status === "completed" ? "completed" : "active",
        createdAt: new Date().toISOString(),
        activatedAt: new Date().toISOString(),
        metadata: {},
        history: [],
      };
    },

    // Demo data operations
    resetDemoData: async (): Promise<void> => {
      await seedDemoDataMutation();
    },
  };
}; 