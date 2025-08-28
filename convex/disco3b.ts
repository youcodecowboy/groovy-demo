import { mutation, query, action } from "./_generated/server"
import { v } from "convex/values"
import { resolveOrgId, getOrgId } from "./util"

// RecordsEnriched operations
export const createEnrichedRecord = mutation({
  args: {
    factoryId: v.string(),
    originalText: v.string(),
    scanType: v.union(v.literal("qr"), v.literal("barcode"), v.literal("manual"), v.literal("note")),
    enrichment: v.object({
      labels: v.array(v.string()),
      entities: v.array(v.string()),
      fields: v.optional(v.object({
        sku: v.optional(v.string()),
        po_number: v.optional(v.string()),
        stage: v.optional(v.string()),
        location: v.optional(v.string()),
        quantity: v.optional(v.number()),
        eta: v.optional(v.string()),
        priority: v.optional(v.union(v.literal("LOW"), v.literal("MEDIUM"), v.literal("HIGH"), v.literal("CRITICAL"))),
        assigned_to: v.optional(v.string()),
      })),
    }),
    anomaly: v.optional(v.object({
      is_anomaly: v.boolean(),
      severity: v.optional(v.union(v.literal("INFO"), v.literal("WARN"), v.literal("CRITICAL"))),
      reason: v.optional(v.string()),
      confidence: v.number(),
      metrics: v.optional(v.any()),
    })),
    embeddingId: v.optional(v.id("embeddings")),
    userId: v.string(),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const orgId = await resolveOrgId(ctx)
    
    return await ctx.db.insert("recordsEnriched", {
      orgId,
      factoryId: args.factoryId,
      originalText: args.originalText,
      scanType: args.scanType,
      enrichment: args.enrichment,
      anomaly: args.anomaly,
      embeddingId: args.embeddingId,
      userId: args.userId,
      createdAt: Date.now(),
      metadata: args.metadata,
    })
  }
})

export const getEnrichedRecords = query({
  args: {
    factoryId: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const orgId = await resolveOrgId(ctx)
    
    return await ctx.db
      .query("recordsEnriched")
      .withIndex("by_factory", (q) => q.eq("factoryId", args.factoryId))
      .filter((q) => q.eq(q.field("orgId"), orgId))
      .order("desc")
      .take(args.limit ?? 50)
  }
})

export const searchEnrichedRecords = action({
  args: {
    factoryId: v.string(),
    query: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const orgId = await resolveOrgId(ctx)
    
    return await ctx.db
      .search("recordsEnriched", "search_text")
      .search(args.query)
      .filter((q) => q.and(
        q.eq(q.field("factoryId"), args.factoryId),
        q.eq(q.field("orgId"), orgId)
      ))
      .take(args.limit ?? 10)
  }
})

// Embeddings operations
export const createEmbedding = mutation({
  args: {
    docId: v.string(),
    factoryId: v.string(),
    embedding: v.array(v.number()),
    text: v.string(),
    metadata: v.optional(v.any()),
    model: v.string(),
  },
  handler: async (ctx, args) => {
    const orgId = await resolveOrgId(ctx)
    
    return await ctx.db.insert("embeddings", {
      orgId,
      docId: args.docId,
      factoryId: args.factoryId,
      embedding: args.embedding,
      text: args.text,
      metadata: args.metadata,
      model: args.model,
      createdAt: Date.now(),
    })
  }
})

export const searchEmbeddings = action({
  args: {
    factoryId: v.string(),
    embedding: v.array(v.number()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const orgId = await resolveOrgId(ctx)
    
    return await ctx.db
      .vectorSearch("embeddings", "by_embedding", {
        vector: args.embedding,
        limit: args.limit ?? 10,
        filter: (q) => q.and(
          q.eq(q.field("factoryId"), args.factoryId),
          q.eq(q.field("orgId"), orgId)
        )
      })
  }
})

// Messages operations
export const createMessage = mutation({
  args: {
    factoryId: v.string(),
    to: v.string(),
    from: v.string(),
    text: v.string(),
    type: v.union(v.literal("user"), v.literal("system"), v.literal("automated")),
    priority: v.optional(v.union(v.literal("LOW"), v.literal("MEDIUM"), v.literal("HIGH"), v.literal("CRITICAL"))),
  },
  handler: async (ctx, args) => {
    const orgId = await resolveOrgId(ctx)
    
    // Create the message
    const messageId = await ctx.db.insert("messages", {
      orgId,
      factoryId: args.factoryId,
      senderId: args.from,
      recipientId: args.to,
      content: args.text,
      messageType: "text",
      isRead: false,
      createdAt: Date.now(),
      metadata: {
        priority: args.priority,
        originalType: args.type
      }
    })

    // Create a notification for the recipient if this is from disco chatbot
    if (args.type === "automated" || args.from.includes("disco")) {
      const priority = args.priority === "CRITICAL" ? "urgent" : 
                      args.priority === "HIGH" ? "high" : 
                      args.priority === "MEDIUM" ? "medium" : "low"
      
      // Check notification preferences before sending
      const shouldSend = await ctx.db
        .query("discoNotificationPreferences")
        .withIndex("by_factory", (q: any) => q.eq("factoryId", args.factoryId))
        .filter((q: any) => q.eq(q.field("orgId"), orgId))
        .first()
        .then(prefs => {
          if (!prefs || !prefs.notificationsEnabled) return false
          
          // Check if general messages are enabled
          if (!prefs.notificationTypes.general_messages) return false
          
          // Check priority threshold
          const priorityLevels = { low: 1, medium: 2, high: 3, urgent: 4 }
          const notificationPriority = priorityLevels[priority]
          const thresholdPriority = priorityLevels[prefs.priorityThreshold]
          
          if (notificationPriority < thresholdPriority) return false
          
          // Check quiet hours
          if (prefs.quietHoursEnabled) {
            const currentDate = new Date()
            const currentHour = currentDate.getHours()
            const currentMinute = currentDate.getMinutes()
            const currentTimeMinutes = currentHour * 60 + currentMinute

            const [startHour, startMinute] = (prefs.quietHoursStart || "22:00").split(':').map(Number)
            const [endHour, endMinute] = (prefs.quietHoursEnd || "06:00").split(':').map(Number)
            const startTimeMinutes = startHour * 60 + startMinute
            const endTimeMinutes = endHour * 60 + endMinute

            // Handle overnight quiet hours
            if (startTimeMinutes > endTimeMinutes) {
              if (currentTimeMinutes >= startTimeMinutes || currentTimeMinutes <= endTimeMinutes) {
                return priority === "urgent"
              }
            } else {
              if (currentTimeMinutes >= startTimeMinutes && currentTimeMinutes <= endTimeMinutes) {
                return priority === "urgent"
              }
            }
          }
          
          return true
        })
      
      if (shouldSend) {
        await ctx.db.insert("notifications", {
          orgId,
          userId: args.to,
          type: "message_received",
          title: "New Message from Disco",
          message: args.text.length > 100 ? args.text.substring(0, 100) + "..." : args.text,
          senderId: args.from,
          isRead: false,
          priority,
          createdAt: Date.now(),
          metadata: {
            messageId,
            source: "disco_chat",
            factoryId: args.factoryId
          }
        })
      }
    }

    return messageId
  }
})

export const getMessages = query({
  args: {
    factoryId: v.string(),
    userId: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const orgId = await resolveOrgId(ctx)
    
    let query = ctx.db
      .query("messages")
      .withIndex("by_factory", (q) => q.eq("factoryId", args.factoryId))
      .filter((q) => q.eq(q.field("orgId"), orgId))
    
    if (args.userId) {
      query = query.filter((q) => q.or(
        q.eq(q.field("recipientId"), args.userId),
        q.eq(q.field("senderId"), args.userId)
      ))
    }
    
    return await query
      .order("desc")
      .take(args.limit ?? 50)
  }
})

// Alerts operations
export const createAlert = mutation({
  args: {
    factoryId: v.string(),
    level: v.union(v.literal("INFO"), v.literal("WARN"), v.literal("CRITICAL")),
    title: v.string(),
    details: v.string(),
    owner: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const orgId = await resolveOrgId(ctx)
    
    return await ctx.db.insert("alerts", {
      orgId,
      factoryId: args.factoryId,
      level: args.level,
      title: args.title,
      details: args.details,
      owner: args.owner,
      status: "open",
      createdAt: Date.now(),
    })
  }
})

export const getAlerts = query({
  args: {
    factoryId: v.string(),
    status: v.optional(v.union(v.literal("open"), v.literal("acknowledged"), v.literal("resolved"))),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const orgId = await resolveOrgId(ctx)
    
    let query = ctx.db
      .query("alerts")
      .withIndex("by_factory", (q) => q.eq("factoryId", args.factoryId))
      .filter((q) => q.eq(q.field("orgId"), orgId))
    
    if (args.status) {
      query = query.filter((q) => q.eq(q.field("status"), args.status))
    }
    
    return await query
      .order("desc")
      .take(args.limit ?? 50)
  }
})

// Escalations operations
export const createEscalation = mutation({
  args: {
    factoryId: v.string(),
    kind: v.union(v.literal("report"), v.literal("analysis"), v.literal("workflow")),
    details: v.string(),
    requester: v.string(),
  },
  handler: async (ctx, args) => {
    const orgId = await resolveOrgId(ctx)
    
    return await ctx.db.insert("escalations", {
      orgId,
      factoryId: args.factoryId,
      kind: args.kind,
      details: args.details,
      requester: args.requester,
      status: "open",
      createdAt: Date.now(),
    })
  }
})

export const getEscalations = query({
  args: {
    factoryId: v.string(),
    status: v.optional(v.union(v.literal("open"), v.literal("in_progress"), v.literal("done"))),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const orgId = await resolveOrgId(ctx)
    
    let query = ctx.db
      .query("escalations")
      .withIndex("by_factory", (q) => q.eq("factoryId", args.factoryId))
      .filter((q) => q.eq(q.field("orgId"), orgId))
    
    if (args.status) {
      query = query.filter((q) => q.eq(q.field("status"), args.status))
    }
    
    return await query
      .order("desc")
      .take(args.limit ?? 50)
  }
})

export const resolveAlert = mutation({
  args: {
    alertId: v.id("alerts"),
    resolvedBy: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.patch(args.alertId, {
      status: "resolved",
      resolvedAt: Date.now(),
      resolvedBy: args.resolvedBy,
    })
  }
})



// Chat operations
export const createChatTurn = mutation({
  args: {
    factoryId: v.string(),
    userId: v.string(),
    question: v.string(),
    answer: v.string(),
    citations: v.array(v.string()),
    enrichment: v.object({
      labels: v.array(v.string()),
      entities: v.array(v.string()),
      fields: v.optional(v.any()),
    }),
    retrievedIds: v.optional(v.array(v.string())),
    confidence: v.number(),
  },
  handler: async (ctx, args) => {
    const orgId = await resolveOrgId(ctx)
    
    // Get or create active session
    let session = await ctx.db
      .query("chatSessions")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) => q.and(
        q.eq(q.field("factoryId"), args.factoryId),
        q.eq(q.field("isActive"), true)
      ))
      .first()

    if (!session) {
      // Create new session
      const sessionId = await ctx.db.insert("chatSessions", {
        orgId,
        factoryId: args.factoryId,
        userId: args.userId,
        title: `Chat ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`,
        messageCount: 1,
        lastMessageAt: Date.now(),
        createdAt: Date.now(),
        isActive: true,
      })
      session = { _id: sessionId, messageCount: 1 }
    } else {
      // Update existing session
      await ctx.db.patch(session._id, {
        messageCount: session.messageCount + 1,
        lastMessageAt: Date.now(),
      })
    }

    return await ctx.db.insert("chatTurns", {
      orgId,
      factoryId: args.factoryId,
      userId: args.userId,
      sessionId: session._id,
      question: args.question,
      answer: args.answer,
      citations: args.citations,
      enrichment: args.enrichment,
      retrievedIds: args.retrievedIds,
      confidence: args.confidence,
      createdAt: Date.now(),
    })
  }
})

export const getChatHistory = query({
  args: {
    factoryId: v.string(),
    userId: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const orgId = await resolveOrgId(ctx)
    
    return await ctx.db
      .query("chatTurns")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) => q.and(
        q.eq(q.field("orgId"), orgId),
        q.eq(q.field("factoryId"), args.factoryId)
      ))
      .order("desc")
      .take(args.limit ?? 20)
  }
})

export const getChatSessions = query({
  args: {
    factoryId: v.string(),
    userId: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const orgId = await resolveOrgId(ctx)
    
    return await ctx.db
      .query("chatSessions")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) => q.and(
        q.eq(q.field("orgId"), orgId),
        q.eq(q.field("factoryId"), args.factoryId)
      ))
      .order("desc")
      .take(args.limit ?? 20)
  }
})

export const getChatSessionTurns = query({
  args: {
    sessionId: v.id("chatSessions"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("chatTurns")
      .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
      .order("asc")
      .collect()
  }
})

export const createNewChatSession = mutation({
  args: {
    factoryId: v.string(),
    userId: v.string(),
    title: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const orgId = await resolveOrgId(ctx)
    
    // Deactivate current active session
    const currentSession = await ctx.db
      .query("chatSessions")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) => q.and(
        q.eq(q.field("factoryId"), args.factoryId),
        q.eq(q.field("isActive"), true)
      ))
      .first()
    
    if (currentSession) {
      await ctx.db.patch(currentSession._id, { isActive: false })
    }
    
    // Create new session
    return await ctx.db.insert("chatSessions", {
      orgId,
      factoryId: args.factoryId,
      userId: args.userId,
      title: args.title || `Chat ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`,
      messageCount: 0,
      lastMessageAt: Date.now(),
      createdAt: Date.now(),
      isActive: true,
    })
  }
})

export const updateChatSessionTitle = mutation({
  args: {
    sessionId: v.id("chatSessions"),
    title: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.patch(args.sessionId, {
      title: args.title,
    })
  }
})

// Context retrieval for chat
export const getLatestContext = query({
  args: {
    factoryId: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const orgId = await resolveOrgId(ctx)
    
    // Get recent enriched records
    const enrichedRecords = await ctx.db
      .query("recordsEnriched")
      .withIndex("by_factory", (q) => q.eq("factoryId", args.factoryId))
      .filter((q) => q.eq(q.field("orgId"), orgId))
      .order("desc")
      .take(args.limit ?? 10)

    // Get recent alerts
    const alerts = await ctx.db
      .query("alerts")
      .withIndex("by_factory", (q) => q.eq("factoryId", args.factoryId))
      .filter((q) => q.and(
        q.eq(q.field("orgId"), orgId),
        q.neq(q.field("status"), "resolved")
      ))
      .order("desc")
      .take(5)

    // Get recent escalations
    const escalations = await ctx.db
      .query("escalations")
      .withIndex("by_factory", (q) => q.eq("factoryId", args.factoryId))
      .filter((q) => q.and(
        q.eq(q.field("orgId"), orgId),
        q.neq(q.field("status"), "done")
      ))
      .order("desc")
      .take(5)

    return {
      enrichedRecords,
      alerts,
      escalations,
    }
  }
})

// Comprehensive factory data retrieval for Disco
export const getFactoryData = query({
  args: {
    factoryId: v.string(),
  },
  handler: async (ctx, args) => {
    const orgId = await resolveOrgId(ctx)
    
    // Get active purchase orders
    const purchaseOrders = await ctx.db
      .query("purchaseOrders")
      .withIndex("by_factory", (q) => q.eq("factoryId", args.factoryId))
      .filter((q) => q.and(
        q.eq(q.field("orgId"), orgId),
        q.neq(q.field("status"), "completed"),
        q.neq(q.field("status"), "cancelled")
      ))
      .order("desc")
      .take(20)

    // Get active items by stage
    const items = await ctx.db
      .query("items")
      .withIndex("by_factory", (q) => q.eq("factoryId", args.factoryId))
      .filter((q) => q.and(
        q.eq(q.field("orgId"), orgId),
        q.neq(q.field("status"), "completed")
      ))
      .order("desc")
      .take(100)

    // Get recent scans (scans table doesn't have factoryId, so we'll get all recent scans)
    const scans = await ctx.db
      .query("scans")
      .filter((q) => q.eq(q.field("orgId"), orgId))
      .order("desc")
      .take(50)

    // Get item history for tracking (itemHistory table doesn't have factoryId index)
    const itemHistory = await ctx.db
      .query("itemHistory")
      .filter((q) => q.eq(q.field("orgId"), orgId))
      .order("desc")
      .take(100)

    // Get active alerts
    const alerts = await ctx.db
      .query("alerts")
      .withIndex("by_factory", (q) => q.eq("factoryId", args.factoryId))
      .filter((q) => q.and(
        q.eq(q.field("orgId"), orgId),
        q.neq(q.field("status"), "resolved")
      ))
      .order("desc")
      .take(10)

    // Get recent enriched records
    const enrichedRecords = await ctx.db
      .query("recordsEnriched")
      .withIndex("by_factory", (q) => q.eq("factoryId", args.factoryId))
      .filter((q) => q.eq(q.field("orgId"), orgId))
      .order("desc")
      .take(20)

    // Extract purchase order data from enriched records metadata
    const extractedPurchaseOrders = enrichedRecords
      .filter(record => record.metadata?.purchaseOrder)
      .map(record => ({
        _id: record._id,
        poNumber: record.metadata.purchaseOrder.poNumber,
        status: record.metadata.purchaseOrder.status,
        items: record.metadata.purchaseOrder.items,
        totalValue: record.metadata.purchaseOrder.totalValue,
        progress: record.metadata.purchaseOrder.progress,
        requestedDeliveryDate: Date.now() + (7 * 24 * 60 * 60 * 1000), // Default to 7 days from now
        submittedAt: Date.now(),
      }))
      .filter((po, index, arr) => arr.findIndex(p => p.poNumber === po.poNumber) === index) // Remove duplicates

    return {
      purchaseOrders: [...purchaseOrders, ...extractedPurchaseOrders],
      items,
      scans,
      itemHistory,
      alerts,
      enrichedRecords,
    }
  }
})

// Get specific order details
export const getOrderDetails = query({
  args: {
    factoryId: v.string(),
    orderId: v.optional(v.string()),
    poNumber: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const orgId = await resolveOrgId(ctx)
    
    let query = ctx.db
      .query("purchaseOrders")
      .withIndex("by_factory", (q) => q.eq("factoryId", args.factoryId))
      .filter((q) => q.eq(q.field("orgId"), orgId))

    if (args.orderId) {
      query = query.filter((q) => q.eq(q.field("_id"), args.orderId))
    } else if (args.poNumber) {
      query = query.filter((q) => q.eq(q.field("poNumber"), args.poNumber))
    }

    const order = await query.first()
    
    if (!order) {
      return null
    }

    // Get items for this order
    const orderItems = await ctx.db
      .query("items")
      .withIndex("by_po", (q) => q.eq("purchaseOrderId", order._id))
      .filter((q) => q.eq(q.field("orgId"), orgId))
      .order("desc")
      .take(100)

    return {
      order,
      items: orderItems,
    }
  }
})

// Get items by stage
export const getItemsByStage = query({
  args: {
    factoryId: v.string(),
    stageId: v.optional(v.string()),
    status: v.optional(v.union(v.literal("active"), v.literal("paused"), v.literal("error"), v.literal("completed"))),
  },
  handler: async (ctx, args) => {
    const orgId = await resolveOrgId(ctx)
    
    let query = ctx.db
      .query("items")
      .withIndex("by_factory", (q) => q.eq("factoryId", args.factoryId))
      .filter((q) => q.eq(q.field("orgId"), orgId))

    if (args.stageId) {
      query = query.filter((q) => q.eq(q.field("currentStageId"), args.stageId))
    }

    if (args.status) {
      query = query.filter((q) => q.eq(q.field("status"), args.status))
    }

    return await query.order("desc").take(100)
  }
})

// Get all purchase orders (for debugging)
export const getAllPurchaseOrders = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("purchaseOrders")
      .order("desc")
      .take(100)
  }
})

// Feedback operations
export const createFeedback = mutation({
  args: {
    factoryId: v.string(),
    recordId: v.string(),
    userId: v.string(),
    type: v.union(v.literal("thumbs_up"), v.literal("thumbs_down"), v.literal("correction")),
    feedback: v.optional(v.string()),
    correction: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const orgId = await resolveOrgId(ctx)
    
    return await ctx.db.insert("feedback", {
      orgId,
      factoryId: args.factoryId,
      recordId: args.recordId,
      userId: args.userId,
      type: args.type,
      feedback: args.feedback,
      correction: args.correction,
      createdAt: Date.now(),
    })
  }
})

// Disco notification preferences
export const createNotificationPreferences = mutation({
  args: {
    factoryId: v.string(),
    notificationsEnabled: v.boolean(),
    notificationFrequency: v.union(
      v.literal("immediate"),
      v.literal("batched"),
      v.literal("hourly"),
      v.literal("daily")
    ),
    batchInterval: v.optional(v.number()),
    quietHoursEnabled: v.optional(v.boolean()),
    quietHoursStart: v.optional(v.string()),
    quietHoursEnd: v.optional(v.string()),
    defaultRecipient: v.string(),
    notificationTypes: v.object({
      quality_issues: v.boolean(),
      production_updates: v.boolean(),
      machine_alerts: v.boolean(),
      inventory_alerts: v.boolean(),
      schedule_changes: v.boolean(),
      general_messages: v.boolean(),
    }),
    priorityThreshold: v.union(
      v.literal("low"),
      v.literal("medium"),
      v.literal("high"),
      v.literal("urgent")
    ),
  },
  handler: async (ctx, args) => {
    // For now, use a default org ID since we don't have the resolveOrgId function
    const orgId = "demo-org"
    
    // Check if preferences already exist for this factory
    const existing = await ctx.db
      .query("discoNotificationPreferences")
      .withIndex("by_factory", (q: any) => q.eq("factoryId", args.factoryId))
      .filter((q: any) => q.eq(q.field("orgId"), orgId))
      .first()

    if (existing) {
      // Update existing preferences
      return await ctx.db.patch(existing._id, {
        notificationsEnabled: args.notificationsEnabled,
        notificationFrequency: args.notificationFrequency,
        batchInterval: args.batchInterval,
        quietHoursEnabled: args.quietHoursEnabled,
        quietHoursStart: args.quietHoursStart,
        quietHoursEnd: args.quietHoursEnd,
        defaultRecipient: args.defaultRecipient,
        notificationTypes: args.notificationTypes,
        priorityThreshold: args.priorityThreshold,
        updatedAt: Date.now(),
      })
    } else {
      // Create new preferences
      return await ctx.db.insert("discoNotificationPreferences", {
        orgId,
        factoryId: args.factoryId,
        notificationsEnabled: args.notificationsEnabled,
        notificationFrequency: args.notificationFrequency,
        batchInterval: args.batchInterval,
        quietHoursEnabled: args.quietHoursEnabled,
        quietHoursStart: args.quietHoursStart,
        quietHoursEnd: args.quietHoursEnd,
        defaultRecipient: args.defaultRecipient,
        notificationTypes: args.notificationTypes,
        priorityThreshold: args.priorityThreshold,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      })
    }
  }
})

export const getNotificationPreferences = query({
  args: {
    factoryId: v.string(),
  },
  handler: async (ctx, args) => {
    // For now, use a default org ID since we don't have the resolveOrgId function
    const orgId = "demo-org"
    
    const preferences = await ctx.db
      .query("discoNotificationPreferences")
      .withIndex("by_factory", (q: any) => q.eq("factoryId", args.factoryId))
      .filter((q: any) => q.eq(q.field("orgId"), orgId))
      .first()

    if (!preferences) {
      // Return default preferences
      return {
        notificationsEnabled: true,
        notificationFrequency: "immediate" as const,
        batchInterval: 15,
        quietHoursEnabled: false,
        quietHoursStart: "22:00",
        quietHoursEnd: "06:00",
        defaultRecipient: "admin@demo",
        notificationTypes: {
          quality_issues: true,
          production_updates: true,
          machine_alerts: true,
          inventory_alerts: true,
          schedule_changes: true,
          general_messages: false,
        },
        priorityThreshold: "medium" as const,
      }
    }

    return preferences
  }
})

// Check if notification should be sent based on preferences
export const shouldSendNotification = query({
  args: {
    factoryId: v.string(),
    notificationType: v.string(),
    priority: v.union(v.literal("low"), v.literal("medium"), v.literal("high"), v.literal("urgent")),
    currentTime: v.number(),
  },
  handler: async (ctx, args) => {
    // For now, use a default org ID since we don't have the resolveOrgId function
    const orgId = "demo-org"
    
    const preferences = await ctx.db
      .query("discoNotificationPreferences")
      .withIndex("by_factory", (q: any) => q.eq("factoryId", args.factoryId))
      .filter((q: any) => q.eq(q.field("orgId"), orgId))
      .first()

    if (!preferences || !preferences.notificationsEnabled) {
      return false
    }

    // Check notification type
    const typeKey = args.notificationType.replace(' ', '_') as keyof typeof preferences.notificationTypes
    if (!preferences.notificationTypes[typeKey]) {
      return false
    }

    // Check priority threshold
    const priorityLevels = { low: 1, medium: 2, high: 3, urgent: 4 }
    const notificationPriority = priorityLevels[args.priority]
    const thresholdPriority = priorityLevels[preferences.priorityThreshold]
    
    if (notificationPriority < thresholdPriority) {
      return false
    }

    // Check quiet hours
    if (preferences.quietHoursEnabled) {
      const currentDate = new Date(args.currentTime)
      const currentHour = currentDate.getHours()
      const currentMinute = currentDate.getMinutes()
      const currentTimeMinutes = currentHour * 60 + currentMinute

      const [startHour, startMinute] = preferences.quietHoursStart.split(':').map(Number)
      const [endHour, endMinute] = preferences.quietHoursEnd.split(':').map(Number)
      const startTimeMinutes = startHour * 60 + startMinute
      const endTimeMinutes = endHour * 60 + endMinute

      // Handle overnight quiet hours
      if (startTimeMinutes > endTimeMinutes) {
        // Quiet hours span midnight (e.g., 22:00 to 06:00)
        if (currentTimeMinutes >= startTimeMinutes || currentTimeMinutes <= endTimeMinutes) {
          // Only allow urgent notifications during quiet hours
          return args.priority === "urgent"
        }
      } else {
        // Quiet hours within same day
        if (currentTimeMinutes >= startTimeMinutes && currentTimeMinutes <= endTimeMinutes) {
          // Only allow urgent notifications during quiet hours
          return args.priority === "urgent"
        }
      }
    }

    return true
  }
})
