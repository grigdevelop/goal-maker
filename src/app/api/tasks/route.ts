import { createTask } from '@/lib/services/task-service';
import { getTasksWithCurrentState } from '@/lib/services/task-history-service';
import { withSession } from '@/lib/utils/api/with-session';

export const GET = withSession(async (_, session) => {
    const tasks = await getTasksWithCurrentState(session.user.id);
    return Response.json(tasks);
});

export const POST = withSession(async (request, session) => {
    const body = await request.json();
    const { title, description, type, endTime, targetCount } = body;

    const task = await createTask({
        userId: session.user.id,
        title,
        description,
        type,
        endTime: endTime ? new Date(endTime) : undefined,
        targetCount: targetCount != null ? Number(targetCount) : null,
    });

    return Response.json(task, { status: 201 });
});
