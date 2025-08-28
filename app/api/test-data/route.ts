import { NextRequest, NextResponse } from 'next/server'
import { ConvexHttpClient } from 'convex/browser'
import { api } from '@/convex/_generated/api'

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { factoryId = "m972psr224txp1ymcefy492v9h7nxq50" } = body

    // Create comprehensive test data
    const result = await convex.mutation(api.testData.createComprehensiveTestData, {
      factoryId,
    })

    return NextResponse.json({
      success: true,
      message: "Test data created successfully",
      data: result,
    })
  } catch (error) {
    console.error('Test data creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create test data', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    // Get factory data to show current state
    const factoryData = await convex.query(api.disco3b.getFactoryData, {
      factoryId: "m972psr224txp1ymcefy492v9h7nxq50",
    })

    return NextResponse.json({
      success: true,
      message: "Current factory data",
      data: {
        purchaseOrders: factoryData.purchaseOrders.length,
        items: factoryData.items.length,
        scans: factoryData.scans.length,
        alerts: factoryData.alerts.length,
        enrichedRecords: factoryData.enrichedRecords.length,
      },
    })
  } catch (error) {
    console.error('Factory data retrieval error:', error)
    return NextResponse.json(
      { error: 'Failed to retrieve factory data', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
