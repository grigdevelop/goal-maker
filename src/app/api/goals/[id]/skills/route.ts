import { withSession } from '@/lib/utils/api/with-session';
import { getGoalById } from '@/lib/services/goal-service';
import { getGoalSkills, addSkillToGoal, createSkillForGoal } from '@/lib/services/goal-relation-service';

export const GET = withSession(async (_, session, ctx: RouteContext<'/api/goals/[id]'>) => {
    const goalId = parseInt((await ctx.params).id, 10);
    if (isNaN(goalId)) {
        return Response.json({ error: 'Invalid goal ID' }, { status: 400 });
    }

    const goal = await getGoalById({ id: goalId, userId: session.user.id });
    if (!goal) {
        return Response.json({ error: 'Goal not found' }, { status: 404 });
    }

    const skills = await getGoalSkills(goalId);
    return Response.json(skills);
});

export const POST = withSession(async (request, session, ctx: RouteContext<'/api/goals/[id]'>) => {
    const goalId = parseInt((await ctx.params).id, 10);
    if (isNaN(goalId)) {
        return Response.json({ error: 'Invalid goal ID' }, { status: 400 });
    }

    const goal = await getGoalById({ id: goalId, userId: session.user.id });
    if (!goal) {
        return Response.json({ error: 'Goal not found' }, { status: 404 });
    }

    const body = await request.json();

    try {
        if (body.skillId) {
            await addSkillToGoal(goalId, body.skillId);
            return Response.json({ success: true }, { status: 201 });
        }

        if (body.title) {
            const skill = await createSkillForGoal(goalId, session.user.id, {
                title: body.title,
                description: body.description ?? null,
            });
            return Response.json(skill, { status: 201 });
        }

        return Response.json({ error: 'Provide skillId or title' }, { status: 400 });
    } catch (error) {
        return Response.json({ error: 'Failed to add skill to goal' }, { status: 500 });
    }
});
