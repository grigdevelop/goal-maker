import { withSession } from '@/lib/utils/api/with-session';
import { getSkillById } from '@/lib/services/skill-service';
import { removeTaskFromSkill } from '@/lib/services/skill-relation-service';

export const DELETE = withSession(async (_, session, ctx: { params: Promise<{ id: string; taskId: string }> }) => {
    const params = await ctx.params;
    const skillId = parseInt(params.id, 10);
    const taskId = parseInt(params.taskId, 10);

    if (isNaN(skillId) || isNaN(taskId)) {
        return Response.json({ error: 'Invalid IDs' }, { status: 400 });
    }

    const skill = await getSkillById({ id: skillId, userId: session.user.id });
    if (!skill) {
        return Response.json({ error: 'Skill not found' }, { status: 404 });
    }

    try {
        await removeTaskFromSkill(skillId, taskId);
        return Response.json({ success: true });
    } catch (error) {
        return Response.json({ error: 'Relation not found' }, { status: 404 });
    }
});
