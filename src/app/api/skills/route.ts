import { getSkills, createSkill } from '@/lib/services/skill-service';
import { withSession } from '@/lib/utils/api/with-session';

export const GET = withSession(async (_, session) => {
    const skills = await getSkills({
        userId: session.user.id,
    });

    return Response.json(skills);
});

export const POST = withSession(async (request, session) => {
    const body = await request.json();
    const { title, description } = body;

    const skill = await createSkill({
        userId: session.user.id,
        title,
        description,
    });

    return Response.json(skill, { status: 201 });
});
