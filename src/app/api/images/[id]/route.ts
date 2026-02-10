import { deleteImage } from '@/lib/services/image-service';
import { withSession } from '@/lib/utils/api/with-session';

export const DELETE = withSession(async (_, session, ctx: RouteContext<'/api/images/[id]'>) => {
    const imageId = (await ctx.params).id;

    const deleted = await deleteImage(imageId);

    if (!deleted) {
        return Response.json({ error: 'Image not found' }, { status: 404 });
    }

    return Response.json({ success: true });
});
