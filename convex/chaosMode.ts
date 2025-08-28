import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";

// ============================================================================
// CHAOS MODE CONTROL FUNCTIONS
// ============================================================================

export const initializeChaosMode = mutation({
  args: {},
  handler: async (ctx) => {
    const orgId = await resolveOrgId(ctx);
    
    try {
      console.log("🚀 Initializing chaos mode...");
      
      // Check if chaos mode already exists
      const existingControl = await ctx.db
        .query("chaosModeControl")
        .withIndex("by_org", (q) => q.eq("orgId", orgId))
        .first();
      
      if (existingControl) {
        console.log("✅ Chaos mode already initialized");
        return { success: true, alreadyExists: true };
      }
      
      // Create chaos mode control record
      const controlId = await ctx.db.insert("chaosModeControl", {
        orgId,
        isActive: false,
        mode: "stopped",
        startTime: Date.now(),
        settings: {
          scanIntervals: { min: 15, max: 45 },
          stageIntervals: { min: 25, max: 35 },
          problemIntervals: { min: 60, max: 120 },
          messageIntervals: { min: 30, max: 90 },
        },
        currentOrders: [],
        errorCount: 0,
        lastActivity: Date.now(),
      });
      
      console.log("✅ Chaos mode initialized successfully");
      await logActivity(ctx, orgId, "Chaos mode initialized", { controlId });
      
      return { success: true, controlId };
      
    } catch (error) {
      console.error("❌ Failed to initialize chaos mode:", error);
      throw error;
    }
  },
});

export const getChaosStatus = query({
  args: {},
  handler: async (ctx) => {
    const orgId = await resolveOrgId(ctx);
    
    try {
      const control = await ctx.db
        .query("chaosModeControl")
        .withIndex("by_org", (q) => q.eq("orgId", orgId))
        .first();
      
      if (!control) {
        return {
          isActive: false,
          uptime: 0,
          startTime: null,
          lastActivity: null,
          totalItemsCreated: 0,
          totalItemsCompleted: 0,
          totalScans: 0,
          totalNotifications: 0,
          totalMessages: 0,
          errors: [],
        };
      }
      
      // Calculate current uptime if active
      let currentUptime = 0;
      if (control.isActive && control.startTime) {
        currentUptime = Math.floor((Date.now() - control.startTime) / 1000);
      }
      
      return {
        isActive: control.isActive,
        uptime: currentUptime,
        startTime: control.startTime,
        lastActivity: control.lastActivity,
        mode: control.mode,
        errorCount: control.errorCount,
        currentOrders: control.currentOrders,
      };
      
    } catch (error) {
      console.error("❌ Failed to get chaos status:", error);
      throw error;
    }
  },
});

export const startChaosMode = mutation({
  args: {},
  handler: async (ctx) => {
    const orgId = await resolveOrgId(ctx);
    
    try {
      console.log("🚀 Starting chaos mode...");
      
      // Initialize if not exists
      await ctx.runMutation(api.chaosMode.initializeChaosMode);
      
      // Update control to active
      const control = await ctx.db
        .query("chaosModeControl")
        .withIndex("by_org", (q) => q.eq("orgId", orgId))
        .first();
      
      if (!control) {
        throw new Error("Chaos mode control not found");
      }
      
      await ctx.db.patch(control._id, {
        isActive: true,
        startTime: Date.now(),
        lastActivity: Date.now(),
      });
      
      // Start the simulation
      await ctx.runMutation(api.chaosMode.startFactorySimulation);
      
      console.log("✅ Chaos mode started successfully");
      await logActivity(ctx, orgId, "Chaos mode started", { controlId: control._id });
      
      return { success: true };
      
    } catch (error) {
      console.error("❌ Failed to start chaos mode:", error);
      await logError(ctx, orgId, "critical", "startup", `Failed to start chaos mode: ${error}`, { error: error.message });
      throw error;
    }
  },
});

export const stopChaosMode = mutation({
  args: {},
  handler: async (ctx) => {
    const orgId = await resolveOrgId(ctx);
    
    try {
      console.log("🛑 Stopping chaos mode...");
      
      const control = await ctx.db
        .query("chaosModeControl")
        .withIndex("by_org", (q) => q.eq("orgId", orgId))
        .first();
      
      if (!control) {
        console.log("ℹ️ Chaos mode control not found, nothing to stop");
        return { success: true, message: "No active chaos mode to stop" };
      }
      
      await ctx.db.patch(control._id, {
        isActive: false,
        lastActivity: Date.now(),
      });
      
      console.log("✅ Chaos mode stopped successfully");
      await logActivity(ctx, orgId, "Chaos mode stopped", { 
        controlId: control._id,
      });
      
      return { success: true };
      
    } catch (error) {
      console.error("❌ Failed to stop chaos mode:", error);
      await logError(ctx, orgId, "critical", "shutdown", `Failed to stop chaos mode: ${error}`, { error: error.message });
      throw error;
    }
  },
});

export const clearDatabase = mutation({
  args: {},
  handler: async (ctx) => {
    const orgId = await resolveOrgId(ctx);
    
    try {
      console.log("🧹 Clearing database...");
      
      // Try to stop chaos mode first (optional)
      try {
        await ctx.runMutation(api.chaosMode.stopChaosMode);
      } catch (error) {
        console.log("⚠️ Chaos mode not active, continuing with clear...");
      }
      
      // Clear all chaos mode related data
      const items = await ctx.db.query("items").collect();
      for (const item of items) {
        await ctx.db.delete(item._id);
      }
      
      const scans = await ctx.db.query("scans").collect();
      for (const scan of scans) {
        await ctx.db.delete(scan._id);
      }
      
      const notifications = await ctx.db.query("notifications").collect();
      for (const notification of notifications) {
        await ctx.db.delete(notification._id);
      }
      
      const messages = await ctx.db.query("messages").collect();
      for (const message of messages) {
        await ctx.db.delete(message._id);
      }
      
      const recordsEnriched = await ctx.db.query("recordsEnriched").collect();
      for (const record of recordsEnriched) {
        await ctx.db.delete(record._id);
      }
      
      const purchaseOrders = await ctx.db.query("purchaseOrders").collect();
      for (const order of purchaseOrders) {
        await ctx.db.delete(order._id);
      }
      
      const workflows = await ctx.db.query("workflows").collect();
      for (const workflow of workflows) {
        await ctx.db.delete(workflow._id);
      }
      
      const brands = await ctx.db.query("brands").collect();
      for (const brand of brands) {
        await ctx.db.delete(brand._id);
      }
      
      const factories = await ctx.db.query("factories").collect();
      for (const factory of factories) {
        await ctx.db.delete(factory._id);
      }
      
      // Clear chaos mode specific tables
      const chaosErrors = await ctx.db.query("chaosModeErrors").collect();
      for (const error of chaosErrors) {
        await ctx.db.delete(error._id);
      }
      
      const chaosActivity = await ctx.db.query("chaosModeActivity").collect();
      for (const activity of chaosActivity) {
        await ctx.db.delete(activity._id);
      }
      
      const chaosOrders = await ctx.db.query("chaosModeOrders").collect();
      for (const order of chaosOrders) {
        await ctx.db.delete(order._id);
      }
      
      console.log("✅ Database cleared successfully");
      await logActivity(ctx, orgId, "Database cleared", { 
        itemsDeleted: items.length,
        scansDeleted: scans.length,
        notificationsDeleted: notifications.length,
        messagesDeleted: messages.length,
        recordsDeleted: recordsEnriched.length,
      });
      
      return { success: true };
      
    } catch (error) {
      console.error("❌ Failed to clear database:", error);
      await logError(ctx, orgId, "critical", "cleanup", `Failed to clear database: ${error}`, { error: error.message });
      throw error;
    }
  },
});

// ============================================================================
// STEP-BY-STEP CHAOS MODE FUNCTIONS
// ============================================================================

export const executeSeedScript = mutation({
  args: {},
  handler: async (ctx) => {
    const orgId = await resolveOrgId(ctx);
    
    try {
      console.log("🌱 Executing seed script...");
      
      // Check if already seeded
      const existingItems = await ctx.db.query("items").collect();
      if (existingItems.length > 0) {
        console.log("✅ Database already seeded");
        return { success: true, alreadySeeded: true, itemsCount: existingItems.length };
      }
      
      // Create infrastructure
      const infrastructure = await ctx.runMutation(api.chaosMode.createInfrastructure);
      
      // Create initial items
      const items = await ctx.runMutation(api.chaosMode.createInitialItems);
      
      console.log("✅ Seed script executed successfully");
      await logActivity(ctx, orgId, "Seed script executed", {
        infrastructure,
        items,
      });
      
      return { 
        success: true, 
        infrastructure,
        items,
      };
      
    } catch (error) {
      console.error("❌ Failed to execute seed script:", error);
      await logError(ctx, orgId, "critical", "seeding", `Failed to execute seed script: ${error}`, { error: error.message });
      throw error;
    }
  },
});

export const startManualScanSimulation = mutation({
  args: {
    scanCount: v.optional(v.number()),
    intervalSeconds: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const orgId = await resolveOrgId(ctx);
    const scanCount = args.scanCount || 20;
    const intervalSeconds = args.intervalSeconds || 5;
    
    try {
      console.log(`🔍 Starting manual scan simulation: ${scanCount} scans every ${intervalSeconds} seconds`);
      
      // Initialize chaos mode control if not exists
      await ctx.runMutation(api.chaosMode.initializeChaosMode);
      
      // Update control to indicate manual simulation mode
      const control = await ctx.db
        .query("chaosModeControl")
        .withIndex("by_org", (q) => q.eq("orgId", orgId))
        .first();
      
      if (control) {
        await ctx.db.patch(control._id, {
          mode: "test-fire",
          lastActivity: Date.now(),
        });
      }
      
      // Schedule the first scan
      await ctx.scheduler.runAfter(intervalSeconds * 1000, api.chaosMode.executeManualScan, {
        scanNumber: 1,
        totalScans: scanCount,
        intervalSeconds,
      });
      
      console.log("✅ Manual scan simulation started");
      await logActivity(ctx, orgId, "Manual scan simulation started", {
        scanCount,
        intervalSeconds,
      });
      
      return { success: true, scanCount, intervalSeconds };
      
    } catch (error) {
      console.error("❌ Failed to start manual scan simulation:", error);
      await logError(ctx, orgId, "critical", "manual_simulation", `Failed to start manual scan simulation: ${error}`, { error: error.message });
      throw error;
    }
  },
});

export const executeManualScan = mutation({
  args: {
    scanNumber: v.number(),
    totalScans: v.number(),
    intervalSeconds: v.number(),
  },
  handler: async (ctx, args) => {
    const orgId = await resolveOrgId(ctx);
    const { scanNumber, totalScans, intervalSeconds } = args;
    
    try {
      console.log(`🔍 Executing manual scan ${scanNumber}/${totalScans}`);
      
      // Get active items
      const activeItems = await ctx.db
        .query("items")
        .filter((q) => q.eq(q.field("status"), "active"))
        .collect();
      
      if (activeItems.length === 0) {
        console.log("⚠️ No active items found for scanning");
        await logActivity(ctx, orgId, "Manual scan - no active items", { scanNumber, totalScans });
        return { success: false, reason: "no_active_items" };
      }
      
      // Randomly select an item to scan
      const randomItem = activeItems[Math.floor(Math.random() * activeItems.length)];
      
      // Get workflow and current stage
      const workflow = await ctx.db.get(randomItem.workflowId);
      if (!workflow) {
        console.log("⚠️ Workflow not found for item");
        return { success: false, reason: "workflow_not_found" };
      }
      
      const currentStageIndex = workflow.stages.findIndex((s: any) => s.id === randomItem.currentStageId);
      if (currentStageIndex === -1) {
        console.log("⚠️ Current stage not found");
        return { success: false, reason: "stage_not_found" };
      }
      
      const currentStage = workflow.stages[currentStageIndex];
      
      // Create scan record
      const scanId = await ctx.db.insert("scans", {
        orgId,
        itemId: randomItem.itemId,
        qrData: `manual-scan-${scanNumber}-${randomItem.itemId}`,
        scanType: "stage_completion",
        success: true,
        userId: "chaos-mode-simulator",
        stageId: currentStage.id,
        timestamp: Date.now(),
        metadata: {
          scanNumber,
          totalScans,
          simulationType: "manual",
        },
      });
      
      // Check if item should advance to next stage (accelerated for demo)
      const timeInStage = Date.now() - randomItem.updatedAt;
      const stageDuration = currentStage.estimatedDuration * 2000; // 2 seconds per estimated minute
      
      let stageAdvanced = false;
      let nextStage = null;
      
      if (timeInStage >= stageDuration) {
        // Advance to next stage
        if (currentStageIndex < workflow.stages.length - 1) {
          nextStage = workflow.stages[currentStageIndex + 1];
          
          await ctx.db.patch(randomItem._id, {
            currentStageId: nextStage.id,
            updatedAt: Date.now(),
          });
          
          stageAdvanced = true;
          
          console.log(`✅ Item ${randomItem.itemId} advanced from ${currentStage.name} to ${nextStage.name}`);
          
        } else {
          // Item completed all stages
          await ctx.db.patch(randomItem._id, {
            status: "completed",
            updatedAt: Date.now(),
          });
          
          stageAdvanced = true;
          console.log(`🎉 Item ${randomItem.itemId} completed all stages!`);
        }
      }
      
      // Create enriched record for disco
      await ctx.db.insert("recordsEnriched", {
        orgId,
        factoryId: randomItem.factoryId,
        originalText: `Manual scan ${scanNumber}/${totalScans} for item ${randomItem.itemId} at ${currentStage.name} stage`,
        scanType: "manual",
        enrichment: {
          labels: ["MANUAL_SCAN", "SIMULATION", "PRODUCTION"],
          entities: [randomItem.itemId, currentStage.name, `scan-${scanNumber}`],
          fields: {
            sku: randomItem.metadata?.sku,
            po_number: randomItem.metadata?.poNumber,
            stage: currentStage.name,
            priority: "MEDIUM",
            assigned_to: "chaos-mode-simulator",
          },
        },
        userId: "chaos-mode-simulator",
        createdAt: Date.now(),
        metadata: {
          type: "manual_scan",
          itemId: randomItem.itemId,
          scanNumber,
          totalScans,
          stageAdvanced,
          fromStage: currentStage.name,
          toStage: nextStage?.name || "completed",
        },
      });
      
      // Update control stats
      const control = await ctx.db
        .query("chaosModeControl")
        .withIndex("by_org", (q) => q.eq("orgId", orgId))
        .first();
      
      if (control) {
        await ctx.db.patch(control._id, {
          lastActivity: Date.now(),
          manualScanProgress: {
            currentScan: scanNumber,
            totalScans: totalScans,
            completedAt: scanNumber >= totalScans ? Date.now() : undefined,
          },
        });
      }
      
      console.log(`✅ Manual scan ${scanNumber}/${totalScans} completed`);
      await logActivity(ctx, orgId, "Manual scan executed", {
        scanNumber,
        totalScans,
        itemId: randomItem.itemId,
        stageAdvanced,
        fromStage: currentStage.name,
        toStage: nextStage?.name || "completed",
      });
      
      // Schedule next scan if not the last one
      if (scanNumber < totalScans) {
        await ctx.scheduler.runAfter(intervalSeconds * 1000, api.chaosMode.executeManualScan, {
          scanNumber: scanNumber + 1,
          totalScans,
          intervalSeconds,
        });
      } else {
        // All scans completed
        console.log("🎉 Manual scan simulation completed!");
        await logActivity(ctx, orgId, "Manual scan simulation completed", {
          totalScans,
          intervalSeconds,
        });
        
        // Update control mode back to stopped
        if (control) {
          await ctx.db.patch(control._id, {
            mode: "stopped",
            lastActivity: Date.now(),
          });
        }
      }
      
      return { 
        success: true, 
        scanNumber,
        totalScans,
        itemId: randomItem.itemId,
        stageAdvanced,
        fromStage: currentStage.name,
        toStage: nextStage?.name || "completed",
      };
      
    } catch (error) {
      console.error(`❌ Manual scan ${scanNumber} failed:`, error);
      await logError(ctx, orgId, "critical", "manual_scan", `Manual scan ${scanNumber} failed: ${error}`, { 
        error: error.message,
        scanNumber,
        totalScans,
      });
      
      // Try to continue with next scan even if this one failed
      if (scanNumber < totalScans) {
        await ctx.scheduler.runAfter(intervalSeconds * 1000, api.chaosMode.executeManualScan, {
          scanNumber: scanNumber + 1,
          totalScans,
          intervalSeconds,
        });
      }
      
      return { success: false, error: error.message };
    }
  },
});

export const getManualSimulationStatus = query({
  args: {},
  handler: async (ctx) => {
    const orgId = await resolveOrgId(ctx);
    
    try {
      const control = await ctx.db
        .query("chaosModeControl")
        .withIndex("by_org", (q) => q.eq("orgId", orgId))
        .first();
      
      if (!control) {
        return {
          isActive: false,
          mode: "stopped",
          currentScan: 0,
          totalScans: 0,
          lastActivity: null,
        };
      }
      
      const scanProgress = control.manualScanProgress;
      
      return {
        isActive: control.mode === "test-fire",
        mode: control.mode,
        currentScan: scanProgress?.currentScan || 0,
        totalScans: scanProgress?.totalScans || 0,
        lastActivity: control.lastActivity,
      };
      
    } catch (error) {
      console.error("❌ Failed to get manual simulation status:", error);
      throw error;
    }
  },
});

// ============================================================================
// RESET FUNCTIONS
// ============================================================================

export const resetChaosModeControl = mutation({
  args: {},
  handler: async (ctx) => {
    const orgId = await resolveOrgId(ctx);
    
    try {
      console.log("🔄 Resetting chaos mode control...");
      
      const control = await ctx.db
        .query("chaosModeControl")
        .withIndex("by_org", (q) => q.eq("orgId", orgId))
        .first();
      
      if (control) {
        await ctx.db.patch(control._id, {
          mode: "stopped",
          isActive: false,
          lastActivity: Date.now(),
          manualScanProgress: undefined,
        });
        console.log("✅ Chaos mode control reset successfully");
      } else {
        console.log("ℹ️ No chaos mode control found to reset");
      }
      
      await logActivity(ctx, orgId, "Chaos mode control reset", {});
      return { success: true };
      
    } catch (error) {
      console.error("❌ Failed to reset chaos mode control:", error);
      await logError(ctx, orgId, "critical", "reset", `Failed to reset chaos mode control: ${error}`, { error: error.message });
      throw error;
    }
  },
});

// ============================================================================
// FACTORY SIMULATION FUNCTIONS
// ============================================================================

export const startFactorySimulation = mutation({
  args: {},
  handler: async (ctx) => {
    const orgId = await resolveOrgId(ctx);
    
    try {
      console.log("🏭 Starting factory simulation...");
      
      // Create infrastructure if it doesn't exist
      await ctx.runMutation(api.chaosMode.createInfrastructure);
      
      // Create initial items
      await ctx.runMutation(api.chaosMode.createInitialItems);
      
      // Schedule the first factory cycle
      await ctx.scheduler.runAfter(5000, api.chaosMode.runFactoryCycle);
      
      console.log("✅ Factory simulation started");
      await logActivity(ctx, orgId, "Factory simulation started", {});
      
      return { success: true };
      
    } catch (error) {
      console.error("❌ Failed to start factory simulation:", error);
      await logError(ctx, orgId, "critical", "simulation", `Failed to start factory simulation: ${error}`, { error: error.message });
      throw error;
    }
  },
});

export const runFactoryCycle = mutation({
  args: {},
  handler: async (ctx) => {
    const orgId = await resolveOrgId(ctx);
    
    try {
      // Check if chaos mode is still active
      const control = await ctx.db
        .query("chaosModeControl")
        .withIndex("by_org", (q) => q.eq("orgId", orgId))
        .first();
      
      if (!control || !control.isActive) {
        console.log("🛑 Chaos mode is not active, stopping factory cycle");
        return { success: false, reason: "chaos_mode_inactive" };
      }
      
      console.log("🏭 Running factory cycle...");
      
      // Process items through workflow stages
      await processItemsThroughWorkflow(ctx, orgId);
      
      // Generate random factory events
      await generateRandomEvents(ctx, orgId);
      
      // Update control stats
      await updateControlStats(ctx, control._id);
      
      // Schedule next cycle with more realistic factory timing
      // Sometimes quick cycles (3-8 seconds), sometimes longer gaps (10-30 seconds)
      const quickCycle = Math.random() > 0.6; // 40% chance of quick cycle
      const nextInterval = quickCycle 
        ? Math.floor(Math.random() * 5000) + 3000  // 3-8 seconds for quick cycles
        : Math.floor(Math.random() * 20000) + 10000; // 10-30 seconds for longer gaps
      
      await ctx.scheduler.runAfter(nextInterval, api.chaosMode.runFactoryCycle);
      
      console.log(`✅ Factory cycle completed, next cycle in ${nextInterval/1000}s`);
      
      return { success: true, nextInterval };
      
    } catch (error) {
      console.error("❌ Factory cycle failed:", error);
      await logError(ctx, orgId, "error", "cycle", `Factory cycle failed: ${error}`, { error: error.message });
      
      // Retry after 30 seconds on error
      await ctx.scheduler.runAfter(30000, api.chaosMode.runFactoryCycle);
      
      return { success: false, error: error.message };
    }
  },
});

async function processItemsThroughWorkflow(ctx: any, orgId: string) {
  const activeItems = await ctx.db
    .query("items")
    .filter((q) => q.eq(q.field("status"), "active"))
    .collect();
  
  console.log(`📦 Processing ${activeItems.length} active items...`);
  
  for (const item of activeItems) {
    try {
      // Get workflow and current stage
      const workflow = await ctx.db.get(item.workflowId);
      if (!workflow) continue;
      
      const currentStageIndex = workflow.stages.findIndex((s: any) => s.id === item.currentStageId);
      if (currentStageIndex === -1) continue;
      
      const currentStage = workflow.stages[currentStageIndex];
      
      // Check if item should advance to next stage (accelerated for demo)
      const timeInStage = Date.now() - item.updatedAt;
      const stageDuration = currentStage.estimatedDuration * 5000; // 5 seconds per estimated minute
      
      if (timeInStage >= stageDuration) {
        // Advance to next stage
        if (currentStageIndex < workflow.stages.length - 1) {
          const nextStage = workflow.stages[currentStageIndex + 1];
          
          await ctx.db.patch(item._id, {
            currentStageId: nextStage.id,
            updatedAt: Date.now(),
          });
          
          // Create scan record
          await ctx.db.insert("scans", {
            orgId,
            itemId: item.itemId,
            qrData: `stage-${currentStage.id}-complete`,
            scanType: "stage_completion",
            success: true,
            userId: "factory-worker",
            stageId: currentStage.id,
            timestamp: Date.now(),
          });
          
          // Create enriched record for disco
          await ctx.db.insert("recordsEnriched", {
            orgId,
            factoryId: item.factoryId,
            originalText: `Item ${item.itemId} completed ${currentStage.name} stage`,
            scanType: "qr",
            enrichment: {
              labels: ["STAGE_COMPLETED", "PRODUCTION"],
              entities: [item.itemId, currentStage.name, nextStage.name],
              fields: {
                sku: item.metadata?.sku,
                po_number: item.metadata?.poNumber,
                stage: nextStage.name,
                quantity: 1,
                priority: "MEDIUM",
                assigned_to: "factory-worker",
              },
            },
            userId: "factory-worker",
            createdAt: Date.now(),
            metadata: {
              type: "stage_completion",
              itemId: item.itemId,
              fromStage: currentStage.name,
              toStage: nextStage.name,
              orderId: item.metadata?.orderId,
            },
          });
          
          console.log(`✅ Item ${item.itemId} advanced from ${currentStage.name} to ${nextStage.name}`);
          
        } else {
          // Item completed all stages
          await ctx.db.patch(item._id, {
            status: "completed",
            updatedAt: Date.now(),
          });
          
          // Create completion enriched record for disco
          await ctx.db.insert("recordsEnriched", {
            orgId,
            factoryId: item.factoryId,
            originalText: `Item ${item.itemId} completed all production stages`,
            scanType: "qr",
            enrichment: {
              labels: ["ITEM_COMPLETED", "PRODUCTION"],
              entities: [item.itemId, "completed"],
              fields: {
                sku: item.metadata?.sku,
                po_number: item.metadata?.poNumber,
                stage: "completed",
                quantity: 1,
                priority: "HIGH",
                assigned_to: "factory-worker",
              },
            },
            userId: "factory-worker",
            createdAt: Date.now(),
            metadata: {
              type: "item_completion",
              itemId: item.itemId,
              orderId: item.metadata?.orderId,
              finalStage: currentStage.name,
            },
          });
          
          console.log(`🎉 Item ${item.itemId} completed all stages!`);
        }
      }
    } catch (error) {
      console.error(`❌ Error processing item ${item.itemId}:`, error);
    }
  }
}

async function generateRandomEvents(ctx: any, orgId: string) {
  console.log("🎲 Rolling for random events...");
  // 100% chance of generating random events (temporarily for testing)
  if (Math.random() > 0.0) {
    console.log("🎲 No random events this cycle");
    return;
  }
  
  console.log("🎲 Random event triggered!");
  
  const eventTypes = [
    "defective_item",
    "quality_alert", 
    "equipment_maintenance",
    "material_delivery",
    "team_message",
    "production_update",
    "disco_enrichment",
    "scan_anomaly"
  ];
  
  const randomEvent = eventTypes[Math.floor(Math.random() * eventTypes.length)];
  console.log(`🎲 Selected event type: ${randomEvent}`);
  
  switch (randomEvent) {
    case "defective_item":
      // Flag a random item as defective
      const activeItems = await ctx.db
        .query("items")
        .filter((q) => q.eq(q.field("status"), "active"))
        .collect();
      
      if (activeItems.length > 0) {
        const randomItem = activeItems[Math.floor(Math.random() * activeItems.length)];
        const defectTypes = ["fabric_damage", "stitching_error", "size_mismatch", "color_bleed", "missing_component"];
        const defectType = defectTypes[Math.floor(Math.random() * defectTypes.length)];
        
        await ctx.db.patch(randomItem._id, {
          isDefective: true,
          defectNotes: `Random defect detected: ${defectType}`,
          flaggedBy: "quality-system",
          flaggedAt: Date.now(),
        });
        
        // Create disco enriched record for defect
        await ctx.db.insert("recordsEnriched", {
          orgId,
          factoryId: randomItem.factoryId,
          originalText: `Item ${randomItem.itemId} flagged as defective: ${defectType}`,
          scanType: "quality_check",
          enrichment: {
            labels: ["DEFECTIVE", "QUALITY_ISSUE", "REQUIRES_ATTENTION"],
            entities: [randomItem.itemId, defectType, "quality-system"],
            fields: {
              defect_type: defectType,
              item_id: randomItem.itemId,
              priority: "HIGH",
              assigned_to: "quality-control",
              requires_rework: true,
            },
          },
          userId: "quality-system",
          createdAt: Date.now(),
          metadata: {
            type: "defect_detection",
            itemId: randomItem.itemId,
            defectType,
            severity: "medium",
          },
        });
        
        console.log(`🚨 Item ${randomItem.itemId} flagged as defective: ${defectType}`);
      }
      break;
      
    case "quality_alert":
      await ctx.db.insert("notifications", {
        orgId,
        userId: "quality-control",
        type: "quality_alert",
        title: "Quality Alert",
        message: "Quality check required for batch #QC-2024-001",
        isRead: false,
        priority: "high",
        createdAt: Date.now(),
      });
      break;
      
    case "equipment_maintenance":
      await ctx.db.insert("notifications", {
        orgId,
        userId: "maintenance-team",
        type: "equipment_maintenance",
        title: "Equipment Maintenance",
        message: "Sewing machine #3 requires routine maintenance",
        isRead: false,
        priority: "medium",
        createdAt: Date.now(),
      });
      break;
      
    case "material_delivery":
      await ctx.db.insert("notifications", {
        orgId,
        userId: "factory-manager",
        type: "material_delivery",
        title: "Material Delivery",
        message: "New fabric shipment arrived at loading dock",
        isRead: false,
        priority: "medium",
        createdAt: Date.now(),
      });
      break;
      
    case "team_message":
      await ctx.db.insert("messages", {
        orgId,
        senderId: "team-lead",
        recipientId: "factory-workers",
        content: "Great work on the morning shift! Keep up the quality.",
        type: "team_update",
        isRead: false,
        createdAt: Date.now(),
      });
      break;
      
    case "production_update":
      await ctx.db.insert("messages", {
        orgId,
        senderId: "production-manager",
        recipientId: "all",
        content: "Production target for today: 500 units. We're at 342 units.",
        type: "production_update",
        isRead: false,
        createdAt: Date.now(),
      });
      break;
      
    case "disco_enrichment":
      // Create AI-enriched disco record with complex data
      const enrichmentTypes = [
        "quality_analysis",
        "production_insight", 
        "efficiency_metric",
        "material_consumption",
        "worker_performance"
      ];
      const enrichmentType = enrichmentTypes[Math.floor(Math.random() * enrichmentTypes.length)];
      
      await ctx.db.insert("recordsEnriched", {
        orgId,
        factoryId: "factory-1",
        originalText: `AI analysis: ${enrichmentType} data processed for factory optimization`,
        scanType: "ai_analysis",
        enrichment: {
          labels: ["AI_ENRICHED", "ANALYTICS", "OPTIMIZATION"],
          entities: ["factory-1", enrichmentType, "ai-system"],
          fields: {
            analysis_type: enrichmentType,
            confidence_score: Math.random() * 0.3 + 0.7, // 70-100% confidence
            insights_generated: Math.floor(Math.random() * 5) + 1,
            processing_time_ms: Math.floor(Math.random() * 1000) + 100,
            ai_model_version: "disco-3b-v1.2",
          },
        },
        userId: "ai-system",
        createdAt: Date.now(),
        metadata: {
          type: "ai_enrichment",
          enrichmentType,
          modelVersion: "disco-3b-v1.2",
          processingTime: Date.now(),
        },
      });
      
      console.log(`🤖 AI enrichment: ${enrichmentType} analysis completed`);
      break;
      
    case "scan_anomaly":
      // Create scan anomaly that requires attention
      const anomalyTypes = ["duplicate_scan", "invalid_location", "timing_anomaly", "unauthorized_access"];
      const anomalyType = anomalyTypes[Math.floor(Math.random() * anomalyTypes.length)];
      
      await ctx.db.insert("recordsEnriched", {
        orgId,
        factoryId: "factory-1",
        originalText: `Scan anomaly detected: ${anomalyType} - requires investigation`,
        scanType: "anomaly_detection",
        enrichment: {
          labels: ["ANOMALY", "SECURITY", "REQUIRES_INVESTIGATION"],
          entities: ["scan-system", anomalyType, "security-alert"],
          fields: {
            anomaly_type: anomalyType,
            severity: "MEDIUM",
            requires_action: true,
            investigation_needed: true,
            timestamp: Date.now(),
          },
        },
        userId: "security-system",
        createdAt: Date.now(),
        metadata: {
          type: "scan_anomaly",
          anomalyType,
          severity: "medium",
          requiresInvestigation: true,
        },
      });
      
      console.log(`⚠️ Scan anomaly detected: ${anomalyType}`);
      break;
  }
  
  console.log(`📢 Generated random event: ${randomEvent}`);
}

async function updateControlStats(ctx: any, controlId: any) {
  const items = await ctx.db.query("items").collect();
  const scans = await ctx.db.query("scans").collect();
  const notifications = await ctx.db.query("notifications").collect();
  const messages = await ctx.db.query("messages").collect();
  
  await ctx.db.patch(controlId, {
    lastActivity: Date.now(),
  });
}

// ============================================================================
// SEED FUNCTIONS
// ============================================================================

export const createInfrastructure = mutation({
  args: {},
  handler: async (ctx) => {
    const orgId = await resolveOrgId(ctx);
    
    try {
      console.log("🏗️ Creating factory infrastructure...");
      
      // Create brands
      const brand1Id = await ctx.db.insert("brands", {
        orgId,
        name: "Galactic Manufacturing Co.",
        email: "contact@galactic.com",
        contactPerson: "Sarah Johnson",
        address: "123 Space Station Blvd, Orbit City, OC 12345",
        phone: "+1-555-0123",
        isActive: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
      
      const brand2Id = await ctx.db.insert("brands", {
        orgId,
        name: "Stellar Textiles Ltd.",
        email: "info@stellar.com",
        contactPerson: "Mike Chen",
        address: "456 Nebula Drive, Star Town, ST 67890",
        phone: "+1-555-0456",
        isActive: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
      
      // Create factories
      const factory1Id = await ctx.db.insert("factories", {
        orgId,
        name: "Galactic Factory Alpha",
        location: "Orbit City Industrial Zone",
        adminUserId: "admin-1",
        capacity: 1000,
        specialties: ["Cotton", "Polyester", "Blends"],
        isActive: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
      
      const factory2Id = await ctx.db.insert("factories", {
        orgId,
        name: "Stellar Factory Beta",
        location: "Star Town Manufacturing District",
        adminUserId: "admin-2",
        capacity: 800,
        specialties: ["Silk", "Wool", "Synthetic"],
        isActive: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
      
      // Create workflow
      const workflowId = await ctx.db.insert("workflows", {
        orgId,
        name: "Standard Manufacturing Process",
        description: "5-stage manufacturing workflow for textile products",
        stages: [
          {
            id: "stage-1",
            name: "Cutting",
            description: "Cut fabric according to specifications",
            order: 1,
            estimatedDuration: 2, // minutes
            isActive: true,
          },
          {
            id: "stage-2",
            name: "Sewing",
            description: "Sew pieces together",
            order: 2,
            estimatedDuration: 5,
            isActive: true,
          },
          {
            id: "stage-3",
            name: "Assembly",
            description: "Assemble final product",
            order: 3,
            estimatedDuration: 3,
            isActive: true,
          },
          {
            id: "stage-4",
            name: "Quality Control",
            description: "Inspect finished product",
            order: 4,
            estimatedDuration: 1,
            isActive: true,
          },
          {
            id: "stage-5",
            name: "Packaging",
            description: "Package for shipping",
            order: 5,
            estimatedDuration: 1,
            isActive: true,
          },
        ],
        isActive: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        createdBy: "system",
      });
      
      // Create purchase orders
      const order1Id = await ctx.db.insert("purchaseOrders", {
        orgId,
        poNumber: "PO-2024-001",
        brandId: brand1Id,
        factoryId: factory1Id,
        status: "accepted",
        requestedDeliveryDate: Date.now() + (7 * 24 * 60 * 60 * 1000), // 7 days from now
        items: [
          {
            sku: "TSHIRT-001",
            description: "Navy Blue Cotton T-Shirt",
            quantity: 200,
            specifications: {
              material: "100% Cotton",
              size: "M",
              color: "Navy Blue",
              weight: "180 GSM",
            },
          },
          {
            sku: "TSHIRT-002",
            description: "White Cotton T-Shirt",
            quantity: 150,
            specifications: {
              material: "100% Cotton",
              size: "L",
              color: "White",
              weight: "180 GSM",
            },
          },
        ],
        totalValue: 17500.00, // $17,500 total value
        submittedAt: Date.now(),
      });
      
      const order2Id = await ctx.db.insert("purchaseOrders", {
        orgId,
        poNumber: "PO-2024-002",
        brandId: brand2Id,
        factoryId: factory2Id,
        status: "accepted",
        requestedDeliveryDate: Date.now() + (10 * 24 * 60 * 60 * 1000), // 10 days from now
        items: [
          {
            sku: "HOODIE-001",
            description: "Black Cotton/Polyester Hoodie",
            quantity: 100,
            specifications: {
              material: "Cotton/Polyester Blend",
              size: "XL",
              color: "Black",
              weight: "300 GSM",
            },
          },
        ],
        totalValue: 8500.00, // $8,500 total value
        submittedAt: Date.now(),
      });
      
      console.log("✅ Factory infrastructure created successfully");
      await logActivity(ctx, orgId, "Infrastructure created", {
        brands: 2,
        factories: 2,
        workflows: 1,
        orders: 2,
      });
      
      return { 
        success: true, 
        brands: [brand1Id, brand2Id],
        factories: [factory1Id, factory2Id],
        workflow: workflowId,
        orders: [order1Id, order2Id],
      };
      
    } catch (error) {
      console.error("❌ Failed to create infrastructure:", error);
      await logError(ctx, orgId, "critical", "infrastructure", `Failed to create infrastructure: ${error}`, { error: error.message });
      throw error;
    }
  },
});

export const createInitialItems = mutation({
  args: {},
  handler: async (ctx) => {
    const orgId = await resolveOrgId(ctx);
    
    try {
      console.log("📦 Creating initial items...");
      
      const orders = await ctx.db.query("purchaseOrders").collect();
      const workflows = await ctx.db.query("workflows").collect();
      const factories = await ctx.db.query("factories").collect();
      
      if (orders.length === 0 || workflows.length === 0) {
        throw new Error("Orders and workflows must exist before creating items");
      }
      
      const workflow = workflows[0];
      const factory = factories[0];
      const items = [];
      
      for (const order of orders) {
        for (const orderItem of order.items) {
          for (let i = 0; i < orderItem.quantity; i++) {
            const itemId = await ctx.db.insert("items", {
              orgId,
              itemId: `${orderItem.sku}-${order.poNumber}-${i + 1}`,
              workflowId: workflow._id,
              currentStageId: workflow.stages[0].id,
              status: "active",
              metadata: {
                orderId: order._id,
                poNumber: order.poNumber,
                sku: orderItem.sku,
                specifications: orderItem.specifications,
                brand: order.brandId === order.brandId ? "Galactic Manufacturing Co." : "Stellar Textiles Ltd.",
                style: orderItem.sku,
              },
              startedAt: Date.now(),
              updatedAt: Date.now(),
              brandId: order.brandId,
              factoryId: order.factoryId,
              purchaseOrderId: order._id,
            });
            items.push(itemId);
            
            // Create enriched record for disco system
            await ctx.db.insert("recordsEnriched", {
              orgId,
              factoryId: factory._id,
              originalText: `Item ${orderItem.sku}-${order.poNumber}-${i + 1} created for order ${order.poNumber}`,
              scanType: "manual",
              enrichment: {
                labels: ["ITEM_CREATED", "PRODUCTION"],
                entities: [orderItem.sku, order.poNumber, workflow.stages[0].name],
                fields: {
                  sku: orderItem.sku,
                  po_number: order.poNumber,
                  stage: workflow.stages[0].name,
                  quantity: 1,
                  priority: "MEDIUM",
                  assigned_to: "factory-worker",
                },
              },
              userId: "factory-worker",
              createdAt: Date.now(),
              metadata: {
                type: "item_creation",
                itemId: `${orderItem.sku}-${order.poNumber}-${i + 1}`,
                orderId: order._id,
                stage: workflow.stages[0].name,
              },
            });
          }
        }
      }
      
      console.log("✅ Initial items created successfully with disco records");
      await logActivity(ctx, orgId, "Initial items created", {
        itemsCreated: items.length,
        ordersProcessed: orders.length,
      });
      
      return { success: true, itemsCreated: items.length };
      
    } catch (error) {
      console.error("❌ Failed to create initial items:", error);
      await logError(ctx, orgId, "critical", "items", `Failed to create initial items: ${error}`, { error: error.message });
      throw error;
    }
  },
});

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

async function resolveOrgId(ctx: any) {
  // Try to find an existing organization
  const existingOrg = await ctx.db.query("organizations").first();
  
  if (existingOrg) {
    return existingOrg._id;
  }
  
  // Create a default organization if none exists
  const orgId = await ctx.db.insert("organizations", {
    name: "Default Organization",
    slug: "default",
    ownerUserId: "system",
    createdAt: Date.now(),
    metadata: { type: "chaos-mode-default" },
  });
  
  return orgId;
}

async function logActivity(ctx: any, orgId: string, action: string, details: any) {
  await ctx.db.insert("chaosModeActivity", {
    orgId,
    action,
    details,
    timestamp: Date.now(),
  });
}

async function logError(ctx: any, orgId: string, severity: string, category: string, message: string, details: any) {
  await ctx.db.insert("chaosModeErrors", {
    orgId,
    type: severity as "critical" | "warning" | "info",
    category,
    message,
    details,
    resolved: false,
    timestamp: Date.now(),
  });
}
