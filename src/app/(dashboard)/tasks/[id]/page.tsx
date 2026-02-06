import { getTaskWithCurrentState } from "@/lib/services/task-history-service"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { HydrationBoundary, QueryClient, dehydrate } from "@tanstack/react-query"
import { Task } from "@/components/tasks"
import { notFound } from "next/navigation"

export default async function TaskPageRoot(props: PageProps<'/tasks/[id]'>) {
    const session = await auth.api.getSession({
        headers: await headers()
    })

    const id = (await props.params).id
    if (!id) {
        notFound()
    }
    const taskId = Number(id)

    if (isNaN(taskId)) {
        notFound()
    }

    const queryClient = new QueryClient()

    const task = await queryClient.fetchQuery({
        queryKey: ['task', taskId],
        queryFn: () => getTaskWithCurrentState(taskId)
    })

    if (!task || task.userId !== session?.user.id) {
        notFound()
    }

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <Task taskId={taskId} />
        </HydrationBoundary>
    )
}
