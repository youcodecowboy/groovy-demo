/**
 * Ollama client for Disco 3B model interactions
 * Handles communication with local Ollama instance
 */

import { z } from 'zod'

export interface OllamaConfig {
  baseUrl: string
  model: string
  timeout?: number
}

export interface OllamaResponse {
  model: string
  created_at: string
  response: string
  done: boolean
  context?: number[]
  total_duration?: number
  load_duration?: number
  prompt_eval_count?: number
  prompt_eval_duration?: number
  eval_count?: number
  eval_duration?: number
}

export interface OllamaGenerateRequest {
  model: string
  prompt: string
  stream?: boolean
  raw?: boolean
  format?: 'json'
  options?: {
    temperature?: number
    top_p?: number
    top_k?: number
    repeat_penalty?: number
    num_ctx?: number
  }
}

export class OllamaClient {
  private config: OllamaConfig

  constructor(config: OllamaConfig) {
    this.config = {
      timeout: 30000,
      ...config
    }
  }

  async generate(request: Omit<OllamaGenerateRequest, 'model'>): Promise<OllamaResponse> {
    const url = `${this.config.baseUrl}/api/generate`
    
    const body: OllamaGenerateRequest = {
      model: this.config.model,
      stream: false,
      format: 'json',
      ...request,
    }

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout)

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new Error(`Ollama request failed: ${response.status} ${response.statusText}`)
      }

      const result = await response.json()
      return result as OllamaResponse
    } catch (error) {
      clearTimeout(timeoutId)
      
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error(`Ollama request timed out after ${this.config.timeout}ms`)
      }
      
      throw error
    }
  }

  async classify(text: string, context?: string): Promise<any> {
    const prompt = `
Classify the following production event text and output JSON only:

Text: "${text}"
${context ? `Context: "${context}"` : ''}

Output a JSON object with:
- labels: array of relevant classification labels
- confidence: confidence score 0-1
- primary_label: most relevant single label

Valid labels: STAGE, DEFECT, LOGISTICS, INVENTORY, MAINTENANCE, PERSONNEL, ALERT

Example: {"labels": ["STAGE", "LOGISTICS"], "confidence": 0.85, "primary_label": "STAGE"}
`

    const response = await this.generate({ prompt })
    
    try {
      return JSON.parse(response.response)
    } catch (error) {
      // Attempt to extract JSON from response
      const jsonMatch = response.response.match(/\{.*\}/s)
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0])
      }
      throw new Error('Failed to parse classification response as JSON')
    }
  }

  async extract(text: string, context?: string): Promise<any> {
    const prompt = `
Extract structured fields from this production event text and output JSON only:

Text: "${text}"
${context ? `Context: "${context}"` : ''}

Output a JSON object with:
- fields: object with extracted values (sku, po_number, stage, location, quantity, eta, priority, assigned_to)
- confidence: confidence score 0-1
- entities: array of named entities found

Example: {"fields": {"sku": "ABC-123", "stage": "cutting", "quantity": 50}, "confidence": 0.9, "entities": ["ABC-123", "cutting"]}
`

    const response = await this.generate({ prompt })
    
    try {
      return JSON.parse(response.response)
    } catch (error) {
      const jsonMatch = response.response.match(/\{.*\}/s)
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0])
      }
      throw new Error('Failed to parse extraction response as JSON')
    }
  }

  async detectAnomaly(text: string, metrics?: Record<string, any>, targets?: Record<string, any>): Promise<any> {
    const prompt = `
Analyze this production event for anomalies and output JSON only:

Text: "${text}"
${metrics ? `Current Metrics: ${JSON.stringify(metrics)}` : ''}
${targets ? `Target Metrics: ${JSON.stringify(targets)}` : ''}

Look for:
- Timing delays (>20% over target)
- Quality issues (defect rate >5%)  
- Capacity issues (>90% utilization)
- Unusual patterns

Output a JSON object with:
- is_anomaly: boolean
- severity: "INFO" | "WARN" | "CRITICAL" (if anomaly)
- reason: string explanation (if anomaly)
- confidence: confidence score 0-1
- metrics: relevant metrics object (optional)

Example: {"is_anomaly": true, "severity": "WARN", "reason": "Processing time 35% above target", "confidence": 0.78}
`

    const response = await this.generate({ prompt })
    
    try {
      return JSON.parse(response.response)
    } catch (error) {
      const jsonMatch = response.response.match(/\{.*\}/s)
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0])
      }
      throw new Error('Failed to parse anomaly response as JSON')
    }
  }

  async summarize(events: string[], context?: string): Promise<any> {
    const prompt = `
Summarize these production events into a concise shift summary and output JSON only:

Events:
${events.map((event, i) => `${i + 1}. ${event}`).join('\n')}

${context ? `Context: "${context}"` : ''}

Output a JSON object with:
- summary: 1-3 sentence summary
- keywords: array of key terms
- confidence: confidence score 0-1

Focus on production status, issues, and progress.

Example: {"summary": "Cutting stage completed on schedule with 2 minor quality issues flagged for review.", "keywords": ["cutting", "quality", "review"], "confidence": 0.92}
`

    const response = await this.generate({ prompt })
    
    try {
      return JSON.parse(response.response)
    } catch (error) {
      const jsonMatch = response.response.match(/\{.*\}/s)
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0])
      }
      throw new Error('Failed to parse summary response as JSON')
    }
  }

  async chatResponse(question: string, context: any[], retrievedContext?: string, conversationHistory?: Array<{type: 'user' | 'assistant', content: string}>): Promise<any> {
    // Organize context by type for better understanding
    const purchaseOrders = context.filter(c => c.type === 'purchase_order').map(c => c.data)
    const items = context.filter(c => c.type === 'item').map(c => c.data)
    const scans = context.filter(c => c.type === 'scan').map(c => c.data)
    const enrichedRecords = context.filter(c => c.type === 'enriched_record' || !c.type).map(c => c)
    
    const contextStr = `
FACTORY DATA SUMMARY:

PURCHASE ORDERS:
${purchaseOrders.length > 0 ? purchaseOrders.map(po => {
  const client = po.poNumber.includes('FLIGHT') ? 'Flight Suit Project' : 
                 po.poNumber.includes('SW') ? 'Star Wars Project' : 'Unknown';
  return `- ${po.poNumber}: ${po.status}, ${po.items?.length || 0} items, $${po.totalValue} (${client})`;
}).join('\n') : 'No active purchase orders'}

ACTIVE ITEMS BY STAGE:
${items.length > 0 ? items.reduce((acc, item) => {
  const stage = item.currentStageId;
  acc[stage] = (acc[stage] || 0) + 1;
  return acc;
}, {} as Record<string, number>) : 'No active items'}

ENRICHED RECORDS (Recent Activity):
${enrichedRecords.map(record => `- ${record.originalText} | Stage: ${record.enrichment?.fields?.stage || 'unknown'} | Quantity: ${record.enrichment?.fields?.quantity || 'unknown'} | PO: ${record.enrichment?.fields?.po_number || 'unknown'}`).join('\n')}

ALERTS:
${enrichedRecords.filter(r => r.type === 'alert').map(alert => `- ${alert.level}: ${alert.title} - ${alert.details}`).join('\n')}

IMPORTANT FILTERING RULES:
- If asked about "empire", "Star Wars", or "SW", only reference orders with "SW" in the PO number
- If asked about "flight suits", "flight", or "FLIGHT", only reference orders with "FLIGHT" in the PO number  
- If asked about a specific PO number, only reference that exact PO
- Do not mix up different clients or projects
- Always cite the specific PO numbers you're referencing
`
    
    const prompt = `
You are Disco, a friendly and knowledgeable production assistant for a factory floor! 🎵

${conversationHistory && conversationHistory.length > 0 ? `CONVERSATION HISTORY:
${conversationHistory.slice(-3).map(msg => `${msg.type === 'user' ? 'User' : 'Disco'}: ${msg.content}`).join('\n')}

` : ''}Current Question: "${question}"

${contextStr ? `Factory Data: ${contextStr}` : ''}
${retrievedContext ? `Additional Context: ${retrievedContext}` : ''}

RESPONSE FORMAT:
ALWAYS provide a conversational, human-readable answer in the "answer" field. Never return raw JSON data as the answer.

For factory-related questions (about production, orders, items, stages, etc.):
- Use bullet points and structured formatting for easy scanning
- Start with a brief, friendly overview
- Break down information into clear, scannable sections
- Use bullet points for:
  • Key findings and numbers
  • Current status and progress
  • Issues or concerns
  • Recommended actions
- Keep it factory-friendly: quick to read, easy to act on
- Suggest actions for defects, quality issues, notifications, escalations

For general conversation questions (about cartoons, movies, trivia, etc.):
- Be conversational and friendly
- Share your knowledge and enthusiasm with detailed, engaging responses
- You can mention that you're Disco, the factory assistant, but you love chatting about all sorts of topics!
- Keep it fun and engaging - feel free to be detailed and share interesting facts
- Don't be afraid to elaborate and make the conversation enjoyable

IMPORTANT: For factory questions, use structured formatting with bullet points to make information easy to scan quickly. Factory workers need fast, actionable information.

EXAMPLE FORMAT FOR FACTORY QUESTIONS:
"Hey there! Here's what I found:

• **Current Status**: [key finding]
• **Details**: [specific numbers/info]
• **Issues**: [any problems found]
• **Recommendations**: [suggested actions]

Let me know if you need anything else!"

FACTORY ACTIONS TO SUGGEST:
- User mentions defects, quality issues, or problems → suggest create_alert
- User asks to notify someone or send a message → suggest send_message  
- User mentions escalation, analysis, or reports → suggest escalate_dashboard
- User reports urgent issues or critical problems → suggest create_alert with CRITICAL level
- User wants to send notifications to mission control → suggest send_notification
- User mentions system alerts or important updates → suggest send_notification with appropriate priority

Remember: You're Disco - be friendly, helpful, and make factory work a bit more fun! 🎉
`

    const response = await this.generate({ prompt })
    
    try {
      return JSON.parse(response.response)
    } catch (error) {
      const jsonMatch = response.response.match(/\{.*\}/s)
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0])
      }
      throw new Error('Failed to parse chat response as JSON')
    }
  }

  async embed(text: string): Promise<number[]> {
    // For now, return a mock embedding. In production, you'd call a separate embedding model
    // like nomic-embed-text through Ollama or another service
    const mockEmbedding = new Array(768).fill(0).map(() => Math.random() * 2 - 1)
    return mockEmbedding
  }

  async isHealthy(): Promise<boolean> {
    try {
      const response = await fetch(`${this.config.baseUrl}/api/tags`, {
        timeout: 5000,
      } as any)
      return response.ok
    } catch {
      return false
    }
  }
}

// Factory function to create configured client
export function createOllamaClient(): OllamaClient {
  const config: OllamaConfig = {
    baseUrl: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
    model: process.env.DISCO_3B_MODEL || 'disco-3b',
    timeout: 30000,
  }
  
  return new OllamaClient(config)
}

// Feature flag helpers
export function isDisco3BEnabled(): boolean {
  return process.env.ENABLE_DISCO_3B === 'true'
}

export function isDiscoChatEnabled(): boolean {
  return process.env.ENABLE_DISCO_CHAT === 'true'
}
