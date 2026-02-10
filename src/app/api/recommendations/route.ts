import { withSession } from '@/lib/utils/api/with-session';
import { getRecommendations } from '@/lib/services/recommendation-service';

export const GET = withSession(async (_, session) => {
    const recommendations = await getRecommendations(session.user.id);
    return Response.json(recommendations);
});
