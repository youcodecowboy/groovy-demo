import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { resolveOrgId } from "./util";

// ===== FACTORY PROFILE FUNCTIONS =====

// Get factory by slug (for public profiles)
export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("factories")
      .withIndex("by_slug", (q) => q.eq("publicProfile.slug", args.slug))
      .filter((q) => q.eq(q.field("publicProfile.isEnabled"), true))
      .first();
  },
});

// Get factory profile by ID (for factory users)
export const getById = query({
  args: { id: v.id("factories") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Get all factories for current org
export const getAll = query({
  args: {},
  handler: async (ctx) => {
    const orgId = await resolveOrgId(ctx);
    return await ctx.db
      .query("factories")
      .filter((q) => q.eq(q.field("orgId"), orgId))
      .order("desc")
      .collect();
  },
});

// Update factory public profile
export const updateProfile = mutation({
  args: {
    factoryId: v.id("factories"),
    publicProfile: v.object({
      isEnabled: v.boolean(),
      qrCode: v.optional(v.string()),
      slug: v.optional(v.string()),
      description: v.optional(v.string()),
      leadTime: v.optional(v.number()),
      responseTime: v.optional(v.number()),
      certifications: v.optional(v.array(v.string())),
      photoGallery: v.optional(v.array(v.string())),
      whatWeMake: v.optional(v.string()),
      minimumOrderQuantity: v.optional(v.number()),
      paymentTerms: v.optional(v.string()),
      shippingInfo: v.optional(v.string()),
      contactInfo: v.optional(v.object({
        email: v.string(),
        phone: v.string(),
        website: v.string(),
      })),
      socialLinks: v.optional(v.object({
        linkedin: v.optional(v.string()),
        instagram: v.optional(v.string()),
        facebook: v.optional(v.string()),
      })),
      verifiedMetrics: v.optional(v.object({
        totalOrders: v.number(),
        averageRating: v.number(),
        onTimeDelivery: v.number(),
        customerSatisfaction: v.number(),
      })),
    }),
  },
  handler: async (ctx, args) => {
    const { factoryId, publicProfile } = args;
    
    // Generate QR code if not provided
    if (!publicProfile.qrCode) {
      const factory = await ctx.db.get(factoryId);
      if (factory && publicProfile.slug) {
        const qrData = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/factory/${publicProfile.slug}`;
        publicProfile.qrCode = qrData;
      }
    }
    
    return await ctx.db.patch(factoryId, {
      publicProfile,
      updatedAt: Date.now(),
    });
  },
});

// Generate QR code for factory
export const generateQRCode = mutation({
  args: { factoryId: v.id("factories") },
  handler: async (ctx, args) => {
    const factory = await ctx.db.get(args.factoryId);
    if (!factory) throw new Error("Factory not found");
    
    // Generate a unique slug if not exists
    let slug = factory.publicProfile?.slug;
    if (!slug) {
      slug = `${factory.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Math.random().toString(36).slice(2, 7)}`;
    }
    
    const qrData = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/factory/${slug}`;
    
    const publicProfile = {
      isEnabled: true,
      qrCode: qrData,
      slug,
      description: factory.publicProfile?.description || "",
      leadTime: factory.publicProfile?.leadTime || 30,
      responseTime: factory.publicProfile?.responseTime || 24,
      certifications: factory.publicProfile?.certifications || [],
      photoGallery: factory.publicProfile?.photoGallery || [],
      whatWeMake: factory.publicProfile?.whatWeMake || "",
      minimumOrderQuantity: factory.publicProfile?.minimumOrderQuantity || 100,
      paymentTerms: factory.publicProfile?.paymentTerms || "Net 30",
      shippingInfo: factory.publicProfile?.shippingInfo || "",
      contactInfo: factory.publicProfile?.contactInfo || {
        email: "",
        phone: "",
        website: "",
      },
      socialLinks: factory.publicProfile?.socialLinks || {},
      verifiedMetrics: factory.publicProfile?.verifiedMetrics || {
        totalOrders: 0,
        averageRating: 0,
        onTimeDelivery: 0,
        customerSatisfaction: 0,
      },
    };
    
    return await ctx.db.patch(args.factoryId, {
      publicProfile,
      updatedAt: Date.now(),
    });
  },
});

// Record profile view
export const recordView = mutation({
  args: {
    factoryId: v.id("factories"),
    visitorType: v.union(v.literal("qr_scan"), v.literal("direct_visit"), v.literal("search")),
    visitorInfo: v.optional(v.object({
      ipAddress: v.string(),
      userAgent: v.string(),
      location: v.optional(v.string()),
      referrer: v.optional(v.string()),
    })),
    actionTaken: v.optional(v.union(v.literal("viewed_profile"), v.literal("contacted"), v.literal("added_to_crm"), v.literal("requested_quote"))),
    brandId: v.optional(v.id("brands")),
  },
  handler: async (ctx, args) => {
    const orgId = await resolveOrgId(ctx);
    
    return await ctx.db.insert("factoryProfileViews", {
      orgId,
      factoryId: args.factoryId,
      visitorType: args.visitorType,
      visitorInfo: args.visitorInfo,
      actionTaken: args.actionTaken,
      brandId: args.brandId,
      createdAt: Date.now(),
    });
  },
});

// Get profile analytics
export const getAnalytics = query({
  args: { factoryId: v.id("factories") },
  handler: async (ctx, args) => {
    const views = await ctx.db
      .query("factoryProfileViews")
      .filter((q) => q.eq(q.field("factoryId"), args.factoryId))
      .collect();
    
    const qrScans = views.filter(v => v.visitorType === "qr_scan").length;
    const directVisits = views.filter(v => v.visitorType === "direct_visit").length;
    const searchVisits = views.filter(v => v.visitorType === "search").length;
    
    const contacts = views.filter(v => v.actionTaken === "contacted").length;
    const crmAdds = views.filter(v => v.actionTaken === "added_to_crm").length;
    const quoteRequests = views.filter(v => v.actionTaken === "requested_quote").length;
    
    // Get recent views (last 30 days)
    const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
    const recentViews = views.filter(v => v.createdAt > thirtyDaysAgo);
    
    return {
      totalViews: views.length,
      qrScans,
      directVisits,
      searchVisits,
      contacts,
      crmAdds,
      quoteRequests,
      recentViews: recentViews.length,
      conversionRate: views.length > 0 ? ((contacts + crmAdds + quoteRequests) / views.length * 100) : 0,
    };
  },
});

// Get all profile views for a factory
export const getProfileViews = query({
  args: { factoryId: v.id("factories") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("factoryProfileViews")
      .filter((q) => q.eq(q.field("factoryId"), args.factoryId))
      .order("desc")
      .collect();
  },
});

// Add factory to brand's CRM
export const addToBrandCRM = mutation({
  args: {
    factoryId: v.id("factories"),
    brandId: v.id("brands"),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const orgId = await resolveOrgId(ctx);
    const now = Date.now();
    
    // Create customer record for the factory
    const factory = await ctx.db.get(args.factoryId);
    if (!factory) throw new Error("Factory not found");
    
    const customerId = await ctx.db.insert("customers", {
      orgId,
      name: factory.name,
      companyName: factory.name,
      status: "prospect",
      type: "business",
      industry: "Manufacturing",
      website: factory.publicProfile?.contactInfo?.website || "",
      phone: factory.publicProfile?.contactInfo?.phone || "",
      email: factory.publicProfile?.contactInfo?.email || "",
      notes: args.notes || `Added from factory profile scan. Factory ID: ${args.factoryId}`,
      tags: ["factory", "qr-scan"],
      source: "factory-profile",
      isActive: true,
      createdAt: now,
      updatedAt: now,
      createdBy: "system",
    });
    
    // Record the action
    await ctx.db.insert("factoryProfileViews", {
      orgId,
      factoryId: args.factoryId,
      visitorType: "qr_scan",
      actionTaken: "added_to_crm",
      brandId: args.brandId,
      createdAt: now,
    });
    
    return customerId;
  },
});
