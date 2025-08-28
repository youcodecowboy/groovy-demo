# Disco 3B Testing Guide

## Overview
This document provides comprehensive testing scenarios for the Disco 3B LLM integration, showing raw input data vs enriched output, and when Disco should trigger alerts or messages.

## Test Environment Setup

### Prerequisites
- Ollama running on `localhost:11434`
- `disco-3b` model created and available
- Next.js server running on `localhost:3000`
- Convex dev server running on `localhost:3001`
- Feature flags enabled in `.env.local`

### Environment Variables
```bash
ENABLE_DISCO_3B=true
ENABLE_DISCO_CHAT=true
NEXT_PUBLIC_ENABLE_DISCO_3B=true
NEXT_PUBLIC_ENABLE_DISCO_CHAT=true
OLLAMA_BASE_URL=http://localhost:11434
DISCO_3B_MODEL=disco-3b
```

## 1. Raw vs Enriched Data Testing

### Test 1.1: Basic QR Scan Event

**Raw Input:**
```json
{
  "text": "QR scan at cutting station for item ABC-123, quantity 50, ETA 2 hours"
}
```

**Expected Enriched Output:**
```json
{
  "labels": ["STAGE", "LOGISTICS"],
  "entities": ["ABC-123", "cutting"],
  "fields": {
    "sku": "ABC-123",
    "stage": "cutting",
    "quantity": 50,
    "eta": "2 hours"
  },
  "confidence": 0.8
}
```

**Test Command:**
```bash
curl -X POST http://localhost:3000/api/disco/3b/extract \
  -H "Content-Type: application/json" \
  -d '{"text": "QR scan at cutting station for item ABC-123, quantity 50, ETA 2 hours"}' \
  | jq '.'
```

### Test 1.2: Quality Issue Event

**Raw Input:**
```json
{
  "text": "Defect detected in batch XYZ-789, 15% failure rate, sewing stage"
}
```

**Expected Enriched Output:**
```json
{
  "labels": ["DEFECT", "ALERT"],
  "entities": ["XYZ-789", "sewing"],
  "fields": {
    "sku": "XYZ-789",
    "stage": "sewing",
    "defect_rate": 15
  },
  "confidence": 0.9
}
```

**Test Command:**
```bash
curl -X POST http://localhost:3000/api/disco/3b/extract \
  -H "Content-Type: application/json" \
  -d '{"text": "Defect detected in batch XYZ-789, 15% failure rate, sewing stage"}' \
  | jq '.'
```

### Test 1.3: Maintenance Event

**Raw Input:**
```json
{
  "text": "Machine breakdown at washing station, urgent maintenance required"
}
```

**Expected Enriched Output:**
```json
{
  "labels": ["MAINTENANCE", "ALERT"],
  "entities": ["washing station", "maintenance"],
  "fields": {
    "stage": "washing",
    "priority": "CRITICAL"
  },
  "confidence": 0.95
}
```

## 2. Anomaly Detection Testing

### Test 2.1: Timing Anomaly

**Raw Input:**
```json
{
  "text": "Cutting machine running 3 hours behind schedule",
  "metrics": {
    "target_time": 2,
    "actual_time": 5,
    "defect_rate": 8,
    "target_defect_rate": 3
  }
}
```

**Expected Anomaly Output:**
```json
{
  "is_anomaly": true,
  "severity": "CRITICAL",
  "reason": "Timing delays (>20% over target) and Quality issues (defect rate >5%)",
  "confidence": 0.93,
  "metrics": {
    "target_time": 2,
    "actual_time": 5,
    "defect_rate": 8,
    "target_defect_rate": 3
  }
}
```

**Test Command:**
```bash
curl -X POST http://localhost:3000/api/disco/3b/anomaly \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Cutting machine running 3 hours behind schedule",
    "metrics": {
      "target_time": 2,
      "actual_time": 5,
      "defect_rate": 8,
      "target_defect_rate": 3
    }
  }' | jq '.'
```

### Test 2.2: Quality Anomaly

**Raw Input:**
```json
{
  "text": "Defect rate at 12% in sewing department",
  "metrics": {
    "defect_rate": 12,
    "target_defect_rate": 3,
    "daily_target": 100,
    "actual_completed": 85
  }
}
```

**Expected Anomaly Output:**
```json
{
  "is_anomaly": true,
  "severity": "CRITICAL",
  "reason": "Quality issues (defect rate >5%) and Capacity issues (>90% utilization)",
  "confidence": 0.95
}
```

## 3. Alert Trigger Scenarios

### Test 3.1: Critical Maintenance Alert

**Scenario:** Machine breakdown requiring immediate attention

**Raw Input:**
```json
{
  "text": "Critical: Cutting machine completely down, production halted"
}
```

**Expected Alert Trigger:**
```json
{
  "should_alert": true,
  "alert_level": "CRITICAL",
  "alert_title": "Critical Machine Failure",
  "alert_details": "Cutting machine completely down, production halted",
  "assigned_to": "maintenance_team"
}
```

**Test Command:**
```bash
curl -X POST http://localhost:3000/api/disco/chat/ask \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "operator_1",
    "factoryId": "demo",
    "text": "Critical: Cutting machine completely down, production halted"
  }' | jq '.'
```

### Test 3.2: Quality Alert

**Scenario:** High defect rate detected

**Raw Input:**
```json
{
  "text": "Defect rate at 18% in sewing - need immediate QC intervention"
}
```

**Expected Alert Trigger:**
```json
{
  "should_alert": true,
  "alert_level": "CRITICAL",
  "alert_title": "High Defect Rate Detected",
  "alert_details": "Defect rate at 18% in sewing - need immediate QC intervention",
  "assigned_to": "quality_team"
}
```

### Test 3.3: Inventory Alert

**Scenario:** Low stock requiring reorder

**Raw Input:**
```json
{
  "text": "Fabric inventory critically low - only 5% remaining"
}
```

**Expected Alert Trigger:**
```json
{
  "should_alert": true,
  "alert_level": "WARN",
  "alert_title": "Low Inventory Alert",
  "alert_details": "Fabric inventory critically low - only 5% remaining",
  "assigned_to": "procurement_team"
}
```

## 4. Message Trigger Scenarios

### Test 4.1: Shift Handover Message

**Scenario:** Important information for next shift

**Raw Input:**
```json
{
  "text": "Shift ending - 3 items still in cutting queue, machine needs calibration"
}
```

**Expected Message Trigger:**
```json
{
  "should_message": true,
  "message_to": "next_shift_lead",
  "message_text": "Shift handover: 3 items in cutting queue, machine needs calibration",
  "priority": "MEDIUM"
}
```

### Test 4.2: Team Coordination Message

**Scenario:** Cross-department coordination needed

**Raw Input:**
```json
{
  "text": "Large order coming through - need sewing team ready in 2 hours"
}
```

**Expected Message Trigger:**
```json
{
  "should_message": true,
  "message_to": "sewing_team",
  "message_text": "Large order incoming - prepare for increased workload in 2 hours",
  "priority": "HIGH"
}
```

## 5. Integrated Scan Testing

### Test 5.1: Complete Event Processing

**Raw Input:**
```json
{
  "userId": "operator_1",
  "factoryId": "demo",
  "text": "QR scan: Item DEF-456 at sewing station, quantity 75, defect rate 8%"
}
```

**Expected Enriched Output:**
```json
{
  "processed": true,
  "enrichment": {
    "labels": ["STAGE", "DEFECT", "ALERT"],
    "entities": ["DEF-456", "sewing"],
    "fields": {
      "sku": "DEF-456",
      "stage": "sewing",
      "quantity": 75,
      "defect_rate": 8
    }
  },
  "anomaly": {
    "is_anomaly": true,
    "severity": "CRITICAL",
    "reason": "Quality issues (defect rate >5%)"
  },
  "actions": {
    "should_alert": true,
    "alert_level": "CRITICAL",
    "alert_title": "High Defect Rate in Sewing",
    "alert_details": "Item DEF-456 showing 8% defect rate at sewing station"
  },
  "syncStatus": "pending"
}
```

**Test Command:**
```bash
curl -X POST http://localhost:3000/api/disco/ingest/scan \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "operator_1",
    "factoryId": "demo",
    "text": "QR scan: Item DEF-456 at sewing station, quantity 75, defect rate 8%"
  }' | jq '.'
```

## 6. Chat Interaction Testing

### Test 6.1: Status Inquiry

**User Input:**
```
"What's the current status of the cutting department?"
```

**Expected Response:**
```json
{
  "answer": "The cutting department is currently processing item ABC-123 with 50 units. We're running slightly behind schedule but should catch up within the next hour.",
  "citations": ["record_id_1", "record_id_2"],
  "enrichment": {
    "labels": ["STAGE", "LOGISTICS"],
    "entities": ["cutting", "ABC-123"],
    "fields": {
      "stage": "cutting",
      "quantity": 50
    }
  },
  "confidence": 0.85
}
```

### Test 6.2: Problem Reporting

**User Input:**
```
"We have a problem with the washing machine - it's making strange noises"
```

**Expected Response:**
```json
{
  "answer": "I've detected a potential maintenance issue with the washing machine. Let me create an alert for the maintenance team to investigate the strange noises.",
  "citations": ["record_id_3"],
  "enrichment": {
    "labels": ["MAINTENANCE", "ALERT"],
    "entities": ["washing machine", "maintenance"],
    "fields": {
      "stage": "washing",
      "priority": "MEDIUM"
    }
  },
  "proposed_action": {
    "type": "create_alert",
    "payload": {
      "level": "WARN",
      "title": "Washing Machine Maintenance Alert",
      "details": "Washing machine making strange noises - requires investigation"
    }
  },
  "confidence": 0.9
}
```

## 7. Performance Testing

### Test 7.1: Response Time

**Expected Performance:**
- Classification: < 2 seconds
- Extraction: < 2 seconds
- Anomaly Detection: < 3 seconds
- Chat Response: < 5 seconds
- Integrated Scan: < 4 seconds

**Test Command:**
```bash
time curl -X POST http://localhost:3000/api/disco/3b/classify \
  -H "Content-Type: application/json" \
  -d '{"text": "QR scan at cutting station for item ABC-123"}' \
  > /dev/null
```

### Test 7.2: Concurrent Requests

**Test Command:**
```bash
for i in {1..5}; do
  curl -X POST http://localhost:3000/api/disco/3b/classify \
    -H "Content-Type: application/json" \
    -d "{\"text\": \"Test event $i\"}" &
done
wait
```

## 8. Error Handling Testing

### Test 8.1: Invalid Input

**Test Command:**
```bash
curl -X POST http://localhost:3000/api/disco/3b/classify \
  -H "Content-Type: application/json" \
  -d '{"invalid": "input"}' | jq '.'
```

**Expected Response:**
```json
{
  "error": "Invalid input",
  "details": [...]
}
```

### Test 8.2: Model Unavailable

**Test Command:**
```bash
# Stop Ollama temporarily
pkill ollama

curl -X POST http://localhost:3000/api/disco/3b/classify \
  -H "Content-Type: application/json" \
  -d '{"text": "test"}' | jq '.'

# Restart Ollama
ollama serve &
```

## 9. Feature Flag Testing

### Test 9.1: Disabled Features

**Test Command:**
```bash
# Temporarily disable feature flags
export ENABLE_DISCO_3B=false
export ENABLE_DISCO_CHAT=false

curl -X POST http://localhost:3000/api/disco/3b/classify \
  -H "Content-Type: application/json" \
  -d '{"text": "test"}' | jq '.'
```

**Expected Response:**
```json
{
  "error": "Disco 3B integration is disabled"
}
```

## 10. Data Flow Testing

### Test 10.1: Convex Integration

**Test Command:**
```bash
# Create enriched record
curl -X POST http://localhost:3000/api/disco/ingest/scan \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test_user",
    "factoryId": "demo",
    "text": "QR scan: Item TEST-001 at packaging station"
  }' | jq '.'
```

**Verify in Convex Dashboard:**
- Check `recordsEnriched` table for new entry
- Verify `embeddings` table has corresponding vector
- Confirm `chatTurns` table logs conversation

## Test Results Template

| Test ID | Test Name | Status | Response Time | Notes |
|---------|-----------|--------|---------------|-------|
| 1.1 | Basic QR Scan | ✅/❌ | X.Xs | |
| 1.2 | Quality Issue | ✅/❌ | X.Xs | |
| 2.1 | Timing Anomaly | ✅/❌ | X.Xs | |
| 3.1 | Critical Alert | ✅/❌ | X.Xs | |
| 4.1 | Shift Message | ✅/❌ | X.Xs | |
| 5.1 | Integrated Scan | ✅/❌ | X.Xs | |

## Troubleshooting

### Common Issues

1. **Model Not Found**: Ensure `disco-3b` model is created
2. **Connection Errors**: Check Ollama is running on port 11434
3. **Schema Errors**: Verify Zod schemas match model output
4. **Convex Errors**: Check Convex dev server is running
5. **Feature Flags**: Ensure environment variables are set correctly

### Debug Commands

```bash
# Check model status
ollama list

# Test model directly
ollama run disco-3b "Classify this: QR scan at cutting station"

# Check API health
curl http://localhost:3000/api/health

# Check Convex status
curl http://localhost:3001/api/health
```

## Conclusion

This testing guide provides comprehensive coverage of Disco 3B's capabilities, from basic data enrichment to complex alert and message triggering scenarios. Use these tests to validate the system's functionality and performance in your specific factory environment.
