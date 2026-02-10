# Image Upload Feature

## Overview
Implement a complete image management system with upload, retrieval (with dynamic resizing), and deletion capabilities.

## API Endpoints

### 1. Upload Image
- **POST** `/api/images`
- **Request**: Multipart form data with image file
- **Response**: `{ id: string, filename: string, url: string }`
- Store image binary data in database with metadata (filename, mimetype, size, created_at)

### 2. Get Image (with optional resizing)
- **GET** `/api/images/:id/:filename?width=:width&height=:height`
- **Query Parameters**:
  - `width` (optional): Target width in pixels
  - `height` (optional): Target height in pixels
- **Response**: Image binary with appropriate Content-Type header
- If width/height provided, resize image on-the-fly maintaining aspect ratio
- Cache resized versions for performance

### 3. Delete Image
- **DELETE** `/api/images/:id`
- **Response**: `{ success: boolean }`
- Remove image and all cached resized versions from database

## Database Schema
```typescript
interface Image {
  id: string;
  filename: string;
  mimetype: string;
  size: number;
  data: Buffer;
  createdAt: Date;
  updatedAt: Date;
}
```

## Implementation Requirements

### Service Functions
```typescript
uploadImage(file: File): Promise<Image>
getImage(id: string, width?: number, height?: number): Promise<{ data: Buffer, mimetype: string }>
deleteImage(id: string): Promise<boolean>
resizeImage(data: Buffer, width: number, height: number): Promise<Buffer>
```

### Validation
- Allowed mimetypes: `image/jpeg`, `image/png`, `image/gif`, `image/webp`
- Maximum file size: 5MB
- Valid width/height range: 1-2000 pixels

## Testing Requirements

### Unit Tests
- Upload with valid image file
- Upload with invalid mimetype (should reject)
- Upload with file exceeding size limit (should reject)
- Get image without resize parameters
- Get image with width only
- Get image with height only
- Get image with both width and height
- Get non-existent image (should return 404)
- Delete existing image
- Delete non-existent image (should return 404)

### Integration Tests
- Full upload → retrieve → delete lifecycle
- Verify resized image dimensions match requested size
- Verify original image preserved after resize request