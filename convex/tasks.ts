import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Create a task
export const createTask = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    assignedTo: v.string(),
    assignedBy: v.string(),
    priority: v.union(v.literal("low"), v.literal("medium"), v.literal("high"), v.literal("urgent")),
    dueDate: v.optional(v.number()),
    itemId: v.optional(v.string()),
    workflowId: v.optional(v.id("workflows")),
    stageId: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const taskId = await ctx.db.insert("tasks", {
      title: args.title,
      description: args.description,
      assignedTo: args.assignedTo,
      assignedBy: args.assignedBy,
      status: "pending",
      priority: args.priority,
      dueDate: args.dueDate,
      itemId: args.itemId,
      workflowId: args.workflowId,
      stageId: args.stageId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      notes: args.notes,
    });

    // Create notification for assigned user
    await ctx.db.insert("notifications", {
      userId: args.assignedTo,
      type: "task_assigned",
      title: "New Task Assigned",
      message: `You have been assigned a new task: ${args.title}`,
      senderId: args.assignedBy,
      isRead: false,
      priority: args.priority,
      createdAt: Date.now(),
      metadata: { taskId },
    });

    // Log this activity
    await ctx.db.insert("activityLog", {
      userId: args.assignedBy,
      action: "task_created",
      entityType: "task",
      entityId: taskId,
      description: `Task created: ${args.title}`,
      metadata: { 
        assignedTo: args.assignedTo,
        priority: args.priority,
        itemId: args.itemId 
      },
      timestamp: Date.now(),
    });

    return taskId;
  },
});

// Get tasks for a user
export const getTasks = query({
  args: {
    userId: v.string(),
    status: v.optional(v.union(v.literal("pending"), v.literal("in_progress"), v.literal("completed"), v.literal("cancelled"))),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let tasks = await ctx.db
      .query("tasks")
      .withIndex("by_assigned_to", (q) => q.eq("assignedTo", args.userId))
      .order("desc")
      .collect();

    if (args.status) {
      tasks = tasks.filter(task => task.status === args.status);
    }

    if (args.limit) {
      tasks = tasks.slice(0, args.limit);
    }

    return tasks;
  },
});

// Get all tasks (for admin view)
export const getAllTasks = query({
  args: {
    status: v.optional(v.union(v.literal("pending"), v.literal("in_progress"), v.literal("completed"), v.literal("cancelled"))),
    assignedTo: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let tasks = await ctx.db
      .query("tasks")
      .order("desc")
      .collect();

    if (args.status) {
      tasks = tasks.filter(task => task.status === args.status);
    }

    if (args.assignedTo) {
      tasks = tasks.filter(task => task.assignedTo === args.assignedTo);
    }

    if (args.limit) {
      tasks = tasks.slice(0, args.limit);
    }

    return tasks;
  },
});

// Update task status
export const updateTaskStatus = mutation({
  args: {
    taskId: v.id("tasks"),
    status: v.union(v.literal("pending"), v.literal("in_progress"), v.literal("completed"), v.literal("cancelled")),
    userId: v.string(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const task = await ctx.db.get(args.taskId);
    
    if (!task) {
      throw new Error("Task not found");
    }

    const updates: any = {
      status: args.status,
      updatedAt: Date.now(),
    };

    if (args.status === "completed") {
      updates.completedAt = Date.now();
    }

    if (args.notes) {
      updates.notes = args.notes;
    }

    await ctx.db.patch(args.taskId, updates);

    // Create notification for task assigner if status changed
    if (task.status !== args.status) {
      await ctx.db.insert("notifications", {
        userId: task.assignedBy,
        type: "task_assigned", // Reusing this type for status updates
        title: "Task Status Updated",
        message: `Task "${task.title}" status changed to ${args.status}`,
        senderId: args.userId,
        isRead: false,
        priority: "medium",
        createdAt: Date.now(),
        metadata: { taskId: args.taskId, oldStatus: task.status, newStatus: args.status },
      });
    }

    // Log this activity
    await ctx.db.insert("activityLog", {
      userId: args.userId,
      action: "task_status_updated",
      entityType: "task",
      entityId: args.taskId,
      description: `Task status updated to ${args.status}`,
      metadata: { 
        oldStatus: task.status,
        newStatus: args.status,
        taskTitle: task.title 
      },
      timestamp: Date.now(),
    });
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
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const task = await ctx.db.get(args.taskId);
    
    if (!task) {
      throw new Error("Task not found");
    }

    const updates: any = {
      updatedAt: Date.now(),
    };

    if (args.title !== undefined) updates.title = args.title;
    if (args.description !== undefined) updates.description = args.description;
    if (args.priority !== undefined) updates.priority = args.priority;
    if (args.dueDate !== undefined) updates.dueDate = args.dueDate;
    if (args.notes !== undefined) updates.notes = args.notes;

    await ctx.db.patch(args.taskId, updates);

    // Log this activity
    await ctx.db.insert("activityLog", {
      userId: args.userId,
      action: "task_updated",
      entityType: "task",
      entityId: args.taskId,
      description: `Task updated: ${task.title}`,
      metadata: { 
        taskTitle: task.title,
        updatedFields: Object.keys(updates).filter(key => key !== "updatedAt")
      },
      timestamp: Date.now(),
    });
  },
});

// Delete task
export const deleteTask = mutation({
  args: {
    taskId: v.id("tasks"),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const task = await ctx.db.get(args.taskId);
    
    if (!task) {
      throw new Error("Task not found");
    }

    await ctx.db.delete(args.taskId);

    // Log this activity
    await ctx.db.insert("activityLog", {
      userId: args.userId,
      action: "task_deleted",
      entityType: "task",
      entityId: args.taskId,
      description: `Task deleted: ${task.title}`,
      metadata: { 
        taskTitle: task.title,
        assignedTo: task.assignedTo 
      },
      timestamp: Date.now(),
    });
  },
});

// Get task statistics
export const getTaskStats = query({
  args: {
    userId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let tasks = await ctx.db
      .query("tasks")
      .collect();

    if (args.userId) {
      tasks = tasks.filter(task => task.assignedTo === args.userId);
    }

    const stats = {
      total: tasks.length,
      pending: tasks.filter(t => t.status === "pending").length,
      inProgress: tasks.filter(t => t.status === "in_progress").length,
      completed: tasks.filter(t => t.status === "completed").length,
      cancelled: tasks.filter(t => t.status === "cancelled").length,
      urgent: tasks.filter(t => t.priority === "urgent").length,
      high: tasks.filter(t => t.priority === "high").length,
      medium: tasks.filter(t => t.priority === "medium").length,
      low: tasks.filter(t => t.priority === "low").length,
    };

    return stats;
  },
}); 