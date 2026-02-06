'use client';

import React, { useRef, useState } from 'react';
import { CreateOrUpdateGoalForm } from './CreateOrUpdateGoalForm';
import { useGoalMutations } from '@/hooks/api/use-goal-mutations';
import { useToast } from '@/components/ui/toast';

type Goal = {
    title: string;
    description: string | null;
};


export const CreateGoalBtn: React.FC = () => {
    const dialogRef = useRef<HTMLDialogElement>(null);
    const [isOpen, setIsOpen] = useState(false);
    const { createMutation } = useGoalMutations();
    const { success, error } = useToast();

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

    const handleSubmit = (goal: Goal) => {
        createMutation.mutate(
            { title: goal.title, description: goal.description },
            {
                onSuccess: () => {
                    handleClose();
                    success('Goal created successfully');
                },
                onError: () => {
                    error('Failed to create goal');
                },
            }
        );
    };

    return (
        <>
            <button onClick={handleClick} className="btn btn-sm" disabled={createMutation.isPending}>
                {createMutation.isPending && <span className="loading loading-spinner loading-sm"></span>}
                Create Goal
            </button>
            <dialog ref={dialogRef} className="modal" onClick={handleBackdropClick}>
                <div className="modal-box">
                    {isOpen && (
                        <CreateOrUpdateGoalForm onClose={handleClose} onSubmit={handleSubmit} />
                    )}
                </div>
            </dialog>
        </>
    );
};
