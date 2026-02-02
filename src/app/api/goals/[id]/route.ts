import { withSession } from '@/lib/utils/api/with-session';
import { getGoalById, updateGoal, deleteGoal } from '@/lib/services/goal-service';

export const PUT = withSession(async (request, session, ctx: RouteContext<'/api/goals/[id]'>) => {
    const body = await request.json();
    const { title, description } = body;

    const goalId = parseInt((await ctx.params).id, 10);

    if (isNaN(goalId)) {
        return Response.json({ error: 'Invalid goal ID' }, { status: 400 });
    }

    const goal = await getGoalById({ id: goalId });
    if (!goal) {
        return Response.json({ error: 'Goal not found' }, { status: 404 });
    }

    // check if user is the owner of the goal
    if (goal.userId !== session.user.id) {
        return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const goal = await updateGoal(goalId, {
            title,
            description,
        });

        return Response.json(goal);
    } catch (error) {
        return Response.json({ error: 'Goal not found' }, { status: 404 });
    }
});

export const DELETE = withSession(async (_, session, ctx: RouteContext<'/api/goals/[id]'>) => {
    const goalId = parseInt((await ctx.params).id, 10);

    if (isNaN(goalId)) {
        return Response.json({ error: 'Invalid goal ID' }, { status: 400 });
    }

    const goal = await getGoalById({ id: goalId });
    if (!goal) {
        return Response.json({ error: 'Goal not found' }, { status: 404 });
    }

    // check if user is the owner of the goal
    if (goal.userId !== session.user.id) {
        return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        await deleteGoal({ id: goalId });
        return Response.json({ success: true }, { status: 200 });
    } catch (error) {
        return Response.json({ error: 'Goal not found' }, { status: 404 });
    }
});
