import { mutation } from "./_generated/server"
import { v } from "convex/values"
import { resolveOrgId } from "./util"

// Create test purchase order
export const createTestPurchaseOrder = mutation({
  args: {
    factoryId: v.string(),
    poNumber: v.string(),
    brandId: v.string(),
  },
  handler: async (ctx, args) => {
    const orgId = await resolveOrgId(ctx)
    
    return await ctx.db.insert("purchaseOrders", {
      orgId,
      brandId: args.brandId as any,
      factoryId: args.factoryId as any,
      poNumber: args.poNumber,
      status: "in_production",
      items: [
        {
          sku: "FLIGHT-001",
          quantity: 50,
          description: "Flight Suit - Standard",
          specifications: { material: "Nomex", size: "Standard" },
          unitPrice: 150.00,
          variant: "Standard",
          size: "M",
          color: "Navy",
        },
        {
          sku: "FLIGHT-002", 
          quantity: 30,
          description: "Flight Suit - Premium",
          specifications: { material: "Advanced Nomex", size: "Premium" },
          unitPrice: 200.00,
          variant: "Premium",
          size: "L",
          color: "Black",
        }
      ],
      totalValue: 13500.00,
      requestedDeliveryDate: Date.now() + (7 * 24 * 60 * 60 * 1000), // 7 days from now
      submittedAt: Date.now(),
      progress: {
        totalItems: 80,
        completedItems: 25,
        defectiveItems: 2,
        reworkItems: 1,
        lastUpdated: Date.now(),
      },
      assignedTeam: "production_team",
      orderOwner: "manager_1",
    })
  }
})

// Create test items
export const createTestItems = mutation({
  args: {
    factoryId: v.string(),
    purchaseOrderId: v.string(),
    itemCount: v.number(),
  },
  handler: async (ctx, args) => {
    const orgId = await resolveOrgId(ctx)
    const itemIds = []
    
    for (let i = 0; i < args.itemCount; i++) {
      const stages = ["cutting", "sewing", "washing", "quality", "packaging"]
      const currentStage = stages[Math.floor(Math.random() * stages.length)]
      const status = Math.random() > 0.8 ? "paused" : "active"
      
      const itemId = await ctx.db.insert("items", {
        orgId,
        itemId: `ITEM-${args.purchaseOrderId.slice(-4)}-${String(i + 1).padStart(3, '0')}`,
        workflowId: "workflow_1" as any,
        currentStageId: currentStage,
        status,
        metadata: {
          sku: i < 30 ? "FLIGHT-001" : "FLIGHT-002",
          size: i < 30 ? "M" : "L",
          color: i < 30 ? "Navy" : "Black",
        },
        startedAt: Date.now() - (Math.random() * 24 * 60 * 60 * 1000), // Random start time in last 24h
        updatedAt: Date.now(),
        assignedTo: `operator_${Math.floor(Math.random() * 5) + 1}`,
        qrCode: `QR-${args.purchaseOrderId.slice(-4)}-${String(i + 1).padStart(3, '0')}`,
        qrPrinted: true,
        qrPrintedAt: Date.now() - (Math.random() * 12 * 60 * 60 * 1000),
        qrPrintedBy: "system",
        currentLocationId: "location_1" as any,
        isDefective: Math.random() > 0.95, // 5% defect rate
        defectNotes: Math.random() > 0.95 ? "Minor stitching issue" : undefined,
        flaggedBy: Math.random() > 0.95 ? "qc_team" : undefined,
        flaggedAt: Math.random() > 0.95 ? Date.now() : undefined,
        brandId: "brand_1" as any,
        factoryId: args.factoryId as any,
        purchaseOrderId: args.purchaseOrderId as any,
        itemTypeId: "item_type_1" as any,
      })
      
      itemIds.push(itemId)
    }
    
    return itemIds
  }
})

// Create test scans
export const createTestScans = mutation({
  args: {
    itemCount: v.number(),
  },
  handler: async (ctx, args) => {
    const orgId = await resolveOrgId(ctx)
    const scanIds = []
    
    for (let i = 0; i < args.itemCount; i++) {
      const stages = ["cutting", "sewing", "washing", "quality", "packaging"]
      const stageId = stages[Math.floor(Math.random() * stages.length)]
      const scanTypes = ["item_lookup", "stage_completion"]
      const scanType = scanTypes[Math.floor(Math.random() * scanTypes.length)]
      
      const scanId = await ctx.db.insert("scans", {
        orgId,
        itemId: `ITEM-001-${String(i + 1).padStart(3, '0')}`,
        qrData: `QR-001-${String(i + 1).padStart(3, '0')}`,
        scanType,
        success: Math.random() > 0.1, // 90% success rate
        errorMessage: Math.random() > 0.9 ? "QR code not found" : undefined,
        userId: `operator_${Math.floor(Math.random() * 5) + 1}`,
        stageId,
        workflowId: "workflow_1" as any,
        metadata: {
          deviceType: "mobile",
          location: "factory_floor",
        },
        timestamp: Date.now() - (Math.random() * 24 * 60 * 60 * 1000), // Random time in last 24h
        deviceInfo: {
          userAgent: "Disco Mobile App",
          platform: "iOS",
          cameraType: "back",
        },
      })
      
      scanIds.push(scanId)
    }
    
    return scanIds
  }
})

// Create comprehensive test data
export const createComprehensiveTestData = mutation({
  args: {
    factoryId: v.string(),
  },
  handler: async (ctx, args) => {
    const orgId = await resolveOrgId(ctx)
    
    // Create enriched records that simulate factory data
    const stages = ["cutting", "sewing", "washing", "quality", "packaging"]
    const stageCounts = [20, 15, 10, 8, 7] // Items in each stage
    const enrichedRecordIds = []
    
    // Create purchase order data
    const poData = {
      poNumber: "PO-FLIGHT-2024-001",
      status: "in_production",
      items: [
        { sku: "FLIGHT-001", quantity: 50, description: "Flight Suit - Standard" },
        { sku: "FLIGHT-002", quantity: 30, description: "Flight Suit - Premium" }
      ],
      totalValue: 13500.00,
      progress: { totalItems: 80, completedItems: 25, defectiveItems: 2 }
    }
    
    // Create enriched records for each stage
    for (let stageIndex = 0; stageIndex < stages.length; stageIndex++) {
      const stage = stages[stageIndex]
      const count = stageCounts[stageIndex]
      
      const enrichedRecordId = await ctx.db.insert("recordsEnriched", {
        orgId,
        factoryId: args.factoryId,
        originalText: `${count} flight suits currently in ${stage} stage`,
        scanType: "manual",
        enrichment: {
          labels: ["STAGE", "INVENTORY"],
          entities: ["flight suits", stage],
          fields: {
            sku: count > 15 ? "FLIGHT-001" : "FLIGHT-002",
            stage: stage,
            quantity: count,
            po_number: "PO-FLIGHT-2024-001"
          }
        },
        userId: `operator_${Math.floor(Math.random() * 5) + 1}`,
        createdAt: Date.now() - (Math.random() * 24 * 60 * 60 * 1000),
        metadata: {
          type: "stage_summary",
          stage: stage,
          itemCount: count,
          purchaseOrder: poData
        }
      })
      
      enrichedRecordIds.push(enrichedRecordId)
    }
    
    // Create some alerts
    await ctx.db.insert("alerts", {
      orgId,
      factoryId: args.factoryId,
      level: "WARN",
      title: "High Defect Rate in Sewing",
      details: "Sewing stage showing 8% defect rate, above 5% threshold",
      owner: "qc_team",
      status: "open",
      createdAt: Date.now() - (2 * 60 * 60 * 1000), // 2 hours ago
    })
    
    await ctx.db.insert("alerts", {
      orgId,
      factoryId: args.factoryId,
      level: "INFO",
      title: "Cutting Stage Complete",
      details: "All 20 flight suits moved from cutting to sewing stage",
      owner: "production_team",
      status: "open",
      createdAt: Date.now() - (1 * 60 * 60 * 1000), // 1 hour ago
    })
    
    return { 
      totalItems: stageCounts.reduce((a, b) => a + b, 0),
      stageBreakdown: stages.map((stage, i) => ({ stage, count: stageCounts[i] })),
      enrichedRecords: enrichedRecordIds.length,
      alerts: 2
    }
  }
})
