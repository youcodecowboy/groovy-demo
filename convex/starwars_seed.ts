import { mutation } from "./_generated/server";
import { resolveOrgId } from "./util";

// Star Wars themed data for Skywalker Textiles
const STAR_WARS_DATA = {
  // Jedi Robe Workflow
  jediRobeWorkflow: {
    name: "Jedi Robe Production",
    description: "Complete production workflow for authentic Jedi robes",
    stages: [
      {
        id: "jedi-fabric-prep",
        name: "Fabric Preparation",
        description: "Cut and prepare authentic Jedi robe fabric",
        order: 0,
        actions: [
          {
            id: "jedi-fabric-cut",
            type: "scan" as const,
            label: "Scan Fabric Roll",
            description: "Scan fabric roll QR code to verify material",
            required: true,
            config: { scanType: "qr", expectedValue: "fabric:" }
          },
          {
            id: "jedi-fabric-inspect",
            type: "inspection" as const,
            label: "Fabric Quality Check",
            description: "Inspect fabric for defects and authenticity",
            required: true,
            config: {
              inspectionChecklist: [
                "No tears or holes",
                "Proper weave pattern",
                "Authentic color (brown/cream)",
                "No stains or marks",
                "Correct weight and texture"
              ],
              allowPartial: false
            }
          }
        ],
        estimatedDuration: 30,
        isActive: true,
        allowedNextStageIds: ["jedi-stitching"],
      },
      {
        id: "jedi-stitching",
        name: "Robe Stitching",
        description: "Stitch the main robe components together",
        order: 1,
        actions: [
          {
            id: "jedi-stitch-scan",
            type: "scan" as const,
            label: "Scan Work Station",
            description: "Scan workstation to begin stitching process",
            required: true,
            config: { scanType: "qr", expectedValue: "station:" }
          },
          {
            id: "jedi-stitch-notes",
            type: "note" as const,
            label: "Stitching Notes",
            description: "Add any stitching notes or issues",
            required: false,
            config: { notePrompt: "Enter stitching notes...", maxLength: 200 }
          }
        ],
        estimatedDuration: 45,
        isActive: true,
        allowedNextStageIds: ["jedi-embroidery"],
      },
      {
        id: "jedi-embroidery",
        name: "Jedi Symbol Embroidery",
        description: "Add authentic Jedi Order symbols and details",
        order: 2,
        actions: [
          {
            id: "jedi-embroidery-design",
            type: "photo" as const,
            label: "Embroidery Design Photo",
            description: "Take photo of embroidery design for approval",
            required: true,
            config: { photoCount: 2, photoQuality: "high" }
          },
          {
            id: "jedi-embroidery-approval",
            type: "approval" as const,
            label: "Design Approval",
            description: "Get approval for embroidery design",
            required: true,
            config: { approverRole: "supervisor", autoApprove: false }
          }
        ],
        estimatedDuration: 60,
        isActive: true,
        allowedNextStageIds: ["jedi-quality"],
      },
      {
        id: "jedi-quality",
        name: "Jedi Quality Assurance",
        description: "Final quality check for Jedi robe authenticity",
        order: 3,
        actions: [
          {
            id: "jedi-final-inspect",
            type: "inspection" as const,
            label: "Final Jedi Inspection",
            description: "Complete quality inspection for Jedi standards",
            required: true,
            config: {
              inspectionChecklist: [
                "Authentic Jedi design",
                "Proper fit and drape",
                "Quality embroidery",
                "No loose threads",
                "Jedi Order compliance"
              ],
              allowPartial: false
            }
          },
          {
            id: "jedi-force-test",
            type: "note" as const,
            label: "Force Sensitivity Test",
            description: "Document any force sensitivity detected in the robe",
            required: false,
            config: { notePrompt: "Force sensitivity notes...", maxLength: 150 }
          }
        ],
        estimatedDuration: 25,
        isActive: true,
        allowedNextStageIds: ["jedi-packaging"],
      },
      {
        id: "jedi-packaging",
        name: "Jedi Robe Packaging",
        description: "Package robe in authentic Jedi storage container",
        order: 4,
        actions: [
          {
            id: "jedi-package-scan",
            type: "scan" as const,
            label: "Final Jedi Scan",
            description: "Scan robe before packaging",
            required: true,
            config: { scanType: "qr", expectedValue: "jedi:" }
          },
          {
            id: "jedi-package-photo",
            type: "photo" as const,
            label: "Packaged Robe Photo",
            description: "Take photo of packaged Jedi robe",
            required: true,
            config: { photoCount: 1, photoQuality: "high" }
          }
        ],
        estimatedDuration: 15,
        isActive: true,
        allowedNextStageIds: [],
      }
    ]
  },

  // Rebel Pilot Uniform Workflow
  rebelPilotWorkflow: {
    name: "Rebel Pilot Uniform Production",
    description: "Production workflow for authentic Rebel Alliance pilot uniforms",
    stages: [
      {
        id: "pilot-fabric-cut",
        name: "Flight Suit Cutting",
        description: "Cut flight suit fabric to specifications",
        order: 0,
        actions: [
          {
            id: "pilot-fabric-scan",
            type: "scan" as const,
            label: "Scan Flight Fabric",
            description: "Scan flight suit fabric material",
            required: true,
            config: { scanType: "qr", expectedValue: "flight-fabric:" }
          }
        ],
        estimatedDuration: 20,
        isActive: true,
        allowedNextStageIds: ["pilot-assembly"],
      },
      {
        id: "pilot-assembly",
        name: "Flight Suit Assembly",
        description: "Assemble flight suit with proper reinforcements",
        order: 1,
        actions: [
          {
            id: "pilot-assembly-scan",
            type: "scan" as const,
            label: "Assembly Station Scan",
            description: "Scan assembly workstation",
            required: true,
            config: { scanType: "qr", expectedValue: "assembly:" }
          },
          {
            id: "pilot-assembly-notes",
            type: "note" as const,
            label: "Assembly Notes",
            description: "Record assembly progress and any issues",
            required: false,
            config: { notePrompt: "Assembly notes...", maxLength: 200 }
          }
        ],
        estimatedDuration: 40,
        isActive: true,
        allowedNextStageIds: ["pilot-patches"],
      },
      {
        id: "pilot-patches",
        name: "Alliance Patches & Insignia",
        description: "Apply Rebel Alliance patches and pilot insignia",
        order: 2,
        actions: [
          {
            id: "pilot-patch-apply",
            type: "photo" as const,
            label: "Patch Application Photo",
            description: "Take photo of applied patches",
            required: true,
            config: { photoCount: 1, photoQuality: "medium" }
          }
        ],
        estimatedDuration: 25,
        isActive: true,
        allowedNextStageIds: ["pilot-quality"],
      },
      {
        id: "pilot-quality",
        name: "Flight Suit Quality Check",
        description: "Quality inspection for flight safety standards",
        order: 3,
        actions: [
          {
            id: "pilot-quality-inspect",
            type: "inspection" as const,
            label: "Flight Safety Inspection",
            description: "Inspect for flight safety compliance",
            required: true,
            config: {
              inspectionChecklist: [
                "Proper fit for flight",
                "All patches secure",
                "No loose threads",
                "Flight safety compliant",
                "Rebel Alliance approved"
              ],
              allowPartial: false
            }
          }
        ],
        estimatedDuration: 20,
        isActive: true,
        allowedNextStageIds: ["pilot-packaging"],
      },
      {
        id: "pilot-packaging",
        name: "Flight Suit Packaging",
        description: "Package flight suit for Rebel Alliance delivery",
        order: 4,
        actions: [
          {
            id: "pilot-final-scan",
            type: "scan" as const,
            label: "Final Flight Scan",
            description: "Scan before packaging",
            required: true,
            config: { scanType: "qr", expectedValue: "pilot:" }
          }
        ],
        estimatedDuration: 10,
        isActive: true,
        allowedNextStageIds: [],
      }
    ]
  },

  // Stormtrooper Armor Workflow
  stormtrooperWorkflow: {
    name: "Stormtrooper Armor Production",
    description: "Production workflow for Imperial Stormtrooper armor",
    stages: [
      {
        id: "storm-armor-mold",
        name: "Armor Molding",
        description: "Create armor pieces using Imperial specifications",
        order: 0,
        actions: [
          {
            id: "storm-mold-scan",
            type: "scan" as const,
            label: "Scan Mold Station",
            description: "Scan molding station to begin",
            required: true,
            config: { scanType: "qr", expectedValue: "mold:" }
          }
        ],
        estimatedDuration: 90,
        isActive: true,
        allowedNextStageIds: ["storm-assembly"],
      },
      {
        id: "storm-assembly",
        name: "Armor Assembly",
        description: "Assemble armor pieces into complete suit",
        order: 1,
        actions: [
          {
            id: "storm-assembly-scan",
            type: "scan" as const,
            label: "Assembly Station Scan",
            description: "Scan assembly workstation",
            required: true,
            config: { scanType: "qr", expectedValue: "armor-assembly:" }
          }
        ],
        estimatedDuration: 120,
        isActive: true,
        allowedNextStageIds: ["storm-painting"],
      },
      {
        id: "storm-painting",
        name: "Imperial White Painting",
        description: "Apply Imperial white paint finish",
        order: 2,
        actions: [
          {
            id: "storm-paint-photo",
            type: "photo" as const,
            label: "Paint Finish Photo",
            description: "Take photo of painted armor",
            required: true,
            config: { photoCount: 2, photoQuality: "high" }
          }
        ],
        estimatedDuration: 60,
        isActive: true,
        allowedNextStageIds: ["storm-quality"],
      },
      {
        id: "storm-quality",
        name: "Imperial Quality Assurance",
        description: "Quality check for Imperial standards",
        order: 3,
        actions: [
          {
            id: "storm-imperial-inspect",
            type: "inspection" as const,
            label: "Imperial Standards Check",
            description: "Verify Imperial quality standards",
            required: true,
            config: {
              inspectionChecklist: [
                "Perfect white finish",
                "No defects or blemishes",
                "Proper fit and articulation",
                "Imperial compliance",
                "Ready for deployment"
              ],
              allowPartial: false
            }
          }
        ],
        estimatedDuration: 30,
        isActive: true,
        allowedNextStageIds: ["storm-packaging"],
      },
      {
        id: "storm-packaging",
        name: "Imperial Packaging",
        description: "Package armor for Imperial deployment",
        order: 4,
        actions: [
          {
            id: "storm-final-scan",
            type: "scan" as const,
            label: "Final Imperial Scan",
            description: "Scan before Imperial packaging",
            required: true,
            config: { scanType: "qr", expectedValue: "storm:" }
          }
        ],
        estimatedDuration: 20,
        isActive: true,
        allowedNextStageIds: [],
      }
    ]
  }
};

// Star Wars themed users
const STAR_WARS_USERS = [
  {
    name: "Luke Skywalker",
    email: "luke@skywalker-textiles.com",
    role: "admin" as const,
    userType: "factory" as const
  },
  {
    name: "Leia Organa",
    email: "leia@skywalker-textiles.com", 
    role: "manager" as const,
    userType: "factory" as const
  },
  {
    name: "Han Solo",
    email: "han@skywalker-textiles.com",
    role: "operator" as const,
    userType: "factory" as const
  },
  {
    name: "Chewbacca",
    email: "chewie@skywalker-textiles.com",
    role: "operator" as const,
    userType: "factory" as const
  },
  {
    name: "Obi-Wan Kenobi",
    email: "obiwan@skywalker-textiles.com",
    role: "operator" as const,
    userType: "factory" as const
  },
  {
    name: "Yoda",
    email: "yoda@skywalker-textiles.com",
    role: "manager" as const,
    userType: "factory" as const
  },
  {
    name: "Darth Vader",
    email: "vader@empire-uniforms.com",
    role: "viewer" as const,
    userType: "brand" as const
  },
  {
    name: "Mon Mothma",
    email: "mon@rebel-alliance.com",
    role: "viewer" as const, 
    userType: "brand" as const
  }
];

// Star Wars themed locations
const STAR_WARS_LOCATIONS = [
  {
    name: "Jedi Robe Assembly Bay",
    description: "Sacred space for Jedi robe production",
    type: "area" as const,
    qrCode: "location:JEDI-ROBE-BAY",
    capacity: 8,
    currentOccupancy: 0
  },
  {
    name: "Rebel Pilot Workshop",
    description: "Workshop for Rebel Alliance pilot uniforms",
    type: "area" as const, 
    qrCode: "location:REBEL-PILOT-WORKSHOP",
    capacity: 6,
    currentOccupancy: 0
  },
  {
    name: "Imperial Armor Forge",
    description: "Imperial facility for Stormtrooper armor",
    type: "area" as const,
    qrCode: "location:IMPERIAL-ARMOR-FORGE", 
    capacity: 4,
    currentOccupancy: 0
  },
  {
    name: "Quality Control Chamber",
    description: "Central quality control facility",
    type: "area" as const,
    qrCode: "location:QC-CHAMBER",
    capacity: 5,
    currentOccupancy: 0
  },
  {
    name: "Packaging Station Alpha",
    description: "Primary packaging and shipping station",
    type: "area" as const,
    qrCode: "location:PACK-ALPHA",
    capacity: 10,
    currentOccupancy: 0
  },
  {
    name: "Fabric Storage Vault",
    description: "Secure storage for premium fabrics",
    type: "area" as const,
    qrCode: "location:FABRIC-VAULT",
    capacity: 20,
    currentOccupancy: 0
  }
];

// Star Wars themed purchase orders
const STAR_WARS_PURCHASE_ORDERS = [
  {
    poNumber: "SW-2024-001",
    status: "in_production" as const,
    items: [
      {
        sku: "JEDI-ROBE-001",
        quantity: 50,
        description: "Authentic Jedi Robe - Brown",
        specifications: { material: "Wool blend", size: "Standard", color: "Brown" },
        unitPrice: 150.00,
        variant: "Traditional",
        size: "M",
        color: "Brown"
      },
      {
        sku: "JEDI-ROBE-002", 
        quantity: 25,
        description: "Authentic Jedi Robe - Cream",
        specifications: { material: "Wool blend", size: "Standard", color: "Cream" },
        unitPrice: 150.00,
        variant: "Traditional",
        size: "L",
        color: "Cream"
      }
    ],
    totalValue: 11250.00,
    requestedDeliveryDate: Date.now() + (30 * 24 * 60 * 60 * 1000), // 30 days from now
    notes: "Urgent order for Jedi Council ceremony"
  },
  {
    poNumber: "SW-2024-002",
    status: "accepted" as const,
    items: [
      {
        sku: "REBEL-PILOT-001",
        quantity: 100,
        description: "Rebel Alliance Pilot Flight Suit",
        specifications: { material: "Flight-grade fabric", size: "Standard", color: "Orange" },
        unitPrice: 200.00,
        variant: "Standard Issue",
        size: "M",
        color: "Orange"
      }
    ],
    totalValue: 20000.00,
    requestedDeliveryDate: Date.now() + (45 * 24 * 60 * 60 * 1000), // 45 days from now
    notes: "Standard issue for new Rebel pilots"
  },
  {
    poNumber: "SW-2024-003", 
    status: "pending" as const,
    items: [
      {
        sku: "STORM-ARMOR-001",
        quantity: 200,
        description: "Imperial Stormtrooper Armor Set",
        specifications: { material: "Plastoid composite", size: "Standard", color: "White" },
        unitPrice: 500.00,
        variant: "Standard Issue",
        size: "Standard",
        color: "White"
      }
    ],
    totalValue: 100000.00,
    requestedDeliveryDate: Date.now() + (60 * 24 * 60 * 60 * 1000), // 60 days from now
    notes: "Large order for Imperial garrison expansion"
  }
];

export const seedStarWarsData = mutation({
  args: {},
  handler: async (ctx) => {
    const orgId = await resolveOrgId(ctx);
    const now = Date.now();

    // Clear all existing data first
    const items = await ctx.db.query("items").collect();
    const workflows = await ctx.db.query("workflows").collect();
    const locations = await ctx.db.query("locations").collect();
    const messages = await ctx.db.query("messages").collect();
    const users = await ctx.db.query("users").collect();
    const completedItems = await ctx.db.query("completedItems").collect();
    const itemHistory = await ctx.db.query("itemHistory").collect();
    const completedItemHistory = await ctx.db.query("completedItemHistory").collect();
    const scans = await ctx.db.query("scans").collect();
    const notifications = await ctx.db.query("notifications").collect();
    const brands = await ctx.db.query("brands").collect();
    const factories = await ctx.db.query("factories").collect();
    const brandFactoryRelations = await ctx.db.query("brandFactoryRelations").collect();
    const purchaseOrders = await ctx.db.query("purchaseOrders").collect();

    // Delete all records
    for (const item of items) await ctx.db.delete(item._id);
    for (const workflow of workflows) await ctx.db.delete(workflow._id);
    for (const location of locations) await ctx.db.delete(location._id);
    for (const message of messages) await ctx.db.delete(message._id);
    for (const user of users) await ctx.db.delete(user._id);
    for (const completedItem of completedItems) await ctx.db.delete(completedItem._id);
    for (const history of itemHistory) await ctx.db.delete(history._id);
    for (const history of completedItemHistory) await ctx.db.delete(history._id);
    for (const scan of scans) await ctx.db.delete(scan._id);
    for (const notification of notifications) await ctx.db.delete(notification._id);
    for (const brand of brands) await ctx.db.delete(brand._id);
    for (const factory of factories) await ctx.db.delete(factory._id);
    for (const relation of brandFactoryRelations) await ctx.db.delete(relation._id);
    for (const po of purchaseOrders) await ctx.db.delete(po._id);

    // Create Skywalker Textiles factory
    const factoryId = await ctx.db.insert("factories", {
      orgId,
      name: "Skywalker Textiles",
      location: "Tatooine, Outer Rim",
      adminUserId: "luke-skywalker",
      isActive: true,
      capacity: 1000,
      specialties: ["Jedi Robes", "Rebel Uniforms", "Imperial Armor", "Custom Costumes"],
      publicProfile: {
        isEnabled: true,
        qrCode: "http://localhost:3000/factory/skywalker-textiles",
        slug: "skywalker-textiles",
        description: "Authentic Star Wars costume and uniform manufacturer. We specialize in Jedi robes, Rebel Alliance pilot uniforms, and Imperial Stormtrooper armor. May the Force be with our craftsmanship.",
        leadTime: 30,
        responseTime: 6,
        certifications: ["Jedi Council Approved", "Rebel Alliance Certified", "Imperial Standards Compliant"],
        photoGallery: [],
        whatWeMake: "Jedi robes, Rebel pilot uniforms, Stormtrooper armor, custom Star Wars costumes",
        minimumOrderQuantity: 10,
        paymentTerms: "Net 30",
        shippingInfo: "FOB Tatooine, hyperspace shipping available",
        contactInfo: {
          email: "orders@skywalker-textiles.com",
          phone: "+1-555-FORCE",
          website: "https://skywalker-textiles.com",
        },
        socialLinks: {
          linkedin: "https://linkedin.com/company/skywalker-textiles",
          instagram: "https://instagram.com/skywalkertextiles",
        },
        verifiedMetrics: {
          totalOrders: 2500,
          averageRating: 4.9,
          onTimeDelivery: 98,
          customerSatisfaction: 97,
        },
      },
      createdAt: now,
      updatedAt: now,
    });

    // Create Star Wars themed brands
    const jediOrderBrandId = await ctx.db.insert("brands", {
      orgId,
      name: "Jedi Order",
      email: "council@jedi-order.com",
      contactPerson: "Master Yoda",
      phone: "+1-555-JEDI",
      address: "Jedi Temple, Coruscant",
      logo: "/jedi-logo.png",
      isActive: true,
      createdAt: now,
      updatedAt: now,
      metadata: {
        industry: "Religious Order",
        annualRevenue: 1000000,
        preferredFactories: ["skywalker-textiles"]
      }
    });

    const rebelAllianceBrandId = await ctx.db.insert("brands", {
      orgId,
      name: "Rebel Alliance",
      email: "procurement@rebel-alliance.com", 
      contactPerson: "Mon Mothma",
      phone: "+1-555-REBEL",
      address: "Rebel Base, Yavin 4",
      logo: "/rebel-logo.png",
      isActive: true,
      createdAt: now,
      updatedAt: now,
      metadata: {
        industry: "Military Resistance",
        annualRevenue: 5000000,
        preferredFactories: ["skywalker-textiles"]
      }
    });

    const imperialBrandId = await ctx.db.insert("brands", {
      orgId,
      name: "Galactic Empire",
      email: "procurement@empire.gov",
      contactPerson: "Darth Vader",
      phone: "+1-555-EMPIRE",
      address: "Imperial Palace, Coruscant",
      logo: "/empire-logo.png",
      isActive: true,
      createdAt: now,
      updatedAt: now,
      metadata: {
        industry: "Military Government",
        annualRevenue: 10000000,
        preferredFactories: ["skywalker-textiles"]
      }
    });

    // Create brand-factory relationships
    await ctx.db.insert("brandFactoryRelations", {
      orgId,
      brandId: jediOrderBrandId,
      factoryId,
      isActive: true,
      partnershipStartDate: now - (365 * 24 * 60 * 60 * 1000), // 1 year ago
      notes: "Long-standing partnership with Jedi Order"
    });

    await ctx.db.insert("brandFactoryRelations", {
      orgId,
      brandId: rebelAllianceBrandId,
      factoryId,
      isActive: true,
      partnershipStartDate: now - (180 * 24 * 60 * 60 * 1000), // 6 months ago
      notes: "Strategic partnership for Rebel uniforms"
    });

    await ctx.db.insert("brandFactoryRelations", {
      orgId,
      brandId: imperialBrandId,
      factoryId,
      isActive: true,
      partnershipStartDate: now - (90 * 24 * 60 * 60 * 1000), // 3 months ago
      notes: "Imperial contract for armor production"
    });

    // Create Star Wars users
    const createdUsers = [];
    for (const userData of STAR_WARS_USERS) {
      const userId = await ctx.db.insert("users", {
        name: userData.name,
        email: userData.email,
        role: userData.role,
        isActive: true,
        createdAt: now,
        lastLogin: now,
        userType: userData.userType,
        factoryId: userData.userType === "factory" ? factoryId : undefined,
        brandId: userData.userType === "brand" ? 
          (userData.name.includes("Vader") ? imperialBrandId : rebelAllianceBrandId) : undefined
      });
      createdUsers.push(userId);
    }

    // Create Star Wars workflows
    const jediWorkflowId = await ctx.db.insert("workflows", {
      orgId,
      ...STAR_WARS_DATA.jediRobeWorkflow,
      isActive: true,
      createdAt: now,
      updatedAt: now,
      createdBy: "luke@skywalker-textiles.com",
    });

    const rebelWorkflowId = await ctx.db.insert("workflows", {
      orgId,
      ...STAR_WARS_DATA.rebelPilotWorkflow,
      isActive: true,
      createdAt: now,
      updatedAt: now,
      createdBy: "leia@skywalker-textiles.com",
    });

    const stormWorkflowId = await ctx.db.insert("workflows", {
      orgId,
      ...STAR_WARS_DATA.stormtrooperWorkflow,
      isActive: true,
      createdAt: now,
      updatedAt: now,
      createdBy: "vader@empire-uniforms.com",
    });

    // Create Star Wars locations
    const createdLocations = [];
    for (const locationData of STAR_WARS_LOCATIONS) {
      const locationId = await ctx.db.insert("locations", {
        orgId,
        ...locationData,
        isActive: true,
        createdAt: now,
        updatedAt: now,
        createdBy: "luke@skywalker-textiles.com",
      });
      createdLocations.push(locationId);
    }

    // Create Star Wars purchase orders
    const createdPurchaseOrders = [];
    for (const poData of STAR_WARS_PURCHASE_ORDERS) {
      const brandId = poData.poNumber.includes("SW-2024-001") ? jediOrderBrandId :
                     poData.poNumber.includes("SW-2024-002") ? rebelAllianceBrandId :
                     imperialBrandId;

      const poId = await ctx.db.insert("purchaseOrders", {
        orgId,
        brandId,
        factoryId,
        ...poData,
        submittedAt: now - (Math.random() * 7 * 24 * 60 * 60 * 1000), // Random time in last week
        acceptedAt: poData.status === "pending" ? undefined : now - (Math.random() * 3 * 24 * 60 * 60 * 1000),
        acceptedBy: poData.status === "pending" ? undefined : "luke@skywalker-textiles.com",
        productionStartDate: poData.status === "in_production" ? now - (Math.random() * 2 * 24 * 60 * 60 * 1000) : undefined,
        progress: {
          totalItems: poData.items.reduce((sum, item) => sum + item.quantity, 0),
          completedItems: Math.floor(Math.random() * poData.items.reduce((sum, item) => sum + item.quantity, 0) * 0.8),
          defectiveItems: Math.floor(Math.random() * 5),
          reworkItems: Math.floor(Math.random() * 3),
          lastUpdated: now
        },
        financials: {
          orderValue: poData.totalValue,
          estimatedLaborCost: poData.totalValue * 0.4,
          estimatedMaterialsCost: poData.totalValue * 0.5,
          paymentTerms: "Net 30",
          totalPaid: poData.totalValue * 0.5 // Partial payment for non-completed orders
        },
        leadTime: {
          promisedDays: 30,
          actualDays: undefined, // Not completed yet
          status: "on_track" as const
        },
        assignedTeam: "Production Team Alpha",
        orderOwner: "luke@skywalker-textiles.com",
        metadata: {
          priority: poData.poNumber.includes("001") ? "high" : "normal",
          specialRequirements: poData.notes
        }
      });
      createdPurchaseOrders.push(poId);
    }

    // Create substantial amount of items for stress testing
    const createdItems = [];
    const itemTypes = [
      { workflowId: jediWorkflowId, prefix: "JEDI", stages: STAR_WARS_DATA.jediRobeWorkflow.stages, count: 75 },
      { workflowId: rebelWorkflowId, prefix: "REBEL", stages: STAR_WARS_DATA.rebelPilotWorkflow.stages, count: 60 },
      { workflowId: stormWorkflowId, prefix: "STORM", stages: STAR_WARS_DATA.stormtrooperWorkflow.stages, count: 45 }
    ];

    for (const itemType of itemTypes) {
      for (let i = 1; i <= itemType.count; i++) {
        const stageIndex = Math.floor(Math.random() * itemType.stages.length);
        const currentStage = itemType.stages[stageIndex];
        
        const itemId = await ctx.db.insert("items", {
          orgId,
          itemId: `${itemType.prefix}-${String(i).padStart(3, '0')}`,
          workflowId: itemType.workflowId,
          currentStageId: currentStage.id,
          status: "active",
          metadata: {
            type: itemType.prefix.toLowerCase(),
            priority: Math.random() > 0.7 ? "high" : "normal",
            assignedTo: STAR_WARS_USERS[Math.floor(Math.random() * 5)].email, // Factory users only
            currentLocation: STAR_WARS_LOCATIONS[Math.floor(Math.random() * STAR_WARS_LOCATIONS.length)].name
          },
          startedAt: now - (Math.random() * 7 * 24 * 60 * 60 * 1000), // Random start time in last week
          updatedAt: now - (Math.random() * 24 * 60 * 60 * 1000), // Random update time in last day
          qrCode: `item:${itemType.prefix}-${String(i).padStart(3, '0')}`,
          brandId: itemType.prefix === "JEDI" ? jediOrderBrandId :
                  itemType.prefix === "REBEL" ? rebelAllianceBrandId :
                  imperialBrandId,
          factoryId,
          purchaseOrderId: createdPurchaseOrders[Math.floor(Math.random() * createdPurchaseOrders.length)]
        });
        createdItems.push(itemId);
      }
    }

    // Create some sample messages
    await ctx.db.insert("messages", {
      orgId,
      senderId: "luke@skywalker-textiles.com",
      recipientId: "han@skywalker-textiles.com",
      content: "Han, we need to expedite the Rebel pilot uniforms. The Alliance is expecting delivery next week!",
      messageType: "text",
      isRead: false,
      createdAt: now - (2 * 60 * 60 * 1000), // 2 hours ago
      brandId: rebelAllianceBrandId,
      factoryId
    });

    await ctx.db.insert("messages", {
      orgId,
      senderId: "yoda@skywalker-textiles.com",
      recipientId: "luke@skywalker-textiles.com", 
      content: "Luke, the Jedi robes are coming along nicely. The Force is strong with this batch.",
      messageType: "text",
      isRead: true,
      createdAt: now - (6 * 60 * 60 * 1000), // 6 hours ago
      brandId: jediOrderBrandId,
      factoryId
    });

    await ctx.db.insert("messages", {
      orgId,
      senderId: "vader@empire-uniforms.com",
      recipientId: "luke@skywalker-textiles.com",
      content: "Skywalker, the Imperial armor must meet our exacting standards. No compromises.",
      messageType: "text", 
      isRead: false,
      createdAt: now - (1 * 60 * 60 * 1000), // 1 hour ago
      brandId: imperialBrandId,
      factoryId
    });

    return {
      success: true,
      message: "Star Wars themed data seeded successfully! May the Force be with your production!",
      summary: {
        users: createdUsers.length,
        workflows: 3,
        locations: createdLocations.length,
        items: createdItems.length,
        purchaseOrders: createdPurchaseOrders.length,
        brands: 3,
        factory: factoryId
      },
      details: {
        users: createdUsers,
        workflows: [jediWorkflowId, rebelWorkflowId, stormWorkflowId],
        locations: createdLocations,
        items: createdItems,
        purchaseOrders: createdPurchaseOrders,
        brands: [jediOrderBrandId, rebelAllianceBrandId, imperialBrandId],
        factory: factoryId
      }
    };
  },
});
