import { NextRequest, NextResponse } from 'next/server'
import { createOllamaClient, isDiscoChatEnabled } from '@/lib/ollama-client'
import { ChatAskInputSchema, ChatAskOutputSchema } from '@/lib/disco-3b-schemas'
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
    const input = ChatAskInputSchema.parse(body)

    const client = createOllamaClient()
    
    // 1. Classify/extract the query
    const [classifyResult, extractResult] = await Promise.all([
      client.classify(input.text),
      client.extract(input.text),
    ])

    // 2. Retrieve relevant context from Convex
    const context = await convex.query(api.disco3b.getLatestContext, {
      factoryId: input.factoryId,
      limit: 10,
    })

    // 3. Optional: Vector search for relevant records
    let retrievedRecords: any[] = []
    try {
      // Generate embedding for the question
      const embedding = await client.embed(input.text)
      
      // Search for similar records
      const vectorResults = await convex.action(api.disco3b.searchEmbeddings, {
        factoryId: input.factoryId,
        embedding,
        limit: 5,
      })
      
      retrievedRecords = vectorResults
    } catch (error) {
      console.warn('Vector search failed, continuing with basic context:', error)
    }

    // 4. Generate answer using the 3B model
    const allContext = [
      ...context.enrichedRecords,
      ...context.alerts,
      ...context.escalations,
      ...retrievedRecords,
    ]

    const chatResult = await client.chatResponse(
      input.text,
      allContext,
      retrievedRecords.length > 0 ? 'Vector search results included' : undefined
    )

    // 5. Combine enrichment data
    const enrichment = {
      labels: [...(classifyResult.labels || []), ...(chatResult.enrichment?.labels || [])],
      entities: [...(extractResult.entities || []), ...(chatResult.enrichment?.entities || [])],
      fields: { ...extractResult.fields, ...chatResult.enrichment?.fields },
    }

    const result = {
      answer: chatResult.answer,
      citations: chatResult.citations || [],
      enrichment,
      proposed_action: chatResult.proposed_action,
      confidence: chatResult.confidence,
    }

    // 6. Log the conversation turn (background, non-blocking)
    const logPromise = convex.mutation(api.disco3b.createChatTurn, {
      factoryId: input.factoryId,
      userId: input.userId,
      question: input.text,
      answer: result.answer,
      citations: result.citations,
      enrichment: result.enrichment,
      retrievedIds: retrievedRecords.map(r => r._id).filter(Boolean),
      confidence: result.confidence,
    })

    // Validate output
    const validatedResult = ChatAskOutputSchema.parse(result)

    // Fire and forget the logging
    logPromise.catch(error => {
      console.error('Chat turn logging failed:', error)
    })

    return NextResponse.json(validatedResult)
  } catch (error) {
    console.error('Chat ask error:', error)

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