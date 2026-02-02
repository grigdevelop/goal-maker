import { withSession } from '@/lib/utils/api/with-session';
import { createGoal } from '@/lib/services/goal-service';
import prisma from '@/lib/prisma';

const SAMPLE_GOALS = [
    { title: 'Learn a new language', description: 'Become conversational in Spanish within 6 months' },
    { title: 'Get fit', description: 'Exercise 3 times a week and lose 10 pounds' },
    { title: 'Read more books', description: 'Read at least 2 books per month' },
    { title: 'Save money', description: 'Save $5000 for emergency fund' },
    { title: 'Learn to code', description: 'Complete a full-stack web development course' },
    { title: 'Start a side business', description: 'Launch an online store or freelance service' },
    { title: 'Travel more', description: 'Visit 3 new countries this year' },
    { title: 'Improve sleep', description: 'Get 8 hours of sleep every night' },
];

export const GET = withSession(async (_, session) => {
    // remove all goals
    await prisma.goal.deleteMany({
        where: {
            userId: session.user.id,
        },
    });

    // create new goals
    for (const goal of SAMPLE_GOALS) {
        await createGoal({
            userId: session.user.id,
            title: goal.title,
            description: goal.description,
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
