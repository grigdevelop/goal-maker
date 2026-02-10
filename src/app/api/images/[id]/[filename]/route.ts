import { getImage, ImageValidationError } from '@/lib/services/image-service';
import { NextRequest } from 'next/server';

export async function GET(
    request: NextRequest,
    ctx: RouteContext<'/api/images/[id]/[filename]'>
) {
    const { id } = await ctx.params;
    const searchParams = request.nextUrl.searchParams;

    const widthParam = searchParams.get('width');
    const heightParam = searchParams.get('height');

    const width = widthParam ? parseInt(widthParam, 10) : undefined;
    const height = heightParam ? parseInt(heightParam, 10) : undefined;

    if ((widthParam && isNaN(width!)) || (heightParam && isNaN(height!))) {
        return Response.json({ error: 'Invalid width or height parameter' }, { status: 400 });
    }

    try {
        const result = await getImage(id, width, height);

        if (!result) {
            return Response.json({ error: 'Image not found' }, { status: 404 });
        }

        return new Response(new Uint8Array(result.data), {
            headers: {
                'Content-Type': result.mimetype,
                'Cache-Control': 'public, max-age=31536000, immutable',
            },
        });
    } catch (error) {
        if (error instanceof ImageValidationError) {
            return Response.json({ error: error.message }, { status: 400 });
        }
        return Response.json({ error: 'Failed to retrieve image' }, { status: 500 });
    }
}
