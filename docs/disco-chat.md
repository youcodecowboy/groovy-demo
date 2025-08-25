# Disco Chat Interface

This document describes the chat interface for the Disco factory floor application, which provides conversational AI assistance for production operators and managers.

## Overview

The Disco Chat interface allows factory personnel to interact with the 3B LLM through natural language queries about production status, quality issues, inventory, and operational tasks. The chat system can also execute safe actions like sending messages, creating alerts, and escalating issues.

## Features

- **Natural Language Q&A**: Ask questions about production status, delays, quality issues
- **Contextual Responses**: AI uses recent factory data to provide relevant answers
- **Action Execution**: Send messages, create alerts, escalate to dashboard
- **Semantic Search**: Retrieves relevant historical events using vector embeddings
- **Human-in-the-Loop**: All actions require user confirmation before execution
- **Role-based Permissions**: Different actions available based on user role

## Prerequisites

### 1. Disco 3B Setup

Ensure Disco 3B is properly configured (see `disco-3b.md`):

```bash
# Required for chat functionality
ENABLE_DISCO_3B=true
ENABLE_DISCO_CHAT=true
NEXT_PUBLIC_ENABLE_DISCO_CHAT=true
```

### 2. Convex Backend

The chat system requires these Convex tables:
- `recordsEnriched`: For context retrieval
- `alerts`: For alert creation
- `messages`: For messaging
- `escalations`: For dashboard escalations
- `chatTurns`: For conversation logging

## User Interface

### Accessing Chat

The chat interface appears as a floating bot button in the Disco footer (when feature flag is enabled). Click the blue bot icon to open the chat panel.

### Chat Panel Components

1. **Header**: Shows current team and data extraction toggle
2. **Message Area**: Conversation history with confidence scores
3. **Quick Actions**: Pre-built action buttons
4. **Input Area**: Text input with send button
5. **Suggested Actions**: AI-proposed actions requiring confirmation

### Quick Start Examples

Use these sample questions to get started:

```
"What's the status of WASHED today?"
"Any quality issues this shift?"
"Show me alerts and escalations"
"Help me message the team"
```

## API Endpoints

### Chat Q&A: `/api/disco/chat/ask`

Send questions and receive AI-powered answers with context.

**Request:**
```bash
curl -X POST http://localhost:3000/api/disco/chat/ask \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "operator-123",
    "factoryId": "factory-demo",
    "text": "What is the status of PO-456 and are there any wash delays?"
  }'
```

**Response:**
```json
{
  "answer": "PO-456 is currently in the washing stage with an ETA of 2 hours. There are no significant wash delays reported today.",
  "citations": ["rec_wash_001", "rec_po_456"],
  "enrichment": {
    "labels": ["STAGE", "LOGISTICS"],
    "entities": ["PO-456", "washing"],
    "fields": {
      "po_number": "PO-456",
      "stage": "washing",
      "eta": "2 hours"
    }
  },
  "proposed_action": {
    "type": "send_message",
    "payload": {
      "to": "wash-team-lead",
      "text": "PO-456 status update requested - currently on track"
    }
  },
  "confidence": 0.89
}
```

### Action Execution: `/api/disco/chat/action`

Execute confirmed actions like sending messages or creating alerts.

**Request:**
```bash
curl -X POST http://localhost:3000/api/disco/chat/action \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "operator-123",
    "factoryId": "factory-demo",
    "action": {
      "type": "create_alert",
      "payload": {
        "level": "WARN",
        "title": "Wash P75 High",
        "details": "Washing times running 25% above target - investigate capacity",
        "owner": "wash-supervisor"
      }
    }
  }'
```

**Response:**
```json
{
  "ok": true,
  "createdIds": ["alert_12345"]
}
```

### Quick Labeling: `/api/disco/chat/tools/label`

Extract labels and entities from text for UI quick-tagging.

**Request:**
```bash
curl -X POST http://localhost:3000/api/disco/chat/tools/label \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Quality issue on SKU-789 requires immediate rework"
  }'
```

**Response:**
```json
{
  "labels": ["DEFECT", "PERSONNEL"],
  "entities": ["SKU-789", "quality", "rework"],
  "fields": {
    "sku": "SKU-789",
    "priority": "HIGH"
  },
  "confidence": 0.92
}
```

## Supported Actions

### Send Message

Send messages to team members or channels.

**Payload Structure:**
```json
{
  "type": "send_message",
  "payload": {
    "to": "recipient-id",
    "text": "Message content",
    "priority": "MEDIUM"
  }
}
```

**Permissions**: All users can send messages

### Create Alert

Create system alerts for operational issues.

**Payload Structure:**
```json
{
  "type": "create_alert",
  "payload": {
    "level": "INFO|WARN|CRITICAL",
    "title": "Alert title",
    "details": "Detailed description",
    "owner": "responsible-person"
  }
}
```

**Permissions**: Operators and above can create alerts

### Escalate to Dashboard

Escalate complex issues for deeper analysis.

**Payload Structure:**
```json
{
  "type": "escalate_dashboard",
  "payload": {
    "kind": "report|analysis|workflow",
    "details": "Escalation description",
    "assignedTo": "analyst-id"
  }
}
```

**Permissions**: Managers and above can escalate

## Context Retrieval

The chat system retrieves relevant context using multiple methods:

### 1. Recent Records
- Last 10 enriched records from the factory
- Recent alerts (non-resolved)
- Open escalations

### 2. Vector Search
- Generates embedding for user question
- Searches similar events in vector database
- Returns top 5 most relevant matches

### 3. Contextual Filtering
All context is filtered by:
- Factory ID (tenant isolation)
- Time relevance (recent events prioritized)
- User permissions (role-based access)

## UI Features

### Message Display

Each message shows:
- **Content**: The main message text
- **Confidence**: AI confidence score (color-coded)
- **Citations**: References to source records
- **Timestamp**: When the message was sent

### Enrichment Data

Toggle "Data" button to see extracted information:
- **Labels**: Classification tags
- **Entities**: Named entities found
- **Fields**: Structured data extracted

### Proposed Actions

When AI suggests an action:
- **Action Preview**: Shows action type and payload
- **Execute Button**: Confirms and executes the action
- **Safe Actions Only**: No destructive operations allowed

### Quick Actions

Bottom toolbar provides common actions:
- **Message Team**: Quick team communication
- **Create Alert**: Fast alert creation
- **Escalate**: Dashboard escalation

## Performance Considerations

### Response Time
- Target: <1 second for simple Q&A
- Context retrieval optimized for <10 records
- Vector search limited to top 5 results

### Token Management
- Prompts kept under 400 tokens
- Context summarized when large
- Conversation history limited

### Caching
- Recent context cached for session
- Vector embeddings reused when possible
- Chat history persisted in Convex

## Safety Features

### Human-in-the-Loop
- All actions require explicit user confirmation
- No automatic execution of suggested actions
- Clear action previews before execution

### Permission Checks
- User role validated for each action
- Factory-level access control
- Audit trail for all actions

### Graceful Degradation
- Works without vector search if unavailable
- Falls back to basic context if AI fails
- Error messages user-friendly

## Development & Testing

### Enable Chat for Testing

```javascript
// In browser console (development only)
enableDiscoChatForTesting()

// Disable when done
disableDiscoChatForTesting()
```

### Testing Scenarios

1. **Basic Q&A**:
   - "What's happening today?"
   - "Any delays or issues?"

2. **Specific Queries**:
   - "Status of PO-123?"
   - "Quality metrics for washing stage?"

3. **Action Requests**:
   - "Message the shift lead about delays"
   - "Create alert for high defect rate"

4. **Complex Scenarios**:
   - "Escalate wash variance analysis to dashboard"
   - "Summarize today's quality issues"

### Chat Turn Logging

All conversations are logged to `chatTurns` table for:
- Performance monitoring
- Accuracy tracking
- User behavior analysis
- Model improvement feedback

## Troubleshooting

### Common Issues

**1. "Disco Chat is disabled"**
```bash
# Check environment variables
ENABLE_DISCO_CHAT=true
NEXT_PUBLIC_ENABLE_DISCO_CHAT=true
```

**2. Chat button not visible**
- Verify feature flags are set correctly
- Check browser console for JavaScript errors
- Ensure Disco footer component is loaded

**3. "No context found" responses**
- Check if Convex data exists for factory
- Verify user has proper factory access
- Review `recordsEnriched` table population

**4. Slow responses**
- Monitor token usage in prompts
- Check vector search performance
- Review context retrieval queries

**5. Actions not executing**
- Verify user permissions
- Check Convex mutations are working
- Review action payload validation

### Debugging

Enable debug mode in development:

```javascript
// Browser console
localStorage.setItem('DISCO_CHAT_DEBUG', 'true')

// See detailed logs
localStorage.setItem('DISCO_CHAT_VERBOSE', 'true')
```

## Advanced Configuration

### Custom Action Types

To add new action types:

1. Update Zod schemas in `lib/disco-3b-schemas.ts`
2. Add action handler in `/api/disco/chat/action/route.ts`
3. Update UI action icons/colors in chat panel
4. Add permission checks as needed

### Context Customization

Modify context retrieval in `convex/disco3b.ts`:
- Adjust `getLatestContext` query limits
- Add new data sources to context
- Customize vector search parameters

### Prompt Engineering

Update chat prompts in `lib/ollama-client.ts`:
- Modify system instructions
- Adjust response format requirements
- Add domain-specific guidelines

## Security Considerations

- All actions are logged for audit purposes
- User permissions enforced at API level
- No external API calls (local AI only)
- Feature flags provide granular control
- Conversation data stored securely in Convex

## Future Enhancements

Potential improvements for future versions:

1. **Voice Interface**: Speech-to-text integration
2. **Rich Media**: Image/document upload support
3. **Workflow Integration**: Direct workflow triggers
4. **Analytics Dashboard**: Chat usage and effectiveness metrics
5. **Multi-language Support**: Localized responses
6. **Custom Prompts**: User-configurable AI behavior