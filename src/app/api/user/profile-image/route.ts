import { uploadImage, deleteImage, ImageValidationError } from '@/lib/services/image-service';
import { withSession } from '@/lib/utils/api/with-session';
import prisma from '@/lib/prisma';

export const POST = withSession(async (request, session) => {
    try {
        const formData = await request.formData();
        const file = formData.get('file');

        if (!file || !(file instanceof File)) {
            return Response.json({ error: 'No file provided' }, { status: 400 });
        }

        // Delete old image if exists
        const currentUser = await prisma.user.findUnique({
            where: { id: session.user.id },
        });

        if (currentUser?.image) {
            const oldImageId = extractImageId(currentUser.image);
            if (oldImageId) {
                await deleteImage(oldImageId);
            }
        }

        // Upload new image
        const result = await uploadImage(file);

        // Update user record
        const updatedUser = await prisma.user.update({
            where: { id: session.user.id },
            data: { image: result.url },
        });

        return Response.json(updatedUser, { status: 200 });
    } catch (error) {
        if (error instanceof ImageValidationError) {
            return Response.json({ error: error.message }, { status: 400 });
        }
        return Response.json({ error: 'Failed to upload profile image' }, { status: 500 });
    }
});

export const DELETE = withSession(async (_, session) => {
    const currentUser = await prisma.user.findUnique({
        where: { id: session.user.id },
    });

    if (!currentUser?.image) {
        return Response.json({ error: 'No profile image to remove' }, { status: 404 });
    }

    const imageId = extractImageId(currentUser.image);
    if (imageId) {
        await deleteImage(imageId);
    }

    const updatedUser = await prisma.user.update({
        where: { id: session.user.id },
        data: { image: null },
    });

    return Response.json(updatedUser, { status: 200 });
});

function extractImageId(imageUrl: string): string | null {
    // URL format: /api/images/:id/:filename
    const match = imageUrl.match(/\/api\/images\/([^/]+)\//);
    return match ? match[1] : null;
}
