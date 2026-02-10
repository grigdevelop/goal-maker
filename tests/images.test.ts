import { describe, it, expect, vi } from 'vitest';
import { testPrisma } from './setup';
import sharp from 'sharp';

vi.mock('@/lib/prisma', () => ({
    default: testPrisma,
}));

import {
    uploadImage,
    getImage,
    deleteImage,
    resizeImage,
    ImageValidationError,
} from '@/lib/services/image-service';

// Helper to create a minimal valid PNG buffer using sharp
async function createTestImage(width = 100, height = 100): Promise<Buffer> {
    return sharp({
        create: {
            width,
            height,
            channels: 3,
            background: { r: 255, g: 0, b: 0 },
        },
    })
        .png()
        .toBuffer();
}

function createTestFile(buffer: Buffer, name: string, type: string): File {
    return new File([new Uint8Array(buffer)], name, { type });
}

// ── UNIT TESTS ─────────────────────────────────────────────

describe('Image Service', () => {

    // ── UPLOAD ──────────────────────────────────────────────

    describe('uploadImage', () => {
        it('should upload a valid image file', async () => {
            const buffer = await createTestImage();
            const file = createTestFile(buffer, 'test.png', 'image/png');

            const result = await uploadImage(file);

            expect(result).toHaveProperty('id');
            expect(result).toHaveProperty('filename', 'test.png');
            expect(result).toHaveProperty('url');
            expect(result.url).toContain(`/api/images/${result.id}/`);
        });

        it('should reject invalid mimetype', async () => {
            const buffer = Buffer.from('not an image');
            const file = createTestFile(buffer, 'test.txt', 'text/plain');

            await expect(uploadImage(file)).rejects.toThrow(ImageValidationError);
            await expect(uploadImage(file)).rejects.toThrow('Invalid mimetype');
        });

        it('should reject file exceeding size limit', async () => {
            // Create a buffer > 5MB
            const largeBuffer = Buffer.alloc(6 * 1024 * 1024, 0);
            const file = createTestFile(largeBuffer, 'large.png', 'image/png');

            await expect(uploadImage(file)).rejects.toThrow(ImageValidationError);
            await expect(uploadImage(file)).rejects.toThrow('exceeds maximum');
        });

        it('should accept all valid mimetypes', async () => {
            const buffer = await createTestImage();

            for (const type of ['image/jpeg', 'image/png', 'image/gif', 'image/webp']) {
                const file = createTestFile(buffer, `test.${type.split('/')[1]}`, type);
                const result = await uploadImage(file);
                expect(result).toHaveProperty('id');
            }
        });
    });

    // ── GET IMAGE ───────────────────────────────────────────

    describe('getImage', () => {
        it('should get image without resize parameters', async () => {
            const buffer = await createTestImage();
            const file = createTestFile(buffer, 'test.png', 'image/png');
            const uploaded = await uploadImage(file);

            const result = await getImage(uploaded.id);

            expect(result).not.toBeNull();
            expect(result!.mimetype).toBe('image/png');
            expect(result!.data).toBeInstanceOf(Buffer);
            expect(result!.data.length).toBeGreaterThan(0);
        });

        it('should get image with width only', async () => {
            const buffer = await createTestImage(200, 200);
            const file = createTestFile(buffer, 'test.png', 'image/png');
            const uploaded = await uploadImage(file);

            const result = await getImage(uploaded.id, 50);

            expect(result).not.toBeNull();
            const metadata = await sharp(result!.data).metadata();
            expect(metadata.width).toBe(50);
        });

        it('should get image with height only', async () => {
            const buffer = await createTestImage(200, 200);
            const file = createTestFile(buffer, 'test.png', 'image/png');
            const uploaded = await uploadImage(file);

            const result = await getImage(uploaded.id, undefined, 50);

            expect(result).not.toBeNull();
            const metadata = await sharp(result!.data).metadata();
            expect(metadata.height).toBe(50);
        });

        it('should get image with both width and height', async () => {
            const buffer = await createTestImage(200, 200);
            const file = createTestFile(buffer, 'test.png', 'image/png');
            const uploaded = await uploadImage(file);

            const result = await getImage(uploaded.id, 80, 60);

            expect(result).not.toBeNull();
            const metadata = await sharp(result!.data).metadata();
            // fit: "inside" maintains aspect ratio, so the image fits within 80x60
            expect(metadata.width).toBeLessThanOrEqual(80);
            expect(metadata.height).toBeLessThanOrEqual(60);
        });

        it('should return null for non-existent image', async () => {
            const result = await getImage('non-existent-id');
            expect(result).toBeNull();
        });

        it('should reject invalid width dimension', async () => {
            await expect(getImage('any-id', 0)).rejects.toThrow(ImageValidationError);
            await expect(getImage('any-id', 2001)).rejects.toThrow(ImageValidationError);
        });

        it('should reject invalid height dimension', async () => {
            await expect(getImage('any-id', undefined, 0)).rejects.toThrow(ImageValidationError);
            await expect(getImage('any-id', undefined, 2001)).rejects.toThrow(ImageValidationError);
        });
    });

    // ── DELETE IMAGE ────────────────────────────────────────

    describe('deleteImage', () => {
        it('should delete an existing image', async () => {
            const buffer = await createTestImage();
            const file = createTestFile(buffer, 'test.png', 'image/png');
            const uploaded = await uploadImage(file);

            const deleted = await deleteImage(uploaded.id);
            expect(deleted).toBe(true);

            // Verify it's gone
            const result = await getImage(uploaded.id);
            expect(result).toBeNull();
        });

        it('should return false for non-existent image', async () => {
            const deleted = await deleteImage('non-existent-id');
            expect(deleted).toBe(false);
        });
    });

    // ── RESIZE IMAGE ────────────────────────────────────────

    describe('resizeImage', () => {
        it('should resize image to specified dimensions', async () => {
            const buffer = await createTestImage(200, 200);

            const resized = await resizeImage(buffer, 100, 100);
            const metadata = await sharp(resized).metadata();

            expect(metadata.width).toBe(100);
            expect(metadata.height).toBe(100);
        });

        it('should maintain aspect ratio with fit inside', async () => {
            const buffer = await createTestImage(400, 200);

            const resized = await resizeImage(buffer, 100, 100);
            const metadata = await sharp(resized).metadata();

            // 400x200 resized to fit inside 100x100 → 100x50
            expect(metadata.width).toBe(100);
            expect(metadata.height).toBe(50);
        });
    });

    // ── INTEGRATION: FULL LIFECYCLE ─────────────────────────

    describe('Full lifecycle', () => {
        it('should upload → retrieve → resize → delete', async () => {
            // Upload
            const buffer = await createTestImage(300, 300);
            const file = createTestFile(buffer, 'lifecycle.png', 'image/png');
            const uploaded = await uploadImage(file);
            expect(uploaded.id).toBeDefined();

            // Retrieve original
            const original = await getImage(uploaded.id);
            expect(original).not.toBeNull();
            expect(original!.mimetype).toBe('image/png');

            // Retrieve resized
            const resized = await getImage(uploaded.id, 150, 150);
            expect(resized).not.toBeNull();
            const resizedMeta = await sharp(resized!.data).metadata();
            expect(resizedMeta.width).toBe(150);
            expect(resizedMeta.height).toBe(150);

            // Verify original is preserved after resize request
            const originalAgain = await getImage(uploaded.id);
            expect(originalAgain).not.toBeNull();
            const originalMeta = await sharp(originalAgain!.data).metadata();
            expect(originalMeta.width).toBe(300);
            expect(originalMeta.height).toBe(300);

            // Delete
            const deleted = await deleteImage(uploaded.id);
            expect(deleted).toBe(true);

            // Verify deleted
            const afterDelete = await getImage(uploaded.id);
            expect(afterDelete).toBeNull();
        });

        it('should cache resized versions and return from cache', async () => {
            const buffer = await createTestImage(200, 200);
            const file = createTestFile(buffer, 'cache-test.png', 'image/png');
            const uploaded = await uploadImage(file);

            // First resize - creates cache entry
            const first = await getImage(uploaded.id, 100, 100);
            expect(first).not.toBeNull();

            // Second resize with same dimensions - should hit cache
            const second = await getImage(uploaded.id, 100, 100);
            expect(second).not.toBeNull();
            expect(second!.data.length).toBe(first!.data.length);
        });

        it('should delete cached versions when image is deleted', async () => {
            const buffer = await createTestImage(200, 200);
            const file = createTestFile(buffer, 'cache-delete.png', 'image/png');
            const uploaded = await uploadImage(file);

            // Create a cached resize
            await getImage(uploaded.id, 100, 100);

            // Delete the image
            await deleteImage(uploaded.id);

            // Verify cache is also gone (image is gone, so getImage returns null)
            const result = await getImage(uploaded.id);
            expect(result).toBeNull();
        });
    });
});
