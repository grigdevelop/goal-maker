import { withSession } from '@/lib/utils/api/with-session';
import { getTaskById, updateTask, deleteTask } from '@/lib/services/task-service';
import { getTaskWithCurrentState } from '@/lib/services/task-history-service';

export const PUT = withSession(async (request, session, ctx: RouteContext<'/api/tasks/[id]'>) => {
    const body = await request.json();
    const { title, description, type } = body;

    const taskId = parseInt((await ctx.params).id, 10);

    if (isNaN(taskId)) {
        return Response.json({ error: 'Invalid task ID' }, { status: 400 });
    }

    const task = await getTaskById({ id: taskId });
    if (!task) {
        return Response.json({ error: 'Task not found' }, { status: 404 });
    }

    // check if user is the owner of the task
    if (task.userId !== session.user.id) {
        return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const updated = await updateTask(taskId, {
            title,
            description,
            type,
        }, session.user.id);

        return Response.json(updated);
    } catch (error) {
        return Response.json({ error: 'Task not found' }, { status: 404 });
    }
});

export const DELETE = withSession(async (_, session, ctx: RouteContext<'/api/tasks/[id]'>) => {
    const taskId = parseInt((await ctx.params).id, 10);

    if (isNaN(taskId)) {
        return Response.json({ error: 'Invalid task ID' }, { status: 400 });
    }

    const task = await getTaskById({ id: taskId });
    if (!task) {
        return Response.json({ error: 'Task not found' }, { status: 404 });
    }

    // check if user is the owner of the task
    if (task.userId !== session.user.id) {
        return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        await deleteTask({ id: taskId });
        return Response.json({ success: true }, { status: 200 });
    } catch (error) {
        return Response.json({ error: 'Task not found' }, { status: 404 });
    }
});

export const GET = withSession(async (_, session, ctx: RouteContext<'/api/tasks/[id]'>) => {
    const taskId = parseInt((await ctx.params).id, 10);

    if (isNaN(taskId)) {
        return Response.json({ error: 'Invalid task ID' }, { status: 400 });
    }

    const task = await getTaskWithCurrentState(taskId);
    if (!task || task.userId !== session.user.id) {
        return Response.json({ error: 'Task not found' }, { status: 404 });
    }

    return Response.json(task);
});
