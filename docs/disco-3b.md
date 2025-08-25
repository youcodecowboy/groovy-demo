# Disco 3B LLM Integration

This document describes the integration of a local 3B quantized LLM (Llama 3.2 3B) into the Disco factory floor application for production assistance tasks.

## Overview

The Disco 3B integration adds AI-powered capabilities to process raw text events, classify them, extract structured data, detect anomalies, and provide production insights. The system uses Ollama to run the model locally on factory devices (smartphones/tablets).

## Features

- **Event Classification**: Automatically categorize factory events (STAGE, DEFECT, LOGISTICS, etc.)
- **Data Extraction**: Extract structured fields like SKU, PO numbers, stages, locations
- **Anomaly Detection**: Identify timing delays, quality issues, and capacity problems
- **Text Summarization**: Generate concise shift summaries from event batches
- **Vector Embeddings**: Create searchable embeddings for semantic retrieval
- **Background Sync**: Non-blocking data sync to Convex backend

## Prerequisites

### 1. Ollama Installation

Install Ollama on your development machine or factory device:

```bash
# Linux/macOS
curl -fsSL https://ollama.ai/install.sh | sh

# Start Ollama service
ollama serve
```

### 2. Model Setup

Create and deploy the disco-3b model:

```bash
# Create the model from the Modelfile
ollama create disco-3b -f Modelfile.disco-3b

# Pull the base model if needed
ollama pull llama3.2:3b-instruct

# Verify the model is available
ollama list
```

### 3. Environment Configuration

Set up environment variables in `.env.local`:

```bash
# Enable Disco 3B features
ENABLE_DISCO_3B=true
NEXT_PUBLIC_ENABLE_DISCO_3B=true

# Ollama configuration
OLLAMA_BASE_URL=http://localhost:11434
DISCO_3B_MODEL=disco-3b

# Convex (required for data sync)
NEXT_PUBLIC_CONVEX_URL=your_convex_url
```

## API Endpoints

### Classification: `/api/disco/3b/classify`

Classify production events into predefined categories.

**Request:**
```bash
curl -X POST http://localhost:3000/api/disco/3b/classify \
  -H "Content-Type: application/json" \
  -d '{
    "text": "QR scan at cutting station for item ABC-123, moved to sewing queue",
    "context": "Station: cutting-01, Operator: john.doe"
  }'
```

**Response:**
```json
{
  "labels": ["STAGE", "LOGISTICS"],
  "confidence": 0.89,
  "primary_label": "STAGE"
}
```

### Extraction: `/api/disco/3b/extract`

Extract structured data from production events.

**Request:**
```bash
curl -X POST http://localhost:3000/api/disco/3b/extract \
  -H "Content-Type: application/json" \
  -d '{
    "text": "PO-456 batch of 100 units at washing stage, ETA 14:30, assigned to team-lead-sarah"
  }'
```

**Response:**
```json
{
  "fields": {
    "po_number": "PO-456",
    "quantity": 100,
    "stage": "washing",
    "eta": "14:30",
    "assigned_to": "team-lead-sarah"
  },
  "confidence": 0.92,
  "entities": ["PO-456", "washing", "team-lead-sarah"]
}
```

### Anomaly Detection: `/api/disco/3b/anomaly`

Detect anomalies in production metrics and timing.

**Request:**
```bash
curl -X POST http://localhost:3000/api/disco/3b/anomaly \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Cutting stage completed in 45 minutes for batch XYZ",
    "metrics": {"actual_time": 45, "batch_size": 50},
    "targets": {"target_time": 30, "max_deviation": 20}
  }'
```

**Response:**
```json
{
  "is_anomaly": true,
  "severity": "WARN",
  "reason": "Processing time 50% above target (45min vs 30min)",
  "confidence": 0.87,
  "metrics": {
    "deviation_percent": 50,
    "category": "timing_delay"
  }
}
```

### Summarization: `/api/disco/3b/summarize`

Generate summaries from multiple production events.

**Request:**
```bash
curl -X POST http://localhost:3000/api/disco/3b/summarize \
  -H "Content-Type: application/json" \
  -d '{
    "events": [
      "Batch A completed cutting stage",
      "Quality issue flagged on Batch B - rework needed",
      "PO-789 shipped on schedule",
      "Maintenance completed on sewing machine 3"
    ],
    "context": "Day shift summary"
  }'
```

**Response:**
```json
{
  "summary": "Day shift completed 3 major milestones with 1 quality issue requiring rework. Maintenance on sewing machine 3 successful.",
  "keywords": ["cutting", "quality", "rework", "shipped", "maintenance"],
  "confidence": 0.91
}
```

### Embeddings: `/api/disco/3b/embed`

Generate vector embeddings for semantic search.

**Request:**
```bash
curl -X POST http://localhost:3000/api/disco/3b/embed \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Quality inspection completed for batch DEF-789"
  }'
```

**Response:**
```json
{
  "embedding": [0.1234, -0.5678, 0.9012, ...],
  "model": "nomic-embed-text",
  "dimensions": 768
}
```

### Integrated Scan Processing: `/api/disco/ingest/scan`

Process a scan event through the complete pipeline (classify, extract, embed, sync).

**Request:**
```bash
curl -X POST http://localhost:3000/api/disco/ingest/scan \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "operator-123",
    "factoryId": "factory-demo",
    "text": "QR scan: Item SKU-456 at quality station, defect found - needs rework",
    "scanType": "qr",
    "context": {
      "itemId": "item-456",
      "locationId": "quality-01",
      "stageId": "quality-check",
      "metadata": {"scanner_id": "qr-scanner-02"}
    }
  }'
```

**Response:**
```json
{
  "processed": true,
  "enrichment": {
    "labels": ["DEFECT", "STAGE"],
    "entities": ["SKU-456", "quality", "rework"],
    "fields": {
      "sku": "SKU-456",
      "stage": "quality-check",
      "priority": "HIGH"
    }
  },
  "anomaly": {
    "is_anomaly": true,
    "severity": "CRITICAL",
    "reason": "Quality defect detected requiring rework",
    "confidence": 0.94
  },
  "syncStatus": "pending",
  "embeddingId": null,
  "recordId": null
}
```

## Performance Guidelines

### Model Optimization

- **Token Limits**: Keep prompts under 300-400 tokens for <1s response time
- **Temperature**: Use low temperature (0.1) for structured outputs
- **Context**: Provide minimal, relevant context only

### Error Handling

The system includes automatic JSON repair and fallback mechanisms:

1. Primary JSON parsing attempt
2. Regex extraction of JSON from response
3. Error logging and graceful degradation

### Monitoring

Monitor these metrics for production deployment:

- Response time per endpoint (target: <1s)
- Token usage per request (target: <300 tokens)
- Classification accuracy (track feedback)
- System resource usage (CPU/Memory on device)

## Troubleshooting

### Common Issues

**1. "Disco 3B integration is disabled"**
- Check `ENABLE_DISCO_3B=true` in environment
- Verify `NEXT_PUBLIC_ENABLE_DISCO_3B=true` for client-side features

**2. "Ollama request failed: 404"**
- Ensure Ollama is running: `ollama serve`
- Verify model exists: `ollama list`
- Check base URL: `OLLAMA_BASE_URL=http://localhost:11434`

**3. "Failed to parse response as JSON"**
- Model may need fine-tuning for JSON output
- Check model temperature (should be low)
- Review system prompt in Modelfile

**4. Slow response times**
- Reduce context size in prompts
- Consider using smaller model
- Monitor token usage per request

### Development Testing

Enable features for testing in development:

```javascript
// In browser console
enableDisco3BForTesting()
console.log('Disco 3B enabled for testing')

// Clear overrides
clearFeatureFlagOverrides()
```

## Data Models

### Convex Tables

The integration adds these new tables to Convex:

- `recordsEnriched`: Processed scan events with AI enrichment
- `embeddings`: Vector embeddings for semantic search
- `feedback`: User feedback for model improvement

### Schema Validation

All API inputs/outputs are validated using Zod schemas defined in `lib/disco-3b-schemas.ts`.

## Security Considerations

- All processing happens locally (no external API calls)
- Feature flags provide granular control
- Convex sync is optional and non-blocking
- User permissions enforced at API level

## Next Steps

1. Deploy Ollama on factory devices
2. Create the disco-3b model using the provided Modelfile
3. Enable feature flags in production environment
4. Monitor performance and accuracy metrics
5. Collect user feedback for model improvements