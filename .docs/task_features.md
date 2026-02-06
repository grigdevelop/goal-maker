# Task Management System - Enhanced Features Implementation

## Overview
Extend the existing Task model to support deadlines, status tracking, and multiple task types (regular, repeatable, custom) with comprehensive history tracking using an event-driven architecture.

## Database Schema Updates

### Core Principles
- Separate current state from historical data
- Use unified scheduling model
- Implement on-demand history generation
- Optimize for query performance

### Task Model Extension
Minimal changes to keep model lightweight:
- `type`: Enum (REGULAR, REPEATABLE, CUSTOM)
- Remove status and endTime from Task model (moved to history)

### Enums

#### TaskStatus
```prisma
enum TaskStatus {
  TODO
  IN_PROGRESS
  DONE
}
```

#### TaskType
```prisma
enum TaskType {
  REGULAR
  REPEATABLE
  CUSTOM
}
```

#### ScheduleType
```prisma
enum ScheduleType {
  DAILY
  WEEKLY
  MONTHLY
  CUSTOM
}
```

### New Models

#### TaskHistory Model
Single source of truth for task state at any point in time:
- `id`: Int @id @default(autoincrement())
- `taskId`: Int (foreign key to Task)
- `status`: TaskStatus enum
- `endTime`: DateTime? (deadline at this point)
- `changedBy`: String? (userId who made the change, null for system-generated)
- `changeReason`: String? (STATUS_CHANGE, SCHEDULE_MATCH, DEADLINE_UPDATE, TYPE_CHANGE)
- `createdAt`: DateTime @default(now())
- Relationship: belongsTo Task
- Indexes: `@@index([taskId, createdAt])` for efficient latest state queries

#### TaskSchedule Model
Unified configuration for all task scheduling:
- `id`: Int @id @default(autoincrement())
- `taskId`: Int @unique (one-to-one with Task)
- `scheduleType`: ScheduleType enum
- `config`: Json (flexible structure for all schedule types)
- `lastEvaluatedAt`: DateTime? (cache to prevent duplicate evaluations)
- `createdAt`: DateTime @default(now())
- `updatedAt`: DateTime @default(now())
- Relationship: belongsTo Task

**Config Structure Examples:**
```json
// DAILY
{ "enabled": true }

// WEEKLY
{ "daysOfWeek": [1, 3, 5] }

// MONTHLY
{ "daysOfMonth": [1, 15, 30] }

// CUSTOM
{ "dates": ["2024-01-15", "2024-02-20", "2024-03-10"] }
```

## Business Logic

### Task History Management Rules

#### 1. Initial Creation
When task is created:
- Create initial TaskHistory entry
- Set status = TODO
- Set endTime if provided
- Set changedBy = userId
- Set changeReason = "INITIAL_CREATION"

#### 2. Status Transitions
Valid transitions:
- TODO → IN_PROGRESS (manual or auto)
- IN_PROGRESS → DONE (manual only)
- DONE → TODO (auto on next schedule occurrence)

When status changes:
- Create NEW TaskHistory entry
- Set new status
- Inherit endTime from latest history (unless explicitly changed)
- Set changedBy = userId or null (if system-generated)
- Set changeReason = "STATUS_CHANGE"

#### 3. Non-Status Updates
When only endTime changes:
- If latest history is less than 1 hour old → UPDATE existing entry
- Otherwise → CREATE new entry with changeReason = "DEADLINE_UPDATE"

When type changes:
- CREATE new TaskHistory entry
- Inherit status and endTime from latest history
- Set changeReason = "TYPE_CHANGE"

#### 4. Schedule-Based History Generation (Event-Driven)

**Trigger Points:**
- User views/accesses task
- User queries task list
- Manual refresh/sync action
- Optional: Lightweight background job (once per day, non-blocking)

**Evaluation Logic:**
```
For each task with TaskSchedule:
  1. Check lastEvaluatedAt
  2. If already evaluated today → skip
  3. Get latest TaskHistory
  4. Check if current date matches schedule
  5. If match AND latest status != IN_PROGRESS:
     - Create new history with status = IN_PROGRESS
     - Set changeReason = "SCHEDULE_MATCH"
  6. If latest status = DONE AND next schedule date passed:
     - Create new history with status = TODO
     - Set changeReason = "SCHEDULE_RESET"
  7. Update lastEvaluatedAt = now()
```

### Task Type Behaviors

**REGULAR**
- No TaskSchedule required
- History only created by user actions
- Simple deadline tracking

**REPEATABLE**
- Requires TaskSchedule with DAILY/WEEKLY/MONTHLY
- Auto-generates history on schedule match
- Automatically resets from DONE to TODO on next occurrence

**CUSTOM**
- Requires TaskSchedule with CUSTOM type
- Evaluates against specific dates in config
- Does NOT auto-reset (one-time occurrences)

## API Design

### Endpoints

#### Get Task with Current State
```
GET /tasks/:id
Response: {
  ...taskFields,
  currentStatus: "TODO",
  currentEndTime: "2024-12-31",
  lastUpdated: "2024-01-15T10:00:00Z"
}
```

#### Update Task Status
```
PATCH /tasks/:id/status
Body: { status: "IN_PROGRESS" }
- Validates transition rules
- Creates new TaskHistory entry
```

#### Get Task History
```
GET /tasks/:id/history?limit=10
Response: [ ...historyEntries ]
```

#### Bulk Evaluate Schedules
```
POST /tasks/evaluate-schedules
- Triggers on-demand evaluation for all scheduled tasks
- Returns count of updated tasks
```

## Performance Optimizations

### Database Indexes
```prisma
@@index([taskId, createdAt(sort: Desc)]) // Fast latest state lookup
@@index([taskId]) // Foreign key optimization
@@index([createdAt]) // Time-based queries
```

### Caching Strategy
- Cache latest TaskHistory per task (Redis/in-memory)
- Invalidate on new history creation
- Cache schedule evaluation results for 24 hours

### Query Optimization
```sql
-- Get current state (single query)
SELECT * FROM task_history 
WHERE taskId = ? 
ORDER BY createdAt DESC 
LIMIT 1;

-- Batch current states (single query)
SELECT DISTINCT ON (taskId) * 
FROM task_history 
WHERE taskId IN (?, ?, ?) 
ORDER BY taskId, createdAt DESC;
```

## Implementation Checklist

### Phase 1: Schema & Core Logic
- [ ] Define Prisma enums (TaskStatus, TaskType, ScheduleType)
- [ ] Create TaskHistory model with indexes
- [ ] Create TaskSchedule model with Json config
- [ ] Update Task model (add type, remove status/endTime if present)
- [ ] Generate and test migration scripts

### Phase 2: History Service
- [ ] Implement TaskHistoryService.create()
- [ ] Implement TaskHistoryService.getLatest(taskId)
- [ ] Implement TaskHistoryService.getHistory(taskId, limit)
- [ ] Implement status transition validation
- [ ] Add change reason tracking

### Phase 3: Schedule Evaluation
- [ ] Implement ScheduleEvaluator.shouldActivate(schedule, date)
- [ ] Implement ScheduleEvaluator.evaluateTask(taskId)
- [ ] Implement ScheduleEvaluator.evaluateAll()
- [ ] Add lastEvaluatedAt tracking and deduplication

### Phase 4: API Layer
- [ ] Create POST /tasks (with initial history)
- [ ] Create GET /tasks/:id (with current state)
- [ ] Create PATCH /tasks/:id/status (with transition validation)
- [ ] Create PATCH /tasks/:id (handle endTime/type updates)
- [ ] Create GET /tasks/:id/history
- [ ] Create POST /tasks/evaluate-schedules

### Phase 5: Background Processing
- [ ] Create lightweight cron job (runs once daily)
- [ ] Implement event hooks on task access
- [ ] Add manual sync endpoint

### Phase 6: Testing & Optimization
- [ ] Unit tests: status transitions
- [ ] Unit tests: schedule matching logic
- [ ] Unit tests: history creation rules
- [ ] Integration tests: full task lifecycle
- [ ] Integration tests: schedule evaluation
- [ ] Load tests: query performance with indexes
- [ ] Add caching layer for latest states

### Phase 7: Documentation
- [ ] API documentation with examples
- [ ] Schedule config format documentation
- [ ] Status transition diagram
- [ ] Database migration guide

## UI/UX Requirements for Task Forms

### Task Creation Form & Task Edit Page

The form should dynamically show/hide schedule configuration fields based on the selected `TaskType`:

#### REGULAR Tasks
- **No schedule fields visible**
- Only show basic task fields (title, description, deadline, etc.)

#### REPEATABLE Tasks
- **Show schedule type selector** with options:
  - DAILY: No additional configuration needed
  - WEEKLY: Multi-select for days of week (Mon-Sun)
  - MONTHLY: Multi-select for days of month (1-31)
  - CUSTOM: Date picker for selecting multiple specific dates
- **Validation**: At least one schedule configuration must be selected

#### CUSTOM Tasks
- **Show CUSTOM schedule configuration only**
- Date picker for selecting multiple specific future dates
- **Validation**: At least one date must be selected

### Form Behavior
- Schedule fields appear/disappear instantly when task type changes
- Previously configured schedule data is preserved when switching types
- Clear visual indication of required fields
- Inline validation errors for invalid schedule configurations