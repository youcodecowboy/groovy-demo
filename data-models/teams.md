# Teams Data Model

## Overview

Teams are organizational units that group users together for collaborative work, responsibility assignment, and performance tracking. Teams can be assigned to specific production areas, workflows, or projects, enabling efficient resource allocation and accountability management.

## Core Entity: Team

### Primary Table Structure

```typescript
teams: defineTable({
  // Core Identification
  _id: string,                    // Unique identifier
  orgId: string,                  // Multi-tenant organization ID
  name: string,                   // Team name (e.g., "Cutting Team A", "QC Team")
  description?: string,           // Team description
  
  // Team Management
  managerId?: string,             // User ID of team manager/lead
  members: string[],              // Array of user IDs in the team
  isActive: boolean,              // Whether team is active
  
  // Team Configuration
  teamType?: "production" | "quality" | "maintenance" | "logistics" | "management",
  capacity?: number,              // Maximum team capacity
  currentWorkload?: number,       // Current workload (0-100%)
  
  // Assignment & Responsibilities
  assignedWorkflows?: string[],   // Workflows this team can handle
  assignedLocations?: string[],   // Locations this team operates in
  assignedStages?: string[],      // Production stages this team handles
  
  // Performance Tracking
  performanceMetrics?: {
    itemsCompleted: number,       // Items completed this period
    avgCompletionTime: number,    // Average completion time in minutes
    qualityScore: number,         // Quality score (0-100)
    efficiency: number,           // Efficiency rating (0-100)
    lastUpdated: number,          // Last metrics update
  },
  
  // Schedule & Availability
  schedule?: {
    shifts: Array<{
      dayOfWeek: number,          // 0-6 (Sunday-Saturday)
      startTime: string,          // HH:MM format
      endTime: string,            // HH:MM format
      isActive: boolean,
    }>,
    timezone: string,             // Team timezone
  },
  
  // Communication & Notifications
  notificationPreferences?: {
    emailNotifications: boolean,
    inAppNotifications: boolean,
    urgentAlerts: boolean,
    dailyReports: boolean,
  },
  
  // Audit Fields
  createdAt: number,
  updatedAt: number,
  createdBy: string,              // User who created the team
})
```

## Key Relationships

### 1. Users Relationship
- **Many-to-Many**: Teams can have multiple users, users can be in multiple teams
- **Implementation**: Through members array and user.team field
- **Purpose**: Group users for collaborative work and responsibility assignment
- **Business Logic**: Users can be assigned to teams for specific roles and responsibilities

### 2. Workflows Relationship
- **Many-to-Many**: Teams can handle multiple workflows, workflows can be assigned to multiple teams
- **Implementation**: Through assignedWorkflows array
- **Purpose**: Define which production processes teams can handle
- **Business Logic**: Teams are assigned to specific workflow stages based on their capabilities

### 3. Locations Relationship
- **Many-to-Many**: Teams can operate in multiple locations, locations can have multiple teams
- **Implementation**: Through assignedLocations array
- **Purpose**: Define physical areas where teams operate
- **Business Logic**: Teams are assigned to specific production areas or zones

### 4. Items Relationship
- **One-to-Many**: Teams can work on multiple items
- **Implementation**: Through item assignment and team member assignment
- **Purpose**: Track which team is responsible for specific items
- **Business Logic**: Items are assigned to team members who belong to specific teams

### 5. Orders Relationship
- **Many-to-One**: Multiple teams can work on one order
- **Implementation**: Through order assignment and team responsibilities
- **Purpose**: Assign teams to handle specific orders or order components
- **Business Logic**: Orders can be split across multiple teams based on workflow stages

## Team Member Management

### Member Roles
```typescript
interface TeamMember {
  userId: string,
  role: "manager" | "lead" | "member" | "trainee",
  responsibilities: string[],     // Specific responsibilities
  permissions: string[],          // Team-specific permissions
  joinDate: number,               // When they joined the team
  isActive: boolean,              // Whether they're active in the team
}
```

### Team Assignment Rules
- Users can be members of multiple teams
- Each team has one manager/lead
- Team members inherit team permissions
- Team assignments can be temporary or permanent

## Performance Tracking

### Team Metrics
```typescript
interface TeamPerformance {
  teamId: string,
  period: "daily" | "weekly" | "monthly",
  startDate: number,
  endDate: number,
  
  // Production Metrics
  itemsAssigned: number,
  itemsCompleted: number,
  itemsInProgress: number,
  completionRate: number,
  
  // Time Metrics
  totalWorkTime: number,          // Total time worked in minutes
  avgCompletionTime: number,      // Average time per item
  efficiency: number,             // Efficiency rating (0-100)
  
  // Quality Metrics
  itemsPassed: number,
  itemsFailed: number,
  qualityScore: number,           // Quality score (0-100)
  defectRate: number,             // Defect rate percentage
  
  // Workload Metrics
  capacityUtilization: number,    // How much of team capacity is used
  workloadDistribution: number,   // How evenly work is distributed
  overtimeHours: number,          // Overtime hours worked
}
```

### Performance Calculation
- **Completion Rate**: (itemsCompleted / itemsAssigned) * 100
- **Efficiency**: (standardTime / actualTime) * 100
- **Quality Score**: (itemsPassed / itemsCompleted) * 100
- **Capacity Utilization**: (currentWorkload / capacity) * 100

## Team Scheduling

### Shift Management
```typescript
interface TeamShift {
  teamId: string,
  shiftId: string,
  dayOfWeek: number,              // 0-6 (Sunday-Saturday)
  startTime: string,              // HH:MM format
  endTime: string,                // HH:MM format
  breakDuration: number,          // Break duration in minutes
  isActive: boolean,
  assignedMembers: string[],      // Members assigned to this shift
}
```

### Availability Tracking
- Track team availability by shift
- Monitor capacity vs. demand
- Handle overtime and emergency assignments
- Manage team member absences

## Data Access Patterns

### Team Management
- **Admin Users**: Full team management access
- **Team Managers**: Manage their own team members and performance
- **Team Members**: View team information and their own performance
- **Other Users**: View team information for collaboration

### Performance Access
- **Team Managers**: Full performance data for their team
- **Team Members**: Individual performance data
- **Admin Users**: All team performance data
- **Brand Users**: Limited team performance data (if applicable)

## API Endpoints (Backend Implementation)

### Core CRUD Operations
- `POST /api/teams` - Create new team
- `GET /api/teams` - List teams
- `GET /api/teams/:id` - Get team details
- `PUT /api/teams/:id` - Update team
- `DELETE /api/teams/:id` - Delete team

### Member Management
- `POST /api/teams/:id/members` - Add member to team
- `DELETE /api/teams/:id/members/:userId` - Remove member from team
- `PUT /api/teams/:id/members/:userId/role` - Update member role
- `GET /api/teams/:id/members` - List team members

### Performance Management
- `GET /api/teams/:id/performance` - Get team performance
- `GET /api/teams/:id/performance/history` - Get performance history
- `POST /api/teams/:id/performance/update` - Update performance metrics
- `GET /api/teams/performance/comparison` - Compare team performance

### Assignment Management
- `PUT /api/teams/:id/workflows` - Assign workflows to team
- `PUT /api/teams/:id/locations` - Assign locations to team
- `PUT /api/teams/:id/stages` - Assign stages to team
- `GET /api/teams/:id/assignments` - Get team assignments

### Scheduling
- `POST /api/teams/:id/shifts` - Create team shift
- `PUT /api/teams/:id/shifts/:shiftId` - Update shift
- `DELETE /api/teams/:id/shifts/:shiftId` - Delete shift
- `GET /api/teams/:id/schedule` - Get team schedule

## Integration Points

### 1. User Integration
- Team assignments affect user permissions
- User performance contributes to team metrics
- Team changes trigger user notification updates
- User availability affects team capacity

### 2. Workflow Integration
- Teams are assigned to specific workflow stages
- Team performance affects workflow efficiency
- Workflow changes may require team reassignment
- Team capacity affects workflow planning

### 3. Item Integration
- Items are assigned to team members
- Team performance affects item completion rates
- Item quality affects team quality metrics
- Item priorities affect team workload

### 4. Order Integration
- Orders can be assigned to specific teams
- Team performance affects order completion
- Order complexity affects team assignment
- Order priorities affect team workload

### 5. Location Integration
- Teams are assigned to specific locations
- Location capacity affects team assignment
- Location changes may require team reassignment
- Location performance affects team efficiency

## Validation Rules

### Required Fields
- name (non-empty string)
- members array (non-empty)
- isActive (boolean)
- createdBy (valid user ID)

### Business Validations
- Team name must be unique within organization
- Manager must be a member of the team
- Team capacity must be positive
- Workload cannot exceed capacity
- Team members must be active users

### Data Integrity
- Team ID must be unique
- Member references must be valid users
- Workflow references must be valid workflows
- Location references must be valid locations
- Performance metrics must be within valid ranges

## Error Handling

### Common Error Scenarios
- Team name already exists
- Invalid team member assignment
- Team capacity exceeded
- Invalid workflow assignment
- Performance calculation errors

### Error Responses
- 400 Bad Request: Validation errors
- 403 Forbidden: Insufficient permissions
- 404 Not Found: Team not found
- 409 Conflict: Team name conflict
- 422 Unprocessable Entity: Business rule violations

## Performance Considerations

### Query Optimization
- Index teams by organization and status
- Cache frequently accessed team data
- Optimize team member queries
- Use pagination for large team lists

### Data Consistency
- Use transactions for team updates
- Validate team member assignments
- Maintain team performance integrity
- Ensure team capacity constraints

### Scalability
- Partition teams by organization
- Archive inactive teams after retention period
- Use read replicas for performance queries
- Implement background performance calculations
