import { NextRequest, NextResponse } from 'next/server'
import { isDiscoChatEnabled } from '@/lib/ollama-client'
import { ChatActionInputSchema, ChatActionOutputSchema } from '@/lib/disco-3b-schemas'
import { z } from 'zod'
import { ConvexHttpClient } from 'convex/browser'
import { api } from '@/convex/_generated/api'

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!)

export async function POST(request: NextRequest) {
  try {
    // Check feature flag
    if (!isDiscoChatEnabled()) {
      return NextResponse.json(
        { error: 'Disco Chat is disabled' },
        { status: 403 }
      )
    }

    // Parse and validate input
    const body = await request.json()
    const input = ChatActionInputSchema.parse(body)

    const { action } = input
    const createdIds: string[] = []

    // Execute action based on type
    switch (action.type) {
      case 'send_message': {
        const { to, text } = action.payload
        
        if (!to || !text) {
          throw new Error('send_message requires "to" and "text" fields')
        }

        const messageId = await convex.mutation(api.disco3b.createMessage, {
          factoryId: input.factoryId,
          to,
          from: input.userId,
          text,
          type: 'user',
          priority: action.payload.priority || 'MEDIUM',
        })

        createdIds.push(messageId)
        break
      }

      case 'create_alert': {
        const { level, title, details, owner } = action.payload
        
        if (!level || !title || !details) {
          throw new Error('create_alert requires "level", "title", and "details" fields')
        }

        if (!['INFO', 'WARN', 'CRITICAL'].includes(level)) {
          throw new Error('Alert level must be INFO, WARN, or CRITICAL')
        }

        const alertId = await convex.mutation(api.disco3b.createAlert, {
          factoryId: input.factoryId,
          level,
          title,
          details,
          owner: owner || input.userId,
        })

        createdIds.push(alertId)
        break
      }

      case 'escalate_dashboard': {
        const { kind, details, assignedTo } = action.payload
        
        if (!kind || !details) {
          throw new Error('escalate_dashboard requires "kind" and "details" fields')
        }

        if (!['report', 'analysis', 'workflow'].includes(kind)) {
          throw new Error('Escalation kind must be report, analysis, or workflow')
        }

        const escalationId = await convex.mutation(api.disco3b.createEscalation, {
          factoryId: input.factoryId,
          kind,
          details,
          requester: input.userId,
          assignedTo,
        })

        createdIds.push(escalationId)
        break
      }

      default:
        throw new Error(`Unsupported action type: ${action.type}`)
    }

    const result = {
      ok: true,
      createdIds,
    }

    // Validate output
    const validatedResult = ChatActionOutputSchema.parse(result)

    return NextResponse.json(validatedResult)
  } catch (error) {
    console.error('Chat action error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }

    if (error instanceof Error) {
      const result = {
        ok: false,
        error: error.message,
      }

      return NextResponse.json(result, { status: 400 })
    }

    return NextResponse.json(
      { ok: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}