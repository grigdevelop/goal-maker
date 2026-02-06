import { getGoalsWithProgress } from "@/lib/services/progress-service"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { HydrationBoundary, QueryClient, dehydrate } from "@tanstack/react-query"
import { Goals } from "@/components/goals"

export default async function GoalsPageRoot() {
    const session = await auth.api.getSession({
        headers: await headers()
    })

    const queryClient = new QueryClient()

    await queryClient.prefetchQuery({
        queryKey: ['goals'],
        queryFn: () => getGoalsWithProgress(session?.user.id ?? '')
    })

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <Goals />
        </HydrationBoundary>
    )
}