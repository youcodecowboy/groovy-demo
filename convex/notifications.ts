import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Create a notification
export const createNotification = mutation({
  args: {
    userId: v.string(),
    type: v.union(
      v.literal("item_assigned"),
      v.literal("item_completed"),
      v.literal("item_defective"),
      v.literal("item_flagged"),
      v.literal("stage_completed"),
      v.literal("message_received"),
      v.literal("task_assigned"),
      v.literal("system_alert")
    ),
    title: v.string(),
    message: v.string(),
    itemId: v.optional(v.string()),
    workflowId: v.optional(v.id("workflows")),
    stageId: v.optional(v.string()),
    senderId: v.optional(v.string()),
    priority: v.union(v.literal("low"), v.literal("medium"), v.literal("high"), v.literal("urgent")),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const notificationId = await ctx.db.insert("notifications", {
      userId: args.userId,
      type: args.type,
      title: args.title,
      message: args.message,
      itemId: args.itemId,
      workflowId: args.workflowId,
      stageId: args.stageId,
      senderId: args.senderId,
      isRead: false,
      priority: args.priority,
      createdAt: Date.now(),
      metadata: args.metadata,
    });

    // Also log this activity
    await ctx.db.insert("activityLog", {
      userId: args.senderId,
      action: "notification_created",
      entityType: "notification",
      entityId: notificationId,
      description: `Notification created: ${args.title}`,
      metadata: { type: args.type, recipientId: args.userId },
      timestamp: Date.now(),
    });

    return notificationId;
  },
});

// Get notifications for a user
export const getNotifications = query({
  args: {
    userId: v.string(),
    limit: v.optional(v.number()),
    unreadOnly: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    let notifications;
    
    if (args.unreadOnly) {
      notifications = await ctx.db
        .query("notifications")
        .withIndex("by_user_read", (q) => 
          q.eq("userId", args.userId).eq("isRead", false)
        )
        .order("desc")
        .collect();
    } else {
      notifications = await ctx.db
        .query("notifications")
        .withIndex("by_user", (q) => q.eq("userId", args.userId))
        .order("desc")
        .collect();
    }

    if (args.limit) {
      notifications = notifications.slice(0, args.limit);
    }

    return notifications;
  },
});

// Mark notification as read
export const markNotificationAsRead = mutation({
  args: {
    notificationId: v.id("notifications"),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const notification = await ctx.db.get(args.notificationId);
    
    if (!notification || notification.userId !== args.userId) {
      throw new Error("Notification not found or access denied");
    }

    await ctx.db.patch(args.notificationId, {
      isRead: true,
      readAt: Date.now(),
    });

    // Log this activity
    await ctx.db.insert("activityLog", {
      userId: args.userId,
      action: "notification_read",
      entityType: "notification",
      entityId: args.notificationId,
      description: `Notification marked as read: ${notification.title}`,
      timestamp: Date.now(),
    });
  },
});

// Mark all notifications as read for a user
export const markAllNotificationsAsRead = mutation({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const notifications = await ctx.db
      .query("notifications")
      .withIndex("by_user_read", (q) => 
        q.eq("userId", args.userId).eq("isRead", false)
      )
      .collect();

    for (const notification of notifications) {
      await ctx.db.patch(notification._id, {
        isRead: true,
        readAt: Date.now(),
      });
    }

    // Log this activity
    await ctx.db.insert("activityLog", {
      userId: args.userId,
      action: "all_notifications_read",
      entityType: "notification",
      description: `All notifications marked as read`,
      metadata: { count: notifications.length },
      timestamp: Date.now(),
    });
  },
});

// Get unread notification count
export const getUnreadNotificationCount = query({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const notifications = await ctx.db
      .query("notifications")
      .withIndex("by_user_read", (q) => 
        q.eq("userId", args.userId).eq("isRead", false)
      )
      .collect();

    return notifications.length;
  },
});

// Delete a notification
export const deleteNotification = mutation({
  args: {
    notificationId: v.id("notifications"),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const notification = await ctx.db.get(args.notificationId);
    
    if (!notification || notification.userId !== args.userId) {
      throw new Error("Notification not found or access denied");
    }

    await ctx.db.delete(args.notificationId);

    // Log this activity
    await ctx.db.insert("activityLog", {
      userId: args.userId,
      action: "notification_deleted",
      entityType: "notification",
      entityId: args.notificationId,
      description: `Notification deleted: ${notification.title}`,
      timestamp: Date.now(),
    });
  },
});

// Create system-wide notification
export const createSystemNotification = mutation({
  args: {
    title: v.string(),
    message: v.string(),
    priority: v.union(v.literal("low"), v.literal("medium"), v.literal("high"), v.literal("urgent")),
    senderId: v.string(),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    // Get all active users
    const users = await ctx.db
      .query("users")
      .withIndex("by_active", (q) => q.eq("isActive", true))
      .collect();

    const notificationIds = [];

    // Create notification for each user
    for (const user of users) {
      const notificationId = await ctx.db.insert("notifications", {
        userId: user._id,
        type: "system_alert",
        title: args.title,
        message: args.message,
        senderId: args.senderId,
        isRead: false,
        priority: args.priority,
        createdAt: Date.now(),
        metadata: args.metadata,
      });
      notificationIds.push(notificationId);
    }

    // Log this activity
    await ctx.db.insert("activityLog", {
      userId: args.senderId,
      action: "system_notification_sent",
      entityType: "notification",
      description: `System notification sent: ${args.title}`,
      metadata: { 
        recipientCount: users.length,
        priority: args.priority,
        notificationIds 
      },
      timestamp: Date.now(),
    });

    return notificationIds;
  },
}); 