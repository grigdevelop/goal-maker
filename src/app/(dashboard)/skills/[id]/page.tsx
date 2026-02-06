import { getSkillWithProgress } from "@/lib/services/progress-service"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { HydrationBoundary, QueryClient, dehydrate } from "@tanstack/react-query"
import { Skill } from "@/components/skills"
import { notFound } from "next/navigation"

export default async function SkillPageRoot(props: PageProps<'/skills/[id]'>) {
    const session = await auth.api.getSession({
        headers: await headers()
    })

    const id = (await props.params).id
    if (!id) {
        notFound()
    }
    const skillId = Number(id)

    if (isNaN(skillId)) {
        notFound()
    }

    const queryClient = new QueryClient()

    const skill = await queryClient.fetchQuery({
        queryKey: ['skill', skillId],
        queryFn: () => getSkillWithProgress(skillId)
    })

    if (!skill) {
        notFound()
    }

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <Skill skillId={skillId} />
        </HydrationBoundary>
    )
}
