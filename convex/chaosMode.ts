import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

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
        totalItemsCreated: 0,
        totalItemsCompleted: 0,
        totalScans: 0,
        totalNotifications: 0,
        totalMessages: 0,
        testFireInProgress: false,
        testFireProgress: 0,
        testFireResults: null,
        createdAt: Date.now(),
        updatedAt: Date.now(),
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
          mode: "stopped",
          uptime: 0,
          startTime: null,
          lastActivity: null,
          errorCount: 0,
          currentOrders: [],
          totalItemsCreated: 0,
          totalItemsCompleted: 0,
          totalScans: 0,
          totalNotifications: 0,
          totalMessages: 0,
          testFireInProgress: false,
          testFireProgress: 0,
          testFireResults: null,
          errors: [],
        };
      }
      
      // Calculate current uptime if active
      let currentUptime = control.uptime || 0;
      if (control.isActive && control.startTime) {
        currentUptime = Math.floor((Date.now() - control.startTime) / 1000);
      }
      
      // Get recent errors
      const errors = await ctx.db
        .query("chaosModeErrors")
        .withIndex("by_org", (q) => q.eq("orgId", orgId))
        .order("desc")
        .take(5);
      
      return {
        isActive: control.isActive,
        mode: control.mode,
        uptime: currentUptime,
        startTime: control.startTime,
        lastActivity: control.lastActivity,
        errorCount: control.errorCount,
        currentOrders: control.currentOrders,
        totalItemsCreated: control.totalItemsCreated || 0,
        totalItemsCompleted: control.totalItemsCompleted || 0,
        totalScans: control.totalScans || 0,
        totalNotifications: control.totalNotifications || 0,
        totalMessages: control.totalMessages || 0,
        testFireInProgress: control.testFireInProgress || false,
        testFireProgress: control.testFireProgress || 0,
        testFireResults: control.testFireResults,
        errors: errors.map(e => ({
          id: e._id,
          type: e.type,
          message: e.message,
          timestamp: e.timestamp,
        })),
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
      await ctx.runMutation("chaosMode:initializeChaosMode");
      
      // Update control to test fire mode
      const control = await ctx.db
        .query("chaosModeControl")
        .withIndex("by_org", (q) => q.eq("orgId", orgId))
        .first();
      
      if (!control) {
        throw new Error("Chaos mode control not found");
      }
      
      await ctx.db.patch(control._id, {
        isActive: true,
        mode: "test-fire",
        startTime: Date.now(),
        lastActivity: Date.now(),
        testFireInProgress: true,
        testFireProgress: 0,
        updatedAt: Date.now(),
      });
      
      // Start the test fire sequence
      await ctx.runMutation("chaosMode:runTestFireSequence");
      
      console.log("✅ Chaos mode started with test fire");
      await logActivity(ctx, orgId, "Chaos mode started with test fire", { controlId: control._id });
      
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
        throw new Error("Chaos mode control not found");
      }
      
      // Calculate final uptime
      let finalUptime = 0;
      if (control.isActive && control.startTime) {
        finalUptime = Math.floor((Date.now() - control.startTime) / 1000);
      }
      
      await ctx.db.patch(control._id, {
        isActive: false,
        mode: "stopped",
        lastActivity: Date.now(),
        uptime: finalUptime,
        testFireInProgress: false,
        updatedAt: Date.now(),
      });
      
      console.log("✅ Chaos mode stopped successfully");
      await logActivity(ctx, orgId, "Chaos mode stopped", { 
        controlId: control._id,
        finalUptime 
      });
      
      return { success: true, finalUptime };
      
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
      
      // Stop chaos mode first
      await ctx.runMutation("chaosMode:stopChaosMode");
      
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
// TEST FIRE SEQUENCE
// ============================================================================

export const runTestFireSequence = mutation({
  args: {},
  handler: async (ctx) => {
    const orgId = await resolveOrgId(ctx);
    
    try {
      console.log("🧪 Starting test fire sequence...");
      
      const control = await ctx.db
        .query("chaosModeControl")
        .withIndex("by_org", (q) => q.eq("orgId", orgId))
        .first();
      
      if (!control) {
        throw new Error("Chaos mode control not found");
      }
      
      const testSequence = [
        { name: "System Validation", function: "validateSystem", progress: 10 },
        { name: "Database Cleanup", function: "clearDatabase", progress: 20 },
        { name: "Infrastructure Creation", function: "createInfrastructure", progress: 40 },
        { name: "Star Wars Order Seeding", function: "seedStarWarsOrders", progress: 60 },
        { name: "Workflow Creation", function: "createWorkflows", progress: 70 },
        { name: "Item Creation", function: "createInitialItems", progress: 85 },
        { name: "Simulation Activation", function: "startFactorySimulation", progress: 100 }
      ];
      
      let testResults = {
        completed: false,
        tests: [],
        errors: [],
        success: true
      };
      
      for (const test of testSequence) {
        try {
          console.log(`🧪 Running test: ${test.name}`);
          
          // Update progress
          await ctx.db.patch(control._id, {
            testFireProgress: test.progress,
            updatedAt: Date.now(),
          });
          
          // Run the test
          let result = { success: true, details: {} };
          
          switch (test.function) {
            case "validateSystem":
              result = await validateSystem(ctx, orgId);
              break;
            case "clearDatabase":
              await ctx.runMutation("chaosMode:clearDatabase");
              break;
            case "createInfrastructure":
              result = await ctx.runMutation("chaosMode:createInfrastructure");
              break;
            case "seedStarWarsOrders":
              result = await ctx.runMutation("chaosMode:seedStarWarsOrders");
              break;
            case "createWorkflows":
              result = await ctx.runMutation("chaosMode:createStarWarsWorkflows");
              break;
            case "createInitialItems":
              result = await ctx.runMutation("chaosMode:createInitialItems");
              break;
            case "startFactorySimulation":
              result = await ctx.runMutation("chaosMode:startFactorySimulation");
              break;
          }
          
          testResults.tests.push({
            name: test.name,
            success: result.success,
            details: result,
            timestamp: Date.now()
          });
          
          if (!result.success) {
            testResults.success = false;
            testResults.errors.push(`${test.name} failed: ${result.error || 'Unknown error'}`);
          }
          
          console.log(`✅ Test completed: ${test.name} - ${result.success ? 'PASS' : 'FAIL'}`);
          
        } catch (error) {
          console.error(`❌ Test failed: ${test.name}`, error);
          testResults.success = false;
          testResults.errors.push(`${test.name} failed: ${error.message}`);
          testResults.tests.push({
            name: test.name,
            success: false,
            error: error.message,
            timestamp: Date.now()
          });
        }
      }
      
      testResults.completed = true;
      
      // Update control with results
      await ctx.db.patch(control._id, {
        testFireInProgress: false,
        testFireProgress: 100,
        testFireResults: testResults,
        mode: testResults.success ? "full-chaos" : "stopped",
        isActive: testResults.success,
        updatedAt: Date.now(),
      });
      
      if (testResults.success) {
        console.log("🎉 Test fire sequence completed successfully! Starting full chaos mode...");
        await logActivity(ctx, orgId, "Test fire completed successfully", { testResults });
        
        // Schedule the first factory cycle
        await ctx.scheduler.runAfter(5000, "chaosMode:runFactoryCycle");
      } else {
        console.log("❌ Test fire sequence failed, chaos mode stopped");
        await logError(ctx, orgId, "critical", "test-fire", "Test fire sequence failed", { testResults });
      }
      
      return { success: testResults.success, results: testResults };
      
    } catch (error) {
      console.error("❌ Test fire sequence failed:", error);
      await logError(ctx, orgId, "critical", "test-fire", `Test fire sequence failed: ${error}`, { error: error.message });
      throw error;
    }
  },
});

async function validateSystem(ctx: any, orgId: string) {
  try {
    // Check database connectivity
    const orgCheck = await ctx.db.get(orgId);
    
    // Check if required tables exist by trying to query them
    await ctx.db.query("organizations").first();
    await ctx.db.query("brands").first();
    await ctx.db.query("factories").first();
    await ctx.db.query("workflows").first();
    await ctx.db.query("items").first();
    await ctx.db.query("scans").first();
    await ctx.db.query("notifications").first();
    await ctx.db.query("messages").first();
    await ctx.db.query("recordsEnriched").first();
    await ctx.db.query("purchaseOrders").first();
    
    return { 
      success: true, 
      details: { 
        orgFound: !!orgCheck, 
        tablesAccessible: true,
        timestamp: Date.now()
      } 
    };
  } catch (error) {
    return { 
      success: false, 
      error: `System validation failed: ${error.message}`,
      details: { error: error.message }
    };
  }
}

// ============================================================================
// STAR WARS SEEDING FUNCTIONS
// ============================================================================

export const seedStarWarsOrders = mutation({
  args: {},
  handler: async (ctx) => {
    const orgId = await resolveOrgId(ctx);
    
    try {
      console.log("🌟 Seeding Star Wars orders...");
      
      // Get existing infrastructure
      const brands = await ctx.db.query("brands").collect();
      const factories = await ctx.db.query("factories").collect();
      
      if (brands.length === 0 || factories.length === 0) {
        throw new Error("Infrastructure must be created before seeding orders");
      }
      
      const galacticBrand = brands.find(b => b.name === "Galactic Manufacturing Co.");
      const stellarBrand = brands.find(b => b.name === "Stellar Textiles Ltd.") || brands[1];
      const rebellionBrand = brands[2] || stellarBrand;
      
      const factory1 = factories[0];
      const factory2 = factories[1] || factory1;
      const factory3 = factories[2] || factory1;
      
      // Create Star Wars themed orders
      const orders = [
        {
          poNumber: "SW-PO-2024-001",
          description: "Jedi Lightsaber Collection - Standard Manufacturing",
          brandId: galacticBrand._id,
          factoryId: factory1._id,
          theme: "Star Wars",
          totalItems: 1000,
          items: [
            {
              sku: "LS-LUKE-001",
              quantity: 250,
              description: "Luke Skywalker Lightsaber",
              specifications: {
                character: "Luke Skywalker",
                itemType: "lightsaber",
                material: "durasteel",
                color: "blue",
                size: "standard"
              }
            },
            {
              sku: "LS-OBI-002", 
              quantity: 250,
              description: "Obi-Wan Kenobi Lightsaber",
              specifications: {
                character: "Obi-Wan Kenobi",
                itemType: "lightsaber",
                material: "durasteel",
                color: "blue",
                size: "standard"
              }
            },
            {
              sku: "LS-QUI-003",
              quantity: 250,
              description: "Qui-Gon Jinn Lightsaber",
              specifications: {
                character: "Qui-Gon Jinn",
                itemType: "lightsaber",
                material: "durasteel",
                color: "green",
                size: "standard"
              }
            },
            {
              sku: "LS-ANI-004",
              quantity: 250,
              description: "Anakin Skywalker Lightsaber",
              specifications: {
                character: "Anakin Skywalker",
                itemType: "lightsaber",
                material: "durasteel",
                color: "blue",
                size: "standard"
              }
            }
          ]
        },
        {
          poNumber: "SW-PO-2024-002",
          description: "Sith Lord Equipment Set - Quality-Focused Production",
          brandId: stellarBrand._id,
          factoryId: factory2._id,
          theme: "Star Wars",
          totalItems: 1000,
          items: [
            {
              sku: "SI-VADER-001",
              quantity: 500,
              description: "Darth Vader Helmet",
              specifications: {
                character: "Darth Vader",
                itemType: "helmet",
                material: "durasteel",
                color: "black",
                size: "large"
              }
            },
            {
              sku: "SI-VADER-002",
              quantity: 500,
              description: "Darth Vader Chest Armor",
              specifications: {
                character: "Darth Vader",
                itemType: "armor",
                material: "durasteel",
                color: "black",
                size: "large"
              }
            }
          ]
        },
        {
          poNumber: "SW-PO-2024-003", 
          description: "Mandalorian Beskar Armor - Rapid Production",
          brandId: rebellionBrand._id,
          factoryId: factory3._id,
          theme: "Star Wars",
          totalItems: 1000,
          items: [
            {
              sku: "MAN-DIN-001",
              quantity: 1000,
              description: "Din Djarin Beskar Helmet",
              specifications: {
                character: "Din Djarin",
                itemType: "helmet",
                material: "beskar",
                color: "silver",
                size: "standard"
              }
            }
          ]
        }
      ];
      
      const createdOrders = [];
      
      for (const orderData of orders) {
        const orderId = await ctx.db.insert("purchaseOrders", {
          orgId,
          poNumber: orderData.poNumber,
          brandId: orderData.brandId,
          factoryId: orderData.factoryId,
          status: "active",
          requestedDeliveryDate: Date.now() + (30 * 24 * 60 * 60 * 1000), // 30 days from now
          items: orderData.items,
          totalQuantity: orderData.totalItems,
          metadata: {
            theme: orderData.theme,
            description: orderData.description,
          },
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });
        
        // Create chaos mode order tracking
        await ctx.db.insert("chaosModeOrders", {
          orgId,
          poNumber: orderData.poNumber,
          description: orderData.description,
          brandId: orderData.brandId,
          factoryId: orderData.factoryId,
          workflowId: "", // Will be set when workflows are created
          status: "pending",
          theme: orderData.theme,
          totalItems: orderData.totalItems,
          completedItems: 0,
          currentStage: "pending",
          estimatedCompletion: Date.now() + (30 * 24 * 60 * 60 * 1000),
          chaosSettings: {
            scanInterval: 30, // seconds
            stageInterval: 45, // minutes
            problemInterval: 90, // minutes
            messageInterval: 60, // minutes
          },
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });
        
        createdOrders.push(orderId);
      }
      
      console.log("✅ Star Wars orders seeded successfully");
      await logActivity(ctx, orgId, "Star Wars orders seeded", {
        ordersCreated: createdOrders.length,
        totalItems: orders.reduce((sum, order) => sum + order.totalItems, 0),
      });
      
      return { success: true, ordersCreated: createdOrders.length };
      
    } catch (error) {
      console.error("❌ Failed to seed Star Wars orders:", error);
      await logError(ctx, orgId, "critical", "seeding", `Failed to seed Star Wars orders: ${error}`, { error: error.message });
      throw error;
    }
  },
});

export const createStarWarsWorkflows = mutation({
  args: {},
  handler: async (ctx) => {
    const orgId = await resolveOrgId(ctx);
    
    try {
      console.log("🛠️ Creating Star Wars workflows...");
      
      const workflows = [
        {
          name: "Standard Manufacturing Workflow",
          description: "Traditional 5-stage manufacturing process for lightsabers",
          stages: [
            {
              id: "material-prep",
              name: "Material Preparation",
              description: "Prepare and inspect raw materials",
              order: 1,
              actions: [
                {
                  id: "scan-material",
                  type: "scan",
                  label: "Scan Material QR Code",
                  required: true,
                  config: { scanType: "qr", expectedValue: "material:" }
                },
                {
                  id: "measure-material",
                  type: "measurement",
                  label: "Measure Material Dimensions",
                  required: true,
                  config: { measurements: ["length", "width", "thickness"] }
                }
              ],
              estimatedDuration: 30,
              isActive: true,
              color: "#3B82F6",
              position: { x: 100, y: 100 }
            },
            {
              id: "cutting",
              name: "Cutting & Shaping",
              description: "Cut and shape materials to specifications",
              order: 2,
              actions: [
                {
                  id: "scan-cutting-station",
                  type: "scan",
                  label: "Scan Cutting Station",
                  required: true
                },
                {
                  id: "quality-check-cut",
                  type: "inspection",
                  label: "Quality Check Cuts",
                  required: true,
                  config: { checklist: ["precision", "clean_edges", "dimensions"] }
                }
              ],
              estimatedDuration: 45,
              isActive: true,
              color: "#10B981",
              position: { x: 300, y: 100 }
            },
            {
              id: "assembly",
              name: "Assembly",
              description: "Assemble components together",
              order: 3,
              actions: [
                {
                  id: "scan-assembly-station",
                  type: "scan",
                  label: "Scan Assembly Station",
                  required: true
                },
                {
                  id: "assembly-photo",
                  type: "photo",
                  label: "Take Assembly Photo",
                  required: false,
                  config: { photoCount: 2, requiredAngles: ["front", "side"] }
                }
              ],
              estimatedDuration: 60,
              isActive: true,
              color: "#F59E0B",
              position: { x: 500, y: 100 }
            },
            {
              id: "finishing",
              name: "Finishing & Polish",
              description: "Apply finishing touches and polish",
              order: 4,
              actions: [
                {
                  id: "scan-finishing-station",
                  type: "scan",
                  label: "Scan Finishing Station",
                  required: true
                },
                {
                  id: "finishing-approval",
                  type: "approval",
                  label: "Finishing Quality Approval",
                  required: true,
                  config: { approverRole: "supervisor" }
                }
              ],
              estimatedDuration: 30,
              isActive: true,
              color: "#8B5CF6",
              position: { x: 700, y: 100 }
            },
            {
              id: "final-inspection",
              name: "Final Quality Inspection",
              description: "Final quality check and packaging",
              order: 5,
              actions: [
                {
                  id: "scan-inspection-station",
                  type: "scan",
                  label: "Scan Inspection Station",
                  required: true
                },
                {
                  id: "final-inspection",
                  type: "inspection",
                  label: "Final Quality Inspection",
                  required: true,
                  config: { 
                    checklist: ["appearance", "functionality", "safety", "packaging"],
                    passCriteria: "all_required"
                  }
                },
                {
                  id: "packaging-photo",
                  type: "photo",
                  label: "Take Packaging Photo",
                  required: true,
                  config: { photoCount: 1, requiredAngles: ["packaged"] }
                }
              ],
              estimatedDuration: 20,
              isActive: true,
              color: "#EF4444",
              position: { x: 900, y: 100 }
            }
          ]
        },
        {
          name: "Quality-Focused Workflow",
          description: "Enhanced quality control process for Sith equipment",
          stages: [
            {
              id: "material-inspection",
              name: "Material Inspection",
              description: "Thorough material quality inspection",
              order: 1,
              actions: [
                {
                  id: "scan-material",
                  type: "scan",
                  label: "Scan Material QR Code",
                  required: true
                },
                {
                  id: "material-quality-check",
                  type: "inspection",
                  label: "Material Quality Inspection",
                  required: true,
                  config: { checklist: ["purity", "strength", "defects"] }
                }
              ],
              estimatedDuration: 45,
              isActive: true,
              color: "#3B82F6",
              position: { x: 100, y: 100 }
            },
            {
              id: "precision-cutting",
              name: "Precision Cutting",
              description: "High-precision cutting with tight tolerances",
              order: 2,
              actions: [
                {
                  id: "scan-cutting-station",
                  type: "scan",
                  label: "Scan Precision Cutting Station",
                  required: true
                },
                {
                  id: "precision-measurement",
                  type: "measurement",
                  label: "Precision Measurements",
                  required: true,
                  config: { measurements: ["length", "width", "thickness", "angles"], tolerance: 0.1 }
                }
              ],
              estimatedDuration: 60,
              isActive: true,
              color: "#10B981",
              position: { x: 300, y: 100 }
            },
            {
              id: "assembly-quality",
              name: "Quality Assembly",
              description: "Assembly with enhanced quality control",
              order: 3,
              actions: [
                {
                  id: "scan-assembly-station",
                  type: "scan",
                  label: "Scan Assembly Station",
                  required: true
                },
                {
                  id: "assembly-inspection",
                  type: "inspection",
                  label: "Assembly Quality Check",
                  required: true,
                  config: { checklist: ["alignment", "fit", "finish"] }
                },
                {
                  id: "assembly-photo",
                  type: "photo",
                  label: "Assembly Documentation",
                  required: true,
                  config: { photoCount: 3, requiredAngles: ["front", "side", "detail"] }
                }
              ],
              estimatedDuration: 75,
              isActive: true,
              color: "#F59E0B",
              position: { x: 500, y: 100 }
            },
            {
              id: "quality-approval",
              name: "Quality Approval",
              description: "Manager approval for quality standards",
              order: 4,
              actions: [
                {
                  id: "scan-quality-station",
                  type: "scan",
                  label: "Scan Quality Station",
                  required: true
                },
                {
                  id: "quality-approval",
                  type: "approval",
                  label: "Quality Manager Approval",
                  required: true,
                  config: { approverRole: "quality_manager", requireComments: true }
                }
              ],
              estimatedDuration: 30,
              isActive: true,
              color: "#8B5CF6",
              position: { x: 700, y: 100 }
            },
            {
              id: "final-quality",
              name: "Final Quality Assurance",
              description: "Comprehensive final quality assurance",
              order: 5,
              actions: [
                {
                  id: "scan-final-station",
                  type: "scan",
                  label: "Scan Final Station",
                  required: true
                },
                {
                  id: "final-quality-inspection",
                  type: "inspection",
                  label: "Final Quality Assurance",
                  required: true,
                  config: { 
                    checklist: ["appearance", "functionality", "safety", "durability", "packaging"],
                    passCriteria: "all_required",
                    allowPartialPass: false
                  }
                },
                {
                  id: "final-documentation",
                  type: "photo",
                  label: "Final Documentation",
                  required: true,
                  config: { photoCount: 4, requiredAngles: ["front", "back", "side", "packaged"] }
                }
              ],
              estimatedDuration: 40,
              isActive: true,
              color: "#EF4444",
              position: { x: 900, y: 100 }
            }
          ]
        },
        {
          name: "Rapid Production Workflow",
          description: "Streamlined process for high-volume Mandalorian armor",
          stages: [
            {
              id: "bulk-material-prep",
              name: "Bulk Material Preparation",
              description: "Prepare materials in bulk quantities",
              order: 1,
              actions: [
                {
                  id: "scan-bulk-material",
                  type: "scan",
                  label: "Scan Bulk Material",
                  required: true
                },
                {
                  id: "bulk-measurement",
                  type: "measurement",
                  label: "Bulk Measurements",
                  required: true,
                  config: { measurements: ["batch_size", "material_quantity"] }
                }
              ],
              estimatedDuration: 20,
              isActive: true,
              color: "#3B82F6",
              position: { x: 100, y: 100 }
            },
            {
              id: "mass-cutting",
              name: "Mass Cutting",
              description: "High-volume cutting operations",
              order: 2,
              actions: [
                {
                  id: "scan-mass-cutting",
                  type: "scan",
                  label: "Scan Mass Cutting Station",
                  required: true
                },
                {
                  id: "batch-quality-check",
                  type: "inspection",
                  label: "Batch Quality Check",
                  required: true,
                  config: { checklist: ["batch_consistency", "cut_quality"], sampleSize: 10 }
                }
              ],
              estimatedDuration: 30,
              isActive: true,
              color: "#10B981",
              position: { x: 300, y: 100 }
            },
            {
              id: "streamlined-assembly",
              name: "Streamlined Assembly",
              description: "Assembly line production",
              order: 3,
              actions: [
                {
                  id: "scan-assembly-line",
                  type: "scan",
                  label: "Scan Assembly Line",
                  required: true
                },
                {
                  id: "assembly-line-photo",
                  type: "photo",
                  label: "Assembly Line Photo",
                  required: false,
                  config: { photoCount: 1, requiredAngles: ["assembly_line"] }
                }
              ],
              estimatedDuration: 40,
              isActive: true,
              color: "#F59E0B",
              position: { x: 500, y: 100 }
            },
            {
              id: "rapid-finishing",
              name: "Rapid Finishing",
              description: "Quick finishing processes",
              order: 4,
              actions: [
                {
                  id: "scan-finishing-line",
                  type: "scan",
                  label: "Scan Finishing Line",
                  required: true
                },
                {
                  id: "rapid-approval",
                  type: "approval",
                  label: "Rapid Approval",
                  required: true,
                  config: { approverRole: "line_supervisor", autoApprove: true }
                }
              ],
              estimatedDuration: 15,
              isActive: true,
              color: "#8B5CF6",
              position: { x: 700, y: 100 }
            },
            {
              id: "batch-inspection",
              name: "Batch Inspection",
              description: "Sample-based batch inspection",
              order: 5,
              actions: [
                {
                  id: "scan-inspection-line",
                  type: "scan",
                  label: "Scan Inspection Line",
                  required: true
                },
                {
                  id: "batch-inspection",
                  type: "inspection",
                  label: "Batch Inspection",
                  required: true,
                  config: { 
                    checklist: ["appearance", "functionality", "packaging"],
                    passCriteria: "sample_check",
                    sampleSize: 5
                  }
                },
                {
                  id: "batch-photo",
                  type: "photo",
                  label: "Batch Photo",
                  required: true,
                  config: { photoCount: 1, requiredAngles: ["batch"] }
                }
              ],
              estimatedDuration: 25,
              isActive: true,
              color: "#EF4444",
              position: { x: 900, y: 100 }
            }
          ]
        }
      ];
      
      const createdWorkflows = [];
      
      for (const workflowData of workflows) {
        const workflowId = await ctx.db.insert("workflows", {
          orgId,
          name: workflowData.name,
          description: workflowData.description,
          stages: workflowData.stages,
          isActive: true,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          createdBy: "chaos-mode-system",
        });
        
        createdWorkflows.push(workflowId);
      }
      
      // Update chaos mode orders with workflow IDs
      const orders = await ctx.db.query("chaosModeOrders").collect();
      for (let i = 0; i < orders.length && i < createdWorkflows.length; i++) {
        await ctx.db.patch(orders[i]._id, {
          workflowId: createdWorkflows[i],
          updatedAt: Date.now(),
        });
      }
      
      console.log("✅ Star Wars workflows created successfully");
      await logActivity(ctx, orgId, "Star Wars workflows created", {
        workflowsCreated: createdWorkflows.length,
        workflowNames: workflows.map(w => w.name),
      });
      
      return { success: true, workflowsCreated: createdWorkflows.length };
      
    } catch (error) {
      console.error("❌ Failed to create Star Wars workflows:", error);
      await logError(ctx, orgId, "critical", "workflows", `Failed to create Star Wars workflows: ${error}`, { error: error.message });
      throw error;
    }
  },
});

// Continue with remaining functions...
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
        website: "https://galactic.com",
        industry: "Textile Manufacturing",
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
        website: "https://stellar.com",
        industry: "Fashion Manufacturing",
        isActive: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
      
      const brand3Id = await ctx.db.insert("brands", {
        orgId,
        name: "Rebellion Fabrication",
        email: "orders@rebellion.com",
        contactPerson: "Leia Organa",
        address: "789 Resistance Blvd, Rebel Base, RB 11111",
        phone: "+1-555-0789",
        website: "https://rebellion.com",
        industry: "Military Equipment",
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
        specializations: ["Precision Manufacturing", "Lightsaber Production", "Energy Weapons"],
        equipment: ["Precision Cutting", "Crystal Assembly", "Energy Calibration"],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
      
      const factory2Id = await ctx.db.insert("factories", {
        orgId,
        name: "Imperial Factory Beta",
        location: "Death Star Manufacturing District",
        adminUserId: "admin-2",
        capacity: 1500,
        specializations: ["Armor Production", "Heavy Equipment", "Imperial Grade"],
        equipment: ["Advanced Forging", "Armor Assembly", "Quality Assurance"],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
      
      const factory3Id = await ctx.db.insert("factories", {
        orgId,
        name: "Mandalorian Forge Gamma",
        location: "Mandalore Production Complex",
        adminUserId: "admin-3",
        capacity: 2000,
        specializations: ["Beskar Working", "Rapid Production", "Traditional Crafts"],
        equipment: ["Beskar Forge", "Mass Production Line", "Traditional Tools"],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
      
      console.log("✅ Factory infrastructure created successfully");
      await logActivity(ctx, orgId, "Infrastructure created", {
        brands: 3,
        factories: 3,
      });
      
      return { 
        success: true, 
        brands: [brand1Id, brand2Id, brand3Id],
        factories: [factory1Id, factory2Id, factory3Id],
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
      
      const items = [];
      let itemCount = 0;
      
      for (let orderIndex = 0; orderIndex < orders.length; orderIndex++) {
        const order = orders[orderIndex];
        const workflow = workflows[orderIndex % workflows.length];
        const factory = factories[orderIndex % factories.length];
        
        for (const orderItem of order.items) {
          // Create 20 items per SKU for demo purposes (instead of full quantity)
          const demoQuantity = Math.min(orderItem.quantity, 20);
          
          for (let i = 0; i < demoQuantity; i++) {
            const itemId = `${orderItem.sku}-${order.poNumber}-${String(i + 1).padStart(3, '0')}`;
            
            const newItemId = await ctx.db.insert("items", {
              orgId,
              itemId,
              workflowId: workflow._id,
              currentStageId: workflow.stages[0].id,
              status: "active",
              metadata: {
                orderId: order._id,
                poNumber: order.poNumber,
                sku: orderItem.sku,
                specifications: orderItem.specifications,
                brand: order.brandId,
                style: orderItem.sku,
                theme: "Star Wars",
              },
              startedAt: Date.now(),
              updatedAt: Date.now(),
              brandId: order.brandId,
              factoryId: order.factoryId,
              purchaseOrderId: order._id,
              qrCode: `QR-${itemId}`,
              qrPrinted: false,
            });
            
            items.push(newItemId);
            itemCount++;
            
            // Create enriched record for disco system
            await ctx.db.insert("recordsEnriched", {
              orgId,
              factoryId: factory._id,
              originalText: `Item ${itemId} created for Star Wars order ${order.poNumber}`,
              scanType: "manual",
              enrichment: {
                labels: ["ITEM_CREATED", "PRODUCTION", "STAR_WARS"],
                entities: [orderItem.sku, order.poNumber, workflow.stages[0].name],
                fields: {
                  sku: orderItem.sku,
                  po_number: order.poNumber,
                  stage: workflow.stages[0].name,
                  quantity: 1,
                  priority: "MEDIUM",
                  assigned_to: "factory-worker",
                  theme: "Star Wars",
                  character: orderItem.specifications?.character || "Unknown",
                },
              },
              userId: "factory-worker",
              createdAt: Date.now(),
              metadata: {
                type: "item_creation",
                itemId,
                orderId: order._id,
                stage: workflow.stages[0].name,
                theme: "Star Wars",
              },
            });
          }
        }
      }
      
      console.log("✅ Initial items created successfully with disco records");
      await logActivity(ctx, orgId, "Initial items created", {
        itemsCreated: items.length,
        ordersProcessed: orders.length,
        totalItemCount: itemCount,
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
// FACTORY SIMULATION FUNCTIONS
// ============================================================================

export const startFactorySimulation = mutation({
  args: {},
  handler: async (ctx) => {
    const orgId = await resolveOrgId(ctx);
    
    try {
      console.log("🏭 Starting factory simulation...");
      
      // Schedule the first factory cycle
      await ctx.scheduler.runAfter(5000, "chaosMode:runFactoryCycle");
      
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
      
      if (!control || !control.isActive || control.mode !== "full-chaos") {
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
      
      // Schedule next cycle (random interval between 10-30 seconds)
      const nextInterval = Math.floor(Math.random() * 20000) + 10000; // 10-30 seconds
      await ctx.scheduler.runAfter(nextInterval, "chaosMode:runFactoryCycle");
      
      console.log(`✅ Factory cycle completed, next cycle in ${nextInterval/1000}s`);
      
      return { success: true, nextInterval };
      
    } catch (error) {
      console.error("❌ Factory cycle failed:", error);
      await logError(ctx, orgId, "warning", "cycle", `Factory cycle failed: ${error}`, { error: error.message });
      
      // Retry after 30 seconds on error
      await ctx.scheduler.runAfter(30000, "chaosMode:runFactoryCycle");
      
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
      const stageDuration = currentStage.estimatedDuration * 10000; // 10 seconds per estimated minute
      
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
            originalText: `Star Wars item ${item.itemId} completed ${currentStage.name} stage`,
            scanType: "qr",
            enrichment: {
              labels: ["STAGE_COMPLETED", "PRODUCTION", "STAR_WARS"],
              entities: [item.itemId, currentStage.name, nextStage.name],
              fields: {
                sku: item.metadata?.sku,
                po_number: item.metadata?.poNumber,
                stage: nextStage.name,
                quantity: 1,
                priority: "MEDIUM",
                assigned_to: "factory-worker",
                theme: "Star Wars",
                character: item.metadata?.specifications?.character || "Unknown",
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
              theme: "Star Wars",
            },
          });
          
          console.log(`✅ Star Wars item ${item.itemId} advanced from ${currentStage.name} to ${nextStage.name}`);
          
        } else {
          // Item completed all stages
          await ctx.db.patch(item._id, {
            status: "completed",
            completedAt: Date.now(),
            updatedAt: Date.now(),
          });
          
          // Create completion enriched record for disco
          await ctx.db.insert("recordsEnriched", {
            orgId,
            factoryId: item.factoryId,
            originalText: `Star Wars item ${item.itemId} completed all production stages - ${item.metadata?.specifications?.character || 'Unknown'} ${item.metadata?.specifications?.itemType || 'item'} ready for delivery`,
            scanType: "qr",
            enrichment: {
              labels: ["ITEM_COMPLETED", "PRODUCTION", "STAR_WARS"],
              entities: [item.itemId, "completed"],
              fields: {
                sku: item.metadata?.sku,
                po_number: item.metadata?.poNumber,
                stage: "completed",
                quantity: 1,
                priority: "HIGH",
                assigned_to: "factory-worker",
                theme: "Star Wars",
                character: item.metadata?.specifications?.character || "Unknown",
              },
            },
            userId: "factory-worker",
            createdAt: Date.now(),
            metadata: {
              type: "item_completion",
              itemId: item.itemId,
              orderId: item.metadata?.orderId,
              finalStage: currentStage.name,
              theme: "Star Wars",
            },
          });
          
          console.log(`🎉 Star Wars item ${item.itemId} completed all stages!`);
        }
      }
    } catch (error) {
      console.error(`❌ Error processing item ${item.itemId}:`, error);
    }
  }
}

async function generateRandomEvents(ctx: any, orgId: string) {
  // 40% chance of generating random events
  if (Math.random() > 0.4) return;
  
  const starWarsEvents = [
    {
      type: "material_delivery",
      title: "Beskar Shipment Arrived",
      message: "High-grade Beskar materials delivered to Station 7 - priority processing required",
      userId: "factory-manager",
      priority: "high"
    },
    {
      type: "quality_alert", 
      title: "Lightsaber Crystal Alignment",
      message: "Kyber crystal alignment requires Jedi oversight for Luke Skywalker order",
      userId: "quality-control",
      priority: "high"
    },
    {
      type: "equipment_maintenance",
      title: "Mandalorian Forge Maintenance",
      message: "Traditional Beskar forge requires ancestral blessing ceremony",
      userId: "maintenance-team",
      priority: "medium"
    },
    {
      type: "team_message",
      content: "Excellent work on the Sith equipment - the Dark Lord is pleased with our progress",
      senderId: "darth-supervisor",
      recipientId: "factory-workers"
    },
    {
      type: "production_update",
      content: "Current Death Star schedule: 750 Vader helmets completed, 250 pending. The Emperor demands perfection.",
      senderId: "imperial-manager",
      recipientId: "all"
    },
    {
      type: "material_request",
      title: "Urgent: More Durasteel Needed",
      message: "Running low on durasteel for lightsaber hilts - Coruscant shipment delayed",
      userId: "materials-coordinator",
      priority: "high"
    },
    {
      type: "quality_celebration",
      title: "Quality Milestone Achieved",
      message: "Zero defects on last 100 Mandalorian helmets - This is the Way!",
      userId: "quality-manager",
      priority: "medium"
    }
  ];
  
  const randomEvent = starWarsEvents[Math.floor(Math.random() * starWarsEvents.length)];
  
  if (randomEvent.type === "team_message" || randomEvent.type === "production_update") {
    await ctx.db.insert("messages", {
      orgId,
      senderId: randomEvent.senderId,
      recipientId: randomEvent.recipientId,
      content: randomEvent.content,
      type: randomEvent.type,
      isRead: false,
      createdAt: Date.now(),
    });
  } else {
    await ctx.db.insert("notifications", {
      orgId,
      userId: randomEvent.userId,
      type: randomEvent.type,
      title: randomEvent.title,
      message: randomEvent.message,
      isRead: false,
      priority: randomEvent.priority,
      createdAt: Date.now(),
    });
  }
  
  console.log(`📢 Generated Star Wars event: ${randomEvent.type}`);
}

async function updateControlStats(ctx: any, controlId: any) {
  const items = await ctx.db.query("items").collect();
  const scans = await ctx.db.query("scans").collect();
  const notifications = await ctx.db.query("notifications").collect();
  const messages = await ctx.db.query("messages").collect();
  
  await ctx.db.patch(controlId, {
    totalItemsCreated: items.length,
    totalItemsCompleted: items.filter((i: any) => i.status === "completed").length,
    totalScans: scans.length,
    totalNotifications: notifications.length,
    totalMessages: messages.length,
    lastActivity: Date.now(),
    updatedAt: Date.now(),
  });
}

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
    name: "Star Wars Manufacturing Empire",
    slug: "star-wars-empire",
    ownerUserId: "emperor-palpatine",
    createdAt: Date.now(),
    metadata: { type: "chaos-mode-star-wars", theme: "Star Wars" },
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

async function logError(ctx: any, orgId: string, severity: "critical" | "warning" | "info", category: string, message: string, details: any) {
  await ctx.db.insert("chaosModeErrors", {
    orgId,
    type: severity,
    category,
    message,
    details,
    resolved: false,
    timestamp: Date.now(),
  });
  
  // Update error count in control
  const control = await ctx.db
    .query("chaosModeControl")
    .withIndex("by_org", (q) => q.eq("orgId", orgId))
    .first();
  
  if (control) {
    await ctx.db.patch(control._id, {
      errorCount: (control.errorCount || 0) + 1,
      updatedAt: Date.now(),
    });
  }
}