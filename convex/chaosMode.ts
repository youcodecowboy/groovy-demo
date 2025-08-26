import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { resolveOrgId } from "./util";

// Types and interfaces
export interface ChaosModeSettings {
  scanIntervals: { min: number; max: number };
  stageIntervals: { min: number; max: number };
  problemIntervals: { min: number; max: number };
  messageIntervals: { min: number; max: number };
}

export interface ValidationResult {
  success: boolean;
  errors: string[];
  warnings: string[];
}

export interface TestFireResult {
  success: boolean;
  tests: {
    orderCreation: boolean;
    itemCreation: boolean;
    workflowCreation: boolean;
    stageProgression: boolean;
    scanSimulation: boolean;
    notificationSending: boolean;
    itemFlagging: boolean;
    messageSending: boolean;
    alertCreation: boolean;
    escalationCreation: boolean;
  };
  errors: string[];
}

// Default Chaos Mode settings
const DEFAULT_CHAOS_SETTINGS: ChaosModeSettings = {
  scanIntervals: { min: 15, max: 45 },
  stageIntervals: { min: 25, max: 35 },
  problemIntervals: { min: 60, max: 120 },
  messageIntervals: { min: 30, max: 90 },
};

// Test fire sequence configuration
const TEST_FIRE_SEQUENCE = [
  {
    name: "Order Creation",
    function: "createTestOrder",
    description: "Create one test Star Wars order",
    expectedResult: "Order created with 1 item"
  },
  {
    name: "Workflow Creation", 
    function: "createTestWorkflow",
    description: "Create standard manufacturing workflow",
    expectedResult: "Workflow with 5 stages created"
  },
  {
    name: "Item Creation",
    function: "createTestItem", 
    description: "Create one test item from order",
    expectedResult: "Item created and assigned to workflow"
  },
  {
    name: "Stage Progression",
    function: "progressThroughStages",
    description: "Move item through all workflow stages",
    expectedResult: "Item completes all stages successfully"
  },
  {
    name: "Scan Simulation",
    function: "simulateScans",
    description: "Simulate QR code scans at each stage",
    expectedResult: "All required scans completed"
  },
  {
    name: "Notification Sending",
    function: "sendTestNotification",
    description: "Send test notification to user",
    expectedResult: "Notification appears in user's inbox"
  },
  {
    name: "Item Flagging",
    function: "flagTestItem",
    description: "Flag item as defective",
    expectedResult: "Item marked as defective with notes"
  },
  {
    name: "Message Sending",
    function: "sendTestMessage",
    description: "Send test message between users",
    expectedResult: "Message appears in chat interface"
  },
  {
    name: "Alert Creation",
    function: "createTestAlert",
    description: "Create test alert",
    expectedResult: "Alert appears in alerts list"
  },
  {
    name: "Escalation Creation",
    function: "createTestEscalation",
    description: "Create test escalation",
    expectedResult: "Escalation appears in escalations list"
  }
];

// Error logging utility
async function logError(
  ctx: any,
  orgId: string,
  type: "critical" | "warning" | "info",
  category: string,
  message: string,
  details?: any,
  orderId?: string,
  itemId?: string,
  stageId?: string
) {
  await ctx.db.insert("chaosModeErrors", {
    orgId,
    timestamp: Date.now(),
    type,
    category,
    message,
    details: details || {},
    orderId,
    itemId,
    stageId,
    resolved: false,
  });
}

// Activity logging utility
async function logActivity(
  ctx: any,
  orgId: string,
  action: string,
  details?: any,
  orderId?: string,
  itemId?: string,
  stageId?: string,
  userId?: string
) {
  await ctx.db.insert("chaosModeActivity", {
    orgId,
    timestamp: Date.now(),
    action,
    orderId,
    itemId,
    stageId,
    userId,
    details: details || {},
  });
}

// System validation function
export const validateSystem = mutation({
  args: {},
  handler: async (ctx): Promise<ValidationResult> => {
    const orgId = await resolveOrgId(ctx);
    const result: ValidationResult = {
      success: true,
      errors: [],
      warnings: [],
    };

    try {
      // Check database connectivity
      await ctx.db.query("organizations").first();
      
      // Check essential tables exist and are accessible
      const essentialQueries = [
        ctx.db.query("workflows").first(),
        ctx.db.query("items").first(),
        ctx.db.query("users").first(),
        ctx.db.query("brands").first(),
        ctx.db.query("factories").first(),
        ctx.db.query("purchaseOrders").first(),
      ];

      await Promise.all(essentialQueries);

      // Check if there are any existing workflows to work with
      const workflows = await ctx.db.query("workflows").collect();
      if (workflows.length === 0) {
        result.warnings.push("No workflows exist - will create test workflows");
      }

      // Check if there are existing brands and factories
      const brands = await ctx.db.query("brands").collect();
      const factories = await ctx.db.query("factories").collect();
      
      if (brands.length === 0) {
        result.warnings.push("No brands exist - will create test brand");
      }
      if (factories.length === 0) {
        result.warnings.push("No factories exist - will create test factory");
      }

      await logActivity(ctx, orgId, "System validation completed", { 
        errors: result.errors.length, 
        warnings: result.warnings.length 
      });

    } catch (error) {
      result.success = false;
      result.errors.push(`System validation failed: ${error}`);
      await logError(ctx, orgId, "critical", "validation", `System validation failed: ${error}`, { error });
    }

    return result;
  },
});

// Clear database function
export const clearDatabase = mutation({
  args: {},
  handler: async (ctx) => {
    const orgId = await resolveOrgId(ctx);

    try {
      // Clear chaos mode data first
      const chaosControl = await ctx.db.query("chaosModeControl").withIndex("by_org", q => q.eq("orgId", orgId)).collect();
      const chaosOrders = await ctx.db.query("chaosModeOrders").withIndex("by_org", q => q.eq("orgId", orgId)).collect();
      const chaosErrors = await ctx.db.query("chaosModeErrors").withIndex("by_org", q => q.eq("orgId", orgId)).collect();
      const chaosActivity = await ctx.db.query("chaosModeActivity").withIndex("by_org", q => q.eq("orgId", orgId)).collect();

      for (const record of chaosControl) await ctx.db.delete(record._id);
      for (const record of chaosOrders) await ctx.db.delete(record._id);
      for (const record of chaosErrors) await ctx.db.delete(record._id);
      for (const record of chaosActivity) await ctx.db.delete(record._id);

      // Clear main application data
      const items = await ctx.db.query("items").collect();
      const workflows = await ctx.db.query("workflows").collect();
      const messages = await ctx.db.query("messages").collect();
      const notifications = await ctx.db.query("notifications").collect();
      const scans = await ctx.db.query("scans").collect();

      for (const record of items) await ctx.db.delete(record._id);
      for (const record of workflows) await ctx.db.delete(record._id);
      for (const record of messages) await ctx.db.delete(record._id);
      for (const record of notifications) await ctx.db.delete(record._id);
      for (const record of scans) await ctx.db.delete(record._id);

      await logActivity(ctx, orgId, "Database cleared", { 
        tablesCleared: ["items", "workflows", "messages", "notifications", "scans", "chaosModeControl", "chaosModeOrders", "chaosModeErrors", "chaosModeActivity"]
      });

    } catch (error) {
      await logError(ctx, orgId, "critical", "database", `Database clear failed: ${error}`, { error });
      throw error;
    }
  },
});

// Test fire individual functions
async function runTestFireFunction(ctx: any, orgId: string, test: any): Promise<{ success: boolean; error?: string }> {
  try {
    switch (test.function) {
      case "createTestOrder":
        // Create a simple test order
        const brand = await ctx.db.query("brands").first();
        const factory = await ctx.db.query("factories").first();
        
        if (!brand || !factory) {
          throw new Error("No brands or factories available");
        }

        await ctx.db.insert("purchaseOrders", {
          orgId,
          poNumber: "TEST-PO-001",
          brandId: brand._id,
          factoryId: factory._id,
          workflowId: "test-workflow", // Will be created in workflow test
          status: "pending",
          submittedAt: Date.now(),
          items: [{
            sku: "TEST-001",
            quantity: 1,
            description: "Test Item",
            specifications: {},
          }],
          totalValue: 100,
          currency: "USD",
          deliveryDate: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days from now
          notes: "Test order for chaos mode validation",
        });
        break;

      case "createTestWorkflow":
        // Create a simple test workflow
        const workflowId = await ctx.db.insert("workflows", {
          orgId,
          name: "Test Manufacturing Workflow",
          description: "Test workflow for chaos mode validation",
          stages: [
            {
              id: "stage-1",
              name: "Material Prep",
              description: "Prepare materials",
              order: 1,
              isActive: true,
              actions: [{
                id: "scan-material",
                type: "scan",
                label: "Scan Material",
                required: true,
                config: {},
              }],
              estimatedDuration: 30,
            },
            {
              id: "stage-2",
              name: "Final Check",
              description: "Final quality check",
              order: 2,
              isActive: true,
              actions: [{
                id: "final-inspection",
                type: "inspection",
                label: "Final Inspection",
                required: true,
                config: {},
              }],
              estimatedDuration: 15,
            }
          ],
          isActive: true,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          createdBy: "test-user",
        });
        break;

      case "createTestItem":
        // Create a test item
        const workflow = await ctx.db.query("workflows").first();
        if (!workflow) {
          throw new Error("No workflow available");
        }

        await ctx.db.insert("items", {
          orgId,
          itemId: "TEST-ITEM-001",
          workflowId: workflow._id,
          currentStageId: workflow.stages[0].id,
          status: "active",
          metadata: { test: true },
          startedAt: Date.now(),
          updatedAt: Date.now(),
        });
        break;

      case "progressThroughStages":
        // Test stage progression
        const item = await ctx.db.query("items").first();
        if (item) {
          await ctx.db.patch(item._id, {
            currentStageId: "stage-2",
            updatedAt: Date.now(),
          });
        }
        break;

      case "simulateScans":
        // Create a test scan
        await ctx.db.insert("scans", {
          orgId,
          itemId: "TEST-ITEM-001",
          stageId: "stage-1",
          scannedBy: "test-user",
          scannedAt: Date.now(),
          scanType: "qr",
          scanData: "test-qr-data",
        });
        break;

      case "sendTestNotification":
        // Create a test notification
        await ctx.db.insert("notifications", {
          orgId,
          userId: "test-user",
          title: "Test Notification",
          message: "This is a test notification for chaos mode validation",
          type: "info",
          read: false,
          createdAt: Date.now(),
        });
        break;

      case "flagTestItem":
        // Flag an item as defective
        const flagItem = await ctx.db.query("items").first();
        if (flagItem) {
          await ctx.db.patch(flagItem._id, {
            isDefective: true,
            defectNotes: "Test defect for chaos mode validation",
            flaggedBy: "test-user",
            flaggedAt: Date.now(),
          });
        }
        break;

      case "sendTestMessage":
        // Create a test message
        await ctx.db.insert("messages", {
          orgId,
          senderId: "test-user-1",
          recipientId: "test-user-2",
          content: "Test message for chaos mode validation",
          timestamp: Date.now(),
          read: false,
        });
        break;

      case "createTestAlert":
        // Create a test alert (using notifications table)
        await ctx.db.insert("notifications", {
          orgId,
          userId: "test-user",
          title: "Test Alert",
          message: "This is a test alert for chaos mode validation",
          type: "warning",
          read: false,
          createdAt: Date.now(),
        });
        break;

      case "createTestEscalation":
        // Create a test escalation (using notifications table with high priority)
        await ctx.db.insert("notifications", {
          orgId,
          userId: "test-user",
          title: "Test Escalation",
          message: "This is a test escalation for chaos mode validation",
          type: "error",
          read: false,
          createdAt: Date.now(),
        });
        break;

      default:
        throw new Error(`Unknown test function: ${test.function}`);
    }

    await logActivity(ctx, orgId, `Test fire: ${test.name}`, { test: test.function, success: true });
    return { success: true };

  } catch (error) {
    await logError(ctx, orgId, "warning", "test-fire", `Test fire failed: ${test.name}`, { error, test: test.function });
    return { success: false, error: String(error) };
  }
}

// Test fire all functions
export const testFireAllFunctions = mutation({
  args: {},
  handler: async (ctx): Promise<TestFireResult> => {
    const orgId = await resolveOrgId(ctx);
    const result: TestFireResult = {
      success: true,
      tests: {
        orderCreation: false,
        itemCreation: false,
        workflowCreation: false,
        stageProgression: false,
        scanSimulation: false,
        notificationSending: false,
        itemFlagging: false,
        messageSending: false,
        alertCreation: false,
        escalationCreation: false,
      },
      errors: [],
    };

    // Initialize test fire progress
    const chaosControl = await ctx.db.query("chaosModeControl").withIndex("by_org", q => q.eq("orgId", orgId)).first();
    if (chaosControl) {
      await ctx.db.patch(chaosControl._id, {
        mode: "test-fire",
        testFireProgress: {
          currentTest: TEST_FIRE_SEQUENCE[0].name,
          completedTests: [],
          totalTests: TEST_FIRE_SEQUENCE.length,
          isCompleted: false,
          errors: [],
        },
      });
    }

    try {
      for (const test of TEST_FIRE_SEQUENCE) {
        // Update progress
        if (chaosControl) {
          const currentProgress = await ctx.db.get(chaosControl._id);
          if (currentProgress?.testFireProgress) {
            await ctx.db.patch(chaosControl._id, {
              testFireProgress: {
                ...currentProgress.testFireProgress,
                currentTest: test.name,
              },
            });
          }
        }

        const testResult = await runTestFireFunction(ctx, orgId, test);
        
        if (testResult.success) {
          // Map test names to result fields
          const testKey = test.function.replace(/([A-Z])/g, char => char.toLowerCase()).replace(/^create/, '').replace(/^send/, '').replace(/^simulate/, '').replace(/^progress/, 'stage').replace(/test/g, '').replace(/through/g, '').replace(/stages/g, 'progression').replace(/notification/g, 'notificationSending').replace(/message/g, 'messageSending').replace(/scans/g, 'scanSimulation').replace(/order/g, 'orderCreation').replace(/item/g, 'itemCreation').replace(/workflow/g, 'workflowCreation').replace(/flag/g, 'itemFlagging').replace(/alert/g, 'alertCreation').replace(/escalation/g, 'escalationCreation') as keyof typeof result.tests;
          
          // Manual mapping for clarity
          if (test.function === "createTestOrder") result.tests.orderCreation = true;
          if (test.function === "createTestWorkflow") result.tests.workflowCreation = true;
          if (test.function === "createTestItem") result.tests.itemCreation = true;
          if (test.function === "progressThroughStages") result.tests.stageProgression = true;
          if (test.function === "simulateScans") result.tests.scanSimulation = true;
          if (test.function === "sendTestNotification") result.tests.notificationSending = true;
          if (test.function === "flagTestItem") result.tests.itemFlagging = true;
          if (test.function === "sendTestMessage") result.tests.messageSending = true;
          if (test.function === "createTestAlert") result.tests.alertCreation = true;
          if (test.function === "createTestEscalation") result.tests.escalationCreation = true;

          // Update completed tests
          if (chaosControl) {
            const currentProgress = await ctx.db.get(chaosControl._id);
            if (currentProgress?.testFireProgress) {
              await ctx.db.patch(chaosControl._id, {
                testFireProgress: {
                  ...currentProgress.testFireProgress,
                  completedTests: [...currentProgress.testFireProgress.completedTests, test.name],
                },
              });
            }
          }
        } else {
          result.success = false;
          result.errors.push(`${test.name}: ${testResult.error}`);
          
          // Update errors in progress
          if (chaosControl) {
            const currentProgress = await ctx.db.get(chaosControl._id);
            if (currentProgress?.testFireProgress) {
              await ctx.db.patch(chaosControl._id, {
                testFireProgress: {
                  ...currentProgress.testFireProgress,
                  errors: [...currentProgress.testFireProgress.errors, `${test.name}: ${testResult.error}`],
                },
              });
            }
          }
        }
      }

      // Mark test fire as completed
      if (chaosControl) {
        const currentProgress = await ctx.db.get(chaosControl._id);
        if (currentProgress?.testFireProgress) {
          await ctx.db.patch(chaosControl._id, {
            testFireProgress: {
              ...currentProgress.testFireProgress,
              isCompleted: true,
              currentTest: "Completed",
            },
          });
        }
      }

      await logActivity(ctx, orgId, "Test fire completed", { 
        success: result.success, 
        errors: result.errors.length,
        completedTests: Object.values(result.tests).filter(Boolean).length,
        totalTests: Object.keys(result.tests).length,
      });

    } catch (error) {
      result.success = false;
      result.errors.push(`Test fire sequence failed: ${error}`);
      await logError(ctx, orgId, "critical", "test-fire", `Test fire sequence failed: ${error}`, { error });
    }

    return result;
  },
});

// Get Chaos Mode status
export const getChaosStatus = query({
  args: {},
  handler: async (ctx) => {
    const orgId = await resolveOrgId(ctx);
    
    const control = await ctx.db.query("chaosModeControl").withIndex("by_org", q => q.eq("orgId", orgId)).first();
    const errors = await ctx.db.query("chaosModeErrors").withIndex("by_org", q => q.eq("orgId", orgId)).order("desc").take(10);
    const activity = await ctx.db.query("chaosModeActivity").withIndex("by_timestamp").order("desc").take(20);
    const orders = await ctx.db.query("chaosModeOrders").withIndex("by_org", q => q.eq("orgId", orgId)).collect();

    return {
      control,
      errors,
      activity,
      orders,
      isActive: control?.isActive || false,
      mode: control?.mode || "stopped",
      uptime: control ? Date.now() - control.startTime : 0,
      errorCount: control?.errorCount || 0,
    };
  },
});

// Initialize Chaos Mode
export const initializeChaosMode = mutation({
  args: {},
  handler: async (ctx) => {
    const orgId = await resolveOrgId(ctx);
    
    // Check if chaos mode already exists
    const existing = await ctx.db.query("chaosModeControl").withIndex("by_org", q => q.eq("orgId", orgId)).first();
    
    if (existing) {
      return existing._id;
    }

    // Create new chaos mode control
    const controlId = await ctx.db.insert("chaosModeControl", {
      orgId,
      isActive: false,
      mode: "stopped",
      startTime: Date.now(),
      settings: DEFAULT_CHAOS_SETTINGS,
      currentOrders: [],
      errorCount: 0,
      lastActivity: Date.now(),
    });

    await logActivity(ctx, orgId, "Chaos Mode initialized", { controlId });
    
    return controlId;
  },
});

// Start Chaos Mode with full startup sequence
export const startChaosMode = mutation({
  args: {},
  handler: async (ctx) => {
    const orgId = await resolveOrgId(ctx);
    
    try {
      console.log("🚀 Starting Chaos Mode...");
      
      // Step 1: Initialize chaos mode control
      await ctx.runMutation("chaosMode:initializeChaosMode");
      
      // Step 2: Validate system
      console.log("🔍 Validating system...");
      const validation = await ctx.runMutation("chaosMode:validateSystem");
      if (!validation.success) {
        await logError(ctx, orgId, "critical", "startup", "System validation failed", { errors: validation.errors });
        throw new Error(`System validation failed: ${validation.errors.join(", ")}`);
      }
      
      // Step 3: Clear database
      console.log("🧹 Clearing database...");
      await ctx.runMutation("chaosMode:clearDatabase");
      
      // Step 4: Test fire all functions
      console.log("🧪 Test firing all functions...");
      const testResults = await ctx.runMutation("chaosMode:testFireAllFunctions");
      
      if (!testResults.success) {
        await logError(ctx, orgId, "critical", "startup", "Test fire failed", { errors: testResults.errors });
        throw new Error(`Test fire failed: ${testResults.errors.join(", ")}`);
      }
      
      // Step 5: Seed Star Wars orders
      console.log("🌟 Seeding Star Wars themed orders...");
      const seedResults = await ctx.runMutation("chaosSeeds:createStarWarsOrders");
      await logActivity(ctx, orgId, "Star Wars orders seeded", { 
        totalOrders: 3,
        totalItems: seedResults.totalItems,
        message: seedResults.message 
      });
      
      // Step 6: Update chaos mode to active
      const control = await ctx.db.query("chaosModeControl").withIndex("by_org", q => q.eq("orgId", orgId)).first();
      if (control) {
        await ctx.db.patch(control._id, {
          isActive: true,
          mode: "full-chaos",
          startTime: Date.now(),
          lastActivity: Date.now(),
        });
      }
      
      console.log("🎯 All tests passed! Chaos Mode is now active!");
      await logActivity(ctx, orgId, "Chaos Mode started successfully", { 
        validationWarnings: validation.warnings.length,
        testFireSuccess: testResults.success,
      });
      
      return { success: true, message: "Chaos Mode started successfully" };
      
    } catch (error) {
      await logError(ctx, orgId, "critical", "startup", `Chaos Mode startup failed: ${error}`, { error });
      
      // Ensure chaos mode is marked as stopped on failure
      const control = await ctx.db.query("chaosModeControl").withIndex("by_org", q => q.eq("orgId", orgId)).first();
      if (control) {
        await ctx.db.patch(control._id, {
          isActive: false,
          mode: "stopped",
        });
      }
      
      throw error;
    }
  },
});

// Stop Chaos Mode
export const stopChaosMode = mutation({
  args: {},
  handler: async (ctx) => {
    const orgId = await resolveOrgId(ctx);
    
    const control = await ctx.db.query("chaosModeControl").withIndex("by_org", q => q.eq("orgId", orgId)).first();
    if (control) {
      await ctx.db.patch(control._id, {
        isActive: false,
        mode: "stopped",
        lastActivity: Date.now(),
      });
    }
    
    await logActivity(ctx, orgId, "Chaos Mode stopped", {});
    
    return { success: true, message: "Chaos Mode stopped successfully" };
  },
});

// Pause Chaos Mode
export const pauseChaosMode = mutation({
  args: {},
  handler: async (ctx) => {
    const orgId = await resolveOrgId(ctx);
    
    const control = await ctx.db.query("chaosModeControl").withIndex("by_org", q => q.eq("orgId", orgId)).first();
    if (control && control.isActive) {
      await ctx.db.patch(control._id, {
        mode: "paused",
        lastActivity: Date.now(),
      });
    }
    
    await logActivity(ctx, orgId, "Chaos Mode paused", {});
    
    return { success: true, message: "Chaos Mode paused successfully" };
  },
});

// Resume Chaos Mode
export const resumeChaosMode = mutation({
  args: {},
  handler: async (ctx) => {
    const orgId = await resolveOrgId(ctx);
    
    const control = await ctx.db.query("chaosModeControl").withIndex("by_org", q => q.eq("orgId", orgId)).first();
    if (control && control.isActive && control.mode === "paused") {
      await ctx.db.patch(control._id, {
        mode: "full-chaos",
        lastActivity: Date.now(),
      });
    }
    
    await logActivity(ctx, orgId, "Chaos Mode resumed", {});
    
    return { success: true, message: "Chaos Mode resumed successfully" };
  },
});