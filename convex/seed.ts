import { mutation } from "./_generated/server";

// Clear all data and create fresh demo data
export const resetAllData = mutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();

    // Clear all existing data
    const items = await ctx.db.query("items").collect();
    const workflows = await ctx.db.query("workflows").collect();
    const locations = await ctx.db.query("locations").collect();
    const messages = await ctx.db.query("messages").collect();
    const users = await ctx.db.query("users").collect();
    const completedItems = await ctx.db.query("completedItems").collect();
    const itemHistory = await ctx.db.query("itemHistory").collect();
    const completedItemHistory = await ctx.db.query("completedItemHistory").collect();
    const scans = await ctx.db.query("scans").collect();
    const notifications = await ctx.db.query("notifications").collect();

    // Delete all records
    for (const item of items) await ctx.db.delete(item._id);
    for (const workflow of workflows) await ctx.db.delete(workflow._id);
    for (const location of locations) await ctx.db.delete(location._id);
    for (const message of messages) await ctx.db.delete(message._id);
    for (const user of users) await ctx.db.delete(user._id);
    for (const completedItem of completedItems) await ctx.db.delete(completedItem._id);
    for (const history of itemHistory) await ctx.db.delete(history._id);
    for (const history of completedItemHistory) await ctx.db.delete(history._id);
    for (const scan of scans) await ctx.db.delete(scan._id);
    for (const notification of notifications) await ctx.db.delete(notification._id);

    // Create base users for testing
    const adminUser = await ctx.db.insert("users", {
      name: "Admin User",
      email: "admin@demo",
      role: "admin",
      isActive: true,
      createdAt: now,
    });

    const floorUser = await ctx.db.insert("users", {
      name: "Floor Worker", 
      email: "floor@demo",
      role: "operator",
      isActive: true,
      createdAt: now,
    });

    // Create a clean test workflow
    const workflowId = await ctx.db.insert("workflows", {
      name: "Standard Production Workflow",
      description: "A comprehensive workflow for garment production",
      stages: [
        {
          id: "stage-1",
          name: "Assembly",
          description: "Assemble components and prepare for quality check",
          order: 0,
          actions: [
            {
              id: "action-1",
              type: "scan",
              label: "Scan QR Code",
              description: "Scan item QR code to verify assembly completion",
              required: true,
              config: {
                scanType: "qr",
                expectedValue: "item:",
              }
            },
            {
              id: "action-2",
              type: "note",
              label: "Assembly Notes",
              description: "Add any assembly notes or issues",
              required: false,
              config: {
                notePrompt: "Enter assembly notes...",
                maxLength: 200,
              }
            }
          ],
          estimatedDuration: 20,
          isActive: true,
          allowedNextStageIds: ["stage-2"],
        },
        {
          id: "stage-2",
          name: "Quality Check",
          description: "Inspect assembled item for defects and quality",
          order: 1,
          actions: [
            {
              id: "action-3",
              type: "inspection",
              label: "Visual Inspection",
              description: "Check for defects and quality issues",
              required: true,
              config: {
                inspectionChecklist: [
                  "No loose threads",
                  "Proper stitching",
                  "Correct sizing",
                  "No stains or marks",
                  "All buttons attached"
                ],
                allowPartial: false,
              }
            },
            {
              id: "action-4",
              type: "approval",
              label: "QC Approval",
              description: "Quality control approval required",
              required: true,
              config: {
                approverRole: "qc",
                autoApprove: false,
              }
            },
            {
              id: "action-5",
              type: "note",
              label: "QC Notes",
              description: "Add quality control notes",
              required: false,
              config: {
                notePrompt: "Enter quality control notes...",
                maxLength: 300,
              }
            }
          ],
          estimatedDuration: 15,
          isActive: true,
          allowedNextStageIds: ["stage-3"],
        },
        {
          id: "stage-3",
          name: "Packaging",
          description: "Package item for shipping",
          order: 2,
          actions: [
            {
              id: "action-6",
              type: "scan",
              label: "Final Scan",
              description: "Scan before packaging",
              required: true,
              config: {
                scanType: "qr",
                expectedValue: "item:",
              }
            },
            {
              id: "action-7",
              type: "photo",
              label: "Package Photo",
              description: "Take photo of packaged item",
              required: true,
              config: {
                photoCount: 1,
                photoQuality: "medium",
              }
            },
            {
              id: "action-8",
              type: "approval",
              label: "Final Approval",
              description: "Final approval before shipping",
              required: true,
              config: {
                approverRole: "supervisor",
                autoApprove: false,
              }
            }
          ],
          estimatedDuration: 10,
          isActive: true,
          allowedNextStageIds: [],
        }
      ],
      isActive: true,
      createdAt: now,
      updatedAt: now,
      createdBy: "admin@demo",
    });

    // Create test locations
    const location1 = await ctx.db.insert("locations", {
      name: "Assembly Station A1",
      description: "Primary assembly station",
      type: "area",
      qrCode: "location:ASSEMBLY-A1",
      capacity: 5,
      currentOccupancy: 0,
      isActive: true,
      createdAt: now,
      updatedAt: now,
      createdBy: "admin@demo",
    });

    const location2 = await ctx.db.insert("locations", {
      name: "Quality Control QC1",
      description: "Quality inspection station",
      type: "area",
      qrCode: "location:QC-QC1",
      capacity: 3,
      currentOccupancy: 0,
      isActive: true,
      createdAt: now,
      updatedAt: now,
      createdBy: "admin@demo",
    });

    const location3 = await ctx.db.insert("locations", {
      name: "Packaging Station P1",
      description: "Final packaging and shipping station",
      type: "area",
      qrCode: "location:PACK-P1",
      capacity: 4,
      currentOccupancy: 0,
      isActive: true,
      createdAt: now,
      updatedAt: now,
      createdBy: "admin@demo",
    });

    // Create test items with consistent IDs
    const testItems = [
      {
        itemId: "DEMO-001",
        currentStageId: "stage-1",
        metadata: { brand: "Demo Brand", color: "Blue", size: "M", style: "Casual", priority: "normal" }
      },
      {
        itemId: "DEMO-002", 
        currentStageId: "stage-2",
        metadata: { brand: "Demo Brand", color: "Red", size: "L", style: "Formal", priority: "high" }
      },
      {
        itemId: "DEMO-003",
        currentStageId: "stage-3", 
        metadata: { brand: "Demo Brand", color: "Green", size: "S", style: "Sport", priority: "normal" }
      },
      {
        itemId: "DEMO-004",
        currentStageId: "stage-1",
        metadata: { brand: "Demo Brand", color: "Black", size: "XL", style: "Casual", priority: "low" }
      },
      {
        itemId: "DEMO-005",
        currentStageId: "stage-2",
        metadata: { brand: "Demo Brand", color: "White", size: "M", style: "Formal", priority: "high" }
      },
      {
        itemId: "DEMO-006",
        currentStageId: "stage-1",
        metadata: { brand: "Demo Brand", color: "Gray", size: "L", style: "Sport", priority: "normal" }
      },
      {
        itemId: "DEMO-007",
        currentStageId: "stage-3",
        metadata: { brand: "Demo Brand", color: "Yellow", size: "S", style: "Casual", priority: "low" }
      },
      {
        itemId: "DEMO-008",
        currentStageId: "stage-2",
        metadata: { brand: "Demo Brand", color: "Purple", size: "M", style: "Formal", priority: "high" }
      },
      {
        itemId: "DEMO-009",
        currentStageId: "stage-1",
        metadata: { brand: "Demo Brand", color: "Orange", size: "L", style: "Sport", priority: "normal" }
      },
      {
        itemId: "DEMO-010",
        currentStageId: "stage-3",
        metadata: { brand: "Demo Brand", color: "Pink", size: "S", style: "Casual", priority: "low" }
      },
      {
        itemId: "DEMO-011",
        currentStageId: "stage-2",
        metadata: { brand: "Demo Brand", color: "Brown", size: "M", style: "Formal", priority: "high" }
      },
      {
        itemId: "DEMO-012",
        currentStageId: "stage-1",
        metadata: { brand: "Demo Brand", color: "Navy", size: "L", style: "Sport", priority: "normal" }
      },
      {
        itemId: "DEMO-013",
        currentStageId: "stage-3",
        metadata: { brand: "Demo Brand", color: "Teal", size: "S", style: "Casual", priority: "low" }
      },
      {
        itemId: "DEMO-014",
        currentStageId: "stage-2",
        metadata: { brand: "Demo Brand", color: "Maroon", size: "M", style: "Formal", priority: "high" }
      },
      {
        itemId: "DEMO-015",
        currentStageId: "stage-1",
        metadata: { brand: "Demo Brand", color: "Lime", size: "L", style: "Sport", priority: "normal" }
      },
      {
        itemId: "DEMO-016",
        currentStageId: "stage-3",
        metadata: { brand: "Demo Brand", color: "Cyan", size: "S", style: "Casual", priority: "low" }
      },
      {
        itemId: "DEMO-017",
        currentStageId: "stage-2",
        metadata: { brand: "Demo Brand", color: "Indigo", size: "M", style: "Formal", priority: "high" }
      },
      {
        itemId: "DEMO-018",
        currentStageId: "stage-1",
        metadata: { brand: "Demo Brand", color: "Violet", size: "L", style: "Sport", priority: "normal" }
      },
      {
        itemId: "DEMO-019",
        currentStageId: "stage-3",
        metadata: { brand: "Demo Brand", color: "Coral", size: "S", style: "Casual", priority: "low" }
      },
      {
        itemId: "DEMO-020",
        currentStageId: "stage-2",
        metadata: { brand: "Demo Brand", color: "Gold", size: "M", style: "Formal", priority: "high" }
      }
    ];

    const createdItems = [];
    for (const testItem of testItems) {
      const itemId = await ctx.db.insert("items", {
        itemId: testItem.itemId,
        workflowId: workflowId,
        currentStageId: testItem.currentStageId,
        status: "active",
        metadata: testItem.metadata,
        startedAt: now - (Math.random() * 7200000), // Random start time within last 2 hours
        updatedAt: now,
        qrCode: `item:${testItem.itemId}`,
      });
      createdItems.push(itemId);
    }

    // Create some test messages
    await ctx.db.insert("messages", {
      senderId: "admin@demo",
      recipientId: "floor@demo",
      content: JSON.stringify({
        subject: "Welcome to Production Floor",
        body: "Welcome to the production floor! Please review the new workflow procedures and let me know if you have any questions.",
        attachedItemId: createdItems[0]
      }),
      messageType: "text",
      isRead: false,
      createdAt: now - 1800000, // 30 minutes ago
    });

    return {
      success: true,
      message: "All data cleared and fresh demo data created successfully",
      users: [adminUser, floorUser],
      workflow: workflowId,
      items: createdItems,
      locations: [location1, location2, location3],
      totalItems: createdItems.length
    };
  },
});

// Create just the test users
export const createTestUsers = mutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();

    // Check if users already exist
    const existingAdmin = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("email"), "admin@demo"))
      .first();

    const existingFloor = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("email"), "floor@demo"))
      .first();

    let adminUser = existingAdmin?._id;
    let floorUser = existingFloor?._id;

    // Create admin user if it doesn't exist
    if (!existingAdmin) {
      adminUser = await ctx.db.insert("users", {
        name: "Admin User",
        email: "admin@demo",
        role: "admin",
        isActive: true,
        createdAt: now,
      });
    }

    // Create floor user if it doesn't exist
    if (!existingFloor) {
      floorUser = await ctx.db.insert("users", {
        name: "Floor Worker", 
        email: "floor@demo",
        role: "operator",
        isActive: true,
        createdAt: now,
      });
    }

    return {
      success: true,
      message: "Test users created successfully",
      adminUser,
      floorUser,
      adminExists: !!existingAdmin,
      floorExists: !!existingFloor
    };
  },
});