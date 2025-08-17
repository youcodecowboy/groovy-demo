import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Update item location
export const updateLocation = mutation({
  args: {
    itemId: v.string(),
    locationId: v.string(),
    movedBy: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    
    // URL decode the itemId to handle spaces and special characters
    const decodedItemId = decodeURIComponent(args.itemId);
    
    // Find the item by itemId
    const item = await ctx.db
      .query("items")
      .filter((q) => q.eq(q.field("itemId"), decodedItemId))
      .first();
    
    if (!item) {
      throw new Error(`Item with ID ${decodedItemId} not found`);
    }
    
    // Find the location by its name/ID string
    const location = await ctx.db
      .query("locations")
      .filter((q) => q.eq(q.field("name"), args.locationId))
      .first();
    
    if (!location) {
      throw new Error(`Location ${args.locationId} not found`);
    }
    
    // Update the item's location
    await ctx.db.patch(item._id, {
      currentLocationId: location._id,
      updatedAt: now,
    });
    
    // Log the location change in item history
    await ctx.db.insert("itemHistory", {
      itemId: item._id,
      stageId: item.currentStageId,
      stageName: "Location Change", // We'll need to get the actual stage name
      action: "location_changed",
      timestamp: now,
      userId: args.movedBy,
      notes: `Moved to location: ${args.locationId}`,
      metadata: {
        previousLocationId: item.currentLocationId,
        newLocationId: location._id,
      },
    });
    
    return {
      success: true,
      message: `Item ${args.itemId} moved to location ${args.locationId}`,
    };
  },
});

// Get all items
export const getAll = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("items").order("desc").collect();
  },
});

// Get active items
export const getActive = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("items")
      .filter((q) => q.eq(q.field("status"), "active"))
      .order("desc")
      .collect();
  },
});

// Get completed items
export const getCompleted = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("completedItems").order("desc").collect();
  },
});

// Get completed items by workflow
export const getCompletedByWorkflow = query({
  args: { workflowId: v.id("workflows") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("completedItems")
      .filter((q) => q.eq(q.field("workflowId"), args.workflowId))
      .order("desc")
      .collect();
  },
});

// Get completed item by itemId
export const getCompletedByItemId = query({
  args: { itemId: v.string() },
  handler: async (ctx, args) => {
    // URL decode the itemId to handle spaces and special characters
    const decodedItemId = decodeURIComponent(args.itemId);
    
    return await ctx.db
      .query("completedItems")
      .filter((q) => q.eq(q.field("itemId"), decodedItemId))
      .first();
  },
});

// Get items by workflow
export const getByWorkflow = query({
  args: { workflowId: v.id("workflows") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("items")
      .filter((q) => q.eq(q.field("workflowId"), args.workflowId))
      .order("desc")
      .collect();
  },
});

// Get item by ID
export const getById = query({
  args: { id: v.id("items") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Get item by itemId (string identifier)
export const getByItemId = query({
  args: { itemId: v.string() },
  handler: async (ctx, args) => {
    // URL decode the itemId to handle spaces and special characters
    const decodedItemId = decodeURIComponent(args.itemId);
    
    return await ctx.db
      .query("items")
      .filter((q) => q.eq(q.field("itemId"), decodedItemId))
      .first();
  },
});

// Get items assigned to a user
export const getAssignedItems = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("items")
      .filter((q) => q.eq(q.field("assignedTo"), args.userId))
      .order("desc")
      .collect();
  },
});

// Get defective items
export const getDefectiveItems = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("items")
      .filter((q) => q.eq(q.field("isDefective"), true))
      .order("desc")
      .collect();
  },
});

// Get flagged items
export const getFlaggedItems = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("items")
      .filter((q) => q.neq(q.field("flaggedBy"), undefined))
      .order("desc")
      .collect();
  },
});

// Create a new item
export const create = mutation({
  args: {
    itemId: v.string(),
    workflowId: v.id("workflows"),
    metadata: v.optional(v.any()),
    assignedTo: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const workflow = await ctx.db.get(args.workflowId);
    if (!workflow) throw new Error("Workflow not found");
    
    // Get the first stage
    const firstStage = workflow.stages.find(stage => stage.order === 0);
    if (!firstStage) throw new Error("No stages found in workflow");
    
    const now = Date.now();
    const itemId = await ctx.db.insert("items", {
      itemId: args.itemId,
      workflowId: args.workflowId,
      currentStageId: firstStage.id,
      status: "active",
      metadata: args.metadata || {},
      startedAt: now,
      updatedAt: now,
      assignedTo: args.assignedTo,
      qrCode: `item:${args.itemId}`,
    });

    // Add to history
    await ctx.db.insert("itemHistory", {
      itemId,
      stageId: firstStage.id,
      stageName: firstStage.name,
      action: "started",
      timestamp: now,
      metadata: { stageOrder: firstStage.order },
    });

    // Create notification if item is assigned
    if (args.assignedTo) {
      await ctx.db.insert("notifications", {
        userId: args.assignedTo,
        type: "item_assigned",
        title: "New Item Assigned",
        message: `You have been assigned item: ${args.itemId}`,
        itemId: args.itemId,
        workflowId: args.workflowId,
        isRead: false,
        priority: "medium",
        createdAt: now,
      });
    }

    return itemId;
  },
});

// Helper function to move item to completed items table
const moveToCompletedItems = async (ctx: any, item: any, finalStage: any, userId?: string, notes?: string) => {
  const now = Date.now();
  
  // Create completed item record
  await ctx.db.insert("completedItems", {
    itemId: item.itemId,
    workflowId: item.workflowId,
    finalStageId: finalStage.id,
    finalStageName: finalStage.name,
    metadata: item.metadata,
    startedAt: item.startedAt,
    completedAt: now,
    assignedTo: item.assignedTo,
    qrCode: item.qrCode,
    finalLocationId: item.currentLocationId, // Preserve final location
    completionNotes: notes,
    completedBy: userId,
  });

  // Copy history to completed item history
  const history = await ctx.db
    .query("itemHistory")
    .filter((q: any) => q.eq(q.field("itemId"), item._id))
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

  // Add final completion entry to completed item history
  await ctx.db.insert("completedItemHistory", {
    itemId: item.itemId,
    stageId: finalStage.id,
    stageName: finalStage.name,
    action: "completed",
    timestamp: now,
    userId: userId,
    notes: notes,
    metadata: { stageOrder: finalStage.order },
  });

  // Create notification for assigned user if item was assigned
  if (item.assignedTo) {
    await ctx.db.insert("notifications", {
      userId: item.assignedTo,
      type: "item_completed",
      title: "Item Completed",
      message: `Item ${item.itemId} has been completed`,
      itemId: item.itemId,
      workflowId: item.workflowId,
      isRead: false,
      priority: "medium",
      createdAt: now,
    });
  }

  // Update location occupancy if item was in a location
  if (item.currentLocationId) {
    const itemsInLocation = await ctx.db
      .query("items")
      .filter((q: any) => q.eq(q.field("currentLocationId"), item.currentLocationId))
      .collect();
    
    // Subtract 1 from occupancy since we're about to delete the item
    const newOccupancy = Math.max(0, itemsInLocation.length - 1);
    
    await ctx.db.patch(item.currentLocationId, {
      currentOccupancy: newOccupancy,
      updatedAt: now,
    });
  }

  // Delete the original item and its history
  await ctx.db.delete(item._id);
  for (const historyEntry of history) {
    await ctx.db.delete(historyEntry._id);
  }
};

// Advance item to next stage
export const advanceStage = mutation({
  args: {
    itemId: v.id("items"),
    userId: v.optional(v.string()),
    notes: v.optional(v.string()),
    actionData: v.optional(v.any()), // Store detailed action data
  },
  handler: async (ctx, args) => {
    const item = await ctx.db.get(args.itemId);
    if (!item) throw new Error("Item not found");
    
    const workflow = await ctx.db.get(item.workflowId);
    if (!workflow) throw new Error("Workflow not found");
    
    const currentStage = workflow.stages.find(stage => stage.id === item.currentStageId);
    if (!currentStage) throw new Error("Current stage not found");
    
    const nextStage = workflow.stages.find(stage => stage.order === currentStage.order + 1);
    if (!nextStage) {
      // No next stage, move to completed items
      await moveToCompletedItems(ctx, item, currentStage, args.userId, args.notes);
      return { status: "completed" };
    }
    
    const now = Date.now();
    await ctx.db.patch(args.itemId, {
      currentStageId: nextStage.id,
      updatedAt: now,
    });
    
    // Add to history
    await ctx.db.insert("itemHistory", {
      itemId: args.itemId,
      stageId: currentStage.id,
      stageName: currentStage.name,
      action: "completed",
      timestamp: now,
      userId: args.userId,
      notes: args.notes,
      metadata: { 
        stageOrder: currentStage.order,
        actionData: args.actionData, // Store detailed action data
      },
    });
    
    await ctx.db.insert("itemHistory", {
      itemId: args.itemId,
      stageId: nextStage.id,
      stageName: nextStage.name,
      action: "started",
      timestamp: now,
      userId: args.userId,
      metadata: { stageOrder: nextStage.order },
    });

    // Try to automatically assign to a location for the new stage
    try {
      // Get workflow to check for assigned locations
      const workflow = await ctx.db.get(item.workflowId);
      if (!workflow) return;

      // Find the stage in the workflow
      const stageInWorkflow = workflow.stages.find((s: any) => s.id === nextStage.id);
      if (!stageInWorkflow) return;

             // Use assigned locations from workflow stage if available, otherwise fall back to stage-assigned locations
       let availableLocations;
       const assignedLocationIds = stageInWorkflow.assignedLocationIds || [];
       if (assignedLocationIds.length > 0) {
         // Use workflow stage assigned locations
         const allLocations = await ctx.db.query("locations").collect();
         availableLocations = allLocations.filter(location => 
           assignedLocationIds.includes(location._id) &&
           location.isActive &&
           (!location.capacity || (location.currentOccupancy || 0) < location.capacity)
         );
       } else {
        // Fall back to stage-assigned locations
        availableLocations = await ctx.db
          .query("locations")
          .filter((q) => 
            q.and(
              q.eq(q.field("assignedStageId"), nextStage.id),
              q.eq(q.field("isActive"), true),
              q.or(
                q.eq(q.field("capacity"), undefined),
                q.lt(q.field("currentOccupancy"), q.field("capacity"))
              )
            )
          )
          .order("asc")
          .collect();
      }

      if (availableLocations.length > 0) {
        const targetLocation = availableLocations[0];
        
        // Update item location
        await ctx.db.patch(args.itemId, {
          currentLocationId: targetLocation._id,
          updatedAt: now,
        });

        // Update location occupancy
        const itemsInLocation = await ctx.db
          .query("items")
          .filter((q) => q.eq(q.field("currentLocationId"), targetLocation._id))
          .collect();
        
        await ctx.db.patch(targetLocation._id, {
          currentOccupancy: itemsInLocation.length,
          updatedAt: now,
        });

        // Log auto-assignment
        await ctx.db.insert("activityLog", {
          userId: args.userId || "system",
          action: "item_auto_assigned_location",
          entityType: "item",
          entityId: args.itemId,
          description: `Item ${item.itemId} automatically assigned to location ${targetLocation.name} for stage ${nextStage.id}`,
          metadata: { 
            stageId: nextStage.id,
            locationId: targetLocation._id,
            locationName: targetLocation.name,
            autoAssigned: true
          },
          timestamp: now,
        });

        // Record location history for auto-assignment
        await ctx.db.insert("locationHistory", {
          itemId: item.itemId,
          fromLocationId: item.currentLocationId,
          toLocationId: targetLocation._id,
          movedBy: args.userId || "system",
          movedAt: now,
          stageId: nextStage.id,
          notes: "Auto-assigned during stage advancement",
          metadata: {
            locationName: targetLocation.name,
            locationType: targetLocation.type,
            autoAssigned: true,
          },
        });
      }
    } catch (error) {
      // Log error but don't fail the stage advancement
      console.error("Failed to auto-assign location:", error);
    }

    // Create notification for stage completion
    if (item.assignedTo) {
      await ctx.db.insert("notifications", {
        userId: item.assignedTo,
        type: "stage_completed",
        title: "Stage Completed",
        message: `Stage "${currentStage.name}" completed for item ${item.itemId}`,
        itemId: item.itemId,
        workflowId: item.workflowId,
        stageId: currentStage.id,
        isRead: false,
        priority: "medium",
        createdAt: now,
      });
    }
    
    return { status: "advanced", nextStage };
  },
});

// Advance item to specific stage
export const advanceToStage = mutation({
  args: {
    itemId: v.id("items"),
    toStageId: v.string(),
    userId: v.optional(v.string()),
    notes: v.optional(v.string()),
    actionData: v.optional(v.any()), // Store detailed action data
  },
  handler: async (ctx, args) => {
    const item = await ctx.db.get(args.itemId);
    if (!item) throw new Error("Item not found");
    
    const workflow = await ctx.db.get(item.workflowId);
    if (!workflow) throw new Error("Workflow not found");
    
    const currentStage = workflow.stages.find(stage => stage.id === item.currentStageId);
    if (!currentStage) throw new Error("Current stage not found");
    
    const targetStage = workflow.stages.find(stage => stage.id === args.toStageId);
    if (!targetStage) throw new Error("Target stage not found");
    
    const now = Date.now();
    
    // Check if this is the final stage (no next stage with higher order)
    const nextStage = workflow.stages.find(stage => stage.order === targetStage.order + 1);
    const isCompleted = !nextStage;
    
    if (isCompleted) {
      // Move to completed items
      await moveToCompletedItems(ctx, item, targetStage, args.userId, args.notes);
      return { status: "completed" };
    } else {
      // Advance to target stage
      await ctx.db.patch(args.itemId, {
        currentStageId: targetStage.id,
        updatedAt: now,
      });
    }
    
    // Add to history - complete current stage
    await ctx.db.insert("itemHistory", {
      itemId: args.itemId,
      stageId: currentStage.id,
      stageName: currentStage.name,
      action: "completed",
      timestamp: now,
      userId: args.userId,
      notes: args.notes,
      metadata: { 
        stageOrder: currentStage.order,
        actionData: args.actionData, // Store detailed action data
      },
    });
    
    // Add to history - start target stage
    await ctx.db.insert("itemHistory", {
      itemId: args.itemId,
      stageId: targetStage.id,
      stageName: targetStage.name,
      action: "started",
      timestamp: now,
      userId: args.userId,
      metadata: { stageOrder: targetStage.order },
    });

    // Try to automatically assign to a location for the new stage (if not completed)
    if (!isCompleted) {
      try {
        // Get workflow to check for assigned locations
        const workflow = await ctx.db.get(item.workflowId);
        if (!workflow) return;

        // Find the stage in the workflow
        const stageInWorkflow = workflow.stages.find((s: any) => s.id === targetStage.id);
        if (!stageInWorkflow) return;

        // Use assigned locations from workflow stage if available, otherwise fall back to stage-assigned locations
        let availableLocations;
        const assignedLocationIds = stageInWorkflow.assignedLocationIds || [];
        if (assignedLocationIds.length > 0) {
          // Use workflow stage assigned locations
          const allLocations = await ctx.db.query("locations").collect();
          availableLocations = allLocations.filter(location => 
            assignedLocationIds.includes(location._id) &&
            location.isActive &&
            (!location.capacity || (location.currentOccupancy || 0) < location.capacity)
          );
        } else {
          // Fall back to stage-assigned locations
          availableLocations = await ctx.db
            .query("locations")
            .filter((q) => 
              q.and(
                q.eq(q.field("assignedStageId"), targetStage.id),
                q.eq(q.field("isActive"), true),
                q.or(
                  q.eq(q.field("capacity"), undefined),
                  q.lt(q.field("currentOccupancy"), q.field("capacity"))
                )
              )
            )
            .order("asc")
            .collect();
        }

        if (availableLocations.length > 0) {
          const targetLocation = availableLocations[0];
          
          // Update item location
          await ctx.db.patch(args.itemId, {
            currentLocationId: targetLocation._id,
            updatedAt: now,
          });

          // Update location occupancy
          const itemsInLocation = await ctx.db
            .query("items")
            .filter((q) => q.eq(q.field("currentLocationId"), targetLocation._id))
            .collect();
          
          await ctx.db.patch(targetLocation._id, {
            currentOccupancy: itemsInLocation.length,
            updatedAt: now,
          });

          // Log auto-assignment
          await ctx.db.insert("activityLog", {
            userId: args.userId || "system",
            action: "item_auto_assigned_location",
            entityType: "item",
            entityId: args.itemId,
            description: `Item ${item.itemId} automatically assigned to location ${targetLocation.name} for stage ${targetStage.id}`,
            metadata: { 
              stageId: targetStage.id,
              locationId: targetLocation._id,
              locationName: targetLocation.name,
              autoAssigned: true
            },
            timestamp: now,
          });

          // Record location history for auto-assignment
          await ctx.db.insert("locationHistory", {
            itemId: item.itemId,
            fromLocationId: item.currentLocationId,
            toLocationId: targetLocation._id,
            movedBy: args.userId || "system",
            movedAt: now,
            stageId: targetStage.id,
            notes: "Auto-assigned during stage advancement",
            metadata: {
              locationName: targetLocation.name,
              locationType: targetLocation.type,
              autoAssigned: true,
            },
          });
        }
      } catch (error) {
        // Log error but don't fail the stage advancement
        console.error("Failed to auto-assign location:", error);
      }
    }

    // Create notification for stage completion
    if (item.assignedTo) {
      await ctx.db.insert("notifications", {
        userId: item.assignedTo,
        type: "stage_completed",
        title: "Stage Completed",
        message: `Stage "${currentStage.name}" completed for item ${item.itemId}`,
        itemId: item.itemId,
        workflowId: item.workflowId,
        stageId: currentStage.id,
        isRead: false,
        priority: "medium",
        createdAt: now,
      });
    }
    
    return { 
      status: isCompleted ? "completed" : "advanced", 
      nextStage: targetStage 
    };
  },
});

// Pause item
export const pauseItem = mutation({
  args: {
    itemId: v.id("items"),
    userId: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const item = await ctx.db.get(args.itemId);
    if (!item) throw new Error("Item not found");
    
    const workflow = await ctx.db.get(item.workflowId);
    if (!workflow) throw new Error("Workflow not found");
    
    const currentStage = workflow.stages.find(stage => stage.id === item.currentStageId);
    if (!currentStage) throw new Error("Current stage not found");
    
    const now = Date.now();
    await ctx.db.patch(args.itemId, {
      status: "paused",
      updatedAt: now,
    });
    
    await ctx.db.insert("itemHistory", {
      itemId: args.itemId,
      stageId: currentStage.id,
      stageName: currentStage.name,
      action: "paused",
      timestamp: now,
      userId: args.userId,
      notes: args.notes,
      metadata: { stageOrder: currentStage.order },
    });
  },
});

// Resume item
export const resumeItem = mutation({
  args: {
    itemId: v.id("items"),
    userId: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const item = await ctx.db.get(args.itemId);
    if (!item) throw new Error("Item not found");
    
    const workflow = await ctx.db.get(item.workflowId);
    if (!workflow) throw new Error("Workflow not found");
    
    const currentStage = workflow.stages.find(stage => stage.id === item.currentStageId);
    if (!currentStage) throw new Error("Current stage not found");
    
    const now = Date.now();
    await ctx.db.patch(args.itemId, {
      status: "active",
      updatedAt: now,
    });
    
    await ctx.db.insert("itemHistory", {
      itemId: args.itemId,
      stageId: currentStage.id,
      stageName: currentStage.name,
      action: "resumed",
      timestamp: now,
      userId: args.userId,
      notes: args.notes,
      metadata: { stageOrder: currentStage.order },
    });
  },
});

// Flag item as defective
export const flagItemAsDefective = mutation({
  args: {
    itemId: v.id("items"),
    defectNotes: v.string(),
    flaggedBy: v.string(),
  },
  handler: async (ctx, args) => {
    const item = await ctx.db.get(args.itemId);
    if (!item) throw new Error("Item not found");
    
    const now = Date.now();
    await ctx.db.patch(args.itemId, {
      isDefective: true,
      defectNotes: args.defectNotes,
      flaggedBy: args.flaggedBy,
      flaggedAt: now,
      updatedAt: now,
    });

    // Create notification for assigned user if item is assigned
    if (item.assignedTo) {
      await ctx.db.insert("notifications", {
        userId: item.assignedTo,
        type: "item_defective",
        title: "Item Flagged as Defective",
        message: `Item ${item.itemId} has been flagged as defective`,
        itemId: item.itemId,
        workflowId: item.workflowId,
        senderId: args.flaggedBy,
        isRead: false,
        priority: "high",
        createdAt: now,
        metadata: { defectNotes: args.defectNotes },
      });
    }

    // Log this activity
    await ctx.db.insert("activityLog", {
      userId: args.flaggedBy,
      action: "item_flagged_defective",
      entityType: "item",
      entityId: args.itemId,
      description: `Item ${item.itemId} flagged as defective`,
      metadata: { defectNotes: args.defectNotes },
      timestamp: now,
    });
  },
});

// Flag item (general flag)
export const flagItem = mutation({
  args: {
    itemId: v.id("items"),
    flagNotes: v.string(),
    flaggedBy: v.string(),
  },
  handler: async (ctx, args) => {
    const item = await ctx.db.get(args.itemId);
    if (!item) throw new Error("Item not found");
    
    const now = Date.now();
    await ctx.db.patch(args.itemId, {
      flaggedBy: args.flaggedBy,
      flaggedAt: now,
      updatedAt: now,
    });

    // Create notification for assigned user if item is assigned
    if (item.assignedTo) {
      await ctx.db.insert("notifications", {
        userId: item.assignedTo,
        type: "item_flagged",
        title: "Item Flagged",
        message: `Item ${item.itemId} has been flagged for attention`,
        itemId: item.itemId,
        workflowId: item.workflowId,
        senderId: args.flaggedBy,
        isRead: false,
        priority: "medium",
        createdAt: now,
        metadata: { flagNotes: args.flagNotes },
      });
    }

    // Log this activity
    await ctx.db.insert("activityLog", {
      userId: args.flaggedBy,
      action: "item_flagged",
      entityType: "item",
      entityId: args.itemId,
      description: `Item ${item.itemId} flagged for attention`,
      metadata: { flagNotes: args.flagNotes },
      timestamp: now,
    });
  },
});

// Assign item to user
export const assignItem = mutation({
  args: {
    itemId: v.id("items"),
    assignedTo: v.string(),
    assignedBy: v.string(),
  },
  handler: async (ctx, args) => {
    const item = await ctx.db.get(args.itemId);
    if (!item) throw new Error("Item not found");
    
    const now = Date.now();
    await ctx.db.patch(args.itemId, {
      assignedTo: args.assignedTo,
      updatedAt: now,
    });

    // Create notification for assigned user
    await ctx.db.insert("notifications", {
      userId: args.assignedTo,
      type: "item_assigned",
      title: "Item Assigned",
      message: `Item ${item.itemId} has been assigned to you`,
      itemId: item.itemId,
      workflowId: item.workflowId,
      senderId: args.assignedBy,
      isRead: false,
      priority: "medium",
      createdAt: now,
    });

    // Log this activity
    await ctx.db.insert("activityLog", {
      userId: args.assignedBy,
      action: "item_assigned",
      entityType: "item",
      entityId: args.itemId,
      description: `Item ${item.itemId} assigned to ${args.assignedTo}`,
      metadata: { assignedTo: args.assignedTo },
      timestamp: now,
    });
  },
});

// Get item history
export const getHistory = query({
  args: { itemId: v.string() },
  handler: async (ctx, args) => {
    // First find the item by its string itemId
    const item = await ctx.db
      .query("items")
      .filter((q) => q.eq(q.field("itemId"), args.itemId))
      .first();
    
    if (!item) {
      return []; // Return empty array if item not found
    }
    
    // Then query history using the Convex ID
    return await ctx.db
      .query("itemHistory")
      .filter((q) => q.eq(q.field("itemId"), item._id))
      .order("asc")
      .collect();
  },
});

// Get completed item history
export const getCompletedHistory = query({
  args: { itemId: v.string() },
  handler: async (ctx, args) => {
    // URL decode the itemId to handle spaces and special characters
    const decodedItemId = decodeURIComponent(args.itemId);
    
    return await ctx.db
      .query("completedItemHistory")
      .filter((q) => q.eq(q.field("itemId"), decodedItemId))
      .order("asc")
      .collect();
  },
});

// Move item to a new location
export const moveToLocation = mutation({
  args: {
    itemId: v.id("items"),
    locationId: v.id("locations"),
    movedBy: v.string(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const item = await ctx.db.get(args.itemId);
    if (!item) throw new Error("Item not found");

    const location = await ctx.db.get(args.locationId);
    if (!location) throw new Error("Location not found");

    // Check capacity before moving
    if (location.capacity) {
      const currentOccupancy = location.currentOccupancy || 0;
      if (currentOccupancy >= location.capacity) {
        throw new Error(`Location ${location.name} is at capacity (${location.capacity} items)`);
      }
    }

    const now = Date.now();
    
    // Update item location
    await ctx.db.patch(args.itemId, {
      currentLocationId: args.locationId,
      updatedAt: now,
    });

    // Update location occupancy
    const itemsInLocation = await ctx.db
      .query("items")
      .filter((q) => q.eq(q.field("currentLocationId"), args.locationId))
      .collect();
    
    await ctx.db.patch(args.locationId, {
      currentOccupancy: itemsInLocation.length,
      updatedAt: now,
    });

    // Log this activity
    await ctx.db.insert("activityLog", {
      userId: args.movedBy,
      action: "item_moved",
      entityType: "item",
      entityId: args.itemId,
      description: `Item ${item.itemId} moved to location ${location.name}`,
      metadata: { 
        locationId: args.locationId,
        locationName: location.name,
        notes: args.notes 
      },
      timestamp: now,
    });

    // Record location history
    await ctx.db.insert("locationHistory", {
      itemId: item.itemId,
      fromLocationId: item.currentLocationId,
      toLocationId: args.locationId,
      movedBy: args.movedBy,
      movedAt: now,
      stageId: item.currentStageId,
      notes: args.notes,
      metadata: {
        locationName: location.name,
        locationType: location.type,
      },
    });

    return args.itemId;
  },
});

// Get items by location
export const getByLocation = query({
  args: { locationId: v.id("locations") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("items")
      .filter((q) => q.eq(q.field("currentLocationId"), args.locationId))
      .order("desc")
      .collect();
  },
});

// Get items without location
export const getWithoutLocation = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("items")
      .filter((q) => q.eq(q.field("currentLocationId"), undefined))
      .order("desc")
      .collect();
  },
});

// Update item location when stage changes
export const updateLocationForStage = mutation({
  args: {
    itemId: v.id("items"),
    stageId: v.string(),
    locationId: v.optional(v.id("locations")),
    updatedBy: v.string(),
  },
  handler: async (ctx, args) => {
    const item = await ctx.db.get(args.itemId);
    if (!item) throw new Error("Item not found");

    const now = Date.now();
    
    // If locationId is provided, move item to that location
    if (args.locationId) {
      await ctx.db.patch(args.itemId, {
        currentLocationId: args.locationId,
        updatedAt: now,
      });

      // Update location occupancy
      const itemsInLocation = await ctx.db
        .query("items")
        .filter((q) => q.eq(q.field("currentLocationId"), args.locationId))
        .collect();
      
      await ctx.db.patch(args.locationId, {
        currentOccupancy: itemsInLocation.length,
        updatedAt: now,
      });
    }

    // Log this activity
    await ctx.db.insert("activityLog", {
      userId: args.updatedBy,
      action: "item_location_updated",
      entityType: "item",
      entityId: args.itemId,
      description: `Item ${item.itemId} location updated for stage ${args.stageId}`,
      metadata: { 
        stageId: args.stageId,
        locationId: args.locationId 
      },
      timestamp: now,
    });

    return args.itemId;
  },
});

// Automatically assign item to available location for stage
export const autoAssignToStageLocation = mutation({
  args: {
    itemId: v.id("items"),
    stageId: v.string(),
    assignedBy: v.string(),
  },
  handler: async (ctx, args) => {
    const item = await ctx.db.get(args.itemId);
    if (!item) throw new Error("Item not found");

    // Get available locations for this stage
    const availableLocations = await ctx.db
      .query("locations")
      .filter((q) => 
        q.and(
          q.eq(q.field("assignedStageId"), args.stageId),
          q.eq(q.field("isActive"), true),
          q.or(
            q.eq(q.field("capacity"), undefined),
            q.lt(q.field("currentOccupancy"), q.field("capacity"))
          )
        )
      )
      .order("asc")
      .collect();

    if (availableLocations.length === 0) {
      throw new Error("No available locations for this stage");
    }

    // Assign to the first available location
    const targetLocation = availableLocations[0];
    const now = Date.now();

    // Update item location
    await ctx.db.patch(args.itemId, {
      currentLocationId: targetLocation._id,
      updatedAt: now,
    });

    // Update location occupancy
    const itemsInLocation = await ctx.db
      .query("items")
      .filter((q) => q.eq(q.field("currentLocationId"), targetLocation._id))
      .collect();
    
    await ctx.db.patch(targetLocation._id, {
      currentOccupancy: itemsInLocation.length,
      updatedAt: now,
    });

    // Log this activity
    await ctx.db.insert("activityLog", {
      userId: args.assignedBy,
      action: "item_auto_assigned_location",
      entityType: "item",
      entityId: args.itemId,
      description: `Item ${item.itemId} automatically assigned to location ${targetLocation.name} for stage ${args.stageId}`,
      metadata: { 
        stageId: args.stageId,
        locationId: targetLocation._id,
        locationName: targetLocation.name,
        autoAssigned: true
      },
      timestamp: now,
    });

    return { itemId: args.itemId, locationId: targetLocation._id };
  },
}); 

// Handle item entering a stage
export const enterStage = mutation({
  args: {
    itemId: v.string(),
    stageId: v.string(),
    stageName: v.string(),
    locationId: v.optional(v.string()),
    assignedUserId: v.optional(v.string()),
    enteredBy: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    
    // Find the item by itemId
    const item = await ctx.db
      .query("items")
      .filter((q) => q.eq(q.field("itemId"), args.itemId))
      .first();
    
    if (!item) {
      throw new Error(`Item with ID ${args.itemId} not found`);
    }

    // Update item's current stage
    await ctx.db.patch(item._id, {
      currentStageId: args.stageId,
      updatedAt: now,
    });

    // Update item location if provided
    if (args.locationId) {
      const location = await ctx.db.get(args.locationId as any);
      if (location) {
        await ctx.db.patch(item._id, {
          currentLocationId: args.locationId as any,
        });
      }
    }

    // Assign item to user if provided
    if (args.assignedUserId) {
      const user = await ctx.db.get(args.assignedUserId as any);
      if (user) {
        await ctx.db.patch(item._id, {
          assignedTo: args.assignedUserId,
        });

        // Create notification for the assigned user
        await ctx.db.insert("notifications", {
          userId: args.assignedUserId,
          type: "item_assigned",
          title: "New Item Assigned",
          message: `Item ${args.itemId} has been assigned to you at stage: ${args.stageName}`,
          itemId: args.itemId,
          stageId: args.stageId,
          senderId: args.enteredBy,
          isRead: false,
          priority: "medium",
          createdAt: now,
          metadata: {
            itemId: args.itemId,
            stageName: args.stageName,
            locationId: args.locationId,
          },
        });
      }
    }

    // Log the stage entry in item history
    await ctx.db.insert("itemHistory", {
      itemId: item._id,
      stageId: args.stageId,
      stageName: args.stageName,
      action: "stage_entered",
      timestamp: now,
      userId: args.enteredBy,
      notes: `Entered stage: ${args.stageName}`,
      metadata: {
        locationId: args.locationId,
        assignedUserId: args.assignedUserId,
      },
    });

    // Log this activity
    await ctx.db.insert("activityLog", {
      userId: args.enteredBy,
      action: "item_stage_entered",
      entityType: "item",
      entityId: item._id,
      description: `Item ${args.itemId} entered stage: ${args.stageName}`,
      metadata: {
        itemId: args.itemId,
        stageId: args.stageId,
        stageName: args.stageName,
        locationId: args.locationId,
        assignedUserId: args.assignedUserId,
      },
      timestamp: now,
    });

    return {
      success: true,
      message: `Item ${args.itemId} entered stage: ${args.stageName}`,
    };
  },
});

// Cleanup old test data with hardcoded IDs
export const cleanupTestData = mutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const cutoffTime = now - (24 * 60 * 60 * 1000); // 24 hours ago
    
    // Find and delete old test workflows with hardcoded IDs
    const oldWorkflows = await ctx.db
      .query("workflows")
      .filter((q) => 
        q.or(
          q.eq(q.field("name"), "Tracking Test Workflow"),
          q.eq(q.field("name"), "Scan Test Workflow"),
          q.eq(q.field("name"), "Item Test Workflow"),
          q.eq(q.field("name"), "Stage Test Workflow"),
          q.eq(q.field("name"), "E2E Test Workflow"),
          q.eq(q.field("name"), "Test Workflow")
        )
      )
      .collect();
    
    let deletedWorkflows = 0;
    let deletedItems = 0;
    
    for (const workflow of oldWorkflows) {
      // Delete associated items
      const items = await ctx.db
        .query("items")
        .filter((q) => q.eq(q.field("workflowId"), workflow._id))
        .collect();
      
      for (const item of items) {
        await ctx.db.delete(item._id);
        deletedItems++;
      }
      
      // Delete the workflow
      await ctx.db.delete(workflow._id);
      deletedWorkflows++;
    }
    
    return {
      success: true,
      message: `Cleaned up ${deletedWorkflows} old test workflows and ${deletedItems} associated items`,
      deletedWorkflows,
      deletedItems
    };
  },
});

// Test item creation (for testing suite)
export const testItemCreation = mutation({
  args: {},
  handler: async (ctx) => {
    const timestamp = Date.now();
    const uniqueId = `item-test-${timestamp}`;
    
    // Create a test workflow first to ensure we have one
    const workflowId = await ctx.db.insert("workflows", {
      name: `Item Test Workflow ${timestamp}`,
      description: "Test workflow for item creation",
      stages: [
        {
          id: `${uniqueId}-stage-1`,
          name: "Initial Stage",
          description: "Starting stage for item creation test",
          order: 0,
          actions: [
            {
              id: `${uniqueId}-action-1`,
              type: "scan",
              label: "Scan QR Code",
              description: "Scan item QR code to verify",
              required: true,
            }
          ],
          estimatedDuration: 10,
          isActive: true,
        }
      ],
      isActive: true,
      createdAt: timestamp,
      updatedAt: timestamp,
      createdBy: "test-suite",
    });

    const testItemId = `TEST-ITEM-${Date.now()}`;
    
    const itemId = await ctx.db.insert("items", {
      itemId: testItemId,
      workflowId: workflowId,
      currentStageId: `${uniqueId}-stage-1`,
      status: "active",
      metadata: {
        brand: "Test Brand",
        color: "Blue",
        size: "M",
        style: "Test Style",
        testType: "automated-test"
      },
      startedAt: timestamp,
      updatedAt: timestamp,
      qrCode: `item:${testItemId}`,
    });

    // Add to history
    await ctx.db.insert("itemHistory", {
      itemId,
      stageId: `${uniqueId}-stage-1`,
      stageName: "Initial Stage",
      action: "started",
      timestamp: timestamp,
      metadata: { stageOrder: 0 },
    });

    return {
      success: true,
      message: `Test item created: ${testItemId}`,
      itemId: testItemId,
      workflowId: workflowId.toString()
    };
  },
}); 

// Test stage advancement (for testing suite)
export const testStageAdvancement = mutation({
  args: {},
  handler: async (ctx) => {
    const timestamp = Date.now();
    const uniqueId = `stage-test-${timestamp}`;
    
    // Create a test workflow with multiple stages
    const workflowId = await ctx.db.insert("workflows", {
      name: `Stage Test Workflow ${timestamp}`,
      description: "Test workflow for stage advancement",
      stages: [
        {
          id: `${uniqueId}-stage-1`,
          name: "First Stage",
          description: "Initial stage for testing",
          order: 0,
          actions: [
            {
              id: `${uniqueId}-action-1`,
              type: "scan",
              label: "Scan QR Code",
              description: "Scan item QR code to verify",
              required: true,
            }
          ],
          estimatedDuration: 10,
          isActive: true,
        },
        {
          id: `${uniqueId}-stage-2`,
          name: "Second Stage",
          description: "Second stage for testing",
          order: 1,
          actions: [
            {
              id: `${uniqueId}-action-2`,
              type: "scan",
              label: "Scan QR Code",
              description: "Scan item QR code to verify",
              required: true,
            }
          ],
          estimatedDuration: 15,
          isActive: true,
        }
      ],
      isActive: true,
      createdAt: timestamp,
      updatedAt: timestamp,
      createdBy: "test-suite",
    });

    // Create a test item
    const testItemId = `STAGE-TEST-${timestamp}`;
    const itemId = await ctx.db.insert("items", {
      itemId: testItemId,
      workflowId: workflowId,
      currentStageId: `${uniqueId}-stage-1`,
      status: "active",
      metadata: {
        brand: "Stage Test Brand",
        color: "Green",
        size: "S",
        style: "Stage Test Style",
        testType: "stage-advancement-test"
      },
      startedAt: timestamp,
      updatedAt: timestamp,
      qrCode: `item:${testItemId}`,
    });

    // Add to history
    await ctx.db.insert("itemHistory", {
      itemId,
      stageId: `${uniqueId}-stage-1`,
      stageName: "First Stage",
      action: "started",
      timestamp: timestamp,
      metadata: { stageOrder: 0 },
    });

    // Advance to next stage
    await ctx.db.patch(itemId, {
      currentStageId: `${uniqueId}-stage-2`,
      updatedAt: timestamp,
    });

    // Add to history - complete current stage
    await ctx.db.insert("itemHistory", {
      itemId,
      stageId: `${uniqueId}-stage-1`,
      stageName: "First Stage",
      action: "completed",
      timestamp: timestamp,
      userId: "test-suite",
      notes: "Automated test advancement",
      metadata: { stageOrder: 0 },
    });

    // Add to history - start next stage
    await ctx.db.insert("itemHistory", {
      itemId,
      stageId: `${uniqueId}-stage-2`,
      stageName: "Second Stage",
      action: "started",
      timestamp: timestamp,
      userId: "test-suite",
      metadata: { stageOrder: 1 },
    });

    return {
      success: true,
      message: `Item advanced to Second Stage`,
      itemId: testItemId,
      workflowId: workflowId.toString()
    };
  },
}); 

// Test end-to-end workflow (for testing suite)
export const testEndToEndWorkflow = mutation({
  args: {},
  handler: async (ctx) => {
    const timestamp = Date.now();
    const uniqueId = `e2e-test-${timestamp}`;
    
    // Create a test workflow with multiple stages
    const workflowId = await ctx.db.insert("workflows", {
      name: `E2E Test Workflow ${timestamp}`,
      description: "End-to-end test workflow",
      stages: [
        {
          id: `${uniqueId}-stage-1`,
          name: "Assembly",
          description: "Assemble components",
          order: 0,
          actions: [
            {
              id: `${uniqueId}-action-1`,
              type: "scan",
              label: "Scan QR Code",
              description: "Scan item QR code to verify",
              required: true,
            }
          ],
          estimatedDuration: 20,
          isActive: true,
        },
        {
          id: `${uniqueId}-stage-2`,
          name: "Testing",
          description: "Test functionality",
          order: 1,
          actions: [
            {
              id: `${uniqueId}-action-2`,
              type: "scan",
              label: "Scan QR Code",
              description: "Scan item QR code to verify",
              required: true,
            },
            {
              id: `${uniqueId}-action-3`,
              type: "inspection",
              label: "Functionality Test",
              description: "Test all functions",
              required: true,
            }
          ],
          estimatedDuration: 15,
          isActive: true,
        },
        {
          id: `${uniqueId}-stage-3`,
          name: "Packaging",
          description: "Package for shipping",
          order: 2,
          actions: [
            {
              id: `${uniqueId}-action-4`,
              type: "scan",
              label: "Scan QR Code",
              description: "Scan item QR code to verify",
              required: true,
            },
            {
              id: `${uniqueId}-action-5`,
              type: "photo",
              label: "Package Photo",
              description: "Document packaging",
              required: false,
            }
          ],
          estimatedDuration: 10,
          isActive: true,
        }
      ],
      isActive: true,
      createdAt: timestamp,
      updatedAt: timestamp,
      createdBy: "test-suite",
    });

    // Create a test item
    const testItemId = `E2E-TEST-${timestamp}`;
    const itemId = await ctx.db.insert("items", {
      itemId: testItemId,
      workflowId: workflowId,
      currentStageId: `${uniqueId}-stage-1`,
      status: "active",
      metadata: {
        brand: "E2E Test Brand",
        color: "Red",
        size: "L",
        style: "E2E Test Style",
        testType: "end-to-end-test"
      },
      startedAt: timestamp,
      updatedAt: timestamp,
      qrCode: `item:${testItemId}`,
    });

    // Add initial history
    await ctx.db.insert("itemHistory", {
      itemId,
      stageId: `${uniqueId}-stage-1`,
      stageName: "Assembly",
      action: "started",
      timestamp: timestamp,
      metadata: { stageOrder: 0 },
    });

    // Advance through each stage (skip the first stage since item starts there)
    const stages = [
      { id: `${uniqueId}-stage-2`, name: "Testing", order: 1 },
      { id: `${uniqueId}-stage-3`, name: "Packaging", order: 2 }
    ];

    for (const stage of stages) {
      const now = Date.now();
      
      // Update item to next stage
      await ctx.db.patch(itemId, {
        currentStageId: stage.id,
        updatedAt: now,
      });

      // Add to history - complete previous stage
      await ctx.db.insert("itemHistory", {
        itemId,
        stageId: stage.id,
        stageName: stage.name,
        action: "started",
        timestamp: now,
        userId: "test-suite",
        notes: `E2E test advancement to ${stage.name}`,
        metadata: { stageOrder: stage.order },
      });
    }

    // Complete the final stage
    const now = timestamp + 60000; // 1 minute after start
    
    // Create completed item record
    await ctx.db.insert("completedItems", {
      itemId: testItemId,
      workflowId: workflowId,
      finalStageId: `${uniqueId}-stage-3`,
      finalStageName: "Packaging",
      metadata: {
        brand: "E2E Test Brand",
        color: "Red",
        size: "L",
        style: "E2E Test Style",
        testType: "end-to-end-test"
      },
      startedAt: timestamp,
      completedAt: now,
      completionNotes: "E2E test completion",
      completedBy: "test-suite",
    });

    // Copy history to completed item history
    const history = await ctx.db
      .query("itemHistory")
      .filter((q: any) => q.eq(q.field("itemId"), itemId))
      .collect();

    for (const historyEntry of history) {
      await ctx.db.insert("completedItemHistory", {
        itemId: testItemId,
        stageId: historyEntry.stageId,
        stageName: historyEntry.stageName,
        action: historyEntry.action,
        timestamp: historyEntry.timestamp,
        userId: historyEntry.userId,
        notes: historyEntry.notes,
        metadata: historyEntry.metadata,
      });
    }

    // Add final completion entry
    await ctx.db.insert("completedItemHistory", {
      itemId: testItemId,
      stageId: `${uniqueId}-stage-3`,
      stageName: "Packaging",
      action: "completed",
      timestamp: now,
      userId: "test-suite",
      notes: "E2E test completion",
      metadata: { stageOrder: 2 },
    });

    // Delete the original item and its history
    await ctx.db.delete(itemId);
    for (const historyEntry of history) {
      await ctx.db.delete(historyEntry._id);
    }

    return {
      success: true,
      message: `End-to-end workflow test completed: Item ${testItemId} went through ${stages.length + 1} stages`,
      itemId: testItemId,
      workflowId: workflowId.toString()
    };
  },
});

// Get items by purchase order
export const listItemsByPO = query({
  args: { purchaseOrderId: v.id("purchaseOrders") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("items")
      .withIndex("by_po", (q) => q.eq("purchaseOrderId", args.purchaseOrderId))
      .order("desc")
      .collect()
  },
});

// Get items by brand
export const listItemsByBrand = query({
  args: { brandId: v.id("brands") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("items")
      .withIndex("by_brand", (q) => q.eq("brandId", args.brandId))
      .order("desc")
      .collect()
  },
});

// Get item history
export const getItemHistory = query({
  args: { itemId: v.id("items") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("itemHistory")
      .filter((q) => q.eq(q.field("itemId"), args.itemId))
      .order("asc")
      .collect();
  },
});

// Get items by team/stage for Disco Floor Application
export const getItemsByTeam = query({
  args: { 
    teamId: v.string(),
    factoryId: v.optional(v.id("factories"))
  },
  handler: async (ctx, args) => {
    // Map team names to stage names for filtering
    const teamStageMap: Record<string, string[]> = {
      production: ["Assembly", "Production", "Manufacturing"],
      cutting: ["Cut", "Cutting", "Fabric Cutting"],
      sewing: ["Sew", "Sewing", "Assembly"],
      quality: ["QC", "Quality Control", "Inspection"],
      packaging: ["Pack", "Packaging", "Final Packaging"],
    }

    const stageNames = teamStageMap[args.teamId] || []
    
    // Get all active items
    const allItems = await ctx.db
      .query("items")
      .filter((q) => q.eq(q.field("status"), "active"))
      .collect()

    // Get all workflows for these items
    const workflowIds = [...new Set(allItems.map(item => item.workflowId))]
    const workflows = await Promise.all(
      workflowIds.map(id => ctx.db.get(id))
    )
    const workflowMap = new Map(workflows.map(w => [w?._id, w]).filter(([_, w]) => w))

    // Filter items by team's stages and factory
    const teamItems = allItems.filter(item => {
      const workflow = workflowMap.get(item.workflowId)
      if (!workflow || !workflow.stages) return false
      
      // Get current stage
      const currentStage = workflow.stages.find((s: any) => s.id === item.currentStageId)
      if (!currentStage) return false
      
      // Check if current stage matches team's stages
      const stageMatches = stageNames.some(name => 
        currentStage.name.toLowerCase().includes(name.toLowerCase())
      )
      
      // Check factory filter if provided
      const factoryMatches = !args.factoryId || item.factoryId === args.factoryId
      
      return stageMatches && factoryMatches
    })

    // Get workflow details for each item
    const itemsWithWorkflows = teamItems.map((item) => {
      const workflow = workflowMap.get(item.workflowId)
      const currentStage = workflow?.stages?.find((s: any) => s.id === item.currentStageId)
      const nextStage = workflow?.stages?.find((s: any) => s.order === (currentStage?.order || 0) + 1)
      
      return {
        ...item,
        workflow,
        currentStage,
        nextStage,
        canAdvance: !!nextStage,
        requiredActions: currentStage?.actions || [],
      }
    })

    return itemsWithWorkflows
  },
})

// Validate and advance item with workflow rules
export const advanceItemWithValidation = mutation({
  args: {
    itemId: v.id("items"),
    userId: v.string(),
    completedActions: v.array(v.object({
      id: v.string(),
      type: v.union(v.literal("scan"), v.literal("photo"), v.literal("note"), v.literal("approval"), v.literal("measurement"), v.literal("inspection")),
      label: v.string(),
      data: v.optional(v.any()),
    })),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const item = await ctx.db.get(args.itemId)
    if (!item) throw new Error("Item not found")
    
    const workflow = await ctx.db.get(item.workflowId)
    if (!workflow) throw new Error("Workflow not found")
    
    const currentStage = workflow.stages.find(stage => stage.id === item.currentStageId)
    if (!currentStage) throw new Error("Current stage not found")
    
    // Validate required actions are completed
    const requiredActions = currentStage.actions?.filter(action => action.required) || []
    const completedActionIds = args.completedActions.map(action => action.id)
    
    const missingActions = requiredActions.filter(action => 
      !completedActionIds.includes(action.id)
    )
    
    if (missingActions.length > 0) {
      throw new Error(`Missing required actions: ${missingActions.map(a => a.label).join(", ")}`)
    }
    
    // Validate action data based on workflow rules
    for (const completedAction of args.completedActions) {
      const requiredAction = requiredActions.find(a => a.id === completedAction.id)
      if (!requiredAction) continue
      
      // Validate scan actions
      if (requiredAction.type === "scan" && completedAction.type === "scan") {
        if (requiredAction.config?.expectedValue && 
            completedAction.data?.scannedValue !== requiredAction.config.expectedValue) {
          throw new Error(`Invalid scan value. Expected: ${requiredAction.config.expectedValue}`)
        }
      }
      
      // Validate approval actions
      if (requiredAction.type === "approval" && completedAction.type === "approval") {
        if (!completedAction.data?.approved) {
          throw new Error("Approval required to advance")
        }
      }
      
      // Validate measurement actions
      if (requiredAction.type === "measurement" && completedAction.type === "measurement") {
        const value = completedAction.data?.value
        const min = requiredAction.config?.minValue
        const max = requiredAction.config?.maxValue
        
        if (min !== undefined && value < min) {
          throw new Error(`Measurement too low. Minimum: ${min}`)
        }
        if (max !== undefined && value > max) {
          throw new Error(`Measurement too high. Maximum: ${max}`)
        }
      }
    }
    
    // All validations passed, advance to next stage
    const nextStage = workflow.stages.find(stage => stage.order === currentStage.order + 1)
    if (!nextStage) {
      // No next stage, move to completed items
      await moveToCompletedItems(ctx, item, currentStage, args.userId, args.notes)
      return { status: "completed", message: "Item completed successfully" }
    }
    
    const now = Date.now()
    await ctx.db.patch(args.itemId, {
      currentStageId: nextStage.id,
      updatedAt: now,
    })
    
    // Add to history - complete current stage
    await ctx.db.insert("itemHistory", {
      itemId: args.itemId,
      stageId: currentStage.id,
      stageName: currentStage.name,
      action: "completed",
      timestamp: now,
      userId: args.userId,
      notes: args.notes,
      metadata: { 
        stageOrder: currentStage.order,
        completedActions: args.completedActions,
      },
    })
    
    // Add to history - start next stage
    await ctx.db.insert("itemHistory", {
      itemId: args.itemId,
      stageId: nextStage.id,
      stageName: nextStage.name,
      action: "started",
      timestamp: now,
      userId: args.userId,
      metadata: { stageOrder: nextStage.order },
    })

    return { 
      status: "advanced", 
      nextStage,
      message: `Advanced to ${nextStage.name}` 
    }
  },
})

// Get team performance metrics for Disco Floor Application
export const getTeamMetrics = query({
  args: { 
    teamId: v.string(),
    factoryId: v.optional(v.id("factories")),
    timeRange: v.union(v.literal("today"), v.literal("week"), v.literal("month"))
  },
  handler: async (ctx, args) => {
    const now = Date.now()
    let startTime: number
    
    switch (args.timeRange) {
      case "today":
        startTime = now - (24 * 60 * 60 * 1000) // 24 hours
        break
      case "week":
        startTime = now - (7 * 24 * 60 * 60 * 1000) // 7 days
        break
      case "month":
        startTime = now - (30 * 24 * 60 * 60 * 1000) // 30 days
        break
      default:
        startTime = now - (24 * 60 * 60 * 1000)
    }
    
    // Get completed items in time range
    const completedItems = await ctx.db
      .query("completedItems")
      .filter((q) => 
        q.and(
          q.gte(q.field("completedAt"), startTime),
          q.eq(q.field("status"), "completed")
        )
      )
      .collect()
    
    // Get active items
    const activeItems = await ctx.db
      .query("items")
      .filter((q) => q.eq(q.field("status"), "active"))
      .collect()
    
    // Filter by team and factory
    const teamStageMap: Record<string, string[]> = {
      production: ["Assembly", "Production", "Manufacturing"],
      cutting: ["Cut", "Cutting", "Fabric Cutting"],
      sewing: ["Sew", "Sewing", "Assembly"],
      quality: ["QC", "Quality Control", "Inspection"],
      packaging: ["Pack", "Packaging", "Final Packaging"],
    }
    
    const stageNames = teamStageMap[args.teamId] || []
    
    const filterByTeam = (items: any[]) => {
      return items.filter(item => {
        if (args.factoryId && item.factoryId !== args.factoryId) return false
        
        // For completed items, check final stage
        if (item.finalStageName) {
          return stageNames.some(name => 
            item.finalStageName.toLowerCase().includes(name.toLowerCase())
          )
        }
        
        // For active items, we'd need to check workflow (simplified for now)
        return true
      })
    }
    
    const teamCompleted = filterByTeam(completedItems)
    const teamActive = filterByTeam(activeItems)
    
    // Calculate metrics
    const completed = teamCompleted.length
    const inProgress = teamActive.length
    const onTime = teamCompleted.filter(item => {
      // Calculate if completed on time (simplified logic)
      const estimatedDuration = 4 * 60 * 60 * 1000 // 4 hours default
      return (item.completedAt - item.startedAt) <= estimatedDuration
    }).length
    const late = completed - onTime
    const efficiency = completed > 0 ? Math.round((onTime / completed) * 100) : 0
    
    return {
      completed,
      inProgress,
      onTime,
      late,
      efficiency,
      timeRange: args.timeRange,
    }
  },
})