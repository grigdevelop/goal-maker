import { createGoal } from '@/lib/services/goal-service';
import { getGoalsWithProgress } from '@/lib/services/progress-service';
import { withSession } from '@/lib/utils/api/with-session';

export const GET = withSession(async (_, session) => {
    const goals = await getGoalsWithProgress(session.user.id);
    return Response.json(goals);
});

export const POST = withSession(async (request, session) => {
    const body = await request.json();
    const { title, description } = body;

    const goal = await createGoal({
        userId: session.user.id,
        title,
        description,
    });

    return Response.json(goal, { status: 201 });
});
