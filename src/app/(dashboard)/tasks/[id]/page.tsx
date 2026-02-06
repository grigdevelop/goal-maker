import { getTaskById } from "@/lib/services/task-service"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { HydrationBoundary, QueryClient, dehydrate } from "@tanstack/react-query"
import { Task } from "@/components/tasks"
import { redirect } from "next/navigation"

export default async function TaskPageRoot(props: PageProps<'/tasks/[id]'>) {
    const session = await auth.api.getSession({
        headers: await headers()
    })

    const id = (await props.params).id
    if (!id) {
        // TODO: create not found page and redirect to it 
        return redirect('/tasks')
    }
    const taskId = Number(id)

    const queryClient = new QueryClient()

    await queryClient.prefetchQuery({
        queryKey: ['task', taskId],
        queryFn: () => getTaskById({ id: taskId, userId: session?.user.id })
    })

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <Task taskId={taskId} />
        </HydrationBoundary>
    )
}
