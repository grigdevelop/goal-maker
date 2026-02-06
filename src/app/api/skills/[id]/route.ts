import { withSession } from '@/lib/utils/api/with-session';
import { getSkillById, updateSkill, deleteSkill } from '@/lib/services/skill-service';
import { getSkillWithProgress } from '@/lib/services/progress-service';

export const PUT = withSession(async (request, session, ctx: RouteContext<'/api/skills/[id]'>) => {
    const body = await request.json();
    const { title, description } = body;

    const skillId = parseInt((await ctx.params).id, 10);

    if (isNaN(skillId)) {
        return Response.json({ error: 'Invalid skill ID' }, { status: 400 });
    }

    const skill = await getSkillById({ id: skillId });
    if (!skill) {
        return Response.json({ error: 'Skill not found' }, { status: 404 });
    }

    // check if user is the owner of the skill
    if (skill.userId !== session.user.id) {
        return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const skill = await updateSkill(skillId, {
            title,
            description,
        });

        return Response.json(skill);
    } catch (error) {
        return Response.json({ error: 'Skill not found' }, { status: 404 });
    }
});

export const DELETE = withSession(async (_, session, ctx: RouteContext<'/api/skills/[id]'>) => {
    const skillId = parseInt((await ctx.params).id, 10);

    if (isNaN(skillId)) {
        return Response.json({ error: 'Invalid skill ID' }, { status: 400 });
    }

    const skill = await getSkillById({ id: skillId });
    if (!skill) {
        return Response.json({ error: 'Skill not found' }, { status: 404 });
    }

    // check if user is the owner of the skill
    if (skill.userId !== session.user.id) {
        return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        await deleteSkill({ id: skillId });
        return Response.json({ success: true }, { status: 200 });
    } catch (error) {
        return Response.json({ error: 'Skill not found' }, { status: 404 });
    }
});

export const GET = withSession(async (_, session, ctx: RouteContext<'/api/skills/[id]'>) => {
    const skillId = parseInt((await ctx.params).id, 10);

    if (isNaN(skillId)) {
        return Response.json({ error: 'Invalid skill ID' }, { status: 400 });
    }

    const skill = await getSkillWithProgress(skillId);
    if (!skill || skill.userId !== session.user.id) {
        return Response.json({ error: 'Skill not found' }, { status: 404 });
    }

    return Response.json(skill);
});
