import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const NotificationPreferencesSchema = z.object({
  factoryId: z.string(),
  notificationsEnabled: z.boolean(),
  notificationFrequency: z.enum(['immediate', 'batched', 'hourly', 'daily']),
  batchInterval: z.number().optional(),
  quietHoursEnabled: z.boolean().optional(),
  quietHoursStart: z.string().optional(),
  quietHoursEnd: z.string().optional(),
  defaultRecipient: z.string(),
  notificationTypes: z.object({
    quality_issues: z.boolean(),
    production_updates: z.boolean(),
    machine_alerts: z.boolean(),
    inventory_alerts: z.boolean(),
    schedule_changes: z.boolean(),
    general_messages: z.boolean(),
  }),
  priorityThreshold: z.enum(['low', 'medium', 'high', 'urgent']),
})

// In-memory storage for demo purposes
// In production, this would be stored in a database
let preferences = {
  factoryId: 'demo-factory',
  notificationsEnabled: true,
  notificationFrequency: 'immediate' as const,
  batchInterval: 15,
  quietHoursEnabled: false,
  quietHoursStart: '22:00',
  quietHoursEnd: '06:00',
  defaultRecipient: 'admin@demo',
  notificationTypes: {
    quality_issues: true,
    production_updates: true,
    machine_alerts: true,
    inventory_alerts: true,
    schedule_changes: true,
    general_messages: false,
  },
  priorityThreshold: 'medium' as const,
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const factoryId = searchParams.get('factoryId')

  if (factoryId !== 'demo-factory') {
    return NextResponse.json(
      { error: 'Factory not found' },
      { status: 404 }
    )
  }

  return NextResponse.json(preferences)
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedPreferences = NotificationPreferencesSchema.parse(body)

    // Update the in-memory preferences
    preferences = {
      ...preferences,
      ...validatedPreferences,
    }

    return NextResponse.json({
      success: true,
      message: 'Notification preferences updated successfully',
      preferences,
    })
  } catch (error) {
    console.error('Error updating preferences:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid preferences data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to update preferences' },
      { status: 500 }
    )
  }
}
