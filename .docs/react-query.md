# React Query + Better Auth + Next.js App Router (Next 16) Setup

This repo uses:

- Next.js `16.1.3` (App Router)
- React `19.2.3`
- Better Auth `1.4.17`

This document shows how to configure `@tanstack/react-query` for:

- Optimal defaults (stale/caching/retry)
- Type-safe query keys and data
- Server-side session checks + server prefetching
- Proper hydration boundaries between Server and Client components
- Solid invalidation patterns after mutations
- Best practices for caching authenticated user data

---

## Install

```bash
npm i @tanstack/react-query
```

Optional (dev only):

```bash
npm i -D @tanstack/react-query-devtools
```

---

## 1) `QueryClientProvider` setup in the root layout

In App Router, `src/app/layout.tsx` is a **Server Component** by default. React Query providers must be in a **Client Component**.

### `src/lib/react-query/query-client.ts`

```ts
import {
  QueryClient,
  defaultShouldDehydrateQuery,
} from '@tanstack/react-query'
import { isServer } from '@tanstack/react-query'

const ONE_MINUTE = 60 * 1000

export function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Data is considered fresh for 30 seconds before refetch
        staleTime: 30 * 1000,
        // Unused/inactive data is garbage collected after 10 minutes
        gcTime: 10 * ONE_MINUTE,

        // Don't refetch when user returns to the browser tab
        refetchOnWindowFocus: false,
        // Refetch when network connection is restored
        refetchOnReconnect: true,
        // Don't refetch when component mounts if data exists
        refetchOnMount: false,

        // Custom retry logic: no retry for auth errors, max 2 retries otherwise
        retry(failureCount, error) {
          const anyErr = error as any
          const status = anyErr?.status ?? anyErr?.response?.status

          // Never retry authentication/authorization failures
          if (status === 401 || status === 403) return false
          // Retry up to 2 times for other errors
          return failureCount < 2
        },
        // Exponential backoff capped at 10 seconds (1s, 2s, 4s, 8s, 10s...)
        retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 10_000),
      },
      mutations: {
        retry: 0,
      },
    },
  })
}

let browserQueryClient: QueryClient | undefined

export function getQueryClient() {
  if (isServer) return makeQueryClient()
  if (!browserQueryClient) browserQueryClient = makeQueryClient()
  return browserQueryClient
}

export function shouldDehydrateQuery(query: unknown) {
  return defaultShouldDehydrateQuery(query)
}
```

### `src/lib/react-query/provider.tsx`

```tsx
'use client'

import type React from 'react'
import { QueryClientProvider } from '@tanstack/react-query'
import { getQueryClient } from './query-client'

export function ReactQueryProvider({ children }: { children: React.ReactNode }) {
  const client = getQueryClient()
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>
}
```

If you installed devtools, you can conditionally render them here (dev-only).

### `src/app/layout.tsx`

```tsx
import './globals.css'
import { ReactQueryProvider } from '@/lib/react-query/provider'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ReactQueryProvider>{children}</ReactQueryProvider>
      </body>
    </html>
  )
}
```

---

## 2) Server-side prefetching patterns for authenticated routes

Best-practice in App Router:

- Do the **auth check in a Server Component** using Better Auth.
- Prefetch with a server-side `QueryClient`.
- Dehydrate into a **small hydration boundary** for the client subtree.

### Pattern A (recommended): share a server data function

Instead of prefetching via `/api/...` from the server, prefer sharing a server-only data function (e.g. `getGoalsForUser(userId)`), used by:

- `src/app/api/goals/route.ts` (API)
- `src/app/(app)/goals/page.tsx` (RSC)

This avoids an extra HTTP hop and avoids Next `fetch` caching pitfalls for cookie-based auth.

### Pattern B: prefetch from API route (OK if configured carefully)

If you prefetch from `/api/...` on the server:

- pass `cookie` header through
- set `cache: 'no-store'` (or `next: { revalidate: 0 }`) to avoid cross-user caching

---

## 3) Integration with Better Auth session management

Your repo already uses:

- Server session retrieval:

```ts
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'

const session = await auth.api.getSession({ headers: await headers() })
```

- Client session hook via:

```ts
import { createAuthClient } from 'better-auth/react'
export const { signIn, signUp, signOut, useSession } = createAuthClient()
```

Recommendations:

- Treat the server session check as the **security boundary** (redirect/guard in RSC).
- Use React Query for **application data** that depends on the session (goals, profile, etc.).
- Use `useSession` only for client-only UI (menus, buttons), not for primary route protection.

---

## 4) Proper hydration boundaries between Server and Client components

Hydrate only where needed:

- `page.tsx` (Server Component) does:
  - session check
  - prefetch
  - `<HydrationBoundary state={...}>`
- `Client Component` inside uses `useQuery`

### Example: authenticated page with prefetch

#### `src/app/(app)/goals/page.tsx` (Server Component)

```tsx
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import { getQueryClient } from '@/lib/react-query/query-client'
import { goalsQueryOptions } from '@/lib/react-query/queries/goals'
import { GoalsClient } from './GoalsClient'

export default async function GoalsPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) redirect('/login')

  const qc = getQueryClient()

  await qc.prefetchQuery(goalsQueryOptions({ userId: session.user.id }))

  return (
    <HydrationBoundary state={dehydrate(qc)}>
      <GoalsClient userId={session.user.id} />
    </HydrationBoundary>
  )
}
```

#### `src/app/(app)/goals/GoalsClient.tsx` (Client Component)

```tsx
'use client'

import { useQuery } from '@tanstack/react-query'
import { goalsQueryOptions } from '@/lib/react-query/queries/goals'

export function GoalsClient({ userId }: { userId: string }) {
  const { data, isPending, error } = useQuery(goalsQueryOptions({ userId }))

  if (isPending) return <div>Loading...</div>
  if (error) return <div>Failed to load goals</div>

  return (
    <div>
      {(data?.goals ?? []).map((g) => (
        <div key={g.id}>{g.title}</div>
      ))}
    </div>
  )
}
```

Why pass `userId`?

- It improves type-safety and makes user-scoped keys explicit.
- It prevents stale cached data from a previous user being reused if accounts switch.

---

## 5) Query invalidation strategies after mutations

Rules:

- Invalidate **lists** after create/delete.
- Invalidate **detail** + **list** after update.
- Prefer `setQueryData` for small optimistic updates.

Example mutation:

```ts
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { goalsKey } from '@/lib/react-query/query-keys'

type CreateGoalInput = { title: string; description?: string }

export function useCreateGoal(userId: string) {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async (input: CreateGoalInput) => {
      const res = await fetch('/api/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(input),
      })
      if (!res.ok) throw new Error('Failed to create goal')
      return (await res.json()) as { goal: unknown }
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: goalsKey.list(userId) })
    },
  })
}
```

---

## 6) Error handling and retry logic configuration

### Global retry policy (already in `makeQueryClient()`)

- No retries for `401/403`
- Max 2 retries for transient failures
- Exponential backoff with cap

### Prefer typed HTTP errors

```ts
export class HttpError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

export async function apiFetch<T>(input: RequestInfo, init?: RequestInit) {
  const res = await fetch(input, { ...init, credentials: 'include' })

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new HttpError(res.status, text || res.statusText)
  }

  return (await res.json()) as T
}
```

Then in `retry()` you can reliably read `error.status`.

---

## 7) TypeScript types for query keys and data

### Query key factory (type-safe)

#### `src/lib/react-query/query-keys.ts`

```ts
export const userKey = {
  all: ['user'] as const,
  me: (userId: string) => [...userKey.all, 'me', userId] as const,
}

export const goalsKey = {
  all: ['goals'] as const,
  list: (userId: string) => [...goalsKey.all, 'list', userId] as const,
  detail: (userId: string, goalId: string) =>
    [...goalsKey.all, 'detail', userId, goalId] as const,
}
```

Benefits:

- Stable keys
- Strong inference for `invalidateQueries({ queryKey: ... })`
- Explicit user scoping

### Strongly typed query options

Use `queryOptions()` so the return type stays consistent across server prefetch and client `useQuery`.

#### `src/lib/react-query/queries/goals.ts`

```ts
import { queryOptions } from '@tanstack/react-query'
import { goalsKey } from '../query-keys'
import { apiFetch } from '../api-fetch'

export type Goal = {
  id: string
  title: string
  description: string | null
  userId: string
}

export type GoalsResponse = {
  goals: Goal[]
}

export function goalsQueryOptions(input: { userId: string }) {
  return queryOptions({
    queryKey: goalsKey.list(input.userId),
    queryFn: () => apiFetch<GoalsResponse>('/api/goals'),
  })
}
```

Notes:

- Your current API returns `{ goals }` from `GET /api/goals`.
- If you later change that shape, you update `GoalsResponse` once.

---

## 8) Best practices for caching authenticated user data

### Cache “app user data”, not the session

- **Session**: check on the server (`auth.api.getSession(...)`) and redirect/guard routes.
- **User data** (profile/settings): fetch & cache with React Query.

### Always scope caches by user

User-scoped keys avoid a class of bugs where:

- User A logs out
- User B logs in in the same tab
- Cached queries from user A are reused

Two good approaches:

- Put `userId` into query keys (recommended)
- AND/OR clear query cache when auth user changes

### Sync Better Auth auth changes with React Query cache (client)

```tsx
'use client'

import { useEffect, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useSession } from '@/lib/auth-client'

export function AuthQueryCacheSync() {
  const qc = useQueryClient()
  const { data } = useSession()
  const userId = data?.user?.id ?? null

  const prev = useRef<string | null>(null)

  useEffect(() => {
    if (prev.current !== userId) {
      qc.clear()
      prev.current = userId
    }
  }, [qc, userId])

  return null
}
```

Render it once somewhere client-side (e.g. inside your `ReactQueryProvider`) if you want automatic cache clearing on user changes.

---

## Checklist

- `ReactQueryProvider` is a Client Component used inside `src/app/layout.tsx`.
- Authenticated routes do session checks in Server Components.
- Prefetch in Server Components with `prefetchQuery()` and hydrate only the needed subtree with `HydrationBoundary`.
- Query keys are centralized and user-scoped.
- Mutations invalidate via the key factory.
- Retry policy does not retry `401/403`.
