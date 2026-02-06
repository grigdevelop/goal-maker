'use client';

import React, { useRef, useState } from 'react';
import { CreateOrUpdateTaskForm } from './CreateOrUpdateTaskForm';
import { useTaskMutations } from '@/hooks/api/use-task-mutations';

type Task = {
    title: string;
    description: string | null;
};


export const CreateTaskBtn: React.FC = () => {
    const dialogRef = useRef<HTMLDialogElement>(null);
    const [isOpen, setIsOpen] = useState(false);
    const { createMutation } = useTaskMutations();

    const handleClick = () => {
        setIsOpen(true);
        dialogRef.current?.showModal();
    };

    const handleClose = () => {
        dialogRef.current?.close();
        setIsOpen(false);
    };

    const handleBackdropClick = (e: React.MouseEvent<HTMLDialogElement>) => {
        const dialog = dialogRef.current;
        if (dialog && e.target === dialog) {
            handleClose();
        }
    };

    const handleSubmit = (task: Task) => {
        createMutation.mutate(
            { title: task.title, description: task.description },
            {
                onSuccess: () => {
                    handleClose();
                }
            }
        );
    };

    return (
        <>
            <button onClick={handleClick} className="btn btn-sm" disabled={createMutation.isPending}>
                {createMutation.isPending && <span className="loading loading-spinner loading-sm"></span>}
                Create Task
            </button>
            <dialog ref={dialogRef} className="modal" onClick={handleBackdropClick}>
                <div className="modal-box">
                    {isOpen && (
                        <CreateOrUpdateTaskForm onClose={handleClose} onSubmit={handleSubmit} />
                    )}
                </div>
            </dialog>
        </>
    );
};
