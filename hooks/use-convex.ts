import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

// Hook for workflows
export const useWorkflows = () => {
  const workflows = useQuery(api.workflows.getAll);
  const activeWorkflows = useQuery(api.workflows.getActive);
  
  return {
    workflows,
    activeWorkflows,
    isLoading: workflows === undefined,
  };
};

// Hook for items
export const useItems = () => {
  const allItems = useQuery(api.items.getAll);
  const activeItems = useQuery(api.items.getActive);
  
  return {
    allItems,
    activeItems,
    isLoading: allItems === undefined,
  };
};

// Hook for item by ID
export const useItem = (itemId: string) => {
  const item = useQuery(api.items.getByItemId, { itemId });
  
  return {
    item,
    isLoading: item === undefined,
  };
};

// Hook for item history
export const useItemHistory = (itemId: string) => {
  const history = useQuery(api.items.getHistory, { itemId });
  
  return {
    history,
    isLoading: history === undefined,
  };
};

// Mutations
export const useWorkflowMutations = () => {
  const createWorkflow = useMutation(api.workflows.create);
  const updateWorkflow = useMutation(api.workflows.update);
  const deleteWorkflow = useMutation(api.workflows.remove);
  const toggleWorkflow = useMutation(api.workflows.toggleActive);
  
  return {
    createWorkflow,
    updateWorkflow,
    deleteWorkflow,
    toggleWorkflow,
  };
};

export const useItemMutations = () => {
  const createItem = useMutation(api.items.create);
  const advanceStage = useMutation(api.items.advanceStage);
  const advanceToStage = useMutation(api.items.advanceToStage);
  const pauseItem = useMutation(api.items.pauseItem);
  const resumeItem = useMutation(api.items.resumeItem);
  
  return {
    createItem,
    advanceStage,
    advanceToStage,
    pauseItem,
    resumeItem,
  };
}; 