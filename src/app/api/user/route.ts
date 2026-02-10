import { withSession } from '@/lib/utils/api/with-session';

export const GET = withSession(async (_, session) => {
    return Response.json(session.user);
});
