import { withSession } from '@/lib/utils/api/with-session';
import { createGoal } from '@/lib/services/goal-service';
import prisma from '@/lib/prisma';
import { faker } from '@faker-js/faker';

export const GET = withSession(async (_, session) => {
    // remove all goals
    await prisma.goal.deleteMany({
        where: {
            userId: session.user.id,
        },
    });

    // create new goals
    const numberOfGoals = 50;
    for (let i = 0; i < numberOfGoals; i++) {
        await createGoal({
            userId: session.user.id,
            title: faker.lorem.sentence({ min: 3, max: 6 }),
            description: faker.lorem.paragraph(),
        });
    }

    // get all goals
    const goals = await prisma.goal.findMany({
        where: {
            userId: session.user.id,
        },
    });

    return Response.json(goals, { status: 200 });
});
