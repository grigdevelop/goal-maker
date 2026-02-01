import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import prisma from '@/lib/prisma';

export async function GET() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session) {
        return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const goals = await prisma.goal.findMany({
        where: {
          userId: session.user.id,
        },
      });

    return Response.json({ goals });
}

export async function POST(request: Request) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session) {
        return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { title, description } = body;

    const goal = await prisma.goal.create({
        data: {
            title,
            description,
            userId: session.user.id,
        },
    });

    return Response.json({ goal }, { status: 201 });
}
