import { withSession } from '@/lib/utils/api/with-session';
import { getTaskById } from '@/lib/services/task-service';
import { getHistory } from '@/lib/services/task-history-service';

export const GET = withSession(async (request, session, ctx: { params: Promise<{ id: string }> }) => {
    const params = await ctx.params;
    const taskId = parseInt(params.id, 10);

    if (isNaN(taskId)) {
        return Response.json({ error: 'Invalid task ID' }, { status: 400 });
    }

    const task = await getTaskById({ id: taskId, userId: session.user.id });
    if (!task) {
        return Response.json({ error: 'Task not found' }, { status: 404 });
    }

    const url = new URL(request.url);
    const limitParam = url.searchParams.get('limit');
    const limit = limitParam ? parseInt(limitParam, 10) : undefined;

    const history = await getHistory({ taskId, limit });

    return Response.json(history);
});
