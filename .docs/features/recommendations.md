I would like to add new feature which based on user goals, skills and progress would provide recommendations for user.

- if user has no created task recommendation should be to create task
- if user has no created goal recommendation should be to create goal
- if user has no created skill recommendation should be to create skill
- if user has goal without tasks recommendation should be to create task or skill for that goal or assign existing skill or existing task
- if user has skill without goals recommendation should be to create goal or assign existing goal
- if user has skill without tasks recommendation should be to create task or assign existing task
- if user has task in progress today recommendation should be to complete task
- show top 3 goals ordered by progress
- show top 3 skills ordered by progress
- show top 3 tasks ordered by progress

implement the service function that returns all this data in one well structured response. Split the logic into smaller functions.



# Recommendations Feature

## Overview
Create a recommendation engine that analyzes user goals, skills, tasks, and progress to provide personalized actionable suggestions.

## Recommendation Rules

### Empty State Recommendations
1. **No tasks exist** → Recommend: "Create your first task"
2. **No goals exist** → Recommend: "Create your first goal"
3. **No skills exist** → Recommend: "Create your first skill"

### Relationship-Based Recommendations
4. **Goal without associated tasks** → Recommend: "Add tasks to goal '{goalName}'" or "Link existing tasks/skills to this goal"
5. **Skill without associated goals** → Recommend: "Connect skill '{skillName}' to a goal" or "Create a goal for this skill"
6. **Skill without associated tasks** → Recommend: "Add practice tasks for skill '{skillName}'"

### Action-Based Recommendations
7. **Task in progress with today's due date** → Recommend: "Complete task '{taskName}' - due today!"

### Progress Highlights
8. **Top 3 goals by progress** → Display goals closest to completion
9. **Top 3 skills by progress** → Display skills with highest mastery level
10. **Top 3 tasks by progress** → Display tasks nearest to completion

## Implementation Requirements

### Service Function Structure
```typescript
// Main service function
getRecommendations(userId: string): Promise<RecommendationsResponse>

// Helper functions to split logic
- checkEmptyStates(userId): EmptyStateRecommendations
- findOrphanedGoals(userId): Goal[]
- findOrphanedSkills(userId): Skill[]
- findTodayInProgressTasks(userId): Task[]
- getTopGoalsByProgress(userId, limit: 3): Goal[]
- getTopSkillsByProgress(userId, limit: 3): Skill[]
- getTopTasksByProgress(userId, limit: 3): Task[]
```

### Response Structure
```typescript
interface RecommendationsResponse {
  recommendations: Recommendation[];
  highlights: {
    topGoals: Goal[];
    topSkills: Skill[];
    topTasks: Task[];
  };
}

interface Recommendation {
  type: 'create' | 'link' | 'complete';
  priority: 'high' | 'medium' | 'low';
  message: string;
  action: string;
  targetId?: string;
  targetType?: 'goal' | 'skill' | 'task';
}
```

## Testing Requirements

Write comprehensive unit tests covering:
- Empty state detection for tasks, goals, and skills
- Orphaned entity identification (goals without tasks, skills without goals/tasks)
- Today's in-progress task retrieval
- Top 3 sorting by progress for each entity type
- Complete recommendation response structure validation


Create React components for the recommendations feature:

1. **RecommendationCard** - Displays a single recommendation with:
   - Icon based on type (create/link/complete)
   - Priority indicator (color-coded: high=red, medium=yellow, low=green)
   - Message text
   - Action button that triggers the recommended action

2. **RecommendationsList** - Renders a list of RecommendationCard components
   - Sorts by priority (high → medium → low)
   - Shows empty state when no recommendations

3. **HighlightsSection** - Displays top 3 items for goals, skills, and tasks
   - Three columns/tabs for each entity type
   - Progress bar for each item
   - Clickable items that navigate to detail view

4. **RecommendationsDashboard** - Main container component
   - Fetches data from recommendations API
   - Composes RecommendationsList and HighlightsSection
   - Handles loading and error states


Update WelcomeHero component:

1. **Extended Description**: Rewrite the hero description to be more comprehensive and engaging, explaining:
   - The core purpose of the goal tracking application
   - How goals, skills, and tasks work together
   - The value proposition for users (productivity, progress visualization, personalized recommendations)

2. **Inline Navigation Links**: Embed contextual navigation links within the welcome text that:
   - Link relevant keywords to their corresponding sections/pages (e.g., "goals" links to /goals, "skills" links to /skills)
   - Use subtle styling that fits the hero aesthetic (underline on hover, accent color)
   - Maintain readability while providing quick access to key features

3. **Call-to-Action**: Include a clear primary CTA button below the description text