import { withSession } from '@/lib/utils/api/with-session';
import { getTaskById } from '@/lib/services/task-service';
import { addProgress, getProgressHistory } from '@/lib/services/task-history-service';

export const POST = withSession(async (request, session, ctx: RouteContext<'/api/tasks/[id]/progress'>) => {
    const taskId = parseInt((await ctx.params).id, 10);

    if (isNaN(taskId)) {
        return Response.json({ error: 'Invalid task ID' }, { status: 400 });
    }

    const task = await getTaskById({ id: taskId });
    if (!task || task.userId !== session.user.id) {
        return Response.json({ error: 'Task not found' }, { status: 404 });
    }

    const body = await request.json();
    const { increment, note } = body;

    if (!increment || typeof increment !== 'number' || increment <= 0 || !Number.isInteger(increment)) {
        return Response.json({ error: 'Increment must be a positive integer' }, { status: 400 });
    }

    try {
        const result = await addProgress({
            taskId,
            increment,
            note: note ?? null,
            userId: session.user.id,
        });
        return Response.json(result);
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to add progress';
        return Response.json({ error: message }, { status: 400 });
    }
});

export const GET = withSession(async (request, session, ctx: RouteContext<'/api/tasks/[id]/progress'>) => {
    const taskId = parseInt((await ctx.params).id, 10);

    if (isNaN(taskId)) {
        return Response.json({ error: 'Invalid task ID' }, { status: 400 });
    }

    const task = await getTaskById({ id: taskId });
    if (!task || task.userId !== session.user.id) {
        return Response.json({ error: 'Task not found' }, { status: 404 });
    }

    const url = new URL(request.url);
    const limit = url.searchParams.get('limit');

    const history = await getProgressHistory({
        taskId,
        limit: limit ? parseInt(limit, 10) : undefined,
    });

    return Response.json(history);
});
