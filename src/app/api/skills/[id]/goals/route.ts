import { withSession } from '@/lib/utils/api/with-session';
import { getSkillById } from '@/lib/services/skill-service';
import { getSkillGoals } from '@/lib/services/skill-relation-service';

export const GET = withSession(async (_, session, ctx: RouteContext<'/api/skills/[id]'>) => {
    const skillId = parseInt((await ctx.params).id, 10);
    if (isNaN(skillId)) {
        return Response.json({ error: 'Invalid skill ID' }, { status: 400 });
    }

    const skill = await getSkillById({ id: skillId, userId: session.user.id });
    if (!skill) {
        return Response.json({ error: 'Skill not found' }, { status: 404 });
    }

    const goals = await getSkillGoals(skillId);
    return Response.json(goals);
});
