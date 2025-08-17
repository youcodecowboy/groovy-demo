import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { resolveOrgId } from "./util";

// ===== CUSTOMER FUNCTIONS =====

// Get all customers
export const getAll = query({
  args: {},
  handler: async (ctx) => {
    const orgId = await resolveOrgId(ctx);
    return await ctx.db
      .query("customers")
      .filter((q) => q.eq(q.field("orgId"), orgId))
      .order("desc")
      .collect();
  },
});

// Get customers by status
export const getByStatus = query({
  args: { status: v.union(v.literal("active"), v.literal("inactive"), v.literal("prospect"), v.literal("lead")) },
  handler: async (ctx, args) => {
    const orgId = await resolveOrgId(ctx);
    return await ctx.db
      .query("customers")
      .filter((q) => q.and(
        q.eq(q.field("orgId"), orgId),
        q.eq(q.field("status"), args.status)
      ))
      .order("desc")
      .collect();
  },
});

// Get customer by ID
export const getById = query({
  args: { id: v.id("customers") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Create a new customer
export const create = mutation({
  args: {
    name: v.string(),
    companyName: v.optional(v.string()),
    status: v.union(v.literal("active"), v.literal("inactive"), v.literal("prospect"), v.literal("lead")),
    type: v.union(v.literal("individual"), v.literal("business"), v.literal("enterprise")),
    industry: v.optional(v.string()),
    website: v.optional(v.string()),
    phone: v.optional(v.string()),
    email: v.optional(v.string()),
    address: v.optional(v.object({
      street: v.string(),
      city: v.string(),
      state: v.string(),
      zipCode: v.string(),
      country: v.string(),
    })),
    notes: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    assignedTo: v.optional(v.string()),
    source: v.optional(v.string()),
    value: v.optional(v.number()),
    createdBy: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const orgId = await resolveOrgId(ctx);
    return await ctx.db.insert("customers", {
      orgId,
      name: args.name,
      companyName: args.companyName,
      status: args.status,
      type: args.type,
      industry: args.industry,
      website: args.website,
      phone: args.phone,
      email: args.email,
      address: args.address,
      notes: args.notes,
      tags: args.tags,
      assignedTo: args.assignedTo,
      source: args.source,
      value: args.value,
      isActive: true,
      createdAt: now,
      updatedAt: now,
      createdBy: args.createdBy,
    });
  },
});

// Update customer
export const update = mutation({
  args: {
    id: v.id("customers"),
    name: v.optional(v.string()),
    companyName: v.optional(v.string()),
    status: v.optional(v.union(v.literal("active"), v.literal("inactive"), v.literal("prospect"), v.literal("lead"))),
    type: v.optional(v.union(v.literal("individual"), v.literal("business"), v.literal("enterprise"))),
    industry: v.optional(v.string()),
    website: v.optional(v.string()),
    phone: v.optional(v.string()),
    email: v.optional(v.string()),
    address: v.optional(v.object({
      street: v.string(),
      city: v.string(),
      state: v.string(),
      zipCode: v.string(),
      country: v.string(),
    })),
    notes: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    assignedTo: v.optional(v.string()),
    source: v.optional(v.string()),
    value: v.optional(v.number()),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    return await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    });
  },
});

// Delete customer
export const remove = mutation({
  args: { id: v.id("customers") },
  handler: async (ctx, args) => {
    // Check if customer has any interactions
    const interactions = await ctx.db
      .query("customerInteractions")
      .filter((q) => q.eq(q.field("customerId"), args.id))
      .collect();
    
    if (interactions.length > 0) {
      throw new Error(`Cannot delete customer: ${interactions.length} interaction(s) exist. Please delete interactions first.`);
    }
    
    // Delete all contacts for this customer
    const contacts = await ctx.db
      .query("customerContacts")
      .filter((q) => q.eq(q.field("customerId"), args.id))
      .collect();
    
    for (const contact of contacts) {
      await ctx.db.delete(contact._id);
    }
    
    await ctx.db.delete(args.id);
  },
});

// ===== CUSTOMER CONTACTS FUNCTIONS =====

// Get contacts for a customer
export const getContacts = query({
  args: { customerId: v.id("customers") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("customerContacts")
      .filter((q) => q.eq(q.field("customerId"), args.customerId))
      .order("desc")
      .collect();
  },
});

// Create a new contact
export const createContact = mutation({
  args: {
    customerId: v.id("customers"),
    firstName: v.string(),
    lastName: v.string(),
    title: v.optional(v.string()),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    mobile: v.optional(v.string()),
    isPrimary: v.boolean(),
    department: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const orgId = await resolveOrgId(ctx);
    
    // If this is a primary contact, unset other primary contacts for this customer
    if (args.isPrimary) {
      const existingPrimary = await ctx.db
        .query("customerContacts")
        .filter((q) => q.and(
          q.eq(q.field("customerId"), args.customerId),
          q.eq(q.field("isPrimary"), true)
        ))
        .collect();
      
      for (const contact of existingPrimary) {
        await ctx.db.patch(contact._id, { isPrimary: false, updatedAt: now });
      }
    }
    
    return await ctx.db.insert("customerContacts", {
      orgId,
      customerId: args.customerId,
      firstName: args.firstName,
      lastName: args.lastName,
      title: args.title,
      email: args.email,
      phone: args.phone,
      mobile: args.mobile,
      isPrimary: args.isPrimary,
      department: args.department,
      notes: args.notes,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });
  },
});

// Update contact
export const updateContact = mutation({
  args: {
    id: v.id("customerContacts"),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    title: v.optional(v.string()),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    mobile: v.optional(v.string()),
    isPrimary: v.optional(v.boolean()),
    department: v.optional(v.string()),
    notes: v.optional(v.string()),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    const now = Date.now();
    
    // If setting as primary, unset other primary contacts
    if (updates.isPrimary) {
      const contact = await ctx.db.get(id);
      if (contact) {
        const existingPrimary = await ctx.db
          .query("customerContacts")
          .filter((q) => q.and(
            q.eq(q.field("customerId"), contact.customerId),
            q.eq(q.field("isPrimary"), true)
          ))
          .collect();
        
        for (const primaryContact of existingPrimary) {
          if (primaryContact._id !== id) {
            await ctx.db.patch(primaryContact._id, { isPrimary: false, updatedAt: now });
          }
        }
      }
    }
    
    return await ctx.db.patch(id, {
      ...updates,
      updatedAt: now,
    });
  },
});

// Delete contact
export const removeContact = mutation({
  args: { id: v.id("customerContacts") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

// ===== CUSTOMER INTERACTIONS FUNCTIONS =====

// Get interactions for a customer
export const getInteractions = query({
  args: { customerId: v.id("customers") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("customerInteractions")
      .filter((q) => q.eq(q.field("customerId"), args.customerId))
      .order("desc")
      .collect();
  },
});

// Create a new interaction
export const createInteraction = mutation({
  args: {
    customerId: v.id("customers"),
    contactId: v.optional(v.id("customerContacts")),
    type: v.union(v.literal("call"), v.literal("email"), v.literal("meeting"), v.literal("note"), v.literal("quote"), v.literal("order"), v.literal("support")),
    subject: v.string(),
    description: v.string(),
    outcome: v.optional(v.string()),
    followUpRequired: v.boolean(),
    followUpDate: v.optional(v.number()),
    assignedTo: v.string(),
    createdBy: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const orgId = await resolveOrgId(ctx);
    
    // Update customer's lastContact timestamp
    await ctx.db.patch(args.customerId, {
      lastContact: now,
      updatedAt: now,
    });
    
    return await ctx.db.insert("customerInteractions", {
      orgId,
      customerId: args.customerId,
      contactId: args.contactId,
      type: args.type,
      subject: args.subject,
      description: args.description,
      outcome: args.outcome,
      followUpRequired: args.followUpRequired,
      followUpDate: args.followUpDate,
      assignedTo: args.assignedTo,
      createdAt: now,
      createdBy: args.createdBy,
    });
  },
});

// Update interaction
export const updateInteraction = mutation({
  args: {
    id: v.id("customerInteractions"),
    subject: v.optional(v.string()),
    description: v.optional(v.string()),
    outcome: v.optional(v.string()),
    followUpRequired: v.optional(v.boolean()),
    followUpDate: v.optional(v.number()),
    assignedTo: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    return await ctx.db.patch(id, updates);
  },
});

// Delete interaction
export const removeInteraction = mutation({
  args: { id: v.id("customerInteractions") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

// ===== ANALYTICS FUNCTIONS =====

// Get customer statistics
export const getStats = query({
  args: {},
  handler: async (ctx) => {
    const orgId = await resolveOrgId(ctx);
    
    const allCustomers = await ctx.db
      .query("customers")
      .filter((q) => q.eq(q.field("orgId"), orgId))
      .collect();
    
    const activeCustomers = allCustomers.filter(c => c.status === "active").length;
    const prospects = allCustomers.filter(c => c.status === "prospect").length;
    const leads = allCustomers.filter(c => c.status === "lead").length;
    const inactiveCustomers = allCustomers.filter(c => c.status === "inactive").length;
    
    const totalValue = allCustomers.reduce((sum, customer) => sum + (customer.value || 0), 0);
    
    return {
      total: allCustomers.length,
      active: activeCustomers,
      prospects,
      leads,
      inactive: inactiveCustomers,
      totalValue,
    };
  },
});

// Get customers requiring follow-up
export const getFollowUpRequired = query({
  args: {},
  handler: async (ctx) => {
    const orgId = await resolveOrgId(ctx);
    const now = Date.now();
    const oneWeekFromNow = now + (7 * 24 * 60 * 60 * 1000); // 7 days from now
    
    // Get customers with follow-up dates in the next week
    const customersWithFollowUp = await ctx.db
      .query("customers")
      .filter((q) => q.and(
        q.eq(q.field("orgId"), orgId),
        q.neq(q.field("nextFollowUp"), undefined),
        q.lte(q.field("nextFollowUp"), oneWeekFromNow)
      ))
      .collect();
    
    // Get interactions with follow-up required
    const interactionsWithFollowUp = await ctx.db
      .query("customerInteractions")
      .filter((q) => q.and(
        q.eq(q.field("orgId"), orgId),
        q.eq(q.field("followUpRequired"), true),
        q.neq(q.field("followUpDate"), undefined),
        q.lte(q.field("followUpDate"), oneWeekFromNow)
      ))
      .collect();
    
    return {
      customers: customersWithFollowUp,
      interactions: interactionsWithFollowUp,
    };
  },
});
