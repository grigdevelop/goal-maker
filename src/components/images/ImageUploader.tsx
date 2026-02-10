'use client';

import { useState, useRef, useCallback, type DragEvent, type ChangeEvent } from 'react';
import { Upload, X, AlertCircle } from 'lucide-react';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

type Props = {
    onUpload: (file: File) => void;
    isUploading?: boolean;
    accept?: string;
    maxSize?: number;
    className?: string;
};

export function ImageUploader({
    onUpload,
    isUploading = false,
    accept = ALLOWED_TYPES.join(','),
    maxSize = MAX_SIZE,
    className = '',
}: Props) {
    const [preview, setPreview] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const validate = useCallback((file: File): string | null => {
        if (!ALLOWED_TYPES.includes(file.type)) {
            return `Invalid file type. Allowed: JPEG, PNG, GIF, WebP`;
        }
        if (file.size > maxSize) {
            return `File too large. Maximum size: ${Math.round(maxSize / 1024 / 1024)}MB`;
        }
        return null;
    }, [maxSize]);

    const handleFile = useCallback((file: File) => {
        setError(null);

        const validationError = validate(file);
        if (validationError) {
            setError(validationError);
            return;
        }

        setSelectedFile(file);
        const url = URL.createObjectURL(file);
        setPreview(url);
    }, [validate]);

    const handleDragOver = useCallback((e: DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback((e: DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) handleFile(file);
    }, [handleFile]);

    const handleInputChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) handleFile(file);
    }, [handleFile]);

    const handleUpload = useCallback(() => {
        if (selectedFile) {
            onUpload(selectedFile);
        }
    }, [selectedFile, onUpload]);

    const handleClear = useCallback(() => {
        setPreview(null);
        setSelectedFile(null);
        setError(null);
        if (inputRef.current) inputRef.current.value = '';
    }, []);

    return (
        <div className={`flex flex-col gap-3 ${className}`}>
            {!preview ? (
                <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => inputRef.current?.click()}
                    className={`
                        border-2 border-dashed rounded-box p-8 text-center cursor-pointer
                        transition-colors duration-200
                        ${isDragging
                            ? 'border-primary bg-primary/10'
                            : 'border-base-content/20 hover:border-primary/50'
                        }
                    `}
                >
                    <Upload className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm font-medium">Drop an image here or click to browse</p>
                    <p className="text-xs opacity-50 mt-1">JPEG, PNG, GIF, WebP — max 5MB</p>
                </div>
            ) : (
                <div className="relative group">
                    <img
                        src={preview}
                        alt="Preview"
                        className="w-full max-h-64 object-contain rounded-box bg-base-200"
                    />
                    <button
                        type="button"
                        onClick={handleClear}
                        className="btn btn-circle btn-xs btn-error absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                        disabled={isUploading}
                    >
                        <X className="h-3 w-3" />
                    </button>
                </div>
            )}

            <input
                ref={inputRef}
                type="file"
                accept={accept}
                onChange={handleInputChange}
                className="hidden"
            />

            {error && (
                <div className="alert alert-error alert-sm">
                    <AlertCircle className="h-4 w-4" />
                    <span className="text-sm">{error}</span>
                </div>
            )}

            {selectedFile && !error && (
                <button
                    type="button"
                    onClick={handleUpload}
                    disabled={isUploading}
                    className="btn btn-primary btn-sm"
                >
                    {isUploading ? (
                        <>
                            <span className="loading loading-spinner loading-xs"></span>
                            Uploading…
                        </>
                    ) : (
                        'Upload'
                    )}
                </button>
            )}
        </div>
    );
}
