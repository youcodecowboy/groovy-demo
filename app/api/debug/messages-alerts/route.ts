import { NextRequest, NextResponse } from 'next/server'
import { ConvexHttpClient } from 'convex/browser'
import { api } from '@/convex/_generated/api'

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const factoryId = searchParams.get('factoryId') || 'm972psr224txp1ymcefy492v9h7nxq50'
    const limit = parseInt(searchParams.get('limit') || '10')

    // Get recent messages
    const messages = await convex.query(api.disco3b.getMessages, {
      factoryId,
      limit
    })

    // Get recent alerts
    const alerts = await convex.query(api.disco3b.getAlerts, {
      factoryId,
      limit
    })

    // Get recent escalations
    const escalations = await convex.query(api.disco3b.getEscalations, {
      factoryId,
      limit
    })

    return NextResponse.json({
      success: true,
      factoryId,
      data: {
        messages: {
          count: messages.length,
          items: messages.map(msg => ({
            id: msg._id,
            senderId: msg.senderId,
            recipientId: msg.recipientId,
            content: msg.content,
            messageType: msg.messageType,
            isRead: msg.isRead,
            createdAt: new Date(msg.createdAt).toISOString(),
            metadata: msg.metadata
          }))
        },
        alerts: {
          count: alerts.length,
          items: alerts.map(alert => ({
            id: alert._id,
            level: alert.level,
            title: alert.title,
            details: alert.details,
            status: alert.status,
            owner: alert.owner,
            createdAt: new Date(alert.createdAt).toISOString()
          }))
        },
        escalations: {
          count: escalations.length,
          items: escalations.map(escalation => ({
            id: escalation._id,
            kind: escalation.kind,
            details: escalation.details,
            requester: escalation.requester,
            status: escalation.status,
            assignedTo: escalation.assignedTo,
            createdAt: new Date(escalation.createdAt).toISOString()
          }))
        }
      }
    })
  } catch (error) {
    console.error('Debug messages/alerts error:', error)
    return NextResponse.json(
      { error: 'Debug failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
