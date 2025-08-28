import { NextRequest, NextResponse } from 'next/server'
import { ConvexHttpClient } from 'convex/browser'
import { api } from '@/convex/_generated/api'
import { z } from 'zod'

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!)

const NotifyInputSchema = z.object({
  factoryId: z.string(),
  userId: z.string(),
  title: z.string(),
  message: z.string(),
  type: z.enum([
    'item_assigned',
    'item_completed', 
    'item_defective',
    'item_flagged',
    'stage_completed',
    'message_received',
    'task_assigned',
    'system_alert',
    'po_submitted',
    'po_accepted',
    'po_rejected',
    'po_completed'
  ]),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  itemId: z.string().optional(),
  workflowId: z.string().optional(),
  stageId: z.string().optional(),
  senderId: z.string().optional(),
  metadata: z.any().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const input = NotifyInputSchema.parse(body)

    // Create notification in Groovy mission control
    const notificationId = await convex.mutation(api.notifications.createNotification, {
      userId: input.userId,
      type: input.type,
      title: input.title,
      message: input.message,
      itemId: input.itemId,
      workflowId: input.workflowId,
      stageId: input.stageId,
      senderId: input.senderId || 'disco-system',
      priority: input.priority,
      metadata: {
        ...input.metadata,
        source: 'disco_chat',
        factoryId: input.factoryId
      }
    })

    return NextResponse.json({
      ok: true,
      notificationId,
      message: 'Notification sent to Groovy mission control'
    })

  } catch (error) {
    console.error('Disco notification error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to send notification' },
      { status: 500 }
    )
  }
}
