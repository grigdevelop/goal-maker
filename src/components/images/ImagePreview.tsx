'use client';

import { useState } from 'react';
import { Trash2, ImageOff } from 'lucide-react';

type Props = {
    src: string;
    alt?: string;
    onDelete?: () => void;
    isDeleting?: boolean;
    className?: string;
};

export function ImagePreview({
    src,
    alt = 'Image',
    onDelete,
    isDeleting = false,
    className = '',
}: Props) {
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);

    return (
        <div className={`relative group ${className}`}>
            {isLoading && !hasError && (
                <div className="skeleton w-full h-full absolute inset-0 rounded-box" />
            )}

            {hasError ? (
                <div className="flex flex-col items-center justify-center w-full h-full bg-base-200 rounded-box p-4">
                    <ImageOff className="h-8 w-8 opacity-40" />
                    <span className="text-xs opacity-40 mt-1">Failed to load</span>
                </div>
            ) : (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                    src={src}
                    alt={alt}
                    onLoad={() => setIsLoading(false)}
                    onError={() => {
                        setIsLoading(false);
                        setHasError(true);
                    }}
                    className={`w-full h-full object-cover rounded-box ${isLoading ? 'invisible' : ''}`}
                />
            )}

            {onDelete && !hasError && (
                <button
                    type="button"
                    onClick={onDelete}
                    disabled={isDeleting}
                    className="btn btn-circle btn-xs btn-error absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                    {isDeleting ? (
                        <span className="loading loading-spinner loading-xs"></span>
                    ) : (
                        <Trash2 className="h-3 w-3" />
                    )}
                </button>
            )}
        </div>
    );
}
