'use client';

import React, { useRef, useEffect } from 'react';

type Props = {
    open: boolean;
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    loading?: boolean;
    onConfirm: () => void;
    onCancel: () => void;
};

export function ConfirmDialog({
    open,
    title,
    message,
    confirmLabel = 'Delete',
    cancelLabel = 'Cancel',
    loading = false,
    onConfirm,
    onCancel,
}: Props) {
    const dialogRef = useRef<HTMLDialogElement>(null);

    useEffect(() => {
        if (open) {
            dialogRef.current?.showModal();
        } else {
            dialogRef.current?.close();
        }
    }, [open]);

    const handleBackdropClick = (e: React.MouseEvent<HTMLDialogElement>) => {
        if (e.target === dialogRef.current && !loading) {
            onCancel();
        }
    };

    return (
        <dialog ref={dialogRef} className="modal" onClick={handleBackdropClick}>
            <div className="modal-box">
                <h3 className="font-bold text-lg">{title}</h3>
                <p className="py-4">{message}</p>
                <div className="modal-action">
                    <button
                        className="btn btn-sm btn-ghost"
                        onClick={onCancel}
                        disabled={loading}
                    >
                        {cancelLabel}
                    </button>
                    <button
                        className="btn btn-sm btn-error"
                        onClick={onConfirm}
                        disabled={loading}
                    >
                        {loading && <span className="loading loading-spinner loading-sm"></span>}
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </dialog>
    );
}
