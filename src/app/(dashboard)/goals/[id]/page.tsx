import { getGoalById } from "@/lib/services/goal-service"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { HydrationBoundary, QueryClient, dehydrate } from "@tanstack/react-query"
import { Goal } from "@/components/goals"
import { notFound } from "next/navigation"

export default async function GoalPageRoot(props: PageProps<'/goals/[id]'>) {
    const session = await auth.api.getSession({
        headers: await headers()
    })

    const id = (await props.params).id
    if (!id) {
        notFound()
    }
    const goalId = Number(id)

    if (isNaN(goalId)) {
        notFound()
    }

    const queryClient = new QueryClient()

    const goal = await queryClient.fetchQuery({
        queryKey: ['goal', goalId],
        queryFn: () => getGoalById({ id: goalId, userId: session?.user.id })
    })

    if (!goal) {
        notFound()
    }

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <Goal goalId={goalId} />
        </HydrationBoundary>
    )
}