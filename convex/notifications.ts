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

    // If no notifications exist, return empty array
    // Sample notifications should be created via mutations, not queries

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

// Get notification rules for a user
export const getNotificationRules = query({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    // TODO: Implement when notification rules table is added to schema
    // For now, return mock data
    return [
      {
        _id: "rule1",
        name: "Item Stuck Alert",
        description: "Alert when items are stuck in a stage for more than 4 hours",
        kind: "item.stuck",
        severity: "warning",
        channels: ["inApp"],
        recipients: [args.userId],
        conditions: { stageTimeoutHours: 4 },
        isEnabled: true,
        lastTriggeredAt: Date.now() - 3600000, // 1 hour ago
      },
      {
        _id: "rule2", 
        name: "Order Behind Schedule",
        description: "Alert when orders are behind schedule by more than 12 hours",
        kind: "order.behind",
        severity: "high",
        channels: ["inApp", "email"],
        recipients: [args.userId],
        conditions: { lateByHours: 12 },
        isEnabled: true,
        lastTriggeredAt: undefined,
      },
      {
        _id: "rule3",
        name: "Materials Low Stock",
        description: "Alert when materials are below 10 units",
        kind: "materials.lowstock", 
        severity: "medium",
        channels: ["inApp"],
        recipients: [args.userId],
        conditions: { belowQty: 10 },
        isEnabled: false,
        lastTriggeredAt: undefined,
      }
    ];
  },
});

// Create notification rule
export const createNotificationRule = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    kind: v.string(),
    severity: v.optional(v.string()),
    channels: v.array(v.string()),
    recipients: v.array(v.string()),
    conditions: v.any(),
    isEnabled: v.boolean(),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    // TODO: Implement when notification rules table is added to schema
    // For now, just log the activity
    await ctx.db.insert("activityLog", {
      userId: args.userId,
      action: "notification_rule_created",
      entityType: "notification",
      description: `Notification rule created: ${args.name}`,
      metadata: { 
        kind: args.kind,
        severity: args.severity,
        channels: args.channels,
        recipientCount: args.recipients.length,
        conditions: args.conditions
      },
      timestamp: Date.now(),
    });

    return "rule_created";
  },
});

// Update notification rule
export const updateNotificationRule = mutation({
  args: {
    ruleId: v.string(),
    name: v.string(),
    description: v.optional(v.string()),
    kind: v.string(),
    severity: v.optional(v.string()),
    channels: v.array(v.string()),
    recipients: v.array(v.string()),
    conditions: v.any(),
    isEnabled: v.boolean(),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    // TODO: Implement when notification rules table is added to schema
    await ctx.db.insert("activityLog", {
      userId: args.userId,
      action: "notification_rule_updated",
      entityType: "notification",
      description: `Notification rule updated: ${args.name}`,
      metadata: { 
        ruleId: args.ruleId,
        kind: args.kind,
        severity: args.severity,
        channels: args.channels,
        recipientCount: args.recipients.length,
        conditions: args.conditions
      },
      timestamp: Date.now(),
    });

    return "rule_updated";
  },
});

// Toggle notification rule
export const toggleNotificationRule = mutation({
  args: {
    ruleId: v.string(),
    userId: v.string(),
    enabled: v.boolean(),
  },
  handler: async (ctx, args) => {
    // TODO: Implement when notification rules table is added to schema
    await ctx.db.insert("activityLog", {
      userId: args.userId,
      action: "notification_rule_toggled",
      entityType: "notification",
      description: `Notification rule ${args.enabled ? 'enabled' : 'disabled'}`,
      metadata: { 
        ruleId: args.ruleId,
        enabled: args.enabled
      },
      timestamp: Date.now(),
    });

    return "rule_toggled";
  },
});

// Delete notification rule
export const deleteNotificationRule = mutation({
  args: {
    ruleId: v.string(),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    // TODO: Implement when notification rules table is added to schema
    await ctx.db.insert("activityLog", {
      userId: args.userId,
      action: "notification_rule_deleted",
      entityType: "notification",
      description: `Notification rule deleted`,
      metadata: { 
        ruleId: args.ruleId
      },
      timestamp: Date.now(),
    });

    return "rule_deleted";
  },
});

// Update notification preferences
export const updateNotificationPreferences = mutation({
  args: {
    userId: v.string(),
    preferences: v.any(),
  },
  handler: async (ctx, args) => {
    // TODO: Implement when notification preferences table is added to schema
    await ctx.db.insert("activityLog", {
      userId: args.userId,
      action: "notification_preferences_updated",
      entityType: "notification",
      description: `Notification preferences updated`,
      metadata: { 
        preferences: args.preferences
      },
      timestamp: Date.now(),
    });

    return "preferences_updated";
  },
}); 