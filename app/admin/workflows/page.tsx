"use client";

import { useState } from "react";
import { useWorkflows } from "@/hooks/use-convex";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { AdminSidebar } from "@/components/layout/admin-sidebar";
import { Plus, Settings, Copy, Edit, Trash2, Clock, AlertTriangle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

export default function WorkflowsPage() {
  const { workflows, isLoading } = useWorkflows();
  const router = useRouter();
  const { toast } = useToast();
  const deleteWorkflow = useMutation(api.workflows.remove);
  
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [workflowToDelete, setWorkflowToDelete] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Get usage details for the workflow to be deleted
  const usageDetails = useQuery(
    api.workflows.getWorkflowUsageDetails,
    workflowToDelete ? { id: workflowToDelete._id } : "skip"
  );

  const handleCreateWorkflow = () => {
    router.push("/admin/workflow");
  };

  const handleEditWorkflow = (workflowId: string) => {
    router.push(`/admin/workflow?edit=${workflowId}`);
  };

  const handleDuplicateWorkflow = (workflow: any) => {
    // This would create a copy of the workflow
    console.log("Duplicate workflow:", workflow);
  };

  const handleDeleteWorkflow = (workflow: any) => {
    setWorkflowToDelete(workflow);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteWorkflow = async () => {
    if (!workflowToDelete) return;
    
    setIsDeleting(true);
    try {
      await deleteWorkflow({ id: workflowToDelete._id });
      toast({
        title: "Workflow Deleted",
        description: `"${workflowToDelete.name}" has been deleted successfully.`,
      });
      setDeleteDialogOpen(false);
      setWorkflowToDelete(null);
    } catch (error: any) {
      console.error("Delete workflow error:", error);
      
      // Handle different types of errors
      let errorTitle = "Cannot Delete Workflow";
      let errorMessage = "Failed to delete workflow. Please try again.";
      
      if (error?.message) {
        errorMessage = error.message;
      } else if (error?.data?.message) {
        errorMessage = error.data.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      // Check for specific error patterns
      if (errorMessage.includes("active items")) {
        errorTitle = "Active Items Found";
        errorMessage = errorMessage + "\n\nPlease complete or pause all items using this workflow before deleting.";
      } else if (errorMessage.includes("Cannot delete workflow")) {
        errorTitle = "Workflow in Use";
      }
      
      toast({
        title: errorTitle,
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const getWorkflowStats = (workflow: any) => {
    const totalStages = workflow.stages?.length || 0;
    const totalActions = workflow.stages?.reduce((sum: number, stage: any) => 
      sum + (stage.actions?.length || 0), 0) || 0;
    const totalDuration = workflow.stages?.reduce((sum: number, stage: any) => 
      sum + (stage.estimatedDuration || 0), 0) || 0;
    
    return { totalStages, totalActions, totalDuration };
  };

  if (isLoading) {
    return (
      <AdminSidebar>
        <div className="flex-1 p-8">
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p>Loading workflows...</p>
            </div>
          </div>
        </div>
      </AdminSidebar>
    );
  }

  return (
    <AdminSidebar>
      <div className="flex-1 p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Workflow Library</h1>
            <p className="text-gray-600 mt-2">
              Manage and configure production workflows for different product types
            </p>
          </div>
          <Button onClick={handleCreateWorkflow} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Create Workflow
          </Button>
        </div>

        {workflows && workflows.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {workflows.map((workflow) => {
              const stats = getWorkflowStats(workflow);
              return (
                <Card key={workflow._id} className="hover:shadow-lg transition-shadow duration-200">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg mb-2">{workflow.name}</CardTitle>
                        <p className="text-sm text-gray-600 mb-3">
                          {workflow.description || "No description provided"}
                        </p>
                        <div className="flex items-center gap-2">
                          <Badge variant={workflow.isActive ? "default" : "secondary"}>
                            {workflow.isActive ? "Active" : "Inactive"}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {stats.totalStages} stages
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          onClick={() => handleEditWorkflow(workflow._id)}
                          size="sm"
                          variant="ghost"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          onClick={() => handleDuplicateWorkflow(workflow)}
                          size="sm"
                          variant="ghost"
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                        <Button
                          onClick={() => handleDeleteWorkflow(workflow)}
                          size="sm"
                          variant="ghost"
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {/* Workflow Stats */}
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <div className="text-lg font-semibold text-gray-900">{stats.totalStages}</div>
                          <div className="text-xs text-gray-600">Stages</div>
                        </div>
                        <div>
                          <div className="text-lg font-semibold text-gray-900">{stats.totalActions}</div>
                          <div className="text-xs text-gray-600">Actions</div>
                        </div>
                        <div>
                          <div className="text-lg font-semibold text-gray-900">{stats.totalDuration}m</div>
                          <div className="text-xs text-gray-600">Duration</div>
                        </div>
                      </div>

                      {/* Stage Preview */}
                      {workflow.stages && workflow.stages.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Stages</h4>
                          <div className="space-y-1">
                            {workflow.stages.slice(0, 3).map((stage: any, index: number) => (
                              <div key={stage.id || `stage-${index}`} className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2">
                                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                  <span className="text-gray-700">{stage.name}</span>
                                </div>
                                <div className="flex items-center gap-1 text-xs text-gray-500">
                                  <Clock className="w-3 h-3" />
                                  {stage.estimatedDuration || 15}m
                                </div>
                              </div>
                            ))}
                            {workflow.stages.length > 3 && (
                              <div className="text-xs text-gray-500 text-center">
                                +{workflow.stages.length - 3} more stages
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Action Types */}
                      {workflow.stages && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Action Types</h4>
                          <div className="flex flex-wrap gap-1">
                            {Array.from(new Set(workflow.stages.flatMap((stage: any) => 
                              stage.actions?.map((action: any) => action.type) || []
                            ))).filter(Boolean).map((actionType, index) => (
                              <Badge key={actionType || `action-type-${index}`} variant="outline" className="text-xs">
                                {actionType}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
              <Settings className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Workflows Yet</h3>
            <p className="text-gray-600 mb-6">
              Create your first workflow to start defining production processes
            </p>
            <Button onClick={handleCreateWorkflow} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Workflow
            </Button>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              Delete Workflow
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{workflowToDelete?.name}"? This action cannot be undone.
              
              {usageDetails && (
                <div className="mt-4 space-y-3">
                  {usageDetails.activeItemCount > 0 && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded text-red-800 text-sm">
                      <div className="font-medium mb-2">⚠️ Cannot Delete - Active Items Found</div>
                      <div className="text-xs">
                        {usageDetails.activeItemCount} active item{usageDetails.activeItemCount > 1 ? 's' : ''} using this workflow:
                      </div>
                      <div className="mt-1 space-y-1">
                        {usageDetails.activeItems.slice(0, 3).map((item: any) => (
                          <div key={item.itemId} className="text-xs bg-red-100 px-2 py-1 rounded">
                            {item.itemId} ({item.status})
                          </div>
                        ))}
                        {usageDetails.activeItems.length > 3 && (
                          <div className="text-xs text-red-600">
                            +{usageDetails.activeItems.length - 3} more items
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {usageDetails.completedItemCount > 0 && (
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded text-blue-800 text-sm">
                      <div className="font-medium mb-1">📊 Usage History</div>
                      <div className="text-xs">
                        {usageDetails.completedItemCount} completed item{usageDetails.completedItemCount > 1 ? 's' : ''} used this workflow
                      </div>
                    </div>
                  )}
                  
                  {usageDetails.activeItemCount === 0 && usageDetails.completedItemCount === 0 && (
                    <div className="p-3 bg-green-50 border border-green-200 rounded text-green-800 text-sm">
                      ✅ No items using this workflow - safe to delete
                    </div>
                  )}
                </div>
              )}
              
              {workflowToDelete?.isActive && usageDetails?.activeItemCount === 0 && (
                <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-yellow-800 text-sm">
                  ⚠️ This workflow is currently active. Deleting it may affect future production.
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteWorkflow}
              disabled={isDeleting || (usageDetails?.activeItemCount || 0) > 0}
              className="bg-red-600 hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isDeleting ? "Deleting..." : usageDetails?.activeItemCount > 0 ? "Cannot Delete" : "Delete Workflow"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminSidebar>
  );
}
