import { withSession } from '@/lib/utils/api/with-session';
import { evaluateAll } from '@/lib/services/schedule-evaluator-service';

export const POST = withSession(async () => {
    const result = await evaluateAll();
    return Response.json(result);
});
