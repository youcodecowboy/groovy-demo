import { mutation } from "./_generated/server";

export const seedDemoData = mutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();

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

    // Create a test workflow
    const workflowId = await ctx.db.insert("workflows", {
      name: "Demo Production Workflow",
      description: "A sample workflow for demonstration",
      stages: [
        {
          id: "stage-1",
          name: "Assembly",
          description: "Assemble components",
          order: 0,
          actions: [
            {
              id: "action-1",
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
          id: "stage-2",
          name: "Quality Check",
          description: "Inspect assembled item",
          order: 1,
          actions: [
            {
              id: "action-2",
              type: "inspection",
              label: "Visual Inspection",
              description: "Check for defects",
              required: true,
            }
          ],
          estimatedDuration: 10,
          isActive: true,
        },
        {
          id: "stage-3",
          name: "Packaging",
          description: "Package for shipping",
          order: 2,
          actions: [
            {
              id: "action-3",
              type: "scan",
              label: "Final Scan",
              description: "Scan before packaging",
              required: true,
            }
          ],
          estimatedDuration: 15,
          isActive: true,
        }
      ],
      isActive: true,
      createdAt: now,
      updatedAt: now,
      createdBy: "admin@demo",
    });

    // Create some test items
    const item1 = await ctx.db.insert("items", {
      itemId: "DEMO-001",
      workflowId: workflowId,
      currentStageId: "stage-1",
      status: "active",
      metadata: {
        brand: "Demo Brand",
        color: "Blue",
        size: "M",
        style: "Casual"
      },
      startedAt: now,
      updatedAt: now,
      qrCode: "item:DEMO-001",
    });

    const item2 = await ctx.db.insert("items", {
      itemId: "DEMO-002",
      workflowId: workflowId,
      currentStageId: "stage-2",
      status: "active",
      metadata: {
        brand: "Demo Brand",
        color: "Red",
        size: "L",
        style: "Formal"
      },
      startedAt: now - 3600000, // 1 hour ago
      updatedAt: now,
      qrCode: "item:DEMO-002",
    });

    // Create some test locations
    const location1 = await ctx.db.insert("locations", {
      name: "Assembly Station A1",
      description: "Primary assembly station",
      type: "area",
      qrCode: "location:ASSEMBLY-A1",
      capacity: 5,
      currentOccupancy: 2,
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
      currentOccupancy: 1,
      isActive: true,
      createdAt: now,
      updatedAt: now,
      createdBy: "admin@demo",
    });

    // Create test messages between admin and floor
    await ctx.db.insert("messages", {
      senderId: "admin@demo",
      recipientId: "floor@demo",
      content: JSON.stringify({
        subject: "Welcome to Production Floor",
        body: "Welcome to the production floor! Please review the new workflow procedures and let me know if you have any questions.",
        attachedItemId: item1
      }),
      messageType: "text",
      isRead: false,
      createdAt: now - 1800000, // 30 minutes ago
    });

    await ctx.db.insert("messages", {
      senderId: "floor@demo",
      recipientId: "admin@demo",
      content: JSON.stringify({
        subject: "Re: Welcome to Production Floor",
        body: "Thank you! I've reviewed the procedures and I'm ready to start. The workflow looks good.",
        attachedItemId: null
      }),
      messageType: "text",
      isRead: true,
      createdAt: now - 900000, // 15 minutes ago
    });

    await ctx.db.insert("messages", {
      senderId: "admin@demo",
      recipientId: "floor@demo",
      content: JSON.stringify({
        subject: "Quality Check Reminder",
        body: "Don't forget to perform quality checks on all items before moving to the next stage. Let me know if you need any clarification.",
        attachedItemId: item2
      }),
      messageType: "text",
      isRead: false,
      createdAt: now - 300000, // 5 minutes ago
    });

    return {
      success: true,
      message: "Demo data created successfully",
      users: [adminUser, floorUser],
      workflow: workflowId,
      items: [item1, item2],
      locations: [location1, location2]
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