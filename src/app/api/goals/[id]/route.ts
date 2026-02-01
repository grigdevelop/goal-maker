import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import prisma from '@/lib/prisma';
import type { NextRequest } from 'next/server';


export async function PUT(
    request: NextRequest,
    ctx: RouteContext<'/api/goals/[id]'>
) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session) {
        return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { title, description } = body;

    // TODO: Validation and parsing duplicate logic
    const goalId = parseInt((await ctx.params).id, 10);

    if (isNaN(goalId)) {
        return Response.json({ error: 'Invalid goal ID' }, { status: 400 });
    }

    const goal = await prisma.goal.updateMany({
        where: {
            id: goalId,
            userId: session.user.id,
        },
        data: {
            title,
            description,
        },
    });

    if (goal.count === 0) {
        return Response.json({ error: 'Goal not found' }, { status: 404 });
    }

    return Response.json({ goal });
}

export async function DELETE(
    _: NextRequest,
    ctx: RouteContext<'/api/goals/[id]'>
) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session) {
        return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const goalId = parseInt((await ctx.params).id, 10);

    if (isNaN(goalId)) {
        return Response.json({ error: 'Invalid goal ID' }, { status: 400 });
    }

    const goal = await prisma.goal.deleteMany({
        where: {
            id: goalId,
            userId: session.user.id,
        },
    });

    if (goal.count === 0) {
        return Response.json({ error: 'Goal not found' }, { status: 404 });
    }

    return Response.json({ success: true }, { status: 200 });
}
