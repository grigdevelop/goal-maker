'use client';

import { useRef, useCallback } from 'react';
import { Camera, Trash2 } from 'lucide-react';
import { ImageUploader } from '@/components/images';
import { useProfileImageMutations } from '@/hooks/api/use-user-profile';
import { useToast } from '@/components/ui/toast';

type Props = {
    currentImage: string | null | undefined;
    userName: string;
};

function getInitials(name: string): string {
    return name
        .split(' ')
        .map((part) => part[0])
        .filter(Boolean)
        .slice(0, 2)
        .join('')
        .toUpperCase();
}

export function ProfileImageUploader({ currentImage, userName }: Props) {
    const { uploadMutation, deleteMutation } = useProfileImageMutations();
    const toast = useToast();
    const modalRef = useRef<HTMLDialogElement>(null);

    const handleUpload = useCallback((file: File) => {
        uploadMutation.mutate(file, {
            onSuccess: () => {
                toast.success('Profile image updated');
                modalRef.current?.close();
            },
            onError: (err) => {
                toast.error(err.message || 'Failed to upload image');
            },
        });
    }, [uploadMutation, toast]);

    const handleRemove = useCallback(() => {
        deleteMutation.mutate(undefined, {
            onSuccess: () => {
                toast.success('Profile image removed');
            },
            onError: (err) => {
                toast.error(err.message || 'Failed to remove image');
            },
        });
    }, [deleteMutation, toast]);

    const initials = getInitials(userName || '?');

    return (
        <div className="flex flex-col items-center gap-3">
            {/* Avatar display */}
            <div className="avatar">
                <div className="w-28 h-28 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2 overflow-hidden">
                    {currentImage ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                            src={currentImage}
                            alt={userName}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full bg-primary text-primary-content flex items-center justify-center text-3xl font-bold">
                            {initials}
                        </div>
                    )}
                </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-2">
                <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={() => modalRef.current?.showModal()}
                >
                    <Camera className="h-4 w-4" />
                    Change Photo
                </button>

                {currentImage && (
                    <button
                        type="button"
                        className="btn btn-error btn-outline btn-sm"
                        onClick={handleRemove}
                        disabled={deleteMutation.isPending}
                    >
                        {deleteMutation.isPending ? (
                            <span className="loading loading-spinner loading-xs"></span>
                        ) : (
                            <Trash2 className="h-4 w-4" />
                        )}
                        Remove
                    </button>
                )}
            </div>

            {/* Upload modal */}
            <dialog ref={modalRef} className="modal">
                <div className="modal-box">
                    <h3 className="font-bold text-lg mb-4">Upload Profile Photo</h3>
                    <ImageUploader
                        onUpload={handleUpload}
                        isUploading={uploadMutation.isPending}
                    />
                    <div className="modal-action">
                        <form method="dialog">
                            <button className="btn btn-ghost btn-sm" disabled={uploadMutation.isPending}>
                                Cancel
                            </button>
                        </form>
                    </div>
                </div>
                <form method="dialog" className="modal-backdrop">
                    <button>close</button>
                </form>
            </dialog>
        </div>
    );
}
