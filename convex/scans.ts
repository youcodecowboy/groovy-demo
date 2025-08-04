import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Log a scan attempt
export const logScan = mutation({
  args: {
    qrData: v.string(),
    scanType: v.union(v.literal("item_lookup"), v.literal("stage_completion"), v.literal("error")),
    success: v.boolean(),
    errorMessage: v.optional(v.string()),
    userId: v.optional(v.string()),
    stageId: v.optional(v.string()),
    workflowId: v.optional(v.id("workflows")),
    metadata: v.optional(v.any()),
    deviceInfo: v.optional(v.object({
      userAgent: v.string(),
      platform: v.string(),
      cameraType: v.optional(v.string()),
    })),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    
    // Check for rate limiting - prevent excessive scans
    const recentScans = await ctx.db
      .query("scans")
      .filter((q) => 
        q.and(
          q.eq(q.field("userId"), args.userId || "anonymous"),
          q.gte(q.field("timestamp"), now - 5000) // Last 5 seconds
        )
      )
      .collect();
    
    // Rate limit: max 10 scans per 5 seconds per user
    if (recentScans.length >= 10) {
      throw new Error("Scan rate limit exceeded. Please wait a moment before scanning again.");
    }
    
    // Try to find the item if this is an item lookup
    let itemId: string | undefined;
    if (args.scanType === "item_lookup") {
      // Extract item ID from QR data (assuming format like "item:ITEM-001")
      const itemMatch = args.qrData.match(/^item:(.+)$/);
      if (itemMatch) {
        itemId = itemMatch[1];
      }
    }
    
    return await ctx.db.insert("scans", {
      itemId,
      qrData: args.qrData,
      scanType: args.scanType,
      success: args.success,
      errorMessage: args.errorMessage,
      userId: args.userId,
      stageId: args.stageId,
      workflowId: args.workflowId,
      metadata: args.metadata,
      timestamp: now,
      deviceInfo: args.deviceInfo,
    });
  },
});

// Get recent scans for a user
export const getRecentScans = query({
  args: { 
    userId: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 50;
    const userId = args.userId || "anonymous";
    
    return await ctx.db
      .query("scans")
      .filter((q) => q.eq(q.field("userId"), userId))
      .order("desc")
      .take(limit);
  },
});

// Get scans for a specific item
export const getItemScans = query({
  args: { itemId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("scans")
      .filter((q) => q.eq(q.field("itemId"), args.itemId))
      .order("desc")
      .collect();
  },
});

// Get all scans (for testing and analytics)
export const getAllScans = query({
  args: { 
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 100;
    
    return await ctx.db
      .query("scans")
      .order("desc")
      .take(limit);
  },
});

// Get scan statistics
export const getScanStats = query({
  args: { 
    userId: v.optional(v.string()),
    timeRange: v.optional(v.number()), // in milliseconds
  },
  handler: async (ctx, args) => {
    const userId = args.userId || "anonymous";
    const timeRange = args.timeRange || 24 * 60 * 60 * 1000; // 24 hours default
    const cutoffTime = Date.now() - timeRange;
    
    const scans = await ctx.db
      .query("scans")
      .filter((q) => 
        q.and(
          q.eq(q.field("userId"), userId),
          q.gte(q.field("timestamp"), cutoffTime)
        )
      )
      .collect();
    
    const totalScans = scans.length;
    const successfulScans = scans.filter(scan => scan.success).length;
    const errorScans = totalScans - successfulScans;
    
    return {
      totalScans,
      successfulScans,
      errorScans,
      successRate: totalScans > 0 ? (successfulScans / totalScans) * 100 : 0,
      timeRange,
    };
  },
});

// Complete a stage with scan verification
export const completeStageWithScan = mutation({
  args: {
    itemId: v.id("items"),
    stageId: v.string(),
    qrData: v.string(),
    userId: v.optional(v.string()),
    notes: v.optional(v.string()),
    deviceInfo: v.optional(v.object({
      userAgent: v.string(),
      platform: v.string(),
      cameraType: v.optional(v.string()),
    })),
  },
  handler: async (ctx, args) => {
    const item = await ctx.db.get(args.itemId);
    if (!item) throw new Error("Item not found");
    
    const workflow = await ctx.db.get(item.workflowId);
    if (!workflow) throw new Error("Workflow not found");
    
    const currentStage = workflow.stages.find(stage => stage.id === item.currentStageId);
    if (!currentStage) throw new Error("Current stage not found");
    
    // Verify that the scan is for the correct stage
    if (currentStage.id !== args.stageId) {
      // Log failed scan
      await ctx.db.insert("scans", {
        qrData: args.qrData,
        scanType: "stage_completion",
        success: false,
        errorMessage: "Scan attempted on wrong stage",
        userId: args.userId,
        stageId: args.stageId,
        workflowId: item.workflowId,
        metadata: { expectedStage: currentStage.id, actualStage: args.stageId },
        timestamp: Date.now(),
        deviceInfo: args.deviceInfo,
      });
      
      throw new Error("Scan attempted on wrong stage");
    }
    
    // Check if current stage requires a scan action
    const scanAction = currentStage.actions?.find(action => action.type === "scan");
    if (!scanAction) {
      // Log failed scan - no scan action required
      await ctx.db.insert("scans", {
        qrData: args.qrData,
        scanType: "stage_completion",
        success: false,
        errorMessage: "No scan action required for this stage",
        userId: args.userId,
        stageId: args.stageId,
        workflowId: item.workflowId,
        metadata: { stageActions: currentStage.actions },
        timestamp: Date.now(),
        deviceInfo: args.deviceInfo,
      });
      
      throw new Error("No scan action required for this stage");
    }
    
    // Log successful scan
    await ctx.db.insert("scans", {
      itemId: item.itemId,
      qrData: args.qrData,
      scanType: "stage_completion",
      success: true,
      userId: args.userId,
      stageId: args.stageId,
      workflowId: item.workflowId,
      metadata: { actionId: scanAction.id, actionLabel: scanAction.label },
      timestamp: Date.now(),
      deviceInfo: args.deviceInfo,
    });
    
    // Now advance the item to the next stage
    const nextStage = workflow.stages.find(stage => stage.order === currentStage.order + 1);
    if (!nextStage) {
      // No next stage, move to completed items
      const now = Date.now();
      
      // Create completed item record
      await ctx.db.insert("completedItems", {
        itemId: item.itemId,
        workflowId: item.workflowId,
        finalStageId: currentStage.id,
        finalStageName: currentStage.name,
        metadata: item.metadata,
        startedAt: item.startedAt,
        completedAt: now,
        assignedTo: item.assignedTo,
        qrCode: item.qrCode,
        completionNotes: args.notes,
        completedBy: args.userId,
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

      // Add final completion entry
      await ctx.db.insert("completedItemHistory", {
        itemId: item.itemId,
        stageId: currentStage.id,
        stageName: currentStage.name,
        action: "completed",
        timestamp: now,
        userId: args.userId,
        notes: args.notes,
        metadata: { stageOrder: currentStage.order },
      });

      // Delete the original item and its history
      await ctx.db.delete(item._id);
      for (const historyEntry of history) {
        await ctx.db.delete(historyEntry._id);
      }
      
      return { status: "completed" };
    }
    
    // Advance to next stage
    const now = Date.now();
    await ctx.db.patch(args.itemId, {
      currentStageId: nextStage.id,
      updatedAt: now,
    });
    
    // Add to history - complete current stage
    await ctx.db.insert("itemHistory", {
      itemId: args.itemId,
      stageId: currentStage.id,
      stageName: currentStage.name,
      action: "completed",
      timestamp: now,
      userId: args.userId,
      notes: args.notes,
      metadata: { stageOrder: currentStage.order },
    });
    
    // Add to history - start next stage
    await ctx.db.insert("itemHistory", {
      itemId: args.itemId,
      stageId: nextStage.id,
      stageName: nextStage.name,
      action: "started",
      timestamp: now,
      userId: args.userId,
      metadata: { stageOrder: nextStage.order },
    });
    
    return { status: "advanced", nextStage };
  },
}); 