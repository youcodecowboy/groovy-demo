# Chaos Mode Testing System Specification

## Overview

Chaos Mode is an automated testing system that simulates real factory operations by creating and progressing orders through workflows at realistic intervals. It mimics the cadence of a live factory environment with scans, stage completions, problems, and communications happening at natural intervals.

## Core Concept

Chaos Mode creates a "living factory" simulation where:
- **2-3 active Star Wars themed orders** are seeded with 1000 pieces each
- **Realistic cadence**: Scans every few seconds, stage updates every few minutes, problems every 1-2 minutes
- **Full workflow testing**: Every stage requires scans and potentially other inputs
- **Error logging**: All errors are logged for analysis, with automatic shutdown on critical errors
- **Continuous operation**: Orders progress over hours, not minutes, simulating real production timelines

## System Architecture

### 1. Chaos Mode Controller
```typescript
interface ChaosModeController {
  isActive: boolean;
  startTime: number;
  orders: ChaosOrder[];
  errorLog: ChaosError[];
  settings: ChaosSettings;
  
  // Core operations
  start(): void;
  stop(): void;
  pause(): void;
  resume(): void;
  
  // Monitoring
  getStatus(): ChaosStatus;
  getErrorLog(): ChaosError[];
  getOrderProgress(): OrderProgress[];
}
```

### 2. Chaos Order Structure
```typescript
interface ChaosOrder {
  id: string;
  poNumber: string;
  brandId: string;
  factoryId: string;
  workflowId: string;
  status: "pending" | "accepted" | "in_production" | "completed";
  
  // Star Wars themed items
  items: ChaosItem[];
  
  // Progress tracking
  progress: {
    totalItems: number;        // 1000 pieces
    completedItems: number;
    currentStage: string;
    estimatedCompletion: number;
  };
  
  // Chaos mode specific
  chaosSettings: {
    scanInterval: number;      // Seconds between scans
    stageInterval: number;     // Minutes between stage completions
    problemInterval: number;   // Minutes between problems
    messageInterval: number;   // Minutes between messages
  };
}
```

### 3. Chaos Item Structure
```typescript
interface ChaosItem {
  id: string;
  itemId: string;
  workflowId: string;
  currentStageId: string;
  status: "active" | "paused" | "error" | "completed";
  
  // Star Wars specifications
  specifications: {
    character: string;         // "Luke Skywalker", "Darth Vader", etc.
    itemType: string;          // "lightsaber", "helmet", "armor", etc.
    material: string;          // "durasteel", "beskar", "plastoid", etc.
    color: string;             // "blue", "red", "silver", etc.
    size: string;              // "standard", "large", "small"
  };
  
  // Production tracking
  startedAt: number;
  currentStageStartedAt: number;
  estimatedStageDuration: number;
  
  // Chaos mode tracking
  lastScanAt: number;
  nextScanAt: number;
  stageProgress: number;       // 0-100%
}
```

## Star Wars Themed Orders with Unique Workflows

### Order 1: Jedi Lightsabers (Standard Manufacturing Workflow)
```typescript
{
  poNumber: "SW-PO-2024-001",
  description: "Jedi Lightsaber Collection",
  workflowId: "standard-manufacturing",
  items: [
    {
      sku: "LS-LUKE-001",
      quantity: 250,
      description: "Luke Skywalker Lightsaber",
      specifications: {
        character: "Luke Skywalker",
        itemType: "lightsaber",
        material: "durasteel",
        color: "blue",
        size: "standard"
      }
    },
    {
      sku: "LS-OBI-002", 
      quantity: 250,
      description: "Obi-Wan Kenobi Lightsaber",
      specifications: {
        character: "Obi-Wan Kenobi",
        itemType: "lightsaber",
        material: "durasteel",
        color: "blue",
        size: "standard"
      }
    },
    {
      sku: "LS-QUI-003",
      quantity: 250,
      description: "Qui-Gon Jinn Lightsaber",
      specifications: {
        character: "Qui-Gon Jinn",
        itemType: "lightsaber",
        material: "durasteel",
        color: "green",
        size: "standard"
      }
    },
    {
      sku: "LS-ANI-004",
      quantity: 250,
      description: "Anakin Skywalker Lightsaber",
      specifications: {
        character: "Anakin Skywalker",
        itemType: "lightsaber",
        material: "durasteel",
        color: "blue",
        size: "standard"
      }
    }
  ]
}
```

### Order 2: Sith Equipment (Quality-Focused Workflow)
```typescript
{
  poNumber: "SW-PO-2024-002",
  description: "Sith Lord Equipment Set",
  workflowId: "quality-focused",
  items: [
    {
      sku: "SI-VADER-001",
      quantity: 500,
      description: "Darth Vader Helmet",
      specifications: {
        character: "Darth Vader",
        itemType: "helmet",
        material: "durasteel",
        color: "black",
        size: "large"
      }
    },
    {
      sku: "SI-VADER-002",
      quantity: 500,
      description: "Darth Vader Chest Armor",
      specifications: {
        character: "Darth Vader",
        itemType: "armor",
        material: "durasteel",
        color: "black",
        size: "large"
      }
    }
  ]
}
```

### Order 3: Mandalorian Gear (Rapid Production Workflow)
```typescript
{
  poNumber: "SW-PO-2024-003", 
  description: "Mandalorian Beskar Armor",
  workflowId: "rapid-production",
  items: [
    {
      sku: "MAN-DIN-001",
      quantity: 1000,
      description: "Din Djarin Beskar Helmet",
      specifications: {
        character: "Din Djarin",
        itemType: "helmet",
        material: "beskar",
        color: "silver",
        size: "standard"
      }
    }
  ]
}
```

## Workflow Stages & Actions

### 1. Standard Manufacturing Workflow (Jedi Lightsabers)
```typescript
const standardManufacturingWorkflow = {
  id: "standard-manufacturing",
  name: "Standard Manufacturing Workflow",
  description: "Traditional 5-stage manufacturing process for lightsabers",
  stages: [
    {
      id: "material-prep",
      name: "Material Preparation",
      order: 1,
      actions: [
        {
          id: "scan-material",
          type: "scan",
          label: "Scan Material QR Code",
          required: true,
          config: { scanType: "qr", expectedValue: "material:" }
        },
        {
          id: "measure-material",
          type: "measurement",
          label: "Measure Material Dimensions",
          required: true,
          config: { measurements: ["length", "width", "thickness"] }
        }
      ],
      estimatedDuration: 30 // minutes
    },
    {
      id: "cutting",
      name: "Cutting & Shaping",
      order: 2,
      actions: [
        {
          id: "scan-cutting-station",
          type: "scan",
          label: "Scan Cutting Station",
          required: true
        },
        {
          id: "quality-check-cut",
          type: "inspection",
          label: "Quality Check Cuts",
          required: true,
          config: { checklist: ["precision", "clean_edges", "dimensions"] }
        }
      ],
      estimatedDuration: 45
    },
    {
      id: "assembly",
      name: "Assembly",
      order: 3,
      actions: [
        {
          id: "scan-assembly-station",
          type: "scan",
          label: "Scan Assembly Station",
          required: true
        },
        {
          id: "assembly-photo",
          type: "photo",
          label: "Take Assembly Photo",
          required: false,
          config: { photoCount: 2, requiredAngles: ["front", "side"] }
        }
      ],
      estimatedDuration: 60
    },
    {
      id: "finishing",
      name: "Finishing & Polish",
      order: 4,
      actions: [
        {
          id: "scan-finishing-station",
          type: "scan",
          label: "Scan Finishing Station",
          required: true
        },
        {
          id: "finishing-approval",
          type: "approval",
          label: "Finishing Quality Approval",
          required: true,
          config: { approverRole: "supervisor" }
        }
      ],
      estimatedDuration: 30
    },
    {
      id: "final-inspection",
      name: "Final Quality Inspection",
      order: 5,
      actions: [
        {
          id: "scan-inspection-station",
          type: "scan",
          label: "Scan Inspection Station",
          required: true
        },
        {
          id: "final-inspection",
          type: "inspection",
          label: "Final Quality Inspection",
          required: true,
          config: { 
            checklist: ["appearance", "functionality", "safety", "packaging"],
            passCriteria: "all_required"
          }
        },
        {
          id: "packaging-photo",
          type: "photo",
          label: "Take Packaging Photo",
          required: true,
          config: { photoCount: 1, requiredAngles: ["packaged"] }
        }
      ],
      estimatedDuration: 20
    }
  ]
}
```

### 2. Quality-Focused Workflow (Sith Equipment)
```typescript
const qualityFocusedWorkflow = {
  id: "quality-focused",
  name: "Quality-Focused Workflow",
  description: "Enhanced quality control process for Sith equipment",
  stages: [
    {
      id: "material-inspection",
      name: "Material Inspection",
      order: 1,
      actions: [
        {
          id: "scan-material",
          type: "scan",
          label: "Scan Material QR Code",
          required: true
        },
        {
          id: "material-quality-check",
          type: "inspection",
          label: "Material Quality Inspection",
          required: true,
          config: { checklist: ["purity", "strength", "defects"] }
        }
      ],
      estimatedDuration: 45
    },
    {
      id: "precision-cutting",
      name: "Precision Cutting",
      order: 2,
      actions: [
        {
          id: "scan-cutting-station",
          type: "scan",
          label: "Scan Precision Cutting Station",
          required: true
        },
        {
          id: "precision-measurement",
          type: "measurement",
          label: "Precision Measurements",
          required: true,
          config: { measurements: ["length", "width", "thickness", "angles"], tolerance: 0.1 }
        }
      ],
      estimatedDuration: 60
    },
    {
      id: "assembly-quality",
      name: "Quality Assembly",
      order: 3,
      actions: [
        {
          id: "scan-assembly-station",
          type: "scan",
          label: "Scan Assembly Station",
          required: true
        },
        {
          id: "assembly-inspection",
          type: "inspection",
          label: "Assembly Quality Check",
          required: true,
          config: { checklist: ["alignment", "fit", "finish"] }
        },
        {
          id: "assembly-photo",
          type: "photo",
          label: "Assembly Documentation",
          required: true,
          config: { photoCount: 3, requiredAngles: ["front", "side", "detail"] }
        }
      ],
      estimatedDuration: 75
    },
    {
      id: "quality-approval",
      name: "Quality Approval",
      order: 4,
      actions: [
        {
          id: "scan-quality-station",
          type: "scan",
          label: "Scan Quality Station",
          required: true
        },
        {
          id: "quality-approval",
          type: "approval",
          label: "Quality Manager Approval",
          required: true,
          config: { approverRole: "quality_manager", requireComments: true }
        }
      ],
      estimatedDuration: 30
    },
    {
      id: "final-quality",
      name: "Final Quality Assurance",
      order: 5,
      actions: [
        {
          id: "scan-final-station",
          type: "scan",
          label: "Scan Final Station",
          required: true
        },
        {
          id: "final-quality-inspection",
          type: "inspection",
          label: "Final Quality Assurance",
          required: true,
          config: { 
            checklist: ["appearance", "functionality", "safety", "durability", "packaging"],
            passCriteria: "all_required",
            allowPartialPass: false
          }
        },
        {
          id: "final-documentation",
          type: "photo",
          label: "Final Documentation",
          required: true,
          config: { photoCount: 4, requiredAngles: ["front", "back", "side", "packaged"] }
        }
      ],
      estimatedDuration: 40
    }
  ]
}
```

### 3. Rapid Production Workflow (Mandalorian Gear)
```typescript
const rapidProductionWorkflow = {
  id: "rapid-production",
  name: "Rapid Production Workflow",
  description: "Streamlined process for high-volume Mandalorian armor",
  stages: [
    {
      id: "bulk-material-prep",
      name: "Bulk Material Preparation",
      order: 1,
      actions: [
        {
          id: "scan-bulk-material",
          type: "scan",
          label: "Scan Bulk Material",
          required: true
        },
        {
          id: "bulk-measurement",
          type: "measurement",
          label: "Bulk Measurements",
          required: true,
          config: { measurements: ["batch_size", "material_quantity"] }
        }
      ],
      estimatedDuration: 20
    },
    {
      id: "mass-cutting",
      name: "Mass Cutting",
      order: 2,
      actions: [
        {
          id: "scan-mass-cutting",
          type: "scan",
          label: "Scan Mass Cutting Station",
          required: true
        },
        {
          id: "batch-quality-check",
          type: "inspection",
          label: "Batch Quality Check",
          required: true,
          config: { checklist: ["batch_consistency", "cut_quality"], sampleSize: 10 }
        }
      ],
      estimatedDuration: 30
    },
    {
      id: "streamlined-assembly",
      name: "Streamlined Assembly",
      order: 3,
      actions: [
        {
          id: "scan-assembly-line",
          type: "scan",
          label: "Scan Assembly Line",
          required: true
        },
        {
          id: "assembly-line-photo",
          type: "photo",
          label: "Assembly Line Photo",
          required: false,
          config: { photoCount: 1, requiredAngles: ["assembly_line"] }
        }
      ],
      estimatedDuration: 40
    },
    {
      id: "rapid-finishing",
      name: "Rapid Finishing",
      order: 4,
      actions: [
        {
          id: "scan-finishing-line",
          type: "scan",
          label: "Scan Finishing Line",
          required: true
        },
        {
          id: "rapid-approval",
          type: "approval",
          label: "Rapid Approval",
          required: true,
          config: { approverRole: "line_supervisor", autoApprove: true }
        }
      ],
      estimatedDuration: 15
    },
    {
      id: "batch-inspection",
      name: "Batch Inspection",
      order: 5,
      actions: [
        {
          id: "scan-inspection-line",
          type: "scan",
          label: "Scan Inspection Line",
          required: true
        },
        {
          id: "batch-inspection",
          type: "inspection",
          label: "Batch Inspection",
          required: true,
          config: { 
            checklist: ["appearance", "functionality", "packaging"],
            passCriteria: "sample_check",
            sampleSize: 5
          }
        },
        {
          id: "batch-photo",
          type: "photo",
          label: "Batch Photo",
          required: true,
          config: { photoCount: 1, requiredAngles: ["batch"] }
        }
      ],
      estimatedDuration: 25
    }
  ]
}
```

## Cadence & Timing

### Realistic Factory Cadence
```typescript
const chaosCadence = {
  // Scan intervals (seconds)
  scanIntervals: {
    material_prep: { min: 15, max: 45 },
    cutting: { min: 20, max: 60 },
    assembly: { min: 30, max: 90 },
    finishing: { min: 25, max: 75 },
    final_inspection: { min: 20, max: 60 }
  },
  
  // Stage completion intervals (minutes)
  stageIntervals: {
    material_prep: { min: 25, max: 35 },
    cutting: { min: 40, max: 50 },
    assembly: { min: 55, max: 65 },
    finishing: { min: 25, max: 35 },
    final_inspection: { min: 15, max: 25 }
  },
  
  // Problem generation intervals (minutes)
  problemIntervals: {
    material_shortage: { min: 60, max: 120 },
    quality_issue: { min: 45, max: 90 },
    equipment_failure: { min: 90, max: 180 },
    communication_issue: { min: 30, max: 60 }
  },
  
  // Message intervals (minutes)
  messageIntervals: {
    progress_update: { min: 30, max: 60 },
    quality_alert: { min: 45, max: 90 },
    material_request: { min: 60, max: 120 },
    general_communication: { min: 90, max: 180 }
  }
}
```

## Error Handling & Logging

### Error Categories
```typescript
enum ChaosErrorType {
  CRITICAL = "critical",
  WARNING = "warning", 
  INFO = "info"
}

interface ChaosError {
  id: string;
  timestamp: number;
  type: ChaosErrorType;
  category: string;
  message: string;
  details: any;
  orderId?: string;
  itemId?: string;
  stageId?: string;
  resolved: boolean;
  resolvedAt?: number;
  resolvedBy?: string;
}
```

### Error Scenarios
1. **Critical Errors** (Auto-shutdown Chaos Mode):
   - Database connection failure
   - Workflow validation failure
   - Item creation failure
   - Stage advancement failure

2. **Warning Errors** (Log and continue):
   - Scan timeout
   - Stage completion delay
   - Quality check failure
   - Material shortage

3. **Info Errors** (Log for analysis):
   - Unusual scan patterns
   - Performance metrics
   - User behavior patterns

## Startup Function & System Validation

### Chaos Mode Startup Sequence
```typescript
interface ChaosModeStartup {
  // Phase 1: System Validation
  validateSystem(): Promise<ValidationResult>;
  
  // Phase 2: Database Cleanup
  clearDatabase(): Promise<void>;
  
  // Phase 3: Test Fire All Functions
  testFireAllFunctions(): Promise<TestFireResult>;
  
  // Phase 4: Full Seed & Chaos Mode
  startFullChaosMode(): Promise<void>;
}

interface ValidationResult {
  success: boolean;
  errors: string[];
  warnings: string[];
}

interface TestFireResult {
  success: boolean;
  tests: {
    orderCreation: boolean;
    itemCreation: boolean;
    workflowCreation: boolean;
    stageProgression: boolean;
    scanSimulation: boolean;
    notificationSending: boolean;
    itemFlagging: boolean;
    messageSending: boolean;
    alertCreation: boolean;
    escalationCreation: boolean;
  };
  errors: string[];
}
```

### Test Fire Function Sequence
```typescript
const testFireSequence = [
  {
    name: "Order Creation",
    function: "createTestOrder",
    description: "Create one test Star Wars order",
    expectedResult: "Order created with 1 item"
  },
  {
    name: "Workflow Creation", 
    function: "createTestWorkflow",
    description: "Create standard manufacturing workflow",
    expectedResult: "Workflow with 5 stages created"
  },
  {
    name: "Item Creation",
    function: "createTestItem", 
    description: "Create one test item from order",
    expectedResult: "Item created and assigned to workflow"
  },
  {
    name: "Stage Progression",
    function: "progressThroughStages",
    description: "Move item through all workflow stages",
    expectedResult: "Item completes all stages successfully"
  },
  {
    name: "Scan Simulation",
    function: "simulateScans",
    description: "Simulate QR code scans at each stage",
    expectedResult: "All required scans completed"
  },
  {
    name: "Notification Sending",
    function: "sendTestNotification",
    description: "Send test notification to user",
    expectedResult: "Notification appears in user's inbox"
  },
  {
    name: "Item Flagging",
    function: "flagTestItem",
    description: "Flag item as defective",
    expectedResult: "Item marked as defective with notes"
  },
  {
    name: "Message Sending",
    function: "sendTestMessage",
    description: "Send test message between users",
    expectedResult: "Message appears in chat interface"
  },
  {
    name: "Alert Creation",
    function: "createTestAlert",
    description: "Create test alert",
    expectedResult: "Alert appears in alerts list"
  },
  {
    name: "Escalation Creation",
    function: "createTestEscalation",
    description: "Create test escalation",
    expectedResult: "Escalation appears in escalations list"
  }
];
```

### Startup Process Flow
```typescript
async function chaosModeStartup() {
  console.log("🚀 Starting Chaos Mode...");
  
  // Step 1: Validate system
  const validation = await validateSystem();
  if (!validation.success) {
    console.error("❌ System validation failed:", validation.errors);
    return;
  }
  
  // Step 2: Clear database
  console.log("🧹 Clearing database...");
  await clearDatabase();
  
  // Step 3: Test fire all functions
  console.log("🧪 Test firing all functions...");
  const testResults = await testFireAllFunctions();
  
  if (!testResults.success) {
    console.error("❌ Test fire failed:", testResults.errors);
    return;
  }
  
  // Step 4: Start full chaos mode
  console.log("🎯 All tests passed! Starting full Chaos Mode...");
  await startFullChaosMode();
}
```

## Implementation Plan

### Phase 1: Core Infrastructure & Startup
1. Create Chaos Mode controller with startup function
2. Implement database cleanup functionality
3. Create test fire sequence for all major functions
4. Add error logging and validation system

### Phase 2: Order Seeding & Workflows
1. Implement three unique workflows (standard, quality-focused, rapid)
2. Seed Star Wars orders with 1000 pieces each
3. Set up workflow progression system
4. Add realistic timing intervals

### Phase 3: Realistic Simulation
1. Implement realistic timing intervals
2. Add random problem generation
3. Create automated messaging system
4. Add quality issue simulation

### Phase 4: Advanced Features
1. Add material tracking
2. Implement location management
3. Add user assignment simulation
4. Create comprehensive reporting

### Phase 5: Testing & Validation
1. Test all workflow stages
2. Validate error handling
3. Performance testing
4. Real-world scenario testing

## Database Schema Requirements

### Chaos Mode Tables
```typescript
// Chaos mode control table
chaosModeControl: defineTable({
  orgId: v.id("organizations"),
  isActive: v.boolean(),
  startTime: v.number(),
  settings: v.any(),
  currentOrders: v.array(v.string()), // Order IDs
  errorCount: v.number(),
  lastActivity: v.number(),
})

// Chaos mode error log
chaosModeErrors: defineTable({
  orgId: v.id("organizations"),
  timestamp: v.number(),
  type: v.string(),
  category: v.string(),
  message: v.string(),
  details: v.any(),
  orderId: v.optional(v.string()),
  itemId: v.optional(v.string()),
  stageId: v.optional(v.string()),
  resolved: v.boolean(),
  resolvedAt: v.optional(v.number()),
  resolvedBy: v.optional(v.string()),
})

// Chaos mode activity log
chaosModeActivity: defineTable({
  orgId: v.id("organizations"),
  timestamp: v.number(),
  action: v.string(),
  orderId: v.optional(v.string()),
  itemId: v.optional(v.string()),
  stageId: v.optional(v.string()),
  details: v.any(),
})
```

## User Interface

### Chaos Mode Control Panel
```typescript
interface ChaosModeControlPanel {
  // Hidden control panel (accessible via globe icon)
  isVisible: boolean;
  position: "top-right"; // Next to notifications
  
  // Control panel content
  controls: {
    startButton: boolean;
    stopButton: boolean;
    pauseButton: boolean;
    resetButton: boolean;
    testFireButton: boolean; // Test fire all functions
  };
  
  // Status display
  status: {
    isActive: boolean;
    mode: "test-fire" | "full-chaos" | "paused" | "stopped";
    uptime: string;
    activeOrders: number;
    totalItems: number;
    completedItems: number;
    errorCount: number;
    testFireProgress: number; // 0-100% for test fire sequence
  };
  
  // Test fire results
  testFireResults: {
    completed: boolean;
    tests: TestFireResult[];
    errors: string[];
  };
  
  // Order progress
  orders: OrderProgress[];
  
  // Error log
  errors: ChaosError[];
  
  // Real-time activity feed
  activityFeed: ActivityEvent[];
}
```

### Control Panel UI Components
```tsx
// Globe icon trigger (top-right corner)
<Button
  variant="ghost"
  size="icon"
  className="relative"
  onClick={() => setControlPanelVisible(!isVisible)}
>
  <Globe className="h-5 w-5" />
  {isActive && (
    <div className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full animate-pulse" />
  )}
</Button>

// Hidden control panel
<Collapsible open={isVisible}>
  <CollapsibleContent className="absolute top-12 right-0 w-96 bg-background border rounded-lg shadow-lg p-4">
    <div className="space-y-4">
      {/* Status Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Chaos Mode</h3>
        <Badge variant={isActive ? "destructive" : "secondary"}>
          {isActive ? "ACTIVE" : "INACTIVE"}
        </Badge>
      </div>
      
      {/* Control Buttons */}
      <div className="flex gap-2">
        <Button onClick={startChaosMode} disabled={isActive}>
          Start
        </Button>
        <Button onClick={stopChaosMode} disabled={!isActive}>
          Stop
        </Button>
        <Button onClick={testFireAllFunctions} disabled={isActive}>
          Test Fire
        </Button>
      </div>
      
      {/* Status Display */}
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div>Uptime: {uptime}</div>
        <div>Orders: {activeOrders}</div>
        <div>Items: {totalItems}</div>
        <div>Errors: {errorCount}</div>
      </div>
      
      {/* Test Fire Progress */}
      {testFireInProgress && (
        <div className="space-y-2">
          <div className="text-sm font-medium">Test Fire Progress</div>
          <Progress value={testFireProgress} />
          <div className="text-xs text-muted-foreground">
            {currentTestName}
          </div>
        </div>
      )}
      
      {/* Error Log Preview */}
      {errors.length > 0 && (
        <div className="space-y-2">
          <div className="text-sm font-medium">Recent Errors</div>
          <div className="max-h-32 overflow-y-auto space-y-1">
            {errors.slice(0, 3).map(error => (
              <div key={error.id} className="text-xs text-red-600">
                {error.message}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  </CollapsibleContent>
</Collapsible>
```

### Chaos Mode Dashboard (Full Screen)
```typescript
interface ChaosModeDashboard {
  // Full dashboard for detailed monitoring
  isFullScreen: boolean;
  
  // Control panel (same as above)
  controlPanel: ChaosModeControlPanel;
  
  // Detailed monitoring
  monitoring: {
    realTimeActivity: ActivityEvent[];
    orderProgress: OrderProgress[];
    workflowStatus: WorkflowStatus[];
    errorLog: ChaosError[];
    performanceMetrics: PerformanceMetrics;
  };
  
  // Test fire results
  testFireResults: {
    completed: boolean;
    tests: TestFireResult[];
    errors: string[];
    performance: TestFirePerformance;
  };
}
```

## Success Criteria

### Functional Requirements
- [ ] Chaos Mode can start and run continuously
- [ ] 2-3 Star Wars orders are properly seeded
- [ ] Items progress through all workflow stages
- [ ] Realistic timing intervals are maintained
- [ ] Error logging captures all issues
- [ ] Critical errors trigger automatic shutdown

### Performance Requirements
- [ ] System remains responsive during chaos mode
- [ ] Database performance is maintained
- [ ] Real-time updates work correctly
- [ ] Error log doesn't grow excessively

### Testing Requirements
- [ ] All workflow stages are tested
- [ ] All action types are validated
- [ ] Error scenarios are properly handled
- [ ] Recovery mechanisms work correctly

## Next Steps

1. **Create Chaos Mode Controller**: Implement the core controller logic
2. **Seed Star Wars Orders**: Create the three themed orders with 1000 pieces each
3. **Implement Workflow Progression**: Set up automatic stage advancement
4. **Add Error Logging**: Create comprehensive error tracking
5. **Build User Interface**: Create the chaos mode dashboard
6. **Test & Validate**: Run comprehensive testing scenarios

This specification provides a comprehensive foundation for building the Chaos Mode testing system that will thoroughly validate all factory operations in a realistic, automated environment.
