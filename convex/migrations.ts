import { mutation } from "./_generated/server";

// Migration function to clean up old workflow data
export const migrateWorkflows = mutation({
  args: {},
  handler: async (ctx) => {
    // Delete all existing workflows to start fresh
    const workflows = await ctx.db.query("workflows").collect();
    
    for (const workflow of workflows) {
      await ctx.db.delete(workflow._id);
    }
    
    return {
      message: `Deleted ${workflows.length} old workflows`,
      deletedCount: workflows.length,
    };
  },
});

// Temporary migration to handle existing completed items before schema change
export const handleExistingCompletedItems = mutation({
  args: {},
  handler: async (ctx) => {
    // Get all items with status "completed"
    const completedItems = await ctx.db
      .query("items")
      .filter((q) => q.eq(q.field("status"), "completed"))
      .collect();
    
    let processedCount = 0;
    
    for (const item of completedItems) {
      // For now, just change the status to "active" to avoid schema conflicts
      // We'll handle the proper migration later
      await ctx.db.patch(item._id, {
        status: "active",
      });
      processedCount++;
    }
    
    return {
      message: `Processed ${processedCount} completed items to avoid schema conflicts`,
      processedCount,
    };
  },
});

// Migration function to move completed items to new table
export const migrateCompletedItems = mutation({
  args: {},
  handler: async (ctx) => {
    // Get all items with status "completed"
    const completedItems = await ctx.db
      .query("items")
      .filter((q) => q.eq(q.field("status"), "completed"))
      .collect();
    
    let migratedCount = 0;
    
    for (const item of completedItems) {
      // Get the workflow to find the final stage name
      const workflow = await ctx.db.get(item.workflowId);
      if (!workflow) continue;
      
      const finalStage = workflow.stages.find(stage => stage.id === item.currentStageId);
      if (!finalStage) continue;
      
      // Create completed item record
      await ctx.db.insert("completedItems", {
        itemId: item.itemId,
        workflowId: item.workflowId,
        finalStageId: item.currentStageId,
        finalStageName: finalStage.name,
        metadata: item.metadata,
        startedAt: item.startedAt,
        completedAt: item.completedAt || item.updatedAt,
        assignedTo: item.assignedTo,
        qrCode: item.qrCode,
      });
      
      // Copy history to completed item history
      const history = await ctx.db
        .query("itemHistory")
        .filter((q) => q.eq(q.field("itemId"), item._id))
        .collect();
      
      for (const historyEntry of history) {
        await ctx.db.insert("completedItemHistory", {
          itemId: item.itemId,
          stageId: historyEntry.stageId,
          stageName: historyEntry.stageName,
          action: historyEntry.action,
          timestamp: historyEntry.timestamp,
          userId: historyEntry.userId,
          notes: historyEntry.notes,
          metadata: historyEntry.metadata,
        });
      }
      
      // Delete the original item and its history
      await ctx.db.delete(item._id);
      for (const historyEntry of history) {
        await ctx.db.delete(historyEntry._id);
      }
      
      migratedCount++;
    }
    
    return {
      message: `Migrated ${migratedCount} completed items to new table`,
      migratedCount,
    };
  },
});

// Migration function to add location fields to existing items
export const addLocationFields = mutation({
  args: {},
  handler: async (ctx) => {
    // Get all items that don't have currentLocationId field
    const items = await ctx.db.query("items").collect();
    
    let updatedCount = 0;
    
    for (const item of items) {
      // Only update items that don't have currentLocationId
      if (item.currentLocationId === undefined) {
        await ctx.db.patch(item._id, {
          currentLocationId: undefined, // Set to undefined explicitly
        });
        updatedCount++;
      }
    }
    
    // Get all completed items that don't have finalLocationId field
    const completedItems = await ctx.db.query("completedItems").collect();
    
    let completedUpdatedCount = 0;
    
    for (const completedItem of completedItems) {
      // Only update items that don't have finalLocationId
      if (completedItem.finalLocationId === undefined) {
        await ctx.db.patch(completedItem._id, {
          finalLocationId: undefined, // Set to undefined explicitly
        });
        completedUpdatedCount++;
      }
    }
    
    return {
      message: `Added location fields to ${updatedCount} active items and ${completedUpdatedCount} completed items`,
      activeItemsUpdated: updatedCount,
      completedItemsUpdated: completedUpdatedCount,
    };
  },
});

// Migration function to ensure locationHistory table exists
export const ensureLocationHistoryTable = mutation({
  args: {},
  handler: async (ctx) => {
    // This migration ensures the locationHistory table exists
    // The table will be created automatically by Convex when the schema is deployed
    return {
      message: "Location history table ensured",
      timestamp: Date.now(),
    };
  },
}); 