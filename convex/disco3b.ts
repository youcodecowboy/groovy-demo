import { mutation, query, action } from "./_generated/server"
import { v } from "convex/values"
import { resolveOrgId } from "./util"

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
    
    return await ctx.db.insert("messages", {
      orgId,
      factoryId: args.factoryId,
      to: args.to,
      from: args.from,
      text: args.text,
      type: args.type,
      priority: args.priority,
      read: false,
      createdAt: Date.now(),
    })
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
        q.eq(q.field("to"), args.userId),
        q.eq(q.field("from"), args.userId)
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

// Escalations operations
export const createEscalation = mutation({
  args: {
    factoryId: v.string(),
    kind: v.union(v.literal("report"), v.literal("analysis"), v.literal("workflow")),
    details: v.string(),
    requester: v.string(),
    assignedTo: v.optional(v.string()),
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
      assignedTo: args.assignedTo,
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
    
    return await ctx.db.insert("chatTurns", {
      orgId,
      factoryId: args.factoryId,
      userId: args.userId,
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