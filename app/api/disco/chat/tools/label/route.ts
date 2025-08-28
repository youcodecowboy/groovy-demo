import { NextRequest, NextResponse } from 'next/server'
import { createOllamaClient, isDiscoChatEnabled } from '@/lib/ollama-client'
import { ChatToolsLabelInputSchema, ChatToolsLabelOutputSchema } from '@/lib/disco-3b-schemas'
import { z } from 'zod'

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
    const input = ChatToolsLabelInputSchema.parse(body)

    const client = createOllamaClient()
    
    // Classify and extract in parallel
    const [classifyResult, extractResult] = await Promise.all([
      client.classify(input.text),
      client.extract(input.text),
    ])

    const result = {
      labels: classifyResult.labels || [],
      entities: extractResult.entities || [],
      fields: extractResult.fields,
      confidence: Math.min(
        classifyResult.confidence || 0,
        extractResult.confidence || 0
      ),
    }

    // Validate output
    const validatedResult = ChatToolsLabelOutputSchema.parse(result)

    return NextResponse.json(validatedResult)
  } catch (error) {
    console.error('Chat tools label error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }

    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
