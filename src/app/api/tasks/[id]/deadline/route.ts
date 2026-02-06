import { withSession } from '@/lib/utils/api/with-session';
import { getTaskById } from '@/lib/services/task-service';
import { updateDeadline } from '@/lib/services/task-history-service';

export const PATCH = withSession(async (request, session, ctx: { params: Promise<{ id: string }> }) => {
    const params = await ctx.params;
    const taskId = parseInt(params.id, 10);

    if (isNaN(taskId)) {
        return Response.json({ error: 'Invalid task ID' }, { status: 400 });
    }

    const task = await getTaskById({ id: taskId, userId: session.user.id });
    if (!task) {
        return Response.json({ error: 'Task not found' }, { status: 404 });
    }

    const body = await request.json();
    const endTime = body.endTime ? new Date(body.endTime) : null;

    try {
        const history = await updateDeadline({
            taskId,
            endTime,
            userId: session.user.id,
        });

        return Response.json(history);
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to update deadline';
        return Response.json({ error: message }, { status: 400 });
    }
});
