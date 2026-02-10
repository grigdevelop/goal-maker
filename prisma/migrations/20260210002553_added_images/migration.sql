-- CreateTable
CREATE TABLE "image" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "filename" TEXT NOT NULL,
    "mimetype" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "data" BLOB NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "image_cache" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "imageId" TEXT NOT NULL,
    "width" INTEGER NOT NULL,
    "height" INTEGER NOT NULL,
    "mimetype" TEXT NOT NULL,
    "data" BLOB NOT NULL,
    CONSTRAINT "image_cache_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "image" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "image_cache_imageId_idx" ON "image_cache"("imageId");

-- CreateIndex
CREATE UNIQUE INDEX "image_cache_imageId_width_height_key" ON "image_cache"("imageId", "width", "height");
