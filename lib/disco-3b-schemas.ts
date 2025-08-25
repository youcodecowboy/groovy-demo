import { z } from "zod"

// Core classification and extraction schemas
export const LabelsSchema = z.array(z.string())

export const EntitiesSchema = z.array(z.string())

export const FieldsSchema = z.object({
  sku: z.string().optional(),
  po_number: z.string().optional(),
  stage: z.string().optional(),
  location: z.string().optional(),
  quantity: z.number().optional(),
  eta: z.string().optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).optional(),
  assigned_to: z.string().optional(),
}).partial()

export const EnrichmentSchema = z.object({
  labels: LabelsSchema,
  entities: EntitiesSchema,
  fields: FieldsSchema.optional(),
})

// 3B Model Output Schemas
export const ClassifyOutputSchema = z.object({
  labels: LabelsSchema,
  confidence: z.number().min(0).max(1),
  primary_label: z.string().optional(),
})

export const ExtractOutputSchema = z.object({
  fields: FieldsSchema,
  confidence: z.number().min(0).max(1),
  entities: EntitiesSchema,
})

export const AnomalyOutputSchema = z.object({
  is_anomaly: z.boolean(),
  severity: z.enum(["INFO", "WARN", "CRITICAL"]).optional(),
  reason: z.string().optional(),
  confidence: z.number().min(0).max(1),
  metrics: z.record(z.union([z.string(), z.number()])).optional(),
})

export const SummaryOutputSchema = z.object({
  summary: z.string(),
  keywords: z.array(z.string()),
  confidence: z.number().min(0).max(1),
})

export const EmbedOutputSchema = z.object({
  embedding: z.array(z.number()),
  model: z.string(),
  dimensions: z.number(),
})

// API Input/Output Schemas for /disco/3b/* routes
export const ClassifyInputSchema = z.object({
  text: z.string().min(1).max(2000),
  context: z.string().optional(),
})

export const ExtractInputSchema = z.object({
  text: z.string().min(1).max(2000),
  context: z.string().optional(),
})

export const AnomalyInputSchema = z.object({
  text: z.string().min(1).max(2000),
  metrics: z.record(z.union([z.string(), z.number()])).optional(),
  targets: z.record(z.union([z.string(), z.number()])).optional(),
})

export const SummaryInputSchema = z.object({
  events: z.array(z.string()).min(1).max(20),
  context: z.string().optional(),
})

export const EmbedInputSchema = z.object({
  text: z.string().min(1).max(2000),
})

// Combined ingest endpoint schema
export const IngestScanInputSchema = z.object({
  userId: z.string(),
  factoryId: z.string(),
  text: z.string().min(1).max(2000),
  scanType: z.enum(["qr", "barcode", "manual", "note"]).optional().default("qr"),
  context: z.object({
    itemId: z.string().optional(),
    locationId: z.string().optional(),
    stageId: z.string().optional(),
    metadata: z.record(z.any()).optional(),
  }).optional(),
})

export const IngestScanOutputSchema = z.object({
  processed: z.boolean(),
  enrichment: EnrichmentSchema,
  anomaly: AnomalyOutputSchema.optional(),
  embeddingId: z.string().optional(),
  syncStatus: z.enum(["pending", "completed", "failed"]),
  recordId: z.string().optional(),
})

// Chat API Schemas for /disco/chat/*
export const ToolCallSchema = z.object({
  type: z.enum(["send_message", "create_alert", "escalate_dashboard"]),
  payload: z.any(),
})

export const ChatAskInputSchema = z.object({
  userId: z.string(),
  factoryId: z.string(),
  text: z.string().min(1).max(1000),
})

export const ChatAskOutputSchema = z.object({
  answer: z.string(),
  citations: z.array(z.string()),
  enrichment: EnrichmentSchema,
  proposed_action: ToolCallSchema.optional(),
  confidence: z.number().min(0).max(1),
})

export const ChatActionInputSchema = z.object({
  userId: z.string(),
  factoryId: z.string(),
  action: ToolCallSchema,
})

export const ChatActionOutputSchema = z.object({
  ok: z.boolean(),
  createdIds: z.array(z.string()).optional(),
  error: z.string().optional(),
})

export const ChatToolsLabelInputSchema = z.object({
  text: z.string().min(1).max(1000),
})

export const ChatToolsLabelOutputSchema = z.object({
  labels: LabelsSchema,
  entities: EntitiesSchema,
  fields: FieldsSchema.optional(),
  confidence: z.number().min(0).max(1),
})

// Convex schema types for new tables
export const RecordsEnrichedSchema = z.object({
  factoryId: z.string(),
  originalText: z.string(),
  scanType: z.enum(["qr", "barcode", "manual", "note"]),
  enrichment: EnrichmentSchema,
  anomaly: AnomalyOutputSchema.optional(),
  embeddingId: z.string().optional(),
  userId: z.string(),
  createdAt: z.number(),
  metadata: z.record(z.any()).optional(),
})

export const EmbeddingsSchema = z.object({
  docId: z.string(),
  factoryId: z.string(),
  embedding: z.array(z.number()),
  text: z.string(),
  metadata: z.record(z.any()).optional(),
  model: z.string().default("nomic-embed-text"),
  createdAt: z.number(),
})

export const MessagesSchema = z.object({
  factoryId: z.string(),
  to: z.string(),
  from: z.string(),
  text: z.string(),
  type: z.enum(["user", "system", "automated"]).default("user"),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).optional(),
  createdAt: z.number(),
})

export const AlertsSchema = z.object({
  factoryId: z.string(),
  level: z.enum(["INFO", "WARN", "CRITICAL"]),
  title: z.string(),
  details: z.string(),
  owner: z.string().optional(),
  status: z.enum(["open", "acknowledged", "resolved"]).default("open"),
  createdAt: z.number(),
  resolvedAt: z.number().optional(),
  resolvedBy: z.string().optional(),
})

export const EscalationsSchema = z.object({
  factoryId: z.string(),
  kind: z.enum(["report", "analysis", "workflow"]),
  details: z.string(),
  requester: z.string(),
  status: z.enum(["open", "in_progress", "done"]).default("open"),
  assignedTo: z.string().optional(),
  createdAt: z.number(),
  completedAt: z.number().optional(),
})

export const FeedbackSchema = z.object({
  factoryId: z.string(),
  recordId: z.string(),
  userId: z.string(),
  type: z.enum(["thumbs_up", "thumbs_down", "correction"]),
  feedback: z.string().optional(),
  correction: z.record(z.any()).optional(),
  createdAt: z.number(),
})

// Chat turn logging schema
export const ChatTurnSchema = z.object({
  factoryId: z.string(),
  userId: z.string(),
  question: z.string(),
  answer: z.string(),
  citations: z.array(z.string()),
  enrichment: EnrichmentSchema,
  retrievedIds: z.array(z.string()).optional(),
  confidence: z.number(),
  createdAt: z.number(),
})

// Type exports for TypeScript
export type ClassifyInput = z.infer<typeof ClassifyInputSchema>
export type ClassifyOutput = z.infer<typeof ClassifyOutputSchema>
export type ExtractInput = z.infer<typeof ExtractInputSchema>
export type ExtractOutput = z.infer<typeof ExtractOutputSchema>
export type AnomalyInput = z.infer<typeof AnomalyInputSchema>
export type AnomalyOutput = z.infer<typeof AnomalyOutputSchema>
export type SummaryInput = z.infer<typeof SummaryInputSchema>
export type SummaryOutput = z.infer<typeof SummaryOutputSchema>
export type EmbedInput = z.infer<typeof EmbedInputSchema>
export type EmbedOutput = z.infer<typeof EmbedOutputSchema>

export type IngestScanInput = z.infer<typeof IngestScanInputSchema>
export type IngestScanOutput = z.infer<typeof IngestScanOutputSchema>

export type ChatAskInput = z.infer<typeof ChatAskInputSchema>
export type ChatAskOutput = z.infer<typeof ChatAskOutputSchema>
export type ChatActionInput = z.infer<typeof ChatActionInputSchema>
export type ChatActionOutput = z.infer<typeof ChatActionOutputSchema>
export type ChatToolsLabelInput = z.infer<typeof ChatToolsLabelInputSchema>
export type ChatToolsLabelOutput = z.infer<typeof ChatToolsLabelOutputSchema>

export type RecordsEnriched = z.infer<typeof RecordsEnrichedSchema>
export type Embeddings = z.infer<typeof EmbeddingsSchema>
export type Messages = z.infer<typeof MessagesSchema>
export type Alerts = z.infer<typeof AlertsSchema>
export type Escalations = z.infer<typeof EscalationsSchema>
export type Feedback = z.infer<typeof FeedbackSchema>
export type ChatTurn = z.infer<typeof ChatTurnSchema>