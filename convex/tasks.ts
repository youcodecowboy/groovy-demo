import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Get tasks for a user or team
export const getTasks = query({
  args: {
    userId: v.string(),
    teamId: v.optional(v.string()),
    status: v.optional(v.union(v.literal("pending"), v.literal("in_progress"), v.literal("completed"), v.literal("cancelled"))),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { userId, teamId, status, limit = 50 } = args;

    // If teamId is provided, get tasks for the team
    if (teamId) {
      // Get all users in the team
      const teamUsers = await ctx.db
        .query("users")
        .withIndex("by_team", (q) => q.eq("team", teamId))
        .collect();

      const teamUserIds = teamUsers.map(user => user._id);

      // Get tasks assigned to team members
      let tasksQuery = ctx.db
        .query("tasks")
        .filter((q) => q.eq(q.field("assignedTo"), teamUserIds[0] as string)); // We'll filter the rest in JS

      if (status) {
        tasksQuery = tasksQuery.filter((q) => q.eq(q.field("status"), status));
      }

      const tasks = await tasksQuery
        .order("desc")
        .collect();

      // Filter for all team users in JavaScript
      const filteredTasks = tasks.filter(task => 
        teamUserIds.includes(task.assignedTo as any)
      );

      return filteredTasks.slice(0, limit);
    }

    // Get personal tasks for the user
    let tasksQuery = ctx.db
      .query("tasks")
      .withIndex("by_assigned_to", (q) => q.eq("assignedTo", userId));

    if (status) {
      tasksQuery = tasksQuery.filter((q) => q.eq(q.field("status"), status));
    }

    const tasks = await tasksQuery
      .order("desc")
      .take(limit);

    return tasks;
  },
});

// Get unread task count for a user or team
export const getUnreadTaskCount = query({
  args: {
    userId: v.string(),
    teamId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { userId, teamId } = args;

    if (teamId) {
      // Get all users in the team
      const teamUsers = await ctx.db
        .query("users")
        .withIndex("by_team", (q) => q.eq("team", teamId))
        .collect();

      const teamUserIds = teamUsers.map(user => user._id);

      // Count pending tasks for the team
      const pendingTasks = await ctx.db
        .query("tasks")
        .filter((q) => 
          q.and(
            q.eq(q.field("assignedTo"), teamUserIds[0] as string), // We'll filter the rest in JS
            q.eq(q.field("status"), "pending")
          )
        )
        .collect();

      // Filter for all team users in JavaScript
      const teamPendingTasks = pendingTasks.filter(task => 
        teamUserIds.includes(task.assignedTo as any)
      );

      return teamPendingTasks.length;
    }

    // Count personal pending tasks
    const pendingTasks = await ctx.db
      .query("tasks")
      .withIndex("by_assigned_to", (q) => q.eq("assignedTo", userId))
      .filter((q) => q.eq(q.field("status"), "pending"))
      .collect();

    return pendingTasks.length;
  },
});

// Create a new task
export const createTask = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    assignedById: v.string(),
    assignedToIds: v.array(v.string()), // Can be user IDs or team IDs
    priority: v.union(v.literal("low"), v.literal("medium"), v.literal("high"), v.literal("urgent")),
    dueDate: v.optional(v.number()),
    attachedItems: v.optional(v.array(v.string())),
    itemId: v.optional(v.string()),
    workflowId: v.optional(v.id("workflows")),
    stageId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { 
      title, 
      description, 
      assignedById, 
      assignedToIds, 
      priority, 
      dueDate, 
      attachedItems, 
      itemId, 
      workflowId, 
      stageId 
    } = args;

    const tasks = [];

    for (const assignedToId of assignedToIds) {
      // Check if assignedToId is a team ID (starts with "team-")
      if (assignedToId.startsWith("team-")) {
        const teamName = assignedToId.replace("team-", "");
        
        // Get all users in the team
        const teamUsers = await ctx.db
          .query("users")
          .withIndex("by_team", (q) => q.eq("team", teamName))
          .collect();

        // Create a task for each team member
        for (const teamUser of teamUsers) {
          const taskId = await ctx.db.insert("tasks", {
            title,
            description,
            assignedTo: teamUser._id,
            assignedBy: assignedById,
            status: "pending",
            priority,
            dueDate,
            itemId,
            workflowId,
            stageId,
            createdAt: Date.now(),
            updatedAt: Date.now(),
            notes: attachedItems ? `Attached items: ${attachedItems.join(", ")}` : undefined,
          });

          tasks.push(taskId);
        }
      } else {
        // Create a task for individual user
        const taskId = await ctx.db.insert("tasks", {
          title,
          description,
          assignedTo: assignedToId,
          assignedBy: assignedById,
          status: "pending",
          priority,
          dueDate,
          itemId,
          workflowId,
          stageId,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          notes: attachedItems ? `Attached items: ${attachedItems.join(", ")}` : undefined,
        });

        tasks.push(taskId);
      }
    }

    return tasks;
  },
});

// Update task status
export const updateTaskStatus = mutation({
  args: {
    taskId: v.id("tasks"),
    status: v.union(v.literal("pending"), v.literal("in_progress"), v.literal("completed"), v.literal("cancelled")),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { taskId, status, notes } = args;

    const updateData: any = {
      status,
      updatedAt: Date.now(),
    };

    if (status === "completed") {
      updateData.completedAt = Date.now();
    }

    if (notes) {
      updateData.notes = notes;
    }

    await ctx.db.patch(taskId, updateData);

    return { success: true };
  },
});

// Update task
export const updateTask = mutation({
  args: {
    taskId: v.id("tasks"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    priority: v.optional(v.union(v.literal("low"), v.literal("medium"), v.literal("high"), v.literal("urgent"))),
    dueDate: v.optional(v.number()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { taskId, ...updateData } = args;

    await ctx.db.patch(taskId, {
      ...updateData,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

// Delete a task
export const deleteTask = mutation({
  args: {
    taskId: v.id("tasks"),
  },
  handler: async (ctx, args) => {
    const { taskId } = args;

    await ctx.db.delete(taskId);

    return { success: true };
  },
});

// Get task statistics for a user or team
export const getTaskStats = query({
  args: {
    userId: v.string(),
    teamId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { userId, teamId } = args;

    if (teamId) {
      // Get all users in the team
      const teamUsers = await ctx.db
        .query("users")
        .withIndex("by_team", (q) => q.eq("team", teamId))
        .collect();

      const teamUserIds = teamUsers.map(user => user._id);

      // Get all tasks for the team
      const allTasks = await ctx.db
        .query("tasks")
        .filter((q) => q.eq(q.field("assignedTo"), teamUserIds[0] as string)) // We'll filter the rest in JS
        .collect();

      // Filter for all team users in JavaScript
      const filteredTasks = allTasks.filter(task => 
        teamUserIds.includes(task.assignedTo as any)
      );

      const stats = {
        total: filteredTasks.length,
        pending: filteredTasks.filter(task => task.status === "pending").length,
        inProgress: filteredTasks.filter(task => task.status === "in_progress").length,
        completed: filteredTasks.filter(task => task.status === "completed").length,
        cancelled: filteredTasks.filter(task => task.status === "cancelled").length,
        overdue: filteredTasks.filter(task => 
          task.dueDate && task.dueDate < Date.now() && task.status !== "completed"
        ).length,
      };

      return stats;
    }

    // Get personal task statistics
    const allTasks = await ctx.db
      .query("tasks")
      .withIndex("by_assigned_to", (q) => q.eq("assignedTo", userId))
      .collect();

    const stats = {
      total: allTasks.length,
      pending: allTasks.filter(task => task.status === "pending").length,
      inProgress: allTasks.filter(task => task.status === "in_progress").length,
      completed: allTasks.filter(task => task.status === "completed").length,
      cancelled: allTasks.filter(task => task.status === "cancelled").length,
      overdue: allTasks.filter(task => 
        task.dueDate && task.dueDate < Date.now() && task.status !== "completed"
      ).length,
    };

    return stats;
  },
}); 

// Seed demo tasks for testing
export const seedDemoTasks = mutation({
  args: {},
  handler: async (ctx, args) => {
    // Get all users to use as assigners and assignees
    const allUsers = await ctx.db.query("users").collect();
    
    if (allUsers.length === 0) {
      throw new Error("No users found. Please create demo users first.");
    }

    const demoTasks = [
      {
        title: "Complete Priority Order #PO-123",
        description: "Finish production of priority order by end of shift. Focus on quality standards and ensure all items meet specifications.",
        priority: "urgent" as const,
        teamName: "production",
        assignerName: "Mike Chen",
        dueDate: Date.now() + 1000 * 60 * 60 * 8, // 8 hours from now
      },
      {
        title: "Machine Maintenance Check",
        description: "Perform routine maintenance on production line machines. Check for wear and tear, lubricate moving parts.",
        priority: "medium" as const,
        teamName: "production",
        assignerName: "Mike Chen",
        dueDate: Date.now() + 1000 * 60 * 60 * 24, // 24 hours from now
      },
      {
        title: "Cutting Pattern Review",
        description: "Review and implement new cutting patterns for upcoming orders. Ensure accuracy and efficiency.",
        priority: "high" as const,
        teamName: "cutting",
        assignerName: "Emma Davis",
        dueDate: Date.now() + 1000 * 60 * 60 * 12, // 12 hours from now
      },
      {
        title: "Machine #3 Repair",
        description: "Diagnose and repair cutting machine #3. Check electrical connections and replace worn parts.",
        priority: "urgent" as const,
        teamName: "cutting",
        assignerName: "Emma Davis",
        dueDate: Date.now() + 1000 * 60 * 60 * 4, // 4 hours from now
      },
      {
        title: "Thread Inventory Check",
        description: "Check thread inventory levels and refill machines as needed. Order additional supplies if necessary.",
        priority: "medium" as const,
        teamName: "sewing",
        assignerName: "Carlos Lopez",
        dueDate: Date.now() + 1000 * 60 * 60 * 6, // 6 hours from now
      },
      {
        title: "Quality Control Training",
        description: "Conduct quality control training session for sewing team. Review standards and procedures.",
        priority: "low" as const,
        teamName: "sewing",
        assignerName: "Carlos Lopez",
        dueDate: Date.now() + 1000 * 60 * 60 * 24 * 2, // 2 days from now
      },
      {
        title: "Quality Inspection - Items #456-458",
        description: "Perform detailed quality inspection on items #ITEM-456, #ITEM-457, #ITEM-458. Document any defects.",
        priority: "high" as const,
        teamName: "quality",
        assignerName: "Amanda White",
        dueDate: Date.now() + 1000 * 60 * 60 * 2, // 2 hours from now
      },
      {
        title: "Quality Standards Review",
        description: "Review and update quality standards documentation. Ensure all procedures are current and accurate.",
        priority: "medium" as const,
        teamName: "quality",
        assignerName: "Amanda White",
        dueDate: Date.now() + 1000 * 60 * 60 * 24 * 3, // 3 days from now
      },
      {
        title: "Packaging Supplies Order",
        description: "Order additional packaging supplies including boxes, labels, and protective materials.",
        priority: "high" as const,
        teamName: "packaging",
        assignerName: "Tom Anderson",
        dueDate: Date.now() + 1000 * 60 * 60 * 24, // 24 hours from now
      },
      {
        title: "Shipment Preparation",
        description: "Prepare all items for tomorrow's 2 PM shipment. Ensure proper packaging and labeling.",
        priority: "urgent" as const,
        teamName: "packaging",
        assignerName: "Tom Anderson",
        dueDate: Date.now() + 1000 * 60 * 60 * 18, // 18 hours from now
      },
    ];

    const createdTasks = [];

    for (const demoTask of demoTasks) {
      // Find assigner by name
      const assigner = allUsers.find(user => user.name === demoTask.assignerName);
      if (!assigner) continue;

      // Find team members
      const teamMembers = allUsers.filter(user => user.team === demoTask.teamName);
      if (teamMembers.length === 0) continue;

      // Create task for each team member (except assigner)
      for (const assignee of teamMembers) {
        if (assignee._id === assigner._id) continue; // Don't assign to self

        const taskId = await ctx.db.insert("tasks", {
          title: demoTask.title,
          description: demoTask.description,
          assignedTo: assignee._id,
          assignedBy: assigner._id,
          status: Math.random() > 0.8 ? "in_progress" : "pending", // 20% chance of in progress
          priority: demoTask.priority,
          dueDate: demoTask.dueDate,
          createdAt: Date.now() - Math.random() * 1000 * 60 * 60 * 24 * 7, // Random time in last 7 days
          updatedAt: Date.now() - Math.random() * 1000 * 60 * 60 * 24 * 3, // Random time in last 3 days
          completedAt: Math.random() > 0.9 ? Date.now() - Math.random() * 1000 * 60 * 60 * 24 : undefined, // 10% chance of completed
        });

        createdTasks.push({
          taskId,
          title: demoTask.title,
          assigner: assigner.name,
          assignee: assignee.name,
          team: demoTask.teamName,
          priority: demoTask.priority,
          status: Math.random() > 0.8 ? "in_progress" : "pending",
        });
      }
    }

    return createdTasks;
  },
}); 