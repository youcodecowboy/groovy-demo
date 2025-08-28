import { NextRequest, NextResponse } from 'next/server'
import { ConvexHttpClient } from 'convex/browser'
import { api } from '@/convex/_generated/api'

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const factoryId = searchParams.get('factoryId') || 'demo'
    const showAll = searchParams.get('showAll') === 'true'

    if (showAll) {
      // Get all purchase orders regardless of factory/org
      const allPurchaseOrders = await convex.query(api.disco3b.getAllPurchaseOrders)
      
      return NextResponse.json({
        success: true,
        message: "All purchase orders in database",
        data: {
          totalPurchaseOrders: allPurchaseOrders.length,
          purchaseOrders: allPurchaseOrders.map(po => ({
            id: po._id,
            poNumber: po.poNumber,
            factoryId: po.factoryId,
            orgId: po.orgId,
            status: po.status,
            items: po.items?.length || 0
          }))
        }
      })
    }

    // Get factory data
    const factoryData = await convex.query(api.disco3b.getFactoryData, {
      factoryId,
    })

    return NextResponse.json({
      success: true,
      factoryId,
      data: {
        purchaseOrders: factoryData.purchaseOrders.length,
        items: factoryData.items.length,
        scans: factoryData.scans.length,
        alerts: factoryData.alerts.length,
        enrichedRecords: factoryData.enrichedRecords.length,
        enrichedRecordsSample: factoryData.enrichedRecords.slice(0, 3).map(record => ({
          id: record._id,
          originalText: record.originalText,
          enrichment: record.enrichment,
          metadata: record.metadata
        }))
      }
    })
  } catch (error) {
    console.error('Debug error:', error)
    return NextResponse.json(
      { error: 'Debug failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
