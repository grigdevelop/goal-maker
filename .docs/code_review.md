# Goal Maker — Code Review & Recommendations

> Generated: 2026-02-07
> Scope: Full codebase analysis covering architecture, code quality, testing, performance, security, and best practices.

---

## Table of Contents

1. [Project Structure](#1-project-structure--directory-organization)
2. [Code Quality Issues & Anti-Patterns](#2-code-quality-issues--anti-patterns)
3. [Documentation Gaps](#3-documentation-gaps)
4. [Dependency Management](#4-dependency-management)
5. [Testing Coverage & Strategies](#5-testing-coverage--strategies)
6. [Performance Optimization](#6-performance-optimization)
7. [Security Considerations](#7-security-considerations)
8. [Best Practices Alignment](#8-best-practices-alignment)

---

## 1. Project Structure & Directory Organization

### Current Structure (Good)

```
src/
├── app/              # Next.js App Router pages & API routes
│   ├── (auth)/       # Auth route group (login/register)
│   ├── (dashboard)/  # Dashboard route group
│   └── api/          # REST API endpoints
├── components/       # UI components grouped by domain
│   ├── auth/
│   ├── goals/
│   ├── layouts/
│   ├── shared/
│   ├── skills/
│   ├── tasks/
│   └── ui/
├── hooks/            # React hooks
│   └── api/          # Data-fetching hooks
├── lib/              # Core business logic
│   ├── actions/      # Server actions
│   ├── constants/
│   ├── react-query/
│   ├── services/     # Data access layer
│   └── utils/
└── schemas/          # Zod validation schemas
```

**Strengths:** Domain-based component grouping, clean separation of services from API routes, shared components extracted well.

### Recommendations

#### P1 — Remove dead/placeholder files

| File | Issue |
|------|-------|
| `src/app/(dashboard)/content.tsx` | 37KB of Lorem Ipsum placeholder text |
| `src/components/layouts/MainContent.tsx` | Empty file (0 bytes) |
| `src/lib/react-query/query-client.ts` | Empty file (1 byte) |

#### P2 — Move `proxy.ts` into middleware

`src/proxy.ts` contains middleware logic (auth redirect) but is not wired as Next.js middleware. It should either be renamed to `middleware.ts` at the project root or deleted if unused.

```ts
// Current: src/proxy.ts (dead code — never imported)
// Fix: Move to /middleware.ts at project root if needed
```

#### P3 — Consolidate validation schemas

Zod schemas in `src/schemas/` are minimal (title + description only) and don't cover API input validation. Consider co-locating them with services or expanding them to cover all API inputs.

```
src/schemas/
├── goal.schema.ts    # Only validates title + description
├── skill.schema.ts   # Same
└── task.schema.ts    # Same — missing type, targetCount, endTime
```

**Recommendation:** Expand schemas to cover all create/update fields and use them in API routes for request body validation.

#### P4 — Move `tagUtils.ts` into `utils/`

`src/lib/tagUtils.ts` is a DOM utility sitting at the `lib/` root. Move it to `src/lib/utils/dom/tagUtils.ts` for consistency.

---

## 2. Code Quality Issues & Anti-Patterns

### P1 — QueryClient created on every render

```tsx
// src/components/shared/QueryProvider.tsx
export const QueryProvider = ({ children }: { children: React.ReactNode }) => {
    // BUG: Creates a new QueryClient on every render, destroying cache
    const queryClient = new QueryClient();
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
};
```

**Fix:** Use `useState` or a module-level singleton:

```tsx
'use client';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { useState } from 'react';

export const QueryProvider = ({ children }: { children: React.ReactNode }) => {
    const [queryClient] = useState(() => new QueryClient({
        defaultOptions: {
            queries: {
                staleTime: 60 * 1000,
                retry: 1,
            },
        },
    }));
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
};
```

This is a **critical bug** — the current code destroys the React Query cache on every re-render of the provider.

### P2 — No request body validation in API routes

All API routes destructure `request.json()` without validation:

```ts
// src/app/api/goals/route.ts
const body = await request.json();
const { title, description } = body; // No validation — any shape accepted
```

**Fix:** Use Zod schemas (already defined but unused):

```ts
import { goalSchema } from '@/schemas/goal.schema';

const body = await request.json();
const parsed = goalSchema.safeParse(body);
if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 400 });
}
const { title, description } = parsed.data;
```

### P3 — Duplicated authorization pattern across routes

Every API route repeats the same fetch-then-check-ownership pattern:

```ts
const goal = await getGoalById({ id: goalId });
if (!goal) return Response.json({ error: 'Goal not found' }, { status: 404 });
if (goal.userId !== session.user.id) return Response.json({ error: 'Unauthorized' }, { status: 401 });
```

**Fix:** Create a `withOwnership` helper or extend `withSession`:

```ts
export function withOwnership<T>(
    entityFetcher: (id: number) => Promise<{ userId: string } | null>,
    handler: (entity: T, session: Session) => Promise<Response>
) {
    return withSession(async (request, session, ctx) => {
        const id = parseInt((await ctx.params).id, 10);
        if (isNaN(id)) return Response.json({ error: 'Invalid ID' }, { status: 400 });
        const entity = await entityFetcher(id);
        if (!entity) return Response.json({ error: 'Not found' }, { status: 404 });
        if (entity.userId !== session.user.id) return Response.json({ error: 'Unauthorized' }, { status: 401 });
        return handler(entity as T, session);
    });
}
```

### P4 — Swallowed errors in catch blocks

Multiple API routes catch errors but return generic messages, losing the actual error:

```ts
} catch (error) {
    return Response.json({ error: 'Goal not found' }, { status: 404 }); // Always "not found"?
}
```

**Fix:** Log the actual error and return appropriate status codes:

```ts
} catch (error) {
    console.error('Failed to update goal:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return Response.json({ error: message }, { status: 500 });
}
```

### P5 — `faker` imported in production API route

```ts
// src/app/api/goals/generate/route.ts
import { faker } from '@faker-js/faker'; // @faker-js/faker is a devDependency
```

`@faker-js/faker` is listed in `devDependencies` but imported in a production API route. This will fail in production builds. Either:
- Move `@faker-js/faker` to `dependencies`, or
- Guard this route to only work in development, or
- Remove it entirely (it deletes all user goals — dangerous)

### P6 — Inconsistent type patterns

Services use two different patterns for types:

```ts
// Pattern A: Inferred from return type (good)
export type GetGoalsResponse = Awaited<ReturnType<typeof getGoals>>;

// Pattern B: Manually defined (progress-service.ts)
export type GoalWithProgress = {
    id: number;
    title: string;
    // ... manually duplicated from Prisma model
};
```

**Recommendation:** Use Prisma's generated types with intersection for consistency:

```ts
import type { Goal } from '@/../generated/prisma/client';

export type GoalWithProgress = Goal & {
    progress: number;
    taskCount: number;
    skillCount: number;
};
```

### P7 — Unused imports pattern

The `EntityCard` component accepts an `aria-label` prop in `GoalCard` but `EntityCard` doesn't forward it — it generates its own.

---

## 3. Documentation Gaps

### P1 — No API documentation

21 API endpoints with no documentation. Consider adding:
- A `docs/api.md` with endpoint descriptions, request/response shapes
- Or use a tool like `swagger`/`openapi` to auto-generate docs

### P2 — Missing README sections

Current README is minimal. Add:
- **Environment setup** (required env vars: `DATABASE_URL`, `TURSO_AUTH_TOKEN`, `LOCAL_DATABASE_URL`)
- **Database setup** (local SQLite vs Turso)
- **Architecture overview** (service layer → API routes → hooks → components)
- **Testing instructions**

### P3 — No JSDoc on service functions

Service functions are the core business logic but have no JSDoc. Key functions to document:
- `addProgress` — complex logic with auto-completion
- `changeStatus` — state machine with transition validation
- `evaluateTask` — schedule evaluation with multiple branches
- `calcGoalProgressById` — aggregation logic

### P4 — `.docs/` directory is incomplete

Only contains `progress_tracking.md` and `task_features.md`. Consider adding:
- `architecture.md` — system design overview
- `database.md` — schema documentation and relationships
- `deployment.md` — Turso setup, migration workflow

---

## 4. Dependency Management

### Current Dependencies (package.json)

| Package | Version | Notes |
|---------|---------|-------|
| next | 16.1.3 | Latest |
| react | 19.2.3 | Latest |
| prisma | ^7.3.0 | Latest |
| better-auth | ^1.4.17 | Auth library |
| zod | ^4.3.6 | Validation (underutilized) |
| react-hook-form | ^7.71.1 | Form handling |

### Recommendations

#### P1 — Pin major versions

Using `^` ranges for critical dependencies risks breaking changes:

```json
// Current
"next": "16.1.3",        // Pinned (good)
"prisma": "^7.3.0",      // Risky — ^7.x could break
"better-auth": "^1.4.17" // Risky
```

**Fix:** Pin major.minor for critical deps or use a lockfile strategy.

#### P2 — `prisma` should be in devDependencies

The `prisma` CLI package is listed in `dependencies` but is only needed for development/build:

```json
// Move from dependencies to devDependencies:
"prisma": "^7.3.0"
```

Keep `@prisma/client` in dependencies.

#### P3 — Add missing dev tooling

Consider adding:
- **`@tanstack/react-query-devtools`** — Debug React Query cache in development
- **`prettier`** — Code formatting (no formatter configured)
- **Husky + lint-staged** — Pre-commit hooks for linting

#### P4 — Broken lint script

```json
"lint": "npx lint ."  // Should be "npx eslint ."
```

---

## 5. Testing Coverage & Strategies

### Current Coverage

| Test File | Tests | What's Covered |
|-----------|-------|----------------|
| `tasks.test.ts` | 38 | CRUD, relations (goal-task, skill-task) |
| `task-history.test.ts` | 36 | Status transitions, deadlines, type changes |
| `schedule-evaluator.test.ts` | 33 | Schedule matching, task evaluation |
| `progress-tracking.test.ts` | 22 | Progress increment, auto-completion, history |
| **Total** | **129** | **Service layer only** |

### Gaps

#### P1 — No tests for goal/skill services

`goal-service.ts`, `skill-service.ts`, `goal-relation-service.ts`, `skill-relation-service.ts` have zero test coverage. These are simpler CRUD services but should still have basic tests.

#### P2 — No tests for progress aggregation

`progress-service.ts` (the new progress calculation service) has no dedicated tests. The `calcTaskProgress`, `calcSkillProgressById`, and `calcGoalProgressById` functions contain important aggregation logic that should be tested:

```ts
describe('calcTaskProgress', () => {
    it('returns percentage when targetCount is set', () => {
        expect(calcTaskProgress({ targetCount: 100, currentCount: 50 })).toBe(50);
    });
    it('caps at 100%', () => {
        expect(calcTaskProgress({ targetCount: 10, currentCount: 15 })).toBe(100);
    });
    it('returns 0 for TODO tasks without targetCount', () => {
        expect(calcTaskProgress({ status: 'TODO' })).toBe(0);
    });
    it('returns 100 for DONE tasks without targetCount', () => {
        expect(calcTaskProgress({ status: 'DONE' })).toBe(100);
    });
});
```

#### P3 — No API route / integration tests

All tests are unit tests against the service layer. No tests verify:
- API route behavior (status codes, error responses)
- Authentication/authorization enforcement
- Request validation

#### P4 — No component / UI tests

No React component tests exist. Priority components to test:
- `InlineEdit` — Complex interaction logic
- `EntitySelector` — Dropdown with search/create
- `ConfirmDialog` — Modal state management

#### P5 — Test setup creates real DB files

Tests use a real SQLite file (`prisma/test.db`) which can conflict with parallel runs and clutters the repo. Consider using an in-memory SQLite database.

---

## 6. Performance Optimization

### P1 — N+1 query problem in progress calculation

`getGoalsWithProgress` and `getSkillsWithProgress` execute separate queries per entity:

```ts
// src/lib/services/progress-service.ts
export async function getGoalsWithProgress(userId: string) {
    const goals = await prisma.goal.findMany({ where: { userId } });
    return Promise.all(
        goals.map(async (goal) => {
            const progress = await calcGoalProgressById(goal.id); // N queries
            return { ...goal, ...progress };
        })
    );
}
```

Each `calcGoalProgressById` call makes 2 more queries (tasks + skills), and each skill progress makes another query. For 10 goals with 5 tasks and 3 skills each:
- 1 (goals) + 10 × (1 tasks + 1 skills + 3 skill-tasks) = **51 queries**

**Fix:** Batch-fetch all relations in a single query:

```ts
export async function getGoalsWithProgress(userId: string) {
    const goals = await prisma.goal.findMany({
        where: { userId },
        include: {
            goalTasks: {
                include: {
                    task: { include: { history: { orderBy: { createdAt: 'desc' }, take: 1 } } }
                }
            },
            goalSkills: {
                include: {
                    skill: {
                        include: {
                            skillTasks: {
                                include: {
                                    task: { include: { history: { orderBy: { createdAt: 'desc' }, take: 1 } } }
                                }
                            }
                        }
                    }
                }
            }
        }
    });
    // Calculate progress in-memory from the included data
}
```

This reduces 51 queries to **1 query**.

### P2 — N+1 in `getTasksWithCurrentState`

```ts
export async function getTasksWithCurrentState(userId: string) {
    const tasks = await prisma.task.findMany({ where: { userId }, include: { schedule: true } });
    const tasksWithState = await Promise.all(
        tasks.map(async (task) => {
            const latest = await getLatestHistory(task.id); // N queries
            // ...
        })
    );
}
```

**Fix:** Include history in the initial query:

```ts
const tasks = await prisma.task.findMany({
    where: { userId },
    include: {
        schedule: true,
        history: { orderBy: { createdAt: 'desc' }, take: 1 },
    },
});
```

### P3 — No pagination on list endpoints

`GET /api/goals`, `GET /api/skills`, `GET /api/tasks` return all records with no pagination. As data grows, this will degrade performance.

**Fix:** Add cursor-based or offset pagination:

```ts
export const GET = withSession(async (request, session) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') ?? '1');
    const limit = Math.min(parseInt(url.searchParams.get('limit') ?? '20'), 100);

    const [items, total] = await Promise.all([
        prisma.goal.findMany({
            where: { userId: session.user.id },
            skip: (page - 1) * limit,
            take: limit,
            orderBy: { createdAt: 'desc' },
        }),
        prisma.goal.count({ where: { userId: session.user.id } }),
    ]);

    return Response.json({ items, total, page, limit });
});
```

### P4 — `evaluateAll` processes tasks sequentially

```ts
for (const task of scheduledTasks) {
    const result = await evaluateTask(task.id, date); // Sequential
}
```

**Fix:** Use `Promise.all` or batch processing with concurrency limits.

---

## 7. Security Considerations

### P1 — `evaluate-schedules` endpoint has no authorization scope

```ts
// src/app/api/tasks/evaluate-schedules/route.ts
export const POST = withSession(async () => {
    const result = await evaluateAll(); // Evaluates ALL users' tasks
    return Response.json(result);
});
```

Any authenticated user can trigger schedule evaluation for **all users' tasks**. This should be restricted to admin users or scoped to the current user.

### P2 — `generate` endpoint is destructive

```ts
// src/app/api/goals/generate/route.ts — GET request deletes all goals!
await prisma.goal.deleteMany({ where: { userId: session.user.id } });
```

A GET request that deletes data violates HTTP semantics. This should be:
- Behind a development-only guard
- Changed to POST/DELETE method
- Removed from production builds

### P3 — Missing CSRF protection

The `better-auth` setup doesn't show explicit CSRF configuration. Verify that CSRF tokens are enforced for state-changing operations.

### P4 — No rate limiting

API routes have no rate limiting. Consider adding rate limiting middleware, especially for:
- `POST /api/auth/*` (login/register)
- `POST /api/tasks/evaluate-schedules`

### P5 — Commented-out code exposes architecture decisions

```ts
// src/lib/prisma.ts
// const adapter = new PrismaBetterSqlite3({
//   url: process.env.DATABASE_URL!
// });
```

Remove commented-out code from production files.

### P6 — `proxy.ts` contains security warning

```ts
// THIS IS NOT SECURE!
// This is the recommended approach to optimistically redirect users
```

This file appears to be dead code (not imported anywhere). Remove it or wire it properly as middleware.

---

## 8. Best Practices Alignment

### P1 — Use `updatedAt` with `@updatedAt` directive

Prisma models use `@default(now())` for `updatedAt` instead of `@updatedAt`:

```prisma
// Current
updatedAt DateTime @default(now())

// Recommended
updatedAt DateTime @updatedAt
```

`@updatedAt` automatically updates the timestamp on every write. Currently, `updatedAt` is never updated after creation (except manually in `upsertSchedule`).

### P2 — Use enums instead of string constants for Prisma

Task status, type, and schedule type are stored as strings with application-level validation:

```prisma
// Current
type String @default("REGULAR")
status String @default("TODO")
```

SQLite doesn't support enums natively, but you can add `@check` constraints or validate at the Prisma level. At minimum, add comments documenting valid values.

### P3 — Consistent error handling pattern

Create a custom error class for domain errors:

```ts
export class AppError extends Error {
    constructor(
        message: string,
        public statusCode: number = 400,
        public code?: string
    ) {
        super(message);
    }
}

// Usage in services
throw new AppError('Invalid status transition', 400, 'INVALID_TRANSITION');

// Usage in API routes
} catch (error) {
    if (error instanceof AppError) {
        return Response.json({ error: error.message, code: error.code }, { status: error.statusCode });
    }
    return Response.json({ error: 'Internal server error' }, { status: 500 });
}
```

### P4 — Add `loading.tsx` files for route groups

Dashboard pages use `Suspense` in components but don't have `loading.tsx` files at the route level. Add them for better loading UX:

```
src/app/(dashboard)/goals/loading.tsx
src/app/(dashboard)/skills/loading.tsx
src/app/(dashboard)/tasks/loading.tsx
```

### P5 — Extract progress bar into a shared component

The progress bar UI is duplicated across `GoalCard`, `GoalInfo`, `SkillCard`, and `SkillInfo`:

```tsx
<div className="w-full bg-base-300 rounded-full h-2 overflow-hidden">
    <div
        className={`h-full rounded-full transition-all duration-300 ${
            progress >= 100 ? 'bg-success' : progress >= 50 ? 'bg-info' : 'bg-primary'
        }`}
        style={{ width: `${progress}%` }}
    ></div>
</div>
```

**Fix:** Extract to `src/components/ui/ProgressBar.tsx`:

```tsx
type Props = {
    value: number;
    size?: 'sm' | 'md';
    showLabel?: boolean;
};

export function ProgressBar({ value, size = 'sm', showLabel = false }: Props) {
    const height = size === 'sm' ? 'h-2' : 'h-4';
    const color = value >= 100 ? 'bg-success' : value >= 50 ? 'bg-info' : 'bg-primary';

    return (
        <div>
            {showLabel && (
                <div className="flex items-center justify-between text-xs mb-1">
                    <span className="opacity-60">Progress</span>
                    <span className="font-mono">{value}%</span>
                </div>
            )}
            <div className={`w-full bg-base-300 rounded-full ${height} overflow-hidden`}>
                <div
                    className={`h-full rounded-full transition-all duration-300 ${color}`}
                    style={{ width: `${value}%` }}
                />
            </div>
        </div>
    );
}
```

---

## Priority Summary

| Priority | Count | Description |
|----------|-------|-------------|
| **Critical** | 2 | QueryClient re-creation bug, N+1 queries |
| **High** | 6 | No input validation, no progress service tests, evaluate-schedules auth, destructive GET endpoint, faker in prod, swallowed errors |
| **Medium** | 8 | Pagination, dead files, duplicated patterns, documentation, lint script, @updatedAt, progress bar extraction, loading states |
| **Low** | 5 | File organization, JSDoc, dev tooling, commented code, enum comments |

### Recommended Action Order

1. **Fix QueryClient bug** — Immediate, causes cache loss on every render
2. **Add request validation** — Use existing Zod schemas in API routes
3. **Fix N+1 queries** — `getGoalsWithProgress`, `getTasksWithCurrentState`
4. **Secure evaluate-schedules** — Scope to current user or admin
5. **Remove/guard generate endpoint** — Destructive GET in production
6. **Add progress service tests** — Core aggregation logic untested
7. **Extract shared ProgressBar** — Reduce duplication
8. **Add pagination** — Prevent unbounded queries
