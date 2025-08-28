import { NextRequest, NextResponse } from 'next/server'
import { ConvexHttpClient } from 'convex/browser'
import { api } from '@/convex/_generated/api'

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId') || 'operator_1'
    const factoryId = searchParams.get('factoryId') || 'm972psr224txp1ymcefy492v9h7nxq50'

    // Get chat sessions
    const sessions = await convex.query(api.disco3b.getChatSessions, {
      factoryId,
      userId,
      limit: 10,
    })

    // Get chat turns for the first session if it exists
    let sessionTurns: any[] = []
    if (sessions && sessions.length > 0) {
      sessionTurns = await convex.query(api.disco3b.getChatSessionTurns, {
        sessionId: sessions[0]._id,
      })
    }

    return NextResponse.json({
      success: true,
      data: {
        sessions: sessions || [],
        sessionCount: sessions?.length || 0,
        firstSessionTurns: sessionTurns,
        turnCount: sessionTurns.length,
      },
      message: 'Chat library test completed successfully',
    })
  } catch (error: any) {
    console.error('Chat library test error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        message: 'Failed to test chat library',
      },
      { status: 500 }
    )
  }
}
