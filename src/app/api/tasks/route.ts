import { getTasks, createTask } from '@/lib/services/task-service';
import { withSession } from '@/lib/utils/api/with-session';

export const GET = withSession(async (_, session) => {
    const tasks = await getTasks({
        userId: session.user.id,
    });

    return Response.json(tasks);
});

export const POST = withSession(async (request, session) => {
    const body = await request.json();
    const { title, description } = body;

    const task = await createTask({
        userId: session.user.id,
        title,
        description,
    });

    return Response.json(task, { status: 201 });
});
