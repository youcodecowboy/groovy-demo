import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Send a message
export const send = mutation({
  args: {
    senderId: v.string(),
    recipientId: v.string(),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    
    const messageId = await ctx.db.insert("messages", {
      senderId: args.senderId,
      recipientId: args.recipientId,
      content: args.content,
      messageType: "text",
      isRead: false,
      createdAt: now,
    });

    return messageId;
  },
});

// Get conversation between two users
export const getConversation = query({
  args: {
    userId: v.string(),
    otherUserId: v.string(),
  },
  handler: async (ctx, args) => {
    const messages = await ctx.db
      .query("messages")
      .filter((q) => 
        q.or(
          q.and(
            q.eq(q.field("senderId"), args.userId),
            q.eq(q.field("recipientId"), args.otherUserId)
          ),
          q.and(
            q.eq(q.field("senderId"), args.otherUserId),
            q.eq(q.field("recipientId"), args.userId)
          )
        )
      )
      .order("asc")
      .collect();

    return messages;
  },
});

// Get unread message count for a user
export const getUnreadCount = query({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const unreadMessages = await ctx.db
      .query("messages")
      .filter((q) => 
        q.and(
          q.eq(q.field("recipientId"), args.userId),
          q.eq(q.field("isRead"), false)
        )
      )
      .collect();

    return unreadMessages.length;
  },
});

// Get recent unread messages for notifications
export const getRecentUnreadMessages = query({
  args: {
    userId: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 10;
    
    const unreadMessages = await ctx.db
      .query("messages")
      .filter((q) => 
        q.and(
          q.eq(q.field("recipientId"), args.userId),
          q.eq(q.field("isRead"), false)
        )
      )
      .order("desc")
      .take(limit);

    return unreadMessages;
  },
});

// Mark messages as read
export const markAsRead = mutation({
  args: {
    messageIds: v.array(v.id("messages")),
  },
  handler: async (ctx, args) => {
    for (const messageId of args.messageIds) {
      await ctx.db.patch(messageId, {
        isRead: true,
      });
    }
  },
});

// Get all conversations for a user
export const getConversations = query({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    // Get all messages where user is sender or recipient
    const allMessages = await ctx.db
      .query("messages")
      .filter((q) => 
        q.or(
          q.eq(q.field("senderId"), args.userId),
          q.eq(q.field("recipientId"), args.userId)
        )
      )
      .order("desc")
      .collect();

    // Group by conversation partner
    const conversations = new Map();
    
    for (const message of allMessages) {
      const otherUserId = message.senderId === args.userId 
        ? message.recipientId 
        : message.senderId;
      
      if (!conversations.has(otherUserId)) {
        conversations.set(otherUserId, {
          otherUserId,
          lastMessage: message,
          unreadCount: 0,
        });
      }
      
      // Count unread messages
      if (message.recipientId === args.userId && !message.isRead) {
        const conv = conversations.get(otherUserId);
        conv.unreadCount++;
      }
    }

    return Array.from(conversations.values());
  },
});

// Get recent messages for a user
export const getRecentMessages = query({
  args: {
    userId: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 50;
    
    return await ctx.db
      .query("messages")
      .filter((q) => 
        q.or(
          q.eq(q.field("senderId"), args.userId),
          q.eq(q.field("recipientId"), args.userId)
        )
      )
      .order("desc")
      .take(limit);
  },
}); 