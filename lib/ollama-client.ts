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

  async chatResponse(question: string, context: any[], retrievedContext?: string): Promise<any> {
    const contextStr = context.map(c => `- ${JSON.stringify(c)}`).join('\n')
    
    const prompt = `
You are a production assistant for a factory floor. Answer this question based on the provided context and output JSON only:

Question: "${question}"

Recent Context:
${contextStr}

${retrievedContext ? `Additional Context: ${retrievedContext}` : ''}

Output a JSON object with:
- answer: 1-3 sentence answer
- citations: array of context record IDs referenced
- enrichment: {labels: string[], entities: string[], fields?: object}
- proposed_action?: {type: "send_message"|"create_alert"|"escalate_dashboard", payload: object}
- confidence: confidence score 0-1

Keep answers concise and production-focused.

Example: {"answer": "PO123 is in the washing stage with an ETA of 2 hours.", "citations": ["rec_456"], "enrichment": {"labels": ["STAGE"], "entities": ["PO123", "washing"], "fields": {"po_number": "PO123", "stage": "washing"}}, "confidence": 0.89}
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