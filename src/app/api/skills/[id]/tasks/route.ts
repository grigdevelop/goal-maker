import { withSession } from '@/lib/utils/api/with-session';
import { getSkillById } from '@/lib/services/skill-service';
import { getSkillTasks, addTaskToSkill, createTaskForSkill } from '@/lib/services/skill-relation-service';

export const GET = withSession(async (_, session, ctx: RouteContext<'/api/skills/[id]'>) => {
    const skillId = parseInt((await ctx.params).id, 10);
    if (isNaN(skillId)) {
        return Response.json({ error: 'Invalid skill ID' }, { status: 400 });
    }

    const skill = await getSkillById({ id: skillId, userId: session.user.id });
    if (!skill) {
        return Response.json({ error: 'Skill not found' }, { status: 404 });
    }

    const tasks = await getSkillTasks(skillId);
    return Response.json(tasks);
});

export const POST = withSession(async (request, session, ctx: RouteContext<'/api/skills/[id]'>) => {
    const skillId = parseInt((await ctx.params).id, 10);
    if (isNaN(skillId)) {
        return Response.json({ error: 'Invalid skill ID' }, { status: 400 });
    }

    const skill = await getSkillById({ id: skillId, userId: session.user.id });
    if (!skill) {
        return Response.json({ error: 'Skill not found' }, { status: 404 });
    }

    const body = await request.json();

    try {
        if (body.taskId) {
            await addTaskToSkill(skillId, body.taskId);
            return Response.json({ success: true }, { status: 201 });
        }

        if (body.title) {
            const task = await createTaskForSkill(skillId, session.user.id, {
                title: body.title,
                description: body.description ?? null,
            });
            return Response.json(task, { status: 201 });
        }

        return Response.json({ error: 'Provide taskId or title' }, { status: 400 });
    } catch (error) {
        return Response.json({ error: 'Failed to add task to skill' }, { status: 500 });
    }
});
