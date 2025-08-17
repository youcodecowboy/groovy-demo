import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Get conversations for a user
export const getConversations = query({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const { userId } = args;

    // Get all messages where the user is involved
    const allMessages = await ctx.db.query("messages").collect();
    
    const userMessages = allMessages.filter(msg => 
      msg.senderId === userId || msg.recipientId === userId
    );

    // Group messages by conversation (other participant)
    const conversations = new Map();

    for (const message of userMessages) {
      const otherUserId = message.senderId === userId ? message.recipientId : message.senderId;
      
      if (!conversations.has(otherUserId)) {
        conversations.set(otherUserId, {
          participantId: otherUserId,
          lastMessage: message,
          unreadCount: 0,
          messageCount: 0,
        });
      }

      const conversation = conversations.get(otherUserId);
      conversation.messageCount++;

      // Update last message if this one is newer
      if (message.createdAt > conversation.lastMessage.createdAt) {
        conversation.lastMessage = message;
      }

      // Count unread messages
      if (message.recipientId === userId && !message.isRead) {
        conversation.unreadCount++;
      }
    }

    // Convert to array and sort by last message time
    const conversationsArray = Array.from(conversations.values())
      .sort((a, b) => b.lastMessage.createdAt - a.lastMessage.createdAt);

    // Get user details for each conversation
    const conversationsWithUsers = await Promise.all(
      conversationsArray.map(async (conversation) => {
        try {
          const user = await ctx.db.get(conversation.participantId as any);
          return {
            ...conversation,
            participant: user && 'name' in user && 'email' in user ? {
              _id: user._id,
              name: user.name,
              email: user.email,
              team: (user as any).team,
            } : null,
          };
        } catch (error) {
          return {
            ...conversation,
            participant: null,
          };
        }
      })
    );

    return conversationsWithUsers;
  },
});

// Get messages for a user or team
export const getMessages = query({
  args: {
    userId: v.string(),
    teamId: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { userId, teamId, limit = 50 } = args;

    if (teamId) {
      // Get all users in the team
      const teamUsers = await ctx.db
        .query("users")
        .withIndex("by_team", (q) => q.eq("team", teamId))
        .collect();

      const teamUserIds = teamUsers.map(user => user._id);

      // Get all messages and filter in JavaScript
      const allMessages = await ctx.db.query("messages").collect();

      // Filter for team messages where user is involved
      const teamMessages = allMessages.filter(msg => {
        const isUserInvolved = msg.senderId === userId || msg.recipientId === userId;
        const otherUserId = msg.senderId === userId ? msg.recipientId : msg.senderId;
        const isOtherUserInTeam = teamUserIds.includes(otherUserId as any);
        return isUserInvolved && isOtherUserInTeam;
      });

      // Sort by creation time and limit
      return teamMessages
        .sort((a, b) => b.createdAt - a.createdAt)
        .slice(0, limit);
    }

    // Get all messages and filter for personal messages
    const allMessages = await ctx.db.query("messages").collect();
    
    const personalMessages = allMessages.filter(msg => 
      msg.senderId === userId || msg.recipientId === userId
    );
    
    return personalMessages
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, limit);
  },
});

// Get unread message count for a user or team
export const getUnreadMessageCount = query({
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

      // Count unread messages for the team
      const unreadMessages = await ctx.db
        .query("messages")
        .withIndex("by_recipient_read", (q) => 
          q.eq("recipientId", userId).eq("isRead", false)
        )
        .collect();

      // Filter for team users in JavaScript
      const teamUnreadMessages = unreadMessages.filter(msg => 
        teamUserIds.includes(msg.senderId as any)
      );

      return teamUnreadMessages.length;
    }

    // Count personal unread messages
    const unreadMessages = await ctx.db
      .query("messages")
      .withIndex("by_recipient_read", (q) => 
        q.eq("recipientId", userId).eq("isRead", false)
      )
      .collect();

    return unreadMessages.length;
  },
});

// Create a new message
export const createMessage = mutation({
  args: {
    senderId: v.string(),
    recipientIds: v.array(v.string()), // Can be user IDs or team IDs
    content: v.string(),
    priority: v.union(v.literal("low"), v.literal("medium"), v.literal("high"), v.literal("urgent")),
    attachedItems: v.optional(v.array(v.string())),
    messageType: v.optional(v.union(v.literal("text"), v.literal("image"), v.literal("file"), v.literal("system"))),
  },
  handler: async (ctx, args) => {
    const { senderId, recipientIds, content, priority, attachedItems, messageType = "text" } = args;

    const messages = [];

    for (const recipientId of recipientIds) {
      // Check if recipientId is a team ID (starts with "team-")
      if (recipientId.startsWith("team-")) {
        const teamName = recipientId.replace("team-", "");
        
        // Get all users in the team
        const teamUsers = await ctx.db
          .query("users")
          .withIndex("by_team", (q) => q.eq("team", teamName))
          .collect();

        // Create a message for each team member
        for (const teamUser of teamUsers) {
          const messageId = await ctx.db.insert("messages", {
            senderId,
            recipientId: teamUser._id,
            content,
            messageType,
            isRead: false,
            createdAt: Date.now(),
            metadata: {
              priority,
              attachedItems,
              isTeamMessage: true,
              teamName,
            },
          });

          messages.push(messageId);
        }
      } else {
        // Create a message for individual user
        const messageId = await ctx.db.insert("messages", {
          senderId,
          recipientId,
          content,
          messageType,
          isRead: false,
          createdAt: Date.now(),
          metadata: {
            priority,
            attachedItems,
            isTeamMessage: false,
          },
        });

        messages.push(messageId);
      }
    }

    return messages;
  },
});

// Mark message as read
export const markMessageAsRead = mutation({
  args: {
    messageId: v.id("messages"),
  },
  handler: async (ctx, args) => {
    const { messageId } = args;

    await ctx.db.patch(messageId, {
      isRead: true,
      readAt: Date.now(),
    });

    return { success: true };
  },
});

// Mark all messages as read for a user
export const markAllMessagesAsRead = mutation({
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

      // Mark all unread messages from team members as read
      const unreadMessages = await ctx.db
        .query("messages")
        .withIndex("by_recipient_read", (q) => 
          q.eq("recipientId", userId).eq("isRead", false)
        )
        .collect();

      // Filter for team messages in JavaScript
      const teamUnreadMessages = unreadMessages.filter(msg => 
        teamUserIds.includes(msg.senderId as any)
      );

      for (const message of teamUnreadMessages) {
        await ctx.db.patch(message._id, {
          isRead: true,
          readAt: Date.now(),
        });
      }
    } else {
      // Mark all personal unread messages as read
      const unreadMessages = await ctx.db
        .query("messages")
        .withIndex("by_recipient_read", (q) => 
          q.eq("recipientId", userId).eq("isRead", false)
        )
        .collect();

      for (const message of unreadMessages) {
        await ctx.db.patch(message._id, {
          isRead: true,
          readAt: Date.now(),
        });
      }
    }

    return { success: true };
  },
});

// Delete a message
export const deleteMessage = mutation({
  args: {
    messageId: v.id("messages"),
  },
  handler: async (ctx, args) => {
    const { messageId } = args;

    await ctx.db.delete(messageId);

    return { success: true };
  },
}); 

// Mark message as read when viewed
export const markMessageAsReadOnView = mutation({
  args: {
    messageId: v.id("messages"),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const { messageId, userId } = args;

    const message = await ctx.db.get(messageId);
    if (!message) {
      throw new Error("Message not found");
    }

    // Only mark as read if the current user is the recipient
    if (message.recipientId === userId && !message.isRead) {
      await ctx.db.patch(messageId, {
        isRead: true,
        readAt: Date.now(),
      });
    }

    return { success: true };
  },
});

// Get message statistics for a user or team
export const getMessageStats = query({
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

      // Get all messages for the team
      const allMessages = await ctx.db
        .query("messages")
        .filter((q) => 
          q.or(
            q.and(
              q.eq(q.field("senderId"), userId),
              q.eq(q.field("recipientId"), teamUserIds[0] as string) // We'll filter the rest in JS
            ),
            q.and(
              q.eq(q.field("recipientId"), userId),
              q.eq(q.field("senderId"), teamUserIds[0] as string) // We'll filter the rest in JS
            )
          )
        )
        .collect();

      // Filter for all team users in JavaScript
      const filteredMessages = allMessages.filter(msg => 
        (msg.senderId === userId && teamUserIds.includes(msg.recipientId as any)) ||
        (msg.recipientId === userId && teamUserIds.includes(msg.senderId as any))
      );

      const stats = {
        total: filteredMessages.length,
        sent: filteredMessages.filter(msg => msg.senderId === userId).length,
        received: filteredMessages.filter(msg => msg.recipientId === userId).length,
        unread: filteredMessages.filter(msg => msg.recipientId === userId && !msg.isRead).length,
        urgent: filteredMessages.filter(msg => msg.metadata?.priority === 'urgent').length,
        high: filteredMessages.filter(msg => msg.metadata?.priority === 'high').length,
        medium: filteredMessages.filter(msg => msg.metadata?.priority === 'medium').length,
        low: filteredMessages.filter(msg => msg.metadata?.priority === 'low').length,
      };

      return stats;
    }

    // Get personal message statistics
    const allMessages = await ctx.db
      .query("messages")
      .filter((q) => 
        q.or(
          q.eq(q.field("senderId"), userId),
          q.eq(q.field("recipientId"), userId)
        )
      )
      .collect();

    const stats = {
      total: allMessages.length,
      sent: allMessages.filter(msg => msg.senderId === userId).length,
      received: allMessages.filter(msg => msg.recipientId === userId).length,
      unread: allMessages.filter(msg => msg.recipientId === userId && !msg.isRead).length,
      urgent: allMessages.filter(msg => msg.metadata?.priority === 'urgent').length,
      high: allMessages.filter(msg => msg.metadata?.priority === 'high').length,
      medium: allMessages.filter(msg => msg.metadata?.priority === 'medium').length,
      low: allMessages.filter(msg => msg.metadata?.priority === 'low').length,
    };

    return stats;
  },
}); 

// Seed demo messages for testing
export const seedDemoMessages = mutation({
  args: {},
  handler: async (ctx, args) => {
    // Get all users to use as senders and recipients
    const allUsers = await ctx.db.query("users").collect();
    
    if (allUsers.length === 0) {
      throw new Error("No users found. Please create demo users first.");
    }

    const demoMessages = [
      {
        content: "Priority order #PO-123 needs to be completed by end of shift. Please focus on quality standards.",
        priority: "urgent" as const,
        teamName: "production",
        senderName: "Mike Chen",
        recipientType: "team" as const,
      },
      {
        content: "Great work on the quality metrics this week! Keep up the excellent standards.",
        priority: "low" as const,
        teamName: "production",
        senderName: "Mike Chen",
        recipientType: "team" as const,
      },
      {
        content: "Machine #3 requires maintenance. Please report any issues immediately.",
        priority: "high" as const,
        teamName: "cutting",
        senderName: "Emma Davis",
        recipientType: "team" as const,
      },
      {
        content: "New cutting patterns uploaded. Please review and implement by tomorrow.",
        priority: "medium" as const,
        teamName: "cutting",
        senderName: "Emma Davis",
        recipientType: "team" as const,
      },
      {
        content: "Sewing machine #2 is running low on thread. Please refill before next batch.",
        priority: "medium" as const,
        teamName: "sewing",
        senderName: "Carlos Lopez",
        recipientType: "team" as const,
      },
      {
        content: "Excellent work on the last batch! Quality scores are at 98%.",
        priority: "low" as const,
        teamName: "sewing",
        senderName: "Carlos Lopez",
        recipientType: "team" as const,
      },
      {
        content: "Quality check required for items #ITEM-456, #ITEM-457, #ITEM-458.",
        priority: "high" as const,
        teamName: "quality",
        senderName: "Amanda White",
        recipientType: "team" as const,
      },
      {
        content: "New quality standards document uploaded. Please review by end of day.",
        priority: "medium" as const,
        teamName: "quality",
        senderName: "Amanda White",
        recipientType: "team" as const,
      },
      {
        content: "Packaging supplies running low. Please order more boxes and labels.",
        priority: "high" as const,
        teamName: "packaging",
        senderName: "Tom Anderson",
        recipientType: "team" as const,
      },
      {
        content: "Shipment scheduled for tomorrow at 2 PM. Please ensure all items are ready.",
        priority: "urgent" as const,
        teamName: "packaging",
        senderName: "Tom Anderson",
        recipientType: "team" as const,
      },
    ];

    const createdMessages = [];

    for (const demoMsg of demoMessages) {
      // Find sender by name
      const sender = allUsers.find(user => user.name === demoMsg.senderName);
      if (!sender) continue;

      // Find team members
      const teamMembers = allUsers.filter(user => user.team === demoMsg.teamName);
      if (teamMembers.length === 0) continue;

      // Create message for each team member (except sender)
      for (const recipient of teamMembers) {
        if (recipient._id === sender._id) continue; // Don't send to self

        const messageId = await ctx.db.insert("messages", {
          senderId: sender._id,
          recipientId: recipient._id,
          content: demoMsg.content,
          messageType: "text",
          isRead: Math.random() > 0.7, // 30% chance of being unread
          createdAt: Date.now() - Math.random() * 1000 * 60 * 60 * 24 * 7, // Random time in last 7 days
          readAt: Math.random() > 0.7 ? Date.now() - Math.random() * 1000 * 60 * 60 * 24 * 3 : undefined,
          metadata: {
            priority: demoMsg.priority,
            isTeamMessage: true,
            teamName: demoMsg.teamName,
          },
        });

        createdMessages.push({
          messageId,
          sender: sender.name,
          recipient: recipient.name,
          team: demoMsg.teamName,
          content: demoMsg.content,
          priority: demoMsg.priority,
        });
      }
    }

    return createdMessages;
  },
}); 