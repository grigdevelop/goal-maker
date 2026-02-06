import { withSession } from '@/lib/utils/api/with-session';
import { getTaskById } from '@/lib/services/task-service';
import { upsertSchedule, deleteSchedule } from '@/lib/services/schedule-evaluator-service';

export const PUT = withSession(async (request, session, ctx: { params: Promise<{ id: string }> }) => {
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
    const { scheduleType, config } = body;

    if (!scheduleType || !config) {
        return Response.json(
            { error: 'scheduleType and config are required' },
            { status: 400 }
        );
    }

    try {
        const schedule = await upsertSchedule({ taskId, scheduleType, config });
        return Response.json(schedule);
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to update schedule';
        return Response.json({ error: message }, { status: 400 });
    }
});

export const DELETE = withSession(async (_, session, ctx: { params: Promise<{ id: string }> }) => {
    const params = await ctx.params;
    const taskId = parseInt(params.id, 10);

    if (isNaN(taskId)) {
        return Response.json({ error: 'Invalid task ID' }, { status: 400 });
    }

    const task = await getTaskById({ id: taskId, userId: session.user.id });
    if (!task) {
        return Response.json({ error: 'Task not found' }, { status: 404 });
    }

    try {
        await deleteSchedule(taskId);
        return Response.json({ success: true });
    } catch (error) {
        return Response.json({ error: 'Schedule not found' }, { status: 404 });
    }
});
