'use client';

import React, { useRef, useState } from 'react';
import { CreateOrUpdateSkillForm } from './CreateOrUpdateSkillForm';
import { useSkillMutations } from '@/hooks/api/use-skill-mutations';

type Skill = {
    title: string;
    description: string | null;
};


export const CreateSkillBtn: React.FC = () => {
    const dialogRef = useRef<HTMLDialogElement>(null);
    const [isOpen, setIsOpen] = useState(false);
    const { createMutation } = useSkillMutations();

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

    const handleSubmit = (skill: Skill) => {
        createMutation.mutate(
            { title: skill.title, description: skill.description },
            {
                onSuccess: () => {
                    handleClose();
                }
            }
        );
    };

    return (
        <>
            <button onClick={handleClick} className="btn btn-sm">
                Create Skill
            </button>
            <dialog ref={dialogRef} className="modal" onClick={handleBackdropClick}>
                <div className="modal-box">
                    {isOpen && (
                        <CreateOrUpdateSkillForm onClose={handleClose} onSubmit={handleSubmit} />
                    )}
                </div>
            </dialog>
        </>
    );
};
