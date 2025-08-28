import { NextRequest, NextResponse } from 'next/server'
import { createOllamaClient, isDisco3BEnabled } from '@/lib/ollama-client'
import { ClassifyInputSchema, ClassifyOutputSchema } from '@/lib/disco-3b-schemas'
import { z } from 'zod'

export async function POST(request: NextRequest) {
  try {
    // Check feature flag
    if (!isDisco3BEnabled()) {
      return NextResponse.json(
        { error: 'Disco 3B integration is disabled' },
        { status: 403 }
      )
    }

    // Parse and validate input
    const body = await request.json()
    const input = ClassifyInputSchema.parse(body)

    // Create Ollama client and classify
    const client = createOllamaClient()
    const result = await client.classify(input.text, input.context)

    // Validate output schema
    const validatedResult = ClassifyOutputSchema.parse(result)

    return NextResponse.json(validatedResult)
  } catch (error) {
    console.error('Classify error:', error)

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
