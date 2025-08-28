import { mutation } from "./_generated/server";
import { v } from "convex/values";
import { resolveOrgId } from "./util";

// Star Wars themed order data with specifications from the specification
const JEDI_LIGHTSABER_ORDER = {
  poNumber: "SW-PO-2024-001",
  description: "Jedi Lightsaber Collection",
  workflowType: "standard-manufacturing",
  items: [
    {
      sku: "LS-LUKE-001",
      quantity: 250,
      description: "Luke Skywalker Lightsaber",
      specifications: {
        character: "Luke Skywalker",
        itemType: "lightsaber",
        material: "durasteel",
        color: "blue",
        size: "standard"
      }
    },
    {
      sku: "LS-OBI-002", 
      quantity: 250,
      description: "Obi-Wan Kenobi Lightsaber",
      specifications: {
        character: "Obi-Wan Kenobi",
        itemType: "lightsaber",
        material: "durasteel",
        color: "blue",
        size: "standard"
      }
    },
    {
      sku: "LS-QUI-003",
      quantity: 250,
      description: "Qui-Gon Jinn Lightsaber",
      specifications: {
        character: "Qui-Gon Jinn",
        itemType: "lightsaber",
        material: "durasteel",
        color: "green",
        size: "standard"
      }
    },
    {
      sku: "LS-ANI-004",
      quantity: 250,
      description: "Anakin Skywalker Lightsaber",
      specifications: {
        character: "Anakin Skywalker",
        itemType: "lightsaber",
        material: "durasteel",
        color: "blue",
        size: "standard"
      }
    }
  ]
};

const SITH_EQUIPMENT_ORDER = {
  poNumber: "SW-PO-2024-002",
  description: "Sith Lord Equipment Set",
  workflowType: "quality-focused",
  items: [
    {
      sku: "SI-VADER-001",
      quantity: 500,
      description: "Darth Vader Helmet",
      specifications: {
        character: "Darth Vader",
        itemType: "helmet",
        material: "durasteel",
        color: "black",
        size: "large"
      }
    },
    {
      sku: "SI-VADER-002",
      quantity: 500,
      description: "Darth Vader Chest Armor",
      specifications: {
        character: "Darth Vader",
        itemType: "armor",
        material: "durasteel",
        color: "black",
        size: "large"
      }
    }
  ]
};

const MANDALORIAN_GEAR_ORDER = {
  poNumber: "SW-PO-2024-003", 
  description: "Mandalorian Beskar Armor",
  workflowType: "rapid-production",
  items: [
    {
      sku: "MAN-DIN-001",
      quantity: 1000,
      description: "Din Djarin Beskar Helmet",
      specifications: {
        character: "Din Djarin",
        itemType: "helmet",
        material: "beskar",
        color: "silver",
        size: "standard"
      }
    }
  ]
};

// Standard Manufacturing Workflow for Jedi Lightsabers
const STANDARD_MANUFACTURING_WORKFLOW = {
  id: "standard-manufacturing",
  name: "Standard Manufacturing Workflow",
  description: "Traditional 5-stage manufacturing process for lightsabers",
  stages: [
    {
      id: "material-prep",
      name: "Material Preparation",
      description: "Prepare and inspect durasteel materials",
      order: 1,
      actions: [
        {
          id: "scan-material",
          type: "scan" as const,
          label: "Scan Material QR Code",
          required: true,
          config: { scanType: "qr", expectedValue: "material:" }
        },
        {
          id: "measure-material",
          type: "measurement" as const,
          label: "Measure Material Dimensions",
          required: true,
          config: { measurements: ["length", "width", "thickness"] }
        }
      ],
      estimatedDuration: 30,
      isActive: true,
    },
    {
      id: "cutting",
      name: "Cutting & Shaping",
      description: "Precision cutting and shaping of lightsaber components",
      order: 2,
      actions: [
        {
          id: "scan-cutting-station",
          type: "scan" as const,
          label: "Scan Cutting Station",
          required: true,
          config: {}
        },
        {
          id: "quality-check-cut",
          type: "inspection" as const,
          label: "Quality Check Cuts",
          required: true,
          config: { checklist: ["precision", "clean_edges", "dimensions"] }
        }
      ],
      estimatedDuration: 45,
      isActive: true,
    },
    {
      id: "assembly",
      name: "Assembly",
      description: "Assemble lightsaber components",
      order: 3,
      actions: [
        {
          id: "scan-assembly-station",
          type: "scan" as const,
          label: "Scan Assembly Station",
          required: true,
          config: {}
        },
        {
          id: "assembly-photo",
          type: "photo" as const,
          label: "Take Assembly Photo",
          required: false,
          config: { photoCount: 2, requiredAngles: ["front", "side"] }
        }
      ],
      estimatedDuration: 60,
      isActive: true,
    },
    {
      id: "finishing",
      name: "Finishing & Polish",
      description: "Final finishing and polishing",
      order: 4,
      actions: [
        {
          id: "scan-finishing-station",
          type: "scan" as const,
          label: "Scan Finishing Station",
          required: true,
          config: {}
        },
        {
          id: "finishing-approval",
          type: "approval" as const,
          label: "Finishing Quality Approval",
          required: true,
          config: { approverRole: "supervisor" }
        }
      ],
      estimatedDuration: 30,
      isActive: true,
    },
    {
      id: "final-inspection",
      name: "Final Quality Inspection",
      description: "Comprehensive quality inspection",
      order: 5,
      actions: [
        {
          id: "scan-inspection-station",
          type: "scan" as const,
          label: "Scan Inspection Station",
          required: true,
          config: {}
        },
        {
          id: "final-inspection",
          type: "inspection" as const,
          label: "Final Quality Inspection",
          required: true,
          config: { 
            checklist: ["appearance", "functionality", "safety", "packaging"],
            passCriteria: "all_required"
          }
        },
        {
          id: "packaging-photo",
          type: "photo" as const,
          label: "Take Packaging Photo",
          required: true,
          config: { photoCount: 1, requiredAngles: ["packaged"] }
        }
      ],
      estimatedDuration: 20,
      isActive: true,
    }
  ]
};

// Quality-Focused Workflow for Sith Equipment
const QUALITY_FOCUSED_WORKFLOW = {
  id: "quality-focused",
  name: "Quality-Focused Workflow",
  description: "Enhanced quality control process for Sith equipment",
  stages: [
    {
      id: "material-inspection",
      name: "Material Inspection",
      description: "Intensive material quality inspection",
      order: 1,
      actions: [
        {
          id: "scan-material",
          type: "scan" as const,
          label: "Scan Material QR Code",
          required: true,
          config: {}
        },
        {
          id: "material-quality-check",
          type: "inspection" as const,
          label: "Material Quality Inspection",
          required: true,
          config: { checklist: ["purity", "strength", "defects"] }
        }
      ],
      estimatedDuration: 45,
      isActive: true,
    },
    {
      id: "precision-cutting",
      name: "Precision Cutting",
      description: "Ultra-precise cutting with tight tolerances",
      order: 2,
      actions: [
        {
          id: "scan-cutting-station",
          type: "scan" as const,
          label: "Scan Precision Cutting Station",
          required: true,
          config: {}
        },
        {
          id: "precision-measurement",
          type: "measurement" as const,
          label: "Precision Measurements",
          required: true,
          config: { measurements: ["length", "width", "thickness", "angles"], tolerance: 0.1 }
        }
      ],
      estimatedDuration: 60,
      isActive: true,
    },
    {
      id: "assembly-quality",
      name: "Quality Assembly",
      description: "High-precision assembly with quality checks",
      order: 3,
      actions: [
        {
          id: "scan-assembly-station",
          type: "scan" as const,
          label: "Scan Assembly Station",
          required: true,
          config: {}
        },
        {
          id: "assembly-inspection",
          type: "inspection" as const,
          label: "Assembly Quality Check",
          required: true,
          config: { checklist: ["alignment", "fit", "finish"] }
        },
        {
          id: "assembly-photo",
          type: "photo" as const,
          label: "Assembly Documentation",
          required: true,
          config: { photoCount: 3, requiredAngles: ["front", "side", "detail"] }
        }
      ],
      estimatedDuration: 75,
      isActive: true,
    },
    {
      id: "quality-approval",
      name: "Quality Approval",
      description: "Manager approval for quality standards",
      order: 4,
      actions: [
        {
          id: "scan-quality-station",
          type: "scan" as const,
          label: "Scan Quality Station",
          required: true,
          config: {}
        },
        {
          id: "quality-approval",
          type: "approval" as const,
          label: "Quality Manager Approval",
          required: true,
          config: { approverRole: "quality_manager", requireComments: true }
        }
      ],
      estimatedDuration: 30,
      isActive: true,
    },
    {
      id: "final-quality",
      name: "Final Quality Assurance",
      description: "Comprehensive final quality assurance",
      order: 5,
      actions: [
        {
          id: "scan-final-station",
          type: "scan" as const,
          label: "Scan Final Station",
          required: true,
          config: {}
        },
        {
          id: "final-quality-inspection",
          type: "inspection" as const,
          label: "Final Quality Assurance",
          required: true,
          config: { 
            checklist: ["appearance", "functionality", "safety", "durability", "packaging"],
            passCriteria: "all_required",
            allowPartialPass: false
          }
        },
        {
          id: "final-documentation",
          type: "photo" as const,
          label: "Final Documentation",
          required: true,
          config: { photoCount: 4, requiredAngles: ["front", "back", "side", "packaged"] }
        }
      ],
      estimatedDuration: 40,
      isActive: true,
    }
  ]
};

// Rapid Production Workflow for Mandalorian Gear
const RAPID_PRODUCTION_WORKFLOW = {
  id: "rapid-production",
  name: "Rapid Production Workflow",
  description: "Streamlined process for high-volume Mandalorian armor",
  stages: [
    {
      id: "bulk-material-prep",
      name: "Bulk Material Preparation",
      description: "Prepare materials for mass production",
      order: 1,
      actions: [
        {
          id: "scan-bulk-material",
          type: "scan" as const,
          label: "Scan Bulk Material",
          required: true,
          config: {}
        },
        {
          id: "bulk-measurement",
          type: "measurement" as const,
          label: "Bulk Measurements",
          required: true,
          config: { measurements: ["batch_size", "material_quantity"] }
        }
      ],
      estimatedDuration: 20,
      isActive: true,
    },
    {
      id: "mass-cutting",
      name: "Mass Cutting",
      description: "High-speed mass cutting operations",
      order: 2,
      actions: [
        {
          id: "scan-mass-cutting",
          type: "scan" as const,
          label: "Scan Mass Cutting Station",
          required: true,
          config: {}
        },
        {
          id: "batch-quality-check",
          type: "inspection" as const,
          label: "Batch Quality Check",
          required: true,
          config: { checklist: ["batch_consistency", "cut_quality"], sampleSize: 10 }
        }
      ],
      estimatedDuration: 30,
      isActive: true,
    },
    {
      id: "streamlined-assembly",
      name: "Streamlined Assembly",
      description: "Fast-paced assembly line process",
      order: 3,
      actions: [
        {
          id: "scan-assembly-line",
          type: "scan" as const,
          label: "Scan Assembly Line",
          required: true,
          config: {}
        },
        {
          id: "assembly-line-photo",
          type: "photo" as const,
          label: "Assembly Line Photo",
          required: false,
          config: { photoCount: 1, requiredAngles: ["assembly_line"] }
        }
      ],
      estimatedDuration: 40,
      isActive: true,
    },
    {
      id: "rapid-finishing",
      name: "Rapid Finishing",
      description: "Quick finishing process",
      order: 4,
      actions: [
        {
          id: "scan-finishing-line",
          type: "scan" as const,
          label: "Scan Finishing Line",
          required: true,
          config: {}
        },
        {
          id: "rapid-approval",
          type: "approval" as const,
          label: "Rapid Approval",
          required: true,
          config: { approverRole: "line_supervisor", autoApprove: true }
        }
      ],
      estimatedDuration: 15,
      isActive: true,
    },
    {
      id: "batch-inspection",
      name: "Batch Inspection",
      description: "Batch-based quality inspection",
      order: 5,
      actions: [
        {
          id: "scan-inspection-line",
          type: "scan" as const,
          label: "Scan Inspection Line",
          required: true,
          config: {}
        },
        {
          id: "batch-inspection",
          type: "inspection" as const,
          label: "Batch Inspection",
          required: true,
          config: { 
            checklist: ["appearance", "functionality", "packaging"],
            passCriteria: "sample_check",
            sampleSize: 5
          }
        },
        {
          id: "batch-photo",
          type: "photo" as const,
          label: "Batch Photo",
          required: true,
          config: { photoCount: 1, requiredAngles: ["batch"] }
        }
      ],
      estimatedDuration: 25,
      isActive: true,
    }
  ]
};

// Chaos settings for each order type
const CHAOS_SETTINGS = {
  "standard-manufacturing": {
    scanInterval: 25, // seconds
    stageInterval: 30, // minutes
    problemInterval: 90, // minutes
    messageInterval: 60, // minutes
  },
  "quality-focused": {
    scanInterval: 35, // seconds (slower due to precision)
    stageInterval: 50, // minutes (longer stages)
    problemInterval: 60, // minutes (more problems expected)
    messageInterval: 45, // minutes (more communication needed)
  },
  "rapid-production": {
    scanInterval: 15, // seconds (faster pace)
    stageInterval: 25, // minutes (shorter stages)
    problemInterval: 120, // minutes (fewer problems due to streamlined process)
    messageInterval: 90, // minutes (less communication needed)
  }
};

// Create a brand for Star Wars theme
export const createStarWarsBrand = mutation({
  args: {},
  handler: async (ctx) => {
    const orgId = await resolveOrgId(ctx);
    const now = Date.now();

    const brandId = await ctx.db.insert("brands", {
      name: "Galactic Empire Manufacturing",
      email: "contracts@galacticempire.gov",
      contactPerson: "Director Krennic",
      phone: "+1-555-EMPIRE",
      address: "Death Star Construction Facility, Outer Rim",
      logo: "/placeholder-logo.png",
      isActive: true,
      createdAt: now,
      updatedAt: now,
      metadata: {
        industry: "Military Equipment",
        annualRevenue: 1000000000,
        preferredFactories: ["imperial-factory"],
        theme: "star-wars"
      }
    });

    return brandId;
  },
});

// Create a factory for Star Wars theme
export const createStarWarsFactory = mutation({
  args: {},
  handler: async (ctx) => {
    const orgId = await resolveOrgId(ctx);
    const now = Date.now();

    const factoryId = await ctx.db.insert("factories", {
      name: "Imperial Manufacturing Facility",
      location: "Coruscant Industrial District",
      adminUserId: "imperial-admin",
      isActive: true,
      capacity: 10000,
      specialties: ["Precision Manufacturing", "Quality Control", "Rapid Production", "Advanced Materials"],
      createdAt: now,
      updatedAt: now,
      metadata: {
        theme: "star-wars",
        classification: "Imperial",
        securityLevel: "Restricted"
      }
    });

    return factoryId;
  },
});

// Create workflow by type
export const createChaosWorkflow = mutation({
  args: { workflowType: v.union(v.literal("standard-manufacturing"), v.literal("quality-focused"), v.literal("rapid-production")) },
  handler: async (ctx, { workflowType }) => {
    const orgId = await resolveOrgId(ctx);
    const now = Date.now();

    let workflowData;
    switch (workflowType) {
      case "standard-manufacturing":
        workflowData = STANDARD_MANUFACTURING_WORKFLOW;
        break;
      case "quality-focused":
        workflowData = QUALITY_FOCUSED_WORKFLOW;
        break;
      case "rapid-production":
        workflowData = RAPID_PRODUCTION_WORKFLOW;
        break;
      default:
        throw new Error(`Unknown workflow type: ${workflowType}`);
    }

    const workflowId = await ctx.db.insert("workflows", {
      orgId,
      name: workflowData.name,
      description: workflowData.description,
      stages: workflowData.stages,
      isActive: true,
      createdAt: now,
      updatedAt: now,
      createdBy: "chaos-mode",
    });

    return workflowId;
  },
});

// Create Star Wars themed orders
export const createStarWarsOrders = mutation({
  args: {},
  handler: async (ctx) => {
    const orgId = await resolveOrgId(ctx);
    const now = Date.now();

    // Create brand and factory
    const brandId = await ctx.runMutation("chaosSeeds:createStarWarsBrand");
    const factoryId = await ctx.runMutation("chaosSeeds:createStarWarsFactory");

    // Create brand-factory relationship
    await ctx.db.insert("brandFactoryRelations", {
      brandId,
      factoryId,
      isActive: true,
      partnershipStartDate: now,
      notes: "Chaos Mode testing partnership for Star Wars themed manufacturing"
    });

    // Create workflows
    const standardWorkflowId = await ctx.runMutation("chaosSeeds:createChaosWorkflow", { workflowType: "standard-manufacturing" });
    const qualityWorkflowId = await ctx.runMutation("chaosSeeds:createChaosWorkflow", { workflowType: "quality-focused" });
    const rapidWorkflowId = await ctx.runMutation("chaosSeeds:createChaosWorkflow", { workflowType: "rapid-production" });

    const orders = [];

    // Order 1: Jedi Lightsabers (Standard Manufacturing)
    const jediOrderId = await ctx.db.insert("purchaseOrders", {
      orgId,
      poNumber: JEDI_LIGHTSABER_ORDER.poNumber,
      brandId,
      factoryId,
      workflowId: standardWorkflowId,
      status: "accepted",
      submittedAt: now,
      acceptedAt: now,
      acceptedBy: "chaos-mode",
      items: JEDI_LIGHTSABER_ORDER.items,
      totalValue: 250000, // $250 per lightsaber * 1000 units
      currency: "USD",
      deliveryDate: now + 30 * 24 * 60 * 60 * 1000, // 30 days
      notes: "Chaos Mode testing order - Jedi Lightsaber Collection",
      priority: "normal",
      metadata: {
        theme: "star-wars",
        faction: "jedi",
        chaosMode: true
      }
    });

    // Create chaos mode order tracking
    const chaosJediOrder = await ctx.db.insert("chaosModeOrders", {
      orgId,
      poNumber: JEDI_LIGHTSABER_ORDER.poNumber,
      description: JEDI_LIGHTSABER_ORDER.description,
      workflowId: standardWorkflowId,
      brandId,
      factoryId,
      status: "accepted",
      totalItems: 1000,
      completedItems: 0,
      currentStage: "material-prep",
      estimatedCompletion: now + 30 * 24 * 60 * 60 * 1000,
      items: JEDI_LIGHTSABER_ORDER.items,
      chaosSettings: CHAOS_SETTINGS["standard-manufacturing"],
      createdAt: now,
      updatedAt: now,
    });

    orders.push(chaosJediOrder);

    // Order 2: Sith Equipment (Quality-Focused)
    const sithOrderId = await ctx.db.insert("purchaseOrders", {
      orgId,
      poNumber: SITH_EQUIPMENT_ORDER.poNumber,
      brandId,
      factoryId,
      workflowId: qualityWorkflowId,
      status: "accepted",
      submittedAt: now,
      acceptedAt: now,
      acceptedBy: "chaos-mode",
      items: SITH_EQUIPMENT_ORDER.items,
      totalValue: 500000, // $500 per item * 1000 units
      currency: "USD",
      deliveryDate: now + 45 * 24 * 60 * 60 * 1000, // 45 days (longer due to quality focus)
      notes: "Chaos Mode testing order - Sith Lord Equipment Set",
      priority: "high",
      metadata: {
        theme: "star-wars",
        faction: "sith",
        chaosMode: true
      }
    });

    const chaosSithOrder = await ctx.db.insert("chaosModeOrders", {
      orgId,
      poNumber: SITH_EQUIPMENT_ORDER.poNumber,
      description: SITH_EQUIPMENT_ORDER.description,
      workflowId: qualityWorkflowId,
      brandId,
      factoryId,
      status: "accepted",
      totalItems: 1000,
      completedItems: 0,
      currentStage: "material-inspection",
      estimatedCompletion: now + 45 * 24 * 60 * 60 * 1000,
      items: SITH_EQUIPMENT_ORDER.items,
      chaosSettings: CHAOS_SETTINGS["quality-focused"],
      createdAt: now,
      updatedAt: now,
    });

    orders.push(chaosSithOrder);

    // Order 3: Mandalorian Gear (Rapid Production)
    const mandalorianOrderId = await ctx.db.insert("purchaseOrders", {
      orgId,
      poNumber: MANDALORIAN_GEAR_ORDER.poNumber,
      brandId,
      factoryId,
      workflowId: rapidWorkflowId,
      status: "accepted",
      submittedAt: now,
      acceptedAt: now,
      acceptedBy: "chaos-mode",
      items: MANDALORIAN_GEAR_ORDER.items,
      totalValue: 750000, // $750 per helmet * 1000 units
      currency: "USD",
      deliveryDate: now + 20 * 24 * 60 * 60 * 1000, // 20 days (faster due to rapid production)
      notes: "Chaos Mode testing order - Mandalorian Beskar Armor",
      priority: "urgent",
      metadata: {
        theme: "star-wars",
        faction: "mandalorian",
        chaosMode: true
      }
    });

    const chaosMandalorianOrder = await ctx.db.insert("chaosModeOrders", {
      orgId,
      poNumber: MANDALORIAN_GEAR_ORDER.poNumber,
      description: MANDALORIAN_GEAR_ORDER.description,
      workflowId: rapidWorkflowId,
      brandId,
      factoryId,
      status: "accepted",
      totalItems: 1000,
      completedItems: 0,
      currentStage: "bulk-material-prep",
      estimatedCompletion: now + 20 * 24 * 60 * 60 * 1000,
      items: MANDALORIAN_GEAR_ORDER.items,
      chaosSettings: CHAOS_SETTINGS["rapid-production"],
      createdAt: now,
      updatedAt: now,
    });

    orders.push(chaosMandalorianOrder);

    return {
      brandId,
      factoryId,
      workflows: {
        standard: standardWorkflowId,
        quality: qualityWorkflowId,
        rapid: rapidWorkflowId,
      },
      orders: orders.map(order => order),
      totalItems: 3000, // 1000 items per order
      message: "Successfully created 3 Star Wars themed orders with 1000 pieces each"
    };
  },
});
