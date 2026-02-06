import { getSkillsWithProgress } from "@/lib/services/progress-service"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { HydrationBoundary, QueryClient, dehydrate } from "@tanstack/react-query"
import { Skills } from "@/components/skills"

export default async function SkillsPageRoot() {
    const session = await auth.api.getSession({
        headers: await headers()
    })

    const queryClient = new QueryClient()

    await queryClient.prefetchQuery({
        queryKey: ['skills'],
        queryFn: () => getSkillsWithProgress(session?.user.id ?? '')
    })

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <Skills />
        </HydrationBoundary>
    )
}