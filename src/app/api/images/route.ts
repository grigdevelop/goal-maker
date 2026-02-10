import { uploadImage, ImageValidationError } from '@/lib/services/image-service';
import { withSession } from '@/lib/utils/api/with-session';

export const POST = withSession(async (request, session) => {
    try {
        const formData = await request.formData();
        const file = formData.get('file');

        if (!file || !(file instanceof File)) {
            return Response.json({ error: 'No file provided' }, { status: 400 });
        }

        const result = await uploadImage(file);
        return Response.json(result, { status: 201 });
    } catch (error) {
        if (error instanceof ImageValidationError) {
            return Response.json({ error: error.message }, { status: 400 });
        }
        return Response.json({ error: 'Failed to upload image' }, { status: 500 });
    }
});
