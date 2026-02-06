## Goals and Skills Progress Calculation

### Overview
Goals and Skills should display aggregated progress based on their related entries:
- **Goals**: Calculate progress from related Tasks and Skills
- **Skills**: Calculate progress from related Tasks
- **Tasks**: Use their own `targetCount`/`currentCount` progress tracking

### Calculation Logic

#### Task Progress
- If `targetCount` is set: `(currentCount / targetCount) * 100`
- If no `targetCount`: Binary completion (0% or 100% based on status)

#### Skill Progress
```
totalProgress = sum of all related task progress percentages
skillProgress = totalProgress / number of related tasks
```

#### Goal Progress
```
taskProgress = sum of all related task progress / number of related tasks
skillProgress = sum of all related skill progress / number of related skills
goalProgress = (taskProgress + skillProgress) / 2
```
If only tasks or only skills exist, use that category's progress as 100% of the goal progress.

### Implementation Requirements
- [ ] Add progress calculation methods to Task, Skill, and Goal services
- [ ] Include progress in GET endpoints for Goals and Skills
- [ ] Update UI to display progress bars for all three entity types
- [ ] Add real-time progress updates when task progress changes
- [ ] Cache calculated progress values to optimize performance


### Automatic Progress Recalculation

Progress should be automatically recalculated and updated whenever:
- A task's `currentCount` or `targetCount` changes
- A task's status changes to/from DONE
- A task is created with a goal or skill relationship
- A task is deleted
- A task's relationships to goals or skills are modified

**Implementation Strategy:**
- Use database triggers or application-level hooks
- Recalculate affected Goal/Skill progress after each task modification
- Consider debouncing for bulk operations to avoid excessive recalculations