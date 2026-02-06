import { withSession } from '@/lib/utils/api/with-session';
import { getTaskById } from '@/lib/services/task-service';
import { changeStatus } from '@/lib/services/task-history-service';
import { TaskStatus } from '@/lib/constants/task';
import type { TaskStatus as TaskStatusType } from '@/lib/constants/task';

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
    const { status } = body;

    const validStatuses = Object.values(TaskStatus);
    if (!status || !validStatuses.includes(status)) {
        return Response.json(
            { error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` },
            { status: 400 }
        );
    }

    try {
        const history = await changeStatus({
            taskId,
            newStatus: status as TaskStatusType,
            userId: session.user.id,
        });

        return Response.json(history);
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to update status';
        return Response.json({ error: message }, { status: 400 });
    }
});
