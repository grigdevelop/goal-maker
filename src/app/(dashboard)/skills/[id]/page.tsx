import { getSkillById } from "@/lib/services/skill-service"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { HydrationBoundary, QueryClient, dehydrate } from "@tanstack/react-query"
import { Skill } from "@/components/skills"
import { redirect } from "next/navigation"

export default async function SkillPageRoot(props: PageProps<'/skills/[id]'>) {
    const session = await auth.api.getSession({
        headers: await headers()
    })

    const id = (await props.params).id
    if (!id) {
        // TODO: create not found page and redirect to it 
        return redirect('/skills')
    }
    const skillId = Number(id)

    const queryClient = new QueryClient()

    await queryClient.prefetchQuery({
        queryKey: ['skill', skillId],
        queryFn: () => getSkillById({ id: skillId, userId: session?.user.id })
    })

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <Skill skillId={skillId} />
        </HydrationBoundary>
    )
}
