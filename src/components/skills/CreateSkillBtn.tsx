'use client';

import React from 'react';
import { CreateOrUpdateSkillForm } from './CreateOrUpdateSkillForm';
import { useSkillMutations } from '@/hooks/api/use-skill-mutations';
import { useToast } from '@/components/ui/toast';
import { useDialog } from '@/components/shared/dialog';

type Skill = {
    title: string;
    description: string | null;
};

export const CreateSkillBtn: React.FC = () => {
    const { openDialog, closeDialog } = useDialog();
    const { createMutation } = useSkillMutations();
    const { success, error } = useToast();

    const handleSubmit = (skill: Skill) => {
        createMutation.mutate(
            { title: skill.title, description: skill.description },
            {
                onSuccess: () => {
                    closeDialog();
                    success('Skill created successfully');
                },
                onError: () => {
                    error('Failed to create skill');
                },
            }
        );
    };

    const handleClick = () => {
        openDialog(
            <CreateOrUpdateSkillForm onClose={closeDialog} onSubmit={handleSubmit} />
        );
    };

    return (
        <button onClick={handleClick} className="btn btn-sm" disabled={createMutation.isPending}>
            {createMutation.isPending && <span className="loading loading-spinner loading-sm"></span>}
            Create Skill
        </button>
    );
};
