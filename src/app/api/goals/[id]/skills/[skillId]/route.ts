import { withSession } from '@/lib/utils/api/with-session';
import { getGoalById } from '@/lib/services/goal-service';
import { removeSkillFromGoal } from '@/lib/services/goal-relation-service';

export const DELETE = withSession(async (_, session, ctx: { params: Promise<{ id: string; skillId: string }> }) => {
    const params = await ctx.params;
    const goalId = parseInt(params.id, 10);
    const skillId = parseInt(params.skillId, 10);

    if (isNaN(goalId) || isNaN(skillId)) {
        return Response.json({ error: 'Invalid IDs' }, { status: 400 });
    }

    const goal = await getGoalById({ id: goalId, userId: session.user.id });
    if (!goal) {
        return Response.json({ error: 'Goal not found' }, { status: 404 });
    }

    try {
        await removeSkillFromGoal(goalId, skillId);
        return Response.json({ success: true });
    } catch (error) {
        return Response.json({ error: 'Relation not found' }, { status: 404 });
    }
});
