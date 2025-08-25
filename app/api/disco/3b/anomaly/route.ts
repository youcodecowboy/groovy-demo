import { NextRequest, NextResponse } from 'next/server'
import { createOllamaClient, isDisco3BEnabled } from '@/lib/ollama-client'
import { AnomalyInputSchema, AnomalyOutputSchema } from '@/lib/disco-3b-schemas'
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
    const input = AnomalyInputSchema.parse(body)

    // Create Ollama client and detect anomaly
    const client = createOllamaClient()
    const result = await client.detectAnomaly(input.text, input.metrics, input.targets)

    // Validate output schema
    const validatedResult = AnomalyOutputSchema.parse(result)

    return NextResponse.json(validatedResult)
  } catch (error) {
    console.error('Anomaly detection error:', error)

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