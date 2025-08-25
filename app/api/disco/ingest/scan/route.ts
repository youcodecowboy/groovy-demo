import { NextRequest, NextResponse } from 'next/server'
import { createOllamaClient, isDisco3BEnabled } from '@/lib/ollama-client'
import { IngestScanInputSchema, IngestScanOutputSchema } from '@/lib/disco-3b-schemas'
import { z } from 'zod'
import { ConvexHttpClient } from 'convex/browser'
import { api } from '@/convex/_generated/api'

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!)

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
    const input = IngestScanInputSchema.parse(body)

    const client = createOllamaClient()
    
    // 1. Classify the scan text
    const classifyResult = await client.classify(input.text, JSON.stringify(input.context))
    
    // 2. Extract structured fields
    const extractResult = await client.extract(input.text, JSON.stringify(input.context))
    
    // 3. Generate embedding
    const embedding = await client.embed(input.text)
    
    // 4. Check for anomalies (if metrics are provided)
    let anomalyResult = undefined
    if (input.context?.metadata) {
      try {
        anomalyResult = await client.detectAnomaly(input.text, input.context.metadata)
      } catch (error) {
        console.warn('Anomaly detection failed:', error)
      }
    }

    // Combine enrichment data
    const enrichment = {
      labels: classifyResult.labels || [],
      entities: extractResult.entities || [],
      fields: extractResult.fields,
    }

    // Start background sync to Convex (non-blocking)
    const syncPromise = backgroundSync({
      input,
      enrichment,
      anomaly: anomalyResult,
      embedding,
    })

    // Return immediately (don't wait for sync)
    const result = {
      processed: true,
      enrichment,
      anomaly: anomalyResult,
      embeddingId: undefined, // Will be set after sync
      syncStatus: 'pending' as const,
      recordId: undefined, // Will be set after sync
    }

    // Validate output
    const validatedResult = IngestScanOutputSchema.parse(result)

    // Fire and forget the sync
    syncPromise.catch(error => {
      console.error('Background sync failed:', error)
    })

    return NextResponse.json(validatedResult)
  } catch (error) {
    console.error('Scan ingest error:', error)

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

// Background sync function (non-blocking)
async function backgroundSync({
  input,
  enrichment,
  anomaly,
  embedding,
}: {
  input: any
  enrichment: any
  anomaly: any
  embedding: number[]
}) {
  try {
    // Create embedding record first
    const embeddingId = await convex.mutation(api.disco3b.createEmbedding, {
      docId: `scan_${Date.now()}`,
      factoryId: input.factoryId,
      embedding,
      text: input.text,
      metadata: input.context,
      model: 'nomic-embed-text',
    })

    // Create enriched record
    const recordId = await convex.mutation(api.disco3b.createEnrichedRecord, {
      factoryId: input.factoryId,
      originalText: input.text,
      scanType: input.scanType,
      enrichment,
      anomaly,
      embeddingId,
      userId: input.userId,
      metadata: input.context,
    })

    console.log('Background sync completed:', { recordId, embeddingId })
    return { recordId, embeddingId }
  } catch (error) {
    console.error('Background sync error:', error)
    throw error
  }
}