import { getTasks } from "@/lib/services/task-service"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { HydrationBoundary, QueryClient, dehydrate } from "@tanstack/react-query"
import { Tasks } from "@/components/tasks"

export default async function TasksPageRoot() {
    const session = await auth.api.getSession({
        headers: await headers()
    })

    const queryClient = new QueryClient()

    await queryClient.prefetchQuery({
        queryKey: ['tasks'],
        queryFn: () => getTasks({ userId: session?.user.id })
    })

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <Tasks />
        </HydrationBoundary>
    )
}
