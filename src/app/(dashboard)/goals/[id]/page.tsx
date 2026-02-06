import { getGoalById } from "@/lib/services/goal-service"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { HydrationBoundary, QueryClient, dehydrate } from "@tanstack/react-query"
import { Goal } from "@/components/goals"
import { redirect } from "next/navigation"

export default async function GoalPageRoot(props: PageProps<'/goals/[id]'>) {
    const session = await auth.api.getSession({
        headers: await headers()
    })

    const id = (await props.params).id
    if (!id) {
        // TODO: create not found page and redirect to it 
        return redirect('/goals')
    }
    const goalId = Number(id)

    const queryClient = new QueryClient()

    await queryClient.prefetchQuery({
        queryKey: ['goal', goalId],
        queryFn: () => getGoalById({ id: goalId, userId: session?.user.id })
    })

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <Goal goalId={goalId} />
        </HydrationBoundary>
    )
}