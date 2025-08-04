"use client";

import { useWorkflows, useItemMutations } from "@/hooks/use-convex";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { generateUniqueItemId } from "@/lib/item-utils";
import { useState } from "react";

export default function TestItemCreationPage() {
  const { workflows, isLoading } = useWorkflows();
  const { createItem } = useItemMutations();
  const { toast } = useToast();
  const [createdItems, setCreatedItems] = useState<any[]>([]);

  const handleCreateTestItem = async () => {
    if (!workflows || workflows.length === 0) {
      toast({
        title: "No Workflows",
        description: "Please seed the database first with workflows",
        variant: "destructive",
      });
      return;
    }

    try {
      const uniqueItemId = generateUniqueItemId("TEST-ITEM");
      const workflowId = workflows[0]._id;

      const itemId = await createItem({
        itemId: uniqueItemId,
        workflowId,
        metadata: {
          sku: "TEST-ITEM",
          brand: "Test Brand",
          fabricCode: "COT-100-JER",
          color: "Blue",
          size: "M",
          style: "Test Style",
          season: "SS24",
          notes: "Test item created for verification",
          quantity: 1,
        },
      });

      const newItem = {
        _id: itemId,
        id: uniqueItemId,
        sku: "TEST-ITEM",
        qrData: uniqueItemId,
        currentStageId: "stage-1",
        workflowId,
        status: "active",
        metadata: {
          brand: "Test Brand",
          fabricCode: "COT-100-JER",
          color: "Blue",
          size: "M",
          style: "Test Style",
          season: "SS24",
          notes: "Test item created for verification",
        },
      };

      setCreatedItems([...createdItems, newItem]);

      toast({
        title: "Success",
        description: `Created test item: ${uniqueItemId}`,
      });
    } catch (error) {
      console.error("Error creating test item:", error);
      toast({
        title: "Error",
        description: "Failed to create test item",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p>Loading workflows...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Item Creation Test</h1>
      
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Test Item Creation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <Button onClick={handleCreateTestItem} className="bg-blue-600 hover:bg-blue-700">
                Create Test Item
              </Button>
              <div className="text-sm text-gray-600">
                Available workflows: {workflows?.length || 0}
              </div>
            </div>
            
            {workflows && workflows.length > 0 && (
              <div>
                <h3 className="font-medium mb-2">Available Workflows:</h3>
                <div className="space-y-2">
                  {workflows.map((workflow) => (
                    <div key={workflow._id} className="flex items-center gap-2">
                      <Badge variant="outline">{workflow.name}</Badge>
                      <span className="text-sm text-gray-600">
                        {workflow.stages?.length || 0} stages
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {createdItems.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Created Items ({createdItems.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {createdItems.map((item, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <div className="font-medium">{item.id}</div>
                        <div className="text-sm text-gray-600">SKU: {item.sku}</div>
                      </div>
                      <Badge variant="outline">{item.status}</Badge>
                    </div>
                    <div className="text-sm text-gray-600">
                      <div>Workflow: {item.workflowId}</div>
                      <div>Stage: {item.currentStageId}</div>
                      {item.metadata && (
                        <div>
                          Brand: {item.metadata.brand} • Color: {item.metadata.color} • Size: {item.metadata.size}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
} 