import prisma from "@/lib/prisma";
import sharp from "sharp";

const ALLOWED_MIMETYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const MIN_DIMENSION = 1;
const MAX_DIMENSION = 2000;

export class ImageValidationError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "ImageValidationError";
    }
}

function validateMimetype(mimetype: string): void {
    if (!ALLOWED_MIMETYPES.includes(mimetype)) {
        throw new ImageValidationError(
            `Invalid mimetype '${mimetype}'. Allowed: ${ALLOWED_MIMETYPES.join(", ")}`
        );
    }
}

function validateFileSize(size: number): void {
    if (size > MAX_FILE_SIZE) {
        throw new ImageValidationError(
            `File size ${size} exceeds maximum of ${MAX_FILE_SIZE} bytes (5MB)`
        );
    }
}

function validateDimensions(width?: number, height?: number): void {
    if (width !== undefined && (width < MIN_DIMENSION || width > MAX_DIMENSION)) {
        throw new ImageValidationError(
            `Width must be between ${MIN_DIMENSION} and ${MAX_DIMENSION} pixels`
        );
    }
    if (height !== undefined && (height < MIN_DIMENSION || height > MAX_DIMENSION)) {
        throw new ImageValidationError(
            `Height must be between ${MIN_DIMENSION} and ${MAX_DIMENSION} pixels`
        );
    }
}

export async function uploadImage(file: File) {
    validateMimetype(file.type);
    validateFileSize(file.size);

    const arrayBuffer = await file.arrayBuffer();
    const data = Buffer.from(arrayBuffer);

    const image = await prisma.image.create({
        data: {
            filename: file.name,
            mimetype: file.type,
            size: file.size,
            data: new Uint8Array(data),
        },
    });

    return {
        id: image.id,
        filename: image.filename,
        url: `/api/images/${image.id}/${encodeURIComponent(image.filename)}`,
    };
}

export async function getImage(id: string, width?: number, height?: number) {
    validateDimensions(width, height);

    const image = await prisma.image.findUnique({
        where: { id },
    });

    if (!image) {
        return null;
    }

    if (width === undefined && height === undefined) {
        return { data: Buffer.from(image.data), mimetype: image.mimetype };
    }

    const cached = await prisma.imageCache.findUnique({
        where: {
            imageId_width_height: {
                imageId: id,
                width: width ?? 0,
                height: height ?? 0,
            },
        },
    });

    if (cached) {
        return { data: Buffer.from(cached.data), mimetype: cached.mimetype };
    }

    const resizedData = await resizeImage(Buffer.from(image.data), width, height);

    await prisma.imageCache.create({
        data: {
            imageId: id,
            width: width ?? 0,
            height: height ?? 0,
            mimetype: image.mimetype,
            data: new Uint8Array(resizedData),
        },
    });

    return { data: resizedData, mimetype: image.mimetype };
}

export async function deleteImage(id: string): Promise<boolean> {
    const image = await prisma.image.findUnique({
        where: { id },
    });

    if (!image) {
        return false;
    }

    await prisma.image.delete({
        where: { id },
    });

    return true;
}

export async function resizeImage(data: Buffer, width?: number, height?: number): Promise<Buffer> {
    const result = await sharp(data)
        .resize({
            width: width ?? undefined,
            height: height ?? undefined,
            fit: "inside",
            withoutEnlargement: true,
        })
        .toBuffer();

    return result;
}
